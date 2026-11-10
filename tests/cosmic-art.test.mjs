import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JOBS,cosmicSvg,tileOf} from '../scripts/build-svg-art.mjs';
import {plateRules} from '../scripts/build-palette.mjs';
import {plateOf,cosmicOf} from '../scripts/palette/cosmic-map.mjs';
import {parseColor,toHex} from '../scripts/palette/css-colors.mjs';
import {SVG_ATTR,plateSources} from '../scripts/palette/targets.mjs';

// Малюнки, плити й значки у фіолетовому стилі (рішення власника 2026-11-01: «все, де колір треба змінити під стиль, треба робити»).
// Принцип: змінюється оформлення (тла, плити, лінійні значки), а не дані. Кольори, на які посилається текст (золотий круг, золота нога моделі),
// мітки легенд, мітки болю, статуси й попередження лишаються. «Зелений» варіант показує все як було: для малюнків-файлів це оригінал.
const read=f=>fs.readFileSync(f,'utf8'),hex=lit=>toHex({...parseColor(lit),a:1});
const palette=read('dist/palette-cosmic.css'),pine=read('dist/page-pine.css'),extras=read('src/palette/cosmic-extras.css');

// 1) Космічні копії малюнків-SVG свіжі (збірка їх генерує) і змінюють лише те, що має змінюватись.
assert(JOBS.length>=7,'the SVG art jobs are listed');
for(const job of JOBS){
  const src=read('dist/'+job.src),dst=read('dist/'+job.dst);
  assert.equal(dst,cosmicSvg(src,job),`${job.dst} is stale: run node scripts/build-svg-art.mjs`);
  assert(dst.startsWith('<!-- Космічна копія '),`${job.dst} says it is generated`);
  const colours=svg=>[...svg.matchAll(/="(#[0-9a-fA-F]{6})"/g)].map(m=>m[1].toLowerCase());
  const [before,after]=[colours(src),colours(dst)];
  assert.equal(before.length,after.length,`${job.dst}: the same number of colours as ${job.src}`);
  const changed=before.filter((c,i)=>c!==after[i]);
  assert(changed.length>0,`${job.dst} recolours something`);
  if(job.only)for(const c of before)if(!job.only.includes(c)&&!(job.set&&job.set[c]))assert.equal(after[before.indexOf(c)],c,`${job.dst}: ${c} (food, plate, subject) stays as it was`);
  for(const keep of job.keep||[])assert(after.includes(keep),`${job.dst}: ${keep} (moon, wave) stays`);
}
// Плитки дієт: восьми різним тлам відповідають вісім різних фіолетових, їжа на тарілках не змінюється.
const diet=JOBS.find(j=>j.dst==='diet-art-cosmic.svg'),dietNew=read('dist/diet-art-cosmic.svg'),dietOld=read('dist/diet-art.svg');
const tileNew=c=>toHex({...tileOf(parseColor(c)),a:1});
for(const c of diet.only)assert(dietNew.includes(`"${tileNew(c)}"`)&&!dietNew.includes(`"${c}"`),`tile colour ${c} became ${tileNew(c)}`);
for(const food of ['#c75c4a','#f5bb91','#e3ac4b','#8cb96d','#447b58','#f5edda'])assert(dietNew.includes(`"${food}"`)&&dietOld.includes(`"${food}"`),`food colour ${food} is unchanged`);
const tileBackgrounds=['#29433d','#30424b','#3b4230','#263d42','#424036','#394334','#284639','#2c3d4d'].map(tileNew);
assert.equal(new Set(tileBackgrounds).size,8,'the eight tiles keep different backgrounds');
for(const t of tileBackgrounds){const {r,g,b}=parseColor(t);assert(b>g&&b>=r*.9,`tile ${t} is violet/indigo, not green`);}

