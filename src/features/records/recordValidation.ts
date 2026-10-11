import type { SessionInput } from '../../types';
import { today } from '../../lib/format';
import { limits, validDate, validRange } from '../../lib/validation';
export function validateSession(input: SessionInput): string | null {
  if (!validDate(input.fecha, today())) return 'Usa una fecha válida entre el 01/01/2000 y hoy.';
  if (!input.registros.length || input.registros.length > limits.registros)
    return 'Agrega entre 1 y 20 registros de ejercicios por sesión.';
  for (const row of input.registros) {
    if (!Number.isInteger(row.ejercicio_id) || row.ejercicio_id <= 0)
      return 'Selecciona un ejercicio válido.';
    if (!validRange(row.series, limits.series))
      return 'Las series deben ser un entero entre 1 y 20.';
    if (!validRange(row.repeticiones, limits.repeticiones))
      return 'Las repeticiones deben ser un entero entre 1 y 100.';
    if (!validRange(row.carga_kg, limits.carga))
      return 'La carga debe estar entre 0 y 600 kg, con una decimal como máximo.';
  }
  return null;
}
