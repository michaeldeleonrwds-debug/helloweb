# Architecture

Updated: 2026-09-23

## Audit Baseline

Fresh Laravel React Starter Kit with authentication, settings, dashboard, Inertia, React, TypeScript, Tailwind, Vite, SQLite local config, and starter PHPUnit tests. Phases 1–9 established the document, registry, engine, renderer, style, persistence, template, media, and reusable-component foundations. The builder now has a dedicated visual workspace presentation layer over those contracts; dashboard management remains a separate product experience.

## Actual Versions

- Laravel framework: `v12.69.2` from `composer.lock`.
- PHP requirement: `^8.2` from `composer.json`; validation currently ran on PHP 8.5.0.
- Inertia Laravel: `v2.0.27`; `@inertiajs/react`: `2.0.3`.
- React / React DOM: `19.0.0`.
- TypeScript: `5.7.3`.
- Tailwind CSS: `4.0.8`; `@tailwindcss/vite`: `4.0.8`.
- Vite: `6.1.1`; `@vitejs/plugin-react`: `4.3.4`.
- Ziggy: `v2.6.4`.
- PHPUnit: `11.5.56`.

## Existing System

| Area | Current state | Preserve / extend |
| :--- | :--- | :--- |
| Laravel app | Standard Laravel 12 layout under `app/`, `routes/`, `database/`, `config/` | Preserve |
| Auth | Starter auth controllers, routes, requests, user model, tests | Preserve and reuse for builder access |
| Inertia | `HandleInertiaRequests`, `resources/js/app.tsx`, SSR entry | Preserve; later add builder pages |
| UI | Starter shadcn/Radix-style components under `resources/js/components/ui` | Preserve as admin/editor UI primitives |
| Pages | `welcome`, `dashboard`, auth pages, settings pages | Preserve; dashboard can later link into builder |
| Database | Starter users, sessions, cache, jobs migrations; `.env` currently `DB_CONNECTION=sqlite` | Extend with builder tables; switch env to MySQL when configured |
| Tests | PHPUnit feature tests for auth, settings, dashboard plus one unit example | Extend with builder contract tests |

Known starter issue to review later: `HandleInertiaRequests::share()` includes both `array_merge(parent::share(...), [...parent::share(...)])`, duplicating the parent shared props call.

## Implemented Phase 1 Foundation

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| PHP document schema | Current schema version and supported responsive breakpoints | `app/Builder/Document/BuilderDocumentSchema.php` |
| PHP validation | Structural validation for serializable builder page documents and nodes | `app/Builder/Document/BuilderDocumentValidator.php`, `ValidationResult.php` |
| PHP document wrapper | Validated create/serialize/deserialize API for document arrays and JSON | `app/Builder/Document/BuilderDocument.php` |
| TypeScript document types | Frontend contract aligned to PHP document shape | `resources/js/builder/document.ts`, `resources/js/builder/index.ts` |
| Contract tests | Required unit test coverage for document validation and serialization | `tests/Unit/Builder/BuilderDocumentTest.php` |

## Implemented Phase 2 Component Registry

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| Component definition contract | Namespaced type, metadata, capabilities, defaults, prop schema metadata, child-rule metadata, and future integration keys without React coupling | `app/Builder/Component/ComponentDefinition.php`, `resources/js/builder/component/definition.ts` |
| Component registry | Data-driven registration and lookup by component type; duplicate registration and unknown lookup fail predictably | `app/Builder/Registry/ComponentRegistry.php`, `resources/js/builder/registry/component-registry.ts` |
| Built-in definitions | Initial framework primitives only: `layout.section`, `layout.container`, `content.heading` | `app/Builder/Registry/BuiltInComponentDefinitions.php`, `resources/js/builder/registry/built-ins.ts` |
| Registry tests | Behavior coverage for registration, lookup, duplicate handling, metadata, capabilities, defaults, child rules, built-ins, invalid definitions, and returned-definition mutation safety | `tests/Unit/Builder/Registry/ComponentRegistryTest.php` |

Component definitions are framework data, not renderer implementations. The `integration` metadata may carry future renderer/editor keys, but Phase 2 does not implement renderer resolution, editor controls, canvas behavior, or tree operations.

