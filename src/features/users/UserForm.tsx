import { useState, type FormEvent } from 'react';
import { limits, objectives, validateProfile } from '../../lib/validation';
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
    const input = {
      edad: Number(form.get('edad')),
      talla_m: Number(form.get('talla_m')),
      peso_kg: Number(form.get('peso_kg')),
      objetivo: String(form.get('objetivo')),
    };
    const invalid = validateProfile(input);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    try {
      const updated = await userService.update(input);
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
      <fieldset disabled={busy} className="form-grid">
        <Input
          label="Edad"
          name="edad"
          type="number"
          {...limits.edad}
          defaultValue={user.edad ?? ''}
          required
          hint="Solo personas adultas"
        />
        <Input
          label="Talla (m)"
          name="talla_m"
          type="number"
          {...limits.talla}
          defaultValue={user.talla_m ?? ''}
          placeholder="1.75"
          required
        />
        <Input
          label="Peso actual (kg)"
          name="peso_kg"
          type="number"
          {...limits.peso}
          defaultValue={initialWeight ?? ''}
          placeholder="80.0"
          required
        />
        <Select label="Objetivo" name="objetivo" defaultValue={user.objetivo ?? ''} required>
          <option value="" disabled>
            Selecciona tu objetivo
          </option>
          {objectives.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </fieldset>
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
