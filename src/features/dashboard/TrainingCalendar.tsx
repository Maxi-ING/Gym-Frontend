import { useMemo, useState } from 'react';
import type { TrainingSession } from '../../types';
import { today, number } from '../../lib/format';
import Icon from '../../components/Icon';
import { trainingCalendar, shiftMonth } from './trainingCalendar';

export default function TrainingCalendar({ sessions }: { sessions: TrainingSession[] }) {
  const asOf = today();
  const [month, setMonth] = useState(asOf.slice(0, 7));
  const [selected, setSelected] = useState(asOf);
  const days = useMemo(() => trainingCalendar(sessions, month, asOf), [sessions, month, asOf]);
  const total = days.filter((day) => day.delMes && day.sesiones > 0).length;
  const title = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`));
  const dateLabel = (date: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T12:00:00Z`));
  const selectedSessions = sessions.filter(
    (session) => session.fecha === selected && session.fecha <= asOf,
  );
  function navigate(step: number) {
    const next = shiftMonth(month, step);
    setMonth(next);
    setSelected(next === asOf.slice(0, 7) ? asOf : `${next}-01`);
  }
  return (
    <div className="training-calendar">
      <div className="calendar-heading">
        <h3 id="training-calendar-month" aria-live="polite">
          {title}
        </h3>
        <div className="calendar-navigation">
          <button
            className="icon-button"
            aria-label="Mes anterior"
            disabled={month <= '2000-01'}
            onClick={() => navigate(-1)}
          >
            <span className="calendar-previous">
              <Icon name="chevron" size={16} />
            </span>
          </button>
          <button
            className="icon-button"
            aria-label="Mes siguiente"
            disabled={month >= asOf.slice(0, 7)}
            onClick={() => navigate(1)}
          >
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </div>
      <table className="calendar-table" aria-labelledby="training-calendar-month">
        <thead>
          <tr>
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
              (day) => (
                <th key={day} scope="col">
                  <abbr title={day}>{day === 'Miércoles' ? 'X' : day[0]}</abbr>
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: days.length / 7 }, (_, row) => (
            <tr key={row}>
              {days.slice(row * 7, row * 7 + 7).map((day) => (
                <td key={day.fecha}>
                  {day.delMes ? (
                    <button
                      className={`calendar-day ${day.sesiones ? 'calendar-trained' : ''}`}
                      disabled={day.futuro}
                      aria-current={day.fecha === asOf ? 'date' : undefined}
                      aria-pressed={day.fecha === selected}
                      aria-label={`${dateLabel(day.fecha)}: ${day.futuro ? 'fecha futura' : day.sesiones ? `${day.sesiones} ${day.sesiones === 1 ? 'sesión registrada' : 'sesiones registradas'}` : 'sin sesiones registradas'}`}
                      onClick={() => setSelected(day.fecha)}
                    >
                      {day.dia}
                    </button>
                  ) : (
                    <span className="calendar-outside" aria-hidden="true">
                      {day.dia}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="calendar-legend">
        <span>
          <i /> Entrenamiento registrado
        </span>
        <span className="tag">{total} días registrados este mes</span>
      </div>
      <div className="calendar-selection" aria-live="polite">
        <strong>{dateLabel(selected)}</strong>
        <p>
          {selectedSessions.length
            ? `${selectedSessions.length} ${selectedSessions.length === 1 ? 'sesión registrada' : 'sesiones registradas'} · ${number(
                selectedSessions.reduce((sum, session) => sum + session.volumen_kg, 0),
                1,
              )} kg de volumen`
            : 'Sin sesiones registradas en esta fecha.'}
        </p>
      </div>
      <p className="chart-summary">
        Verde indica un día con registros. Las fechas sin registros no confirman descanso; hoy se
        distingue por su borde.
      </p>
    </div>
  );
}
