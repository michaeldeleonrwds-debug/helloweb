# Project Status

Updated: 2026-09-25
Agent: opencode
Phase: Custom Code element (D-024), Figma-style effects controls (D-023)
Status: complete

## Current Objective

The `code.customcss` palette element is removed and replaced by `code.customcode` ("Custom Code"): raw HTML with `<style>` and `<script>` support, rendered verbatim through the `html` channel, executed on the public site, inert in the editor canvas, with load-time migration for legacy node types. Figma-style effects controls (D-023) remain complete. The next exact milestone remains PHASE 10 — PREVIEW AND PUBLISHING.

## Completed

- Redesigned left-hand builder controls (D-028): unified the left panel (`BuilderLeftPanel.tsx`, `BuilderElementsPanel.tsx`, `BuilderLayersPanel.tsx`) with Google M3 tabs (`Elements`, `Layers`, `Library`, `Media`) and a one-click Split View toggle (stacked vs full-height). Cleaned unwanted uppercase header clutter ("INSERT", "STRUCTURE") and colliding tabs. Built Google M3 search with category filter chips (`All`, `Layout`, `Content`, `Media`, `Code`, `Marketing`), high-density element cards with soft-tinted icon containers, and a rich layer tree with component-specific colored icons (`component-icons.tsx`), text snippet previews, depth nesting guides, and expand/collapse actions.
- Redesigned right-hand inspector (D-027): organized all element settings into high-density, card-based controls. Built `DimensionsControl` (compact 2-col W/H, presets, collapsible constraints, overflow), `FlexLayoutControl` (segmented direction, alignment, justification, gap, wrap, grid cols), `PositionControl` (type selector, 2x2 coordinate grid, z-index), `TypographyGroupControl` (searchable family, size/weight presets, line height/letter spacing, text alignment, color picker, transform/decoration), `BackgroundColorControl` (color picker, swatches, hex input), and `ResponsiveVisibilityControl`. Preserved approved Spacing (margin/padding) and Border (stroke/radius) controls, formatted Content props with icons and segmented pills, and eliminated redundant nested accordions and sprawling overrides.
- Integrated a real dark IDE CodeEditor component (`CodeEditor.tsx`) across all builder code surfaces: Custom Code element (`code.customcode`), Global Head & Footer code modal (`BuilderEditor.tsx`), and Element Custom CSS (`ComponentInspector.tsx` More tab). Features syntax highlighting (HTML, embedded CSS/JS, standalone CSS/JS), line numbers gutter with active-line highlight, Tab / Shift+Tab indentation, auto-indent on Enter, bracket/quote auto-closing/wrapping, line & column status bar, copy to clipboard with feedback, and full-screen modal expansion.
- Corrected Builder workspace presentation: stable side panels, a shrinkable center scroll container, webpage-as-canvas rendering, viewport-independent zoom, measured fit-to-workspace behavior, natural page minimum height, and independent vertical/horizontal workspace scrolling.

