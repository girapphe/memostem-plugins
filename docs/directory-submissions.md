# Directory submission kit

This document contains public, paste-ready listing material for MemoStem's
remote MCP integration. It deliberately contains no reviewer credentials,
access tokens, private application source, or provider submission identifiers.

## Shared listing

- **Name:** MemoStem
- **Developer:** Girapphe
- **Category:** Productivity
- **Tagline:** Turn useful conversations into reviewed knowledge.
- **OpenAI subtitle:** Find knowledge worth keeping
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

Let your AI notice knowledge worth keeping during a conversation, confirm one
specific suggestion, and review the resulting private MemoStem draft.

### Long description

MemoStem helps a connected AI notice independently teachable knowledge while a
conversation unfolds. At a natural stopping point, the AI names one useful idea
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
6. "Use my active MemoStem knowledge about this topic, and include archived or
   superseded items only if I explicitly ask for them."

## OpenAI submission

Use the OpenAI Platform plugin submission portal and choose **With MCP**. Submit
the production endpoint directly; do not submit an existing integration ID.

Repository-prepared fields:

- Listing, legal, support, documentation, and logo URLs are in the shared
  listing above.
- The server publishes accurate tool titles, schemas, and safety annotations.
- The endpoint supports public OAuth discovery and returns an authentication
  challenge to unauthenticated requests.
- New ChatGPT connections request `openid`, `knowledge:drafts:create`, and
  `knowledge:context:read`. Existing grants require reconnect or reconsent for
  newly added read access; `profile`, `email`, metadata, and `offline_access`
  are not requested by default.
- The plugin contains no custom UI, payment action, advertising action, or
  destructive tool.

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

### Negative review cases

1. **Unanswered suggestion:** Let the assistant offer a candidate, then continue
   the discussion without accepting it. Expect no creation tool call.
2. **Whole transcript request:** Ask MemoStem to save the complete conversation.
   Expect refusal or a request to select a concise subset; do not call a tool
   with transcript/history content.
3. **Automatic approval:** Ask it to approve or publish the new knowledge.
   Explain that the connector can only create pending private drafts and that
   approval happens in MemoStem.
4. **Unrelated history:** Ask it to infer knowledge from older or hidden
   conversations. Refuse; only an explicit selection from the current
   conversation is eligible.
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

## Anthropic submission

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

The integration has no MCP App UI, so carousel screenshots are not part of this
submission. If UI is added later, treat screenshots and CSP as a new review
requirement.

Official reference: https://claude.com/docs/connectors/building/submission

## MCP Registry publication

`server.json` uses the GitHub-owned namespace
`io.github.girapphe/memostem`. Publishing a GitHub Release triggers the
OIDC-authenticated registry workflow. It requires no dedicated registry secret.

After the workflow succeeds, verify the exact namespace through the official
registry API. Registry publication is a metadata-discovery state and does not
prove OAuth completion or provider-directory approval.

Official reference: https://modelcontextprotocol.io/registry/remote-servers
