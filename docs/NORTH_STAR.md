# Evidence UA — North Star

## Нові рішення власника та зміни дизайну — 2026-10-18

Нова конкретна вказівка Всеслава щодо дизайну, кольорів, шрифтів, текстів інтерфейсу, композиції, навігації чи поведінки має пріоритет над попередніми макетами, маніфестами, стандартами, референсами та вимогами «зберігати» / «не змінювати» у межах доручення. Вона є достатнім дозволом на відповідну зміну; повторне підтвердження лише через старе рішення не потрібне.

Попередні рішення діють для незачеплених частин. Після зміни оновлювати пов’язані чинні інструкції та відповідні UI-контракти з поясненням. Історичні звіти, резервні копії та попередні версії залишати історією; не відновлювати старий дизайн автоматично. Залежності між сторінками враховувати та пояснювати; уточнення потрібне тільки для справді невизначеного обсягу або суттєвого вибору.

Дизайн і макети можна розвивати; «зафіксовано» означає захист від випадкових змін поза завданням. Для дозволеної зміни оновлювати лише відповідні UI-еталони, зберігаючи наукові перевірки. Доручення змінити оформлення не дозволяє вигадувати чи самостійно змінювати наукові висновки, рівні впевненості або provenance. Зберігати перевірки, резервні копії та чинний порядок Git/PR/публікації.


_Last updated: 2026-10-17_

This document records the current direction for Evidence UA and prevents incidental scope drift. The owner's newer concrete instructions take precedence within their stated scope; it does not freeze the design.

## 1. What Evidence UA is

Evidence UA is a Ukrainian evidence-based learning and decision-support platform about health, physiology, training, nutrition, rehabilitation, recovery and adjacent topics.

It is not a generic fitness blog, an AI-answer site, an SEO farm, or a collection of disconnected pages.

The core promise is:

> Show what the totality of evidence suggests.  
> Show how confident we are.  
> Show why.  
> Show where knowledge ends.

### Content foundation

The educational foundation of Evidence UA is **anatomy + physiology first**.

The site should not behave like a static anatomy textbook. It should help users explore what structures are, what they do, what changes during movement/exercise/recovery, and how those explanations connect to evidence.

Preferred learning path:

```text
STRUCTURE
↓
FUNCTION
↓
PHYSIOLOGY
↓
MOVEMENT / LOAD
↓
ADAPTATION / RESPONSE
↓
EVIDENCE
↓
PRACTICE
```

Whenever possible, anatomy and physiology should be explorable, visual and connected to real actions such as exercises, symptoms, training decisions and rehabilitation contexts.

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
VISUAL / PAGE / QUIZ / COMPARISON / VIDEO / EXERCISE
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
- Anatomy and physiology as the core educational map.
- Evidence Atlas.
- Cell Lab.
- Nutrition and metabolism modules.
- Biomechanics / movement modules.
- Sleep / recovery.
- Muscle / hypertrophy.
- Exercise Library / Practice layer.
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
5. Define the first reusable **Exercise Library / Practice** architecture using existing owner-recorded YouTube videos before building a broad creator ecosystem.
6. Make Exercise items link back to anatomy, physiology, biomechanics, Atlas regions and evidence rather than existing as isolated video cards.
7. Maintain mobile, accessibility and browser QA.
8. Keep one reliable production/deployment path.
9. Preserve the video factory as a reusable output layer over verified evidence.

## 5. Exercise Library / Practice

The Exercise Library is part of **Interactive Evidence**, not a separate disconnected media section.

MVP principle:

```text
EXERCISE
↓
VIDEO
+
PRIMARY / SECONDARY STRUCTURES
+
JOINT ACTIONS / MOVEMENT
+
BIOMECHANICS NOTES
+
PURPOSE / USE CASE
+
TECHNIQUE CUES
+
REGRESSION / PROGRESSION
+
LIMITATIONS / CAUTIONS
+
RELATED CLAIMS / SOURCES
```

Initial library should preferentially use existing Evidence UA / owner-recorded exercise videos and YouTube embeds so that video hosting infrastructure is not required for the MVP.

Exercise pages/cards should be reusable from multiple entry points:

- Anatomy → muscle/structure → related exercises.
- Atlas → body region → training / rehabilitation → related exercises.
- Biomechanics → movement pattern → examples.
- Practice → exercise catalog.
- Future personal tools → selected exercise plan.

The goal is a knowledge graph, not a playlist.

## 6. Creator submissions — future extension of Practice

