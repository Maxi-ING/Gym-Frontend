import type { TrainingSession } from '../../types';
import { validDate } from '../../lib/validation';
import { today } from '../../lib/format';

export interface CalendarDay {
  fecha: string;
  dia: number;
  delMes: boolean;
  futuro: boolean;
  sesiones: number;
}

// UTC arithmetic preserves calendar dates across daylight-saving changes.
export function trainingCalendar(
  sessions: Pick<TrainingSession, 'fecha'>[],
  month: string,
  asOf = today(),
): CalendarDay[] {
  const [year, index] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, index - 1, 1));
  const offset = (start.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, index, 0)).getUTCDate();
  const counts = new Map<string, number>();
  for (const session of sessions) {
    if (validDate(session.fecha, asOf))
      counts.set(session.fecha, (counts.get(session.fecha) ?? 0) + 1);
  }
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
    const date = new Date(Date.UTC(year, index - 1, 1 - offset + i));
    const fecha = date.toISOString().slice(0, 10);
    return {
      fecha,
      dia: date.getUTCDate(),
      delMes: date.getUTCMonth() === index - 1,
      futuro: fecha > asOf,
      sesiones: counts.get(fecha) ?? 0,
    };
  });
}

export function shiftMonth(month: string, step: number) {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year, index - 1 + step, 1)).toISOString().slice(0, 7);
}
