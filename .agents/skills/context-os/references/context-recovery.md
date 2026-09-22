# Context recovery — rehydrate and reconcile

Load this when resuming work (new session, new agent) or when project memory looks stale
or contradictory. Goal: rebuild an accurate working picture from the repository, not from
a conversation you no longer have.

## Rehydration sequence

```
read AGENTS.md / CLAUDE.md      # the entrypoint that points at .context/
  → read .context/INDEX.md      # what context exists
    → read .context/STATUS.md   # where things stand
      → read .context/HANDOFF.md# the exact next action + do-not-redo
        → verify against reality:
            git status / git log
            run or check the validation gates STATUS claims
            open the "Relevant Files" from HANDOFF
```

After this you should be able to state the correct **next action** with confidence. If you
can't, keep reconciling before you write code.

## Reconciling stale memory

Documentation drifts. When `.context/` and the code disagree, trust:

```
current user instruction
  → actual repository / test results
    → currently accepted decisions (DECISIONS.md)
      → current PRD
        → architecture
          → status
            → handoff
              → archived session notes
```

When you find a mismatch:
1. Believe the code/tests over the doc.
2. **Repair the doc in place** (update STATUS/PLAN/ARCHITECTURE) so the next agent doesn't
   re-hit the same staleness.
3. If the mismatch reveals a reversed or forgotten decision, check `DECISIONS.md` and
   restore or supersede it explicitly.

## Reconstructing missing context

If a file is missing or empty:
- **STATUS** — reconstruct from `git log`, the current branch, and a quick test run.
- **PLAN** — infer phases from the code that exists and what the PRD still requires.
- **DECISIONS** — recover from commit messages, code comments, and config; write down what
  you can verify, and mark anything uncertain as `Proposed`.
- **HANDOFF** — regenerate from STATUS + the current diff.

Reconstruct from evidence, not imagination. Mark anything you inferred rather than
confirmed.

## Sanity checks after recovery

- Does `Next Action` in HANDOFF still make sense given the actual code?
- Do the validation results in STATUS match a real run? If not, re-run and update.
- Are there completed items in `Do Not Redo` that the code shows as *not* done? If so, the
  memory was wrong — fix it and note it.

## Relationship to drift and compaction

Recovery is the cure; [context-drift](context-drift.md) is the early-warning system, and
[context-compaction](context-compaction.md) is the prevention (snapshot before you lose
context so recovery is cheap).
