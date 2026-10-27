# Evidence UA Follow-up Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Correct the eight reproduced defects without changing scientific facts or redesigning the site.

**Architecture:** Retain existing source/build ownership. Implement independent renderer, navigation, interactive and supporting-UI fixes with behavioral regressions; integrate cache propagation and browser scenarios centrally.

**Tech Stack:** Node 24, ES modules, Python/lxml, static HTML/CSS, existing GitHub Actions Browser QA and Pages.

**Spec:** `docs/superpowers/specs/evidence-ua-followup-audit-fixes.md`

## Global Constraints

- No changes to scientific modules, Claims, Sources, EVR values, confidence assignments, dates or review approvals.
- Retain authored dist; edit generated assets through their source and builders.
- No dependencies, browser installation, new preview workflow or branch deletion.
- Ukrainian UI; unavailable fields remain unavailable, not invented or coerced to zero.
- Root integrates builds/cache versions; workers own disjoint files and run only tests that do not rebuild shared outputs.
- Record red/green evidence; required full checks run sequentially in integration.

## Review Focus

- Unknown/missing interval types and partial limits remain truthful.
- Comparison preserves null and mixed provisional confidence states.
- Share URLs validate supported state and discard unrelated/private query fields.
- Phone focus works for every selectable structure, not only the pump.
- Storage failures and Tab/arrow sequences leave controls usable.

## Task 1: Scientific rendering

Files: `src/evidence/core/components.mjs`, renderer regression tests. Interfaces: existing `SourceCard`, `EvidenceDrawer`; existing `result.intervalType`, `populationContext`, `extractionLocator`/`extractionLocation`.

- [x] Add and observe failures for EVR-000204 interval type and EVR-000104 context/locator.
- [x] Render stored interval type, preserve numeric/missing limits, escape values; add existing outcome metadata in folded methodology details.
- [x] Run targeted tests, preserve source science and report red/green evidence.

## Task 2: Search and share

Files: `src/platform/materials.mjs`, navigation regression tests. Interfaces: `materials`, `findMaterials`, `contextLink(href)`.

- [x] Add failing tests for Atlas/Exercises queries and shared exercise/atlas URLs.
- [x] Add navigation-only entries for real pages; validate exercise state and atlas zones through allowlists and existing known values.
- [x] Test invalid params, unknown slugs/zones, private query stripping, existing learning/lab sharing.

## Task 3: Interactive controllers

Files: authored `dist/nutrition-lab.js`, `src/muscle-lab/controller.mjs`, `src/cell-lab/controller.mjs`, targeted controller tests.

- [x] Add failing regressions for pump visibility and focused-but-unselected arrow navigation in both Labs.
- [x] Select structure-specific focus coordinates; derive keyboard adjacency from focused dataset.
- [x] Test every structure on phone, desktop identity transform, regular playback, mixed Tab/arrow sequences, bounds/wrapping.

## Task 4: Comparison and appearance

Files: authored `dist/compare-page.js`, `src/platform/appearance.mjs`, narrowly scoped builder output for comparison review metadata if necessary, comparison/appearance regressions.

- [x] Add and observe failing tests for protein/caffeine provisional assessments and denied localStorage reads.
- [x] Derive comparison status from canonical existing Claim data without assigning supplement-wide certainty. Prefer small generated status metadata over loading every full science bundle in the comparison browser runtime.
- [x] Handle denied storage reads with defaults, preserve in-memory theme/text choices if storage writes fail.
- [x] Test rated/unrated/mixed confidence and working/denied storage; explain changes to old UI contracts.

## Task 5: Integration, review and delivery

Files: source builders/parent imports, generated outputs, authored resource references, `scripts/browser-qa/run.mjs`, existing cache/preservation contracts, Git-backed delivery report.

- [ ] Review each task diff and tests; reconcile generated status metadata and scientific presentation baselines without changing historical fixture values.
- [ ] Extend browser scenarios for search/share, comparison status, mobile selection, keyboard focus, denied storage and interval/metadata visibility.
- [ ] Propagate cache versions through all changed resources and their parents.
- [ ] Run `npm run check`, verify reproducible complete dist, science-file preservation and clean diff formatting.
- [ ] Independent whole-branch review, fix findings, push branch and create PR; await CI Website tests and Browser QA.
- [ ] Record all changed paths and verification limits in `docs/FOLLOWUP_AUDIT_FIXES.md`; report actual PR/deployment state.
