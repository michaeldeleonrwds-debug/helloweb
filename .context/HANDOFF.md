# AI Handoff

Updated: 2026-09-23
From: Codex

## Objective

Build an original website builder framework on Laravel, React, TypeScript, Inertia, Tailwind, Vite, and MySQL.

## Current State

Phase 9 foundations plus the Builder UI/UX, Phase 9.5 component-library, and page-first composition correction milestones are implemented. The framework now has the authoritative PAGE -> SECTION -> ROW -> COLUMN -> CONTENT model, validated drag insertion, structured Section defaults, a professional visual workspace, and font metadata. Preview/publishing, deployment, themes, plugins, and collaboration remain out of scope.

## Completed

- Phase 0: Audited starter kit structure and documented framework guardrails.
- Phase 1: Implemented PHP and TypeScript page document/component node contracts and document validation tests.
- Phase 2: Implemented PHP and TypeScript component definitions, registries, built-ins, capabilities, defaults, child-rule metadata, and registry tests.
- Phase 3: Implemented PHP and TypeScript component tree engines with `find`, `findParent`, `insert`, `remove`, `move`, and `duplicate`.
- Phase 4: Implemented PHP and TypeScript renderer contracts, render context, render result, renderer registry, renderer errors, style resolver, and recursive document renderer.
- Phase 5: Implemented typed TypeScript editor state with `document`, `selectedNodeId`, and `hoveredNodeId`.
- Phase 5: Implemented editor actions for select, clear selection, hover, clear hover, document replacement, selected node lookup, and hovered node lookup.
- Phase 5: Implemented `BuilderCanvas` and `CanvasNode` to render the current document through `BuilderRenderer` and adapt neutral `RenderResult` trees into React canvas elements.
- Phase 5: Added stable `data-builder-node-id` DOM mapping for rendered components.
- Phase 5: Added hover and selection overlays with `pointer-events: none`.
- Phase 5: Defined root behavior: `layout.root` remains structural and non-selectable; real component nodes are selectable.
- Phase 5: Added stale selection/hover cleanup when the document changes.
- Phase 5: Added focused editor/canvas tests via `npm run test:builder-editor`.
- Phase 6: Added centralized editor operations, palette, drag/drop canvas behavior, duplicate/remove actions, and inspector controls.
- Phase 6: Added engine node creation and immutable validated prop updates in PHP and TypeScript.
- Phase 6: Added focused insertion, movement, duplicate, remove, prop, and shell assertions to `scripts/builder-editor-tests.ts` and tree-engine PHPUnit coverage.

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
- D-008: Keep editor interaction state outside renderer contracts.
- D-009: Route editor mutations through the tree engine.
- D-010: Treat styles as typed document data with registry-declared capabilities.
- D-011: Separate editable drafts from immutable revision snapshots with optimistic document versions.
- D-012: Instantiate templates as independent document trees with new IDs.
- D-013: Keep media storage and reusable references explicit and persistence-independent from rendering.
- D-014: Keep the Builder workspace separate from the Dashboard.
- D-015: Use HelloWeb as the visible product identity while retaining Laravel internals.
- D-016: Expand the component library through registry contracts.

## Constraints

See `CONSTRAINTS.md` and `AGENTS.md`. The biggest rule: this is a framework, not a CRUD app.

## Relevant Files

