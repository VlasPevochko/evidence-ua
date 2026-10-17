# Evidence UA — North Star

_Last updated: 2026-10-17_

This document is the canonical direction lock for Evidence UA. It exists to prevent scope drift while the platform grows.

## 1. What Evidence UA is

Evidence UA is a Ukrainian evidence-based learning and decision-support platform about health, physiology, training, nutrition, rehabilitation, recovery and adjacent topics.

It is not a generic fitness blog, an AI-answer site, an SEO farm, or a collection of disconnected pages.

The core promise is:

> Show what the totality of evidence suggests.  
> Show how confident we are.  
> Show why.  
> Show where knowledge ends.

## 2. Architectural North Star

Content does not belong to pages. Pages are assembled from knowledge.

Canonical knowledge flow:

```text
STUDY
↓
SOURCE
↓
EVIDENCE RECORD
↓
CLAIM
↓
CONFIDENCE
↓
MODULE
↓
VISUAL / PAGE / QUIZ / COMPARISON / VIDEO
↓
FUTURE PERSONAL LAYERS / EVI
```

The primary scientific unit is a Claim, not a page, card or article.

## 3. Product layers

Evidence UA should grow in this order:

### Layer A — Foundation
- GitHub is the source of truth.
- Reproducible build and tests.
- Stable publishing/deployment path.
- Claims / Sources / Evidence Records / confidence model.
- Scientific review workflow and provenance.

### Layer B — Interactive Evidence
- Evidence Atlas.
- Cell Lab.
- Nutrition and metabolism modules.
- Biomechanics / movement modules.
- Sleep / recovery.
- Muscle / hypertrophy.
- Visual explanations that connect back to Claims and Sources.

### Layer C — Personal Evidence
- User context.
- Symptom and movement screening.
- Training / rehabilitation decision support.
- Progress tracking.
- Personalised outputs only when the evidence base and safety rules are ready.

### Layer D — Platform
- Evi as a layer over the structured Evidence Base.
- Evidence Bodybuilding.
- Specialist / coach / clinician ecosystem.
- Verified products / equipment / services.
- Marketplace and monetisation.
- API and external products.

## 4. Current execution phase

Current phase: **Foundation + Interactive Evidence**.

The immediate goal is not to build every future feature. It is to make the current scientific and product architecture stable enough that future layers do not require a rewrite.

### Current priorities

1. Keep GitHub `main` healthy and reproducible.
2. Keep the Evidence Base architecture coherent.
3. Finish scientific review of the first production evidence modules before scaling them blindly.
4. Finish/validate Evidence Atlas as the first major interactive body-navigation layer.
5. Maintain mobile, accessibility and browser QA.
6. Keep one reliable production/deployment path.
7. Preserve the video factory as a reusable output layer over verified evidence.

## 5. Explicitly NOT NOW

Do not start large implementation of these until the current phase is stable:

- full Evi assistant;
- full personal health profile;
- automated diagnosis;
- personalised treatment plans;
- marketplace;
- Evidence Verified commercial certification;
- full Bodybuilding platform;
- broad specialist network;
- dozens of new Labs at once;
- large monetisation systems;
- unrelated design rewrites.

Ideas are welcome, but they go to backlog unless they unblock the current phase.

## 6. Scientific guardrails

Non-negotiable:

- mechanism ≠ human outcome;
- association ≠ causation;
- do not invent PMID, DOI, effect size, sample size, dose or certainty;
- confidence is not a percentage of truth;
- retractions/corrections must remain traceable;
- conflicting evidence is preserved, not hidden;
- limitations and applicability are first-class data;
- no sponsor can purchase a scientific conclusion;
- AI may assist the workflow but may not silently become the source of scientific truth.

## 7. Product safety guardrails

Interactive health tools must not imply diagnosis from a single symptom, hotspot, image or movement.

For rehabilitation and symptom tools:

- observation before conclusion;
- hypothesis before diagnosis;
- clear uncertainty;
- red-flag escalation where appropriate;
- no unsupported personalised treatment recommendation;
- user-visible distinction between education, screening and medical diagnosis.

## 8. Scope gate for every new feature

Before implementation, a feature must answer YES to at least one:

1. Does it strengthen the Evidence Base?
2. Does it make verified evidence easier to understand or explore?
3. Does it improve reliability, QA, publishing or scientific provenance?
4. Does it create a reusable platform capability needed by the next layer?

And it must answer NO to all:

- Does it require rewriting the whole system without necessity?
- Does it duplicate an existing architecture?
- Does it weaken scientific provenance?
- Does it create a parallel data model?
- Does it introduce a major future layer before its prerequisites exist?

If the answer is unclear, park it in backlog.

## 9. Change gate

Do not merge a major feature only because it works visually.

A major change should pass the relevant gates:

- architecture review;
- scientific review where claims change;
- automated tests;
- mobile/browser QA;
- accessibility/focus review for interactive UI;
- preservation of existing scientific content;
- explicit owner approval when the PR says approval is required.

## 10. Current PR policy

Open work should be treated as one of:

- **CURRENT** — directly advances the current phase;
- **DEFERRED** — useful, but not part of the current execution path;
- **REVIEW / RECONCILE** — legacy or preservation work that must be compared against current `main` before merge;
- **DROP** — obsolete, duplicated or superseded.

Do not keep adding active branches without assigning one of these states.

As of 2026-10-17:

- PR #15 Evidence Atlas — **CURRENT**, owner review required before merge.
- PR #13 glossary/editorial transparency — **DEFERRED / valuable**, revisit after current interactive architecture stabilises.
- PR #5 CreatineJourney caption polish — **DEFERRED / narrow polish**, not a platform blocker.
- PR #8 unpublished Cell Lab layout preservation — **REVIEW / RECONCILE** against current `main` before any merge.

## 11. Roadmap sequence

```text
FOUNDATION
↓
INTERACTIVE EVIDENCE
↓
PERSONAL EVIDENCE
↓
EVI
↓
BODYBUILDING + SPECIALIST / MARKETPLACE LAYERS
↓
LARGER PLATFORM / API
```

This sequence is directional, not a promise that every item must be built.

## 12. One knowledge base, many outputs

A verified Claim should eventually be reusable across:

- evidence dossier;
- interactive visual;
- Evidence Atlas;
- quiz / teacher material;
- short-form video;
- long-form YouTube;
- comparison tool;
- future Evi response;
- future personal decision support.

Do not create separate scientific truths for each medium.

## 13. Anti-drift rule

When a new exciting idea appears:

1. capture it;
2. classify it by product layer;
3. check prerequisites;
4. do not interrupt the current priority unless it solves a current blocker.

The project may expand for years. The current sprint must stay narrow.

## 14. Definition of success for the present phase

We are ready to move decisively toward Personal Evidence when:

- GitHub and production flow are dependable;
- the Evidence Base model is actually used by production modules;
- scientific review status is explicit and trustworthy;
- at least several interactive modules prove the shared architecture;
- Atlas is stable enough to act as the body-navigation layer;
- mobile/accessibility QA is repeatable;
- video/content outputs can reuse the same verified evidence;
- adding a new topic does not require inventing a new architecture.

Until then: **build the foundation, prove the interactive system, resist scope drift.**
