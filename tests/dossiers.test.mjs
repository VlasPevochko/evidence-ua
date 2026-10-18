import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {DossierPanel,validateDossiers} from '../src/evidence/core/dossier.mjs';
import {publishedStudyNotes} from '../src/evidence/supplements/published-study-notes.mjs';
import {proteinModule} from '../src/evidence/supplements/protein/module.mjs';
const ds=validateDossiers(JSON.parse(fs.readFileSync('src/evidence/supplements/dossiers.json','utf8')));
assert.equal(ds.length,9);
const before=fs.readFileSync('dist/index.html','utf8');
execFileSync('node',['scripts/build-dossiers.mjs']);
assert.equal(fs.readFileSync('dist/index.html','utf8'),before,'Build must be idempotent');
const ids=[...before.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'All static IDs unique');
for(const d of ds){
 const panel=DossierPanel(d);
 if(d.id===proteinModule.replacesDossier){assert(!before.includes('<!-- DOSSIER:'+d.id+' -->'),'Replaced dossier must not render');continue;}
 assert(before.includes(panel));
 assert(panel.includes('Чому ми так стверджуємо?'));
 assert(panel.includes('Попередній огляд · рівні впевненості не оцінено'));
 assert(panel.includes(d.existingConclusion.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')));
 assert.equal(d.claimIds.length,0);assert.equal(d.evidenceRecordIds.length,0);
 assert.equal(d.lastScientificReview,null);
 for(const s of d.sources)assert(panel.includes(s.url.replace(/&/g,'&amp;')));
 for(const m of panel.matchAll(/href="#([^"]+)"/g))assert(panel.includes('id="'+m[1]+'"'));
}
assert(DossierPanel(ds.find(d=>d.route==='supplement-magnesium')).includes('Старий текст спирався на довідник NIH'));
assert(DossierPanel(ds.find(d=>d.route==='supplement-vitd')).includes('одне рандомізоване дослідження'));
for(const [id,note] of Object.entries(publishedStudyNotes)){const d=ds.find(x=>x.id===id);assert(d,'Unknown dossier '+id);for(const pmid of new Set(JSON.stringify(note.source).match(/\b\d{8}\b/g)||[]))assert(d.sources.some(s=>s.url.includes('/'+pmid+'/')),id+': study note cites PMID '+pmid+' that is missing from the source list');}
console.log('9 structured dossiers (DOS-PROTEIN replaced by the approved protein module) + existing creatine; statuses, provenance, links, unique IDs and idempotence passed.');
