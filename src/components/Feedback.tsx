import Button from './Button';
import { useEffect, useState } from 'react';

export function ConnectionHint({ busy }: { busy: boolean }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), 4000);
    return () => window.clearTimeout(timer);
  }, [busy]);
  return busy && slow ? (
    <p className="connection-hint" role="status">
      Seguimos cargando. La primera conexión puede tardar mientras se inicia el servidor.
    </p>
  ) : null;
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="feedback feedback-error" role="alert">
      <strong>No pudimos completar la solicitud</strong>
      <p>{message}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function LoadingState() {
  return (
    <div>
      <div className="loading-state" role="status">
        <span className="spinner" />
        Cargando tu información…
      </div>
      <ConnectionHint busy />
    </div>
  );
}
export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">↗</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
