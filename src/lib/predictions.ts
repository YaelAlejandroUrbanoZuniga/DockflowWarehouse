import type { Cita } from './types';
import { TIME_SLOTS } from './constants';
import { getMinutesBetween, getTotalTime } from './cita-utils';

export interface SlotPrediction {
  slot: string;
  hour: number;
  avgWaitMin: number;
  congestion: number;
  confidence: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DayPrediction {
  slots: SlotPrediction[];
  peakHour: string;
  bestHour: string;
  avgDayWait: number;
  totalScheduled: number;
  insight: string;
}

function hourFromSlot(slot: string): number {
  return parseInt(slot.split(':')[0], 10);
}

function getConfidence(sample: number): 'low' | 'medium' | 'high' {
  if (sample >= 5) return 'high';
  if (sample >= 2) return 'medium';
  return 'low';
}

function getRiskLevel(avgWait: number, congestion: number): 'low' | 'medium' | 'high' {
  if (avgWait > 45 || congestion > 80) return 'high';
  if (avgWait > 20 || congestion > 50) return 'medium';
  return 'low';
}

function getRecommendation(avgWait: number, congestion: number, hour: number): string {
  if (congestion > 80) return 'Saturación crítica: reasignar a otros docks';
  if (avgWait > 45) return 'Riesgo de demoras severas, prever personal extra';
  if (avgWait > 25) return 'Demora probable, monitorear de cerca';
  if (congestion > 50) return 'Tráfico moderado, flujo controlado';
  if (hour >= 0 && hour <= 5) return 'Bajo volumen nocturno, operaciones ágiles';
  if (hour >= 11 && hour <= 13) return 'Pico de mediodía esperado';
  return 'Condiciones óptimas de operación';
}

export function generatePredictions(citas: Cita[]): DayPrediction {
  const completed = citas.filter((c) => c.actualstarttime);
  const scheduled = citas.filter((c) => c.estadoKey === 0);

  const slotMap = new Map<string, Cita[]>();
  for (const slot of TIME_SLOTS) {
    slotMap.set(slot, []);
  }

  for (const c of completed) {
    const start = new Date(c.actualstarttime!);
    const hour = start.getHours();
    const slotKey = `${String(hour).padStart(2, '0')}:00`;
    const arr = slotMap.get(slotKey);
    if (arr) arr.push(c);
  }

  for (const c of scheduled) {
    const hour = hourFromSlot(c.inicioventana);
    const slotKey = `${String(hour).padStart(2, '0')}:00`;
    const arr = slotMap.get(slotKey);
    if (arr) arr.push(c);
  }

  const globalAvg =
    completed.length > 0
      ? completed.reduce((s, c) => s + getTotalTime(c), 0) / completed.length
      : 0;

  const slots: SlotPrediction[] = TIME_SLOTS.filter((s) => s.endsWith(':00')).map((slot) => {
    const slotCitas = slotMap.get(slot) || [];
    const completedInSlot = slotCitas.filter((c) => c.actualendtime);
    const avgWaitMin =
      completedInSlot.length > 0
        ? completedInSlot.reduce(
            (s, c) => s + getMinutesBetween(c.actualstarttime, c.actualendtime),
            0,
          ) / completedInSlot.length
        : globalAvg * (0.7 + Math.random() * 0.6);

    const congestion = Math.min(100, slotCitas.length * 15 + (avgWaitMin > 30 ? 20 : 0));
    const confidence = getConfidence(slotCitas.length);
    const riskLevel = getRiskLevel(avgWaitMin, congestion);
    const hour = hourFromSlot(slot);

    const prevSlotIdx = TIME_SLOTS.filter((s) => s.endsWith(':00')).indexOf(slot);
    const prevAvg = prevSlotIdx > 0
      ? (() => {
          const prevSlot = TIME_SLOTS.filter((s) => s.endsWith(':00'))[prevSlotIdx - 1];
          const prevCitas = slotMap.get(prevSlot) || [];
          const prevCompleted = prevCitas.filter((c) => c.actualendtime);
          return prevCompleted.length > 0
            ? prevCompleted.reduce(
                (s, c) => s + getMinutesBetween(c.actualstarttime, c.actualendtime),
                0,
              ) / prevCompleted.length
            : avgWaitMin;
        })()
      : avgWaitMin;

    const trend: 'up' | 'down' | 'stable' =
      avgWaitMin > prevAvg + 5 ? 'up' : avgWaitMin < prevAvg - 5 ? 'down' : 'stable';

    return {
      slot,
      hour,
      avgWaitMin: Math.round(avgWaitMin),
      congestion: Math.round(congestion),
      confidence,
      trend,
      recommendation: getRecommendation(avgWaitMin, congestion, hour),
      riskLevel,
    };
  });

  const peak = slots.reduce((p, s) => (s.avgWaitMin > p.avgWaitMin ? s : p), slots[0]);
  const best = slots.reduce((b, s) => (s.avgWaitMin < b.avgWaitMin ? s : b), slots[0]);
  const avgDayWait = Math.round(slots.reduce((s, x) => s + x.avgWaitMin, 0) / slots.length);

  let insight: string;
  if (peak.avgWaitMin > 45) {
    insight = `Hora pico ${peak.slot} con ${peak.avgWaitMin} min de espera. Considerar redistribuir citas hacia ${best.slot}.`;
  } else if (peak.congestion > 70) {
    insight = `Alta congestión a las ${peak.slot}. Recomendado abrir docks adicionales.`;
  } else if (avgDayWait < 20) {
    insight = `Día con flujo eficiente. Promedio de ${avgDayWait} min de espera.`;
  } else {
    insight = `Demora moderada esperada. Hora pico ${peak.slot} (${peak.avgWaitMin} min).`;
  }

  return {
    slots,
    peakHour: peak.slot,
    bestHour: best.slot,
    avgDayWait,
    totalScheduled: scheduled.length,
    insight,
  };
}
