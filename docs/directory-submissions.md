# Directory submission kit

This document contains public, paste-ready listing material for MemoStem's
remote MCP integration. It deliberately contains no reviewer credentials,
access tokens, private application source, or provider submission identifiers.

## Shared listing

- **Name:** MemoStem
- **Developer:** Girapphe
- **Category:** Productivity
- **Tagline:** Let AI suggest what is worth keeping, then review it privately.
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

Receive a timely suggestion for reusable AI-conversation knowledge, clearly
consent before creating a private MemoStem draft, and review it before reuse.

### Long description

MemoStem guides a connected AI client to notice independently teachable general
knowledge at a natural
stopping point and ask whether the person wants to keep that specifically named
material. The offer sends nothing; only a clear affirmative reply or a direct,
specific save request can create a private structured draft. Nothing is
automatically approved or published. Each draft remains in the owner's
Candidate Inbox until they edit, merge, save, or ignore it. Atomic memos teach
one concept; question-and-answer drafts test one idea. The connector verifies
its authenticated draft permission before capture and never uploads raw
conversation transcripts. Confirmed-topic recall is currently restricted to
accounts with the full-product admin override and a separate read scope; it
is not an ordinary-user capability. The AI host controls whether it surfaces
the proactive guidance.

### Primary use cases

1. Let the connected AI client suggest a reusable concept, knowledge question,
   general procedure, comparison, or claim/evidence structure, then create a private
   pending draft only after clear consent.
2. Review and refine AI-assisted knowledge in MemoStem before it becomes part
   of the owner's canonical private knowledge.
3. Turn explicitly selected general knowledge into concise atomic memos and
   answered question drafts for later review.

### Starter prompts

1. "When this conversation produces independently teachable general knowledge, name it and ask before creating a private MemoStem draft."
2. "Check my MemoStem connection, then save the lesson I selected as concise
   atomic memo and question-and-answer drafts."
3. "Save this general procedure as a structured MemoStem draft. Do not include the rest
   of the conversation."
4. "Create an open-question draft with the known facts, hypotheses, and next
   steps I selected."
5. "Verify that MemoStem is connected and has permission to create private drafts."

## OpenAI submission

Use the OpenAI Platform plugin submission portal and choose **With MCP**. Submit
the production endpoint directly; do not submit an existing integration ID.

Repository-prepared fields:

- Listing, legal, support, documentation, and logo URLs are in the shared
  listing above.
- The server publishes accurate tool titles, schemas, and safety annotations.
- The endpoint supports public OAuth discovery and returns an authentication
  challenge to unauthenticated requests.
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
7. **OAuth verification:** Complete OAuth with `knowledge:drafts:create`, call
   `check_memostem_connection` with `{}`, and verify its connected status and
   granted scopes before capture. A login screen alone is not success evidence.

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