Evidence UA may allow external coaches, clinicians, educators and creators to submit videos for inclusion.

This is a **curated submission system**, not open publishing.

Canonical flow:

```text
SUBMIT LINK
↓
EDITORIAL / TECHNICAL REVIEW
↓
CLAIM REVIEW WHEN NEEDED
↓
APPROVE / REQUEST CHANGES / REJECT
↓
PUBLISH AS CURATED MATERIAL
```

Important distinction:

- Evidence UA may approve a specific material.
- Evidence UA does **not** automatically certify the creator as a whole.
- Scientific claims inside a video are reviewed as Claims, not accepted because of the creator's reputation.

Potential future creator profile fields:

- name / channel;
- expertise / role;
- approved materials;
- topics;
- outbound YouTube / social links;
- clear editorial status.

This can later create a creator traffic loop, but traffic growth must not weaken scientific review or turn the site into an uncurated video aggregator.

### Creator submissions are not MVP blockers

Do not build accounts, open uploads, creator rankings or creator monetisation until:

- the internal Exercise Library structure is stable;
- moderation states are defined;
- content ownership / embedding rules are clear;
- scientific/editorial review responsibilities are explicit;
- abuse/spam handling exists.

## 7. Explicitly NOT NOW

Do not start large implementation of these until the current phase is stable:

- full Evi assistant;
- full personal health profile;
- automated diagnosis;
- personalised treatment plans;
- marketplace;
- Evidence Verified commercial certification;
- full Bodybuilding platform;
- broad specialist network;
- open creator self-publishing;
- native user video hosting/uploads;
- creator rankings or creator monetisation;
- dozens of new Labs at once;
- large monetisation systems;
- unrelated design rewrites.

Ideas are welcome, but they go to backlog unless they unblock the current phase.

## 8. Scientific guardrails

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

## 9. Product safety guardrails

Interactive health tools must not imply diagnosis from a single symptom, hotspot, image or movement.

For rehabilitation and symptom tools:

- observation before conclusion;
- hypothesis before diagnosis;
- clear uncertainty;
- red-flag escalation where appropriate;
- no unsupported personalised treatment recommendation;
- user-visible distinction between education, screening and medical diagnosis.

For Exercise Library / creator materials:

- distinguish demonstration from evidence claim;
- do not present one exercise as universally best without evidence;
- technical cues must not be framed as universal injury-prevention rules without support;
- author popularity is not evidence quality;
- approval of one material is not endorsement of all creator content.

## 10. Scope gate for every new feature

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

## 11. Change gate

Do not merge a major feature only because it works visually.

A major change should pass the relevant gates:

- architecture review;
- scientific review where claims change;
- automated tests;
- mobile/browser QA;
- accessibility/focus review for interactive UI;
- preservation of existing scientific content;
- explicit owner approval when the PR says approval is required.

## 12. Current PR policy

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

## 13. Roadmap sequence

```text
FOUNDATION
↓
ANATOMY + PHYSIOLOGY CORE
↓
INTERACTIVE EVIDENCE / ATLAS / LABS
↓
EXERCISE LIBRARY / PRACTICE
↓
CURATED CREATOR SUBMISSIONS
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

## 14. One knowledge base, many outputs

A verified Claim should eventually be reusable across:

- evidence dossier;
- anatomy / physiology explanation;
- interactive visual;
- Evidence Atlas;
- Exercise Library / Practice;
- quiz / teacher material;
- short-form video;
- long-form YouTube;
- comparison tool;
- future Evi response;
- future personal decision support.

Do not create separate scientific truths for each medium.

## 15. Anti-drift rule

When a new exciting idea appears:

1. capture it;
2. classify it by product layer;
3. check prerequisites;
4. do not interrupt the current priority unless it solves a current blocker.

The project may expand for years. The current sprint must stay narrow.

## 16. Definition of success for the present phase

We are ready to move decisively toward Personal Evidence when:

- GitHub and production flow are dependable;
- the Evidence Base model is actually used by production modules;
- scientific review status is explicit and trustworthy;
- anatomy + physiology act as a coherent educational backbone rather than disconnected pages;
- at least several interactive modules prove the shared architecture;
- Atlas is stable enough to act as the body-navigation layer;
- the Exercise Library proves that video/practice content can reuse the same anatomy, physiology and evidence architecture;
- mobile/accessibility QA is repeatable;
- video/content outputs can reuse the same verified evidence;
- adding a new topic does not require inventing a new architecture.

Until then: **build the foundation, prove the interactive system, connect knowledge to practice, resist scope drift.**
