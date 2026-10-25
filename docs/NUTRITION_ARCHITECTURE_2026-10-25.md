# Розділення напряму «Харчування» — 25.10.2026

Рішення власника: усі готові матеріали збережено; на вході залишено дієти,
решту перенесено в «Харчування зсередини / Фізіологія та біохімія».

| Вхід | Вміст |
| --- | --- |
| `nutrition.html` | Загальний вхід, дві гілки, усі вісім дієт із чинними дослідженнями |
| `nutrition-inside.html` | Жироспалення, модель ШКТ, ентероцит, графік нутрієнтів, докази та джерела |

Верхні службові дії на обох сторінках відкриваються однією кнопкою
«Інструменти». Закриття: повторний клік, Escape або клік за межами меню.
Пошук, копіювання з ручним запасним варіантом і режим заняття залишилися.
Хвильовий японський мотив збережено. Дієти та моделі не переписувалися.

Старі модельні посилання перенаправляються на той самий розділ зі
збереженням допустимого нутрієнта, кроку та масштабу. Посилання дієт
залишаються на вході. Оновлено каталог, пошук, карту знань, сусідні
матеріали, внутрішні переходи й кеш-версії відповідних модулів.

## Перевірки

- `node scripts/build-site.mjs`: 228 файлів, усі початкові файли збережено.
- `node scripts/test-site.mjs`: 74/74 набори перевірок пройшли.
- `node scripts/validate-content.mjs`: 5 модулів, успіх.
- `node scripts/smoke-check.mjs`: 19 HTML-сторінок, 87 JavaScript-файлів,
  161 локальна ціль, 292 HTML-якорі; базова доступність перевірена.
- `git diff --check`: успіх.
- Незалежний еталон до перенесення перевіряє точні байти дієт,
  чотирьох наукових блоків, жироспалення та вихідних наукових файлів;
  дозволені лише явні зміни URL і кеш-версій.
- У cloud browser перевірено вхід, меню, Escape і повернення фокуса,
  перехід до фізіології, вибір білків і кроку, старе посилання на жири
  з відновленням четвертого кроку, відкриття доказів і трьох рядків графіка.
- Перевірку телефона виконує Browser QA в CI; до її результату це не
  є підтвердженням мобільного вигляду. На фізичному телефоні власника
  плавність не перевірена.

![Вхід у харчування](screenshots/nutrition-entry-2026-10-25.jpg)

## Межі та публікація

Роботу переглянув автор змін без субагентів, відповідно до побажання
власника. Нові наукові висновки або оцінки впевненості не додавалися.
Вихідна версія: `bbd85b2` (GitHub main). Повний початковий Git snapshot
збережено перед редагуванням; відкат можливий окремим revert-комітом.

Ціль публікації — GitHub Pages. Стара копія Sites не оновлювалася.
Злиття в main і публікація очікують окремого явного рішення власника,
як вимагають `CLAUDE.md` і `docs/DEPLOYMENT.md`. PR має пройти CI.

## Повний список змінених файлів

- `dist/atlas.html`
- `dist/cell-lab.html`
- `dist/changes.html`
- `dist/compare.html`
- `dist/digestion-steps.js`
- `dist/digestion-viewer.js`
- `dist/directions.html`
- `dist/directions.js`
- `dist/exercises.html`
- `dist/fat-burning.html`
- `dist/glossary.html`
- `dist/home-feedback.js`
- `dist/index.html`
- `dist/map-page.js`
- `dist/map.html`
- `dist/movement.html`
- `dist/muscle-lab.html`
- `dist/nutrition-digestion.html`
- `dist/nutrition-inside.html`
- `dist/nutrition-navigation.css`
- `dist/nutrition-navigation.js`
- `dist/nutrition.html`
- `dist/og/nutrition-inside.jpg`
- `dist/og/nutrition.jpg`
- `dist/platform-catalog.js`
- `dist/platform-learning.js`
- `dist/platform-materials.js`
- `dist/platform-next-steps.js`
- `dist/platform-search.js`
- `dist/platform-shell.js`
- `dist/platform-tools.js`
- `dist/protein-meta.html`
- `dist/site-header.js`
- `dist/sitemap.xml`
- `dist/sleep.html`
- `dist/supplements.html`
- `dist/videos.html`
- `docs/NUTRITION_ARCHITECTURE_2026-10-25.md`
- `docs/screenshots/nutrition-entry-2026-10-25.jpg`
- `docs/superpowers/plans/2026-10-25-nutrition-architecture.md`
- `docs/superpowers/specs/2026-10-25-nutrition-architecture-design.md`
- `scripts/browser-qa/run.mjs`
- `scripts/build-digestion.mjs`
- `scripts/build-nutrition-fat-burning.mjs`
- `scripts/build-nutrition.mjs`
- `scripts/build-platform.mjs`
- `scripts/build-site.mjs`
- `scripts/make-nutrition-share-cards.py`
- `scripts/make-og-cards.mjs`
- `src/evidence/nutrition/digestion/steps.mjs`
- `src/nutrition/navigation.mjs`
- `src/platform/catalog.mjs`
- `src/platform/materials.mjs`
- `src/platform/next-steps.mjs`
- `src/platform/quick-tools.mjs`
- `src/platform/search.mjs`
- `src/platform/shell.mjs`
- `src/platform/site-header.mjs`
- `tests/exercise-library.test.mjs`
- `tests/fixtures/nutrition-architecture-preservation.json`
- `tests/food-path.test.mjs`
- `tests/home-about.test.mjs`
- `tests/muscle-flow.test.mjs`
- `tests/next-steps.test.mjs`
- `tests/nutrition-architecture.test.mjs`
- `tests/nutrition-fat-burning-entry.test.mjs`
- `tests/nutrition-lab.test.mjs`
- `tests/platform.test.mjs`
- `tests/site-search.test.mjs`
