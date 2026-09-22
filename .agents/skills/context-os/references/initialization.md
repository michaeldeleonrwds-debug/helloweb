# Initialization — bootstrapping a new project

Load this when a **substantial new project** appears. For trivial requests, do nothing
here (see the threshold in `SKILL.md`).

## The flow

```
USER IDEA
  → UNDERSTAND INTENT
    → IMPROVE THE REQUEST
      → GENERATE PRD
        → GENERATE ARCHITECTURE
          → GENERATE IMPLEMENTATION PLAN
            → GENERATE INITIAL STATUS
              → START DEVELOPMENT
```

## Step by step

### 1. Understand intent
Read the request for what the user is actually trying to build and why. Inspect the
repository if one exists (`git status`, tree, manifests, README) before assuming. Resolve
ambiguity with reasonable engineering judgement; ask only genuinely blocking questions.

### 2. Improve the request
If the request is vague or bundles several asks, run it through the
[prompt-compiler](prompt-compiler.md) first so you build against a clear spec.

### 3. Decide whether to initialize `.context/`
Create `.context/` only for substantial work. Signals it is warranted:
- a new product, service, app, or library;
- a feature that spans multiple files/areas or multiple sessions;
- work that will be handed off, resumed, or reviewed.

Do **not** initialize for: typo/spacing fixes, single-function renames, one-line tweaks.

### 4. Scaffold
Run `contextos init` or copy `templates/.context/`. This creates `INDEX`, `STATUS`,
`CONSTRAINTS`, `PRD`, `ARCHITECTURE`, `PLAN`, `DECISIONS`, `HANDOFF`, and the
`prompts/ sessions/ archive/` directories.

### 5. Generate PRD
Fill `.context/PRD.md` using the [prd-engine](prd-engine.md): overview, problem, users,
goals, non-goals, features with IDs, flows, functional & non-functional requirements,
constraints, acceptance criteria, open questions.

### 6. Generate architecture
Fill `.context/ARCHITECTURE.md`: the system shape, components and responsibilities, data
model, external dependencies, key decisions, risks. Seed `DECISIONS.md` with the first
real decisions (`D-001`, …) as you make them.

### 7. Generate the plan
Fill `.context/PLAN.md` with phases. Each phase: objective, tasks, dependencies,
validation, exit criteria, status. Map PRD requirement IDs into the traceability table.

### 8. Seed constraints
Fill `.context/CONSTRAINTS.md` with the hard MUST / MUST NOT rules you already know
(platform, compatibility, auth, "no mock data in production", "tests before done").

### 9. Write initial STATUS
Fill `.context/STATUS.md`: current objective = "Phase 1 — <name>", next action = the first
concrete task, validation all `not-run`, git branch/commit. Now start building.

## For an existing project

Do **not** dump the whole repo. Do repository discovery first
([context-budget](context-budget.md) → "Repository discovery"), then create only the
`.context/` files that add value. Reconstruct STATUS/PLAN from the code and git history
rather than inventing them.

## Anti-patterns

- Generating a giant `.context/` for a one-line change.
- Writing a PRD full of invented product decisions the user never made.
- Marking phases "done" because code was written, without meeting exit criteria.
- Asking the user questions you could answer by reading the repo.
