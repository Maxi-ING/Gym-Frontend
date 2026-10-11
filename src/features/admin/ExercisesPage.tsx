import { useCallback, useState, type FormEvent } from 'react';
import { adminService } from './adminService';
import { useResource } from '../../hooks/useResource';
import { errorMessage } from '../../lib/api';
import type { Exercise } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ErrorState, LoadingState, EmptyState } from '../../components/Feedback';
export default function ExercisesPage() {
  const resource = useResource(
    useCallback((signal: AbortSignal) => adminService.exercises(signal), []),
  );
  const [edit, setEdit] = useState<Exercise>();
  const [pending, setPending] = useState<Exercise>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const el = event.currentTarget;
    const nombre = String(new FormData(el).get('nombre')).trim();
    if (nombre.length < 2) {
      setError('Usa un nombre de 2 a 80 caracteres.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (edit) await adminService.updateExercise(edit.id, { nombre });
      else await adminService.createExercise(nombre);
      setEdit(undefined);
      el.reset();
      setMessage('Ejercicio guardado correctamente.');
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function toggle() {
    if (!pending) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminService.updateExercise(pending.id, { activo: pending.activo === false });
      setMessage('Disponibilidad actualizada. El historial anterior se conserva.');
      resource.reload();
      setPending(undefined);
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
          <div className="eyebrow">CATÁLOGO DEL GIMNASIO</div>
          <h1>Ejercicios</h1>
          <p>Organiza los ejercicios disponibles para nuevos entrenamientos.</p>
        </div>
        <span className="tag">Carga externa · kg</span>
      </div>
      {error && <ErrorState message={error} />}{' '}
      {message && (
        <div className="feedback feedback-success" role="status">
          {message}
        </div>
      )}
      <section className="panel">
        <h2>{edit ? 'Editar ejercicio' : 'Agregar ejercicio'}</h2>
        <form className="filter-bar" onSubmit={save} key={edit?.id ?? 'new'}>
          <Input
            name="nombre"
            label="Nombre del ejercicio"
            minLength={2}
            maxLength={80}
            defaultValue={edit?.nombre ?? ''}
            required
            disabled={busy}
          />
          <Button type="submit" loading={busy}>
            {edit ? 'Guardar nombre' : 'Agregar al catálogo'}
          </Button>
          {edit && (
            <Button variant="ghost" onClick={() => setEdit(undefined)} disabled={busy}>
              Cancelar edición
            </Button>
          )}
        </form>
      </section>
      <section className="panel">
        {resource.loading ? (
          <LoadingState />
        ) : resource.error ? (
          <ErrorState message={resource.error} retry={resource.reload} />
        ) : resource.data?.length ? (
          <div className="table-wrap mobile-cards">
            <table>
              <caption className="sr-only">Catálogo de ejercicios</caption>
              <thead>
                <tr>
                  <th>Ejercicio</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                  <th>Gestión</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.nombre}</strong>
                    </td>
                    <td data-label="Unidad">kg</td>
                    <td data-label="Estado">{e.activo === false ? 'Inactivo' : 'Activo'}</td>
                    <td data-label="Gestión">
                      <div className="actions">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEdit(e);
                            window.scrollTo({
                              top: 0,
                              behavior:
                                document.documentElement.dataset.motion === 'reduced'
                                  ? 'instant'
                                  : 'smooth',
                            });
                          }}
                        >
                          Editar {e.nombre}
                        </Button>
                        <Button variant="ghost" onClick={() => setPending(e)}>
                          {e.activo === false ? 'Activar' : 'Desactivar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Catálogo vacío">
            Agrega el primer ejercicio para habilitar el registro.
          </EmptyState>
        )}
      </section>
      {pending && (
        <ConfirmDialog
          title={pending.activo === false ? 'Activar ejercicio' : 'Desactivar ejercicio'}
          message="El cambio afecta la selección para nuevas sesiones. Los registros y metas anteriores se conservan."
          busy={busy}
          onConfirm={toggle}
          onCancel={() => setPending(undefined)}
        />
      )}
    </div>
  );
}
