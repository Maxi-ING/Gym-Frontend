import { useCallback, useState, type FormEvent } from 'react';
import { recordService } from '../records/recordService';
import { predictionService } from './predictionService';
import { predictionAdvice } from './predictionAdvice';
import PredictionChart from './PredictionChart';
import PredictionDetails from './PredictionDetails';
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
  const [repetitions, setRepetitions] = useState('8');
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
          repeticiones: Number(repetitions),
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
    const input = {
      ejercicio_id: Number(exercise),
      carga_objetivo_kg: Number(form.get('target')),
      repeticiones_objetivo: Number(repetitions),
    };
    setGoalError('');
    setGoalMessage('');
    if (
      !input.ejercicio_id ||
      !Number.isInteger(input.repeticiones_objetivo) ||
      input.repeticiones_objetivo < 1 ||
      input.repeticiones_objetivo > 100 ||
      !validRange(input.carga_objetivo_kg, { ...limits.carga, min: 0.1 })
    ) {
      setGoalError(
        'Selecciona un ejercicio, de 1 a 100 repeticiones y una carga objetivo entre 0.1 y 600 kg.',
      );
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
  const selectedGoal = selectedGoals.find((g) => g.id === Number(goal));
  // La demo de banca devuelve siempre el ejemplo documentado de 50 kg.
  const target = demo && exercise === '1' ? 50 : selectedGoal?.carga_objetivo_kg;
  return (
    <div className="page-stack analysis-page">
      <div className="page-heading">
        <div>
          <h1>Análisis y predicción</h1>
          <p>Observa tus cargas, revisa los cambios y sigue tu meta.</p>
        </div>
        <span className="tag">
          <Icon name="trend" size={13} />
          Modelo predictivo
        </span>
      </div>
      {catalog.loading ? (
        <LoadingState />
      ) : catalog.error ? (
        <ErrorState message={catalog.error} retry={catalog.reload} />
      ) : (
        <>
          <section className="panel analysis-controls">
            <div className="panel-header">
              <div>
                <h2>Selecciona tu ejercicio</h2>
                <p>
                  Compara el mismo ejercicio y las mismas repeticiones, con al menos cuatro semanas
                  registradas.
                </p>
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
                    setRepetitions('8');
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
                    const chosen = selectedGoals.find((item) => item.id === Number(e.target.value));
                    if (chosen?.repeticiones_objetivo != null)
                      setRepetitions(String(chosen.repeticiones_objetivo));
                    setResult(undefined);
                    setError('');
                  }}
                >
                  <option value="">Solo consultar tendencia</option>
                  {selectedGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {number(g.carga_objetivo_kg, 1)} kg ·{' '}
                      {g.repeticiones_objetivo ? `${g.repeticiones_objetivo} rep. · ` : ''}
                      {g.estado}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Repeticiones comparadas"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  required
                  value={repetitions}
                  disabled={selectedGoal?.repeticiones_objetivo != null}
                  onChange={(e) => {
                    setRepetitions(e.target.value);
                    setResult(undefined);
                    setError('');
                  }}
                  hint={
                    selectedGoal?.repeticiones_objetivo
                      ? 'Fijadas por la meta seleccionada.'
                      : 'Solo se analizan registros con este número de repeticiones.'
                  }
                />
              </fieldset>
              <div className="form-actions">
                <Button type="submit" loading={busy} disabled={!exercise || goalBusy}>
                  <Icon name="trend" size={17} />
                  Analizar mi progreso
                </Button>
              </div>
            </form>
            {error && <ErrorState message={error} />}{' '}
            {demo && (
              <div className="notice">
                La demo muestra un análisis fijo de Press de banca a 8 repeticiones con una meta de
                ejemplo de 50 kg. No recalcula predicciones al agregar sesiones o metas; los demás
                ejercicios muestran un estado informativo.
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
                      {result.repeticiones_analizadas != null &&
                        ` Comparación a ${result.repeticiones_analizadas} repeticiones.`}
                    </p>
                  </div>
                  <span className="tag">
                    {demo ? 'Ejemplo ilustrativo' : 'Análisis del historial'}
                  </span>
                </div>
                {result.historial.length > 0 && (
                  <>
                    <PredictionChart result={result} target={target} />
                    <PredictionDetails result={result} target={target} />
                  </>
                )}
                <p className="prediction-message" role="status">
                  {result.mensaje}
                </p>
                {result.error_mae_kg != null && (
                  <details className="analysis-advice-details">
                    <summary>
                      {demo
                        ? 'Validación ilustrativa del ejemplo'
                        : 'Cómo se comprobó esta estimación'}
                    </summary>
                    <p>
                      Se predijeron semanas posteriores usando solo registros anteriores. Error
                      absoluto medio: {number(result.error_mae_kg, 2)} kg en{' '}
                      {result.validaciones_temporales ?? 0} comprobaciones. La referencia de repetir
                      la última carga tuvo un error de {number(result.error_referencia_kg ?? 0, 2)}{' '}
                      kg. Esto describe las pruebas del historial; no es una garantía de resultados
                      futuros.
                    </p>
                  </details>
                )}
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
                            : goal
                              ? 'No estimable'
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
              <h2>{advice.titulo}</h2>
              <div className="advice-copy">
                <p>{advice.parrafos[0]}</p>
              </div>
              <details className="analysis-advice-details">
                <summary>Ver explicación y siguientes pasos</summary>
                <div className="advice-copy">
                  {advice.parrafos.slice(1).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
              <span className="tag">Mensajes mediante reglas</span>
            </section>
          )}
          <details className="panel disclosure">
            <summary>Definir o revisar una meta</summary>
            <p className="section-description">
              Selecciona arriba el ejercicio y define una carga objetivo acordada con tu entrenador.{' '}
              La nueva meta se guardará para {repetitions || '—'} repeticiones.
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
                      <strong>
                        {number(g.carga_objetivo_kg, 1)} kg
                        {g.repeticiones_objetivo ? ` · ${g.repeticiones_objetivo} rep.` : ''}
                      </strong>
                      <small>
                        {g.estado === 'alcanzada' ? 'Meta alcanzada' : 'Meta pendiente'}
                      </small>
                      {g.repeticiones_objetivo == null && (
                        <small>
                          Meta anterior sin repeticiones fijadas; el análisis usa las que elijas
                          arriba.
                        </small>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      disabled={busy || goalBusy}
                      onClick={() => {
                        setGoal(String(g.id));
                        if (g.repeticiones_objetivo != null)
                          setRepetitions(String(g.repeticiones_objetivo));
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
                El modelo utiliza la carga máxima semanal del mismo ejercicio con las mismas
                repeticiones. La línea continua muestra los registros y la línea discontinua
                representa una estimación. Las semanas sin registros mantienen su separación
                temporal.
              </p>
              <p>
                Si hay historial suficiente y una tendencia positiva, puede estimarse el tiempo para
                una meta. Si faltan datos, la meta se alcanzó o la tendencia no es positiva, la
                plataforma explica ese estado sin prometer una fecha de logro. También rechaza
                ajustes con demasiado error, intervalos mayores de cuatro semanas sin registros
                comparables, datos sin actualizar por más de cuatro semanas, plazos mayores de doce
                semanas o proyecciones fuera de 0–600 kg. Son criterios operativos del proyecto, no
                límites médicos.
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
