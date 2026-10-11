import { useMemo } from 'react';
import type { ProgressPoint } from '../../types';
import { useChart } from '../../hooks/useChart';
import { dateLabel, number } from '../../lib/format';
import { EmptyState } from '../../components/Feedback';
import type { ChartConfiguration } from 'chart.js';
export default function ProgressChart({
  points,
  metric = 'volumen_kg',
}: {
  points: ProgressPoint[];
  metric?: 'volumen_kg' | 'carga_kg';
}) {
  const config = useMemo<ChartConfiguration<'line'>>(
    () => ({
      type: 'line',
      data: {
        labels: points.map((p) => dateLabel(p.fecha)),
        datasets: [
          {
            label: metric === 'volumen_kg' ? 'Volumen (kg)' : 'Carga (kg)',
            data: points.map((p) => p[metric]),
            borderColor: '#759d47',
            backgroundColor: '#d4edaf55',
            fill: true,
            tension: 0.25,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            callbacks: { label: (ctx) => `${number(Number(ctx.raw), 1)} kg` },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#929c89', font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: '#edf1e8' },
            ticks: { color: '#929c89', font: { size: 10 }, maxTicksLimit: 6 },
          },
        },
      },
    }),
    [points, metric],
  );
  const ref = useChart(config);
  if (!points.length)
    return (
      <EmptyState title="Tu progreso empieza aquí">
        Registra una sesión o cambia los filtros para ver tus datos.
      </EmptyState>
    );
  return (
    <figure style={{ margin: 0 }}>
      <div className="chart-container">
        <canvas
          ref={ref}
          role="img"
          aria-label={`${metric === 'volumen_kg' ? 'Volumen' : 'Carga'} de entrenamiento en ${points.length} registros temporales`}
        />
      </div>
      <figcaption className="chart-summary">
        {points.length} puntos de tu historial. Último valor: {number(points.at(-1)![metric], 1)}{' '}
        kg. Los períodos sin registros no representan entrenamientos con carga cero.
      </figcaption>
      <details className="chart-values">
        <summary>Ver valores del gráfico</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">{metric === 'volumen_kg' ? 'Volumen' : 'Carga'} (kg)</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={`${p.fecha}-${i}`}>
                  <td>{p.fecha}</td>
                  <td>{number(p[metric], 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
