import { test, expect } from '@playwright/test';

test('la demo distingue registros cambios y referencia de meta', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Análisis', exact: true })
    .click();
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByRole('button', { name: 'Analizar mi progreso', exact: true }).click();
  await expect(page.getByRole('img', { name: /Historial de/ })).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Cambios de carga entre semanas observadas' }),
  ).toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Última carga respecto a la meta' }),
  ).toHaveAttribute('value', '92');
  await expect(page.getByText('92 % de la carga objetivo')).toBeVisible();
  await expect(page.getByText('Mensajes mediante reglas', { exact: true })).toBeVisible();
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  await page.screenshot({
    path: `test-results/analisis-nuevo-${info.project.name}.png`,
    fullPage: true,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  async function navigate(label: string) {
    if (await menu.isVisible()) await menu.click();
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: label, exact: true })
      .click();
  }
  await navigate('Configuración');
  await page.getByLabel('Tema', { exact: true }).selectOption('claro');
  await navigate('Análisis');
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByRole('button', { name: 'Analizar mi progreso', exact: true }).click();
  const sample = page.locator('.legend-actual');
  await expect(sample).toBeVisible();
  const colors = await sample.evaluate((el) => ({
    line: getComputedStyle(el, '::before').borderTopColor,
    background: getComputedStyle(el.closest('.panel')!).backgroundColor,
  }));
  function luminance(color: string) {
    const channels = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((n) => n / 255)
      .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const line = luminance(colors.line);
  const background = luminance(colors.background);
  expect(
    (Math.max(line, background) + 0.05) / (Math.min(line, background) + 0.05),
  ).toBeGreaterThanOrEqual(3);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
  await page.screenshot({
    path: `test-results/analisis-claro-${info.project.name}.png`,
    fullPage: true,
  });
});

test('una tendencia negativa conserva el historial sin mostrar una fecha o predicción inventada', async ({
  page,
}) => {
  const headers = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  };
  await page.route('http://localhost:8000/**', async (route) => {
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
    if (path === '/metas')
      body = [{ id: 1, ejercicio_id: 1, carga_objetivo_kg: 90, estado: 'pendiente' }];
    if (path === '/analisis')
      body = {
        estado: 'sin_tendencia_positiva',
        mensaje: 'Sin tendencia positiva.',
        semanas_observadas: 4,
        pendiente_kg_semana: -1,
        siguiente_carga_kg: null,
        semanas_hasta_meta: null,
        historial: [
          { semana: 0, carga_kg: 70 },
          { semana: 1, carga_kg: 72 },
          { semana: 4, carga_kg: 65 },
          { semana: 5, carga_kg: 64 },
        ],
        proyeccion: [],
      };
    await route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  await page.goto('/analisis');
  await page.getByLabel('Correo electrónico').fill('sara@example.com');
  await page.getByLabel('Contraseña').fill('test-password');
  await page.getByRole('button', { name: 'Entrar a mi espacio' }).click();
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByLabel('Meta del análisis').selectOption('1');
  await page.getByRole('button', { name: 'Analizar mi progreso', exact: true }).click();
  await expect(page.getByText('Sin tendencia positiva.', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: /Historial de/ })).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Cambios de carga entre semanas observadas' }),
  ).toBeVisible();
  await expect(page.getByText('Siguiente estimación', { exact: true })).toHaveCount(0);
  await expect(page.locator('.legend-projection')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', String((64 / 90) * 100));
});
