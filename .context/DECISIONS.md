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

# D-021: The webpage is the editor canvas

The Builder center workspace is a flex-constrained scroll container between stable side panels. The rendered webpage itself is the editing surface; viewport width is a presentation setting, while zoom and fit-to-workspace only scale that surface visually.

Reason:
The editor must use the available center space without introducing a separate fixed-width artboard or mutating BuilderDocument when the viewport or zoom changes.

Implication:
The canvas may center the page only when its scaled visual width fits. Wider viewports remain at their logical CSS width and scroll horizontally. Full-width sections continue to span the webpage, with inner rows/containers responsible for content constraints.

# D-017: Page-first composition hierarchy

The authoritative page composition model is `layout.root -> layout.section -> layout.row -> layout.column -> content`. The root accepts only Sections; Sections accept Rows; Rows accept Columns; Columns accept registered content and internal layout primitives.

# D-018: Validated drag insertion

Drag/drop proposals are checked through registry capabilities and ComponentTreeEngine before targets are highlighted or drops are committed. Editor insertion controls and indicators remain outside public rendering.

# D-022: Element custom CSS is metadata scoped by attribute selector

Status: Accepted
Date: 2026-09-25

Decision:
Element-level Custom CSS is stored as `node.metadata.customCss` (freeform string, same persistence pattern as `metadata.className`). At render time the element receives `data-builder-css-scope="<nodeId>"` (only when customCss is non-empty) and a sibling `<style>` fragment wrapping the authored CSS as `[data-builder-css-scope="<nodeId>"] { ... }`, implemented as mirrored helpers in TypeScript (`resources/js/builder/renderer/element-custom-css.ts`) and PHP (`app/Builder/Renderer/ElementCustomCss.php`).

Reason:
Metadata needs no schema or validation changes. An attribute selector is required because reusable-instance ids contain `:` (`instanceId:nodeId`), which breaks bare id selectors; the public renderer strips only `data-builder-id` and `data-builder-type`, so the scope attribute survives to the public DOM. A sibling fragment (not a child) avoids void-element child-dropping and contaminating `editableTextContent`, which is safe because text-bearing components disallow children. `<style>` text must bypass entity escaping in both HTML serializers so `&` and `>` in authored CSS survive.

Implication:
Plain CSS relies on native CSS nesting; panel/design-tab styles are inline, so overriding them requires `!important` (documented in the inspector hint). Any change to the scoping contract must land in both the TS and PHP helpers and their renderer injection points.

# D-023: Effects are composed style primitives, not raw CSS passthrough

Status: Accepted
Date: 2026-09-25

Decision:
Figma-style effect controls (drop shadow, inner shadow, layer blur, background blur, glass: refraction/depth/dispersion/frost/splay/light degree/opacity) are stored as typed numeric/color style keys in the shared style catalog (group `effects`, `type: number|color`), and are composed into real CSS (`box-shadow`, `filter`, `backdrop-filter`, `background-image` sheen) at render time by mirrored composers: `resources/js/builder/renderer/compose-effects.ts` (invoked at the end of `applyBackgroundStyles`) and `app/Builder/Renderer/EffectsComposer.php` (invoked at the end of `StyleResolver::resolve`). Virtual keys are always consumed before serialization so invalid properties never reach the DOM.

Reason:
Virtual effect keys are inspector-facing inputs, not CSS properties. Composition must run after background handling (a solid background deletes `backgroundImage`, so the glass sheen would otherwise be dropped) and must chain with an existing `boxShadow` enum value instead of replacing it. Keeping composition in one mirrored module per side preserves the D-022-style TS/PHP parity contract and keeps the style catalog data-driven (D-010) rather than teaching every renderer about shadows.

Implication:
New effect keys must be appended to `STYLE_PROPERTY_DEFINITIONS` (TS), `StyleSchema::definitions()` (PHP), and to `styleCapabilities` of every `boxShadow`-capable component on both sides, and must stay excluded from the generic inspector `StyleControl` rendering (the dedicated EffectsControl owns them). Any change to composition output must land in both composers plus their tests.

# D-024: Custom Code element renders verbatim HTML with executable scripts on public pages

Status: Accepted
Date: 2026-09-25

