// Topic-independent registry. Loading data never changes a public conclusion.
export const confidenceDomains=['risk_of_bias','inconsistency','indirectness','imprecision','publication_bias'];
export function createEvidenceBase({claims=[],sources=[],records=[],assessments=[],reviews=[],presentation={},entities=[],relations=[],visualizations=[]}={}){
 const base={claims,sources,records,assessments,reviews,presentation,entities,relations,visualizations};
 const has=(list,id)=>list.some(x=>x.id===id);
 for(const key of ['claims','sources','records','assessments','reviews'])if(new Set(base[key].map(x=>x.id)).size!==base[key].length)throw Error('Duplicate IDs: '+key);
 for(const key of ['entities','relations','visualizations'])if(new Set(base[key].map(x=>x.id)).size!==base[key].length)throw Error('Duplicate IDs: '+key);
 for(const entity of entities)for(const id of entity.claimIds||[])if(!has(claims,id))throw Error('Unresolved entity Claim: '+id);
 for(const r of relations){if(!has(entities,r.fromId)||!has(entities,r.toId))throw Error('Unresolved entity relation: '+r.id);for(const id of r.claimIds||[])if(!has(claims,id))throw Error('Unresolved relation Claim: '+id);}
 for(const v of visualizations){for(const id of v.entityIds||[])if(!has(entities,id))throw Error('Unresolved visual entity: '+id);for(const id of v.claimIds||[])if(!has(claims,id))throw Error('Unresolved visual Claim: '+id);for(const id of v.sourceIds||[])if(!has(sources,id))throw Error('Unresolved visual Source: '+id);}
 for(const r of records)if(!has(claims,r.claimId)||!has(sources,r.sourceId))throw Error('Unresolved EVR: '+r.id);
 for(const a of assessments){if(!has(claims,a.claimId))throw Error('Unresolved assessment: '+a.id);for(const id of a.evidenceRecordIds)if(!records.some(r=>r.id===id&&r.claimId===a.claimId))throw Error('Assessment EVR mismatch: '+id);}
 for(const r of reviews)if(!assessments.some(a=>a.id===r.assessmentId&&a.claimId===r.claimId))throw Error('Unresolved review: '+r.id);
 for(const r of reviews)if(r.status==='approved'){const problems=approvalProblems(r,base);if(problems.length)throw Error('Invalid scientific approval: '+problems.join('; '));}
 return base;
}
export function approvalProblems(review,base){
 const a=base.assessments.find(a=>a.id===review.assessmentId),c=base.claims.find(c=>c.id===review.claimId);const problems=[];
 if(!a||!c||a.claimId!==c.id)return ['Missing or mismatched claim / assessment'];
 if(a.claimVersion!==c.version)problems.push('Stale claim version');
 if(a.status!=='ready_for_review')problems.push('Assessment not ready');
 if(!review.approverId||!review.approvedAt||!review.reason)problems.push('Missing explicit approval provenance');
 if(!a.evidenceRecordIds.length)problems.push('No reviewed evidence');
 for(const id of a.evidenceRecordIds){const r=base.records.find(r=>r.id===id);if(!r||r.claimId!==c.id||r.reviewStatus!=='scientifically_reviewed')problems.push('Unreviewed evidence: '+id);const s=base.sources.find(s=>s.id===r?.sourceId);if(!s||['retracted','withdrawn','expression_of_concern'].includes(s.sourceStatus))problems.push('Source requires reassessment: '+id);}
 for(const domain of confidenceDomains){const d=a.domains[domain];if(!d||d.status!=='assessed'||!d.rationale)problems.push('Unassessed domain: '+domain);}
 return problems;
}
