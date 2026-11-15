# Atlas Brain and GI Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Brain/GI planned-only Atlas views with two sourced educational beta modules.
**Architecture:** Build the new views from one canonical reference/content module through a pure renderer. Generate static templates and a no-JavaScript transcript into a bounded Atlas HTML fragment; the existing Atlas controller selects these templates, while a small optional controller progressively enhances their diagrams.
**Tech Stack:** Existing dependency-free ES modules, Node >=24, authored SVG, existing CSS tokens, node:assert tests and Playwright QA.
**Spec:** docs/superpowers/specs/2026-11-14-atlas-brain-gut-content-design.md (owner approved 2026-11-14).
**Execution:** Native implementation in this session; no additional scope decision required after the owner's explicit “Так, реалізуй”.

## Global Constraints

- Three nonempty tabs per new zone: overview, anatomy, research; research is presented as “Джерела” for these two zones only.
- Both zones are beta; no diagnosis, treatment, diet/exercise prescription, efficacy numbers, automatically assigned confidence or invented scientific-review approval.
- Existing four zones, shoulder learning route, pain maps and all existing scientific values/provenance remain unchanged.
- Reuse CLM-000049/000050/000051/000052 by reference for their existing physiological statements; anatomical labels/roles use registered educational references without pretending to be clinical-outcome Claims.
- Every factual lesson/diagram part has resolvable source provenance. Undated references remain undated; source type is educational reference.
- HTML labels, controls >=44px, keyboard/touch operation, print and reduced-motion support; original text remains available if enhancement fails.
- Preserve all dist, register new generated outputs, update cache versions and UI contracts with a dated reason.
- Work only on codex/atlas-brain-gut-content; PR for review, no merge or live publication without separate permission.

## Review Focus

1. Fast zone/tab switching while diagram enhancement loads must not inject a stale diagram into another zone.
2. A failed optional module must leave readable facts and sources, while existing shoulder/knee/spine features still work.
3. Direct zone/tab links, Back navigation and shared links must preserve the selected new zone and correct tab label.
4. No-JavaScript and print must expose every fact, not only the currently highlighted anatomy part.
5. GI arrows must not route food through the liver/pancreas/gallbladder; brain regions must remain a labeled schematic, not a diagnostic map.

---

### Task 1: Canonical foundations and static rendering

**Files:**
- Create src/evidence/atlas/foundations.mjs
- Create src/atlas/foundations.mjs
- Create src/atlas/foundations.css
- Create tests/atlas-foundations.test.mjs

**Interfaces:**
- Consumes digestionBase from src/evidence/nutrition/digestion/module.mjs and createEvidenceBase from src/evidence/core/registry.mjs.
- Produces atlasFoundationBase, foundationModules and foundationTabs; each module has title, summary, educational status, introductory lessons, anatomy parts, related materials and source IDs.
- Sources use unused IDs SRC-000121/000122/000123 after confirming uniqueness across current src.
- renderFoundation(zone, tab) -> safe HTML; renderFoundationTemplates() -> six template elements and a noscript transcript; mountFoundation(root) -> progressive enhancement tied only to that root.
- Anatomy controls select one part via data attributes and aria-pressed; every part's text is present before enhancement. SVG only supplies geometry; accessible labels live in HTML.

- [ ] Write tests that fail because the module/render APIs are absent. Assertions: exact two zones and three tabs, all references resolve, original digestion Claim objects/records remain reused without scientific edits, undated source metadata and unassessed review labels.
- [ ] Run the failing test and confirm the intended missing-module failure.
- [ ] Implement bounded educational copy from the checked NINDS/NIDDK references; preserve exact existing Claim statements when reused. No new outcome claims.
- [ ] Render the overview, source panel, anatomy controls and all part explanations. GI primary path has exactly six ordered stages; helper organs are separate.
- [ ] Implement root-scoped event delegation and hide inactive explanation panels only after enhancement; on print all explanations are visible.
- [ ] Verify data/render tests, source URL allowlist, safe HTML escaping and absence of foreign network assets.
- [ ] Commit the independently testable data/rendering deliverable.

