# paper-camp UX/UI principles

This document is the source of truth for how the UI should *feel* to use —
layout behavior, visual hierarchy, motion, and similar judgment calls. It is
separate from [`CODE_STYLE.md`](CODE_STYLE.md), which covers how the code
implementing the UI is written (components, tokens, file layout). When the two
overlap, `CODE_STYLE.md` has the "how" (which token, which prop) and this file
has the "why"/"when".

## 1. Layout stability

Dense, state-driven panels (the Stack panel and anything like it) are where
layout-jump complaints come from. Rules, in priority order:

- **Reserve space for content that changes, don't conditionally mount it.** A
  status indicator that sometimes shows a suffix (e.g. a `…` running marker) or
  a message that sometimes appears (e.g. a fail message + suggested fix) should
  always render that slot and vary its *content*, not its presence —
  `visibility: hidden` to reserve width, one always-rendered message slot with
  branching content inside instead of several independently-conditional blocks.
  Conditionally mounting/unmounting an element is what causes surrounding
  elements to visibly shift or jump.
- **Center content as a group within a fixed-height container; don't anchor it
  to one edge by default.** A short message in a taller, fixed-height section
  should center vertically (`justifyContent: 'center'` on the section's flex
  column), not stick to the top and leave dead space below. Only anchor to an
  edge when there's a deliberate reason (e.g. a log that should grow downward
  from a fixed top).
- **An empty-state fallback needs the same height treatment as the populated
  state.** If the populated branch of a component fills its container's full
  height, the empty-state branch (typically a single "No X." message) must be
  wrapped the same way — a centered `flex: 1` container — or it will sit at the
  top with a large gap below it.
- **Verify across states, not in isolation.** Layout balance only shows up when
  you trigger every state of a component (loading, pass, fail, empty,
  populated) live in the browser — reasoning about one state's styles in
  isolation misses how it compares to the others.

## 2. Visual hierarchy

- **Reserve Luminari (the serif/title font) for headings and special titles
  only.** Page H1s, markdown headings, and a deliberate one-off "special title"
  moment — not body text, not table rows, not buttons, not sidebar nav items.
  Everything else should read in the simpler body font so the ornate display
  font keeps its weight as a signal of "this is a heading," not background
  noise. (Implementation: `--paper-font-default` in `src/app/styles/utilities.css`
  — see `CODE_STYLE.md`'s Fonts section.)
- Within a list item or card, the title should be the most visually dominant
  element (larger and/or bolder than metadata, tags, or body text) — but match
  styling for the *same kind of title* across views (e.g. a plan's title reads
  the same way in the list and in its detail view) rather than inventing a
  different weight per screen.
- Prefer paper-ui's existing `Stamp`/color conventions for conveying state
  (pass/fail/running, plan status) over inventing new color meanings. Once a
  color means something in one place (e.g. rose = fail), keep that meaning
  everywhere else it appears.

## 3. Motion

Motion should be restrained and purposeful — it should clarify a state change
(a panel sliding in, a list item arriving), not decorate. Avoid motion for
motion's sake, and respect the user's reduced-motion system preference. See
"Motion" in `CODE_STYLE.md` for which library/pattern to reach for.

## 4. Verifying changes

UI/UX changes should be confirmed live in the browser (Claude in Chrome or
equivalent), not just by reading the JSX — this is how the layout-stability and
visual-hierarchy issues above actually get caught. `tsc`/lint/tests verify
correctness, not how something looks or feels.
