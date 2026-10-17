# Evidence Atlas v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a testable Evidence Atlas v0.1 with six body zones, a complete shoulder interaction shell, shared navigation, and a home-page teaser.

**Architecture:** Atlas is an authored static page in `dist/`, matching the retained-snapshot architecture. Shared discovery is added in `src/platform/shell.mjs` and its generated `dist/platform-shell.js` counterpart; teaser/navigation styling extends the existing authored `dist/platform.css`. The existing six-direction catalog is not modified.

**Tech Stack:** Static HTML/CSS, browser JavaScript modules, Node 24 tests using `node:assert`, existing GitHub Actions site pipeline.

**Spec:** `docs/superpowers/specs/2026-10-17-evidence-atlas-v01-design.md`

## Global Constraints

- Atlas remains separate from the six-direction catalog.
- No 3D engine or new runtime dependency in v0.1.
- Shoulder is the only complete body zone in v0.1.
- Other body zones must explicitly say they are in development.
- No individualized diagnosis or treatment claims.
- No merge or production publish without owner approval.

## Review Focus

- Keyboard users can select zones and tabs without pointer input.
- Mobile layout keeps controls readable without horizontal overflow.
- Non-shoulder zones never inherit shoulder content after selection.
- Shared navigation does not alter the existing direction count.
- All new internal links resolve under the static `dist/` publish model.

---

### Task 1: Lock the Atlas contract with a failing test

**Files:**
- Create: `tests/atlas.test.mjs`

**Interfaces:**
- Consumes: authored files expected at `dist/atlas.html`, `dist/atlas.css`, `dist/atlas.js`; shared shell source.
- Produces: executable acceptance contract for later tasks.

- [ ] **Step 1: Write the failing test** asserting three Atlas files exist, exactly six zone buttons are represented, shoulder default/tabs/topics are present, shell contains `./atlas.html`, home teaser copy exists, and the catalog still has six available areas.
- [ ] **Step 2: Run CI and verify failure is caused by missing Atlas implementation.**
- [ ] **Step 3: Commit the failing test only.**

### Task 2: Build the authored Atlas page

**Files:**
- Create: `dist/atlas.html`
- Create: `dist/atlas.css`
- Create: `dist/atlas.js`

**Interfaces:**
- Consumes: current Evidence UA visual conventions and `home-anatomy.svg` as the v0.1 figure asset.
- Produces: static Atlas page with `data-zone` controls and `data-atlas-tab` tabs.

- [ ] **Step 1: Implement semantic page markup with shoulder selected by default and six zone buttons.**
- [ ] **Step 2: Implement responsive Evidence UA styling, focus states, amber selected zone, and reduced-motion support.**
- [ ] **Step 3: Implement zone/tab controller; shoulder renders its five topic cards, other zones render `Розділ у розробці`.**
- [ ] **Step 4: Run PR CI and verify Atlas contract passes.**
- [ ] **Step 5: Commit Atlas page implementation.**

### Task 3: Add shared discovery without changing catalog semantics

**Files:**
- Modify: `src/platform/shell.mjs`
- Modify: `dist/platform-shell.js`
- Modify: `dist/platform.css`

**Interfaces:**
- Consumes: shared platform navigation mount and home `#start-here` node.
- Produces: `Атлас` navigation link and home teaser linking to `./atlas.html`.

- [ ] **Step 1: Extend the failing test to require both shared-nav and home-teaser entry points.**
- [ ] **Step 2: Verify the new assertions fail before shell changes.**
- [ ] **Step 3: Add Atlas link to shared navigation and home header navigation.**
- [ ] **Step 4: Mount one home teaser after `#start-here`; make mounting idempotent.**
- [ ] **Step 5: Add teaser/shared-link styles to `dist/platform.css` and synchronize `dist/platform-shell.js` with the build transform.**
- [ ] **Step 6: Run PR CI and confirm the full website build/test job passes.**
- [ ] **Step 7: Commit shared discovery changes.**

### Task 4: Final branch review

**Files:**
- Review all branch changes.

- [ ] **Step 1: Inspect PR diff for accidental catalog, scientific-content, or unrelated changes.**
- [ ] **Step 2: Confirm CI is green and report any limitations honestly.**
- [ ] **Step 3: Leave PR unmerged for owner review.**
