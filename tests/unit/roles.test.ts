import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { session } from '../../src/lib/session';
import { userService } from '../../src/features/users/userService';
import { adminService } from '../../src/features/admin/adminService';
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  });
  vi.stubGlobal('window', new EventTarget());
});
afterEach(() => vi.unstubAllGlobals());
describe('Separación de roles', () => {
  it('una demo de usuario no puede consultar administración', async () => {
    session.start('demo', true);
    expect((await userService.me()).rol).toBe('usuario');
    await expect(adminService.summary()).rejects.toThrow('administradora');
  });
  it('la demo administrativa muestra cuentas sin llamar al backend', async () => {
    session.start('demo', true, 'admin');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await userService.me()).rol).toBe('admin');
    expect((await adminService.users()).total).toBe(4);
    await expect(adminService.updateUser(99, { activo: false })).rejects.toThrow('propio rol');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('no eleva permisos si una respuesta anterior no incluye el rol', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 5, nombre: 'Max' }))),
    );
    expect((await userService.me()).rol).toBe('usuario');
  });
  it('rechaza un rol desconocido y una cuenta inactiva', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ rol: 'propietario' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ rol: 'usuario', activo: false })));
    vi.stubGlobal('fetch', fetchMock);
    await expect(userService.me()).rejects.toThrow('rol no válido');
    await expect(userService.me()).rejects.toThrow('inactiva');
  });
});
