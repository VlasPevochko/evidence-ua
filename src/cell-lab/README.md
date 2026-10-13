# Cell Lab v1.0

Existing `cell-lab.html` route, SVG, light theme, eleven canonical entities and three learning levels are retained. `module.mjs` owns existing descriptions, stable Claim/EVR IDs, textbook sources and visual provenance. `controller.mjs` handles selection, search and events. `scripts/build-cell.mjs` emits deploy JS and is included in build-knowledge.

This migration preserves existing public wording. An independent snapshot in `tests/fixtures/cell-v0.1-wording.json` comes from pre-v56 commit `84113ab58c642f4bd435474d1caf792f11ccf52a`. Confidence, scientific review dates and approvals remain null. No intervention outcome, quantitative effect, trial, PMID or DOI was invented.

The three existing OpenStax textbook sections are linked via eleven descriptive records. These use `recordKind:textbook_description`, textual results and pending review status. Relevant sections were accessed 2026-10-11 and the book's year 2022 checked against publisher citation metadata. This is not a full scientific review, publication-status audit or funding/COI audit.

Shared ClaimCard, SourceCard and mechanistic EvidenceDrawer are reused without modifying shared components. The selected panel shows the existing explanation and evidence button; all eleven cards are also in a collapsed section. Source cards link to the publisher and hide technical IDs.

Next/previous wrap around all eleven structures. Quick selection is beside the model, with native 44px buttons as alternatives to small SVG targets. Searchable list remains. SVG supports Enter/Space and arrows; arrow selection follows focus. Selection updates the URL while retaining other parameters/hash. Invalid IDs fall back to mitochondrion. Search affects the list without discarding selection.

Mobile preserves model/panel/list order, uses one-column Claim Cards and a viewport-size evidence dialog. Styles are local. No kinetics, concentrations, new specialized cell, clinical guidance or efficacy confidence was added.

Tests execute controller and drawer events through a DOM adapter: selection, levels, tabs, search, cyclic controls, keyboard, URL state and focus return. Browser visual 360/390px QA remains unverified because control-browser is unavailable. Run `node --test --test-concurrency=1 tests/*.test.mjs`: some tests rebuild shared output files and must not run concurrently.
