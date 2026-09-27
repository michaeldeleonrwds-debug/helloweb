# Project Status

Updated: 2026-09-28
Agent: Antigravity
Phase: High-Converting Builder Elements & Inspector Customization Expansion
Status: complete

## Current Objective

Deliver production-grade component parity with high-converting visual builders (GHL, Elementor Pro, Divi), enhance logo marquee motion and visual controls, provide dedicated inspector panels for interactive elements, and verify mobile responsiveness end-to-end.

## Completed

- PHP Component Definition & Public Renderer Parity (D-051):
  - **Backend Schema Mirroring (`BuiltInComponentDefinitions.php`)**:
    - Updated `marketing.logomarquee` prop schema to accept `pauseOnHover` (boolean), `fadeEdges` (boolean), `fadeWidth` (string), `grayscale` (boolean), `logoCardStyle` (enum: card, clean), and `gap` (string), completely resolving the 422 persistence validation error `Property [pauseOnHover] is not supported by component [marketing.logomarquee]`.
    - Defined full component schemas for `marketing.countdown`, `content.socialicons`, `content.alert`, and `marketing.progressbar`.
    - Added new components to `$columnChildren` so they can be saved within columns and containers.
  - **Public Renderer Parity (`BuiltInRendererDefinitions.php`, `EssentialElementRenderer.php`)**:
    - Registered and implemented public rendering for countdown, social icons, alert banner, and progress bar.
    - Updated `logoMarquee()` to render 3-track loop, `pauseOnHover` hover pause, gradient fade masks, grayscale hover transition, and clickable outbound links.
    - Added YouTube/Vimeo embed URL normalizer in `video()`.
  - **Verification**:
    - `php artisan test tests/Unit/Builder/Registry/ComponentRegistryTest.php`: passed (14 passed, 56 assertions).
    - `php artisan test`: passed (97 passed, 871 assertions).
    - `npx tsc --noEmit`: passed (0 errors).
    - `npm run test:builder-editor`: passed.
    - `npm run build`: passed (Vite built in 6.67s).

- High-Converting Builder Elements & Inspector Customization Expansion (D-050):
  - **Logo Marquee (`marketing.logomarquee`)**:
    - Infinite 3-track seamless loop (`-33.333333%`) preventing stutter or whitespace at animation reset.
    - Direction (left/right) and duration/speed controls.
    - `pauseOnHover` switch stopping animation smoothly on mouseover.
    - Gradient edge fade masks with customizable `fadeWidth`.
    - Grayscale filter mode with smooth CSS hover color transition.
    - Card vs. clean transparent styling switches.
    - Per-logo item controls: thumbnail, image URL, alt text, link URL (`href`), tooltip name (`name`), media library replace/insert.
  - **Four New High-Value Built-In Elements**:
    - **Countdown Timer (`marketing.countdown`)**: Urgency timer for sales, launches, and events with datetime picker, card/circle/minimal styles, unit toggles (days, hours, minutes, seconds), custom labels, digit/card colors, and live client-side countdown timer script.
    - **Social Icons (`content.socialicons`)**: Profile linkstrip supporting Facebook, X/Twitter, Instagram, LinkedIn, YouTube, GitHub, TikTok, WhatsApp, and custom links, with brand/monochrome/outline styles, circle/rounded/square shapes, size presets, and responsive alignment.
    - **Alert Banner (`content.alert`)**: Callout notice supporting info, success, warning, destructive, and neutral presets, title, message, Lucide icon, CTA button, and dismissible toggle.
    - **Progress Bar (`marketing.progressbar`)**: Visual metric indicator with 0-100 range slider and numeric input, custom height and corner radius, custom bar and track colors, and striped/animated patterns.
  - **Custom Visual Inspector Panels (`ComponentInspector.tsx`)**:
    - Replaced flat unformatted schema inputs with dedicated visual panels for `marketing.logomarquee`, `marketing.countdown`, `content.socialicons`, `content.alert`, `marketing.progressbar`, `content.accordion`, `content.tabs`, `marketing.pricing`, `marketing.stats`, and `embed.video`.
    - Excluded all handled components from fallback loop to eliminate duplicate fields.
    - Auto-normalizes YouTube (`watch?v=`, `youtu.be`) and Vimeo URLs to embed format.
  - **Visual Icons Registry (`component-icons.tsx`)**:
    - Mapped `Timer`, `Share2`, `AlertCircle`, and `Activity` icons with category badges.
  - **Mobile Responsiveness**:
    - Verified all elements have responsive defaults (auto-stacking, wrapping, aspect-ratio scaling).
  - **Verification**:
    - `npx tsc --noEmit`: passed (0 errors).
    - `npm run test:builder-editor`: passed.
    - `npm run build`: Vite production build passed in 7.74s.
    - `php artisan test`: 95 passed (857 assertions).


