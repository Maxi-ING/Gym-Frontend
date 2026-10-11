import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/users/AuthProvider';
import Icon, { type IconName } from './Icon';
import ProfileSetup from '../features/users/ProfileSetup';

const userLinks: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Mi progreso', icon: 'dashboard' },
  { to: '/entrenamiento', label: 'Entrenamiento', icon: 'training' },
  { to: '/analisis', label: 'Análisis IA', icon: 'spark' },
];
export default function Layout() {
  const { user, demo, signOut } = useAuth();
  const links =
    user?.rol === 'admin'
      ? [
          { to: '/', label: 'Inicio', icon: 'dashboard' as const },
          { to: '/usuarios', label: 'Usuarios', icon: 'profile' as const },
          { to: '/gestion-entrenamientos', label: 'Entrenamientos', icon: 'training' as const },
          { to: '/ejercicios', label: 'Ejercicios', icon: 'weight' as const },
        ]
      : userLinks;
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="FitAnalytics AI inicio">
          <span className="brand-mark">F</span>fitanalytics<small>AI</small>
        </NavLink>
        <span className="eyebrow">TU ESPACIO</span>
        <nav className="nav" aria-label="Navegación principal">
          {links.map((x) => (
            <NavLink to={x.to} end={x.to === '/'} key={x.to}>
              <Icon name={x.icon} />
              {x.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Icon name="trend" size={23} />
            <strong>El progreso es constancia.</strong>Registra cada sesión y construye tu propio
            historial.
          </div>
          <div className="user-mini">
            <span className="avatar">{user?.nombre.slice(0, 2).toUpperCase()}</span>
            <div>
              <NavLink to="/perfil">
                <strong>{user?.nombre}</strong>
                <small>Mi perfil</small>
              </NavLink>
              <small>{demo ? 'Cuenta de demostración' : 'Mi cuenta'}</small>
            </div>
            <button className="logout" onClick={signOut} aria-label="Cerrar sesión">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="content">
        <header className="topbar">
          <span className="topbar-title">
            Mi espacio <strong>/ FitAnalytics AI</strong>
          </span>
          <div className="topbar-right">
            <span>POWERGYM LIMA</span>
            <span>
              <span className="status-dot" />
              {demo ? 'Demostración' : 'Cuenta personal'}
            </span>
          </div>
        </header>
        {demo && (
          <div className="demo-banner" role="status">
            <strong>Modo demo.</strong> Datos de ejemplo en esta pestaña; los cambios se reinician
            al recargar. El análisis es ilustrativo.
          </div>
        )}
        <main id="main-content" className="page" tabIndex={-1}>
          {user?.perfil_completo || user?.rol === 'admin' ? (
            <Outlet />
          ) : (
            <div className="empty-state">Completa tu perfil para empezar.</div>
          )}
          <footer className="page-footer">
            <span>FitAnalytics AI · Seguimiento del entrenamiento</span>
            <span>Tu progreso comienza con tus datos.</span>
          </footer>
        </main>
      </div>
      <ProfileSetup />
    </div>
  );
}
