# Shoulder learning route implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Connect the existing shoulder Atlas, movement explanation, two practice examples and explanation sources in the existing learning-route system.

**Architecture:** Extend `learningPaths` with `shoulder`; retain the existing `path`/`lesson` navigation and exercise records. Reuse the validated Atlas zone/tab/point links added in main and require every route step's content parameters to match. Static entry links remain useful without JavaScript; interactive pages keep their existing no-script limitations.

**Tech stack:** Static HTML/CSS, native JavaScript modules, Node assertions, Playwright.

**Spec:** User-supplied `evidence-ua-agent-worklist.json`, EU-01; goals reviewed against `docs/NORTH_STAR.md`. Initial base d3a9cbd was refreshed to main `b2fe447886a0ca551161c6f1956caceaf6606ce7` before final verification.

## Global constraints

- Preserve all tracked dist assets and scientific content, confidence and provenance.
- Reuse `practice_scapular_activation_control` and `practice_rotator_cuff_complex`; do not claim exercise efficacy or infer a prescription.
- Existing exercise statuses remain `video_checked` / `not_assessed`; related scientific IDs remain empty pending review.
- No external collection, publication or merge in this initial implementation.
- `sources/` in the enclosing ChatGPT project remains read-only.

## Review focus

- Wrong exercise, zone or tab parameters must not display progress for a different lesson.
- Direct opening and reload must display the actual Atlas anatomy tab and selected exercise.
- Changing Atlas zone/tab must not leave stale route progress.
- Navigation must survive mobile width, keyboard focus and repeated shell mounting.
- Sources of an educational movement model must not appear to validate the selected exercise videos.

## Task 1: Shoulder route and exact destinations

Files: `src/platform/catalog.mjs`, `dist/atlas.js`, `dist/atlas.html`, `dist/exercises.html`, `src/platform/shell.mjs`, `scripts/build-platform.mjs`, generated modules/HTML, `tests/shoulder-route.test.mjs`.

- [x] Add assertions for the route, existing exercise IDs, real targets and exact parameter matching; focused tests pass.
- [x] Add six steps: shoulder anatomy; shoulder movement; scapular practice; rotator cuff practice; how to read evidence; movement sources.
- [x] Reuse upstream Atlas `tab` links and validated URL state; notify shared route navigation on zone/tab changes.
- [x] Add an entry in the Atlas and a return to the route in the library, preserving scientific copy.
- [x] Build with coherent cache versions, update affected navigation/cache expectations, run focused tests.

## Task 2: Browser validation and handoff

Files: `scripts/browser-qa/shoulder-route.mjs`, `scripts/browser-qa/run.mjs`, `docs/SHOULDER_ROUTE.md`, `docs/WORKLIST_STATUS_2026-11-11.md`.

- [x] Capture baseline mobile/desktop views, page heights and control counts; note the base-refresh limitation in the route document.
- [x] Exercise the full route, entry/return, direct links/reload, wrong parameters, keyboard controls and external-request absence at 360, 390 and 1440 px.
- [x] Run `npm run check`, `npm run qa:browser`, `git diff --check`; record actual results and limitations. Check: 136/136 and smoke pass. Full browser: 3/8304 failures; screenshot race fixed and focused route rerun passes; remaining two reproduce on untouched main.
- [x] Prepare a five-person phone test script with blank results, scientific-review queue references and measurement/issue-update next steps.
- [x] Obtain a fresh code review and resolve material findings.

## Decisions and progress

- User asked to review goals and start work; use the supplied worklist and existing architecture without another design approval round.
- EU-01 is the first deliverable. EU-02 and EU-03 retain their human review/provider prerequisites; EU-05 remains deferred.
- Native worktree creation returned no result and no Git worktree; fallback worktree created on `feat/shoulder-learning-route` in the chat workspace.
- Baseline build and validation passed, preserving all 300 dist files. Full tests require an unrestricted temporary Git directory; sandbox failure is environmental, not a code failure.
- Refreshed main includes 303 dist files, all retained. Upstream Atlas state management was kept; duplicate implementation was removed during reconciliation.
- The first desktop screenshot exposed navigation inserted as an extra Atlas grid item. It now lives inside the detail panel; a geometry regression assertion and visual inspection confirm the correction.
- Browser screenshots now wait for the route start to become visible before keyboard focus and use actual keyboard input to end the existing anchor-settling window before capture.
- Independent final review found no unresolved material defects. Existing continue-reading behavior, extra hotspot/back coverage and later EU tasks were not classified as defects of this route.
- EU-02 editorial follow-up: all 13 DOI entries in PR #119 compared with current data; 10 already referenced. Scientific approval remains pending. See `docs/DIETS_PR119_RECONCILIATION_2026-11-11.md`.
- Two reduced-motion wave failures reproduced on an untouched archive of b2fe447. They are recorded separately from route verification; no wave implementation was changed.
