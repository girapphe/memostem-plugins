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
- **Keep knowledge teachable.** Create an atomic memo for one concept or a
  question-and-answer draft for one retrieval question.

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
natural stopping point when the current conversation produces independently
teachable general knowledge: a concept, mechanism, general procedure,
comparison, evidence-backed claim, knowledge question, historical event, or
language expression. The installable plugin also includes an implicitly discoverable
`memostem-proactive-capture` skill with the same behavior.

The offer sends nothing and is not consent. The client may call a creation tool
only after a clear affirmative reply to that specific proposal or a direct
request identifying the current-conversation material. It must not repeat a
declined topic or propose sensitive, secret, credential, or do-not-retain
material. AI hosts decide whether and when to surface MCP instructions, so a
connection cannot guarantee an offer in every client.

Personal or company decisions, product policies, preferences, plans, tasks,
meeting outcomes, and autobiographical facts are outside this capture contract.
A direct request to save named eligible material already provides consent;
the assistant should verify the connection and create the requested drafts.

## Install the Git plugin

### Codex

```bash
codex plugin marketplace add girapphe/memostem-plugins --ref main
codex plugin add memostem@memostem
codex plugin list
codex mcp login memostem --scopes knowledge:drafts:create
```

Complete sign-in and consent in the OAuth page, then start a new Codex task so
the installed snapshot loads. In that task, ask:

> Check my MemoStem connection, then save the general knowledge I selected in this conversation as concise atomic memo and question-and-answer drafts.

The plugin calls `check_memostem_connection` first and verifies the draft
permission, then calls `create_knowledge_bundle_drafts`. A successful login or
tool listing alone does not prove that any draft was created. The assistant
must report the server's actual pending count and review link. Browser forms
are not a substitute for this plugin path.

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

- `check_memostem_connection`: verify authentication and report granted scopes
  without reading or writing knowledge.
- `create_knowledge_bundle_drafts`: create structured private drafts from an
  explicitly selected part of the current conversation. Each bundle must use
  `knowledge_scope: "general_knowledge"`.
- `create_card_drafts`: compatible concept-card draft creation.

`get_topic_context` is currently restricted to accounts with the full-product
admin override and the separate `knowledge:context:read` scope. It is not part
of the ordinary user's plugin flow; granting a read scope alone does not make
it available.

Draft creation cannot approve knowledge, publish to the public graph, or retain
a conversation transcript. Question-and-answer cards use answered `question`
bundles; they do not automatically enroll in practice. See the
[working payload example](plugins/memostem/skills/memostem-proactive-capture/references/atomic-memo-flashcard.json)
and [the complete connection and capture guide](docs/mcp.md).

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

For local Codex iteration, the plugin-creator cachebuster helper can append
`+codex.<timestamp>` to the Codex manifest version before reinstalling from a
local marketplace. Validation permits that Codex-only build suffix while
requiring the underlying release version to match the Claude and Registry
manifests. Start a fresh task after reinstalling so its tools and instructions
come from the new snapshot.

## Publication boundary

Only this repository is the public installation source. It contains manifests,
instructions, static skills, and connection metadata—not the MemoStem web or
mobile source, MCP implementation, authentication code, database schema,
migrations, credentials, environment files, user data, or provider secrets.
