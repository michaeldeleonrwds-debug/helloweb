# AI Handoff

Updated: 2026-09-23
From: Codex

## Objective

Build an original website builder framework on Laravel, React, TypeScript, Inertia, Tailwind, Vite, and MySQL.

## Current State

Phase 4 renderer foundation is complete and validated. The framework now has document contracts, component definitions/registries, deterministic tree operations, and renderer foundation. No visual editor, database persistence, dashboard CRUD, canvas interaction layer, inspector, drag/drop, publishing, revisions, templates UI, or media library exists yet.

## Completed

- Phase 0: Audited starter kit structure and documented framework guardrails.
- Phase 1: Implemented PHP and TypeScript page document/component node contracts and document validation tests.
- Phase 2: Implemented PHP and TypeScript component definitions, registries, built-ins, capabilities, defaults, child-rule metadata, and registry tests.
- Phase 3: Implemented PHP and TypeScript component tree engines with `find`, `findParent`, `insert`, `remove`, `move`, and `duplicate`.
- Phase 4: Implemented PHP and TypeScript renderer contracts, render context, render result, renderer registry, renderer errors, style resolver, and recursive document renderer.
- Phase 4: Added built-in renderer behavior for `layout.root`, `layout.section`, `layout.container`, and `content.heading`.
- Phase 4: Added `layout.root` as a structural built-in component definition so renderer resolution still flows through ComponentRegistry.
- Phase 4: Added deterministic HTML serialization for neutral render results.
- Phase 4: Added responsive style resolution: defaults plus desktop, tablet, and mobile overrides.
- Phase 4: Added renderer tests for recursive rendering, built-ins, heading props/text, default styles, responsive styles, unknown component types/renderers, duplicate renderer registration, deterministic output, immutability, invalid nodes, registry behavior, and editor independence.

## In Progress

- None.

## Important Decisions

- D-001: Build our own framework architecture; do not copy WordPress/Elementor/Webflow concepts.
- D-002: Persist page composition as schema-versioned documents, not component-per-row.
- D-003: Keep editor UI separate from public renderer.
- D-004: Use `app/Builder` and `resources/js/builder` for framework contracts.
- D-005: Use data-driven component definitions and registries.
- D-006: Keep tree operations immutable and registry-enforced.
- D-007: Keep renderer registry separate from component registry.

## Constraints

See `CONSTRAINTS.md` and `AGENTS.md`. The biggest rule: this is a framework, not a CRUD app.

## Relevant Files

- `AGENTS.md` - permanent engineering rules.
- `.context/PRD.md` - requirements and non-goals.
- `.context/ARCHITECTURE.md` - current architecture, including Phase 4 renderer foundation.
- `.context/PLAN.md` - milestone roadmap; Phase 5 is next.
- `.context/DECISIONS.md` - accepted architecture decisions.
- `app/Builder/Document/*` - PHP builder document schema, validation, serialization.
- `app/Builder/Component/ComponentDefinition.php` - PHP component definition contract.
- `app/Builder/Registry/*` - PHP component registry and built-ins.
- `app/Builder/Engine/*` - PHP component tree engine, positions, errors, and ID generation.
- `app/Builder/Renderer/*` - PHP renderer contracts, registry, context, result, style resolver, and built-ins.
- `resources/js/builder/document.ts` - frontend document contracts.
- `resources/js/builder/component/definition.ts` - TypeScript component definition contract.
- `resources/js/builder/registry/*` - TypeScript component registry and built-ins.
- `resources/js/builder/engine/*` - TypeScript tree engine, positions, errors, and ID generation.
- `resources/js/builder/renderer/*` - TypeScript renderer contracts, registry, context, result, style resolver, and built-ins.
- `tests/Unit/Builder/BuilderDocumentTest.php` - Phase 1 contract tests.
- `tests/Unit/Builder/Registry/ComponentRegistryTest.php` - Phase 2 registry tests.
- `tests/Unit/Builder/Engine/ComponentTreeEngineTest.php` - Phase 3 tree engine tests.
- `tests/Unit/Builder/Renderer/BuilderRendererTest.php` - Phase 4 renderer tests.

## Validation

- PASS: `vendor\bin\phpunit.bat --filter BuilderRendererTest`.
- PASS: `vendor\bin\phpunit.bat` - 87 tests, 184 assertions; reports 2 deprecations but exits successfully.
- PASS: `npx tsc --noEmit`.
- PASS: `npm run build`.
- PASS: `vendor\bin\pint.bat --test app/Builder/Renderer tests/Unit/Builder/Renderer app/Builder/Registry/BuiltInComponentDefinitions.php`.
- PASS: `npx prettier --check resources/js/builder`.
- FAIL: `npm run format:check` because pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx` need formatting. Phase 4 TypeScript files are not part of this remaining failure.

## Known Problems

- `.env` uses SQLite while the intended production persistence direction is MySQL.
- `HandleInertiaRequests::share()` calls/spreads `parent::share($request)` redundantly; review when touching Inertia middleware.
- Git repository reports no commits and shows the project as untracked from a parent repository.
- The shell sandbox may not expose PHP on PATH; PHP-based validation was run successfully outside that restriction.

## Do Not Redo

- Do not re-audit Phase 0 unless code has changed.
- Do not redo Phase 1 document contracts.
- Do not redo Phase 2 registry contracts.
- Do not redo Phase 3 tree operations.
- Do not redo Phase 4 renderer foundation unless a future accepted milestone requires it.
- Do not implement drag/drop, inspector, persistence, CRUD screens, publishing, media, templates, or undo/redo before their milestones.
- Do not replace starter auth/settings without explicit milestone need.

## Next Exact Action

When explicitly requested, start PHASE 5 - BUILDER CANVAS AND SELECTION by creating the first editor surface over the existing document, registry, tree engine, and renderer contracts.

## Risks

- Phase 5 can accidentally turn the framework into page-specific React state if it bypasses the tree engine.
- Canvas work can accidentally import editor-only state into renderer contracts; keep renderer public-safe.
- CRUD-first persistence will fight the versioned document model.