// 2) Кожне місце, де сторінка показує такий малюнок, має пару: оригінал для «Зеленого» і фіолетову копію.
const pair=(html,original,cosmic,what)=>{
  assert(new RegExp(`<img src="\\./${original.replace(/[.?]/g,'\\$&')}"[^>]*data-art="green"[^>]*><img src="\\./${cosmic.replace(/[.?]/g,'\\$&')}"[^>]*data-art="cosmic"`).test(html),`${what}: the original (green) and its cosmic copy are a pair`);
};
const nutrition=read('dist/nutrition.html'),ids=[...dietOld.matchAll(/<view id="view-([a-z-]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,8,'eight diets in the sprite');
for(const id of ids)pair(nutrition,`diet-art.svg?v=87#view-${id}`,`diet-art-cosmic.svg?v=2#view-${id}`,`diet tile ${id}`);
pair(read('dist/sleep.html'),'home-sleep.svg','home-sleep-cosmic.svg','sleep hero');
const atlas=read('dist/atlas.html');
assert.match(atlas,/<img src="\.\/atlas-body-views\.webp" class="atlas-figure" alt=""/,'both Atlas palettes use the same anatomy illustration');
const directory=read('src/platform/directory.mjs'),directions=read('dist/directions.js');
for(const file of [directory,directions]){
  assert(file.includes('data-art="green"')&&file.includes('data-art="cosmic"')&&file.includes("artwork.replace(/\\.(svg|webp)$/,'-cosmic.$1')"),'directory thumbnails come in pairs');
}
for(const art of ['muscle-lab-art-v1','card-organism','card-nutrition','card-evidence','home-movement','home-sleep']){
  const ext=art==='muscle-lab-art-v1'?'webp':'svg';
  assert(fs.existsSync(`dist/${art}.${ext}`)&&fs.existsSync(`dist/${art}-cosmic.${ext}`),`${art} has a cosmic copy`);
}
// Скрипти карт болю ховають і повертають загальну фігуру.
for(const f of ['dist/knee-pain-map.js','dist/shoulder-pain-map.js'])assert(read(f).includes("wrap.querySelectorAll('.atlas-figure')")&&read(f).includes('set hidden(value)'),`${f} hides the full body figure`);
assert(atlas.includes('knee-pain-map.js?v=3')&&atlas.includes('shoulder-pain-map.js?v=3'),'the changed map scripts have new versions');

// 3) Правила показу: за замовчуванням (без файла палітри) і в «Зеленому» видно оригінал; у космосі фіолетова копія; атрибут hidden не перебивається.
assert(pine.includes('html img[data-art="cosmic"]{display:none!important}'),'the cosmic copy is hidden unless the cosmic palette shows it');
assert(extras.includes('html:not([data-palette="green"]) img[data-art="green"]{display:none!important}'),'cosmic hides the green original');
assert(extras.includes('html:not([data-palette="green"]) img[data-art="cosmic"]:not([hidden]){display:block!important}'),'cosmic shows its copy, and still honours the hidden attribute');

// 4) Плити під схемами: усі темні бірюзові SVG-кольори в скриптах і сторінках мають правило в палітрі, і лише в космосі.
const rules=plateRules(process.cwd());
assert(rules.length>=11,`plate rules exist (${rules.length})`);
for(const rule of rules)assert(rule.startsWith('html:not([data-palette="green"]) ['),`a plate rule never applies to the green palette: ${rule}`);
for(const rule of rules)assert(palette.includes(rule),`the generated palette file holds ${rule}`);
const uncovered=new Set();
for(const f of plateSources(process.cwd()))for(const m of read(f).matchAll(SVG_ATTR)){
  const raw=m[2].toLowerCase(),to=plateOf(parseColor(raw));
  if(to&&!palette.includes(`[${m[1]}="${raw}" i]{${m[1]}:${toHex({...to,a:1})}}`))uncovered.add(`${f} ${m[1]}=${raw}`);
}
assert.deepEqual([...uncovered],[],'a dark teal plate colour in an SVG attribute has no cosmic rule: run node scripts/build-site.mjs');
for(const [plate,to] of [['#0d2230','#1d132a'],['#071723','#140c1e'],['#21565e','#3a2c53']])assert.equal(hex(`rgb(${Object.values(plateOf(parseColor(plate))).join(',')})`),to,`the muscle/cell plate ${plate} becomes ${to}`);
assert.equal(plateOf(parseColor('#8fdceb')),null,'bright teal details of a diagram stay');
assert.equal(plateOf(parseColor('#e3bd6b')),null,'gold data colours stay');
assert.equal(plateOf(parseColor('#c75c4a')),null,'red/pink anatomy stays');
assert.equal(cosmicOf(parseColor('#8fdceb')),null,'the second (cyan) accent stays on pages');
for(const plate of ['#0d2230','#071723','#21565e','#112832','#091a22','#152b2d','#12323f'])assert(/\[(?:fill|stop-color)="#/.test(palette)&&palette.includes(`="${plate}" i]`),`${plate} has a rule`);

// 5) Бронзові залишки: вибрана позначка Атласу, підпис і плюс на «Куди зникає жир?», вузли жирового маршруту, чип обладнання.
for(const sel of ['.atlas-zone.is-selected','.fb-art-tag-bottom','.fb-myth-list summary i','.fb-lipid','.nf-node i','.ex-chip--equipment'])assert(extras.includes(sel),`${sel} has a cosmic override`);
for(const [file,sel] of [['dist/atlas.css','.atlas-zone.is-selected span'],['dist/fat-burning.css','.fb-art-tag-bottom'],['dist/fat-burning.css','.fb-myth-list summary i'],['dist/nutrition-fat-burning.css','.nf-node i'],['dist/exercises.css','.ex-chip--equipment']])assert(read(file).includes(sel),`${sel} still exists in ${file}, so its override still applies`);

// 6) Значок вкладки й іконка: ті самі космічні кольори, що в шапці сайту.
const favicon=read('dist/favicon.svg'),brand=read('scripts/make-brand-images.mjs');
for(const old of ['#06111d','#52c6ff','#70d0ff'])assert(!favicon.includes(old),`the favicon no longer uses ${old}`);
assert(favicon.includes('#0b0a12')&&favicon.includes('#d1a5ff'),'the favicon uses the cosmic background and accent');
const token=name=>{const key=pine.match(new RegExp(`--pine-${name}:var\\(--c-([0-9a-f]+),`))?.[1];return palette.match(new RegExp(`--c-${key}:(#[0-9a-f]{6})`))?.[1];};
assert(brand.includes(`BG='${token('bg')}'`)&&brand.includes(`ACCENT='${token('accent')}'`)&&brand.includes(`TEXT='${token('text')}'`)&&brand.includes(`MUTED='${token('muted')}'`),'make-brand-images.mjs colours equal the cosmic --pine-* tokens');
console.log('Cosmic art: copies fresh, pairs per palette, plate rules complete, leftovers overridden, brand icons passed.');
