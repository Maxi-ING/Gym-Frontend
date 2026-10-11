import { useCallback, useState, type FormEvent } from 'react';
import { recordService } from '../records/recordService';
import { predictionService } from './predictionService';
import { predictionAdvice } from './predictionAdvice';
import PredictionChart from './PredictionChart';
import { useResource } from '../../hooks/useResource';
import { errorMessage } from '../../lib/api';
import { number } from '../../lib/format';
import { useAuth } from '../users/AuthProvider';
import { limits, validRange } from '../../lib/validation';
import type { Prediction } from '../../types';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
export default function PredictionPage() {
  const { demo } = useAuth();
  const [exercise, setExercise] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<Prediction>();
  const [busy, setBusy] = useState(false);
  const [goalBusy, setGoalBusy] = useState(false);
  const [error, setError] = useState('');
  const [goalError, setGoalError] = useState('');
  const [goalMessage, setGoalMessage] = useState('');
  const catalog = useResource(
    useCallback(async (signal: AbortSignal) => {
      const [exercises, goals] = await Promise.all([
        recordService.exercises(signal),
        predictionService.goals(signal),
      ]);
      return { exercises, goals };
    }, []),
  );
  async function analyze(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResult(undefined);
    setBusy(true);
    try {
      setResult(
        await predictionService.predict({
          ejercicio_id: Number(exercise),
          ...(goal ? { meta_id: Number(goal) } : {}),
        }),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function saveGoal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = { ejercicio_id: Number(exercise), carga_objetivo_kg: Number(form.get('target')) };
    setGoalError('');
    setGoalMessage('');
    if (
      !input.ejercicio_id ||
      !validRange(input.carga_objetivo_kg, { ...limits.carga, min: 0.1 })
    ) {
      setGoalError('Selecciona un ejercicio y una carga objetivo entre 0.1 y 600 kg.');
      return;
    }
    setGoalBusy(true);
    try {
      const created = await predictionService.createGoal(input);
      setGoal(String(created.id));
      setResult(undefined);
      setGoalMessage('Meta guardada. Puedes seleccionarla para el análisis.');
      catalog.reload();
    } catch (e) {
      setGoalError(errorMessage(e));
    } finally {
      setGoalBusy(false);
    }
  }
  const selectedGoals =
    catalog.data?.goals.filter((g) => g.ejercicio_id === Number(exercise)) ?? [];
  const advice = result ? predictionAdvice(result) : null;
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">COMPRENDE TU TENDENCIA</div>
          <h1>Análisis de tu progreso</h1>
          <p>
            Primero elige una referencia. Después revisa el gráfico y la explicación de tu avance.
          </p>
        </div>
        <span className="tag">
          <Icon name="spark" size={13} />
          Análisis a solicitud
        </span>
      </div>
      {catalog.loading ? (
        <LoadingState />
      ) : catalog.error ? (
        <ErrorState message={catalog.error} retry={catalog.reload} />
      ) : (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>1. Analizar progreso</h2>
                <p>Necesitas al menos cuatro semanas observadas del mismo ejercicio.</p>
              </div>
            </div>
            <form onSubmit={analyze} className="form-stack">
              <fieldset disabled={busy || goalBusy} className="form-grid">
                <Select
                  label="Ejercicio para analizar"
                  value={exercise}
                  required
                  onChange={(e) => {
                    setExercise(e.target.value);
                    setGoal('');
                    setResult(undefined);
                    setError('');
                    setGoalMessage('');
                    setGoalError('');
                  }}
                >
                  <option value="" disabled>
                    Selecciona un ejercicio
                  </option>
                  {catalog.data?.exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Meta del análisis"
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    setResult(undefined);
                    setError('');
                  }}
                >
                  <option value="">Solo consultar tendencia</option>
                  {selectedGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {number(g.carga_objetivo_kg, 1)} kg · {g.estado}
                    </option>
                  ))}
                </Select>
              </fieldset>
              <div className="form-actions">
                <Button type="submit" loading={busy} disabled={!exercise || goalBusy}>
                  <Icon name="spark" size={17} />
                  Analizar mi progreso
                </Button>
              </div>
            </form>
            {error && <ErrorState message={error} />}{' '}
            {demo && (
              <div className="notice">
                La demo muestra un análisis fijo de Press de banca con una meta de ejemplo de 50 kg.
                No recalcula predicciones al agregar sesiones o metas; los demás ejercicios muestran
                un estado informativo.
              </div>
            )}
          </section>
          <section className="panel">
            {busy ? (
              <LoadingState />
            ) : !result ? (
              <EmptyState title="Tus datos tienen una historia">
                Elige un ejercicio y pulsa Analizar mi progreso. La proyección aparecerá aquí.
              </EmptyState>
            ) : (
              <>
                <div className="panel-header">
                  <div>
                    <h2>
                      {result.estado === 'estimado'
                        ? 'Tu tendencia de carga'
                        : 'Resultado del análisis'}
                    </h2>
                    <p>
                      {catalog.data?.exercises.find((e) => e.id === Number(exercise))?.nombre} ·{' '}
                      {result.semanas_observadas} semanas observadas.
                    </p>
                  </div>
                  <span className="tag">
                    {demo ? 'Ejemplo ilustrativo' : 'Análisis del historial'}
                  </span>
                </div>
                {result.estado === 'estimado' && <PredictionChart result={result} />}
                <p className="prediction-message" role="status">
                  {result.mensaje}
                </p>
                {result.estado === 'estimado' && (
                  <>
                    <div className="prediction-stats" style={{ margin: '22px 0' }}>
                      <div className="prediction-stat">
                        Tendencia semanal
                        <strong>
                          {result.pendiente_kg_semana !== null
                            ? `${number(result.pendiente_kg_semana, 1)} kg`
                            : '—'}
                        </strong>
                      </div>
                      <div className="prediction-stat">
                        Siguiente estimación
                        <strong>
                          {result.siguiente_carga_kg !== null
                            ? `${number(result.siguiente_carga_kg, 1)} kg`
                            : '—'}
                        </strong>
                      </div>
                      <div className="prediction-stat">
                        Tiempo hasta la meta
                        <strong>
                          {result.semanas_hasta_meta !== null
                            ? `${number(result.semanas_hasta_meta, 1)} sem.`
                            : 'Sin meta'}
                        </strong>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </section>
          {advice && (
            <section className="panel prediction-explainer">
              <div className="eyebrow">2. CÓMO VAS Y QUÉ PUEDES HACER</div>
              <h2>{advice.titulo}</h2>
              <div className="advice-copy">
                {advice.parrafos.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <span className="tag">Interpretación del resultado · no ejecuta otro modelo</span>
            </section>
          )}
          <details className="panel disclosure">
            <summary>3. Definir o revisar una meta</summary>
            <p className="section-description">
              Selecciona arriba el ejercicio y define una carga objetivo acordada con tu entrenador.
            </p>
            <form onSubmit={saveGoal} className="form-stack">
              <fieldset disabled={goalBusy || busy || !exercise} className="form-grid">
                <Input
                  label="Carga objetivo (kg)"
                  name="target"
                  type="number"
                  min={0.1}
                  max={600}
                  step={0.1}
                  placeholder="50"
                  required
                  hint="De 0.1 a 600 kg · una decimal"
                />
              </fieldset>
              <div className="form-actions">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={goalBusy}
                  disabled={!exercise || busy}
                >
                  Guardar meta
                </Button>
              </div>
            </form>
            {goalError && <ErrorState message={goalError} />}{' '}
            {goalMessage && (
              <div className="feedback feedback-success inline-status" role="status">
                {goalMessage}
              </div>
            )}
            {selectedGoals.length > 0 && (
              <ul className="goal-list">
                {selectedGoals.map((g) => (
                  <li key={g.id}>
                    <div>
                      <strong>{number(g.carga_objetivo_kg, 1)} kg</strong>
                      <small>
                        {g.estado === 'alcanzada' ? 'Meta alcanzada' : 'Meta pendiente'}
                      </small>
                    </div>
                    <Button
                      variant="ghost"
                      disabled={busy || goalBusy}
                      onClick={() => {
                        setGoal(String(g.id));
                        setResult(undefined);
                        setError('');
                      }}
                    >
                      Usar esta meta
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </details>
          <details className="panel disclosure prediction-explainer">
            <summary>Cómo interpretar el análisis</summary>
            <div className="advice-copy">
              <p>
                El modelo utiliza la carga máxima semanal del mismo ejercicio. La línea continua
                muestra los registros y la línea discontinua representa una estimación. Las semanas
                sin registros mantienen su separación temporal.
              </p>
              <p>
                Si hay historial suficiente y una tendencia positiva, puede estimarse el tiempo para
                una meta. Si faltan datos, la meta se alcanzó o la tendencia no es positiva, la
                plataforma explica ese estado sin prometer una fecha de logro.
              </p>
              <p>
                La carga siguiente es un valor de la proyección; no indica cuánto debes levantar. El
                resultado no sustituye la evaluación del entrenador ni conoce la técnica, el
                descanso o toda la planificación.
              </p>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
