# FitAnalytics AI · Frontend

Aplicación React y TypeScript para el seguimiento del entrenamiento de PowerGym Lima. Usa una estructura por funciones y consume la API FastAPI prevista para PC1 y PC2. La persistencia, los indicadores y el modelo de predicción corresponden al backend con SQLAlchemy y PostgreSQL en la nube.

## Ejecutar en tu equipo

Instala Node.js 24 (o una versión compatible a partir de 22.12). Después:

```bash
git clone https://github.com/Maxi-ING/Gym-Frontend.git
cd Gym-Frontend
git switch dev
npm ci
```

Copia `.env.example` como `.env`. En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configura la dirección del backend en `.env`:

```dotenv
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Abre `http://localhost:5173`. El botón **Explorar demo** permite revisar la interfaz sin instalar Python ni tener un backend funcionando.

## Funciones

- Registro e inicio de sesión; se muestran los errores del servidor.
- Modal obligatorio para completar edad, talla, peso y objetivo tras el primer acceso.
- Perfil editable y nuevas mediciones de peso.
- Registro de sesiones con varios ejercicios, series, repeticiones y cargas en kg.
- Dashboard con indicadores, gráficos y filtros por ejercicio y fecha.
- Metas de carga y análisis solicitado mediante un botón.
- Estados de carga, vacío, error y reintento; navegación adaptable a móvil.
- Gráficos con resumen y tabla de valores para consultar sin depender del canvas.

## Modo API y demostración

**API** es el modo predeterminado: los datos se solicitan a `VITE_API_URL`. No cambia a datos de ejemplo si falla el servidor. El token se conserva en `sessionStorage` en la pestaña; se elimina al cerrar sesión o recibir un 401 autenticado. Las rutas no envían un `usuario_id` como autorización.

**Demo** se activa expresamente desde el acceso. Usa un adaptador local con datos ficticios. Los cambios se reinician al recargar la aplicación; no se envían a PostgreSQL. La predicción de Press de banca es el ejemplo fijo de ocho semanas del informe y no se recalcula al añadir sesiones o metas. Los demás ejercicios muestran un mensaje informativo.

El frontend está implementado; la integración con un backend real se completa cuando FastAPI responda según [el contrato de la API](docs/api-contract.md). Las pruebas HTTP interceptan respuestas de ejemplo y no acreditan un despliegue ni persistencia real en la nube.

## Estructura

```text
src/
  main.tsx
  App.tsx
  features/
    users/          # acceso, perfil, modal inicial y userService
    records/        # RecordForm, historial y recordService
    dashboard/      # DashboardPage, MetricsCards y ProgressChart
    predictions/    # PredictionPage, PredictionChart y predictionService
  components/       # Button, Input, Select, navegación y estados
  hooks/            # consultas cancelables y ciclo de vida de gráficos
  lib/              # api, sesión, formato y adaptador de demostración
  types/            # contratos de datos
```

La raíz del repositorio representa `frontend/` en el esquema del proyecto. No se añade una carpeta duplicada.

## Verificar

```bash
npm test
npm run build
npm run format:check
npx playwright install chromium --only-shell
npm run test:e2e
```

Las pruebas incluyen validación, contrato HTTP, aislamiento de demo, perfil inicial, guardado y gráficos en escritorio y móvil. Para revisar una compilación local: `npm run preview` y abre `http://localhost:4173`.

## Ramas y commits

`dev` nace de `main`. Las ramas `feature/base-interfaz`, `feature/usuarios`, `feature/entrenamiento`, `feature/dashboard`, `feature/predicciones` y `feature/verificacion` separan el trabajo. Cada rama se integra mediante un pull request hacia `dev`, conservando los commits individuales y sus descripciones breves en español. Después de integrar las funciones y superar las verificaciones, un pull request de `dev` hacia `main` incorpora la versión estable. La rama `backup/dev-antes-pull-requests` conserva la integración original como respaldo.

## Publicar en Vercel

Importa este repositorio, selecciona `main` para producción o `dev` para revisar cambios en desarrollo y utiliza el preset Vite: comando `npm run build`, directorio `dist`. Agrega `VITE_API_URL` con la dirección **HTTPS** de FastAPI y vuelve a desplegar si cambias esa variable. `vercel.json` permite abrir directamente las rutas `/perfil`, `/entrenamiento` y `/analisis`.

En FastAPI configura CORS con el origen exacto del frontend. Nunca coloques contraseñas de PostgreSQL, secretos de JWT o claves privadas en variables `VITE_*`: se incluyen en el JavaScript público. El despliegue no se ejecuta como parte de la generación de este repositorio.
