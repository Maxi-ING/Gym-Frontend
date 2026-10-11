import { useState, type FormEvent } from 'react';
import { useAuth } from '../users/AuthProvider';
import { adminService } from './adminService';
import { validName } from '../../lib/validation';
import { errorMessage } from '../../lib/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ErrorState } from '../../components/Feedback';
export default function AdminAccountPage() {
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get('nombre')).trim();
    if (!validName(nombre)) {
      setError('Usa un nombre de 2 a 100 caracteres con letras, espacios o guiones.');
      return;
    }
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      setUser(
        await adminService.updateUser(user.id, { nombre, correo: String(f.get('correo')).trim() }),
      );
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">MI CUENTA</div>
          <h1>Perfil de administrador</h1>
          <p>Tu identidad y acceso para gestionar PowerGym.</p>
        </div>
        <span className="tag">Administrador</span>
      </div>
      <section className="panel">
        <h2>Datos de la cuenta</h2>
        <form onSubmit={save} className="form-stack">
          <fieldset disabled={busy} className="form-grid">
            <Input
              name="nombre"
              label="Nombre completo"
              minLength={2}
              maxLength={100}
              defaultValue={user?.nombre}
              required
            />
            <Input
              name="correo"
              label="Correo electrónico"
              type="email"
              maxLength={254}
              defaultValue={user?.correo}
              required
            />
          </fieldset>
          {error && <ErrorState message={error} />}{' '}
          {saved && (
            <div className="feedback feedback-success" role="status">
              Cuenta actualizada correctamente.
            </div>
          )}
          <div className="form-actions">
            <Button type="submit" loading={busy}>
              Guardar cuenta
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
