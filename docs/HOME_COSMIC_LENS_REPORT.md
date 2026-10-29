# Космічна лінза нижче першого екрана

Всеслав обрав «Космічну лінзу»: перший екран зберегти, а під ним показати виразний графічний вхід до матеріалів. Після одного-двох коротких рухів прокручування мають бути зрозумілі й видимі всі шість напрямів. Це реалізація погодженого сценарію; інші сторінки й наукові висновки не перебудовуються.

## Що працює

- Лінза з художнім зображенням м’язового волокна та детальною туманністю розташована після чинного hero. Текст, назви напрямів і посилання залишаються справжнім HTML.
- Звичайне прокручування розводить прозорі оболонки та відкриває шість напрямів. Рух не перехоплює колесо чи пальцеві жести, не фіксує сторінку й не створює довгої постановочної прокрутки.
- Момент розкриття враховує реальну висоту секції. Від початку руху до повного відкриття — не більш як 320 CSS px. На перевірюваних 360/390×844 і 1440×900 після двох рухів колеса на 128+192 px усі шість реальних посилань мають бути всередині viewport; Browser QA перевіряє їхні верхні й нижні координати до будь-якого додаткового прокручування для скриншотів.
- Відкриті напрями більше не зникають при поверненні вгору. Клавіатурний фокус та звичайне посилання «Обрати напрям ↓» одразу відкривають усі дії.
- Без JavaScript, за відсутності потрібних browser API або в режимі зменшеного руху шість напрямів доступні відразу. Немає постійного циклу анімації; у спокої лінза не перезаписує стилі та не ставить власні animation-frame callbacks.
- Маршрути та бібліотека з посібником спочатку згорнуті через native details. Всі три маршрути, десять уроків, одинадцять досьє, тренажер і джерела збережені. Прямі посилання до бібліотеки та посібника розкривають потрібних предків.

## Графіка та вага

Оригінальні згенеровані WebP-зображення без інтерфейсного тексту:

| Файл | Розмір | Байти |
|---|---|---:|
| `dist/home-lens-core.webp` | 900×900, прозорий фон | 278 276 |
| `dist/home-lens-nebula.webp` | 1440×901 | 118 738 |
| Разом | | **397 014** |

Це художня навігаційна метафора, не наукова симуляція й не фотографія JWST. Обидва зображення мають явні width/height, lazy loading та async decoding. Нових runtime-залежностей і сторонніх мережевих запитів немає.

## Фактичне компонування

| Ширина | Висота сторінки до → після | Зміна |
|---|---:|---:|
| 390 px | 5215 → 2721 | −2494 px, приблизно 48% |
| 360 px | 5467 → 2793 | −2674 px, приблизно 49% |
| 1440 px | 3694 → 2437 | −1257 px, приблизно 34% |

Вимірювання реального Chromium: маршрути й бібліотека закриті, лінза вже розкрита звичайною навігацією. Сама секція напрямів отримала велику графіку; скорочення загальної сторінки забезпечують компактні допоміжні розділи.

- Сторінка на телефоні: [до](screenshots/home-cosmic-lens/before-mobile390-fullpage.png) → [після](screenshots/home-cosmic-lens/after-mobile390-fullpage.png).
- Справжній результат двох native wheel рухів, без додаткового прокручування для скриншота: [390 px](screenshots/home-cosmic-lens/after-mobile390-on-screen.png), [360 px](screenshots/home-cosmic-lens/after-narrow360-on-screen.png), [1440 px](screenshots/home-cosmic-lens/after-desktop1440-on-screen.png).
- [Розкрита бібліотека](screenshots/home-cosmic-lens/after-mobile390-library-expanded.png), [вимірювання](screenshots/home-cosmic-lens/measurements.json), [контроль збережених областей](screenshots/home-cosmic-lens/preservation.json).

Координати шести пунктів після двох рухів колеса (128+192 CSS px), до будь-якого допоміжного scroll:

| Viewport | Загальний scroll | Верх першого / низ останнього пункту | Висота екрана |
|---|---:|---:|---:|
| mobile390 | 320 | 451.97 / 808.08 | 844 |
| narrow360 | 320 | 435.39 / 789.22 | 844 |
| desktop1440 | 320 | 556.31 / 852.31 | 900 |

Повні фактичні дані: [390 px](screenshots/home-cosmic-lens/scroll-mobile390.json), [360 px](screenshots/home-cosmic-lens/scroll-narrow360.json), [1440 px](screenshots/home-cosmic-lens/scroll-desktop1440.json).


## Перевірки

`npm run check` завершився успішно: **99/99 тестових файлів**, валідація 5 модулів; smoke перевірив 21 HTML, 98 JavaScript, 182 локальні цілі й 294 якорі.

