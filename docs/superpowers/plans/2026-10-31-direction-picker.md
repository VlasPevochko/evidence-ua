# Direction Picker Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this single focused task.

**Goal:** Show the six lens directions only after an intentional activation.

**Architecture:** Keep canonical cards in a closed native dialog. A small independently tested controller handles opening, dismissal and focus; the existing lens retains its decorative scroll lifecycle.

**Tech Stack:** Existing buildless HTML/CSS/ES modules, Node 24.

**Spec:** docs/superpowers/specs/2026-10-31-direction-picker.md

## Global Constraints

- Preserve all six titles, statuses and targets, especially #supplement-library.
- No new dependencies, scientific edits or hero redesign.
- Hidden choices take no page space and cannot receive clicks or keyboard focus.
- Native fallback: ./directions.html; legacy #cards opens the dialog when supported.
- GitHub branch and PR; owner approves merging.

## Review Focus

- Modifier clicks retain normal navigation.
- Failed/missing dialog API retains the fallback.
- Keyboard dismissal restores focus without scrolling the background.
- Article hashes close the dialog and remain reachable.
- Narrow, short and enlarged-text screens scroll inside the panel.

### Task 1: Lens direction panel

**Files:** src/platform/home-directions.mjs, new src/platform/home-picker.mjs, src/platform/home-lens.mjs, dist/home-lens.css, dist/index.html, scripts/build-platform.mjs, scripts/build-site.mjs, tests/home-picker.test.mjs, tests/home-lens-layout.test.mjs, scripts/browser-qa/run.mjs; generated dist/home-picker.js and dist/home-lens.js.

**Interfaces:** mountHomePicker(doc, section) returns an idempotent disposer. Render data-lens-picker and data-lens-picker-close; retain #cards and .topic-card.

- [x] Add behavioral tests for opening only on activation, native fallback, modifier clicks, close/Escape/backdrop, focus, hashes, pagehide and cleanup; verify RED.
- [x] Render the dialog and implement its controller, illustrations and responsive layout. Wire generation/cache versions and verify focused tests GREEN.
- [x] Update browser contracts for click-to-open choices while retaining scroll, touch, reduced-motion, no-JS, route and keyboard checks.
- [x] Run full site build, content validation, tests and smoke checks. Inspect desktop and narrow-screen open/closed states and save screenshots.
- [x] Review the diff, create a verified PR and report its state without claiming publication.
