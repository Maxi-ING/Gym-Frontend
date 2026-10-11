import { api, query } from '../../lib/api';
import type {
  AdminSession,
  AdminSummary,
  AdminUserDetail,
  AdminUserInput,
  Exercise,
  PageResult,
  User,
} from '../../types';
export const adminService = {
  summary: (signal?: AbortSignal) => api<AdminSummary>('/admin/resumen', { signal }),
  users: (
    filters: { q?: string; rol?: string; estado?: string; pagina?: number } = {},
    signal?: AbortSignal,
  ) => api<PageResult<User>>(`/admin/usuarios${query({ ...filters })}`, { signal }),
  user: (id: number, signal?: AbortSignal) =>
    api<AdminUserDetail>(`/admin/usuarios/${id}`, { signal }),
  createUser: (input: Omit<AdminUserInput, 'activo'> & { clave: string }) =>
    api<User>('/admin/usuarios', { method: 'POST', body: JSON.stringify(input) }),
  updateUser: (id: number, input: Partial<AdminUserInput>) =>
    api<User>(`/admin/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  sessions: (filters: { usuario_id?: number; pagina?: number } = {}, signal?: AbortSignal) =>
    api<PageResult<AdminSession>>(`/admin/sesiones${query({ ...filters })}`, { signal }),
  deleteSession: (id: number) => api<void>(`/admin/sesiones/${id}`, { method: 'DELETE' }),
  deleteGoal: (id: number) => api<void>(`/admin/metas/${id}`, { method: 'DELETE' }),
  exercises: (signal?: AbortSignal) => api<Exercise[]>('/admin/ejercicios', { signal }),
  createExercise: (nombre: string) =>
    api<Exercise>('/admin/ejercicios', {
      method: 'POST',
      body: JSON.stringify({ nombre, unidad: 'kg' }),
    }),
  updateExercise: (id: number, input: { nombre?: string; activo?: boolean }) =>
    api<Exercise>(`/admin/ejercicios/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
};
