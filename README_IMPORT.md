# Evidence UA import — Sites v72

Перевірений source snapshot: `3b45b01f0999da36a401839a2288a2f6c8b7de3d`, 13.10.2026.

Усі 178 файлів `src/`, `dist/`, `scripts/`, `tests/`, `docs/` збережені побайтово. Два `.openai` hosting metadata виключено. Цей README та `.gitignore`, `.gitattributes` додані лише для перенесення.

Зберігати **весь `dist/`**: там є авторські HTML/CSS/assets, які не відтворюються з одного `src/`. Вебсервер має подавати вміст `dist/`.

Build (Node 24):

```text
node scripts/build-evidence.mjs
node scripts/build-knowledge.mjs
```

Тести: Python 3 + lxml + Git, на Windows `PYTHONUTF8=1`. Запускати кожен `tests/*.test.mjs` окремо через Node. Деякі тести змінюють `dist`, тому перевірку слід робити в окремій копії з відновленням snapshot перед кожним тестовим файлом.

24/24 тестових файли пройшли у перевірочній копії з оригінальною Sites Git-історією. ZIP історії не містить. Два тести потребують baseline комітів `9d174ef146c09936be2c615e1a663b7e4f7dbd29` та `b48b9d0f5858673f8c6f9985c1984c198847031d`; до їх перенесення або адаптації на справжні fixtures повний CI свіжого репозиторію не буде відтворюваним. Не підміняти baseline поточним source.

Імпортувати у нову гілку від актуального GitHub main, зберегти чинний README, перевірити staged diff, відкрити draft PR. Не force-push. Повний audit, SHA-256 manifest і логи надані окремо.

Це опублікована v72; нові зміни в паралельному чаті після цього snapshot сюди не включені.

## Оновлення v73 — детальна будова органел

Опублікований snapshot: `4c05550cb20cd3c96e9ffeb1c0a2862fbed2f9db`. Hosting metadata залишені поза GitHub згідно з `.gitignore`; README та налаштування репозиторію збережено.

Натискання відкриває детальну ілюстрацію будь-якої з 11 структур на цій самій сторінці. Початкове умовне наближення — 4×; доступні 2×/4×/6×/8×, «Умістити», повернення кнопкою або Escape.

Ілюстрації: [dist/cell-details](dist/cell-details). Опис: [docs/CELL-DETAIL-VIEW-V73.md](docs/CELL-DETAIL-VIEW-V73.md). Промпти: [A](docs/cell-detail-art-a.md), [B](docs/cell-detail-art-b.md), [C](docs/cell-detail-art-c.md).

Зауваження про два історичні Git baseline-коміти для CI залишається чинним.

## GitHub як source of truth — 14.10.2026

Поточне правило: усі зміни робимо в GitHub-гілці від `main` через PR. Merge — лише після явного дозволу власника. Старий Sites більше не є джерелом для редагування; він залишається хостингом.

Весь `dist/` зберігається і публікується як єдиний статичний артефакт. CI накладає два наявні build-скрипти на повний snapshot та запускає кожен тест в окремій копії.

Описана вище проблема відсутніх історичних комітів усунена автентичними SHA-256 fixtures з оригінальних baseline-комітів; поточним source їх не підмінено. [Походження fixtures](tests/fixtures/README_BASELINES.md).

Live Sites зараз має v76, а GitHub містить імпорт до v73. Автоматична публікація build-артефакту з `main` підготовлена; live deploy потребує узгодження цієї різниці та підтримуваного підключення GitHub → Sites. [Стан і налаштування](docs/DEPLOYMENT.md).
