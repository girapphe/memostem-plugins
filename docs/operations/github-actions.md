# GitHub Actions operations

MemoStem's public plugin repository keeps pull-request validation small while
preserving the package boundary, consent contract, and exact `main` revision.

## Validation policy

The `Validate` workflow owns the stable required `plugin` check.

- Draft pull requests do not consume a runner. Marking a pull request ready for
  review triggers the full check.
- A new commit cancels an older in-progress validation for the same pull
  request. Validation is stateless, so superseded work has no state to finish.
- Every ready pull-request revision still runs `npm run check`. Documentation,
  manifests, skills, examples, and registry metadata are all parts of the
  public distribution contract, so there is no docs-only bypass.
- `main` is validated after a merge or direct protected update. This proves the
  exact branch revision rather than relying on an earlier pull-request SHA.
- The job has a two-minute timeout. Normal validation is dependency-free and
  should finish well below that limit.

The `Publish to MCP Registry` workflow is deliberately separate. It runs only
for a published release or an explicit manual dispatch, uses GitHub OIDC, and
does not cancel an in-flight publication. Do not apply the validation
workflow's cancellation policy to registry publication.

## Billing and failure triage

An Actions billing or spending-limit failure happens before a runner starts
and has no job steps or logs. Treat it as an organization billing gate, not as
a plugin validation failure. Check the organization billing dashboard,
payment method, Actions budget, and usage grouped by repository and SKU.

Do not infer workflow cost from a repository-attributed billing total alone.
Compare it with actual workflow job durations; metered platform features such
as Copilot code review can also consume Actions usage. The `Validate` workflow
normally takes seconds, while a large repository-attributed minute total needs
separate product/SKU investigation.

Useful read-only checks:

```bash
gh run list --repo girapphe/memostem-plugins --limit 30
gh run view <run-id> --repo girapphe/memostem-plugins
gh api orgs/girapphe/settings/billing/usage
gh api orgs/girapphe/settings/billing/budgets
```

Changing a budget or payment method is an external organization mutation. It
is not authorized by a code change or Project assignment and must be handled
by an organization billing owner.

## Change checklist

When changing either workflow:

1. Keep the required job identifier `plugin` stable unless branch protection
   is intentionally migrated in the same operation.
2. Run `npm run check` and `git diff --check`.
3. Confirm the pull request's exact head has a successful `plugin` check.
4. After merge, confirm the `main` validation run completed for the merge SHA.
5. For a release, verify registry publication separately; validation success
   does not prove that the MCP Registry accepted or activated the release.
