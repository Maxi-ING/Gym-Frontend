import type { TrainingSession } from '../../types';
import { today } from '../../lib/format';

const dayMs = 86_400_000;
export interface TrainingWeek {
  inicio: string;
  fin: string;
  dias: number;
}

// Calendar dates use UTC only for arithmetic, so daylight saving cannot shift a day.
export function trainingActivity(
  sessions: Pick<TrainingSession, 'fecha'>[],
  asOf = today(),
): TrainingWeek[] {
  const current = Date.parse(`${asOf}T00:00:00Z`);
  const monday = current - ((new Date(current).getUTCDay() + 6) % 7) * dayMs;
  const first = monday - 7 * 7 * dayMs;
  const dates = new Set(
    sessions
      .map((s) => s.fecha)
      .filter((date) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
        const time = Date.parse(`${date}T00:00:00Z`);
        return (
          Number.isFinite(time) &&
          new Date(time).toISOString().slice(0, 10) === date &&
          time >= first &&
          time <= current
        );
      }),
  );
  return Array.from({ length: 8 }, (_, i) => {
    const start = first + i * 7 * dayMs;
    const end = Math.min(start + 6 * dayMs, current);
    const inicio = new Date(start).toISOString().slice(0, 10);
    const fin = new Date(end).toISOString().slice(0, 10);
    return { inicio, fin, dias: [...dates].filter((date) => date >= inicio && date <= fin).length };
  });
}
