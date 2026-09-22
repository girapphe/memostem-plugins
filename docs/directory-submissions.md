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
- **OpenAI subtitle:** Reviewed knowledge across AI chats
- **Website:** https://www.memostem.com/plugins
- **Documentation:** https://github.com/girapphe/memostem-plugins/blob/main/docs/mcp.md
- **Support:** https://www.memostem.com/support
- **Privacy policy:** https://www.memostem.com/privacy
- **Terms:** https://www.memostem.com/terms
- **MCP endpoint:** https://www.memostem.com/api/mcp
- **Transport:** Streamable HTTP
- **Authentication:** OAuth 2.0
- **Logo:** https://www.memostem.com/icon-512.png

### Short description

Your reviewed knowledge, across AI conversations. Save selected general knowledge
as private pending drafts, review it in MemoStem, then retrieve your confirmed
knowledge from another connected AI.

### Long description

MemoStem lets you save selected general knowledge in one AI conversation,
review and approve it in MemoStem, then retrieve it from another AI connected to
the same MemoStem account. It also helps a connected AI notice independently
teachable knowledge while a conversation unfolds. At a natural stopping point, the AI names one useful idea
and asks whether the person wants to keep it. The suggestion sends nothing;
only a clear affirmative reply or a direct, specific save request can create a
private structured draft. Nothing is
automatically approved or published. Each draft remains in the owner's
Candidate Inbox until they edit, merge, save, or ignore it. Atomic memos teach
one concept; question-and-answer drafts test one idea. The connector verifies
its authenticated draft permission before capture and never uploads raw
conversation transcripts. With separate read consent, every signed-in owner
can also retrieve their own active confirmed knowledge or explicitly inspect
pending, archived, superseded, and recoverable trashed states. The AI host
controls whether it surfaces the proactive guidance.

### Primary use cases

1. Let the connected AI client suggest a reusable concept, knowledge question,
   general procedure, comparison, or claim/evidence structure, then create a private
   pending draft only after clear consent.
2. Review and refine AI-assisted knowledge in MemoStem before it becomes part
   of the owner's canonical private knowledge.
3. Turn directly requested general knowledge into concise atomic memos and
   answered question drafts for later review.
4. Reuse the signed-in owner's active confirmed knowledge, or inspect an
   explicitly requested lifecycle state, without exposing another owner's data
   or raw conversation history.

### Starter prompts

1. "When this conversation produces independently teachable general knowledge, name it and ask before creating a private MemoStem draft."
2. "Check my MemoStem connection, then save the lesson I selected as concise
   atomic memo and question-and-answer drafts."
3. "Save this general procedure as a structured MemoStem draft. Do not include the rest
   of the conversation."
4. "Create an open-question draft with the known facts, hypotheses, and next
   steps I selected."
5. "Verify that MemoStem is connected and has permission to create private drafts."
6. "Start MemoStem. Connect if needed, then show my topics or explain how to
   save knowledge."

The OpenAI plugin interface currently accepts one `defaultPrompt` string or a
list of strings, not a locale-keyed prompt map. Keep the first prompt within
the final directory's 128-character limit. The skill answers in the
conversation language, falls back to the host locale when that language is
unclear, then to English when neither is available. MCP App UI should
independently localize from the host locale.

When the server advertises `start_memostem`, the starter uses its localized
onboarding App or text fallback. `connect_memostem` requests knowledge-read
permission through the host OAuth flow and returns topic labels only. Deploy
these additive server tools before distributing this skill; older servers keep
the connection/catalog fallback. A real host OAuth round trip must be verified
separately from package or browser bridge tests.

## OpenAI submission

Use the OpenAI Platform plugin submission portal and choose **With MCP**. Submit
the production endpoint directly; do not submit an existing integration ID.
Include the single `memostem-proactive-capture` skill from the release revision
as an uploaded skill with the remote MCP. Record the exact source SHA and
portal validation result in the channel Issue.

Repository-prepared fields:

- Listing, legal, support, documentation, and logo URLs are in the shared
  listing above.
- The server publishes accurate tool titles, schemas, and safety annotations.
- Check public OAuth discovery and authentication challenges on protected
  tools. Anonymous preview tools are not proof of an authenticated connection.
- New ChatGPT connections request `openid`, `knowledge:drafts:create`, and
  `knowledge:context:read`. `knowledge:drafts:status` is requested when batch
  polling is enabled. Existing grants require reconnect or reconsent for
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
3. Create the portal draft and complete its generated domain-verification
   challenge at `/.well-known/openai-apps-challenge`.
4. Enter reviewer credentials only in the private portal. Never commit them.
5. Run the portal scanner, fix every result, submit for review, and publish only
   after approval.

### Positive review cases

1. **Proactive consent:** Finish an independently teachable explanation. Expect one
   specific save offer and no tool call before a clear affirmative reply; after
   that reply, expect a connection check followed by one private pending draft.
2. **Concept draft:** From an explicit two-sentence selection, call
   `create_knowledge_bundle_drafts` with a concept bundle. Expect `pending`, one
   bundle, and a MemoStem review path.
3. **Atomic memo and flashcard:** Explicitly request both formats for one
   selected idea. Expect a `concept` bundle and an answered `question` bundle,
   each declaring `knowledge_scope: "general_knowledge"`. Expect no additional
   consent question and no automatic practice enrollment.
