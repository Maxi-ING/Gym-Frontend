import type { Prediction } from '../../types';
import { number } from '../../lib/format';
export function predictionAdvice(result: Prediction) {
  switch (result.estado) {
    case 'no_estimable':
      return {
        titulo: 'No estimable con suficiente fiabilidad',
        parrafos: [
          result.mensaje,
          'Conservamos tus registros y la referencia de la meta, pero no mostramos una curva futura ni una fecha que estos datos no permiten sostener. Revisa las repeticiones elegidas, la continuidad de las fechas y las cargas registradas.',
          'Añade sesiones recientes y comparables antes de volver a consultar. Los mensajes siguen reglas; la plataforma no evalúa técnica, descanso ni recuperación y no indica cuánto peso debes levantar.',
        ],
      };
    case 'historial_insuficiente':
      return {
        titulo: 'Tu historial todavía está tomando forma',
        parrafos: [
          `Hay ${result.semanas_observadas} semanas observadas. Para comparar una tendencia se necesitan al menos cuatro semanas con información del mismo ejercicio. No tener una estimación todavía no significa que estés entrenando mal: significa que faltan registros para describir tu evolución con una referencia suficiente.`,
          'Continúa registrando las sesiones que realmente realizas. Mantén claras las fechas, las series, las repeticiones y la carga externa. Las semanas sin datos no se convierten en entrenamientos de carga cero y no deben completarse con valores inventados.',
          'Cuando tengas más historial, vuelve a solicitar el análisis. Compara el resultado con tu planificación y con la revisión de tu entrenador; la plataforma no puede evaluar la técnica, el descanso o la recuperación a partir de estas cargas.',
        ],
      };
    case 'meta_alcanzada':
      return {
        titulo: 'Tu historial ya alcanza la referencia de la meta',
        parrafos: [
          'Los datos analizados alcanzan la carga objetivo que seleccionaste. Es un punto de seguimiento útil y merece que revises qué cambió en tus registros: la carga, las series y las repeticiones deben interpretarse juntas.',
          'Alcanzar esta referencia no implica que debas aumentar la carga en la siguiente sesión. Confirma con tu entrenador que la meta y los registros describen correctamente el ejercicio y las condiciones de tu entrenamiento.',
          'Puedes conservar la meta como referencia o acordar un nuevo objetivo. Sigue registrando las sesiones para observar la continuidad del resultado en lugar de basar tus conclusiones en un solo registro.',
        ],
      };
    case 'sin_tendencia_positiva':
      return {
        titulo: 'El avance necesita una mirada más amplia',
        parrafos: [
          'En el período analizado no aparece una tendencia de carga positiva suficiente para estimar una fecha de logro. Esto no demuestra por sí solo una pérdida de rendimiento: el modelo observa cargas registradas y no conoce toda la planificación del entrenamiento.',
          'Revisa si las fechas y los valores están completos, si comparas el mismo ejercicio y si hubo cambios en las series o repeticiones. Una carga menor con otra estructura de trabajo no se interpreta de la misma manera que una sesión equivalente.',
          'Evita forzar una subida de carga para mejorar el gráfico. Lleva este historial a la revisión con tu entrenador y vuelve a consultar la tendencia después de incorporar nuevas sesiones reales.',
        ],
      };
    case 'estimado': {
      const long = (result.semanas_hasta_meta ?? 0) > 12;
      return {
        titulo: long
          ? 'Este objetivo requiere tiempo y seguimiento'
          : 'Tu historial muestra una dirección favorable',
        parrafos: [
          `La tendencia observada es de ${result.pendiente_kg_semana !== null ? `${number(result.pendiente_kg_semana, 1)} kg por semana` : 'una variación positiva'} durante ${result.semanas_observadas} semanas. Es una descripción del historial de este ejercicio, no una instrucción sobre cuánto peso levantar en tu próxima sesión.`,
          result.semanas_hasta_meta !== null
            ? `Con la tendencia actual, el tiempo estimado hasta la meta es de ${number(result.semanas_hasta_meta, 1)} semanas. ${long ? 'Es un horizonte amplio: considera el resultado una referencia que deberá revisarse a medida que cambien tus registros.' : 'Vas construyendo una referencia de avance. Mantén el seguimiento y revisa si las nuevas sesiones sostienen la misma dirección.'} La fecha puede cambiar y no garantiza que alcances esa carga en ese plazo.`
            : 'No seleccionaste una meta de carga, por lo que este resultado describe la tendencia sin asignar una fecha de logro. Puedes definir una referencia acordada con tu entrenador y solicitar de nuevo el análisis.',
          'Interpreta la proyección junto con las series, las repeticiones y el contexto de las sesiones. El modelo no mide la técnica ni la recuperación. Cualquier ajuste del entrenamiento debe revisarse con tu entrenador; registrar con consistencia ayuda más que perseguir un valor del gráfico.',
        ],
      };
    }
  }
}
