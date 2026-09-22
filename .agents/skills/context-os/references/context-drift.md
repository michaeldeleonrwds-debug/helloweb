# Context drift — detect it early, repair it fast

Load this when something feels off in a long session. Drift is when your working picture
has diverged from reality. Catching it early is far cheaper than the wrong work it causes.

## Warning signs

```
reimplementing a feature that's already done
contradicting the PRD or a decision
forgetting a user constraint
switching architecture with no reason
reopening a bug that was fixed
repeatedly reading the same files
guessing file paths instead of searching
redoing research you already did
claiming tests ran when they didn't
```

Any one of these means: stop and check before continuing.

## Repair procedure

```
STOP
  → inspect git (status, log, diff)
    → read STATUS.md
      → read CONSTRAINTS.md
        → read DECISIONS.md
          → read the relevant PRD sections
            → compare all of that against the ACTUAL code
              → repair stale memory in place
                → continue
```

Believe the code and tests over your recollection and over stale docs (full ordering in
[context-recovery](context-recovery.md)). After repairing, update the `.context/` files
you found stale so the drift doesn't recur.

## Prevention

- **Anchor to `.context/` at task boundaries.** Re-read `STATUS` + `CONSTRAINTS` when
  starting a new task rather than trusting a long-running mental model.
- **Search, don't guess.** Guessing paths and re-reading files are the earliest drift
  tells — treat them as a prompt to reground.
- **Let finished context go.** Drop L1/L2 context from completed tasks so it can't
  contaminate the next one ([context-budget](context-budget.md)).
- **Persist at boundaries.** Fresh `STATUS`/`HANDOFF` mean that even after compaction you
  reground from truth, not from a degraded conversation.

## Drift vs. staleness

- **Drift** = *your* live picture diverged from reality (a session problem). Fix by
  regrounding.
- **Staleness** = a *file* diverged from reality (a memory problem). Fix by updating the
  file. They often appear together; handle both.
