# Context budget — load the least sufficient

Load this when deciding how much to pull into context, or when starting on an existing
repository. The core rule: **use the smallest high-signal context sufficient to make the
next decision correctly. More context is not better context.**

## The budget hierarchy

```
L0 — ALWAYS
  Current objective · STATUS.md · CONSTRAINTS.md

L1 — TASK CONTEXT
  Files relevant to the current task · relevant tests · relevant architecture section ·
  the current PLAN phase

L2 — REFERENCE
  Relevant PRD sections · API docs · database schema · prior research

L3 — COLD STORAGE
  Old sessions · completed investigations · large logs · superseded notes (archive/)
```

Pull from the lowest level that answers the question. Escalate to L1/L2 only when the next
decision actually needs it. L3 is loaded rarely and deliberately.

## Why not just load everything

- Long context degrades: the model forgets earlier details, contradicts requirements, and
  fixates on whatever is most recent or most repeated.
- Irrelevant files crowd out signal and invite wrong assumptions.
- Tokens spent re-reading the same files are tokens not spent reasoning.

## Repository discovery (existing project)

Do **not** read the whole repository. Start narrow, widen only as needed:

```
git status                      # what's dirty, what branch
repository tree (top levels)    # shape, not contents
package manifests               # package.json / pyproject / go.mod / Cargo.toml …
README                          # human intent
CLAUDE.md / AGENTS.md           # agent entrypoints
.context/INDEX.md               # what context exists
.context/STATUS.md              # where things stand
```

Then search for what the current task touches:

```
symbols · routes · components · services · database schema · tests · configuration
```

Open a file only when the task needs it. Prefer search (grep/glob) over reading whole
directories; prefer reading the relevant span over the whole file.

## Practical heuristics

- Before reading a file, ask: *what decision does this unblock?* If none, skip it.
- Re-reading a file you already read is a drift signal ([context-drift](context-drift.md)).
- If you're unsure where something is, search — don't guess paths.
- When a task is done, let its L1/L2 context go; reload fresh for the next task.

## Measuring cost

`.context/` files are read constantly, so their size is a running tax. Keep `INDEX.md` and
`STATUS.md` small. The repo's `contextos health` command and CI report context-size so
bloat is visible; treat a growing STATUS as a smell.
