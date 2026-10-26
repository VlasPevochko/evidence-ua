// muscle-lab.css 73 -> 74 (2026-10-26): styles for the outcome Claims and their drawer in the guide.
// muscle-lab.css 72 -> 73 (2026-10-26): styles for the «Від нерва до росту» chapters (tests/muscle-guide.test.mjs); on a phone the related links are two columns to keep the page short.
// muscle-lab.css 71 -> 72: pine surfaces and the take title band (page-pine.css).
// muscle-lab.css bumped 70 -> 71: accent colours snapped to the shared gold/cyan set (cache busting).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {structures,topics,sources,visual,moduleMeta,topicClaimIds} from '../dist/muscle-lab-data.js';
import {renderTopics,structureContent,renderScaleButtons,renderLegend,adjacentStructure} from '../dist/muscle-lab.js';
import {sceneFrame} from '../dist/muscle-lab-scenes.js';
import {scaleArt,scaleArtIds,scaleLegend} from '../dist/muscle-scale-art.js';
import {sarcomereSVG,sarcomereState,GEOMETRY} from '../dist/muscle-sarcomere.js';
const html=fs.readFileSync('dist/muscle-lab.html','utf8'),css=fs.readFileSync('dist/muscle-lab.css','utf8');

// Data links (science itself is frozen in muscle-flow.test.mjs).
assert.equal(structures.length,6);assert.equal(topics.length,3);assert.equal(new Set(structures.map(s=>s.id)).size,6);
for(const item of [...structures,...topics])for(const id of item.sourceIds)assert(sources.some(s=>s.id===id));
assert(moduleMeta.status.includes('не завершено'));assert(visual.simplified);assert.deepEqual(visual.claimIds,structures.map(s=>s.claimId));
assert(!/художн|webp/i.test(visual.simplificationNote),'The note must describe the schematic drawings, not the retired raster');
assert(structureContent(structures[5],'function','advanced').includes('від’єднує'));assert(structureContent(structures[0],'sources','school').includes('openstax.org'));
assert(fs.readFileSync('dist/navigation-v17.js','utf8').includes("'./muscle-lab.html'"));

// Page structure: one scale control, no reading-level switcher, no stale art overlay.
for(const id of ['explorer','model-view','structure-explanation','scales','scale-art','scale-legend','structure-title','structure-copy','art-selection','topics','muscle-evidence','claim-list','sources','source-list','review-meta','visual-note','eua-evidence-dialog'])assert(html.includes(`id="${id}"`),`Missing #${id}`);
for(const gone of ['data-level','reading-level','art-hotspots','art-key','viewer-navigation','model-jumps','lab-route','sarcomere-view','structure-link'])assert(!html.includes(gone),`Retired control still in the page: ${gone}`);
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert.equal((html.match(/<header\b/g)||[]).length,1,'The shared shell injects navigation after every <header>: only the page header may use that tag');
assert(html.includes('Механістичні пояснення не встановлюють величину ефекту у людей'));
assert(html.includes('muscle-lab.js?v=71')&&html.includes('muscle-lab.css?v=74'));
const rendered=renderTopics('university');
assert(!/<header\b/.test(rendered),'Topic markup must not use <header> (the shell would inject duplicate navigation)');
assert(!/data-level|reading-level/.test(rendered));

// Scale buttons, drawings and legends.
assert.deepEqual(scaleArtIds,structures.map(s=>s.id),'One drawing per structure, in scale order');
const buttons=renderScaleButtons(structures[2].id);
assert.equal((buttons.match(/data-structure=/g)||[]).length,6);assert(buttons.includes(`data-structure="${structures[2].id}" aria-pressed="true"`));
for(const s of structures){
 const art=scaleArt(s.id);
 assert(art.startsWith('<svg')&&art.includes('role="img"')&&/aria-label="[^"]{20,}"/.test(art),`Accessible drawing: ${s.id}`);
 assert(!art.includes('<text'),`Labels live in the HTML legend, not in the drawing: ${s.id}`);
 assert(scaleLegend[s.id].length>=3&&renderLegend(s.id).includes('<li>'));
}
assert.throws(()=>scaleArt('UNKNOWN'),/Unknown scale/);

