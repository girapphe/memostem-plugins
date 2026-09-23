# Check status and recover without duplicate drafts

Use this guide for a known submission, a connection problem, or an uncertain
save. Follow live tool schemas; do not invent an approval or recovery tool.

## Read a submitted batch

1. Reuse the `batch_id` from the actual creation response or the user's explicit
   selection. If it is missing, ask for the batch identifier or direct the user
   to the already returned review page. Do not guess an ID or create another
   batch just to check status.
2. Check the authenticated connection and require `knowledge:drafts:status`
   before calling `get_draft_batch_status`. Read status does not require a new
   creation call. Missing scope needs the host's reconsent flow.
3. Report only returned counts and states. Pending means awaiting owner review.
   Approved, merged, updated, or ignored report actions the person completed
   in MemoStem, not actions this skill performed. If only some results are
   available, do not claim the whole batch is resolved.

## Recover the original operation

| Observed result | Next action |
| --- | --- |
| Tool missing from the host | Explain how to reload or connect the installed plugin; state that no save was confirmed. |
| OAuth absent or expired | Use the host's login/reconsent flow, then check the required scope again. Never request tokens or codes in chat. |
| Creation timed out or its response is missing | Retry only the same provider, request ID, and unchanged payload. If the original payload or ID is unavailable, stop the retry and explain the uncertainty. |
| `created` is false | Report the existing batch from the response; do not describe it as newly created. |
| Count differs from the selected count or response has `isError` | Report the inconsistency and what is actually confirmed. Do not invent missing drafts or retry a modified selection automatically. |
| A proposed merge target has a stale version | Refresh only the selected context and let the person review the revised proposal; do not guess a replacement target or claim a merge happened. |

Do not use a new request ID to bypass an uncertain write. Status polling is for
an already known batch; it cannot reconstruct a missing request identity. A
new, intentionally changed selection is a separate operation and must be
clearly authorized as such.

For a guest save, retain the same private workspace token and unchanged request
payload for retries. Never display the token. Share only the returned review
URL. If the guest shelf is full, explain capacity and follow the consented
connection and claim flow from SKILL.md; do not duplicate its cards as a fresh
account submission. Guest persistence and claim results must be read from the
real response, never inferred from a completed OAuth page.

| English | 한국어 | Expected behavior |
| --- | --- | --- |
| Check whether the draft batch we just saved is still pending. | 방금 저장한 초안 묶음이 아직 검토 대기인지 확인해 줘. | Read status for the known batch with status permission. |
| The save timed out. Retry that same selection. | 저장 요청이 시간 초과됐어. 같은 선택을 다시 시도해 줘. | Reuse the exact original request identity and payload. |
| Did connecting my account approve those cards? | 계정을 연결하면 그 카드들이 승인된 거야? | Explain that connection is not approval; consult actual claim or batch status if available. |
