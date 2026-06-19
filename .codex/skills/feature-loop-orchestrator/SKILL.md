---
name: feature-loop-orchestrator
description: "Use to deliver a feature end-to-end: plan the scope once (if not already planned), persist context, then run the implementation as a loop over tasks - each task built by a fresh context-isolated subagent following a fixed build -> instrument -> test -> review -> document pipeline - and ship once at the end. A specialization of subagent-driven-development that owns the per-task skill set AND the per-task model routing (cheap models build, reasoning models review) so the planner does not have to."
risk: unknown
source: personal
date_added: "2026-06-18"
---

# Feature Loop Orchestrator

Execute an implementation plan as a sequential, context-isolated feature loop. For **each task** in the plan, dispatch a fresh subagent that builds one vertical slice end-to-end, following a fixed pipeline, then verify it with two review gates before moving to the next task.

**Core principle:** One task at a time + fresh subagent per task + a fixed build pipeline injected by the orchestrator (not the planner) = the main window never fills up, and every slice follows your defined approach automatically.

This skill is a **specialization of `subagent-driven-development`**. It reuses that skill's loop structure (one implementer subagent per task, then spec-compliance review, then code-quality review) and adds one thing: **the orchestrator classifies each task and injects the right skills into the subagent's prompt**, so you never have to hand-tag tasks.

## When to use

- You have a written implementation plan (e.g. from `writing-plans`) broken into discrete tasks.
- Each task is a buildable vertical slice (mostly independent of the others).
- You want to stay in one session and not exhaust the main context window.
- You want every task to follow the same build -> instrument -> test -> review -> document pipeline without tagging each task by hand.

## When NOT to use

- Tasks are tightly coupled / share state and cannot run independently -> execute manually.
- Tasks must run in parallel or need a real dependency graph -> use `subagent-orchestrator` instead (this skill is strictly sequential).
- A single small edit -> just do it directly.

## Phase 1 — Plan the scope (run once; SKIP if a plan already exists)

**Condition:** If there is already a written, task-broken plan in `docs/plans/`, skip this phase and go to Phase 2. Otherwise, run the three planning skills in order — they form a funnel from vague idea to a buildable plan. Do NOT write any feature code during this phase.

**1. `brainstorming` — turn the raw idea into a validated design.**
   Operate as a design facilitator, not a builder. First read the current project state (existing files, docs, prior decisions) to separate what exists from what's proposed. Then, one question at a time, drive to shared clarity on:
   - the problem and who it's for (user persona),
   - the MVP boundary — what's explicitly IN vs. OUT of this feature,
   - acceptance criteria — how we'll know each piece is done,
   - unstated assumptions and constraints, surfaced and confirmed.
   Output: a short validated design/spec. Don't proceed to planning until the design is agreed.

**2. `concise-planning` — shape the design into an ordered, atomic task list.**
   Scan context (README, relevant code, frameworks, test setup). Ask at most 1–2 questions, only if truly blocking; make reasonable assumptions otherwise. Produce: an **Approach** (1–3 sentences), explicit **Scope (In/Out)**, an ordered list of **Action Items** where each item is one buildable vertical slice, and at least one **Validation** item. This is the slice list the loop in Phase 3 will iterate over — size each item as a coherent feature slice, not a 2-minute micro-step.

**3. `writing-plans` — expand each slice into a detailed, self-contained task.**
   Write the plan to `docs/plans/YYYY-MM-DD-<feature>.md`. Assume the implementer (a fresh subagent) knows the craft but nothing about this codebase, so each task must spell out: exact files to create/modify/test, the intended approach, and how to verify it (failing test first, then implementation). Principles: DRY, YAGNI, TDD, frequent commits. One task = one vertical slice; keep tasks mostly independent so the loop can run them one at a time.

**Important — do NOT name skills inside the tasks.** This orchestrator injects the right skills per task in Phase 3 (see "Skill routing table") based on the task's classification. Keep task text focused on WHAT to build and HOW to verify it, not which skills to use. (This is the one place this skill diverges from `writing-plans`' default of pointing tasks at `executing-plans`.)

