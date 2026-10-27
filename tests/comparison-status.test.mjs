import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {test,after} from 'node:test';
import {supplements} from '../dist/supplements.js';
import {buildComparisonStatus,summarizeClaims} from '../scripts/build-comparison-status.mjs';

// The focused builder test never rebuilds the shared dist snapshot.
const runtimeDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'eua-compare-runtime-'));
after(()=>fs.rmSync(runtimeDirectory,{recursive:true,force:true}));
await buildComparisonStatus(runtimeDirectory);
const runtime=fs.readFileSync('dist/compare-page.js','utf8')
  .replace(/'\.\/supplements\.js\?v=\d+'/,JSON.stringify(pathToFileURL(path.resolve('dist/supplements.js')).href))
  .replace(/'\.\/compare-status\.js\?v=\d+'/,JSON.stringify(pathToFileURL(path.join(runtimeDirectory,'compare-status.js')).href));
const {rows,reviewStatus}=await import('data:text/javascript;base64,'+Buffer.from(runtime).toString('base64'));

test('protein and caffeine comparison acknowledges existing provisional Claim assessments',()=>{
  for(const id of ['supplement-protein','supplement-caffeine']){
    const item=supplements.find(s=>s.id===id),result=rows(item);
    assert.match(result[3][1],/Попередні оцінки окремих тверджень/);
    assert.doesNotMatch(result[3][1],/^Рівень впевненості не оцінено/);
    assert.equal(result[1][1],item.summary);assert.equal(result[2][1],item.limit);
  }
});
test('comparison status is compact generated metadata from canonical Claims',async()=>{
  assert(fs.existsSync('scripts/build-comparison-status.mjs'),'comparison metadata builder exists');
  const claims=[{id:'a',evidenceConfidence:'high',provisional:true,publicationApproved:true},{id:'b',evidenceConfidence:null,provisional:true},{id:'c',evidenceConfidence:'low',provisional:true,confidenceAcceptance:{formalScientificReview:false}}];
  assert.deepEqual(summarizeClaims(claims),{total:3,assessed:2,provisional:2,unassessed:1,formalReviewed:0});
  assert.deepEqual(summarizeClaims(claims,[{claimId:'a',status:'pending'},{claimId:'b',status:'approved'}]),{total:3,assessed:2,provisional:2,unassessed:1,formalReviewed:1});
  assert.deepEqual(summarizeClaims([{id:'null',evidenceConfidence:null}]),{total:1,assessed:0,provisional:0,unassessed:1,formalReviewed:0});
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'eua-compare-'));
  try{
    await buildComparisonStatus(directory);
    const file=path.join(directory,'compare-status.js'),generated=fs.readFileSync(file,'utf8');
    assert(generated.length<3000,'browser metadata stays small');assert(!/\bimport\b/.test(generated),'browser metadata loads no science bundles');
    const {comparisonStatus}=await import(pathToFileURL(file));
    assert.deepEqual(Object.keys(comparisonStatus).sort(),supplements.map(s=>s.id).sort());
    const {proteinBase}=await import('../src/evidence/supplements/protein/module.mjs');
    const {caffeineBase}=await import('../src/evidence/supplements/caffeine/module.mjs');
    assert.deepEqual(comparisonStatus['supplement-protein'],summarizeClaims(proteinBase.claims,proteinBase.reviews));
    assert.deepEqual(comparisonStatus['supplement-caffeine'],summarizeClaims(caffeineBase.claims,caffeineBase.reviews));
    assert.equal(comparisonStatus.creatine.total,16,'legacy creatine Claims and its additional module both count');
    assert.equal(comparisonStatus['supplement-protein'].total,5);assert.equal(comparisonStatus['supplement-caffeine'].total,8);
    for(const status of Object.values(comparisonStatus)){assert.equal(status.assessed+status.unassessed,status.total);assert.equal(status.formalReviewed,0);}
    assert.match(reviewStatus(summarizeClaims(claims)),/2 із 3/);assert.match(reviewStatus(summarizeClaims(claims)),/Не оцінено: 1/);
    assert.match(reviewStatus(summarizeClaims(claims)),/Формальний науковий перегляд не завершено/);
    assert.match(reviewStatus(summarizeClaims([{id:'null',evidenceConfidence:null}])),/Рівень впевненості не оцінено/);
    assert.match(reviewStatus(undefined),/Стан оцінки тверджень не внесено/);
    assert.match(reviewStatus(summarizeClaims([])),/Стан оцінки тверджень не внесено/);
    const mixed=summarizeClaims([{id:'a',evidenceConfidence:'high',provisional:false},{id:'b',evidenceConfidence:'low',provisional:true},{id:'c',evidenceConfidence:null}]);
    assert.match(reviewStatus(mixed),/Оцінено окремі твердження: 2 із 3; попередніх оцінок: 1/);
    assert.doesNotMatch(reviewStatus(mixed),/завершено для всіх/);
    const reviewed=summarizeClaims([{id:'a',evidenceConfidence:'high',provisional:false}],[{claimId:'a',status:'approved'}]);
    assert.match(reviewStatus(reviewed),/Формальний науковий перегляд завершено для всіх тверджень/);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
