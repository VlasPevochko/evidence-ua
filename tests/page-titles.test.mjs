import assert from 'node:assert/strict';
import fs from 'node:fs';

// Назви сторінок (h1) тонкі, як на головній (друге рішення власника 2026-11-01, після заголовків карток: «2 так»).
// У космосі (за замовчуванням) h1 має звичайну вагу й літери -0,03 em, як на головній заголовки такого розміру. Шрифт (Source Serif 4), розмір і колір
// лишаються як на сторінці. Мазок-підкреслення під назвою спершу лишався, але того ж дня власник вирішив його прибрати (tests/title-stroke.test.mjs). «Зелений» і головна не змінюються.
// Справжній стиль у браузері міряє headingsFlow у Browser QA.
const read=f=>fs.readFileSync(f,'utf8');
const extras=read('src/palette/cosmic-extras.css'),palette=read('dist/palette-cosmic.css'),pine=read('dist/page-pine.css');

// 1) Правило: що вибирає і що задає. Шрифт не задаємо, бо назва вже набрана Source Serif 4 (перевіряємо нижче).
const rule='html:not([data-palette="green"]) h1{font-weight:400!important;letter-spacing:-.03em!important}';
assert(extras.includes(rule),'the page title rule is in the cosmic extras');
assert(palette.includes(rule),'the generated palette file holds the rule: run node scripts/build-site.mjs');
assert.equal(extras.split(rule).length,2,'the rule is there once');
// Правило карток із tests/card-headings.test.mjs h1 не чіпає: у них окремі правила, щоб кожне можна було змінити окремо.
assert(!/:is\(h2,h3,h4\)[^{]*\bh1\b/.test(extras),'the card headings rule is separate from the page title rule');

// 2) Назви справді набрані тим самим шрифтом, що й картки та головна (інакше «тонка» назва була б у запасному Georgia).
assert(/\.pb h1\{[^}]*var\(--pine-serif\)/.test(pine),'the page banner title uses --pine-serif');
assert(pine.includes('--pine-serif:"Source Serif 4",Georgia'),'--pine-serif is Source Serif 4');
const supplements=read('dist/supplements.css');
assert(/\.sp-head h1\{[^}]*var\(--sp-serif\)/.test(supplements)&&/--sp-serif:\s*"Source Serif 4"/.test(supplements),'the supplements page title is Source Serif 4 too (its own --sp-serif variable)');

// 3) Кожна внутрішня сторінка має рівно одну назву (h1), а головна палітру не вантажить: її h1 це окремий стиль головної.
const inner=fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='index.html');
assert.equal(inner.length,21,'twenty-one inner pages'); // 2026-11-03 («Довіра»: сторінка «Про проєкт», спільне застереження): додано about.html (внутрішніх було 20).
for(const f of inner){const html=read('dist/'+f);assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${f} has exactly one <h1>`);}
assert(!read('dist/index.html').includes('palette-cosmic.css'),'the home does not load the palette file, so its title is not affected');

// 4) Версія файла палітри нова на всіх сторінках; журнал розповідає про зміну; документи описують правило.
// Версія файла палітри росте з кожною зміною файла (правило для h1 з'явилось на v=5; шапка того ж дня на v=6), тож перевіряємо не конкретне число,
// а що всі сторінки вантажать одну версію, не старішу за ту, де є правило для h1.
const paletteVersions=new Set(inner.map(f=>read('dist/'+f).match(/palette-cosmic\.css\?v=(\d+)/)?.[1]));
assert(paletteVersions.size===1&&Number([...paletteVersions][0])>=5,`all inner pages load one palette-cosmic.css version, v=5 or newer (${[...paletteVersions].join(', ')})`);
assert(Number(read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/)?.[1])>=10&&/from '\.\/changes-data\.js\?v=(\d+)'/.test(read('dist/changes-page.js')),'the journal page and its data carry versions');
const changes=read('dist/changes-data.js');
assert(changes.includes("title:'Назви сторінок тонкі, як на головній'")&&changes.indexOf("title:'Назви сторінок тонкі, як на головній'")<changes.indexOf("title:'Заголовки карток як на головній'"),'the journal tells about the title change, newest first');
const colors=read('docs/COLORS.md');
assert(colors.includes('Назви сторінок (h1)')&&colors.includes('tests/page-titles.test.mjs'),'docs/COLORS.md describes the page title rule and its check');
console.log('Page titles: thin Source Serif 4 only in cosmic, one h1 per page, home and green untouched, versions, journal and docs passed.');
