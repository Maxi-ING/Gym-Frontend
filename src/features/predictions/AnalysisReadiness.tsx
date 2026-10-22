import { Link } from 'react-router-dom';
import type { ComparableGroup } from '../../types';
import { dateLabel } from '../../lib/format';

export default function AnalysisReadiness({
  group,
  minimum,
  demo,
}: {
  group?: ComparableGroup;
  minimum: number;
  demo: boolean;
}) {
  const weeks = group?.semanas ?? 0;
  const missing = Math.max(0, minimum - weeks);
  return (
    <div className="analysis-readiness" role="status">
      <div className="analysis-readiness-heading">
        <strong>
          {demo ? 'Historial fijo del ejemplo' : `${weeks} semanas comparables disponibles`}
        </strong>
        <span>Mínimo: {minimum} semanas</span>
      </div>
      <div className="analysis-readiness-track" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (weeks / minimum) * 100)}%` }} />
      </div>
      {demo ? (
        <p>
          Solo Press de banca a 8 repeticiones. Este ejemplo no cambia al añadir sesiones o metas.
        </p>
      ) : missing > 0 ? (
        <p>
          Faltan {missing} semanas con registros de este ejercicio a las mismas repeticiones. Varias
          sesiones dentro de una semana cuentan como una sola semana.
          {weeks > 0 && ' Puedes ver tu historial mientras reúnes más información.'}
        </p>
      ) : (
        <p>
          Hay semanas suficientes para intentar la estimación. El modelo comprobará también la
          tendencia, el error y la actualidad de los datos.
        </p>
      )}
      {!demo && group && (
        <small>
          {group.registros} registros · Último: {dateLabel(group.ultima_fecha)}
        </small>
      )}
      {!demo && missing > 0 && <Link to="/entrenamiento">Registrar un entrenamiento →</Link>}
    </div>
  );
}
