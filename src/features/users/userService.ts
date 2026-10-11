import { api, ApiError } from '../../lib/api';
import type { AuthInput, AuthResult, Measurement, ProfileInput, User } from '../../types';

export const userService = {
  login: (input: AuthInput) =>
    api<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: AuthInput & { nombre: string }) =>
    api<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  me: async (signal?: AbortSignal) => {
    const user = await api<User>('/me', { signal });
    // Un backend anterior sin rol solo puede acceder como usuario.
    const rol = user.rol ?? 'usuario';
    if (rol !== 'admin' && rol !== 'usuario')
      throw new ApiError('El servidor devolvió un rol no válido.', 502);
    if (user.activo === false)
      throw new ApiError('Tu cuenta está inactiva. Contacta con el administrador.', 403);
    return { ...user, rol, activo: user.activo ?? true };
  },
  update: (input: ProfileInput) =>
    api<User>('/me', { method: 'PATCH', body: JSON.stringify(input) }),
  measurement: (input: { fecha: string; peso_kg: number }) =>
    api<Measurement>('/mediciones', { method: 'POST', body: JSON.stringify(input) }),
};
