# Exercise Library: rules for review, Claims and suggestions

Status: **proposal for the owner's approval.** It implements the written rule set required by Stage 1 of `docs/SPINE_AND_PERSONAL_GUIDANCE_BACKLOG.md`. Nothing here is a scientific conclusion.

## 1. Review states of an exercise entry

| `editorial.reviewStatus` | Meaning | May be suggested by guided features? |
|---|---|---|
| `draft` | Text written, not compared with its video. | No |
| `video_checked` | Owner compared texts with the video (current state of all 12 entries). Movement facts and coaching only. | No: only shown in the library. |
| `claims_reviewed` | Every outcome statement shown for the entry is backed by an approved Claim. | Only with the rules in section 4. |
| `clinician_reviewed` | A qualified reviewer approved the safety text and the region mapping. | Yes, with section 4 rules. |

A state may only move up with a recorded date and reviewer. The UI label must say exactly what was checked and what was not.

## 2. What needs a Claim, and what does not

- **No Claim needed:** movement description, joints and muscles involved, equipment, technique cues, regressions/progressions, general cautions.
- **Claim required** for any statement about an outcome: pain, injury risk, strength or size gains, posture, rehabilitation, "helps", "prevents", "treats". Without an approved Claim the statement must not appear.
- Forbidden regardless of Claims, until a clinician approves exact wording: treatment, cure, "fixes posture", "removes pinching", diagnosis from a pain location.
- An exercise has no evidence score of its own. Only Claims show confidence.

## 3. How a Claim enters (existing workflow, unchanged)

1. Candidate statement is bounded: population, intervention, comparator, outcome.
2. Sources are registered with verified identifiers (DOI/PMID checked, not recalled from memory).
3. Evidence records are extracted; a confidence assessment is proposed with the five domains assessed.
4. A reviewer approves the Claim version. Approval is never automatic.
5. Only then `relatedClaimIds` of the exercise may reference it and `claimReviewStatus` change.

## 4. What a future guided feature may suggest

Only when all hold: entry is `claims_reviewed` or higher for the shown outcomes; the visitor's screening shows no red flags; wording is "educational option", never "your problem is X"; the person is told that a pain location does not identify its source.

**Refusal path.** If the screening shows a red flag (for example new weakness or numbness, loss of bladder/bowel control, fever with back pain, injury with a fall, unexplained severe or night pain), the feature shows only: seek medical care first. No exercises are shown.

## 5. Reviewer requirements

- Region and safety texts (Atlas spine/muscle zones, red-flag list) need a clinician or equivalent qualified reviewer. The reviewer's name/role and date are stored with the approval.
- Until then, Atlas keeps its "editorial draft" wording.

## 6. Claim candidates (not Claims)

Questions to research first. None is asserted; each needs verified sources, appraisal and review before any use. Order follows what the Atlas already links to.

1. Horizontal pulling and scapular-control exercises (rows, scapular control, progressions): effect on shoulder strength or function in healthy adults.
2. Rotator cuff loading exercises: effect on shoulder pain or function in people with rotator cuff-related shoulder pain (population must be stated; no claim for prevention without direct evidence).
3. Back strengthening and mobility complexes: effect on back strength; whether exercise reduces recurrence of non-specific low back pain (only with a bounded population).
4. Animal Flow and movement-skill complexes: effect on mobility or coordination measures. Likely thin evidence; the Claim may be an explicit evidence gap.
5. Coordination test: no outcome claim; keep as a self-observation tool, never as a diagnostic screen.

Each candidate becomes a Claim only through section 3. A "no good evidence found" result is a valid, publishable outcome (EvidenceGap).

## 7. Author experience block

Each library entry may carry `authorExperienceUk` in `dist/exercises-data.js`: short statements of the author's practical experience (for example for whom the exercise is used and what the author notices).

- It is shown under its own label "Практичний досвід автора" with the note that it is an observation from practice, not a research result.
- It is not evidence: it never appears in the "Докази" layer and never replaces a Claim.
- It must not promise outcomes (treatment, prevention, posture correction, guarantees). A test rejects the most common phrases; the author and reviewer still check the meaning.
- The block is hidden while the field is empty. The owner supplies the text.
