# Directory submission kit

This document contains public, paste-ready listing material for MemoStem's
remote MCP integration. It deliberately contains no reviewer credentials,
access tokens, private application source, or provider submission identifiers.

Use the [submission readiness runbook](submission-readiness.md) to freeze the
source SHA, run live preflight, prepare reviewer access and collect sanitized
portal evidence before using the copy below.

## Shared listing

- **Name:** MemoStem
- **Developer:** Girapphe
- **Category:** Productivity
- **Tagline:** Your reviewed knowledge, across AI conversations.
- **OpenAI subtitle:** Find knowledge worth keeping
- **Website:** https://www.memostem.com/plugins
- **Documentation:** https://github.com/girapphe/memostem-plugins/blob/main/docs/mcp.md
- **Support:** https://www.memostem.com/support
- **Privacy policy:** https://www.memostem.com/privacy
- **Terms:** https://www.memostem.com/terms
- **MCP endpoint:** https://www.memostem.com/api/mcp
- **Transport:** Streamable HTTP
- **Authentication:** Mixed/lazy; account-free guest capture and OAuth 2.0 with dynamic client registration for protected tools
- **Logo:** https://www.memostem.com/icon-512.png

### Short description

Keep selected knowledge in a private temporary shelf, then connect to review it
and reuse confirmed knowledge across AI conversations.

### Long description

MemoStem helps a connected AI find independently teachable knowledge in the
current conversation and ask before keeping a specific selection. Without an
account, a person can keep up to ten private cards in a temporary guest shelf
for 90 days and view them through a short-lived read-only link. The opaque
workspace continuation token stays private to the client. When the shelf is
full, OAuth can transfer those same cards to the person's private pending
Candidate Inbox. They can review, edit, merge, save, or ignore the drafts there.
With separate read permission, a connected AI can retrieve only that owner's
confirmed knowledge and inspect other lifecycle states when explicitly asked.
MemoStem never uploads a full conversation, approves drafts automatically, or
publishes private knowledge.

### Primary use cases

1. Keep up to ten explicitly selected general-knowledge cards in a private
   90-day guest shelf without an account.
2. Connect through OAuth at the shelf limit and move those same cards into
   private pending review, with no approval or publication.
3. After clear consent, create concise private pending drafts for independently
   teachable concepts, procedures, comparisons, and questions.
4. Retrieve only the connected owner's active confirmed knowledge by default;
   inspect other lifecycle states only when requested.

### Starter prompts

1. "Preview a card explaining evaporation. Do not save it yet."
2. "Save this to my guest shelf: correlation alone does not prove causation."
3. "Connect MemoStem and find my confirmed knowledge about correlation."

Keep directory starter prompts within the 128-character submission limit.
The skill answers in the conversation language, falls back to the host locale
when that language is unclear, then to English when neither is available.
Use that same language for the onboarding tool's `locale` argument.

When the server advertises `start_memostem`, a getting-started request uses its
localized onboarding App or text fallback. Guest capture remains available
without connection. If the person chooses to connect, `connect_memostem`
requests knowledge-read permission through the host OAuth flow and returns
topic labels only. Older servers keep the connection/catalog fallback when
the person requests account access. Starting or connecting never authorizes a
save. Verify a real host OAuth round trip separately from package checks.

## OpenAI submission

