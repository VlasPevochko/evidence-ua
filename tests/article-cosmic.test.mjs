import assert from 'node:assert/strict';
import fs from 'node:fs';
import {articlePaletteCss} from '../scripts/build-palette.mjs';
import {ARTICLE_OUTPUT,ARTICLE_SCOPE,ARTICLE_CSS,isHomeOnlyCss} from '../scripts/palette/targets.mjs';
import {articleOverrides} from '../scripts/palette/article-overrides.mjs';

// Розбори добавок (index.html#creatine, #supplement-…) у космічних кольорах і формах решти сайту (2026-11-03, варіант «A: кольори й форми»).
// Головна файл palette-cosmic.css не вантажить (рішення власника, перевіряють card-headings і home-header), тож розбори, які живуть усередині неї, мали старий вигляд:
// золото, радіуси 16 і 30px. Окремий згенерований файл діє лише під body[data-route-view="article"] і не для зеленого варіанта.
const read=f=>fs.readFileSync(f,'utf8');
const html=read('dist/index.html'),css=read(ARTICLE_OUTPUT);

// 1) Підключено один раз, головна палітру як і раніше не вантажить, інші сторінки новий файл не вантажать.
assert.equal(html.split('home-article-cosmic.css').length-1,1,'the home loads the article palette exactly once');
assert(!html.includes('palette-cosmic.css'),'the home still does not load the palette file');
assert(html.indexOf('home-article.css')<html.indexOf('home-article-cosmic.css'),'the article palette comes after the article stylesheet');
for(const f of fs.readdirSync('dist').filter(n=>n.endsWith('.html')&&n!=='index.html'))assert(!read('dist/'+f).includes('home-article-cosmic.css'),`${f} does not load the article palette`);
assert(isHomeOnlyCss(ARTICLE_OUTPUT),'the file is classified as a home stylesheet, so it is not tokenised itself');

// 2) Згенерований файл свіжий: його можна відтворити з стилів розборів; нове правило з золотом чи радіусом 16/30px без переписування падає тут.
assert.equal(css,articlePaletteCss().css,'dist/home-article-cosmic.css is current: run node scripts/build-site.mjs');

// 3) Ізоляція: кожен селектор починається з ARTICLE_SCOPE (режим «стаття», не зелений), тож головна й зелений варіант не змінюються.
const body=css.replace(/\/\*[\s\S]*?\*\//g,'');
const flat=body.replace(/@media[^{]*\{/g,'').replace(/\}\}/g,'}');
for(const m of flat.matchAll(/([^{}]+)\{[^{}]*\}/g)){
  for(const sel of m[1].split(/,(?![^(]*\))/).map(s=>s.trim()).filter(Boolean))assert(sel.startsWith(ARTICLE_SCOPE),`selector is scoped to the article view: ${sel.slice(0,90)}`);
}
assert.equal(ARTICLE_SCOPE,'html:not([data-palette="green"]) body[data-route-view="article"]');

// 4) Лише малювання: жодної розкладки, типографіки, змісту чи зовнішніх адрес; тексти й розмітка не змінюються.
// Виняток: заголовки (h1–h4) мають лише шрифт, вагу й літери, як на решті сайту (рішення власника 2026-11-01); розмір, відступи й колір не чіпаємо.
const allowed=/^(--c-[0-9a-f]+|--rd-\d+|--sd-card|--pc-[a-z-]+|color|background(-color|-image)?|border(-[a-z]+)*|outline(-color)?|box-shadow|fill|stroke)$/;
const typography=/^(font-family|font-weight|letter-spacing|font-size-adjust)$/;
for(const m of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g))for(const d of m[2].split(';')){
  const k=d.indexOf(':');if(k<=0)continue;const p=d.slice(0,k).trim().toLowerCase();
  if(typography.test(p))assert(/\bh[1-4]\b|h3\.eua-reaction-label/.test(m[1]),`typography is set only on headings (found ${p} on ${m[1].trim().slice(-70)})`);
  else assert(allowed.test(p),`only paint properties are set in the article palette (found ${p})`);
}
assert(!/url\(|@import|https?:\/\//.test(body),'no external or image addresses');

// 5) Результат: космічні значення форм і кольорів, смуги даних лишаються округлими.
assert(css.includes('--rd-16:3px')&&css.includes('--rd-30:5px'),'cards are 3px and pill buttons 5px, as on the other pages');
assert(!/#e7bd46|#a38647|#655a40|#211f19/i.test(body),'the old gold and brown literals are gone from the article palette');
for(const m of articleOverrides().matchAll(/\.pc-track[^{]*\{([^}]*)\}/g))for(const r of m[1].matchAll(/border-radius:([^;]+)/g))assert.equal(r[1].trim(),'8px','data bars keep their round ends');
assert(css.includes('#bb81ef'),'gold becomes the shared lavender');

// 6) Токени беруться зі стилів, які режим «стаття» реально підтягує; жодного токена без значення.
for(const f of ARTICLE_CSS)assert(fs.existsSync(f),`${f} exists`);
const used=new Set();for(const f of ARTICLE_CSS)for(const m of read(f).matchAll(/var\((--c-[0-9a-f]+),/g))used.add(m[1]);
for(const t of used)assert(css.includes(t+':'),`${t} has a cosmic value in the article palette`);

// 6b) Заголовки розборів: те саме тонке письмо із засічками, що на решті сайту; підписи з розрядкою (.pc-bar-group > h3) не чіпаємо.
assert(css.includes(`${ARTICLE_SCOPE} :is(#creatine,[id^="supplement-"]) h1{font-weight:400!important;letter-spacing:-.03em!important}`),'article h1 is regular weight with the shared tracking');
assert(css.includes(':is(h2,h3,h4):not(.pc-bar-group>h3){font-family:var(--pine-serif,"Source Serif 4",Georgia,serif)!important;font-weight:400!important;letter-spacing:-.015em!important}'),'article h2–h4 are regular Source Serif 4 with the shared tracking, except tracked labels');
assert(!/font-size\s*:|line-height\s*:|margin|padding/.test(body),'headings keep their sizes, line heights and spacing');
assert(read('src/palette/cosmic-extras.css').includes('font-weight:400!important;letter-spacing:-.015em!important'),'the shared heading rule this one repeats still exists');

// 7) Версія і запис у журналі.
assert(/home-article-cosmic\.css\?v=\d+/.test(html),'the stylesheet link is versioned');
assert(read('dist/changes-data.js').includes('Розбори добавок у кольорах і формах решти сайту'),'the change log mentions it');
assert(read('dist/changes-data.js').includes('Заголовки розборів добавок тонкі, із засічками'),'the change log mentions the headings');
console.log('article palette: scoped to the article view, paint only, fresh, home and green unchanged');
