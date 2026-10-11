import { describe, expect, it } from 'vitest';
import { trainingActivity } from '../../src/features/dashboard/trainingActivity';

describe('Días con entrenamiento por semana', () => {
  it('cuenta fechas únicas, no el número de sesiones, con semanas de lunes a domingo', () => {
    const weeks = trainingActivity(
      [
        { fecha: '2026-10-04' },
        { fecha: '2026-10-05' },
        { fecha: '2026-10-05' },
        { fecha: '2026-10-06' },
        { fecha: '2026-10-07' },
      ],
      '2026-10-07',
    );
    expect(weeks).toHaveLength(8);
    expect(weeks.at(-2)).toEqual({ inicio: '2026-09-28', fin: '2026-10-04', dias: 1 });
    expect(weeks.at(-1)).toEqual({ inicio: '2026-10-05', fin: '2026-10-07', dias: 3 });
  });
  it('excluye fechas futuras, antiguas, inválidas y fechas con hora', () => {
    const weeks = trainingActivity(
      [
        { fecha: '2026-08-16' },
        { fecha: '2026-08-17' },
        { fecha: '2026-10-08' },
        { fecha: '2026-09-31' },
        { fecha: 'texto' },
        { fecha: '2026-10-07T00:00:00Z' },
      ],
      '2026-10-07',
    );
    expect(weeks[0]).toEqual({ inicio: '2026-08-17', fin: '2026-08-23', dias: 1 });
    expect(weeks.reduce((sum, week) => sum + week.dias, 0)).toBe(1);
  });
  it('mantiene ocho semanas sin datos y cruza años correctamente', () => {
    const weeks = trainingActivity([], '2027-01-04');
    expect(weeks).toHaveLength(8);
    expect(weeks.at(-2)).toEqual({ inicio: '2026-12-28', fin: '2027-01-03', dias: 0 });
    expect(weeks.at(-1)).toEqual({ inicio: '2027-01-04', fin: '2027-01-04', dias: 0 });
  });
  it('no supera siete días cuando se registran sesiones repetidas', () => {
    const sessions = Array.from({ length: 21 }, (_, i) => ({
      fecha: `2026-10-${String(5 + (i % 7)).padStart(2, '0')}`,
    }));
    expect(trainingActivity(sessions, '2026-10-11').at(-1)?.dias).toBe(7);
  });
});
