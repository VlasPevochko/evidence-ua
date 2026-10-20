import assert from 'node:assert/strict';
import fs from 'node:fs';

// Fat Burning Lab приведено до стандарту сайту (рішення власника 2026-10-20): сосновий вигляд, власний мотив, згорнуті джерела.
// Наукові тексти не змінювались: цей тест перевіряє лише оформлення.
const html=fs.readFileSync('dist/fat-burning.html','utf8'),css=fs.readFileSync('dist/fat-burning.css','utf8'),pine=fs.readFileSync('dist/fat-burning-pine.css','utf8'),pageCss=fs.readFileSync('dist/page-pine.css','utf8'),js=fs.readFileSync('dist/fat-burning.js','utf8');
assert(html.includes('data-pine')&&html.includes('page-pine.css?v=')&&html.includes('fat-burning-pine.css?v='),'page opts into the pine system');
assert(/<div class="pb fb-band" data-motif="uroko">\s*<section class="fb-hero"/.test(html),'hero sits in the patterned title band');
assert(pageCss.includes('.pb[data-motif="uroko"]'),'the uroko motif is defined once for the whole site');
// The motif is this page\'s own: no other page uses it.
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='fat-burning.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="uroko"'),`${f} must not reuse the uroko motif`);
// Sources are folded, not removed; the status note stays visible outside the fold.
const fold=html.match(/<details class="fb-sources-fold" id="sources-fold">([\s\S]*?)<\/details>/);
assert(fold&&(fold[1].match(/<article>/g)||[]).length===4,'all four sources live inside the fold');
for(const part of ['bmj.g7257','body-weight-planner','bmjsem-2024-002363','nccih.nih.gov'])assert(fold[1].includes(part),`${part} still listed`);
assert(!fold[1].includes('fb-source-disclaimer')&&html.includes('Формальний Claim/EVR-перегляд матеріалу ще не завершено'),'the preliminary-review note stays visible');
assert(js.includes('sources-fold')&&js.includes('a[href="#sources"]'),'links to #sources open the fold');
// Readable text: nothing under 12px, headings use the site serif, mobile cards scroll sideways instead of stacking.
assert(!/font-size:(9|10|11)px/.test(css),'no text under 12px');
assert(pine.includes('--pine-serif')&&pine.includes('scroll-snap-type:x mandatory'),'serif headings and swipeable practice cards');
assert(!/https?:\/\//.test(pine),'no third-party requests');
console.log('Fat Burning Lab: pine system, own uroko motif, folded sources, 12px floor passed.');
