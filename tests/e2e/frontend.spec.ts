import { test, expect, type Page } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
});
async function navigate(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: label, exact: true })
    .click();
}
async function demo(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
}
test('la demo recorre entrenamiento, progreso y análisis sin usar la API', async ({ page }) => {
  let apiCalls = 0;
  page.on('request', (request) => {
    if (request.url().startsWith('http://localhost:8000')) apiCalls++;
  });
  await demo(page);
  await navigate(page, 'Entrenamiento');
  await page.getByLabel('Ejercicio 1', { exact: true }).selectOption('1');
  await page.getByLabel('Carga (kg)', { exact: true }).fill('52');
  await page.getByRole('button', { name: 'Guardar sesión' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sesión guardada' })).toBeVisible();
  await expect(page.getByText('9 sesiones', { exact: true })).toBeVisible();
  await navigate(page, 'Inicio');
  await page.getByText('Filtrar por ejercicio y fechas', { exact: true }).click();
  await page.getByLabel('Ejercicio', { exact: true }).selectOption('1');
  await expect(page.getByRole('heading', { name: 'Evolución de la carga' })).toBeVisible();
  await navigate(page, 'Análisis');
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByRole('button', { name: 'Ver ejemplo de predicción', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '2. Historial y predicción disponible' }),
  ).toBeVisible();
  await expect(page.getByText('48 kg', { exact: true })).toBeVisible();
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByLabel('Abrir menú de cuenta', { exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  expect(apiCalls).toBe(0);
});
test('muestra errores de acceso y no simula un inicio de sesión', async ({ page }) => {
  await page.route('http://localhost:8000/**', async (route) => {
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'content-type',
        },
      });
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ detail: 'Credenciales incorrectas' }),
    });
  });
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill('persona@example.com');
  await page.getByLabel('Contraseña').fill('incorrecta');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
  await expect(page.getByRole('alert')).toContainText('Credenciales incorrectas');
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
});
test('completa el perfil, guarda en la API y representa historial insuficiente', async ({
  page,
}) => {
  let completed = false;
  let sessionBody: unknown;
  let authenticated = false;
  const user = {
    id: 8,
    nombre: 'Max',
    correo: 'max@example.com',
    edad: null,
    talla_m: null,
    objetivo: null,
    perfil_completo: false,
  };
  const headers = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
  };
  await page.route('http://localhost:8000/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    let body: unknown = {};
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (path === '/auth/login') body = { access_token: 'test-token', token_type: 'bearer' };
    if (path === '/me' && method === 'GET') body = { ...user, perfil_completo: completed };
    if (path === '/me' && method === 'PATCH') {
      completed = true;
      body = { ...user, ...request.postDataJSON(), perfil_completo: true };
    }
    if (path === '/ejercicios') body = [{ id: 2, nombre: 'Sentadilla', unidad: 'kg' }];
    if (path === '/sesiones' && method === 'GET') body = [];
    if (path === '/sesiones' && method === 'POST') {
      sessionBody = request.postDataJSON();
      authenticated = request.headers().authorization === 'Bearer test-token';
      body = { id: 9, ...request.postDataJSON(), volumen_kg: 1200 };
    }
    if (path === '/progreso')
      body = {
        total_sesiones: 0,
        volumen_total_kg: 0,
        carga_maxima_kg: null,
        ultima_medicion: null,
        puntos: [],
      };
    if (path === '/inicio')
      body = {
        progreso: {
          total_sesiones: 0,
          volumen_total_kg: 0,
          carga_maxima_kg: null,
          ultima_medicion: null,
          puntos: [],
        },
        rendimiento: [],
        metas: [],
        ultimo_analisis: null,
        recomendaciones: [],
      };
    if (path === '/metas') body = [];
    if (path === '/analisis/disponibilidad')
      body = {
        ejercicio_id: 1,
        minimo_semanas: 4,
        grupos: [{ repeticiones: 8, semanas: 1, registros: 1, ultima_fecha: '2026-10-21' }],
      };
    if (path === '/analisis')
      body = {
        estado: 'historial_insuficiente',
        mensaje: 'Aún faltan semanas de entrenamiento.',
        semanas_observadas: 1,
        pendiente_kg_semana: null,
        siguiente_carga_kg: null,
        semanas_hasta_meta: null,
        historial: [],
        proyeccion: [],
      };
    await route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill(user.correo);
  await page.getByLabel('Contraseña').fill('password123');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Edad', { exact: true }).fill('20');
  await dialog.getByLabel('Talla (m)').fill('1.75');
  await dialog.getByLabel('Peso actual (kg)').fill('80');
  await dialog.getByLabel('Objetivo', { exact: true }).selectOption('Ganar fuerza');
  await dialog.getByRole('button', { name: 'Guardar perfil' }).click();
  await expect(dialog).not.toBeVisible();
  await navigate(page, 'Entrenamiento');
  await page.getByLabel('Ejercicio 1', { exact: true }).selectOption('2');
  await page.getByLabel('Carga (kg)', { exact: true }).fill('50');
  await page.getByRole('button', { name: 'Guardar sesión' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sesión guardada' })).toBeVisible();
  expect(authenticated).toBe(true);
  expect(sessionBody).not.toHaveProperty('usuario_id');
  await navigate(page, 'Análisis');
  await page.getByLabel('Ejercicio para analizar').selectOption('2');
  await page.getByRole('button', { name: 'Ver mi historial', exact: true }).click();
  await expect(page.getByText('Aún faltan semanas de entrenamiento.')).toBeVisible();
  await expect(page.getByText('Siguiente estimación', { exact: true })).toHaveCount(0);
});
test('se adapta al ancho de pantalla y dibuja el dashboard sin errores', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await demo(page);
  await expect(page.getByRole('img', { name: /Volumen de entrenamiento/ })).toBeVisible();
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  for (const label of ['Inicio', 'Entrenamiento', 'Análisis', 'Configuración']) {
    await expect(navigation.getByRole('link', { name: label, exact: true })).toBeInViewport();
  }
  const close = page.getByRole('button', { name: 'Cerrar navegación', exact: true });
  if (await close.isVisible()) await close.click();
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
  await page.screenshot({
    path: `test-results/dashboard-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