- Responsive Theme Catalog Expansion:
  - Added responsive default normalization in `DefaultTemplateFactory` so seeded built-in headers, footers, and page blueprints get tablet/mobile style overrides for sections, rows, columns, flex groups, and prominent text.
  - Tightened footer/header/blueprint mobile defaults after screenshot review: multi-column rows now collapse to stacked mobile columns, text-bearing elements can constrain/wrap long content, and mobile rows reset width/max width to avoid horizontal overflow.
  - Corrected **Floating Glassmorphism Pill Header** so the default platform document renders the pill navbar as a root-level absolutely positioned element with responsive insets instead of a normal padded section that pushes page content down.
  - Fixed `content.list` styling contract so Styled List exposes text color and typography controls separately from the icon/bullet color prop.
  - Added `marketing.pricing` as a responsive Pricing Card builder element with editable badge, plan, price, period, features, CTA, accent color, and highlighted state.
  - Added matching TypeScript and PHP renderer support so Pricing renders consistently in the editor, previews, and public output, including mobile-safe wrapping and width defaults.
  - Added an essentials element pack across the component registry, editor palette, TypeScript renderer, and PHP public renderer:
    - Image Carousel (`media.carousel`)
    - Logo Marquee (`marketing.logomarquee`) with left/right direction, speed, text color, logo background, and border color controls
    - Accordion (`content.accordion`)
    - Tabs (`content.tabs`)
    - Stats (`marketing.stats`)
    - Testimonial (`marketing.testimonial`)
    - Video Embed (`embed.video`)
    - Contact Form (`form.contact`)
  - Updated the TypeScript component tree engine so newly inserted `layout.section` nodes default to the framework hierarchy `Section -> Row -> Column`.
  - Updated default layout widths: Section remains full-width (`width: 100%`), Row defaults to `width: 1160px`, and Column defaults to `width: 1140px`, with Row/Column capped by `maxWidth: 100%`.
  - Added typed responsive text wrapping primitives (`overflowWrap`, `wordBreak`) to the shared PHP/TypeScript style model and enabled them for text-like components instead of relying on arbitrary CSS.
  - Updated default platform template seeding so active platform templates are refreshed by slug, allowing already-seeded built-ins to pick up responsive catalog fixes without overwriting private user templates.
  - Added **Split CTA Header** (`split-cta-header`) as a conversion-focused global header option.
  - Added **Editorial Footer** (`editorial-footer`) as a publishing-style global footer option.
  - Added **Local Service Blueprint** (`local-service-blueprint`) as a responsive lead-generation page blueprint.
  - Added matching design-switcher wireframes in `ThemeLayoutPickerModal.tsx`.
  - Updated `ThemeTemplateTest` to expect 16 seeded templates, assert the new slugs are seeded, and verify stale platform templates are refreshed by slug.
  - Added `DefaultTemplateFactoryTest` coverage requiring default templates to include mobile overrides, multi-child rows to stack on mobile, and the floating pill header to stay out of normal document flow. Added `ComponentRegistryTest` coverage that Styled List supports text color controls. Added builder editor test coverage that section insertion creates a Row and Column scaffold.
  - **Verification**:
    - `php artisan test tests/Unit/DefaultTemplateFactoryTest.php`: passed with 34 assertions; PHP reported existing PDO MySQL constant deprecation notice.
    - `php artisan test tests/Feature/Builder/ThemeTemplateTest.php`: passed with 79 assertions; PHP reported existing PDO MySQL constant deprecation notices.
    - `php artisan test tests/Unit/Builder/Registry/ComponentLibraryTest.php tests/Unit/Builder/Renderer/BuilderRendererTest.php`: passed with 128 assertions.
    - `npm run test:builder-editor`: passed.
    - `npx tsc --noEmit`: passed with 0 errors.
    - `npm run build`: passed.

- In-Browser AI Background Removal & WebP Image Optimization Engine (D-049):
  - **Client-Side Image Processing Engine (`resources/js/builder/utils/image-processing.ts`)**:
    - Created browser-native processing utilities for HTML5 Canvas WebP encoding and `@imgly/background-removal` AI foreground extraction.
    - Zero server load: runs entirely via WebAssembly & ONNX Runtime Web in the user's browser.
    - Code-split by Vite: WASM and ONNX chunks are only loaded when background removal is clicked.
  - **Left Sidebar Media Panel (`BuilderLeftPanel.tsx`)**:
    - Added pre-upload optimization toggles: "⚡ Convert to WebP" (checked by default) and "✨ Remove Background" (AI cutout).
    - Added 1-click action buttons on all media gallery cards: "Cutout" ✨ and "WebP" ⚡.
    - Added format badges (`WEBP`, `PNG`, `JPG`), `✨ Cutout` badge, and file size indicator.
  - **Media Manager Modal (`MediaManager.tsx`)**:
    - Embedded pre-upload WebP and Background Remover checkboxes.
    - Added 1-click "Cutout" and "WebP" actions to all assets with auto-selection.
  - **Component Inspector 1-Click Magic Tools (`ComponentInspector.tsx`, `BuilderEditor.tsx`)**:
    - Added 1-click "Remove BG (AI)" and "To WebP" buttons directly under image previews for `media.image` and `layout.navbar` brand logo.
    - Seamlessly uploads the cutout asset to the media library and auto-updates the live canvas element.
  - **Verification**:
    - `npx tsc --noEmit`: 0 errors.
    - `npm run test:builder-editor`: passed (100%).
    - `npm run build`: Vite production build succeeded in 7.03s with code-split ONNX/WASM chunks.
    - `php artisan test`: 92 passed (766 assertions).

- Left Toolbar Tab Button Spacing & Header Empty Brand Fallback Fix (D-048):
  - **Left Toolbar Tab Button Spacing (`BuilderLeftPanel.tsx`, `BuilderEditor.tsx`)**:
    - Added `px-2.5` to tab bar wrapper and `gap-1.5` to grid columns.
    - Added `px-2` horizontal inner padding and `gap-1.5` to all tab buttons (`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition`).
    - The active pill background now gives the icon 8px of breathing room from the curved border, completely fixing the edge jamming.
    - Set default `leftPanelWidth` in `BuilderEditor.tsx` to `340px` (symmetrical with `rightPanelWidth` at `340px`), eliminating ellipsis truncation so "Elements", "Layers", "Library", and "Media" display fully.
  - **Header Empty Brand Fallback Fix (`built-ins.ts`, `ComponentInspector.tsx`)**:
    - In `resources/js/builder/renderer/built-ins.ts`, replaced `String(props.brandName ?? 'HelloWeb')` with `typeof props.brandName === 'string' ? props.brandName : ''`.
    - Made the brand title `<span>` conditional on `brandName`: `${brandName ? '<span>' + escapeHtml(brandName) + '</span>' : ''}`. When a logo is present and the text title is cleared, only the logo image is rendered.
    - Added dedicated Brand/Site Title input, Brand URL input, and Media Library logo selector/preview/remove actions to `ComponentInspector.tsx`.
    - Excluded `['brandName', 'brandLogo', 'brandHref', 'links']` from the generic schema loop for `layout.navbar`.
  - **Verification**:
    - `npx tsc --noEmit`: 0 errors.
    - `npm run test:builder-editor`: passed (100%).
    - `npm run build`: Vite production build succeeded in 4.35s.
    - `php artisan test`: 92 passed (766 assertions).

