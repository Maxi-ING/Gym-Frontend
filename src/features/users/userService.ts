import { api } from '../../lib/api';
import type { AuthInput, AuthResult, Measurement, ProfileInput, User } from '../../types';

export const userService = {
  login: (input: AuthInput) =>
    api<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  register: (input: AuthInput & { nombre: string }) =>
    api<User>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  me: (signal?: AbortSignal) => api<User>('/me', { signal }),
  update: (input: ProfileInput) =>
    api<User>('/me', { method: 'PATCH', body: JSON.stringify(input) }),
  measurement: (input: { fecha: string; peso_kg: number }) =>
    api<Measurement>('/mediciones', { method: 'POST', body: JSON.stringify(input) }),
};
