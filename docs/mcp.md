# MemoStem MCP connection guide

MemoStem captures independently teachable general knowledge from AI conversations.
A connected client can suggest one reusable idea at a natural stopping point,
but MemoStem accepts only concise material a person clearly agrees to select
from the current conversation. It saves that material as private pending drafts and
keeps approval inside MemoStem. It does not ingest a full conversation archive.

## Endpoint and tools

The production Streamable HTTP endpoint is:

```text
https://www.memostem.com/api/mcp
```

Tools are exposed from the scopes the signed-in owner grants:

- `check_memostem_connection`
- `create_knowledge_bundle_drafts` and compatible `create_card_drafts` with
  `knowledge:drafts:create`
- `get_topic_context` with `knowledge:context:read`

Creation tools save only private pending drafts. They do not auto-approve
knowledge or write to the public graph. Every logged-in owner may grant the
separate context scope; no administrator override is required. A draft-only
client does not receive the read tool, and a context-only client does not
receive creation tools.

## Owner-scoped context and lifecycle filters

`get_topic_context` returns only the authenticated owner's knowledge. Omitting
`lifecycle_states` is equivalent to `lifecycle_states: ["active"]` and keeps
the compatible `status: "confirmed_context"`. A request containing any
non-active state returns `status: "lifecycle_context"`. The accepted,
duplicate-free lifecycle values are:

- `active`: current, confirmed canonical knowledge
- `pending`: current, unconfirmed pending candidates only
- `archived`: confirmed knowledge the owner archived
- `superseded`: confirmed knowledge replaced by a newer canonical item
- `trashed`: soft-deleted knowledge still inside the 14-day recovery window

The reference pack uses schema version 2. Every item includes
`lifecycle_state` and `verification_status`. Pending items are
`unconfirmed_pending_candidate`; every returned canonical item is
`user_confirmed_not_independently_fact_checked`. Learning state is attached
only to requested active confirmed items. Relations include only canonical
items returned together in the same pack, and pending candidates never expose
suggested relations.

A `recent_topic` request applies one limit across all selected states and caps
the result at 50 items. Explicit item selection accepts up to 100 IDs across
canonical item IDs and pending draft IDs. Explicit selection is all-or-nothing:
an ID owned by someone else, outside the requested states, expired or purged
from trash, or permanently deleted produces the same non-leaky error without a
partial result. Ignored, rejected, or discarded candidates, purged data, and
raw conversation transcripts are never returned. Only active confirmed reads
record a `reused` lifecycle event; other lifecycle reads are inspection.

## Proactive suggestion and consent

Draft-authorized MCP initialization tells the client to make one brief,
benefit-focused offer when the current exchange produces an independently
teachable concept, mechanism, general procedure, comparison, evidence-backed
claim, knowledge question, historical event, or language expression. The client should name the material instead
of expecting the person to remember MemoStem, card, or tool terminology.

The offer itself sends nothing. A creation tool may run only after a clear
affirmative reply to that specific proposal or a direct request identifying
the material. Silence, continued discussion, an unrelated affirmative, or a
standing request to remember useful things is not write consent. Declined
topics must not be offered again in the same conversation. A direct request to
save selected material needs no second consent question.

Personal or company decisions, product principles or policies, pricing-choice
rationale, preferences, plans, tasks, reminders, meeting outcomes, project
status, and autobiographical facts are ineligible. Clients must not suggest or
send casual one-off, secret, credential, sensitive, or do-not-retain material.
After consent they should prefer one coherent typed
bundle, add more only when the person selected multiple independently reusable
items, and never include transcripts, older conversations, hidden content, or
ambient files. The remote AI host controls whether it surfaces server
instructions, so proactive suggestions remain client-dependent.

## Codex OAuth and the first capture

After installing the plugin as described in the [README](../README.md), run:

```bash
codex mcp login memostem --scopes knowledge:drafts:create
```

Complete sign-in and consent on the OAuth page. Keep credentials and tokens in
the client's authentication flow, never in plugin files or conversation text.
Start a new Codex task after installation or an update so its tool inventory
loads, then perform these steps through MemoStem MCP:

1. Call `check_memostem_connection` with `{}`. Require `status: "connected"`
   and `knowledge:drafts:create` in `granted_scopes`.
2. Select only the general knowledge the user requested and call
   `create_knowledge_bundle_drafts` using the live tool schema.
3. Verify `status: "pending"`, `batch_id`, `bundle_count`, `created`, and
   `review_path` in the real response. Confirm the count against the submitted
   selection and give the returned review path on `https://www.memostem.com`.

If tools are absent, reload the plugin or start a new task. If authentication or
the draft scope is missing, complete OAuth and repeat the check. A setup page,
login success, or tool listing is not evidence of capture. Do not fall back to
browser form entry or direct database writes and describe that as plugin use.
The browser is appropriate for OAuth and reviewing returned drafts.

## Atomic memo and flashcard payloads

The packaged [atomic memo and flashcard example](../plugins/memostem/skills/memostem-proactive-capture/references/atomic-memo-flashcard.json)
shows one `concept` bundle and one answered `question` bundle. Replace its
sample IDs and content with the user's selected material. It is an example,
not a payload to submit automatically.

