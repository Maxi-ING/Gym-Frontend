import { useEffect, useRef } from 'react';
import Button from './Button';
export default function ConfirmDialog({
  title,
  message,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          Cancelar
        </Button>
        <Button onClick={onConfirm} loading={busy}>
          Confirmar
        </Button>
      </div>
    </dialog>
  );
}
