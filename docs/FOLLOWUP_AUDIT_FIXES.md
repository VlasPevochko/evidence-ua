# Виправлення повторного аудиту Evidence UA

База: `b96c3c654845294de8c0faa8cc8b01bc2535a64f` (після PR №123). Власник доручив виправити всі вісім підтверджених проблем. Реалізація в окремій гілці `fix/evidence-ua-followup-audit`.

## Що виправлено

| Проблема | Результат |
|---|---|
| Тип статистичного інтервалу | SourceCard і доказове вікно зберігають внесений байєсівський тип або інтервал сумісності; звичайні ДІ, нульові та відсутні межі залишаються коректними. |
| Застарілий стан порівняння | Компактні дані генеруються з чинних Claims і review-записів. Видно кількість попередніх і неоцінених тверджень та незавершений формальний перегляд, без оцінки добавки загалом. |
| Вибрана помпа за межами кадру | Nutrition Lab наближає вибрану структуру на телефоні; звичайне відтворення продовжує слідувати крокам. |
| Втрата стану в скопійованому URL | Зберігаються дозволені вправи, структуровані фільтри бібліотеки та зони Атласу. Сторонні параметри й вільний текст пошуку не копіюються. |
| Невидимі для пошуку розділи | Атлас і Вправи включено до спільного індексу з навігаційними статусами. |
| Неправильні переходи стрілками | Muscle Lab і Cell Lab обирають сусіда сфокусованого елемента, включно з послідовністю Tab → стрілка. |
| Приховані методологічні поля | У згорнутих деталях доказового вікна показано наявний контекст результату й місце витягу; відсутні поля не вигадуються. |
| Відмова localStorage | Інтерфейс теми й розміру тексту запускається зі стандартними параметрами та працює в пам’яті, навіть якщо сховище недоступне. |

## Перевірено локально

- Node `v24.19.0`, повний `npm run check`: код завершення 0.
- **89/89 тестових файлів** пройшли. П’ять нових файлів регресій покривають усі вісім дефектів; очікувані помилки спостерігалися до виправлень.
- Каталог: **5 модулів** пройшли validation.
- Smoke: **19 HTML-сторінок, 90 JS syntax checks, 170 локальних цілей, 292 локальні якорі**.
- Повна збірка містить **239 файлів**: усі 238 початкових файлів збережено, додано лише згенерований `compare-status.js`.
- `git diff --check` пройшов.

Наукові модулі Claims/Sources/EVRs, висновки, числа, рівні впевненості, дати, погодження та історичні JSON-еталони не змінено. Для порівняння зі старими HTML-еталонами вузький helper відновлює лише сім точно визначених історичних хвостів форматування в копії дерева: чотири колишні відсутні ДІ та три підписи типу інтервалу. Окремі перевірки підтверджують, що зміни чисел, меж, рівня інтервалу й стороннього наукового тексту не приховуються. Історичне порівняння Nutrition Controller дозволяє лише конкретні виправлені координати/фокус і версію імпорту; решта коду зберігає свій незалежний hash.

Кеш оновлено узгоджено через усі імпорти й HTML-входи, включно з батьківськими модулями. Окрема перевірка охоплює авторських і згенерованих споживачів.

## Браузерна перевірка та публікація

У чинний GitHub Actions Browser QA додано сценарії для всіх восьми виправлень на 390×844 і 1440×900. CI зберігає скриншоти вибору помпи та порівняння з точної бази PR, а потім перевіряє поточну версію й зберігає скриншоти виправлених станів. Режим історичних скриншотів явно не оголошує проходження тестів. Скрипт пройшов локальний `node --check`; браузер не встановлювався й локальний preview не запускався.

Остаточний результат Browser QA слід звіряти з перевірками цього PR на GitHub. Локальна збірка й commit не є публікацією. Чинний production — GitHub Pages; workflow публікує лише після злиття в `main` та успішних перевірок. Нових наукових схвалень ця зміна не додає.

## Повний список змінених файлів

- `.github/workflows/site-publish.yml`
- `dist/appearance.js`
- `dist/atlas.html`
- `dist/cell-lab.html`
- `dist/cell-lab.js`
- `dist/changes.html`
- `dist/compare-page.js`
- `dist/compare-status.js`
- `dist/compare.html`
- `dist/digestion-viewer.js`
- `dist/directions.html`
- `dist/directions.js`
- `dist/evidence/berberine-ui.js`
- `dist/evidence/components.js`
- `dist/evidence/creatine-more-ui.js`
- `dist/evidence/module-composer.js`
- `dist/evidence/protein-ui.js`
- `dist/evidence/supplement-cards-ui.js`
- `dist/evidence/ui.js`
- `dist/exercises.html`
- `dist/fat-burning.html`
- `dist/fat-burning.js`
- `dist/glossary.html`
- `dist/home-feedback.js`
- `dist/index.html`
- `dist/map.html`
- `dist/movement.html`
- `dist/muscle-guide.js`
- `dist/muscle-lab.html`
- `dist/muscle-lab.js`
- `dist/nutrition-digestion.html`
- `dist/nutrition-inside.html`
- `dist/nutrition-lab.js`
- `dist/nutrition.html`
- `dist/platform-materials.js`
- `dist/platform-search.js`
- `dist/platform-shell.js`
- `dist/platform-tools.js`
- `dist/protein-meta.html`
- `dist/site-header.js`
- `dist/sleep.html`
- `dist/supplements.html`
- `dist/videos.html`
- `docs/FOLLOWUP_AUDIT_FIXES.md`
- `docs/superpowers/plans/evidence-ua-followup-audit-fixes.md`
- `docs/superpowers/specs/evidence-ua-followup-audit-fixes.md`
- `scripts/browser-qa/run.mjs`
- `scripts/build-berberine.mjs`
- `scripts/build-cell.mjs`
- `scripts/build-comparison-status.mjs`
- `scripts/build-creatine-more.mjs`
- `scripts/build-digestion.mjs`
- `scripts/build-evidence.mjs`
- `scripts/build-muscle.mjs`
- `scripts/build-platform.mjs`
- `scripts/build-protein.mjs`
- `scripts/build-site.mjs`
- `scripts/build-supplement-cards.mjs`
- `src/cell-lab/controller.mjs`
- `src/evidence/core/components.mjs`
- `src/muscle-lab/controller.mjs`
- `src/platform/appearance.mjs`
- `src/platform/materials.mjs`
- `src/platform/search.mjs`
- `src/platform/site-header.mjs`
- `tests/appearance-storage.test.mjs`
- `tests/compare-page.test.mjs`
- `tests/comparison-status.test.mjs`
- `tests/evidence-renderer-followup.test.mjs`
- `tests/evidence.test.mjs`
- `tests/exercise-library.test.mjs`
- `tests/fat-burning.test.mjs`
- `tests/first-visit-flow.test.mjs`
- `tests/followup-controllers.test.mjs`
- `tests/food-path.test.mjs`
- `tests/helpers/controller-dom.mjs`
- `tests/helpers/science_html_baseline.py`
- `tests/home-about.test.mjs`
- `tests/home-entry.test.mjs`
- `tests/muscle-guide.test.mjs`
- `tests/muscle-lab.test.mjs`
- `tests/navigation-search-share.test.mjs`
- `tests/nutrition-architecture.test.mjs`
- `tests/platform.test.mjs`
- `tests/science-baseline-normalization.test.mjs`
- `tests/shared-ui-cache.test.mjs`
- `tests/site-pipeline.test.mjs`
- `tests/site-search.test.mjs`
