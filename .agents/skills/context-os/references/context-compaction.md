# Context compaction — survive it cleanly

Load this before context compaction or any likely session loss (usage limit, restart).
Compaction summarizes and drops detail; ContextOS's job is to make sure nothing expensive
to reconstruct is lost, so recovery afterward is cheap.

## The principle

Before context is compacted or lost, **persist anything that would be expensive to
reconstruct** into `.context/`. After compaction, **reground from the files**, not from the
degraded summary.

## Snapshot before compaction

When compaction is imminent (or you're near a limit), snapshot:

```
STATUS.md     — current objective, in-progress detail, honest validation, git state
DECISIONS.md  — any decision made this session that isn't recorded yet
HANDOFF.md    — Next Exact Action + Do Not Redo, so a cold reader can continue
```

Do **not** dump trivia — logs, verbose reasoning, or full transcripts don't belong in
`.context/`. Persist the *conclusions and state*, not the journey.

## Recover after compaction

Treat the post-compaction state like a fresh session:

```
re-read .context/STATUS.md and HANDOFF.md
  → verify against git and a real validation run
    → resume from Next Exact Action
```

See [context-recovery](context-recovery.md). If the compacted summary and the files
disagree, the files (backed by code/git) win.

## Claude Code hooks (optional automation)

Claude Code exposes hooks that can automate the snapshot/recover cycle. Verified events:

- `PreCompact` — fires **before** compaction: a good moment to ensure STATUS/HANDOFF are
  current (e.g. remind the agent, or run a snapshot helper).
- `PostCompact` — fires **after** compaction completes: a good moment to re-read
  `.context/STATUS.md` and `HANDOFF.md`.
- `SessionEnd` — write/refresh the handoff as a session ends.
- `SessionStart` — restore context when a session begins or resumes.

Configuration and safe, non-destructive examples are in
[docs/HOOKS.md](../../../docs/HOOKS.md). Hooks are **optional**: the protocol works by
hand on any agent. Never install destructive hooks silently.

## Why this beats relying on the summary

An auto-generated compaction summary is lossy and model-specific. A committed `STATUS` +
`HANDOFF` is precise, reviewable, portable across models, and survives a full restart.
That difference is the reason ContextOS keeps truth in files.
