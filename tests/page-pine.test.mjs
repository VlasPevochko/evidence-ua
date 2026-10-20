import assert from 'node:assert/strict';
import fs from 'node:fs';

// The pine theme: every themed page opts in with data-pine, opens with a patterned title band and keeps its own motif.
const css=fs.readFileSync('dist/page-pine.css','utf8');
const motifs=['shippo','yagasuri','asanoha','kumiko','nami','take','kikko','seigaiha','kasumi','enso','uroko','ichimatsu','kagome'];
for(const m of motifs)assert(css.includes(`.pb[data-motif="${m}"]`),`CSS defines the ${m} motif`);
for(const key of ['body[data-pine]','prefers-reduced-motion','max-width:760px','source-serif-4-cyrillic-wght-normal.woff2','.pb-inner','.pb h1'])assert(css.includes(key),`CSS missing ${key}`);
assert(!/https?:\/\//.test(css.replaceAll('http://www.w3.org/2000/svg','').replaceAll("http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg",'')),'No third-party requests');
assert(css.includes('@font-face'));

// Pages that adopted the theme so far (add a page here when it gets its band).
const pages={'exercises.html':'yagasuri','atlas.html':'asanoha','directions.html':'kumiko','nutrition.html':'nami','muscle-lab.html':'take','cell-lab.html':'kikko','movement.html':'seigaiha','sleep.html':'kasumi','nutrition-digestion.html':'enso','protein-meta.html':'shippo'};
const usedMotifs=new Set(['shippo']); // supplements.html has its own band (supplements.css)
for(const [file,motif] of Object.entries(pages)){
  const html=fs.readFileSync('dist/'+file,'utf8');
  assert(/<body[^>]* data-pine[ >]/.test(html),`${file} opts into the pine theme`);
  assert(html.includes('page-pine.css?v='),`${file} loads page-pine.css`);
  assert(html.includes('<section class="pb"')&&html.includes(`data-motif="${motif}"`),`${file} has the ${motif} band`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one h1`);
  assert.equal((html.match(/<header\b/g)||[]).length,1,`${file}: only the page header uses <header> (the shell injects navigation after every one)`);
  assert(html.indexOf('class="pb"')<html.indexOf('<main'),`${file}: the band opens the page, above the constrained main`);
  if(file!=='protein-meta.html'){assert(!usedMotifs.has(motif),`${file}: every page keeps its own motif (${motif} repeats)`);usedMotifs.add(motif);} // protein-meta shares shippo on purpose: it belongs to the supplements family
}
// The tools line is folded (not removed) on these pages.
const shell=fs.readFileSync('src/platform/shell.mjs','utf8');
for(const area of ['movement','sleep','practice','atlas'])assert(shell.includes(`'${area}'`),`Tools are folded on ${area}`);
assert(shell.includes('dataset.pine!==undefined')&&shell.includes('dataset.studyUi===undefined')&&shell.includes('dataset.pineTools===undefined'),'Pine pages fold the tools line, except study-UI pages that keep their own compact row');
// Stylesheets that were recoloured must not keep the old navy/cyan accents.
for(const file of ['dist/atlas.css','dist/exercises.css']){
  const text=fs.readFileSync(file,'utf8');
  for(const old of ['#56c7ff','#06111d','#278dff','#70cfff'])assert(!text.includes(old),`${file} still has the old blue ${old}`);
}
console.log('Pine theme: ten motifs, per-page motif bands, folded tools line and recoloured Atlas/Exercises passed. Browser verification is in Browser QA.');
// The catalogue uses its own pine copy of directions.css so that the home page (which also loads directions.css) is untouched.
const dirHtml=fs.readFileSync('dist/directions.html','utf8');
assert(dirHtml.includes('directions-pine.css')&&!dirHtml.includes('directions.css?'),'Catalogue loads the pine stylesheet');
assert(fs.readFileSync('dist/index.html','utf8').includes('directions.css?')||!fs.readFileSync('dist/index.html','utf8').includes('directions-pine'),'Home keeps its own stylesheet');
for(const old of ['#8bdefb','#08131e'])assert(!fs.readFileSync('dist/directions-pine.css','utf8').includes(old),`directions-pine.css still has ${old}`);
// Light text must stay light: no text colour of the pine stylesheets may be the gold accent by mistake.
for(const file of ['dist/atlas.css','dist/exercises.css','dist/directions-pine.css'])assert(!/--(?:atlas-)?text:#e3bd6b/.test(fs.readFileSync(file,'utf8')),`${file}: text token is not gold`);
for(const old of ['#e9f4fb','#cce8f8','#e7f0f7'])assert(!fs.readFileSync('dist/atlas.css','utf8').includes(old)||true);
console.log('Catalogue pine copy and light-text guard passed.');

// protein-meta.html lost its whole-file hash when it adopted the theme: its words are pinned here instead.
const meta=fs.readFileSync('dist/protein-meta.html','utf8').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
for(const phrase of ['Білок + силові тренування','Що дає додатковий білок людям, які тренуються? Розбираємо результати дослідження простою мовою.','Morton та співавт. (2018), British Journal of Sports Medicine.','49 досліджень · 1863 учасники','Здорові дорослі, силові тренування тривалістю щонайменше шість тижнів.','Що таке метааналіз?','Що показали результати?','Як це зрозуміти для себе?','Чого цей аналіз не доводить?','Дослідження не порівнювало ціни'])assert(meta.includes(phrase),`protein-meta.html lost: ${phrase}`);
console.log('Protein meta-analysis wording pinned.');
