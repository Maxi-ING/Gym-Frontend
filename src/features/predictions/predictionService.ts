import { api } from '../../lib/api';
import type { Goal, Prediction } from '../../types';
export const predictionService={
  goals:(signal?:AbortSignal)=>api<Goal[]>('/metas',{signal}),
  createGoal:(input:{ejercicio_id:number;carga_objetivo_kg:number})=>api<Goal>('/metas',{method:'POST',body:JSON.stringify(input)}),
  predict:(input:{ejercicio_id:number;meta_id?:number})=>api<Prediction>('/analisis',{method:'POST',body:JSON.stringify(input)}),
};
