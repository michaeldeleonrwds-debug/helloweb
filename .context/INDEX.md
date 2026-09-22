# ContextOS Index

> The smallest file in `.context/`. It tells an agent **what context exists and when to
> read it** — so nobody loads everything by default. Keep it tiny.

## Always

Read at the start of any task:
- `STATUS.md` — where the project is right now
- `CONSTRAINTS.md` — the hard rules you must not break

## When implementing features

Read only the relevant sections of:
- `PRD.md` — requirements (search by requirement ID)
- `ARCHITECTURE.md` — how the system fits together
- `PLAN.md` — the current phase and its exit criteria

## Before architectural changes

Read:
- `DECISIONS.md` — decisions already made (do not silently reverse them)

## When resuming or switching agents

Read:
- `HANDOFF.md` — the exact next action and everything needed to continue
- then verify against `git status` and the actual code

## Do not load unless needed

- `archive/` — cold storage (old sessions, superseded notes)
- `sessions/` — past session notes
- `prompts/` — original and compiled prompts

---
_Rule: use the smallest high-signal context sufficient to make the next decision
correctly. More context is not better context._
