import Button from './Button';
export default function Pagination({
  pagina,
  total,
  porPagina,
  onChange,
}: {
  pagina: number;
  total: number;
  porPagina: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / porPagina));
  return (
    <div className="pagination" aria-label="Paginación">
      <span>
        {total} resultados · Página {pagina} de {pages}
      </span>
      <div className="actions">
        <Button variant="secondary" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={pagina >= pages} onClick={() => onChange(pagina + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
