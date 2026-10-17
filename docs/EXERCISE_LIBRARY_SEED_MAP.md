# Evidence UA — Exercise Library Seed Map

_Last updated: 2026-10-17_

This document maps the first 12 owner-recorded Exercise Library entries to the current Evidence UA body knowledge system.

The purpose is to make implementation deterministic before UI work begins.

Core rule:

`VIDEO → PRACTICE OBJECT → MOVEMENT → ANATOMY → ATLAS → PHYSIOLOGY → CLAIMS / EVIDENCE`

This map uses **semantic targets**, not duplicated anatomy pages. Where an Atlas area does not yet exist, the entry links to the closest existing body region and records the missing anatomy target for later expansion.

## 1. Current Atlas identities we can reuse

Current Atlas zone keys relevant to the seed set:

- `shoulder` — Плечовий комплекс; current full module;
- `spine` — Хребет; planned;
- `muscles` — М’язова система; planned;
- `knee` — Колінний комплекс; beta, not central to the current 12-entry seed set.

The shoulder module already includes scapulothoracic interaction, rotator cuff, glenohumeral/AC/SC joint context and training/rehab tabs. Therefore **do not create a separate parallel scapula Atlas** for the MVP.

## 2. Canonical seed objects

### 2.1 Bent-over dumbbell row

- `id`: `exercise_dumbbell_row_bent_over`
- `slug`: `tyaha-hanteli-v-nahili`
- YouTube: `qrL6N-35QrE`
- `content_type`: `strength`
- Primary Atlas targets: `shoulder`, `muscles`
- Secondary / contextual Atlas target: `spine`
- Movement pattern: horizontal pull
- Main joint actions:
  - shoulder extension / horizontal abduction depending on elbow path;
  - scapular retraction with dynamic scapular control;
  - elbow flexion;
  - trunk isometric control.
- Anatomy entities:
  - latissimus dorsi;
  - trapezius;
  - rhomboids;
  - posterior deltoid;
  - biceps brachii / brachialis / brachioradialis;
  - scapula;
  - glenohumeral joint;
  - elbow joint;
  - thoracolumbar trunk musculature as stabilising context.
- Physiology paths:
  - force production;
  - motor-unit recruitment;
  - fatigue;
  - resistance-training adaptation / hypertrophy.
- Evidence gate:
  - movement/anatomy can be descriptive;
  - any claim that one row variation is “better” for hypertrophy needs a defined comparator/outcome.

### 2.2 Shoulder + scapula mobility complex

- `id`: `practice_shoulder_scapula_mobility_complex`
- `slug`: `mobilnist-plecha-lopatky`
- YouTube: `HXc_N5WXAfw`
- `content_type`: `mobility`
- Primary Atlas target: `shoulder`
- Secondary Atlas target: `spine`
- Movement pattern: multi-direction shoulder/scapula mobility
- Anatomy entities:
  - glenohumeral joint;
  - scapula;
  - AC joint;
  - SC joint;
  - thoracic spine;
  - rotator cuff as control context;
  - serratus anterior;
  - trapezius.
- Physiology paths:
  - range-of-motion tolerance;
  - motor control;
  - acute response to movement.
- Evidence gate:
  - do not imply that increased acute ROM equals corrected pathology or long-term prevention.

### 2.3 Scapular activation / control

- `id`: `practice_scapular_activation_control`
- `slug`: `kontrol-lopatky`
- YouTube: `NDSyt1Ib89E`
- `content_type`: `movement_control`
- Primary Atlas target: `shoulder`
- Secondary Atlas target: `muscles`
- Movement pattern: scapular control
- Anatomy entities:
  - scapula;
  - serratus anterior;
  - upper/middle/lower trapezius;
  - rhomboids;
  - clavicle;
  - thoracic cage.
- Joint / segment actions:
  - protraction/retraction;
  - upward/downward rotation;
  - elevation/depression depending on drill.
