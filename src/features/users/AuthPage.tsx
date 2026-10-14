import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import { useAuth } from './AuthProvider';
import { userService } from './userService';
import { validName } from '../../lib/validation';
import { errorMessage } from '../../lib/api';
import { useMotionReveal } from '../../hooks/useMotionReveal';

export default function AuthPage() {
  const motion = useMotionReveal<HTMLElement>();
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
    if (register && !validName(String(values.get('nombre')))) {
      setError('Usa un nombre de 2 a 100 caracteres, con letras, espacios, apóstrofes o guiones.');
      setBusy(false);
      return;
    }
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
    <main ref={motion} className="auth-shell">
      <section className="auth-visual" aria-label="FitAnalytics AI">
        <img
          className="auth-photo"
          src="/images/weights.webp"
          alt="Mancuernas negras y mangos de acero en un gimnasio"
          width="1400"
          height="1027"
          fetchPriority="high"
        />
        <div className="auth-visual-header">
          <div className="brand">
            <span className="brand-mark">
              <Icon name="training" size={23} />
            </span>
            fitanalytics<small>AI</small>
          </div>
          <Link to="/sobre" className="auth-about-link" viewTransition>
            Sobre nosotros <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="auth-content">
          <h1>
            Cada sesión
            <br />
            cuenta.
          </h1>
          <p>Entrena con intención. Registra tu esfuerzo y comprende tu progreso.</p>
          <div className="auth-method">
            <span>Entrena.</span>
            <span>Registra.</span>
            <span>Comprende.</span>
          </div>
        </div>
        <div className="auth-foot">
          <span>PowerGym Lima</span>
          <span>Tu fuerza, en perspectiva.</span>
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
                minLength={2}
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
          <div className="auth-divider">Prueba antes de empezar</div>
          <Button
            variant="secondary"
            className="button-wide"
            onClick={() => demo()}
            disabled={busy}
          >
            Explorar demo
            <Icon name="arrow" size={16} />
          </Button>
          <Button
            variant="ghost"
            className="button-wide"
            onClick={() => demo('admin')}
            disabled={busy}
          >
            Explorar demo de administrador
          </Button>
          <Link className="auth-mobile-about link" to="/sobre" viewTransition>
            Conoce PowerGym Lima →
          </Link>
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
