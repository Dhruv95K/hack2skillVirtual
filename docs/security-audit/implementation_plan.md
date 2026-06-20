# Security Hardening Implementation Plan

This plan details the concrete remediation steps for the vulnerabilities identified across all security audits (`threat_model.md`, `auth_review.md`, and `api_input_review.md`). It maps findings to actionable code changes and verification steps.

## User Review Required

> [!CAUTION]
> **E2E Test Bypass Removal:** I am proposing to completely remove the E2E authentication bypass backdoor from the API routes and middleware. This means your E2E tests (if any) will need to authenticate as a real user via Supabase. If you rely heavily on this bypass for testing, please let me know, and we can discuss a safer alternative.

> [!WARNING]
> **Auto-Confirmation in Signup:** The audit flagged auto-confirmation as a risk. However, removing it requires setting up email sending in Supabase and changing the user flow. For this hackathon, I propose we **keep** the auto-confirmation but harden the **password policy** (require uppercase, lowercase, numbers, and min 8 chars). Please confirm if this tradeoff is acceptable.

## Proposed Changes

### 1. Address Critical E2E Bypass Backdoor (Auth Review)
* **Description:** The `E2E_AUTH_BYPASS_ENABLED` flag creates a critical backdoor if accidentally deployed.
* **Action:** Remove the E2E bypass logic from all production API routes and middleware.
* **Files to Modify:**
  * `src/middleware.ts`
  * `src/app/api/activities/route.ts`
  * `src/app/api/gamification/route.ts`
  * `src/app/api/insights/route.ts`
  * `src/app/api/quiz/route.ts`

### 2. Implement Strict Input Validation (API Review & Threat Model)
* **Description:** API routes currently use ad-hoc validation. We will use `zod` to enforce strict schema validation to prevent injection, data pollution, and tampering with gamification data.
* **Action:** Define Zod schemas for incoming POST payloads and validate them before processing.
* **Files to Modify:**
  * `src/app/api/activities/route.ts`: Validate `category`, `subType`, `quantity` (positive number), `unit`.
  * `src/app/api/auth/signup/route.ts`: Validate `email` (format), `name` (length limits), and `password` (complexity requirements).

### 3. Implement Rate Limiting (API Review & Threat Model)
* **Description:** The APIs are vulnerable to brute-force and resource exhaustion. The threat model specifically highlights exhaustion of Gemini API limits.
* **Action:** Implement a lightweight rate-limiting utility (using an in-memory store for the hackathon, or `@upstash/ratelimit` if a Redis instance is available).
* **Files to Modify:**
  * `src/lib/rate-limit.ts` (NEW): Create a basic rate-limiting utility.
  * `src/app/api/auth/signin/route.ts`: Strict limit (e.g., 5 requests / 15 min).
  * `src/app/api/insights/route.ts`: Strict limit (e.g., 10 requests / day per user) to protect Gemini API quota.
  * `src/app/api/activities/route.ts`: Moderate limit (e.g., 60 requests / minute).

### 4. Implement Security Headers / CSP (Threat Model)
* **Description:** The threat model identified Session Hijacking via XSS as a High-impact risk. While Next.js escapes React output, defense-in-depth requires HTTP security headers.
* **Action:** Configure `next.config.ts` (or `next.config.js`) to include strict Content Security Policy (CSP), X-Frame-Options, and other security headers.
* **Files to Modify:**
  * `next.config.ts` (or `next.config.js`)

### 5. Secrets Management Verification (Threat Model)
* **Description:** Ensure sensitive keys (like `GEMINI_API_KEY` and `DATABASE_URL`) are not exposed to the client.
* **Action:** Grep the codebase to guarantee that no sensitive environment variables are prefixed with `NEXT_PUBLIC_` or mistakenly exposed in client-side bundles.

### 6. Setup SAST Configuration
* **Description:** Integrate Static Application Security Testing (SAST) to automatically catch vulnerabilities in the future.
* **Action:** Add a GitHub Actions workflow that runs Semgrep on the codebase on every pull request and push to main.
* **Files to Modify:**
  * `.github/workflows/sast.yml` (NEW): Semgrep configuration.

## Verification Plan

### Automated Verification
* **Input Validation**: Construct curl requests with invalid data (missing fields, weak passwords, incorrect types) and verify the API returns a `400 Bad Request` with appropriate error details.
* **Rate Limiting**: Run a script to send requests rapidly and verify that a `429 Too Many Requests` response is returned once the threshold is exceeded.
* **Security Headers**: Use `curl -I` to fetch a page and verify that `Content-Security-Policy`, `X-Frame-Options`, and `Strict-Transport-Security` headers are present.

### Manual Verification
* Review `next.config.ts` and `.env` files to ensure no sensitive keys are prefixed with `NEXT_PUBLIC_`.
* Verify that standard sign-up, sign-in, and activity logging still work as expected in the UI.
* Verify the newly established password policy is properly enforced during sign up.
