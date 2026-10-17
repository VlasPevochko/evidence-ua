# Evidence UA Video Factory — Design Specification

Date: 2026-10-14
Status: approved design, implementation not started
Repository: `VlasPevochko/evidence-ua`

## 1. Goal

Create a reusable Remotion-based video production subsystem inside the Evidence UA repository. The subsystem will turn verified Evidence UA research into repeatable short-form and long-form scientific video compositions without changing or coupling to the existing website build.

The first composition is `CreatineJourney`: a Ukrainian 9:16 explainer showing the path from oral creatine intake to blood transport, skeletal-muscle storage, phosphocreatine and ATP resynthesis, and gradual muscle creatine accumulation with daily supplementation.

## 2. Success criteria

The first implementation is successful when:

- the existing Evidence UA website source, build scripts and `dist/` remain unchanged;
- Remotion lives in an isolated subproject under `video/remotion/` with its own dependencies;
- Remotion Studio can open a `CreatineJourney` composition at 1080×1920, 30 fps, approximately 55–60 seconds;
- scientific claims and numerical values are stored separately from animation code;
- reusable Evidence UA components exist for captions, sources, large numeric callouts, timelines and branded end cards;
- the first video can be extended with generated/stock assets later without redesigning its scientific-data layer;
- future videos can be added as new composition folders instead of copying an entire project;
- no claim shown on screen requires hard-coded scientific data inside visual components.

## 3. Non-goals

This phase will not:

- modify the public Evidence UA website or its published `dist/` snapshot;
- create a web-based video editor or SaaS interface;
- automate PubMed retrieval inside Remotion itself;
- auto-publish to YouTube, Instagram or TikTok;
- require AI-generated footage for the first working prototype;
- implement a universal medical illustration engine;
- render/export the final MP4 by default. Preview-first is the default workflow.

## 4. Current repository constraints

Evidence UA is not currently a standard npm/React application at repository root. It uses custom Node build scripts and retains `dist/` as an important published snapshot. The video subsystem must therefore be isolated and must not introduce root-level dependency or build assumptions that could interfere with the site.

Existing project skills under `.agents/skills/evidence-ua-video/` define the editorial and evidence rules for video work. The Remotion implementation must respect those rules rather than duplicating or weakening them.

## 5. Recommended architecture

```text
evidence-ua/
├── src/                       # existing site; unchanged by video work
├── dist/                      # published site; unchanged by video work
├── .agents/
│   └── skills/
│       └── evidence-ua-video/
└── video/
    └── remotion/
        ├── package.json
        ├── package-lock.json
        ├── tsconfig.json
        ├── src/
        │   ├── index.ts
        │   ├── Root.tsx
        │   ├── brand/
        │   │   ├── theme.ts
        │   │   ├── typography.ts
        │   │   └── EvidenceLogo.tsx
        │   ├── components/
        │   │   ├── EvidenceCaption.tsx
        │   │   ├── EvidenceSource.tsx
        │   │   ├── BigNumber.tsx
        │   │   ├── Timeline.tsx
        │   │   └── EndCard.tsx
        │   ├── science/
        │   │   ├── ATPReaction.tsx
        │   │   ├── MusclePool.tsx
        │   │   └── BodyPathway.tsx
        │   └── compositions/
        │       └── creatine-journey/
        │           ├── CreatineJourney.tsx
        │           ├── data.ts
        │           └── scenes/
        │               ├── HookScene.tsx
        │               ├── AbsorptionScene.tsx
        │               ├── BloodTransportScene.tsx
        │               ├── MusclePoolScene.tsx
        │               ├── ATPScene.tsx
        │               ├── SaturationTimelineScene.tsx
        │               └── TakeawayScene.tsx
        └── public/
            ├── evidence-ua/
            ├── anatomy/
            ├── audio/
            └── video/
```

## 6. Isolation strategy

`video/remotion/` is a standalone Node project. It owns its own `package.json`, lockfile, TypeScript configuration and Remotion dependencies.

The repository root must not gain Remotion dependencies for this phase.

