import { atom } from 'jotai';
import type { Almacen, Cita, Dock, Transportista, User } from './types';

// Synchronous localStorage-backed atoms.
// We avoid atomWithStorage because its async hydration causes race conditions
// where currentUser is null on first render and the auth guard kicks the user out.

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

type Updater<T> = T | ((prev: T) => T);

function makeAtom<T>(key: string, fallback: T) {
  const baseAtom = atom<T>(loadJSON(key, fallback));
  const derivedAtom = atom<T, [Updater<T>], void>(
    (get) => get(baseAtom),
    (get, set, update: Updater<T>) => {
      const next =
        typeof update === 'function' ? (update as (prev: T) => T)(get(baseAtom)) : update;
      set(baseAtom, next);
      saveJSON(key, next);
    },
  );
  return derivedAtom;
}

export const citasAtom = makeAtom<Cita[]>('yard-citas-v9', []);
export const docksAtom = makeAtom<Dock[]>('yard-docks-v9', []);
export const transportistasAtom = makeAtom<Transportista[]>('yard-transportistas-v8', []);
export const usersAtom = makeAtom<User[]>('yard-users-v2', []);
export const currentUserAtom = makeAtom<User | null>('yard-current-user-v2', null);
export const almacenesAtom = makeAtom<Almacen[]>('yard-almacenes-v1', []);
export const activeAlmacenIdAtom = atom<string | null>(null);

export const manualCheckInOpenAtom = atom<boolean>(false);
export const qrScannerOpenAtom = atom<boolean>(false);

export interface DelayAlertData {
  poNumber: string;
  minutes: number;
  dockName?: string;
}
export const delayAlertAtom = atom<DelayAlertData | null>(null);

export interface CelebrationData {
  poNumber: string;
  minutes: number;
}

export const celebrationAtom = atom<CelebrationData | null>(null);

// Derived atoms filtered by active almacén
export const docksActivosAtom = atom((get) => {
  const docks = get(docksAtom);
  const activeId = get(activeAlmacenIdAtom);
  if (!activeId) return [];
  return docks.filter((d) => d.almacenId === activeId);
});

export const citasActivasAtom = atom((get) => {
  const citas = get(citasAtom);
  const activeId = get(activeAlmacenIdAtom);
  if (!activeId) return [];
  return citas.filter((c) => c.almacenId === activeId);
});

export const usersActivosAtom = atom((get) => {
  const users = get(usersAtom);
  const activeId = get(activeAlmacenIdAtom);
  if (!activeId) return users.filter((u) => u.almacenId === null);
  return users.filter((u) => u.almacenId === activeId || u.almacenId === null);
});
