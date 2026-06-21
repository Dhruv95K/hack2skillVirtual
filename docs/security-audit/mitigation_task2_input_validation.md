# Mitigation Report: Strict Input Validation

## Objective
Prevent injection attacks, data pollution, and tampering with application state (e.g., gamification metrics) by enforcing strict validation on all incoming API payloads.

## Threat Model Context
- **Risk**: Medium to High.
- **Vulnerabilities Mitigated**:
  - Unrestricted payload size/types.
  - Data pollution in the gamification engine (e.g., submitting invalid categories or negative quantities to earn badges).
  - Weak user credentials leading to brute-force or dictionary attacks.

## Implementation Details

### 1. Auth & Signup (`src/app/api/auth/signup/route.js`)
- Replaced basic string checks with a strict `zod` schema.
- **Password Policy Hardened**: 
  - Minimum 8 characters.
  - Must contain at least one uppercase letter, one lowercase letter, and one number.
- **Email Validation**: Enforced strict email formatting.
- **Error Handling**: Wrapped `request.json()` in a `try/catch` block to handle malformed JSON and return a graceful `400 Bad Request`.

### 2. Gamification Activities (`src/app/api/activities/route.js`)
- Implemented a strict `zod` schema for activity logging payloads.
- **Category Enforcement**: Restricted `category` to a strict Enum (`['transport', 'food', 'energy']`) to match the Prisma schema and prevent arbitrary categories from entering the system.
- **Quantity Constraints**: Enforced that `quantity` must be a strictly positive number (preventing negative values used to manipulate CO2 metrics).
- **Unit Validation**: Ensured `unit` and `subType` are non-empty strings, mapping to the application's defined `ACTIVITY_UNITS`.

## Verification
- Comprehensive Test-Driven Development (TDD) was used using Jest.
- Unit tests were written to confirm that invalid payloads (e.g., negative quantities, unknown categories) are rejected with a `400 Bad Request` and structured error messages detailing the exact validation failure.
