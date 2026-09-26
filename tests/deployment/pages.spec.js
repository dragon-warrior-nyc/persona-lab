import { test, expect } from '@playwright/test';

test('production paper mock and bundled assets work under the repository path', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    if (new URL(response.url()).origin === 'http://127.0.0.1:4173') {
      if (!new URL(response.url()).pathname.startsWith('/persona-lab/')) {
        failures.push(`Request escaped repository path: ${response.url()}`);
      }
    }
  });
  page.on('requestfailed', request => failures.push(request.url()));

  await page.goto('./#workspace');
  await expect(page).toHaveURL(/\/persona-lab\/workshop\/mock\/index.html#workspace$/);
  for (const name of ['Landing', 'Workspace', 'Results']) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    const image = page.locator('#preview img');
    await expect(image).toHaveAttribute('src', `${name.toLowerCase()}.png`);
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.getByRole('link', { name: 'Back to workspace', exact: true }).click();
  await expect(page).toHaveURL(/#workspace$/);

  await page.getByRole('link', { name: 'Prepared assets + new brand logo' }).click();
  await expect(page.locator('#brand img')).toBeVisible();
  const images = page.locator('img');
  expect(await images.count()).toBeGreaterThan(10);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.getByRole('link', { name: 'Workshop instructions', exact: true }).click();
  await expect(page.locator('#guide')).not.toHaveText('Loading guide…');
  await expect(page.locator('#guide')).not.toContainText('Run npm run prepare:workshop');
  expect(await page.locator('#guide').textContent()).not.toBe('');
  expect(failures).toEqual([]);
});
