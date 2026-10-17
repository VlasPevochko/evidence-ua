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
- `content_type`
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

Recommended `content_type` values for v1:

- `strength`
- `mobility`
- `movement_control`
- `coordination`
- `rehab_practice`
- `screen_or_test`

Do not force every useful movement video into the label “exercise”.

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

The first seed set is now based on the owner's currently connected YouTube archive rather than a hypothetical balanced catalog.

### 5.1 Current strongest content cluster

The existing archive is strongest in:

- scapular control;
- shoulder mobility;
- rotator cuff work;
- upper-back / rowing patterns;
- trunk and back mobility;
- Animal Flow / integrated mobility;
- coordination and movement-skill content.

For MVP, this is a strength rather than a problem. The first library can launch as a high-quality shoulder / scapula / back / movement-control cluster and then expand deliberately.

### 5.2 Recommended first 12 entries

1. **Bent-over dumbbell row / Тяга гантелі в нахилі**
   - YouTube ID: `qrL6N-35QrE`
   - type: `strength`
   - core links: shoulder, scapula, elbow, latissimus dorsi, rhomboids, trapezius, posterior deltoid, elbow flexors

2. **Shoulder + scapula mobility complex / Комплекс мобільності плеча та лопатки**
   - YouTube ID: `HXc_N5WXAfw`
   - type: `mobility`
   - core links: shoulder Atlas, scapula, thoracic contribution

3. **Scapular activation / TOP SCAPULA ACTIVATION**
   - YouTube ID: `NDSyt1Ib89E`
   - type: `movement_control`
   - core links: scapular upward/downward rotation, retraction/protraction, serratus/trapezius context

4. **Rotator cuff exercise complex**
   - YouTube ID: `MTdKHhtTRZQ`
   - type: `rehab_practice`
   - core links: rotator cuff, shoulder external/internal rotation, shoulder symptom context

5. **Chest / shoulder-girdle development with scapula + rotator cuff context**
   - YouTube ID: `w2XC6Igeyyo`
   - type: `strength`
   - core links: shoulder, scapula, pushing mechanics, rotator cuff

6. **Advanced scapular-control progression**
   - YouTube ID: `P6t_LAZCdqw`
   - type: `movement_control`
   - core links: scapular control, progression logic, shoulder-girdle stability

7. **Back + mobility complex**
   - YouTube ID: `fg9Wpawsi9c`
   - type: `mobility`
   - core links: thoracic/lumbar region, trunk control, back mobility

8. **Back-strength / “cobra back” movement set**
   - YouTube ID: `6Mxz9Raufy8`
   - type: `strength`
   - core links: posterior trunk / upper-back strength, pulling context

9. **Animal Flow — mobility**
   - YouTube ID: `ZAt8wfSPpb4`
   - type: `mobility`
   - core links: multiplanar movement, shoulder, hip, spine

10. **Animal Flow — strength + mobility + flexibility**
    - YouTube ID: `dAOMp3ITOkw`
    - type: `movement_control`
    - core links: integrated movement, multiplanar loading, coordination

11. **Movement-skills complex**
    - YouTube ID: `EtyFaqzJ7_o`
    - type: `coordination`
    - core links: general movement capacity, coordination, body control

12. **Coordination challenge**
    - YouTube ID: `hVHK4ncfr6A`
    - type: `screen_or_test`
    - core links: coordination, balance, motor control

### 5.3 Therapeutic-claim videos: reuse carefully

The archive also contains useful movement demonstrations inside videos with strong therapeutic titles, for example:

- `A9HoVcfeEHc` — “Back Pain? This Will Fix It.”
- `HWVrTbgbjNI` — “I Found The Best Sciatica Relief”
- `aeyuXx-Vu6w` — “Fix low back pain after 5 minutes!”
- `ATwTDlVwEIQ` — “Зніміть напругу в попереку швидко!”
- `rdTGLyzJ38c` — sciatica-relief framing.

These videos are **not rejected**. However, Evidence UA must not inherit the title claim as a scientific conclusion.

Use a neutral exercise / practice title on the site, for example:

