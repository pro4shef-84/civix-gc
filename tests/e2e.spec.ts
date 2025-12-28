import { test, expect } from '@playwright/test';

const email = 'demo@gc.com';
const password = 'password';

test('full flow', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('http://localhost:3000/');

  await page.fill('input[name="name"]', 'Playwright Project');
  await page.click('button:has-text("Create")');
  await expect(page.locator('text=Playwright Project')).toBeVisible({ timeout: 5000 });
});
