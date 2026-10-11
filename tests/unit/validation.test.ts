import { describe, expect, it } from 'vitest';
import {
  limits,
  validNumericDraft,
  validRange,
  validDate,
  validName,
  validateProfile,
} from '../../src/lib/validation';
import { validateSession } from '../../src/features/records/recordValidation';
import { predictionAdvice } from '../../src/features/predictions/predictionAdvice';
import type { Prediction } from '../../src/types';
describe('Límites de formularios', () => {
  it.each(['-1', '1e3', 'NaN', 'Infinity', '601', '600.01', '10.12', '99999999', 'abc'])(
    'rechaza la carga no válida %s',
    (value) => expect(validNumericDraft(value, 600, 1)).toBe(false),
  );
  it.each(['0', '0.1', '52.5', '600'])('permite la carga válida %s', (value) =>
    expect(validNumericDraft(value, 600, 1)).toBe(true),
  );
  it('permite escribir valores intermedios y solo acepta decimales dentro del paso', () => {
    expect(validNumericDraft('', 600, 1)).toBe(true);
    expect(validNumericDraft('1', 120, 0)).toBe(true);
    expect(validRange(18.1, limits.edad)).toBe(false);
    expect(validRange(0.3, limits.carga)).toBe(true);
    expect(validRange(1.755, limits.talla)).toBe(false);
  });
  it('valida fechas reales y limita el período', () => {
    expect(validDate('2020-02-29', '2026-10-11')).toBe(true);
    expect(validDate('2020-02-31', '2026-10-11')).toBe(false);
    expect(validDate('1999-01-01', '2026-10-11')).toBe(false);
    expect(validDate('2999-01-01', '2026-10-11')).toBe(false);
  });
  it('acepta nombres internacionales y bloquea valores vacíos o numéricos', () => {
    expect(validName('María O’Connor')).toBe(true);
    expect(validName('李 明')).toBe(true);
    expect(validName('   ')).toBe(false);
    expect(validName('Max123')).toBe(false);
    expect(validName('a'.repeat(101))).toBe(false);
  });
  it('rechaza perfiles fuera de rango u objetivos manipulados', () => {
    const p = { edad: 20, talla_m: 1.75, peso_kg: 80, objetivo: 'Ganar fuerza' };
    expect(validateProfile(p)).toBeNull();
    expect(validateProfile({ ...p, peso_kg: 401 })).toContain('peso');
    expect(validateProfile({ ...p, objetivo: 'otro' })).toContain('objetivo');
  });
  it('limita la sesión incluso si se omiten las restricciones del navegador', () => {
    const row = { ejercicio_id: 1, series: 3, repeticiones: 8, carga_kg: 600 };
    const input = { fecha: '2026-01-01', registros: [row] };
    expect(validateSession(input)).toBeNull();
    expect(validateSession({ ...input, registros: Array(21).fill(row) })).toContain('20');
    expect(validateSession({ ...input, registros: [{ ...row, carga_kg: 600.1 }] })).toContain(
      '600',
    );
    expect(validateSession({ ...input, registros: [{ ...row, series: 21 }] })).toContain('series');
  });
});
describe('Interpretación de predicciones', () => {
  const base: Prediction = {
    estado: 'estimado',
    mensaje: '',
    semanas_observadas: 8,
    pendiente_kg_semana: 2,
    siguiente_carga_kg: 48,
    semanas_hasta_meta: 2,
    historial: [],
    proyeccion: [],
  };
  it.each([
    'historial_insuficiente',
    'meta_alcanzada',
    'sin_tendencia_positiva',
    'estimado',
  ] as const)('explica el estado %s', (estado) => {
    const advice = predictionAdvice({ ...base, estado });
    expect(advice.parrafos).toHaveLength(3);
    expect(advice.parrafos.join(' ').length).toBeGreaterThan(400);
  });
  it('distingue una meta distante y no inventa una fecha sin meta', () => {
    expect(predictionAdvice({ ...base, semanas_hasta_meta: 20 }).titulo).toContain('tiempo');
    expect(predictionAdvice({ ...base, semanas_hasta_meta: null }).parrafos[1]).toContain(
      'sin asignar una fecha',
    );
  });
});
