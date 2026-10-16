# Evidence Atlas v0.1 — Design Spec

## Goal

Add an interactive human-body entry point to Evidence UA that lets a visitor explore health through anatomy and then move into evidence-based topics. The first release proves the interaction model without attempting full 3D anatomy.

## Product position

Atlas is a first-class Evidence UA feature, not a seventh knowledge direction. The existing six-direction catalog and its counts remain unchanged.

## Entry points

- Add `Атлас` to the shared site navigation.
- On the home page, add a prominent teaser: `Досліджуйте людське тіло` / `Від анатомії — до доказів.` / `Відкрити Атлас`.
- Atlas opens as `./atlas.html`.

## Atlas v0.1 scope

The atlas presents one front-view human figure with six interactive zones:

1. `Мозок`
2. `Плече`
3. `Хребет`
4. `М’язи`
5. `ШКТ`
6. `Коліно`

Hover/focus/tap highlights the selected zone and updates the detail panel. `Плече` is the only fully populated module in v0.1; the other zones show an explicit `Розділ у розробці` state and never pretend to contain completed medical guidance.

## Shoulder module

The selected shoulder panel exposes six views:

- `Огляд`
- `Анатомія`
- `Симптоми`
- `Тренування`
- `Реабілітація`
- `Дослідження`

Initial shoulder topics:

- `Ротаторна манжета`
- `Субакроміальний біль`
- `Нестабільність плеча`
- `Біцепс`
- `AC-суглоб`

The module uses concise educational copy. It must not diagnose a visitor or present individualized treatment. The evidence/research view explains the Evidence UA structure and links visitors onward to source-backed material as it is added.

## Visual direction

- Dark navy/black Evidence UA surface.
- Cool blue/cyan interaction accents.
- Warm amber highlight for the currently selected anatomical zone.
- Human anatomy illustration on the left/center, information panel on the right on wide screens.
- Mobile collapses to figure first, panel second.
- Respect `prefers-reduced-motion`.
- Full keyboard accessibility for zone buttons and tab buttons.

## Architecture

- `dist/atlas.html`: authored static Atlas page.
- `dist/atlas.css`: visual system and responsive layout.
- `dist/atlas.js`: interaction controller and v0.1 content model.
- `src/platform/shell.mjs`: adds shared Atlas navigation and home teaser.
- `dist/platform-shell.js`: generated counterpart kept in sync with source for the retained static snapshot.
- `dist/platform.css`: styles the shared navigation/teaser additions.

Atlas files are authored members of `dist/` and must survive the existing build unchanged. Existing build scripts and six-direction catalog semantics remain intact.

## Acceptance criteria

- `atlas.html`, `atlas.css`, and `atlas.js` exist and all local references resolve.
- The page exposes exactly six anatomical zone controls.
- `Плече` is selected by default and exposes the six requested views and five initial topics.
- Selecting any non-shoulder zone changes the panel to a clear in-development state.
- Atlas is reachable from shared navigation and the home teaser.
- Existing catalog still reports six directions.
- No production publish or merge happens without owner approval.
