# Evidence UA — Exercise Library MVP

_Last updated: 2026-10-17_

This document defines the first minimal Exercise Library for Evidence UA.

The purpose is not to build a generic exercise catalog. The purpose is to connect practice to the existing Evidence UA knowledge system:

`ANATOMY → PHYSIOLOGY → MOVEMENT → EXERCISE → CLAIM → EVIDENCE → PRACTICE`

The same exercise object should be reusable from Anatomy, Atlas, Biomechanics, Practice, future training plans, and future Personal Evidence.

## 1. MVP goal

Build a small, high-quality library from the owner's existing YouTube videos.

Target for v1:

- 10–20 exercises;
- owner-recorded videos only;
- YouTube embed rather than native video hosting;
- structured exercise data, not isolated video cards;
- links to relevant anatomical structures and body regions;
- links to related Claims/Sources where evidence is actually needed;
- mobile-first presentation;
- no user submissions in v1.

## 2. What one exercise is

An exercise is a reusable structured knowledge object.

Minimum schema:

- `id`
- `slug`
- `title_uk`
- `title_en`
- `aliases`
- `video_url`
- `video_provider`
- `thumbnail`
- `author`
- `status`
- `movement_pattern`
- `body_regions`
- `primary_structures`
- `secondary_structures`
- `joint_actions`
- `plane_of_motion`
- `equipment`
- `training_goals`
- `technique_cues`
- `common_errors`
- `regressions`
- `progressions`
- `variations`
- `limitations`
- `red_flags_or_referral_notes`
- `related_claim_ids`
- `related_source_ids`
- `related_atlas_nodes`
- `related_anatomy_nodes`
- `review_status`
- `last_reviewed`

## 3. Keep fact types separate

Do not mix different evidence layers into one statement.

For every exercise page, separate:

### A. Description / movement facts
Examples: joint actions, equipment, body position, range of motion.

### B. Anatomy
Structures that produce, control, stabilise or transmit the movement.

### C. Coaching / technique
Practical cues and common execution errors.

These are not automatically scientific outcome claims.

### D. Evidence claims
Examples:

- a variation produces greater hypertrophy under a defined comparison;
- an exercise changes pain/function in a defined population;
- a specific technique changes joint loading;
- a specific exercise is useful for a defined rehabilitation goal.

Only this layer should make explicit evidence-backed claims, and those claims should map to the Evidence Base.

## 4. User-facing exercise page

Recommended v1 layout:

1. **Title + video**
2. **What this exercise is**
3. **What moves** — joints and movement pattern
4. **What works** — anatomy view
5. **How to perform it** — concise technique cues
6. **Common mistakes**
7. **Make it easier / harder** — regressions and progressions
8. **Variations**
9. **When to be cautious**
10. **Why / Evidence** — related Claims, confidence and Sources
11. **Explore the body** — links back into Atlas / Anatomy

The page should feel like an interactive knowledge node, not an article.

## 5. First seed set

Use exercises already recorded by the owner where possible.

Recommended initial categories:

### Push
- overhead press;
- bench press or dumbbell press;
- lateral raise;
- triceps extension.

### Pull
- pull-up / lat pulldown;
- horizontal row;
- rear-delt cable movement;
- biceps curl.

### Lower body
- squat;
- Romanian deadlift;
- lunge / split squat;
- calf raise.

### Trunk / control
- one trunk-flexion or anti-extension movement;
- one trunk-stability movement;
- one mobility / controlled-range movement if video quality is good.

The final seed set should be determined by available owner videos, not by forcing this exact list.

## 6. Integration with Evidence Atlas

Exercise Library should not create a parallel body map.

Examples:

`Shoulder Atlas → Training → Overhead Press`

`Deltoid → Related exercises → Lateral Raise`

`Knee Atlas → Training → Squat / Split Squat`

`Lumbar / Hip → Movement → Romanian Deadlift`

Every body-region link should point to the existing Atlas/Anatomy identity rather than duplicate the structure.

## 7. Integration with Anatomy + Physiology

An exercise should be able to open deeper learning paths.

Example:

`Overhead Press`
→ shoulder joint motion
→ scapular motion
→ deltoid / triceps / rotator cuff
→ motor-unit recruitment / force production
→ fatigue / adaptation
→ relevant human-outcome Claims

This creates the Evidence UA teaching loop:

`SEE THE MOVEMENT → EXPLORE THE BODY → UNDERSTAND THE PHYSIOLOGY → CHECK THE EVIDENCE`

## 8. Evidence rules

Do not use EMG, biomechanics, acute metabolites or mechanistic observations alone to claim superior hypertrophy, rehabilitation outcomes or injury prevention.

Avoid labels such as:

- “best exercise”;
- “safest exercise”;
- “perfect technique”;
- “activates muscle by X%, therefore grows it X% more”.

Any comparative claim must define:

- comparator;
- population;
- outcome;
- timeframe;
- confidence;
- relevant limitation.

## 9. YouTube MVP

For v1:

- store the canonical YouTube URL/video ID;
- embed the video on the exercise page;
- keep author attribution;
- do not duplicate video files on Evidence UA infrastructure;
- handle unavailable/disabled embeds gracefully;
- keep exercise data independent from the video provider so the video can be replaced later without rewriting the exercise object.

## 10. Search and filters

Minimal v1 filters:

- body region;
- movement pattern;
- equipment;
- training goal;
- difficulty / progression level if useful.

Do not add dozens of filters before there is enough library content to justify them.

## 11. Creator submissions — next layer, not v1

After the internal library is stable, add curated external submissions.

Workflow:

`SUBMIT → REVIEW → APPROVE / REQUEST CHANGES / REJECT → PUBLISH`

Minimum submission fields:

- video URL;
- title;
- creator identity;
- category;
- short description;
- claimed purpose;
- disclosure of sponsorship/affiliate relationship where relevant.

Review must separate:

1. material quality;
2. scientific claims;
3. copyright/embedding availability;
4. safety / misleading framing;
5. spam / promotion.

Approval of a material does not equal endorsement of the entire creator.

## 12. Growth loop

The future creator layer can create a useful acquisition loop:

`CREATOR → SUBMISSION → EVIDENCE REVIEW → PUBLISHED MATERIAL → CREATOR SHARES → NEW USERS / NEW CREATORS`

This is valuable only if scientific review remains independent of traffic, sponsorship and creator popularity.

## 13. Definition of Done for MVP

Exercise Library MVP is ready when:

- at least 10 owner-recorded exercises are represented as structured exercise objects;
- every exercise can be reached from a library view;
- exercises link to existing Atlas/Anatomy nodes where relevant;
- technique, anatomy and evidence claims are visibly separated;
- related Claims/Sources are reused rather than duplicated;
- YouTube embeds work on desktop and mobile;
- unavailable embeds fail gracefully;
- search/filtering is useful but minimal;
- mobile layout is tested;
- accessibility basics are covered;
- no public creator self-publishing exists yet;
- adding the 11th exercise does not require a new data model.

## 14. First implementation sequence

```text
1. Inventory existing owner videos
2. Select 10–20 seed exercises
3. Define stable exercise data schema
4. Map each exercise to Anatomy + Atlas nodes
5. Build library index
6. Build exercise detail template
7. Add Evidence links where justified
8. Mobile/browser QA
9. Only then design creator submissions
```

## 15. Working rule

**An exercise is not a video card. It is a practice node connected to the body, physiology and evidence.**
