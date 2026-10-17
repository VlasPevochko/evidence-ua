import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// The "muscles" Atlas zone is a navigation beta: it links existing materials and the exercise library
// and adds no scientific claims of its own. These checks keep it that way.
const js = fs.readFileSync('dist/atlas.js', 'utf8');
const css = fs.readFileSync('dist/atlas.css', 'utf8');
const html = fs.readFileSync('dist/atlas.html', 'utf8');

assert(/muscles:\{title:'М’язова система'[^}]*state:'Бета',stateKey:'beta'\}/.test(js), 'The muscles zone is a Beta module');
for (const zone of ['brain', 'spine', 'gut']) assert(new RegExp(`${zone}:\\{[^}]*state:'Готується',stateKey:'planned'`).test(js), `${zone} stays planned`);

// The block under test: musclesContent.
const start = js.indexOf('const musclesContent={');
const end = js.indexOf('function previewContent');
assert(start > 0 && end > start, 'musclesContent block exists');
const block = js.slice(start, end);
for (const tab of ['overview', 'anatomy', 'training', 'research']) assert(new RegExp(`\\n ${tab}:\\(\\)=>`).test(block), `muscles has a ${tab} tab`);
for (const tab of ['symptoms', 'rehab']) assert(!new RegExp(`\\n ${tab}:\\(\\)=>`).test(block), `${tab} stays "Готується" until it can be backed by Claims`);
assert(/musclesContent\[tab\]\(\)/.test(js) && /zone==='muscles'/.test(js), 'The zone is routed to its content');

// Wording rules (implementation pack §11 and the Atlas safety stance).
const forbidden = ['виправляє поставу', 'лікує біль', 'прибирає защемлення', 'запобігає травмам', 'найкраща вправа', 'ідеальна техніка'];
for (const phrase of forbidden) assert(!block.toLocaleLowerCase('uk').includes(phrase), `Forbidden wording: ${phrase}`);
assert(block.includes('не ставить діагнозів') && block.includes('не завершено'), 'Overview states the limits and the review status');

// Every static link resolves to a real page and, where given, a real anchor.
const links = [...block.matchAll(/href[=:]\s*["'](\.\/[^"'#?]+)(?:\?[^"'#]*)?(?:#([^"']+))?["']/g)].map(m => ({file: m[1].slice(2), anchor: m[2]}));
assert(links.length >= 8, 'The zone links to the existing materials');
for (const {file, anchor} of links) {
  const target = path.join('dist', file);
  assert(fs.existsSync(target), `Link target missing: ${file}`);
  // These anchors are created by the page script at runtime (same list as scripts/smoke-check.mjs); browser QA opens them.
  const runtimeAnchors = {'muscle-lab.html': ['contraction', 'growth', 'atrophy']}[file] || [];
  if (anchor && file.endsWith('.html') && !runtimeAnchors.includes(anchor)) assert(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), `Anchor #${anchor} missing in ${file}`);
}

// Deep link: ?zone= is honoured only for known zones.
assert(/new URLSearchParams\(location\.search\)\.get\('zone'\)/.test(js));
assert(/Object\.prototype\.hasOwnProperty\.call\(zoneMeta,requestedZone\)/.test(js), 'Unknown zones are ignored (no prototype keys)');

// Related practice is data-driven and cannot break the Atlas: dynamic import with a fallback.
assert(/import\('\.\/exercises-data\.js\?v=\d+'\)/.test(js), 'Practice list is loaded lazily');
assert(!/^import /m.test(js), 'No static import: a failed data load must not take the whole Atlas down');
assert(/catch\{[\s\S]*atlas-practice-more|catch\{\s*if\(box\.isConnected\)/.test(js), 'A failed load leaves a link to the library');
assert(!/related\.map\(.*innerHTML|innerHTML=.*item\./.test(js), 'Exercise data is not injected as HTML');
for (const rule of ['.atlas-practice', '.atlas-practice-list']) assert(css.includes(rule), `Styles for ${rule}`);
assert(/atlas\.js\?v=\d+/.test(html) && /atlas\.css\?v=\d+/.test(html), 'Atlas assets are versioned');

// Exercises tagged for the zone exist (the list is not empty).
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-muscles-'));
fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"module"}');
fs.copyFileSync('dist/exercises-data.js', path.join(temp, 'exercises-data.js'));
const {exercises} = await import(pathToFileURL(path.join(temp, 'exercises-data.js')).href);
const related = exercises.filter(e => e.atlasZones.includes('muscles'));
assert(related.length >= 3, 'The muscles zone has related practice');
fs.rmSync(temp, {recursive: true, force: true});

console.log(`Atlas muscles zone: Beta navigation hub, ${links.length} verified links, ${related.length} related exercises, safe wording and failure isolation passed.`);
