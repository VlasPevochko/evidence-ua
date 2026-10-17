# Evidence UA Video Factory

Reusable Remotion subsystem for Evidence UA explainers. It is intentionally isolated from the website: all dependencies and code live under `video/remotion/` and must not modify repository-root `src/` or `dist/`.

## First composition

`CreatineJourney` — Ukrainian 9:16 short, 1080×1920, 30 fps. The original 59 s timing is a planning estimate; final scene timing must be recalculated from generated narration audio.

## Local setup

```bash
npm install
npm run studio
```

Remotion Studio is the default review surface. Do not render/export by default; use the interactive preview first.

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run compositions
```

## Voiceover workflow

Narration is canonical in `src/compositions/creatine-journey/voiceover.ts`.

```bash
npm run voiceover:export > /tmp/creatine-voiceover.json
```

For the zero-key Piper fallback:

```bash
python -m pip install piper-tts
python tools/generate_piper_voiceover.py \
  --input /tmp/creatine-voiceover.json \
  --voice uk_UA-mykyta-high
```

This writes one WAV file per scene plus `manifest.json` with measured durations. Final production should prefer an auditioned native Ukrainian HD cloud voice when configured; Piper remains the offline fallback and draft path.

## Structure

New videos live in `src/compositions/<slug>/` and should keep:

- evidence-backed values and source mappings in a composition `data.ts`;
- narration in a dedicated voiceover module;
- measured audio timing in a generated manifest after TTS;
- reusable visuals in `src/components/`, `src/science/`, or `src/brand/`;
- scene components free of hard-coded scientific numbers when those numbers can be passed from data.

Every numerical health/science claim must resolve to a source ID and comply with `.agents/skills/evidence-ua-video/`.

See `docs/video/openmontage-adaptation.md` for the production pipeline and quality gates.