### Task 2: Atlas integration and recoverable build

**Files:**
- Create scripts/build-atlas-foundations.mjs
- Modify scripts/build-platform.mjs and scripts/build-site.mjs
- Modify dist/atlas.html and dist/atlas.js
- Generate dist/atlas-foundations-data.js, dist/atlas-foundations.js and dist/atlas-foundations.css
- Modify tests/atlas-update.test.mjs, tests/atlas-audit.test.mjs and relevant existing Atlas snapshots with dated explanations.

**Interfaces:**
- Build script copies canonical data/renderer to public paths with rewritten local imports, injects only the bounded EUA_ATLAS_FOUNDATIONS HTML fragment and copies CSS.
- Generated Atlas HTML is covered by an additional preservation check for authored content outside the bounded fragment.
- Atlas reads per-zone/tab templates synchronously. hydrateFoundation() imports optional controller, checks root/zone connectivity before mounting and tolerates failure.
- tabLabel(zone, tab) supplies “Джерела” for brain/gut research in button, breadcrumb, document title and announcement; other zones retain their labels.

- [ ] Add integration tests for three new tabs/status, retained existing zone content and exact generated outputs.
- [ ] Run and confirm the intended failure before integration.
- [ ] Add the build step after existing foundational exports; register generated assets and Atlas fragment while preserving all authored dist files.
- [ ] Integrate templates, beta metadata, per-zone labels and guarded progressive enhancement without restructuring unrelated Atlas code.
- [ ] Update cache query versions in authoritative builders/HTML, and only matching presentation test expectations.
- [ ] Verify two builds are idempotent, preservation outside the generated fragment, failed enhancement, direct links and valid tab selection.
- [ ] Commit the working Atlas integration.

### Task 3: Discovery, documentation and browser verification

**Files:**
- Modify src/platform/materials.mjs (brain/GI keywords and correct review labels)
- Modify dist/about.html, dist/changes-data.js and the maintained Atlas documentation
- Create docs/ATLAS-BRAIN-GUT.md
- Create scripts/browser-qa/atlas-foundations.mjs; integrate into scripts/browser-qa/run.mjs.
- Update reviewer export only if the existing exporter includes changed scientific records; otherwise document why the current Claim inventory did not change.

**Interfaces:**
- atlasFoundationsFlow(browser, origin, viewport) -> hermetic QA for both new zones; existing QA_ATLAS_ONLY executes it and all prior Atlas flows.
- Existing search results and share rules remain canonical zone/tab navigation; new words resolve to their actual educational module.

- [ ] Add meaningful tests for discovered new anatomy terms and accurate public status/limitations; run their expected failure.
- [ ] Add browser tests for every anatomy selection, keyboard focus, visible selected state, tab titles, URL/Back, stale-load isolation, failed optional module, no-JS transcript and print completeness.
- [ ] Update About, change journal, source/reading-scope notes and Atlas UI contracts.
- [ ] Run relevant fast tests, full build/validate/test/smoke and the complete required Browser QA.
- [ ] Check 390/1440px, both palettes and themes, reduced motion and no-JavaScript; capture before/after images from the actual main baseline and final implementation.
- [ ] Review the diff for scientific edits, empty placeholders, readability, external requests and dist retention; request fresh whole-branch review and fix actionable findings.
- [ ] Commit and push the branch; open a concrete PR with validation evidence, limitations, screenshots, and “Шаблонність/Функціональність” assessment. Wait for owner merge permission.

## Baseline and execution notes

- Existing linked worktree is reused, clean at start; no unrelated changes.
- Baseline standard test driver started before product edits; session ID is retained in the chat until completion.
- Current old browser tab 5191 shows a stale layout, so its screenshots are not used as main baseline proof.
- Design document was checked by a fresh builder-check agent: nothing important left.
