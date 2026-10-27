import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SCENES,nextStage,INTERVAL_MS} from '../dist/mechanisms-page.js';

// «Як це працює» (рішення власника 2026-10-27, пункт 5: анімації): дві схеми, кроки, джерела, чесні межі.
assert.equal(SCENES.caffeine.length,3);assert.equal(SCENES.creatine.length,4);
for(const [name,steps] of Object.entries(SCENES))for(const s of steps){
  assert(s.tab.length>3&&s.title.length>10&&s.text.length>40,`${name}: every step has a tab, a title and a sentence`);
  assert(!/(лікує|гарантує|доведено,? що ви)/i.test(s.text),`${name}: no promises or cures`);
}
assert.equal(nextStage(3,3),1);assert.equal(nextStage(1,4),2);assert.equal(nextStage(4,4),1,'the cycle wraps');
assert(INTERVAL_MS>=4000,'steps stay long enough to read');
const html=fs.readFileSync('dist/mechanisms.html','utf8'),css=fs.readFileSync('dist/mechanisms-page.css','utf8'),js=fs.readFileSync('dist/mechanisms-page.js','utf8');
assert(/<body[^>]* data-pine[ >]/.test(html)&&html.includes('data-motif="kanoko"'),'pine band with its own motif');
assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<header\b/g)||[]).length,1);
// Без JS видно перший крок і підписи; кнопки з'являються лише з JS (hidden у розмітці).
assert(html.includes('data-stage="1"')&&html.includes('Довго неспиш: аденозину стає більше')&&html.includes('Спокій: запас фосфокреатину повний'),'the first step is readable without JavaScript');
assert((html.match(/data-ctl hidden/g)||[]).length===2,'controls appear only when the script runs');
// Джерела: тварини названі тваринами, креатин на людях, обидві схеми кажуть, що це схема.
for(const doi of ['10.1523/JNEUROSCI.4111-08.2009','10.1016/s0306-4522(00)00075-0','10.1046/j.1365-201X.1998.0298f.x','10.3390/nu17010095'])assert(html.includes('https://doi.org/'+doi),`source ${doi} is linked`);
assert(html.includes('(миші)')&&html.includes('(щури)')&&html.includes('(люди)'),'the species of every source are named');
assert((html.match(/Це схема, а не вимірювання/g)||[]).length===2,'both schemes say they are not measurements');
assert(html.includes('./research.html#coffee')&&html.includes('./research.html#creatine-rt'),'each scheme links to its write-up');
// Усі кроки мають стилі; молекули мають позиції для кожного кроку; рух вимикається.
for(const n of [1,2,3])assert(css.includes(`[data-scene="caffeine"][data-stage="${n}"]`),`caffeine step ${n} is styled`);
for(const n of [1,2,3,4])assert(css.includes(`[data-scene="creatine"][data-stage="${n}"]`),`creatine step ${n} is styled`);
for(const id of ['a1','a2','a3','a4','a5','a6'])for(const n of [1,2,3])assert(css.includes(`[data-stage="${n}"] #${id}{`),`${id} has a position for step ${n}`);
for(const id of ['c1','c2','c3'])assert(css.includes(`[data-stage="3"] #${id}{`),`${id} docks at step 3`);
assert(css.includes('prefers-reduced-motion')&&js.includes("prefers-reduced-motion: reduce"),'reduced motion is honoured in CSS and in the autoplay');
assert(!/https?:\/\//.test(css.replaceAll('http://www.w3.org/','')),'no third-party requests in styles');
assert(!/<text/.test(html),'labels are HTML text, not text inside SVG');
// Каталог, пошук і картка для поширення.
assert(fs.readFileSync('src/platform/materials.mjs','utf8').includes("'./mechanisms.html'"));assert(fs.existsSync('dist/og/mechanisms.jpg'));
console.log('Mechanisms: 3+4 steps, readable without JS, sourced, species named, honest limits, reduced motion, catalog passed.');
