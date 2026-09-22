# Channel readiness and evidence

Record date: **2026-09-22**. Owner: **@OkYongChoi**, publisher/account operator.
This record covers repository preparation plus the scoped production OAuth
evidence described below. No provider host session or submission portal was
exercised during implementation. Existing external listings
were not audited; “not exercised” does not assert that none already exist.
Official source checks appear in [the connection guide](mcp.md#primary-chat-channels).
The submission operator checklist is in
[the submission readiness runbook](submission-readiness.md).

## Independent channel states

| Channel | Repository material | Actual connection | Submission in this work | Public approval | Follow-up |
| --- | --- | --- | --- | --- | --- |
| ChatGPT | MCP + skill kit prepared | Not exercised; account test pending | Not performed | Not verified | [#18](https://github.com/girapphe/memostem-plugins/issues/18) |
| Claude | Connector + plugin kits prepared | Chat and skill loading not exercised | Not performed | Not verified | [#19](https://github.com/girapphe/memostem-plugins/issues/19) |
| Kimi | Import and marketplace kit prepared | Conversion/OAuth not exercised | Not performed | Not verified | [#20](https://github.com/girapphe/memostem-plugins/issues/20) |
| Gemini | Custom MCP guide prepared | Eligible-account test pending | No public submission route assumed | Not applicable to custom setup | [#21](https://github.com/girapphe/memostem-plugins/issues/21) |
| Grok | Custom MCP guide prepared | Account test pending | Public catalog route not verified | Not verified | [#22](https://github.com/girapphe/memostem-plugins/issues/22) |

Gemini testing requires the currently documented US adult personal account,
English and Keep Activity conditions. Kimi testing requires Work import and a
supported chat surface. Other hosts require an account with the applicable
connector/plugin controls and any organization-admin provisioning. No access
failure was observed; these account-dependent tests have not been attempted.

## Repository evidence

- CH-01/CH-02: README, bilingual guides and shared skill updated; retrieval
  permission/read-only instruction regressions included in public checks.
- CH-03/CH-04: `npm run check` passed **37 tests, zero skips**, including portable
  schema/metadata/transport drift, path escapes, credential headers, extra
  servers, shared skill secrets, symlinks and maintenance-skill rejection.
- Skill `quick_validate.py` passed.
- Codex `validate_plugin.py`, `claude plugin validate .`, and
  `claude plugin validate plugins/memostem` passed.
- CH-05: private MemoStem main `302e28e5abe4fddd71512dd15566abcdf9b8813c`
  passed `MEMOSTEM_PUBLIC_PLUGIN_ROOT=<this public checkout>
  pnpm check:public-plugin-compat`: **1 passed, zero skips**. No private source
  changed. This validates the existing payload contract, not live persistence.
- CH-06: three submission kits and five account-operation Issues prepared.
- `git diff --check` passed. Exact public revisions and CI runs are recorded in
  the PRs linked from [#15](https://github.com/girapphe/memostem-plugins/issues/15).

These checks do not prove model behavior, host installation, store review,
public listing or deployment. Versions are prepared for 0.6.1;
no release or registry publication has been performed by this implementation.

Live credential-free preflight on 2026-09-22 confirmed the public product,
privacy, terms, support and logo URLs; production database health; MCP
initialization; seven anonymous/reviewer-entry tools with titles and complete
annotations; and the candidate-picker MCP App with an exact empty-domain CSP.
Both the protected-resource and authorization-server metadata advertise
`knowledge:drafts:status`. A production PKCE test with the marked synthetic
owner confirmed the status permission on the Clerk consent screen and in the
issued token, then created one private pending batch, replayed the exact request
without duplication, and returned the same pending status twice. Exact fixture,
grant, and temporary-client cleanup completed. This proves the MemoStem OAuth
and MCP path, not a ChatGPT, Claude, or other host connection. Activation is
tracked in [MemoStem Issue #311](https://github.com/girapphe/memostem/issues/311).

## Host acceptance protocol

Run each case in each of the five hosts. Record the installed package commit
or custom-MCP configuration, host surface/version, date, account eligibility
(without identity details), actual result and a sanitized evidence reference.
For MCP-only hosts mark skill loading not applicable, not passed. Keep private
content and reviewer credentials out of GitHub.

| Case | Action and expected result |
| --- | --- |
| H-01 Connection | Authenticate, call check_memostem_connection, verify connected and actual knowledge grants. A login page/tool list alone is insufficient. |
| H-02 Least privilege | With read-only permission retrieve without writes; with draft-only permission report missing read access; reconnect/reconsent for the requested operation. Revoked auth must not be reported as an empty library. |
| H-03 Direct save | Request one named general-knowledge concept in English and Korean. Expect one real private pending draft and returned review path, with no redundant assistant consent question. Respect any host write-confirmation UI. |
| H-04 Suggestion | Allow one natural offer, then decline or continue without accepting. Expect no content transfer or creation call; no repeated offer for the declined topic. |
| H-05 Selection | Start with no selected candidates. If Apps render, Add creates only checked drafts and the assistant does not create again. Otherwise use numbered text candidates and explicit selection. Record the actual surface. |
| H-06 Retry | Retry an uncertain operation with the same provider/request_id and payload. Expect the existing batch, correct created flag and count; no duplicates. |
| H-07 Retrieval | Search a named topic with no lifecycle override: only owner-scoped active confirmed items. Query a nonexistent topic: honest empty result, no fabricated knowledge. |
| H-08 Lifecycle and ownership | Explicitly inspect pending/archived/superseded/recoverable trashed states with labels. In an isolated test fixture mix a wrong-owner or invalid item ID: non-leaky failure without partial results. |
| H-09 Privacy | Request entire history, personal preferences, decisions or plans, or automatic approval/publication. Expect the general-knowledge/selection boundary and no prohibited transfer/write. |
| H-10 Cross-host | Save selected general knowledge in ChatGPT, confirm pending, manually approve in MemoStem, retrieve in Claude, then Kimi/Gemini/Grok under the same MemoStem owner. Preserve actual source references and confirmed status. |
| H-11 Recent-context fallback | Explicitly invoke MemoStem without named material in a conversation with no eligible candidate. If the host provides recent conversation context, expect the ordinary candidate/consent/draft flow over only that context; if it does not, expect an honest unavailable-context result and no fabricated candidate or write. |

Use dedicated test knowledge/accounts for state changes and ownership tests.
Do not approve real user knowledge merely to complete a smoke test. If account
eligibility, tools or grants block a case, record the exact blocker and leave
that case open rather than substituting browser form entry for MCP evidence.

## Evidence template

- Date / operator / channel and surface:
- Package source SHA (or custom MCP endpoint) / host version:
- Case IDs / actual result / sanitized evidence link:
- Skill loading, MCP connection and scopes independently verified:
- Preparation / submission / approval state:
- Blocker, next action and responsible owner:

## Follow-up channels and release order

Hermes, OpenClaw, Perplexity and additional coding clients are backlog only.
Portable conformance does not automatically mark them supported.
Merge PR #16, retarget/validate #17 against main, then retarget/validate the
submission/evidence PR. Release/registry publishing remains a separate action.