- `AGENTS.md` - permanent engineering rules.
- `.context/PRD.md` - requirements and non-goals.
- `.context/ARCHITECTURE.md` - current architecture, including Phase 5 editor canvas.
- `.context/PLAN.md` - milestone roadmap; Phase 10 is next.
- `.context/DECISIONS.md` - accepted architecture decisions.
- `app/Builder/*` - PHP builder contracts, registry, tree engine, renderer, and tests.
- `resources/js/builder/document.ts` - frontend document contracts.
- `resources/js/builder/component/*` - TypeScript component definition contracts.
- `resources/js/builder/registry/*` - TypeScript component registry and built-ins.
- `resources/js/builder/engine/*` - TypeScript tree engine, positions, errors, and ID generation.
- `resources/js/builder/renderer/*` - TypeScript renderer contracts, registry, context, result, style resolver, and built-ins.
- `resources/js/builder/editor/*` - Phase 5/6 editor state, canvas, palette, inspector, operations, overlays, sample document, and interaction helpers.
- `resources/js/builder/style/style.ts` - typed style definitions, validation, responsive resolution, inheritance, clearing, and serialization.
- `app/Builder/Style/*` - PHP style schema and document validation contracts.
- `app/Builder/Persistence/*` - default document creation, persistence validation, draft/revision service, and stale-write exception.
- `app/Models/Website.php`, `Page.php`, `PageRevision.php` - persistence models and relationships.
- `app/Http/Controllers/BuilderPageController.php`, `app/Policies/PagePolicy.php` - authenticated page document/revision endpoints and authorization.
- `resources/js/builder/editor/use-builder-autosave.ts` - debounced save lifecycle and retry behavior.
- `app/Builder/Media/*` - media storage abstraction, Laravel adapter, metadata service, and references.
- `app/Builder/Persistence/TemplatePersistenceService.php` - validated template lifecycle and independent instantiation.
- `app/Builder/Persistence/ReusableComponentService.php` - reusable definition lifecycle and explicit reference insertion.
- `resources/js/builder/reusable.ts` - typed reusable references and pre-render resolution.
- `resources/js/builder/persistence.ts` - frontend template/media/reusable contracts.
- `resources/js/builder/editor/BuilderToolbar.tsx`, `BuilderElementsPanel.tsx`, `BuilderLayersPanel.tsx`, `BuilderBottomBar.tsx` - dedicated workspace presentation surfaces.
- `resources/js/builder/design-tokens.ts` - HelloWeb design-token contract.
- `app/Http/Controllers/DashboardController.php`, `resources/js/pages/dashboard.tsx` - real-data platform dashboard and empty states.
- `resources/js/components/app-logo.tsx`, auth layouts, welcome page, and `resources/css/app.css` - HelloWeb visible identity and semantic accent styling.
- `scripts/builder-editor-tests.ts` - focused editor/canvas test harness.

## Validation

- PASS: `npm run test:builder-editor`.
- PASS: `vendor\bin\phpunit.bat --filter "TemplateMediaReusableTest|BuilderPersistenceTest"` - 16 tests, 57 assertions.
- PASS: `vendor\bin\phpunit.bat` - 115 tests, 288 assertions.
- PASS: `npx tsc --noEmit`.
- PASS: `npm run build`.
- PASS: targeted Phase 9 Pint for `app/Builder`, models, controllers, policies, migrations, and tests.
- PASS: `npx prettier --check resources/js/builder`.
- EXPECTED BASELINE FAILURE: `npm run format:check` flags only pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- EXPECTED BASELINE FAILURE: broad `pint --test app/Builder app/Models app/Http tests` flags only pre-existing starter auth files and `tests/Pest.php`; Phase 9 files pass targeted Pint.
- LIMITED BROWSER VALIDATION: `https://helloweb.test/dashboard` and `https://helloweb.test/builder` respond through the local stack, but no interactive browser automation tool is available in this environment.

## Known Problems

- `.env` uses SQLite while the intended production persistence direction is MySQL.
- `HandleInertiaRequests::share()` calls/spreads `parent::share($request)` redundantly; review when touching Inertia middleware.
- The shell sandbox may not expose PHP on PATH; PHP-based validation was run successfully outside that restriction.
- Esbuild/Vite commands may need unsandboxed filesystem access in this Windows environment.
- Phase 9.5 intentionally leaves Navigation, Forms, Advanced components, component states, gradients, and advanced media editing as future extensions.

## Do Not Redo

- Do not re-audit Phase 0 unless code has changed.
- Do not redo Phase 1 document contracts.
- Do not redo Phase 2 registry contracts.
- Do not redo Phase 3 tree operations.
- Do not redo Phase 4 renderer foundation.
- Do not redo Phase 5 editor state/canvas foundation unless a future accepted milestone requires it.
- Do not implement persistence, CRUD screens, publishing, media, templates, or undo/redo before their milestones.
- Do not replace starter auth/settings without explicit milestone need.

## Next Exact Action

Next exact milestone: PHASE 10 — PREVIEW AND PUBLISHING. Do not start deployment, domains, plugins, themes, collaboration, or undo/redo as part of this UI presentation milestone.

## Risks

- Phase 6 can accidentally bypass the tree engine if insertion or drag/drop mutates document state directly.
- Inspector work can accidentally become a full style editor too early; keep it scoped to the milestone.
- Persistence and CRUD work should still wait for a dedicated persistence milestone.
