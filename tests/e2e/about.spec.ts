import { test, expect } from '@playwright/test';

test('la historia pública identifica el caso ficticio y conserva el acceso al panel', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/acceso-nuevo-${info.project.name}.png` });
  await page.getByRole('link', { name: 'Sobre nosotros', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fuerza con propósito.' })).toBeVisible();
  await expect(
    page.getByText(/Su historia y los hitos de esta sección son ficticios/),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nuestra historia', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/sobre-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Volver al acceso' }).click();
  await page.getByRole('button', { name: 'Explorar demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio, Alex.' })).toBeVisible();
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', { name: 'Sobre nosotros', exact: true }).click();
  await expect(page.locator('.topbar-title strong')).toHaveText('Sobre nosotros');
  await page.getByRole('link', { name: 'Volver a mi espacio' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar entrenamiento' })).toBeVisible();
  expect(errors).toEqual([]);
});
