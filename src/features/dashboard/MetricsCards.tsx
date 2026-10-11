import type { Progress } from '../../types';
import { number } from '../../lib/format';
import Icon, { type IconName } from '../../components/Icon';
export default function MetricsCards({
  progress,
  scope = 'filtro',
}: {
  progress: Progress;
  scope?: 'historial' | 'filtro';
}) {
  const metrics: { label: string; value: string; unit: string; note: string; icon: IconName }[] = [
    {
      label: 'Sesiones registradas',
      value: number(progress.total_sesiones),
      unit: '',
      note: scope === 'historial' ? 'En todo tu historial' : 'En el período seleccionado',
      icon: 'calendar',
    },
    {
      label: 'Volumen de entrenamiento',
      value: number(progress.volumen_total_kg),
      unit: 'kg',
      note: 'Series × repeticiones × carga',
      icon: 'training',
    },
    {
      label: 'Carga máxima registrada',
      value: progress.carga_maxima_kg !== null ? number(progress.carga_maxima_kg, 1) : '—',
      unit: 'kg',
      note: scope === 'historial' ? 'En todos tus registros' : 'En los registros seleccionados',
      icon: 'trend',
    },
    {
      label: 'Último peso corporal',
      value: progress.ultima_medicion ? number(progress.ultima_medicion.peso_kg, 1) : '—',
      unit: 'kg',
      note: 'Última medición de tu perfil',
      icon: 'weight',
    },
  ];
  return (
    <div className="metrics">
      {metrics.map((m, i) => (
        <article className={`panel metric ${i === 1 ? 'metric-highlight' : ''}`} key={m.label}>
          <div className="metric-top">
            <span>{m.label}</span>
            <span className="metric-icon">
              <Icon name={m.icon} size={17} />
            </span>
          </div>
          <div className="metric-value">
            {m.value}
            <span>{m.unit}</span>
          </div>
          <p className="metric-note">{m.note}</p>
        </article>
      ))}
    </div>
  );
}
