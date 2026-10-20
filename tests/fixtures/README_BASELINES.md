# Historical baseline provenance

The import omitted original Sites history. Two tests previously used `git show` against missing commits. These fixtures were derived from those **actual historical Git objects**, retrieved read-only from the original Sites source repository on 2026-10-14. They were not generated from current GitHub source or current production files.

- `first-visit-v59-science-digests.json`: source commit `9d174ef146c09936be2c615e1a663b7e4f7dbd29`, `dist/index.html`, original whole-file SHA-256 `6c3c2821ab78583e79b92fed898c4d85cffc6daba6c0c2842ad315d88f25a959`. The ten direct-body article sections are serialized with `lxml.html.tostring(section, encoding='utf-8')` and hashed with SHA-256. The test retains both article order and byte-content equality checks through their digests. These historical digests independently match the already-imported v56 article fixture.
- `visitor-v58-file-hashes.json`: source commit `b48b9d0f5858673f8c6f9985c1984c198847031d`. SHA-256 of the original eight raw blobs preserves the former byte-equality check, including the binary muscle artwork, without duplicating large files.

Recovered old objects are only local verification material. This PR adds the digest fixtures, not the old history or later Sites source. Never refresh these baselines from current output merely to make a failing test pass; any scientific-content change needs a reviewed, explicitly justified new baseline.

## Deliberate revision — 2026-10-18 (owner-approved)

By explicit approval of the site owner, three baselines were refreshed after reviewed content changes (not to silence a failing test):

- `home-v56-science-digests.json`, `first-visit-v59-science-digests.json`: article sections `creatine` and `supplement-{caffeine,vitd,magnesium,beta-alanine,citrulline,electrolytes}`. Reviewed diff: added PubMed study sources (with title, citation, DOI) so the source list matches the result blocks; replaced outdated "Основне джерело — …" sentences for vitamin D and magnesium; fixed Ukrainian grammatical cases; creatine claims CLM-000002/4/5/6/7 re-rated downward with stated reasons (risk of bias, inconsistency, imprecision, indirectness). `supplement-protein`, `-omega`, `-collagen` are unchanged.
- `visitor-v58-file-hashes.json`: only `src/evidence/creatine/claims.ts` and `src/evidence/supplements/dossiers.json` changed; other entries are untouched.

## PR #26 quality-gate integration

The retention tests continue to use these reviewed fixtures, including the revision above. The duplicate `retained-content-sha256.json` proposed in #26 used older content and a different raw-HTML serialization; it is removed rather than refreshed from current output.

The source-card accessibility change in #26 uses `h3` instead of `h4` under the creatine sources section. Both homepage retention tests normalize only those source-card headings to their historical tag before comparing the full article digest. All wording and article order remain protected; no digest is changed by this integration.

## Deliberate replacement — 2026-10-18 (owner-approved)

By explicit decision of the site owner, the 2D digestion schema on `nutrition-digestion.html` was replaced by the 3D «Шлях їжі» module (`src/evidence/digestion/`). The frozen hash in `v57-retained-page-hashes.json` is **not refreshed**; `muscle-flow.test.mjs` skips that one page, exactly as for `movement.html`. The new page is protected by `food-path.test.mjs`: retained share metadata, platform shell, the «Всмоктування ≠ виведення» reading section with its NIDDK/OpenStax links, model attribution, and Claims shown without a confidence level.

## Deliberate revision — 2026-10-18, protein card (owner-approved)

By explicit decision of the site owner («Картку протеїн конкретно оновлюємо»), only the `supplement-protein` digest in `home-v56-science-digests.json` and `first-visit-v59-science-digests.json` was refreshed. The section now renders the approved protein module (`src/evidence/supplements/protein/module.mjs`, five Claims, wording approved 18.10.2026, confidence not assessed) through `scripts/build-protein.mjs`; the preliminary `DOS-PROTEIN` dossier panel is no longer rendered there. The h1, navigation to other supplements and the link to `protein-meta.html` are kept; the editorial practical notes are retained in a collapsed block. All other article digests are unchanged. New content is protected by `tests/protein-card.test.mjs`.

## Deliberate addition — 2026-10-21, berberine dossier (owner-approved)

By explicit decision of the site owner («Давай по новій добавці — Берберин», wording approved «Погоджую»), a new article section `supplement-berberine` was added after `supplement-electrolytes`. Its digest was **added** to `home-v56-science-digests.json` and `first-visit-v59-science-digests.json`; the ten existing digests are unchanged (verified before adding). Both retention tests now expect eleven sections. Content comes from `src/evidence/supplements/berberine/module.mjs` (six Claims, confidence not assessed) via `scripts/build-berberine.mjs` and is protected by `tests/berberine-card.test.mjs`.