4. **Procedure draft:** Convert selected steps into a procedure bundle with a
   completion criterion. Expect one pending structured draft.
5. **Question draft:** Save a selected open question with known facts and next
   steps. Expect one pending question bundle.
6. **Idempotent retry:** Repeat the same provider and request ID. Expect the
   existing batch rather than duplicated drafts; retry an uncertain response
   with the exact same payload and report `created: false` as an existing batch.
7. **Default active context:** Complete OAuth with
   `knowledge:context:read`, call `get_topic_context` without
   `lifecycle_states`, and expect a schema-version-2 `confirmed_context` pack
   containing only that owner's active confirmed items.
8. **Lifecycle inspection:** Request `active`, `pending`, `archived`,
   `superseded`, and `trashed` explicitly. Expect `lifecycle_context`, per-item
   lifecycle and verification status, current pending candidates, and only
   trash still inside the 14-day recovery window.
9. **OAuth verification:** Complete OAuth with the three ChatGPT defaults, call
   `check_memostem_connection` with `{}`, and verify connected status plus the
   two `knowledge:*` grants before capture or retrieval. A login screen alone
   is not success evidence.
10. **Existing-knowledge proposal:** Call `list_knowledge_catalog`, then
   `search_knowledge`, then `get_knowledge_context` for only the selected IDs.
   Submit a complete merged final card with `resolution_proposal`; expect a
   private `pending` draft and no canonical version change.
11. **Resolution status:** With `knowledge:drafts:status`, call
   `get_draft_batch_status` for the returned batch. Expect `pending` until the
   reviewer acts in MemoStem; after review, expect the actual approved, merged,
   updated, ignored, or partially resolved state.

### Negative review cases

1. **Unanswered suggestion:** Let the assistant offer a candidate, then continue
   the discussion without accepting it. Expect no creation tool call.
2. **Whole transcript request:** Ask MemoStem to save the complete conversation.
   Expect refusal or a request to select a concise subset; do not call a tool
   with transcript/history content.
3. **Automatic approval:** Ask it to approve or publish the new knowledge.
   Explain that the connector can only create pending private drafts and that
   approval happens in MemoStem.
4. **Unavailable or hidden history:** Ask it to infer knowledge from conversations
   the host did not provide. Refuse and report that the context is unavailable;
   never fabricate a candidate or request the full history.
5. **Ineligible material:** Ask to save a personal preference, company decision,
   plan, or meeting outcome. Explain the general-knowledge boundary and do not
   disguise the material as a concept draft.
6. **Disconnected plugin:** Make the MCP tool unavailable or revoke draft
   permission. Expect the OAuth/reload step and no claim that cards were
   created. Browser form entry must not replace the plugin capture path.
7. **Invalid explicit context selection:** Mix an unknown, wrong-owner,
   permanently deleted, or unrequested-state ID into an explicit selection.
   Expect one non-leaky error and no partial context.

Official reference: https://developers.openai.com/plugins/deploy/submission

## Anthropic connector submission

Submit the production endpoint as a **Remote MCP server** through the
Connectors Directory portal in the Girapphe Claude organization.

Suggested categories:

- Productivity
- Knowledge management
- Education

Account-only gates:

1. Use a Claude Team or Enterprise organization and an Owner, Primary Owner, or
   role with Directory management access.
2. Create a remote connector draft with the shared listing above.
3. Let the portal sync all tools and confirm every title and annotation.
4. Enter a fully populated reviewer account and credentials only in the private
   portal. Do not enable MFA, email confirmation, or SMS on that review path.
5. Confirm OAuth, data handling, use cases, compliance, and end-to-end tool
   behavior before submitting.

The candidate-review tool already has an MCP App selection UI with a text
fallback. Review the live UI and CSP, provide screenshots when the portal
requests them, and test both rendered selection and fallback. Never describe
this integration as UI-free.

Official reference: https://claude.com/docs/connectors/building/submission

## Anthropic skill-bearing plugin submission

The connector listing above and a skill-bearing plugin are separate artifacts.
Use the public [plugin submission entry](https://claude.com/plugins) for the
existing Claude manifest plus shared skill and remote MCP, using the same
listing copy and test cases. The [unified directory](https://support.claude.com/en/articles/14328846-browse-skills-connectors-and-plugins-in-one-directory)
describes installed plugin skills in chat and Cowork. Verify skill loading in
Claude chat independently of Claude Code and independently of MCP-only setup.
Record the exact package revision, requested reviewer materials and results in
[#19](https://github.com/girapphe/memostem-plugins/issues/19).

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
4. Open the plugin details feedback button, choose **Apply for official
   marketplace publication**, and provide the publisher contact email in the
   private form. Use the shared listing, legal/support URLs, prompts and test
   material above; supply additional reviewer information only through the
   provider's private channel.
5. Record submission, review response and public listing separately. Do not
   infer web installation or marketplace acceptance from local import.

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
conditions; Grok has organization provisioning conditions. No public directory
submission route is assumed for either. Track setup, submission discovery and
approval independently in the [dated channel record](channel-status.md).

## MCP Registry publication

`server.json` uses the GitHub-owned namespace
`io.github.girapphe/memostem`. Publishing a GitHub Release triggers the
OIDC-authenticated registry workflow. It requires no dedicated registry secret.

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
