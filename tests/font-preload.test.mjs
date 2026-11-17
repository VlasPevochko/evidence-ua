// Перший екран головної не стрибає (рішення власника «2 і 3», 2026-11-17; docs/HOME_FIRST_SCREEN.md).
// 1) Шрифт заголовка «Почни з питання.» вантажиться одразу: <link rel="preload"> на той самий файл, що в @font-face (інакше браузер завантажить його двічі).
// 2) Поки скрипт не поставив спільну шапку, статична шапка займає її висоту (80 px до 1024 px, 78 px ширше); без JavaScript вона лишається повною.
// 3) Стилі спільної шапки підключені в кінці <head> тією самою адресою, що в site-header.js (інакше скрипт додасть їх удруге, а порядок правил зміниться).
// Справжній зсув у браузері міряє homeNoJumpFlow у Browser QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {unstampHome} from '../scripts/combined-source.mjs';

const home=unstampHome(fs.readFileSync('dist/index.html','utf8')),head=home.slice(0,home.indexOf('</head>')+7);
const spectrumCss=fs.readFileSync('dist/home-spectrum.css','utf8'),headerJs=fs.readFileSync('dist/site-header.js','utf8');

// 1) Попереднє завантаження шрифту.
const preloads=[...head.matchAll(/<link rel="preload"[^>]*>/g)].map(m=>m[0]);
assert.equal(preloads.length,1,'exactly one font is preloaded (both fonts made the largest element paint later on a slow phone)');
const [preload]=preloads,href=/href="([^"]+)"/.exec(preload)[1];
assert(/as="font"/.test(preload)&&/type="font\/woff2"/.test(preload)&&/\scrossorigin(?:[\s>=])/.test(preload),'a font preload needs as="font", type and crossorigin, or the browser fetches the font twice');
assert(fs.existsSync('dist/'+href.replace(/^\.\//,'')),`the preloaded file exists (${href})`);
const heading=/@font-face\{font-family:"Spectrum Serif";[^}]*src:url\(([^)]+)\)[^}]*unicode-range:U\+0301,U\+0400-045F/.exec(spectrumCss);
assert(heading,'the Cyrillic face of the heading font is still declared in home-spectrum.css');
assert.equal(href,heading[1],'the preload points at exactly the Cyrillic heading font file the @font-face uses');
assert(head.indexOf(preload)<head.indexOf('<link rel="stylesheet"'),'the preload stands before the first stylesheet, so it starts at once');

// 2) Місце під спільну шапку.
assert(head.includes('<script>document.documentElement.dataset.homeJs=""</script>'),'an inline script marks that JavaScript runs');
const reserve=(head.match(/<style data-header-reserve>([\s\S]*?)<\/style>/)||[])[1];
assert(reserve,'the header reserve style is in the head');
const scope='html[data-home-js] body[data-platform-area="home"] .page>header.home-header:not(.eua-site-header)';
assert(reserve.startsWith(scope+'{height:80px!important')&&reserve.includes('max-height:80px!important'),'with JavaScript the static header takes the 80 px of the shared header');
assert(reserve.includes(`@media(min-width:1025px){${scope}{height:78px!important;max-height:78px!important}}`),'from 1025 px the shared header is 78 px, and so is the reserve');
assert(reserve.includes(scope+'>:not(.logo){visibility:hidden!important}'),'hidden menu items cannot take keyboard focus while they wait');
assert(!/html:not\(\[data-home-js\]\)|@media\s*print/.test(reserve),'nothing changes without JavaScript or in print: the rule needs data-home-js');

// 3) Стилі спільної шапки.
const version=/css\.href='(\.\/site-header\.css\?v=\d+)'/.exec(headerJs)[1];
const links=[...head.matchAll(/<link rel="stylesheet" href="(\.\/site-header\.css\?v=\d+)" data-site-header-style>/g)].map(m=>m[1]);
assert.deepEqual(links,[version],'the home links the same site-header.css version that site-header.js would add');
assert(head.lastIndexOf('<link rel="stylesheet"')===head.indexOf('<link rel="stylesheet" href="'+version),'site-header.css is the last stylesheet of the head, as when the script used to append it');
// Сторінки розборів беруть ту саму шапку документа.
for(const page of ['creatine.html','supplement-omega.html']){const html=fs.readFileSync('dist/'+page,'utf8');assert(html.includes(preload)&&html.includes('data-header-reserve')&&html.includes(`href="${version}" data-site-header-style`),`${page} carries the same first-screen fixes`);}
console.log('First screen: one heading font preloaded from the same file, the static header reserves the shared header height, header styles are in the head.');