- Builder In-Canvas Link Navigation Suppression & Platform Template Autosave Fix (D-047):
  - **In-Canvas Link Navigation Suppression**:
    - In `CanvasNode.tsx` and `BuilderCanvas.tsx`, intercepted clicks on all anchor elements (`<a href="...">`) across page nodes, headers, and footers with `event.preventDefault()`.
    - Clicking the header logo or links in the builder now cleanly selects the component node for inspector editing without navigating away to `/` home.
    - Added `.builder-chrome-link` exemption to preserve external actions like the floating "Customize ↗" link.
  - **Platform Template Autosave Fix (500 Error Resolution)**:
    - Fixed MySQL 1062 duplicate slug error in `TemplatePersistenceService.php` by checking for existing user forks and guaranteeing unique incremental slugs (`$uniqueSlug`).
    - Promoted primary account User 1 (`Michael deLeon`) to `is_superadmin = true` so platform templates can be edited directly by the owner.
    - Updated `useBuilderAutosave` and `BuilderEditor.tsx` with dynamic template ID tracking and browser history synchronization.
  - **Verification**:
    - `php artisan test`: 92 passed (766 assertions), including new tests for repeated platform template customization and superadmin editing.
    - `npx tsc --noEmit`: 0 errors.
    - `npm run test:builder-editor`: passed (100%).
    - `npm run build`: Vite production build succeeded in 4.22s.

- VS Code-Style Editor Bottom Status Bar & Top Toolbar De-cluttering (D-046):
  - **VS Code-Style Bottom Status Bar (`BuilderFooterBar.tsx`)**:
    - Docked a 30px (`h-7.5`) high-density bottom bar along the base of the Visual Builder window.
    - Integrated dynamic DOM hierarchy breadcrumbs (`Page > Section > Row > Column > Button`) with 1-click ancestor selection, total element counter, and lock badge.
    - Segmented responsive viewport switcher (`Desktop`, `Tablet`, `Mobile`) with screen dimension tags (`1200px+`, `768px`, `375px`).
    - Integrated zoom controls (`- 80% +`), Global Code modal trigger, Live Preview trigger, and cloud autosave status indicator (`Saved`, `Saving...`, `Unsaved`, `Retry`).
  - **Top Toolbar De-cluttering (`BuilderToolbar.tsx`)**:
    - Removed colliding center `absolute left-1/2` container that overlapped with the Global Header and Footer dropdown buttons.
    - Top toolbar now has spacious breathing room for project identity, theme layout buttons, undo/redo, draft saving, and publishing.
  - **Keyboard Shortcuts Dialog (`KeyboardShortcutsModal.tsx`)**:
    - Created modal detailing shortcuts for History, Editing, Hierarchy Navigation, and Canvas manipulation.
    - Bound `Ctrl+/` shortcut to quickly toggle the dialog from anywhere in the editor.
  - **Verification**:
    - `npx tsc --noEmit`: 0 errors.
    - `npm run test:builder-editor`: passed (100%).
    - `npm run build`: Vite v6.1.1 production build succeeded in 4.42s.
    - `php artisan test`: 92 passed (755 assertions).

- In-Builder Global Header & Footer Selector, Design Catalog Expansion & Canvas Preview (D-045):
  - **In-Builder Header & Footer Selection**:
    - Relocated Global Header and Footer selection from Website Settings into the Visual Builder toolbar (`BuilderToolbar.tsx`).
    - Added active header and footer design name indicators with quick-picker buttons and a Page Blueprints trigger.
    - Built interactive `ThemeLayoutPickerModal.tsx` with Header, Footer, and Blueprint tabs, displaying live wireframe mockups, platform badges, description, active checkmarks, and 1-click selection.
    - Created backend route `PATCH builder/pages/{page}/theme-layout` (`BuilderPageController::updateThemeLayout`) updating `header_template_id` and `footer_template_id` with optimistic frontend updates.
    - Replaced dropdown selects in Website Settings (`settings/website.tsx`) with a callout card explaining in-builder selection and linking to the builder.
  - **Design Catalog Expansion (`DefaultTemplateFactory.php`)**:
    - Expanded platform catalog to 13 responsive, schema-validated templates:
      - 4 Headers: Main Navigation Header, Centered Minimal Header, Dark Modern Glow Header (`dark-modern-glow-header` with glowing cyan HelloWeb mark), Floating Glassmorphism Pill Header (`floating-pill-header`).
      - 5 Footers: Multi-Column Footer, SaaS Newsletter Footer (`saas-newsletter-footer`), Minimal Clean Footer, Centered Brand Footer (`centered-brand-footer`), Dark Mega Footer (`dark-mega-footer`).
      - 4 Blueprints: Modern Landing Page, Agency & Portfolio Blueprint (`agency-portfolio-blueprint`), SaaS Product Blueprint (`saas-product-blueprint`), Blank Canvas Blueprint (`blank-canvas-blueprint`).
    - Added brand assets to `public/images/helloweb-logo-dark.png` and `public/images/helloweb-logo-light.png`.
    - Auto-seeding by unique `slug` ensures all platform templates are guaranteed in the database.
  - **Live Canvas Header & Footer Preview (`BuilderCanvas.tsx`)**:
    - `BuilderCanvasView` renders the active Global Header above page content and active Global Footer below page content using `BuilderRenderer` and `ReadOnlyCanvasNode`.
    - Floating hover control badge provides the active template name, a "Change Design" button that re-opens the picker modal, and a "Customize ↗" link opening the template editor in a new tab.
  - **Verification**:
    - Unit tests: `tests/Unit/DefaultTemplateFactoryTest.php` passing (28 assertions).
    - Feature tests: `tests/Feature/Builder/ThemeTemplateTest.php` passing 8 tests (65 assertions).
    - Full PHPUnit suite: `php artisan test` passing 92 tests (755 assertions).
    - Typecheck: `npx tsc --noEmit` passing with 0 errors.
    - Build: `npm run build` passing in 4.88s.

