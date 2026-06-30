---
id: FEAT-25
title: Batch plan freshness audit
kind: feat
status: idea
created: 2026-06-30
idea: IDEA-21
tags:
  - audit
  - convergence-audit
  - batch
  - cli
  - dashboard
---

The single-plan convergence audit (`AuditPhasesButton`) already handles one plan at a time — same append-only AI pass, never rewrites, never checks off existing phases. This feature wraps that logic in a sweep: iterate every `review`/`done` plan in `plans.md`, run the existing audit against each, and surface which plans received new gap-phases. Two entry points are planned (not mutually exclusive): a `paper-camp audit` CLI command that prints a combined report, and an "Audit all" button in the Plans list or Stack panel that writes activity feed entries per plan touched. To avoid burning tokens on plans that haven't changed since their last clean audit, each plan needs a lightweight "last audited" marker — a log line or dedicated field — so the sweep can skip anything untouched since that stamp.

### Phases
- [ ] Add per-plan "last audited" marker
      Decide on a log line vs. a `**Audited:**` field; write it after each successful single-plan audit so the batch sweep has something to compare against. Update the AuditPhasesButton handler to stamp the marker on completion.
- [ ] Implement `paper-camp audit` CLI command skeleton
      Register the `audit` subcommand; parse `plans.md` and collect every plan whose status is `review` or `done`. No AI calls yet — just print the list of plans that would be audited.
- [ ] Wire convergence-audit logic into CLI loop
      For each collected plan, invoke the existing single-plan audit function (or its extracted core), skipping any plan whose "last audited" marker is newer than the plan's last modification. Append gap-phases to `plans.md` exactly as the single-plan path does.
- [ ] Print combined CLI audit report
      After the loop completes, emit a structured summary: which plans were audited, which were skipped (up to date), and how many gap-phases were appended to each.
- [ ] Add "Audit all" button to dashboard
      Surface the batch sweep in the Plans list or Stack panel UI; on click, run the same loop used by the CLI. Disable the button while a sweep is in progress.
- [ ] Emit activity feed entries per plan touched
      For each plan the dashboard sweep modifies, create an activity entry recording how many phases were appended, so the feed reflects the audit without requiring the user to diff `plans.md` manually.
