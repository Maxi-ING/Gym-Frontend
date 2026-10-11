import type { Exercise, TrainingSession } from '../../types';
import { dateLabel, number } from '../../lib/format';
import Icon from '../../components/Icon';
import { EmptyState } from '../../components/Feedback';
export default function SessionTable({
  sessions,
  exercises,
}: {
  sessions: TrainingSession[];
  exercises: Exercise[];
}) {
  if (!sessions.length)
    return (
      <EmptyState title="Aquí comienza tu historial">
        Registra tu primera sesión para ver tus entrenamientos.
      </EmptyState>
    );
  const sorted = [...sessions].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Historial de sesiones de entrenamiento</caption>
        <thead>
          <tr>
            <th scope="col">Entrenamiento</th>
            <th scope="col">Fecha</th>
            <th scope="col">Registros</th>
            <th scope="col">Volumen total</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="session-name">
                  <span className="session-symbol">
                    <Icon name="training" size={17} />
                  </span>
                  <div>
                    <strong>
                      {s.registros
                        .map(
                          (r) =>
                            exercises.find((e) => e.id === r.ejercicio_id)?.nombre ?? 'Ejercicio',
                        )
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(' · ')}
                    </strong>
                    <small>Sesión registrada</small>
                  </div>
                </div>
              </td>
              <td>{dateLabel(s.fecha)}</td>
              <td>{s.registros.length}</td>
              <td className="table-value">{number(s.volumen_kg)} kg</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
