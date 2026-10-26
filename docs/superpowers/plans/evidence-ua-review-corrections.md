# Evidence UA corrections Implementation Plan

> **For agentic workers:** Execute in the current isolated checkout; keep the progress ledger in `/workspace/scratch/evidence-ua-corrections-progress.md`.

**Goal:** Correct the issues approved after the product assessment without changing scientific conclusions.

**Architecture:** Reuse the shared evidence formatter, catalog, header, learning block and search controller. Preserve the authored `dist` snapshot and regenerate supported outputs.

**Tech Stack:** Node.js 24+, ES modules, Python/lxml, static HTML/CSS; no new dependencies.

**Spec:** `docs/superpowers/specs/evidence-ua-review-corrections-design.md`.

## Global Constraints

- Scientific source modules, Claims, Sources, Evidence Records, confidence and review dates remain unchanged.
- Preserve independent science digest fixture values; normalize only the exact four corrected missing-CI source paragraphs for historical comparison.
- Work in branch `fix/evidence-ua-review-corrections` in the existing isolated cloud checkout; do not create a worktree.
- Keep IDs, existing destinations, local-only operation and reduced-motion behavior.
- Bump affected asset query versions and keep generated outputs reproducible.
- Run shared build/tests sequentially; no simultaneous mutating suites.
- No merge to main or direct deployment without explicit owner approval.

## Review Focus

- Zero is a legitimate interval bound; null, missing, partial, strings and nonfinite bounds are not reported as numeric intervals.
- Moving the learning block must preserve feedback/overview folds, unique IDs, route parameters and hash restoration.
- Removing the duplicate navigation entry must retain all destinations and mobile keyboard/menu behavior.
- Search result activation must retain default navigation and close only for results, not suggestion chips.
- Historical HTML normalization must not conceal scientific text or valid numeric interval changes.

### Task 1: Evidence formatter regression

Files: `src/evidence/core/components.mjs`, new `tests/evidence-intervals.test.mjs`, related cache import versions and narrow historical-rendering comparison helpers/tests.

- [x] Add a real SourceCard/EvidenceDrawer regression using collagen/citrulline records and cases for legitimate zero, absent/partial/nonfinite/string interval bounds.
- [x] Run it and confirm the existing null-to-zero defect causes failure.
- [x] Require both interval bounds to be finite numbers; retain existing missing-interval wording.
- [x] Keep frozen science digests unchanged, adapt historical HTML comparisons only for the four exact corrected paragraphs, and prove the normalizer rejects unrelated modifications.
- [x] Run the new regression and relevant retention checks.

### Task 2: Entry, navigation and search corrections

Files: `src/platform/catalog.mjs`, `learning-ui.mjs`, `site-header.mjs`, `shell.mjs`, `search.mjs`, `scripts/build-platform.mjs`, authored homepage marker placement, relevant existing UI contract tests.

- [x] Add regressions for a single catalog entry, visible routes outside About, the direct digestion destination, consistent catalog wording and result-link dismissal; observe failures first.
- [x] Implement the spec through existing components/styles, preserving all scientific data.
- [x] Update only relevant UI contract expectations with reasons; update browser QA's primary link count to the corrected header.
- [x] Bump affected asset query versions and regenerate supported outputs once integration is ready.
- [x] Run affected tests sequentially.

### Task 3: Validation and review delivery

Files: `tests/smoke-check.test.mjs`, documentation of the corrective review and changed files.

- [x] Retain the observed failing negative syntax test, give its fixture the real site's explicit ES module type, and verify it now catches invalid JavaScript.
- [x] Run `npm run check`; inspect failures and resolve setup or implementation causes.
- [x] Rebuild and verify generated output is identical; check source/fixtures diffs.
- [x] Have an independent reviewer inspect the complete branch; address material findings and revalidate affected checks.
- [ ] Commit, push a dedicated branch and create a PR where access permits. Report exactly which steps succeeded; leave merge to the owner.
