import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DossierPanel} from '../src/evidence/core/dossier.mjs';
import {publishedStudyNotes} from '../src/evidence/supplements/published-study-notes.mjs';
const dossiers=JSON.parse(fs.readFileSync('src/evidence/supplements/dossiers.json','utf8'));
for(const d of dossiers){
 const html=DossierPanel(d);
 assert.equal(html.includes('dossier-study-note'),true);
 assert.equal(publishedStudyNotes[d.id].confidence,null);
 assert(html.includes(publishedStudyNotes[d.id].source.pmid));
 for(const r of publishedStudyNotes[d.id].results) assert(r.lower<=r.estimate && r.estimate<=r.upper);
 if(d.id==='DOS-CITRULLINE') {
  assert(html.includes('42356270'));
  assert(html.includes('0,16; 95% ДІ 0,05…0,27'));
  assert(html.includes('−0,37…0,69'));
  assert(html.includes('Автори огляду декларують'));
  assert.equal(publishedStudyNotes[d.id].confidence,null);
 }
 if(d.id==='DOS-VITD') {
  assert(html.includes('42161415'));
  assert(html.includes('відношення ризиків 1; 95% ДІ 0,95…1,06'));
  assert(!html.includes('стандартизована різниця середніх'));
 }
 if(d.id==='DOS-CAFFEINE'){
  assert(html.includes('42356375'));
  assert(html.includes('-0,27')||html.includes('−0,27'));
  assert(html.includes('Рівень впевненості Evidence UA не оцінено'));
  assert.equal((html.match(/<details/g)||[]).length,(html.match(/<\/details>/g)||[]).length);
 }
}
assert.equal(publishedStudyNotes['DOS-CAFFEINE'].confidence,null);
assert.equal(Object.keys(publishedStudyNotes).length,9);
assert.equal(publishedStudyNotes['DOS-BETA-ALANINE'].results.length,0);
assert.equal(publishedStudyNotes['DOS-ELECTROLYTES'].results.length,0);
assert(publishedStudyNotes['DOS-ELECTROLYTES'].summary.includes('Питна вода також залишається прийнятною альтернативою'));
assert(publishedStudyNotes['DOS-ELECTROLYTES'].summary.includes('коли їжа недоступна'));
console.log('Nine dossier notes: provenance, metric labels, uncertainty and missing-results checks passed.');
