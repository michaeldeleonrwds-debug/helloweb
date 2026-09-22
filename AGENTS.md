# Project Agent Instructions

## Identity

This project is our own website builder framework built on a Laravel React Starter Kit.

It is not WordPress, Elementor, Webflow, or a clone of any visual builder. Those products may be studied only as references for common capabilities. Do not copy their architecture, internal assumptions, naming model, or WordPress-oriented concepts.

## Permanent Principles

- This project is a framework, not a CRUD application.
- Prefer extensible primitives over page-specific implementations.
- Keep builder engine, component system, renderer, editor state, layout, style, responsive behavior, persistence, templates, media, revisions, publishing, and extensions behind clear boundaries.
- Do not turn the builder into a folder of hardcoded React page components.
- Do not implement features simply because database CRUD is easy.
- Do not create abstractions without architectural justification.
- MySQL is the intended persistent source of truth, but page composition should use structured document/tree storage unless a normalized table is clearly justified.
- Public website rendering must not depend on the full editor UI.
- Responsive behavior is part of the builder model, not separate mobile/tablet pages.
- ContextOS `.context/` is the durable project memory. Update it at meaningful architecture or milestone boundaries.

## Development Method

Work in vertical framework milestones. A milestone is complete only when it creates a working architectural capability with appropriate state behavior, persistence where required, validation, and documentation.

Do not build the entire framework at once. Start with foundation, schema contracts, registry, tree operations, rendering, and editor state before advanced editor features.

## Definition Of Done

A capability is not done merely because a table, route, screen, API, placeholder, or React component exists.

A capability is done when:

- architecture boundaries are correct;
- behavior works end to end;
- state transitions are predictable;
- persistence works where required;
- errors are handled;
- tests cover the important contracts;
- implementation avoids unnecessary coupling;
- docs and ContextOS are updated.

## Repository Instructions

- Preserve starter authentication, settings, Inertia, Vite, Tailwind, and UI primitives unless a builder milestone explicitly requires changing them.
- Keep framework code organized by domain boundaries rather than Laravel default folders alone when that improves clarity.
- Record durable architectural choices in `.context/DECISIONS.md`.
- Keep `.context/STATUS.md` honest: never mark checks as passed unless they were run.
- Do not commit secrets or copy `.env` contents into documentation.
