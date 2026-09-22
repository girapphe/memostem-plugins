# Submission readiness runbook

Checked against provider documentation on **2026-09-22**. This runbook prepares
the repository and production MCP for submission; it does not authorize or
perform a provider submission.

## Release candidate identity

Freeze one public source commit before opening any portal draft. Record it in
the channel Issue and use the same commit for the uploaded/imported skill,
listing copy, screenshots, and reviewer testing.

```bash
git fetch origin main
git rev-parse origin/main
git diff --exit-code origin/main -- plugins/memostem docs/directory-submissions.md
npm run check
npm run check:submission
git diff --check
```

The release metadata is `0.6.0` across the Codex, Claude, portable Agent
Plugins, package, marketplace, and MCP Registry manifests. Do not tag or publish
`0.6.0` until the final source SHA passes the private MemoStem compatibility
check and the publisher intentionally starts the release step.

## Prepared public material

- Listing name: **MemoStem**
- Developer/publisher: **Girapphe**
- Category: **Productivity**
- Tagline: **Your reviewed knowledge, across AI conversations.**
- OpenAI subtitle: **Reviewed knowledge across AI chats**
- Universal MCP URL: `https://www.memostem.com/api/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth 2.0 with dynamic client registration
- Website, documentation, support, privacy, terms, and logo: use the exact URLs
  in [the directory submission kit](directory-submissions.md#shared-listing).
- Starter prompts, long description, use cases, and bilingual reviewer prompts:
  copy from [the directory submission kit](directory-submissions.md).

Reviewer credentials, portal-generated domain tokens, provider submission IDs,
and private test knowledge belong only in the provider portal or the owner's
credential manager. Never add them to GitHub comments, screenshots, artifacts,
or this repository.

## OpenAI portal packet

Choose **With MCP** and **Universal**, then enter the production MCP URL. The
portal submission is a new MCP-backed plugin; do not reference an existing
integration ID. Upload the final `memostem-proactive-capture` skill from the
frozen source SHA or import the matching static skill discovered by Scan Tools.

Before submitting, record each gate in [Issue #18](https://github.com/girapphe/memostem-plugins/issues/18):

- [ ] Submitter has Apps Management write access in the publishing organization.
- [ ] Girapphe developer/business identity is verified and matches the public URLs.
- [ ] Domain challenge from the current draft is served verbatim at
      `/.well-known/openai-apps-challenge` and the portal marks it verified.
- [ ] Scan Tools discovers the expected tools, skill, titles, schemas, and all
      `readOnlyHint`, `destructiveHint`, and `openWorldHint` annotations.
- [ ] MCP App candidate picker loads; its CSP allows only the exact required
      domains. The current resource declares no external connect/resource/frame/base domains.
- [ ] Reviewer account is fully populated and works without MFA, SMS, email
      confirmation, or private-network access.
- [ ] All five submitted positive and three negative cases pass on every
      declared ChatGPT/Codex surface.
- [ ] Tool responses were inspected for unnecessary personal data, auth data,
      debug payloads, request/trace/session IDs, and undisclosed identifiers.
- [ ] Country availability and policy attestations match actual support.
- [ ] Final skill file tree was tested after the last change.

Use positive cases 1, 2, 7, 10, and 11 and negative cases 1, 2, and 5 from
[the submission kit](directory-submissions.md#positive-review-cases). Positive
case 11 is included because production authorization metadata and the dated
PKCE OAuth evidence below both confirm the `knowledge:drafts:status` grant.

Capture these screenshots without private knowledge or credentials:

1. Plugin listing preview.
2. Successful OAuth connection and granted knowledge scopes.
3. Candidate picker with no preselected candidates.
4. One selected candidate before Add.
5. Pending result with the MemoStem review link redacted to its public path.
6. Owner review screen showing only synthetic test knowledge.
7. Retrieval of the approved synthetic item in another supported host.

Official references: [submission flow](https://developers.openai.com/plugins/deploy/submission),
[remote MCP review](https://developers.openai.com/plugins/deploy/app-review).

## Claude connector packet

Submit the production endpoint as a remote MCP server in the organization
submission portal. Use one Universal HTTPS URL and Streamable HTTP. Keep the
skill-bearing plugin submission separate from the connector listing.

Record in [Issue #19](https://github.com/girapphe/memostem-plugins/issues/19):

- [ ] Authorized Claude organization and directory-management access confirmed.
- [ ] Documentation, privacy, icon, support contact, permanent slug, one to five
      categories, and listing text entered.
- [ ] Synced tools are classified correctly as read-only or write and none are
      missing titles or annotations.
- [ ] OAuth mode and dynamic client registration complete end to end.
- [ ] Fully populated reviewer account and exact access steps entered privately.
- [ ] Every tool exercised through MCP Inspector or a Claude custom connector.
- [ ] MCP App carousel screenshots and text fallback evidence supplied.
- [ ] Data handling and all compliance acknowledgments reviewed truthfully.
- [ ] Claude chat skill loading tested independently from connector-only and
      Claude Code installation.

Official reference: [Claude Connectors Directory submission](https://claude.com/docs/connectors/building/submission).

## Kimi packet

Import the frozen repository SHA through Kimi Work Plugin Builder, selecting
only `plugins/memostem`. Inspect the converted `kimi.plugin.json`, skill tree,
endpoint, OAuth behavior, and absence of extra tools or credentials. Install it
from Personal and run the shared H-01–H-10 cases before applying.

Record the converted package provenance and sanitized results in
[Issue #20](https://github.com/girapphe/memostem-plugins/issues/20). From the
plugin details page, use the feedback button, choose **Apply for official
marketplace publication**, and provide the publisher email only in Kimi's form.
Submission, reviewer response, and public listing remain separate states.

Official references: [import](https://www.kimi.com/en/help/plugins-and-skills/create),
[publication](https://www.kimi.com/en/help/plugins-and-skills/publish).

## Current live preflight

Run `npm run check:submission` immediately before opening each portal. It checks
the production pages, health revision, anonymous MCP initialization and tool
annotations, MCP App resource/CSP, and OAuth discovery metadata without using
credentials or changing data.

As of 2026-09-22, the production endpoint and public pages passed. Both the
protected-resource and authorization-server metadata advertise
`knowledge:drafts:status`. A production PKCE flow using a marked synthetic owner
displayed the status permission on Clerk's consent screen, returned the scope in
the issued grant, created one private pending batch, replayed the same request
without a duplicate, and polled the same pending result twice. The exact draft
batch, refresh-token grant, and temporary OAuth application were removed after
the test. Positive review case 11 is therefore part of the submission packet.
Implementation and activation evidence is tracked in
[MemoStem Issue #311](https://github.com/girapphe/memostem/issues/311).

## Stop conditions

Do not submit when any of these is true:

- package/manifest versions or source SHAs differ;
- the live endpoint revision is older than the server change being reviewed;
- a public/legal/support URL fails or mismatches the publisher;
- Scan Tools or the host reports missing/misclassified tools;
- reviewer login needs an out-of-band code or internal network;
- a test creates duplicate drafts, exposes another owner's data, retains a
  transcript, auto-approves knowledge, or returns undisclosed identifiers;
- screenshots contain credentials, private knowledge, or opaque workspace tokens.
