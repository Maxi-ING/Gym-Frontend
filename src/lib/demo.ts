import type { Exercise, Goal, Prediction, ProfileInput, Progress, RecordInput, SessionInput, TrainingSession, User } from '../types';
import { today } from './format';

// Adaptador de demostración. Estos datos nunca se envían al backend.
const exercises: Exercise[] = [{ id: 1, nombre: 'Press de banca', unidad: 'kg' }, { id: 2, nombre: 'Sentadilla', unidad: 'kg' }, { id: 3, nombre: 'Peso muerto', unidad: 'kg' }, { id: 4, nombre: 'Press militar', unidad: 'kg' }];
let user: User = { id: 1, nombre: 'Alex', correo: 'demo@example.com', edad: 24, talla_m: 1.75, objetivo: 'Ganar fuerza', perfil_completo: true };
const dated = (weeks: number) => { const d = new Date(); d.setDate(d.getDate() - weeks * 7); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const volume = (rows: RecordInput[]) => rows.reduce((sum, r) => sum + r.series * r.repeticiones * r.carga_kg, 0);
let sessions: TrainingSession[] = Array.from({ length: 8 }, (_, i) => {
  const registros = [{ ejercicio_id: 1, series: 3, repeticiones: 8, carga_kg: 32 + i * 2 }, { ejercicio_id: 2, series: 3, repeticiones: 10, carga_kg: 40 + i * 2 }];
  return { id: i + 1, fecha: dated(7-i), registros, volumen_kg: volume(registros) };
});
let weight = 80;
let goals: Goal[] = [{ id: 1, ejercicio_id: 1, carga_objetivo_kg: 50, estado: 'pendiente' }];

export async function demoRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = new URL(path, 'https://demo.invalid');
  const method = init.method || 'GET';
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
  let result: unknown;
  if (url.pathname === '/me' && method === 'PATCH') {
    const profile = body as ProfileInput;
    user = { ...user, edad: profile.edad, talla_m: profile.talla_m, objetivo: profile.objetivo, perfil_completo: true };weight=profile.peso_kg;result=user;
  } else if (url.pathname === '/me') result = user;
  else if (url.pathname === '/ejercicios') result = exercises;
  else if (url.pathname === '/sesiones' && method === 'POST') {
    const input = body as SessionInput;
    const created = { ...input, id: Date.now(), volumen_kg: volume(input.registros) };
    sessions = [created, ...sessions];result=created;
  } else if (url.pathname === '/sesiones') result = [...sessions].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  else if (url.pathname === '/mediciones' && method === 'POST') { weight=body.peso_kg;result={id:Date.now(),fecha:body.fecha,peso_kg:weight,imc:user.talla_m ? weight/user.talla_m**2:null}; }
  else if (url.pathname === '/metas' && method === 'POST') {
    const goal: Goal={id:Date.now(),ejercicio_id:body.ejercicio_id,carga_objetivo_kg:body.carga_objetivo_kg,estado:'pendiente'};goals=[...goals,goal];result=goal;
  } else if (url.pathname === '/metas') result=goals;
  else if (url.pathname === '/progreso') {
    const exerciseId = Number(url.searchParams.get('ejercicio_id'));
    const desde=url.searchParams.get('desde');const hasta=url.searchParams.get('hasta');
    const matching=sessions.filter(s=>(!desde||s.fecha>=desde)&&(!hasta||s.fecha<=hasta)).map(s=>({...s,registros:s.registros.filter(r=>!exerciseId||r.ejercicio_id===exerciseId)})).filter(s=>s.registros.length);
    const puntos=matching.map(s=>({fecha:s.fecha,carga_kg:Math.max(...s.registros.map(r=>r.carga_kg)),volumen_kg:volume(s.registros)})).sort((a,b)=>a.fecha.localeCompare(b.fecha));
    const progress: Progress={total_sesiones:matching.length,volumen_total_kg:matching.reduce((sum,s)=>sum+volume(s.registros),0),carga_maxima_kg:puntos.length?Math.max(...puntos.map(x=>x.carga_kg)):null,ultima_medicion:{id:1,fecha:today(),peso_kg:weight,imc:user.talla_m?weight/user.talla_m**2:null},puntos};result=progress;
  } else if (url.pathname === '/analisis') {
    // Ejemplo fijo del informe. No se entrena ni se ejecuta ML en el navegador.
    const prediction: Prediction=body.ejercicio_id===1 ? {estado:'estimado',mensaje:'Ejemplo ilustrativo de ocho semanas: tendencia de 2 kg por semana. La estimación no indica qué carga debes levantar.',semanas_observadas:8,pendiente_kg_semana:2,siguiente_carga_kg:48,semanas_hasta_meta:2,historial:Array.from({length:8},(_,i)=>({semana:i,carga_kg:32+i*2})),proyeccion:[{semana:7,carga_kg:46},{semana:8,carga_kg:48},{semana:9,carga_kg:50}]} : {estado:'historial_insuficiente',mensaje:'Este ejemplo de predicción solo está disponible para Press de banca. En modo API se analizará tu historial real.',semanas_observadas:0,pendiente_kg_semana:null,siguiente_carga_kg:null,semanas_hasta_meta:null,historial:[],proyeccion:[]};result=prediction;
  } else throw new Error('Operación no disponible en la demostración.');
  return result as T;
}
