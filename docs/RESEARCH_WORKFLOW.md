# Evidence UA — Research Workflow

_Last updated: 2026-10-17_

This document defines a reusable research workflow for Evidence UA. It adapts useful principles from scientific problem-selection and literature-review workflows into the existing Evidence UA architecture.

The goal is not to copy another plugin. The goal is to make our own research process explicit, repeatable, auditable and compatible with:

`STUDY → SOURCE → EVIDENCE RECORD → CLAIM → CONFIDENCE → MODULE → VISUAL / PAGE / QUIZ / VIDEO`

## 1. Core principle

Evidence UA should not begin with a page idea and then search for citations to support it.

Start with a scientific question, define what would count as an answer, map the evidence landscape, identify uncertainty, and only then create Claims and outputs.

Research question first. Content format later.

## 2. Evidence UA research loop

```text
QUESTION
↓
PROBLEM FRAMING
↓
EVIDENCE MAP
↓
SOURCE SEARCH
↓
SOURCE TRIAGE
↓
EVIDENCE RECORDS
↓
CLAIMS
↓
CONTRADICTIONS / LIMITATIONS
↓
CONFIDENCE
↓
PRACTICAL INTERPRETATION
↓
VISUAL / ATLAS / LAB / EXERCISE / ARTICLE / VIDEO
↓
REVIEW + UPDATE TRIGGER
```

## 3. Step 1 — Frame the question before searching

Every research task should begin with a short problem statement.

Minimum fields:

- **Question:** What exactly are we trying to understand?
- **Why it matters:** Why would a user care?
- **Population:** Who does this apply to?
- **Exposure / intervention / mechanism:** What are we examining?
- **Outcome:** What would count as a meaningful result?
- **Timeframe:** Acute, short-term, chronic, lifelong?
- **Evidence layers needed:** Human outcomes, mechanistic, animal, in vitro, mixed.
- **Decision/output:** What could this evidence change on the site?

If the question is too broad, split it into Claims before searching.

## 4. Step 2 — Choose important questions, not merely easy ones

Before investing heavily in a topic, rate it on two axes:

- **Impact if answered well**
- **Likelihood that we can answer it responsibly with available evidence**

Prefer questions that are both useful to users and scientifically answerable.

Avoid topics that require multiple unsupported assumptions or where the final output would overstate certainty.

For new large modules, explicitly note:

- biggest scientific risk;
- biggest product risk;
- what evidence would invalidate the idea;
- minimum useful version.

## 5. Step 3 — Build an evidence map before collecting papers

Do not treat all evidence as one pile.

Create separate buckets where relevant:

### Human outcomes
Clinical trials, controlled training studies, prospective cohorts, systematic reviews, meta-analyses, guideline-grade evidence.

### Human mechanistic evidence
Biopsy, imaging, biomarkers, EMG, tracer studies, acute physiology, kinetics.

### Animal evidence
Useful for plausibility and mechanisms, not direct clinical claims.

### In vitro evidence
Useful for molecular mechanisms and hypothesis generation, not direct human outcomes.

### Background / foundational evidence
Anatomy, physiology, measurement validity, methodological papers.

### Ongoing / emerging evidence
Registered clinical trials, preprints and early studies. These must be visibly labeled as preliminary where appropriate.

## 6. Step 4 — Search in layers

A preferred search sequence:

1. high-quality recent systematic reviews / meta-analyses;
2. important guidelines or consensus statements when applicable;
3. pivotal primary human studies;
4. contradictory or null studies;
5. mechanistic human studies;
6. animal / in-vitro work only when needed to explain mechanism;
7. registered ongoing trials / preprints for emerging directions.

Search should be iterative. A review can identify pivotal papers; pivotal papers can identify earlier foundational work and competing interpretations.

Never stop because one paper confirms the expected answer.

## 7. Step 5 — Source triage

Every candidate Source should be screened for:

- study design;
- population;
- sample size;
- comparator;
- intervention/exposure;
- outcome relevance;
- duration;
- directness to the Claim;
- major bias risks;
- conflicts/funding when relevant;
- whether the result is primary, secondary or exploratory;
- whether the publication has corrections, retractions or major post-publication concerns.

A Source can be high quality but still irrelevant to a specific Claim.

## 8. Step 6 — Convert Sources into Evidence Records

Do not attach papers directly to a page as decorative citations.

For each useful result, create an Evidence Record that states:

- which Claim it informs;
- what population was studied;
- what intervention/exposure was used;
- comparator;
- outcome;
- direction and magnitude of result when available;
- timeframe;
- evidence layer;
- key limitation;
- applicability;
- source identifier.

