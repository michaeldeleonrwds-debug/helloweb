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

## D-008 - Keep editor interaction state outside renderer contracts

Status: Accepted
Date: 2026-09-23

Decision:
Represent editor selection and hover as a separate TypeScript editor state layer, and adapt neutral renderer output into an interactive React canvas with stable `data-builder-node-id` DOM mapping.

Reason:
The renderer must remain reusable for public rendering and future preview surfaces, while the editor needs transient interaction state that should not mutate documents or leak into renderer contracts.

Implication:
Future canvas, drag/drop, insertion, and inspector features should build on the editor state/canvas layer and call framework engine operations, not modify renderer internals.

Do not:
Add selected/hovered state to ComponentRegistry, ComponentRendererRegistry, BuilderRenderer, or component definitions.

## D-009 - Route editor mutations through the tree engine

Status: Accepted
Date: 2026-09-23

Decision:
Keep insertion, movement, duplication, removal, and basic prop editing behind `ComponentTreeEngine` calls exposed through a small editor-operation layer. The palette and inspector consume registry metadata, while React state stores only document and node-ID interaction state.

Reason:
Structural validity, stable ID generation, prop validation, and immutable document behavior must remain framework responsibilities rather than being reimplemented in UI event handlers.

Implication:
Future editor controls can record centralized document transitions for history without changing the canvas or inspector contracts. New component definitions automatically become palette and inspector inputs when their registry metadata supports them.

Do not:
Mutate `children`, `props`, or `root` directly from React components, hard-code the palette component list, or create a second prop schema for editor controls.

## D-010 - Treat styles as typed document data

Status: Accepted
Date: 2026-09-23

Decision:
Keep supported styles in a typed, data-driven definition catalog. Components opt into properties through `styleCapabilities`; responsive values remain on document nodes under desktop, tablet, and mobile keys. Resolution, validation, mutation, and serialization belong to framework modules rather than individual renderers or React controls.

Reason:
The style system must be extensible to future registered components and plugins without becoming arbitrary CSS or hard-coded inspector logic.

Implication:
Future extensions declare style capabilities and definitions through registry contracts. Persistence can serialize the existing structured node styles later without changing the editor or renderer model.

## D-011 - Separate editable drafts from immutable revision snapshots

Status: Accepted
Date: 2026-09-23

Decision:
Store the current editable BuilderDocument as native JSON on the Page, with a page-scoped optimistic `document_version`. Store deliberate revision checkpoints as immutable PageRevision JSON snapshots. Autosave updates the draft only; creating or restoring a revision creates a new snapshot.

Reason:
Autosave must be efficient and must not create a permanent revision for every typing event, while historical documents must remain reconstructable and unchanged. A page-scoped version provides a small optimistic concurrency boundary without introducing collaboration or event sourcing.

Implication:
Persistence services validate documents before writes and after loads. Controllers remain thin, policies guard ownership, and the editor receives save lifecycle state without coupling the renderer or tree engine to Eloquent.

Do not:
Persist generated HTML, store one row per component, overwrite historical snapshots, or allow a stale document version to replace a newer draft.

## D-012 - Instantiate templates as independent document trees

Status: Accepted
Date: 2026-09-23

Decision:
Templates store validated BuilderDocuments. Inserting a template deep-clones its eligible root nodes, generates new node IDs, validates the result through the existing tree engine, and saves independent page data. Template provenance is not retained in the inserted nodes.

Reason:
Templates are reusable starting structures, while page composition must remain independently editable and compatible with the existing immutable tree operations.

Implication:
Template persistence and instantiation remain separate from renderer behavior. Unsupported schema versions and invalid component trees are rejected before insertion.

## D-013 - Keep media storage and reusable references explicit

Status: Accepted
Date: 2026-09-23

Decision:
Media metadata is persisted separately from documents and binary access is provided through `MediaStorage`. Reusable components are represented by explicit `reusable.instance` nodes with typed definition references; they are resolved before rendering through an application boundary.

Reason:
Storage backends must be replaceable, and a reusable reference must remain distinguishable from a local copy so future global-update behavior can be added without changing document semantics.

Implication:
Ownership is enforced by backend services and policies. The renderer and component tree engine remain unaware of databases and storage drivers.

## D-014 - Keep the Builder workspace separate from the Dashboard

Status: Accepted
Date: 2026-09-23

Decision:
Treat the Dashboard as the platform management experience and the Builder routes as a dedicated visual editing workspace. The Builder UI is a presentation layer over the existing editor state, registry, document, tree, style, renderer, persistence, template, media, and reusable-component contracts.

Reason:
Management workflows and visual editing have different density, navigation, state, and interaction requirements. Combining them would make the editor feel like CRUD and would couple presentation concerns to framework behavior.

Implication:
Builder-only UI state includes panel visibility, breakpoint, zoom, hover, selection, and drag presentation. `BuilderDocument` remains the canonical composition state, and the Dashboard is not redesigned as an editor.

Do not:
Move the builder into dashboard CRUD, create parallel document or selection state for visual panels, or add controls for unsupported product features.

## D-015 - Use HelloWeb as the visible product identity

Status: Accepted
Date: 2026-09-23

Decision:
Present the application as HelloWeb across the visible shell, dashboard, builder, authentication layouts, landing page, metadata, and semantic accent styling. Laravel remains an implementation framework and is not renamed internally.

Reason:
HelloWeb is the product/platform users interact with. Starter-kit branding would make the application feel unfinished and obscure the actual website-building product identity.

Implication:
Visible copy, fallback app names, product logo treatment, and primary accent tokens use HelloWeb conventions. Framework namespaces, Composer identifiers, routes, and infrastructure terminology remain unchanged.

## D-016 - Expand the component library through registry contracts

Status: Accepted
Date: 2026-09-23

Decision:
Grow the HelloWeb component library by registering foundational layout, content, media, and marketing primitives with aligned PHP/TypeScript metadata and renderer registrations. The Elements panel and inspector consume that metadata; they do not maintain a second component list or property schema.

Reason:
The visual editor cannot become a professional website environment with only three visual components. Expanding through registry contracts preserves extension/plugin readiness and keeps tree validation authoritative.

Implication:
Each component must provide real defaults, props, child rules, style capabilities, and renderer behavior before appearing as an insertable library item. Navigation, Forms, Advanced, states, and richer media behavior remain future extension work until implemented.
# D-020: Contextual element insertion is explicit

`+ Add Element` opens a type picker and never inserts an implicit default. The Elements panel supports both click insertion and drag insertion, using the same registry capability query and TreeEngine commit path.

# D-017: Page-first composition hierarchy

The authoritative page composition model is `layout.root -> layout.section -> layout.row -> layout.column -> content`. The root accepts only Sections; Sections accept Rows; Rows accept Columns; Columns accept registered content and internal layout primitives.

# D-018: Validated drag insertion

Drag/drop proposals are checked through registry capabilities and ComponentTreeEngine before targets are highlighted or drops are committed. Editor insertion controls and indicators remain outside public rendering.
