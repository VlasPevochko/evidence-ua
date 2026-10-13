// Review-only extraction layer. No public imports or scientific approval.
export const extractionSources = [
  { id: 'DRAFT-SRC-021', topic: 'caffeine', pmid: '42356375', doi: '10.3390/nu18121989', access: 'abstract', locator: 'PubMed Abstract: Methods / Results', fullTextAudit: false },
  { id: 'DRAFT-SRC-022', topic: 'vitd', pmid: '42161415', doi: '10.1136/bmj-2025-088050', access: 'abstract', locator: 'PubMed Abstract: Eligibility criteria / Results', fullTextAudit: false },
  { id: 'DRAFT-SRC-023', topic: 'magnesium', pmid: '32956536', doi: '10.1002/14651858.CD009402.pub3', access: 'official_review_summary_and_abstract', locator: 'Cochrane Main results: primary endpoint, four weeks', fullTextAudit: false },
  { id: 'DRAFT-SRC-024', topic: 'citrulline', pmid: '42356270', doi: '10.3390/nu18121881', access: 'full_text', locator: 'PMC13304508, section 3.3 Primary Analysis', fullTextAudit: false },
].map(s => ({ ...s, url: `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`, publicationStatusCheck: 'pending', checkedAt: '2026-10-11' }));

export const extractionQuestions = [
  { id: 'DRAFT-Q-001', topic: 'caffeine', outcome: 'Час завершення аеробного тесту', population: 'Здорові дорослі 18–59 років', intervention: 'Гострий прийом безводного кофеїну', comparator: 'Плацебо', limitations: ['Не автоматично кава, силові тести або тривалий прийом.', 'Порівняння окремих оцінок підгруп не встановлює перевагу дози.'] },
  { id: 'DRAFT-Q-002', topic: 'vitd', outcome: 'Будь-який перелом', population: 'Дорослі без медикаментозного лікування остеопорозу у включених РКД', intervention: 'Вітамін D окремо', comparator: 'Плацебо або відсутність втручання', limitations: ['Не об’єднувати з D + кальцій.', 'Не переносити автоматично на лікування дефіциту; перевірити підгрупи й перекриття trials.'] },
  { id: 'DRAFT-Q-003', topic: 'magnesium', outcome: 'Процентна зміна кількості судом за тиждень від вихідного рівня через чотири тижні', population: 'Переважно літні люди з ідіопатичними судомами у включених РКД', intervention: 'Магній', comparator: 'Плацебо', limitations: ['Огляд 2020 року, пошук до вересня 2019 року.', 'Не судоми під час фізичних навантажень; потрібен пошук новіших РКД.'] },
  { id: 'DRAFT-Q-004', topic: 'citrulline', outcome: 'Загальна фізична працездатність у різних тестах', population: 'Учасники включених РКД; точна застосовність потребує аудиту', intervention: 'Цитрулін малат, гострі й тривалі протоколи', comparator: 'Контроль включених РКД; умови перевірити у додатках', limitations: ['Широкий прогнозний інтервал.', '138 — оцінки ефекту, не дослідження.', 'Не визначає оптимальну дозу або час; не розв’язує питання болючості через 48 годин.'] },
].map(q => ({ ...q, evidenceLayer: 'human_outcome', confidenceFramework: 'GRADE-informed', evidenceConfidence: null, status: 'draft', scientificApproval: null }));

const record = (id, sourceId, questionId, metric, estimate, lower, upper, unit, context) => ({ id, sourceId, questionId, result: { metric, estimate, ci95: { lower, upper }, unit }, context, reviewStatus: 'pending', publicationApproved: false, extractedAt: '2026-10-11' });
export const extractionRecords = [
  record('DRAFT-EVR-023', 'DRAFT-SRC-021', 'DRAFT-Q-001', 'standardized_mean_difference', -0.27, -0.44, -0.11, null, { doseCategory: 'low', studyCount: null, participants: null, lowerIsBetter: true, note: '48 studies / 689 participants refer to the review, not this subgroup.' }),
  record('DRAFT-EVR-024', 'DRAFT-SRC-021', 'DRAFT-Q-001', 'standardized_mean_difference', -0.52, -0.77, -0.28, null, { doseCategory: 'moderate', studyCount: null, participants: null, lowerIsBetter: true }),
  record('DRAFT-EVR-025', 'DRAFT-SRC-022', 'DRAFT-Q-002', 'risk_ratio', 1.00, 0.95, 1.06, null, { studyCount: 36, participants: 92045 }),
  record('DRAFT-EVR-026', 'DRAFT-SRC-023', 'DRAFT-Q-003', 'mean_difference', -9.59, -23.14, 3.97, 'percentage_points', { studyCount: 3, participants: 177, weeks: 4, note: 'Difference in percentage change; not absolute cramps per week or effectiveness percentage.' }),
  record('DRAFT-EVR-027', 'DRAFT-SRC-024', 'DRAFT-Q-004', 'hedges_g', 0.16, 0.05, 0.27, null, { studyCount: 30, participants: 644, effectEstimateCount: 138, predictionInterval: { lower: -0.37, upper: 0.69 }, note: 'Counts describe the pooled review; primary extraction and supplements remain pending.' }),
];

export function validateExtractions(sources = extractionSources, questions = extractionQuestions, records = extractionRecords) {
  for (const list of [sources, questions, records]) if (new Set(list.map(x => x.id)).size !== list.length) throw Error('Duplicate ID');
  for (const q of questions) if (q.evidenceConfidence !== null || q.scientificApproval !== null) throw Error('Unapproved scientific assessment');
  for (const r of records) {
    if (!sources.some(s => s.id === r.sourceId) || !questions.some(q => q.id === r.questionId)) throw Error('Broken provenance');
    if (r.result.ci95.lower > r.result.estimate || r.result.ci95.upper < r.result.estimate) throw Error('Invalid interval');
    if (r.publicationApproved || r.reviewStatus !== 'pending') throw Error('Premature publication');
  }
  return { sources: sources.length, questions: questions.length, records: records.length };
}
export function assertExtractionsPublishable() { throw Error('NOT approved for public use'); }