- “Mobility sequence for the lumbopelvic region”;
- “Trunk / hip movement practice”;
- “Mobility drill used in low-back symptom-management contexts”.

Any statement about pain relief, sciatica, prevention, rehabilitation benefit or treatment must pass through the Research Workflow and be mapped to bounded Claims.

## 6. Deliberate filming gap list

To turn the current strong upper-body / mobility cluster into a balanced full-body Exercise Library, the next filming block should prioritize clean, neutral demonstrations of fundamental movement patterns.

Recommended next 8 recordings:

1. squat;
2. Romanian deadlift / hip hinge;
3. split squat or lunge;
4. horizontal press (bench press or dumbbell press);
5. overhead press;
6. pull-up or lat pulldown;
7. one simple trunk anti-extension / stability exercise;
8. calf raise + ankle movement context.

These should be filmed primarily as reusable Evidence UA assets, not only social clips.

Preferred capture characteristics:

- clear full-body framing;
- minimal visual clutter;
- one main variation per clip;
- front / side angle where useful;
- no large irreversible text overlay if possible;
- neutral naming;
- enough duration to show several clean repetitions;
- preserve a version that can be embedded or re-cut later.

## 7. Integration with Evidence Atlas

Exercise Library should not create a parallel body map.

Examples:

`Shoulder Atlas → Training → Dumbbell Row / Scapular Control`

`Scapula → Related practice → Scapular Activation`

`Knee Atlas → Training → Squat / Split Squat`

`Lumbar / Hip → Movement → Romanian Deadlift`

Every body-region link should point to the existing Atlas/Anatomy identity rather than duplicate the structure.

The current seed set should first prove this integration through **shoulder / scapula / upper-back** content because those regions already have multiple owner-recorded videos.

## 8. Integration with Anatomy + Physiology

An exercise should be able to open deeper learning paths.

Example:

`Dumbbell Row`
→ shoulder extension
→ scapular retraction / control
→ latissimus / rhomboids / trapezius / posterior deltoid
→ elbow-flexor contribution
→ force production / motor-unit recruitment
→ fatigue / adaptation
→ relevant human-outcome Claims

This creates the Evidence UA teaching loop:

`SEE THE MOVEMENT → EXPLORE THE BODY → UNDERSTAND THE PHYSIOLOGY → CHECK THE EVIDENCE`

## 9. Evidence rules

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

## 10. YouTube MVP

For v1:

- store the canonical YouTube URL/video ID;
- embed the video on the exercise page;
- keep author attribution;
- do not duplicate video files on Evidence UA infrastructure;
- handle unavailable/disabled embeds gracefully;
- keep exercise data independent from the video provider so the video can be replaced later without rewriting the exercise object.

Current owner channel connection can be used to inventory public, unlisted and private owner videos during curation, but only videos intentionally approved for the public site should be embedded publicly.

## 11. Search and filters

Minimal v1 filters:

- body region;
- content type;
- movement pattern;
- equipment;
- training goal;
- difficulty / progression level if useful.

Do not add dozens of filters before there is enough library content to justify them.

## 12. Creator submissions — next layer, not v1

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

## 13. Growth loop

The future creator layer can create a useful acquisition loop:

`CREATOR → SUBMISSION → EVIDENCE REVIEW → PUBLISHED MATERIAL → CREATOR SHARES → NEW USERS / NEW CREATORS`

This is valuable only if scientific review remains independent of traffic, sponsorship and creator popularity.

## 14. Definition of Done for MVP

Exercise Library MVP is ready when:

- at least 10 owner-recorded entries are represented as structured exercise/practice objects;
- every entry can be reached from a library view;
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

## 15. First implementation sequence

```text
1. Inventory existing owner videos                 ✅ complete
2. Select 10–20 seed entries                       ✅ first 12 selected
3. Define stable exercise data schema              ✅ MVP schema defined
4. Map seed entries to Anatomy + Atlas nodes       ← NEXT
5. Build library index
6. Build exercise detail template
7. Add Evidence links where justified
8. Mobile/browser QA
9. Film missing fundamental movement patterns
10. Only then design creator submissions
```

## 16. Working rule

**An exercise is not a video card. It is a practice node connected to the body, physiology and evidence.**
