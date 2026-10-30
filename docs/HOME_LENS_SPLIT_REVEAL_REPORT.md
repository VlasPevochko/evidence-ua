# Розкриття лінзи — перевірка й доставка

Лінза в нижній частині головної тепер розходиться на дві половини. Усередині відкриваються HTML «6 напрямів», запрошення та одна native-кнопка «Обрати напрям» з `href="#cards"`. Зворотний скрол змикає половини; вже відкриті шість напрямів залишаються доступними. Фокус утримує центральну дію відкритою.

Погоджені вимоги: [дизайн](superpowers/specs/2026-10-29-lens-split-reveal-design.md), [план](superpowers/plans/2026-10-29-lens-split-reveal.md). Перевірки: [browser runner](../scripts/browser-qa/run.mjs).

## Вимірювання в Chromium

Від onset виконано справжні wheel +128, +192, −320 CSS px на свіжій сторінці без фокуса/кліку. Геометрію CLOSED/MID/OPEN/BACK збережено до будь-якого додаткового прокручування. Відстань — між краями фактично обрізаних `<img>` за computed clip-path і DOM rectangles; це не рух прозорої обводи. Зображення декодовані, шрифти завантажені. На OPEN всі шість реальних link rectangles у viewport; кожна ціль ≥44 px. Центральна дія непрозора, всередині stage; центр і чотири внутрішні кути проходять elementFromPoint.

| Viewport | Висота сторінки до → після, px | Progress C/M/O/B | Відстань половин C/M/O/B, px | Кнопка, px | Overflow, px |
|---|---:|---|---|---:|---:|
| 360×844 | 2793 → 2778 | 0.0001 / 0.4001 / 1.0000 / 0.0001 | 0.03 / 76.83 / 192.00 / 0.03 | 143.36×44 | 0 |
| 390×844 | 2721 → 2709 | 0.0000 / 0.3996 / 1.0000 / 0.0000 | 0.00 / 76.73 / 192.00 / 0.00 | 143.36×44 | 0 |
| 1440×900 | 2437 → 2437 | 0.0000 / 0.3988 / 1.0000 / 0.0000 | 0.00 / 115.66 / 290.00 / 0.00 | 143.36×44 | 0 |

Відкриття потребує рівно 320 CSS px у всіх трьох viewport. У BACK progress близький до 0, половини повертаються на початкові координати; усі шість посилань мають opacity 1. CLOSED/BACK не мають невидимої зони кліку центральної дії. Три `<img>` використовують два незмінні WebP: дві обрізані копії foreground і туманність. Усю декорацію приховано від accessibility tree; дія поза aria-hidden/inert/hidden.

## Перевірки

- Task1: 16/16 unit/layout; `npm run check`: 99/99 тестових файлів, validation і smoke — GREEN для production commit `cb5290f6b64cecfabb9bcd61498792efd4b165d4`. Логи `.superpowers/sdd/2026-10-29-lens-split-reveal/task-1-fix-1-{green,check}.log`. Task2 не змінює production; повторний build/check не потрібен. SHA256 всіх 258 dist-файлів збігаються з фінальним immutable snapshot.
- Початковий focused home: **809/809**, GREEN до окремого виправлення частково видимої кнопки. На фінальному production після виправлення restore barrier: **471/471** focused lens checks на 360/390/1440, GREEN. Фінальний повний Browser QA: **3502/3502** checks over **21** pages × 2 viewport, GREEN; 360 px додається для home. Chromium 154.0.8037.57 (`/usr/bin/chromium`), Playwright 1.56.1, Node 24.19.0. Після останнього виправлення QA barrier виконано один повний фінальний прогін; попередні невдалі прогони збережено й описано нижче.
- Збережені старі перевірки шапки, канонічної навігації, бібліотеки/досьє, no-JS, нативних details, hero/wave, native wheel/touch, reduced-motion, reload/fast scroll, помилок, локальних відповідей і сторонніх запитів. Додано реальне click/tap/Enter по внутрішній дії, видимий Tab на перший напрям, фокус під час reversal, live reduced-motion, missing observer/setup failure та lifecycle/cleanup.
- Браузерні lifecycle перевірки подають контрольовані hidden/pagehide/pageshow сигнали; native scroll, IntersectionObserver, DOM та render counters залишаються реальними. Реальний article route не запускає приховану лінзу; реальний dispose повертає OPEN і зупиняє callbacks/style writes. Partial/OPEN idle зберігає реальні transforms половин та вміст без autonomous RAF-loop.
- Обмежений old-contract RED: незмінний старий runner дійшов до obsolete `img.length === 2` у першому home flow, зупинений через 18 s. Після завершення Chromium з'явився cleanup cascade «browser closed»; це не дефект продукту. Owner-approved зміни assertions: 2→3 img nodes/2 URLs, aria-hidden тільки на decoration, reversible artwork плюс sticky links. Перший extended run: 3/704 failures через надто широкий throwing-observer injection; виправлено ізоляцію тесту без послаблення health checks і без змін production.

