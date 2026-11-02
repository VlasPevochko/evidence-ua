// Бриф T2 (2026-11-02): значки типів джерел у картках розборів. Колір несе зміст лише другорядно: фігура й точний рядок типу первинні. Це не рейтинг.
// Одинадцять рядків `type` зведено в чотири родини однією явною таблицею (dist/research-types.js); родини затверджені власником (D2).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';
import {FAMILIES,LEGEND_SENTENCE,familyOf,chipHTML,legendHTML} from '../dist/research-types.js';

// 1. Кожен рядок типу з даних має родину; жодного зайвого рядка в таблиці; родин чотири, фігури й токени різні.
const types=[...new Set(STUDIES.map(study=>study.type))];
assert.equal(types.length,11,'the data holds eleven distinct type strings (if a new one appears, give it a family in dist/research-types.js)');
for(const type of types)assert(familyOf(type),`the type «${type}» has a family`);
const listed=FAMILIES.flatMap(family=>family.types);
assert.equal(new Set(listed).size,listed.length,'no type string is listed in two families');
for(const type of listed)assert(types.includes(type),`the table has no stale type «${type}»`);
assert.deepEqual(FAMILIES.map(family=>family.id),['meta','systematic','umbrella','review']);
assert.deepEqual(FAMILIES.map(family=>family.glyph),['circle','square','triangle','diamond'],'four different shapes');
assert.deepEqual(FAMILIES.map(family=>family.token),['--st-1','--st-2','--st-3','--st-4']);
assert.deepEqual(FAMILIES.map(family=>STUDIES.filter(study=>family.types.includes(study.type)).length),[10,2,3,1],'ten, two, three and one write-ups, as approved');
assert.deepEqual(FAMILIES.map(family=>family.label),['Мета-аналіз (усі види)','Систематичний огляд (усі види)','Огляд оглядів','Огляд'],'legend names: the two broad families say that they hold every kind of the study type');
// Родина «Мета-аналіз…» це всі рядки, що починаються з мета-аналізу, мережевого мета-аналізу чи мета-регресії; «Огляд оглядів» це огляди мета-аналізів і систематичних оглядів.
for(const type of types){
  const meta=/^(Мета-аналіз|Мережевий мета-аналіз|Мета-регресія)/.test(type),family=familyOf(type).id;
  assert.equal(family==='meta',meta,`«${type}»: the meta-analysis family holds exactly the meta-analysis strings`);
}
assert.equal(familyOf('Огляд мета-аналізів').id,'umbrella');assert.equal(familyOf('Огляд систематичних оглядів').id,'umbrella');assert.equal(familyOf('Огляд').id,'review');
assert.equal(familyOf('Невідомий тип'),null);

// 2. Значок: текст дорівнює рядку з даних (без змін), фігура декоративна, невідомий тип показується без фігури.
const textOf=html=>html.replace(/<i [^>]*><\/i>/g,'').replace(/<[^>]+>/g,'');
for(const study of STUDIES){
  const html=chipHTML(study.type);
  assert.equal(textOf(html),study.type,`${study.id}: the chip text is the type string from the data, unchanged`);
  assert(/<i class="rs-glyph rs-glyph--(circle|square|triangle|diamond)" aria-hidden="true"><\/i>/.test(html),`${study.id}: the shape is decorative`);
  assert(html.includes(`rs-type--${familyOf(study.type).id}`),`${study.id}: the chip carries its family class`);
}
const unknown=chipHTML('Невідомий <тип>');
assert(!unknown.includes('rs-glyph')&&unknown.includes('rs-type--other')&&unknown.includes('Невідомий &lt;тип&gt;'),'an unknown type is shown as escaped text without a shape or a colour');

// 3. Легенда: один рядок на родину з числом із даних, речення про те, що це не рівень впевненості, рівно одне й саме в блоці «Як це читати».
const legend=legendHTML(STUDIES);
assert.equal((legend.match(/<li /g)||[]).length,4);
assert.deepEqual([...legend.matchAll(/<small>(\d+)<\/small>/g)].map(match=>Number(match[1])),[10,2,3,1]);
assert.equal(LEGEND_SENTENCE,'Колір і значок показують лише тип джерела, а не рівень впевненості.');
const html=fs.readFileSync('dist/research.html','utf8'),note=html.match(/<div class="rs-note">[\s\S]*?<\/div>/)[0];
assert.equal(html.split(LEGEND_SENTENCE).length-1,1,'the disclaimer sentence appears once on the page');
assert(note.includes(LEGEND_SENTENCE)&&note.includes('id="rs-legend"')&&note.includes('не оцінка Evidence UA і не медична порада'),'the legend sits in the «Як це читати» note, next to the existing disclaimer');
const page=fs.readFileSync('dist/research-page.js','utf8');
assert(page.includes("import {chipHTML,legendHTML} from './research-types.js?v=1';")&&page.includes('legend.innerHTML=legendHTML(STUDIES)')&&page.includes('meta.insertAdjacentHTML(\'beforeend\',chipHTML(s.type))'),'the page draws the chips and the legend from the table');
assert(html.includes('research-page.js?v=9')&&html.includes('research-page.css?v=7'),'page versions raised');

