# Evidence UA Video Factory

Reusable Remotion subsystem for Evidence UA explainers. It is intentionally isolated from the website: all dependencies and code live under `video/remotion/` and must not modify repository-root `src/` or `dist/`.

## First composition

`CreatineJourney` — Ukrainian 9:16 short, 1080×1920, 30 fps, 59 s.

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

## Structure

New videos live in `src/compositions/<slug>/` and should keep:

- evidence-backed values and source mappings in a composition `data.ts`;
- timing/copy contracts in a scene-plan module;
- reusable visuals in `src/components/`, `src/science/`, or `src/brand/`;
- scene components free of hard-coded scientific numbers when those numbers can be passed from data.

Every numerical health/science claim must resolve to a source ID and comply with `.agents/skills/evidence-ua-video/`.
