# Muscle Lab — redesign of 2026-10-18 (owner-approved)

This section supersedes the UI notes below; the science (structures, topics, sources, Claims) is unchanged and still frozen by `tests/muscle-flow.test.mjs`.

- **One control per action.** Six numbered scale buttons replace the four overlapping controls (image markers, legend, Back/Next, scale row) and the jump buttons.
- **Own drawings.** `scale-art.mjs` draws the six scales; they contain no text (labels are an HTML legend, readable on a phone). The earlier generated raster is still used by the home and directory cards, not by this page.
- **Animated contraction.** `sarcomere.mjs` is the single sarcomere drawing: filaments keep a fixed length, only overlap and Z-disc distance change. A slider and a one-pass animation (`requestAnimationFrame`, stoppable, off under reduced motion) drive it. `scenes.mjs` draws the myosin-head cycle once; the step is a `data-step` attribute and CSS moves the parts.
- **Growth and atrophy as mirrored opposites** in one section with one shared stepper; on a phone one panel is shown at a time.
- **No reading-level switcher.** The full wording is always shown; the level text stays in `learning-copy.mjs` and the topic data for a later, separate feature (planned as a tab for subscribers).
- Topic markup must not use `<header>`: the shared shell injects its navigation after every `<header>`.
- Browser QA (`scripts/browser-qa/run.mjs`, `muscleLabFlow`) checks the scale control, the cycle, the sarcomere animation, the mirror and the phone layout.

# Muscle Lab — current structured UI version 1.0

The v58 increment preserves all v57 public structure descriptions, functions, topic wording and three SVG storyboards. A frozen fixture independently checks this migration. The original v0.1 notes below describe the retained foundation, not the current Claim count.

Canonical module data now lives in `module.mjs`, UI in `controller.mjs` and unchanged storyboard drawings in `scenes.mjs`. `scripts/build-muscle.mjs` emits the static application and runs from the existing knowledge build. No framework, routing or global design replacement.

Six structural descriptions and three existing topic descriptions use the shared `ClaimCard`, `SourceCard` and Evidence Drawer. Nine stable Claim IDs (CLM-000040–CLM-000048) have **null confidence, null scientific review date and no scientific approval**. Eleven stable context links (EVR-000050–EVR-000060) are `context_only`, direction `unclear`, review `pending`, with no extracted effect. They preserve prior source associations, not verified direct outcome evidence. Full-text matching remains a separate review task.

The existing visual links to six structure Claims. No new anatomical entity, clinical prediction, source publication or measured simulation was added. Current module check date is a technical migration date, not an approved scientific review.

The page adds a four-stop learning guide, per-topic manual step choices, inline evidence buttons, expandable generic cards and complete return paths. Selection, explanation tab and learning level live in the URL; existing teaching-route parameters are preserved. The explicit share link excludes unrelated query parameters. Learning-level changes preserve the selected storyboard step. Only one scene auto-advances at a time; page hiding and reduced-motion preference pause or prevent timed playback.

Validation: `node --test --test-concurrency=1 tests/*.test.mjs`. Includes real controllers through in-memory DOM adapters, timer/keyboard/deep-link/focus tests, code/anchor audit and exact pre-v58 wording/page checks. This is **not browser layout or touch certification**. No supported browser-QA surface is available in this managed environment; user visual verification is still needed.

Analytics is not connected. Provider-neutral proposal: `docs/ANALYTICS-EVENT-PLAN.md`; no collection, storage or tracking was activated by this migration.

## Retained v0.1 foundation

Separate buildless page in `dist/muscle-lab.html`, with UI `muscle-lab.js`, styles and data registry `muscle-lab-data.js`. Existing Creatine data is not copied or modified; related materials link to their existing routes.

This first educational page implements the approved Muscle Lab composition: sidebar, six structural scales, contextual explanation, contraction/growth/atrophy, related topics and sources. It does not implement all twelve future sidebar topics, search, teacher downloads or quantified 3D physiology. Lesson mode is distraction-free layout, not a claim of browser fullscreen.

Scientific explanations are separate from presentation, with stable entity IDs and source links. They are provisional mechanistic summaries, not formally assessed efficacy Claims. No HIGH confidence was invented, and no review was approved. The visualization carries entity/source references and empty claimIds pending a scientific Claim pass. Future Claims/EVRs should enter the existing shared registry, not a parallel scoring engine.

Schematic sarcomere SVG is code-native: Z-disks and actin move inward, thick filament stays constant. The range is arbitrary, never a measured shortening percentage. Four-step contraction storyboard is conceptual and omits detailed kinetics. Growth/atrophy storyboards do not forecast muscle size or elapsed time. Autophagy is not depicted as intrinsically harmful; acute mTOR activation is not asserted as proven chronic hypertrophy.

Raster `dist/muscle-lab-art-v1.webp` is artistic introductory anatomy, not an exact labeled scientific figure. Generated using built-in imagegen and converted to WebP, with separate exact SVG for filament motion. Prompt: high-detail dark-navy anatomical cutaway progression of skeletal muscle, fascicle, fiber and myofibril, red/purple tissue with cyan rim lighting; no text, labels, UI or measured effects. Source image: `/workspace/scratch/c541b5be9e91/generated_images/exec-e2c1374a-89ca-46fa-9772-4d7918b1aa7b.png`.

Run `node tests/muscle-lab.test.mjs` and `node tests/evidence.test.mjs`. Browser layout, keyboard travel and live animation need user/browser verification; static checks are not a full accessibility certification.

## Visible storyboard increment

The anatomical overview has four keyboard-accessible 44px numbered selectors for muscle, fascicle, fiber and myofibril. Labels derive from the shared entity registry. Markers are hidden while the image is zoomed so they do not falsely identify shifted anatomy; a focused overview return button restores the initial view. Sarcomere and actin/myosin selectors sit beside the separate schematic, not on the artistic cutaway. Mobile preserves the image aspect ratio and uses a two-column key. Browser layout and keyboard QA remain pending.

`muscle-lab-scenes.js` supplies code-native SVG scenes in all three topic cards, adjacent to their explanation and controls. Each has Play/Pause, Previous, Next and Reset. Contraction depicts fixed-length filaments sliding; growth and atrophy highlight conceptual process nodes, not measured muscle-size changes. No 3D kinetics or quantified simulation is claimed. Topic cards keep sources and uncertainty notes.
