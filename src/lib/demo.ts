import type {
  AdminSession,
  Exercise,
  Goal,
  Prediction,
  ProfileInput,
  Progress,
  ProgressPoint,
  RecordInput,
  SessionInput,
  TrainingSession,
  User,
  UserOverview,
} from '../types';
import { session } from './session';
import { today } from './format';

// Adaptador de demostración. Estos datos nunca se envían al backend.
let exercises: Exercise[] = [
  { id: 1, nombre: 'Press de banca', unidad: 'kg' },
  { id: 2, nombre: 'Sentadilla', unidad: 'kg' },
  { id: 3, nombre: 'Peso muerto', unidad: 'kg' },
  { id: 4, nombre: 'Press militar', unidad: 'kg' },
];
let user: User = {
  id: 1,
  rol: 'usuario',
  activo: true,
  nombre: 'Alex',
  correo: 'demo@example.com',
  edad: 24,
  talla_m: 1.75,
  objetivo: 'Ganar fuerza',
  perfil_completo: true,
};
const dated = (weeks: number) => {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const volume = (rows: RecordInput[]) =>
  rows.reduce((sum, r) => sum + r.series * r.repeticiones * r.carga_kg, 0);
let sessions: TrainingSession[] = Array.from({ length: 8 }, (_, i) => {
  const registros = [
    { ejercicio_id: 1, series: 3, repeticiones: 8, carga_kg: 32 + i * 2 },
    { ejercicio_id: 2, series: 3, repeticiones: 10, carga_kg: 40 + i * 2 },
  ];
  return { id: i + 1, fecha: dated(7 - i), registros, volumen_kg: volume(registros) };
});
let weight = 80;
let lastPrediction: UserOverview['ultimo_analisis'] = null;
let goals: Goal[] = [{ id: 1, ejercicio_id: 1, carga_objetivo_kg: 50, estado: 'pendiente' }];

let admin: User = {
  ...user,
  id: 99,
  nombre: 'Max Huamán',
  correo: 'admin@example.com',
  rol: 'admin',
};
let members: User[] = [
  user,
  {
    ...user,
    id: 2,
    nombre: 'Valeria Torres',
    correo: 'valeria@example.com',
    objetivo: 'Ganar masa muscular',
    edad: 26,
  },
  {
    ...user,
    id: 3,
    nombre: 'Diego Ramos',
    correo: 'diego@example.com',
    activo: false,
    perfil_completo: false,
  },
  admin,
];
function requireAdmin() {
  if (session.demoRole() !== 'admin')
    throw new Error('Esta operación requiere una cuenta administradora.');
}
function adminRows(): AdminSession[] {
  return sessions.map((s) => ({ ...s, usuario_id: 1, usuario_nombre: user.nombre }));
}
function demoProgress(member: User): Progress {
  const own = member.id === 1 ? sessions : [];
  return {
    total_sesiones: own.length,
    volumen_total_kg: own.reduce((n, s) => n + s.volumen_kg, 0),
    carga_maxima_kg: own.length
      ? Math.max(...own.flatMap((s) => s.registros.map((r) => r.carga_kg)))
      : null,
    puntos: [],
    ultima_medicion:
      member.id === 1
        ? {
            id: 1,
            fecha: today(),
            peso_kg: weight,
            imc: member.talla_m ? weight / member.talla_m ** 2 : null,
          }
        : null,
  };
}
function paginate<T>(items: T[], url: URL) {
  const pagina = Math.max(1, Number(url.searchParams.get('pagina')) || 1);
  const por_pagina = 10;
  return {
    items: items.slice((pagina - 1) * por_pagina, pagina * por_pagina),
    total: items.length,
    pagina,
    por_pagina,
  };
}
function demoAdmin(url: URL, method: string, body: Record<string, unknown>): unknown {
  requireAdmin();
  const path = url.pathname;
  if (path === '/admin/resumen')
    return {
      total_usuarios: members.length,
      usuarios_activos: members.filter((u) => u.activo).length,
      total_sesiones: sessions.length,
      total_ejercicios: exercises.filter((e) => e.activo !== false).length,
      sesiones_recientes: adminRows()
        .slice()
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .slice(0, 5),
    };
  if (path === '/admin/usuarios' && method === 'POST') {
    if (members.some((u) => u.correo.toLowerCase() === String(body.correo).toLowerCase()))
      throw new Error('Ya existe una cuenta con ese correo.');
    const created: User = {
      id: Date.now(),
      nombre: String(body.nombre),
      correo: String(body.correo),
      rol: body.rol === 'admin' ? 'admin' : 'usuario',
      activo: true,
      edad: null,
      talla_m: null,
      objetivo: null,
      perfil_completo: false,
    };
    members = [...members, created];
    return created;
  }
  if (path === '/admin/usuarios') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const rol = url.searchParams.get('rol');
    const estado = url.searchParams.get('estado');
    return paginate(
      members.filter(
        (u) =>
          (!q || `${u.nombre} ${u.correo}`.toLowerCase().includes(q)) &&
          (!rol || u.rol === rol) &&
          (!estado || u.activo === (estado === 'activo')),
      ),
      url,
    );
  }
  const memberMatch = path.match(/^\/admin\/usuarios\/(\d+)$/);
  if (memberMatch) {
    const id = Number(memberMatch[1]);
    const member = members.find((u) => u.id === id);
    if (!member) throw new Error('Usuario no encontrado.');
    if (method === 'PATCH') {
      if (id === admin.id && (body.activo === false || body.rol === 'usuario'))
        throw new Error('No puedes desactivar tu cuenta ni quitar tu propio rol.');
      if (
        members.some(
          (u) =>
            u.id !== id &&
            u.correo.toLowerCase() === String(body.correo ?? member.correo).toLowerCase(),
        )
      )
        throw new Error('Ya existe una cuenta con ese correo.');
      const updated = { ...member, ...body } as User;
      members = members.map((u) => (u.id === id ? updated : u));
      if (id === 1) user = updated;
      if (id === 99) admin = updated;
      return updated;
    }
    return {
      usuario: member,
      progreso: demoProgress(member),
      sesiones: member.id === 1 ? sessions : [],
      metas: member.id === 1 ? goals : [],
    };
  }
  if (path === '/admin/sesiones') {
    const id = Number(url.searchParams.get('usuario_id'));
    return paginate(
      adminRows()
        .filter((s) => !id || s.usuario_id === id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
      url,
    );
  }
  const sessionMatch = path.match(/^\/admin\/sesiones\/(\d+)$/);
  if (sessionMatch && method === 'DELETE') {
    sessions = sessions.filter((s) => s.id !== Number(sessionMatch[1]));
    return undefined;
  }
  const goalMatch = path.match(/^\/admin\/metas\/(\d+)$/);
  if (goalMatch && method === 'DELETE') {
    goals = goals.filter((g) => g.id !== Number(goalMatch[1]));
    return undefined;
  }
  if (path === '/admin/ejercicios' && method === 'POST') {
    const e: Exercise = { id: Date.now(), nombre: String(body.nombre), unidad: 'kg', activo: true };
    exercises = [...exercises, e];
    return e;
  }
  if (path === '/admin/ejercicios') return exercises;
  const exerciseMatch = path.match(/^\/admin\/ejercicios\/(\d+)$/);
  if (exerciseMatch && method === 'PATCH') {
    const id = Number(exerciseMatch[1]);
    const e = exercises.find((e) => e.id === id);
    if (!e) throw new Error('Ejercicio no encontrado.');
    const updated = { ...e, ...body } as Exercise;
    exercises = exercises.map((e) => (e.id === id ? updated : e));
    return updated;
  }
  throw new Error('Operación de administración no disponible.');
}

export async function demoRequest<T>(path: string, init: RequestInit): Promise<T> {
  const url = new URL(path, 'https://demo.invalid');
  const method = init.method || 'GET';
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : {};
  if (url.pathname.startsWith('/admin/')) return demoAdmin(url, method, body) as T;
  let result: unknown;
  if (url.pathname === '/me' && method === 'PATCH') {
    const profile = body as ProfileInput;
    user = {
      ...user,
      edad: profile.edad,
      talla_m: profile.talla_m,
      objetivo: profile.objetivo,
      perfil_completo: true,
    };
    weight = profile.peso_kg;
    result = user;
  } else if (url.pathname === '/me') result = session.demoRole() === 'admin' ? admin : user;
  else if (url.pathname === '/ejercicios') result = exercises.filter((e) => e.activo !== false);
  else if (url.pathname === '/sesiones' && method === 'POST') {
    const input = body as SessionInput;
    const created = { ...input, id: Date.now(), volumen_kg: volume(input.registros) };
    sessions = [created, ...sessions];
    result = created;
  } else if (url.pathname === '/sesiones')
    result = [...sessions].sort((a, b) => b.fecha.localeCompare(a.fecha));
  else if (url.pathname === '/mediciones' && method === 'POST') {
    weight = body.peso_kg;
    result = {
      id: Date.now(),
      fecha: body.fecha,
      peso_kg: weight,
      imc: user.talla_m ? weight / user.talla_m ** 2 : null,
    };
  } else if (url.pathname === '/metas' && method === 'POST') {
    const goal: Goal = {
      id: Date.now(),
      ejercicio_id: body.ejercicio_id,
      carga_objetivo_kg: body.carga_objetivo_kg,
      estado: 'pendiente',
    };
    goals = [...goals, goal];
    result = goal;
  } else if (url.pathname === '/metas') result = goals;
  else if (url.pathname === '/progreso') {
    const exerciseId = Number(url.searchParams.get('ejercicio_id'));
    const desde = url.searchParams.get('desde');
    const hasta = url.searchParams.get('hasta');
    const matching = sessions
      .filter((s) => (!desde || s.fecha >= desde) && (!hasta || s.fecha <= hasta))
      .map((s) => ({
        ...s,
        registros: s.registros.filter((r) => !exerciseId || r.ejercicio_id === exerciseId),
      }))
      .filter((s) => s.registros.length);
    const grouped = new Map<string, ProgressPoint>();
    for (const s of matching) {
      const previous = grouped.get(s.fecha);
      grouped.set(s.fecha, {
        fecha: s.fecha,
        carga_kg: Math.max(previous?.carga_kg ?? 0, ...s.registros.map((r) => r.carga_kg)),
        volumen_kg: (previous?.volumen_kg ?? 0) + volume(s.registros),
      });
    }
    const puntos = [...grouped.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const progress: Progress = {
      total_sesiones: matching.length,
      volumen_total_kg: matching.reduce((sum, s) => sum + volume(s.registros), 0),
      carga_maxima_kg: puntos.length ? Math.max(...puntos.map((x) => x.carga_kg)) : null,
      ultima_medicion: {
        id: 1,
        fecha: today(),
        peso_kg: weight,
        imc: user.talla_m ? weight / user.talla_m ** 2 : null,
      },
      puntos,
    };
    result = progress;
  } else if (url.pathname === '/inicio') {
    const progreso = await demoRequest<Progress>('/progreso', {});
    const rendimiento = exercises.map((e) => {
      const rows = sessions
        .slice()
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .flatMap((s) => {
          const matching = s.registros.filter((r) => r.ejercicio_id === e.id);
          return matching.length ? [{ carga: Math.max(...matching.map((r) => r.carga_kg)) }] : [];
        });
      const first = rows[0]?.carga ?? null;
      const last = rows.at(-1)?.carga ?? null;
      return {
        ejercicio_id: e.id,
        nombre: e.nombre,
        sesiones: rows.length,
        primera_carga_kg: first,
        ultima_carga_kg: last,
        mejor_carga_kg: rows.length ? Math.max(...rows.map((r) => r.carga)) : null,
        variacion_porcentaje:
          first !== null && first > 0 && last !== null ? ((last - first) / first) * 100 : null,
      };
    });
    const overview: UserOverview = {
      progreso,
      rendimiento,
      metas: goals.map((g) => {
        const load =
          rendimiento.find((e) => e.ejercicio_id === g.ejercicio_id)?.ultima_carga_kg ?? null;
        return {
          ...g,
          ejercicio_nombre: exercises.find((e) => e.id === g.ejercicio_id)?.nombre ?? 'Ejercicio',
          ultima_carga_kg: load,
          avance_porcentaje:
            load !== null ? Math.min(100, (load / g.carga_objetivo_kg) * 100) : null,
        };
      }),
      ultimo_analisis: lastPrediction,
      recomendaciones: [
        {
          titulo: 'Construye un historial consistente',
          mensaje:
            'Registra la fecha, las series, las repeticiones y la carga externa después de cada sesión. Un registro completo facilita comparar el mismo ejercicio a lo largo del tiempo y detectar semanas sin información.',
          origen: 'regla',
          accion: 'registro',
        },
        {
          titulo:
            user.objetivo === 'Ganar fuerza'
              ? 'Observa la evolución de tus cargas'
              : 'Revisa tu objetivo de entrenamiento',
          mensaje:
            user.objetivo === 'Ganar fuerza'
              ? 'Tu objetivo es ganar fuerza. Compara la carga de un mismo ejercicio junto con sus series y repeticiones; un aumento de carga aislado no describe todo tu rendimiento. Revisa tu planificación con el entrenador.'
              : 'Mantén actualizado tu objetivo y contrasta las sesiones registradas con la planificación de tu entrenador. Los indicadores ayudan a observar el historial, sin sustituir una evaluación personal.',
          origen: 'regla',
          accion: 'perfil',
        },
        {
          titulo: 'Consulta tu tendencia cuando tengas historial',
          mensaje:
            'El análisis se ejecuta cuando lo solicitas. Revisa el ejercicio y la meta antes de interpretar la proyección; las semanas estimadas pueden cambiar cuando se incorporan nuevos registros.',
          origen: 'regla',
          accion: 'analisis',
        },
      ],
    };
    result = overview;
  } else if (url.pathname === '/analisis') {
    // Ejemplo fijo del informe. No se entrena ni se ejecuta ML en el navegador.
    const prediction: Prediction =
      body.ejercicio_id === 1
        ? {
            estado: 'estimado',
            mensaje:
              'Ejemplo ilustrativo de ocho semanas: tendencia de 2 kg por semana. La estimación no indica qué carga debes levantar.',
            semanas_observadas: 8,
            pendiente_kg_semana: 2,
            siguiente_carga_kg: 48,
            semanas_hasta_meta: 2,
            historial: Array.from({ length: 8 }, (_, i) => ({ semana: i, carga_kg: 32 + i * 2 })),
            proyeccion: [
              { semana: 7, carga_kg: 46 },
              { semana: 8, carga_kg: 48 },
              { semana: 9, carga_kg: 50 },
            ],
          }
        : {
            estado: 'historial_insuficiente',
            mensaje:
              'Este ejemplo de predicción solo está disponible para Press de banca. En modo API se analizará tu historial real.',
            semanas_observadas: 0,
            pendiente_kg_semana: null,
            siguiente_carga_kg: null,
            semanas_hasta_meta: null,
            historial: [],
            proyeccion: [],
          };
    lastPrediction = {
      ejercicio_nombre: exercises.find((e) => e.id === body.ejercicio_id)?.nombre ?? 'Ejercicio',
      fecha: new Date().toISOString(),
      resultado: prediction,
    };
    result = prediction;
  } else throw new Error('Operación no disponible en la demostración.');
  return result as T;
}
