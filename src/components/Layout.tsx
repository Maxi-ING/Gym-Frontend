import { useEffect, useRef, useState, Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/users/AuthProvider';
import Icon, { type IconName } from './Icon';
import ProfileSetup from '../features/users/ProfileSetup';
import { LoadingState } from './Feedback';
const userLinks: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Inicio', icon: 'dashboard' },
  { to: '/entrenamiento', label: 'Entrenamiento', icon: 'training' },
  { to: '/analisis', label: 'Análisis IA', icon: 'spark' },
  { to: '/configuracion', label: 'Configuración', icon: 'settings' },
];
const adminLinks: typeof userLinks = [
  { to: '/', label: 'Inicio', icon: 'dashboard' },
  { to: '/usuarios', label: 'Usuarios', icon: 'users' },
  { to: '/gestion-entrenamientos', label: 'Entrenamientos', icon: 'training' },
  { to: '/ejercicios', label: 'Ejercicios', icon: 'weight' },
  { to: '/configuracion', label: 'Configuración', icon: 'settings' },
];
export default function Layout() {
  const { user, demo, signOut } = useAuth();
  const location = useLocation();
  const links = user?.rol === 'admin' ? adminLinks : userLinks;
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 800px)').matches);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const account = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const sync = () => {
      setMobile(query.matches);
      setOpen(false);
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    setOpen(false);
    if (account.current) account.current.open = false;
    document.getElementById('main-content')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    if (!mobile || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),summary') ??
          [],
      ).filter((el) => el.getClientRects().length > 0);
    focusables()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const list = focusables();
        const first = list[0];
        const last = list.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', key);
    };
  }, [mobile, open]);
  const title =
    location.pathname === '/perfil'
      ? 'Mi perfil'
      : (links.find((l) =>
          l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to),
        )?.label ?? 'Usuarios');
  function toggle() {
    if (mobile) setOpen((v) => !v);
    else setCollapsed((v) => !v);
  }
  return (
    <div className={`app-shell ${collapsed ? 'shell-collapsed' : ''} ${open ? 'menu-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      {mobile && open && (
        <button
          className="nav-backdrop"
          aria-label="Cerrar menú"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
      <aside
        ref={sidebar}
        id="sidebar-navigation"
        className="sidebar"
        inert={mobile && !open}
        aria-label={user?.rol === 'admin' ? 'Panel de administración' : 'Panel personal'}
      >
        <div className="sidebar-brand">
          <NavLink to="/" className="brand" aria-label="FitAnalytics AI inicio" viewTransition>
            <span className="brand-mark">
              <Icon name="training" size={22} />
            </span>
            <span className="brand-text">
              fitanalytics<small>AI</small>
            </span>
          </NavLink>
          {mobile && (
            <button
              className="icon-button"
              aria-label="Cerrar navegación"
              onClick={() => {
                setOpen(false);
                menuButton.current?.focus();
              }}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
        <div className="sidebar-section">
          {user?.rol === 'admin' ? 'GESTIÓN DEL GIMNASIO' : 'MI ENTRENAMIENTO'}
        </div>
        <nav className="nav" aria-label="Navegación principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              title={collapsed && !mobile ? l.label : undefined}
              viewTransition
            >
              <Icon name={l.icon} />
              <span className="nav-label">{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Icon name={user?.rol === 'admin' ? 'users' : 'trend'} size={23} />
            <strong>
              {user?.rol === 'admin' ? 'Cada registro importa.' : 'Fuerza con perspectiva.'}
            </strong>
            <p>
              {user?.rol === 'admin'
                ? 'Acompaña el avance del gimnasio desde un historial organizado.'
                : 'Entrena con constancia. Registra tu esfuerzo y observa tu evolución.'}
            </p>
          </div>
          <details ref={account} className="account-menu">
            <summary aria-label="Abrir menú de cuenta" title="Mi cuenta">
              <span className="avatar">{user?.nombre.slice(0, 2).toUpperCase()}</span>
              <span className="account-label">
                <strong>{user?.nombre}</strong>
                <small>{user?.rol === 'admin' ? 'Administrador' : 'Cuenta personal'}</small>
              </span>
              <Icon name="chevron" size={16} />
            </summary>
            <div className="account-popover">
              <NavLink to="/perfil" viewTransition>
                <Icon name="profile" />
                Mi perfil
              </NavLink>
              <NavLink to="/configuracion" viewTransition>
                <Icon name="settings" />
                Configuración de cuenta
              </NavLink>
              <button onClick={signOut}>
                <Icon name="logout" />
                Cerrar sesión
              </button>
            </div>
          </details>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={menuButton}
              className="icon-button"
              onClick={toggle}
              aria-label={
                mobile
                  ? open
                    ? 'Cerrar menú'
                    : 'Abrir menú'
                  : collapsed
                    ? 'Expandir menú'
                    : 'Comprimir menú'
              }
              aria-controls="sidebar-navigation"
              aria-expanded={mobile ? open : !collapsed}
            >
              <Icon name="menu" />
            </button>
            <div className="topbar-title">
              <span>POWERGYM LIMA</span>
              <strong>{title}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <span className="tag">
              {demo ? 'Demostración' : user?.rol === 'admin' ? 'Administración' : 'Mi cuenta'}
            </span>
            <NavLink
              to="/perfil"
              className="avatar"
              aria-label="Mi perfil desde la cuenta"
              viewTransition
            >
              {user?.nombre.slice(0, 2).toUpperCase()}
            </NavLink>
          </div>
        </header>
        {demo && (
          <div className="demo-banner" role="status">
            <strong>Modo demo · {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}.</strong>{' '}
            Datos ficticios; los cambios se reinician al recargar. El análisis es ilustrativo.
          </div>
        )}
        <main id="main-content" className="page" tabIndex={-1}>
          <div className="route-view" key={location.pathname}>
            <Suspense fallback={<LoadingState />}>
              {user?.perfil_completo || user?.rol === 'admin' ? (
                <Outlet />
              ) : (
                <div className="empty-state">Completa tu perfil para empezar.</div>
              )}
            </Suspense>
          </div>
          <footer className="page-footer">
            <span>FitAnalytics AI · PowerGym Lima</span>
            <span>Entrena. Registra. Comprende.</span>
          </footer>
        </main>
      </div>
      <ProfileSetup />
    </div>
  );
}
