import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {DossierPanel,validateDossiers} from '../src/evidence/core/dossier.mjs';
const ds=validateDossiers(JSON.parse(fs.readFileSync('src/evidence/supplements/dossiers.json','utf8')));
assert.equal(ds.length,9);
const before=fs.readFileSync('dist/index.html','utf8');
execFileSync('node',['scripts/build-dossiers.mjs']);
assert.equal(fs.readFileSync('dist/index.html','utf8'),before,'Build must be idempotent');
const ids=[...before.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'All static IDs unique');
for(const d of ds){
 const panel=DossierPanel(d);
 assert(before.includes(panel));
 assert(panel.includes('Чому ми так стверджуємо?'));
 assert(panel.includes('Попередній огляд · рівні впевненості не оцінено'));
 assert(panel.includes(d.existingConclusion.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')));
 assert.equal(d.claimIds.length,0);assert.equal(d.evidenceRecordIds.length,0);
 assert.equal(d.lastScientificReview,null);
 for(const s of d.sources)assert(panel.includes(s.url.replace(/&/g,'&amp;')));
 for(const m of panel.matchAll(/href="#([^"]+)"/g))assert(panel.includes('id="'+m[1]+'"'));
}
assert(DossierPanel(ds.find(d=>d.route==='supplement-magnesium')).includes('довідник NIH, а не систематичний огляд'));
assert(DossierPanel(ds.find(d=>d.route==='supplement-vitd')).includes('одне рандомізоване дослідження'));
console.log('9 structured dossiers + existing creatine; statuses, provenance, links, unique IDs and idempotence passed.');