## Implemented Phase 3 Tree Engine

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| Tree engine | Deterministic find, parent lookup, insert, remove, move, and duplicate operations over `BuilderDocument` trees | `app/Builder/Engine/ComponentTreeEngine.php`, `resources/js/builder/engine/component-tree-engine.ts` |
| Insert positions | Predictable append, before sibling, and after sibling placement | `app/Builder/Engine/TreeInsertPosition.php`, `resources/js/builder/engine/tree-position.ts` |
| ID generation | Injectable node ID generation for deterministic duplicate operations and tests | `app/Builder/Engine/NodeIdGenerator.php`, `SequentialNodeIdGenerator.php`, `resources/js/builder/engine/node-id-generator.ts` |
| Operation errors | Domain-level errors for missing nodes/parents, invalid component types, invalid relationships, invalid positions, root operations, and duplicate generated IDs | `app/Builder/Engine/TreeOperationException.php`, `TreeOperationError` in TypeScript |
| Tree tests | Behavior coverage for find, parent lookup, insert positions, remove, move, nested duplicate, child rules, root constraints, immutability, and deterministic IDs | `tests/Unit/Builder/Engine/ComponentTreeEngineTest.php` |

Tree operations return a new document instead of mutating the caller's original document. Insert and move operations enforce Phase 2 registry child rules. The document root remains a single structural root: it cannot be removed, moved, or duplicated, and engine-level root rules currently allow top-level `layout.section` children only.

## Implemented Phase 4 Renderer Foundation

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| Renderer engine | Recursively renders validated `BuilderDocument` trees through component and renderer registries | `app/Builder/Renderer/BuilderRenderer.php`, `resources/js/builder/renderer/builder-renderer.ts` |
| Renderer contract | Component renderers receive node data, component definition, render context, and child results | `ComponentRenderer.php`, `component-renderer.ts` |
| Render context/result | Framework-neutral render context and deterministic render result representation with HTML serialization | `RenderContext.php`, `RenderResult.php`, `render-context.ts`, `render-result.ts` |
| Renderer registry | Separate mapping from component type to rendering implementation; duplicate and unknown lookups fail clearly | `ComponentRendererRegistry.php`, `renderer-registry.ts` |
| Built-in renderers | Rendering behavior for `layout.root`, `layout.section`, `layout.container`, and `content.heading` | `app/Builder/Renderer/BuiltIn/*`, `resources/js/builder/renderer/built-ins.ts` |
| Style resolver | Minimal deterministic style resolution from default styles plus desktop/tablet/mobile node styles | `StyleResolver.php`, `style-resolver.ts` |
| Renderer tests | Coverage for recursive rendering, built-ins, heading props, responsive styles, unknown types/renderers, registry behavior, deterministic output, immutability, invalid nodes, and editor independence | `tests/Unit/Builder/Renderer/BuilderRendererTest.php` |

The renderer uses the ComponentRegistry to resolve what a component is, then uses the RendererRegistry to resolve how it renders. Render output is a neutral tree representation, not React components or Laravel views. Root is represented as a structural fragment and does not add unnecessary visual markup.

## Implemented Phase 5 Editor Canvas And Selection

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| Editor state | Typed in-memory editor state around the canonical `BuilderPageDocument`, with selected and hovered node IDs | `resources/js/builder/editor/editor-state.ts`, `editor-reducer.ts` |
| Canvas rendering | React canvas that renders the current document through the Phase 4 renderer output | `resources/js/builder/editor/BuilderCanvas.tsx`, `CanvasNode.tsx` |
| DOM mapping | Stable `data-builder-node-id` mapping from rendered canvas elements back to component node IDs | `CanvasNode.tsx`, `render-result-utils.ts` |
| Interaction state | Node selection and hover interactions by component node ID, with nested event handling that stops child clicks from selecting parents | `CanvasNode.tsx`, `canvas-interactions.ts` |
| Visual boundaries | Non-intercepting hover and selection outlines | `HoverOverlay.tsx`, `SelectionOverlay.tsx` |
| Sample document and focused tests | Deterministic root/section/container/heading document and Node-based editor test harness | `sample-document.ts`, `scripts/builder-editor-tests.ts` |

The editor stores interaction state separately from the document. It does not mutate document structure when selecting or hovering. The structural `layout.root` remains non-selectable in the editor canvas; real components such as section, container, and heading are selectable by node ID. If the document changes and selected/hovered, dragged, or targeted nodes no longer exist, the editor clears those stale IDs.

## Implemented Phase 6 Insertion, Drag/Drop, And Inspector

