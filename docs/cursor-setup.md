# Cursor setup (Phase 0)

## Juno documentation (`@Docs`)

1. Open **Cursor → Settings → Indexing → Docs**.
2. **Add doc** → paste `https://juno.build/llms-full.txt` (primary corpus).
3. Add a second doc: `https://juno.build/llms.txt` (lighter index).

In chat, reference them when asking Juno-specific questions (e.g. Datastore, deploy).

## Juno MCP server

**Cursor → Settings → MCP → Add new server**

| Field   | Value |
|--------|--------|
| Name   | `junobuild` |
| Command | `npx` |
| Args   | `["-y", "junobuild-mcp-server"]` |

Authenticate if the server prompts for Juno credentials.

## Optional skills

If Juno publishes Cursor skills you want:

```bash
npx skills add junobuild/skills
```

## Acceptance checks

- A prompt like *“How do I list documents in a Datastore collection?”* returns `@junobuild/core`-aligned snippets when Juno docs are indexed.
- MCP tools such as `list_satellites` run from the agent panel after configuration.
