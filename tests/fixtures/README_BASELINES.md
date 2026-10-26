# Historical baseline provenance

## Technical correction: absent confidence intervals

The review correction fixes a shared renderer that converted four `null` confidence intervals to `95% ДІ 0–0` (collagen EVR-000191–193 and citrulline EVR-000206). Scientific source data, confidence levels and every digest value remain unchanged. The two historical HTML comparisons call `tests/helpers/science_html_baseline.py` to restore only those four exact historical source-card tails in the comparison tree. The helper requires the exact source ID, outcome label, estimate and corrected missing-interval text; it cannot normalize other results. `science-baseline-normalization.test.mjs` verifies the historical hashes still match, a real zero-bound interval remains intact, and changed estimates, intervals or scientific text remain detectable.

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

## Deliberate revision — 2026-10-21, omega-3 and vitamin D cards (owner-approved)

By explicit decision of the site owner (chose «Омега-3 і вітамін D», wording approved «Ок»), only the `supplement-omega` and `supplement-vitd` digests were refreshed (all other digests verified unchanged). Both sections now render approved modules (`src/evidence/supplements/omega/`, `src/evidence/supplements/vitd/`, confidence not assessed) through `scripts/build-supplement-cards.mjs`; the preliminary `DOS-OMEGA` and `DOS-VITD` panels and the old study blocks are no longer rendered there. Protected by `tests/omega-vitd-cards.test.mjs`.

## Deliberate revision — 2026-10-21, protein card layout and dossier header (owner-approved)

Owner request: «протеїн треба картку покращити, там в цих картках ще стара шапка дивна з самого верху». Only the `supplement-protein` digest was refreshed: its five Claims now use the compact card + evidence drawer layout of the newer dossiers (statements, numbers, sources and status are unchanged). The header change is runtime/CSS only (shared site header kept in article view, slim «← Усі добавки» bar instead of the retired tools block), so no other digest changed. Protected by `tests/article-header.test.mjs` and `tests/protein-card.test.mjs`.

## Deliberate revision — 2026-10-21, creatine card (owner-approved)

Owner request: «Після виконуємо картку креатин» (with the attached creatine report); eight additional Claims approved «Погоджую» — new Claims are shown as «Рівень впевненості не оцінено», the eight existing Claims keep their previous levels. Only the `creatine` digest was refreshed in `home-v56-science-digests.json` and `first-visit-v59-science-digests.json` (all ten other digests verified unchanged). The section keeps every existing Claim, statement, confidence level, source and the kidney/creatinine explanation; layout changed to the compact dossier form (effects chart and «Перш ніж приймати» first, mechanism, myths, sources and PubMed search folded). New content comes from `src/evidence/supplements/creatine-more/module.mjs` via `scripts/build-creatine-more.mjs`. The frozen files `src/evidence/creatine/{claims,sources,evidenceRecords}.ts` are unchanged (`visitor-v58-file-hashes.json` not refreshed); only the section order in `creatineModule.ts` moved `mechanism` after `kidney`. Protected by `tests/creatine-card.test.mjs`.

## Deliberate revision — 2026-10-21, caffeine card (owner-approved)

By explicit decision of the site owner (chose «Кофеїн», eight Claims approved «Так»), only the `supplement-caffeine` digest was refreshed in `home-v56-science-digests.json` and `first-visit-v59-science-digests.json` (all ten other digests verified unchanged). The section now renders the approved module `src/evidence/supplements/caffeine/module.mjs` (eight Claims, confidence not assessed; numbers from PubMed abstracts, EFSA 2015 checked via the EUFIC summary and labelled so) through `scripts/build-supplement-cards.mjs` (new `scale: 'linear'` rows). The preliminary `DOS-CAFFEINE` panel, the old study block and the old practice/limits block are no longer rendered; `dossiers.json` is unchanged. Protected by `tests/caffeine-card.test.mjs` and the shared checks in `tests/omega-vitd-cards.test.mjs`.

## Deliberate revision — 2026-10-22, berberine in the supplement switcher (owner-approved)

Owner answer «1-2» to «Додати Берберин у перемикач добавок унизу інших карток?». A link `<a href="#supplement-berberine">Берберин</a>` was appended after «Електроліти» in every `.d-nav` supplement switcher (ten sections). The ten `supplement-*` digests were refreshed in both fixtures; before refreshing, removing exactly that link from the current HTML was verified to reproduce all previous digests, so no other content changed. `creatine` is unchanged (it has no `.d-nav`). Protected by `tests/berberine-card.test.mjs`.

## Deliberate revision — 2026-10-22, magnesium, collagen, beta-alanine, citrulline, electrolytes (owner-approved)

Owner answered «Всі» (all remaining supplements) and approved the 21 Claims «Так». Only the five digests `supplement-{magnesium,collagen,beta-alanine,citrulline,electrolytes}` were refreshed in `home-v56-science-digests.json` and `first-visit-v59-science-digests.json`; all other digests (including caffeine, which shares the renderer) were verified unchanged. Each section now renders its approved module (`src/evidence/supplements/<name>/module.mjs`, confidence not assessed, numbers from PubMed abstracts) through `scripts/build-supplement-cards.mjs`; the preliminary `DOS-*` panels and old study blocks are no longer rendered, `dossiers.json` is unchanged. The renderer gained honest rows for results without a reported interval (hollow point + reported p-value) and labels non-95% intervals (Rowlands 2021: 90%). Protected by `tests/five-supplements-cards.test.mjs` and the shared checks in `tests/omega-vitd-cards.test.mjs`.

## Deliberate revision — 2026-10-22, provisional confidence levels (owner-approved)

Owner approved the proposed GRADE-informed provisional levels («Погоджую») for 53 supplement Claims (protein, berberine, omega-3, vitamin D, additional creatine, caffeine, magnesium, collagen, beta-alanine, citrulline, electrolytes); three normative / position-statement Claims (EFSA caffeine limits, magnesium UL, NATA overdrinking) intentionally stay «не оцінено». The digests of `creatine` and all ten `supplement-*` sections were refreshed: the changes are the confidence badges, the «Рівень впевненості» fact tile («попередній»), and the common-limits sentence about who rated certainty. No statement, number or source changed. The original eight creatine Claims (frozen `claims.ts`) keep their levels. Levels are frozen independently in `tests/approved-confidence-levels.mjs` and checked by `tests/five-supplements-cards.test.mjs` and every card test.

## Deliberate revision — 2026-10-22, shorter creatine page (owner-approved)

Owner answer «А: всі пункти» (including «креатин коротше»). Only the `creatine` digest was refreshed (all other digests verified unchanged). In «Як приймати» the simple regimen stays visible; loading phase, timing, note and source link moved into one folded block, and the duplicate second button to CLM-000006 was removed (one control per action). «Нирки ≠ креатинін» shows a one-line summary (wording already approved in «Перш ніж приймати»); the four-step explanation, note and evidence buttons are folded. No statement, number, confidence or source changed. Phone height 8 003 → 6 845 px. Checked in `tests/creatine-card.test.mjs`.
