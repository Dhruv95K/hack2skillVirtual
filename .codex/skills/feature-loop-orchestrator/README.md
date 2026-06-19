# Feature Loop Orchestrator — README

Deliver a feature end-to-end as a **sequential, context-isolated loop**: plan once → persist context → build each task with a fresh subagent (build → instrument → test → review → document) → ship. A specialization of `subagent-driven-development` that also owns **per-task model routing** (cheap models build, reasoning models review) so the planner doesn't have to.

Full spec: [`SKILL.md`](./SKILL.md). Design rationale: [`DESIGN-NOTES.md`](./DESIGN-NOTES.md).

---

## Install (Antigravity)

Antigravity natively supports the Agent Skills (`SKILL.md`) format and **auto-triggers skills by matching your request against each skill's `description:`** — there is no slash command or "run" button. Place the folders where Antigravity discovers them:

| Scope | Path |
|---|---|
| **Project** (Antigravity app) | `<project-root>/.agents/skills/` |
| **Global** (Antigravity app) | `~/.gemini/config/skills/` |
| **CLI** | `~/.gemini/antigravity-cli/skills/` (project scope uses `.agent/skills/`, singular) |

Copy **both** of these folders (the second is a hard dependency — the code-quality gate dispatches it):

```
.agents/skills/feature-loop-orchestrator/      # this skill (all 5 files)
.agents/skills/requesting-code-review/          # code-quality reviewer dispatches this
```

> The implementer and spec-reviewer prompts are self-contained. The **code-quality reviewer points at `requesting-code-review/code-reviewer.md`**, so that skill must be installed alongside.

---

## How to invoke (with an idea)

You don't "run" it — you **describe your feature** and let Antigravity match the skill, or name it explicitly. A starting message:

> Use the **feature-loop-orchestrator** skill. Idea: a *[your app]* that *[core function]* for *[who]*. MVP should include *[2–3 must-haves]*. Stack: *[e.g. Next.js + Vercel]*. Start with Phase 1 brainstorming and drive the design with me one question at a time before writing any plan or code.

That's enough. With no existing plan, the skill begins at **Phase 1 (brainstorming)** and asks you design questions one at a time, then funnels into a task list, then runs the build loop.

If Antigravity doesn't auto-pick it up, the reliable fallback is to point it at this file: *"Follow the process in `.agents/skills/feature-loop-orchestrator/SKILL.md` for my idea."*

---

## The four phases

1. **Plan** (skip if a plan exists) — `brainstorming` → `concise-planning` → `writing-plans` → a task-broken plan in `docs/plans/`.
2. **Context** (skip if set up) — `context-driven-development` writes `product.md` / `tech-stack.md` / `workflow.md` / `tracks.md` so a fresh window can resume.
3. **The Loop** (core) — per task: classify → pick model → dispatch implementer → answer its questions → spec review → code-quality review → mark done. Then an **opt-in** final whole-implementation review.
4. **Ship** — `deployment-procedures` (Vercel checklist baked in for the common case).

---

## Your job during a run (it's interactive)

Model selection is **manual** — the skill recommends, you pick it in Antigravity's model dropdown (subagents) or as your session model (main-window phases). Nothing is auto-bound.

| Moment | What you do |
|---|---|
| Phase 1 — planning | Answer brainstorming questions; set session model yourself |
| Each implementer dispatch | Set the subagent model: **Gemini 3.5 Flash (high)** backend/infra · **Gemini 3.1 Pro (high)** frontend/fullstack |
| Spec review | **Gemini 3.5 Flash (medium)** |
| Code-quality review | **Sonnet 4.6 thinking** (runs `requesting-code-review`) |
| Implementer asks a question | Answer it before it proceeds — never let it guess |
| Before the final review | The skill **asks you first** — check quota, then approve (**Opus 4.6 thinking**) or decline |
| Phase 4 — ship | Run the Vercel checklist; set model yourself |

Full model routing table is in [`SKILL.md`](./SKILL.md#model-routing-table-cost--context-optimization).

---

## Model lineup assumed

Gemini 3.5 Flash (high/medium/low), Gemini 3.1 Pro (high/low), Sonnet 4.6 thinking, Opus 4.6 thinking. Substitute equivalents if yours differ.

---

## When NOT to use

- Tightly-coupled tasks that share state → execute manually.
- Tasks that must run in parallel / need a dependency graph → `subagent-orchestrator`.
- A single small edit → just do it.
