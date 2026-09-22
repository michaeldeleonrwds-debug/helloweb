# Constraints

## MUST

- Treat this project as a website builder framework, not a page-specific app.
- Keep builder engine, component system, renderer, editor state, layout, style, responsive, persistence, templates, media, revisions, publishing, and extensions as separate architectural concerns.
- Preserve the Laravel React Starter Kit foundation unless a milestone explicitly replaces part of it.
- Use ContextOS `.context/` as durable project memory and keep it aligned with code.
- Use vertical framework milestones with explicit exit criteria.
- Prefer a structured document/tree model for page composition persistence.
- Keep public rendering independent from the full editor UI.
- Record durable architecture decisions in `DECISIONS.md`.

## MUST NOT

- Copy WordPress, Elementor, Webflow, or other builder architecture.
- Structure the framework around WordPress concepts.
- Turn framework capabilities into arbitrary database CRUD.
- Create one database row per visual component unless a future decision justifies it.
- Scatter hardcoded page-specific React components as the builder model.
- Treat desktop, tablet, and mobile as separate pages.
- Introduce mock or fake data into production paths.
- Commit secrets, tokens, or credentials to the repository.
- Skip tests or claim a check passed without running it.
