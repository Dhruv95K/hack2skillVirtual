# EcoTrack — Carbon Footprint & Climate Action Assistant

A full-stack, AI-powered carbon footprint tracker designed to help individuals understand, monitor, and significantly reduce their environmental impact through simple, gamified daily actions.

## Chosen Vertical

**Climate Action / Carbon Footprint Tracking** — helping users calculate their baseline emissions, track daily sustainable actions, and receive personalized AI insights to reduce their carbon footprint. This directly aligns with the goal of fostering environmental sustainability.

## How It Works

EcoTrack provides an intuitive, gamified user journey accessible across all devices:

1. **Onboarding Quiz** — Establish a baseline understanding of the user's lifestyle (dietary habits, typical commute, home energy usage) to calculate an initial carbon footprint estimate.
2. **Daily Activity Tracking** — Users log sustainable actions (e.g., taking public transit, eating a plant-based meal, hanging clothes to dry). The system automatically calculates the exact CO2 emissions saved based on verified, generalized emission factors.
3. **AI-Powered Climate Insights** — After logging activities, the app calls the Google Gemini 2.5 Flash API (server-side) with the user's recent history to generate highly personalized, actionable tips for further emission reductions.
4. **Dashboard & Data Visualization** — An interactive overview of the user's current level, streak counter, total CO2 saved, and responsive SVG charts showing trends across different emission categories (Transport, Diet, Energy).
5. **Gamification System** — Users earn badges, level up (e.g., from "Seedling" to "Tree"), and build daily streaks. This leverages positive reinforcement to build long-term sustainable habits.

## Approach and Logic

We prioritized **Security, Code Quality, Accessibility, and Efficiency** throughout the architecture:

- **Authentication & Security:** Email/password via Supabase Auth. Row Level Security (RLS) policies are strictly enforced so users can only access their own data. Input validation is applied to all activity logs.
- **AI Personalization:** Gemini 2.5 Flash analyzes specific activity patterns. The API call is made purely server-side so the API key is never exposed to the client, ensuring secure and efficient usage.
- **Data Storage:** Supabase Postgres (accessed via Prisma ORM) with tables for users, activities, and gamification metrics. The database schema includes optimized indexes for fast retrieval.
- **Performance & Efficiency:** Heavy use of React 19 Server Components minimizes the client-side JavaScript bundle. Next.js Data Cache and Route Cache prevent redundant API calls, ensuring high performance. The repository is kept lean (< 10 MB) by utilizing vector graphics over raster images.
- **Accessibility:** Designed inclusively with full keyboard navigability, semantic HTML, ARIA labels, and `prefers-reduced-motion` support for animations. The UI adheres to strict WCAG AA color contrast guidelines.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Next.js Route Handlers (Serverless API layer)
- **Database & Auth:** PostgreSQL via Supabase, Prisma ORM, Supabase Auth
- **AI:** Google Gemini 2.5 Flash (`@google/genai`)
- **Testing:** Jest (Unit/API tests) + Playwright (End-to-End browser tests)

## Assumptions

1. **Emission Factors:** The CO2 calculations use standard, generalized emission factors (e.g., kg CO2 per mile driven or per vegetarian meal) which are simplified approximations for gamification purposes. They are not intended for strict regulatory carbon accounting.
2. **AI Rate Limits:** For continuous automated End-to-End testing, we assume the AI provider (Gemini) could hit rate limits, so an E2E bypass mock is implemented to ensure test stability.
3. **Gamification Engagement:** We assume users are motivated by streaks, badges, and tangible "CO2 saved" metrics to return to the app daily.
4. **Authentication:** Email/password authentication is sufficient (no social auth required).

## Running Locally

1. Clone the repository
2. `npm install`
3. Create `.env.local` with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_prisma_direct_connection_string
   DIRECT_URL=your_supabase_connection_pooling_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the database migrations: `npx prisma db push`
5. Start the development server: `npm run dev` — open http://localhost:3000

## Running Tests

We utilize a robust testing suite for maximum code reliability.

**Unit and API Tests:**
```bash
npm test
```

**End-to-End (E2E) Journey Tests (Playwright):**
```bash
npx playwright test
```

