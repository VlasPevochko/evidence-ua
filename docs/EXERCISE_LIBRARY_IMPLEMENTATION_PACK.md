# Evidence UA — Exercise Library Implementation Pack

_Last updated: 2026-10-17_

This document turns the Exercise Library MVP into an implementation-ready handoff for Work/Codex. It should reduce ambiguity before runtime work begins.

## 1. Product intent

The Exercise Library is not a generic catalog of fitness videos.

It is a reusable practice layer connected to the Evidence UA knowledge graph:

`ANATOMY → PHYSIOLOGY → MOVEMENT → EXERCISE / PRACTICE → CLAIM → EVIDENCE`

The first implementation should prove that one structured exercise object can be reused from the Library, Atlas, Anatomy, Biomechanics and later Personal Evidence / Evi.

## 2. First runtime slice

Implement only enough to validate the architecture.

Start with three representative entries:

1. **Bent-over dumbbell row** — YouTube `qrL6N-35QrE`
2. **Scapular activation** — YouTube `NDSyt1Ib89E`
3. **Rotator cuff exercise complex** — YouTube `MTdKHhtTRZQ`

Why these three:

- one conventional strength movement;
- one movement-control practice;
- one rehabilitation-context practice;
- all can reuse the current Shoulder / Muscles / Spine Atlas identities;
- they force the UI to distinguish movement facts, coaching and evidence claims.

Do not scale to all 12 seed entries until this slice works on desktop and mobile.

## 3. User-facing information architecture

Preferred public concept:

**Практика**
→ **Бібліотека вправ**
→ exercise/practice detail

Do not create a new top-level product direction if the existing navigation can expose the library under the current Practice / Training structure.

Route names should follow the repository's existing routing conventions rather than forcing a new router architecture.

## 4. Library index — minimum UI

The index should contain:

- page title and short explanation;
- search by title/alias;
- small filter set;
- reusable exercise cards;
- explicit content-type label;
- body-region / movement metadata;
- thumbnail or YouTube-derived preview;
- clear link into detail view.

Minimum filters for v1:

- body region;
- content type;
- movement pattern;
- equipment.

Avoid filters that do not help with 10–20 items.

### Card information hierarchy

1. title;
2. content type (`Силова`, `Мобільність`, `Контроль руху`, etc.);
3. one-line purpose/description;
4. body-region chips;
5. equipment when relevant;
6. video preview / thumbnail;
7. action: `Відкрити` or equivalent.

Do not show confidence badges on a card unless the card contains an actual scientific Claim. An exercise object itself does not have a global evidence score.

## 5. Exercise detail — minimum UI

The detail view should use this hierarchy:

1. **Title + video**
2. **Коротко** — what this movement/practice is
3. **Що рухається** — joints + movement pattern
4. **Анатомія** — structures involved
5. **Як виконувати** — coaching cues
6. **Типові помилки**
7. **Легше / складніше** — regressions + progressions
8. **Варіанти**
9. **Коли бути обережним** — limitations / context
10. **Evidence** — only bounded related Claims
11. **Дослідити тіло** — links back to Atlas / Anatomy

The visual design should make these layers distinguishable without turning the page into a long article.

## 6. Stable data model

The runtime data model should preserve provider independence and Evidence UA reuse.

Suggested object shape:

```js
{
  id: 'exercise_dumbbell_row_bent_over',
  slug: 'dumbbell-row-bent-over',
  titleUk: 'Тяга гантелі в нахилі',
  titleEn: 'Bent-over dumbbell row',
  aliases: ['тяга гантелі однією рукою'],

  media: {
    provider: 'youtube',
    videoId: 'qrL6N-35QrE',
    canonicalUrl: 'https://www.youtube.com/watch?v=qrL6N-35QrE',
    author: 'Vseslav Perekhrestenko',
    publicApproved: true
  },

  contentType: 'strength',
  movementPatterns: ['horizontal_pull'],
  bodyRegions: ['shoulder', 'upper_back', 'elbow'],
  equipment: ['dumbbell'],
  difficulty: 'intermediate',

  jointActions: [],
  primaryStructures: [],
  secondaryStructures: [],

  shortDescriptionUk: '',
  techniqueCuesUk: [],
  commonErrorsUk: [],
  regressions: [],
  progressions: [],
  variations: [],
  limitationsUk: [],
  redFlagsOrReferralNotesUk: [],

  atlasNodeIds: [],
  anatomyNodeIds: [],
  physiologyTopicIds: [],
  relatedClaimIds: [],
  relatedSourceIds: [],

  editorial: {
    reviewStatus: 'draft',
    claimReviewStatus: 'not_assessed',
    lastReviewed: null
  }
}
```