- Audited project structure, dependency versions, routes, models, migrations, React pages/components, tests, and ContextOS.
- Created `AGENTS.md` with permanent framework-development rules.
- Updated ContextOS baseline: `PRD.md`, `ARCHITECTURE.md`, `PLAN.md`, `CONSTRAINTS.md`, `DECISIONS.md`, `STATUS.md`, `HANDOFF.md`.
- Recorded decisions D-001 through D-003 for original framework architecture, versioned document persistence, and editor/renderer separation.
- Implemented Phase 1 PHP builder document contracts under `app/Builder/Document`.
- Implemented matching TypeScript document contracts under `resources/js/builder`.
- Added `tests/Unit/Builder/BuilderDocumentTest.php` covering valid/minimal documents, missing schema version, invalid root, missing node ID/type, invalid children, invalid document structure, nested nodes, serialization/deserialization, and schema version preservation.
- Recorded D-004 for explicit builder namespaces.
- Fixed small starter TypeScript blockers in auth form pages and `welcome.tsx` so project typecheck can run.
- Implemented Phase 2 component definition contracts in PHP and TypeScript.
- Implemented component registries in PHP and TypeScript with registration, lookup, listing, duplicate protection, and unknown lookup behavior.
- Added built-in component definitions for `layout.section`, `layout.container`, and `content.heading`.
- Added minimal capability, default props/styles, prop schema metadata, child-rule metadata, and future integration-key metadata.
- Added focused registry behavior tests in `tests/Unit/Builder/Registry/ComponentRegistryTest.php`.
- Recorded D-005 for data-driven component definitions and registries.
- Implemented Phase 3 component tree engines in PHP and TypeScript.
- Added deterministic insert positions: append, before sibling, and after sibling.
- Added injectable node ID generation for duplicate operations.
- Enforced child relationships through the Phase 2 component registry and explicit root constraints.
- Added domain-level operation errors for missing nodes/parents, invalid component types, invalid child relationships, invalid positions, invalid root operations, and duplicate generated IDs.
- Added focused tree engine tests in `tests/Unit/Builder/Engine/ComponentTreeEngineTest.php`.
- Recorded D-006 for immutable, registry-enforced tree operations.
- Implemented Phase 4 renderer contracts in PHP and TypeScript.
- Implemented renderer registries, render context, render result, renderer exceptions/errors, style resolvers, and built-in renderers.
- Added rendering support for `layout.root`, `layout.section`, `layout.container`, and `content.heading`.
- Added `layout.root` as a structural built-in component definition for registry-based render resolution.
- Added focused renderer tests in `tests/Unit/Builder/Renderer/BuilderRendererTest.php`.
- Recorded D-007 for keeping RendererRegistry separate from ComponentRegistry.
- Implemented Phase 5 TypeScript editor state and reducer.
- Implemented a renderer-backed React `BuilderCanvas` and generic `CanvasNode` adapter for neutral `RenderResult` trees.
- Added stable `data-builder-node-id` DOM mapping for selectable rendered components.
- Added hover and selection interaction handling, with nested child selection isolated from parent selection.
- Added non-intercepting hover and selection overlays.
- Added stale selected/hovered node cleanup when the document changes.
- Added focused editor/canvas tests through `npm run test:builder-editor`.
- Recorded D-008 for keeping editor interaction state outside renderer contracts.
- Implemented registry-driven insertion through engine-created default nodes and generated IDs.
- Implemented centralized editor operations for insertion, movement, duplication, removal, and prop updates.
- Implemented palette, native drag/drop movement, duplicate/remove actions, and a data-driven inspector for supported component props.
- Added immutable prop-update validation in the PHP and TypeScript tree engines, including heading level bounds.
- Recorded D-009 for routing editor mutations through the tree engine.
- Implemented typed style definitions and validation for controlled layout, flex, position, background, border, and text properties.
- Added registry-declared component style capabilities, deterministic responsive resolution, inherited values, and clearable overrides.
- Added immutable tree-engine/editor style mutations, stable escaped serialization, renderer integration, and responsive inspector controls.
- Recorded D-010 for typed styles as document data.
- Added Website, Page, and PageRevision migrations/models with website-scoped page slugs and JSON document storage.
- Added validated persistence/application services, default page document creation, page-scoped revisions, restore snapshots, and optimistic document-version checks.
- Added authenticated page/revision endpoints and ownership policy coverage.
- Replaced the hard-coded builder sample route with persisted page loading and a default persisted page for authenticated users.
- Added 650ms debounced autosave, visible save/error state, retry behavior, and local-document preservation on failures.
- Recorded D-011 for separating editable drafts from immutable revision snapshots.
- Added owned Template, MediaAsset, and ReusableComponent persistence models, migrations, and policies.
- Added template validation, independent deep-clone instantiation, archival, and authenticated endpoints.
- Added MediaStorage abstraction, Laravel storage adapter, media metadata service, references, and ownership checks.
- Added explicit reusable.instance document references, insertion service, cross-scope protection, and pre-render TypeScript resolution.
- Added minimal builder template/reusable selectors and insertion flow while preserving autosave/version responses.
- Recorded D-012 and D-013 for independent template trees and explicit media/reusable boundaries.
- Replaced the prototype builder shell with a dedicated toolbar, Elements panel, Layers panel, canvas workspace, Design inspector, and bottom viewport controls.
- Added registry-driven element search/categories, document-driven layer selection, responsive device switching, presentation-only zoom, contextual selection labels, and dark-mode token styling.
- Kept Dashboard and Builder as separate experiences and recorded D-014.
- Replaced the starter dashboard placeholder with real owned-resource summaries, resource navigation, recent pages/revisions, and intentional empty states without demo data.
- Replaced visible starter-kit branding with HelloWeb identity and applied restrained emerald semantic accents across light and dark modes.
- Recorded D-015 for visible HelloWeb product branding without renaming framework internals.
- Added Phase 9.5 foundational registered components: Stack, Flex, Grid, Columns, Spacer, Divider, Text, Rich Text, Button, Link, Image, and Card.
- Added aligned PHP/TypeScript component metadata and renderer registrations with child rules and style capabilities.
- Added HelloWeb design tokens, property-aware color/enum/number/length inspector controls, and inline text editing through tree mutations.
- Recorded D-016 for registry-driven component library expansion.
- Added element Custom CSS (D-022): inspector More-tab textarea below CSS classes, `metadata.customCss` storage, `data-builder-css-scope` attribute emission, sibling scoped `<style>` fragment injection in TS and PHP renderers, raw style text in both HTML serializers, and mirrored helper modules.
- Added 4 PHP renderer tests and TS metadata/render assertions for Custom CSS; repaired pre-existing stale test expectations that blocked the suites (TS structural paths for `root > section > row > column > heading`, duplicate-placement path, `Select an element` empty-state copy; PHP default-style expectations `72rem` -> `900px` and exact-HTML sample).
- Added `storage` to `eslint.config.js` ignores (generated test bundle was being linted) and fixed 3 pre-existing lint errors (unused expression in BuilderEditor, unused `_label`/`name` destructures).
- Added row default content width `1140px` in TS/PHP registries and corrected the inspector label to show `1140px content width`.
- Added Figma-style effects controls (D-023): 19 new effect style keys in `style.ts`/`StyleSchema.php` (group `effects`), mirrored composers `compose-effects.ts`/`EffectsComposer.php` (TS wired at the end of `applyBackgroundStyles` so the glass sheen survives solid-background handling; PHP wired at the end of `StyleResolver::resolve`), `containerRenderer` now runs background/effects composition too, effect keys appended to every `boxShadow`-capable component in both registries, and a dedicated inspector `EffectsControl` (presets plus toggle sections with sliders for drop/inner shadow, layer blur, background blur, and glass) replacing the preset-only panel while the generic `StyleControl` filter excludes the composed keys.
- Added 2 PHP renderer tests (`effects compose into shadow filter and backdrop filter`, `inner and glass shadow layers chain with existing box shadow`) and mirrored TS render assertions for composition output, backdrop chaining, sheen prepending, and virtual-key removal; ran Pint on the touched PHP files.
- Replaced the `code.customcss` palette element with `code.customcode` (Custom Code, D-024): registry rename in TS/PHP (allowed-children lists included), `CustomCodeRenderer` (raw `html` channel inside a `<div>`, `CustomCssRenderer` deleted), inspector textarea relabeled "Custom code" with example placeholder and `spellCheck={false}`, load-time type migration in `DocumentPersistenceValidator`, and public-site `useExecutableHtml` mounting template content with `executableNode()` script re-creation so `<script>` tags execute on public pages while staying inert in the editor canvas.
- Added 1 PHP raw-render test (`custom code element renders raw html style and script`), a new `DocumentPersistenceValidatorTest` (legacy migration + current-type validation), and TS render assertions for raw html/style/script passthrough with no escaping and no remaining `code.customcss` references.
- Added builder-only clickability for Custom Code (D-024): `hasVisibleCodeContent()` in `render-result-utils.ts` detects code that renders nothing visible (empty/comments/style/script/meta only), and `CanvasNode` then applies an editor-only `min-height: 56px` plus a non-interactive dashed "Custom code" placeholder chip (`data-builder-code-placeholder`) so the element is selectable on canvas. Preview and production render through `public-site.tsx`/`PublicRenderNode`, which never emits the placeholder — verified by assertions that editor markup contains it and rendered HTML does not.
- Changed the `code.customcode` default `code` prop (TS + PHP registries) from `<div>Custom code</div>` to a comment-only `<style>` + `<script>` example, so a new element has no visible content leaking into preview; the editor chip covers clickability instead. Covered by a new PHP registry test and TS assertions (default has style/script, no div, is invisible per `hasVisibleCodeContent`, renders no "Custom code" text, and still shows the canvas chip).
- Fixed Custom Code placement (D-024): added `code.customcode` to `childRules.allowedTypes` of `layout.section` and `layout.row` in both registries, so the element can be dragged/inserted/moved directly into a Section or Row, not only Column (and the existing Container/Stack/Flex/Grid/Columns/Card lists already included it). Since drag/drop, insert, move, and `DocumentPersistenceValidator` all read the registry, one definition change covers every path; covered by TS `canAcceptChild` + `engine.move` assertions and PHP registry/engine tests.
- Made empty Custom Code layout-neutral in preview/production (D-024): both renderers now emit the wrapper `<div>` with `display: contents` when `hasVisibleCodeContent()` is false (helper moved to shared `builder/code-content.ts`, PHP mirror `App\Builder\Renderer\CodeContent`), removing the wrapper's box and its flex-gap slot (the extra height/width the user saw in preview) — unless the wrapper carries `metadata.className` or `metadata.customCss`, which keeps the box so author styles apply. The editor canvas forces `display: block` on the placeholder branch in `CanvasNode`, so the builder chip/min-height design is unchanged; verified by TS render + editor-markup assertions and a PHP `empty custom code wrapper is layout neutral` test.

