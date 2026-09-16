---
name: memostem-proactive-capture
description: Use when the user asks to save selected, independently teachable knowledge from this conversation to MemoStem as atomic memos, flashcards, or drafts, or when offering to capture such knowledge; verify the OAuth MCP connection, then create private pending drafts after clear consent.
metadata:
  short-description: Offer consent-first MemoStem capture
---

# MemoStem proactive capture

Notice independently teachable general knowledge in the current conversation
and offer to keep it at a natural stopping point. When the user already asks to
save named material, that request is consent: proceed to connection verification
and a real MCP creation call without asking again.

## Decide whether to offer

Offer only when all of these are true:

- The current exchange contains a factual concept, mechanism, general
  procedure, comparison, evidence-backed claim, knowledge question, historical
  event, or language expression that can be taught independently.
- The exact material can be named in one short clause.
- The answer is complete enough that the offer does not interrupt the user's
  task.
- MemoStem's draft-creation MCP tool is available.

Personal or company decisions, product principles or policies, pricing-choice
rationale, preferences, plans, tasks, reminders, meeting outcomes, project
status, and autobiographical facts are not eligible. Do not disguise them as
general knowledge. Also exclude casual conversation, one-off lookups, secrets,
credentials, authentication data, sensitive material, and anything the user
said not to retain. Do not inspect older conversations, hidden prompts, ambient
files, or unrelated workspace content to find a candidate. A lesson the user
explicitly quotes into the current conversation can be selected; do not send
the older conversation or its history as provenance.

## Ask once and wait

Ask one brief, benefit-focused yes-or-no question in the user's language. Name
the knowledge rather than asking the user to understand cards or tool names.
For example:

> 방금 설명한 이벤트 기반 서버와 게임 시뮬레이션 루프의 차이를 복습할 수 있게 MemoStem에 초안으로 남길까요?

Make at most one offer per topic. Do not repeat it after a decline. A standing
request to remember useful things authorizes future offers, not automatic
writes.

The offer itself is not consent. Call a creation tool only after:

- a clear affirmative reply to that specific offer; or
- a direct user request that identifies the current-conversation material to
  save.

Silence, continued discussion, an unrelated affirmative, or mere connection of
the MCP server is not consent. If the requested selection is ambiguous, ask the
user to narrow it before any write.

## Verify the plugin connection

1. Discover MemoStem's installed MCP tools and call
   `check_memostem_connection` with `{}`. Installation, a setup link, a tool
   listing, or an open MemoStem browser tab is not a successful connection test.
2. Require a successful result with `status: "connected"` and
   `knowledge:drafts:create` in `granted_scopes` before creating drafts. If this
   permission is absent, reconnect with that scope; do not request broader
   permissions for this task.
3. In Codex, when OAuth is missing or expired, use the installed connection's
   login flow: `codex mcp login memostem --scopes knowledge:drafts:create`.
   Let the user complete sign-in and consent in the OAuth page. Never ask them
   to paste credentials, an authorization code, or tokens into the conversation.
   Reload the plugin or start a new task if the host has not loaded its tools,
   then repeat the connection test. In Claude Code, use `/mcp` to authenticate
   the MemoStem connection. Other hosts use their connector's OAuth flow.
4. If MemoStem MCP tools remain unavailable, explain the connection step and
   that no draft was confirmed. Do not replace plugin capture with browser form
   entry, a direct database write, or an invented tool result. A browser may be
   used for OAuth or the returned review page.

## Create concise, independently teachable drafts

After consent and a successful connection check, call
`create_knowledge_bundle_drafts` with only the selected material. A request to
create both atomic memos and flashcards authorizes both formats; otherwise do
not create duplicate formats or extra bundles just to reach a target count.

- An atomic memo is one `knowledge_type: "concept"` bundle: a standalone title,
  one central question, and a short definition. Add only necessary key points
  or an example. Avoid references such as "as above" or "this platform" without
  naming the subject.
- A question-and-answer flashcard is one `knowledge_type: "question"` bundle.
  Put one retrieval question in `central_question` and
  `structured_content.question`, its concise answer in `answer_summary`, and
  set `structured_content.status: "answered"`. This is a knowledge-question
  draft, not a separate `flashcard` schema or automatic practice enrollment.
- For either format, include `knowledge_scope: "general_knowledge"`, `title`,
  `central_question`, `summary`, `topic`, `tags`, `bundle_schema_version: 1`,
  and `structured_content` with a `type` matching `knowledge_type`. Use distinct
  `client_bundle_id` values. Do not invent fields such as `front` or `back`.
- Set `provider` to the actual host (`other` for Codex; `chatgpt`, `claude`, or
  `gemini` for those hosts). Generate one opaque `request_id` for this logical
  save operation and retain it together with the exact payload for retries.
  Use `provenance.type: "current_conversation"` and an opaque
  `conversation_ref` for this conversation; generate an opaque reference if
  the host does not supply one. IDs contain only letters, digits, `.`, `_`,
  `:`, or `-`, never conversation text.
- Read the packaged [concept and question example](references/atomic-memo-flashcard.json)
  for the complete object shapes, then follow the live tool schema if it has
  changed. Replace the example IDs and content; never submit the fixture as a
  user's selection. Use at most 50 bundles per call and keep each idea concise.
- Provenance uses selectors only. Never send a transcript, message history,
  secrets, credentials, hidden content, or material inferred from another
  conversation. Omit optional evidence unless its source or selector is known;
  do not fabricate evidence. `create_card_drafts` is a compatibility fallback
  for concept drafts only, not a way to flatten a requested question bundle.

## Confirm the result without duplicating it

Read the real tool response. A successful bundle response has `status:
"pending"`, `batch_id`, `bundle_count`, `created`, and `review_path`;
`create_card_drafts` uses `draft_count` instead. Check that the count matches
the submitted selection. Report that the drafts are private and pending, give
the returned count and review path on `https://www.memostem.com`, and do not
describe them as approved, canonical, published, or added to practice.

If `created` is false, report the existing batch rather than new drafts. For
a timeout or uncertain result, retry only with the same provider, `request_id`,
and unchanged payload. Do not generate a new ID to bypass an error or an
uncertain save. If the call has `isError`, authentication fails, the result is
missing, or the count is inconsistent, explain exactly what was and was not
confirmed. Never simulate successful capture or say cards were added merely
because OAuth completed.
