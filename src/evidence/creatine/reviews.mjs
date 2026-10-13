// Imported provisional assessments, NOT completed GRADE or scientific approvals.
export function seedReviewRecords(claims,records){
 const assessments=claims.map(c=>({
  id:c.id.replace('CLM-','ASM-'),claimId:c.id,claimVersion:c.version,
  framework:c.confidenceFramework,status:'draft',proposedConfidence:c.evidenceConfidence,
  evidenceRecordIds:records.filter(r=>r.claimId===c.id).map(r=>r.id),
  rationale:c.confidenceRationale.summary,
  domains:Object.fromEntries(['risk_of_bias','inconsistency','indirectness','imprecision','publication_bias'].map(d=>[d,{status:'not_assessed',rationale:'Outcome-level оцінка ще не завершена; це не означає відсутність проблем.'}])),
  createdAt:'2026-10-10',origin:'provisional_seed'
 }));
 const reviews=assessments.map(a=>({id:a.id.replace('ASM-','REV-'),claimId:a.claimId,assessmentId:a.id,status:'pending',approverId:null,approvedAt:null,reason:null,
  history:[{at:'2026-10-10',event:'seed_import',actorRole:'technical_migration',note:'Попередню оцінку перенесено без зміни висновку. Наукове схвалення не виконане.'}]}));
 return {assessments,reviews};
}