The site build must not import from `video/remotion/`, and the Remotion project must not mutate `src/` or `dist/`.

This allows the video system to evolve independently while remaining close to Evidence UA research, skills and branding.

## 7. Scientific data contract

The scientific layer is separated from presentation.

Example shape for `compositions/creatine-journey/data.ts`:

```ts
export const creatineJourneyData = {
  composition: {
    id: 'CreatineJourney',
    width: 1080,
    height: 1920,
    fps: 30,
    durationSeconds: 59,
    language: 'uk',
  },
  claims: {
    skeletalMusclePool: {
      display: '≈95%',
      meaning: 'Approximate proportion of total body creatine located in skeletal muscle',
      sourceIds: ['balsom-1994', 'antonio-2021'],
    },
    dailyDose: {
      display: '3–5 г / день',
      sourceIds: ['kreider-2017'],
    },
    saturationTime: {
      display: '≈3–4 тижні',
      qualifier: 'without a loading phase',
      sourceIds: ['hultman-1996', 'kreider-2017'],
    },
  },
  sources: {
    // bibliographic metadata used by source labels/end card
  },
};
```

Rules:

- numeric values, qualifiers and source mappings live in data files, not inside visual components;
- visual components accept values as props;
- source markers shown on screen map back to explicit source IDs;
- wording must distinguish a total-body distribution statement from the fate of one ingested dose;
- the `evidence-ua-video` skill remains authoritative for claims, uncertainty and source discipline.

## 8. Composition model

`Root.tsx` registers reusable compositions. Each composition is independent and has its own scene folder and data module.

Initial composition:

- ID: `CreatineJourney`
- size: 1080×1920
- fps: 30
- target duration: 55–60 seconds
- language: Ukrainian
- style: dark scientific / cinematic medical motion design
- default format: social short-form

Future examples:

- `ProteinDigestion`
- `MagnesiumEvidence`
- `MuscleHypertrophy`
- `RecoveryExplainer`

## 9. First-video scene architecture

### Scene 1 — Hook

Purpose: establish the question without making an unsupported timing claim.

Visual: 5 g creatine enters water; strong macro motion and transition into the biological pathway.

Primary text: `5 г КРЕАТИНУ` / `ЩО ДАЛІ?`

### Scene 2 — Absorption

Purpose: show GI absorption and entry into circulation.

Visual: simplified torso and intestinal pathway; particles cross into blood.

Scientific rule: do not imply instantaneous absorption or universal exact timing unless the data explicitly supports it.

### Scene 3 — Blood transport

Purpose: show systemic transport and creatine-transporter-mediated cellular uptake.

Visual: vessel flow, cell membrane, transporter interaction.

Scientific rule: do not imply that all ingested creatine enters muscle.

### Scene 4 — Skeletal muscle pool

Purpose: communicate that skeletal muscle contains the large majority of total-body creatine.

Visual: body silhouette with muscle system highlighting and a large `≈95%` callout.

Scientific rule: explicitly frame this as total-body distribution, not dose-by-dose uptake.

### Scene 5 — Phosphocreatine and ATP

Purpose: explain fast ATP resynthesis.

Visual: `PCr + ADP → ATP` conceptual animation inside a muscle-fiber environment.

Scientific rule: the animation must not imply that creatine creates energy; it supports rapid ATP resynthesis through phosphocreatine buffering.

### Scene 6 — Gradual accumulation

Purpose: correct the misconception that one 5 g dose instantly saturates muscle.

Visual: timeline across several weeks with a reservoir that fills gradually.

Scientific rule: do not invent a universal linear percentage curve by day. Use a qualitative fill unless exact study values are explicitly encoded.

### Scene 7 — Takeaway

Purpose: consolidate the mechanism and brand message.

Primary text: `НЕ СТИМУЛЯТОР` → `ЕНЕРГЕТИЧНИЙ БУФЕР`

End card: `EVIDENCE UA — Докази замість міфів`.

## 10. Reusable visual components

### `BigNumber`

For evidence-backed numeric emphasis such as `≈95%`, `3–5 г`, or `3–4 тижні`.

