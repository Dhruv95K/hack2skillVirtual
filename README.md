# EcoTrack 🌿

An intelligent, AI-powered assistant designed to help individuals understand, track, and significantly reduce their carbon footprint through personalized, contextual actions.

## 1. Chosen Vertical: Climate Action / Carbon Footprint Tracking

EcoTrack falls into the sustainability and climate action vertical. It empowers everyday users to take control of their environmental impact by measuring their daily activities, gaining AI-driven insights, and discovering practical ways to reduce their emissions or offset them.

## 2. Approach and Logic

We built EcoTrack around a simple, gamified user journey:
*   **Onboarding Quiz:** Establish a baseline understanding of the user's lifestyle (diet, commute, home energy) to calculate an initial carbon footprint estimate.
*   **Activity Tracking:** Users log daily activities (e.g., using public transport, eating a plant-based meal, saving energy at home). The system automatically calculates the CO2 emissions saved based on verified emission factors.
*   **AI Insights:** Rather than presenting users with static facts, the platform uses Gemini AI to analyze their specific activity patterns and offer highly personalized, actionable tips to further reduce their footprint.
*   **Gamification:** Users earn badges, level up (e.g., from "Seedling" to "Tree"), and build streaks. This leverages positive reinforcement to build long-term sustainable habits.
*   **Offsets:** For emissions that cannot be reduced, users are directed to verified carbon offset programs.

The system emphasizes speed, accessibility, and offline resilience, ensuring that taking climate action is as frictionless as possible.

## 3. How the Solution Works

EcoTrack is a modern full-stack web application built with **Next.js 15 (App Router)** and **React 19**.

### Architecture & Tech Stack

*   **Frontend:** React 19, Tailwind CSS, Framer Motion (for fluid, accessible animations), Recharts (for data visualization).
*   **Backend:** Next.js Route Handlers provide a robust, serverless API layer.
*   **Database:** PostgreSQL (via Supabase), accessed through Prisma ORM for type-safe database interactions.
*   **Authentication:** Supabase Auth for secure user sign-up and sign-in.
*   **AI Integration:** `@google/genai` (Gemini 2.5 Flash) is used to generate personalized, context-aware insights based on the user's recent activity logs.
*   **Testing:** Jest for unit/API testing, Playwright for End-to-End (E2E) testing.

### ASCII Architecture Diagram

```text
+-------------------+       +--------------------+       +-------------------+
|                   |       |                    |       |                   |
|   User Browser    | <---> |   Next.js Server   | <---> |  Supabase / PostgreSQL |
|  (React 19, UI)   |       |  (Route Handlers)  |       |  (Auth & DB)      |
|                   |       |                    |       |                   |
+-------------------+       +--------------------+       +-------------------+
                                      |
                                      v
                            +--------------------+
                            |                    |
                            |   Gemini API       |
                            | (Personalized Tips)|
                            |                    |
                            +--------------------+
```

## 4. Assumptions Made

*   **Emission Factors:** The CO2 calculations use standard, generalized emission factors (e.g., kg CO2 per mile driven or per vegetarian meal) which are simplified approximations for gamification purposes. They are not intended for strict regulatory carbon accounting.
*   **AI Rate Limits:** For continuous automated End-to-End testing, we assume the AI provider (Gemini) could hit rate limits, so we implemented an E2E bypass mock to ensure test stability without exhausting quota.
*   **Design System:** We assumed a "strictly dark mode, biophilic" design aesthetic to convey an organic, modern, and energy-efficient vibe that aligns with the sustainability theme.
*   **Gamification Engagement:** We assume that users are motivated by streaks, badges, and tangible "CO2 saved" metrics to return to the app daily.

## 5. Setup Instructions

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:** Create a `.env.local` file with the following variables:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `DATABASE_URL` (Direct Prisma connection string)
    *   `DIRECT_URL` (Supabase connection pooling)
    *   `GEMINI_API_KEY` (For AI insights)
4.  **Database Migration:**
    ```bash
    npx prisma db push
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
6.  **Run Tests:**
    *   Unit Tests: `npm run test`
    *   E2E Tests: `npx playwright test`

## 6. Hackathon Constraints Check
* **Repo Size:** < 10 MB (Verified: ~314 KB).
* **Code Quality & Accessibility:** Fully checked with `ui-ux-pro-max` guidelines, including `useReducedMotion` support.
* **E2E Validation:** Full journey validated with Playwright.