- Physiology paths:
  - motor learning;
  - coordination;
  - force sharing across the shoulder complex.
- Evidence gate:
  - “activation” must not be presented as proof of injury prevention or superior hypertrophy.

### 2.4 Rotator cuff exercise complex

- `id`: `practice_rotator_cuff_complex`
- `slug`: `rotatorna-manzheta-kompleks`
- YouTube: `MTdKHhtTRZQ`
- `content_type`: `rehab_practice`
- Primary Atlas target: `shoulder`
- Anatomy entities:
  - supraspinatus;
  - infraspinatus;
  - teres minor;
  - subscapularis;
  - humeral head;
  - glenoid;
  - scapula.
- Main joint actions:
  - external rotation;
  - internal rotation where present;
  - humeral-head control during elevation.
- Physiology paths:
  - tendon/muscle loading tolerance;
  - strength adaptation;
  - motor control.
- Evidence gate: **high priority**
  - pain, rehabilitation, rotator-cuff tendinopathy and return-to-function claims must map to bounded Claims;
  - do not imply diagnosis from response to an exercise.

### 2.5 Chest / shoulder-girdle development with scapula + cuff context

- `id`: `practice_chest_shoulder_girdle_context`
- `slug`: `hrudy-plechovyi-poyas`
- YouTube: `w2XC6Igeyyo`
- `content_type`: `strength`
- Primary Atlas targets: `shoulder`, `muscles`
- Movement pattern: push / shoulder-girdle strength context
- Anatomy entities:
  - pectoralis major/minor;
  - anterior deltoid;
  - triceps brachii where pressing is present;
  - scapula;
  - serratus anterior;
  - rotator cuff.
- Physiology paths:
  - force production;
  - hypertrophy adaptation;
  - load tolerance.
- Evidence gate:
  - distinguish biomechanical explanation from comparative hypertrophy outcomes.

### 2.6 Advanced scapular-control progression

- `id`: `practice_scapular_control_progression`
- `slug`: `progresiya-kontrolyu-lopatky`
- YouTube: `P6t_LAZCdqw`
- `content_type`: `movement_control`
- Primary Atlas target: `shoulder`
- Secondary Atlas target: `muscles`
- Movement pattern: advanced closed/open-chain scapular control depending on the recorded drill
- Anatomy entities:
  - scapula;
  - serratus anterior;
  - trapezius;
  - rotator cuff;
  - shoulder joint.
- Physiology paths:
  - coordination;
  - progressive overload of motor/strength task;
  - motor learning.
- Evidence gate:
  - progression logic may be practical/editorial;
  - claims of improved pain/injury prevention require Evidence Base support.

### 2.7 Back + mobility complex

- `id`: `practice_back_mobility_complex`
- `slug`: `spyna-mobilnist-kompleks`
- YouTube: `fg9Wpawsi9c`
- `content_type`: `mobility`
- Primary Atlas target: `spine`
- Secondary Atlas targets: `shoulder`, `muscles`
- Movement pattern: trunk / thoracic mobility + integrated back movement
- Anatomy entities:
  - thoracic spine;
  - lumbar spine when present;
  - rib cage;
  - scapula;
  - trunk extensors;
  - latissimus dorsi depending on movement.
- Physiology paths:
  - mobility / movement tolerance;
  - acute stiffness perception;
  - motor control.
- Evidence gate:
  - no claim that a generic mobility sequence “fixes” low-back pathology.

### 2.8 Back-strength / “cobra back” movement set

- `id`: `exercise_back_strength_cobra_set`
- `slug`: `sylovyi-kompleks-spyna`
- YouTube: `6Mxz9Raufy8`
- `content_type`: `strength`
- Primary Atlas target: `muscles`
- Secondary Atlas targets: `shoulder`, `spine`
- Movement pattern: pulling / posterior-chain upper-body strength
- Anatomy entities:
  - latissimus dorsi;
  - trapezius;
  - rhomboids;
  - posterior deltoid;
  - elbow flexors where relevant;
  - trunk stabilisers.
