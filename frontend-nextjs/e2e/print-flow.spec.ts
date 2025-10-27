import { test, expect } from '@playwright/test';

test.describe('Print flow smoke test', () => {
  test('login screen renders primary actions', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });
});
