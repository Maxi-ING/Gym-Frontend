import { useMemo } from 'react';
import { usePreferences } from '../settings/PreferencesProvider';
import type { ChartConfiguration } from 'chart.js';
import type { Prediction } from '../../types';
import { useChart } from '../../hooks/useChart';
import { number } from '../../lib/format';
export default function PredictionChart({ result }: { result: Prediction }) {
  const { dark, reducedMotion } = usePreferences();
  const config = useMemo<ChartConfiguration<'line'>>(
    () => ({
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Carga registrada',
            data: result.historial.map((p) => ({ x: p.semana, y: p.carga_kg })),
            borderColor: dark ? '#deded9' : '#343430',
            backgroundColor: dark ? '#deded9' : '#343430',
            pointRadius: 4,
            borderWidth: 2,
            tension: 0,
          },
          {
            label: 'Proyección',
            data: result.proyeccion.map((p) => ({ x: p.semana, y: p.carga_kg })),
            borderColor: dark ? '#8c8c88' : '#73736e',
            backgroundColor: dark ? '#8c8c88' : '#73736e',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 4,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducedMotion ? false : { duration: 450, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Semana ${Number(items[0]?.parsed.x) + 1}`,
              label: (ctx) => `${ctx.dataset.label}: ${number(Number(ctx.parsed.y), 1)} kg`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            grid: { display: false },
            border: { display: false },
            title: {
              display: true,
              text: 'Semanas transcurridas desde el primer registro',
              color: dark ? '#b5b5b2' : '#62625f',
              font: { size: 10 },
            },
            ticks: {
              stepSize: 1,
              color: dark ? '#b5b5b2' : '#62625f',
              font: { size: 10 },
              callback: (value) => String(Number(value) + 1),
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: dark ? '#383838' : '#d6d6d0' },
            border: { display: false },
            ticks: { color: dark ? '#b5b5b2' : '#62625f', font: { size: 10 } },
            title: {
              display: true,
              text: 'Carga (kg)',
              color: dark ? '#b5b5b2' : '#62625f',
              font: { size: 10 },
            },
          },
        },
      },
    }),
    [result, dark, reducedMotion],
  );
  const ref = useChart(config);
  return (
    <figure style={{ margin: 0 }}>
      <div className="legend">
        <span>Carga registrada</span>
        <span>Proyección estimada</span>
      </div>
      <div className="chart-container" style={{ marginTop: 20 }}>
        <canvas
          ref={ref}
          role="img"
          aria-label={`Historial de ${result.semanas_observadas} semanas y proyección de carga`}
        />
      </div>
      <figcaption className="chart-summary">
        La línea discontinua representa una estimación. Las semanas sin registros conservan su
        separación temporal.
      </figcaption>
      <details className="chart-values">
        <summary>Ver valores del análisis</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Semana</th>
                <th scope="col">Carga (kg)</th>
                <th scope="col">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {result.historial.map((p, i) => (
                <tr key={`h-${i}`}>
                  <td>{p.semana + 1}</td>
                  <td>{number(p.carga_kg, 1)}</td>
                  <td>Registrada</td>
                </tr>
              ))}
              {result.proyeccion.map((p, i) => (
                <tr key={`p-${i}`}>
                  <td>{p.semana + 1}</td>
                  <td>{number(p.carga_kg, 1)}</td>
                  <td>Estimación</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