Відтворення фінальної браузерної перевірки з кореня репозиторію:

```sh
BROWSER_EXECUTABLE=/usr/bin/chromium node scripts/browser-qa/run.mjs
```

Фактичні запуски використовували `QA_DIST_DIRECTORY=/workspace/scratch/evidence-ua-lens-reveal/final-dist-v2`, `QA_ARTIFACT_DIR=/workspace/scratch/evidence-ua-lens-reveal/qa/final-verified`. Фінальний лог: `/workspace/scratch/evidence-ua-lens-reveal/qa/final-verified.log`. Скорочений запуск actual lens flow на трьох розмірах: `qa/focused-restore.mjs`, лог `qa/focused-restore.log`. Попередні логи `qa/{old-contract,focused,final-focused,final-focused-green,full,final-full}.log` збережено; невдалі результати не замінено зеленими.

Повторний lifecycle-run мав 4/806 failures: три sampling помилки cleanup та один lower-home mobile grid, знятий під час staggered переходу. У початковому fail log числових samples немає. Окрема bounded reproduction ([JSON](screenshots/home-lens-split-reveal/transition-reproduction.json)) підтверджує причину: на 390/1440 одразу після dispose progress=1, ready=false, усі шість opacity=0/translateY=12; після condition-based wait усі opacity=1/transform=none. На 360 перша картка 0.0799229/11.8412, інші 0/12 → усі 1/none. Cleanup також окремо перевіряє негайний default OPEN; очікування не приховує дефект setup. Для перевірки фінальної grid геометрії нижнього home-flow центральна дія отримує реальний focus; native wheel-flow проходить без допомоги фокуса/кліку. Виправлений focused run: 809/809.

Подальша перевірка виявила справжній дефект: на +128/+208 px дія вже видима (opacity близько .55/1), але не приймала pointer. Шість свіжих coordinate-click probes були RED без фокуса, locator auto-scroll або force. Task1 виправив межу readiness: дія приймає pointer, щойно opacity стає додатним (`progress > .125`), і залишається неактивною на CLOSED/точній межі. Фінальний commit `cb5290f` має незалежне scoped review без відкритих зауважень; шість таких самих probes GREEN ([RED](screenshots/home-lens-split-reveal/visible-action-red.json), [GREEN](screenshots/home-lens-split-reveal/visible-action-green.json)). Ці випадки тепер постійно входять у runner на всіх трьох розмірах.

Два попередні full runs не були зеленими: 3471/3472 на `4a8b767` (лише старий wave idle) і 3501/3502 на фінальному `cb5290f` (лише desktop hidden-document restore). Наукові/навігаційні assertions не змінено. Для wave bounded actual-RAF reproduction доводить: стабільні 320 ms можуть настати до збіжності progress з native scroll target; старий helper повертав .10675/frame4, а за наступні 400 ms frame/pixels змінилися. Посилений helper вимагає native target **та** попередні 320 ms стабільності з тим самим deadline 4 s; строгі 400 ms frame/digest equality збережені ([JSON](screenshots/home-lens-split-reveal/wave-idle-reproduction.json)). Production wave не змінено.

Для restore оригінальний fail log не містить числового sample. Окреме bounded real-browser відтворення на незмінному v2 зберігає progress, opacity, transforms і час фактично ідентифікованого lens RAF ([JSON](screenshots/home-lens-split-reveal/restore-reproduction.json)). Звичайні hidden/pagehide restores проходять на трьох розмірах; затримка лише фактичного lens RAF на 220 ms відтворює старий 300 ms sampling failure: progress=1, але opacity шести карток близько .417/.417/.313 на 360/390/1440. Фактичний CSS fade триває 160 ms після RAF. Semantic wait дає opacity=1/transform=none. QA тепер чекає actual progress=1 та settled cards, що також покриває повторний restore зі sticky completion; не збільшує довільний sleep. Той самий аудит замінив fixed waits перед фінальними card checks native OPEN, Enter/Tab, reload, live reduced-motion і native touch. Wheel +128/+192, усі шість on-screen card bounds, −320/BACK, no-JS/fallback health та wave idle залишаються строгими.

## Збереження й артефакти

[Preservation JSON](screenshots/home-lens-split-reveal/preservation.json) звіряє базу `09cdff1f9d4ee96aa624363262fbcb70aa6384fa`: hero HTML, 10 захищених runtime/style/header/catalog файлів і 11 наукових dossier subtrees незмінні. Обидва WebP побітово незмінні, разом 397014 B; нових artwork/runtime dependencies немає. Frozen scientific еталони не змінювалися. Геометрія hero/ribbon/canvas до і після лінзи однакова в межах 1 px. Перевірку preservation виконано повторно після підтвердження незмінного production.

