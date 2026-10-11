# Contrato de integración con FastAPI

Todas las rutas reciben o devuelven JSON. Se usan nombres en español para mantener coherencia con el modelo. Las fechas tienen formato `YYYY-MM-DD`; pesos, cargas y volúmenes son números en kg; talla en metros. Las respuestas numéricas no deben serializarse como cadenas, aunque PostgreSQL use `NUMERIC`.

Este contrato define lo que consume el frontend. La implementación del backend debe validarlo con pruebas reales; las respuestas de navegador usadas en los tests son interceptaciones.

## Autenticación y autorización

| Método y ruta         | Solicitud                                                                     | Respuesta                                                |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| POST `/auth/register` | `{ "nombre": "Max", "correo": "max@example.com", "clave": "ejemplo-seguro" }` | 201, objeto Usuario                                      |
| POST `/auth/login`    | `{ "correo": "max@example.com", "clave": "ejemplo-seguro" }`                  | 200, `{ "access_token": "...", "token_type": "bearer" }` |
| GET `/me`             | Token                                                                         | 200, Usuario                                             |
| PATCH `/me`           | Perfil descrito abajo                                                         | 200, Usuario actualizado                                 |

El registro no inicia sesión automáticamente. El login recibe JSON; si se usa un formulario OAuth2 de FastAPI se debe adaptar explícitamente el endpoint o el servicio del frontend. Después del login, el frontend consulta `/me` con `Authorization: Bearer <token>`. Todas las demás rutas requieren el token. El backend obtiene el propietario del token y filtra consultas; ningún identificador enviado por la interfaz autoriza el acceso a datos ajenos.

Usuario:

```json
{
  "id": 8,
  "nombre": "Max",
  "correo": "max@example.com",
  "edad": null,
  "talla_m": null,
  "objetivo": null,
  "perfil_completo": false
}
```

PATCH `/me`:

```json
{ "edad": 20, "talla_m": 1.75, "peso_kg": 80, "objetivo": "Ganar fuerza" }
```

El backend valida y guarda perfil + medición de peso en una transacción, con fecha actual de negocio (America/Lima). Marca `perfil_completo` solo después del guardado. Objetivos aceptados: Ganar fuerza, Ganar masa muscular, Mejorar condición física, Mantener actividad física. El backend aplica las restricciones de edad, talla y peso sin depender de la validación visual.

## Entrenamiento y mediciones

| Método y ruta      | Solicitud                                  | Respuesta                                                              |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------- |
| GET `/ejercicios`  | Sin cuerpo                                 | Lista de `{ "id": 1, "nombre": "Press de banca", "unidad": "kg" }`     |
| POST `/sesiones`   | Sesión con registros                       | 201, sesión guardada con ID y volumen                                  |
| GET `/sesiones`    | Sin cuerpo                                 | Lista de sesiones de la cuenta; `[]` si no hay datos                   |
| POST `/mediciones` | `{ "fecha": "2026-10-10", "peso_kg": 80 }` | 201, `{ "id": 4, "fecha": "2026-10-10", "peso_kg": 80, "imc": 26.12 }` |

Sesión de respuesta (para crearla, se omiten `id` y `volumen_kg`):

```json
{
  "id": 9,
  "fecha": "2026-10-10",
  "registros": [{ "ejercicio_id": 1, "series": 3, "repeticiones": 8, "carga_kg": 32 }],
  "volumen_kg": 768
}
```

Series y repeticiones: enteros positivos (límites de interfaz: 100 y 500). Carga: de 0 a 1000 kg. Meta: mayor que cero, hasta 1000 kg. Edad: 18 a 120; talla: 0,50 a 2,50 m; peso: 20 a 400 kg. Estos límites son validaciones técnicas del proyecto, no recomendaciones de entrenamiento. Las fechas no pueden ser futuras. Rechazar fechas inexistentes.

Cada registro contiene series con la misma carga y repeticiones. Una misma sesión puede contener varias filas del mismo ejercicio. Si falla una fila, el backend revierte toda la sesión. Volumen = suma de series × repeticiones × carga de los registros; IMC = peso / talla². El frontend real representa estos resultados y no repite sus fórmulas.

## Progreso