Decision:
The palette `code.customcss` element is removed and replaced by `code.customcode` ("Custom Code"): a single `code` prop holding raw author HTML that may contain markup, `<style>`, and `<script>` tags. Its registry `defaultProps.code` is a `<style>` + `<script>` example with comments only — never a visible `<div>` — so a freshly inserted element renders nothing visible in preview or production and relies on the editor chip below for clickability. Placement: `code.customcode` is an allowed child of Section, Row, Column, Container, Stack, Flex, Grid, Columns, and Card via `childRules.allowedTypes` in both registries (Section/Row list it explicitly alongside their structural children), so drag/drop, insert, move, and persistence validation all accept it outside Column. Preview/production layout neutrality: when the authored code renders nothing visible (`hasVisibleCodeContent()` in `resources/js/builder/code-content.ts`, mirrored by `App\Builder\Renderer\CodeContent`), both renderers emit the wrapper `<div>` with `display: contents`, so the element contributes no box — no height, no width, and no flex-gap slot inside Sections/Rows/Columns — unless the wrapper is stylable (`metadata.className` or `metadata.customCss` present), in which case the box is kept so author styling still applies. The editor canvas always forces `display: block` on the placeholder branch in `CanvasNode`, so the chip/min-height builder design is unchanged. Both renderers emit it verbatim through the `RenderResult.html` channel inside a `<div>` wrapper (TS `customCodeRenderer`, PHP `CustomCodeRenderer`; `CustomCssRenderer` deleted). `DocumentPersistenceValidator` migrates legacy `code.customcss` node types to `code.customcode` on load/save. On the client-rendered public site, `public-site.tsx` mounts `html` content via a template + `executableNode()` re-creation so `<script>` elements actually execute; the editor canvas keeps its inert `dangerouslySetInnerHTML` span, so `<style>` applies live but scripts never run inside the editor. Builder-only clickability lives in `CanvasNode`: when `hasVisibleCodeContent()` (editor util in `render-result-utils.ts`) decides the authored code produces no visible content (empty, comments, style/script/meta markup only), the editor gives the wrapper a `min-height` and a non-interactive dashed placeholder chip labeled "Custom code" (`data-builder-code-placeholder`) so the element is clickable on canvas. Preview (`preview.pages.show` → `public-site`) and production share `PublicRenderNode`, which never renders editor chrome, so placeholder/min-height are absent from both.

Reason:
A raw-code element must not be escaped or wrapped as CSS text; authors expect HTML/style/script to behave exactly as authored. Scripts inserted through innerHTML are inert by browser rule, so the public renderer must re-create script nodes (the same pattern already used for `globalHeadCode`/`globalFooterCode`). Keeping scripts inert in the editor protects the builder session from author code, while `<style>` preview stays consistent with how scoped Custom CSS already renders in-canvas. The old element type was never part of a committed release, but a load-time type migration keeps any locally persisted node renderable.

Implication:
`code.customcode` renders through the raw `html` channel only (never `text`), so serializers must not escape it; editors show it through the existing html span. The clickable placeholder and its `min-height` are editor presentation concerns owned by `CanvasNode`/`render-result-utils.ts` only — never the renderers or `public-site.tsx` — so preview and production HTML stay byte-identical apart from the authored code. When content is visible, no placeholder is drawn and the normal hover/selection overlays provide the affordance. Any future sanitization, sandboxing, or script policy decision must land in both the renderers and `public-site.tsx`, and the per-element Custom CSS feature (D-022, `metadata.customCss`) remains separate and unchanged.

# D-025: Clean Google Workspace / Figma inspector architecture

Status: Accepted
Date: 2026-09-25

Decision:
The right-hand component inspector adopts Google Workspace / Figma style controls:
1. Header: Removes noisy metadata (uppercase "DESIGN" tag and raw node ID like `node_5`). Displays an icon badge, component name, and direct element action buttons (duplicate, delete).
2. Spacing controls (Margin & Padding): Replaces the clunky 3x3 layout and four repetitive unit dropdowns with modern Linked (single input with quick presets and unit picker) and Sides (compact 4-column T/R/B/L layout) modes, with a one-click horizontal centering helper for margin (`margin: 0 auto`) and reset override buttons.
3. Border and Stroke controls: Replaces bulky side-by-side selects with unified Stroke (linked/sides, integrated borderStyle select and borderColor color swatch picker) and Corner Radius (linked/corners with quick radius presets including Pill/round) controls.

Reason:
Visual builders require high information density, fast ergonomics, and minimal visual noise. The old 3x3 layout consumed excessive vertical space with empty boxes and cut-off dropdowns. The new design matches modern design tools while preserving full underlying style schema contracts and responsive cascading.

