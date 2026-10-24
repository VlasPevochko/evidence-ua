import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS} from '../dist/evidence-trainer.js';

// Тренажер «Перевір твердження» (рішення власника 2026-10-19): три картки на числах із наших досьє.
// 2026-10-22 (owner «А: всі пункти»): five cards from the new supplement cards; the first seven are unchanged.
assert.equal(CARDS.length,12);
const html=fs.readFileSync('dist/index.html','utf8');
const plain=html.replace(/<[^>]+>/g,' ').replace(/&minus;|−/g,'-').replace(/\s+/g,' ');
// Кожне число в картках уже є в досьє на головній сторінці, а нових наукових чисел тренажер не вводить.
const norm=t=>t.replace(/−/g,'-').replace(/\s+/g,' ');
const dossier=norm(plain);
const needed=['-0,27','-0,44','-0,11','-0,52','-0,77','-0,28','-9,59','-23,14','3,97','177','42356375','32956536','1,14','0,69','1,59','39074168','42507286','1036','8828669','0,96','0,92','1,01','32114706','-2,00','-3,58','-0,43','368','27402922','0,05','-0,71','0,82','35813845','0,48','39060741','1,10','0,10','2,00','34716905'];
for(const n of needed)assert(dossier.includes(n),`${n} must exist in the dossiers on the home page`);
const cardText=norm(JSON.stringify(CARDS));
for(const n of cardText.match(/\d+(?:,\d+)?/g)){assert(dossier.includes(n)||['0','1','2','3'].includes(n)||n==='27',`unexpected number ${n} in trainer`);}
for(const c of CARDS){
  assert.equal(c.options.length,3);assert(c.correct>=0&&c.correct<3);
  assert(c.options.every(([a,b])=>a&&b),'every option explains itself');
  assert(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/.test(c.source[1])||c.source[1].startsWith('https://www.niddk.nih.gov/'),'source is PubMed or the NIDDK page the site already cites');
}
assert.deepEqual(CARDS.map(c=>c.correct),[1,2,0,2,0,1,1,1,0,2,1,2],'the right answer is not always in the same place');
assert(new Set(CARDS.map(c=>c.correct)).size===3,'all three positions are used');
// Заборонені обіцянки результату.
for(const bad of ['слід приймати','допоможе','лікує','гарантує','рекомендуємо'])assert(!cardText.includes(bad),`no promise wording: ${bad}`);
assert(fs.readFileSync('dist/evidence-trainer.js','utf8').includes('а не порада приймати добавки'),'safety note is part of the trainer');
assert(!/https?:\/\//.test(fs.readFileSync('dist/evidence-trainer.css','utf8')),'no third-party requests in CSS');
assert(html.includes('evidence-trainer.js?v=')&&html.includes('evidence-trainer.css?v='),'wired into the home page');
console.log('Evidence trainer: twelve cards, numbers match the dossiers, sources are PubMed links, no promises passed.');
