# Public plugin boundary

This repository distributes the user-facing MemoStem plugin. The plugin's
`skills/` directory must contain only `memostem-proactive-capture`.

Developer maintenance skills belong in the private application repository.
Never copy or publish them in this repository, even with checkout requirements,
credential guards, or maintainer-only descriptions. This public repository is
the sole source for distributable plugin files; do not synchronize a second
authoring copy from the private repository.

Preserve the consent-first OAuth capture workflow. Run `npm run check` before
delivery; it validates the allowlist, the machine-readable compatibility
contract, and rejection of maintenance skills and unknown skills.
