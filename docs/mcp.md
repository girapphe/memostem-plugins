# MemoStem MCP connection guide

## Endpoint and tools

The production Streamable HTTP endpoint is:

```text
https://www.memostem.com/api/mcp
```

It currently exposes:

- `create_knowledge_bundle_drafts`
- `create_card_drafts` for compatibility
- `get_topic_context`

Creation tools save only private pending drafts. They do not auto-approve
knowledge or write to the public graph. Context reuse requires a separate read
scope and an explicit or bounded selection.

## ChatGPT and OpenAI API

For a ChatGPT custom app, register the endpoint above and use the service's
OAuth flow. Do not paste a MemoStem personal access token into ChatGPT's browser
settings.

For a server-side Responses API integration, keep both tokens in environment
variables and require approval for every MemoStem tool call:

```js
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL,
  input: "Save the selected ideas to MemoStem as pending drafts.",
  tools: [
    {
      type: "mcp",
      server_label: "memostem",
      server_description: "Create reviewable private knowledge drafts and recall approved MemoStem knowledge.",
      server_url: "https://www.memostem.com/api/mcp",
      authorization: process.env.MEMOSTEM_MCP_TOKEN,
      allowed_tools: [
        "create_knowledge_bundle_drafts",
        "create_card_drafts",
        "get_topic_context"
      ],
      require_approval: "always"
    }
  ]
});

console.log(response.output_text);
```

`OPENAI_API_KEY`, `OPENAI_MODEL`, and `MEMOSTEM_MCP_TOKEN` must be supplied by
the caller. Never commit their values.

## Claude Code

The installed plugin registers the OAuth-capable endpoint without a stored
secret. Run `/mcp` to inspect and authenticate it.

For a PAT-based user override, keep the token in the environment and add a
higher-precedence user-scoped connection:

```bash
export MEMOSTEM_MCP_TOKEN='replace-in-your-shell-only'
claude mcp add-json memostem '{"type":"http","url":"https://www.memostem.com/api/mcp","headers":{"Authorization":"Bearer ${MEMOSTEM_MCP_TOKEN}"}}' --scope user
```

Do not place the expanded token in `.mcp.json`, shell history, screenshots, or
issues. Revoke it in MemoStem if it is exposed.

## Privacy and trust boundary

- Send only content the user deliberately selected from the current
  conversation.
- Never send a full transcript, archive, hidden system prompt, unrelated files,
  or ambient workspace context.
- Draft creation is not approval. Review, edit, merge, update, ignore, or save
  every candidate in MemoStem.
- The plugin repository contains only connection metadata and workflow
  instructions. The hosted private application enforces authentication,
  authorization, owner scoping, rate limits, and persistence.
- Treat all remote MCP servers as trusted-code/data boundaries. Keep tool-call
  approval enabled when using a client that supports it.

Official references:

- [OpenAI MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference)