# D-027: High-density card-based component inspector redesign

Status: Accepted
Date: 2026-09-25

Decision:
The entire right sidebar inspector (`ComponentInspector.tsx`) is redesigned into high-density, card-based groups across all tabs (`Layout`, `Style`, `Content`, and `More`), replacing vertically sprawling generic inputs, redundant nested accordions, and line-breaking text links:
1. Card Architecture: Each tab renders dedicated, self-contained cards with consistent headers (title on left, breakpoint badge on right, and an inline `RotateCcw` reset button whenever any property in the card is overridden on the active breakpoint).
2. Layout Tab:
   - `ResponsiveVisibilityControl`: Replaces plain checkbox with a status toggle card (`Eye` / `EyeOff` icons, `Visible on Desktop [Visible]` / `[Hidden]`).
   - `DimensionsControl`: 2-column compact inputs for Width and Height with unit selectors, quick width presets (`100%`, `Auto`, `320px`, `640px`), collapsible min/max constraints (Min W, Max W, Min H, Max H), and overflow selector.
   - `FlexLayoutControl`: Segmented icon buttons for Direction (Horizontal `ArrowRight` vs Vertical `ArrowDown`), 4-button align items group (`Start`, `Center`, `End`, `Stretch`), 6-button justify content group (`Start`, `Center`, `End`, `Between`, `Around`, `Evenly`), compact gap input with unit picker, wrap toggle (`No wrap` / `Wrap`), and grid columns presets.
   - `BoxModelControl`: Preserved approved Spacing (Margin & Padding) linked/sides controls.
   - `PositionControl`: Mode selector (Static, Relative, Absolute, Fixed, Sticky) with 2x2 grid for Top/Right/Bottom/Left and Z-Index input when non-static.
3. Style Tab:
   - `TypographyGroupControl`: Searchable Font Family picker with recent fonts, 2-column Size & Weight with quick size presets (`14`, `16`, `20`, `24`, `32`, `48`), 2-column Line Height & Letter Spacing, segmented text alignment icon buttons (`AlignLeft`, `AlignCenter`, `AlignRight`, `AlignJustify`), compact color picker with hex and swatches, and segmented style buttons (Transform `Aa`/`TT`/`Abc`, Decoration `None`/`Underline`/`Strike`).
   - `BackgroundColorControl`: Dedicated card with color swatch, hex input, recent colors, and theme tokens.
   - `BorderGeometryControl`: Preserved approved Stroke & Corner Radius controls.
   - `EffectsControl`: Standardized into consistent card shell for shadows, blurs, and glass effects.
4. Content Tab:
   - `PropControls`: Formatted human-friendly labels ("Heading Text", "Button Label", "Link Destination", "Alt Text") with context icons (`Type`, `LinkIcon`), segmented `H1`–`H6` pills for heading levels, and multiline textareas for paragraphs/richtext.
5. Inline Override Action: Replaces duplicate, line-breaking `"Clear override"` text links with an inline `RotateCcw` reset button next to each property label across all controls.

Reason:
The inspector is the primary authoring workspace in the visual builder. Stacked single-line inputs with duplicate unit selects and text links consumed excessive vertical scrolling. The new card-based architecture matches modern design tools (Figma, Google Workspace), provides instant visual recognition, and maintains high density while strictly preserving responsive cascading and schema contracts.

# D-028: Google M3 and Figma-grade left-hand builder controls redesign

Status: Accepted
Date: 2026-09-25

Decision:
The left-hand sidebar controls (`BuilderLeftPanel.tsx`, `BuilderElementsPanel.tsx`, `BuilderLayersPanel.tsx`) are redesigned into a unified Google M3 navigation surface:
1. Navigation Bar & View Modes:
   - Unified Google M3 top tab bar: `Elements` (Catalog), `Layers` (Tree with dynamic node count badge), `Library` (Templates & Reusable Components with clean sub-filter), and `Media` (Assets with upload dropzone).
   - One-click Split View toggle (`Rows2` / `SplitSquareVertical`): Supports both Single View (100% full height for whichever tab is active, eliminating the cramped 50/50 cutoff) and Split View (stacked Elements and Layers with clean collapsible headers for direct drag-and-drop from elements into specific layers). Default initialized to Split View to preserve simultaneous catalog and tree visibility while enabling full-height single views on demand.
