# Decision memory — ADR entries that don't get reversed

Load this when recording an architectural or otherwise durable decision in
`.context/DECISIONS.md`. The purpose of this file is singular: **stop a future agent (or a
different model) from unknowingly reversing an intentional decision.**

## When to record a decision

Record when a choice is durable and would be costly or confusing to reverse:
- choosing a technology, provider, or pattern (auth provider, DB, state library);
- a boundary or contract (public API shape, module ownership);
- a deliberate trade-off ("we accept X to get Y");
- anything you'd be annoyed to see silently undone later.

Do **not** record ephemeral choices (a variable name, a local refactor).

## Entry format

```
## D-014 — Continue using Supabase Auth

Status: Accepted            # Proposed | Accepted | Superseded by D-XXX
Date: 2026-08-16

Decision:
Keep Supabase as the authentication provider.

Reason:
Existing user IDs and row-level security depend on Supabase.

Implication:
Authentication changes must remain compatible with Supabase sessions and RLS.

Do not:
Replace with Firebase/Clerk/etc. without explicit approval.
```

The **Do not** line is the most important: it is the guardrail a future agent will hit.

## Rules

- **IDs are sequential and permanent** (`D-001`, `D-002`, …). Never reuse.
- **Never delete an accepted decision.** If it changes, add a new entry and mark the old
  one `Status: Superseded by D-XXX`, with a one-line reason. History is the point.
- **Link scope changes.** When a PRD scope change drives a decision, reference the PRD
  requirement IDs so the trail is complete.
- **Keep entries compact** — four short sections, not an essay.

## Before making an architectural change

Read `DECISIONS.md` first. If your change would contradict an accepted decision:
1. Stop.
2. Surface the conflict explicitly (quote the decision).
3. Get approval, then supersede the decision with a new entry.

Do not quietly reverse it and hope no one notices — that is exactly the failure this file
exists to prevent.

## Relationship to CONSTRAINTS

`CONSTRAINTS.md` holds hard rules (MUST / MUST NOT). `DECISIONS.md` holds the reasoned
choices and their history. A constraint often *originates* in a decision; when it does,
state the constraint in `CONSTRAINTS.md` and the reasoning in `DECISIONS.md`.
