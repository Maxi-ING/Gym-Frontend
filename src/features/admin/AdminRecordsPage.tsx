import { useCallback, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminService } from './adminService';
import { useResource } from '../../hooks/useResource';
import { dateLabel, number } from '../../lib/format';
import { errorMessage } from '../../lib/api';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
export default function AdminRecordsPage() {
  const [params] = useSearchParams();
  const raw = params.get('usuario_id');
  const id = raw ? Number(raw) : undefined;
  const [pagina, setPagina] = useState(1);
  const [pending, setPending] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const catalog = useResource(
    useCallback((signal: AbortSignal) => adminService.exercises(signal), []),
  );
  const resource = useResource(
    useCallback(
      (signal: AbortSignal) => {
        if (id !== undefined && (!Number.isInteger(id) || id <= 0))
          throw new Error('Filtro de usuario no válido.');
        return adminService.sessions({ usuario_id: id, pagina }, signal);
      },
      [id, pagina],
    ),
  );
  async function remove() {
    if (!pending) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminService.deleteSession(pending);
      setPending(undefined);
      setMessage('Sesión eliminada. Los indicadores se actualizarán con el historial restante.');
      if (resource.data?.items.length === 1 && pagina > 1) setPagina(pagina - 1);
      else resource.reload();
    } catch (e) {
      setError(errorMessage(e));
      setPending(undefined);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Entrenamientos registrados</h1>
          <p>
            Revisa las sesiones de los usuarios y elimina registros incorrectos tras verificarlos.
          </p>
        </div>
        {id && (
          <Link className="button button-secondary" to="/gestion-entrenamientos" viewTransition>
            Ver todos
          </Link>
        )}
      </div>
      {error && <ErrorState message={error} />}{' '}
      {message && (
        <div className="feedback feedback-success" role="status">
          {message}
        </div>
      )}
      <section className="panel">
        {resource.loading ? (
          <LoadingState />
        ) : resource.error ? (
          <ErrorState message={resource.error} retry={resource.reload} />
        ) : (
          resource.data && (
            <>
              {resource.data.items.length ? (
                <div className="table-wrap mobile-cards">
                  <table>
                    <caption className="sr-only">Sesiones de todos los usuarios</caption>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Detalle</th>
                        <th>Volumen</th>
                        <th>Gestión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resource.data.items.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <Link className="link" to={`/usuarios/${s.usuario_id}`} viewTransition>
                              {s.usuario_nombre}
                            </Link>
                          </td>
                          <td data-label="Fecha">{dateLabel(s.fecha)}</td>
                          <td data-label="Detalle">
                            <details className="session-details">
                              <summary>{s.registros.length} registros</summary>
                              <ul>
                                {s.registros.map((r, i) => (
                                  <li key={i}>
                                    {catalog.data?.find((e) => e.id === r.ejercicio_id)?.nombre ??
                                      `Ejercicio #${r.ejercicio_id}`}
                                    : {r.series} × {r.repeticiones} × {number(r.carga_kg, 1)} kg
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </td>
                          <td data-label="Volumen">{number(s.volumen_kg)} kg</td>
                          <td data-label="Gestión">
                            <Button variant="ghost" onClick={() => setPending(s.id)}>
                              Eliminar sesión
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Sin sesiones">
                  No hay entrenamientos registrados para esta consulta.
                </EmptyState>
              )}
              <Pagination
                pagina={resource.data.pagina}
                total={resource.data.total}
                porPagina={resource.data.por_pagina}
                onChange={setPagina}
              />
            </>
          )
        )}
      </section>
      {pending && (
        <ConfirmDialog
          title="Eliminar sesión"
          message="Se eliminará la sesión y sus ejercicios del historial. El progreso se calculará nuevamente. Esta acción no puede deshacerse."
          busy={busy}
          onConfirm={remove}
          onCancel={() => setPending(undefined)}
        />
      )}
    </div>
  );
}
