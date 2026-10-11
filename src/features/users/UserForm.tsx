import { useState, type FormEvent } from 'react';
import type { User } from '../../types';
import { userService } from './userService';
import { errorMessage } from '../../lib/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';

export default function UserForm({
  user,
  initialWeight,
  onSaved,
}: {
  user: User;
  initialWeight?: number;
  onSaved: (user: User) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      const updated = await userService.update({
        edad: Number(form.get('edad')),
        talla_m: Number(form.get('talla_m')),
        peso_kg: Number(form.get('peso_kg')),
        objetivo: String(form.get('objetivo')),
      });
      onSaved(updated);
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="form-stack">
      <div className="form-grid">
        <Input
          label="Edad"
          name="edad"
          type="number"
          min={18}
          max={120}
          step={1}
          defaultValue={user.edad ?? ''}
          required
          hint="Solo personas adultas"
        />
        <Input
          label="Talla (m)"
          name="talla_m"
          type="number"
          min={0.5}
          max={2.5}
          step={0.01}
          defaultValue={user.talla_m ?? ''}
          placeholder="1.75"
          required
        />
        <Input
          label="Peso actual (kg)"
          name="peso_kg"
          type="number"
          min={20}
          max={400}
          step={0.1}
          defaultValue={initialWeight ?? ''}
          placeholder="80.0"
          required
        />
        <Select label="Objetivo" name="objetivo" defaultValue={user.objetivo ?? ''} required>
          <option value="" disabled>
            Selecciona tu objetivo
          </option>
          {[
            'Ganar fuerza',
            'Ganar masa muscular',
            'Mejorar condición física',
            'Mantener actividad física',
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </div>
      <small className="muted">
        El peso se guardará como una medición. El IMC es orientativo y no representa un diagnóstico.
      </small>
      {error && (
        <div className="feedback feedback-error" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="feedback feedback-success" role="status">
          Perfil guardado correctamente.
        </div>
      )}
      <div className="form-actions">
        <Button type="submit" loading={busy}>
          Guardar perfil
        </Button>
      </div>
    </form>
  );
}
