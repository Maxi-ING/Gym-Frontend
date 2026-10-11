import { api, query } from '../../lib/api';
import type { Progress, ProgressFilters, UserOverview } from '../../types';
export const dashboardService = {
  overview: (signal?: AbortSignal) => api<UserOverview>('/inicio', { signal }),
  progress: (filters: ProgressFilters = {}, signal?: AbortSignal) =>
    api<Progress>(`/progreso${query({ ...filters })}`, { signal }),
};