Use the OpenAI Platform plugin submission portal and choose **With MCP**. Submit
the production endpoint directly; do not submit an existing integration ID.
Upload the plugin ZIP built by `npm run package:portal` from the release
revision: it carries the single `memostem` skill, `assets/` and a root
`plugin.json`, and excludes `hooks/` and `.app.json` (hooked plugins are not
eligible for the public directory; packages with apps cannot currently be
submitted). Connect the remote MCP separately with **Universal**; skills are not
imported from the server. The portal rescans the MCP server daily and offers
**Rescan**. Record the ZIP name, SHA-256, source SHA and portal validation
result in the channel Issue. Sources, checked 2026-10-15:
[Build plugins](https://developers.openai.com/plugins/build/plugins) and
[Submit a plugin](https://developers.openai.com/plugins/deploy/submission).

Project condition (checked 2026-10-15,
[remote MCP review requirements](https://developers.openai.com/plugins/deploy/app-review)):
"projects with EU data residency cannot submit plugins with MCP servers for
review." Submit from a project with global data residency; create a new project
in the organization if needed. The server must be on a publicly accessible
domain (no local or testing endpoint), and every test case must pass on the
supported ChatGPT and Codex surfaces.

Repository-prepared fields:

- Listing, legal, support, documentation, and logo URLs are in the shared
  listing above.
- The server publishes accurate tool titles, schemas, and safety annotations.
- Check public OAuth discovery and authentication challenges on protected
  tools. Guest capture is available before OAuth; anonymous tool visibility is
  not proof of an authenticated connection.
- New ChatGPT connections request `openid`, `knowledge:drafts:create`,
  `knowledge:context:read`, and `knowledge:drafts:status`. Existing grants require reconnect or reconsent for
  newly added read access; `profile`, `email`, metadata, and `offline_access`
  are not requested by default.
- The existing candidate-review MCP App may render a selection UI in capable
  hosts and has a text fallback. Disclose it in review and verify current UI
  metadata/CSP and requested screenshots. There is no new UI in this package
  change; verify the live exposed tool list before making safety attestations.

For reviewed knowledge reuse, `list_knowledge_catalog` returns stable owner
topic/tag IDs without bodies, `search_knowledge` searches active approved
non-superseded items, and `get_knowledge_context` returns only explicitly
selected cross-topic items. A complete `resolution_proposal` may accompany a
pending bundle with a target version, source IDs, change summary, and reason;
it does not execute a merge or update. `get_draft_batch_status` uses
`knowledge:drafts:status` to report the owner's later resolution without
performing it. `get_topic_context` remains available for compatible Topic Hub
lifecycle reads of `active`, `pending`, `archived`, `superseded`, and `trashed`
items.

Account-only gates:

1. Select the OpenAI organization that will publish MemoStem.
2. Verify Girapphe as the business identity and grant the submitter Apps
   Management write access.
3. Create the portal draft from the ZIP and complete its generated domain-verification
   challenge at `/.well-known/openai-apps-challenge`.
4. Enter reviewer credentials only in the private portal. Never commit them.
5. Run the portal scans (MCP Rescan and Metadata & Skills), fix every result, submit for review, and publish only
   after approval.

### Positive review cases

1. **Guest capture:** After explicit selection, call
   `save_guest_knowledge_bundles` before OAuth. Expect `persisted: true`, one
   private card, remaining capacity, expiry, and a read-only review link.
   Keep `workspace_token` private and reuse it only as a tool argument.
2. **Same shelf:** Save another selected concept using the same private
   continuation token. Expect the same shelf count to increase without
   duplicates and remain at or below ten.
3. **Claim at limit:** Fill the shelf with selected synthetic cards. After the
   person agrees to connect, call `claim_guest_knowledge_workspace`, complete
   OAuth, and retry the same claim. Expect the same cards to become owner-scoped
   private pending drafts without duplication.
4. **Connection and read:** Call `check_memostem_connection` and verify exactly
   `knowledge:drafts:create`, `knowledge:context:read`, and
   `knowledge:drafts:status` in `granted_scopes`. Call `get_topic_context`
   without a lifecycle filter; expect only the reviewer's active confirmed
   knowledge.
5. **Draft and status:** After clear confirmation of one selected explanation,
   create one `general_knowledge` bundle and use `get_draft_batch_status`
   twice. Expect the same owner-scoped pending batch until the person acts in
   MemoStem; no second draft or automatic approval.

### Negative review cases

1. **Personal task:** Ask MemoStem to remember a call tomorrow. Do not call a
   creation tool; tasks and reminders are outside general knowledge.
2. **Company decision:** Ask it to save a company pricing decision as general
   knowledge. Do not call a creation tool.
3. **Whole transcript:** Ask it to import the entire conversation history.
   Refuse the bulk transfer and offer explicit selection of eligible knowledge.

Official reference: https://developers.openai.com/plugins/deploy/submission

## Anthropic connector submission

Submit the production endpoint as a **Remote MCP server** through the
Connectors Directory portal in the Girapphe Claude organization.

Suggested categories:

- Productivity
- Knowledge management
- Education

Account-only gates:

1. Submit from a claude.ai account on a paid plan (Pro, Max, Team, or
   Enterprise; free accounts cannot submit) in the organization that should own
   the listing long term. Pro and Max submit from their own account with no role
   check; on Team and Enterprise an Owner can submit, and on Enterprise an Owner
   can grant the **Directory** permission through a custom role under
   Organization settings > Roles.
2. In the developer portal (https://claude.ai/directory/manage) select
   **Submit new**, choose **MCP connector**, and create the draft with the
   shared listing above.
3. Let the portal sync all tools and confirm every title and annotation.
4. Enter a fully populated reviewer account and credentials only in the private
   portal. Do not enable MFA, email confirmation, or SMS on that review path.
5. Confirm OAuth, data handling, use cases, compliance, and end-to-end tool
   behavior before submitting. Connector submissions are scanned automatically
   and listed as Community by default; Anthropic decides whether to escalate to
   Verified review.

The candidate-review tool already has an MCP App selection UI with a text
fallback. Review the live UI and CSP, provide screenshots when the portal
requests them, and test both rendered selection and fallback. Never describe
this integration as UI-free.

Official references (checked 2026-10-15):
[publish to the directory](https://claude.com/docs/directory/publish),
[connector submission](https://claude.com/docs/connectors/building/submission).

## Anthropic plugin directory submission (Cowork and Claude Code)

The connector listing above and the skill-bearing plugin are separate
artifacts: submit the remote MCP server as the **MCP connector** first, then the
plugin bundle from the same organization, and pair the two listings in the
portal. Point the bundle's MCP configuration at the same URL. The [plugin directory](https://claude.com/plugins-for/cowork) serves
the complete `plugins/memostem` package (Claude manifest, shared `memostem`
skill and remote MCP) to Cowork, installed-plugin chat, and Claude Code, where
it appears in the built-in `claude-plugins-official` marketplace. Reuse the
shared listing copy and test cases.

Repository-prepared gates:

1. The repository is public and the submitted revision is on `main`.
2. `npm run check`, `claude plugin validate .`, and
   `claude plugin validate plugins/memostem` pass on that revision.
3. `.claude-plugin/marketplace.json` and
   `plugins/memostem/.claude-plugin/plugin.json` declare the same release
   version as the latest GitHub Release.
4. The bundled MCP endpoint `https://www.memostem.com/api/mcp` is publicly
   reachable; plugin connectors connect through Anthropic's cloud.

Account-only gates:

1. Submit from a paid-plan claude.ai account (same plan and role conditions as
   the connector above) in the developer portal at
   https://claude.ai/directory/manage: **Submit new** > **Plugin bundle**, with
   the public GitHub repository and the `plugins/memostem` folder. The first
   organization to submit a repository folder holds that listing and the portal
   refuses a second organization's submission of it. The earlier Claude Console
   form is no longer supported.
2. Track review status in the portal. Every version gets automated validation
   and a security scan, and a person reviews a new listing before it goes live.
   The "Verified" label is decided by Anthropic and is not guaranteed. An
   approved connector listing for the same endpoint reduces install warnings.
3. After publication, pushes to `main` are mirrored and re-screened
   automatically. Do not re-submit the form for updates; treat every merge to
   `main` as a release to all directory users.

Before submission, verify installation from this repository in Cowork
(**Customize → Plugins → + → Add marketplace → Add from a repository**) and
check skill loading in Claude chat independently of Claude Code and of MCP-only
setup. Record the exact package revision, submission route, requested reviewer
materials, and results in
[#19](https://github.com/girapphe/memostem-plugins/issues/19).

Official references (checked 2026-10-15):
[publish to the directory](https://claude.com/docs/directory/publish),
[plugin submission](https://claude.com/docs/plugins/submit),
[use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

## Kimi submission

1. In Kimi Work Plugin Builder, import this repository and select only the
   `plugins/memostem` package from a recorded source revision. Install the
   converted output from Personal.
2. Inspect the generated `kimi.plugin.json`, shared skill and MCP connection.
   Confirm the endpoint is `https://www.memostem.com/api/mcp`, there are no
   extra tools/skills or credentials, and the capture provider remains `other`.
   Format conversion alone is not OAuth or behavior verification.
3. Run the shared positive/negative review cases and H-01–H-10 on a supported
   Kimi chat surface. Record conversion provenance and sanitized outcomes in
   [#20](https://github.com/girapphe/memostem-plugins/issues/20).
4. For Kimi Work, open the plugin details feedback button, choose **Apply for official
   marketplace publication**, and provide the publisher contact email in the
   private form. Use the shared listing, legal/support URLs, prompts and test
   material above; supply additional reviewer information only through the
   provider's private channel.
5. Record submission, review response and public listing separately. Do not
   infer web installation or marketplace acceptance from local import.

The Kimi Code CLI is a separate product: it reads `kimi.plugin.json` or
`.kimi-plugin/plugin.json` and installs from a marketplace catalog, local path,
zip URL or GitHub URL
([plugins](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins.html),
checked 2026-10-15). That page does not document how a plugin becomes a
curated entry. An example external addition
([MoonshotAI/kimi-code#4149](https://github.com/MoonshotAI/kimi-code/pull/4149))
shows the observed route, not a documented procedure: a PR adding an entry
(`id`, `tier: "curated"`, `displayName`, `description`, `homepage`, `keywords`,
`source`) to `plugins/marketplace.json` plus a changeset, gated on a linked issue
that a maintainer `/approve`s. The source repository carries
`.kimi-plugin/plugin.json`. This repository has no such file, and none has been
opened or approved for MemoStem.

Official references (checked 2026-09-21): [import](https://www.kimi.com/en/help/plugins-and-skills/create),
[supported surfaces](https://www.kimi.com/en/help/plugins-and-skills/overview),
[marketplace application](https://www.kimi.com/en/help/plugins-and-skills/publish).

## Shared bilingual reviewer prompts

| Intent | English | 한국어 |
| --- | --- | --- |
| Save | Save this explanation of EUV lithography as one atomic memo draft. | 방금 설명한 EUV 노광 원리를 메모 초안 하나로 저장해 줘. |
| Retrieve | Find my approved MemoStem knowledge about EUV. | MemoStem에서 내가 승인한 EUV 지식을 찾아줘. |
| Select | Show candidates from the concepts we just discussed. | 방금 이야기한 개념 중 저장할 후보를 보여줘. |

Use only independently teachable general knowledge. Direct named saves are
already consent; proactively offered saves require acceptance. Default retrieval
uses active confirmed knowledge and does not create a new draft. Add a no-match
query and missing/revoked read-scope case to reviewer testing.

## Gemini and Grok connection readiness

Prepare custom MCP setup and H-01–H-10 evidence using the
[connection guide](mcp.md#primary-chat-channels). Gemini has account/region
conditions; Grok has organization provisioning conditions. Track setup,
submission discovery and approval independently in the
[dated channel record](channel-status.md).

Separate distribution routes, checked 2026-10-15 and not yet exercised for
MemoStem:

- **Grok plugin catalog:** open a PR to
  [xai-org/plugin-marketplace](https://github.com/xai-org/plugin-marketplace)
  adding an entry to `.grok-plugin/marketplace.json`. A remote source pins a
  full 40-character commit `sha`; run `scripts/generate-plugin-index.py` and
  `scripts/validate-catalog.py` first. CI and code-owner review apply. The
  [Grok Bot web form](https://x.ai/bot/marketplace/submit-a-plugin) is an
  alternative; it asks for organization name and lowercase handle, a 1:1 SVG or
  PNG logo with a background plate, a work email, the MCP server URL or public
  repository, testing instructions, a local-and-in-app test confirmation, and
  agreement to the Publisher Terms. Neither is tested here, and this repository ships no
  `.grok-plugin` file.
- **Gemini CLI extension gallery:** no submission step. The gallery crawls
  public GitHub repositories tagged with the `gemini-cli-extension` topic and
  expects `gemini-extension.json` at the repository or release-archive root
  ([releasing extensions](https://geminicli.com/docs/extensions/releasing/)).
  This repository has no such manifest and no topic, so it is not listed there;
  adding one is a separate decision. Skills go in a `skills/` directory and
  `mcpServers` is a map of server settings, but the Gemini CLI reference does
  not document the field for a remote HTTP server, so no manifest has been
  written until that is confirmed against the MCP server documentation. The Gemini app custom-connector path
  in the connection guide is unrelated to this gallery.

## MCP Registry publication

`server.json` uses the GitHub-owned namespace
`io.github.girapphe/memostem`. Publishing a GitHub Release triggers the
OIDC-authenticated registry workflow (the `mcp-publisher` flow). It requires no
dedicated registry secret. The entry is a remote-only `server.json`
(`remotes`, no `packages`), so no npm or Docker artifact is published first;
that prerequisite applies to package-based servers. The registry is in preview,
does not host artifacts, accepts no private servers, and has no documented
delete or unpublish yet.

After the workflow succeeds, verify the exact namespace through the official
registry API. Registry publication is a metadata-discovery state and does not
prove OAuth completion or provider-directory approval.

Official reference: https://modelcontextprotocol.io/registry/remote-servers

## Submission evidence and rollout

The authoritative preparation/connection/submission/approval record is
[channel-status.md](channel-status.md). Repository checks prepare material;
portal scans, account testing, reviewer access, provider submission and public
approval remain separate gates. Never place reviewer credentials or private
knowledge in this repository. Refresh official requirements at submission time.
