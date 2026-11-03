import assert from 'node:assert/strict';
import fs from 'node:fs';

// Шапка й меню як на головній (рішення власника 2026-11-01: «шапка й меню як на головній»).
// У космічному вигляді (за замовчуванням) шапка внутрішніх сторінок легка: 78 px (76 на телефоні), прозора, назва Source Serif 4, текстові пункти без піктограм, тонка лінія знизу.
// Змінено лише стилі; розмітка, базовий site-header.css (його далі використовує «Зелений»), поведінка й головна лишаються. Справжній вигляд у браузері міряє headerFlow у Browser QA.
const read=f=>fs.readFileSync(f,'utf8');
const extras=read('src/palette/cosmic-extras.css'),palette=read('dist/palette-cosmic.css');
const GREEN='html:not([data-palette="green"])';
const start=extras.indexOf('/* Шапка й меню як на головній');
assert(start>0,'the header block is in the cosmic extras');
const block=extras.slice(start);
const rules=block.replace(/\/\*[\s\S]*?\*\//g,'');

// 1) Усе, що стосується шапки, діє лише поза «Зеленим»; кожне правило з потрібним ядром.
for(const sel of ['.eua-site-header::after','.eua-site-header :is(.eua-header-emblem,.eua-header-wordmark small)','.eua-site-header .eua-header-wordmark strong','.eua-site-header .eua-header-wordmark b','.eua-site-header .eua-header-links','.eua-site-header nav a svg','.eua-site-header .eua-header-search','.eua-site-header .eua-appearance-toggle','.eua-site-header .eua-header-toggle','.eua-site-header .eua-appearance-panel'])assert(rules.includes(`${GREEN} ${sel}`)||rules.includes(`${GREEN} ${sel},`),`${sel} has a cosmic rule`);
assert(rules.includes(`${GREEN} body header.eua-site-header.eua-site-header.eua-site-header nav{gap:22px!important}`),'the menu gap beats the base rule, which is !important');
const need=[
  ['min-height:78px;padding:14px max(32px,calc((100% - 1344px)/2));gap:24px;border:0;background:transparent','the bar is 78px, transparent, with the home padding'],
  ['height:1px;background:var(--pine-line,#3b3647)','a thin line below instead of a full-width border'],
  ['font:400 30px/1.2 var(--pine-serif,"Source Serif 4",Georgia,serif);letter-spacing:-1px','the name is regular serif, 30px'],
  ['font:400 17px/1.4 var(--pine-serif,"Source Serif 4",Georgia,serif)','the links are 17px serif text'],
  ['text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:8px','the current page is underlined'],
  ['{order:4}','search sits next to "Аа" on the desktop'],
  ['.eua-appearance-toggle{font:700 17px/1 Inter,system-ui,sans-serif}','the "Аа" letters are the same on every page (fat-burning had smaller ones)'],
  ['min-height:76px;padding:12px 22px;gap:12px','the phone bar is 76px'],
  ['.eua-header-wordmark strong{font-size:27px}','the phone name is 27px'],
  ['@media(max-width:370px)','narrow phones have their own rule'],
  ['padding:12px 16px;gap:8px','narrow phones: smaller margins'],
  ['@media(max-width:340px)','the narrowest phones: even smaller name']
];
for(const [piece,why] of need)assert(rules.includes(piece),why);
assert(!/\.eua-site-header[^{}]*\{[^}]*display:none[^}]*\}/.test(rules.replace(/\.eua-site-header :is\(\.eua-header-emblem,\.eua-header-wordmark small\)\{display:none\}/,'').replace(/nav a svg,\s*html:not\(\[data-palette="green"\]\) \.eua-header-about>span\{display:none\}/,'').replace(/\.eua-header-search span\{display:none\}/,'')),'only the emblem, the tagline, the icons, the arrow and the search label are hidden: nothing else (all six links, about, search, "Аа", menu stay)');
assert(palette.includes(block.trim().slice(0,200))&&palette.includes('.eua-site-header .eua-header-wordmark strong{font:400 30px/1.2'),'the generated palette file holds the header block: run node scripts/build-site.mjs');

// 2) Розмітка й базові стилі не змінені: «Зелений» показує колишню шапку, а в космосі приховане лише стилями.
const js=read('dist/site-header.js'),base=read('dist/site-header.css');
for(const part of ['eua-header-emblem','eua-header-wordmark','<small>НАУКА · ЗДОРОВ’Я · РУХ</small>','eua-header-search','eua-header-toggle','eua-header-about','aria-label="Основна навігація"','Про проєкт'])assert(js.includes(part),`the header markup still has ${part}`);
assert(base.includes('.eua-site-header .eua-header-emblem{display:grid;place-items:center;flex:none;width:43px;height:43px')&&base.includes('font:800 23px/1.2 Inter')&&base.includes('min-height:110px'),'the base header (green palette) is untouched');
assert(!/palette-cosmic|data-palette/.test(base),'the base header stylesheet does not know about palettes');
assert(!read('dist/index.html').includes('palette-cosmic.css'),'the home does not load the palette file, so its own header is not touched');
assert(read('dist/home-spectrum.css').includes('.eua-site-header .eua-header-wordmark strong{font:400 30px/1.2 var(--spectrum-serif);letter-spacing:-1px}'),'the home header skin that this block copies is still there');

// 3) Версії, журнал, документи.
const inner=fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='index.html');
assert.equal(inner.length,21,'twenty-one inner pages'); // 2026-11-03 («Довіра»: сторінка «Про проєкт», спільне застереження): додано about.html (внутрішніх було 20).
// Версія файла палітри росте з кожною зміною файла (правила шапки з'явились на v=6; далі того ж дня росла), тож перевіряємо не конкретне число,
// а що всі сторінки вантажать одну версію, не старішу за ту, де є правила шапки.
const paletteVersions=new Set(inner.map(f=>read('dist/'+f).match(/palette-cosmic\.css\?v=(\d+)/)?.[1]));
assert(paletteVersions.size===1&&Number([...paletteVersions][0])>=6,`all inner pages load one palette-cosmic.css version, v=6 or newer (${[...paletteVersions].join(', ')})`);
assert(Number(read('dist/changes.html').match(/changes-page\.js\?v=(\d+)/)?.[1])>=11&&/from '\.\/changes-data\.js\?v=(\d+)'/.test(read('dist/changes-page.js')),'the journal page and its data carry versions');
const changes=read('dist/changes-data.js');
assert(changes.includes("title:'Шапка й меню як на головній'")&&changes.indexOf("title:'Шапка й меню як на головній'")<changes.indexOf("title:'Назви сторінок тонкі, як на головній'"),'the journal tells about the header change, newest first');
const colors=read('docs/COLORS.md');
assert(colors.includes('## Шапка й меню')&&colors.includes('tests/home-header.test.mjs')&&colors.includes('headerFlow'),'docs/COLORS.md describes the header and its checks');
assert(read('docs/HEADER-GEOMETRY.md').includes('2026-11-01: легка шапка')&&read('docs/SHARED-HEADER-SUPPLEMENTS.md').includes('Оновлення 2026-11-01'),'the older header documents say what changed and why');
console.log('Home-like header: cosmic-only rules, markup and base styles untouched, all links/search/Aa/menu kept, narrow phones fit, versions, journal and docs passed.');
