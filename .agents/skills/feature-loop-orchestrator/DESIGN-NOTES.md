# Feature Loop Orchestrator — Design Notes & Session Summary

This document summarizes the work done in the session that produced the
`feature-loop-orchestrator` skill and two related workflow entries. It captures
**what we built, why, and the key decisions** — so a future reader (or a fresh
agent window) can understand the reasoning without replaying the conversation.

Date: 2026-06-18

---

## 1. What we set out to do

Started by reviewing a proposed workflow (`new-dev-workflow`) for `data/workflows.json`
and ended up designing a reusable, end-to-end **feature-delivery orchestrator skill**.

The driving goals that emerged:
- Build a feature **slice-by-slice** (vertical slices), not layer-by-layer (waterfall).
- Run the build/test/review cycle **as a loop over plan tasks**.
- Use **context-isolated subagents** so a long loop never exhausts the main context window.
- Make the loop actually follow our defined approach (the right skills per task),
  rather than letting a subagent improvise.
- Stay **model-agnostic** (no hardcoded AI model anywhere).

---

## 2. Key findings about how this repo works

- **`data/workflows.json` is ADVISORY, not executable.** Verified by exploring the repo:
  the only consumers are `tools/scripts/validate_references.py` (reference validation) and
  docs/SEO copy. Nothing iterates `steps[]` to run anything. A workflow entry is a
  *recommendation playbook* a human/agent reads — it cannot loop or orchestrate by itself.
- **The looping must live in a SKILL**, because skills are the instructions an agent follows.
  Candidate loop-driver skills already in the repo:
  - `subagent-driven-development` — sequential, one task at a time, fresh subagent per task,
    two review gates. **No parallelism, assumes independent tasks.**
  - `subagent-orchestrator` — parallel subagents in dependency-ordered rounds, quota caps.
    (Hardcodes models — we did NOT use it.)
  - `executing-plans` — batch execution with human checkpoints in a separate session.
  - `agentflow` — Kanban + cron, multi-worker. Heavy infra.
- **`writing-plans` outputs the task list** the loop iterates over (numbered Tasks saved to
  `docs/plans/`). `context-driven-development` persists state so a fresh window can resume.
