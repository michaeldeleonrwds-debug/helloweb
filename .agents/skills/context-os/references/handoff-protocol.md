# Handoff protocol — write the baton so anyone can catch it

Load this when ending a session, approaching a usage/context limit, or preparing to switch
models. Write `.context/HANDOFF.md` so a **different agent, without your conversation**,
can continue correctly and immediately.

## The test for a good handoff

> A different model reads only `.context/` (STATUS, CONSTRAINTS, HANDOFF, and the files
> HANDOFF points to) and takes the correct next action without asking you anything.

If that isn't true, the handoff isn't done.

## Structure

```
## Objective            what the project is trying to achieve now
## Current State        where things actually stand (git + code are the truth)
## Completed            done & verified
## In Progress          mid-flight work, and exactly how far it got
## Important Decisions   the decisions that constrain the next agent (link DECISIONS IDs)
## Constraints          the rules not to break (link CONSTRAINTS)
## Relevant Files       the few files that matter next, and why each matters
## Validation           last known test/build state — honest about what wasn't run
## Known Problems       bugs, flaky tests, rough edges the next agent will hit
## Do Not Redo          completed work that must not be repeated
## Next Exact Action    one concrete step, specific enough to start immediately
## Risks                what could go wrong and what to watch for
```

## Writing rules

- **Concrete over vague.** "Next: implement `refreshSession()` in `src/auth/session.ts`;
  the failing test is `auth-refresh.spec.ts:42`" beats "continue auth work".
- **Do Not Redo is a gift.** List the completed work explicitly so the next agent doesn't
  waste effort re-doing it — a top cause of lost time in handoffs.
- **Point, don't paste.** Reference files and requirement IDs; don't inline the whole PRD.
- **Match reality.** Regenerate `Current State`/`Validation` from `git status` and a real
  check, not from memory of what you *think* you did.
- **Keep it current.** A stale handoff is dangerous; refresh it before you stop.

## When to write / refresh

- Ending a session.
- Before a likely usage or context limit.
- Before switching models/agents ([model-switching](model-switching.md)).
- Before context compaction ([context-compaction](context-compaction.md)).

## After writing

Update `STATUS.md` to match, commit if appropriate (so the handoff is in git history), and
— if switching tools — make sure the target tool's entrypoint (`AGENTS.md` / `CLAUDE.md`)
points at `.context/` so the next agent finds the handoff.
