# EcoTrack — Development Workflow

## Methodology
**TDD (Test-Driven Development)** — write the failing test FIRST, then write minimal implementation to pass it, then refactor.

Steps per change:
1. Write failing test
2. Run it — confirm it FAILS with the expected error
3. Write minimal implementation to make it pass
4. Run it — confirm it PASSES
5. Refactor (clean up without changing behavior)
6. Commit (atomic — one concern per commit)

## Git Workflow

### Commit Convention (Conventional Commits)
```
<type>(<scope>): <description>

Types: feat | fix | test | refactor | docs | chore | style
Examples:
  feat(auth): add signup and login pages with Supabase Auth
  feat(activities): add POST /api/activities with CO2 calculation
  test(gamification): add unit tests for badge award logic
  fix(dashboard): correct CO2 aggregation query for weekly view
```

### Branch Strategy
- `main` — production-ready; Vercel deploys from here
- Feature branches not required for hackathon; commit directly to main is acceptable
- Each task should end with a commit before moving to the next

### Commit frequency
- Commit after every task (minimum)
- Commit after every major sub-step within a task if it makes sense

## Quality Gates (per task — in order)

1. **Unit tests pass** → `npm test -- <test-file>`
2. **API tests pass** → `npm test -- __tests__/api/<test-file>`
3. **Component tests pass** → `npm test -- __tests__/components/<test-file>`
4. **Spec compliance review** → orchestrator dispatches spec reviewer (reads code, not report)
5. **Code quality review** → orchestrator dispatches code-quality reviewer (after spec ✅)
6. **Mark task complete** → update `conductor/tracks.md`

## Testing Requirements
- **Unit tests**: All pure logic (CO₂ calculations, gamification, level computation)
- **API tests**: All route handlers — auth, quiz, activities, dashboard, insights, gamification, offsets
- **Component tests**: Multi-step quiz, activity form, CO₂ preview
- **E2E tests**: Full user flows — signup, quiz, log+dashboard, full journey

## Review Gates
Each task goes through TWO mandatory reviewer passes (after implementer is done):
1. **Spec compliance reviewer** — verifies code matches the plan spec (reads actual code)
   - ❌ issues → implementer fixes → re-review
   - ✅ → proceed to step 2
2. **Code quality reviewer** — reviews the diff (BASE_SHA..HEAD_SHA) for quality, patterns, security
   - ❌ issues → implementer fixes → re-review
   - ✅ → task marked complete

**NEVER skip a review gate. NEVER proceed on ❌.**

## Accessibility Standards
- WCAG AA minimum (contrast ratio 4.5:1 for text)
- All inputs must have visible labels
- All interactive elements: `cursor-pointer` + visible focus states
- Color alone cannot be the only indicator (also use icons + text)
- Framer Motion: `useReducedMotion()` in every animated component
- Skeleton screens for all async loading states (no blank screens)
- Buttons: disabled + spinner during async operations (prevent double-submit)

## Security Rules
- API keys (Gemini, Supabase service role) NEVER exposed to the browser
- `.env.local` NEVER committed (in .gitignore)
- All protected API routes check Supabase session first → 401 if not authenticated
- User data scoped by `userId` — never return other users' data
- Input validation at API level (not just client)

## Performance Guidelines
- Lazy load all below-fold content (`loading="lazy"`)
- `font-display: swap` on all Google Fonts
- Use Next.js Image component for any images
- Dashboard data fetched server-side (SSR) to avoid client waterfall

## Accessibility Review Checklist (pre-delivery — per task)
- [ ] No emoji as icons (Lucide SVG only)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with 150–300ms transition
- [ ] Focus states visible for keyboard navigation
- [ ] `useReducedMotion()` in all Framer Motion components
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] All form inputs have associated labels
- [ ] Skeleton screens for async states (not blank)
- [ ] Buttons disabled + spinner during loading
