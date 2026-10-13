import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {organelles,sources} from '../src/cell-lab/module.mjs';
const api=await import('../src/cell-lab/detail-view.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});

test('every existing organelle has a distinct detailed cutaway and an honest chapter reference',()=>{
 assert.equal(typeof api.getCellDetail,'function','Detailed organelle viewer is missing');
 const paths=[];
 for(const o of organelles){const detail=api.getCellDetail(o.id);paths.push(detail.image);assert.equal(detail.organelleId,o.id);assert(detail.parts.length>=2);assert(sources.some(s=>s.id===detail.sourceId&&o.sourceIds.includes(s.id)));assert(detail.locator);assert(!detail.scientificApproval);}
 assert.equal(new Set(paths).size,11);assert.throws(()=>api.getCellDetail('UNKNOWN'),/Unknown organelle/);
 assert(api.getCellDetail('ORG-MITOCHONDRION').parts.includes('Кристи'));assert(api.getCellDetail('ORG-MITOCHONDRION').parts.includes('Внутрішня мембрана'));
 assert(api.getCellDetail('ORG-NUCLEOLUS').note.includes('мембрани'));
});

test('viewer stays in the atlas and exposes accessible close and bounded zoom controls',()=>{
 assert.equal(typeof api.renderCellDetail,'function');
 for(const o of organelles){const html=api.renderCellDetail(o.id,4);assert(html.includes(o.label));assert(html.includes('data-cell-detail-action="close"'));assert(html.includes('data-cell-detail-action="zoom-in"'));assert(html.includes('data-cell-detail-action="zoom-out"'));assert(html.includes('data-cell-detail-action="fit"'));assert(html.includes('Детальний вигляд'));assert(html.includes('Навчальна ілюстрація'));assert(!html.includes('<iframe'));assert(!html.includes('target="_self"'));assert(html.includes('rel="noopener noreferrer"'));assert(html.includes('alt="'));}
 assert.throws(()=>api.renderCellDetail('ORG-MITOCHONDRION',0),/Invalid zoom/);assert.throws(()=>api.renderCellDetail('ORG-MITOCHONDRION',3),/Invalid zoom/);
 const small=api.renderCellDetail('ORG-MITOCHONDRION',2),large=api.renderCellDetail('ORG-MITOCHONDRION',8);
 assert(small.includes('data-cell-detail-action="zoom-out" disabled'));assert(large.includes('data-cell-detail-action="zoom-in" disabled'));
});

test('all eleven close-ups are separate high-resolution local PNG assets',()=>{
 const hashes=[];
 for(const o of organelles){const path=api.getCellDetail(o.id).image.replace('./','dist/'),bytes=fs.readFileSync(path);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert(bytes.readUInt32BE(16)>=1000);assert(bytes.readUInt32BE(20)>=1000);hashes.push(createHash('sha256').update(bytes).digest('hex'));}
 assert.equal(new Set(hashes).size,11,'Each structure needs its own detailed image');
});
