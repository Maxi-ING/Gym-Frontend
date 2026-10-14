import { test, expect } from '@playwright/test';

test('los paneles entran con movimiento y el teclado lo cancela sin ocultar contenido', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('.panel')).some(
      (panel) => panel.getAnimations().length > 0,
    ),
  );
  await page.evaluate(() =>
    document
      .querySelectorAll('.panel')
      .forEach((panel) => panel.getAnimations().forEach((animation) => animation.pause())),
  );
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).toHaveAttribute('data-input', 'keyboard');
  expect(
    await page
      .locator('.panel')
      .evaluateAll((panels) => panels.every((panel) => panel.getAnimations().length === 0)),
  ).toBe(true);
  await expect(page.getByRole('img', { name: /Volumen de entrenamiento/ })).toBeVisible();
  await page.getByRole('heading', { name: 'Sesiones recientes' }).scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('table', { name: 'Historial de sesiones de entrenamiento' }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('la preferencia del dispositivo mantiene la experiencia estática aunque la opción esté activada', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Configuración', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Apariencia' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Activar animaciones' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Reproducir demostración' })).toBeDisabled();
  await expect(page.getByText('Movimiento desactivado · vista estática')).toBeVisible();
  expect(
    await page
      .locator('.panel')
      .evaluateAll((panels) => panels.every((panel) => panel.getAnimations().length === 0)),
  ).toBe(true);
});
