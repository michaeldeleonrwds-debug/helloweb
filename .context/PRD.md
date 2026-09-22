# Product Requirements

Updated: 2026-09-22

## Overview

Build an original website builder framework on a Laravel React Starter Kit. The framework will let authenticated users visually construct websites from our own component, layout, style, responsive, rendering, persistence, revision, template, media, publishing, and extension systems.

## Problem

Website builders often become either app-specific page editors or clones of existing platforms. This project needs durable framework primitives that can evolve without coupling pages, editor UI, rendering, and persistence into one brittle implementation.

## Users

- Site creators who visually build and publish websites.
- Developers who extend the builder with new components, controls, templates, and publishing capabilities.
- Administrators who manage websites, pages, media, revisions, and publishing state.

## Goals

- **FRM-001** - Establish our own builder framework boundaries and contracts.
- **CMP-001** - Define a generic component node model with stable IDs, type, props, styles, responsive overrides, children, metadata, and capabilities.
- **REG-001** - Provide a component registry for definitions, defaults, allowed children, controls, renderers, and capabilities.
- **ENG-001** - Build a framework-level engine for tree operations and editor state over time.
- **RND-001** - Render structured page documents separately from the editor UI.
- **STY-001** - Represent styles as structured data that can be resolved to renderable output.
- **RSP-001** - Support desktop, tablet, and mobile overrides with predictable inheritance.
- **PRS-001** - Persist websites, pages, page documents, revisions, templates, media, publishing state, and settings in MySQL.
- **EXT-001** - Leave room for future plugin/extension architecture.

## Non-goals

- **NG-001** - Do not build on WordPress concepts or implementation assumptions.
- **NG-002** - Do not clone Elementor, Webflow, or any other builder architecture.
- **NG-003** - Do not implement full builder functionality during the initial audit/foundation pass.
- **NG-004** - Do not normalize every visual component into its own database row unless later justified.

## User flows

- **UF-001** - Creator signs in, opens dashboard, selects a website/page, edits a structured page tree, previews, saves, and eventually publishes.
- **UF-002** - Developer registers a new component definition; the editor can insert it and the renderer can render it without changing core engine logic.
- **UF-003** - Creator changes viewport mode; style resolution shows inherited desktop styles plus tablet/mobile overrides.

## Functional requirements

- Page documents must carry a builder schema version.
- Component definitions must be registered and discoverable by type.
- Tree mutations must be framework-level operations, not ad hoc React state edits.
- Renderer must resolve components, props, styles, responsive overrides, and children from a page document.
- Persistence must support future document migrations and revision snapshots.

## Non-functional requirements

- TypeScript contracts should define frontend builder documents and registry definitions.
- PHP validation/value objects should protect persisted builder documents.
- Public rendering should remain lighter than the editor bundle.
- Tests should focus on contracts: document validation, registry behavior, tree operations, style resolution, responsive resolution, and persistence.

## Constraints

See `CONSTRAINTS.md`.

## Acceptance criteria

- **AC-001** - A capability is complete only when architecture, behavior, state, persistence where required, errors, tests, and docs are handled.
- **AC-002** - ContextOS reflects current architecture, roadmap, decisions, and validation status after each milestone.

## Open questions

- **OQ-001** - Confirm final local database target and credentials for MySQL; current `.env` uses SQLite.
- **OQ-002** - Decide whether builder domain code should start under `app/Builder` plus `resources/js/builder`, or another explicit module namespace.