| Area | Responsibility | Key files |
| :--- | :--- | :--- |
| Editor mutations | Centralized editor-facing calls to `ComponentTreeEngine` for insert, move, duplicate, remove, and prop updates | `resources/js/builder/editor/editor-operations.ts` |
| Component creation | Registry defaults plus engine-owned ID generation for new nodes | `resources/js/builder/engine/component-tree-engine.ts` |
| Insertion palette | Registry-driven component categories filtered by engine child validation | `resources/js/builder/editor/ComponentPalette.tsx` |
| Drag/drop | Native drag events translated into before, after, or append engine positions; invalid drops are rejected by the engine | `resources/js/builder/editor/CanvasNode.tsx`, `BuilderEditor.tsx` |
| Inspector | Definition prop schemas drive basic text, integer, and enum controls | `resources/js/builder/editor/ComponentInspector.tsx` |
| Builder shell | Palette, canvas, and inspector share one in-memory editor state | `resources/js/builder/editor/BuilderEditor.tsx` |

Phase 6 keeps `BuilderDocument` as the source of truth. React components dispatch editor operations and never edit node children, props, or the document root directly. `updateProps` validates registry metadata, preserves unrelated node data, and returns a new document.

## Implemented Phase 7 Style And Responsive Engine

The style subsystem is framework-neutral and lives under `app/Builder/Style` and `resources/js/builder/style`. Typed style definitions describe supported keys, groups, value types, options, and responsive behavior. Component definitions declare `styleCapabilities`, so controls are metadata-driven and arbitrary registered components can participate without inspector branching.

Resolution applies component defaults followed by node desktop, tablet, and mobile overrides. Tablet inherits desktop and mobile inherits tablet/desktop values unless overridden. Tree-engine `updateStyles` and `clearStyleOverride` operations validate breakpoint, property, capability, and value, then return immutable documents. The renderer consumes resolved styles and `RenderResult` uses stable property ordering and escaped serialization. The inspector exposes registry-defined style capabilities with breakpoint switching, inherited-value indication, and clear-override actions.

## Implemented Phase 8 Persistence, Autosave, And Revisions

Persistence is an application boundary under `app/Builder/Persistence`. `Website` owns `Page` records, and each `Page` stores one validated structured `draft_document` JSON value plus a page-scoped `document_version`. `PageRevision` stores immutable JSON snapshots with schema version, page-scoped revision number, creator, and checkpoint/restore type. No visual component is normalized into a database row and no rendered HTML is persisted.

The `BuilderPagePersistenceService` validates documents through the existing document validator plus registered component, prop, child-rule, and style-capability checks before saving. Draft saves lock the page row and require the caller's expected document version. A mismatch raises a stale-write conflict without overwriting newer data. Explicit revision creation snapshots the current draft; restoration copies a historical document into a new revision and current draft, leaving the source revision unchanged.

Authenticated builder endpoints are thin controller/application boundaries. `PagePolicy` scopes view, draft, revision, and restore access through the owning user. The persisted page route loads and validates the document into the existing editor. The React editor keeps the local document on save failure and uses a 650ms debounce, save lifecycle state, and retry action for autosave. Autosave updates only the draft; it does not create a revision per keystroke.

## Implemented Phase 9 Templates, Media, And Reusable Components

Templates are owned, persisted structured BuilderDocuments. `TemplatePersistenceService` validates stored and incoming documents, archives templates instead of deleting their source data, and instantiates templates by deep-cloning nodes with newly generated IDs before inserting them through `ComponentTreeEngine`. Instantiation produces independent page nodes and does not retain a template reference.

Media assets are separate owned records containing metadata and a storage disk/key. `MediaStorage` abstracts storage operations from local/S3-compatible implementations; the renderer never reads media storage. `MediaAssetService` owns storage lifecycle, metadata persistence, reference creation, and owner checks. The current phase establishes the media reference contract without adding an image editor or processing pipeline.

Reusable components are persisted structured component documents. A page reusable instance is an explicit `reusable.instance` node with a typed `reusableReference`, not a local copy and not a template instantiation. `ReusableComponentService` validates ownership, inserts references through the tree engine, and exposes owned definitions. The TypeScript application boundary resolves references into namespaced render documents before `BuilderRenderer`; unresolved references fail clearly in the renderer and never trigger database queries.

## Framework Boundaries

Recommended module boundaries:

