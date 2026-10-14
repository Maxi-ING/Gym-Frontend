import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from './adminService';
import { useResource } from '../../hooks/useResource';
import { dateLabel, number } from '../../lib/format';
import Icon from '../../components/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
export default function AdminDashboardPage() {
  const resource = useResource(
    useCallback((signal: AbortSignal) => adminService.summary(signal), []),
  );
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <h1>Resumen del gimnasio</h1>
          <p>Una vista general de las cuentas, la actividad registrada y el catálogo.</p>
        </div>
        <Link className="button button-primary" to="/usuarios" viewTransition>
          <Icon name="profile" />
          Gestionar usuarios
        </Link>
      </div>
      {resource.loading ? (
        <LoadingState />
      ) : resource.error ? (
        <ErrorState message={resource.error} retry={resource.reload} />
      ) : (
        resource.data && (
          <>
            <section className="metrics" aria-label="Indicadores generales">
              {[
                { label: 'Cuentas registradas', value: resource.data.total_usuarios },
                { label: 'Cuentas activas', value: resource.data.usuarios_activos },
                { label: 'Sesiones guardadas', value: resource.data.total_sesiones },
                { label: 'Ejercicios disponibles', value: resource.data.total_ejercicios },
              ].map((m, i) => (
                <article
                  key={m.label}
                  className={`panel metric ${i === 1 ? 'metric-highlight' : ''}`}
                >
                  <div className="metric-top">{m.label}</div>
                  <div className="metric-value">{number(m.value)}</div>
                  <p className="metric-note">Total en la plataforma</p>
                </article>
              ))}
            </section>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Actividad reciente</h2>
                  <p>Últimas sesiones registradas por los usuarios.</p>
                </div>
                <Link className="link" to="/gestion-entrenamientos" viewTransition>
                  Revisar entrenamientos →
                </Link>
              </div>
              {resource.data.sesiones_recientes.length ? (
                <div className="table-wrap mobile-cards">
                  <table>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Volumen registrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resource.data.sesiones_recientes.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <Link className="link" to={`/usuarios/${s.usuario_id}`} viewTransition>
                              {s.usuario_nombre}
                            </Link>
                          </td>
                          <td data-label="Fecha">{dateLabel(s.fecha)}</td>
                          <td data-label="Volumen">{number(s.volumen_kg)} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Sin actividad registrada">
                  Las nuevas sesiones aparecerán aquí.
                </EmptyState>
              )}
            </section>
            <section className="panel">
              <h2>Acciones de administración</h2>
              <div className="quick-links">
                <Link to="/usuarios" viewTransition>
                  <Icon name="profile" />
                  <strong>Usuarios</strong>
                  <span>Cuentas, roles y estado de acceso</span>
                </Link>
                <Link to="/gestion-entrenamientos" viewTransition>
                  <Icon name="training" />
                  <strong>Entrenamientos</strong>
                  <span>Revisión y corrección del historial</span>
                </Link>
                <Link to="/ejercicios" viewTransition>
                  <Icon name="weight" />
                  <strong>Ejercicios</strong>
                  <span>Catálogo disponible para el gimnasio</span>
                </Link>
              </div>
            </section>
          </>
        )
      )}
    </div>
  );
}
