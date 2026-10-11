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
}
export interface Goal {
  id: number;
  ejercicio_id: number;
  carga_objetivo_kg: number;
  estado: 'pendiente' | 'alcanzada';
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
  estado: 'estimado' | 'historial_insuficiente' | 'meta_alcanzada' | 'sin_tendencia_positiva';
  mensaje: string;
  semanas_observadas: number;
  pendiente_kg_semana: number | null;
  siguiente_carga_kg: number | null;
  semanas_hasta_meta: number | null;
  historial: { semana: number; carga_kg: number }[];
  proyeccion: { semana: number; carga_kg: number }[];
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
