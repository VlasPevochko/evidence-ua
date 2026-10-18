import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildSpineLayout, curveZ, REGIONS, REGION_COLORS} from '../src/spine/layout.mjs';

// Spine zone = Stage 0 of docs/SPINE_AND_PERSONAL_GUIDANCE_BACKLOG.md: education and safety first,
// a schematic 3D model, no pain map, no conclusions from a pointed spot.
const atlas = fs.readFileSync('dist/atlas.js', 'utf8');
const css = fs.readFileSync('dist/atlas.css', 'utf8');
const html = fs.readFileSync('dist/atlas.html', 'utf8');
const hub = fs.readFileSync('dist/atlas-spine.js', 'utf8');
const viewerSource = fs.readFileSync('src/spine/viewer.mjs', 'utf8');
const bundle = fs.readFileSync('dist/spine-viewer.js', 'utf8');

// --- Layout (pure geometry) ---------------------------------------------------------
const layout = buildSpineLayout();
assert.equal(layout.vertebrae.length, 24, '7 cervical + 12 thoracic + 5 lumbar vertebrae');
assert.deepEqual(REGIONS.map(r => [r.id, r.count]), [['cervical', 7], ['thoracic', 12], ['lumbar', 5], ['sacral', 6]]);
for (const region of ['cervical', 'thoracic', 'lumbar']) {
  assert.equal(layout.vertebrae.filter(v => v.region === region).length, REGIONS.find(r => r.id === region).count);
}
assert.deepEqual(layout.vertebrae.map(v => v.id).slice(0, 3), ['C1', 'C2', 'C3']);
assert.equal(layout.vertebrae[6].id, 'C7'); assert.equal(layout.vertebrae[7].id, 'T1'); assert.equal(layout.vertebrae[18].id, 'T12'); assert.equal(layout.vertebrae[19].id, 'L1'); assert.equal(layout.vertebrae[23].id, 'L5');
assert.equal(layout.coccyx.length, 3); assert.equal(layout.discs.length, 24);
const ys = layout.vertebrae.map(v => v.y);
assert(ys.every((y, i) => i === 0 || y < ys[i - 1]), 'Vertebrae descend from C1 to L5');
assert(layout.sacrum.y < ys.at(-1) && layout.coccyx[0].y < layout.sacrum.y, 'Sacrum and coccyx come below L5');
const meanWidth = region => layout.vertebrae.filter(v => v.region === region).reduce((sum, v) => sum + v.width, 0) / REGIONS.find(r => r.id === region).count;
assert(meanWidth('cervical') < meanWidth('thoracic') && meanWidth('thoracic') < meanWidth('lumbar'), 'Vertebrae grow larger downwards');
const zAt = id => layout.vertebrae.find(v => v.id === id).z;
assert(zAt('C4') > zAt('C1') - 0.5 && zAt('C4') > zAt('T6'), 'Cervical lordosis is convex to the front relative to the thoracic curve');
assert(zAt('T6') < zAt('C4') && zAt('T6') < zAt('L3'), 'Thoracic kyphosis is convex to the back');
assert(zAt('L3') > zAt('T12') && zAt('L3') > zAt('T6'), 'Lumbar lordosis is convex to the front');
for (let y = 0; y > -62; y -= 0.5) assert(Math.abs(curveZ(y) - curveZ(y - 0.5)) < 0.5, 'The curve is smooth');
assert.equal(Object.keys(REGION_COLORS).sort().join(), 'cervical,lumbar,sacral,thoracic');

// --- Zone content and wording --------------------------------------------------------------
assert(/spine:\{title:'Хребет'[^}]*state:'Бета',stateKey:'beta'\}/.test(atlas), 'The spine zone is a Beta module');
const start = atlas.indexOf('const spineContent={');
const end = atlas.indexOf('function previewContent');
assert(start > 0 && end > start);
const block = atlas.slice(start, end);
for (const tab of ['overview', 'anatomy', 'symptoms', 'training']) assert(new RegExp(`\\n ${tab}:\\(\\)=>`).test(block), `spine has a ${tab} tab`);
for (const tab of ['rehab', 'research']) assert(!new RegExp(`\\n ${tab}:\\(\\)=>`).test(block), `${tab} stays "Готується"`);
assert(/spineContent\[tab\]\(\)/.test(atlas) && /zone==='spine'/.test(atlas));

const forbidden = ['виправляє поставу', 'лікує біль', 'прибирає защемлення', 'запобігає травмам', 'найкраща вправа', 'ідеальна техніка', 'ваш діагноз', 'у вас', 'можлива причина'];
for (const text of [block, hub]) for (const phrase of forbidden) assert(!text.toLocaleLowerCase('uk').includes(phrase), `Forbidden wording: ${phrase}`);