2. Elements Catalog (`BuilderElementsPanel.tsx`):
   - Removed header clutter (unwanted green uppercase "INSERT" label, redundant giant "Elements" title, and shape circle icon).
   - Search & Filter: Google-style rounded pill search with instant clear button (`×`) and Google M3 category filter chips (`All`, `Layout`, `Content`, `Media`, `Code`, `Marketing`) with dynamic count badges.
   - High-Density Cards: 2-column grid of compact cards with rounded corners (`rounded-xl`), soft tinted icon containers matching component category (blue for layout, violet for content, rose for media, amber for code, emerald for marketing), crisp 12px labels, tactile hover elevation, drag affordance, and click-to-insert.
3. Layers Tree & Navigator (`BuilderLayersPanel.tsx`):
   - Removed header clutter (unwanted green uppercase "STRUCTURE" label, redundant giant "Layers" title, folder circle icon, and non-functional "Layers vs Outline" sub-tabs).
   - Component-Specific Visuals: Replaced generic monochrome folder/file icons with distinctive colored icons mapped directly to each component type (`component-icons.tsx`).
   - Content Snippet Previews: Displays formatted text preview snippets (e.g. `Heading "Welcome to HelloWeb"`, `Button "Get Started"`) directly beside the node name, dramatically improving tree scannability.
   - Visual Hierarchy & Indentation: Crisp nesting guide lines (`border-l border-border/40`), smooth rotating chevrons, Google M3 subtle active selection indicator (`bg-primary/10 text-primary border-l-2 border-primary`), and header actions (Expand All / Collapse All and tree filter search).
4. Library & Media Tabs:
   - Unified Library: Replaces colliding "Templates Components" tabs with a clean sub-segmented filter (`All`, `Page Templates`, `Components`), search input, and one-click insert cards.
   - Media Hub: Direct drag-and-drop file upload zone with `UploadCloud` icon, file type indicators, and 2-column thumbnail gallery with click-to-insert.

Reason:
The previous left-hand panel was vertically split 50/50 between two cramped panels, had duplicate uppercase category badges, colliding tab labels ("Templates Components"), generic monochrome tree icons, and heavy boxy cards. The new Google M3 and Figma-grade design maximizes vertical workspace, eliminates clutter, provides instant visual element recognition, and gives users both full-height focus and split-view flexibility.

Implication:
All tree operations, drag-and-drop handlers, insertion paths, and test contracts (`scripts/builder-editor-tests.ts`, `data-layer-node-id`) remain 100% preserved. Backward-compatible standalone exports of `BuilderElementsPanel` and `BuilderLayersPanel` are retained.

# D-029: Edge-to-edge canvas, draggable side panels, and custom unsaved changes dialog

Status: Accepted
Date: 2026-09-25

Decision:
1. Edge-to-Edge Canvas Fitting (`BuilderCanvas.tsx`):
   - Eliminated the surrounding padding (`px-8 pt-8 pb-20`) on desktop viewports so the website canvas touches the top header toolbar directly and sits seamlessly flush against the left and right side controls with zero gaps.
   - Preserves centered device frames for tablet (768px) and mobile (375px) viewports with appropriate device padding.
2. Draggable / Resizable Side Panels (`PanelResizeHandle.tsx`, `BuilderEditor.tsx`, `ComponentInspector.tsx`):
   - Added interactive `PanelResizeHandle` dividers between the left panel & canvas and between the canvas & right inspector.
   - Left panel resizable between 240px and 520px (default 300px); right inspector resizable between 260px and 600px (default 340px).
   - Double-clicking either handle instantly resets the panel to its default width.
3. Top Header Toolbar Redesign (`BuilderToolbar.tsx`):
   - Redesigned top toolbar with Google UI aesthetics: globe site icon, clean breadcrumbs (`My Website / Page Name`), dropdown chevron, Google Docs-style cloud save status indicator, and center Google M3 segmented device switcher.
   - Back button directs users back to `/dashboard` instead of the internal `/builder` route.
4. Custom Unsaved Changes Dialog (`UnsavedChangesModal.tsx`):
   - Replaced browser-native `window.confirm` popup with an elegant, custom confirmation modal featuring warning icon, clear explanatory text, and three distinct actions: "Keep editing" (cancel), "Discard & leave" (navigates to `/dashboard`), and "Save & leave" (saves immediately before redirecting).

