import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {creatineClaims} from '../src/evidence/creatine/claims.ts';
import {creatineEvidenceRecords} from '../src/evidence/creatine/evidenceRecords.ts';
import {seedReviewRecords} from '../src/evidence/creatine/reviews.mjs';

// Counts describe the assessment of individual Claims; they never assign confidence to a supplement.
export function summarizeClaims(claims,reviews=[]){
  const assessed=claims.filter(c=>c.evidenceConfidence!=null);
  return {
    total:claims.length,
    assessed:assessed.length,
    provisional:assessed.filter(c=>c.provisional===true).length,
    unassessed:claims.length-assessed.length,
    formalReviewed:claims.filter(c=>reviews.some(r=>r.claimId===c.id&&r.status==='approved')).length
  };
}

export async function buildComparisonStatus(outputDirectory='dist'){
  const routes=new Map([['creatine',{claims:[...creatineClaims],reviews:seedReviewRecords(creatineClaims,creatineEvidenceRecords).reviews}]]);
  for(const [slug,prefix] of [['creatine-more','creatineMore'],['protein','protein'],['caffeine','caffeine'],['omega','omega'],['vitd','vitd'],['magnesium','magnesium'],['collagen','collagen'],['beta-alanine','betaAlanine'],['citrulline','citrulline'],['electrolytes','electrolytes'],['berberine','berberine']]){
    const data=await import(`../src/evidence/supplements/${slug}/module.mjs`);
    const module=data[prefix+'Module'],base=data[prefix+'Base'];
    const claims=module.claimIds.map(id=>{
      const claim=base.claims.find(c=>c.id===id);
      if(!claim)throw Error('Comparison Claim missing: '+id);
      return claim;
    });
    const previous=routes.get(module.route)||{claims:[],reviews:[]};
    routes.set(module.route,{claims:[...previous.claims,...claims],reviews:[...previous.reviews,...base.reviews]});
  }
  const comparisonStatus=Object.fromEntries([...routes].map(([route,{claims,reviews}])=>[route,summarizeClaims(claims,reviews)]));
  fs.mkdirSync(outputDirectory,{recursive:true});
  fs.writeFileSync(path.join(outputDirectory,'compare-status.js'),'// Generated from canonical Claims and scientific review records; no supplement-wide confidence.\nexport const comparisonStatus='+JSON.stringify(comparisonStatus)+';\n');
  return comparisonStatus;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildComparisonStatus(process.argv[2]);
