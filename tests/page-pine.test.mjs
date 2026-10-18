import assert from 'node:assert/strict';
import fs from 'node:fs';

// The pine theme: every themed page opts in with data-pine, opens with a patterned title band and keeps its own motif.
const css=fs.readFileSync('dist/page-pine.css','utf8');
const motifs=['shippo','yagasuri','asanoha','kumiko','nami','take','kikko','seigaiha','kasumi','enso'];
for(const m of motifs)assert(css.includes(`.pb[data-motif="${m}"]`),`CSS defines the ${m} motif`);
for(const key of ['body[data-pine]','prefers-reduced-motion','max-width:760px','source-serif-4-cyrillic-wght-normal.woff2','.pb-inner','.pb h1'])assert(css.includes(key),`CSS missing ${key}`);
assert(!/https?:\/\//.test(css.replaceAll('http://www.w3.org/2000/svg','').replaceAll("http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg",'')),'No third-party requests');
assert(css.includes('@font-face'));

// Pages that adopted the theme so far (add a page here when it gets its band).
const pages={'exercises.html':'yagasuri','atlas.html':'asanoha'};
const usedMotifs=new Set(['shippo']); // supplements.html has its own band (supplements.css)
for(const [file,motif] of Object.entries(pages)){
  const html=fs.readFileSync('dist/'+file,'utf8');
  assert(/<body[^>]* data-pine>/.test(html),`${file} opts into the pine theme`);
  assert(html.includes('page-pine.css?v='),`${file} loads page-pine.css`);
  assert(html.includes(`<section class="pb"`)&&html.includes(`data-motif="${motif}"`),`${file} has the ${motif} band`);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one h1`);
  assert.equal((html.match(/<header\b/g)||[]).length,1,`${file}: only the page header uses <header> (the shell injects navigation after every one)`);
  assert(html.indexOf('class="pb"')<html.indexOf('<main'),`${file}: the band opens the page, above the constrained main`);
  assert(!usedMotifs.has(motif),`${file}: every page keeps its own motif (${motif} repeats)`);
  usedMotifs.add(motif);
}
// The tools line is folded (not removed) on these pages.
const shell=fs.readFileSync('src/platform/shell.mjs','utf8');
for(const area of ['movement','sleep','practice','atlas'])assert(shell.includes(`'${area}'`),`Tools are folded on ${area}`);
// Stylesheets that were recoloured must not keep the old navy/cyan accents.
for(const file of ['dist/atlas.css','dist/exercises.css']){
  const text=fs.readFileSync(file,'utf8');
  for(const old of ['#56c7ff','#06111d','#278dff','#70cfff'])assert(!text.includes(old),`${file} still has the old blue ${old}`);
}
console.log('Pine theme: ten motifs, per-page motif bands, folded tools line and recoloured Atlas/Exercises passed. Browser verification is in Browser QA.');
