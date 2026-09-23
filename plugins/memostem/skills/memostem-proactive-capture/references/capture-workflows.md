# Capture selected, useful knowledge

Use this guide for explicit save requests, candidate selection, or an accepted
specific offer. The consent and privacy rules in SKILL.md apply to every path.

## Select before creating

1. Identify one independently teachable idea per candidate. Prefer the smallest
   useful set over a fixed quota. Exclude personal decisions, tasks, project
   status, secrets, sensitive material, and anything marked do not retain.
2. If the user names the material and asks to save it, proceed without another
   confirmation. If the user asks for candidates, offer short numbered titles
   and a sentence describing each; start with none selected.
3. Use `review_knowledge_bundle_candidates` when available after the required
   authenticated connection check. Preview is not storage. In an MCP Apps host,
   the user's Add action saves only checked candidates; do not save them again.
   With text fallback, wait for their explicit selection before creation.
4. Before account connection, use the guest flow only for selected eligible
   current-conversation material. Keep the workspace token private. After
   connection, require draft-creation permission for account drafts.

## Make the selected idea stand alone

- Name the concept in the title and central question. Replace phrases such as
  “the approach above” with the actual subject.
- Keep one claim or mechanism per concept, with only the conditions and example
  needed to understand it. Retain uncertainty from the original explanation.
- Choose a concept bundle for an atomic memo or an answered question bundle
  for a question-and-answer draft. Do not create both unless requested.
- Use the existing [payload examples](atomic-memo-flashcard.json) and live schema.
  Replace fixture content and IDs. Do not invent citations or evidence.
- When an existing item may need updating, follow the bounded retrieval and
  resolution proposal instructions in SKILL.md. A proposal remains a pending
  draft for owner review; it does not change the existing item.

Optional `validate_knowledge_bundle` or `preview_knowledge_bundle` calls can
check a selected bundle before storage. Both are transient, not successful
capture and not consent for a later write. Report the real creation response
and point to the returned review page. Use [recovery](recovery-workflows.md)
when a result is missing or uncertain.

## Examples, boundaries, and corrections

For a selected concept, consider all three learning aids. Prefer one concise,
useful entry in each field when the selected material supports it:

| Field | What to write |
| --- | --- |
| `examples` | A concrete instance and a short explanation of why the definition applies. |
| `non_examples` | A nearby case that does not meet the definition, with the distinguishing boundary. This is not merely an unrelated opposite. |
| `misconceptions` | Objects with `claim` (the mistaken interpretation) and `correction` (the accurate replacement and a short reason). |

For an authoritative game loop, an example is a server processing player inputs
and distributing its accepted world state. A client rendering received state is
a non-example because rendering does not make that client authoritative. A
misconception is that every client independently decides the accepted shared
state; the correction is that the authoritative server decides it, even if
clients predict locally. The [worked payload](atomic-memo-flashcard.json) shows
these fields together.

These are quality guidance, not a quota. Keep `[]` when a useful entry is absent,
uncertain, or unsupported by the selected explanation. Do not invent empirical
claims, sources, citations, or conversation history to fill a field. Never imply
the user personally holds a misconception. Preserve uncertainty and selection
scope; these fields enrich the same selected pending card and do not authorize
extra cards or automatic approval. Other bundle types follow their own live
schema; do not add concept-only fields to question bundles.

## Requests that work

| English | 한국어 | Expected behavior |
| --- | --- | --- |
| Save the explanation of why cooling air forms droplets as one concept draft. | 공기가 식으면 물방울이 생기는 이유를 개념 초안 하나로 저장해 줘. | Save only that explanation; the request is specific consent. |
| Show candidates from the concepts we just discussed; let me choose. | 방금 이야기한 개념 중 저장할 후보를 보여줘. 내가 고를게. | Present candidates with none selected; wait for selection. |
| Save only candidates 1 and 3 as question-and-answer drafts. | 후보 1번과 3번만 문답 초안으로 저장해 줘. | Create exactly those question bundles, then report pending review. |

A bare “remember useful things” allows future offers, not automatic capture.
If material is ineligible or unavailable in the provided conversation context,
explain that directly; do not search unrelated files or unprovided history.
