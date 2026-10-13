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
