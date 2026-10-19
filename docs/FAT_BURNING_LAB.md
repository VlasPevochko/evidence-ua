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