- **Builder Engine** - command API for selection, insertion, deletion, duplication, nesting, reordering, copy/paste, undo/redo, viewport changes, props/style updates.
- **Component System** - component node schema, component definition schema, capabilities, constraints.
- **Component Registry** - registration/discovery of definitions by type; no core rewrites for new components.
- **Renderer** - consumes page document plus registry and renders public/editor canvas output.
- **Editor State** - transient UI state: selected node, hovered node, viewport, drag state, history pointers, clipboard.
- **Layout System** - containers, section semantics, flex/grid primitives, allowed nesting.
- **Style System** - structured style object and resolver to CSS/Tailwind-safe render output.
- **Responsive System** - desktop base plus tablet/mobile overrides with deterministic resolution.
- **Style Definitions** - typed, validated property catalog and component-declared style capabilities.
- **Persistence Layer** - Laravel Website/Page/PageRevision models, native JSON document storage, validated draft/revision application services, authorization, and optimistic version checks.
- **Templates** - owned structured document definitions and independent tree instantiation.
- **Media** - owned metadata records and `MediaStorage` abstraction; no renderer storage coupling.
- **Reusable Components** - owned structured definitions, explicit page references, and pre-render resolution.
- **Builder Workspace** - presentation-only toolbar, elements, layers, canvas viewport, inspector, responsive controls, zoom, and save-state composition over editor state and document operations.
- **Dashboard** - platform management surface kept separate from the visual builder route and workspace state.

The Dashboard currently loads owned Website/Page/Template/Media/ReusableComponent/PageRevision summaries through a dedicated controller and presents empty states when those collections are empty. It does not create demo records or become a page editor.

HelloWeb is the visible product identity for the application shell, dashboard, builder, authentication, landing page, and document metadata. Laravel remains an internal implementation dependency only.

## Phase 9.5 Design System And Component Library

The foundational component library now includes registered Section, Container, Stack, Flex, Grid, Columns, Spacer, Divider, Heading, Text, Rich Text, Button, Link, Image, and Card primitives. PHP and TypeScript definitions remain aligned through the component registries; each component declares its category, description, defaults, child rules, props, style capabilities, and renderer integration metadata. Navigation, Forms, and Advanced categories remain extension points rather than fake UI entries.

The HelloWeb design-token contract is exposed in `resources/js/builder/design-tokens.ts`, while semantic CSS variables remain the application styling source. The inspector uses property-aware controls, responsive inheritance, color tokens, and component metadata. Inline text editing dispatches through the existing `ComponentTreeEngine` prop mutation path; DOM editing never mutates persisted documents directly.
- **Extension System** - future registration surface for components, controls, renderers, and transforms.

## Recommended Component Model

Use a versioned page document containing a root node tree. Current document shape:

- `schemaVersion`: integer; current version is `1`.
- `root`: root `BuilderComponentNode`.
- `metadata`: optional serializable document metadata.

Node concept:

- `id`: stable generated ID, unique inside document.
- `type`: registry key such as `layout.section`, `layout.container`, `content.heading`.
- `props`: serializable component data; registry-level prop validation comes later.
- `styles`: breakpoint-keyed structured style data with optional `desktop`, `tablet`, and `mobile` entries.
- `children`: ordered embedded child nodes for schema version 1.
- `metadata`: optional serializable node metadata such as labels, lock/visibility flags, source/template info, or timestamps.

Avoid storing renderer components directly in documents. Documents store data; registry maps types to renderers and editor controls.

## Component Registry Model

Current component definition shape:

- `type`: stable namespaced component type such as `layout.section`.
- `name`: human-readable label.
- `category`: broad grouping such as `layout` or `content`.
- `description`: optional concise explanation.
- `capabilities`: keyed booleans such as `canHaveChildren`, `canAcceptChildren`, `supportsText`, and `supportsResponsiveStyles`.
- `defaultProps`: structured data for new component nodes.
- `defaultStyles`: breakpoint-keyed structured style defaults.
- `propSchema`: lightweight prop metadata for future validation and editor controls.
- `childRules`: metadata for future child validation; currently uses `allowedTypes`.
- `integration`: future renderer/editor integration keys only, without importing renderer or editor code.

Current built-ins:

- `layout.root`: structural document root, can accept `layout.section`.
- `layout.section`: structural page section, can accept `layout.container` and `content.heading`.
- `layout.container`: nested layout grouping primitive, can accept `layout.container` and `content.heading`.
- `content.heading`: heading content primitive with `text` and `level` defaults, no child components.

## Rendering Semantics

- Rendering starts from a validated `BuilderDocument` and recurses through the root node.
- Each node type must exist in the ComponentRegistry.
- Each node type must have a renderer in the RendererRegistry.
- The renderer engine owns traversal; component renderers receive already-rendered child results.
- Unknown component types, missing renderers, invalid heading levels, and malformed node structures fail with domain-level renderer errors.
- Rendering does not mutate the source document.
- Responsive style resolution applies component defaults and node styles in this order: desktop base, tablet overrides for tablet/mobile, mobile overrides for mobile.
- Current output can serialize to deterministic HTML for tests/public rendering experiments, while remaining neutral enough for future React preview rendering.

