# Evidence UA: виправлення після оцінки

Базова версія: `9c20f0366df9ce3b79be5478269ea0b858b3d120`, `VlasPevochko/evidence-ua`.
Гілка: `fix/evidence-ua-review-corrections`.

## Що змінено

- Відсутні довірчі інтервали колагену й цитруліну не перетворюються на «95% ДІ 0–0». Обидві межі повинні бути скінченними числами; справжні нульові межі зберігаються. Для відсутнього інтервалу використано чинне пояснення «ДІ: див. першоджерело».
- Три навчальні маршрути перенесені за межі згорнутого «Про сайт» і відкриті за замовчуванням. ID, кроки, URL-параметри, можливість згортання й навігація за якорем збережені. Зміст і відгук залишилися в згорнутій групі.
- Основна навігація має один пункт «Напрями», який відкриває каталог. Прибрано дубль «Каталог», збережено переходи в харчування, дослідження, атлас, вправи й добавки. Головна кнопка вибору теми зберегла свій окремий сценарій.
- Початкова картка «Від їжі до клітини / Травлення та всмоктування» веде безпосередньо на `nutrition-digestion.html`.
- Каталог більше не стверджує, що впевненість усіх інших досьє не оцінено: він відсилає до статусу конкретного твердження.
- Вікно пошуку закривається при виборі результату мишею або Enter, зберігаючи звичайний перехід за посиланням. Кнопки-підказки продовжують працювати всередині відкритого пошуку.
- Оновлено версії змінених спільних скриптів та їхніх батьківських завантажувачів, включно з авторськими контролерами харчування й жироспалення.
- Негативні приклади smoke-тесту тепер мають той самий явний тип ES modules, що й справжній сайт, і виявляють некоректний JavaScript на Node 24.19.

## Науковий зміст збережено

Claims, Sources, Evidence Records, наукові дати, оцінки впевненості та всі JSON-еталони не редагувалися. Змінено лише спільний форматер відсутніх інтервалів та навігаційний опис статусу.

Історичні HTML-хеші не перераховано. Перед історичним порівнянням окремий тестовий helper відновлює лише чотири колишні помилкові рядки у копії дерева; він перевіряє точні ID джерел, назви результатів, оцінки й текст відсутнього інтервалу. Окремі регресії доводять, що справжній нульовий інтервал не змінюється, а зміни оцінки, інтервалу чи інших наукових текстів залишаються помітними. Окремо перевірено відсутність diff у наукових модулях і JSON-еталонах.

## Перевірки

- `npm run check` завершився з кодом 0 після останнього виправлення.
- 84 із 84 тестових файлів пройшли.
- Збірка: 238 файлів; жодного початкового файла не втрачено.
- Каталог: 5 модулів валідовано.
- Smoke: 19 HTML-сторінок, 89 JavaScript-файлів, 169 локальних ресурсів і 292 локальні якорі; базові перевірки доступності розмітки.
- Повторна збірка: SHA-256 усіх 238 файлів збігаються.
- `git diff --check` пройшов.

Перед реалізацією нові регресії відтворили помилки інтервалів, навігації, прихованих маршрутів, неправильного початкового посилання, застарілого статусу та пошуку. Після реалізації вони пройшли. Додаткова перевірка кешу відтворила й захистила від старих імпортів спільного UI.

Незалежний перегляд виявив залишкову команду старого завантажувача, що повертала «Напрями» до колишнього якоря. Новий тест виконав справжній блок цього завантажувача, відтворив помилку, після видалення команди пройшов; повний набір перевірок повторно пройшов. Застарілий коментар контролера «Про сайт» також уточнено.

## Межі та передавання

Справжній браузер у цьому середовищі не запускався. Мобільна геометрія, візуальні стани й поведінка на реальному пристрої потребують Browser QA; у GitHub Actions чинний окремий Browser QA job, його очікування кількості основних посилань оновлено до шести.

Опубліковану сторінку не перевірено: проксі середовища відхиляв доступ до домену GitHub Pages до звернення до самого сайту. Це не є доказом збою сайту.

Для доступу до опублікованої сторінки та GitHub API у чернетці мережевих налаштувань збережено `vlaspevochko.github.io` та `api.github.com`; збереження чернетки не застосовує і не публікує її. Інші поля цим оновленням не змінювалися. Значення чинних credentials не виводилися й не копіювалися.

Зміни завантажено в окрему гілку й відкрито чернетку PR: https://github.com/VlasPevochko/evidence-ua/pull/123. Злиття в main залишається за власником відповідно до CLAUDE.md. Цей звіт не є підтвердженням оновлення публічного сайту.

## Змінені файли

- `dist/atlas.html`
- `dist/cell-lab.html`
- `dist/cell-lab.js`
- `dist/changes.html`
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
- `dist/home-about.js`
- `dist/home-feedback.js`
- `dist/index.html`
- `dist/map.html`
- `dist/movement.html`
- `dist/muscle-guide.js`
- `dist/muscle-lab.html`
- `dist/muscle-lab.js`
- `dist/navigation-v17.js`
- `dist/nutrition-digestion.html`
- `dist/nutrition-inside.html`
- `dist/nutrition-lab.js`
- `dist/nutrition.html`
- `dist/platform-catalog.js`
- `dist/platform-learning.js`
- `dist/platform-materials.js`
- `dist/platform-search.js`
- `dist/platform-shell.js`
- `dist/platform-tools.js`
- `dist/protein-meta.html`
- `dist/site-header.js`
- `dist/sleep.html`
- `dist/supplements.html`
- `dist/videos.html`
- `docs/REVIEW_CORRECTIONS.md`
- `docs/superpowers/plans/evidence-ua-review-corrections.md`
- `docs/superpowers/specs/evidence-ua-review-corrections-design.md`
- `scripts/browser-qa/run.mjs`
- `scripts/build-berberine.mjs`
- `scripts/build-cell.mjs`
- `scripts/build-creatine-more.mjs`
- `scripts/build-digestion.mjs`
- `scripts/build-evidence.mjs`
- `scripts/build-muscle.mjs`
- `scripts/build-platform.mjs`
- `scripts/build-protein.mjs`
- `scripts/build-supplement-cards.mjs`
- `src/evidence/core/components.mjs`
- `src/platform/catalog.mjs`
- `src/platform/learning-ui.mjs`
- `src/platform/search.mjs`
- `src/platform/shell.mjs`
- `src/platform/site-header.mjs`
- `tests/evidence-intervals.test.mjs`
- `tests/evidence.test.mjs`
- `tests/exercise-library.test.mjs`
- `tests/fat-burning.test.mjs`
- `tests/first-visit-flow.test.mjs`
- `tests/fixtures/README_BASELINES.md`
- `tests/food-path.test.mjs`
- `tests/helpers/science_html_baseline.py`
- `tests/home-about.test.mjs`
- `tests/home-entry.test.mjs`
- `tests/home-mobile-menu.test.mjs`
- `tests/muscle-flow.test.mjs`
- `tests/muscle-guide.test.mjs`
- `tests/muscle-lab.test.mjs`
- `tests/next-steps.test.mjs`
- `tests/nutrition-architecture.test.mjs`
- `tests/platform.test.mjs`
- `tests/review-corrections.test.mjs`
- `tests/science-baseline-normalization.test.mjs`
- `tests/search-navigation.test.mjs`
- `tests/shared-ui-cache.test.mjs`
- `tests/site-header.test.mjs`
- `tests/site-search.test.mjs`
- `tests/smoke-check.test.mjs`
