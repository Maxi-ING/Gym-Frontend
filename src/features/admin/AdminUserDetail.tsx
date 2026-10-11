import { useCallback, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../users/AuthProvider';
import { adminService } from './adminService';
import { recordService } from '../records/recordService';
import SessionTable from '../records/SessionTable';
import MetricsCards from '../dashboard/MetricsCards';
import { useResource } from '../../hooks/useResource';
import { errorMessage } from '../../lib/api';
import { number } from '../../lib/format';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
export default function AdminUserDetail() {
  const { id } = useParams();
  const { user: current, setUser } = useAuth();
  const userId = Number(id);
  const resource = useResource(
    useCallback(
      async (signal: AbortSignal) => {
        if (!Number.isInteger(userId) || userId < 1)
          throw new Error('Identificador de usuario no válido.');
        const [detail, exercises] = await Promise.all([
          adminService.user(userId, signal),
          recordService.exercises(signal),
        ]);
        return { ...detail, exercises };
      },
      [userId],
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<{
    input?: { nombre: string; correo: string; rol: 'admin' | 'usuario'; activo: boolean };
    goal?: number;
  }>();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      nombre: String(form.get('nombre')).trim(),
      correo: String(form.get('correo')).trim(),
      rol: form.get('rol') === 'admin' ? ('admin' as const) : ('usuario' as const),
      activo: form.get('activo') === 'true',
    };
    if (input.nombre.length < 2) {
      setError('Ingresa un nombre de al menos 2 caracteres.');
      return;
    }
    setPending({ input });
  }
  async function confirm() {
    if (!pending) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (pending.input) {
        const updated = await adminService.updateUser(userId, pending.input);
        if (updated.id === current?.id) setUser(updated);
      } else if (pending.goal) await adminService.deleteGoal(pending.goal);
      setPending(undefined);
      setMessage('Cambios guardados correctamente.');
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
      setPending(undefined);
    } finally {
      setBusy(false);
    }
  }
  if (resource.loading) return <LoadingState />;
  if (resource.error) return <ErrorState message={resource.error} retry={resource.reload} />;
  if (!resource.data) return null;
  const { usuario: u, progreso, sesiones, metas, exercises } = resource.data;
  const own = u.id === current?.id;
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Link className="link" to="/usuarios" viewTransition>
            ← Volver a usuarios
          </Link>
          <h1>{u.nombre}</h1>
          <p>
            Cuenta {u.activo ? 'activa' : 'inactiva'} ·{' '}
            {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
          </p>
        </div>
      </div>
      {error && <ErrorState message={error} />}{' '}
      {message && (
        <div className="feedback feedback-success" role="status">
          {message}
        </div>
      )}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Cuenta y permisos</h2>
            <p>Los cambios de rol y estado requieren confirmación.</p>
          </div>
        </div>
        <form className="form-stack" onSubmit={submit} key={JSON.stringify(u)}>
          <fieldset disabled={busy} className="form-grid">
            <Input
              name="nombre"
              label="Nombre completo"
              required
              minLength={2}
              maxLength={100}
              defaultValue={u.nombre}
            />
            <Input
              name="correo"
              label="Correo electrónico"
              type="email"
              required
              maxLength={254}
              defaultValue={u.correo}
            />
            <Select name="rol" label="Rol de cuenta" defaultValue={u.rol} disabled={own}>
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </Select>
            <Select
              name="activo"
              label="Estado de cuenta"
              defaultValue={String(u.activo)}
              disabled={own}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
            {own && (
              <>
                <input type="hidden" name="rol" value={u.rol} />
                <input type="hidden" name="activo" value={String(u.activo)} />
              </>
            )}
          </fieldset>
          {own && <p className="muted">Tu propia cuenta conserva sus permisos y acceso.</p>}
          <div className="form-actions">
            <Button type="submit" loading={busy}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </section>
      <section className="panel">
        <h2>Perfil del usuario</h2>
        <div className="overview-values">
          <div>
            <span>Edad</span>
            <strong>{u.edad ?? '—'}</strong>
          </div>
          <div>
            <span>Talla</span>
            <strong>{u.talla_m ? `${number(u.talla_m, 2)} m` : '—'}</strong>
          </div>
          <div>
            <span>Objetivo</span>
            <strong>{u.objetivo ?? 'Sin completar'}</strong>
          </div>
          <div>
            <span>IMC orientativo</span>
            <strong>
              {progreso.ultima_medicion?.imc != null
                ? number(progreso.ultima_medicion.imc, 1)
                : '—'}
            </strong>
          </div>
        </div>
        <p className="muted">
          Los datos corporales se actualizan desde el perfil personal del usuario.
        </p>
      </section>
      <MetricsCards progress={progreso} />
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Sesiones del usuario</h2>
            <p>Historial disponible para revisión.</p>
          </div>
          <Link className="link" to={`/gestion-entrenamientos?usuario_id=${u.id}`} viewTransition>
            Gestionar sesiones →
          </Link>
        </div>
        <SessionTable sessions={sesiones} exercises={exercises} />
      </section>
      <section className="panel">
        <h2>Metas registradas</h2>
        {metas.length ? (
          <ul className="goal-list">
            {metas.map((g) => (
              <li key={g.id}>
                <div>
                  <strong>
                    {exercises.find((e) => e.id === g.ejercicio_id)?.nombre ?? 'Ejercicio'}
                  </strong>
                  <small>
                    {number(g.carga_objetivo_kg, 1)} kg · {g.estado}
                  </small>
                </div>
                <Button variant="ghost" onClick={() => setPending({ goal: g.id })}>
                  Eliminar meta
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Sin metas registradas">
            El usuario aún no ha definido metas de carga.
          </EmptyState>
        )}
      </section>
      {pending && (
        <ConfirmDialog
          title={pending.goal ? 'Eliminar esta meta' : 'Actualizar la cuenta'}
          message={
            pending.goal
              ? 'Se eliminará esta meta. Esta acción no puede deshacerse.'
              : 'Se actualizarán los datos, el rol y el acceso de esta cuenta. Revisa los cambios antes de continuar.'
          }
          busy={busy}
          onConfirm={confirm}
          onCancel={() => setPending(undefined)}
        />
      )}
    </div>
  );
}