- Superadmin Platform Admin Panel & Global Platform Catalog (D-044):
  - **Superadmin Gating & Security Middleware**:
    - Created `EnsureUserIsSuperAdmin` middleware and registered `'superadmin'` route alias.
    - Gated `builder/import/*` and `/admin` routes strictly to superadmins (`is_superadmin = true`). Non-superadmins receive `403 Forbidden`.
    - Gated import triggers in the UI (`ImportModal`, `BuilderEditor`, `templates/index`, `reusable-components/index`, `dashboard`) so standard users cannot upload templates or components.
    - Protected public site slug regex with negative lookahead for `admin`.
  - **Global Platform Catalog (`is_platform`)**:
    - Applied migrations `2026_09_27_000001` and `2026_09_27_000002` adding `is_platform` boolean flag to `templates` and `reusable_components`, and `header_template_id`/`footer_template_id` to `websites`.
    - Created starter platform reusable blocks via `DefaultReusableComponentFactory` (Hero Banner Block, Feature 3-Column Grid, Call To Action Banner, Testimonial Spotlight).
    - `TemplatePersistenceService` and `ReusableComponentService` automatically pull platform resources (`is_platform = true`) alongside user-owned resources into builder libraries and settings selectors.
    - Prevented standard users from deleting or archiving platform items (`delete` policy and `abort(403)`).
    - Platform template customization auto-forks a private user copy upon modification.
  - **Platform Admin Dashboard (`/admin`)**:
    - Built `AdminPlatformController` and `resources/js/pages/admin/index.tsx` (Platform Owner Mode).
    - Real-time catalog metrics: total templates, platform templates, reusable components, websites, active headers/footers/pages.
    - Live platform status toggle switches for templates and reusable components with instant feedback.
    - Embedded ZIP package uploader modal for superadmins to ingest new components and templates into the platform catalog.
    - Prominently accessible via sidebar under `ADMINISTRATION -> Platform Admin` exclusively for superadmins.
  - **Verification**:
    - `php artisan test`: 92 passed (721 assertions).
    - `php artisan test tests/Feature/Builder/AdminPlatformTest.php`: 8 passed (53 assertions).
    - `php artisan test tests/Feature/Builder/DesignImportTest.php`: 4 passed (17 assertions).
    - `php artisan test tests/Feature/Builder/ThemeTemplateTest.php`: 7 passed (59 assertions).
    - `npm run test:builder-editor`: passed (100%).
    - `npx tsc --noEmit`: 0 errors.
    - `npm run build`: Vite v6.1.1 production build succeeded in 4.63s.

  - **Reusable Blocks (`resources/js/pages/reusable-components/index.tsx`)**:
    - Added one-click clear button (`X`) inside the search input.
    - Added `Trash2` archive/delete action button on each component card header with browser confirmation prompt.
    - Integrated with `builder.reusable.archive` endpoint with real-time Inertia partial reload (`only: ['components']`).
  - **Templates (`resources/js/pages/templates/index.tsx`)**:
    - Added one-click clear button (`X`) inside the search input.
    - Added `Trash2` archive/delete action button in the template card footer with confirmation prompt.
    - Integrated with `builder.templates.archive` endpoint with real-time Inertia partial reload (`only: ['templates']`).
  - **Media Library (`resources/js/pages/media/index.tsx`)**:
    - Added one-click clear button (`X`) inside the search bar.
    - Added `Trash2` delete action buttons on the image thumbnail hover overlay and in the card metadata action row.
    - Integrated with `builder.media.archive` endpoint with real-time Inertia partial reload (`only: ['assets']`).
  - **Pages & Websites (`resources/js/pages/pages/index.tsx`, `resources/js/pages/websites/index.tsx`)**:
    - Added one-click clear button (`X`) inside the search inputs for smooth query resetting.
  - Verification: `npm run build` succeeds (6.85s); all 92 PHP tests pass (606 assertions).

- Visual Builder Navigation Streamlining & Reusable Component Sync (D-043):
  - Streamlined Launch Builder Triggers:
    - Removed redundant bottom "Visual Studio" promo card from `resources/js/components/app-sidebar.tsx`.
    - Removed redundant "Sparkles" `/builder` button from `resources/js/components/app-sidebar-header.tsx`.
    - Cleaned up navigation flow so the user has an intentional, single primary action button at the top of the sidebar.
  - In-Builder Reusable Component Real-Time Synchronization:
    - In `resources/js/builder/editor/BuilderEditor.tsx`, managed `availableReusable` and `availableTemplates` in active component state with automatic prop synchronization.
    - Added `refreshReusableDefinitions()` and `refreshTemplateDefinitions()` that query endpoints directly upon import completion.
    - Updated `ImportModal.tsx` and `BuilderEditor.tsx` `onSuccess` hook to dynamically fetch and populate the left panel library without requiring a browser refresh or canvas unmount.
  - Verification: `npm run build` succeeds cleanly in 4.34s; all 92 PHP tests pass (606 assertions).

- Settings UI Redesign, Section Structure & Complete Dark Mode Fix (D-042):
  - Settings Layout (`layout.tsx`):
    - Redesigned with category groups (`ACCOUNT`, `WEBSITES & DEFAULTS`), expandable structure ready for future extensions.
    - Each menu item features dedicated icon containers (`bg-muted/70` / `bg-primary`), item title, description sub-label, and active indicators.
    - Fully dark-mode themed using `--card`, `--border`, `--foreground`, and `--muted-foreground` instead of hardcoded white/neutral.
  - Profile Settings (`profile.tsx`):
    - Added user avatar badge chip displaying user initials/avatar and email.
    - Added input field icons (`User`, `Mail`) and rounded-xl input controls.
    - Animated green check save confirmation.
  - Password & Security (`password.tsx`):
    - Added "Encrypted Storage" status badge.
    - Added security icons (`KeyRound`, `Lock`) and styled password inputs with full dark mode contrast.
  - Website Settings (`website.tsx`):
    - Added "Live Configuration" badge.
    - Added field icons for site name, browser tab title, description, favicon, and homepage.
    - Live image preview for favicon URL.
    - Modern styled select element that renders dark popover options in dark mode.
  - Danger Zone / Delete Account (`delete-user.tsx`):
    - Replaced bright pink/red container with a theme-aware destructive alert card (`border-destructive/20 bg-destructive/5 dark:bg-destructive/10`).
    - Added `AlertTriangle` warning badge, clear typography, and rounded dialog modal.
  - Verification: `npm run build` succeeds (4.10s); all settings tests pass; all 92 PHP tests pass (606 assertions).

