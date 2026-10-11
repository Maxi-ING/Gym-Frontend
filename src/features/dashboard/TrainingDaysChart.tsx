import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import { useChart } from '../../hooks/useChart';
import { dateLabel, today } from '../../lib/format';
import type { TrainingSession } from '../../types';
import { usePreferences } from '../settings/PreferencesProvider';
import { trainingActivity } from './trainingActivity';

export default function TrainingDaysChart({ sessions }: { sessions: TrainingSession[] }) {
  const { dark, reducedMotion } = usePreferences();
  const asOf = today();
  const weeks = useMemo(() => trainingActivity(sessions, asOf), [sessions, asOf]);
  const total = weeks.reduce((sum, week) => sum + week.dias, 0);
  const config = useMemo<ChartConfiguration<'bar'>>(
    () => ({
      type: 'bar',
      data: {
        labels: weeks.map((week) => dateLabel(week.inicio)),
        datasets: [
          {
            label: 'Días con entrenamiento registrado',
            data: weeks.map((week) => week.dias),
            backgroundColor: dark ? '#8aaad0' : '#365f8d',
            borderRadius: 4,
            maxBarThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion ? false : { duration: 850, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                const week = weeks[items[0]?.dataIndex ?? 0];
                return `${dateLabel(week.inicio)} – ${dateLabel(week.fin)}`;
              },
              label: (item) => `${Number(item.raw)} días registrados`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: dark ? '#abb5c2' : '#616b76',
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 4,
            },
          },
          y: {
            beginAtZero: true,
            max: 7,
            ticks: { stepSize: 1, color: dark ? '#abb5c2' : '#616b76' },
            grid: { color: dark ? '#354151' : '#d7dbdf' },
          },
        },
      },
    }),
    [weeks, dark, reducedMotion],
  );
  const ref = useChart(config);
  return (
    <figure style={{ margin: 0 }}>
      <div className="chart-heading">
        <h3>Días por semana</h3>
        <span className="tag">{total} días registrados · 8 semanas</span>
      </div>
      <div className="chart-container">
        <canvas
          ref={ref}
          role="img"
          aria-label={`Días con entrenamiento registrado por semana: ${total} días en las últimas ocho semanas`}
        />
      </div>
      <figcaption className="chart-summary">
        Un día por fecha registrada, aunque haya varias sesiones. Semana actual hasta hoy.
      </figcaption>
      <details className="chart-values">
        <summary>Ver días registrados por semana</summary>
        <p className="chart-summary">
          Semanas de lunes a domingo. Cero indica falta de registros, no confirma un día de
          descanso.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Desde</th>
                <th scope="col">Hasta</th>
                <th scope="col">Días registrados</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.inicio}>
                  <td>{week.inicio}</td>
                  <td>{week.fin}</td>
                  <td>{week.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
