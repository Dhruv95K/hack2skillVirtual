# Mitigation Report: Security Headers & CSP

## Objective
Harden the application frontend against client-side attacks, including Cross-Site Scripting (XSS), Clickjacking, and MIME-type sniffing, by implementing strict HTTP security headers and a Content Security Policy (CSP).

## Threat Model Context
- **Risk**: High.
- **Vulnerabilities Mitigated**:
  - Session Hijacking via XSS.
  - UI Redressing (Clickjacking).
  - Man-in-the-Middle (MitM) downgrade attacks.

## Implementation Details

### 1. HTTP Security Headers (`next.config.mjs`)
Implemented the following standard headers globally for all routes (`/(.*)`):
- **`Strict-Transport-Security`**: `max-age=63072000; includeSubDomains; preload`
  - Enforces HTTPS connections and prevents protocol downgrade attacks.
- **`X-Frame-Options`**: `SAMEORIGIN`
  - Mitigates clickjacking by preventing the site from being framed by malicious external domains.
- **`X-Content-Type-Options`**: `nosniff`
  - Prevents the browser from trying to guess the MIME type, stopping unauthorized script execution from incorrectly typed files.
- **`Referrer-Policy`**: `strict-origin-when-cross-origin`
  - Protects user privacy by ensuring sensitive URL paths are not leaked in the `Referer` header to external domains.
- **`Permissions-Policy`**: `camera=(), microphone=(), geolocation=()`
  - Explicitly denies access to sensitive browser APIs since the application does not require them.
- **`X-DNS-Prefetch-Control`**: `on`
  - Controls DNS prefetching for optimized loading of legitimate external resources.

### 2. Content Security Policy (CSP)
Designed a strict CSP to restrict resource loading to trusted origins:
- **Dynamic Configuration**: The config automatically parses the `NEXT_PUBLIC_SUPABASE_URL` from the environment and injects its origin into the `connect-src` directive. This ensures the Supabase database connection works flawlessly while keeping the policy strict.
- **Directives**:
  - `default-src 'self'`: Restricts all unspecified resource types to the application's own origin.
  - `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: Configured to allow Next.js fast refresh and client-side React hydration while maintaining baseline security.
  - `style-src 'self' 'unsafe-inline'`: Allows Tailwind CSS and inline styles.
  - `object-src 'none'`: Strictly blocks legacy plugins (e.g., Flash, Java).
  - `upgrade-insecure-requests`: Forces HTTP resources to load over HTTPS.

## Verification
- Code quality was verified by the Orchestrator loop.
- Ensured that `npm run build` completed successfully, confirming that the dynamic CSP parsing does not crash the Next.js build process when environment variables are injected.