Naming can be adapted to repository conventions, but the separation between these domains should be preserved.

## 7. Controlled vocabularies

### `contentType`

- `strength`
- `mobility`
- `movement_control`
- `coordination`
- `rehab_practice`
- `screen_or_test`

### `movementPatterns` — initial vocabulary

- `horizontal_pull`
- `vertical_pull`
- `horizontal_push`
- `vertical_push`
- `squat`
- `hinge`
- `lunge`
- `carry`
- `trunk_flexion`
- `trunk_extension`
- `anti_extension`
- `anti_rotation`
- `rotation`
- `scapular_control`
- `shoulder_rotation`
- `multiplanar_mobility`
- `coordination_balance`

Do not create dozens of near-duplicate pattern names.

## 8. First three seed mappings

### A. Bent-over dumbbell row

YouTube: `qrL6N-35QrE`

Core classification:

- content type: `strength`
- movement pattern: `horizontal_pull`
- regions: shoulder, scapular region, upper back, elbow
- equipment: dumbbell

Movement/anatomy starting map:

- glenohumeral extension / horizontal-extension context depending on execution;
- scapular retraction/control;
- elbow flexion;
- latissimus dorsi;
- posterior deltoid;
- rhomboid major/minor;
- middle/lower trapezius contribution;
- biceps brachii / brachialis / brachioradialis contribution;
- trunk and hip musculature as positional stabilisers.

Important editorial rule:

Do not present one fixed scapular motion description as universal across every row technique. The exact joint contribution depends on path, grip, torso position and intent.

### B. Scapular activation

YouTube: `NDSyt1Ib89E`

Core classification:

- content type: `movement_control`
- movement pattern: `scapular_control`
- regions: shoulder / scapula / thoracic region

Starting anatomy concepts:

- scapulothoracic motion;
- protraction / retraction;
- upward / downward rotation when applicable;
- serratus anterior;
- trapezius portions;
- rhomboid contribution;
- interaction with humeral movement.

Editorial rule:

Avoid the claim that a person must “activate” a muscle because it is “off” unless a bounded Claim supports that exact interpretation. User-facing language should prefer control, loading, awareness or movement practice where appropriate.

### C. Rotator cuff exercise complex

YouTube: `MTdKHhtTRZQ`

Core classification:

- content type: `rehab_practice`
- movement pattern: `shoulder_rotation`
- region: shoulder

Starting anatomy concepts:

- supraspinatus;
- infraspinatus;
- teres minor;
- subscapularis;
- glenohumeral rotation;
- humeral-head control / force-couple context.

Editorial rule:

The exercise can be shown as a rotator-cuff loading practice. Do not claim it treats shoulder pain, prevents injury or is universally required without mapping those outcome statements to Claims.

## 9. Atlas integration contract

Reuse current Atlas identities instead of creating parallel region objects.

Known Atlas zone identities currently include:

- `shoulder`
- `spine`
- `muscles`
- `knee`
- `brain`
- `gut`

For the first three exercises:

- Dumbbell Row → `shoulder`, `muscles`, optionally `spine` as movement/stabilisation context;
- Scapular Activation → `shoulder`, `muscles`;
- Rotator Cuff Complex → `shoulder`, `muscles`.

Atlas integration should support both directions:

`Atlas → related practice`

and

`Exercise → explore this region in Atlas`.

Do not duplicate Pain Map logic inside the Exercise Library.

## 10. Evidence integration contract

The exercise page should not require evidence citations for every descriptive sentence.

Keep three layers visibly separate:

### Layer 1 — descriptive facts

Movement, equipment, joint actions, anatomy.

### Layer 2 — coaching/editorial guidance

Cues, setup, regressions, progressions, common execution issues.

### Layer 3 — scientific outcome Claims

Examples:

- effect on pain/function;
- hypertrophy superiority;
- injury prevention;
- rehabilitation outcome;
- comparative joint loading;
- specific performance outcome.

Only Layer 3 must enter the Claim/Evidence workflow.