// 4. Кольори. Токени --st-1..4: космічні значення в cosmic-extras.css (і в згенерованому palette-cosmic.css), у зеленому запасні значення в research-page.css.
const hex=value=>{const m=/#([0-9a-f]{6})\b/i.exec(value);return m&&('#'+m[1].toLowerCase());};
const extras=fs.readFileSync('src/palette/cosmic-extras.css','utf8'),cosmicBlock=extras.match(/html:not\(\[data-palette="green"\]\)\{--st-1:[^}]*\}/)[0];
const cosmicTokens=Object.fromEntries([1,2,3,4].map(n=>[n,hex(cosmicBlock.match(new RegExp(`--st-${n}:(#[0-9a-f]{6})`))[1])]));
const fullCss=fs.readFileSync('dist/research-page.css','utf8'),css=fullCss.slice(fullCss.indexOf('T2 (2026-11-02)'));
const greenFallbacks=Object.fromEntries([1,2,3,4].map(n=>[n,hex(css.match(new RegExp(`var\\(--st-${n},([^;}]*)\\}?`))[1])]));
assert.deepEqual(Object.values(cosmicTokens),['#99d973','#3adfd7','#ffa3cf','#cbc1c4'],'palette A: the default set');
assert.deepEqual(greenFallbacks,cosmicTokens,'the green fallbacks equal the cosmic values (the set was tuned for both surfaces)');
const generated=fs.readFileSync('dist/palette-cosmic.css','utf8');
for(const n of [1,2,3,4])assert(generated.includes(`--st-${n}:${cosmicTokens[n]}`),`dist/palette-cosmic.css carries --st-${n} (rebuild the palette if this fails)`);
assert(!/(^|[\n}])\s*html\[data-palette="green"\][^{]*\{[^}]*--st-/.test(extras+css+generated),'the green palette defines no --st tokens (it shows the fallbacks)');
assert(/\.rs-glyph\{[^}]*background:var\(--fam\)/.test(css)&&/\.rs-type\{--fam:var\(--st-4,/.test(css),'the shape takes the family colour from the token');
assert(!/eua-(low|moderate|high)|#a9dfff|#152837/i.test(css),'the chips never reuse the confidence badge colours');

// 5. Відтінки: категорійні, без синього, золотого, червоного й помаранчевого; різні між собою; четверта родина нейтральна.
const toHSL=color=>{const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
  const s=d===0?0:d/(1-Math.abs(2*l-1));let h=0;if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;}return {h,s,l};};
const chromatic=[1,2,3].map(n=>({n,...toHSL(cosmicTokens[n])}));
for(const item of chromatic){
  assert(item.s>=0.4,`--st-${item.n} is a real hue (saturation ${item.s.toFixed(2)})`);
  assert(!(item.h<=65||item.h>=340)&&!(item.h>=200&&item.h<=255),`--st-${item.n} (hue ${item.h.toFixed(0)}) avoids red, orange, gold and blue`);
}
for(let i=0;i<chromatic.length;i++)for(let j=i+1;j<chromatic.length;j++){const d=Math.abs(chromatic[i].h-chromatic[j].h);assert(Math.min(d,360-d)>=40,`--st-${chromatic[i].n} and --st-${chromatic[j].n} are at least 40° apart`);}
assert(toHSL(cosmicTokens[4]).s<0.2,'the fourth family is a neutral grey');

// 6. Контраст у чотирьох режимах: космос, зелений, і світла тема (інверсія фільтром) обох. Текст значка 4,5:1, фігура й рамка 3:1.
const lin=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};
const rgb=color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
const lum=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
const ratio=(a,b)=>{const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x);return (hi+0.05)/(lo+0.05);};
// html[data-theme="light"]{filter:invert(1) hue-rotate(180deg)} (dist/appearance.css): інверсія, потім матриця повороту відтінку на 180° у просторі sRGB, з обрізанням.
const light=([r,g,b])=>{const [i,j,k]=[255-r,255-g,255-b],clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
  return [clamp(-0.574*i+1.430*j+0.144*k),clamp(0.426*i+0.430*j+0.144*k),clamp(0.426*i+1.430*j-0.856*k)];};
const pine=fs.readFileSync('dist/page-pine.css','utf8'),cosmicMap=fs.readFileSync('dist/palette-cosmic.css','utf8');
const token=(file,key)=>hex(file.match(new RegExp(`--c-${key}:(#[0-9a-f]{6})`))[1]);
const modes={
  cosmic:{surface:token(cosmicMap,'142520'),muted:token(cosmicMap,'9db1a7')},
  green:{surface:'#142520',muted:'#9db1a7'}
};
assert(pine.includes('--pine-surface:var(--c-142520,#142520)')&&pine.includes('--pine-muted:var(--c-9db1a7,#9db1a7)'),'the green surface and muted text are the ones used above');
for(const [name,mode] of Object.entries(modes)){
  for(const [view,transform] of [['dark',color=>color],['light',light]]){
    const surface=transform(rgb(mode.surface)),muted=transform(rgb(mode.muted));
    assert(ratio(muted,surface)>=4.5,`${name}/${view}: chip text contrast ${ratio(muted,surface).toFixed(2)}:1 is at least 4.5:1`);
    for(const n of [1,2,3,4]){
      const family=transform(rgb(cosmicTokens[n]));
      assert(ratio(family,surface)>=3,`${name}/${view}: --st-${n} shape and border contrast ${ratio(family,surface).toFixed(2)}:1 is at least 3:1`);
    }
  }
}

// 7. Журнал і документ.
assert(fs.readFileSync('dist/changes-data.js','utf8').includes('У розборах видно тип джерела'),'the change log has a record');
const doc=fs.readFileSync('docs/STUDY_TYPE_CHIPS.md','utf8');
for(const part of ['Що змінено','Родини','Кольори','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/STUDY_TYPE_CHIPS.md has the section «${part}»`);
const colors=fs.readFileSync('docs/COLORS.md','utf8');
assert(colors.includes('Типи джерел у розборах: токени --st-1…4')&&colors.includes('#99d973'),'docs/COLORS.md documents the new tokens');
console.log('Study type chips: eleven strings in four families, text unchanged, no confidence colours, contrast in cosmic/green/light passed.');
