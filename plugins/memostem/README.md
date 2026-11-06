# MemoStem

Your reviewed knowledge, across AI conversations.

MemoStem helps Claude notice independently teachable knowledge in the current
conversation and ask before keeping a specific selection. Without an account,
you can keep up to ten private cards in a temporary guest shelf for 90 days.
When you connect your MemoStem account, those cards move into your private
pending review, where you edit, merge, save, or ignore them. With read
permission, Claude can reuse only your own confirmed knowledge in later
conversations.

## What this plugin contains

- **`memostem` skill** (`skills/memostem/`): instructions for when to offer a
  capture, how to ask for consent, and how to retrieve confirmed knowledge.
- **Remote MCP connector** (`.mcp.json`): connects to
  `https://www.memostem.com/api/mcp` over Streamable HTTP. Guest capture needs
  no sign-in; account tools use OAuth 2.0 when you choose to connect.

## What is sent, and where

Only the knowledge you explicitly select, or name in a direct save request, is
sent to the MemoStem MCP endpoint above. The plugin never uploads a full
conversation or transcript, never sends secrets or personal material, never
approves drafts automatically, and never publishes your knowledge. Nothing is
sent to any other destination.

## Links

- Connection guide: https://github.com/girapphe/memostem-plugins/blob/main/docs/mcp.md
- Privacy policy: https://www.memostem.com/privacy
- Terms: https://www.memostem.com/terms
- Support: https://www.memostem.com/support or
  [okyong.choi@girapphe.com](mailto:okyong.choi@girapphe.com)
