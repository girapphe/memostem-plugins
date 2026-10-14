# Keep a private guest shelf before connecting

Use this guide when no account is connected and the person asks to save
specific knowledge, or to reopen, fill, or claim an existing guest shelf. The
worth-keeping, writing, consent, and privacy rules in SKILL.md apply first.

## Save to the guest shelf

After a direct, specific save request or clear acceptance of one specific offer,
call `save_guest_knowledge_bundles` with only the selected current-conversation
general knowledge. Use the same structured bundle rules as account capture
([build the payload](capture-workflows.md#build-the-payload)), including
`knowledge_scope: "general_knowledge"`, `provider`, one opaque `request_id`, and
`provenance.type: "current_conversation"`. Keep each logical retry's payload
and request ID unchanged. Never send a transcript, unrelated memory, sensitive
content, or more cards than the ten-card shelf can hold. The shelf expires
after 90 days.

Keep the returned `workspace_token` solely as a private continuation credential
for later `save_guest_knowledge_bundles`,
`refresh_guest_knowledge_shelf_link`, or `claim_guest_knowledge_workspace`
arguments. Never quote, summarize, log, display, or put it in a URL. Only the
separate short-lived `review_url` is meant to be shared with the person. It
opens a mobile or desktop web confirmation screen before the read-only shelf.
Report the actual `persisted`, `card_count`, `remaining_capacity`, and
`expires_at`. Do not call a guest card approved or saved to an account.

## Reopen the shelf

If the person asks to reopen the shelf after its review link expires, call
`refresh_guest_knowledge_shelf_link` with the same private `workspace_token`.
Share only the fresh `review_url`; an earlier review link stops working. Link
refresh creates no card, so do not call `save_guest_knowledge_bundles` again
or report another save. If the workspace token or shelf has expired, explain
that the link cannot be recovered. The web shelf is read-only; connecting an
account moves the cards into the private pending Inbox for review and approval.

## Claim the shelf into an account

When `account_required` is true, explain that the shelf is full. After the
person agrees to connect, call `claim_guest_knowledge_workspace` with the same
private workspace token. Its OAuth challenge starts the host connection flow;
the new grant needs `openid`, `knowledge:drafts:create`,
`knowledge:context:read`, and `knowledge:drafts:status`. After consent, retry
the same claim. Report `claimed_draft_count` and `review_path` only from its
successful response. The claimed cards remain private pending drafts until
the owner reviews them. Do not create a duplicate account draft for the same
guest selection.

## Transient checks

`validate_knowledge_bundle` and `preview_knowledge_bundle` are transient,
account-free checks of exactly one selected bundle; neither saves it. A preview
does not authorize a subsequent save. Use the appropriate consent step before
calling `save_guest_knowledge_bundles`.

For retries and uncertain results, follow [recovery](recovery-workflows.md).

| English | 한국어 | Expected behavior |
| --- | --- | --- |
| Save this explanation without an account. | 계정 없이 이 설명 저장해 줘. | Save only that selection to the guest shelf; share only the review URL. |
| The shelf link expired. Open it again. | 보관함 링크가 만료됐어. 다시 열어 줘. | Refresh the link with the private token; report no new save. |
| The shelf is full. Move it to my account. | 보관함이 꽉 찼어. 내 계정으로 옮겨 줘. | Connect with consent, claim the same workspace, report the real claimed count. |