GET `/progreso?ejercicio_id=1&desde=2026-09-01&hasta=2026-10-10`. Los tres filtros son opcionales; extremos de fecha inclusivos. Rechazar un intervalo invertido. La última medición corresponde al perfil y no se restringe por los filtros del entrenamiento.

```json
{
  "total_sesiones": 1,
  "volumen_total_kg": 768,
  "carga_maxima_kg": 32,
  "ultima_medicion": { "id": 4, "fecha": "2026-10-10", "peso_kg": 80, "imc": 26.12 },
  "puntos": [{ "fecha": "2026-10-10", "carga_kg": 32, "volumen_kg": 768 }]
}
```

Una fila de `puntos` por fecha, ordenada de forma ascendente. Para varios registros en una fecha: carga máxima y volumen sumado. Con ejercicio filtrado, contar sesiones que contienen ese ejercicio y sumar solo sus registros. Sin registros: totales cero, `carga_maxima_kg: null`, `puntos: []`. Sin mediciones: `ultima_medicion: null`. No rellenar fechas ausentes. Las sesiones recientes del dashboard se consultan como historial general, independiente de estos filtros.

## Metas y análisis

GET `/metas`: lista de `{ "id": 2, "ejercicio_id": 1, "carga_objetivo_kg": 50, "estado": "pendiente" }`. Estado: `pendiente` o `alcanzada`.

POST `/metas`: `{ "ejercicio_id": 1, "carga_objetivo_kg": 50 }`; devuelve la meta creada (201). Se admiten varias metas del mismo ejercicio; se selecciona una para analizar.

POST `/analisis`: `{ "ejercicio_id": 1, "meta_id": 2 }`. `meta_id` es opcional: sin meta, analizar tendencia sin estimar semanas hasta el objetivo. Validar que la meta pertenece a la cuenta y al ejercicio seleccionado.

```json
{
  "estado": "estimado",
  "mensaje": "La tendencia estimada es positiva.",
  "semanas_observadas": 8,
  "pendiente_kg_semana": 2,
  "siguiente_carga_kg": 48,
  "semanas_hasta_meta": 2,
  "historial": [
    { "semana": 0, "carga_kg": 32 },
    { "semana": 7, "carga_kg": 46 }
  ],
  "proyeccion": [
    { "semana": 7, "carga_kg": 46 },
    { "semana": 8, "carga_kg": 48 },
    { "semana": 9, "carga_kg": 50 }
  ]
}
```

El historial de este ejemplo está abreviado. `semana` representa intervalos de siete días desde la primera observación, empezando en cero; se conservan los saltos. Agrupar carga máxima semanal por cuenta y ejercicio. Al menos cuatro semanas distintas son necesarias. Entrenar LinearRegression en el backend y controlar datos no finitos.

| Estado                   | Comportamiento                                                           |
| ------------------------ | ------------------------------------------------------------------------ |
| `historial_insuficiente` | Sin proyección; indica cuántas semanas se observaron.                    |
| `meta_alcanzada`         | Informa cumplimiento; sin fecha futura de logro.                         |
| `sin_tendencia_positiva` | Informa tendencia nula o negativa; sin fecha de logro.                   |
| `estimado`               | Devuelve tendencia y proyección. Sin meta, `semanas_hasta_meta` es null. |

Para estados sin estimación: `siguiente_carga_kg` y `semanas_hasta_meta` son null; `proyeccion` es `[]`. `pendiente_kg_semana` puede ser null si no se ajusta el modelo. La interfaz distingue estos estados y no muestra una estimación anterior cuando una nueva solicitud falla.

## Errores y despliegue

Errores con `{"detail":"Mensaje comprensible"}` o validación Pydantic `{"detail":[{"loc":["body","campo"],"msg":"...","type":"..."}]}`. Usar 401 para sesión inválida, 403/404 para recursos no autorizados o no disponibles, 409 para conflictos y 422 para datos inválidos. No devolver detalles de SQL ni credenciales.

GET `/health` para comprobar disponibilidad. CORS debe permitir el origen del frontend, los métodos GET/POST/PATCH y los encabezados Authorization/Content-Type. En producción, frontend y API con HTTPS. PostgreSQL no se conecta desde React: únicamente FastAPI maneja SQLAlchemy, transacciones y credenciales.
