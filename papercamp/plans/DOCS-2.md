---
id: DOCS-2
title: Restructure repo-root docs
kind: docs
status: idea
created: 2026-06-30
idea: IDEA-22
tags:
  - docs
  - readme
  - restructure
  - coderabbit
---

Move the prose documentation files from the repo root into a `docs/` folder, keep deliberate exceptions (`AGENTS.md`, `CHANGELOG.md`) in place, and rewrite `README.md` to reflect the app's current routes. The repo root currently has six markdown files; only `README.md` and the two exceptions belong there long-term. Three knock-on updates are easy to miss: `AGENTS.md`'s cross-references to `CODE_STYLE.md` and `UX_PRINCIPLES.md` need their paths updated to `docs/`-prefixed forms once the files move, `.coderabbit.yaml`'s `path_instructions` glob covers only root-level `*.md` and must be widened to reach the moved files, and `MAIN.md`'s manifesto-style content should be considered for folding into the refreshed `README.md` rather than being relocated verbatim.

### Phases
- [ ] Move CODE_STYLE.md, UX_PRINCIPLES.md, and MAIN.md into docs/
      Create the `docs/` folder and `git mv` all three files into it. Cross-references between these files use bare relative paths (e.g. `[CODE_STYLE.md](CODE_STYLE.md)`), which stay valid after the move since all three land in the same folder.
- [ ] Update AGENTS.md cross-references
      `AGENTS.md` lines 19–20 reference `CODE_STYLE.md` and `UX_PRINCIPLES.md` by bare filename; update those to `docs/CODE_STYLE.md` and `docs/UX_PRINCIPLES.md` now that the files have moved while `AGENTS.md` itself stays at the root.
- [ ] Widen .coderabbit.yaml path glob to cover docs/
      The `path_instructions` entry with `path: "*.md"` is a root-only glob and won't match the moved files. Change it to `**/*.md` or add a dedicated `docs/*.md` entry so the "follow AGENTS.md and markdown conventions" instruction still applies.
- [ ] Decide MAIN.md content disposition
      Determine whether `docs/MAIN.md`'s manifesto-style "why this exists" content should stay as a standalone file in `docs/` or be folded into the refreshed `README.md`'s intro section. The README is the first thing a visitor reads, so the content may suit that role better than a separate file.
- [ ] Rewrite README.md for current app state
      Fix the stale "Pages" section: remove `Focus` (removed per `progress.md` 2026-06-18 entry), add `Review` and `Docs` (both exist as real routes in `src/app/router.tsx`). Incorporate MAIN.md content if that phase chose to fold it in. Ensure the overview accurately matches what the app is today.
