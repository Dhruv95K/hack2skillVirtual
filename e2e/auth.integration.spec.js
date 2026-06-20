import { test, expect } from '@playwright/test';
test.describe('Authentication', () => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const password = 'password123';
  test.beforeEach(async ({
    page,
    context
  }) => {
    // Mock Signup
    await page.route('/api/auth/signup', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        if (body.email && body.password.length >= 8) {
          await context.addCookies([{
            name: 'e2e-mock-auth',
            value: 'true',
            domain: 'localhost',
            path: '/'
          }]);
          await route.fulfill({
            status: 201,
            json: {
              user: {
                id: 'mock-id',
                email: body.email
              }
            }
          });
        } else {
          await route.fulfill({
            status: 400,
            json: {
              error: 'Invalid data'
            }
          });
        }
      } else {
        await route.continue();
      }
    });

    // Mock Signin
    await page.route('/api/auth/signin', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        if (body.password === 'wrongpassword') {
          await route.fulfill({
            status: 401,
            json: {
              error: 'Invalid credentials'
            }
          });
        } else {
          await context.addCookies([{
            name: 'e2e-mock-auth',
            value: 'true',
            domain: 'localhost',
            path: '/'
          }]);
          await route.fulfill({
            status: 200,
            json: {
              user: {
                id: 'mock-id',
                email: body.email
              }
            }
          });
        }
      } else {
        await route.continue();
      }
    });
  });
  test('unauthenticated access to /dashboard redirects to /signin', async ({
    page
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/signin/);
  });
  test('new user can sign up and is redirected to quiz', async ({
    page
  }) => {
    await page.goto('/signup');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/quiz/);
  });
  test('authenticated user visiting /signin is redirected to /dashboard', async ({
    page
  }) => {
    await page.goto('/signin');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Now visit /signin again
    await page.goto('/signin');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
  test('existing user can sign in and is redirected to dashboard', async ({
    page
  }) => {
    await page.goto('/signin');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
  test('wrong password shows error message', async ({
    page
  }) => {
    await page.goto('/signin');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});