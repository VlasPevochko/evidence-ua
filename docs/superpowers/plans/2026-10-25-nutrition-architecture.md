# Nutrition architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The owner explicitly requested work by one agent without further design questions.

**Goal:** Separate the Nutrition entry and retained diets from existing physiology material, with a single utility menu and working legacy links.

**Architecture:** Keep authored HTML in `dist/`, move existing scientific blocks verbatim to `nutrition-inside.html`, and update canonical navigation metadata. A small module handles legacy routes and menu dismissal; existing lab controllers remain unchanged.

**Tech Stack:** Static HTML/CSS, ES modules, Node 24, existing project tests.

**Spec:** `docs/superpowers/specs/2026-10-25-nutrition-architecture-design.md`

## Global Constraints

- No changes to scientific wording, evidence, confidence, diet research, existing model code or Japanese motif.
- Preserve valid old model links, anchors, selected nutrient/step/scale, keyboard use and mobile layout.
- No dependencies or subagents; use the current GitHub branch/PR workflow.

## Review Focus

- Old links with model query state must reach the new page without losing valid selections.
- Diet anchors must stay on the Nutrition entry; unknown query strings must not redirect.
- Every moved scientific block and diet entry must retain its original bytes.
- Menu dismissal must support Escape, outside clicks and focus restoration without breaking nested search/dialog controls.
- Generated catalogue/search/next-step links and browser QA must agree with the new route.

### Task 1: Nutrition navigation and preservation

**Files:** `dist/nutrition.html`, `dist/nutrition-inside.html`, `dist/nutrition-navigation.css`, `src/nutrition/navigation.mjs`, `scripts/build-nutrition.mjs`, `scripts/build-nutrition-fat-burning.mjs`, `scripts/build-site.mjs`, `src/platform/{catalog,materials,shell,next-steps}.mjs`, relevant tests and browser QA.

**Interfaces:** Consumes the existing nutrition scientific blocks and controllers. Produces the entry, the physiology route, `nutritionDestination(href)` and `mountNutritionNavigation(root)`; catalogue material IDs remain stable.

- [x] Capture the independent pre-change hashes, add routing/preservation tests, and observe expected failures before implementation.
- [x] Move authored sections verbatim, implement the entry/menu and old-link routing, and update canonical metadata and build targets.
- [x] Update only the UI/route expectations in existing tests; retain scientific fixtures.
- [x] Run `node scripts/build-site.mjs`, `node scripts/test-site.mjs`, `node scripts/validate-content.mjs`, `node scripts/smoke-check.mjs`, and `git diff --check`. Expected: successful exit for each, all website tests green.
- [ ] Verify desktop/phone navigation, menu, diet disclosures, model selection, evidence and old links through the supported preview/browser path; record actual limits.
- [ ] Review the complete diff, commit and push this branch, create the PR, wait for CI and report the explicit owner merge gate with the finished result.
