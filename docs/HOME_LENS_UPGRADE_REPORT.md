# Лінза: виправлення й апгрейд після PR #133

## Поведінка

- Прозорі картки мають scoped pointer guard. Він зникає для кожної видимої картки, при клавіатурному відкритті, після першого повного відкриття й під час cleanup.
- Геометрія stage визначає прогрес. Висота каталогу під лінзою більше не затримує появу центральної дії на коротких екранах.
- Ядро піднімається на 12 px і масштабується від 0,94 до 1 у тому самому scroll progress. Висота кнопки 48 px зберігає ≥44 px навіть під час масштабування.
- Краї відкритих половин мають м’яку маску й тонкий світловий край. На CLOSED ширина маски нульова.
- Кількість напрямів залишена в ядрі; сусідні підписи спрощені. Підказка зникає після відкриття зі збереженням місця. Статуси й написи карток збільшено до 13 px.

## Перевірки

- Чотири нові unit regression tests були RED на main і GREEN після виправлень.
- Контролер + layout: **20/20**.
- Повний node scripts/test-site.mjs: **99/99 тестових файлів**.
- Build, validation, smoke: успішні. Smoke: 21 сторінка, 98 JS-файлів, 182 local targets, 294 якорі.
- Native Chromium через підтримуваний браузер: desktop та додаткові контрольовані viewport. Миша на прозорій картці 390×667 залишила користувача на головній.
- Runner CI доповнений реальними wheel/click/Tab probes на 390×667, 844×390 та 390×844 із великим текстом. Збережено попередні no-JS, reduced-motion, lifecycle, touch та всі інші потоки. Результат workflow доступний у checks відповідного PR.

| Перевірка | Progress | Висота кнопки | У межах viewport |
| --- | ---: | ---: | --- |
| Desktop 1363×936 | 1 | 48 px | Так |
| Контрольований 844×390 | 0,5004 | 46,56 px | Так: y=260,11–306,67 |
| Контрольований 390×667 | 1 | 48 px | Так: y=149,46–197,46 |

Контрольовані viewport відтворюють геометрію компонента в iframe; спільна шапка в iframe навмисно не монтується. Це не перевірка фізичного iPhone або Safari. Повний top-level сценарій малих viewport виконує CI.

## Візуальні матеріали

До зміни: [390 px](screenshots/home-lens-split-reveal/390-open.png), [1440 px](screenshots/home-lens-split-reveal/1440-open.png).

Після зміни: [desktop](screenshots/home-lens-upgrade/desktop-open.jpg), [короткий горизонтальний viewport](screenshots/home-lens-upgrade/landscape-mid.jpg), [мобільний viewport](screenshots/home-lens-upgrade/mobile-open.jpg). Числові samples збережені поруч у JSON.

## Файли

Первинні: src/platform/home-lens.mjs, src/platform/home-directions.mjs, dist/home-lens.css, dist/index.html.
Generated: dist/home-lens.js. Перевірки: tests/home-lens.test.mjs, tests/home-lens-layout.test.mjs, scripts/browser-qa/run.mjs.
Документація: цей звіт, spec/plan від 2026-10-31, screenshots/home-lens-upgrade.

База: dad0b3efc742aebbc74cfc3635017dee8503ad5c. Hero, наукові записи й канонічні href не змінювалися. Зміна передається окремим PR; main не зливається агентом.
