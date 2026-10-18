# «Шлях їжі» — 3D-модель травного тракту (2026-10-18)

Замінює 2D-схему на `nutrition-digestion.html` за рішенням власника сайту.

## Що змінилося

- `src/evidence/nutrition/digestion/` — модуль `MOD-NUTRITION-002`:
  - `module.mjs` — Claims, Sources, Evidence Records у контрактах `core/types.ts`;
  - `steps.mjs` — шість етапів (огляд → стравохід → шлунок → дванадцятипала → тонка → товста кишка);
  - `viewer.mjs` — Three.js-переглядач; картки й шухляда доказів — спільні `ClaimCard` / `EvidenceDrawer`.
- `scripts/build-digestion.mjs` (викликається з `build-nutrition.mjs`) генерує `dist/digestion-{data,steps,viewer}.js` і падає, якщо в Claim з'являється рівень впевненості або непогоджене формулювання.
- `dist/vendor/three/` — Three.js r160 (MIT), локально: browser QA забороняє сторонні запити.
- `dist/models/digestive.glb` — травна система Z-Anatomy через Vanatome 1.4.0, спрощено й квантовано (5,7 → 2,8 МБ). CC BY-SA 4.0, атрибуція на сторінці й у `dist/models/ATTRIBUTION.txt`.
- `dist/nutrition.js`, `dist/nutrition.css` (стара 2D-схема) видалено: більше ніде не використовуються.

## Наукові дані

| Етап | Claim | Нові записи |
|---|---|---|
| Стравохід | CLM-000049 перистальтика без гравітації; стоячи гравітація прискорює | 5 |
| Шлунок | CLM-000050 склад і енергія їжі змінюють швидкість спорожнення | 5 |
| Дванадцятипала | CLM-000051 жовч не розщеплює жири сама — це робить ліпаза з коліпазою | 4 |
| Тонка кишка | **CLM-000022** (наявний, не дубльовано) SGLT1 + Na⁺ | 7 |
| Товста кишка | CLM-000052 ферментація клітковини до КЖК | 5 |

- Рівень впевненості **не оцінено** (рішення власника: як в інших Claims харчування). `publicationAcceptance.kind = user_wording_approval`, `formalScientificReview = false`.
- Усі записи — `reviewStatus: pending`, витяг з анотацій PubMed; `sourceStatus: not_checked` (Crossref недоступний під час збирання).
- Суперечливі й змішані дані збережено: модель апікального GLUT2 (Kellett 2005) для CLM-000022; Carbonnel 1994 (щільність енергії при однаковій калорійності) для CLM-000050.
- Miettinen 1971 відкинуто: анотація недоступна, витягувати нічого.

## Тести й винятки

- Новий `tests/food-path.test.mjs`.
- `muscle-flow.test.mjs`: `nutrition-digestion.html` пропускається в перевірці заморожених хешів, як `movement.html`; фікстуру не оновлено (див. `tests/fixtures/README_BASELINES.md`).
- `smoke-check.mjs`: `eua-drawer-title` дозволено як runtime-ID для цієї сторінки, як для `nutrition.html`.
- `core/components.mjs`: шухляда результатів більше не падає, коли `lastReviewed = null` (показує «не завершено»).

## Обмеження

- У моделі немає рота, глотки, сліпої й прямої кишки; порожня й клубова кишка — один об'єкт.
- Рух «їжі» умовний, без реального часу.
- Перехід «Зазирнути в ентероцит» веде на наявну модель на `nutrition.html`.
