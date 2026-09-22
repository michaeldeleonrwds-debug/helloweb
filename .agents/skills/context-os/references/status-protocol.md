# Status protocol — keeping the heartbeat accurate

Load this when updating `.context/STATUS.md`. STATUS is the single most-read file: a new
agent should understand the project from it alone, without any conversation history.

## When to update

Update at **meaningful boundaries**:

```
phase completion · feature completion · important bug discovered · new blocker ·
architectural decision · test run · failed validation · commit · handoff · session ending ·
before context compaction
```

Do **not** rewrite STATUS after every minor edit. It is a snapshot, not a change log.

## The shape

```
Updated: 2026-08-16
Agent:   Claude Code
Phase:   Phase 2 — Authentication
Status:  on-track            # on-track | blocked | needs-review

## Current Objective   — one or two sentences
## Completed           — done & verified (reference requirement IDs)
## In Progress         — actively being worked
## Blocked             — with enough detail to unblock; "None" if clear
## Next Action         — the single most important next step, concrete
## Validation          — last result of each check (pass | fail | n/a | not-run)
## Git                 — branch, latest verified commit, dirty files
```

## Rules that keep STATUS trustworthy

- **Honesty over optimism.** If a test failed, `Validation` says `fail`. If you didn't run
  it, say `not-run` — never `pass`. A STATUS that lies is worse than none.
- **One clear Next Action.** If you can't name the next action, the project isn't ready to
  continue — resolve that first.
- **Keep it compact.** Trim completed detail; the git history is the long record.
- **Absolute dates.** `Updated: 2026-08-16`.
- **Match git.** `Latest verified commit` should be a commit whose state you actually
  verified (tests green), not just the newest commit.

## Validation field

Record the real, last-known result of each gate:

```
Typecheck: pass
Lint: pass
Unit: pass
Integration: not-run
E2E: fail        # AUTH-002 flow times out — see Blocked
Build: pass
Browser: not-run
Production: n/a
```

`pass` means *you ran it and it passed*. Anything else is `fail`, `not-run`, or `n/a`.

## Relationship to other files

- STATUS summarizes; it does not duplicate. Decisions live in `DECISIONS.md`, requirements
  in `PRD.md`, the phased plan in `PLAN.md`.
- On session end, STATUS feeds `HANDOFF.md` ([handoff-protocol](handoff-protocol.md)).
- If STATUS and the code disagree, the code wins — reconcile via
  [context-recovery](context-recovery.md) and fix STATUS.
