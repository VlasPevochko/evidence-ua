# Evidence UA — master build plan

## Нові рішення власника та зміни дизайну — 2026-10-18

Нова конкретна вказівка Всеслава щодо дизайну, кольорів, шрифтів, текстів інтерфейсу, композиції, навігації чи поведінки має пріоритет над попередніми макетами, маніфестами, стандартами, референсами та вимогами «зберігати» / «не змінювати» у межах доручення. Вона є достатнім дозволом на відповідну зміну; повторне підтвердження лише через старе рішення не потрібне.

Попередні рішення діють для незачеплених частин. Після зміни оновлювати пов’язані чинні інструкції та відповідні UI-контракти з поясненням. Історичні звіти, резервні копії та попередні версії залишати історією; не відновлювати старий дизайн автоматично. Залежності між сторінками враховувати та пояснювати; уточнення потрібне тільки для справді невизначеного обсягу або суттєвого вибору.

Дизайн і макети можна розвивати; «зафіксовано» означає захист від випадкових змін поза завданням. Для дозволеної зміни оновлювати лише відповідні UI-еталони, зберігаючи наукові перевірки. Доручення змінити оформлення не дозволяє вигадувати чи самостійно змінювати наукові висновки, рівні впевненості або provenance. Зберігати перевірки, резервні копії та чинний порядок Git/PR/публікації.


User instruction 2026-10-10: build the full Project Bible incrementally, not only Creatine. Earlier “future / do not build now” sections become sequenced backlog; scientific approval, access boundaries and hard-stop safeguards remain in force. This is not authorization to manufacture evidence or silently publish automated conclusions.

`project-roadmap-160.json` preserves every numbered requirement of the original 160-section Project Bible. Initial statuses are conservative and not a completed acceptance audit. `ongoing_policy` is a constraint, not completed feature work; `verified_technical` means the bounded tests passed, not scientific validation. No project-wide completion percentage is derived.

## Delivery order

1. **Shared foundation** (115–121, 83, 130): canonical entity catalog, relations, visualization references and validation. First increment implemented: shared identities, curriculum zoom edges, Muscle Lab connected to existing Evidence Base contract. Not a complete scientific knowledge graph.
2. **Muscle Lab scientific module** (57, 87–92, 155): outcome-specific Claims, verified EVRs, shared ClaimCard/Drawer, contraction and adaptation visuals. Current Muscle Lab v0.1 is educational presentation, not this completed module.
3. **Cell Lab** (84–86, 125): general-cell visual, selectable organelles, information panel, three learning levels. First educational v0.1 increment implemented with eleven canonical structures, code-native SVG, search, panel and textbook sources. Formal Claim/EVR review and detailed 3D remain pending. Specialized cell pages follow verified shared entities; do not mark them active before they exist.
4. **Na/K ATPase and enterocyte** (93–102, 126): verified stepper, 3 Na out / 2 K in, pump/gradient/SGLT1 distinction, carbohydrate/protein/lipid pathways. Detailed 3D and quantitative kinetics remain separate scoped work.
5. **Nutrition and Metabolism Labs** (103–114): whole-body map, portal vs lymph routes, hepatocyte/adipocyte/beta cell, metabolic-state selectors, food composition feeding shared pathways. No fake measured nutrient timings.
6. **Education and comparison** (52–53, 122–123): outcome-specific Comparison, separate Recommendation entity, quizzes, teacher/projector mode, downloadable reviewed materials.
7. **Review and Update Engine** (21–23, 26–31, 42–47): trial deduplication, source relations, retraction flags, assessments, authenticated scientific review, review queue, approved version change. PubMed monitoring must not autonomously upgrade public confidence. Background schedules and any new external permissions require their supported setup.
8. **Evi** (4): only after reliable reviewed coverage and applicability controls. Explicit scope and user-data/privacy design precede any profile collection or personalized clinical guidance.

Each release: inspect existing stack, minimal migration, tests, mobile/keyboard QA where available, publish, record verification limits. Do not replace global routing or design system as an incidental shortcut. Preserve other categories and existing links.

## Platform navigation increment — 2026-10-11

The existing pages now share a data-driven directions catalog and a lightweight navigation component. Five available areas and planned features are explicitly separate. Three curriculum routes link to actual pages/anchors; selected organelles and muscle scales can be opened from URL parameters. Search uses canonical entity labels. This is platform information architecture, not completion of scientific modules, a full knowledge graph, Nutrition/Metabolism Labs, reviewer workflow or Evi. Scientific conclusions and confidence values are unchanged. See `V54-PLATFORM-REPORT.md` for verification scope.

## Remaining blockers and dependencies

- User decision: later organize the home page around the largest directions, with detailed topics nested inside them. Do not incidentally redesign the home page during individual Lab releases.

- Creatine full-text outcome assessment awaiting access/PDF; confidence remains provisional.
- Automated browser environment unavailable; static tests are not visual/accessibility certification. User has approved selected screenshots, not every route/state.
- Current Muscle Lab scientific explanations still need Claims/EVRs. Shared source and Study registries must be consolidated before formal synthesis.
- New catalog records are identity placeholders, not scientific findings or reviewed pages. Empty claimIds mean no Claim support established, not evidence of no effect.
- Authenticated reviewer workflow, persistent CMS, server monitoring and Evi are not implemented by the catalog increment.

## First increment checks

`node scripts/build-knowledge.mjs`

`node scripts/build-evidence.mjs`

`node tests/knowledge.test.mjs`

`node tests/muscle-lab.test.mjs`

`node tests/evidence.test.mjs`
