import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHANGES,TAGS,SCIENCE} from '../dist/changes-data.js';
import {formatDate,total} from '../dist/changes-page.js';
import {findMaterials} from '../src/platform/materials.mjs';

// Журнал оновлень (рішення власника 2026-10-21): простою мовою, з чесним полем «чи змінювалась наука».
const html=fs.readFileSync('dist/changes.html','utf8'),css=fs.readFileSync('dist/changes-page.css','utf8'),js=fs.readFileSync('dist/changes-page.js','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('data-pine')&&html.includes('data-motif="hishi"')&&fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="hishi"]'),'pine band with its own motif');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='changes.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="hishi"'),`${f} must not reuse hishi`);
assert.equal((html.match(/<header\b/g)||[]).length,1,'only the fallback header, the shell replaces it');
assert(html.indexOf('class="pb"')<html.indexOf('<main'),'the band opens the page');

// Data: newest first, every record complete, every link is a real page.
const dates=CHANGES.map(d=>d.date);
assert.deepEqual([...dates].sort().reverse(),dates,'days are newest first');
for(const day of CHANGES){
  assert(/^\d{4}-\d{2}-\d{2}$/.test(day.date)&&day.items.length>0,'a day has a date and records');
  for(const it of day.items){
    assert(TAGS[it.tag]&&SCIENCE[it.science],`${it.title}: known tag and science marker`);
    assert(it.title&&it.text.length>20&&it.text.length<200,`${it.title}: a short plain description`);
    assert(fs.existsSync('dist/'+it.href.replace('./','').split('#')[0]),`${it.title}: the link leads to a real page`);
  }
}
// «Новий зміст» only where the owner added content with sources on the page itself.
const withNew=CHANGES.flatMap(d=>d.items).filter(i=>i.science==='new');
assert(withNew.every(i=>i.href==='./fat-burning.html'),'only the Fat Burning Lab is marked as new content');
// No promises about results or health in the log.
const text=CHANGES.flatMap(d=>d.items).map(i=>i.title+' '+i.text).join(' ');
assert(!/гарантує|лікує|допоможе|слід приймати|схуднеш/i.test(text),'no health promises in the log');
assert.equal(formatDate('2026-10-21'),'21 жовтня 2026');
assert.equal(total(),CHANGES.flatMap(d=>d.items).length);
// Honest limits are spelled out, and the technical note is folded, not removed.
assert(html.includes('Чого ми не перевіряємо')&&html.includes('<details class="ch-how"'),'the limits are stated inside a folded block');
assert(js.includes('box.open=i===0'),'only the newest day is open');
assert(css.includes('.ch-day[open]')&&!/https?:\/\//.test(css+js.replaceAll('http://www.w3.org/2000/svg','')),'no third-party requests');
assert(findMaterials('що нового').some(m=>m.href==='./changes.html'),'the log is searchable');
assert(fs.readFileSync('dist/index.html','utf8').includes('<a href="./changes.html">Що нового й що перевірено →</a>'),'the home page links to the log');
assert(fs.existsSync('dist/og/changes.jpg'),'the page has its own share card');
console.log('Changes page: pine band, complete records, real links, honest science markers and limits passed.');
