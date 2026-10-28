# Головна: виразні розділи на телефоні

На телефоні після космічного першого екрана напрями, приклади й довгі маршрути виглядали як суцільний текст. Нижню частину розділено на окремі блоки з видимими діями. Перший екран, хвиля та науковий зміст збережені.

## Поведінка

- «Обери напрям»: шість видимих посилань у два стовпці на телефоні, назви, актуальні статуси з каталогу й стрілки переходу. Блок має власну поверхню та межі.
- «Навчальні маршрути»: три видимі кнопки початку; описи й усі кроки кожного маршруту розгортаються окремо. Загальний розділ відкритий. Додаткові приклади «З чого почати?» згорнуті окремо.
- Бібліотека доказів: власний заголовок, помітна кнопка каталогу, одинадцять окремих посилань і відокремлений посібник читання доказів.
- Розгортання працює через звичайні HTML details із клавіатурою та без JavaScript. Продовження читання і збережені матеріали лишаються поза згорнутими прикладами.
- Немає нових runtime-залежностей, зображень чи анімацій. Спільний каталог маршрутів зберігає свій попередній renderer. Зміна directions.html/directions.js лише оновлює кеш імпортованого модуля.

## Фактичні вимірювання

Chromium, CSS pixels, стандартний стан: приклади та переліки кроків закриті, загальний розділ маршрутів відкритий. База — `ea4b9e87c618d800987883b571fa996c779a1cb8`.

| Ширина | Висота сторінки до → після | Початок бібліотеки до → після | Висота маршрутів до → після |
|---|---:|---:|---:|
| 390 px | 5836 → 5215 | 3843 → 3024 | 1187 → 685 |
| 360 px | 5961 → 5467 | 3872 → 3082 | 1209 → 712 |
| 1440 px | 3644 → 3694 | 2313 → 2304 | 495 → 365 |

На телефоні бібліотека доступна приблизно на один екран раніше; видимі дії нижньої частини скорочено з 45 до 36 завдяки згортанню допоміжних списків. Самі посилання збережені. На комп’ютері загальна висота зросла на 50 px через чіткіші відступи.

## Скриншоти

| Блок, 390 px | До | Після |
|---|---|---|
| Напрями | [До](screenshots/home-section-hierarchy/before-mobile390-directions.png) | [Після](screenshots/home-section-hierarchy/after-mobile390-directions.png) |
| Маршрути | [До](screenshots/home-section-hierarchy/before-mobile390-routes.png) | [Після](screenshots/home-section-hierarchy/after-mobile390-routes.png) |
| Бібліотека | [До](screenshots/home-section-hierarchy/before-mobile390-library.png) | [Після](screenshots/home-section-hierarchy/after-mobile390-library.png) |

Повні сторінки: [360 px](screenshots/home-section-hierarchy/after-narrow360-fullpage.png), [1440 px](screenshots/home-section-hierarchy/after-desktop1440-fullpage.png). [Вимірювання та контрольні хеші](screenshots/home-section-hierarchy/measurements-summary.json).

## Перевірка

- `npm run check`: 97/97 тестових файлів, валідація 5 модулів; smoke перевірив 21 HTML, 97 JavaScript, 178 локальних цілей і 293 якорі.
- Окремий Browser QA головної: 347 перевірок пройшли; 360/390/1440 px, пошук, панель напрямів, переходи, клавіатура, native details без JavaScript, скрол хвилі, touch emulation і reduced motion.
- Повний Browser QA всіх сторінок: **3010 перевірок пройшли**, 21 сторінка × 2 розміри плюс окрема головна на 360 px; 3D-моделі відрендерено 2/2. Початковий прогін виявив застарілий селектор: посилання «Розібрати харчування» тепер усередині згорнутих прикладів. Тест виправлено на видиму картку «Харчування», зі збереженням перевірки переходу саме в nutrition.html. Окремі 165 перевірок харчування на 390/1440 px пройшли; наступний повний прогін завершився успішно.
- Немає горизонтального обрізання, runtime-помилок, невдалих локальних запитів чи сторонніх запитів у зафіксованих станах на трьох ширинах. Всі десять розгорнутих посилань уроків мають висоту 44 px.
- Перший екран HTML, перші 25 576 байтів CSS, скрипти й зображення хвилі та спільна шапка ідентичні базі. Межі дев’яти елементів першого екрана збігаються на всіх трьох ширинах. Одинадцять наукових досьє й наукові fixtures не змінені.
- Незалежний огляд коду завершений без блокерів після виправлення двох зауважень: облік реального відступу native summary в QA та приховування застарілого дубльованого посилання на креатин. Незалежний фінальний візуальний огляд скриншотів 360/390/1440 px теж завершений без блокерів.

