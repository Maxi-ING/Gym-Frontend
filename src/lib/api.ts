import { demoRequest } from './demo';
import { session } from './session';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message);this.name='ApiError'; }
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'No pudimos completar la operación.'; }
export function validationMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || !('detail' in payload)) return 'No pudimos completar la solicitud.';
  const detail = (payload as { detail: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => typeof e?.msg === 'string' ? e.msg : 'Dato inválido').join('. ');
  return 'Revisa los datos e inténtalo de nuevo.';
}
const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (session.isDemo()) return demoRequest<T>(path, init);
  const controller = new AbortController();
  const onAbort = () => controller.abort(init.signal?.reason);
  init.signal?.addEventListener('abort', onAbort, { once: true });
  if(init.signal?.aborted) onAbort();
  const timer = setTimeout(() => controller.abort(new DOMException('Tiempo de espera agotado', 'TimeoutError')), 15000);
  const token = session.token();
  try {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${base}${path}`, { ...init, headers, signal: controller.signal });
    const content = await response.text();
    let payload: unknown;
    try { payload = content ? JSON.parse(content) : undefined; } catch { throw new ApiError('El servidor devolvió una respuesta no válida.', response.status); }
    if (!response.ok) {
      if(response.status===401 && token){session.clear();window.dispatchEvent(new Event('fitanalytics:unauthorized'));}
      throw new ApiError(validationMessage(payload), response.status);
    }
    return payload as T;
  } catch(error) {
    if(error instanceof ApiError) throw error;
    if(init.signal?.aborted) throw error;
    if(controller.signal.aborted) throw new ApiError('La solicitud tardó demasiado. Puedes reintentar.', 0);
    throw new ApiError('No se pudo conectar con el servidor. Comprueba tu conexión y que el backend esté disponible.', 0);
  } finally { clearTimeout(timer);init.signal?.removeEventListener('abort', onAbort); }
}
export function query(filters: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for(const [key,value] of Object.entries(filters)) if(value!==undefined && value!=='')params.set(key,String(value));
  return params.size ? `?${params}` : '';
}
