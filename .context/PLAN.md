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
- **Tasks:** Editor state, canvas shell, renderer-backed document rendering, stable node-ID DOM mapping, hover state, selection state, selection/hover outlines, stale state cleanup.
- **Dependencies:** Phase 4.
- **Validation:** `npm run test:builder-editor` passes; `vendor\bin\phpunit.bat` passes with 87 tests and 184 assertions and reports 2 deprecations without failing; `npx tsc --noEmit` passes; `npm run build` passes; `vendor\bin\pint.bat --test app/Builder tests/Unit/Builder` passes; `npx prettier --check resources/js/builder` passes; `npm run format:check` still fails only on pre-existing `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- **Exit criteria:** Satisfied. The canvas renders a document through the existing renderer, maps rendered components to stable node IDs, supports hover/selection including nested components, clears stale interaction state, and keeps renderer/editor/persistence boundaries separate.
- **Status:** done

## Phase 7 - Style and responsive engine

- **Objective:** Establish typed structured styles, validation, defaults, responsive inheritance, renderer serialization, and metadata-driven editor controls.
- **Status:** done.
- **Exit criteria:** Satisfied. Styles are immutable document data, component capabilities are registry metadata, desktop/tablet/mobile resolution is deterministic, overrides can be cleared, renderer output is escaped/stable, and the inspector edits styles through tree operations.

## Phase 8 - Persistence, autosave, and revisions

- **Objective:** Persist websites, pages, validated BuilderDocument drafts, and immutable revision snapshots with authorization and optimistic concurrency.
- **Status:** done.
- **Exit criteria:** Satisfied. Native JSON drafts load into the existing editor, autosave is debounced and failure-safe, page-scoped revisions can be created and restored, stale versions are rejected, and ownership policies protect all page/revision endpoints.

## Phase 9 - Templates, media, and reusable components

- **Objective:** Establish owned structured templates, storage-independent media assets, and explicit reusable component references without collapsing persistence into the builder engine or renderer.
- **Status:** done.
- **Exit criteria:** Satisfied. Templates instantiate independent nodes with new IDs, media uses a storage abstraction and owner checks, reusable instances remain references distinct from copies, and authenticated application boundaries validate all persisted structures.

## Builder UI/UX Overhaul - Presentation milestone

- **Objective:** Replace the prototype editor shell with a professional visual workspace without changing framework engines or persistence boundaries.
- **Status:** done.
- **Exit criteria:** Satisfied. Dashboard and Builder remain separate, the workspace is registry/document/style driven, layers synchronize with selection, canvas viewport and zoom are presentation-only, autosave/templates/reusable/media entry points remain connected, and unsupported controls were not added.

## Phase 9.5 - HelloWeb design system and component library

- **Objective:** Expand the real registered component library and professional editor controls before preview/publishing work.
- **Status:** done.
- **Exit criteria:** Satisfied. Foundational layout/content/media/marketing components are registered and rendered, design tokens and property-aware inspector controls are available, inline text editing uses tree mutations, and advanced unsupported categories remain extension points.

## Later Phases

- **Phase 6 - Insertion, drag/drop, and inspector:** done.
- Undo/redo and history.
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
| STY-001 | done | Phase 7 style schema, validation, resolver, serializer, and inspector |
| RSP-001 | done | Phase 7 desktop/tablet/mobile inheritance and override tests |
| PRS-001 | done | Phase 8 migrations, models, persistence service, API, and feature tests |
| TMP-001 | done | Phase 9 template model, validation, independent instantiation, and tests |
| MED-001 | done | Phase 9 media model, storage abstraction, ownership, and tests |
| RCP-001 | done | Phase 9 reusable definitions, explicit references, resolution, and tests |
| EXT-001 | not-started | future extension tests |

## Phase 6 - Insertion, drag/drop, and inspector

- **Objective:** Add registry-driven insertion, engine-backed movement, duplicate/remove actions, and a basic data-driven inspector over the Phase 5 canvas.
- **Status:** done.
- **Validation:** Focused editor tests, focused tree-engine PHPUnit tests, full PHPUnit, TypeScript, production build, targeted Pint, builder Prettier, and global formatting were run for this milestone. Global formatting retains only the known starter failures in `resources/js/components/app-header.tsx` and `resources/js/ssr.jsx`.
- **Exit criteria:** Satisfied. The in-memory document remains canonical; all mutations are immutable and engine-validated; insertion, before/after/append movement, duplicate, remove, and heading prop editing are covered; no persistence or Phase 7 style/responsive work was started.

## Next Exact Milestone

PHASE 10 — PREVIEW AND PUBLISHING
