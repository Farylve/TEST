import { test, expect } from '@playwright/test';

test('Home page loads and health endpoint returns OK', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Portfolio Application')).toBeVisible();

  await page.getByRole('button', { name: 'Health Check' }).click();
  await expect(page.locator('pre')).toContainText('"status": "OK"');
});