## Phase 2 — Establish context artifacts (run once; SKIP if already set up)

**Condition:** If `context-driven-development` artifacts already exist and are current, skip. Otherwise run `context-driven-development` once to write `product.md`, `tech-stack.md`, `workflow.md`, `tracks.md`. Put global standards (TDD, commit conventions, review gates) in `workflow.md` so every subagent inherits them. A fresh window can read these to resume mid-loop.

## Phase 3 — Run the loop (the core of this skill)

This is the per-task execution loop, detailed in "The Loop" below. After it completes, go to Phase 4 (Ship).

## The Loop

Setup (once):
```
Read the plan ONCE. Extract EVERY task with its full text AND its scene-setting
context (where it fits, dependencies already built, relevant tech-stack.md / workflow.md).
Create a TodoWrite list of all tasks.
```
Keep the extracted task text + context in the orchestrator's working notes so you never
re-read the plan file per task — that is what keeps the main window lean.

Per task (sequential, one at a time):
```
1. CLASSIFY the task (backend | frontend | fullstack | infra)   -> see "Task classification"
2. BUILD the injection set (always-on + classification set)     -> see "Skill routing table"
   and PICK the model for this task                             -> see "Model routing table"
3. DISPATCH implementer subagent  (./implementer-prompt.md) with the full task text,
   the scene-setting context, the injected skill set, and the chosen model
   (backend/infra -> Gemini 3.5 Flash high; frontend/fullstack -> Gemini 3.1 Pro high).
4. DID THE IMPLEMENTER ASK QUESTIONS?
     YES -> answer clearly and completely, then RE-DISPATCH the implementer with the answers.
            (never let it proceed on a guess)
     NO  -> it implements, tests, commits, self-reviews, and reports.
5. DISPATCH spec-compliance reviewer (./spec-reviewer-prompt.md) on Gemini 3.5 Flash (medium).
   It verifies by reading the actual code, not the report.
     ❌ issues  -> SAME implementer subagent fixes the gaps -> RE-DISPATCH spec reviewer (step 5)
     ✅ compliant -> continue to step 6
6. ONLY AFTER spec review is ✅: DISPATCH code-quality reviewer (./code-quality-reviewer-prompt.md)
   on Sonnet 4.6 thinking. It runs the `requesting-code-review` skill over the diff (BASE_SHA..HEAD_SHA)
   — one pass covers backend AND frontend.
     ❌ issues  -> SAME implementer subagent fixes them -> RE-DISPATCH (step 6)
     ✅ approved -> continue to step 7
7. MARK the task complete in TodoWrite; update tracks.md / plan.md so a fresh window sees it done.
8. MORE TASKS REMAIN?
     YES -> go to step 1 for the next task
     NO  -> exit the loop
```

After the loop:
```
FINAL REVIEW — ASK FIRST. Before dispatching the final whole-implementation reviewer,
STOP and ask the user: "All tasks done. Run the final whole-implementation review on
Opus 4.6 thinking? (Check your usage / quota first.)"
  user APPROVES -> dispatch a FINAL reviewer subagent on Opus 4.6 thinking over the ENTIRE
                   implementation (not just the last task).
  user DECLINES -> skip it; the user will run a lighter reviewer skill on a cheaper model
                   themselves, or accept the per-task reviews as sufficient.
Then run the Ship step (see below).
```

Each subagent runs in its **own context window**. The orchestrator (you) holds only the task list + short reports — never the full file contents, so the main window stays lean across the whole loop. If a subagent outright fails a task, dispatch a scoped fix subagent — never fix it manually in the orchestrator (that pollutes the main context and defeats isolation).

## Task classification

Before dispatching each task, classify it by reading the task text:

- **backend** — data model, API, server logic, auth, persistence, jobs.
- **frontend** — UI, components, pages, client state, user flows.
- **fullstack** — the task spans both (inject backend AND frontend sets).
- **infra/other** — migration, config, tooling. Inject only the always-on set + judgment.

