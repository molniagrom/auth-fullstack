# Context7 MCP

This project includes a project-level Codex MCP configuration in `.codex/config.toml`.

Configured server:

- `context7`

Current setup:

- local stdio server
- started through `npx`
- no API key stored in the repository

Configured command:

```toml
[mcp_servers.context7]
command = "cmd"
args = ["/c", "npx", "-y", "@upstash/context7-mcp"]
```

Notes:

- This is a Windows-friendly setup.
- If you want higher rate limits later, add your API key locally in your own Codex config instead of committing it to the repo.
- Restart Codex after adding a new MCP server configuration.