- External Design Import System (D-041):
  - Architecture: Strict distinction between ONLY TWO import types (`Component` and `Template`).
  - Backend Ingestion Pipeline (`app/Builder/Import/`):
    - `ZipPackageExtractor`: Safely extracts archives with directory traversal protection, indexing HTML, CSS, JS, and image/media assets.
    - `DependencyDetector`: Identifies and deduplicates Google Fonts, Font Awesome, Swiper, GSAP, etc., into page `globalHeadCode` or `globalFooterCode`.
    - `CssScoper`: Isolates stylesheets to `[data-hw-component="{scopeId}"]` and rewrites asset `url(...)` to stored media URLs.
    - `HtmlDomNormalizer`: Converts DOM nodes into authentic `BuilderComponentNode` document trees (sections, containers, headings, paragraphs, buttons, links, images, cards), extracts editable props, and formats styles according to framework schema.
    - `DesignImportService`: Ingests assets into `MediaAsset`, persists components to `ReusableComponent` and templates to `Template`.
    - `ImportController`: Exposes `builder.import.analyze`, `builder.import.component`, and `builder.import.template`.
  - Frontend Modal & 5 User-Facing Entry Points:
    - Unified `ImportModal.tsx` with type selector, drag-drop ZIP uploader, analysis inspection, editable properties count, external scripts check, and execution progress.
    - Visual Builder Top Toolbar: Added "Import" button with `UploadCloud` icon.
    - Visual Builder Left Library Panel: Added "Import Component / Template" dashed upload card.
    - Main Navigation Sidebar (`app-sidebar.tsx`): Added dedicated "Import" menu item.
    - Templates Index (`/templates`): Added "Import Template" button.
    - Reusable Blocks Index (`/reusable-components`): Added "Import Component" button.
    - Dashboard Overview (`/dashboard`): Added "Quick Import" header action button.
  - Settings Appearance Cleanup:
    - Removed redundant "Appearance" tab from `resources/js/layouts/settings/layout.tsx` sidebar navigation.
  - Verification: `npm run build` succeeds cleanly; `tests/Feature/Builder/DesignImportTest.php` passing; all 92 PHP tests pass (606 assertions). All changes remain local.

- Builder canvas breakpoint-driven navbar and image-feature responsiveness (D-039):
  - Root cause: `navbarRenderer` and `imageFeatureRenderer` gated visibility/structure behind `@media (max-width: 768px)`, which evaluates against the builder browser window (always wide), so the 375px Mobile canvas still rendered desktop navigation and side-by-side image features; only preview/published showed the mobile layout.
  - Fix: both renderers now branch on `context.breakpoint` (the framework responsiveness model, matching gallery from D-036) — at mobile, desktop links and header CTA get `display: none`, the hamburger gets `display: inline-flex`, and image-feature forces `flex-direction: column` with `gap: 24px`; the `@media` blocks are removed from both (gallery keeps its scoped public-site media queries per D-036).
  - Drawer behavior unchanged: `CanvasNode.tsx` and `public-site.tsx` already toggle the menu by writing `menu.style.display` directly on hamburger click; the retained `.hw-navbar-mobile-menu.is-open` rule is now unconditional (non-viewport).
  - Intentional alignment: preview at exactly 768px (iPad portrait) now shows desktop/tablet navigation instead of the hamburger, matching what the builder Tablet canvas already showed.
  - Cleanup: removed dead `renderLucideSvg` (defined, never called — leftover from earlier uncommitted icon work) so `built-ins.ts` lints clean.
  - Verification: `npx tsc --noEmit` clean; `npm run test:builder-editor` passed (new mobile/tablet/desktop navbar markup assertions and image-feature `row-reverse` vs `column` stacking assertions, all asserting no `@media` output); changed files lint clean; `npm run build` succeeded; all 92 PHP tests passed (592 assertions; 57 pre-existing PDO deprecations) — no PHP change needed since public pages render through TS only.

- Background Transparency Color Editing with `react-best-gradient-color-picker` (D-038):
  - Alpha is stored inside the existing `backgroundColor` string as `rgba(r, g, b, a)` — no new style key and no TS/PHP schema changes; both validators already accepted `rgba(...)`.
  - New `BackgroundColorField` opens the picker from a swatch trigger (checkerboard chip + hex + alpha %) in a new Radix popover primitive (`components/ui/popover.tsx`); the picker is lazy-loaded so it never executes during SSR editor tests and splits into its own async Vite chunk.
  - Advanced-background components bind solid/image/video modes to `backgroundColor` and gradient mode to `backgroundGradient` (the raw gradient text input is gone); the picker's internal Solid/Gradient buttons stay hidden so the Background type select remains the single mode controller.
  - Shared helpers `parseColor` / `toRgbaString` / `toHexColor` / `alphaPercent` / `isGradientValue` added to `style.ts`; recent-colors moved to `recent-colors.ts` and extended to remember `rgba(...)`; fixed `normalizeColor` collapsing rgba to `#000000` and `normalizeHexInput` prefixing `#` onto `rgba(...)`.
  - Picker dark mode pinned to the app `.dark` class (the library otherwise follows `prefers-color-scheme`).
  - Verification: `npx tsc --noEmit` clean; `npm run test:builder-editor` passed (helper round-trips, rgba/gradient validation, navbar rgba + backdrop-blur render assertions); `npm run build` succeeded with the picker in a lazy chunk; all 92 PHP tests passed including the new rgba background + blur render test. Repo-wide `npm run lint` still reports 45 pre-existing problems that also fail at HEAD; every changed file lints clean. All changes remain local.


- Document Autosave Conflict (409) & Publish Race Condition Fix (D-037):
  - Root Cause:
    - In `BuilderEditor.tsx`, `handlePublish` previously called `await save.saveNow()` followed immediately by `fetch(route('builder.pages.publish', pageId))`. Because `saveNow` used `schedule(0)` without returning a promise, `publish` ran concurrently with the scheduled `PATCH` request.
    - The backend `publishPage` saved the draft and incremented `document_version` from $N$ to $N+1$. When the concurrent `PATCH` arrived with `expected_version: N`, `saveDraft` correctly rejected it with `StaleDocumentException` (409 Conflict).
    - `use-builder-autosave.ts` did not capture the latest version returned in the 409 error payload (`payload.save.version`), causing subsequent `Retry` clicks to continue sending the stale expected version, locking the editor into a conflict loop.
  - Solution:
    - Updated `useBuilderAutosave` to synchronize `versionRef.current` and state `version` to `payload.save.version` whenever a 409 Conflict occurs.
    - Updated `retry()` to immediately re-flush with the updated server version, clearing the error on retry.
    - Made `flush()` and `saveNow()` return a `Promise<boolean>` that properly awaits in-flight saves before resolving, and added `cancelPending()` to cancel debounced timers.
    - Updated `BuilderEditor.tsx`: `handlePublish` cancels pending autosaves, directly posts the document to `publish`, and uses `save.sync(state.document, newVersion)` with the returned version upon completion. `handleSaveAndLeave` awaits `saveNow()`.
  - Verification: `npm run test:builder-editor` passed, `npm run build` succeeded in 3.71s, and all 90 PHP tests passed. All changes remain local.