- An atomic memo teaches one idea through a short `definition` and only the
  key points needed to understand it independently.
- A flashcard uses `knowledge_type: "question"`, repeats its retrieval question
  in `central_question` and `structured_content.question`, puts the answer in
  `answer_summary`, and sets `structured_content.status: "answered"`. There is
  no `flashcard` type or `front`/`back` contract. Draft creation does not enroll
  it in a practice queue.
- Every bundle requires `knowledge_scope: "general_knowledge"`, a title,
  central question, summary, topic, tags, `bundle_schema_version: 1`, and a
  `structured_content.type` matching `knowledge_type`. The remaining supported
  types are `procedure`, `comparison`, `mechanism`, `structure`,
  `claim_evidence`, `event`, and `expression`; use the live schema for those.
- Set `provider` to `other` in Codex, or the actual `chatgpt`, `claude`, or
  `gemini` host. Use opaque IDs and `provenance.type: "current_conversation"`.
  The current selection can include a lesson the user explicitly quoted into
  this conversation; do not upload the referenced conversation history.

Use one logical `request_id` and retain the exact payload. An uncertain timeout
may already have persisted the drafts: retry with the same provider,
`request_id`, and unchanged payload. A successful retry with `created: false`
refers to the existing batch; do not count it as newly created cards. Never
generate a fresh ID to bypass an uncertain response. Report an error, missing
response, or count mismatch accurately without claiming a confirmed save.

## ChatGPT and OpenAI API

For a ChatGPT custom app, register the endpoint above as a remote MCP server and
use the service's OAuth flow. Do not paste a MemoStem personal access token into
ChatGPT's browser settings. The public
[MemoStem connection page](https://www.memostem.com/plugins) links a signed-in
person to the detailed setup guide.

Configure new ChatGPT connections to request exactly these default scopes:

- `openid` for Clerk identity
- `knowledge:drafts:create` for private pending draft creation
- `knowledge:context:read` for owner-scoped context retrieval

Do not add `profile`, `email`, metadata scopes, or `offline_access` to the
ChatGPT defaults. MemoStem's connection record and
`check_memostem_connection` report only the two `knowledge:*` grants. Existing
draft-only grants are not elevated automatically; the person must disconnect
and reconnect or complete a new consent flow before the read tool appears.

For a server-side Responses API integration, keep both tokens in environment
variables and require approval for every MemoStem tool call:

```js
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL,
  input: "Use my active MemoStem context, then save only the ideas I explicitly select as pending drafts.",
  tools: [
    {
      type: "mcp",
      server_label: "memostem",
      server_description: "Retrieve owner-scoped private knowledge and create reviewable general-knowledge drafts.",
      server_url: "https://www.memostem.com/api/mcp",
      authorization: process.env.MEMOSTEM_MCP_TOKEN,
      allowed_tools: [
        "check_memostem_connection",
        "get_topic_context",
        "create_knowledge_bundle_drafts",
        "create_card_drafts"
      ],
      require_approval: "always"
    }
  ]
});

console.log(response.output_text);
```

`OPENAI_API_KEY`, `OPENAI_MODEL`, and `MEMOSTEM_MCP_TOKEN` must be supplied by
the caller. The PAT must explicitly include `knowledge:context:read` for the
read tool; the Settings checkbox is intentionally unchecked by default. Never
commit token values.

## Claude Code

The installed plugin registers the OAuth-capable endpoint without a stored
secret. Run `/mcp` to inspect and authenticate it.

For a PAT-based user override, keep the token in the environment and add a
higher-precedence user-scoped connection:

```bash
export MEMOSTEM_MCP_TOKEN='replace-in-your-shell-only'
claude mcp add-json memostem '{"type":"http","url":"https://www.memostem.com/api/mcp","headers":{"Authorization":"Bearer ${MEMOSTEM_MCP_TOKEN}"}}' --scope user
```

Do not place the expanded token in `.mcp.json`, shell history, screenshots, or
issues. Revoke it in MemoStem if it is exposed.

## Claude web and Desktop

Add `https://www.memostem.com/api/mcp` as a custom remote connector, select
OAuth, and complete MemoStem sign-in. The public Git marketplace in this
repository is also supported by Claude Code and compatible Claude plugin
surfaces, but a GitHub marketplace install and a Claude Connectors Directory
listing are separate distribution states.

## Privacy and trust boundary

- Send only content the user deliberately selected from the current
  conversation.
- Never send a full transcript, archive, hidden system prompt, unrelated files,
  or ambient workspace context.
- Treat context reads as owner-scoped retrieval, not permission to enumerate
  another user's IDs or bypass lifecycle filters.
- Draft creation is not approval. Review, edit, merge, update, ignore, or save
  every candidate in MemoStem.
- The plugin repository contains only connection metadata and workflow
  instructions. The hosted private application enforces authentication,
  authorization, owner scoping, rate limits, and persistence.
- Treat all remote MCP servers as trusted-code/data boundaries. Keep tool-call
  approval enabled when using a client that supports it.

Official references:

- [OpenAI MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI plugin submission](https://developers.openai.com/plugins/deploy/submission)
- [Claude connector submission](https://claude.com/docs/connectors/building/submission)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference)
- [Official MCP Registry](https://modelcontextprotocol.io/registry/about)
