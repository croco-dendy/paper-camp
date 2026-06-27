# Agent instructions for paper-camp

This file is the source of truth for how AI assistants should work in this repository.

## Do one phase at a time

When a user asks you to work on a plan from `papercamp/plans.md`, complete **only the phase they explicitly asked for** unless they tell you otherwise. Do not automatically continue into later phases.

If the boundary between phases is unclear, or if you are unsure whether the user wants the next phase done, ask before continuing.

## Update the plan as you go

Mark the completed phase `[x]` in `papercamp/plans.md` and keep the plan's `Status` field honest (`in-progress` / `review` / `done`).

When all phases of a plan are complete, set its `Status` to `review` — not `done`. The `review` status means a human (or a later agent) needs to approve the work before it's closed. Plans that reach `done` should only get there via an explicit "Approve & close" action, never because the last phase was checked off automatically.

## UI code style and UX principles

For `src/app` code, also follow `CODE_STYLE.md` (how the code is written) and
`UX_PRINCIPLES.md` (how the UI should feel to use — layout stability, visual
hierarchy, motion). Read both before making UI changes.

## Working with the paper-ui sibling repo

The dashboard is built on `@dendelion/paper-ui`, which lives in a sibling repo at
`~/dev/paper-ui` and is consumed via a local link (`"@dendelion/paper-ui":
"link:../paper-ui"` in `package.json`, symlinked at
`node_modules/@dendelion/paper-ui`).

- **paper-camp imports from `dist/`, not `src/`.** paper-ui's `package.json`
  points `main`/`module`/`types` at `dist/index.{js,mjs,d.ts}`. If you edit
  anything under `~/dev/paper-ui/src`, it has **no effect** in paper-camp until
  you run `pnpm run build` inside `~/dev/paper-ui`. `vite.app.config.ts`'s dev
  server watches the symlinked package's `dist/` output (and `dist/index.css`
  specifically) for hot-reload, so the rebuild is the only manual step.
- **Check the real source, not just the `.d.ts`.** Before assuming what a
  paper-ui prop does, read the component under `~/dev/paper-ui/src/components/`
  (and its showcase entry under `~/dev/paper-ui/src/showcase/`) rather than
  guessing from the type signature alone.
- **When changing paper-ui itself,** follow `~/dev/paper-ui/AGENTS.md`/
  `CODE_STYLE.md` (one component per file, `cn()` for classNames, SCSS modules
  for styles — no hardcoded hex in `.tsx`), then run `pnpm run check-types` and
  `pnpm run build` there before switching back to paper-camp.
- **Adding to paper-ui's public API** (new component, new exported prop) means
  updating both `src/components/<name>/index.ts` *and* the top-level
  `src/index.ts` barrel — both re-export the public types, and it's easy to
  update one and forget the other.

## Verifying UI changes visually

Use the Claude in Chrome MCP tools (`mcp__Claude_in_Chrome__*`) to actually look
at a UI change before reporting it done, not just `tsc`/lint.

- **Check for an already-running dev server first** — `lsof -i :3333` (or
  `pgrep -af vite.app.config`). This repo is usually already running under
  `pnpm dev` in another session. Don't start a second instance; if port 3333 is
  taken, your new one will silently bind 3334 and nothing will be reachable
  through it.
- **`localhost`/`127.0.0.1` will not load in the browser the MCP tools drive** —
  that browser runs on the user's machine, not in this sandbox, so loopback
  addresses point nowhere useful. Use the box's Tailscale hostname instead:
  `http://deimos:3333/` (check `pnpm dev`'s own "Network:" log lines if the
  hostname ever changes). A direct `navigate` to a sub-route (e.g. `/plans`)
  can hit a SPA-routing error page on first load — navigate to `/` first, then
  click through the app's own nav.
- After navigating, `browser_batch` a `screenshot` and actually look at it; check
  `read_console_messages` for thrown errors before calling a change verified.
