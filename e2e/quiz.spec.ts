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

test.describe('Onboarding quiz', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([authCookie]);

    await page.route('**/api/quiz', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await context.addCookies([quizCompleteCookie]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          baseline: {
            transport: 1778.4,
            food: 982.8,
            energy: 1968,
            total: 4729.2,
          },
        }),
      });
    });
  });

  test('signed-in user can complete all 3 quiz steps and reach dashboard', async ({ page }) => {
    await page.goto('/quiz');

    await expect(
      page.getByRole('heading', { name: /your carbon footprint quiz/i })
    ).toBeVisible();

    await page.getByLabel(/primary mode of daily transport/i).selectOption('car_petrol');
    await page.getByLabel(/how many km do you travel per week/i).fill('120');
    await page.getByLabel(/how many flights do you take per year/i).fill('2');
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/how would you describe your diet/i).selectOption('vegan');
    await page.getByLabel(/how many meat meals do you eat per week/i).fill('0');
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByLabel(/what is your home size/i).selectOption('2bedroom');
    await page.getByLabel(/estimated monthly electricity use/i).fill('200');

    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.getByRole('button', { name: /submit/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('user who has done quiz is redirected from /quiz to /dashboard', async ({
    context,
    page,
  }) => {
    await context.addCookies([quizCompleteCookie]);

    await page.goto('/quiz');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
