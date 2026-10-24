import assert from 'node:assert/strict';
import fs from 'node:fs';
import {articleBarHTML} from '../src/platform/shell.mjs';

// Owner request 2026-10-21: dossiers on the home page show the shared site header, not the old tools block.
const html = fs.readFileSync('dist/index.html', 'utf8'), css = fs.readFileSync('dist/home-article.css', 'utf8'), shell = fs.readFileSync('src/platform/shell.mjs', 'utf8');
assert(html.includes('<link rel="stylesheet" href="./home-article.css?v=1">'));
// The router keeps .page (and its site header) visible in article mode instead of hiding the whole page.
assert(html.includes("page.style.setProperty('display',view?'block':'var(--home-layout, block)','important');page.toggleAttribute('data-article-mode',!!view);"));
assert(!html.includes("page.style.setProperty('display',view?'none'"), 'The old router hid the site header');
// Opening a whole dossier starts at the top so the header is visible; inner anchors keep their scroll.
assert(html.includes("if(target&&target===view)requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}));"));
assert(html.includes("window.addEventListener('load',()=>{const t=document.getElementById(location.hash.slice(1));if(t&&views.includes(t))"));
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