When in doubt, prefer **fullstack** over guessing wrong.

## Skill routing table (the orchestrator MUST inject these)

For every task, inject the **always-on** set. Then add the set(s) matching the task's classification. "Inject" means: name these skills explicitly in the implementer subagent's prompt and instruct it to follow them.

### Always-on (every build task)
- `test-driven-development` — write the failing test first; TDD the slice.
- `observability-engineer` — add structured logs/metrics for what this slice introduces (inline, not later).
- `browser-automation` — exercise the slice's flows through the real UI/endpoint to prove it works.
- `systematic-debugging` — on any failure, reproduce -> isolate -> root-cause -> fix -> re-verify (never guess).
- `git-advanced-workflows` — commit the slice with clean, atomic history.
- `architecture-decision-records` — write an ADR when the task involved a non-obvious technical decision.

### If classification = backend (add)
- `backend-dev-guidelines` — backend structure and conventions.
- `api-patterns` — explicit, testable API contracts.
- `database-design` — schema/data-model decisions.
- `auth-implementation-patterns` — only if the task touches auth/authz.

### If classification = frontend (add)
- `ui-ux-pro-max` — design judgment: layout, color, typography, UX review.
- `frontend-design` — design-to-implementation patterns.
- `frontend-developer` — React/Next implementation and client state.
- `react-patterns` — React-specific idioms.

### If classification = fullstack (add)
- Both the backend set and the frontend set above.

### Review skill (runs at the code-quality GATE, not the implementer)
- `requesting-code-review` — the code-quality reviewer dispatches this skill (its template at `requesting-code-review/code-reviewer.md`) and passes params (WHAT_WAS_IMPLEMENTED / PLAN_OR_REQUIREMENTS / BASE_SHA / HEAD_SHA / DESCRIPTION). The skill owns the checklist; the reviewer prompt just fills placeholders. The reviewer reviews the diff directly and never spawns a nested subagent.

> Review is kept OUT of the implementer subagent on purpose (an author reviewing their own work in the same pass is weak). The review skill runs at the gate rather than as a step inside the build.

---

## Model routing table (cost & context optimization)

Each dispatch point gets the model that fits its cognitive load. The governing principle: **build cheap, review with reasoning, plan deliberately.** Spend the premium models where being wrong is expensive and hard to catch later (reviews, planning); use cheap models where the spec is explicit and the work is mechanical (well-specified builds, spec checks).

> **These model picks are ADVISORY and MANUAL.** A skill cannot bind a model to a subagent. For subagents you select the model in Antigravity at spawn time; for main-window phases you switch your own session model via the model dropdown. Nothing here is enforced automatically — same as everything else in this repo.

Why per-subagent model choice works: each subagent runs in its **own context window**, so a cheap builder and an expensive reviewer never share context. The asymmetric pairing (cheap build → reasoning-model review on a fresh window) is the core cost/quality trick.

| Dispatch point / phase | Runs as | Model (you set it) |
|---|---|---|
| **Phase 1 — Planning** (brainstorming → concise-planning → writing-plans) | Main window | *You select manually* — decomposition quality drives everything; pick deliberately. |
| **Phase 2 — Context** (context-driven-development) | Main window | *You select manually.* |
| **Implementer — backend / infra** | Subagent | **Gemini 3.5 Flash (high)** |
| **Implementer — frontend / fullstack** | Subagent | **Gemini 3.1 Pro (high)** |
| **Spec-compliance reviewer** | Subagent | **Gemini 3.5 Flash (medium)** |
| **Code-quality reviewer** | Subagent | **Sonnet 4.6 thinking** |
| **Final whole-impl reviewer** | Subagent | **ASK THE USER FIRST** → **Opus 4.6 thinking** if approved (else skip / user runs a lighter reviewer) |
| **Phase 4 — Ship** | Main window | *You select manually.* |

