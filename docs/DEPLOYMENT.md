# GitHub source of truth and Sites deployment

## Source of truth

`VlasPevochko/evidence-ua` is the canonical repository. All website changes start in a branch from current `main`, pass website build/tests, and go through a PR. Merge requires the owner's explicit approval. Do not edit or import the old Sites checkout as the current source. Sites remains the production host and a deployment destination.

Keep the **entire tracked `dist/` directory**. It contains authored HTML, CSS, JavaScript and assets that cannot be reconstructed from `src/`. Never delete `dist`, run a clean build that replaces it, or publish only the generated JavaScript. The server document root is the contents of `dist/`.

## Verified hosting, 2026-10-14

- Production: <https://evidence-ua.surecrow3.chatgpt.site>, OpenAI Sites, public access.
- Existing Sites project: `appgprj_6ac7f3c091bc8191938b21dc533c67c8`.
- Sites reports live v76 with source `87f37ffdcf58209aa97f44411b52084fa2d04052`.
- Audited GitHub main: `c27ec4b3fe9cdaf9fd240285b744c272d50200a2`; README_IMPORT describes imports through v73.
- GitHub Pages is not enabled; GitHub deployment history is empty. No provider deploy configuration or Sites hosting metadata was imported.
- The root Deno template did not run the documented website build/tests and has been replaced by `site-publish.yml`. The video and voice workflows are independent and remain intact.

The v73/v76 gap was reconciled in the separate `chore/reconcile-live-v76` branch, based on the CI branch from PR #6. Seven reviewed website/build/test files were carried across from the exact v73-to-v76 delta; all scientific source and ten article-subtree digests remain unchanged. The complete built `dist` matches the 78-file live v76 snapshot. Three documentation screenshots were excluded from the runtime change; GitHub's video subsystem, workflows and documents were retained.

Both PRs still require the owner's explicit merge approval. Until the reconciliation reaches `main`, the version gap remains a live-publication blocker. See [the reconciliation audit](RECONCILIATION_V76.md) for exact provenance and checks.

## What this CI publishes

`.github/workflows/site-publish.yml` runs on PRs (including the dependent reconciliation PR), pushes to `main`, and manual dispatch. It uses Node 24, Python 3.12, Git and pinned lxml 6.1.1. Actions are pinned to verified commit SHAs; checkout credentials are not persisted. The workflow has only `contents: read`, uses no production secrets and executes no deployment code on PRs. Publication remains limited to this repository's `main`.

1. `node scripts/build-site.mjs` starts with the complete retained `dist`, runs `build-evidence.mjs` and `build-knowledge.mjs`, and rejects removed files or changed authored files outside the explicit generated-output list.
2. `node scripts/test-site.mjs` runs every `tests/*.test.mjs` sequentially against the built site. Every file receives a fresh temporary copy and its own Git index. Test mutations never reach the publish directory.
3. Only successful runs on this repository's `main` upload `evidence-ua-dist-<commit>` and `evidence-ua-provenance-<commit>`, retained for 30 days. Hidden files inside `dist` are included. A manual dispatch on another branch verifies only.

The first ZIP contains the complete static document root. The second contains `manifest.json`: GitHub commit, file count, file sizes, SHA-256 hashes and changed generated files. Download both from the successful Actions run for the exact `main` commit. Verify the manifest against the unpacked files before publication. Artifacts are build outputs, **not a Sites deployment**; a green CI result does not change the live URL.

## What remains for automatic live publication

Keep Sites, as requested. The currently available Sites connector publishes saved versions through authenticated connector calls and issues short-lived Git credentials. Its opt-in publish-on-push capability is time-limited and owner-private; it is not a verified persistent GitHub Actions integration for this public site. Do not place a temporary connector token in GitHub Secrets or invent a Sites deployment API.

The owner still needs to establish a supported unattended connection from GitHub to Sites: either a documented Sites GitHub integration that follows this repository's `main`, or an authenticated publication service with a documented CI contract and credential-renewal mechanism. No such integration is configured or verified in this PR.

