import { describe, expect, it } from 'vitest';
import { validateSession } from '../../src/features/records/recordValidation';
const valid = {
  fecha: '2000-01-01',
  registros: [{ ejercicio_id: 1, series: 3, repeticiones: 8, carga_kg: 32 }],
};
describe('Validación antes de guardar', () => {
  it('acepta carga cero y series completas', () =>
    expect(
      validateSession({ ...valid, registros: [{ ...valid.registros[0], carga_kg: 0 }] }),
    ).toBeNull());
  it('rechaza cargas negativas y repeticiones fraccionarias', () => {
    expect(
      validateSession({ ...valid, registros: [{ ...valid.registros[0], carga_kg: -1 }] }),
    ).toContain('carga');
    expect(
      validateSession({ ...valid, registros: [{ ...valid.registros[0], repeticiones: 1.5 }] }),
    ).toContain('repeticiones');
  });
  it('rechaza una fecha imposible, una futura y una sesión vacía', () => {
    expect(validateSession({ ...valid, fecha: '2020-02-31' })).toContain('fecha');
    expect(validateSession({ ...valid, fecha: '2999-01-01' })).toContain('fecha');
    expect(validateSession({ ...valid, registros: [] })).toContain('ejercicio');
  });
});