**Quota caution (advisory):** the loop runs sequentially, so cost accrues task-by-task. The two cheap subagents (Flash implementer + Flash spec reviewer) are most of each task's volume — keep them cheap. The Sonnet code-quality reviewer is the per-task premium spend; the Opus final review is one-shot and gated behind your approval. If you're watching quota, decline the final review and lean on the per-task gates.

---

## Prompt templates

Each subagent is dispatched with the `Task` tool using a prompt template stored alongside this SKILL.md (same layout as `subagent-driven-development`). The implementer and spec-reviewer prompts are self-contained; the code-quality reviewer prompt dispatches the `requesting-code-review` skill (its template at `requesting-code-review/code-reviewer.md`) — that one skill must be installed/available.

- `./implementer-prompt.md` — dispatch the implementer subagent (build the slice following the injected skill set).
- `./spec-reviewer-prompt.md` — dispatch the spec-compliance reviewer (verify by reading code, not the report).
- `./code-quality-reviewer-prompt.md` — dispatch the code-quality reviewer (runs the `requesting-code-review` skill on the diff); only after spec review passes.

Dispatch order per task: implementer → spec reviewer (re-run on ❌) → code-quality reviewer (re-run on ❌) → mark complete.

## Phase 4 — Ship (run once, after the loop)

Run in the main window (model: you select manually). When all tasks are complete and the final review is done (or was skipped by your choice):

- `deployment-procedures` — release checklist, safe rollout, rollback triggers. **Apply only the part that fits the target platform**; this skill is platform-aware (its first decision tree routes static/JAMstack → Vercel/Netlify). Skip the enterprise machinery (blue-green, canary, zero-downtime, VPS/PM2, K8s) unless the project actually uses it.