Must accept the displayed value, qualifier, source marker and timing as props.

### `EvidenceSource`

Small readable source marker for on-screen claims. It must be concise enough for short-form video while remaining traceable to full bibliographic metadata.

### `EvidenceCaption`

Reusable subtitle component. Initial version may use authored caption blocks; word-level transcription can be added later.

### `Timeline`

Reusable visual for days/weeks/months. It must support qualitative rather than falsely precise progression.

### `EndCard`

Reusable Evidence UA brand ending for all compositions.

## 11. Branding

Do not invent a separate video brand. Reuse the visual language of the current Evidence UA site where practical.

The first implementation should derive or manually mirror the current brand treatment into local video tokens: dark background, high-contrast typography and the existing Evidence UA accent treatment. Exact tokens should be taken from the current site/assets during implementation rather than guessed in this specification.

## 12. Remotion implementation rules

- use `useCurrentFrame()` for frame-driven animation;
- obtain `fps` from `useVideoConfig()` for seconds-to-frame calculations;
- use `interpolate()` / Remotion easing or spring utilities instead of CSS transitions/animations;
- use `public/` plus `staticFile()` for local assets;
- structure individual scenes/components so they can be edited independently in Remotion Studio;
- preview in Remotion Studio before export;
- do not render/export by default unless explicitly requested;
- keep reusable components independent of `CreatineJourney`-specific scientific constants.

## 13. Asset strategy

Phase 1 prioritizes a working motion-design prototype that does not depend on generated footage.

Allowed first-pass assets:

- SVG/vector anatomy or simplified authored diagrams;
- CSS/React/Remotion particles and paths;
- Evidence UA logo/brand assets already owned by the project;
- simple locally stored diagrams.

Later phases may replace selected backgrounds or biological visuals with generated video, Runway/OpenArt assets, stock video or higher-fidelity anatomy without changing the data contract or scene timing architecture.

## 14. Audio and captions

Audio is not required for the first structural preview.

The composition must be designed so that a final Ukrainian voiceover can be added later without restructuring scenes.

Caption blocks should be authored from the approved script. Word-level caption synchronization is a later enhancement once final audio exists.

## 15. Testing and verification

Implementation must include at minimum:

1. project boots in Remotion Studio;
2. `CreatineJourney` is registered and loads without runtime errors;
3. composition metadata is 1080×1920 at 30 fps;
4. every quantitative scene receives its values from the data module;
5. source labels resolve to source IDs that exist in the source map;
6. no video implementation change modifies site `src/` or `dist/`;
7. type checking/linting used by the Remotion subproject passes;
8. a preview can play through every scene without missing-asset failures.

Where practical, add lightweight automated tests for pure data-validation helpers rather than snapshot-testing visual animation details.

## 16. Repository workflow

Implementation should occur on a feature branch based on current `main`.

The work should be presented in a pull request. The PR should clearly separate:

- video subsystem scaffolding;
- reusable brand/components;
- first composition;
- science/data layer;
- verification results.

Do not force-push or modify unrelated website files.

## 17. Risks and mitigations

### Risk: Remotion dependencies interfere with site build

Mitigation: isolate all dependencies and commands under `video/remotion/`.

### Risk: visuals overstate scientific precision

Mitigation: keep values/qualifiers/source mappings in explicit data files and follow the `evidence-ua-video` rules.

### Risk: anatomy assets become a production bottleneck

Mitigation: first prototype uses simplified vectors/diagrams; visual fidelity can be improved independently later.

### Risk: captions and voiceover timing drift

Mitigation: scenes have explicit durations and authored caption blocks first; final word-level captions are added only after final audio.

### Risk: future videos duplicate code

Mitigation: move brand, numeric, source, timeline and science primitives into reusable components from the first composition.

## 18. Implementation boundary for v1

Version 1 ends when the reusable Remotion subproject exists and `CreatineJourney` can be previewed end-to-end with functional scene transitions, scientific text/data, source markers, captions, timeline, ATP visual and Evidence UA end card.

High-fidelity generated biological footage, final voiceover, sound design and social-platform export are explicitly subsequent phases.
