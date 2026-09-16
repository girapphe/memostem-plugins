# Public plugin boundary

This repository distributes the user-facing MemoStem plugin. The plugin's
`skills/` directory must contain only `memostem-proactive-capture`.

Developer maintenance skills belong in the private application repository.
Never copy or publish them in this repository, even with checkout requirements,
credential guards, or maintainer-only descriptions. Keep this boundary when
synchronizing plugin content from the private repository.

Preserve the consent-first OAuth capture workflow. Run `npm run check` before
delivery; it validates the allowlist and tests rejection of maintenance skills
and unknown skills.