## In Progress

- None.

## Blocked

- Local `.env` remains SQLite; migrations use portable Laravel schema APIs and native JSON columns, while MySQL remains the intended deployment database.

## Next Action

Start PHASE 10 — PREVIEW AND PUBLISHING. Do not implement deployment, domains, plugins, themes, collaboration, or undo/redo outside that milestone.

## Validation

All checks below were actually run on 2026-09-25 for the CodeEditor, Inspector redesign, and Custom Code milestones:

- Focused editor tests: pass - `npm run test:builder-editor` (editor markup, inspector empty state, and tree operations all pass)
- Focused builder unit tests: pass - `php artisan test tests/Unit/Builder` - 89 tests, 234 assertions pass
- Typecheck: pass - `npx tsc --noEmit` (0 errors)
- Lint: pass - `npm run lint` - 0 errors, 3 pre-existing `react-hooks/exhaustive-deps` warnings
- Build: pass - `npm run build` (vite v6.1.1 built in 3.27s)
- Full PHPUnit suite: not-run this session (earlier sessions reported pass at 115 tests)
- Integration / E2E / Browser: not-run
- Production: n/a

## Git

Branch: master
Latest verified commit: a274bbe - Progress Update
Dirty files: long-running uncommitted WIP across builder editor/renderer/persistence plus effects controls and Custom Code changes (ComponentInspector, style.ts, compose-effects.ts, built-ins TS/PHP, CustomCodeRenderer, BuiltInRendererDefinitions, public-site, StyleSchema, EffectsComposer, StyleResolver, registries, DocumentPersistenceValidator, tests, scripts/builder-editor-tests.ts)
