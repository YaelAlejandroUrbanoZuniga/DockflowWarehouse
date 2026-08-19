import type { Cita, EstadoKey, Transportista } from './types';
import { ESTADOS, FLOW_ORDER } from './constants';

export function getNextEstado(estadoKey: EstadoKey): EstadoKey | null {
  const idx = FLOW_ORDER.indexOf(estadoKey);
  if (idx === -1 || idx === FLOW_ORDER.length - 1) return null;
  return FLOW_ORDER[idx + 1];
}

export function canTransitionTo(
  estadoKey: EstadoKey,
  target: EstadoKey,
): boolean {
  const next = getNextEstado(estadoKey);
  if (next === null) return false;
  return next === target;
}

export function isTerminalState(estadoKey: EstadoKey): boolean {
  return estadoKey === 5 || estadoKey === 6;
}

export function getActiveCitas(citas: Cita[]): Cita[] {
  return citas.filter(
    (c) => c.estadoKey !== 5 && c.estadoKey !== 6 && c.estadoKey !== 3,
  );
}

export function getCitasForDate(citas: Cita[], dateStr: string): Cita[] {
  return citas.filter((c) => c.fechaprogramada === dateStr);
}

export function getCitasForDock(citas: Cita[], dockId: string): Cita[] {
  return citas.filter((c) => c.dock.id === dockId);
}

export function getMinutesBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
}

export function getMinutesSince(start?: string): number {
  if (!start) return 0;
  return Math.round((Date.now() - new Date(start).getTime()) / 60000);
}

