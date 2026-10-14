# Evidence UA video output contract

## Default formats

Unless the user specifies otherwise:

- Short/Reel/TikTok: 1080×1920, 9:16, 30 fps, target 20–60 s.
- YouTube explainer: 1920×1080, 16:9, 30 fps.
- Language: Ukrainian.
- Captions: enabled for social video.
- Preview-first for Remotion. Render/export only when explicitly requested.

## Project folder contract

Every production lives in `video/projects/<slug>/`.

```text
video/projects/<slug>/
  input/
    camera/       # Vseslav speaking, exercise demonstrations, original footage
    generated/    # approved AI motion clips, anatomy, mechanisms, B-roll
    images/       # approved stills, diagrams, screenshots, references
    audio/        # optional voiceover/music/SFX
  project.json    # topic, hook, scene order, claim/source IDs, notes
  work/           # temporary intermediates; safe to regenerate
  output/
    master.mp4    # canonical finished video
    poster.jpg    # optional cover/thumbnail frame
    captions.srt  # final captions when used
    publish.json  # title/caption/keywords/platform variants
    qc.json       # checks and unresolved warnings
```

Do not require the user to pre-trim or perfectly name source clips. Inspect available media, infer likely order from `project.json` and content, and surface only genuine ambiguities that block a correct edit.

## Editing contract

The final edit should feel continuous rather than like slides.

- User camera footage can carry the hook, demonstrations, transitions, or CTA.
- Generated anatomy/motion clips should illustrate the mechanism or scientific point.
- Remotion is the compositing layer for captions, arrows, labels, charts, highlights, branded HUD, callouts, and transitions.
- Prefer real internal motion in generated clips over pan/zoom on still images when the scene is meant to feel alive.
- Remove dead air and accidental gaps unless a pause is rhetorically useful.
- Normalize obvious exposure/contrast differences conservatively; do not apply a destructive global look that damages skin or medical imagery.
- Keep cuts motivated by speech, movement, or concept changes.
- Never fabricate a before/after biological recovery that overstates what an exercise or intervention can do.

## Narrative structure

Default short-form rhythm:

1. Hook: 0–3 s — often Vseslav on camera or a visually strong claim/question.
2. Problem/anatomy: 3–8 s.
3. Evidence/mechanism/demo: 8–35 s.
4. Practical interpretation: 35–50 s.
5. Limitation/takeaway/CTA: final 3–10 s.

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
- `runtime` (`camera`, `remotion`, `generated`, `stock`, `hybrid`)
- `asset_needed`

Each scene has one primary idea.

## Visual grammar

Prefer:
- kinetic typography for concise statements;
- diagrams for mechanisms and pathways;
- charts for measured outcomes;
- body/anatomy visualizations for spatial explanations;
- approved generated motion clips for short scientific visualizations;
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
- synchronized data animation;
- assembly of camera footage and generated motion clips into the master edit.

Keep scene data separate from presentation components so claims and citations can be updated without rewriting animation logic.

## Required outputs before publishing

A publishable project must have:

1. `master.mp4`
2. `publish.json`
3. `qc.json`
4. no unresolved scientific accuracy blocker

`publish.json` is consumed by the separate `evidence-ua-publish` skill. Video production must not contain social-platform credentials or posting logic.

## Review checklist

Before approval:
- every factual statement maps to a source;
- every number exactly matches the evidence brief;
- association/causation wording is correct;
- population and duration are not silently generalized;
- uncertainty is visible when it changes interpretation;
- captions match narration;
- no scene visually overstates the result;
- source markers are readable when required;
- no accidental black frames, dead air, or unmotivated gaps;
- generated clips are visually consistent enough to cut together;
- runtime selection has not silently changed.
