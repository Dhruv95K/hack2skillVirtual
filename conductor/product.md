# EcoTrack — Product Context

## Product Name
**EcoTrack**

## One-Line Description
A web app that helps individuals understand, track, and reduce their personal carbon footprint through AI-powered insights and gamified challenges.

## Problem Statement
Most people are aware of climate change but don't know their personal impact or where to start reducing it. Existing tools are either too complex or too generic. EcoTrack bridges awareness and action.

## Solution Approach
1. Onboard users with a lifestyle quiz → compute their initial CO₂ baseline
2. Let them log daily activities (transport, food, energy) → see instant CO₂ impact
3. Show progress on a dashboard (charts: trend over time, category breakdown)
4. Generate personalized AI tips via Gemini API
5. Reward sustained effort with gamification (streaks, badges, level-up)
6. Point to verified carbon offset programs as a next step

## Target Users
- **Casual**: First-timers curious about their footprint; need simple onboarding
- **Engaged**: Regular trackers who want detailed logs, trends, and AI advice
Both share: English-speaking, web browser, moderate tech comfort

## Core Features (MVP — IN scope)
- [x] User authentication (signup / login — custom UI + Supabase Auth)
- [x] Onboarding quiz (Transport, Food, Home Energy — 7 questions)
- [x] Activity logging (transport, food, energy — quick-add form)
- [x] AI insights (Gemini API — 3–5 personalized tips)
- [x] Progress dashboard (Area/Line chart + Donut chart)
- [x] Gamification (streaks, 6 badges, 10 levels)
- [x] Carbon offset suggestions (6 curated programs, static list)
- [x] Landing page (Hero + Features + CTA)

## Out of Scope (future)
- Social / community features
- Export / share report (PDF)
- Native mobile app
- Live offset marketplace with payments

## Success Metrics (hackathon context)
- Complete user flow (signup → quiz → log → dashboard → insights → gamification) works end-to-end
- All Playwright E2E tests pass
- Repo size < 10 MB
- Code review criteria: code quality, security, efficiency, testing, accessibility

## Key Assumptions
- A1: Gemini API key provided before build
- A2: Supabase project + credentials provided before build
- A3: CO₂ calculated using hardcoded emission factors (no live API)
- A4: Gamification is DB-based (no push notifications)
- A5: Offset suggestions are static curated list (not live marketplace)
- A6: node_modules/ excluded from git; repo < 10 MB
