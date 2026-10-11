import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../users/AuthProvider';
import { useResource } from '../../hooks/useResource';
import { dashboardService } from './dashboardService';
import { recordService } from '../records/recordService';
import MetricsCards from './MetricsCards';
import ProgressChart from './ProgressChart';
import TrainingDaysChart from './TrainingDaysChart';
import SessionTable from '../records/SessionTable';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
import { today, number } from '../../lib/format';
import type { ProgressFilters } from '../../types';
export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ProgressFilters>({});
  const overview = useResource(
    useCallback((signal: AbortSignal) => dashboardService.overview(signal), []),
  );
  const catalog = useResource(
    useCallback((signal: AbortSignal) => recordService.exercises(signal), []),
  );
  const history = useResource(
    useCallback((signal: AbortSignal) => recordService.sessions(signal), []),
  );
  const invalidRange = !!(filters.desde && filters.hasta && filters.desde > filters.hasta);
  const progress = useResource(
    useCallback(
      (signal: AbortSignal) => {
        if (invalidRange) throw new Error('La fecha inicial debe ser anterior o igual a la final.');
        return dashboardService.progress(filters, signal);
      },
      [filters, invalidRange],
    ),
  );
  const paths = { registro: '/entrenamiento', perfil: '/perfil', analisis: '/analisis' };
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">TU ENTRENAMIENTO, EN PERSPECTIVA</div>
          <h1>Inicio, {user?.nombre.split(' ')[0]}.</h1>
          <p>Tu punto de partida, tu rendimiento y el siguiente paso hacia tus objetivos.</p>
        </div>
        <Link className="button button-primary" to="/entrenamiento" viewTransition>
          <Icon name="plus" size={17} />
          Registrar sesión
        </Link>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>La evolución de tu entrenamiento</h2>
            <p>
              Filtra tu historial para observar la carga por ejercicio o el volumen total por fecha.
            </p>
          </div>
          <Icon name="trend" />
        </div>
        <div className="filter-bar">
          <Select
            label="Ejercicio"
            value={filters.ejercicio_id ?? ''}
            disabled={catalog.loading}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                ejercicio_id: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Todos los ejercicios</option>
            {catalog.data?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          <Input
            label="Desde"
            type="date"
            min="2000-01-01"
            value={filters.desde ?? ''}
            max={filters.hasta || today()}
            onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value || undefined }))}
          />
          <Input
            label="Hasta"
            type="date"
            min={filters.desde || '2000-01-01'}
            value={filters.hasta ?? ''}
            max={today()}
            onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value || undefined }))}
          />
          <Button variant="ghost" onClick={() => setFilters({})}>
            Limpiar filtros
          </Button>
        </div>
        {catalog.error && <ErrorState message={catalog.error} retry={catalog.reload} />}{' '}
        {invalidRange ? (
          <ErrorState message="La fecha inicial debe ser anterior o igual a la fecha final." />
        ) : progress.loading ? (
          <LoadingState />
        ) : progress.error ? (
          <ErrorState message={progress.error} retry={progress.reload} />
        ) : (
          progress.data && (
            <>
              <div className="chart-heading">
                <h3>{filters.ejercicio_id ? 'Evolución de la carga' : 'Volumen por fecha'}</h3>
                <span className="tag">{progress.data.total_sesiones} sesiones en la consulta</span>
              </div>
              <ProgressChart
                points={progress.data.puntos}
                metric={filters.ejercicio_id ? 'carga_kg' : 'volumen_kg'}
              />
            </>
          )
        )}
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Tu constancia en el gimnasio</h2>
            <p>Días con sesiones registradas en las últimas ocho semanas, incluida la actual.</p>
          </div>
          <Icon name="calendar" />
        </div>
        {history.loading ? (
          <LoadingState />
        ) : history.error ? (
          <ErrorState message={history.error} retry={history.reload} />
        ) : (
          history.data && <TrainingDaysChart sessions={history.data} />
        )}
      </section>
      {overview.loading ? (
        <LoadingState />
      ) : overview.error ? (
        <ErrorState message={overview.error} retry={overview.reload} />
      ) : (
        overview.data && (
          <>
            <section aria-label="Resumen del entrenamiento">
              <div className="section-heading">
                <span className="section-index">01</span>
                <div>
                  <h2>Tu resumen</h2>
                  <p>Los indicadores principales de tu historial.</p>
                </div>
              </div>
              <MetricsCards progress={overview.data.progreso} scope="historial" />
            </section>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="eyebrow">ANÁLISIS CORPORAL</div>
                  <h2>Tu punto de partida</h2>
                  <p>Datos personales y última medición registrada.</p>
                </div>
                <Link className="link" to="/perfil" viewTransition>
                  Actualizar mi perfil →
                </Link>
              </div>
              <div className="overview-values">
                <div>
                  <span>Peso corporal</span>
                  <strong>
                    {overview.data.progreso.ultima_medicion
                      ? `${number(overview.data.progreso.ultima_medicion.peso_kg, 1)} kg`
                      : 'Sin medición'}
                  </strong>
                </div>
                <div>
                  <span>Talla</span>
                  <strong>
                    {user?.talla_m ? `${number(user.talla_m, 2)} m` : 'Sin completar'}
                  </strong>
                </div>
                <div>
                  <span>IMC orientativo</span>
                  <strong>
                    {overview.data.progreso.ultima_medicion?.imc != null
                      ? number(overview.data.progreso.ultima_medicion.imc, 1)
                      : 'Sin calcular'}
                  </strong>
                </div>
                <div>
                  <span>Mi objetivo</span>
                  <strong>{user?.objetivo ?? 'Sin completar'}</strong>
                </div>
              </div>
              <p className="muted">
                El IMC es una referencia general, no una evaluación completa de tu estado físico.
                Interpreta tus mediciones junto con tu entrenador.
              </p>
            </section>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="eyebrow">ANÁLISIS ESTADÍSTICO</div>
                  <h2>Rendimiento por ejercicio</h2>
                  <p>Compara el mismo ejercicio desde tu primera sesión hasta la más reciente.</p>
                </div>
              </div>
              {overview.data.rendimiento.length ? (
                <div className="table-wrap mobile-cards">
                  <table>
                    <caption className="sr-only">Evolución de las cargas por ejercicio</caption>
                    <thead>
                      <tr>
                        <th>Ejercicio</th>
                        <th>Sesiones</th>
                        <th>Primera carga</th>
                        <th>Última carga</th>
                        <th>Mejor carga</th>
                        <th>Variación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.data.rendimiento.map((e) => (
                        <tr key={e.ejercicio_id}>
                          <td>
                            <strong>{e.nombre}</strong>
                          </td>
                          <td data-label="Sesiones">{e.sesiones}</td>
                          <td data-label="Primera carga">
                            {e.primera_carga_kg !== null
                              ? `${number(e.primera_carga_kg, 1)} kg`
                              : '—'}
                          </td>
                          <td data-label="Última carga">
                            {e.ultima_carga_kg !== null
                              ? `${number(e.ultima_carga_kg, 1)} kg`
                              : '—'}
                          </td>
                          <td data-label="Mejor carga">
                            {e.mejor_carga_kg !== null ? `${number(e.mejor_carga_kg, 1)} kg` : '—'}
                          </td>
                          <td
                            data-label="Variación"
                            className={
                              e.variacion_porcentaje !== null && e.variacion_porcentaje > 0
                                ? 'positive'
                                : ''
                            }
                          >
                            {e.variacion_porcentaje !== null
                              ? `${e.variacion_porcentaje > 0 ? '+' : ''}${number(e.variacion_porcentaje, 1)} %`
                              : 'Sin referencia'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Aún no hay rendimiento registrado">
                  Guarda una sesión para iniciar la comparación por ejercicio.
                </EmptyState>
              )}
              <p className="chart-summary">
                Cada carga corresponde al máximo de la sesión de ese ejercicio. La variación compara
                la última carga con la primera; revisa también series y repeticiones antes de
                interpretar el cambio.
              </p>
            </section>
          </>
        )
      )}
      {overview.data && (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">METAS Y MODELO PREDICTIVO</div>
                <h2>Tu próximo objetivo</h2>
                <p>Avance registrado y última proyección solicitada.</p>
              </div>
              <Link to="/analisis" className="link" viewTransition>
                Revisar análisis →
              </Link>
            </div>
            {overview.data.metas.length ? (
              <div className="goals-grid">
                {overview.data.metas.map((g) => (
                  <article key={g.id} className="goal-card">
                    <div className="chart-heading">
                      <strong>{g.ejercicio_nombre}</strong>
                      <span className="tag">
                        {g.estado === 'alcanzada' ? 'Alcanzada' : 'En seguimiento'}
                      </span>
                    </div>
                    <p className="goal-target">
                      {number(g.carga_objetivo_kg, 1)} <span>kg de carga objetivo</span>
                    </p>
                    {g.avance_porcentaje !== null ? (
                      <>
                        <progress
                          max={100}
                          value={Math.max(0, Math.min(100, g.avance_porcentaje))}
                          aria-label={`Avance hacia la meta de ${g.ejercicio_nombre}`}
                        />
                        <small>
                          {number(g.avance_porcentaje, 1)} % de la carga objetivo · última carga{' '}
                          {number(g.ultima_carga_kg ?? 0, 1)} kg
                        </small>
                      </>
                    ) : (
                      <p className="muted">
                        Registra este ejercicio para ver tu referencia de avance.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Define tu primera meta">
                En Análisis IA puedes guardar una referencia de carga acordada con tu entrenador.
              </EmptyState>
            )}
            <div className="notice">
              {overview.data.ultimo_analisis ? (
                <>
                  <strong>
                    Último análisis · {overview.data.ultimo_analisis.ejercicio_nombre} ·{' '}
                    {overview.data.ultimo_analisis.fecha.slice(0, 10)} ·{' '}
                  </strong>
                  {overview.data.ultimo_analisis.resultado.mensaje}
                  {overview.data.ultimo_analisis.resultado.semanas_hasta_meta !== null && (
                    <>
                      {' '}
                      Tiempo estimado:{' '}
                      {number(overview.data.ultimo_analisis.resultado.semanas_hasta_meta, 1)}{' '}
                      semanas.
                    </>
                  )}
                </>
              ) : (
                <>
                  Todavía no has solicitado un análisis. Cuando tengas al menos cuatro semanas
                  observadas, podrás consultar una tendencia por ejercicio. La plataforma ejecuta el
                  modelo únicamente al pulsar el botón de análisis.
                </>
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">RECOMENDACIONES PARA TU SEGUIMIENTO</div>
                <h2>Un siguiente paso con sentido</h2>
                <p>Sugerencias vinculadas a tu objetivo y a los datos disponibles.</p>
              </div>
            </div>
            <div className="recommendation-list">
              {overview.data.recomendaciones.map((r, i) => (
                <article key={`${r.titulo}-${i}`}>
                  <span className="section-index">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{r.titulo}</h3>
                    <p>{r.mensaje}</p>
                    <span className="tag">
                      {r.origen === 'modelo'
                        ? 'Resultado del modelo'
                        : 'Sugerencia por reglas de seguimiento'}
                    </span>{' '}
                    <Link className="link" to={paths[r.accion]} viewTransition>
                      {r.accion === 'registro'
                        ? 'Registrar sesión'
                        : r.accion === 'perfil'
                          ? 'Revisar perfil'
                          : 'Consultar análisis'}{' '}
                      →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Sesiones recientes</h2>
            <p>Tu historial más reciente.</p>
          </div>
          <Link className="link" to="/entrenamiento" viewTransition>
            Ver historial →
          </Link>
        </div>
        {history.loading ? (
          <LoadingState />
        ) : history.error ? (
          <ErrorState message={history.error} retry={history.reload} />
        ) : (
          history.data && (
            <SessionTable sessions={history.data.slice(0, 5)} exercises={catalog.data ?? []} />
          )
        )}
      </section>
    </div>
  );
}
