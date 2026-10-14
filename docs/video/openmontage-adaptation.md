# Evidence UA Video Factory — OpenMontage Adaptation Map

Date: 2026-10-14
Reference: `calesthio/OpenMontage`
Status: active production architecture

## Why this document exists

OpenMontage is a reference implementation for the production pipeline, not a dependency that should be copied blindly. Evidence UA keeps the useful production contracts while adapting provider choices, evidence rules and Ukrainian-language requirements.

## Pipeline we are adopting

```text
research → evidence brief → script → voiceover → measured audio timing
→ captions → visual asset plan → Remotion edit → sound bed/SFX
→ pre-render validation → render → post-render audio/visual QC
```

The governing rule is: **voiceover timing drives scene timing after narration exists**. Initial scene durations are planning estimates only.

## OpenMontage capability map → Evidence UA decision

| Layer | OpenMontage pattern | Evidence UA decision |
|---|---|---|
| Research | director + artifacts | Keep our evidence-first skill and claim ledger |
| Script | duration-budgeted narration | Adopt; narration remains Ukrainian and claim-bound |
| TTS selector | multiple TTS providers + fallback | Adopt provider registry; never silently switch providers |
| Zero-key TTS | Piper local TTS | Adopt as offline fallback / audition path |
| Qwen3 TTS | open-source GPU TTS | Do not use as default for Ukrainian; Ukrainian is not an officially supported primary language in the current core model set |
| Quality cloud TTS | Google / Azure / OpenAI / ElevenLabs adapters | Prefer a provider with native `uk-UA` voices; Google Chirp 3 HD is the current quality-first recommendation when configured |
| Voiceover files | generated per scene | Adopt; one audio file per scene |
| Timing | probe generated audio and update scenes | Adopt; manifest is authoritative after TTS generation |
| Captions | WhisperX / word timestamps → Remotion | Adopt; final captions come from actual narration audio, not estimated text timing |
| Music | royalty-free library or generated instrumental | Adopt; instrumental only under narration |
| Visual assets | stock + generated images/video | Adopt selectively; factual diagrams remain programmatic |
| Motion | Remotion as default | Already adopted |
| Pre-render QC | validate assets + audio/video duration | Add as mandatory production gate |
| Post-render QC | ffprobe + frame sampling + transcribe rendered audio | Add as mandatory production gate |

## Ukrainian narration routing

### Tier A — final quality

Use a native Ukrainian cloud neural voice when credentials are configured. Current preferred evaluation target:

- Google Cloud Text-to-Speech, locale `uk-UA`
- Chirp 3 HD Ukrainian voices

This route requires a Google Cloud project with Text-to-Speech enabled. Credentials are never committed to the repository.

### Tier B — local/offline fallback

Use Piper with one of the current high-quality Ukrainian voices:

- `uk_UA-mykyta-high` — male
- `uk_UA-oleksa-high` — male
- `uk_UA-tetiana-high` — female

Piper is useful for zero-key drafts, offline generation and A/B voice auditions. It is not assumed to beat the best expressive cloud voices; the final choice is based on listening tests.

### Explicitly disabled default

Qwen3-TTS is not the default Ukrainian provider until first-party Ukrainian support is verified at the quality level required by Evidence UA.

## Voiceover contract

Each composition owns one canonical narration map:

```ts
{
  sceneId,
  text,
  tone,
}
```

Generated audio produces a manifest:

```json
{
  "provider": "piper",
  "voice": "uk_UA-mykyta-high",
  "scenes": [
    {"id":"hook","file":"hook.wav","durationSeconds":3.72}
  ]
}
```

After generation:

1. scene duration = measured narration duration + intentional visual padding;
2. subtitles are aligned to the generated narration;
3. animations use the same scene/audio timing;
4. a provider swap requires regenerating timings and captions.

## Mandatory quality gates

### Before render

Reject the render when:

- a scene has narration but no audio file;
- an audio manifest has a missing or duplicate scene;
- narration exceeds the available scene time;
- a quantitative visual has no evidence mapping;
- a required asset is missing;
- captions reference time outside the composition.

### After render

Do not call a video complete until all of these pass:

1. `ffprobe` confirms both video and audio streams;
2. duration is within the approved range;
3. representative frames from every scene are visually reviewed;
4. rendered narration is transcribed or otherwise checked against the approved script;
5. captions are readable in the 9:16 mobile safe area;
6. no source marker, number or qualifier is missing or cut off;
7. background music never competes with narration.

## Current CreatineJourney production order

1. Freeze evidence-backed narration text.
2. Audition Ukrainian voices.
3. Generate per-scene narration with the selected provider.
4. Measure real scene durations and update composition timing.
5. Generate word-level captions from the real narration.
6. Upgrade visuals and biological assets.
7. Add instrumental music/SFX.
8. Pre-render validate.
9. Render rough cut.
10. Run post-render audio + visual QC.
11. Only then create the final social export.