// Sarcomere geometry: filaments keep their length, only overlap changes.
const rest=sarcomereState(0),end=sarcomereState(1);
assert.equal(rest.relative.aBand,1);assert.equal(end.relative.aBand,1);
assert.equal(rest.myosinRight-rest.myosinLeft,GEOMETRY.myosinLength);assert.equal(end.myosinRight-end.myosinLeft,GEOMETRY.myosinLength);
assert.equal(rest.actinLeftTip-rest.zLeft,GEOMETRY.actinLength);assert.equal(end.actinLeftTip-end.zLeft,GEOMETRY.actinLength);
let previous=sarcomereState(0);
for(let i=1;i<=20;i++){
 const state=sarcomereState(i/20);
 assert(state.length<previous.length,'Z-discs approach monotonically');
 assert(state.relative.overlap>=previous.relative.overlap,'Overlap never decreases while contracting');
 assert(state.relative.hZone<=previous.relative.hZone);
 previous=state;
}
assert(end.relative.overlap>rest.relative.overlap&&end.relative.sarcomere<1&&end.relative.hZone===0);
assert.deepEqual([sarcomereState(-5).t,sarcomereState(9).t,sarcomereState('x').t],[0,1,0],'Out-of-range input is clamped');
assert.notEqual(sarcomereSVG({t:0}),sarcomereSVG({t:1}));
assert(sarcomereSVG({t:.5}).includes('data-sarcomere-t="0.5"'));
for(const part of ['sc-zdisc','sc-actin','sc-myosin','sc-heads','sc-mline'])assert(sarcomereSVG({t:0}).includes(part));

// Scenes: drawn once, step is a data attribute; text inside drawings is limited to Ca²⁺ and ATP.
for(const id of ['contraction','growth','atrophy']){
 const initial=sceneFrame(id);
 assert(initial.includes('role="img"')&&initial.includes('data-step="-1"'));
 for(let i=0;i<4;i++){
  const frame=sceneFrame(id,i);
  assert(frame.includes(`data-step="${i}"`));
  assert.equal(frame.replace(`data-step="${i}"`,'data-step="-1"'),initial,'Steps differ only by the data attribute, so CSS can animate them');
 }
 const words=[...sceneFrame(id).matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);
 assert(words.every(w=>['Ca²⁺','ATP'].includes(w)),`Unexpected text in the ${id} drawing: ${words}`);
 assert(css.includes(`.scene-${id}[data-step="3"]`)||id==='contraction'&&css.includes('.scene-contraction[data-step="3"]'),`CSS states for ${id}`);
}
assert.throws(()=>sceneFrame('unknown'),/Unknown scene/);assert.throws(()=>sceneFrame('growth',9),/Invalid storyboard/);assert.throws(()=>sceneFrame('growth',1.5),/Invalid storyboard/);

// Topics: contraction cycle, shared mirror for growth and atrophy.
for(const level of ['school','university','advanced']){const out=renderTopics(level);for(const t of topics){assert(out.includes(t[level]));assert(out.includes(`data-claim-open="${topicClaimIds[t.id]}"`));assert(out.includes(`id="${t.id}"`));assert(out.includes(`data-topic-scene="${t.id}"`));}}
assert.equal((rendered.match(/data-step-topic="contraction"/g)||[]).length,4);
assert.equal((rendered.match(/data-mirror-step=/g)||[]).length,4);
for(const marker of ['data-play="contraction"','data-reset="contraction"','data-sarcomere-play','data-mirror-play','data-mirror-show="growth"','data-mirror-show="atrophy"','id="shortening"','id="adaptation"','data-mirror-view="growth"'])assert(rendered.includes(marker),`Missing ${marker}`);
assert(rendered.includes('Нитки не вкорочуються'),'Contraction states sliding, not shortening of filaments');
assert(!/data-step-topic="(growth|atrophy)"/.test(rendered),'Growth and atrophy share one stepper');
assert.equal((rendered.match(/data-claim-open=/g)||[]).length,3,'One evidence button per topic');

// CSS: reduced motion, touch targets, phone layout and the states the scenes rely on.
for(const key of ['prefers-reduced-motion','min-height:44px','height:100dvh','max-width:760px','.cy-head','.ad-beam','.mirror[data-mirror-view="growth"] .topic-atrophy','.scale-btn[aria-pressed=true]'])assert(css.includes(key),`CSS missing ${key}`);
assert(css.includes('.muscle-claims,.related-grid{grid-template-columns:minmax(0,1fr)}'));
assert(!/art-hotspot|\.reading-level|\.levels\b/.test(css),'No styles for retired controls');

assert.equal(adjacentStructure(structures[0].id,-1).id,structures[0].id);
assert.equal(adjacentStructure(structures[5].id,1).id,structures[5].id);
assert.throws(()=>adjacentStructure('unknown',1),/Unknown structure/);
console.log('Muscle Lab: one scale control, six own drawings with HTML legends, sarcomere geometry (fixed filaments, growing overlap), single-attribute scenes, shared growth/atrophy stepper, no duplicate navigation and honest review status passed. Browser verification is in Browser QA.');
