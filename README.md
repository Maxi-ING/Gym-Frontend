# FitAnalytics AI · Frontend

Aplicación web para registrar entrenamientos y entender el progreso mediante gráficos, indicadores y estimaciones de carga. Desarrollada con **React, TypeScript, Vite y Chart.js**, con vistas para usuarios y administradores.

**[Ver aplicación](https://gym-frontend-beta-eight.vercel.app/)** · [Backend](https://github.com/Maxi-ING/GymAI-Backend) · [Swagger](https://gym-ai-backend-2ne5.onrender.com/docs)

Desde el acceso puedes elegir **Explorar demo** o **Explorar demo de administrador** para conocer ambos roles sin crear una cuenta.

## Funciones principales

- Registro, inicio de sesión, perfil y seguimiento de peso e IMC.
- Sesiones con varios ejercicios, series, repeticiones y cargas; historial agrupado con detalle.
- Panel con evolución, rendimiento por ejercicio, calendario de entrenamientos y metas.
- Análisis por ejercicio y repeticiones comparables, con proyección y mensajes que explican el resultado o la falta de datos fiables.
- Administración de usuarios, catálogo, sesiones y metas.
- Diseño adaptable a móvil, temas claro y oscuro, navegación plegable y animaciones configurables que respetan la preferencia de movimiento reducido.

## Integración y diseño

El código se organiza por funcionalidades en `src/features/`, con componentes reutilizables, contratos TypeScript y un cliente HTTP compartido. Los formularios validan los datos y muestran estados de carga, vacío y error. Los gráficos incluyen resúmenes y tablas de valores para facilitar su consulta.

El frontend consume FastAPI en Render; el backend valida los permisos y guarda los datos en PostgreSQL alojado en Supabase. La regresión lineal se ejecuta en el backend bajo solicitud, con mensajes mediante reglas, sin IA generativa.

La **demo utiliza datos ficticios en memoria**, se reinicia al recargar y muestra una predicción ilustrativa fija. El modo API utiliza cuentas y datos persistentes; no cambia automáticamente a la demo si el servidor falla.

## Ejecutar localmente

Requiere **Node.js 24**; el proyecto admite versiones desde 22.12.

```bash
git clone https://github.com/Maxi-ING/Gym-Frontend.git
cd Gym-Frontend
npm ci
```

Copia `.env.example` como `.env` y configura el backend:

```dotenv
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Abre [localhost:5173](http://localhost:5173). Puedes usar la demo sin iniciar el backend. `VITE_API_URL` es pública: no debe contener credenciales.

## Verificación

```bash
npm run format:check
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
```

GitHub Actions verifica formato, pruebas unitarias, compilación y recorridos de navegador en escritorio y móvil. La integración con la API y PostgreSQL reales se verifica también en el repositorio del backend.

## Documentación

- [Contrato de la API](docs/api-contract.md).
- [Diseño de interfaz y movimiento](docs/diseno-interfaz.md).

Publicado en **Vercel** desde `main`. El trabajo se integra mediante ramas `feature/*` → `dev` → `main` y commits atómicos en español.
