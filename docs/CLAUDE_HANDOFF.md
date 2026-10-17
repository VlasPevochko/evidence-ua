# Evidence UA — continuation handoff, 2026-10-17

## Start here

Continue the existing project. GitHub `VlasPevochko/evidence-ua` is the source of truth. Fetch current GitHub state before editing. Continue branch `codex/consolidate-site-updates` and its consolidation PR; do not restart from the old Sites checkout. The owner asked to preserve this work in GitHub so Claude can continue after the Codex usage limit.

Do not merge to protected main or deploy without explicit owner approval. Read `docs/DEPLOYMENT.md`, `docs/NORTH_STAR.md` and current Issue #17; historical deployment statements in documents may need re-verification against current GitHub and Sites.

## Owner-selected scope

Combine these existing PRs, preserving their history and existing modules:

| PR | Work | Integrated source head |
|---|---|---|
| #16 | North Star and future architecture documents | `4d7bc446fe53b88a7e6c80dfa6b66287af8add8c` |
| #15 | Evidence Atlas, shoulder and knee pain maps | `832102519aa597997678b9e68838f3547708c180` |
| #13 | Glossary and editorial transparency | `b70b9436c689f87b98e8d02ae5685ec1acdf2850` |
| #5 | Balanced video caption chunks | `d8ff0f782c02cc46e20ba16f2eb96ee2f86bfb83` |

Baseline main: `cefe1149d5e576f9af90b8151848507aefeb57a1`. Four merges completed without textual conflicts; local integration head before browser fixes was `aba0940d4a19847c2c79248ea618c0ebf2969d28`.

Explicit exclusions:

- Do not touch `feat/video-publish-pipeline` or its three unique commits (`2157b69`, `48d4c2f`, `9925e93`).
- Do not import old Cell layout PR #8 or the old local Sites checkout. Owner considers the old “Покращити мій сайт” work probably obsolete.
- PR #19 (ECC manual review checklist/evaluation) remains separate. No ECC plugin, hooks, MCP or new skill was installed.
- No personal local `video-edit` media was uploaded; it is separate from the repository's Video Factory.

## Product and scientific boundaries

Current phase: Foundation + Interactive Evidence. One structured Evidence Base feeds pages, Atlas, Labs, video and later services. Content does not belong to pages; pages are assembled from knowledge. Future exercise/library/physiology documents in #16 are plans, not authorization to build all future layers now.

Preserve scientific modules and authored `dist/`. Do not invent PMID/DOI, citations, sample sizes, doses, effect sizes or confidence intervals. Mechanism is not a demonstrated human outcome; association is not causation; a pain location is not a diagnosis.

## Integration fixes already applied

Browser verification found and reproduced issues in the incoming Atlas:

1. Shoulder view switching lost keyboard focus after a scheduled map rerender; both maps also replaced focused hotspot controls.
2. Six hidden body-zone buttons remained displayed/tabbable because author CSS overrode the HTML hidden attribute.
3. At 390×844, the shoulder safety explanation extended beyond the clipped figure panel (rule bottom ~616 px, panel bottom ~452 px in the observed viewport).
4. View tabs lacked `aria-selected` state.

Changes in `dist/shoulder-pain-map.js`, `dist/knee-pain-map.js`, `dist/atlas-coordinate-map.css`, and `dist/atlas.html` preserve focus across rerenders, expose selected tabs with roving tab stops, restore focus to the body-zone button on return, honor hidden body controls, and let pain maps determine their own height. Asset query versions were bumped after the browser reused old cached resources. No scientific copy was changed.

## Checks performed and remaining

Before Atlas fixes: full retained build passed (107/107 files), all 36 website test files passed. Video: all 29 tests, TypeScript checking and ESLint passed after `npm ci --no-audit --no-fund` in `video/remotion`. Lockfile was not changed. npm reported the existing ESLint deprecation and an esbuild lifecycle approval warning; no broad dependency update was attempted.

Browser RED → GREEN was observed for four real DOM checks at 390×844: focus remains on selected shoulder view after ArrowRight; hidden body buttons have display:none; the shoulder explanation fits its panel; selected view exposes aria-selected=true. Also verified repeated ArrowRight to posterior, keyboard activation of scapular hotspot with focus retained, return focus to shoulder zone, then switching to knee and ArrowRight to medial with the shoulder map hidden and no visible hidden body buttons.

These browser checks are manual and are not claimed as automated CI coverage. Repeat them in a real browser after changes. Existing website tests are largely static/contract checks and missed these browser defects.

A full build/test rerun after the fixes was started before this handoff. Check the consolidation PR's exact-head GitHub results for the final outcome. Do not treat the earlier green run as proof for a later commit.

An independent reviewer identified the browser candidates but hit a usage limit before delivering a final verdict. A completed independent review is still required; do not claim it passed.

Remaining work:

1. Verify current branch/head, CI and any concurrent changes to the four source PRs.
2. Finish independent review and repeat mobile/desktop Atlas checks, glossary keyboard/Escape/focus behavior on sleep and movement pages, and visual Remotion caption review.
3. Show the owner the combined site and video preview. The local Atlas was shown; a full walkthrough and video visual verification are not yet complete.
4. Obtain explicit approval before merging the consolidation PR or publishing to Sites. This branch does not update production by itself. Preserve source branches until integration is confirmed.

## Local commands

Website root has no npm dependencies. Use Node 24 and Python 3 with lxml 6.1.1 available as `python`:

```sh
node scripts/build-site.mjs
node scripts/test-site.mjs
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Preview `/atlas.html`, `/sleep.html`, `/movement.html`, and `/index.html`.

Video is a separate subproject:

```sh
cd video/remotion
npm ci
npm test
npm run typecheck
npm run lint
npm run studio -- --port=4174
```

Open Remotion Studio and select `CreatineJourney`. Full Video Factory CI includes composition smoke checks, representative stills and an MP4 render. Local servers are temporary conveniences, not deployment or durable storage.
