<p align="center">
  <img src="assets/logo-mark.svg" alt="MemoStem logo" width="88" height="88">
</p>

# MemoStem for ChatGPT, Claude, and Codex

Let a connected AI client suggest one reusable idea at the right moment, then
turn only what you clearly accept into private, reviewable knowledge—without
uploading the whole conversation or auto-publishing anything.

[Use MemoStem](https://www.memostem.com/plugins) ·
[Connection guide](docs/mcp.md) ·
[Privacy](https://www.memostem.com/privacy) ·
[Terms](https://www.memostem.com/terms) ·
[Support](https://www.memostem.com/support) ·
[Security](SECURITY.md)

This public repository is the official distribution source for MemoStem's
Codex and Claude Code plugins and its hosted remote MCP connection metadata.
The MemoStem application and server implementation remain private.

## Why MemoStem

- **Get a timely suggestion.** In supported plugin clients, the assistant can
  name a reusable result and ask whether to keep it, so you do not need to
  remember a MemoStem or card command.
- **Select, don't scrape.** Send only the concise ideas you deliberately choose
  from the current conversation, never a transcript or hidden history.
- **Review before saving.** New material stays in a private pending inbox until
  you edit, merge, save, or ignore it.
- **Reuse confirmed knowledge.** Bring a bounded set of your approved knowledge
  back into a future AI task with provenance, not raw conversation history.

## Connect from an AI app

The production Streamable HTTP MCP endpoint is:

```text
https://www.memostem.com/api/mcp
```

### ChatGPT

Add MemoStem as an OAuth remote MCP app in a supported ChatGPT workspace. The
public [MemoStem connection page](https://www.memostem.com/plugins) explains the
privacy boundary and points signed-in users to the in-product setup guide.
GitHub publication alone does not list or activate a ChatGPT plugin.

### Claude

Add the same endpoint as a custom connector in Claude and complete MemoStem
OAuth. Claude can also load the Git marketplace below for Claude Code and
compatible plugin surfaces.

See [the MCP connection guide](docs/mcp.md) for provider-specific setup and
server-side OpenAI API usage.

## Consent-first proactive capture

Draft-authorized MCP clients receive guidance to make one brief save offer at a
natural stopping point when the current conversation produces a reusable
decision, explanation, procedure, correction, open question, or durable
preference. The installable plugin also includes an implicitly discoverable
`memostem-proactive-capture` skill with the same behavior.

The offer sends nothing and is not consent. The client may call a creation tool
only after a clear affirmative reply to that specific proposal or a direct
request identifying the current-conversation material. It must not repeat a
declined topic or propose sensitive, secret, credential, or do-not-retain
material. AI hosts decide whether and when to surface MCP instructions, so a
connection cannot guarantee an offer in every client.

## Install the Git plugin

### Codex

```bash
codex plugin marketplace add girapphe/memostem-plugins --ref main
codex plugin add memostem@memostem
codex plugin list
```

Start a new Codex task after installation so the installed snapshot loads.

### Claude Code

```bash
claude plugin marketplace add girapphe/memostem-plugins
claude plugin install memostem@memostem
claude plugin list
```

Run `/reload-plugins`, then `/mcp` to inspect the connection and complete OAuth
when prompted.

### Update or remove

```bash
# Codex
codex plugin marketplace upgrade memostem
codex plugin add memostem@memostem
codex plugin remove memostem@memostem

# Claude Code
claude plugin marketplace update memostem
claude plugin update memostem@memostem
claude plugin uninstall memostem@memostem
claude plugin marketplace remove memostem
```

## What the MCP exposes

- `create_knowledge_bundle_drafts`: create structured private drafts from an
  explicitly selected part of the current conversation.
- `create_card_drafts`: compatible concept-card draft creation.
- `get_topic_context`: retrieve a bounded pack of confirmed, owner-scoped
  knowledge when the connection has the separate read scope.

Draft creation cannot approve knowledge, publish to the public graph, or retain
a conversation transcript. See [the complete trust boundary](docs/mcp.md).

## Included skills

The user-facing `memostem-proactive-capture` skill provides consent-first save
suggestions when the packaged MCP connection is available.

The Git plugin also includes five guarded skills for authorized MemoStem source
maintainers:

- `memostem-card-hygiene`
- `memostem-db-sync`
- `memostem-knowledge-graph`
- `memostem-protected-release`
- `memostem-validation`

The five maintenance skills require an authorized MemoStem source checkout and
its separately configured dependencies and credentials. Installing this public
plugin grants no GitHub, Cloudflare, Clerk, Neon, database, or app-store access.

## Directory publication

- The remote server metadata is published from `server.json` to the official
  MCP Registry when a GitHub Release is published.
- Paste-ready OpenAI and Anthropic listing copy, prompts, review cases, and
  activation gates live in [docs/directory-submissions.md](docs/directory-submissions.md).
- Provider review and approval are external states. A public GitHub repository
  or a successful MCP Registry workflow does not prove an OpenAI or Anthropic
  directory listing is live.

## Validate locally

```bash
npm run check
python3 /path/to/plugin-creator/scripts/validate_plugin.py plugins/memostem
claude plugin validate .
claude plugin validate plugins/memostem
```

The dependency-free repository check validates both marketplaces, cross-platform
metadata, the complete skill trees, MCP Registry metadata, public/private
boundaries, symlinks, and common secret patterns.

## Publication boundary

Only this repository is the public installation source. It contains manifests,
instructions, static skills, and connection metadata—not the MemoStem web or
mobile source, MCP implementation, authentication code, database schema,
migrations, credentials, environment files, user data, or provider secrets.
