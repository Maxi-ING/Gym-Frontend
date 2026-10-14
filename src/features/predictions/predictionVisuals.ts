import type { Prediction } from '../../types';

type Point = Prediction['historial'][number];

// Solo registros observados: las proyecciones no entran en estos cálculos.
export function loadChanges(history: Point[]) {
  return history.slice(1).map((point, index) => ({
    semana: point.semana,
    carga_kg: point.carga_kg,
    cambio_kg: point.carga_kg - history[index].carga_kg,
  }));
}

// Relación con la carga objetivo; no es el recorrido desde una carga inicial.
export function goalReference(history: Point[], target?: number) {
  const current = history.at(-1)?.carga_kg;
  if (current == null || target == null || !Number.isFinite(target) || target <= 0) return null;
  return {
    current,
    target,
    percentage: Math.max(0, Math.min(100, (current / target) * 100)),
    remaining: Math.max(0, target - current),
  };
}
