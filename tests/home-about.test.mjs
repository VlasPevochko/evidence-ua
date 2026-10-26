// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Owner decision 2026-10-19: routes, overview and feedback sit in one folded «Про сайт» group on the home page.
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-about.css','utf8'),js=fs.readFileSync('dist/home-about.js','utf8');
const group=html.match(/<details class="home-about" id="home-about">([\s\S]*?)<\/details> <p class="start-status">/);
assert(group,'The group wraps the three blocks and ends before the status note');
assert(!/<details class="home-about"[^>]*\sopen/.test(html),'The group starts folded');
for(const id of ['home-learning-paths','home-overview','home-feedback'])assert(group[1].includes(`id="${id}"`),`${id} stays inside the group with its id`);
const status='Статус наукового перегляду та межі пояснення вказано в кожному матеріалі.';
assert(html.includes(`<p class="start-status">${status}</p>`)&&!group[1].includes('start-status'),'The science status note stays visible outside the fold');
assert(html.includes('home-about.css?v=4')&&html.includes('home-about.js?v='),'Styles and script are wired');
assert(js.includes('MutationObserver')&&js.includes('hashchange'),'The group opens when a nested block is opened by script or by an anchor');
assert(/min-height:60px/.test(css)&&!/https?:\/\//.test(css+js),'Touch target and no third-party requests');
// The share tool is mounted inside the group by the shell, so no loose button remains under the cards.
const shell=fs.readFileSync('dist/platform-shell.js','utf8');
assert(shell.includes(".home-about-body")&&html.includes('platform-shell.js?v=99'),'The shell mounts the home tools inside the folded group');
console.log('Home «Про сайт» group: folded, ids kept, status note visible, auto-opens for nested anchors passed.');