- **Everything here is advisory** — even orchestrator skills. None enforce sequencing/quota at
  runtime; they describe a loop that an agent then follows. Truly *enforced* control would
  require a runtime engine (e.g. Claude Code's Workflow tool), which is out of scope for a skill.

---

## 3. Decisions made (and why)

| Decision | Choice | Why |
|---|---|---|
| Loop engine | `subagent-driven-development` philosophy (sequential) | User accepted single sequential subagent for now; avoids collisions; simplest reliable option. |
| Subagent isolation | Fresh subagent per task | Each task's reads/code/tests stay in ITS context window — main window stays lean across a long loop. |
| How the subagent follows our steps | Orchestrator **injects** the skill set per task | A subagent only reads its task prompt. So the orchestrator classifies each task and injects the right skills — the planner does NOT have to hand-tag tasks. |
| Where planning lives | **Phase 1 of the skill**, conditional ("skip if already planned") | User wanted the skill to be end-to-end. Planning is a gated first phase, not buried as a prerequisite. |
| Review skill at the code-quality gate | The reviewer **dispatches the `requesting-code-review` skill** and passes params (BASE_SHA/HEAD_SHA/etc.), same pattern as `subagent-driven-development` — the skill owns its checklist, the prompt stays thin | An author reviewing their own work in the same pass is weak — review belongs at the gate. `requesting-code-review` already has enough content; re-inlining its checklist was redundant, so the reviewer just runs the skill. `code-review-excellence` was dropped (~70% human-reviewer process/etiquette irrelevant to an automated gate; the rest overlapped). `simplify-code` was discarded — its "spawn four parallel sub-agents" model conflicted with the strictly-sequential, no-nested-subagent design. |
| Self-containment | Implementer + spec-reviewer prompts are self-contained; the code-quality reviewer points at `requesting-code-review/code-reviewer.md` | A deliberate tradeoff: running the real review skill (vs. re-inlining its checklist) is cleaner and DRY, at the cost of one cross-skill dependency — `requesting-code-review` must be installed. |
| Parallel + dependency graph | **Deferred** — not in this skill | User accepted sequential for now. If needed later, `subagent-orchestrator` is the path (documented in "Relationship to other skills"). |
| AI model | None hardcoded | Verified zero model references; dispatch uses `Task tool (general-purpose)`. Stays model-agnostic. |

---

## 4. What we built

### A. New skill: `skills/feature-loop-orchestrator/`
Mirrors the file layout of `subagent-driven-development`:
- `SKILL.md` — the orchestrator. Structure:
  - **Phase 1 — Plan the scope** (run once; skip if a plan exists): `brainstorming` →
    `concise-planning` → `writing-plans`, described as a funnel (idea → design → atomic
    slice list → detailed buildable plan). Tasks are kept skill-free; the orchestrator injects skills.
  - **Phase 2 — Establish context** (run once; skip if set up): `context-driven-development`.
  - **Phase 3 — The Loop** (core): per-task classify → inject skills → dispatch implementer →
    answer questions → spec-compliance review (re-review on ❌) → code-quality review
    (only after spec ✅; re-review on ❌) → mark complete → next task. Final whole-implementation
    review after all tasks.
  - **Phase 4 — Ship** (run once): `deployment-procedures`, `observability-engineer`, `postmortem-writing`.
  - Plus: Task classification, Skill routing table, Worked example, Hard rules,
    Red flags (NEVER list), Relationship to other skills, Limitations.
- `implementer-prompt.md` — implementer subagent template (synced to original's full
  "Before You Begin" + "Self-Review" detail, plus our injected-skill-set block).
- `spec-reviewer-prompt.md` — spec-compliance reviewer (synced to original's full
  DO/DON'T + check categories; verify by reading code, not the report).
- `code-quality-reviewer-prompt.md` — code-quality reviewer that dispatches the
  `requesting-code-review` skill and passes params (thin prompt; the skill owns the checklist).

The loop and guardrails were verified edge-by-edge against `subagent-driven-development`'s
process flowchart; missing branches (question handling, spec-✅ gate, full-text extraction,
"never fix manually", final reviewer, Red-Flags list) were ported in.

### B. Two workflow entries in `data/workflows.json`
- `new-dev-workflow` — the user's original, kept **for reference**.
- `feature-loop-subagent-dev` — a cleaned 4-step advisory workflow (plan-with-embedded-skills →
  context → run loop driver → ship). This is the *advisory* counterpart to the skill.

---

## 5. Final skill dependency set (for a focused install — "don't import all")

The orchestrator + **23 skills it actively invokes** (all verified real IDs):

**Phase 1 (plan):** brainstorming, concise-planning, writing-plans
**Phase 2 (context):** context-driven-development
**Phase 3 always-on:** test-driven-development, observability-engineer, browser-automation,
  systematic-debugging, git-advanced-workflows, architecture-decision-records
**Phase 3 backend:** backend-dev-guidelines, api-patterns, database-design, auth-implementation-patterns
**Phase 3 frontend:** ui-ux-pro-max, frontend-design, frontend-developer, react-patterns
**Phase 3 review gate:** requesting-code-review (dispatched by the code-quality reviewer, params passed in)
**Phase 4 (ship):** deployment-procedures, observability-engineer (dup), postmortem-writing

**NOT needed** (only mentioned as cross-references, never invoked):
`subagent-driven-development`, `subagent-orchestrator`, `executing-plans`.

Notes:
- `auth-implementation-patterns` is conditional — only if a task touches auth.
- `feature-loop-orchestrator` is intentionally **not yet wired into `skills_index.json`**
  (per the decision to keep it SKILL.md-only for now). Index it to make it discoverable.

---

## 6. Validation status

- `tools/scripts/validate_references.py` passes (workflow + bundle references valid).
- All backticked skill IDs in the skill resolve to real entries in `skills_index.json`.
- Zero hardcoded AI-model references in any of our files.

---

## 7. Open / next steps

- [ ] Index `feature-loop-orchestrator` in `skills_index.json` (and rebuild catalog) to make it official/discoverable.
- [ ] Optionally point `feature-loop-subagent-dev` (or a new workflow) directly at the orchestrator skill.
- [ ] Commit the new skill + workflow entries.
- [ ] (Future) If parallel execution is wanted, build a `subagent-orchestrator`-based variant
      with a dependency graph and a concurrency cap.

---

## 8. Key takeaway

`workflows.json` describes *what to do*; this **skill** describes *how the loop runs*; and the
**subagents** do the work in isolated context. The skill is the reliable, self-contained layer —
advisory like everything in this repo, but structured so a capable agent executes the
plan → loop → ship flow without cutting corners, and without filling the main context window.