**Vercel deploy (the common hackathon / static-frontend case):** `deployment-procedures` collapses to a short checklist —
  1. Production build passes locally (`next build` / `vercel build`) with no errors or type failures.
  2. **Environment variables are set in the Vercel dashboard** (the #1 cause of a green-locally / broken-in-prod deploy).
  3. `git push` → Vercel auto-deploys the branch; open the deployment URL and click the main user flow once to confirm.
  4. **Rollback = redeploy the previous commit** (one click in the Vercel dashboard / "Promote to Production" on the prior deployment). No backup step needed — Vercel keeps immutable deployments.
  5. Check the Vercel deployment **logs/analytics** for runtime errors (this is your observability — no Grafana/Prometheus needed at this scale).

> **Heavier ship skills are intentionally NOT in this phase.** `observability-engineer` (Prometheus/Grafana/SLO/tracing) and `postmortem-writing` (blameless incident reviews for SEV1/SEV2 outages) are production-operations skills — overhead for a hackathon or small project. Lightweight observability still happens earlier: the Phase 3 always-on set adds a structured log line per slice. For a genuinely production-grade system with on-call and real traffic, layer those two skills back in here.

## Worked example (one clean task, one with a review loop)

```
You: Using feature-loop-orchestrator to execute docs/plans/2026-06-18-mood-tracker.md.
[Read plan once; extract all tasks with full text + context; create TodoWrite]

--- Task 1: Mood-entry API ---
[Classify: backend -> inject always-on + backend set; model = Gemini 3.5 Flash (high)]
[Dispatch implementer with full task text + injected skills]
Implementer: "Should entries be soft-deleted or hard-deleted?"   <- ANSWER before proceeding
You: "Soft-delete (deleted_at column)."
Implementer: Implemented endpoint, 6/6 tests pass, added request logging, committed.
[Dispatch spec reviewer — Flash (medium)]      Spec reviewer: ✅ compliant.
[Dispatch code-quality reviewer — Sonnet 4.6 thinking]  Code reviewer: ✅ approved.
[Mark Task 1 complete; update tracks.md]

--- Task 2: Mood-history UI ---
[Classify: frontend -> inject always-on + frontend set; model = Gemini 3.1 Pro (high)]
[Dispatch implementer] Implementer: built chart, 8/8 pass, committed.
[Dispatch spec reviewer — Flash (medium)] Spec reviewer: ❌ Missing empty-state; extra: added export button (not requested).
[Implementer fixes: removes export button, adds empty-state]
[Re-dispatch spec reviewer] Spec reviewer: ✅ compliant now.
[Dispatch code-quality reviewer — Sonnet 4.6 thinking] Code reviewer: ❌ Important: magic number for page size.
[Implementer fixes: extracts PAGE_SIZE constant]
[Re-dispatch code-quality reviewer] Code reviewer: ✅ approved.
[Mark Task 2 complete; update tracks.md]

... remaining tasks ...
[After all tasks] You (ASK FIRST): "All tasks done. Run final review on Opus 4.6 thinking? Check quota first."
  -> approved: [Dispatch final whole-implementation reviewer — Opus 4.6 thinking] -> Ship.
  -> declined: skip final review (per-task gates stand) -> Ship.
```

## Hard rules

- **Sequential only.** One task -> one implementer subagent at a time. Never dispatch parallel implementers (they conflict).
- **Orchestrator owns the skill set.** Inject from the routing table every task; do not rely on the plan to name skills.
- **Answer subagent questions before they proceed.** If the implementer asks something in "Before You Begin," answer clearly and completely first — never let it guess or proceed unanswered.
- **Verify, don't trust.** Reviewer subagents read the actual code/diff, never just the implementer's report.
- **Never cascade broken output.** If a review fails, the implementer fixes and re-reviews before the task is marked done.
- **Keep the main window lean.** Pass full task text INTO subagents; pull only short reports back. Don't read task files into the orchestrator's own context.
- **Resume-safe.** Mark progress in TodoWrite and update `tracks.md`/`plan.md` after each task so a fresh window can pick up mid-loop.

## Red flags — NEVER

- Skip a review (spec compliance OR code quality).
- Proceed to the next task while either review has open issues.
- Accept "close enough" on spec compliance (spec reviewer found issues = not done).
- Start the code-quality review before spec compliance is ✅ (wrong order).
- Skip the re-review after a fix (reviewer found issues -> implementer fixes -> review AGAIN).
- Let the implementer's self-review replace the reviewer subagents (both are needed).
- Dispatch multiple implementer subagents in parallel.
- Make a subagent read the plan file instead of pasting the full task text.
- Skip scene-setting context (the subagent needs to know where the task fits).
- **Fix a failing task manually in the orchestrator** — dispatch a scoped fix subagent instead (manual fixes pollute the main context and defeat isolation).
- Dispatch the **final whole-implementation reviewer without asking the user first** — it runs on Opus 4.6 thinking and is the most expensive call; always confirm (and let the user check quota) before spending it.
- Treat any `Model:` line as automatic — model selection is manual (Antigravity dropdown for subagents / session model for main-window phases). The skill recommends; you set it.

## Relationship to other skills

- **Builds on:** `subagent-driven-development` (the loop + two-stage review it specializes).
- **Fed by:** `writing-plans` (produces the task list), `context-driven-development` (persists state for resume).
- **Not this skill:** `subagent-orchestrator` (parallel + dependency graph), `executing-plans` (separate session, human checkpoints between batches).

## Limitations

- This is an advisory skill (instructions an agent follows), not a runtime scheduler — it does not enforce sequencing or quota automatically.
- Quality depends on the plan: vague tasks produce vague slices. Keep tasks to one buildable vertical slice each.
- Strictly sequential by design; throughput is bounded by running one task at a time.
- **Model routing is advisory too.** The skill cannot assign a model to a subagent — you select it in Antigravity at spawn time (subagents) or via the session model dropdown (main-window phases). The model names (Gemini 3.5 Flash, Gemini 3.1 Pro, Sonnet 4.6 thinking, Opus 4.6 thinking, with high/medium/low effort tiers) assume your available lineup; substitute equivalents if yours differs.
