# Prompt compiler — vague request → execution spec

Load this when a request is vague, sprawling, or bundles several asks. Internally
transform it into an engineering-quality execution specification **before** coding. This
is one of ContextOS's highest-leverage capabilities.

## Example

Raw request:

```
fix auth, make dashboard better and make everything faster
```

Compiled spec:

```
OBJECTIVE
  Resolve the reported auth failure, improve dashboard usability, and reduce
  perceived latency across the app.

CURRENT SYSTEM
  <what exists today — filled from repository inspection>

REQUIREMENTS
  1. Auth: identify and fix the specific failure (repro first). Do not change the
     auth provider (see CONSTRAINTS).
  2. Dashboard: improve information hierarchy and empty/loading states. Scope to the
     main dashboard route.
  3. Performance: measure first; target the largest real bottleneck (p95 load).

CONSTRAINTS
  - No auth-provider change. No mock data in production paths. Tests before "done".

FILES / AREAS TO INSPECT
  - auth: src/auth/*, middleware, session handling
  - dashboard: src/routes/dashboard/*, shared components
  - perf: bundle/build config, data fetching, obvious N+1s

IMPLEMENTATION APPROACH
  - Reproduce the auth bug, write a failing test, fix, confirm.
  - Audit the dashboard against a short heuristic list; make targeted changes.
  - Profile, fix the top bottleneck, re-measure. Avoid speculative rewrites.

VALIDATION
  - Unit + e2e for auth; visual/manual check for dashboard; before/after perf numbers.

DEFINITION OF DONE
  - Auth bug fixed with a regression test; dashboard changes reviewed; a measured,
    documented latency improvement on the target path.
```

## The compiled shape

Always produce these sections (omit one only if truly not applicable):

- **OBJECTIVE** — the outcome in one or two sentences.
- **CURRENT SYSTEM** — what exists today (from repository inspection, not assumption).
- **REQUIREMENTS** — concrete, numbered, testable.
- **CONSTRAINTS** — hard rules (pull from `CONSTRAINTS.md` if present).
- **FILES / AREAS TO INSPECT** — where the work lives.
- **IMPLEMENTATION APPROACH** — the plan, favouring the smallest correct change.
- **VALIDATION** — how each requirement is checked.
- **DEFINITION OF DONE** — the finish line.

## What to improve — and what not to

**Improve:** clarity, completeness, technical structure, acceptance criteria, test
requirements, safety constraints.

**Preserve:** the user's actual intent. Do **not** invent major product decisions. If a
requirement is genuinely ambiguous and you cannot resolve it from the repo, note it and
either pick a reasonable default (and say so) or ask — but only if it truly blocks work.

## Compact interpretation (for significant work)

For a significant request, also derive a short interpretation to confirm alignment:

```
Goal:            <one line>
User:            <who it's for>
Core requirements: <bulleted>
Constraints:     <bulleted>
Assumptions:     <the defaults you chose, made explicit>
Definition of done: <bulleted>
```

Surface assumptions explicitly so the user can correct them cheaply.

## Persisting compiled prompts

Persist to `.context/prompts/` only for **substantial** requests:
- `prompts/original/<slug>.md` — the verbatim request.
- `prompts/compiled/<slug>.md` — the compiled spec.

Do **not** persist tiny everyday prompts — that is just noise.

## Ask only blocking questions

Avoid unnecessary questions when repository inspection or reasonable engineering judgement
resolves the point. Reserve questions for genuine blockers (irreversible choices, missing
credentials/access, contradictory requirements).