- Icon Pack System, Button/List/FeatureBox Icons, ImageFeature Layout & Card Container, and Gallery Device-Specific Columns (D-036):
  - Icon Pack System (`icon-pack.ts`, `IconPicker.tsx`):
    - Created an 80+ icon library categorized into Navigation, Actions, Communication, Business, Media, and UI with Lucide-compatible SVG vectors, searchable tags, and categories.
    - Built an interactive `IconPicker` modal dialog featuring instant search, category pill filters, an icon grid with hover previews, and a dedicated "Custom Icon" tab supporting raw `<svg>` code and external image/icon URLs.
  - Button Icons (`content.button`):
    - Added `icon`, `customIcon`, `iconPosition` ('left' | 'right'), `iconSpacing`, `iconSize`, and `showIcon` to component prop schema in PHP (`BuiltInComponentDefinitions.php`) and TypeScript (`built-ins.ts`).
    - Added dedicated Button inspector controls with Button Text, Link URL, `IconPicker`, Left/Right position toggle, and Size selection.
    - Updated `buttonRenderer` in `built-ins.ts` and `LinkRenderer.php` to render inline-flex icons and text with clean spacing.
  - List Icons (`content.list`):
    - Added `listType` support for `'icon'` alongside `'check'`, `'bullet'`, and `'number'`. Added `icon`, `customIcon`, `iconColor`, and `iconSize` to schema.
    - Integrated `IconPicker` into List inspector controls and updated `listRenderer` to render custom icons with customizable color and size.
  - Feature Box (`marketing.blurb`):
    - Upgraded Feature Box with `IconPicker` supporting all 80+ icons and custom SVG/URLs. Added `iconPosition` ('top' | 'left') and `iconShape` ('rounded' | 'circle' | 'square' | 'none') controls.
  - Image Feature (`marketing.imagefeature`):
    - Expanded `imagePosition` to support `left`, `right`, `top`, and `bottom` with segmented selector buttons in the inspector.
    - Added "Display as Card Container" toggle (`cardStyle`) applying elegant card border, background, rounded corners, padding, and subtle shadow.
    - Added show/hide toggle switches and editable inputs for each sub-element (Eyebrow / Badge, Heading, Description / Paragraph, and CTA Button) allowing users to easily hide or clear any element.
  - Responsive Gallery Settings (`media.gallery`):
    - Added device-specific columns (`columnsDesktop`, `columnsTablet`, `columnsMobile`) and gap (`gapDesktop`, `gapTablet`, `gapMobile`) to schema.
    - Built responsive device grid controls in `ComponentInspector` that highlight the active device breakpoint (`desktop`, `tablet`, `mobile`).
    - Updated `galleryRenderer` to use active breakpoint values in the builder canvas and scoped media queries (`@media (max-width: 1024px)` and `@media (max-width: 640px)`) on the public site so device changes don't overwrite user settings.
  - All test suites run and verified passing: 90 PHP tests passed (588 assertions), TypeScript check (`npx tsc --noEmit`) passed with 0 errors, builder editor tests passed, and Vite production build (`npm run build`) succeeded in 3.63s. All changes remain strictly local per user instructions.

- Document Validation, Media Manager Integration across All Image Elements, and Inspector Fixes (D-035):
  - 422 Autosave Validation Fix (`BuiltInComponentDefinitions.php`, `built-ins.ts`, `DocumentPersistenceValidator.php`, `StyleSchema.php`, `style.ts`):
    - Added missing `links` array schema to `layout.navbar`, `items` array schema to `content.list`, and `images` array schema to `media.gallery` across PHP and TypeScript component definitions to satisfy strict property validation in `DocumentPersistenceValidator`.
    - Added directional border styles and colors (`borderTopStyle`, `borderRightStyle`, `borderBottomStyle`, `borderLeftStyle`, `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor`) to `StyleSchema.php` and `style.ts`.
    - Added shorthand expansion support for `borderStyle` and `borderColor` in `DocumentPersistenceValidator.php` and `validateStyles` in `style.ts` so all border side properties pass persistence validation.
    - Updated `layout.root` allowed child types to include `layout.navbar` so website headers can be positioned directly at root level or within sections.
    - Updated `marketing.blurb` and `content.list` `styleCapabilities` to include flex properties (`flexDirection`, `alignItems`, `justifyContent`, `gap`).
  - Media Manager Integration Across All Image Elements (`BuilderEditor.tsx`, `ComponentInspector.tsx`, `NodeActionsOverlay.tsx`):
    - Extended `mediaManagerTarget` to support `brandLogo`, `imagefeature`, `gallery`, and `gallery-replace`.
    - Integrated "Choose from Media Manager" buttons and live preview thumbnails across `layout.navbar` (Brand Logo), `marketing.imagefeature` (Feature Image), `media.gallery` (both "+ Add from Media" and item-level replace), and any generic `src`/`imageSrc`/`brandLogo` inspector fields.
    - Enhanced Canvas node action overlay to trigger media replacement for `marketing.imagefeature` nodes.
  - Inspector Layout Overflow Fix (`ComponentInspector.tsx`):
    - Fixed Navigation Links and Gallery image input overflow by applying `min-w-0 flex-1` and `shrink-0` to flex input rows, keeping all text inputs neatly within panel boundaries.
  - All test suites run and verified passing: 90 PHP tests passed (588 assertions), TypeScript check (`npx tsc --noEmit`) passed with 0 errors, builder editor tests passed, and Vite production build (`npm run build`) succeeded in 3.46s. All changes remain strictly local per user instructions.

