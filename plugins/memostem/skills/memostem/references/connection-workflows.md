# Get started and verify the connection

Use this guide for a getting-started request, an account connection, or the
connection check before account drafts or retrieval. The consent and privacy
rules in SKILL.md apply to every path.

## Get started in the user's language

For a general getting-started request with no named topic, prefer `start_memostem`
when available. Pass the conversation language as `locale`, then the host locale,
then English when neither is available. The tool shows a localized welcome view
before account connection or owner topic labels after read authorization.
Explain guest capture without requiring OAuth. Let the person choose its Connect
button; in a text-only host, call `connect_memostem` only when they ask to connect
or grant read permission. A challenge or cancelled flow is not a successful
connection. Retry after connection completes.

Show returned topic labels or empty-state guidance without fetching knowledge
bodies or creating drafts. Starting or connecting never supplies capture consent.
Never treat a welcome view or topic list as proof of draft-creation permission.

If these tools are unavailable, explain how to save selected general knowledge
in the guest shelf. When the person requests account access, follow the connection
check below, then call `list_knowledge_catalog` if available. Show returned topic
labels and ask which topic to explore. If the catalog is empty, say so and explain
how selected knowledge can become a private pending draft. Do not invent topics
or require account access merely to explain getting started.

## Verify the plugin connection

1. Discover MemoStem's installed MCP tools and call
   `check_memostem_connection` with `{}`. Installation, a setup link, a tool
   listing, or an open MemoStem browser tab is not a successful connection test.
2. Require a successful result with `status: "connected"` and
   `knowledge:drafts:create` in `granted_scopes` before creating account drafts.
   If this permission is absent, reconnect with that scope; do not request
   broader permissions for this task. Retrieval instead requires
   `knowledge:context:read`; status checks require `knowledge:drafts:status`.
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

For an unconnected client, do not require this OAuth check before guest capture.
`check_memostem_connection` is available but requires an authenticated owner;
its anonymous authorization challenge is not proof that guest capture failed.
Use the [guest shelf guide](guest-shelf-workflows.md) instead.

| English | 한국어 | Expected behavior |
| --- | --- | --- |
| How do I get started with MemoStem? | MemoStem 어떻게 시작해? | Call `start_memostem` with the conversation locale; do not save or fetch knowledge. |
| Connect my MemoStem account. | MemoStem 계정 연결해 줘. | Use the host OAuth flow, then check the connection; connecting saves nothing. |
