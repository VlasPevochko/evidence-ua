import assert from 'node:assert/strict';
import fs from 'node:fs';
import {articleBarHTML} from '../src/platform/shell.mjs';

// Owner request 2026-10-21: dossiers on the home page show the shared site header, not the old tools block.
const html = fs.readFileSync('dist/index.html', 'utf8'), css = fs.readFileSync('dist/home-article.css', 'utf8'), shell = fs.readFileSync('src/platform/shell.mjs', 'utf8');
assert(html.includes('<link rel="stylesheet" href="./home-article.css?v=1">'));
// The router keeps .page (and its site header) visible in article mode instead of hiding the whole page.
// 2026-11-17 (docs/HOME_SPLIT_PLAN.md, етап 2): розбори добавок мають власні сторінки; головна більше не показує розбір у себе, а переводить стару адресу на сторінку розбору.
// Шапку над розбором тепер лишає розмітка сторінки розбору: <main class="page" data-article-mode> з одним <header>.
assert(html.includes("if(to){location.replace(to);return;}")&&html.includes("page.style.setProperty('display','var(--home-layout, block)','important');page.removeAttribute('data-article-mode');"));
assert(/<main class="page" data-article-mode><header class="home-header">[\s\S]*?<\/header><\/main>/.test(fs.readFileSync('dist/creatine.html','utf8')),'a review page keeps only the site header of the home <main>');
assert(!html.includes("page.style.setProperty('display',view?'none'"), 'The old router hid the site header');
// Opening a whole dossier starts at the top so the header is visible; inner anchors keep their scroll.
// (Розбір тепер окрема сторінка й відкривається згори сам; внутрішні якорі працюють як звичайні якорі сторінки.)
for (const rule of ['.page[data-article-mode]>:not(.eua-site-header){display:none!important}', '.page[data-article-mode]::before,.page[data-article-mode]::after{display:none!important}', 'section[id^="supplement-"]>.d-top{display:none!important}'])
  assert(css.includes(rule), 'Missing article CSS: ' + rule);
// One slim bar: back to the catalogue and sharing tools; no duplicate search (the header has it), no retired navigation.
const bar = articleBarHTML();
assert(bar.includes('href="./supplements.html">← Усі добавки</a>') && bar.includes('data-eua-tool="share"'));
assert(!bar.includes('data-eua-tool="search"') && !bar.includes('Напрями Evidence UA'));
assert(shell.includes("bar.className='eua-article-bar'") && shell.includes("targets.filter(t=>!t.prepend)"), 'Dossiers get the bar; page headers keep the shared navigation');
assert(fs.readFileSync('src/platform/quick-tools.mjs', 'utf8').includes('.eua-article-bar'), 'Copy-link status shows inside the bar');
assert(!/https?:\/\//.test(css), 'No third-party requests');
console.log('Article header: site header kept, top on open, slim catalogue bar, retired tools block gone passed.');
