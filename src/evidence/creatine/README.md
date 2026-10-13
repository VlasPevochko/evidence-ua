# Evidence UA — Creatine Data Seed v1.0

Prepared: **2026-10-10**

This package is a machine-readable starting point for the first reusable Evidence UA module.

## Files

- `types.ts` — scientific data contracts
- `claims.ts` — 8 seed creatine Claims
- `sources.ts` — verified PubMed-indexed Sources
- `evidenceRecords.ts` — outcome-level Evidence Records
- `creatineModule.ts` — first module/page composition

## Core architecture

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
MODULE / PAGE / VISUAL / QUIZ / COMPARISON
```

`Source` is **not** synonymous with evidence for every Claim.

A single publication may create multiple Evidence Records for different outcomes.

## Important implementation rules

1. Claims are the single source of scientific statements.
2. UI components should receive a Claim ID/object instead of duplicating scientific copy.
3. Confidence values in this seed are **provisional**.
4. Do not expose a provisional HIGH/MODERATE/LOW as formally GRADE-rated.
5. `Lean body mass` must not be rendered as “pure muscle gained”.
6. Serum creatinine and kidney function are separate Claims.
7. A neutral result can support a carefully worded no-demonstrated-harm Claim, but never “proof of zero risk”.
8. The caffeine Claim is intentionally LOW because evidence is inconsistent.
9. The pre/post timing Claim is intentionally LOW because direct evidence is very small.
10. No automatic public confidence changes when a new Source appears.

## Verified source anchors

- PMID 42765482 — strength / lean mass meta-analysis (2026)
- PMID 39074168 — body-composition meta-analysis (2024)
- PMID 42507286 — kidney-health meta-analysis (2026)
- PMID 41199218 — kidney-function meta-analysis (2025)
- PMID 42035842 — RCT kidney-function meta-analysis (2026)
- PMID 36000773 — alternative creatine forms systematic review (2022)
- PMID 8828669 — muscle creatine loading trial (1996)
- PMID 34610729 — pre-vs-post timing trial (2021)
- PMID 35016154 — creatine × caffeine systematic review (2022)

## Not yet included on purpose

The following need a separate evidence pass before being added to the production seed:

- direct skeletal-muscle hypertrophy measured by MRI/CT/ultrasound
- cognition by individual domain
- overall adverse-event/safety synthesis
- water/body-mass dynamics
- adolescents
- women-specific Claims
- older-adult Claims
- clinical populations
- maintenance dose recommendation as a Recommendation entity

## Suggested import path

Adapt to the existing project structure. For example:

```text
src/
  data/
    evidence/
      types.ts
      creatine/
        claims.ts
        sources.ts
        evidenceRecords.ts
        module.ts
```

Do **not** rewrite the project solely to match this folder layout.
