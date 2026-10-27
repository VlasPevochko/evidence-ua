// Owner-selected Spectrum home (2026-10-27): refresh shared header/search cache parents; historical scientific fixtures stay unchanged.
// Follow-up audit fixes refresh shared imports; these wiring expectations follow the cache cascade.
// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
// Shared shell cache version includes the Nutrition route migration.
// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
// Cache expectations updated for the scoped shared-header geometry fix.
// Shared header release bumps the shell cache version to 84; science contracts are unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readBase} from '../scripts/site-url.mjs';
import {digestionBase as base,digestionModule as module} from '../dist/digestion-data.js';
import {foodPathSteps as steps,foodPathModelNodes,foodPathTract} from '../dist/digestion-steps.js';
import {nutritionBase} from '../dist/nutrition-data.js';
import {ClaimCard,EvidenceDrawer} from '../dist/evidence/components.js';

// Owner decision 2026-10-18: Claims are educational wording; no confidence level is shown.
assert.equal(module.publicationApproved,true);
assert.equal(module.publicationAcceptance.confidenceAssessed,false);
assert.equal(module.publicationAcceptance.formalScientificReview,false);
assert.deepEqual(module.claimIds,steps.map(s=>s.claimId).filter(Boolean));
for(const c of base.claims){
 assert.equal(c.evidenceConfidence,null,c.id);assert.equal(c.lastReviewed,null,c.id);assert.equal(c.publicationApproved,true,c.id);
 const card=ClaimCard(c.id,base),drawer=EvidenceDrawer(c.id,base);
 assert(card.includes('Рівень впевненості не оцінено'),c.id);assert(drawer.includes('Рівень впевненості не оцінено'),c.id);assert(!(card+drawer).includes('class="eua-confidence'),c.id);assert(!/data-confidence="(?!not-assessed)/.test(card+drawer),c.id);
 assert(card.includes(`data-claim-open="${c.id}"`),c.id);
}

// CLM-000022 is reused from the nutrition module, not redefined.
const sglt1=base.claims.find(c=>c.id==='CLM-000022'),original=nutritionBase.claims.find(c=>c.id==='CLM-000022');
assert.equal(sglt1.statement,original.statement);assert.equal(sglt1.version,original.version);
assert.equal(base.claims.filter(c=>c.id==='CLM-000022').length,1);
for(const r of nutritionBase.records.filter(r=>r.claimId==='CLM-000022'))assert(base.records.some(x=>x.id===r.id));

// Every shown Claim has PubMed-backed evidence; nothing is marked as reviewed.
for(const id of module.claimIds){
 const records=base.records.filter(r=>r.claimId===id);assert(records.length>=4,id);
 for(const r of records){assert(['pending','scientifically_reviewed'].includes(r.reviewStatus));assert(r.result?.summary,r.id);}
 const fromPubMed=records.map(r=>base.sources.find(s=>s.id===r.sourceId)).filter(s=>s.pmid);assert(fromPubMed.length>=4,id);
}
for(const s of base.sources.filter(s=>s.pmid))assert.equal(s.pubmedUrl,`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`);
// Conflicting or mixed evidence stays visible in the drawer.
assert(EvidenceDrawer('CLM-000050',base).includes('змішані результати')||EvidenceDrawer('CLM-000050',base).includes('Carbonnel'));
assert(EvidenceDrawer('CLM-000022',base).includes('Apical GLUT2'));

// Steps only reference nodes present in the shipped model.
const glb=fs.readFileSync('dist/models/digestive.glb');assert.equal(glb.toString('ascii',0,4),'glTF');
const json=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
const nodes=new Set(json.nodes.map(n=>n.name.split('__')[0]));
for(const id of foodPathModelNodes)assert(nodes.has(id),id);
for(const s of steps){for(const id of [...s.focus,...s.context])if(id!=='*')assert(nodes.has(id),s.id+': '+id);}
assert.equal(new Set(steps.map(s=>s.id)).size,steps.length);assert(foodPathTract.every(id=>nodes.has(id)));

// Page: retained share metadata, shell, reading section and attribution; no third-party scripts.
const html=fs.readFileSync('dist/nutrition-digestion.html','utf8');
for(const piece of [`<link rel="canonical" href="${readBase()}nutrition-digestion.html">`,'platform-shell.js?v=104','digestion-viewer.js?v=4','id="eua-evidence-dialog"','data-food-path','Всмоктування ≠ виведення','https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works','https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look','CC BY-SA 4.0','Z-Anatomy','./nutrition-inside.html#nutrition-lab'])assert(html.includes(piece),piece);
assert(!/<script[^>]+src="https?:/.test(html));
const viewer=fs.readFileSync('dist/digestion-viewer.js','utf8');
assert(!/from\s*['"]https?:/.test(viewer));assert(!viewer.includes("from 'three'"));
assert(fs.readFileSync('dist/models/ATTRIBUTION.txt','utf8').includes('Creative Commons Attribution-ShareAlike 4.0'));
console.log('Food path: 5 educational Claims without confidence, PubMed provenance, reused CLM-000022, model nodes and page structure passed. Browser layout is checked by qa:browser.');
