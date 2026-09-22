# Architecture

Updated: 2026-09-23

## Audit Baseline

Fresh Laravel React Starter Kit with authentication, settings, dashboard, Inertia, React, TypeScript, Tailwind, Vite, SQLite local config, and starter PHPUnit tests. Phase 1 introduced the first builder document contracts. Phase 2 introduced the component definition and registry foundation. Phase 3 introduced framework-level component tree operations. Phase 4 introduced renderer foundation. No editor, database persistence, dashboard CRUD, or visual builder UI exists yet.

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
- **Persistence Layer** - Laravel models/services for websites, pages, schema-versioned documents, revisions, templates, media, publishing state.
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

## Tree Operation Semantics

- `find(document, nodeId)`: returns the matching node or `null`.
- `findParent(document, nodeId)`: returns the direct parent or `null` for the root/missing nodes.
- `insert(document, parentId, node, position)`: validates the inserted subtree, parent existence, registry component types, and child rules before returning a new document.
- `remove(document, nodeId)`: removes a non-root node and its subtree.
- `move(document, nodeId, newParentId, position)`: moves a non-root node/subtree to a valid parent and prevents cycles.
- `duplicate(document, nodeId)`: duplicates a non-root subtree after the source node and generates new IDs for every copied node.

Invalid operations fail with domain-level errors rather than vague booleans. The engine does not implement visual drag/drop, selection, undo/redo, renderer output, persistence, or editor state.

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

See `DECISIONS.md`: D-001, D-002, D-003, D-004, D-005, D-006, D-007.