That connection must:

- accept only a successful run for a reviewed current `main` commit, and ignore PR/fork events;
- consume the **complete** dist artifact and validate its provenance hashes;
- bind to the existing project ID, retain public access, and add the existing project's verified hosting manifest when packaging requires it (`static.directory: dist`);
- synchronize the exact approved GitHub-derived source/build state to Sites as a deployment mirror, save that exact state as a version, publish it through supported Sites operations and verify the final deployment status;
- record both the GitHub source commit and the resulting Sites version/deployment IDs, fail on stale source or concurrent changes, and store credentials outside source and publish artifacts.

The imported repository deliberately ignores `.openai/`. Project identity was verified read-only; no hosting manifest, source push, saved version or production deployment was changed here.

Once the integration is documented and the v73/v76 gap is reconciled, add its provider-specific deploy job to this workflow with a `needs: verify` dependency, a guard for this repository's `main`, an appropriate GitHub Environment and only the permissions that its supported contract requires. A one-time connector publication can publish an approved artifact, but does not provide automatic deployment on future merges.

## Repository settings and operation

After reviewing and explicitly approving merge, enable GitHub Actions if disabled and allow the pinned official actions. On `main`, configure a rule requiring PRs and the stable `Website build and tests` check, prohibit force pushes and deletion, and disable bypass/direct pushes as appropriate. These repository settings are recommendations; this PR does not change them or claim they are active.

For rollback, select a previously successful GitHub commit and its verified artifact, create a GitHub revert PR when needed, and publish that reviewed state through the supported Sites connection. Sites version rollback should be recorded against the corresponding GitHub commit; it must not make the old Sites checkout the editing source again. Rebuild expired artifacts from the exact Git commit; never substitute files from a newer run.

## Local verification

From the repository root, with Node 24, Git and Python 3 plus lxml available:

```text
node scripts/build-site.mjs
node scripts/test-site.mjs
```

Python must be available as `python`; the test runner sets `PYTHONUTF8=1` for its children on all platforms. The root website has no npm dependencies. Remotion is a separate subproject and is not installed or rendered by website CI.

The two former historical-Git dependencies now use authentic independent fixtures, recovered read-only from the exact original Sites commits. See [fixture provenance](../tests/fixtures/README_BASELINES.md). CI needs neither Sites credentials nor the old Git history.

## GitHub Pages (optional, owner-enabled)

> The stock GitHub "Deploy Jekyll with GitHub Pages" template (`jekyll-gh-pages.yml`) was removed: it published the repository root through Jekyll instead of the verified `dist/`, and shared the `github-pages` environment and `pages` concurrency group with the job above. Use only the `deploy-pages` job in `site-publish.yml`.

`site-publish.yml` can also publish the verified `dist/` to GitHub Pages, so the live site does not depend on any outside account. It is **off by default**: both the packaging step and the `deploy-pages` job are skipped unless the repository variable `PAGES_ENABLED` is `true`. Nothing changes on Sites.

What runs when enabled: only for a push to this repository's `main`, after the `verify` job (build plus every test) has passed, the exact tested `dist/` is uploaded with `actions/upload-pages-artifact` and deployed with `actions/deploy-pages` (both pinned to commit SHAs). Pull requests and forks never deploy. The job has only `pages: write` and `id-token: write`; no secrets are used.

Owner setup, once:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → Variables → add `PAGES_ENABLED` = `true`.
3. Merge to `main` or re-run the workflow. The address appears in the `github-pages` environment and the job summary; it will be under `https://<owner>.github.io/evidence-ua/`.

All links in `dist/` are relative, so the site works under the `/evidence-ua/` sub-path. A custom domain can be added later in the Pages settings. To turn it off, delete the variable or set it to anything but `true`. Rollback: revert on `main` through a PR; the next successful run republishes that state.
