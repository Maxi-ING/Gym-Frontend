export const limits = {
  carga: { min: 0, max: 600, step: 0.1 },
  series: { min: 1, max: 20, step: 1 },
  repeticiones: { min: 1, max: 100, step: 1 },
  edad: { min: 18, max: 120, step: 1 },
  talla: { min: 0.5, max: 2.5, step: 0.01 },
  peso: { min: 20, max: 400, step: 0.1 },
  registros: 20,
  fechaMinima: '2000-01-01',
} as const;
export const objectives = [
  'Ganar fuerza',
  'Ganar masa muscular',
  'Mejorar condición física',
  'Mantener actividad física',
];
export function decimals(step: string | number | undefined) {
  if (step === 'any') return 2;
  return String(step ?? 1).split('.')[1]?.length ?? 0;
}
export function validNumericDraft(value: string, max: number, precision: number) {
  if (value === '') return true;
  const pattern = precision > 0 ? new RegExp(`^\\d+(?:\\.\\d{0,${precision}})?$`) : /^\d+$/;
  return (
    pattern.test(value) &&
    Number.isFinite(Number(value)) &&
    Number(value) <= max &&
    value.replace('.', '').length <= String(Math.floor(max)).length + precision
  );
}
export function validRange(value: number, range: { min: number; max: number; step: number }) {
  return (
    Number.isFinite(value) &&
    value >= range.min &&
    value <= range.max &&
    Math.abs(value / range.step - Math.round(value / range.step)) < 1e-6
  );
}
export function validDate(value: string, max: string) {
  const d = new Date(value);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === value &&
    value >= limits.fechaMinima &&
    value <= max
  );
}
export function validName(value: string) {
  const v = value.trim();
  return v.length >= 2 && v.length <= 100 && /^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]*$/u.test(v);
}
export function validateProfile(input: {
  edad: number;
  talla_m: number;
  peso_kg: number;
  objetivo: string;
}) {
  if (!validRange(input.edad, limits.edad)) return 'La edad debe ser un entero entre 18 y 120.';
  if (!validRange(input.talla_m, limits.talla))
    return 'La talla debe estar entre 0.50 y 2.50 m, con dos decimales como máximo.';
  if (!validRange(input.peso_kg, limits.peso))
    return 'El peso debe estar entre 20 y 400 kg, con una decimal como máximo.';
  if (!objectives.includes(input.objetivo)) return 'Selecciona un objetivo disponible.';
  return null;
}
