import { describe, expect, it } from 'vitest';
import { goalReference, loadChanges } from '../../src/features/predictions/predictionVisuals';

describe('gráficos descriptivos del análisis', () => {
  const history = [
    { semana: 0, carga_kg: 60 },
    { semana: 3, carga_kg: 70 },
    { semana: 4, carga_kg: 65 },
  ];
  it('conserva los huecos y las bajadas sin insertar semanas de carga cero', () => {
    expect(loadChanges(history)).toEqual([
      { semana: 3, carga_kg: 70, cambio_kg: 10 },
      { semana: 4, carga_kg: 65, cambio_kg: -5 },
    ]);
    expect(loadChanges([])).toEqual([]);
    expect(loadChanges(history.slice(0, 1))).toEqual([]);
  });
  it('compara la última carga con la meta y no usa el máximo histórico', () => {
    expect(goalReference(history, 100)).toEqual({
      current: 65,
      target: 100,
      percentage: 65,
      remaining: 35,
    });
    expect(goalReference(history, 50)).toEqual({
      current: 65,
      target: 50,
      percentage: 100,
      remaining: 0,
    });
  });
  it('no inventa una meta o un valor cuando faltan referencias', () => {
    expect(goalReference(history)).toBeNull();
    expect(goalReference([], 80)).toBeNull();
    expect(goalReference(history, 0)).toBeNull();
    expect(goalReference(history, NaN)).toBeNull();
  });
});
