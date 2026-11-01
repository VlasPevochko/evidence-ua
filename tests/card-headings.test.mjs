import assert from 'node:assert/strict';
import fs from 'node:fs';

// Заголовки карток як на головній (рішення власника 2026-11-01: «тонкі заголовки карток із засічками, як на головній»).
// Космічний стиль (за замовчуванням) дає h2–h4 усередині main і назвам карток, що не є заголовками (картки «Куди далі», картки дієт, записи журналу),
// шрифт головної: Source Serif 4, звичайну вагу, трохи стиснуті літери. Зелений варіант, назва сторінки (h1), шапка, меню й головна не змінюються.
// Цей тест перевіряє файли (правило, шрифт, імена класів, версії, журнал, документи); справжній стиль у браузері міряє headingsFlow у Browser QA.
const read=f=>fs.readFileSync(f,'utf8');
const extras=read('src/palette/cosmic-extras.css'),palette=read('dist/palette-cosmic.css'),pine=read('dist/page-pine.css');
const GREEN='html:not([data-palette="green"])';

// 1) Саме правило: що вибирає і що задає.
const rule=extras.match(/html:not\(\[data-palette="green"\]\) :is\(main,\[role="main"\]\) :is\(h2,h3,h4\),\s*html:not\(\[data-palette="green"\]\) :is\(([^)]*)\)\{([^}]*)\}/);
assert(rule,'the card headings rule is in the cosmic extras');
const [whole,namedCards,body]=rule;
assert.deepEqual(namedCards.split(','),['.eua-next strong','.nd-card-title','.ch-title'],'the card titles that are not heading tags: "Куди далі", diet cards, journal entries');
const declarations=Object.fromEntries(body.split(';').filter(Boolean).map(d=>{const i=d.indexOf(':');return [d.slice(0,i),d.slice(i+1)];}));
assert.deepEqual(declarations,{'font-family':'var(--pine-serif,"Source Serif 4",Georgia,serif)!important','font-weight':'400!important','letter-spacing':'-.015em!important'},'serif, regular weight, slightly tight letters; size and colour stay as the page sets them');
assert(!/\bh1\b|header|nav\b/.test(whole),'the page title, the header and the menu are not touched by this rule');
assert(whole.startsWith(GREEN),'the rule never applies to the green palette');
assert(palette.includes(whole),'the generated palette file holds the rule: run node scripts/build-site.mjs');

// 2) Це справді шрифт головної, і для української він доступний на кожній внутрішній сторінці без нових завантажень.
assert(pine.includes('--pine-serif:"Source Serif 4",Georgia'),'--pine-serif is Source Serif 4');
const faces=css=>[...css.matchAll(/@font-face\{[^}]*font-family:"([^"]+)"[^}]*src:url\(["']?(?:\.\/)?(fonts\/[^)"']+)["']?\)[^}]*\}/g)].map(m=>`${m[1]}|${m[2]}`);
const pineFaces=faces(pine).filter(f=>f.startsWith('Source Serif 4|')).map(f=>f.split('|')[1]).sort();
const homeFaces=faces(read('dist/home-spectrum.css')).filter(f=>f.startsWith('Spectrum Serif|')).map(f=>f.split('|')[1]).sort();
assert.deepEqual(pineFaces,['fonts/source-serif-4-cyrillic-wght-normal.woff2','fonts/source-serif-4-latin-wght-normal.woff2'],'inner pages load Source Serif 4 (Cyrillic and Latin) already for the page title');
assert.deepEqual(pineFaces,homeFaces,'the home calls the same two font files "Spectrum Serif": it is the same typeface');
assert(/font-family:"Source Serif 4";[^}]*font-weight:200 900;[^}]*U\+0400-045F/.test(pine),'the font covers weight 400 and Ukrainian letters');
assert(!read('dist/index.html').includes('palette-cosmic.css'),'the home does not load the palette file, so it is not affected');

// 3) Імена класів, на які спирається правило, ще існують у розмітці та стилях (інакше правило тихо перестане діяти).
const scan=[...fs.readdirSync('dist').filter(f=>/\.(css|js|html)$/.test(f)&&f!=='palette-cosmic.css').map(f=>'dist/'+f),'src/nutrition-diets/render.mjs','src/cell-lab/sources.mjs','src/muscle-lab/guide.mjs','src/platform/learning-notes.mjs'].map(read).join('\n');
for(const cls of ['eua-next','nd-card-title','ch-title','atlas-topic','cell-source-record','cell-source-details','mg-ch-title','editorial-rules'])assert(scan.includes(cls),`.${cls} still exists in the pages, so its heading style still applies`);
assert(read('dist/platform-next-steps.js').includes('<strong>${esc(title)}</strong>'),'"Куди далі" titles are <strong> in a link, which is why they are listed by class');

// 4) Дрібні заголовки (15–16 px): поправка видимого розміру, пропорційна, лише в космосі.
const small=extras.match(/html:not\(\[data-palette="green"\]\) :is\(([^)]*)\)\{font-size-adjust:\.55\}/);
assert(small,'small headings have an optical size correction');
assert.deepEqual(small[1].split(','),['.atlas-topic h3','.cell-source-record h4','.cell-source-details h4','.mg-ch-title','.editorial-rules h3'],'the small headings: atlas topics, cell sources, muscle chapters, source rules');
assert(palette.includes(small[0]),'the generated palette file holds the correction');
assert(!/font-size-adjust/.test(pine)&&!extras.slice(0,extras.indexOf(whole)).includes('font-size-adjust'),'no other rule uses font-size-adjust');

// 5) Версії в query-рядках: нова версія файла палітри на всіх 20 внутрішніх сторінках, головна без змін; журнал бере нову версію даних.
const inner=fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='index.html');
assert.equal(inner.length,20,'twenty inner pages');
for(const f of inner)assert(read('dist/'+f).includes('palette-cosmic.css?v=4')&&!read('dist/'+f).includes('palette-cosmic.css?v=3'),`${f} loads palette-cosmic.css?v=4`);
assert(read('dist/changes.html').includes('changes-page.js?v=9')&&read('dist/changes-page.js').includes("from './changes-data.js?v=9'"),'the journal page and its data have new versions');
// Тест palette.test.mjs пильнує, що файл палітри свіжий; тут лише версія. Якщо зміниться файл палітри, піднімайте число в build-platform.mjs.

// 6) Журнал оновлень і документ.
const changes=read('dist/changes-data.js');
assert(changes.includes("title:'Заголовки карток як на головній'")&&changes.indexOf("title:'Заголовки карток як на головній'")<changes.indexOf("date:'2026-10-31'"),'the journal tells about the change on 2026-11-01');
// CLAUDE.md не потрапляє в ізольовану копію для тестів (її збирають лише src, dist, scripts, tests і docs), тож його тут не читаємо: рядок про заголовки там перевіряє людина під час огляду.
const colors=read('docs/COLORS.md');
assert(colors.includes('## Заголовки карток і розділів')&&colors.includes('Source Serif 4')&&colors.includes('headingsFlow')&&colors.includes('tests/card-headings.test.mjs'),'docs/COLORS.md describes the heading rule and its checks');
console.log('Card headings: home serif rule only in cosmic, h1/header/green/home untouched, font shared, class names alive, versions and docs passed.');
