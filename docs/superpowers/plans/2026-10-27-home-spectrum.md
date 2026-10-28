# Home Spectrum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Track completed steps with checkboxes.

**Goal:** Implement the owner's selected cosmic question-led homepage with a scroll-responsive wave, real navigation and reversible delivery.

**Architecture:** Retain the static site and shared catalog/search/header. Render a small canonical hero fragment from src/platform, keep authored CSS and an isolated motion module, and scope changes to the home route. Preserve every scientific article subtree and existing build markers.

**Tech Stack:** Node 24, authored HTML/CSS, native browser JavaScript and Canvas 2D; no new runtime dependencies.

**Spec:** docs/superpowers/specs/2026-10-27-home-spectrum-design.md

## Global Constraints

- Ukrainian UI; chosen concept is «Спектр запитань», not «Орбіти знань».
- Main backup and isolated branch before edits; preserve all retained dist files.
- No scientific content/confidence changes; frozen scientific digests remain authoritative.
- Normal native scrolling, passive listeners, reduced-motion static fallback and bounded rendering.
- Build and test sequentially. Automated browser QA uses the documented pinned runner with preinstalled Chromium and an immutable dist snapshot; the existing GitHub Actions workflow repeats it when a PR can be created.
- Cache versions follow changed modules and import parents. Owner approves merge separately.

## Review Focus

- Legacy navigation must not rewrite the new home DOM or remove its evidence-guide anchors.
- Mobile touch scrolling must actually move the page and the ribbon; no scroll interception.
- Query dialogs, menu close/Escape and focus restoration work after repeated opens and route changes.
- JavaScript-disabled pages retain real links, catalog and a useful search fallback.
- Article routes retain their original scientific content and page styling.

## Task 1: Hero and responsive composition

- [x] Add failing tests for homeSpectrumHTML(): real destinations from catalog, energy route state and semantic form/heading.
- [x] Create src/platform/home-spectrum.mjs and authored dist/home-spectrum.css. Produce homeSpectrumHTML() for root integration.
- [x] Verify responsive hierarchy, readable HTML text, focus and static no-JS fallback; no old hero/card-grid composition.

## Task 2: Scroll-responsive ribbon

- [x] Add behavior tests for mountSpectrumWave(): scroll changes phase, native scrolling is not consumed, reduced motion stops animation, hidden/offscreen/pagehide cancels, remount/teardown is safe.
- [x] Implement authored dist/home-spectrum-wave.mjs with bounded Canvas 2D draw and idle settling. No permanent animation loop.
- [x] Run focused tests and report actual red/green results.

## Task 3: Search/menu integration

- [x] Reuse shared search with one dialog per intended opener and no duplicated keyboard shortcuts; support the hero query and useful no-JS fallback.
- [x] Implement home-only catalog panel using canonical topics, with close/Escape and focus restoration. Preserve header behavior on all other pages.
- [x] Add repeated open/close, activation and route-fallback tests before implementation.

## Task 4: Root integration and preservation

- [x] Replace only home presentation and detach obsolete DOM-rewriting scripts; retain evidence guide text, lower-content anchors, feedback and route controller.
- [x] Integrate canonical fragment into build-platform and generated allowlist where needed; update import/cache parents.
- [x] Update only obsolete presentation contracts with owner-decision comments; leave scientific fixtures unchanged.
- [x] Add browser scenarios and before/after screenshots for wave, search, directions and actual destination clicks at phone and desktop sizes.

## Task 5: Reviewable delivery

- [x] Run npm run check, repeat build, compare scientific data/HTML and inspect final diff.
- [x] Run independent whole-branch review and full automated Browser QA; resolve actual defects without weakening assertions.
- [ ] Repeat Website build and tests plus Browser QA in GitHub Actions after PR creation (blocked by GitHub API transport).
- [x] Save changed-file list, validation limits and precise revert instructions in docs/HOME_SPECTRUM_REPORT.md.
- [ ] Create PR, wait for green checks and present concrete review result. Do not merge until this PR receives explicit owner approval.

Execution follows the user's explicit implementation request and the active multi-agent workflow; routine implementation choices are delegated without another permission round.

Delivery status: implementation and independent code/visual reviews are complete; focused real-browser QA passed 286 checks and the final full run passed 2949 checks over all 21 pages. Fresh npm run check passed 96/96 test files, validation and smoke. All 254 rebuilt dist hashes match the immutable browser-tested snapshot. GitHub API transport returns Forbidden, while Git push to the canonical repository works; PR creation/CI and the owner's later merge remain pending. No branch/worktree has been deleted and production remains at the saved baseline.
