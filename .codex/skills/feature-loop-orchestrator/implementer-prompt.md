# Implementer Subagent Prompt Template

Use this template when dispatching the implementer subagent for one task. Fill the bracketed parts. The `[INJECTED SKILL SET]` comes from the routing table in `SKILL.md` (always-on set + the set matching the task's classification).

**MODEL (you select this at spawn time in Antigravity — the skill cannot set it):**
- Classification = **backend / infra** → **Gemini 3.5 Flash (high)** (cheap, capable when the plan is explicit)
- Classification = **frontend / fullstack** → **Gemini 3.1 Pro (high)** (stronger UI/logic judgment; handles mixed-layer slices)

```
Task tool (general-purpose):
  description: "Implement Task N: [task name]"
  MODEL: [Gemini 3.5 Flash (high) for backend/infra | Gemini 3.1 Pro (high) for frontend/fullstack]
  prompt: |
    You are implementing ONE vertical slice: Task N: [task name].

    ## Task Description

    [FULL TEXT of task from plan - paste it here, don't make subagent read file]

    ## Context

    [Scene-setting: where this fits, dependencies already built, architectural context,
    relevant section of tech-stack.md / workflow.md]

    ## Required Approach (follow these skills)

    Classification: [backend | frontend | fullstack | infra]
    Apply these skills while building:
    [INJECTED SKILL SET from the routing table - list the exact skill names for this
    classification + the always-on set.]

    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task description

    **Ask them now.** Raise any concerns before starting work.

    ## Your Job

    Once you're clear on requirements:
    1. Implement exactly what the task specifies (nothing more - YAGNI - nothing less)
    2. Follow TDD: failing test first, then minimal code to pass
    3. Add observability for what this slice introduces (per observability-engineer)
    4. Verify the slice works end-to-end (browser-automation); debug failures systematically
    5. Commit your work with clean history; write an ADR if a non-obvious decision was made
    6. Self-review (see below)
    7. Report back

    Work from: [directory]

    **While you work:** If you encounter something unexpected or unclear, **ask questions**.
    It's always OK to pause and clarify. Don't guess or make assumptions.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes. Ask yourself:

    **Completeness:**
    - Did I fully implement everything in the spec?
    - Did I miss any requirements?
    - Are there edge cases I didn't handle?

    **Quality:**
    - Is this my best work?
    - Are names clear and accurate (match what things do, not how they work)?
    - Is the code clean and maintainable?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only build what was requested?
    - Did I follow existing patterns in the codebase?

    **Testing:**
    - Do tests actually verify behavior (not just mock behavior)?
    - Did I follow TDD if required?
    - Are tests comprehensive?

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - What you implemented
    - What you tested and test results
    - Files changed and commit SHA(s)
    - Self-review findings (if any)
    - Any issues or concerns
```
