# Agent instructions for paper-camp

This file is the source of truth for how AI assistants should work in this repository.

## Do one phase at a time

When a user asks you to work on a plan from `papercamp/plans.md`, complete **only the phase they explicitly asked for** unless they tell you otherwise. Do not automatically continue into later phases.

If the boundary between phases is unclear, or if you are unsure whether the user wants the next phase done, ask before continuing.

## Update the plan as you go

Mark the completed phase `[x]` in `papercamp/plans.md` and keep the plan's `Status` field honest (`in-progress` / `done`).

## UI code style

For `src/app` code, also follow `CODE_STYLE.md`.
