// «Довіра 2» (2026-11-03): одне спільне застереження внизу кожної сторінки. Речення дослівно те саме, що вже стоїть у рядку під картками добавок; нових тверджень немає.
// Вставку робить збірка (src/platform/site-notice.mjs → scripts/build-platform.mjs), тож вона є в самій розмітці: видно без JavaScript і друкується.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SITE_NOTICE_TEXT,SITE_NOTICE_LINK,siteNoticeHTML,withSiteNotice} from '../src/platform/site-notice.mjs';
import {EXCLUDED_CSS} from '../scripts/palette/targets.mjs';

const read=file=>fs.readFileSync(file,'utf8');
const pages=fs.readdirSync('dist').filter(file=>file.endsWith('.html')).sort();
assert(pages.length>=22&&pages.includes('about.html'),`all pages are covered (${pages.length})`);

// 1. Текст: те саме речення, що в рядку під картками добавок; посилання веде на справжню сторінку.
assert.equal(SITE_NOTICE_TEXT,'Матеріал освітній і не є персональною медичною рекомендацією.','the sentence is the one already used under the supplement cards');
assert(read('dist/index.html').split(SITE_NOTICE_TEXT).length-1>=2,'the same sentence is already used in the stamp lines under the supplement cards on the home page, so nothing new is claimed');
assert.deepEqual(SITE_NOTICE_LINK,{text:'Про проєкт',href:'./about.html'});
assert(fs.existsSync('dist/about.html'),'the link leads to an existing page');
const html=siteNoticeHTML();
assert(html==='<div class="eua-site-notice" role="note"><p>'+SITE_NOTICE_TEXT+'</p><a href="./about.html">Про проєкт</a></div>');
assert(!/<header|<footer|<script|onclick/i.test(html),'no header (the shared navigation is inserted after every header), no footer landmark twice, no script');

// 2. Кожна сторінка має рівно одне застереження, останнім видимим елементом, і підключені стилі.
for(const page of pages){
  const text=read('dist/'+page);
  assert.equal((text.match(/class="eua-site-notice"/g)||[]).length,1,`${page}: exactly one notice`);
  // Застереження стоїть останнім видимим елементом: після нього лише порожні <script src></script> (їх дописують збірки карток добавок, тож збірка застереження стала перед ними).
  const after=text.slice(text.indexOf(html)+html.length,text.indexOf('</body>'));
  assert(text.includes(html),`${page}: the notice is the generated one`);
  assert.equal(after.replace(/<script\b[^>]*><\/script>|\s+/g,''),'',`${page}: only empty script tags follow the notice`);
  assert.equal(text.slice(text.indexOf('</body>')).replace(/\s+/g,''),'</body></html>',`${page}: nothing follows </body> but </html>`);
  assert.equal((text.match(/<link rel="stylesheet" href="\.\/site-notice\.css\?v=\d+">/g)||[]).length,1,`${page}: the stylesheet is linked once`);
  assert(text.indexOf('site-notice.css')<text.indexOf('</head>'),`${page}: the stylesheet is in the head`);
  assert.equal(withSiteNotice(text),text,`${page}: running the insertion again changes nothing`);
}
// Вставка не залежить від того, чи вже була: стара прибирається, нова ставиться одна.
const sample='<html><head></head><body><main>x</main><script src="a.js"></script></body></html>',once=withSiteNotice(sample);
assert.equal(withSiteNotice(once),once);
assert(once.indexOf('eua-site-notice')<once.indexOf('<script src="a.js">'),'the notice goes before the trailing script tags, so the supplement card builders (which append their scripts before </body>) never move it');
assert.equal(withSiteNotice(once.replace(SITE_NOTICE_TEXT,'Старий текст.')),once,'an old notice is replaced, not duplicated');

// 3. Стилі: без власних кольорів, без руху, без сторонніх адрес; посилання не менше 44 px; видима обводка при фокусі.
const css=read('dist/site-notice.css');
assert(!/#[0-9a-f]{3,8}\b/i.test(css.replace(/\/\*[\s\S]*?\*\//g,'')),'no own colours: everything follows the text colour of the page');
assert(!/@import|https?:\/\/|animation|transition|url\(/.test(css),'no imports, third-party addresses, motion or images');
assert(/\.eua-site-notice a\{[^}]*min-height:44px/.test(css)&&/\.eua-site-notice a:focus-visible\{[^}]*outline:2px solid/.test(css),'the link is a 44 px target with a visible focus');
assert(/\.eua-site-notice\{[^}]*color-mix\(in srgb,currentColor/.test(css)&&/\.eua-site-notice\{[^}]*border-top:1px solid;/.test(css),'the rule colour follows the text, with a plain fallback');
assert(EXCLUDED_CSS['dist/site-notice.css'],'the stylesheet is listed among the palette exceptions with the reason');

// 4. Документ і правило проєкту.
// CLAUDE.md не потрапляє в ізольовану копію для тестів (її збирають лише src, dist, scripts, tests і docs), тож рядок правила в ньому тут не перевіряємо: його читає людина під час огляду.
const doc=read('docs/ABOUT_AND_NOTICE.md');
for(const part of ['Що змінено','Як це влаштовано','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/ABOUT_AND_NOTICE.md has the section «${part}»`);
assert(doc.includes('src/platform/site-notice.mjs'),'the document names the single source of the notice');
console.log('Site notice: one approved sentence on every page, last before </body>, repeatable insertion, no own colours, 44 px link passed.');
