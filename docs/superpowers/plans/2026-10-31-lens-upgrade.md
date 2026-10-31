# Lens upgrade implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Remove invisible navigation hits and keep the central action visible on short screens while polishing the approved lens.

**Architecture:** Keep native navigation and the current enhancement lifecycle. Drive progress from stage geometry; guard zero-opacity cards with a scoped pointer state. Apply scroll-driven CSS depth and edge softness.

**Tech Stack:** HTML, CSS masks/transforms, JavaScript ES modules, Node 24 test runner, existing Chromium CI.

**Spec:** docs/superpowers/specs/2026-10-31-lens-upgrade-design.md

## Global Constraints

- Preserve hero, all six canonical hrefs, scientific records, fallback OPEN, keyboard use, reduced motion, reversible art and sticky discovered links.
- No new dependencies, autonomous animation loop, scroll interception, merge or production deployment.
- Edit generated controller through src/platform/home-lens.mjs and markup through home-directions.mjs; refresh asset cache versions.

## Review Focus

- 844×390 and 390×667: the fading-in central button remains within the viewport.
- Zero-opacity cards reject pointer input while native Tab reveals usable links.
- No-JS, reduced motion and observer failure restore usable default content.
- Fast scroll, reverse scroll, bfcache and cleanup do not leave stale pointer gates.
- Enlarged text and 360/390 px: readable labels, no clipping or horizontal overflow.

### Task 1: Lens behavior, visual polish and delivery

**Files:** src/platform/home-lens.mjs; src/platform/home-directions.mjs; dist/home-lens.css; dist/index.html; generated dist/home-lens.js; tests/home-lens.test.mjs; tests/home-lens-layout.test.mjs; scripts/browser-qa/run.mjs; docs/HOME_LENS_UPGRADE_REPORT.md.

**Interfaces:**
- Consumes: lensProgress(top, viewportHeight, targetHeight), native stage and canonical topic anchors.
- Produces: stage-based reveal, per-card pointer guard, unchanged mountHomeLens/dispose and native hrefs.

- [ ] Add a distinct stage rect to the unit fixture and regressions for short-screen timing, zero-opacity card state, keyboard reveal and disposal.
- [ ] Run node --test --test-concurrency=1 tests/home-lens*.test.mjs. Expected: new stage/pointer regressions fail on main.
- [ ] Read progress from stage; set/remove scoped card pointer guards; preserve all lifecycle fallbacks.
- [ ] Add core lift/scale, soft open edges and readable non-repeated labels. Refresh CSS/JS cache versions and update the existing wiring contract.
- [ ] Update real-browser regression coverage for invisible hits, stage-based timing, short viewports and enlarged text; retain existing flows.
- [ ] Build, run the focused tests, then npm run check. Expected: all green, only scoped changes.
- [ ] Verify in the supported browser, capture before/after, obtain a fresh read-only whole-branch review and address important findings.
- [ ] Commit, push a feature branch, open a PR and inspect its CI. Expected: reviewable PR, main untouched.
