# Sleep and movement learning modules

GitHub remains the source of truth. Sites is hosting only. Merge and publication require explicit approval. Preserve the complete authored `dist` tree, including the existing scientific pages and assets.

## Scope

- Sleep is a separate sixth direction, alongside the existing five. The home picker, directory, search, share links and native fallbacks include it.
- `sleep.html` introduces NREM/REM stages, sleep restriction and physical performance, and general sleep habits for adults. Stage buttons progressively enhance static readable explanations.
- `movement.html` introduces elbow flexion, shoulder abduction and a stylized step. Each lesson explains the movement, joints, muscles and limits. Existing spatial views, planes, playback and manual pose controls remain available.
- Both modules use the existing teal/gold visual language. Their shared navigation and tools are behind a native disclosure to reduce mobile clutter.

## Sources and limits

Sources checked on 16 October 2026:

- [NIH/NHLBI: How sleep works](https://www.nhlbi.nih.gov/health/sleep)
- [NIH/NHLBI: Sleep stages](https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep)
- [NIH/NHLBI: Adult sleep duration](https://www.nhlbi.nih.gov/health/heart-healthy-living/sleep)
- [NIH/NHLBI: Healthy sleep habits](https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits)
- [Kong et al., 2025: sleep restriction and physical performance](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1544286/full), 45 studies; literature search through September 2024.
- OpenStax Anatomy and Physiology 2e: [types of movement](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements), [upper-limb muscles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), [lower-limb muscles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs).

Formal scientific review and certainty grading are not complete; the pages state this. Sleep content does not predict individual strength loss, muscle recovery, wearable sleep stages or training readiness. Persistent difficulty or impairing daytime sleepiness is directed to a clinician.

The movement mannequin is a simplified educational schematic. Segment lengths remain constant, but it does not model precise muscle anatomy, scapular movement, forces, ground contact, balance or clinical range-of-motion norms. The step is stylized, not a gait assessment. Slider limits define the schematic, not a diagnostic reference.

## Implementation and verification

- Module sources live under `src/movement/` and `src/sleep/`. The existing platform builder generates the JavaScript in `dist`; the authored HTML/CSS/SVG remain in `dist`.
- Platform catalog/material links and changed bundles use cache version 82. Existing scientific article content is retained.
- Automated coverage checks fixed segment lengths, independently calculated joint positions, sleep stage switching, search/filter/share discovery and revealing a hidden lesson before scrolling to its same-page fragment. The existing whole-site suite checks native navigation, authored-page retention and unchanged scientific article subtrees.
- The continuously updated cycle output has `aria-live="off"`; its animation must not produce repeated live announcements. Reduced-motion preference starts playback paused, and background documents stop animation work.
- Browser checks cover mobile and desktop layout, all stage/lesson selectors, keyboard range controls, manual pose and view controls, navigation disclosure, six home cards and the sleep directory filter. These checks supplement rather than replace a formal accessibility or scientific review.

Publish only after the branch is reviewed, explicitly approved, merged and its main-branch publish workflow succeeds. Use the complete provenanced `dist` artifact through the existing Sites runbook.
