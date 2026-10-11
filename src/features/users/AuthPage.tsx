import { useState, type FormEvent } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import { useAuth } from './AuthProvider';
import { userService } from './userService';
import { errorMessage } from '../../lib/api';

export default function AuthPage() {
  const { signIn } = useAuth();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const values = new FormData(event.currentTarget);
    const input = {
      correo: String(values.get('correo')).trim(),
      clave: String(values.get('clave')),
    };
    try {
      if (register) {
        await userService.register({ ...input, nombre: String(values.get('nombre')).trim() });
        setRegister(false);
        setMessage('Tu cuenta fue creada. Inicia sesión para completar tu perfil.');
      } else {
        const result = await userService.login(input);
        await signIn(result.access_token);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function demo(rol: 'admin' | 'usuario' = 'usuario') {
    setBusy(true);
    setError('');
    try {
      await signIn('demo', true, rol);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="FitAnalytics AI">
        <div className="brand">
          <span className="brand-mark">F</span>fitanalytics<small>AI</small>
        </div>
        <div className="auth-content">
          <div className="eyebrow">ENTRENA CON PERSPECTIVA</div>
          <h1>
            Cada sesión
            <br />
            cuenta.
            <br />
            <span>Hazla visible.</span>
          </h1>
          <p>Tu entrenamiento, tus datos y una forma más clara de entender tu progreso.</p>
          <div className="auth-preview">
            <div className="auth-preview-top">
              <span>Un historial que cuenta tu avance</span>
              <Icon name="trend" size={18} />
            </div>
            <strong>Tu próximo paso ↗</strong>
            <svg
              viewBox="0 0 360 110"
              role="img"
              aria-label="Ilustración de una tendencia ascendente"
            >
              <defs>
                <linearGradient id="auth-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#5ab7ff" stopOpacity=".25" />
                  <stop offset="1" stopColor="#5ab7ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 90L45 83 90 65 135 69 180 48 225 38 270 42 315 18 360 8V110H0Z"
                fill="url(#auth-fill)"
              />
              <path
                d="M0 90L45 83 90 65 135 69 180 48 225 38 270 42 315 18 360 8"
                fill="none"
                stroke="#5ab7ff"
                strokeWidth="3"
              />
            </svg>
            <small>Ilustración del seguimiento · no son resultados reales</small>
          </div>
        </div>
        <div className="auth-foot">
          <span>POWERGYM LIMA · FITANALYTICS AI</span>
          <span>Entrena. Registra. Comprende.</span>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <h2>{register ? 'Comienza tu historial' : 'Bienvenido de nuevo'}</h2>
          <p>
            {register
              ? 'Crea una cuenta y da el primer paso para seguir tu entrenamiento.'
              : 'Ingresa a tu espacio y continúa desde donde te quedaste.'}
          </p>
          <div className="auth-tabs" aria-label="Opciones de acceso">
            <button
              type="button"
              className={!register ? 'active' : ''}
              disabled={busy}
              onClick={() => {
                setRegister(false);
                setError('');
                setMessage('');
              }}
              aria-pressed={!register}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={register ? 'active' : ''}
              disabled={busy}
              onClick={() => {
                setRegister(true);
                setError('');
                setMessage('');
              }}
              aria-pressed={register}
            >
              Crear cuenta
            </button>
          </div>
          <form onSubmit={submit} className="form-stack" key={String(register)}>
            {register && (
              <Input
                name="nombre"
                label="Nombre"
                placeholder="¿Cómo te llamas?"
                required
                maxLength={100}
                autoComplete="name"
              />
            )}
            <Input
              name="correo"
              label="Correo electrónico"
              placeholder="nombre@correo.com"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
            />
            <Input
              name="clave"
              label="Contraseña"
              placeholder={register ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              type="password"
              required
              minLength={register ? 8 : 1}
              maxLength={128}
              autoComplete={register ? 'new-password' : 'current-password'}
            />
            {error && (
              <div className="feedback feedback-error" role="alert">
                {error}
              </div>
            )}
            {message && (
              <div className="feedback feedback-success" role="status">
                {message}
              </div>
            )}
            <Button type="submit" loading={busy} className="button-wide">
              {register ? 'Crear mi cuenta' : 'Entrar a mi espacio'}
              <Icon name="arrow" size={17} />
            </Button>
          </form>
          <div className="auth-divider">CONOCE FITANALYTICS</div>
          <Button
            variant="secondary"
            className="button-wide"
            onClick={() => demo()}
            disabled={busy}
          >
            Explorar demo
            <Icon name="spark" size={16} />
          </Button>
          <Button
            variant="ghost"
            className="button-wide"
            onClick={() => demo('admin')}
            disabled={busy}
          >
            Explorar demo de administrador
          </Button>
          <p className="auth-note">
            Demo con datos de ejemplo. No requiere una cuenta.
            <br />
            La aplicación está orientada a personas mayores de 18 años.
          </p>
        </div>
      </section>
    </main>
  );
}