Самостійно оглянуто реальні OPEN на 360/390/1440, MID/BACK на 390 та CLOSED на desktop: ядро читабельне, дія не обрізана, половини виразно розділяються й змикаються. Збережено оригінальні PNG без ресайзу: [до 390](screenshots/home-lens-split-reveal/before-390-open.png), [390 CLOSED](screenshots/home-lens-split-reveal/390-closed.png), [MID](screenshots/home-lens-split-reveal/390-mid.png), [OPEN](screenshots/home-lens-split-reveal/390-open.png), [BACK](screenshots/home-lens-split-reveal/390-back.png), [360 OPEN](screenshots/home-lens-split-reveal/360-open.png), [1440 CLOSED](screenshots/home-lens-split-reveal/1440-closed.png), [OPEN](screenshots/home-lens-split-reveal/1440-open.png). Три `geometry-*.json` містять точні rects/progress/opacity/hit/height/overflow. `capture-provenance.json` містить production commit, v2 manifest/source SHA256, фінальні counts, точні джерела та SHA256 оригінальних PNG/geometry; `old-contract-summary.json` пояснює зміну контракту. Решта runtime screenshot artifacts лишаються у scratch.

## Точний перелік змінених файлів гілки

- `dist/home-lens.css`
- `dist/home-lens.js`
- `dist/index.html`
- `docs/HOME_LENS_SPLIT_REVEAL_REPORT.md`
- `docs/screenshots/home-lens-split-reveal/1440-closed.png`
- `docs/screenshots/home-lens-split-reveal/1440-open.png`
- `docs/screenshots/home-lens-split-reveal/360-open.png`
- `docs/screenshots/home-lens-split-reveal/390-back.png`
- `docs/screenshots/home-lens-split-reveal/390-closed.png`
- `docs/screenshots/home-lens-split-reveal/390-mid.png`
- `docs/screenshots/home-lens-split-reveal/390-open.png`
- `docs/screenshots/home-lens-split-reveal/before-390-open.png`
- `docs/screenshots/home-lens-split-reveal/capture-provenance.json`
- `docs/screenshots/home-lens-split-reveal/geometry-desktop.json`
- `docs/screenshots/home-lens-split-reveal/geometry-mobile-narrow.json`
- `docs/screenshots/home-lens-split-reveal/geometry-mobile.json`
- `docs/screenshots/home-lens-split-reveal/old-contract-summary.json`
- `docs/screenshots/home-lens-split-reveal/preservation.json`
- `docs/screenshots/home-lens-split-reveal/restore-reproduction.json`
- `docs/screenshots/home-lens-split-reveal/transition-reproduction.json`
- `docs/screenshots/home-lens-split-reveal/visible-action-green.json`
- `docs/screenshots/home-lens-split-reveal/visible-action-red.json`
- `docs/screenshots/home-lens-split-reveal/wave-idle-reproduction.json`
- `docs/superpowers/plans/2026-10-29-lens-split-reveal.md`
- `docs/superpowers/specs/2026-10-29-lens-split-reveal-design.md`
- `scripts/browser-qa/run.mjs`
- `src/platform/home-directions.mjs`
- `src/platform/home-lens.mjs`
- `tests/home-lens-layout.test.mjs`
- `tests/home-lens.test.mjs`

Generated outputs: `dist/index.html`, `dist/home-lens.js`, зібрані з `src/platform/home-directions.mjs`, `src/platform/home-lens.mjs`; CSS `dist/home-lens.css` авторський. Cache query CSS v2, JS v3 після виправлення частково видимої дії. Task2 змінює лише QA runner, цей звіт, обрані artifacts і checkboxes плану; production належить Task1.

## Межі перевірки й повернення

Фізичний телефон власника, Safari/Firefox, реальний browser bfcache/tab background та плавність на пристрої не перевірялися. Touch — Chromium mobile emulation зі справжніми CDP touch events/tap. Lifecycle — контрольовані браузерні сигнали, не твердження про проходження реального bfcache. Зміни ще не перевірено на опублікованому live-сайті; локальний immutable build блокує сторонні запити. Нових наукових висновків немає.

Backup до зміни: remote `backup/home-before-lens-split-2026-10-29`, архів `/workspace/scratch/evidence-ua-lens-reveal/evidence-ua-before-lens-split-09cdff1.tar.gz`. Точна база до зміни — `09cdff1f9d4ee96aa624363262fbcb70aa6384fa`. Для скасування після майбутнього merge — звичайний новий PR із revert усього feature merge: production, generated outputs, відповідні UI-тести та Browser QA contracts повертаються разом, щоб CI залишався узгодженим. Scientific/hero файли не потребують відновлення. Reset, force push і видалення гілок не потрібні. Нове злиття очікує окремого «зливай» власника.
