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
- `list_knowledge_catalog`, `search_knowledge`, and `get_knowledge_context`
  with `knowledge:context:read`
- `get_draft_batch_status` with `knowledge:drafts:status`
- `review_knowledge_bundle_candidates` with `knowledge:drafts:create`

Creation tools save only private pending drafts. They do not auto-approve
knowledge or write to the public graph. Every logged-in owner may grant the
separate context scope; no administrator override is required. A draft-only
client does not receive the read tool, and a context-only client does not
receive creation tools.

Catalog and search responses are bounded discovery data. Use
`get_knowledge_context` only after choosing exact item IDs; it can combine
items from different topics and never returns raw conversation text. A draft
may carry a complete `resolution_proposal` for `save_new`, `merge`, or `update`,
but the proposal does not mutate canonical knowledge. The owner completes the
actual action in MemoStem after comparing the target, target version, sources,
and change summary. Polling `get_draft_batch_status` reports that real state and
does not perform a resolution.

## Interactive candidate picker (MCP Apps)

The picker is hosted by the MemoStem MCP server. Installing this public plugin
connects to that server; the package does not ship a second UI bundle or private
application source. Rendering requires an MCP Apps-capable host and a connected
account with `knowledge:drafts:create`. A working tool list alone does not prove
that a particular host renders the UI.

The public [compatibility contract](../contracts/mcp-compatibility.json) records
these bindings in its additive `mcp_apps` section:

| Contract field | Hosted behavior |
| --- | --- |
| `review_tool` | `review_knowledge_bundle_candidates` previews identified candidates without saving. |
| `resource_uri` | The tool's `_meta.ui.resourceUri` resolves to `ui://memostem/knowledge-candidate-picker.html`. |
| `mime_type` | The resource is served as `text/html;profile=mcp-app`. |
| `create_tool` | Clicking Add calls `create_knowledge_bundle_drafts` through the host's MCP Apps bridge with only selected candidates. |
| `fallback` | `text_selection`: hosts without UI receive candidate text and wait for an explicit selection before creation. |

Start with no selected items. Preview details, select the items to keep, then
click Add. The click authorizes those private pending drafts; the assistant
must not repeat creation or ask for another chat confirmation. The returned
count and Candidate Inbox link describe the actual creation result. Reviewing
candidates alone does not save them, and adding drafts does not approve
knowledge or enroll it in practice. Host tool-approval controls still apply.

The public validator rejects missing or changed UI bindings. The private
application's compatibility check verifies the bindings against the MCP server;
its browser tests exercise picker behavior. Neither check substitutes for an
authenticated session in each supported host. Use H-05 in the
[host acceptance protocol](channel-status.md#host-acceptance-protocol) to record
actual rendering, selected-only creation, and text fallback separately.

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

## Primary chat channels

Official documentation checked on 2026-09-21. These setup paths are documented
capabilities, not evidence that a MemoStem account was connected in each host.
All hosts use `https://www.memostem.com/api/mcp` and the same MemoStem owner.
Custom MCP loads tools/server instructions; only an installed skill-bearing
plugin supplies the packaged SKILL.md. Do not promise proactive behavior from
an MCP-only connection.

### ChatGPT

Use the OAuth remote MCP setup described below. The submission bundle includes
both the remote MCP endpoint and the existing memostem-proactive-capture skill.
Workspace policy and available app controls determine account access.
[Official submission and testing entry point](https://developers.openai.com/plugins/deploy/submission).

### Claude

In Claude chat/web or Desktop, add the endpoint as a custom remote connector and
complete OAuth. Alternatively install a reviewed MCP+Skills plugin through the
unified directory when listed. Connector setup alone does not install the skill;
Claude Code installation alone does not verify Claude chat behavior.
[Custom connector requirements](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
and [unified directory](https://support.claude.com/en/articles/14328846-browse-skills-connectors-and-plugins-in-one-directory).

### Kimi

In Kimi Work, invoke Plugin Builder and ask it to import
`https://github.com/girapphe/memostem-plugins`, selecting only `plugins/memostem`.
It can convert Codex/Claude manifests or a generic root manifest to
`kimi.plugin.json`. Install the converted plugin from Personal, inspect that it
contains only the shared skill and the canonical remote MCP endpoint, and
complete OAuth. Do not add a second hand-maintained Kimi implementation.
Use `provider: "other"` for writes; never invent a `kimi` provider value.

The web experience supports MCP and Skills in supported K3/K3 Swarm and other
listed scenarios; do not infer support in every Kimi conversation surface.
Update by re-importing the chosen source revision and checking the converted
output; uninstall/remove through Personal. Keep converted credentials local.
[Import instructions](https://www.kimi.com/en/help/plugins-and-skills/create)
and [supported surfaces](https://www.kimi.com/en/help/plugins-and-skills/overview).

### Gemini

In Gemini web, open Settings → Connected Apps (possibly under Personal
Intelligence) → Custom apps. Enter the canonical MCP URL, then follow the
account-linking flow. For a server without dynamic client registration, Google
provides Advanced features; use only the service's actual registration details.
Never paste user tokens into chat or commit them here. After linking, select the
app with `@` to test a named topic; the connection is also usable on mobile.

Current documented conditions: US, age 18+, personal Google Account, English,
and Keep Activity on. Work/school accounts are not supported by this custom-app
path. Gemini currently requires manual confirmation for writes; respect that
host confirmation even when the chat request already selected the material.

To disconnect, turn the app off in Connected Apps. To revoke the account link,
use More details → Disconnect, or remove the app; reconnect by adding/linking
it again and verifying both knowledge grants. Use `provider: "gemini"`.
[Official setup, removal and access conditions](https://support.google.com/gemini/answer/17209137?co=GENIE.Platform%3DDesktop&hl=en-GA).

### Grok

Open grok.com/connectors → New Connector → Custom, enter the canonical MCP URL,
and complete the required authentication. For Business/Enterprise, an admin
must provision the connector before members can use it. Test in general chat,
not Grok Build. Use `provider: "other"`; do not invent a `grok` enum value.
Public catalog submission is a separate, currently unverified distribution path.
[Official custom connector guide](https://docs.x.ai/grok/connectors).

### Verify save and retrieve

1. Call `check_memostem_connection`; use `knowledge:context:read` for retrieval
   and `knowledge:drafts:create` for saving. Missing grants require reconnect
   or reconsent, not wider permissions than the requested task needs.
2. Ask "Find my approved MemoStem knowledge about EUV" / "MemoStem에서 내가
   승인한 EUV 지식을 찾아줘." Use `get_topic_context` with its live schema;
   omit lifecycle filters by default. Report an empty result honestly.
3. Ask "Save this explanation of EUV as one atomic memo draft" / "방금 설명한
   EUV 원리를 메모 초안 하나로 저장해 줘." Save only that selected general
   knowledge, then report the actual pending count and review link.
4. If choosing candidates, start with no selection. An MCP Apps Add click saves
   only checked candidates; never create them again afterward. Without Apps,
   show the numbered result and await explicit text selection.
5. Review/approve in MemoStem, then connect another host to the same owner and
   retrieve the approved item. No raw conversation crosses between hosts.

## Secondary coding channels

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
- Set `provider` to `other` in Codex, Kimi or Grok, or the actual `chatgpt`, `claude`, or
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
