# API & Input Security Assessment

This report details the findings from the security assessment of the EcoTrack application's API endpoints and input handling mechanisms, focusing on high-impact API and injection risks.

## 1. Missing Rate Limiting (High Severity)

### Vulnerability Description
The application completely lacks rate limiting across all its API endpoints. This is a critical architectural omission that exposes the system to several high-impact attacks.

### Affected Endpoints
* **Authentication (`/api/auth/signin`, `/api/auth/signup`)**: Highly susceptible to brute-force attacks and credential stuffing.
* **Data Logging (`/api/activities/route.ts`)**: Susceptible to API abuse where an attacker could flood the system with mock activities.
* **AI Insights (`/api/insights/route.ts`)**: Susceptible to Denial of Wallet / Resource Exhaustion attacks. This endpoint calls the external Google Gemini API. An attacker could rapidly hit this endpoint, exhausting the API quota or incurring significant financial costs.

### Impact & Exploitability
* **Severity**: High
* **Exploitability**: High. An attacker simply needs to write a script to repeatedly call the endpoints.
* **Mitigation**: Implement robust, tiered rate limiting using a solution like Redis. Specifically:
    * Strict rate limiting on authentication routes (e.g., 5 attempts per 15 minutes).
    * Moderate rate limiting on standard data endpoints.
    * Strict quota-based limiting on expensive operations like the AI Insights generation (e.g., 5 generations per day per user).

## 2. Inadequate Input Validation (Medium to High Severity)

### Vulnerability Description
While the application performs *some* basic validation, it lacks comprehensive, schema-based input validation, leaving it vulnerable to data pollution and potential edge-case injections.

### Affected Endpoints & Specific Issues

* **`/api/activities/route.ts` (POST)**
    * **Issue**: The endpoint manually checks `!category || !subType || quantity == null || !unit`. However, it does not strictly validate the length or format of string inputs (`subType`, `unit`). While `category` is checked against an allowlist, `subType` is not explicitly validated against a predefined schema before being passed to `calculateActivityCO2`.
    * **Exploitability**: Medium. An attacker could potentially pass excessively large strings or unexpected characters, which might cause errors downstream or pollute the database if not properly handled by Prisma.

* **`/api/auth/signup/route.ts` (POST)**
    * **Issue**: The endpoint only checks `password.length < 8`. It does not validate the format of the `email` (relying entirely on Supabase to reject it later) or the length/content of the `name` field.
    * **Exploitability**: Medium. An attacker could submit a `name` field containing a massive string, potentially leading to a Denial of Service (DoS) during processing or database insertion if Prisma doesn't enforce strict length limits.

* **`/api/quiz/route.ts` (POST)**
    * **Issue**: The quiz endpoint uses a custom validation function (`parseQuizResponses`). While it attempts to assert numeric ranges (`assertQuizNumberInRange`), relying on manual, custom parsing logic is error-prone compared to established schema validation libraries.
    * **Exploitability**: Low/Medium. The manual parsing seems reasonably robust, but complex edge cases might exist.

### Mitigation
* **Adopt Schema Validation**: Implement a robust validation library like **Zod** or **Yup** across all API routes. Define strict schemas for every incoming request body, ensuring that data types, string lengths, formats (e.g., email), and numeric ranges are explicitly validated before any processing occurs.

## 3. Server-Side Request Forgery (SSRF) Risk via External API (Low to Medium Severity)

### Vulnerability Description
The `/api/insights/route.ts` endpoint takes user data (activity logs) and formats it into a prompt sent to the Google Gemini API.

### Analysis
* While this is not a direct SSRF where the user controls a URL, the user *does* control the data being sent to the LLM. 
* **Prompt Injection**: An attacker could theoretically inject malicious instructions into the `subType` or `category` fields of their activity logs (if input validation fails) hoping to manipulate the LLM's output. However, because the LLM's output is parsed expecting a specific JSON structure (`parseTipsFromResponse`), the impact of a successful prompt injection is largely limited to generating malformed JSON that the application will reject, or generating silly tips.

### Mitigation
* Ensure strict input validation (as mentioned in section 2) on the activity logs to prevent unexpected characters from entering the prompt.
* Continue to rely on strict parsing of the LLM output, failing gracefully if the LLM deviates from the expected format.

## 4. Injection Risks (SQL/NoSQL) (Low Severity)

### Vulnerability Description
Injection attacks occur when untrusted data is sent to an interpreter as part of a command or query.

### Analysis
* **Status**: Secure. The application uses **Prisma ORM** for all database interactions (e.g., `await prisma.activityLog.findMany({ where: { userId } })`). 
* Because the application consistently uses Prisma's query builder methods instead of raw SQL strings, it is inherently protected against traditional SQL injection attacks.

## Summary

The most critical API security flaw in the EcoTrack application is the **complete absence of rate limiting**. This must be addressed immediately, especially on the authentication and AI insight endpoints, to prevent brute-force attacks and resource exhaustion.

Secondly, the application relies on manual, ad-hoc input validation. Transitioning to a strict, schema-based validation approach (e.g., using Zod) is highly recommended to ensure data integrity and prevent potential injection or data pollution attacks. The usage of Prisma ORM successfully mitigates direct SQL injection risks.
