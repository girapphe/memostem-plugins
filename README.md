# MemoStem plugins

This is the public distribution layer for MemoStem integrations. It lets
ChatGPT, Codex, Claude, and other MCP clients connect to the hosted MemoStem
service without publishing the private application repository.

The Git marketplace commands below install into Codex and Claude Code.
ChatGPT connects to the hosted remote MCP as a custom app; GitHub publication
alone does not list or activate a ChatGPT app.

## What is included

- A Codex marketplace and plugin manifest.
- A native Claude Code marketplace and plugin manifest.
- Five repository-aware skills for authorized MemoStem source maintainers.
- A remote MCP registration for `https://www.memostem.com/api/mcp`.
- Connection and privacy guidance in [docs/mcp.md](docs/mcp.md).
- A record of the initial extraction in [docs/provenance.md](docs/provenance.md).

The plugin does **not** include the MemoStem web/mobile source, MCP server
implementation, authentication code, database schema, migrations, credentials,
environment files, user data, or provider secrets. Installing it grants no
GitHub, Cloudflare, Clerk, Neon, database, or app-store access.

## Install in Codex

```bash
codex plugin marketplace add OkYongChoi/memostem-plugins --ref main
codex plugin add memostem@memostem
codex plugin list
```

Start a new Codex task after installation so the skills and MCP metadata load
from the installed snapshot.

To update or remove it:

```bash
codex plugin marketplace upgrade memostem
codex plugin add memostem@memostem
codex plugin remove memostem@memostem
```

## Install in Claude Code

```bash
claude plugin marketplace add OkYongChoi/memostem-plugins
claude plugin install memostem@memostem
claude plugin list
```

Run `/reload-plugins` in an active Claude Code session. The remote MCP entry is
discovered from the plugin's `.mcp.json`; run `/mcp` to inspect the connection
and complete OAuth when prompted.

To update or remove it:

```bash
claude plugin marketplace update memostem
claude plugin update memostem@memostem
claude plugin uninstall memostem@memostem
claude plugin marketplace remove memostem
```

## Included skills

- `memostem-card-hygiene`: dry-run-first graph/card hygiene auditing.
- `memostem-db-sync`: guarded static graph synchronization.
- `memostem-knowledge-graph`: graph taxonomy and content maintenance.
- `memostem-protected-release`: PR, CI, deployment, ancestry, and rendered
  release verification.
- `memostem-validation`: select and report the relevant repository gates.

These skills are useful only inside an authorized MemoStem source checkout
with its project dependencies and credentials configured. They describe safe
workflows; they do not carry repository access or secrets.

## Validate locally

```bash
npm run check
python3 /path/to/plugin-creator/scripts/validate_plugin.py plugins/memostem
claude plugin validate .
claude plugin validate plugins/memostem
```

The first command has no package dependencies and checks the public/private
boundary, both marketplaces, cross-platform metadata, skill manifests, MCP
endpoint, symlinks, and common secret patterns.

## Publication boundary

Only this repository is the public installation source. The private MemoStem
application repository remains the source of the hosted service and owns all
runtime behavior. A published manifest does not prove that the app, OAuth, or
provider-specific connection is active; verify those separately.