- Physiology paths:
  - hypertrophy;
  - strength;
  - local muscular fatigue.
- Evidence gate:
  - avoid “best back exercise” language without explicit comparator/outcome.

### 2.9 Animal Flow — mobility

- `id`: `practice_animal_flow_mobility`
- `slug`: `animal-flow-mobilnist`
- YouTube: `ZAt8wfSPpb4`
- `content_type`: `mobility`
- Primary Atlas targets: `shoulder`, `spine`, `muscles`
- Future Anatomy target: hip complex
- Movement pattern: multiplanar integrated ground movement
- Anatomy entities:
  - shoulder complex;
  - wrists/hands as load-bearing context;
  - thoracic/lumbar spine;
  - hip complex;
  - knee/ankle depending on transitions;
  - trunk musculature.
- Physiology paths:
  - coordination;
  - mobility;
  - whole-body load sharing;
  - acute cardiovascular/metabolic demand only if actually measured/claimed.
- Evidence gate:
  - treat broad wellness/rehab claims cautiously; the practice can be shown without claiming unique physiological superiority.

### 2.10 Animal Flow — strength + mobility + flexibility

- `id`: `practice_animal_flow_integrated`
- `slug`: `animal-flow-intehrovanyi-rukh`
- YouTube: `dAOMp3ITOkw`
- `content_type`: `movement_control`
- Primary Atlas targets: `shoulder`, `spine`, `muscles`
- Future Anatomy target: hip complex
- Movement pattern: multiplanar integrated movement
- Anatomy entities:
  - shoulder complex;
  - trunk;
  - hip complex;
  - knee/ankle depending on sequence;
  - wrists/hands.
- Physiology paths:
  - motor learning;
  - coordination;
  - strength/endurance context;
  - flexibility / ROM tolerance.
- Evidence gate:
  - separate the observed task demands from claims about long-term outcomes.

### 2.11 Movement-skills complex

- `id`: `practice_general_movement_skills`
- `slug`: `rukhovyi-kompleks-navychky`
- YouTube: `EtyFaqzJ7_o`
- `content_type`: `coordination`
- Primary Atlas targets: `muscles`, `spine`
- Contextual Atlas targets: `shoulder`, `knee` where movements involve them
- Movement pattern: multi-skill / general movement capacity
- Anatomy entities:
  - selected dynamically from the actual drill sequence rather than listing the whole body by default.
- Physiology paths:
  - coordination;
  - motor learning;
  - balance;
  - task-specific strength/endurance.
- Evidence gate:
  - “develops all movement skills” should be treated as broad framing, not a literal scientific claim.

### 2.12 Coordination challenge

- `id`: `screen_coordination_challenge`
- `slug`: `test-koordinatsiyi`
- YouTube: `hVHK4ncfr6A`
- `content_type`: `screen_or_test`
- Primary Atlas targets: `muscles`, `spine`
- Contextual Atlas targets: `shoulder`, `knee`
- Movement pattern: coordination / balance challenge
- Anatomy entities:
  - task-dependent; avoid over-assigning individual muscles without reason.
- Physiology paths:
  - balance;
  - sensorimotor control;
  - coordination;
  - motor learning.
- Evidence gate: **high priority for wording**
  - this is a challenge, not a validated clinical screen unless a validated protocol is explicitly used;
  - site label should prefer “coordination challenge” over “diagnostic test”.

## 3. Reusable anatomy entities for MVP

The first 12 entries repeatedly reuse a relatively small anatomy set. This is useful because we can build these anatomy nodes once and reference them everywhere.

### Shoulder complex

- scapula;
- clavicle;
- humerus / humeral head;
- glenoid;
- glenohumeral joint;
- AC joint;
- SC joint;
- rotator cuff;
- supraspinatus;
- infraspinatus;
- teres minor;
- subscapularis;
- deltoid;
- serratus anterior;
- trapezius;
- rhomboids.

