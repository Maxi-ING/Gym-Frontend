import { describe, expect, it } from 'vitest';
import { trainingCalendar, shiftMonth } from '../../src/features/dashboard/trainingCalendar';

describe('Calendario del entrenamiento', () => {
  it('cuenta varios registros de la misma fecha en una sola celda', () => {
    const days = trainingCalendar(
      [{ fecha: '2026-10-05' }, { fecha: '2026-10-05' }],
      '2026-10',
      '2026-10-12',
    );
    expect(days.filter((day) => day.delMes && day.sesiones > 0)).toHaveLength(1);
    expect(days.find((day) => day.fecha === '2026-10-05')?.sesiones).toBe(2);
  });
  it('ordena semanas de lunes a domingo y conserva el relleno de otros meses', () => {
    const days = trainingCalendar([], '2026-10', '2026-10-12');
    expect(days).toHaveLength(35);
    expect(days[0]).toMatchObject({ fecha: '2026-09-28', delMes: false });
    expect(days.filter((day) => day.delMes)).toHaveLength(31);
    expect(days.at(-1)).toMatchObject({ fecha: '2026-11-01', delMes: false });
  });
  it('incluye febrero bisiesto y meses que necesitan seis filas', () => {
    expect(trainingCalendar([], '2024-02', '2026-10-12').filter((day) => day.delMes)).toHaveLength(
      29,
    );
    expect(trainingCalendar([], '2026-03', '2026-10-12')).toHaveLength(42);
  });
  it('descarta fechas inválidas y futuras y marca los días futuros', () => {
    const days = trainingCalendar(
      [{ fecha: '2026-10-13' }, { fecha: '2026-10-32' }, { fecha: '2026-10-12T12:00:00Z' }],
      '2026-10',
      '2026-10-12',
    );
    expect(days.reduce((sum, day) => sum + day.sesiones, 0)).toBe(0);
    expect(days.find((day) => day.fecha === '2026-10-13')?.futuro).toBe(true);
  });
  it('navega entre diciembre y enero sin perder el año', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2027-01', -1)).toBe('2026-12');
  });
});