Reason:
Visual builders require true webpage preview accuracy where desktop content meets viewport boundaries without distracting outer padding. Resizable side panels give creators fine-grained workspace control, and custom modal dialogs eliminate disruptive native browser alert popups.

# D-030: Canvas drag reordering, zoom reflow, and studio dashboard redesign

Status: Accepted
Date: 2026-09-25

Decision:
1. Canvas Drag-and-Drop Reordering (`CanvasNode.tsx`, `DropTargetOverlay.tsx`, `BuilderEditor.tsx`):
   - Stopped event bubbling on `onDragStart` (`event.stopPropagation()`) so dragging child elements (like buttons or text) no longer bubbles up to set the dragged node as the parent Column, Row, or Section.
   - Populated native HTML5 drag dataTransfer (`text/plain`, `application/x-builder-node-id`, `effectAllowed = 'move'`).
   - Upgraded drop target resolution (`resolveDropTarget` & `resolveDropParentAndPosition`):
     - Leaf nodes (buttons, headings, text, links, images) accept positional drops (`'before'` or `'after'`) into their parent container.
     - Container nodes (columns, containers, flex) accept `'append'` drops as well as positional sibling drops.
     - Section and row drops intelligently resolve to descendant columns/containers that accept the dragged component type.
   - Enhanced `DropTargetOverlay` with directional blue insertion lines for before/after modes and dashed container outlines for append mode.
   - Wired `dropNode` to call `commitDocument(nextState)` so canvas moves are tracked in the undo/redo stack and marked dirty for autosave.
2. Canvas Zoom & Scaling (`BuilderToolbar.tsx`, `BuilderCanvas.tsx`, `BuilderEditor.tsx`):
   - Added canvas zoom selector in the toolbar header next to the device switcher with zoom in/out buttons and direct percentage selection (50%, 75%, 80%, 90%, 100%, 125%).
   - Defaults desktop view to 80% zoom so that even on laptop screens with both sidebars open (640px combined), the desktop canvas retains full desktop viewport width (1200px+ reflow) and does not wrap into tablet layout.
   - Applied CSS `zoom` with proportional shell scaling to prevent layout distortion and keep DOM event coordinates synchronized.
3. Complete Dashboard & Workspace Redesign (`app-sidebar.tsx`, `app-header.tsx`, `dashboard.tsx`, `admin-resource-page.tsx`, `websites/index.tsx`, `pages/index.tsx`, `templates/index.tsx`, `media/index.tsx`, `reusable-components/index.tsx`):
   - Removed starter-kit "Repository" and "Documentation" external links from `app-sidebar.tsx` and `app-header.tsx`.
   - Redesigned sidebar into structured workspace groups ("Workspace", "Design Assets", "Settings") with a high-visibility "Launch Builder" button.
   - Replaced stock dashboard with a modern studio experience: personalized welcome hero banner with live studio indicator, 4 color-accented KPI metric cards with hover elevation, active projects grid with mini browser chrome and status badges, recent pages table with direct 1-click "Edit Page" links, template starter cards, and revision checkpoint history.
   - Modernized all admin resource pages with consistent glass cards, live dot status badges, empty states with clear CTAs, formatted file sizes, and quick builder launch shortcuts.

Reason:
Creators need fluid in-canvas drag repositioning, desktop canvas scaling that prevents narrow responsive breakpoint collapse on standard laptop displays, and a clean, bespoke website builder platform environment free of generic Laravel starter-kit links.

Implication:
All schema, database models, document persistence, and registry contracts remain unmodified. Undo/redo stacks and autosave mechanisms now accurately record drag reorder operations.

## D-031 - Left panel tab layout, split view cleanup, max width inspector controls, and dimensions preset grid

Status: Accepted
Date: 2026-09-25

Decision:
1. Left Panel Tab Navigation & View Cleanup (`BuilderLeftPanel.tsx`):
   - Redesigned panel header tabs into a balanced `grid grid-cols-4 gap-1 w-full` layout. At the default 300px panel width, all four tabs ("Elements", "Layers", "Library", "Media") display both icon and label text clearly without text cutoff or icon-only truncation.
   - Removed split view toggle button and split view dual rendering. When "Elements" is active, it renders exclusively the elements catalog full-height. When "Layers" is active, it renders the tree layers catalog full-height.
