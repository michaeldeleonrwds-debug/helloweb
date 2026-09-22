# Project memory — the `.context/` files

Load this when reading from or writing to `.context/`. Full specification:
[docs/CONTEXT_PROTOCOL.md](../../../docs/CONTEXT_PROTOCOL.md). This reference is the
operational summary.

## The files and when to touch them

| File | Read when | Write when |
| :--- | :-------- | :--------- |
| `INDEX.md` | almost always (it's tiny) | rarely — only when the set of context files changes |
| `STATUS.md` | always, first | at meaningful boundaries ([status-protocol](status-protocol.md)) |
| `CONSTRAINTS.md` | always | when a hard rule is added/changed |
| `PRD.md` | implementing a feature (relevant sections) | on scope change ([prd-engine](prd-engine.md)) |
| `ARCHITECTURE.md` | before structural work | when structure changes (code wins — keep it true) |
| `PLAN.md` | to find the current phase / next task | when a phase/task advances |
| `DECISIONS.md` | before architectural changes | when a durable decision is made ([decision-memory](decision-memory.md)) |
| `HANDOFF.md` | resuming or switching agents | ending a session / before a limit ([handoff-protocol](handoff-protocol.md)) |

## Reading order

1. `INDEX.md` — to learn what exists.
2. `STATUS.md` — to learn where things stand.
3. `CONSTRAINTS.md` — to learn what you must not break.
4. Then, only what the task needs: relevant `PRD`/`ARCHITECTURE`/`PLAN` sections, and the
   relevant *code*.

## Writing rules

- **Keep it compact.** These files are read every session; every line costs tokens. Prefer
  bullets over prose. `INDEX` and `STATUS` especially must stay small.
- **Update, don't append forever.** `STATUS` is a snapshot — replace stale content, don't
  accumulate a diary. Move finished detail to `archive/` if it has lasting value, or drop it.
- **One source of truth per fact.** Don't duplicate the whole PRD into STATUS, or the whole
  architecture into HANDOFF. Link instead.
- **Dates absolute.** Write `2026-08-16`, not "today" or "yesterday".
- **Requirement IDs everywhere.** Reference `AUTH-001` so status, plan, and tests connect.

## Freshness and truth

`.context/` can go stale. It is documentation, and documentation drifts from code. Trust
order when they disagree: **current user instruction → actual code/tests → decisions → PRD
→ architecture → status → handoff → archive.** When you find something stale, fix it in
place; don't propagate it. See [context-recovery](context-recovery.md).

## Never store

Secrets, tokens, passwords, private customer data, or full chat transcripts. `.context/`
is project *intelligence*, not a credential store or a log dump. See
[SECURITY](../../../SECURITY.md).
