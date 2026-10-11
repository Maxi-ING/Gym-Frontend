import { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import UserForm from './UserForm';
import Button from '../../components/Button';

export default function ProfileSetup() {
  const { user, setUser, signOut } = useAuth();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (user?.rol !== 'admin' && !user?.perfil_completo && !el?.open) el?.showModal();
    return () => el?.close();
  }, [user?.perfil_completo, user?.rol]);
  if (!user || user.perfil_completo || user.rol === 'admin') return null;
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(event) => event.preventDefault()}
      aria-labelledby="setup-title"
    >
      <div className="eyebrow">TU PUNTO DE PARTIDA</div>
      <h2 id="setup-title">Completa tu perfil</h2>
      <p>
        Antes de registrar tu entrenamiento, necesitamos tus datos iniciales. Podrás editarlos en tu
        perfil.
      </p>
      <UserForm user={user} onSaved={setUser} />
      <Button variant="ghost" className="button-wide" onClick={signOut}>
        Cerrar sesión
      </Button>
    </dialog>
  );
}
