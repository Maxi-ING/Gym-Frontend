import { test, expect, type Page } from '@playwright/test';

async function mockApi(page: Page, analysisBody?: Record<string, unknown>) {
  const captured: unknown[] = [];
  await page.route('http://localhost:8000/**', async (route) => {
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type,authorization',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const path = new URL(route.request().url()).pathname;
    let body: unknown = {};
    if (path === '/auth/login') body = { access_token: 'test-token', token_type: 'bearer' };
    if (path === '/me')
      body = {
        id: 9,
        nombre: 'Sara',
        correo: 'sara@example.com',
        rol: 'usuario',
        activo: true,
        perfil_completo: true,
        edad: 25,
        talla_m: 1.7,
        objetivo: 'Ganar fuerza',
      };
    if (path === '/ejercicios') body = [{ id: 1, nombre: 'Press de banca', unidad: 'kg' }];
    if (path === '/sesiones')
      body = [
        {
          id: 4,
          fecha: '2026-01-10',
          volumen_kg: 1140,
          registros: [
            {
              ejercicio_id: 99,
              ejercicio_nombre: 'Remo archivado',
              series: 3,
              repeticiones: 8,
              carga_kg: 30,
            },
            {
              ejercicio_id: 99,
              ejercicio_nombre: 'Remo archivado',
              series: 2,
              repeticiones: 6,
              carga_kg: 35,
            },
          ],
        },
      ];
    if (path === '/metas')
      body = [
        {
          id: 7,
          ejercicio_id: 1,
          carga_objetivo_kg: 90,
          repeticiones_objetivo: 6,
          estado: 'pendiente',
        },
      ];
    if (path === '/analisis') {
      captured.push(route.request().postDataJSON());
      body = analysisBody;
    }
    await route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return captured;
}

async function login(page: Page, path: string) {
  await page.goto(path);
  await page.getByLabel('Correo electrónico').fill('sara@example.com');
  await page.getByLabel('Contraseña').fill('test-password');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
}

test('agrupa registros y conserva el nombre de un ejercicio fuera del catálogo activo', async ({
  page,
}) => {
  await mockApi(page);
  await login(page, '/entrenamiento');
  const history = page.getByRole('table', { name: 'Historial de sesiones de entrenamiento' });
  await history.getByText('Ver ejercicios (1)', { exact: true }).click();
  await expect(history.locator('dt')).toHaveText('Remo archivado');
  await expect(history.getByText('3 series × 8 rep. × 30 kg', { exact: false })).toBeVisible();
  await expect(history.getByText('2 series × 6 rep. × 35 kg', { exact: false })).toBeVisible();
  await expect(history.locator('li')).toHaveCount(2);
});

test('una meta fija las repeticiones y un resultado no estimable conserva solo observaciones', async ({
  page,
}) => {
  const captured = await mockApi(page, {
    estado: 'no_estimable',
    mensaje: 'La variación es demasiado pequeña para estimar un plazo.',
    semanas_observadas: 4,
    pendiente_kg_semana: null,
    siguiente_carga_kg: null,
    semanas_hasta_meta: null,
    repeticiones_analizadas: 6,
    modelo_version: 'lineal_comparable_v2',
    error_mae_kg: 0.1,
    error_referencia_kg: 0.1,
    validaciones_temporales: 2,
    historial: [40, 40.1, 40, 40.1].map((carga_kg, semana) => ({ semana, carga_kg })),
    proyeccion: [],
  });
  await login(page, '/analisis');
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByLabel('Meta del análisis').selectOption('7');
  await expect(page.getByLabel('Repeticiones comparadas')).toHaveValue('6');
  await expect(page.getByLabel('Repeticiones comparadas')).toBeDisabled();
  await page.getByRole('button', { name: 'Analizar mi progreso', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No estimable con suficiente fiabilidad' }),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: /Historial de/ })).toBeVisible();
  await expect(page.locator('.legend-projection')).toHaveCount(0);
  await expect(page.getByText('Siguiente estimación', { exact: true })).toHaveCount(0);
  expect(captured).toEqual([{ ejercicio_id: 1, meta_id: 7, repeticiones: 6 }]);
});

test('explica una conexión lenta sin reenviar las credenciales', async ({ page }) => {
  await page.clock.install();
  let calls = 0;
  await page.route('http://localhost:8000/auth/login', async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 5500));
    await route.fulfill({
      status: 503,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type',
      },
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Servidor no disponible.' }),
    });
  });
  await page.route('http://localhost:8000/**', async (route) => {
    if (route.request().method() === 'OPTIONS')
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'content-type',
          'access-control-allow-methods': 'POST,OPTIONS',
        },
      });
    else await route.fallback();
  });
  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill('sara@example.com');
  await page.getByLabel('Contraseña').fill('test-password');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
  await page.clock.fastForward(4100);
  await expect(page.getByText(/Seguimos cargando/)).toBeVisible();
  expect(calls).toBe(1);
});
