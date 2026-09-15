# Directory submission kit

This document contains public, paste-ready listing material for MemoStem's
remote MCP integration. It deliberately contains no reviewer credentials,
access tokens, private application source, or provider submission identifiers.

## Shared listing

- **Name:** MemoStem
- **Developer:** Girapphe
- **Category:** Productivity
- **Tagline:** Turn selected AI ideas into reviewed private knowledge.
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

Capture only the ideas you select from an AI conversation as private MemoStem
drafts, review them before saving, and reuse confirmed knowledge later.

### Long description

MemoStem turns deliberately selected ideas from the current AI conversation
into private, structured knowledge drafts. Nothing is automatically approved or
published. Each draft remains in the owner's Candidate Inbox until they edit,
merge, save, or ignore it. With a separately granted read scope, MemoStem can
return a bounded context pack made only from confirmed, owner-scoped knowledge
and provenance metadata. It never returns raw conversation transcripts or
pending candidates.

### Primary use cases

1. Save a selected concept, decision, question, procedure, comparison, or
   claim/evidence structure as a private pending draft.
2. Review and refine AI-assisted knowledge in MemoStem before it becomes part
   of the owner's canonical private knowledge.
3. Reuse a bounded selection of confirmed topic knowledge in a later AI task
   without retrieving raw conversation history.

### Starter prompts

1. "Turn only the ideas I select below into private MemoStem drafts for review."
2. "Create a MemoStem decision draft from this choice, its alternatives, and my
   reconsideration criteria."
3. "Save this procedure as a structured MemoStem draft. Do not include the rest
   of the conversation."
4. "Create an open-question draft with the known facts, hypotheses, and next
   steps I selected."
5. "Recall my confirmed MemoStem knowledge about this topic using a bounded
   selection."

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

1. **Concept draft:** From an explicit two-sentence selection, call
   `create_knowledge_bundle_drafts` with a concept bundle. Expect `pending`, one
   bundle, and a MemoStem review path.
2. **Decision draft:** From selected options and tradeoffs, create one decision
   bundle. Expect a private pending result and no approval/publication.
3. **Procedure draft:** Convert selected steps into a procedure bundle with a
   completion criterion. Expect one pending structured draft.
4. **Question draft:** Save a selected open question with known facts and next
   steps. Expect one pending question bundle.
5. **Idempotent retry:** Repeat the same provider and request ID. Expect the
   existing batch rather than duplicated drafts.

### Negative review cases

1. **Whole transcript request:** Ask MemoStem to save the complete conversation.
   Expect refusal or a request to select a concise subset; do not call a tool
   with transcript/history content.
2. **Automatic approval:** Ask it to approve or publish the new knowledge.
   Explain that the connector can only create pending private drafts and that
   approval happens in MemoStem.
3. **Unrelated history:** Ask it to infer knowledge from older or hidden
   conversations. Refuse; only an explicit selection from the current
   conversation is eligible.

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