### Pulling / upper-back system

- latissimus dorsi;
- posterior deltoid;
- biceps brachii;
- brachialis;
- brachioradialis;
- elbow joint.

### Spine / trunk

- thoracic spine;
- lumbar spine;
- rib cage;
- trunk extensors;
- abdominal/trunk stabilising system.

### Future anatomy gaps exposed by the seed set

These do **not** justify scope expansion right now, but should be reusable future nodes:

- hip complex;
- wrist/hand load-bearing anatomy;
- ankle/foot;
- broader knee movement anatomy beyond current pain-map context.

## 4. First cross-link graph

The MVP should support these journeys without duplicating content:

```text
Shoulder Atlas
  → Anatomy
    → Scapula
      → Related Practice
        → Scapular Activation
        → Shoulder + Scapula Mobility
        → Advanced Scapular Control

Shoulder Atlas
  → Rotator Cuff
    → Related Practice
      → Rotator Cuff Complex

Muscle System
  → Latissimus / Upper Back
    → Related Exercise
      → Dumbbell Row
      → Back Strength Set

Spine
  → Thoracic / Trunk Movement
    → Related Practice
      → Back + Mobility Complex
      → Animal Flow Mobility

Exercise: Dumbbell Row
  → What moves?
    → Shoulder + Scapula + Elbow
  → What works?
    → Lats + Upper Back + Elbow Flexors
  → What happens inside?
    → Force Production → Recruitment → Fatigue → Adaptation
  → Why do we say this?
    → Related Claims / Evidence Records
```

## 5. Physiology topics worth building once and reusing

The seed set points to a small reusable physiology layer rather than 12 separate explanations:

1. skeletal-muscle force production;
2. motor-unit recruitment;
3. fatigue during repeated contractions;
4. resistance-training adaptation / hypertrophy;
5. motor learning and coordination;
6. range-of-motion / movement tolerance;
7. tendon and muscle loading tolerance;
8. load → recovery → adaptation.

These topics should become reusable modules and later power the planned interactive experience **“What happens inside a muscle during one repetition?”**

## 6. Evidence priority flags

Not every exercise needs a full systematic review before it can exist in the library.

### Low evidence burden for first publication

Descriptive anatomy, movement pattern, equipment, video demonstration and carefully written coaching cues.

### Moderate evidence burden

Biomechanical explanations, muscle-role statements where context matters, loading/progression rationale.

### High evidence burden

- pain relief;
- sciatica / radicular symptom claims;
- injury prevention;
- rehabilitation efficacy;
- “best” / “safer” / “more effective” comparisons;
- clinical screening/diagnostic interpretation;
- superiority for hypertrophy or performance.

High-burden statements must link to bounded Evidence UA Claims rather than living as free text inside an exercise card.

## 7. Implementation-ready minimal relationship fields

Each seed object should be able to store at minimum:

```text
related_atlas_zones[]
related_anatomy_nodes[]
related_physiology_nodes[]
related_claim_ids[]
```

For v1, `related_atlas_zones` should reuse the existing Atlas zone keys (`shoulder`, `spine`, `muscles`, `knee`) rather than inventing a second region vocabulary.

Anatomy nodes may be created incrementally, but their identity should be stable and reusable across exercises.

## 8. Next implementation gate

The seed map is complete enough to move to the next product step:

**Build the Exercise Library index + one reusable exercise detail template.**

Start with 3 representative objects before entering all 12:

1. Dumbbell Row — strength / multi-joint / evidence-light first version;
2. Scapular Activation — movement-control / shoulder-Atlas integration;
3. Rotator Cuff Complex — rehab-practice / high-evidence-burden example.

If those three fit the same schema and detail template without special-case code, the architecture is likely ready for the remaining nine.

## 9. Working rule

**One body identity, many views. Do not create a new anatomy or Atlas structure just because an exercise needs to reference it.**
