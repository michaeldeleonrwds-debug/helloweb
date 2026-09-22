# PRD engine — generating and evolving requirements

Load this when creating or updating `.context/PRD.md`. A good PRD is the difference
between building the right thing and building *a* thing.

## When to generate a PRD

- A new product or a feature substantial enough to have its own requirements.
- **Not** for trivial changes. No PRD for "fix button spacing".

## Structure

Fill every section that applies. Omit a section only if it genuinely doesn't apply — say
so rather than leaving it blank.

- **Overview** — what is being built, in a few sentences.
- **Problem** — what problem it solves and why it matters.
- **Users** — who uses it and what they need.
- **Goals** — what the project must accomplish.
- **Non-goals** — what is explicitly out of scope (prevents scope creep).
- **Features** — structured requirements with **IDs**.
- **User flows** — the important workflows, step by step.
- **Functional requirements** — detailed behavior.
- **Non-functional requirements** — performance, accessibility, security, reliability,
  compatibility.
- **Constraints** — hard requirements (mirror the critical ones into `CONSTRAINTS.md`).
- **Acceptance criteria** — how completion is verified; make them testable.
- **Open questions** — only genuinely unresolved items.

## Requirement IDs

Give features stable IDs grouped by area so tests and status can trace to them:

```
AUTH-001  Users can sign in with Google OAuth
AUTH-002  Sessions expire after 30 days of inactivity
API-001   POST /orders creates an order and returns 201
PERF-001  p95 dashboard load < 1.5s on a mid-tier laptop
UI-001    Empty states exist for every list view
```

IDs are permanent. If a requirement is dropped, mark it superseded — do not reuse its ID.

## Writing acceptance criteria

Each acceptance criterion should be checkable by a test or an explicit manual step:

```
AC-1  AUTH-001: a new user completes Google sign-in and lands on /dashboard
      → tests/e2e/auth-google.spec.ts
AC-2  API-001: POST /orders with a valid body returns 201 and the order id
      → tests/api/orders.test.ts
```

## Evolving the PRD (scope changes)

Requirements change. When they do:

```
USER REQUEST
  → detect scope change
    → update PRD (add/modify requirements, keep IDs stable)
      → record the decision in DECISIONS.md
        → update PLAN (tasks, traceability)
          → update STATUS
            → continue
```

Rules:
- **Never silently delete** an old requirement. Move it under a short
  "Changed / superseded" note with the date and the reason, or mark it `[superseded]`.
- Record *why* the scope changed as a decision (`DECISIONS.md`), so a future agent doesn't
  "fix" the PRD back to the old requirement.
- Keep acceptance criteria in sync — a new requirement without a test target is not done.

## Preserve intent; don't invent

Improve clarity, completeness, and structure. Do **not** invent major product decisions
(new features, business rules, target users) the user never expressed. Where a detail is
genuinely undetermined and not resolvable from the repo, list it under **Open questions**
rather than guessing — but resolve trivially-inferable details yourself.

## Quality bar

A PRD is good when a competent engineer who has never seen the conversation could read it
and build the right thing, and a reviewer could tell whether it was built correctly.
