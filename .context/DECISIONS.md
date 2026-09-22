# Decisions

## D-000 - Adopt ContextOS for project memory

Status: Accepted
Date: 2026-09-22

Decision:
Use the `.context/` protocol as the durable source of project truth.

Reason:
Conversations are temporary; the repository is durable. Project understanding must survive context limits, compaction, and switching between agents.

Implication:
Project state is updated in `.context/`, not left implicit in chat.

Do not:
Rely on model memory or chat history for anything that must persist.

## D-001 - Build an original framework architecture

Status: Accepted
Date: 2026-09-22

Decision:
Design the website builder as our own framework with explicit engine, component, renderer, state, style, responsive, persistence, template, media, revision, publishing, and extension boundaries.

Reason:
The product objective is a builder framework, not a WordPress plugin, Elementor clone, Webflow clone, or collection of hardcoded pages.

Implication:
Future work must add framework primitives and contracts before feature-specific UI shortcuts.

Do not:
Copy another builder's architecture or introduce WordPress-centered concepts without explicit approval.

## D-002 - Persist page composition as versioned documents

Status: Accepted
Date: 2026-09-22

Decision:
Store page composition as a structured, schema-versioned document/tree in MySQL, with separate relational rows for websites, pages, revisions, templates, media, publishing state, and reusable component definitions where useful.

Reason:
The component tree must evolve and migrate over time; one database row per visual component would couple persistence to editor internals too early.

Implication:
Early database design should include schema versioning, document validation, and revision snapshots.

Do not:
Create component-per-row persistence unless a later accepted decision supersedes this.

## D-003 - Separate editor from renderer

Status: Accepted
Date: 2026-09-22

Decision:
Keep the visual editor UI and public rendering path separate. Both consume the same page document and component registry contracts, but public rendering must not load editor state panels, drag/drop systems, or inspector controls.

Reason:
Published sites need small, stable rendering surfaces while the editor will grow complex interaction state.

Implication:
Renderer code should live behind framework renderer boundaries and avoid imports from editor-only modules.

Do not:
Make public pages depend on the full builder editor bundle.

## D-004 - Place framework contracts in explicit builder namespaces

Status: Accepted
Date: 2026-09-22

Decision:
Use `app/Builder` for Laravel-side builder framework contracts and `resources/js/builder` for frontend TypeScript builder contracts.

Reason:
The project needs visible boundaries between framework code, starter application/auth code, future editor UI, and future public rendering.

Implication:
Future builder engine, registry, renderer, style, and responsive modules should extend these builder namespaces instead of scattering framework primitives through pages or UI components.

Do not:
Place core builder framework contracts inside page components, auth/settings code, or dashboard CRUD folders.

## D-005 - Use data-driven component definitions and registries

Status: Accepted
Date: 2026-09-23

Decision:
Represent builder components as immutable, namespaced definitions registered in a component registry, with metadata, capabilities, defaults, prop schema metadata, child-rule metadata, and future renderer/editor integration keys.

Reason:
The page document stores component type keys and structured data; later renderer, editor, engine, and extension phases need a predictable lookup layer that does not depend on React UI, database CRUD, or switch statements.

Implication:
Future components should be added by registering definitions, not by adding hardcoded branching to the engine or renderer.

Do not:
Couple component definitions directly to React page UI, visual editor state, database rows, or renderer implementation during registry work.

## D-006 - Keep tree operations immutable and registry-enforced

Status: Accepted
Date: 2026-09-23

Decision:
Implement component tree operations as framework-engine functions that return new documents, enforce ComponentRegistry child rules, keep the document root protected, and use injectable ID generation for deterministic duplication.

Reason:
Tree mutation is core builder behavior and must remain predictable, testable, independent from React UI state, and compatible with schema-versioned document persistence.

Implication:
Future editor interactions should call engine operations instead of mutating page documents ad hoc in UI components.

Do not:
Implement tree mutation as drag/drop-specific React state, bypass registry child rules, or replace the document root through ordinary tree operations.

## D-007 - Keep renderer registry separate from component registry

Status: Accepted
Date: 2026-09-23

Decision:
Use a separate RendererRegistry to map component types to rendering implementations, while ComponentRegistry remains the source of component metadata, defaults, capabilities, and child rules.

Reason:
Component definitions describe what components are; renderer definitions describe how they render. Keeping those responsibilities separate preserves editor/public-renderer boundaries and allows future rendering surfaces without rewriting component metadata.

Implication:
Future renderers should be registered through RendererRegistry rather than embedded directly into component definitions or hardcoded switch statements.

Do not:
Merge renderer implementations into ComponentRegistry or make public rendering depend on editor-only components, state, or controls.
