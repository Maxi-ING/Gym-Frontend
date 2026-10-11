import { test, expect, type Page } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
});
async function nav(page: Page, label: string) {
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: label, exact: true })
    .click();
  await settle(page);
}
async function settle(page: Page) {
  await expect(page.locator('.loading-state')).toHaveCount(0);
  if (await page.locator('.app-shell').count())
    await expect(page.locator('.app-shell')).not.toHaveClass(/menu-open/);
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
}
async function enter(page: Page, admin = false) {
  await page.goto('/');
  await page
    .getByRole('button', {
      name: admin ? 'Explorar demo de administrador' : 'Explorar demo',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', { name: admin ? 'Resumen del gimnasio' : 'Inicio, Alex.' }),
  ).toBeVisible();
}
async function width(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => innerWidth),
  );
}
test('admin gestiona una cuenta y el catálogo sin ejecutar el modelo', async ({ page }) => {
  let calls = 0;
  page.on('request', (r) => {
    if (r.url().startsWith('http://localhost:8000')) calls++;
  });
  await enter(page, true);
  await settle(page);
  await page.screenshot({
    path: `test-results/admin-inicio-${test.info().project.name}-${test.info().line}.png`,
    fullPage: true,
  });
  await nav(page, 'Usuarios');
  await page.getByRole('link', { name: 'Gestionar Valeria' }).click();
  await expect(page.getByRole('heading', { name: 'Valeria Torres', exact: true })).toBeVisible();
  await page.getByLabel('Estado de cuenta').selectOption('false');
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Actualizar la cuenta');
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByText('Cuenta activa · Usuario')).toBeVisible();
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await dialog.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('Cuenta inactiva · Usuario')).toBeVisible();
  await nav(page, 'Usuarios');
  await settle(page);
  await page.screenshot({
    path: `test-results/admin-usuarios-${test.info().project.name}.png`,
    fullPage: true,
  });
  await nav(page, 'Ejercicios');
  await page.getByLabel('Nombre del ejercicio').fill('Remo con barra');
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  await expect(page.getByRole('cell', { name: 'Remo con barra', exact: true })).toBeVisible();
  await page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: 'Remo con barra', exact: true }) })
    .getByRole('button', { name: 'Desactivar', exact: true })
    .click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmar' }).click();
  await expect(
    page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'Remo con barra', exact: true }) }),
  ).toContainText('Inactivo');
  await width(page);
  expect(calls).toBe(0);
});
test('admin confirma eliminación de sesiones y conserva su propio acceso', async ({ page }) => {
  await enter(page, true);
  await settle(page);
  await page.screenshot({
    path: `test-results/admin-inicio-${test.info().project.name}-${test.info().line}.png`,
    fullPage: true,
  });
  await nav(page, 'Entrenamientos');
  await page.getByRole('button', { name: 'Eliminar sesión', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Esta acción no puede deshacerse');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('7 resultados · Página 1 de 1')).toBeVisible();
  await nav(page, 'Usuarios');
  await page.getByRole('link', { name: 'Gestionar Max', exact: true }).click();
  await expect(page.getByLabel('Rol de cuenta')).toBeDisabled();
  await expect(page.getByLabel('Estado de cuenta')).toBeDisabled();
});
test('usuario no entra en administración ni dispara consultas administrativas', async ({
  page,
}) => {
  let calls = 0;
  page.on('request', (r) => {
    if (r.url().startsWith('http://localhost:8000/admin/')) calls++;
  });
  await enter(page);
  await page.goto('/usuarios');
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Usuarios', exact: true })).toHaveCount(0);
  expect(calls).toBe(0);
});
test('configuración conserva tema y movimiento por cuenta en el navegador', async ({ page }) => {
  await enter(page);
  await nav(page, 'Configuración');
  await page.getByLabel('Tema', { exact: true }).selectOption('claro');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('switch', { name: 'Activar animaciones' }).uncheck();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Configuración', exact: true })).toBeVisible();
  await expect(page.getByLabel('Tema', { exact: true })).toHaveValue('claro');
  await expect(page.getByRole('switch', { name: 'Activar animaciones' })).not.toBeChecked();
  await settle(page);
  await page.screenshot({
    path: `test-results/configuracion-clara-${test.info().project.name}.png`,
    fullPage: true,
  });
  await width(page);
});

test('la configuración es única y la demostración responde al interruptor y al dispositivo', async ({
  page,
}, info) => {
  await enter(page);
  await nav(page, 'Configuración');
  await expect(page.getByRole('switch', { name: 'Espaciado compacto' })).toHaveCount(0);
  await expect(page.locator('a[href="/configuracion"]')).toHaveCount(1);
  expect(await page.locator('html').getAttribute('data-density')).toBeNull();
  await page.getByRole('button', { name: 'Reproducir demostración' }).click();
  expect(
    await page
      .locator('.motion-preview-bars')
      .evaluate((el) => el.getAnimations({ subtree: true }).some((a) => a.playState === 'running')),
  ).toBe(true);
  await page.getByRole('switch', { name: 'Activar animaciones' }).uncheck();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Reproducir demostración' })).toBeDisabled();
  expect(
    await page
      .locator('.motion-preview-bars i')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await nav(page, 'Inicio');
  expect(
    await page.locator('.route-view').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await nav(page, 'Configuración');
  await page.getByRole('switch', { name: 'Activar animaciones' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  expect(
    await page
      .locator('.motion-preview-bars i')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('draw-bar');
  await settle(page);
  await page.screenshot({
    path: `test-results/movimiento-${info.project.name}.png`,
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('switch', { name: 'Activar animaciones' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Reproducir demostración' })).toBeDisabled();
  await expect(page.getByText(/Tu dispositivo solicita reducir movimiento/)).toBeVisible();
  await width(page);
});
test('filtra caracteres y cargas fuera del límite antes de guardar', async ({ page }) => {
  await enter(page);
  await nav(page, 'Entrenamiento');
  const load = page.getByLabel('Carga (kg)', { exact: true });
  await load.fill('50');
  await load.press('e');
  await expect(load).toHaveValue('50');
  await load.fill('601');
  await expect(load).toHaveValue('50');
  await expect(page.getByText(/Usa solo números entre 0 y 600/)).toBeVisible();
  await load.fill('600');
  await page.getByLabel('Ejercicio 1', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Guardar sesión' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sesión guardada' })).toBeVisible();
});
test('revisa el encuadre y las vistas en móvil y escritorio', async ({ page }, info) => {
  await page.goto('/');
  await width(page);
  if (info.project.name === 'desktop') {
    for (const [w, h] of [
      [1366, 768],
      [1280, 720],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(
        h,
      );
    }
  }
  await settle(page);
  await page.screenshot({ path: `test-results/acceso-${info.project.name}.png`, fullPage: true });
  await enter(page);
  await expect(page.getByRole('heading', { name: 'Rendimiento por ejercicio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Un siguiente paso con sentido' })).toBeVisible();
  await settle(page);
  await page.screenshot({
    path: `test-results/inicio-final-${info.project.name}.png`,
    fullPage: true,
  });
  if (info.project.name === 'desktop') {
    await page.getByRole('button', { name: 'Comprimir menú' }).click();
    await expect(page.locator('.app-shell')).toHaveClass(/shell-collapsed/);
    await page.getByRole('button', { name: 'Expandir menú' }).click();
  } else {
    await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir menú', exact: true })).toBeFocused();
  }
  await nav(page, 'Entrenamiento');
  await width(page);
  await settle(page);
  await page.screenshot({
    path: `test-results/entrenamiento-final-${info.project.name}.png`,
    fullPage: true,
  });
  await nav(page, 'Análisis IA');
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByRole('button', { name: 'Analizar mi progreso', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Tu historial muestra una dirección favorable' }),
  ).toBeVisible();
  await width(page);
  await settle(page);
  await page.screenshot({
    path: `test-results/analisis-final-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('link', { name: 'Mi perfil desde la cuenta' }).click();
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();
  await width(page);
  await settle(page);
  await page.screenshot({
    path: `test-results/perfil-final-${info.project.name}.png`,
    fullPage: true,
  });
});

test('prioriza los gráficos y cuenta una fecha solo una vez al registrar otra sesión', async ({
  page,
}, info) => {
  await enter(page);
  await settle(page);
  const evolution = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'La evolución de tu entrenamiento' }) });
  const activity = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Tu constancia en el gimnasio' }) });
  const summary = page.getByRole('region', { name: 'Resumen del entrenamiento' });
  const order = await Promise.all(
    [evolution, activity, summary].map((item) =>
      item.evaluate((el) => el.getBoundingClientRect().top),
    ),
  );
  if (info.project.name === 'desktop') {
    expect(Math.abs(order[0] - order[1])).toBeLessThan(2);
    await expect(evolution.getByRole('img')).toBeInViewport({ ratio: 0.95 });
    await expect(activity.getByRole('img')).toBeInViewport({ ratio: 0.95 });
  } else {
    expect(order[0]).toBeLessThan(order[1]);
  }
  expect(order[1]).toBeLessThan(order[2]);
  await expect(evolution.getByRole('img')).toBeVisible();
  await expect(activity.getByRole('img')).toBeVisible();
  const count = await activity.locator('.tag').innerText();
  await activity.getByText('Ver días registrados por semana').click();
  await expect(activity.locator('tbody tr')).toHaveCount(8);
  await activity.getByText('Ver días registrados por semana').click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `test-results/graficos-oscuro-${info.project.name}.png`,
    fullPage: false,
  });
  await activity.screenshot({ path: `test-results/constancia-${info.project.name}.png` });
  await nav(page, 'Entrenamiento');
  await page.getByLabel('Ejercicio 1', { exact: true }).selectOption('1');
  await page.getByLabel('Carga (kg)', { exact: true }).fill('40');
  await page.getByRole('button', { name: 'Guardar sesión' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sesión guardada' })).toBeVisible();
  await nav(page, 'Inicio');
  await expect(activity.locator('.tag')).toHaveText(count);
  await nav(page, 'Configuración');
  await page.getByLabel('Tema', { exact: true }).selectOption('claro');
  await nav(page, 'Inicio');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `test-results/graficos-claro-${info.project.name}.png`,
    fullPage: false,
  });
  await width(page);
  await nav(page, 'Análisis IA');
  await page.getByLabel('Ejercicio para analizar').selectOption('1');
  await page.getByRole('button', { name: 'Analizar mi progreso' }).click();
  const chart = page.getByRole('img', { name: /Historial de/ });
  await expect(chart).toBeVisible();
  const chartTop = await chart.evaluate((el) => el.getBoundingClientRect().top);
  const statsTop = await page
    .locator('.prediction-stats')
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(chartTop).toBeLessThan(statsTop);
  await width(page);
});
