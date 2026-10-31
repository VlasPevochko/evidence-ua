import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {normalize,resolveTheme,applyAppearance,earlyScript,APPEARANCE_KEY,THEMES,SIZES,PALETTES} from '../src/platform/appearance.mjs';

// «Вигляд»: світла тема й розмір тексту (рішення власника 2026-10-19). Вибір лишається тільки в браузері.
assert.equal(APPEARANCE_KEY,'eua-appearance-v1');
// 2026-10-31 (рішення власника): сайт у космічній палітрі як головна, зелений лишається варіантом. Тому до налаштувань додано palette,
// а за замовчуванням (немає запису) це 'cosmic'. Раніше очікувалося {theme,text} без кольору.
assert.deepEqual(normalize(null),{theme:'dark',text:'md',palette:'cosmic'},'no record gives the dark cosmic look');
assert.deepEqual(normalize('{'),{theme:'dark',text:'md',palette:'cosmic'});
assert.deepEqual(normalize(JSON.stringify({theme:'light',text:'xl'})),{theme:'light',text:'xl',palette:'cosmic'},'a record saved before the palette existed keeps its theme and size and gets the cosmic default');
assert.deepEqual(normalize(JSON.stringify({theme:'light',text:'lg',palette:'green'})),{theme:'light',text:'lg',palette:'green'},'green stays available');
assert.deepEqual(normalize(JSON.stringify({theme:'<script>',text:'huge',palette:'red'})),{theme:'dark',text:'md',palette:'cosmic'},'unknown values are ignored');
assert.deepEqual(PALETTES.map(([k])=>k),['cosmic','green'],'the palette choice is cosmic or green');
assert.equal(resolveTheme('auto',true),'light');assert.equal(resolveTheme('auto',false),'dark');assert.equal(resolveTheme('dark',true),'dark');assert.equal(resolveTheme('light',false),'light');
assert.equal(THEMES.length,3);assert.equal(SIZES.length,3);

// The early script runs before paint: it only sets data attributes (theme, text, palette) and never throws.
function run(stored,prefersLight){
  const dataset={},store=stored===undefined?{}:{[APPEARANCE_KEY]:stored};
  vm.runInNewContext(earlyScript,{localStorage:{getItem:k=>store[k]??null},matchMedia:()=>({matches:prefersLight}),document:{documentElement:{dataset}}});
  return dataset;
}
assert.deepEqual(run(undefined,true),{},'first visit: dark, even if the system prefers light');
assert.deepEqual(run(JSON.stringify({theme:'light',text:'lg'}),false),{theme:'light',text:'lg'});
assert.deepEqual(run(JSON.stringify({theme:'auto',text:'md'}),true),{theme:'light'});
assert.deepEqual(run('{broken',true),{},'a broken record never breaks the page');
assert.deepEqual(run(JSON.stringify({theme:'dark',text:'md',palette:'green'}),false),{palette:'green'},'green palette is set before the first paint');
assert.deepEqual(run(JSON.stringify({theme:'light',text:'xl',palette:'green'}),false),{theme:'light',text:'xl',palette:'green'});
assert.deepEqual(run(JSON.stringify({palette:'cosmic'}),false),{},'cosmic is the default: no attribute');
assert.deepEqual(run(JSON.stringify({palette:'<img>'}),false),{},'an unknown palette value is ignored');

// applyAppearance toggles data-palette on <html>; the choice never touches other attributes.
function fakeDoc(){const dataset={};return {documentElement:{dataset},defaultView:{matchMedia:()=>({matches:false})},querySelector:()=>null,dataset};}
{const d=fakeDoc();
 applyAppearance(d,{theme:'dark',text:'md',palette:'green'});assert.equal(d.dataset.palette,'green');
 applyAppearance(d,{theme:'dark',text:'md',palette:'cosmic'});assert.equal('palette' in d.dataset,false,'switching back to cosmic removes the attribute');}

// Every page loads the stylesheet, the early script and the module.
const pages=fs.readdirSync('dist').filter(f=>f.endsWith('.html'));
assert(pages.length>=12);
for(const f of pages){const h=fs.readFileSync('dist/'+f,'utf8');
  assert(h.includes('appearance.css?v=')&&h.includes('appearance.js?v=')&&h.includes(earlyScript),`${f} must carry the appearance head block`);
  assert.equal(h.split('eua-appearance-v1').length-1,1,`${f}: the block must not be duplicated`);}
// Космічна палітра: усі сторінки, крім головної (у неї власні стилі), підключають palette-cosmic.css один раз і ПЕРЕД appearance.css,
// щоб токени були визначені до решти правил. Головна її не підключає й лишається як була.
for(const f of pages){const h=fs.readFileSync('dist/'+f,'utf8');
  const count=h.split('palette-cosmic.css').length-1;
  if(f==='index.html'){assert.equal(count,0,'the home page keeps its own look and never loads the palette file');continue;}
  assert.equal(count,1,`${f} must load palette-cosmic.css exactly once`);
  assert(h.indexOf('palette-cosmic.css')<h.indexOf('appearance.css'),`${f}: the palette file comes before appearance.css`);}
const css=fs.readFileSync('dist/appearance.css','utf8');
for(const rule of ['html[data-theme="light"]{filter:invert(1) hue-rotate(180deg)','html[data-text="lg"]{zoom','html[data-text="xl"]{zoom','img,video,picture,iframe','home-geo-hero','min-height:44px'.replace('min-height:44px','width:44px;height:44px')])assert(css.includes(rule),`CSS must contain: ${rule}`);
assert(!/https?:\/\//.test(css+fs.readFileSync('dist/appearance.js','utf8')),'no third-party requests');
assert(fs.readFileSync('src/platform/appearance.mjs','utf8').includes('composedPath'),'outside-click detection survives the panel being rebuilt');
console.log('Appearance: safe read-back, early script, wiring on every page passed.');
