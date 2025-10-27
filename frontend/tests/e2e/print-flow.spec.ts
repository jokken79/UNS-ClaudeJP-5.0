import { test, expect } from '@playwright/test';

const candidateResponse = {
  id: 1,
  rirekisho_id: 'UNS-1001',
  receptionDate: '2024-04-01',
  nameKanji: '山田 太郎',
  nameFurigana: 'やまだ たろう',
  birthday: '1990-06-15',
  address: '東京都港区',
};

test('login → candidates → print preview', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => {};
  });

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'token', token_type: 'bearer' }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, username: 'demo', role: 'admin', email: 'demo@example.com' }),
    });
  });

  await page.route('**/api/dashboard**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ active_candidates: 10, hired_candidates: 4 }),
    });
  });

  await page.route('**/api/candidates/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(candidateResponse),
    });
  });

  await page.goto('/login');
  await page.fill('input[name="username"]', 'demo');
  await page.fill('input[name="password"]', 'secret');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard');

  await page.goto('/candidates/1/print');

  await expect(page.getByRole('heading', { name: '履歴書' })).toBeVisible();
  await expect(page.getByText('山田 太郎')).toBeVisible();
});
