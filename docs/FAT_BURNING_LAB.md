# Fat Burning Lab — evidence and publishing scope

Date: 2026-10-20. Owner request: an interactive Ukrainian entrance into fat loss science. Site-first; short-form video production excluded.

## Question and outcome

- Mechanism: Where do triglyceride atoms go during full oxidation?
- Human outcome: What is the difference between transient substrate oxidation and longitudinal loss of fat mass?
- Practical human evidence: What roles do energy balance, resistance exercise, activity and sustainable eating play?
- Safety: What do we know about products marketed as fat burners?

This **first educational edition** is not a complete systematic review, approved clinical guideline, personal diet prescription, or completed canonical Claim/EVR assessment. No confidence score, effect percentage or quantitative prediction is assigned.

## Source map (links also on the live page)

1. Meerman R, Brown AJ. When somebody loses weight, where does the fat go? BMJ. 2014;349:g7257. DOI 10.1136/bmj.g7257. Conservation-of-mass/stoichiometric mechanism, not an intervention trial. The article has a published figure correction (BMJ 2014;349:g7782); avoid copying figures or quantitative graphics from old versions.
2. Hall KD et al. Quantification of the effect of energy imbalance on bodyweight. Lancet 2011;378:826–837; NIDDK research behind Body Weight Planner. Model, not individual prognosis.
3. Effect of resistance exercise on body composition, muscle strength and cardiometabolic health during dietary weight loss in people living with overweight or obesity. BMJ Open Sport Exerc Med. DOI 10.1136/bmjsem-2024-002363. Systematic review and meta-analysis of RCTs. Adult overweight/obesity populations; do not overgeneralise.
4. US NCCIH, Six Things To Know About Dietary Supplements Marketed for Weight Loss. Consumer-oriented evidence and safety notice, not a head-to-head trial.

## Visual interpretation rules

- Four-step visual is a simplified conceptual flow, not a complete route of every fatty acid or a fixed timeline.
- Lipolysis ≠ oxidation ≠ change in body fat mass.
- The CO2 + water statement is about **where atoms of fully oxidized triglycerides end up**; voluntary hyperventilation is not a fat-loss technique.
- The energy bars encode only relative concepts; no kcal, kilograms, predicted rates, recommendations or physiological quantities.
- Distinguish change in body weight from change in body composition.
- Do not infer greater fat-mass reduction from acutely increased fat oxidation.

## Publishing and QA

- Authoritative page files are authored in dist/, referenced from the existing platform-catalog Nutrition unit; they are not outputs of build generators.
- Browser QA already visits each HTML document at mobile and desktop widths. The page deliberately has one h1, a shared header, responsive content, no remote load on startup and reduced-motion CSS.
- tests/fat-burning.test.mjs protects route discovery, structure, stage semantics and source presence. Test checks are *not* evidence review.
- Before merge: verify CI build, static regression suite, smoke, Browser QA; inspect the page at 390 and 1440 px. Only owner may authorise merge.

## Backlog (not claimed implemented)

1. Formal evidence extraction to canonical STUDY → SOURCE → EVR → CLAIM → CONFIDENCE per claim, with scientific review.
2. Outcome-specific comparison of eating patterns, aerobic and resistance training, NEAT, sleep and maintenance.
3. Study-backed myth cards with graded uncertainty, especially fasted training and spot reduction.
4. Additional tailored short-form visuals and ethical analytics after explicit owner decisions.

## Visible entry within Nutrition (2026-10-20)

The existing Fat Burning Lab remains at `./fat-burning.html`. A compact featured visual on `nutrition.html` now sits **above the diet catalogue**, with one clear action linking directly to the Lab and a top-of-page local anchor labeled «Жироспалення». Canonical markup is `src/nutrition-fat-burning/entry.mjs`, injected into a bounded marker pair by `scripts/build-nutrition-fat-burning.mjs`; the adjacent educational scientific HTML remains unchanged. Styling is scoped in `dist/nutrition-fat-burning.css`. Test coverage includes builder idempotence, live link, small-screen layout, and browser click-through.

## Upgrade 2026-11-14 (owner decision «все так»: scope = design and mechanisms only)

Changed (UI only, scientific sentences verbatim; `tests/fat-burning-science.test.mjs` hashes them against the pre-upgrade page):

- **Stage diagram is motion.** Four stations on one line, a packet rides a rail to the active stage (`--fb-i`, `--fb-p` set by `dist/fat-burning.js`); only the active station animates (droplet → fatty-acid chains leaving → pieces inside a mitochondrion → CO₂ and water rising). Stage buttons sit directly under the stations (the separate label row is gone). On phones the SVG is 480 px wide and slides to keep the active station centred. No text inside the SVG. Reduced motion, no-JS and print show the static state.
- **Balance** keeps the two bars (cause) and adds a store chart (effect): thin line = daily weight, wiggles; thick line = fat store trend. Shape only, no numbers (`storeShape()`).
- **Myths**: no accordion. Answer is always open; a verdict (sign + word: Ні / Не гарантовано / Не доведено / Доказів недостатньо) summarises what the answer already says. Question lines are `<p>`, not headings, so search does not index them as claims.
- **Section bar** replaces the five pill links and the second hero button: sticky, marks the current section with `aria-current`. The «Продовжити дослідження» block is removed (it duplicated practice links); the supplements link moved into myth 5.
- Practice cards became flat columns with a top rule (no fills), stacked on phones (no swiper).
- Hero: CO₂/H₂O chips rise from the cell; the meaningless «ADIPOCYTE 01 / 04» tag is replaced.

Not done and why: the 84 % CO₂ / 16 % water split from Meerman & Brown was **not** added. PubMed gives no numbers in the abstract and the full text is not open there; per the project rule, numbers come from the full text, so it stays out until someone reads the BMJ page (and its figure correction g7782).

Measured on 390 px: 6110 px before → see PR for the current number. All answer text is now visible instead of folded, so the phone page is not much shorter; this is a deliberate trade (no hidden main text).