// Safety text is static (not behind a lazy import) and comes before the practice.
assert(block.includes('Коли звернутися по медичну допомогу'));
for (const flag of ['оніміння', 'слабкість', 'нетримання', 'травми', 'температурою', 'втрата ваги', 'вночі', 'біль у грудях']) assert(block.includes(flag), `Red flag missing: ${flag}`);
assert(block.includes('Точка болю не дорівнює джерелу болю'));
assert(block.includes('не ставить діагнозів') && block.includes('редакційна чернетка'));
const training = block.slice(block.indexOf(' training:()=>'));
assert(training.indexOf('data-goto-tab="symptoms"') !== -1 && training.indexOf('data-goto-tab="symptoms"') < training.indexOf('data-related-practice'), 'Safety link precedes the practice list in the training tab');
assert(training.includes('не персональні призначення') && training.includes('не підбираються за місцем болю'));
assert(!/pain-map|painMap|hotspot/i.test(block + hub), 'No pain map or hotspot logic in the spine zone');
// Exercises are not picked from a pointed spot: the related list is generic per zone.
assert(!/selected.*exercises|exercises.*selected/.test(hub), 'The region choice does not filter or recommend exercises');

// Failure isolation: lazy import with fallback; the safety text does not depend on it.
assert(/import\('\.\/atlas-spine\.js\?v=\d+'\)/.test(atlas) && !/^import /m.test(atlas));
assert(/Не вдалося завантажити інтерактивний розділ/.test(atlas), 'Fallback text exists');
assert(/import\('\.\/spine-viewer\.js\?v=\d+'\)/.test(hub), '3D loads only on demand');
assert(/launch\.addEventListener\('click', showViewer\)/.test(hub), 'The viewer starts only after an explicit click');
assert(/WebGL/.test(hub) && /hideViewer\(/.test(hub), 'Without WebGL the text path still works');
assert(!/innerHTML/.test(hub + viewerSource), 'Data is never injected as HTML in the new modules');

// Region texts agree with the geometry.
const regionsInHub = [...hub.matchAll(/id: '(\w+)', title: '([^']+)', range: '([^']+)', count: (\d+)/g)].map(m => [m[1], m[3], Number(m[4])]);
assert.deepEqual(regionsInHub, REGIONS.map(r => [r.id, r.range, r.count]), 'atlas-spine.js regions match the layout');
for (const [id, color] of Object.entries(REGION_COLORS)) assert(hub.toLowerCase().includes(`color: '#${color.toString(16)}'`), `Legend colour for ${id} matches the model`);
assert(hub.includes('не анатомічно точна'), 'The model is labelled as schematic');

// --- Bundle: self-hosted, licensed, no network ---------------------------------------------
assert(/MIT/.test(bundle.slice(0, 400)) && bundle.includes('SPDX-License-Identifier: MIT'), 'three.js licence notice is kept in the bundle');
assert(fs.readFileSync('dist/spine-viewer.LICENSE.txt', 'utf8').includes('MIT License'), 'Licence text ships with the bundle');
// Only an XML namespace (createElementNS) and a paper reference inside a shader comment may appear; neither is requested.
const addresses = [...bundle.matchAll(/https?:\/\/[^\s"'`)]*/g)].map(m => m[0]);
assert(addresses.every(url => url === 'http://www.w3.org/1999/xhtml' || url.startsWith('https://jcgt.org/')), `Unexpected address in the bundle: ${addresses.join(', ')}`);
assert(!/\bfetch\(|XMLHttpRequest|sendBeacon|importScripts/.test(bundle), 'The bundle makes no network calls');
assert(fs.statSync('dist/spine-viewer.js').size < 700_000, 'The bundle stays below 700 KB');
assert(/export\{[^}]*mountSpineViewer/.test(bundle), 'The bundle exports mountSpineViewer');
assert(/from 'three'/.test(viewerSource) && !/https?:\/\//.test(viewerSource), 'Source imports the pinned local package only');
const buildPackage = JSON.parse(fs.readFileSync('scripts/spine-viewer/package.json', 'utf8'));
assert.equal(buildPackage.devDependencies.three, '0.186.1', 'three.js is pinned exactly');
assert(/^\d+\.\d+\.\d+$/.test(buildPackage.devDependencies.esbuild), 'esbuild is pinned exactly');
const lock = JSON.parse(fs.readFileSync('scripts/spine-viewer/package-lock.json', 'utf8'));
assert(lock.packages['node_modules/three'].integrity.startsWith('sha512-'), 'The lockfile pins three.js by hash');

// --- Page wiring ----------------------------------------------------------------------------
for (const rule of ['.atlas-alert', '.spine-hub', '.spine-viewer-box', '.spine-region-btn', '.atlas-link-button']) assert(css.includes(rule), `Style missing: ${rule}`);
assert(/atlas\.js\?v=\d+/.test(html) && /atlas\.css\?v=\d+/.test(html));
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spine-zone-'));
fs.writeFileSync(path.join(tempDir, 'package.json'), '{"type":"module"}');
fs.copyFileSync('dist/exercises-data.js', path.join(tempDir, 'exercises-data.js'));
const {exercises} = await import(pathToFileURL(path.join(tempDir, 'exercises-data.js')).href);
assert(exercises.filter(e => e.atlasZones.includes('spine')).length >= 3, 'The spine zone has related practice');
fs.rmSync(tempDir, {recursive: true, force: true});

console.log(`Spine zone: Beta hub, 24 vertebrae + sacrum + coccyx, red flags before practice, static safety text, lazy self-hosted 3D (${Math.round(fs.statSync('dist/spine-viewer.js').size / 1024)} KB) passed.`);
