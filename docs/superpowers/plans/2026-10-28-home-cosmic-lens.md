# Cosmic Lens Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Root integrates markup and build; isolated workers own controller, CSS and each art asset. No simultaneous builders or browsers.

**Goal:** Reveal six directions through a beautiful compact cosmic lens below the unchanged hero within one or two ordinary scroll movements.

**Architecture:** Build-owned HTML from the canonical topics; a small independent event-driven ES module enhances native links, scoped home-only CSS and two original optimized art assets. Native details compact retained lower content.

**Tech Stack:** Existing Node 24, static HTML/CSS, native browser APIs. No added runtime dependencies.

**Spec:** docs/superpowers/specs/2026-10-28-home-cosmic-lens-design.md

## Global Constraints

- Preserve hero HTML/CSS prefix and runtime, all eleven scientific dossiers/fixtures, shared pathCard and other page layouts.
- Do not intercept wheel/touch, pin scrolling or run an idle animation loop. Full reveal within at most 320 CSS px after onset.
- Six real canonical topic links and meaningful statuses; fallback/no-JS/reduced-motion usable immediately, keyboard focus reveals all.
- Keep continue/saved insertion anchors direct; fold auxiliary text with native details and retain deep links.
- Dedicated ES module generated from source; build allowlist and query versions reflect its owner. Assets lazy/async with stable dimensions, total target <=500 KB.
- Work only in feat/home-cosmic-lens; no shared-branch push/merge/deploy without owner merge command.

## Review Focus

- Fast scroll or reload midway must reveal the final state rather than leave invisible actions.
- Focus, hash navigation, reduced-motion changes and blocked JS must not hide content or trap scrolling.
- Back/forward article route and page visibility must stop/resume correctly without duplicate listeners or idle RAF.
- Long Ukrainian titles/statuses fit at 360 px, controls remain >=44 px, generated art cannot cause overflow.
- Closed library and route outlines retain all content; native + JS deep links open the correct ancestors.

## Tasks

- [x] Record current clean main, create independent worktree, archive and pushed backup.
- [x] Task 1: Root writes RED semantic tests for lens markup, native disclosures and preserved canonical links; implements renderer/authored wrappers/build wiring, updates intentional UI tests with comments. Preserve scientific checks. Targeted tests must pass.
- [x] Task 2: Controller implementer writes RED tests then mountHomeLens(doc), lensProgress(top,height) in src/platform/home-lens.mjs; tests cover progress window/RAF dedup/cleanup/fallback/focus/hash/reduced motion. No other runtime controllers changed.
- [x] Task 3: CSS implementer creates dist/home-lens.css only, consumes agreed DOM/data contract, contains overflow, responsive layout and progress transforms; no edits to old hero CSS prefix.
- [x] Task 4: Two image workers generate original nebula and transparent lens/core assets only; optimize unchanged art to WebP and verify dimensions/bytes. No UI text baked into images, no stock content or claims.
- [x] Task 5: Root integrates generated outputs, runs targeted/full check, captures immutable dist and real Chromium before/after. Extend Browser QA for short-scroll reveal, non-interception, reduced-motion/no-JS/keyboard/folds/anchors and image dimensions.
- [x] Task 6: Independent spec/code, visual and QA synchronization reviews approved; actual findings fixed; full file inventory/results/rollback/screenshots saved to Git-backed report.
- [ ] Delivery: commit/push feature and create reviewable PR. New merge requires owner «зливай».

Final verification: npm run check 99/99 test files, validation 5 modules, smoke 21 HTML / 98 JS / 182 targets / 294 anchors. Full Browser QA 3199 checks, 3D 2/2. All six actual link rectangles fit after native 128+192 CSS px wheel at 360/390×844 and1440×900. No direct live deployment claimed for this unmerged branch.
