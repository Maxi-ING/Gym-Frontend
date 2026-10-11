import { useState, type FormEvent } from 'react';
import { recordService } from './recordService';
import { limits } from '../../lib/validation';
import { validateSession } from './recordValidation';
import { errorMessage } from '../../lib/api';
import { today } from '../../lib/format';
import type { Exercise } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Icon from '../../components/Icon';
export default function RecordForm({
  exercises,
  onSaved,
  onStart,
}: {
  exercises: Exercise[];
  onSaved: () => void;
  onStart: () => void;
}) {
  const [rows, setRows] = useState([crypto.randomUUID()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    onStart();
    const element = event.currentTarget;
    const form = new FormData(element);
    if (rows.some((id) => String(form.get(`load_${id}`) ?? '').trim() === '')) {
      setError('Ingresa la carga de cada ejercicio; usa 0 para una carga externa nula.');
      return;
    }
    const input = {
      fecha: String(form.get('fecha')),
      registros: rows.map((id) => ({
        ejercicio_id: Number(form.get(`exercise_${id}`)),
        series: Number(form.get(`series_${id}`)),
        repeticiones: Number(form.get(`reps_${id}`)),
        carga_kg: Number(form.get(`load_${id}`)),
      })),
    };
    const validation = validateSession(input);
    if (
      validation ||
      input.registros.some((r) => !exercises.some((e) => e.id === r.ejercicio_id))
    ) {
      setError(validation || 'El ejercicio no pertenece al catálogo disponible.');
      return;
    }
    setBusy(true);
    try {
      await recordService.create(input);
      element.reset();
      setRows([crypto.randomUUID()]);
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <p className="muted">
          Hasta 20 registros por sesión · 1–20 series · 1–100 repeticiones · carga de 0–600 kg. El
          límite de carga es operativo y no indica qué peso levantar.
        </p>
        <div className="record-date">
          <Input
            label="Fecha del entrenamiento"
            name="fecha"
            type="date"
            min={limits.fechaMinima}
            max={today()}
            defaultValue={today()}
            required
          />
        </div>
        {rows.map((id, index) => (
          <div className="record-row" key={id}>
            <Select
              label={`Ejercicio ${index + 1}`}
              name={`exercise_${id}`}
              required
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona un ejercicio
              </option>
              {exercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </Select>
            <Input
              label="Series"
              name={`series_${id}`}
              type="number"
              min={1}
              max={limits.series.max}
              step={1}
              defaultValue={3}
              required
            />
            <Input
              label="Repeticiones"
              name={`reps_${id}`}
              type="number"
              min={1}
              max={limits.repeticiones.max}
              step={1}
              defaultValue={8}
              required
            />
            <Input
              label="Carga (kg)"
              name={`load_${id}`}
              type="number"
              min={0}
              max={limits.carga.max}
              step={0.1}
              placeholder="32"
              required
            />
            <Button
              variant="ghost"
              aria-label={`Quitar ejercicio ${index + 1}`}
              disabled={rows.length === 1}
              onClick={() => setRows((values) => values.filter((x) => x !== id))}
            >
              Quitar
            </Button>
          </div>
        ))}
        <div className="form-actions">
          <Button
            variant="secondary"
            disabled={rows.length >= limits.registros}
            onClick={() => {
              onStart();
              setRows((values) => [...values, crypto.randomUUID()]);
            }}
          >
            <Icon name="plus" size={16} />
            Agregar ejercicio
          </Button>
          <Button type="submit" loading={busy}>
            <Icon name="check" size={17} />
            Guardar sesión
          </Button>
        </div>
      </fieldset>
      {error && (
        <div className="feedback feedback-error inline-status" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
