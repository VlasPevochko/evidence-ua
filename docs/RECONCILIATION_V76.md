# Reviewed v73-to-v76 reconciliation

Audit date: 2026-10-14. GitHub remains the canonical source; this is a reviewed, selective delta, not a replacement of the repository with an old Sites checkout.

## Provenance

- Audited GitHub main: `c27ec4b3fe9cdaf9fd240285b744c272d50200a2`.
- CI parent, PR #6: `31fb54f8d112eae45ea2894bd139cde7a8d46be5`, `chore/github-site-publish`.
- Imported Sites v73: `4c05550cb20cd3c96e9ffeb1c0a2862fbed2f9db`.
- v74: `90af5d9ca7e5bd68f2f8978cf9140e5ac060b2a9`.
- v75: `0f29cd3454e7a3a8f16a0807ec97d177e1d3fa0b`.
- Live v76: `87f37ffdcf58209aa97f44411b52084fa2d04052`.
- Sites reports the v76 publication `appgdep_6acf322ecf188191a9fa2b7d14513835` as succeeded at <https://evidence-ua.surecrow3.chatgpt.site>. The public HTML independently references `home-vcard.css?v=76` and the static directions marker.

The seven selected file blobs in the CI-parent GitHub branch matched v73 before the change (the new CSS was absent). All seven resulting file blobs match v76. No Sites source, saved version, hosting configuration, or deployment was changed.

## Selected changes

| File | Result |
| --- | --- |
| `dist/index.html` | Five direct theme cards appear in the start section without JavaScript; updated navigation/style cache references and a distinct example-question heading. |
| `dist/home-modern.css` | Card-grid responsiveness, including a single column below 380px and compact mobile backgrounds. |
| `dist/home-vcard.css` | Existing live design: sidebar/header treatment, dark surfaces, gold accents, responsive content cards and reduced-motion handling. |
| `dist/navigation-v17.js` | Directions and catalog links; keeps the cards in the start section instead of moving them to the supplement library. |
| `scripts/build-platform.mjs` | Renders the five native-link cards from the canonical catalog with HTML escaping and retains them on rebuild. |
| `tests/evidence.test.mjs` | Checks the updated navigation asset reference. |
| `tests/home-entry.test.mjs` | Requires five direct native links, their order and position before example questions, retaining the independent scientific-content checks. |

Sites-only `docs/previews/home-1440.png`, `home-360.png` and `home-390.png` are reference screenshots, not runtime assets. They were reviewed as inventory but were not copied. No new scientific statements, laboratories or runtime illustrations were introduced in v74-v76.

The source tree's 47 scientific files and the ten direct-body scientific article subtrees are identical. All other runtime files retain their bytes. The final complete `dist` must match live v76 across all 78 paths and blob contents; the build must retain that equality.

The 52 GitHub-only video files, video/voice workflows, editorial skill and GitHub-only documentation are retained. Their absence from Sites is not a deletion request. The prior CI fixtures and test-isolation/build-preservation helpers remain in place.

An additional GitHub-only compatibility fix updates `tests/navigation-flow.test.mjs`: the legacy VM assertion expected literal `block`, while the intentional live v76 router sets `var(--home-layout, block)` so CSS preserves desktop grid and mobile flex. The test now checks that declaration and the linked CSS layout definitions, retaining all article/home visibility assertions. Production runtime files remain identical to v76.

The failure was reproduced before adapting the assertion. Real headless Chrome then verified home → protein article → home at 1440px (`grid`) and 390/360px (`flex`), five direction links at every width, hidden home during the article and hidden article after returning. There were no page runtime errors. External requests were blocked; the browser used the complete local dist snapshot. The navigation audit also found 409 internal link occurrences across eight HTML pages with zero missing targets.

## CI and integration order

The reconciliation PR is based on `chore/github-site-publish`, so its diff contains only the reconciliation and its documentation. The website workflow now verifies PRs targeting any branch, allowing this dependent PR to receive real CI. Its read-only token and guards still prohibit artifact publication from every PR or non-main branch.

Review PR #6, then this reconciliation PR. Merge either only on the owner's explicit instruction. After PR #6 reaches `main`, retarget the reconciliation PR to `main` if necessary and confirm its current CI result before its approved merge. Live publication still requires the documented supported GitHub-to-Sites connection; no merge or deployment is performed by this work.

## Validation requirements

Run `node scripts/build-site.mjs` and `node scripts/test-site.mjs` on this complete branch. Confirm all 78 dist paths remain and match v76, all 26 test files pass, and `src/`, `video/`, `.agents/` plus video/voice workflows have no diff from the CI parent. Verify that GitHub Actions passes for the dependent PR and skips the production-artifact steps.
