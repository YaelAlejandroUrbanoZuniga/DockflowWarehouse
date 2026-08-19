import { useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  citasAtom,
  docksAtom,
  transportistasAtom,
  usersAtom,
  almacenesAtom,
} from '@/lib/store';
import {
  SEED_DOCKS,
  SEED_TRANSPORTISTAS,
  SEED_USERS,
  SEED_ALMACENES,
  ALMACEN_PLANTA69_ID,
  buildSeedCitas,
} from '@/lib/seed';

export function useSeedData() {
  const [citas, setCitas] = useAtom(citasAtom);
  const [docks, setDocks] = useAtom(docksAtom);
  const [transportistas, setTransportistas] = useAtom(transportistasAtom);
  const [users, setUsers] = useAtom(usersAtom);
  const [almacenes, setAlmacenes] = useAtom(almacenesAtom);

  useEffect(() => {
    if (almacenes.length === 0) setAlmacenes(SEED_ALMACENES);
    if (users.length === 0) setUsers(SEED_USERS);
    if (docks.length === 0) setDocks(SEED_DOCKS);
    if (transportistas.length === 0) setTransportistas(SEED_TRANSPORTISTAS);
    if (citas.length === 0) setCitas(buildSeedCitas());

    // Migration: backfill almacenId on existing data that predates multi-almacén
    let docksChanged = false;
    const migratedDocks = docks.map((d) => {
      if (!d.almacenId) {
        docksChanged = true;
        return { ...d, almacenId: ALMACEN_PLANTA69_ID };
      }
      return d;
    });
    if (docksChanged) setDocks(migratedDocks);

    let citasChanged = false;
    const migratedCitas = citas.map((c) => {
      if (!c.almacenId) {
        citasChanged = true;
        return { ...c, almacenId: ALMACEN_PLANTA69_ID };
      }
      return c;
    });
    if (citasChanged) setCitas(migratedCitas);

    let usersChanged = false;
    const migratedUsers = users.map((u) => {
      if (u.almacenId === undefined) {
        usersChanged = true;
        const needsAlmacen = u.role === 'vigilancia' || u.role === 'warehouse';
        return { ...u, almacenId: needsAlmacen ? ALMACEN_PLANTA69_ID : null };
      }
      return u;
    });
    if (usersChanged) setUsers(migratedUsers);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { citas, docks, transportistas, users, almacenes };
}
