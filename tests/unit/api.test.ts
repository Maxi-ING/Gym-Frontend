import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, query, validationMessage } from '../../src/lib/api';
import { session } from '../../src/lib/session';

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => vi.unstubAllGlobals());
describe('Contrato HTTP', () => {
  it('envía un objeto JSON y el token sin incluir un propietario del cliente', async () => {
    session.start('token-prueba');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 2 }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      api('/sesiones', {
        method: 'POST',
        body: JSON.stringify({ fecha: '2026-01-01', registros: [] }),
      }),
    ).resolves.toEqual({ id: 2 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8000/sesiones');
    expect(init.headers.get('Authorization')).toBe('Bearer token-prueba');
    expect(init.headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body)).not.toHaveProperty('usuario_id');
  });
  it('mantiene el error de validación del servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: [{ msg: 'La carga no puede ser negativa' }] }), {
            status: 422,
          }),
        ),
    );
    await expect(api('/sesiones')).rejects.toThrow('La carga no puede ser negativa');
  });
  it('borra una sesión vencida y avisa al proveedor de autenticación', async () => {
    session.start('vencido');
    const listener = vi.fn();
    window.addEventListener('fitanalytics:unauthorized', listener);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: 'Sesión vencida' }), { status: 401 }),
        ),
    );
    await expect(api('/me')).rejects.toBeInstanceOf(ApiError);
    expect(session.token()).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });
  it('explica una falla de conexión y no devuelve datos inventados', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api('/progreso')).rejects.toThrow('No se pudo conectar');
  });
  it('mantiene la demo aislada del servidor', async () => {
    session.start('demo', true);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const exercises = await api<unknown[]>('/ejercicios');
    expect(exercises.length).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('codifica filtros y conserva cero', () => {
    expect(query({ desde: '2026-01-01', ejercicio_id: 0, hasta: undefined })).toBe(
      '?desde=2026-01-01&ejercicio_id=0',
    );
    expect(validationMessage({ detail: {} })).toContain('Revisa');
  });
});