If no reviewed Claim exists yet, display no fake evidence score. Prefer wording such as:

`Пов’язані наукові твердження ще проходять перевірку.`

## 11. Safety and language rules

Avoid absolute UI copy such as:

- `виправляє поставу`;
- `лікує біль`;
- `прибирає защемлення`;
- `запобігає травмам`;
- `найкраща вправа`;
- `ідеальна техніка`.

Prefer bounded language:

- `варіант силового навантаження`;
- `практика контролю руху`;
- `може використовуватися в контексті...` only when justified;
- `реакція на вправу індивідуальна` where symptom context is involved.

Red-flag content should link or refer to the Atlas safety layer where possible rather than inventing a second diagnostic flow.

## 12. YouTube embed behavior

For v1:

- embed by video ID;
- use privacy-enhanced YouTube embed where practical;
- preserve external `Відкрити на YouTube` fallback;
- lazy-load embeds where reasonable;
- reserve aspect ratio to prevent layout shift;
- if embedding is disabled/unavailable, keep the exercise page usable;
- never let media failure hide the structured exercise information.

Do not mirror video files into Evidence UA storage in v1.

## 13. Mobile behavior

Mobile is a Definition-of-Done requirement.

Expected mobile hierarchy:

- title;
- video;
- concise metadata chips;
- collapsible or clearly separated content sections;
- large touch targets;
- no horizontal overflow;
- filters usable without consuming most of the viewport;
- Atlas links easy to tap;
- Evidence drawer/content must not trap scroll or focus incorrectly.

Test at minimum around 360 px and 390 px widths because these sizes have already mattered elsewhere in the project.

## 14. Accessibility baseline

- semantic headings;
- iframe title for YouTube media;
- keyboard-usable filters;
- visible focus state;
- labels for search/filter controls;
- sufficient text contrast;
- no essential information encoded by colour alone;
- reduced-motion compatibility if animated cards are added.

## 15. Test matrix

Minimum automated or deterministic checks:

- library index renders all seed data supplied;
- search returns expected item;
- body-region filter works;
- content-type filter works;
- combined filters do not produce stale state;
- detail view resolves by stable ID/slug;
- invalid slug has safe fallback;
- YouTube ID is not duplicated into unrelated data fields;
- Atlas links use existing identities;
- no fake Claim/confidence is rendered for unreviewed items;
- unavailable video state preserves page content;
- navigation back to library works.

Manual/browser checks:

- desktop;
- 390 px mobile;
- 360 px mobile;
- keyboard navigation;
- real YouTube embed;
- external YouTube fallback;
- long Ukrainian titles;
- filter reset;
- Atlas round trip.

## 16. First visual direction

Stay inside the current Evidence UA design language.

The library should feel like a scientific practice explorer rather than a gym-program marketplace.

Preferred visual cues:

- clean media cards;
- restrained anatomical metadata chips;
- subtle body-region links;
- strong typography;
- expandable deeper science rather than dense citation blocks at first glance;
- `Чому ми так стверджуємо?` only where an actual Claim exists.

Avoid:

- bodybuilding-app visual clichés;
- exercise ranking scores;
- green/red “good/bad” technique verdicts;
- fake precision percentages;
- excessive badges.

## 17. Definition of Done for the three-item slice

The first runtime slice is complete only when:

- one Library index exists;
- all three representative items are visible;
- one reusable detail template renders all three;
- media is data-driven rather than hard-coded per page;
- content types are distinguishable;
- Atlas links reuse existing identities;
- descriptive/coaching/evidence layers are visibly separated;
- no unsupported therapeutic claim is introduced;
- desktop + mobile behavior is verified;
- retained site tests remain green;
- adding a fourth item requires data only, not another custom page.

## 18. Scale-up after validation

After the three-item slice is accepted:

1. migrate the remaining selected 12 seed videos;
2. add the planned fundamental movement recordings;
3. connect reviewed Claims;
4. expose related exercises from Anatomy/Atlas;
5. add richer physiology links;
6. only then consider creator submissions.

## 19. Work/Codex instruction

When implementation becomes available:

**Do not redesign the whole site. Do not merge unrelated Atlas or roadmap work. Build the smallest reusable Exercise Library slice that proves the data model, Atlas reuse, mobile UX and evidence separation. Verify before scaling.**
