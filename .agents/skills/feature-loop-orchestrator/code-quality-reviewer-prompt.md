# Code-Quality Reviewer Subagent Prompt Template

Use this template only AFTER spec review passes. Purpose: confirm the slice is well-built (clean, tested, maintainable, production-ready). This dispatches the **`requesting-code-review`** skill's reviewer — fill the params and let the skill's own template (`requesting-code-review/code-reviewer.md`) drive the review. Keep the dispatch thin; the skill owns the checklist.

**MODEL (you select at spawn time):** **Sonnet 4.6 thinking** — this is the gate where reasoning catches subtle bugs across a mixed backend+frontend diff, so it's the per-task place premium spend pays off most.

The reviewer reads the actual diff (`BASE_SHA..HEAD_SHA`), not the implementer's report, and one pass covers backend AND frontend. It reviews directly — it does **NOT** spawn another subagent (that would defeat context isolation and break this skill's strictly-sequential rule).

```
Task tool (general-purpose):
  description: "Code-quality review for Task N"
  MODEL: Sonnet 4.6 thinking
  Use the requesting-code-review skill, filling its template at
  requesting-code-review/code-reviewer.md. Review the diff yourself; do NOT spawn another subagent.

  WHAT_WAS_IMPLEMENTED: [from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before this task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

The reviewer returns: Strengths, Issues (Critical / Important / Minor with file:line), and an Assessment (Ready to merge? Yes / No / With fixes).

If it returns ❌ / "With fixes" (Critical or Important issues), the implementer subagent applies the fixes and the code-quality review re-runs. Mark the task complete only on a clean ✅.
