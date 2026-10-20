# Convenciones del frontend

La interfaz utiliza React y TypeScript con Vite. Los componentes presentan los datos y los servicios llaman a FastAPI; la API valida permisos, ejecuta reglas y guarda en PostgreSQL. El navegador no accede directamente a las tablas.

## Nombres y responsabilidades

| Elemento                      | Regla                                  | Ejemplo real                         |
| ----------------------------- | -------------------------------------- | ------------------------------------ |
| Componentes y archivos React  | `PascalCase`                           | `RecordForm.tsx`, `SessionTable.tsx` |
| Tipos e interfaces            | `PascalCase`                           | `SessionInput`, `TrainingSession`    |
| Funciones y variables locales | `camelCase`                            | `validateSession`, `errorMessage`    |
| Hooks                         | Prefijo `use`                          | `useResource`, `useAuth`             |
| Variables de entorno          | `UPPER_SNAKE_CASE`                     | `VITE_API_URL`                       |
| Campos de la API              | Conservar el `snake_case` del contrato | `ejercicio_id`, `carga_kg`           |

`src/features/` agrupa cada funcionalidad. Los controles reutilizables están en `src/components/`, el comportamiento compartido en `src/hooks/`, el cliente HTTP en `src/lib/api.ts` y los contratos en `src/types/`. Se aplica `strict: true`; los parámetros y retornos se declaran o infieren con tipos concretos, sin recurrir a `any` para evitar comprobaciones.

Los comentarios explican decisiones o restricciones. Cuando una función compartida necesita una explicación adicional, se utiliza un comentario JSDoc breve; no se comenta cada instrucción.

## Ejemplo real de registro de entrenamiento

1. `RecordForm.tsx` recoge fecha y registros; `validateSession()` comprueba formatos, cantidades y límites.
2. `recordService.create()` envía `SessionInput` por `POST /sesiones` y recibe `TrainingSession`.
3. `api.ts` incorpora el token, procesa la respuesta y transforma fallos HTTP o de conexión en `ApiError`.
4. FastAPI valida de nuevo, comprueba la cuenta y los ejercicios y guarda la cabecera y los detalles en una transacción.
5. Tras recibir éxito, la vista actualiza el historial. Una respuesta tardía no equivale a un guardado confirmado; no se reintentan escrituras automáticamente.

Fragmento de `src/features/records/recordService.ts`:

```ts
create: (input: SessionInput) =>
  api<TrainingSession>('/sesiones', {
    method: 'POST',
    body: JSON.stringify(input),
  });
```

Las reglas de nombres, las cuatro tablas de ejemplo y el recorrido de las capas del backend se documentan en `docs/convenciones.md` del [repositorio de la API](https://github.com/Maxi-ING/GymAI-Backend).

## Validación y errores

Los campos del formulario validan fechas, enteros, decimales y rangos antes del envío; la validación definitiva corresponde al backend. React presenta texto sin insertar HTML proporcionado por el usuario. Los permisos visibles de las rutas no sustituyen la autorización de la API.

La interfaz muestra estados de carga, vacío y error. El cliente conserva el tiempo de espera de quince segundos e informa de una conexión inicial lenta. Nunca se guardan contraseñas, secretos de JWT ni credenciales de PostgreSQL en variables `VITE_*`, ya que son públicas. No se imprimen cuerpos de formularios ni tokens en la consola.

## Verificación y revisión

Ejecutar `npm run format:check`, `npm test`, `npm run build` y las pruebas de navegador indicadas en el README. Cada cambio se integra mediante una rama `feature/*` y un PR hacia `dev`, seguido de un PR hacia `main` para publicar.

Un compañero revisa los archivos y las comprobaciones desde su propia cuenta. Debe dejar observaciones o enviar **Review changes → Approve → Submit review** si está conforme. La aprobación no se inventa ni se sustituye por una integración automática.
