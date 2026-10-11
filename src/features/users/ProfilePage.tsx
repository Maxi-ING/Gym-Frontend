import { useCallback, useState, type FormEvent } from 'react';
import { useAuth } from './AuthProvider';
import { userService } from './userService';
import UserForm from './UserForm';
import { api, errorMessage } from '../../lib/api';
import { useResource } from '../../hooks/useResource';
import { number, today } from '../../lib/format';
import { limits, validDate, validRange } from '../../lib/validation';
import type { Progress } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ErrorState, LoadingState } from '../../components/Feedback';
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const resource = useResource(
    useCallback((signal: AbortSignal) => api<Progress>('/progreso', { signal }), []),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function measurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const input = { fecha: String(form.get('fecha')), peso_kg: Number(form.get('peso')) };
    if (!validDate(input.fecha, today()) || !validRange(input.peso_kg, limits.peso)) {
      setError(
        'Usa una fecha entre el 01/01/2000 y hoy y un peso de 20 a 400 kg, con una decimal.',
      );
      setSaved(false);
      return;
    }
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await userService.measurement(input);
      element.reset();
      resource.reload();
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return null;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TU PUNTO DE PARTIDA</div>
          <h1>Tu perfil, siempre al día.</h1>
          <p>Actualiza tus datos y conserva tus mediciones de peso.</p>
        </div>
      </div>
      {resource.loading ? (
        <LoadingState />
      ) : resource.error ? (
        <ErrorState message={resource.error} retry={resource.reload} />
      ) : (
        <div className="profile-grid">
          <aside className="panel profile-overview">
            <div className="avatar">{user.nombre.slice(0, 2).toUpperCase()}</div>
            <h2>{user.nombre}</h2>
            <span className="tag">Cuenta personal</span>
            <p>{user.correo}</p>
            <div className="profile-stat">
              <span>Objetivo</span>
              <strong>{user.objetivo}</strong>
            </div>
            <div className="profile-stat">
              <span>Talla</span>
              <strong>{user.talla_m ? `${number(user.talla_m, 2)} m` : '—'}</strong>
            </div>
            <div className="profile-stat">
              <span>Último peso</span>
              <strong>
                {resource.data?.ultima_medicion
                  ? `${number(resource.data.ultima_medicion.peso_kg, 1)} kg`
                  : '—'}
              </strong>
            </div>
            <div className="profile-stat">
              <span>IMC orientativo</span>
              <strong>
                {resource.data?.ultima_medicion?.imc != null
                  ? number(resource.data.ultima_medicion.imc, 1)
                  : '—'}
              </strong>
            </div>
            <div className="notice">
              El IMC es un indicador general. Tus decisiones de entrenamiento deben considerar la
              evaluación de tu entrenador.
            </div>
          </aside>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Datos personales</h2>
                <p>Tu perfil y tu medición se guardan juntos.</p>
              </div>
            </div>
            <UserForm
              key={user.id}
              user={user}
              initialWeight={resource.data?.ultima_medicion?.peso_kg}
              onSaved={(updated) => {
                setUser(updated);
                resource.reload();
              }}
            />
            <form className="measurement-form" onSubmit={measurement}>
              <h3>Agregar una medición de peso</h3>
              <fieldset disabled={busy}>
                <div className="form-grid">
                  <Input
                    name="fecha"
                    label="Fecha de medición"
                    type="date"
                    min={limits.fechaMinima}
                    max={today()}
                    defaultValue={today()}
                    required
                  />
                  <Input
                    name="peso"
                    label="Peso (kg)"
                    type="number"
                    {...limits.peso}
                    placeholder="80.0"
                    required
                  />
                </div>
                <div className="form-actions">
                  <Button type="submit" loading={busy}>
                    Guardar medición
                  </Button>
                </div>
              </fieldset>
              {error && (
                <div className="feedback feedback-error inline-status" role="alert">
                  {error}
                </div>
              )}
              {saved && (
                <div className="feedback feedback-success inline-status" role="status">
                  Medición guardada correctamente.
                </div>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
