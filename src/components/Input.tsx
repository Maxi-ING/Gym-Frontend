import { useId, type InputHTMLAttributes } from 'react';
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}
export default function Input({ label, hint, error, id, ...props }: Props) {
  const generated = useId();
  const field = id || generated;
  return (
    <div className="field">
      <label htmlFor={field}>{label}</label>
      <input
        {...props}
        id={field}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${field}-help` : undefined}
      />
      {(error || hint) && (
        <small id={`${field}-help`} className={error ? 'field-error' : ''}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
