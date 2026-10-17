# Evidence UA video output contract

## Default formats

Unless the user specifies otherwise:

- Short/Reel/TikTok: 1080×1920, 9:16, 30 fps, target 35–60 s.
- YouTube explainer: 1920×1080, 16:9, 30 fps.
- Language: Ukrainian.
- Captions: enabled for social video.
- Preview-first for Remotion. Render/export only when explicitly requested.

## Narrative structure

Default short-form rhythm:

1. Hook: 0–3 s.
2. Question/problem: 3–8 s.
3. Evidence: 8–35 s.
4. Interpretation: 35–50 s.
5. Limitation/takeaway: final 5–10 s.

The hook must remain accurate when shown alone.

## Scene plan schema

For each scene provide:

- `time`
- `voiceover`
- `on_screen_text`
- `visual`
- `motion`
- `evidence_claim_id`
- `source_marker`
- `runtime` (`remotion`, `generated`, `stock`, `hybrid`)
- `asset_needed`

Each scene has one primary idea.

## Visual grammar

Prefer:
- kinetic typography for concise statements;
- diagrams for mechanisms and pathways;
- charts for measured outcomes;
- body/anatomy visualizations for spatial explanations;
- restrained B-roll for context;
- highlighted numbers only when verified.

Avoid decorative scientific imagery that falsely implies evidence or mechanism.

## Data visualization

A chart must identify:
- outcome;
- groups/conditions;
- unit;
- timeframe;
- uncertainty when material;
- source.

If the source does not support a precise chart, use a qualitative diagram instead of inventing data.

## Remotion guidance

Use Remotion when the scene requires reproducible:
- charts;
- timelines;
- labeled anatomy/diagrams;
- kinetic typography;
- word-level captions;
- branded Evidence UA layouts;
- synchronized data animation.

Keep scene data separate from presentation components so claims and citations can be updated without rewriting animation logic.

Suggested composition structure:

```text
EvidenceVideo
  ├── HookScene
  ├── EvidenceScene[]
  ├── MechanismScene?
  ├── LimitationScene
  └── TakeawayScene
```

## Review checklist

Before approval:
- every factual statement maps to a source;
- every number exactly matches the evidence brief;
- association/causation wording is correct;
- population and duration are not silently generalized;
- uncertainty is visible when it changes interpretation;
- captions match narration;
- no scene visually overstates the result;
- source markers are readable;
- runtime selection has not silently changed.
