# Security policy

## Public repository boundary

This repository must contain only MemoStem plugin manifests, skills, MCP client
metadata, validation, and documentation. Do not commit application source,
server implementation, database schemas or dumps, migrations, environment
files, access tokens, API keys, private URLs, user data, logs, screenshots with
credentials, or generated authentication state.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting for this repository. Do not place
tokens, personal data, exploit details, or private MemoStem source in a public
issue.

If a MemoStem token is exposed, revoke it immediately in MemoStem and rotate
any related provider credential. Repository history removal is not a substitute
for rotation.

## MCP safety

The remote endpoint is a trust boundary. Clients should require approval for
write-capable calls, treat an assistant suggestion as non-consent, wait for a
clear affirmative reply to the specifically named material, send only that
current-conversation selection, and keep authentication values outside tracked
files. They must not propose or send secrets, credentials, sensitive personal
material, full transcripts, or older conversation history. Installing this
plugin does not grant access to any MemoStem account or infrastructure.