Це автоматизований Chromium зі змодельованими розмірами та touch, а не перевірка плавності на фізичному телефоні. Дві старі вбудовані кнопки словника залишаються 25,5 px заввишки; вони не є новими навігаційними елементами цієї зміни. Скриншоти — артефакти локальної перевірки, не свідчення публікації.

## Резервна копія й повернення

- Remote-гілка `backup/home-before-section-hierarchy-2026-10-28` на `ea4b9e8` містить опубліковану головну до цих змін.
- Локальний архів: `/workspace/scratch/evidence-ua-before-section-hierarchy-ea4b9e8.tar.gz`.
- Для повернення після публікації — окрема revert-гілка та PR, що скасовує коміт цього доопрацювання; без reset або force push. Потім звичайні перевірки й deployment. Перший космічний екран лишиться попереднім.

## Доставка

Гілка `fix/home-mobile-section-hierarchy`, база `main` / `ea4b9e8`. Поточний сайт залишається на опублікованому PR #130 до злиття нового PR. Merge лише після окремого доручення власника. Канонічний репозиторій — `VlasPevochko/evidence-ua`, без сімки.

## Повний список змінених файлів

- `src/platform/home-directions.mjs` — build-only renderer напрямів із canonical-даних та escaping.
- `src/platform/learning-ui.mjs` — компактне home-only представлення маршрутів.
- `scripts/build-platform.mjs` — інтеграція renderer та версії кешу.
- `dist/index.html` — authored обгортки розділів, приклади details, прихований legacy-дублікат і CSS v3.
- `dist/home-spectrum.css` — лише нижня частина головної.
- `dist/platform-learning.js`, `dist/directions.js`, `dist/directions.html` — згенеровані outputs і узгоджений кеш.
- `tests/home-section-hierarchy.test.mjs` — DOM-контракти напрямів, маршрутів, списків і escaping.
- `tests/home-entry.test.mjs`, `tests/home-geo-hero.test.mjs` — пояснені зміни дозволених UI-контрактів, наукові перевірки збережені.
- `scripts/browser-qa/run.mjs` — межі блоків, фактичні тексти, цілі натискання, native details, 360 px та актуальний вхід у харчування.
- `docs/superpowers/specs/2026-10-28-home-section-hierarchy-design.md` — доручення та дизайн.
- `docs/superpowers/plans/2026-10-28-home-section-hierarchy.md` — план і стан виконання.
- `docs/HOME_SECTION_HIERARCHY_REPORT.md` — цей звіт.
- `docs/screenshots/home-section-hierarchy/before-mobile390-directions.png`
- `docs/screenshots/home-section-hierarchy/before-mobile390-routes.png`
- `docs/screenshots/home-section-hierarchy/before-mobile390-library.png`
- `docs/screenshots/home-section-hierarchy/after-mobile390-directions.png`
- `docs/screenshots/home-section-hierarchy/after-mobile390-routes.png`
- `docs/screenshots/home-section-hierarchy/after-mobile390-library.png`
- `docs/screenshots/home-section-hierarchy/after-narrow360-fullpage.png`
- `docs/screenshots/home-section-hierarchy/after-desktop1440-fullpage.png`
- `docs/screenshots/home-section-hierarchy/measurements-summary.json`
