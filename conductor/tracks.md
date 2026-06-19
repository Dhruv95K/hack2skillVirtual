# EcoTrack â€” Task Registry (tracks.md)

Plan file: `docs/plans/2026-06-18-ecotrack.md`
Last updated: 2026-06-19

## Status Legend
- `[ ]` â€” Not started
- `[/]` â€” In progress (implementer dispatched)
- `[R]` â€” Under review (spec or code-quality review in progress)
- `[x]` â€” Complete (both review gates passed, committed)

---

## Tasks

| # | Task | Classification | Status | Commit SHA |
|---|---|---|---|---|
| 1 | Project Scaffolding & Infrastructure | infra | `[x]` | 8cbf4fc |
| 2 | Authentication (Signup / Login) | fullstack | `[x]` | 60ab4c7 |
| 3 | Onboarding Quiz | fullstack | `[x]` | 0bf60b4 |
| 4 | Activity Logging & CO₂ Calculation Engine | fullstack | `[x]` | 7321c4f |
| 5 | Progress Dashboard with Charts | fullstack | `[x]` | b55ff3a |
| 6 | AI-Powered Insights (Gemini API) | fullstack | `[x]` | 843d7fe |
| 7 | Gamification (Streaks, Badges, Levels) | fullstack | `[x]` | 54738ac |
| 8 | Carbon Offset Suggestions Page | fullstack | `[x]` | b6c7c07 |
| 9 | Landing Page | frontend | `[/]` | — |
| 10 | Polish, Accessibility & Final E2E Validation | fullstack | `[ ]` | — |

---

## Notes
- Tasks must be completed sequentially (1 â†’ 2 â†’ ... â†’ 10)
- Each task requires: implementer â†’ spec review âœ… â†’ code-quality review âœ… â†’ mark `[x]`
- Update the Commit SHA column after each task commit
- If a task is marked `[/]`, the orchestrator can find the active subagent's conversation in the loop log
