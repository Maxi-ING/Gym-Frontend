export const number = (value: number, digits = 0) =>
  new Intl.NumberFormat('es-PE', { maximumFractionDigits: digits }).format(value);
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(
    new Date(`${date}T12:00:00`),
  );
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
