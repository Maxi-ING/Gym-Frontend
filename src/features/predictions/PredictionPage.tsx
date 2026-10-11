import { useCallback, useState, type FormEvent } from 'react';
import { recordService } from '../records/recordService';
import { predictionService } from './predictionService';
import PredictionChart from './PredictionChart';
import { useResource } from '../../hooks/useResource';
import { errorMessage } from '../../lib/api';
import { number } from '../../lib/format';
import { useAuth } from '../users/AuthProvider';
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
  async function analyze(event: FormEvent) {
    event.preventDefault();
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
  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setGoalBusy(true);
    setGoalError('');
    setGoalMessage('');
    try {
      const created = await predictionService.createGoal({
        ejercicio_id: Number(exercise),
        carga_objetivo_kg: Number(form.get('target')),
      });
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
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">COMPRENDE TU TENDENCIA</div>
          <h1>Una perspectiva de tu avance.</h1>
          <p>Selecciona un ejercicio y solicita el análisis de tu historial.</p>
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
        <div className="prediction-grid">
          <aside className="form-stack">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Analizar progreso</h2>
                  <p>Necesitas al menos cuatro semanas observadas.</p>
                </div>
              </div>
              <form onSubmit={analyze} className="form-stack">
                <fieldset disabled={busy || goalBusy} className="form-stack">
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
                      <option value={g.id} key={g.id}>
                        {number(g.carga_objetivo_kg, 1)} kg · {g.estado}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" loading={busy} disabled={!exercise} className="button-wide">
                    <Icon name="spark" size={17} />
                    Analizar mi progreso
                  </Button>
                </fieldset>
              </form>
              {error && (
                <div className="feedback feedback-error inline-status" role="alert">
                  {error}
                </div>
              )}
              {demo && (
                <div className="notice">
                  La demo muestra un análisis fijo de Press de banca (meta de ejemplo: 50 kg). No
                  recalcula predicciones al agregar sesiones o metas.
                </div>
              )}
            </section>
            <section className="panel">
              <h3>Define una meta de carga</h3>
              <p className="prediction-explainer" style={{ margin: '10px 0 18px' }}>
                Establece una referencia para el ejercicio seleccionado, acordada con tu entrenador.
              </p>
              <form onSubmit={saveGoal} className="form-stack">
                <fieldset disabled={goalBusy || busy || !exercise} className="form-stack">
                  <Input
                    label="Carga objetivo (kg)"
                    name="target"
                    type="number"
                    min={0.1}
                    max={1000}
                    step={0.1}
                    placeholder="50"
                    required
                  />
                  <Button type="submit" variant="secondary" loading={goalBusy}>
                    Guardar meta
                  </Button>
                </fieldset>
              </form>
              {goalError && (
                <div className="feedback feedback-error inline-status" role="alert">
                  {goalError}
                </div>
              )}
              {goalMessage && (
                <div className="feedback feedback-success inline-status" role="status">
                  {goalMessage}
                </div>
              )}
            </section>
          </aside>
          <div className="prediction-result">
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
                        {result.semanas_observadas} semanas observadas del ejercicio seleccionado.
                      </p>
                    </div>
                    <span className="tag">
                      {demo ? 'Ejemplo ilustrativo' : 'Análisis del historial'}
                    </span>
                  </div>
                  <p className="prediction-message" role="status">
                    {result.mensaje}
                  </p>
                  {result.estado === 'estimado' && (
                    <>
                      <div className="prediction-stats" style={{ margin: '22px 0' }}>
                        <div className="prediction-stat">
                          Tendencia semanal
                          <strong>
                            {result.pendiente_kg_semana != null
                              ? `${number(result.pendiente_kg_semana, 1)} kg`
                              : '—'}
                          </strong>
                        </div>
                        <div className="prediction-stat">
                          Siguiente estimación
                          <strong>
                            {result.siguiente_carga_kg != null
                              ? `${number(result.siguiente_carga_kg, 1)} kg`
                              : '—'}
                          </strong>
                        </div>
                        <div className="prediction-stat">
                          Tiempo hasta la meta
                          <strong>
                            {result.semanas_hasta_meta != null
                              ? `${number(result.semanas_hasta_meta, 1)} sem.`
                              : 'Sin meta'}
                          </strong>
                        </div>
                      </div>
                      <PredictionChart result={result} />
                    </>
                  )}
                </>
              )}
            </section>
            <section className="panel prediction-explainer">
              <h3>Cómo interpretar el resultado</h3>
              <p>
                El análisis usa la carga máxima semanal del mismo ejercicio. Una tendencia positiva
                puede generar una estimación; si faltan datos, la meta ya se alcanzó o la tendencia
                no es positiva, se explica el resultado sin prometer una fecha de logro.
              </p>
              <div className="notice">
                Una proyección no es una recomendación de carga ni una garantía. Revisa cualquier
                ajuste con tu entrenador.
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
