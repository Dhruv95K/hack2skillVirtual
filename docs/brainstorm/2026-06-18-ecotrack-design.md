# EcoTrack — Validated Design Document
> Generated: 2026-06-18 | Phase 1, Step 1: Brainstorming output

---

## Understanding Summary

- **What is being built:** A web app (Next.js 15 + React) that helps individuals understand, track, and reduce their personal carbon footprint.
- **Why it exists:** To bridge the gap between climate awareness and personal action through education, tracking, and AI-driven nudges.
- **Who it's for:** A spectrum — casual curious users (need simple onboarding) to engaged eco-trackers (want detailed logs & insights).
- **Core user loop:** Sign up → onboarding quiz (initial footprint estimate) → ongoing activity logging → AI-powered insights → progress dashboard → gamification rewards.
- **Key constraints:** Single repo, < 10 MB, hackathon scale (~500 users max), no SLA.
- **Explicit non-goals:** Social/community features, export/share report, native mobile app, live offset marketplace, real-time emission factor APIs.

---

## Feature Scope

### IN Scope (MVP)
- User authentication (signup / login) — custom-built UI calling Supabase Auth
- Carbon footprint onboarding quiz (lifestyle survey — Transport, Food, Home Energy)
- Manual activity logging (transport, food, home energy per entry with instant CO₂ preview)
- AI-generated personalized tips & action recommendations (Gemini API)
- Progress dashboard (Area/Line chart for CO₂ trend, Donut chart for category breakdown)
- Gamification (streaks, badges, level-up system for sustained reductions)
- Carbon offset suggestions (curated static list of 5–10 verified programs with links)

### OUT of Scope (future)
- Social / community features (compare with friends, leaderboards)
- Export / share report (PDF, image)
- Native mobile app
- Live offset marketplace with payments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 15 (App Router, API Routes) |
| UI Library | React + shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide SVG |
| Fonts | Fira Code (headings) + Fira Sans (body) via Google Fonts CDN |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (called from custom-built UI) |
| AI | Gemini API |
| Testing | Jest + React Testing Library + Playwright |
| Deploy | Vercel |
| Repo structure | Single monorepo |

---

## Architecture

- **Pattern:** Next.js App Router + Explicit REST API Routes (`/app/api/*`)
- **Data flow:** React Client → `fetch('/api/...')` → Route Handler → Supabase / Gemini API → JSON Response

### API Surface
| Route | Purpose |
|---|---|
| `POST /api/auth/signup` | Register new user |
| `POST /api/auth/signin` | Authenticate user |
| `POST /api/quiz` | Save quiz responses + compute initial footprint |
| `GET/POST /api/activities` | List / create activity log entries |
| `GET /api/dashboard` | Aggregated CO₂ data for charts |
| `POST /api/insights` | Call Gemini API + return personalized tips |
| `GET /api/gamification` | Badges, streak, level for user |
| `GET /api/offsets` | Static list of carbon offset programs |

---

## Data Models

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, from Supabase Auth |
| email | text | unique |
| name | text | |
| streak | int | consecutive days logged |
| level | int | derived from total_co2_saved |
| total_co2_saved | float | cumulative kg CO₂ saved vs. baseline |
| created_at | timestamptz | |

### `quiz_responses`
| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid (FK → users) |
| category | text (transport / food / energy) |
| question_key | text |
| answer | text |
| created_at | timestamptz |

### `activity_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid (FK) | |
| category | text | transport / food / energy |
| sub_type | text | e.g. "car_petrol", "beef", "electricity" |
| quantity | float | |
| unit | text | km, kg, kWh |
| co2_kg | float | calculated server-side using emission factors |
| logged_at | timestamptz | |

### `badges`
| Column | Type |
|---|---|
| id | uuid |
| name | text |
| description | text |
| icon | text (Lucide icon name) |
| threshold_type | text |
| threshold_value | float |

### `user_badges`
| Column | Type |
|---|---|
| user_id | uuid (FK) |
| badge_id | uuid (FK) |
| earned_at | timestamptz |

### `ai_insights`
| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid (FK) |
| content | text |
| generated_at | timestamptz |

---

## UI/UX Design System

- **Style:** Organic Biophilic — nature-inspired, earthy, sustainable, flowing organic shapes
- **Background:** `#020617` | **Surface:** `#0F172A` / `#1E293B` | **Accent:** `#22C55E` | **Text:** `#F8FAFC`
- **Typography:** Fira Code (headings/numbers) + Fira Sans (body); `font-display: swap`
- **Icons:** Lucide SVG only (no emoji in UI)
- **Charts:** Recharts — Area/Line for CO₂ trend; Donut for category breakdown
- **Animations:** Framer Motion — transitions, badge celebrates, card stagger; skeleton screens for loading; respects `prefers-reduced-motion`
- **Layout:** Sidebar nav (desktop), bottom nav (mobile), responsive at 375/768/1024/1440px
- **Landing page:** Hero → Value Props → 3 Key Features → CTA → Footer; sticky navbar CTA
- **Quiz:** Funnel pattern, multi-step progressive disclosure, progress bar
- **Effects:** Rounded corners 16–24px, organic curves, natural shadows, flowing SVG shapes
- **Gamification UI:** Badge grid (locked/unlocked), level progress bar, streak counter in nav

---

## Gamification Design

### `users` columns: `streak`, `level`, `total_co2_saved`

### Badges (seeded)
| Badge | Trigger |
|---|---|
| First Step | Log first activity |
| 7-Day Streak | 7 consecutive days logged |
| Green Commuter | 10 transport entries |
| Plant Power | 10 plant-based meal entries |
| Energy Saver | 10 home energy entries |
| Carbon Crusher | 100 kg CO₂ saved total |

### Level System (1–10)
Computed from `total_co2_saved` — Seedling (0) → Carbon Champion (10). Checked on every dashboard load.

---

## Assumptions

| # | Assumption |
|---|---|
| A1 | Gemini API key will be provided before build |
| A2 | Supabase project and credentials will be created before build |
| A3 | CO₂ calculation uses hardcoded emission factor tables (IPCC/DEFRA); no live API |
| A4 | Gamification is DB-based; no real-time push notifications |
| A5 | Offset suggestions are a static curated list (~5–10 programs); not a live marketplace |
| A6 | Repo size stays < 10 MB; no binary assets committed; `node_modules/` in `.gitignore` |

---

## Decision Log

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| Next.js 15 full-stack (single repo) | React+Express monorepo; Next.js+FastAPI | Least infra friction; 1-click Vercel deploy; Gemini key stays server-side |
| API Routes over Server Actions | Server Actions | Easier to test (Postman/supertest); clearer backend/frontend separation; review criterion |
| Supabase (PostgreSQL) | Neon + NextAuth; MongoDB Atlas | SQL is natural for relational data; Supabase Auth saves days; free tier generous |
| Gemini API for insights | OpenAI; rule-based | Matches the hackathon's Google tooling; good free/low-cost tier |
| Hardcoded emission factors | Live carbon data API | Zero external dependency risk; no rate limits; simpler; sufficient accuracy |
| Recharts for charts | Chart.js; ApexCharts | Native React; good Next.js compatibility; recommended by ui-ux-pro-max |
| Organic Biophilic design style | Glassmorphism; Brutalism | Best match for eco/sustainability; selected by ui-ux-pro-max from 67 styles |
| Fira Code + Fira Sans | Inter; Roboto | Dashboard/analytics feel; data-precision aesthetic; selected by ui-ux-pro-max |
