import { api, query } from '../../lib/api';
import type { Progress, ProgressFilters } from '../../types';
export const dashboardService={progress:(filters:ProgressFilters={},signal?:AbortSignal)=>api<Progress>(`/progreso${query({...filters})}`,{signal})};