У вузькому Browser QA перевірки нової лінзи на 360/390/1440 px, native wheel/touch, клавіатури, fallback та deep links пройшли. Один попередній результат перевірки незміненої hero-хвилі у спокої був нестабільним; причину не відтворено у 8 повтореннях фінальної версії та 2 контролях бази, з артефактами й без них. Assertions і часові межі залишено без послаблення, додано діагностичні after/idle дані. Фінальний повний **Browser QA пройшов 3199 перевірок** на 21 сторінці × 2 розміри плюс окремі сценарії головної на 360 px; 3D-моделі відрендерено 2/2. Режими без JS, native wheel/touch, усі шість пунктів на екрані, клавіатура, прямі посилання й зупинка хвилі пройшли без послаблення перевірок.

У сценаріях native details тест тепер очікує фактичного розкриття CSS перед наступним натисканням. Очікування відбувається на стороні Node: browser-таймер повторної спроби pinned Playwright зависав у режимі без JavaScript. Звичайні кліки, суворі assertions і тести без JS збережено; permanent перекриття пунктів не виявлено.

Окремо перевірено:

- Контролер: RED→GREEN, 12 поведінкових тестів; геометрія й округлення scroll, координація RAF, cleanup/remount, article/visibility, BFCache, native focus/jump, fallback, live reduced motion і розкриття hash-предків.
- Семантика: шість canonical destination/title/status із escaping; декоративні lazy assets, native jump, закриті допоміжні розділи, усі матеріали й insertion points continue/saved.
- Незалежний огляд коду й статичних реальних скриншотів. Зауваження щодо передчасного завершення анімації виправлено: перевірка тепер доводить видимість усіх шести дій на екрані, а не лише opacity.
- Byte/DOM-порівняння з базою: hero HTML, повний попередній home-spectrum.css, hero runtime/wave/ribbon, shared header, canonical catalog/shell, усі одинадцять наукових досьє та shared directory pathCard незмінні.

Це перевірки у справжньому настільному Chromium зі змодельованими розмірами й native touch input. Плавність на фізичному телефоні власника цим не підтверджується. Дві старі inline-кнопки словника не належать до нової навігації.

## Збірка й межі зміни

Контролер має первинник `src/platform/home-lens.mjs`, копіюється у `dist/home-lens.js` і внесений до allowlist build-site. Нова окрема CSS підключена лише на головній після чинних стилів, із `?v=1`; hero assets лишилися без змін. Після home-only зміни початкового стану маршрутів узгоджено cache imports `platform-learning.js?v=87`, `directions.js?v=106`; відображення каталогу залишається попереднім.

## Резервна копія й повернення

База — `6a83be1523726a2d814cd52a4bcdb13776b4d0e4`, опублікований PR #131. Збережено remote-гілку `backup/home-before-cosmic-lens-2026-10-28` та архів `/workspace/scratch/evidence-ua-before-cosmic-lens-6a83be1.tar.gz`.

Реалізація — в окремій гілці `feat/home-cosmic-lens`, worktree `/workspace/evidence-ua-lens`. Повернення після публікації — окрема revert-гілка та PR без reset/force push, зі звичайними перевірками. Злиття цієї нової зміни відбувається після окремого «зливай» власника; поточний опублікований сайт до злиття зберігає версію #131.

## Повний список змінених файлів

- `dist/directions.html`
- `dist/directions.js`
- `dist/home-lens-core.webp`
- `dist/home-lens-nebula.webp`
- `dist/home-lens.css`
- `dist/home-lens.js`
- `dist/index.html`
- `dist/platform-learning.js`
- `docs/HOME_COSMIC_LENS_REPORT.md`
- `docs/screenshots/home-cosmic-lens/after-desktop1440-on-screen.png`
- `docs/screenshots/home-cosmic-lens/after-mobile390-fullpage.png`
- `docs/screenshots/home-cosmic-lens/after-mobile390-library-expanded.png`
- `docs/screenshots/home-cosmic-lens/after-mobile390-on-screen.png`
- `docs/screenshots/home-cosmic-lens/after-narrow360-on-screen.png`
- `docs/screenshots/home-cosmic-lens/before-mobile390-fullpage.png`
- `docs/screenshots/home-cosmic-lens/measurements.json`
- `docs/screenshots/home-cosmic-lens/preservation.json`
- `docs/screenshots/home-cosmic-lens/scroll-desktop1440.json`
- `docs/screenshots/home-cosmic-lens/scroll-mobile390.json`
- `docs/screenshots/home-cosmic-lens/scroll-narrow360.json`
- `docs/superpowers/plans/2026-10-28-home-cosmic-lens.md`
- `docs/superpowers/specs/2026-10-28-home-cosmic-lens-design.md`
- `scripts/browser-qa/run.mjs`
- `scripts/build-platform.mjs`
- `scripts/build-site.mjs`
- `src/platform/home-directions.mjs`
- `src/platform/home-lens.mjs`
- `src/platform/learning-ui.mjs`
- `tests/home-lens-layout.test.mjs`
- `tests/home-lens.test.mjs`
- `tests/home-section-hierarchy.test.mjs`
- `tests/review-corrections.test.mjs`
