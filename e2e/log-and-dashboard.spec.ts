import { test, expect } from '@playwright/test';

const authCookie = {
  name: 'e2e-mock-auth',
  value: 'true',
  domain: 'localhost',
  path: '/',
};

const quizCompleteCookie = {
  name: 'e2e-quiz-complete',
  value: 'true',
  domain: 'localhost',
  path: '/',
};

test.describe('Activity Logging', () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([authCookie, quizCompleteCookie]);
  });

  test('user can log a new transport activity', async ({ page }) => {
    // We mock the API route to avoid needing the database
    await page.route('/api/activities*', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          json: { logs: [] }
        });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          json: { log: { co2Kg: 17.1 } }
        });
      }
    });

    await page.goto('/log');
    
    // Check page load
    await expect(page.getByRole('heading', { name: /log activity/i })).toBeVisible();
    
    // Select transport and fill form
    await page.getByRole('tab', { name: /transport/i }).click();
    await page.getByLabel(/activity type/i).selectOption('car_petrol');
    await page.getByLabel(/amount/i).fill('100');
    
    // Wait for client-side CO2 preview
    await expect(page.getByText('≈ 17.10 kg CO₂')).toBeVisible();
    
    // Click submit
    await page.getByRole('button', { name: /log activity/i }).click();
    
    // Check toast
    await expect(page.getByText(/activity logged!/i)).toBeVisible();
  });
});