- Void Element Safeguards, Pre-built Layout Templates Modal, and Essential Component Expansion (D-034):
  - Void Element Safeguards (`CanvasNode.tsx`, `public-site.tsx`): `<hr>` (divider) and `<img>` (image) wrapped in container elements with overlay attachments to prevent React void element children errors. Non-paragraph HTML wrappers use `div.contents` rather than `span` to avoid hydration violations.
  - Canvas Viewport Contrast & Empty Guide (`BuilderCanvas.tsx`, `CanvasNode.tsx`): Canvas background set to `#eaecf0` (`dark:bg-[#12151b]`), page container `min-h-fit`, bottom scroll padding added, and an empty section guide with dashed borders and instructions displayed for newly added sections. Removed `layout.flex` from the elements palette.
  - Pre-built Layout Templates Modal (`LayoutTemplatesModal.tsx`, `BuilderEditor.tsx`, `BuilderLeftPanel.tsx`, `BuilderElementsPanel.tsx`): Clicking `Columns` or `Grid` opens a responsive template picker with 8 column layouts (50/50, 66/33, 33/66, 33/33/33, 25/50/25, 4-col, 5-col, 6-col) and 5 grid layouts (2x2 cards, 3-col cards, 4-col metrics, Bento 1+2, Bento banner+3). Safely creates or targets a section, generates collision-free node IDs, and commits through `run()` with undo/redo and autosave.
  - 5 New Built-In Components (`built-ins.ts`, `BuiltInComponentDefinitions.php`, `built-ins.ts` (renderer), `BuiltInRendererDefinitions.php`, `component-icons.tsx`, `ComponentInspector.tsx`, `public-site.tsx`):
    - `layout.navbar` (Header & Navigation): brand logo/name, desktop links, CTA button, mobile hamburger toggle, and collapsible drawer.
    - `marketing.blurb` (Feature Box): icon badge (sparkles, zap, shield, star, heart, check, rocket, award), title, description, and link.
    - `content.list` (Styled List): checkmarks, bullets, or numbers with custom colors and multi-line item editing.
    - `marketing.imagefeature` (Image Feature): split layout with badge, heading, copy, CTA, and image (left/right position).
    - `media.gallery` (Image Gallery): responsive CSS grid with interactive full-screen lightbox preview, captions, keyboard navigation, and close button.
  - All test suites run and verified passing: 89 PHP tests passed (587 assertions), TypeScript check (`npx tsc --noEmit`) passed with 0 errors, builder editor tests passed, and Vite production build (`npm run build`) succeeded in 3.54s. All changes remain strictly local per user instructions.


- Dynamic Homepage Routing, Draft vs. Published Separation, and Builder Publishing Controls (D-033):
  - Dynamic Homepage & Public Routing (PublicSiteController.php, outes/web.php): configured GET / to dynamically load the website's designated homepage_page_id and render its published_document. Fallbacks safely handle unconfigured or deleted homepages. Added dynamic public slug routing (GET /{slug}) guarded with negative lookahead constraints against application routes.
  - Draft vs. Published Separation (Page.php, 2026_09_25_000001_add_publishing_to_pages_table.php): separated draft_document from published_document, added published_at timestamp, and status helpers (isPublished(), hasUnpublishedChanges()). Builder edits affect draft only until published.
  - Builder Publishing & Management Controls (BuilderToolbar.tsx, BuilderEditor.tsx, pages/index.tsx): added Save Draft and Publish action buttons and dynamic status indicator pill (Draft vs Published) to the Builder toolbar header without altering visual builder layout or inspector. Added Publish and Unpublish toggle actions and status badges to the Pages management UI (/pages).
  - Auto-create & publish default Home page on website creation with clean HelloWeb hero and homepage_page_id link.
  - All 89 PHP tests (including 9 end-to-end publishing tests) and frontend builder editor tests pass cleanly with zero regressions.
- Clean light SaaS application redesign outside the visual builder (D-032):
  - Global CSS tokens & system (`resources/css/app.css`, `use-appearance.tsx`): soft off-white background (`#F4F6F9`), pure white card surfaces (`#FFFFFF`), deep forest green primary (`#134E35`), crisp borders, 18px radius (`rounded-[18px]`/`rounded-[22px]`), light mode default for non-builder application. Isolated `.builder-editor` styles completely.
  - Global layout & shell (`app-sidebar.tsx`, `nav-main.tsx`, `app-sidebar-header.tsx`, `app-logo.tsx`, `user-info.tsx`): light white sidebar with `MENU` and `GENERAL` groupings, emerald icon badges, `+ Launch Builder` top CTA, bottom forest green Visual Studio banner, header search pill (`âŒ˜ F`), quick builder button, notification bell with live ping, and user profile block.
  - Rebuilt Dashboard (`dashboard.tsx`): deep forest green highlight KPI card with circular `â†—` button, 3 clean white metric cards, weekly activity bar chart, spotlight project card with "Launch in Studio" action, clean projects list, recent pages table with direct 1-click builder edit, and circular SVG publishing health indicator.
  - Rebuilt Resource & Management pages (`websites/index.tsx`, `pages/index.tsx`, `templates/index.tsx`, `media/index.tsx`, `reusable-components/index.tsx`, `admin-resource-page.tsx`): clean white cards (`rounded-[20px]`/`rounded-[22px]`), filter pill tabs, search inputs, and live dot status badges.
  - Settings, Welcome & Auth: modernized `settings/layout.tsx`, `profile.tsx`, `password.tsx`, `website.tsx`, `welcome.tsx`, `auth-simple-layout.tsx`, and `auth-card-layout.tsx`.
  - Visual Builder boundary: 100% untouched. Builder components, canvas, inspector, toolbar, left panel, styles, and tests preserved with zero regressions.
- Left panel tab layout, split view cleanup, max width inspector controls, and dimensions preset grid (D-031):
  - Left panel tabs & split view removal (`BuilderLeftPanel.tsx`): arranged all 4 tabs ("Elements", "Layers", "Library", "Media") into an exact `grid grid-cols-4 gap-1 w-full` layout so that at 300px panel width, both icon and label text are fully visible without truncation. Removed split view dual-stack rendering so clicking "Elements" renders only the elements panel full-height without showing layers underneath it.
  - Max width & dimensions inspector controls (`ComponentInspector.tsx`, `built-ins.ts`, `BuiltInComponentDefinitions.php`): added `'maxWidth'` capability to `layout.section` in PHP and TypeScript registries. Promoted `Max Width (Max W)` to the primary 2-column dimensions grid alongside `Width (W)`, `Height (H)`, and `Min Height (Min H)`.
  - Dimensions input & preset layout fixes (`ComponentInspector.tsx`): integrated `CompactDimensionInput` into a unified input-with-suffix container with a compact 40px (`w-10`) unit selector, eliminating squashed inputs and fixing "auto" label truncation. Replaced flex preset buttons with a rigid `grid grid-cols-4 gap-1 w-full` preset grid (`100%`, `Auto`, `320px`, `640px`) that stays strictly within the card boundary and never overlaps.
