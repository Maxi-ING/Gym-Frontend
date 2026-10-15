import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import type { Prediction } from '../../types';
import { usePreferences } from '../settings/PreferencesProvider';
import { useChart } from '../../hooks/useChart';
import { number } from '../../lib/format';
import { EmptyState } from '../../components/Feedback';
import { goalReference, loadChanges } from './predictionVisuals';

function ChangesChart({
  history,
  repetitions,
}: {
  history: Prediction['historial'];
  repetitions?: number | null;
}) {
  const { dark, reducedMotion } = usePreferences();
  const changes = useMemo(() => loadChanges(history), [history]);
  const config = useMemo<ChartConfiguration<'bar'>>(
    () => ({
      type: 'bar',
      data: {
        labels: changes.map((point) => `Semana ${point.semana + 1}`),
        datasets: [
          {
            label: 'Cambio de carga',
            data: changes.map((point) => point.cambio_kg),
            backgroundColor: changes.map((point) =>
              point.cambio_kg >= 0 ? (dark ? '#deded9' : '#343430') : dark ? '#8c8c88' : '#73736e',
            ),
            borderRadius: 3,
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation:
          reducedMotion || document.documentElement.dataset.input === 'keyboard'
            ? false
            : {
                duration: 450,
                easing: 'easeOutQuart',
                delay: (context) =>
                  context.type === 'data' ? Math.min(context.dataIndex * 35, 180) : 0,
              },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (item) =>
                `${Number(item.parsed.y) > 0 ? '+' : ''}${number(Number(item.parsed.y), 1)} kg`,
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            grid: { display: false },
            border: { display: false },
            ticks: {
              stepSize: 1,
              maxTicksLimit: 8,
              color: dark ? '#b5b5b2' : '#62625f',
            },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: dark ? '#383838' : '#d6d6d0' },
            ticks: { color: dark ? '#b5b5b2' : '#62625f', maxTicksLimit: 5 },
            title: { display: true, text: 'Cambio (kg)', color: dark ? '#b5b5b2' : '#62625f' },
          },
        },
      },
    }),
    [changes, dark, reducedMotion],
  );
  const ref = useChart(config);
  if (!changes.length)
    return (
      <EmptyState title="Aún no hay comparación">
        Necesitas dos semanas con registros para observar un cambio.
      </EmptyState>
    );
  return (
    <figure className="prediction-change-figure">
      <div className="chart-container">
        <canvas ref={ref} role="img" aria-label="Cambios de carga entre semanas observadas" />
      </div>
      <figcaption className="chart-summary">
        Arriba de cero: subió la carga. Abajo: bajó.{' '}
        {repetitions != null
          ? `Se comparan registros de ${repetitions} repeticiones.`
          : 'Este análisis anterior no incluye el criterio de repeticiones.'}
      </figcaption>
      <details className="chart-values">
        <summary>Ver cambios registrados</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Semana</th>
                <th scope="col">Cambio (kg)</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((point) => (
                <tr key={point.semana}>
                  <td>{point.semana + 1}</td>
                  <td>
                    {point.cambio_kg > 0 ? '+' : ''}
                    {number(point.cambio_kg, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

export default function PredictionDetails({
  result,
  target,
}: {
  result: Prediction;
  target?: number;
}) {
  const reference = goalReference(result.historial, target);
  return (
    <div className="prediction-secondary-charts">
      <section className="prediction-detail-chart" aria-labelledby="load-changes-title">
        <h3 id="load-changes-title">Tus cambios de carga</h3>
        <ChangesChart history={result.historial} repetitions={result.repeticiones_analizadas} />
      </section>
      <section
        className="prediction-detail-chart prediction-goal-chart"
        aria-labelledby="load-goal-title"
      >
        <h3 id="load-goal-title">Tu referencia de meta</h3>
        {reference ? (
          <figure>
            <div className="goal-reference-values">
              <div>
                <span>Última carga</span>
                <strong>
                  {number(reference.current, 1)} <small>kg</small>
                </strong>
              </div>
              <div>
                <span>Meta</span>
                <strong>
                  {number(reference.target, 1)} <small>kg</small>
                </strong>
              </div>
            </div>
            <progress
              max={100}
              value={reference.percentage}
              aria-label="Última carga respecto a la meta"
            />
            <p className="goal-reference-percent">
              {number(reference.percentage, 1)} % de la carga objetivo
            </p>
            <figcaption className="chart-summary">
              {reference.remaining > 0
                ? `Faltan ${number(reference.remaining, 1)} kg respecto a la última carga registrada.`
                : 'La última carga registrada alcanza esta referencia.'}{' '}
              Esta barra compara cargas; no mide el recorrido desde tu punto inicial.
            </figcaption>
          </figure>
        ) : (
          <EmptyState title="Elige una meta">
            Selecciona una meta de este ejercicio para comparar tu última carga con el objetivo.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
