# Однакова геометрія шапки — 2026-10-18

Живий аудит усіх 12 сторінок на однаковому desktop viewport знайшов одну розбіжність: nutrition-digestion.html мала шапку 122 px замість 110 px, емблему 45 px замість 43 px та логотип на y=38.5 замість 32.90625. Решта 11 сторінок збігалися. Причина — content-box на дочірніх елементах шапки на сторінці без глобального border-box reset.

Виправлення обмежене спільною шапкою: border-box для її елементів та псевдоелементів. Вміст сторінок і наукові висновки не змінено. Browser QA тепер порівнює координати й розміри шапки, бренду, емблеми, назви та меню на всіх сторінках у desktop і mobile. Підвищені версії кешу.

Змінені файли: src/platform/site-header.css, src/platform/site-header.mjs, scripts/build-platform.mjs, scripts/browser-qa/run.mjs, tests/platform.test.mjs, tests/food-path.test.mjs, tests/exercise-library.test.mjs, tests/muscle-flow.test.mjs, docs/HEADER-GEOMETRY.md; згенеровані dist/site-header.css, dist/site-header.js, dist/platform-shell.js, dist/directions.js та cache-посилання у всіх 12 dist/*.html.