2. Inspector Dimensions Control & Max Width Promotion (`ComponentInspector.tsx`, `built-ins.ts`, `BuiltInComponentDefinitions.php`):
   - Added `'maxWidth'` to `layout.section` styleCapabilities in both TypeScript and PHP component registries.
   - Promoted `Max Width (Max W)` directly into the primary 2-column dimensions grid alongside `Width (W)`, `Height (H)`, and `Min Height (Min H)`.
   - Unified `CompactDimensionInput` into an integrated input-with-suffix container (`focus-within:ring-1 border border-input`), slimming the unit selector to 40px (`w-10`) with `border-l` to eliminate wasted margins and prevent long labels like "auto" from being clipped.
   - Replaced cramped flex width preset buttons with an exact `grid grid-cols-4 gap-1 w-full` preset grid (`100%`, `Auto`, `320px`, `640px`) that stays strictly within the inspector card padding and never overflows or overlaps.
   - Retained collapsible secondary constraints section for `minWidth` and `maxHeight` with an active override dot indicator.
3. Test Suite Alignment (`scripts/builder-editor-tests.ts`):
   - Verified Library tab rendering in `editorMarkup`.
   - Tested `data-layer-node-id="section-1"` through explicit `BuilderLayersPanel` rendering.

Reason:
Users need immediate access to `maxWidth` without digging into collapsed menus, quick width presets must not overflow or overlap on narrow inspector panels, and left panel tabs must be fully readable without confusing layers appearing under the elements tab.

Implication:
No breaking changes to persisted document structures or responsive styling cascades. All tests pass with zero regressions.

## D-032 - Clean Light SaaS Application Redesign (Visual Builder Excluded)

Status: Accepted
Date: 2026-09-25

Decision:
1. Application-Wide Light SaaS Design System (`resources/css/app.css`):
   - Established global light SaaS color palette: soft off-white canvas background (`#F4F6F9` / `hsl(220, 18%, 97%)`), pure white card surfaces (`#FFFFFF` / `hsl(0, 0%, 100%)`), deep forest/emerald primary accent (`hsl(155, 60%, 19%)`), crisp borders (`hsl(220, 13%, 91%)`), and `--radius: 1.125rem` (18px) for modern rounded corners.
   - Left `.builder-editor` styles completely isolated and untouched. Defaulted user appearance to light mode for the non-builder application.
2. Global Navigation & Shell (`app-sidebar.tsx`, `nav-main.tsx`, `app-sidebar-header.tsx`, `app-logo.tsx`):
   - Redesigned sidebar into a clean white container with `MENU` and `GENERAL` navigation sections, emerald icon badges, active pill states, a top `+ Launch Builder` pill CTA, and a bottom dark forest green "Visual Studio" banner matching the reference design.
   - Replaced top header with a modern search pill (`⌘ F`), quick builder launcher button, notification bell with green ping dot, and user profile pill block with avatar, name, and email dropdown.
   - Upgraded application branding to a modern SaaS icon badge and "HelloWeb" wordmark with forest green dot.
3. Dashboard & Management Resource Pages:
   - Rebuilt `dashboard.tsx` with light SaaS architecture: deep forest green highlight KPI card with circular `↗` button, 3 clean white metric cards with subtle borders, weekly activity bar chart with day labels, spotlight project card with instant "Launch in Studio" action, clean projects list, recent pages table with direct 1-click builder edit, and circular SVG publishing health indicator.
   - Rebuilt all resource management pages (`websites/index.tsx`, `pages/index.tsx`, `templates/index.tsx`, `media/index.tsx`, `reusable-components/index.tsx`) into clean white cards (`rounded-[20px]`/`rounded-[22px]`), filter pill tabs, search bars, and live dot status badges.
   - Modernized settings layouts (`settings/layout.tsx`, `profile.tsx`, `password.tsx`, `website.tsx`), welcome landing page (`welcome.tsx`), and authentication layouts (`auth-simple-layout.tsx`, `auth-card-layout.tsx`).
4. Strict Visual Builder Boundary:
   - Visual Builder components (`resources/js/builder/**`), canvas, inspector, toolbar, left panel, state, styles, persistence, and routes remained 100% untouched.

Reason:
To transform the entire HelloWeb non-builder application into a cohesive, high-end light SaaS product matching the reference design language while maintaining an absolute boundary around the Visual Builder framework.

Implication:
All backend routes, Inertia controllers, builder unit tests, and editor tests remain fully functional with zero regressions.



