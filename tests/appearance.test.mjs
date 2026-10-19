import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {normalize,resolveTheme,earlyScript,APPEARANCE_KEY,THEMES,SIZES} from '../src/platform/appearance.mjs';

// «Вигляд»: світла тема й розмір тексту (рішення власника 2026-10-19). Вибір лишається тільки в браузері.
assert.equal(APPEARANCE_KEY,'eua-appearance-v1');
assert.deepEqual(normalize(null),{theme:'dark',text:'md'},'no record keeps the current dark look');
assert.deepEqual(normalize('{'),{theme:'dark',text:'md'});
assert.deepEqual(normalize(JSON.stringify({theme:'light',text:'xl'})),{theme:'light',text:'xl'});
assert.deepEqual(normalize(JSON.stringify({theme:'<script>',text:'huge'})),{theme:'dark',text:'md'},'unknown values are ignored');
assert.equal(resolveTheme('auto',true),'light');assert.equal(resolveTheme('auto',false),'dark');assert.equal(resolveTheme('dark',true),'dark');assert.equal(resolveTheme('light',false),'light');
assert.equal(THEMES.length,3);assert.equal(SIZES.length,3);

// The early script runs before paint: it only sets two data attributes and never throws.
function run(stored,prefersLight){
  const dataset={},store=stored===undefined?{}:{[APPEARANCE_KEY]:stored};
  vm.runInNewContext(earlyScript,{localStorage:{getItem:k=>store[k]??null},matchMedia:()=>({matches:prefersLight}),document:{documentElement:{dataset}}});
  return dataset;
}
assert.deepEqual(run(undefined,true),{},'first visit: dark, even if the system prefers light');
assert.deepEqual(run(JSON.stringify({theme:'light',text:'lg'}),false),{theme:'light',text:'lg'});
assert.deepEqual(run(JSON.stringify({theme:'auto',text:'md'}),true),{theme:'light'});
assert.deepEqual(run('{broken',true),{},'a broken record never breaks the page');

// Every page loads the stylesheet, the early script and the module.
const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html'));
assert(pages.length>=12);
for(const f of pages){const h=fs.readFileSync('dist/'+f,'utf8');
  assert(h.includes('appearance.css?v=')&&h.includes('appearance.js?v=')&&h.includes(earlyScript),`${f} must carry the appearance head block`);
  assert.equal(h.split('eua-appearance-v1').length-1,1,`${f}: the block must not be duplicated`);}
const css=fs.readFileSync('dist/appearance.css','utf8');
for(const rule of ['html[data-theme="light"]{filter:invert(1) hue-rotate(180deg)','html[data-text="lg"]{zoom','html[data-text="xl"]{zoom','img,video,picture,iframe','home-geo-hero','min-height:44px'.replace('min-height:44px','width:44px;height:44px')])assert(css.includes(rule),`CSS must contain: ${rule}`);
assert(!/https?:\/\//.test(css+fs.readFileSync('dist/appearance.js','utf8')),'no third-party requests');
assert(fs.readFileSync('src/platform/appearance.mjs','utf8').includes('composedPath'),'outside-click detection survives the panel being rebuilt');
console.log('Appearance: safe read-back, early script, wiring on every page passed.');
