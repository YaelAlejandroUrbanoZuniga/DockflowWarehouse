import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { useToast } from '@/kit/componentes/Toast/Toast';
import { citasAtom, citasActivasAtom, celebrationAtom, delayAlertAtom } from '@/lib/store';
import type { Cita, EstadoKey } from '@/lib/types';
import { ESTADOS } from '@/lib/constants';
import { isDelayed } from '@/lib/cita-utils';

export function useCitaActions() {
  const toast = useToast();
  const [, setCitas] = useAtom(citasAtom);
  const activeCitas = useAtomValue(citasActivasAtom);
  const [, setCelebration] = useAtom(celebrationAtom);
  const [, setDelayAlert] = useAtom(delayAlertAtom);
  const firedAlertsRef = useRef<Set<string>>(new Set());

  const updateCitaEstado = (
    citaId: string,
    nuevoEstado: EstadoKey,
    usuarioNombre: string,
    extraData?: Partial<Cita>,
  ) => {
    let shouldCelebrate = false;
    let celebrateData: { poNumber: string; minutes: number } | null = null;

    setCitas((prev) =>
      prev.map((c) => {
        if (c.id !== citaId) return c;
        const now = new Date().toISOString();
        const updated: Cita = {
          ...c,
          estadoKey: nuevoEstado,
          historial: [
            ...c.historial,
            {
              estadoKey: nuevoEstado,
              estadoNombre: ESTADOS[nuevoEstado].nombre,
              timestamp: now,
              usuarioNombre,
            },
          ],
          ...extraData,
        };

        // Auto behaviors
        if (nuevoEstado === 1) {
          updated.actualstarttime = now;
          updated.autorizacionTimestamp = now;
          updated.estadoKey = 7;
          updated.historial.push({
            estadoKey: 7,
            estadoNombre: ESTADOS[7].nombre,
            timestamp: now,
            usuarioNombre: 'Sistema',
            nota: 'Auto-transición tras Llegada',
          });
        }
        if (nuevoEstado === 3) {
          updated.actualendtime = now;

          if (updated.actualstarttime) {
            const elapsedMin = Math.round(
              (new Date(now).getTime() - new Date(updated.actualstarttime).getTime()) / 60000,
            );
            if (elapsedMin <= 120) {
              shouldCelebrate = true;
              celebrateData = { poNumber: updated.nmeropo, minutes: elapsedMin };
            }
          }
        }
        if (nuevoEstado === 7 && !updated.autorizacionTimestamp) {
          updated.autorizacionTimestamp = now;
        }

        return updated;
      }),
    );

    if (shouldCelebrate && celebrateData) {
      setCelebration(celebrateData);
    }

    toast.success(`Estado cambiado a: ${ESTADOS[nuevoEstado].nombre}`);
  };

  const checkDelayAlerts = () => {
    let worst: { poNumber: string; minutes: number; dockName?: string } | null = null;
    activeCitas.forEach((c) => {
      if (isDelayed(c) && c.estadoKey === 7) {
        const mins = c.autorizacionDelay || 0;
        if (!firedAlertsRef.current.has(c.id)) {
          firedAlertsRef.current.add(c.id);
        }
        if (!worst || mins > worst.minutes) {
          worst = { poNumber: c.nmeropo, minutes: mins, dockName: c.dock.nombredock };
        }
      }
    });
    if (worst) {
      setDelayAlert(worst);
    }
  };

  return { updateCitaEstado, checkDelayAlerts };
}
