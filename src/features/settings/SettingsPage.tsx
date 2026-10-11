import { useState } from 'react';
import { usePreferences } from './PreferencesProvider';
import { useAuth } from '../users/AuthProvider';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
export default function SettingsPage() {
  const { preferences, update, reset } = usePreferences();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">TU EXPERIENCIA</div>
          <h1>Configuración</h1>
          <p>Adapta la plataforma a tu forma de trabajar y entrenar.</p>
        </div>
        <span className="tag">{user?.rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Apariencia</h2>
            <p>Los cambios se aplican al instante y se guardan para tu cuenta en este navegador.</p>
          </div>
          <Icon name="settings" />
        </div>
        <div className="setting-row">
          <div>
            <h3>Tema de la plataforma</h3>
            <p>Azul noche, versión clara o el tema de tu dispositivo.</p>
          </div>
          <Select
            label="Tema"
            value={preferences.tema}
            onChange={(e) => {
              update({ tema: e.target.value as typeof preferences.tema });
              setMessage('Tema actualizado.');
            }}
          >
            <option value="oscuro">Azul noche</option>
            <option value="claro">Claro</option>
            <option value="sistema">Según el dispositivo</option>
          </Select>
        </div>
        <label className="setting-row">
          <div>
            <h3>Transiciones y animaciones</h3>
            <p>
              Suaviza el cambio de vistas. Se respeta la preferencia de reducir movimiento del
              dispositivo.
            </p>
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.movimiento}
            onChange={(e) => {
              update({ movimiento: e.target.checked });
              setMessage('Preferencia de movimiento actualizada.');
            }}
            aria-label="Activar animaciones"
          />
        </label>
      </section>
      <section className="panel">
        <h2>Mi cuenta</h2>
        <div className="overview-values">
          <div>
            <span>Nombre</span>
            <strong>{user?.nombre}</strong>
          </div>
          <div>
            <span>Correo</span>
            <strong>{user?.correo}</strong>
          </div>
          <div>
            <span>Permisos</span>
            <strong>
              {user?.rol === 'admin' ? 'Gestión del gimnasio' : 'Mi entrenamiento y progreso'}
            </strong>
          </div>
        </div>
        <p className="section-description">
          El perfil se abre desde el menú de tu cuenta. Las preferencias de esta página se guardan
          en este dispositivo; los datos de entrenamiento se gestionan mediante tu cuenta.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            setMessage('Preferencias restauradas.');
          }}
        >
          Restaurar preferencias
        </Button>
      </section>
      {message && (
        <div role="status" className="feedback feedback-success">
          {message}
        </div>
      )}
    </div>
  );
}
