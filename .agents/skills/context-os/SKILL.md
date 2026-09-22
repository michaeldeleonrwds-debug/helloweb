---
name: context-os
description: >-
  Persistent project memory for AI coding agents. Use when starting a substantial
  new project or feature (generate a PRD, architecture, and plan), when a request is
  vague or sprawling (compile it into an execution spec first), when resuming work or
  switching between agents or models (restore state, or write a handoff before ending),
  before context compaction or a usage limit (snapshot what is expensive to reconstruct),
  and when delegating to sub-agents (build a minimal task packet). Maintains a portable
  .context/ directory (INDEX, STATUS, CONSTRAINTS, DECISIONS, PRD, PLAN, HANDOFF) as the
  durable source of truth so work survives context loss and model switches. Skip for
  trivial edits such as typos, renames, or spacing changes.
license: MIT
compatibility: >-
  Claude Code (native skill). The .context/ protocol and AGENTS.md adapters also work
  with OpenAI Codex, Cursor, Gemini CLI, OpenCode and other AGENTS.md-compatible agents.
metadata:
  version: 0.1.1
  project: ContextOS
  homepage: https://github.com/pokhrelboss/context-os
---

# ContextOS

Persistent project intelligence for AI coding agents. This skill is a **router**: it
tells you *when* to act and *which reference to read* for the details. Keep this file in
context; load a reference only when its situation applies.

## Prime directive

**Conversations are temporary. The repository is the durable memory.** Persist anything
that would be expensive to reconstruct into `.context/`. Never depend on chat history or
model memory for project truth.

## When to engage (thresholds)

Engage ContextOS for **substantial** work: a new project or product, a non-trivial
feature, a multi-step change, or any work you will hand off or resume later.

Do **not** engage for trivial requests — typo fixes, renames, spacing, a one-line change.
Do not create `.context/` or a PRD for these. ContextOS should feel proportionate, never
bureaucratic. When unsure, prefer a light touch and scale up only if the work grows.

## Routing table

| Situation | Do this | Reference |
| :-------- | :------ | :-------- |
| Substantial **new project** | Understand intent → improve request → PRD → architecture → plan → initial STATUS | [initialization](references/initialization.md) |
| **Vague / sprawling request** | Compile it into an execution spec before coding | [prompt-compiler](references/prompt-compiler.md) |
| Need a **PRD** (create or evolve) | Generate/update structured requirements with IDs | [prd-engine](references/prd-engine.md) |
| Working with **memory files** | Read/write `.context/` correctly | [project-memory](references/project-memory.md) |
| Deciding **how much to load** | Apply the L0–L3 budget; load least-sufficient | [context-budget](references/context-budget.md) |
| Finished meaningful work | Update `STATUS.md` at the boundary | [status-protocol](references/status-protocol.md) |
| Made an **architectural decision** | Record an ADR entry in `DECISIONS.md` | [decision-memory](references/decision-memory.md) |
| **Resuming**, or memory looks stale | Rehydrate and reconcile against reality | [context-recovery](references/context-recovery.md) |
| **Ending a session** / limit near | Write/refresh `HANDOFF.md` | [handoff-protocol](references/handoff-protocol.md) |
| **Switching model/agent** | Save state, hand off, resume elsewhere | [model-switching](references/model-switching.md) |
| Delegating to a **sub-agent** | Build a task packet; expect a result summary | [multi-agent-context](references/multi-agent-context.md) |
| Signs of **drift** | Stop, verify against code, repair memory | [context-drift](references/context-drift.md) |
| Before/after **compaction** | Snapshot first; recover cleanly after | [context-compaction](references/context-compaction.md) |

## Automatic lifecycle

```
NEW LARGE PROJECT   → initialize .context/
VAGUE LARGE REQUEST → compile the prompt
NEW PRODUCT         → PRD → architecture → plan → initial STATUS
SESSION START       → restore: INDEX → STATUS → HANDOFF → verify git
TASK COMPLETE       → update STATUS
NEW DECISION        → record in DECISIONS
BEFORE COMPACTION   → snapshot STATUS / DECISIONS / HANDOFF
SESSION END         → write HANDOFF
NEW AGENT           → rehydrate from .context/
```

The user should not need special commands for any of this. Optional `/context-*` commands
and a `contextos` CLI exist for convenience but are never required.

## Core operating rules

1. **Smallest sufficient context.** Load the least high-signal context needed to make the
   next decision correctly. More context is not better context. Start from
   `INDEX.md` → `STATUS.md`, then open only what the task needs.
2. **Repository reality wins.** When sources disagree, trust: current user instruction →
   actual code/tests → accepted decisions → PRD → architecture → status → handoff →
   archive. If a doc is stale, update it; don't blindly follow it.
3. **Persist at boundaries, not constantly.** Update `STATUS`/`DECISIONS`/`HANDOFF` at
   meaningful moments (phase/feature done, new blocker, decision, test run, commit,
   handoff, before compaction) — not after every small edit.
4. **Never fake validation.** Only report a check as passing if you ran it. Record real
   results in `STATUS.md`.
5. **Never persist secrets.** No API keys, tokens, passwords, or private data in
   `.context/`. See [SECURITY](../../SECURITY.md).
6. **Don't reverse decisions silently.** Read `DECISIONS.md` before architectural changes;
   supersede decisions explicitly, never delete them.
7. **Preserve intent.** When compiling prompts or writing PRDs, improve clarity and
   structure but do not invent product decisions the user didn't make. Ask only genuinely
   blocking questions.

## Getting `.context/` into a project

Scaffold the `.context/` files in any of these ways:
- run `npx github:pokhrelboss/context-os init .` (no clone needed), or `contextos init` if
  the CLI is on PATH;
- or create the files directly following
  [project-memory](references/project-memory.md) — the references fully specify every file,
  so no templates or network are required.

Existing project? Start with repository discovery — see
[context-budget](references/context-budget.md) and
[context-recovery](references/context-recovery.md) — before writing anything.

## Reference index

- [initialization](references/initialization.md) — new-project bootstrap
- [prd-engine](references/prd-engine.md) — PRD generation & evolution
- [prompt-compiler](references/prompt-compiler.md) — vague → execution spec
- [project-memory](references/project-memory.md) — the `.context/` files
- [context-budget](references/context-budget.md) — L0–L3 & discovery
- [status-protocol](references/status-protocol.md) — STATUS updates
- [decision-memory](references/decision-memory.md) — ADR entries
- [context-recovery](references/context-recovery.md) — rehydrate & reconcile
- [handoff-protocol](references/handoff-protocol.md) — HANDOFF
- [model-switching](references/model-switching.md) — Claude ⇄ Codex ⇄ others
- [multi-agent-context](references/multi-agent-context.md) — task packets
- [context-drift](references/context-drift.md) — detect & repair drift
- [context-compaction](references/context-compaction.md) — survive compaction