One paper can generate multiple Evidence Records. One Evidence Record should support a clearly bounded proposition.

## 9. Step 7 — Form Claims only after evidence is mapped

A Claim should be narrow enough to be tested against evidence.

Bad:

> Creatine is good for health.

Better:

> In resistance-trained adults, daily creatine supplementation increases gains in fat-free mass compared with resistance training alone over multi-week training interventions.

Every Claim should keep separate:

- what is directly observed;
- proposed mechanism;
- practical inference;
- uncertainty.

## 10. Step 8 — Actively search for contradiction

For every important Claim, ask:

- What evidence disagrees?
- Are null results being hidden by selection?
- Are effects population-specific?
- Does the mechanism explain the human result, or are we merely assuming it does?
- Are surrogate outcomes being mistaken for meaningful outcomes?
- Are acute effects being generalized to chronic adaptation?

Contradiction is data, not a nuisance.

Store conflicting Evidence Records instead of deleting them.

## 11. Step 9 — Confidence and uncertainty

Confidence should reflect the body of evidence, not excitement about a result.

Public levels remain:

- HIGH
- MODERATE
- LOW
- VERY LOW
- INSUFFICIENT

Confidence is not a percentage of truth.

When formal assessment has not been completed, mark it as not formally assessed rather than inventing certainty.

## 12. Step 10 — Practical interpretation

Only after the Claim and confidence are established should we generate practical outputs.

Practical interpretation must answer:

- Who is this relevant to?
- What can we reasonably do with this information?
- What should we not infer?
- What would change the recommendation?
- What safety or red-flag caveats apply?

This is where the same verified Claim can feed:

- Anatomy / Physiology modules;
- Evidence Atlas;
- Labs;
- Exercise Library;
- Nutrition / Sleep pages;
- video scripts;
- comparisons;
- future Evi answers.

## 13. Anatomy + physiology research spine

For anatomy and physiology topics, prefer this teaching structure:

```text
STRUCTURE
↓
FUNCTION
↓
PHYSIOLOGY
↓
MOVEMENT / LOAD / STIMULUS
↓
ACUTE RESPONSE
↓
ADAPTATION
↓
HUMAN OUTCOME
↓
PRACTICAL APPLICATION
↓
EVIDENCE + LIMITATIONS
```

This prevents a common failure mode: explaining an attractive molecular mechanism and then presenting it as a proven human benefit.

## 14. Exercise Library research spine

For each exercise or movement entry:

```text
MOVEMENT
↓
ANATOMICAL STRUCTURES
↓
JOINT ACTIONS
↓
MECHANICAL DEMANDS
↓
PHYSIOLOGICAL / TRAINING PURPOSE
↓
VARIATIONS
↓
REGRESSION / PROGRESSION
↓
LIMITATIONS / CONTRAINDICATION CONTEXT
↓
RELATED CLAIMS + SOURCES
```

Do not label one exercise as universally “best” without a defined outcome, population and comparator.

## 15. Creator-submitted material

When external creators submit videos or educational material, review two separate things:

### A. Material quality
- correct title/category;
- useful demonstration;
- adequate audio/video quality;
- no obvious unsafe framing;
- no spam or misleading metadata.

### B. Scientific claims inside the material
Each factual scientific statement that matters should be mapped to an existing Claim or sent through this research workflow.

Approval of one material does **not** equal scientific endorsement of the creator as a whole.

## 16. New-topic selection gate

Before starting a new major content module, answer:

1. Is this question important enough to deserve a module?
2. Can we answer it with defensible evidence?
3. Does it strengthen anatomy, physiology, Atlas, Labs or Practice?
4. Can the resulting Claims be reused elsewhere?
5. What is the biggest uncertainty?
6. What is the minimum useful output?

If the topic is interesting but fails these gates, capture it in backlog rather than expanding scope.

## 17. Research output package

A completed research task should leave behind tangible artifacts, not only prose.

Minimum package:

- research question;
- evidence map;
- source list;
- Evidence Records;
- Claims;
- contradiction/limitation notes;
- confidence status;
- applicability;
- update/review date;
- recommended outputs for the site.

## 18. Update triggers

A topic should be re-reviewed when one of these occurs:

- major systematic review or meta-analysis;
- important randomized trial;
- guideline/consensus update;
- retraction/correction;
- major contradictory evidence;
- a Claim is reused in a high-impact new feature;
- scheduled review date is reached.

## 19. Working rule

**Do not search for evidence to decorate a conclusion. Search to determine what conclusion is justified.**

The value of Evidence UA is not having more citations. It is showing the relationship between evidence, uncertainty and the claim the user sees.
