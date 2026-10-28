# Home Section Hierarchy Implementation Plan

> **For agentic workers:** Use subagent-driven development; checkbox steps track this owner-authorized refinement.

**Goal:** Make lower-home sections and actions distinguishable while scrolling on a phone.

**Architecture:** Keep the hero/runtime controllers intact. Add authored home wrappers, a build-only canonical directions renderer and a compact home-only learning view; retain the shared directory renderer. Scope CSS to the lower home.

**Tech Stack:** Existing Node 24 static HTML/CSS and native details, no new runtime dependencies.

**Spec:** docs/superpowers/specs/2026-10-28-home-section-hierarchy-design.md

## Global Constraints

- Preserve the hero/wave, other page layouts, all scientific content and fixtures.
- Preserve IDs, real hrefs, statuses, feedback and insertion points for continue/saved/Atlas.
- Keep all six directions and three route starts visible; only examples and lesson outlines fold.
- Cache-bump affected CSS and module parents; no cleaning retained dist.

## Review Focus

- Native details remain usable with keyboard and JavaScript disabled.
- Continue/saved stay outside the folded examples.
- Directory pathCard output stays unchanged despite the new home view.
- Long Ukrainian labels fit at 360 px; links remain visible and tappable.
- Runtime evidence guide remains inside the library on initial load and resize.

## Tasks

- [x] Capture real-browser baseline and create pushed backup plus archive.
- [x] Write failing semantic tests for canonical direction actions, compact home routes and authored section structure.
- [x] Implement `src/platform/home-directions.mjs`, build integration, homeLearningHTML variant and authored wrappers/cache versions. Keep shared pathCard unchanged.
- [x] Refine only lower rules in `dist/home-spectrum.css` for distinct surfaces, headings, action affordances and responsive layout.
- [x] Add real-browser section/layout/interaction checks; record before/after views and measurements.
- [x] Run targeted and full checks, inspect hashes/other-page preservation, request independent code/visual review.
- [x] Save complete file list, results, limits and rollback in docs.
- [ ] Commit/push and create the reviewable PR. Do not merge without owner instruction.

Local verification complete: npm run check 97/97 test files; homepage QA 347 checks; full Browser QA 3010 checks over 21 pages × 2 viewports plus the extra narrow-home flows. Both independent reviews approved. Delivery remains separate from publication; API access may require the owner to open the prepared PR form.