- Canvas drag reordering, zoom reflow, and studio dashboard redesign (D-030):
  - In-canvas drag & drop reordering (`CanvasNode.tsx`, `DropTargetOverlay.tsx`, `BuilderEditor.tsx`): stopped event bubbling on `onDragStart` to prevent ancestor container hijacking, added native dataTransfer payloads, upgraded drop resolution for leaf and container elements, added directional blue insertion lines for before/after modes, and called `commitDocument` on drop for full undo/redo and autosave tracking.
  - Canvas zoom & desktop reflow (`BuilderToolbar.tsx`, `BuilderCanvas.tsx`, `BuilderEditor.tsx`): added zoom controls to the top toolbar (50%, 75%, 80%, 90%, 100%, 125%) with default 80% on desktop to prevent narrow tablet wrapping on laptop screens while preserving true desktop proportions.
  - Complete dashboard & workspace redesign (`app-sidebar.tsx`, `app-header.tsx`, `dashboard.tsx`, `admin-resource-page.tsx`, `websites/index.tsx`, `pages/index.tsx`, `templates/index.tsx`, `media/index.tsx`, `reusable-components/index.tsx`): removed "Repository" and "Documentation" starter-kit links, organized sidebar into structured workspace groups with a prominent "Launch Builder" button, redesigned the dashboard with studio hero banner, color-accented KPI cards, active projects grid with mini browser chrome, recent pages quick launch, template blueprints, and modernized all workspace resource pages.
- Redesigned builder header, canvas fit, draggable panels, and unsaved changes modal (D-029):
  - Redesigned top header toolbar (`BuilderToolbar.tsx`) with Google UI aesthetics: site globe icon + breadcrumbs (`Website / Page Name`) with dropdown chevron, Google Docs-style cloud save status indicator, center segmented device switcher pill, and a back button that redirects directly to `/dashboard`.
  - Created custom `UnsavedChangesModal.tsx`: sleek warning modal prompting users when navigating away with unsaved edits, offering "Keep editing", "Discard & leave", or "Save & leave" (triggers auto-save before redirecting to `/dashboard`).
  - Added draggable / resizable side panels (`PanelResizeHandle.tsx`): smooth drag handles with real-time mouse tracking, min/max bounds clamping (left: 240px-520px, right: 260px-600px), active hover highlights, and double-click to reset default width.
  - Fitted desktop canvas edge-to-edge (`BuilderCanvas.tsx`): removed desktop outer padding (`p-0`) and margins so the page touches the top header, left panel, and right panel with zero gaps, preserving centered device frames for tablet and mobile viewports.
  - Fixed Effects control unselection bug (`ComponentInspector.tsx`, `style.ts`, `editor-operations.ts`): batched multi-property style updates and removals atomically in reducer state to prevent React state closure clobbering, added "None" preset and active-state highlights.
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
- Added builder-only clickability for Custom Code (D-024): `hasVisibleCodeContent()` in `render-result-utils.ts` detects code that renders nothing visible (empty/comments/style/script/meta only), and `CanvasNode` then applies an editor-only `min-height: 56px` plus a non-interactive dashed "Custom code" placeholder chip (`data-builder-code-placeholder`) so the element is selectable on canvas. Preview and production render through `public-site.tsx`/`PublicRenderNode`, which never emits the placeholder â€” verified by assertions that editor markup contains it and rendered HTML does not.
- Changed the `code.customcode` default `code` prop (TS + PHP registries) from `<div>Custom code</div>` to a comment-only `<style>` + `<script>` example, so a new element has no visible content leaking into preview; the editor chip covers clickability instead. Covered by a new PHP registry test and TS assertions (default has style/script, no div, is invisible per `hasVisibleCodeContent`, renders no "Custom code" text, and still shows the canvas chip).
- Fixed Custom Code placement (D-024): added `code.customcode` to `childRules.allowedTypes` of `layout.section` and `layout.row` in both registries, so the element can be dragged/inserted/moved directly into a Section or Row, not only Column (and the existing Container/Stack/Flex/Grid/Columns/Card lists already included it). Since drag/drop, insert, move, and `DocumentPersistenceValidator` all read the registry, one definition change covers every path; covered by TS `canAcceptChild` + `engine.move` assertions and PHP registry/engine tests.
- Made empty Custom Code layout-neutral in preview/production (D-024): both renderers now emit the wrapper `<div>` with `display: contents` when `hasVisibleCodeContent()` is false (helper moved to shared `builder/code-content.ts`, PHP mirror `App\Builder\Renderer\CodeContent`), removing the wrapper's box and its flex-gap slot (the extra height/width the user saw in preview) â€” unless the wrapper carries `metadata.className` or `metadata.customCss`, which keeps the box so author styles apply. The editor canvas forces `display: block` on the placeholder branch in `CanvasNode`, so the builder chip/min-height design is unchanged; verified by TS render + editor-markup assertions and a PHP `empty custom code wrapper is layout neutral` test.

## In Progress

- None.

## Blocked

- Local `.env` remains SQLite; migrations use portable Laravel schema APIs and native JSON columns, while MySQL remains the intended deployment database.

## Next Action

Start PHASE 10 â€” PREVIEW AND PUBLISHING. Do not implement deployment, domains, plugins, themes, collaboration, or undo/redo outside that milestone.

## Validation

All checks below were actually run on 2026-09-28 for D-051 and component parity:

- Unit & Schema tests: pass - `php artisan test tests/Unit/Builder/Registry/ComponentRegistryTest.php` (14 passed, 56 assertions; existing PHP 8.5 PDO deprecation notice)
- Full PHPUnit suite: pass - `php artisan test` (97 passed, 871 assertions; existing PHP 8.5 PDO deprecation notices)
- Typecheck: pass - `npx tsc --noEmit` (0 errors)
- Builder Editor tests: pass - `npm run test:builder-editor` (passed)
- Build: pass - `npm run build` (Vite built in 6.67s)
- Integration / E2E / Browser: not-run
- Production: n/a

## Git

Branch: master
Latest verified commit: 8448998 - feat(ui): redesign entire HelloWeb non-builder application to clean light SaaS design system
Dirty files: yes - all session work (D-038, D-039, and earlier milestones) remains uncommitted per the user's no-commit constraint
