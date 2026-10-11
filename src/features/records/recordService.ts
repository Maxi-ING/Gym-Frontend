import { api } from '../../lib/api';
import type { Exercise, SessionInput, TrainingSession } from '../../types';
export const recordService={
  exercises:(signal?:AbortSignal)=>api<Exercise[]>('/ejercicios',{signal}),
  sessions:(signal?:AbortSignal)=>api<TrainingSession[]>('/sesiones',{signal}),
  create:(input:SessionInput)=>api<TrainingSession>('/sesiones',{method:'POST',body:JSON.stringify(input)}),
};
