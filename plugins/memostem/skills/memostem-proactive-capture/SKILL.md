---
name: memostem-proactive-capture
description: Use during an AI conversation when it produces a reusable decision, explanation, procedure, correction, open question, or durable preference and MemoStem MCP is available; proactively offer to save the named idea, then create a private pending draft only after the user clearly agrees.
metadata:
  short-description: Offer consent-first MemoStem capture
---

# MemoStem proactive capture

Remove the need for the user to remember a MemoStem command. Notice a compact,
reusable result in the current conversation, offer to keep it at a natural
stopping point, and wait for clear consent before calling a write tool.

## Decide whether to offer

Offer only when all of these are true:

- The current exchange contains a reusable decision with rationale,
  explanation, procedure, corrected misconception, open question, or durable
  preference.
- The exact material can be named in one short clause.
- The answer is complete enough that the offer does not interrupt the user's
  task.
- MemoStem's draft-creation MCP tool is available.

Do not offer for casual conversation, a one-off lookup, fleeting logistics,
secrets, credentials, authentication data, sensitive personal material, or
anything the user said not to retain. Do not inspect older conversations,
hidden prompts, ambient files, or unrelated workspace content to find a
candidate.

## Ask once and wait

Ask one brief, benefit-focused yes-or-no question in the user's language. Name
the knowledge rather than asking the user to understand cards or tool names.
For example:

> 방금 정리한 출시 결정과 그 근거를 다음 작업에서 다시 쓸 수 있게 MemoStem에 초안으로 남길까요?

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

## Create the pending draft

After consent:

1. Select only the named material from the current conversation.
2. Prefer `create_knowledge_bundle_drafts` and one coherent typed bundle.
3. Add more bundles only when the user selected multiple independently reusable
   items. Never expand the selection merely to reach a target count.
4. Use selector-only provenance. Never send a transcript, message history,
   secrets, credentials, hidden content, or knowledge inferred from another
   conversation.
5. Report that the result is private and pending, and provide the returned
   MemoStem review path. Do not describe a draft as saved, approved, canonical,
   or published.

If authentication or the tool call fails, explain that no draft was confirmed
and give the smallest relevant connection or retry step. Never simulate a
successful capture.
