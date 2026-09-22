# Multi-agent context — task packets and result summaries

Load this when delegating to a sub-agent, or orchestrating several. The rule: a sub-agent
gets the **minimum sufficient context**, not the whole project history. The orchestrator
owns global state.

## Why not pass everything

Passing the full history to each sub-agent causes duplicated research, conflicting
assumptions, and token blow-up. Each sub-agent should receive a tight, self-contained
packet and return a tight summary.

## Task packet (orchestrator → sub-agent)

```
TASK
  <the one thing to do>

OBJECTIVE
  <the outcome and why it matters>

RELEVANT FILES
  <the few files/dirs to look at — with why each matters>

RELEVANT REQUIREMENTS
  <PRD IDs in scope, e.g. AUTH-002>

CONSTRAINTS
  <the hard rules this task must respect — pulled from CONSTRAINTS.md>

KNOWN FACTS
  <what's already been established, so the sub-agent doesn't re-derive it>

EXPECTED OUTPUT
  <exactly what to return>

VALIDATION
  <how the sub-agent should verify its own work>
```

Give only the slice of the PRD/architecture that the task needs — not the whole document.

## Result summary (sub-agent → orchestrator)

```
FINDINGS        what was learned
CHANGES         what was changed (behavioral summary)
FILES TOUCHED   explicit list
TESTS           what was run and the real result
RISKS           what might be wrong or fragile
REMAINING WORK  what's left / follow-ups
```

The orchestrator integrates this into global state — updating `STATUS.md`, recording any
`DECISIONS`, and reconciling anything that conflicts with existing memory.

## Orchestrator responsibilities

- **Own the truth.** Sub-agents don't update `STATUS`/`DECISIONS` directly; the
  orchestrator does, after integrating their summaries. This keeps one coherent state.
- **Prevent overlap.** Scope packets so two sub-agents don't edit the same area against
  different assumptions.
- **De-duplicate research.** Put shared, already-known facts in `KNOWN FACTS` so each
  sub-agent starts from them instead of rediscovering.
- **Verify before believing.** Treat a sub-agent's "tests pass" like any other claim —
  confirm against reality before marking work done.

## Fit with the rest of ContextOS

Task packets are the [prompt-compiler](prompt-compiler.md) applied at delegation scope, and
result summaries feed the [status-protocol](status-protocol.md) and
[handoff-protocol](handoff-protocol.md). The [context-budget](context-budget.md) rule
("smallest sufficient context") is exactly what makes a good packet.
