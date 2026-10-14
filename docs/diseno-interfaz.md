# Interfaz de hierro y datos

## Dirección aprobada

Negro carbón, gris acero y blanco. Acceso dividido entre una fotografía de pesas y el formulario. Panel de trabajo compacto con gráficos arriba. Animaciones breves, sin introducción bloqueante ni desplazamiento forzado. Referencias: Helias Oils (claridad), Lando Norris (movimiento selectivo) y Grab&Go Sobre (relato institucional).

La elección del usuario determina la dirección. Taste se aplica al acceso y a la sección Sobre; sus requisitos de cuatro fotografías y movimiento abundante no se trasladan al panel ni a este encargo ligero. No se añaden bibliotecas de animación.

## Fotografía

`public/images/weights.webp`: Brett Jordan, [Black and silver dumbbells on black steel rack](https://unsplash.com/photos/black-and-silver-dumbbells-on-black-steel-rack-NAENofLAWjE), licencia Unsplash. Imagen de ambientación, no de las instalaciones de PowerGym. Se almacena localmente para evitar solicitudes a terceros en cada visita.

## Alcance predictivo

Conservar el contrato actual. Gráficos descriptivos derivados del historial recibido: evolución, cambios de carga y relación de la última carga con la meta. Los cambios no acreditan mejora de fuerza sin controlar repeticiones. El modelo con comparación por repeticiones, validación temporal y avance desde un punto inicial se integrará posteriormente en el backend. No fabricar esos resultados en el frontend.

## Narrativa

La historia y los hitos de PowerGym Lima son ficticios y se identifican como parte del caso ilustrativo. No se añaden cifras de clientes, testimonios, reconocimientos ni instalaciones presentadas como verificadas.

## Skills del proyecto

Las tres skills están instaladas localmente en `.agents/skills`. Sus fuentes y huellas se registran en `skills-lock.json`; se pueden instalar de nuevo con `npm run skills:install`. No se versiona el código de terceros de las skills ni se incluye en el bundle de la aplicación.

| Before                                         | After                                | Why                                             |
| ---------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| Paneles azules con rótulos y acentos repetidos | Carbón y acero, encabezados directos | Priorizar los datos sin saturar la vista        |
| Entrada de vistas de 520 ms                    | Entrada de 240 ms                    | Responder con rapidez al cambio de página       |
| Desplazamiento de botones al pasar el puntero  | Respuesta breve al pulsar            | Evitar movimiento repetido en tareas frecuentes |

## Verificación del rediseño

- La paleta se aplica al acceso, panel personal, administración, formularios y gráficos.
- Tres vistas del análisis: historial y proyección disponible, cambios observados y relación de la última carga con la meta. La referencia de meta no representa un avance desde el punto inicial.
- Las semanas sin registros no se inventan como cargas cero. Los estados sin proyección mantienen su historial visible.
- El detector señaló un borde decorativo en avisos, reducido a 1 px. El indicador de día seleccionado en el calendario se conserva como estado funcional.
- El inspector de Taste no pudo iniciar Chromium en este entorno; la verificación visual y funcional se realiza con Playwright en escritorio y móvil y con una revisión independiente de las capturas. El requisito de abundante movimiento y cuatro imágenes se omite por el encargo explícito de una interfaz ligera.
- El modelo mejorado, las metas con repeticiones y sus migraciones quedan para el siguiente encargo de backend.

## Movimiento más expresivo

Se amplía el movimiento a petición del cliente, con CSS y Web Animations nativas, sin nuevas dependencias. Los paneles se revelan una sola vez al entrar en pantalla; no se ocultan permanentemente ni esperan una introducción. Las pantallas de usuario y administración comparten el mismo comportamiento.

| Before                                    | After                                                                                    | Why                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Vista completa con entrada vertical breve | Cambio horizontal de 280 ms y salida de 140 ms; fundido de respaldo                      | Dar continuidad al navegar sin retener la vista anterior |
| Paneles aparecen simultáneamente          | Entradas de 280 ms con escalonado limitado a 135 ms                                      | Guiar la mirada sin retrasar controles                   |
| Gráficos se animan a la vez               | Trazado progresivo de líneas y barras con retrasos acotados                              | Hacer más fácil seguir la aparición de la información    |
| Detalles se abren de golpe                | Entrada breve del contenido, diálogos y enlaces móviles                                  | Conectar el control con su resultado                     |
| Preferencia reduce CSS y gráficos         | Además cancela las entradas nativas; el teclado y el foco eliminan desplazamiento activo | Mantener accesibilidad e interacción inmediata           |

Se verifica el flujo completo en escritorio y móvil, incluyendo roles, menú, formularios, contraste, ausencia de desbordamiento y cancelación del movimiento. Las pruebas móviles utilizan emulación de navegador, no un dispositivo físico.
