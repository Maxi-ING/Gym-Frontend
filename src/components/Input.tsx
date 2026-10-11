import { useId, useRef, useState, type InputHTMLAttributes } from 'react';
import { decimals, validNumericDraft } from '../lib/validation';
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}
export default function Input({
  label,
  hint,
  error,
  id,
  onChange,
  onKeyDown,
  onPaste,
  ...props
}: Props) {
  const generated = useId();
  const field = id || generated;
  const last = useRef(String(props.value ?? props.defaultValue ?? ''));
  const [filterError, setFilterError] = useState('');
  const numeric = props.type === 'number';
  const max = Number(props.max ?? Number.MAX_SAFE_INTEGER);
  const precision = decimals(props.step);
  const message = `Usa solo números entre ${props.min ?? 0} y ${props.max ?? 'el máximo permitido'}${precision ? `, con hasta ${precision} decimal${precision === 1 ? '' : 'es'}` : ', sin decimales'}.`;
  const displayedError = error || filterError;
  return (
    <div className="field">
      <label htmlFor={field}>{label}</label>
      <input
        {...props}
        id={field}
        inputMode={numeric ? (precision ? 'decimal' : 'numeric') : props.inputMode}
        aria-invalid={!!displayedError}
        aria-describedby={displayedError || hint ? `${field}-help` : undefined}
        onKeyDown={(e) => {
          if (
            numeric &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey &&
            ['e', 'E', '+', '-', ...(precision ? [] : ['.', ','])].includes(e.key)
          ) {
            e.preventDefault();
            setFilterError(message);
          }
          onKeyDown?.(e);
        }}
        onPaste={(e) => {
          if (
            numeric &&
            !validNumericDraft(e.clipboardData.getData('text').trim(), max, precision)
          ) {
            e.preventDefault();
            setFilterError(message);
          } else onPaste?.(e);
        }}
        onChange={(e) => {
          if (numeric && !validNumericDraft(e.target.value, max, precision)) {
            e.target.value = last.current;
            setFilterError(message);
            return;
          }
          last.current = e.target.value;
          setFilterError('');
          onChange?.(e);
        }}
      />
      {(displayedError || hint) && (
        <small id={`${field}-help`} className={displayedError ? 'field-error' : ''}>
          {displayedError || hint}
        </small>
      )}
    </div>
  );
}
