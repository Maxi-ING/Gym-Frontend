import { useState } from 'react';
import { usePreferences } from './PreferencesProvider';
import { useAuth } from '../users/AuthProvider';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
export default function SettingsPage() {
  const { preferences, update, reset, reducedMotion } = usePreferences();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(0);
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
            <p>Negro carbón, versión clara o el tema de tu dispositivo.</p>
          </div>
          <Select
            label="Tema"
            value={preferences.tema}
            onChange={(e) => {
              update({ tema: e.target.value as typeof preferences.tema });
              setMessage('Tema actualizado.');
            }}
          >
            <option value="oscuro">Oscuro</option>
            <option value="claro">Claro</option>
            <option value="sistema">Según el dispositivo</option>
          </Select>
        </div>
        <label className="setting-row">
          <div>
            <h3>Transiciones y animaciones</h3>
            <p>
              Activa la entrada de las vistas, el trazado de los gráficos y la respuesta de los
              controles. Puedes comprobar el efecto aquí mismo.
            </p>
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={preferences.movimiento}
            onChange={(e) => {
              update({ movimiento: e.target.checked });
              setPreview((v) => v + 1);
              setMessage('Preferencia de movimiento actualizada.');
            }}
            aria-label="Activar animaciones"
          />
        </label>
        <div className="motion-demo">
          <div className="motion-demo-heading">
            <div>
              <h3>Así se mueve tu panel</h3>
              <p>
                {reducedMotion
                  ? 'Movimiento desactivado · vista estática'
                  : 'Entrada suave y gráficos que se dibujan'}
              </p>
            </div>
            <Button
              variant="secondary"
              disabled={reducedMotion}
              onClick={() => setPreview((v) => v + 1)}
            >
              Reproducir demostración
            </Button>
          </div>
          <div className="motion-preview" key={`${preview}-${reducedMotion}`} aria-hidden="true">
            <div className="motion-preview-card">
              <Icon name="trend" />
              <span>Tu evolución</span>
              <strong>Registro a registro</strong>
            </div>
            <div className="motion-preview-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <p className="chart-summary">
            Esta vista es una demostración visual, no contiene métricas de tu entrenamiento.
          </p>
          {preferences.movimiento && reducedMotion && (
            <p className="notice">
              Tu dispositivo solicita reducir movimiento. Esa preferencia tiene prioridad; por eso
              la demostración se mantiene estática.
            </p>
          )}
        </div>
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
