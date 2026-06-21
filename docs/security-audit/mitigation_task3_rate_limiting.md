# Mitigation Report: Rate Limiting & Abuse Prevention

## Objective
Protect public and authenticated API endpoints from brute-force attacks, credential stuffing, and resource exhaustion (specifically protecting the Supabase database and Gemini API quotas).

## Threat Model Context
- **Risk**: High.
- **Vulnerabilities Mitigated**:
  - API Abuse leading to Denial of Wallet (DoW) via Gemini API exhaustion.
  - Brute-forcing of authentication endpoints (`signup` and `signin`).
  - Database exhaustion via spamming gamification activity logs.

## Implementation Details

### 1. Rate Limiting Utility (`src/lib/rate-limit.ts`)
- Integrated `@upstash/ratelimit` and `@upstash/redis` for distributed, low-latency rate limiting.
- **Fail-Open Design**: Wrapped the Redis call in a `try/catch` block. If Upstash goes down or times out, the system fails open (allows the request) rather than bringing down the entire application, prioritizing availability.
- **E2E Bypass**: Implemented a bypass for Playwright E2E tests (`E2E_AUTH_BYPASS_ENABLED` flag combined with a secure mock cookie) to prevent the automated test suite from exhausting the local development Redis quota.

### 2. IP Spoofing Prevention
- Addressed a critical spoofing vulnerability where parsing `X-Forwarded-For` manually allowed attackers to easily rotate fake IPs and bypass the limits.
- **Resolution**: Relied strictly on Next.js's `request.ip` (which is secured automatically by hosting providers like Vercel) with a fallback to `127.0.0.1`. 

### 3. Endpoint Policies
- **Authentication (`/api/auth/signin`, `/api/auth/signup`)**: 
  - Strict limit: **5 requests per 15 minutes** per IP.
  - Mitigates brute-force and credential stuffing.
- **AI Insights (`/api/insights`)**: 
  - Strict limit: **10 requests per day** per IP.
  - Protects the Gemini API from rapid depletion.
  - *Note on NAT Trade-off*: For the hackathon context, rate limiting is performed before database queries to save DB hits. This relies on IP rather than User ID, which introduces a minor risk of NAT collisions for legitimate users on shared networks.
- **Activities (`/api/activities`)**: 
  - Moderate limit: **60 requests per minute** per IP.
  - Prevents automated bots from flooding the database with fake gamification logs.

## Verification
- Implementation was subjected to multiple rounds of strict code-quality review by the Feature Loop Orchestrator.
- Edge cases regarding `try/catch` on JSON parsing and IP spoofing were caught and fixed during the verification loop.
- Playwright E2E tests confirmed green after applying the testing bypass.
