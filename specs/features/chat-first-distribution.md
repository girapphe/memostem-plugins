# Chat-first distribution

Owner: Girapphe maintainers. Tracking: https://github.com/girapphe/memostem-plugins/issues/15

## Intent

Your reviewed knowledge, across AI conversations. ChatGPT, Claude, Kimi,
Gemini and Grok are primary channels. Codex and Claude Code remain compatible
secondary channels. Save selected general knowledge in one host, review it in
MemoStem, then retrieve it from another connection to the same MemoStem owner.

## Contract and exclusions

Keep the single memostem-proactive-capture skill, existing installation names,
OAuth scopes, five required tools and schema_version 1 compatibility contract.
Use https://www.memostem.com/api/mcp everywhere. Capture is selected general
knowledge only, private and pending until human approval. No server/DB changes,
new provider enum values, transcript collection or personal memory expansion.
An explicit unnamed MemoStem invocation may fall back from an empty current
conversation to recent conversation context supplied by the host, but it must
not browse unavailable history or bypass the existing selection and consent flow.
No public listing, production release or host support claim without evidence.

## Acceptance and evidence

| ID | Criterion | Verification |
| --- | --- | --- |
| CH-01 | Five chat hosts lead the README; bilingual save/retrieve examples precede coding setup | README and docs/mcp.md review |
| CH-02 | Single skill handles explicit save, consent-first offers and owner-scoped active retrieval with task-specific scopes; an unnamed invocation falls back to host-provided recent context only when the current conversation has no eligible candidate, reports unavailable context, and preserves the existing selection/consent flow | Public instruction regression checks; host cases H-01–H-11 |
| CH-03 | Portable and existing native manifests share name, release, description, endpoint and skill tree | npm run check; Codex and Claude validators |
| CH-04 | Wrong endpoint/transport/version/paths, secrets and maintenance skills are rejected | scripts/validate.test.mjs |
| CH-05 | Existing MCP payload and scope contract still matches private server | Private check:public-plugin-compat with explicit public checkout |
| CH-06 | Three submission kits and five dated channel records distinguish preparation, host testing, submission and approval | docs/directory-submissions.md, docs/submission-readiness.md and docs/channel-status.md; external activation issues |

## Delivery and rollout

Three ordered PRs: guides/skill, portable packaging, submission/evidence.
Start from current public main and preserve unrelated worktrees. Release
versions stay aligned across existing and portable metadata. Only publish a
release after compatibility checks and maintainer release action; this change
does not publish one. Account-dependent tests remain open with blockers.

Hermes, OpenClaw, Perplexity and more coding clients are follow-up channels.
