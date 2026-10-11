import type { SessionInput } from '../../types';
import { today } from '../../lib/format';
export function validateSession(input: SessionInput): string | null {
  const parsed = new Date(input.fecha);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== input.fecha ||
    input.fecha > today()
  )
    return 'Usa una fecha válida que no sea futura.';
  if (!input.registros.length) return 'Agrega al menos un ejercicio.';
  for (const row of input.registros) {
    if (!Number.isInteger(row.ejercicio_id) || row.ejercicio_id <= 0)
      return 'Selecciona un ejercicio válido.';
    if (!Number.isInteger(row.series) || row.series < 1 || row.series > 100)
      return 'Las series deben ser un entero entre 1 y 100.';
    if (!Number.isInteger(row.repeticiones) || row.repeticiones < 1 || row.repeticiones > 500)
      return 'Las repeticiones deben ser un entero entre 1 y 500.';
    if (!Number.isFinite(row.carga_kg) || row.carga_kg < 0 || row.carga_kg > 1000)
      return 'La carga debe estar entre 0 y 1000 kg.';
  }
  return null;
}
