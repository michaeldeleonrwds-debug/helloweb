# Implementation Plan

Updated: 2026-09-23

Legend: done / in-progress / not-started

## Phase 0 - Read-only audit and architecture foundation

- **Objective:** Inspect starter kit, document actual state, define architecture guardrails.
- **Tasks:**
  - [x] Audit project structure, dependencies, routes, models, migrations, React pages/components, tests, and ContextOS.
  - [x] Create `AGENTS.md`.
  - [x] Update ContextOS PRD, architecture, decisions, constraints, plan, status, handoff.
- **Validation:** Documentation review only; no builder implementation.
- **Exit criteria:** Future agent can understand project state and next milestone from `.context/`.
- **Status:** done

## Phase 1 - Framework foundation

- **Objective:** Establish code namespaces, shared TypeScript/PHP contracts, and builder document schema skeleton without UI complexity.
- **Tasks:**
  - [x] Create builder domain directories.
  - [x] Define page document and component node contracts.
  - [x] Add schema version constant and validation strategy.
  - [x] Add initial tests for document shape validation.
- **Dependencies:** Phase 0.
- **Validation:** PHP 8.5.0 available; `vendor\bin\phpunit.bat --filter BuilderDocumentTest` passes with 11 tests and 13 assertions; `vendor\bin\phpunit.bat` passes with 37 tests and 76 assertions and reports 2 deprecations without failing; `npx tsc --noEmit` passes; `npm run build` passes.
- **Exit criteria:** Satisfied. Empty/minimal page document can be represented and validated in code, with PHP and TypeScript validation complete.
- **Status:** done

## Phase 2 - Component registry

- **Objective:** Register component definitions independently from engine/rendering.
- **Tasks:** Component definition contract, registry API, built-in `layout.section`, `layout.container`, and `content.heading` definitions, registry tests.
- **Dependencies:** Phase 1.
- **Validation:** `vendor\bin\phpunit.bat --filter ComponentRegistryTest` passes; `vendor\bin\phpunit.bat` passes with 47 tests and 107 assertions and reports 2 deprecations without failing; `npx tsc --noEmit` passes; `npm run build` passes; targeted Pint for Phase 2 PHP files passes; `npm run format:check` still fails only on pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- **Exit criteria:** Satisfied. Components can be registered, queried, listed, and validated by type; duplicate and unknown lookups are defined; built-ins, capabilities, child-rule metadata, defaults, and mutation safety are tested.
- **Status:** done

## Phase 3 - Component tree operations

- **Objective:** Implement framework-level tree manipulation primitives.
- **Tasks:** insert, remove, move, duplicate, find, parent/child constraints, deterministic IDs for tests.
- **Dependencies:** Phase 2.
- **Validation:** `vendor\bin\phpunit.bat --filter ComponentTreeEngineTest` passes; `vendor\bin\phpunit.bat` passes with 69 tests and 148 assertions and reports 2 deprecations without failing; `npx tsc --noEmit` passes; `npm run build` passes; targeted Pint for Phase 3 PHP files passes; `npx prettier --check resources/js/builder` passes; `npm run format:check` still fails only on pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- **Exit criteria:** Satisfied. Page trees mutate through framework engine operations, not ad hoc UI state; child rules, root constraints, immutability, deterministic IDs, and invalid operation errors are tested.
- **Status:** done

## Phase 4 - Renderer foundation

- **Objective:** Render a page document through registry definitions without editor dependencies.
- **Tasks:** Renderer API, renderer registry, render context/result, style resolver hook point, unknown component handling, built-in renderer behavior.
- **Dependencies:** Phase 3.
- **Validation:** `vendor\bin\phpunit.bat --filter BuilderRendererTest` passes; `vendor\bin\phpunit.bat` passes with 87 tests and 184 assertions and reports 2 deprecations without failing; `npx tsc --noEmit` passes; `npm run build` passes; targeted Pint for Phase 4 PHP files passes; `npx prettier --check resources/js/builder` passes; `npm run format:check` still fails only on pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- **Exit criteria:** Satisfied. A sample document renders end to end through ComponentRegistry and RendererRegistry without editor dependencies.
- **Status:** done

## Phase 5 - Builder canvas and selection

- **Objective:** Add first editor surface over the same document model.
- **Tasks:** Canvas shell, selection state, outline/tree view, viewport mode state.
- **Dependencies:** Phase 4.
- **Validation:** UI tests/manual browser verification.
- **Exit criteria:** User can select nodes in an editor canvas backed by a page document.
- **Status:** not-started

## Later Phases

- Component insertion palette.
- Drag and drop / reordering.
- Inspector controls and property editing.
- Style engine and responsive engine.
- MySQL persistence for websites/pages/documents.
- Undo/redo and history.
- Templates and reusable components.
- Media system.
- Revision system.
- Preview and publishing system.
- Extension/plugin architecture.

## Requirement Traceability

| Requirement | Status | Covered by |
| :--- | :--- | :--- |
| FRM-001 | done | `.context/ARCHITECTURE.md`, `AGENTS.md` |
| CMP-001 | done | `tests/Unit/Builder/BuilderDocumentTest.php`, `vendor\bin\phpunit.bat --filter BuilderDocumentTest` |
| REG-001 | done | `tests/Unit/Builder/Registry/ComponentRegistryTest.php`, `app/Builder/Registry/*`, `resources/js/builder/registry/*` |
| ENG-001 | done | `tests/Unit/Builder/Engine/ComponentTreeEngineTest.php`, `app/Builder/Engine/*`, `resources/js/builder/engine/*` |
| RND-001 | done | `tests/Unit/Builder/Renderer/BuilderRendererTest.php`, `app/Builder/Renderer/*`, `resources/js/builder/renderer/*` |
| STY-001 | in-progress | minimal Phase 4 style resolver covered by renderer tests; full style system later |
| RSP-001 | in-progress | Phase 4 responsive render resolution covered by renderer tests; full responsive engine later |
| PRS-001 | not-started | planned migrations/model tests |
| EXT-001 | not-started | future extension tests |