export function formatDuration(mins: number): string {
  if (mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}min`;
}

export function getDetentionInfo(
  cita: Cita,
  transportista?: Transportista,
): {
  totalMinutes: number;
  freeMinutes: number;
  billableMinutes: number;
  charge: number;
} {
  const start = cita.actualstarttime;
  const end = cita.actualendtime || new Date().toISOString();
  if (!start) {
    return { totalMinutes: 0, freeMinutes: 0, billableMinutes: 0, charge: 0 };
  }
  const totalMinutes = getMinutesBetween(start, end);
  const freeHours = transportista?.horasLibres ?? 2;
  const freeMinutes = freeHours * 60;
  const billableMinutes = Math.max(0, totalMinutes - freeMinutes);
  const tarifa = transportista?.tarifadetencion ?? 500;
  const charge = (billableMinutes / 60) * tarifa;
  return { totalMinutes, freeMinutes, billableMinutes, charge };
}

export function getStageTimes(cita: Cita): { estado: string; minutos: number }[] {
  const sorted = [...cita.historial].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const stages: { estado: string; minutos: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = new Date(sorted[i].timestamp).getTime();
    const end =
      i + 1 < sorted.length
        ? new Date(sorted[i + 1].timestamp).getTime()
        : cita.actualendtime
          ? new Date(cita.actualendtime).getTime()
          : Date.now();
    stages.push({
      estado: sorted[i].estadoNombre,
      minutos: Math.max(0, Math.round((end - start) / 60000)),
    });
  }
  return stages;
}

export function getTotalTime(cita: Cita): number {
  const start = cita.actualstarttime;
  const end = cita.actualendtime;
  if (!start) return 0;
  return getMinutesBetween(start, end || new Date().toISOString());
}

export function getSemaphoreColor(
  minutes: number,
  thresholdYellow = 15,
  thresholdRed = 30,
): 'green' | 'yellow' | 'red' {
  if (minutes >= thresholdRed) return 'red';
  if (minutes >= thresholdYellow) return 'yellow';
  return 'green';
}

export function getEstadoConfig(estadoKey: EstadoKey) {
  return ESTADOS[estadoKey];
}

export function isDelayed(cita: Cita): boolean {
  if (cita.estadoKey !== 7) return false;
  if (cita.autorizacionTimestamp) {
    return getMinutesSince(cita.autorizacionTimestamp) > 30;
  }
  return false;
}

export type SemaphoreLevel = 'green' | 'yellow' | 'red';

export interface SemaphoreInfo {
  level: SemaphoreLevel;
  label: string;
  minutes: number;
}

export interface SemaphoreColorSet {
  border: string;
  bg: string;
  text: string;
  dot: string;
  solidBg: string;
}

export const LLEGADA_COLORS: Record<SemaphoreLevel, SemaphoreColorSet> = {
  green: { border: '#6ABF4B', bg: 'rgba(106,191,75,0.08)', text: '#6ABF4B', dot: '#6ABF4B', solidBg: '#6ABF4B' },
  yellow: { border: '#D4A017', bg: 'rgba(212,160,23,0.08)', text: '#D4A017', dot: '#D4A017', solidBg: '#D4A017' },
  red: { border: '#DC0202', bg: 'rgba(220,2,2,0.08)', text: '#DC0202', dot: '#DC0202', solidBg: '#DC0202' },
};

export const ALMACEN_COLORS: Record<SemaphoreLevel, SemaphoreColorSet> = {
  green: { border: '#02B3E1', bg: 'rgba(2,179,225,0.08)', text: '#02B3E1', dot: '#02B3E1', solidBg: '#02B3E1' },
  yellow: { border: '#E3650B', bg: 'rgba(227,101,11,0.08)', text: '#E3650B', dot: '#E3650B', solidBg: '#E3650B' },
  red: { border: '#E3650B', bg: 'rgba(227,101,11,0.08)', text: '#E3650B', dot: '#E3650B', solidBg: '#E3650B' },
};

export const LLEGADA_LABELS: Record<SemaphoreLevel, string> = {
  green: 'A tiempo',
  yellow: 'Con demora',
  red: 'Muy tarde',
};

function combineDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

export function getLlegadaSemaphore(cita: Cita): SemaphoreInfo {
  const windowStart = combineDateTime(cita.fechaprogramada, cita.inicioventana);
  const diffMin = Math.round((Date.now() - windowStart.getTime()) / 60000);
  if (diffMin <= 9) return { level: 'green', label: 'A tiempo', minutes: diffMin };
  if (diffMin <= 59) return { level: 'yellow', label: 'Retraso moderado', minutes: diffMin };
  return { level: 'red', label: 'Retraso crítico', minutes: diffMin };
}

export function getAlmacenSemaphore(cita: Cita): SemaphoreInfo {
  if (!cita.actualstarttime) return { level: 'green', label: 'En tiempo', minutes: 0 };
  const start = new Date(cita.actualstarttime).getTime();
  const end = cita.actualendtime ? new Date(cita.actualendtime).getTime() : Date.now();
  const diffMin = Math.round((end - start) / 60000);
  if (diffMin <= 30) return { level: 'green', label: 'En tiempo', minutes: diffMin };
  if (diffMin <= 60) return { level: 'yellow', label: 'Demorado', minutes: diffMin };
  return { level: 'red', label: 'Crítico', minutes: diffMin };
}

export function getLlegadaLabel(cita: Cita): { label: string; level: SemaphoreLevel } | null {
  if (!cita.actualstarttime) return null;
  const windowStart = combineDateTime(cita.fechaprogramada, cita.inicioventana);
  const arrival = new Date(cita.actualstarttime).getTime();
  const diffMin = Math.round((arrival - windowStart.getTime()) / 60000);
  if (diffMin <= 9) return { label: 'A tiempo', level: 'green' };
  if (diffMin <= 59) return { label: 'Con demora', level: 'yellow' };
  return { label: 'Muy tarde', level: 'red' };
}

export function getSemaphorePriority(cita: Cita): number {
  if (cita.estadoKey === 0) {
    const s = getLlegadaSemaphore(cita);
    return s.level === 'red' ? 0 : s.level === 'yellow' ? 1 : 2;
  }
  if ([1, 7, 8, 2].includes(cita.estadoKey)) {
    const s = getAlmacenSemaphore(cita);
    return s.level === 'red' ? 0 : s.level === 'yellow' ? 1 : 2;
  }
  return 3;
}

export function getPunctualityRate(citas: Cita[], transportistaId: string): number {
  const tCitas = citas.filter((c) => c.transportista.id === transportistaId);
  if (tCitas.length === 0) return 100;
  const onTime = tCitas.filter((c) => !c.islate).length;
  return Math.round((onTime / tCitas.length) * 100);
}

export function getCancellationRate(citas: Cita[], transportistaId: string): number {
  const tCitas = citas.filter((c) => c.transportista.id === transportistaId);
  if (tCitas.length === 0) return 0;
  const cancelled = tCitas.filter((c) => c.estadoKey === 5).length;
  return Math.round((cancelled / tCitas.length) * 100);
}
