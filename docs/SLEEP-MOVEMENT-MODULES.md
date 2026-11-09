# Sleep and movement learning modules

GitHub remains the source of truth. Sites is hosting only. Merge and publication require explicit approval. Preserve the complete authored `dist` tree, including the existing scientific pages and assets.

## Scope

- Sleep is a separate sixth direction, alongside the existing five. The home picker, directory, search, share links and native fallbacks include it.
- `sleep.html` introduces NREM/REM stages, sleep restriction and physical performance, and general sleep habits for adults. Stage buttons progressively enhance static readable explanations.
- `movement.html` introduces elbow flexion, shoulder abduction and a stylized step. Each lesson explains the movement, joints, muscles and limits. Existing spatial views, planes, playback and manual pose controls remain available.
- The movement extension adds four guided walking stops, a horizontal external-load lever experiment, a schematic elbow muscle-role selector and three native question disclosures. These are learning interactions, not clinical assessments.
- Both modules use the existing teal/gold visual language. Their shared navigation and tools are behind a native disclosure to reduce mobile clutter.

## Sources and limits

Sources checked on 16 October 2026:

- [NIH/NHLBI: How sleep works](https://www.nhlbi.nih.gov/health/sleep)
- [NIH/NHLBI: Sleep stages](https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep)
- [NIH/NHLBI: Adult sleep duration](https://www.nhlbi.nih.gov/health/heart-healthy-living/sleep)
- [NIH/NHLBI: Healthy sleep habits](https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits)
- [Kong et al., 2025: sleep restriction and physical performance](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1544286/full), 45 studies; literature search through September 2024.
- OpenStax Anatomy and Physiology 2e: [types of movement](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-5-types-of-body-movements), [upper-limb muscles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), [lower-limb muscles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs).
- OpenStax: [external torque](https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium) and [muscle roles](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-1-interactions-of-skeletal-muscles-their-fascicle-arrangement-and-their-lever-systems).
- [Neptune, Zajac and Kautz, 2004](https://sites.utexas.edu/neptune/wp-content/uploads/sites/6031/2020/07/gaitposture192a.pdf): muscle-driven simulations of support and progression in walking; used for qualified early-stance support and late-swing deceleration explanations.
- [Umberger, 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2894890/): model-based stance and swing energy estimates; used only to explain that swing need not be passive, without adopting its numerical estimates as personal predictions.

Formal scientific review and certainty grading are not complete; the pages state this. Sleep content does not predict individual strength loss, muscle recovery, wearable sleep stages or training readiness. Persistent difficulty or impairing daytime sleepiness is directed to a clinician.

The movement mannequin is a simplified educational schematic. Segment lengths remain constant. An illustrative foot path and two-segment geometry distinguish stance from swing; the four stops and animation percentages are not measured gait data or normative timing. The mannequin does not model precise muscle anatomy, scapular movement, forces, ground-contact dynamics, balance or clinical range-of-motion norms. Slider limits define the schematic, not a diagnostic reference. Muscle-role colors are schematic teaching zones, not measured activation or anatomical boundaries.

The lever calculates only the magnitude of the external load's gravitational moment about a pivot: mass in kg × 9.81 m/s² × distance in metres, with a horizontal lever and vertical force. It excludes limb mass, internal muscle and joint forces, inertia and acceleration. Its drawn proportions are not anatomical.

## Night scheme, «Дивись також» and phone density (owner decisions 34–37, 2026-11-09)

Owner request: «Роби все що перечислив для правок» after the sleep-page audit (items 34 small fixes, 35 moving night scheme, 36 related block, 37 shorter phone version). Item 38 (new topics with sources) is not a correction and waits for the owner's choice of topics; nothing of it is built.

**Night scheme (35).** An own, licence-clean hypnogram built from HTML: one `<i class="night-bar">` per segment in a CSS grid, the five row labels (Неспання, REM, N1, N2, N3) are real text, no SVG, canvas or image. It shows only what the page already says from NIH/NHLBI: stages alternate, the cycle repeats several times, N3 is usually more at the beginning of the night, REM usually more towards the morning. It is explicitly *an example, not a recording or a norm*, carries no times or numbers, and says that stage lengths in real sleep vary.

- Data and geometry: `src/sleep/night.mjs` (pure, no DOM; five cycles, 60 slots, 24 segments). The build (`scripts/build-platform.mjs`) renders the static markup between `<!-- EUA_SLEEP_NIGHT_START -->` and `<!-- EUA_SLEEP_NIGHT_END -->` in `dist/sleep.html`, so without JavaScript the scheme is visible, only without motion. `dist/sleep-night.js` is a generated copy; `dist/sleep.js` imports it with a version.
- Motion (`src/sleep/page.mjs`, `mountNight`): a cursor passes the night in 30 s; one button «Пауза / Відтворити» (≥ 44 px). It starts by itself only when at least 35 % of the scheme is on the screen, stands still when off the screen or in a background tab, never overrides a person's pause or a chosen stage, and under `prefers-reduced-motion` starts paused so that only a person can run it. The label «На схемі зараз: …» has `aria-live="off"`; the chart has one text description (`role="img"` + `aria-label`).
- Stage buttons answer to the scheme: choosing N1/N2/N3/REM pauses the cursor on the first bar of that stage, lights all bars of the stage and dims the rest; «Відтворити» removes the highlight. The first selection on load does not move the scheme.
- Colours: N1/N2/N3 are three steps of one hue (deeper = more saturated; opacity .48/.74/1), REM is cyan `#3cc8d8`, wake is the neutral label colour. Checked with the `dataviz` validator rules in both site palettes against the scheme background (cosmic `#1d1827`, green `#152a25`), for every pair of stages that stand next to each other in time. Categories (wake–N1, wake–N2, N2–REM, REM–N1): normal-vision ΔE ≥ 15 (measured 16.3–29.2), protan/deutan ΔE ≥ 8 (11.0–28.6). Neighbouring steps of the ramp (N1–N2, N2–N3): `validateOrdinal` passes (lightness steps ≥ 0.06, one hue), ΔE 13.5–14.3 (CVD 12.7–13.9). Every bar against the background ≥ 3:1 (WCAG 1.4.11: N1 3.0, N2 5.3, N3 8.5–8.7, REM 7.5–8.6, wake 8.9–9.1), label text ≥ 4.5. The first version failed this: wake at 55 % opacity was ΔE ≈ 10 from N1/N2, and N1 at 38 % opacity had contrast 2.4 (< 3), found by the accessibility review; both were raised. **Known deviation:** REM (L ≈ 0.77, as high as the top of the ramp, N3 0.79–0.82) is above the categorical lightness band (L ≤ 0.67 on dark); a darker cyan cannot keep ΔE ≥ 15 from N2 (search over L .62–.67 and 85 hues: best 14.7 / 7.9). It is one accent beside an ordinal ramp, not a categorical palette. The same maths runs in Browser QA on the real computed colours (`sleepNightFlow`).
- Bars are 10–24 px tall, 4 px rounded; a bar starts where its segment starts (the QA flow compares the pixels with the data).

**«Дивись також» (36).** One section after the habits, before the sources: four links to existing material, no new science text. Link text is copied word for word from the destination (three research-breakdown questions: magnesium, intermittent fasting, short sleep and weight; one animated scheme: «Чому кава бадьорить: кофеїн і аденозин»). `tests/sleep-related.test.mjs` compares each title with `dist/research-data.js` and `dist/mechanisms.html`, so a renamed breakdown cannot leave a stale link. Research links use the same `research.html#<id>` form as other pages (static anchor without JavaScript, the card is opened by `research-page.js`).

**Small fixes (34).** The heading «Результат залежить від того, що саме вимірюють» lost its space on phones (`<br>` is hidden at ≤ 600 px; the space is now before the `<br>`, and a test forbids «,<br>» in headings). The three tiny links under the title (21 px tall: «Джерела й межі висновків», «Словник», «Про матеріал») are one 44 px button «Джерела й межі ↓» to the closing service block: the sources section is followed directly by «Про матеріал» with the glossary and the editorial rules, and the glossary still opens from the dotted terms in the text. This is a consolidation (one control for one action), not a removal of material; if separate hero links are wanted back, it is an owner decision. On computers the three wide chapter tiles became compact pills.

**Phone density (37), measured.** Only spacing changes (the same texts and font sizes; a test forbids `font-size` in that block): section gaps 50 → 38 px, line height 1.9 → 1.7 in the evidence, basics and habit cards, tighter card padding, the related block as a 2 × 2 grid with a smaller heading, the scheme's pause button on the same row as its label. Page height measured in Chromium with the `<details>` collapsed:

| Width | Before (main) | After | Of which the two new blocks |
|---|---|---|---|
| 390 × 844 | 6057 px (7.2 screens) | 6564 px (7.8) | scheme +305, «Дивись також» +370 (with its gap) |
| 360 × 780 | 6213 px (8.0) | 6726 px (8.6) | scheme +322, «Дивись також» +389 |
| 1440 × 900 | 4413 px (4.9) | 4862 px (5.4) | scheme +148, «Дивись також» +317 (two columns on a computer) |

So the page is **not shorter** than before: on a phone tightening the existing sections saved about 190 px (−0.2 screen), while the scheme and the related block added about 675 and the hero button 26 (net +507 px, +0.6 screen). Without the two new blocks the phone page would be ≈ 7.0 screens (−0.2). The earlier estimate of «≈ 5 screens» was optimistic and is withdrawn. What was deliberately *not* done: the source links next to explanations were not removed (editorial rule «Джерело поруч із поясненням»), and the shared blocks (learning notes 776 px, next steps 417 px, footer) are not touched in a sleep-only change. Further reduction needed an owner decision; the owner chose to shorten, and the habit cards were folded (see the follow-up below).

**Follow-up «1 так» (2026-11-09): habit cards fold on a phone.** The owner answered «1 так» to «shorter on a phone?» with two options on the table. Working out the real row heights showed that the first, «Дивись також» in one row, saves almost nothing (the 2 × 2 grid is already about as compact as a one-column list: an estimated −0.05 screen, not the −0.4 first guessed; the second option was measured on a scratch copy: −337 px), so only the second was built: up to 600 px each habit card becomes a row «number + title» with a button, the text opens on a tap. After the owner's remark about templateness (below) the rows are drawn as a «rail» instead of the stock accordion with «＋» signs: round numbered nodes joined by a hairline (the language of the night scheme: row lines and the cursor dot), an open node is filled like the scheme's cursor, a thin chevron turns over; the node number comes from a CSS counter and is decorative for a screen reader. Markup stays static (`<h3>title</h3><div class="habit-body" id="habit-body-N">text</div>`, wording unchanged and pinned by a test); `mountHabits` in `src/sleep/page.mjs` puts a `<button aria-expanded aria-controls>` inside the `h3` (the APG accordion pattern: a heading stays a heading) and hides the body with `hidden`. Without JavaScript, on a computer and on paper (`!important`, because the site hides every `[hidden]` element with `!important`) everything is shown as before; the script follows the width in both directions and forgets what was opened. Rows are ≥ 56 px, independent of each other, keyboard-operable (Enter, Space) with the site's focus ring.

| Width | After the first PR | With folded habits | Original (before the sleep upgrade) |
|---|---|---|---|
| 390 × 844 | 6564 px (7.8 screens) | 6228 px (7.4) | 6057 px (7.2) |
| 360 × 780 | 6726 px (8.6) | 6369 px (8.2) | 6213 px (8.0) |
| 1440 × 900 | 4862 px (5.4) | 4862 px (5.4, unchanged) | 4413 px (4.9) |

So the phone page is now 0.2 screen longer than before the upgrade, which is the scheme (+305 px) and the related block (+370 px) that the owner asked for, less what the tightening and the folded habits took back. **Templateness and functionality (owner's requirement, 2026-11-09).** The owner asked to take into account the parameter of templateness («ШІ-сайти легко відрізнити по шаблонності») together with functionality; the criterion and its questions are item 9 of the quality standard in `CLAUDE.md`. Honest rating of what the sleep upgrade added:

| Element | Templateness | Functionality | Verdict |
|---|---|---|---|
| Night scheme | low: own drawing grown from the page's data, motion and cursor, the language of lines and bars | high: pause, a chosen stage stops it, keyboard, stills off screen and with reduced motion. Weak spot: the rows are not tappable (the text says «Обери стадію», the buttons are below the scheme) | keep; making the rows tappable is a pending owner decision |
| Habit rows on a phone | was high (stock accordion with «＋»), now medium-low: the rail echoes the scheme | high on a phone (−0.4 screen), everything open on a computer; cost: up to four taps to read all four habits | rail built in this change |
| «Дивись також» tiles | high: the generic «label + title + arrow» card grid | medium: plain navigation to existing material | pending owner decision (a rail-style list is possible) |
| Hero button «Джерела й межі ↓» | medium: an ordinary outlined button | high: one control instead of three tiny links | keep |

Tests: `tests/sleep-habits.test.mjs` (markup and wording, fold/unfold, independent taps, breakpoint crossing both ways, no state left half open; each rule checked by breaking the code), Browser QA `sleepHabitsFlow` at 390, 360 and 1440 (row sizes, hidden texts, tap and keyboard, print, resizing both ways without a reload, chapter link, no JavaScript, no errors). Screenshots: `docs/screenshots/sleep-upgrade/habits-*.png`.

**Accessibility review (WCAG 2.1 AA, `design:accessibility-review`, run in Chromium).** Found and fixed: the N1 bars had contrast 2.4:1 (< 3:1, SC 1.4.11), so the ramp became .48/.74/1 and the REM colour was re-tuned (see colours above); the decorative arrow of a related link was read as part of the link name, now it has an empty text alternative (`content: '…' / ''`, with a plain fallback). Checked and fine: a pause control for the moving cursor (SC 2.2.2) that is the first stop of the scheme, the scheme starts paused under `prefers-reduced-motion` and stands still off the screen; every control shows a 2 px focus ring and the tab order is hero button → chapters → term links → play/pause → stage buttons → … → related links; the scheme is a `figure` named by its caption with one `img` description, the moving label is `aria-live="off"`, the button's name changes between «Пауза» and «Відтворити»; no overflow at 320 px, nor at the site's larger text sizes (the site scales them with `zoom`); tap targets ≥ 44 px. Not tested: a real screen reader (VoiceOver, TalkBack, NVDA).

Screenshots before/after: `docs/screenshots/sleep-upgrade/` (390 and 1440, cosmic; the green palette and the light theme for the scheme).

Not verified: a real phone or Safari (only Chromium was run), a real screen reader, the light theme beyond one screenshot (it is a filter over the dark page), and live smoothness on the owner's device.

## Implementation and verification

- Module sources live under `src/movement/` and `src/sleep/`. The existing platform builder generates the JavaScript in `dist`; the authored HTML/CSS/SVG remain in `dist`.
- Platform catalog/material links and changed bundles use cache version 83. Existing scientific article content is retained.
- Automated coverage checks fixed segment lengths, independently calculated joint positions, sleep stage switching, search/filter/share discovery and revealing a hidden lesson before scrolling to its same-page fragment. The existing whole-site suite checks native navigation, authored-page retention and unchanged scientific article subtrees.
- The continuously updated cycle output has `aria-live="off"`; its animation must not produce repeated live announcements. Reduced-motion preference starts playback paused, and background documents stop animation work.
- Deliberate lever changes produce one concise polite status with the calculated moment and units. The repeated mass/distance outputs remain silent. Cross-section challenges move keyboard focus into the relevant experiment; the walking challenge pauses at the swing stop. Cycle controls update their displayed state synchronously rather than waiting for canvas painting.
- Night scheme tests: `tests/sleep-night.test.mjs` (data matches what the page says, five cycles, N3 early, REM late, current generated markup, delivered with versions), `tests/sleep-night-mount.test.mjs` (autostart, pause, background tab, IntersectionObserver, chosen stage, reduced motion; each rule was checked by breaking the code and watching the test fail), `tests/sleep-related.test.mjs` (related block, hero button, heading space, 44 px targets, phone block without font changes, journal records). Browser QA `sleepNightFlow` runs at 390, 360 and 1440 (layout against the data, cursor motion, pause, chosen stage while the night moves, keyboard, off-screen stop, reduced motion, tap targets, real links, colours in both palettes, no errors or third-party requests); against main's `dist` it fails.
- Browser checks cover mobile and desktop layout, all stage/lesson selectors, keyboard range controls, manual pose and view controls, navigation disclosure, six home cards and the sleep directory filter. These checks supplement rather than replace a formal accessibility or scientific review.

Publish only after the branch is reviewed, explicitly approved, merged and its main-branch publish workflow succeeds. Use the complete provenanced `dist` artifact through the existing Sites runbook.
