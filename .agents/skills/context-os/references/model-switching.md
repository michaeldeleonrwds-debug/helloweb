# Model switching — Claude ⇄ Codex ⇄ others

Load this when moving work between agents or models. ContextOS is model-independent: the
`.context/` files are the medium, so switching is just "save, then rehydrate elsewhere."
Narrative guide: [docs/MODEL_SWITCHING.md](../../../docs/MODEL_SWITCHING.md).

## Leaving a tool (save)

```
finish or checkpoint the current change
  → update STATUS.md (honest validation state)
    → write/refresh HANDOFF.md  (Next Exact Action, Do Not Redo)
      → record any new DECISIONS
        → commit (so state is in git history)
          → end session
```

## Entering a tool (rehydrate)

```
read the entrypoint (AGENTS.md for Codex/others, CLAUDE.md for Claude Code)
  → read .context/INDEX.md → STATUS.md → HANDOFF.md
    → verify git state and validation against reality
      → continue from Next Exact Action
```

See [context-recovery](context-recovery.md) for the full rehydration and reconciliation
procedure.

## Claude → Codex

- Before leaving Claude: STATUS + HANDOFF current, decisions recorded, committed.
- Ensure `AGENTS.md` exists at the repo root and points at `.context/` (see
  `adapters/codex/AGENTS.md`).
- In Codex: it reads `AGENTS.md` natively → follow it to `.context/INDEX.md` → STATUS →
  HANDOFF → verify → continue.

## Codex → Claude

- Before leaving Codex: same save routine (STATUS/HANDOFF/decisions/commit).
- Ensure `CLAUDE.md` exists and points at `.context/`, and the skill is installed (see
  `adapters/claude/CLAUDE.md`).
- In Claude Code: `SessionStart` restores context (optionally via a hook), or Claude reads
  `CLAUDE.md` → `.context/` → verify → continue.

## Any other agent

If the tool reads `AGENTS.md` (Cursor, Gemini CLI, OpenCode, Zed, Warp, Copilot, Aider,
…), the generic adapter works unchanged. If it reads a differently-named file, copy the
generic adapter's contents there. If it reads nothing, point it at `.context/INDEX.md`
manually — the files are plain Markdown.

## Why this is robust

Nothing in the handoff depends on a specific model "remembering" anything. The next agent
reconstructs the picture from files + git. That is the whole point: **model-independent
continuity**. Verified tool support is in
[docs/COMPATIBILITY.md](../../../docs/COMPATIBILITY.md).
