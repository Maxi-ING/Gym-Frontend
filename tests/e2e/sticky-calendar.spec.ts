import { test, expect, type Page } from '@playwright/test';
async function navigate(page: Page, name: string) {
  const button = page.getByRole('button', { name: 'Abrir menú', exact: true });
  if (await button.isVisible()) await button.click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name, exact: true })
    .click();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  );
}

test('la barra superior permanece visible en las vistas de usuario y administrador', async ({
  page,
}, info) => {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  for (const admin of [false, true]) {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page
      .getByRole('button', {
        name: admin ? 'Explorar demo de administrador' : 'Explorar demo',
        exact: true,
      })
      .click();
    await expect(
      page.getByRole('heading', { name: admin ? 'Resumen del gimnasio' : 'Inicio, Alex.' }),
    ).toBeVisible();
    const links = admin
      ? ['Inicio', 'Usuarios', 'Entrenamientos', 'Ejercicios', 'Configuración']
      : ['Inicio', 'Entrenamiento', 'Análisis IA', 'Configuración'];
    for (const link of links) {
      await navigate(page, link);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const header = page.locator('.topbar');
      await expect(header).toBeInViewport({ ratio: 1 });
      expect(Math.abs((await header.boundingBox())!.y)).toBeLessThan(2);
      await expect(header.locator('.topbar-title strong')).toHaveText(link);
      if (!admin && link === 'Configuración')
        await page.screenshot({ path: `test-results/barra-fija-${info.project.name}.png` });
    }
    await page.getByRole('link', { name: 'Mi perfil desde la cuenta' }).click();
    await expect(page.locator('.topbar-title strong')).toHaveText('Mi perfil');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.topbar')).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
