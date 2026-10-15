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
  const names = new Map(exercises.map((exercise) => [exercise.id, exercise.nombre]));
  return (
    <div className="table-wrap history-table">
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
          {sorted.map((s) => {
            const groups = new Map<
              number,
              { name: string; records: TrainingSession['registros'] }
            >();
            for (const record of s.registros) {
              const group = groups.get(record.ejercicio_id) ?? {
                name: record.ejercicio_nombre || names.get(record.ejercicio_id) || 'Ejercicio',
                records: [],
              };
              group.records.push(record);
              groups.set(record.ejercicio_id, group);
            }
            return (
              <tr key={s.id}>
                <td>
                  <div className="session-name">
                    <span className="session-symbol">
                      <Icon name="training" size={17} />
                    </span>
                    <div>
                      <strong>{[...groups.values()].map((group) => group.name).join(' · ')}</strong>
                      <small>Sesión registrada</small>
                    </div>
                  </div>
                  <details className="session-detail">
                    <summary>Ver ejercicios ({groups.size})</summary>
                    <dl className="session-exercises">
                      {[...groups.entries()].map(([id, group]) => (
                        <div key={id}>
                          <dt>{group.name}</dt>
                          <dd>
                            <ul>
                              {group.records.map((record, index) => (
                                <li key={index}>
                                  {record.series} series × {record.repeticiones} rep. ×{' '}
                                  {number(record.carga_kg, 1)} kg{' '}
                                  <span>
                                    {number(
                                      record.series * record.repeticiones * record.carga_kg,
                                      1,
                                    )}{' '}
                                    kg de volumen
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                </td>
                <td data-label="Fecha">{dateLabel(s.fecha)}</td>
                <td data-label="Registros">{s.registros.length}</td>
                <td className="table-value" data-label="Volumen total">
                  {number(s.volumen_kg)} kg
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
