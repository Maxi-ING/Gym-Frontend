import { useEffect, useState } from 'react';
import { errorMessage } from '../lib/api';

/** Cancela la consulta anterior para que una respuesta tardía no reemplace filtros nuevos. */
export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    setData(undefined);
    load(controller.signal)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [load, version]);
  return { data, error, loading, reload: () => setVersion((v) => v + 1) };
}
