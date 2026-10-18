# Спільна шапка та композиція «Добавок»

Погоджено 18.10.2026: однакова шапка за зразком головної на всіх сторінках; обертання лише емблеми E; зелена палітра «Добавок» зберігається; зайвий службовий блок прибраний; заголовок та візерунок сіппо підняті в смугу на всю ширину.

Шапку формує один компонент із семантичним меню, мобільним disclosure, Escape та поверненням фокуса. About відкриває наявне пояснення проєкту на головній. У вкладених навчальних сценах шапка не підміняється. На світлих сторінках шапка має темний контрастний фон; у «Добавках» він бере новий зелений фон розділу.

Каталог зберігає десять досьє, їхні тексти, фільтри, пошук і джерела. Геометрія повторюється на всю ширину без розтягування кіл. Інші службові інструменти поза сторінкою каталогу не видаляються.

Локально: новий тест спільного компонента спочатку падав через відсутню реалізацію, після реалізації проходить; повна suite 47/48, єдиний збій — раніше відтворений на чистому main негативний smoke-check.test.mjs:142 під Node 24.19.0. Smoke самого сайту, content validation, retained build та diff --check проходять. Локальний preview не запускали: підтримуваний control-browser недоступний. GitHub CI і Browser QA мають перевірити всі сторінки на 390 та 1440 px, однаковий бренд/меню, мобільне керування, відсутність старого блока й повну ширину заголовка та візерунка.

Вихідна версія: 4a94813eae8fc545b612e69d5c7261cbd27a3d14. Зміни можна скасувати через revert PR.

## Файли

- `dist/atlas.html`
- `dist/cell-lab.html`
- `dist/directions.html`
- `dist/directions.js`
- `dist/exercises.html`
- `dist/index.html`
- `dist/movement.html`
- `dist/muscle-lab.html`
- `dist/nutrition-digestion.html`
- `dist/nutrition.html`
- `dist/platform-shell.js`
- `dist/protein-meta.html`
- `dist/site-header.css`
- `dist/site-header.js`
- `dist/sleep.html`
- `dist/supplements.css`
- `dist/supplements.html`
- `docs/SHARED-HEADER-SUPPLEMENTS.md`
- `scripts/browser-qa/run.mjs`
- `scripts/build-platform.mjs`
- `scripts/build-site.mjs`
- `src/platform/directory.mjs`
- `src/platform/shell.mjs`
- `src/platform/site-header.css`
- `src/platform/site-header.mjs`
- `tests/exercise-library.test.mjs`
- `tests/food-path.test.mjs`
- `tests/muscle-flow.test.mjs`
- `tests/platform.test.mjs`
- `tests/site-header.test.mjs`