## Editor And Canvas Semantics

- `BuilderEditorState` contains `document`, `selectedNodeId`, and `hoveredNodeId`.
- `selectNode`, `hoverNode`, and lookup helpers operate on stable component node IDs.
- `setDocument` replaces the in-memory document and clears stale selection/hover state when IDs disappear.
- `BuilderCanvas` rebuilds render output from the current document through `BuilderRenderer`.
- `CanvasNode` converts neutral `RenderResult` nodes into React elements and attaches editor-only event handlers outside the renderer.
- Canvas overlays use `pointer-events: none` so they do not block component interaction.
- Editor state is independent from persistence and database models.

## Tree Operation Semantics

- `find(document, nodeId)`: returns the matching node or `null`.
- `findParent(document, nodeId)`: returns the direct parent or `null` for the root/missing nodes.
- `insert(document, parentId, node, position)`: validates the inserted subtree, parent existence, registry component types, and child rules before returning a new document.
- `remove(document, nodeId)`: removes a non-root node and its subtree.
- `move(document, nodeId, newParentId, position)`: moves a non-root node/subtree to a valid parent and prevents cycles.
- `duplicate(document, nodeId)`: duplicates a non-root subtree after the source node and generates new IDs for every copied node.
- `createNode(document, type)`: creates a registry-default node with an engine-generated unique ID.
- `insertComponent(document, parentId, type, position)`: creates and inserts a registry component through the same insert validation.
- `updateProps(document, nodeId, patch)`: validates editable prop metadata and returns a new document.

Invalid operations fail with domain-level errors rather than vague booleans. The engine rejects root operations, self drops, descendant cycles, invalid parents, invalid positions, invalid child types, and invalid prop values. Visual drag/drop and editor state remain in the editor layer; undo/redo, renderer output, and persistence remain separate concerns.

## Recommended Style And Responsive Model

Represent styles as structured data grouped by property families: sizing, spacing, layout, typography, color, background, border, radius, shadow, effects, positioning, overflow.

Responsive resolution:

1. Start with desktop/base values.
2. Overlay tablet values when viewport is tablet.
3. Overlay mobile values when viewport is mobile.
4. Component defaults from registry fill missing values before node-level overrides.

Do not create separate page documents per breakpoint.

## Recommended Persistence

MySQL should become the persistent source of truth. Recommended first tables:

- `websites`: owner, name, slug/domain settings, global settings, status.
- `pages`: website, title, slug/path, SEO/settings, current draft document, current published document, schema version, status.
- `page_revisions`: page, document snapshot, schema version, author, label, published flag.
- `templates`: reusable page/section/component documents with metadata.
- `media_assets`: owner/website, disk path, mime, dimensions, alt text, metadata.
- `publishing_events`: website/page, revision, status, timestamps, error details.
- Later: reusable component definitions/instances if product requirements need cross-page syncing.

Do not create one row per visual component in the initial design. Validate and version JSON documents so migrations can transform old builder schemas.

## Risks

- Building UI before schema/registry will hardcode page-specific React components.
- CRUD-first tables can lock the product into the wrong persistence model.
- Editor state can leak into public rendering if module boundaries are loose.
- Tailwind utility strings embedded in every component can bypass the style system.
- Current local environment uses SQLite while the target persistence direction is MySQL.
- The shell sandbox may not expose PHP on PATH; PHP validation was run successfully outside that restriction with PHP 8.5.0.

## Key Decisions

See `DECISIONS.md`: D-001 through D-016.
# Interaction correction: explicit insertion and page workspace

The Elements panel supports click insertion and drag insertion. Contextual `+ Add Element` opens an explicit picker and never inserts an implicit default. The page uses the configured viewport width and normal document flow; inner Rows/Containers constrain content independently of full-width Sections.

# Page-first composition

The Builder page is the editing surface and remains a normal-flow webpage: `layout.root -> layout.section -> layout.row -> layout.column -> content`. Sections stack vertically and receive structured 10px top/bottom padding only when newly created. Rows provide horizontal composition; Columns host content and intentional internal layout primitives. Sections are never valid children of Rows, Columns, Flex, Grid, or other internal primitives.

Drag/drop proposes `inside`, `before`, or `after` positions in editor state. Registry capabilities and ComponentTreeEngine validate the proposal before highlighting a target or committing an immutable document operation. Insertion controls, overlays, and indicators are editor-only. Viewport width and zoom are presentation state, and font selection uses metadata with on-demand loading information.
