export type Role = 'admin' | 'usuario';
export interface User {
  rol: Role;
  activo: boolean;
  id: number;
  nombre: string;
  correo: string;
  edad: number | null;
  talla_m: number | null;
  objetivo: string | null;
  perfil_completo: boolean;
}
export interface ProfileInput {
  edad: number;
  talla_m: number;
  objetivo: string;
  peso_kg: number;
}
export interface Measurement {
  id: number;
  fecha: string;
  peso_kg: number;
  imc: number | null;
}
export interface Exercise {
  id: number;
  nombre: string;
  unidad: 'kg';
  activo?: boolean;
}
export interface RecordInput {
  ejercicio_id: number;
  series: number;
  repeticiones: number;
  carga_kg: number;
}
export interface SessionInput {
  fecha: string;
  registros: RecordInput[];
}
export interface TrainingSession extends SessionInput {
  id: number;
  volumen_kg: number;
  registros: (RecordInput & { ejercicio_nombre?: string })[];
}
export interface Goal {
  id: number;
  ejercicio_id: number;
  carga_objetivo_kg: number;
  estado: 'pendiente' | 'alcanzada';
  repeticiones_objetivo?: number | null;
}
export interface ProgressPoint {
  fecha: string;
  carga_kg: number;
  volumen_kg: number;
}
export interface Progress {
  total_sesiones: number;
  volumen_total_kg: number;
  carga_maxima_kg: number | null;
  ultima_medicion: Measurement | null;
  puntos: ProgressPoint[];
}
export interface ProgressFilters {
  ejercicio_id?: number;
  desde?: string;
  hasta?: string;
}
export interface Prediction {
  estado:
    | 'estimado'
    | 'historial_insuficiente'
    | 'meta_alcanzada'
    | 'sin_tendencia_positiva'
    | 'no_estimable';
  mensaje: string;
  semanas_observadas: number;
  pendiente_kg_semana: number | null;
  siguiente_carga_kg: number | null;
  semanas_hasta_meta: number | null;
  historial: { semana: number; carga_kg: number }[];
  proyeccion: { semana: number; carga_kg: number }[];
  modelo_version?: string | null;
  repeticiones_analizadas?: number | null;
  error_mae_kg?: number | null;
  error_referencia_kg?: number | null;
  validaciones_temporales?: number;
}
export interface ComparableGroup {
  repeticiones: number;
  registros: number;
  semanas: number;
  ultima_fecha: string;
}
export interface AnalysisAvailability {
  ejercicio_id: number;
  minimo_semanas: number;
  grupos: ComparableGroup[];
}
export interface AuthInput {
  correo: string;
  clave: string;
}
export interface AuthResult {
  access_token: string;
  token_type: 'bearer';
}

export interface PageResult<T> {
  items: T[];
  total: number;
  pagina: number;
  por_pagina: number;
}
export interface AdminSummary {
  total_usuarios: number;
  usuarios_activos: number;
  total_sesiones: number;
  total_ejercicios: number;
  sesiones_recientes: AdminSession[];
}
export interface AdminSession extends TrainingSession {
  usuario_id: number;
  usuario_nombre: string;
}
export interface AdminUserDetail {
  usuario: User;
  progreso: Progress;
  sesiones: TrainingSession[];
  metas: Goal[];
}
export interface AdminUserInput {
  nombre: string;
  correo: string;
  rol: Role;
  activo: boolean;
}
export interface ExercisePerformance {
  ejercicio_id: number;
  nombre: string;
  sesiones: number;
  primera_carga_kg: number | null;
  ultima_carga_kg: number | null;
  mejor_carga_kg: number | null;
  variacion_porcentaje: number | null;
}
export interface OverviewGoal extends Goal {
  ejercicio_nombre: string;
  ultima_carga_kg: number | null;
  avance_porcentaje: number | null;
}
export interface Recommendation {
  titulo: string;
  mensaje: string;
  origen: 'regla' | 'modelo';
  accion: 'registro' | 'perfil' | 'analisis';
}
export interface UserOverview {
  progreso: Progress;
  rendimiento: ExercisePerformance[];
  metas: OverviewGoal[];
  ultimo_analisis: { ejercicio_nombre: string; fecha: string; resultado: Prediction } | null;
  recomendaciones: Recommendation[];
}
