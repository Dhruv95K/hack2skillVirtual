import { test, expect } from '@playwright/test';
import crypto from 'crypto';
test.describe('EcoTrack Full E2E Journey', () => {
  test('User can sign up, take quiz, log activity, and view insights', async ({
    page,
    context
  }) => {
    // Mock Signup to avoid Supabase rate limits
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
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const testEmail = `e2e-user-${uniqueId}@example.com`;
    const testPassword = 'Password123!';

    // 1. Landing Page
    await page.goto('/');
    await expect(page.getByRole('heading', {
      name: /Carbon Footprint/i
    }).first()).toBeVisible();

    // 2. Sign Up
    await page.getByRole('link', {
      name: /Start for Free/i
    }).first().click();
    await expect(page).toHaveURL(/.*\/signup/);
    await page.getByLabel(/^Name$/i).fill('E2E Test User');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(testPassword);
    await page.getByLabel(/Confirm Password/i).fill(testPassword);
    await page.getByRole('button', {
      name: /Sign Up/i
    }).click();

    // Check if there's any error text in red
    const errorMsg = page.locator('p.text-red-500');
    if (await errorMsg.isVisible({
      timeout: 2000
    }).catch(() => false)) {
      console.log('Signup error:', await errorMsg.textContent());
    }

    // 3. Quiz
    try {
      await page.waitForURL(/.*\/quiz/, {
        timeout: 15000
      });
    } catch (e) {
      console.log('Current URL on timeout:', page.url());
      console.log('Page text:', await page.locator('body').innerText());
      throw e;
    }
    await expect(page.getByRole('heading', {
      name: /your carbon footprint quiz/i
    })).toBeVisible();
    await page.getByLabel(/primary mode of daily transport/i).selectOption('car_petrol');
    await page.getByLabel(/how many km do you travel per week/i).fill('120');
    await page.getByLabel(/how many flights do you take per year/i).fill('2');
    await page.getByRole('button', {
      name: 'Next',
      exact: true
    }).click();
    await page.getByLabel(/how would you describe your diet/i).selectOption('vegan');
    await page.getByLabel(/how many meat meals do you eat per week/i).fill('0');
    await page.getByRole('button', {
      name: 'Next',
      exact: true
    }).click();
    await page.getByLabel(/what is your home size/i).selectOption('2bedroom');
    await page.getByLabel(/estimated monthly electricity use/i).fill('200');
    await Promise.all([page.waitForURL('**/dashboard'), page.getByRole('button', {
      name: /submit/i
    }).click()]);

    // 4. Dashboard
    await page.waitForURL(/.*\/dashboard/, {
      timeout: 10000
    });
    try {
      await expect(page.getByRole('heading', {
        name: /^Dashboard$/i
      })).toBeVisible({
        timeout: 5000
      });
    } catch (e) {
      console.log('Dashboard page text:', await page.locator('body').innerText());
      throw e;
    }

    // 5. Log Activity
    await page.getByRole('link', {
      name: /Log Activity/i
    }).first().click();
    await expect(page).toHaveURL(/.*\/log/);

    // Select transport category
    await page.getByRole('tab', {
      name: /Transport/i
    }).click();
    await page.getByLabel(/Activity Type/i).selectOption('car_petrol');
    await page.getByLabel(/Amount/i).fill('15');
    await page.getByRole('button', {
      name: /Log Activity/i
    }).click();

    // Wait for success toast
    await expect(page.getByText(/Activity logged/i)).toBeVisible();

    // 6. Insights
    await page.getByRole('link', {
      name: /Insights/i
    }).first().click();
    await expect(page).toHaveURL(/.*\/insights/);
    await expect(page.getByRole('heading', {
      name: /AI Insights/i
    })).toBeVisible();
    await page.getByRole('button', {
      name: /Generate/i
    }).click();
    await expect(page.getByText(/Fresh AI insights generated/i)).toBeVisible({
      timeout: 15000
    });

    // 7. Gamification
    await page.getByRole('link', {
      name: /Gamification/i
    }).first().click();
    await expect(page).toHaveURL(/.*\/gamification/);
    await expect(page.getByRole('heading', {
      name: /^My Progress$/i
    })).toBeVisible();
    // At least First Step badge should be earned
    await expect(page.getByText(/Earned/i).first()).toBeVisible();

    // 8. Offsets
    await page.getByRole('link', {
      name: /Offsets/i
    }).first().click();
    await expect(page).toHaveURL(/.*\/offsets/);
    await expect(page.getByRole('heading', {
      name: /Support Carbon Offset Programs/i
    })).toBeVisible();
    // Assuming there is an offset project
    await expect(page.getByRole('link', {
      name: /Visit .* website/i
    }).first()).toBeVisible();
  });
});