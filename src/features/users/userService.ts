import { api, ApiError } from '../../lib/api';
import type { AuthInput, AuthResult, Measurement, ProfileInput, User } from '../../types';
function normalizeUser(user: User): User {
  const rol = user.rol ?? 'usuario';
  if (rol !== 'admin' && rol !== 'usuario')
    throw new ApiError('El servidor devolvió un rol no válido.', 502);
  if (user.activo === false)
    throw new ApiError('Tu cuenta está inactiva. Contacta con el administrador.', 403);
  return { ...user, rol, activo: user.activo ?? true };
}
export const userService = {
  login: (input: AuthInput) =>
    api<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: AuthInput & { nombre: string }) =>
    api<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  me: (signal?: AbortSignal) => api<User>('/me', { signal }).then(normalizeUser),
  update: (input: ProfileInput) =>
    api<User>('/me', { method: 'PATCH', body: JSON.stringify(input) }).then(normalizeUser),
  measurement: (input: { fecha: string; peso_kg: number }) =>
    api<Measurement>('/mediciones', { method: 'POST', body: JSON.stringify(input) }),
};
