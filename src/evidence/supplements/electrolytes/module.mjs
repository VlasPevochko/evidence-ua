// Електроліти: формулювання погоджено власником 22.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Borra 2025, De Brier 2025, Rowlands 2021, NATA 2017 (McDermott), Sutehall 2022.
// SRC-000020 продовжує чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-22';
export const electrolytesAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-22T16:19:00+03:00',
  scope: 'Електроліти: чотири твердження й докази до них (погоджено власником у робочому чаті 22.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: electrolytesAcceptance};

export const electrolytesModule = {
  id: 'MOD-SUPPLEMENTS-ELECTROLYTES-001', title: 'Електроліти', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-electrolytes', replacesDossier: 'DOS-ELECTROLYTES',
  claimIds: ['CLM-000101', 'CLM-000102', 'CLM-000103', 'CLM-000104'],
  notClaimed: [
    {topic: 'Електроліти потрібні на кожному тренуванні', reason: 'Досліджені переваги стосуються тривалих навантажень, спеки й відновлення після зневоднення.'},
    {topic: 'Електроліти запобігають судомам', reason: 'Ми це питання не розбирали; висновків не робимо.'}
  ],
  commonLimits: ['Досліджень мало, вони невеликі й різні за протоколами; певність часто низька або дуже низька.', 'Майже всі учасники — чоловіки.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.']
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['electrolytes'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Напої з вуглеводами й електролітами'}, comparator: {description: 'Вода'}, ...o});

const claims = [
  claim('CLM-000101', {
    statement: 'Після зневоднення від навантаження напої з вуглеводами й електролітами (4–9%) можуть відновлювати рідину краще за воду; знежирене молоко теж краще за воду, кокосова вода — не краща.',
    shortStatement: 'Після зневоднення спортивний напій чи молоко — краще за воду.',
    outcome: {name: 'Відновлення рідини після навантаження'}, population: {description: 'Дорослі й діти зі зневодненням після фізичного навантаження.'},
    evidenceSummary: 'В огляді Borra 2025 (19 досліджень) напої з 4–9% (або 0–3,9%) вуглеводів і електролітів можуть бути ефективними для відновлення рідини порівняно з водою. В огляді De Brier 2025 (11 досліджень) знежирене або нежирне молоко без їжі покращувало водний баланс порівняно з водою (дуже низька певність); свіжа кокосова вода не відрізнялася від води; даних про пиво недостатньо.',
    limitations: ['Дослідження різні за протоколами; без метааналізу.', 'Певність для молока дуже низька.']
  }),
  claim('CLM-000102', {
    statement: 'Під час тривалого навантаження гіпотонічні напої з вуглеводами й електролітами краще зберігають об’єм плазми, ніж вода, але різниця мала — близько 1%.',
    shortStatement: 'Гіпотонічний напій трохи краще за воду (~1%).',
    outcome: {name: 'Зміна об’єму плазми під час навантаження'}, population: {description: '28 досліджень безперервного навантаження.'},
    evidenceSummary: 'У метааналізі Rowlands 2021 об’єм плазми знижувався на 6,3% з гіпотонічними напоями, на 7,5% з водою, на 8,7% з ізотонічними й на 7,4% з гіпертонічними. Перевага гіпотонічних над водою — 1,1% (90% інтервал 0,1…2,0), над ізотонічними — 2,3% (1,1…3,5).',
    limitations: ['90% інтервали сумісності (байєсівська модель), а не 95% довірчі.', 'Об’єм плазми — проміжний показник, а не спортивний результат.']
  }),
  claim('CLM-000103', {
    claimType: 'safety',
    statement: 'Пити забагато теж ризиковано: надлишок рідини загрожує гіпонатріємією (низьким натрієм у крові), тому мета — покрити втрати, а не пити якомога більше.',
    shortStatement: 'Перепивати небезпечно: ризик гіпонатріємії.',
    outcome: {name: 'Гіпонатріємія, недостатня й надмірна гідратація'}, population: {description: 'Фізично активні люди.'},
    intervention: {name: 'Пиття під час навантаження'}, comparator: {description: 'Не застосовується (позиційний документ)'},
    evidenceSummary: 'Позиційний документ NATA 2017: і нестача рідини, і надмірне пиття можуть погіршувати результати й шкодити здоров’ю. Спортсменам потрібен доступ до води, але вони мають знати про ризики перепивання й гіпонатріємії. Рекомендовано оцінювати власну швидкість потовиділення й пити достатньо, але не надмірно.',
    limitations: ['Позиційний документ, а не окреме дослідження.']
  }),
  claim('CLM-000104', {
    statement: 'Гідрогелі (альгінат натрію з пектином) у вуглеводному напої не дали переваги в результатах.',
    shortStatement: 'Гідрогелі переваги не дають.',
    outcome: {name: 'Результат на витривалість, окиснення вуглеводів, глюкоза'}, population: {description: 'Здорові спортсмени; 10 досліджень, 7 у метааналізі.'},
    intervention: {name: 'Вуглеводний напій з альгінатом натрію й пектином'}, comparator: {description: 'Такий самий за калоріями вуглеводний напій'},
    evidenceSummary: 'У метааналізі Sutehall 2022 різниці не виявлено ні в результаті (p = 0,59), ні в окисненні вуглеводів (p = 0,71), ні в глюкозі крові (p = 0,66). Ризик упередженості загалом низький.',
    limitations: ['Частина досліджень мала низьку інтенсивність, за якої і самі вуглеводи не давали переваги.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000108', {title: 'Oral Rehydration Beverages for Treating Exercise-Associated Dehydration: A Systematic Review, Part I. Carbohydrate-Electrolyte Solutions', authors: ['Borra V', 'De Brier N', 'Berry DC', 'et al.'], year: 2025, journal: 'Journal of Athletic Training', doi: '10.4085/1062-6050-0682.22', pmid: '38116803', pmcid: 'PMC11789749', shortCitation: 'Borra V et al. · 2025', populationSummary: '19 досліджень.', keyLimitations: ['Без метааналізу; різні протоколи.']}),
  source('SRC-000109', {title: 'Oral Rehydration Beverages for Treating Exercise-Associated Dehydration: A Systematic Review, Part II. The Effectiveness of Alternatives to Carbohydrate-Electrolyte Drinks', authors: ['De Brier N', 'Borra V', 'Berry DC', 'et al.'], year: 2025, journal: 'Journal of Athletic Training', doi: '10.4085/1062-6050-0686.22', pmid: '38116818', pmcid: 'PMC11789751', shortCitation: 'De Brier N et al. · 2025', populationSummary: '11 досліджень.', keyLimitations: ['Дуже низька певність.']}),
  source('SRC-000110', {title: 'The Hydrating Effects of Hypertonic, Isotonic and Hypotonic Sports Drinks and Waters on Central Hydration During Continuous Exercise: A Systematic Meta-Analysis and Perspective', authors: ['Rowlands DS', 'Kopetschny BH', 'Badenhorst CE'], year: 2021, journal: 'Sports Medicine', publicationType: 'systematic_review_meta_analysis', doi: '10.1007/s40279-021-01558-y', pmid: '34716905', pmcid: 'PMC8803723', shortCitation: 'Rowlands DS et al. · 2021', populationSummary: '28 досліджень, 68 порівнянь напоїв.', keyLimitations: ['90% інтервали; проміжний показник.']}),
  source('SRC-000020', {title: 'National Athletic Trainers’ Association Position Statement: Fluid Replacement for the Physically Active', authors: ['McDermott BP', 'Anderson SA', 'Armstrong LE', 'et al.'], year: 2017, journal: 'Journal of Athletic Training', publicationType: 'position_statement', doi: '10.4085/1062-6050-52.9.02', pmid: '28985128', pmcid: 'PMC5634236', shortCitation: 'McDermott BP et al. · 2017 (NATA)', populationSummary: 'Позиційний документ.', keyLimitations: ['Не окреме дослідження.']}),
  source('SRC-000111', {title: 'The Effect of Sodium Alginate and Pectin Added to a Carbohydrate Beverage on Endurance Performance, Substrate Oxidation and Blood Glucose Concentration: A Systematic Review and Meta-analysis', authors: ['Sutehall S', 'Muniz-Pardos B', 'Bosch A', 'Pitsiladis Y'], year: 2022, journal: 'Sports Medicine — Open', publicationType: 'systematic_review_meta_analysis', doi: '10.1186/s40798-022-00472-5', pmid: '35727377', pmcid: 'PMC9213602', shortCitation: 'Sutehall S et al. · 2022', populationSummary: '10 досліджень, 7 у метааналізі.', keyLimitations: ['Низька інтенсивність у частині досліджень.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const pv = (estimate, lowerCI, upperCI) => ({effectMeasure: 'Різниця зміни об’єму плазми', estimate, lowerCI, upperCI, unit: 'pp', confidenceLevel: 90, intervalType: '90% інтервал сумісності'});
const records = [
  record('EVR-000211', 'SRC-000108', 'CLM-000101', {roleForClaim: 'primary_support', outcome: {name: 'Відновлення рідини: напої 4–9% проти води'}, result: {summary: 'Напої з 0–3,9% і особливо 4–9% вуглеводів і електролітів можуть бути ефективними для відновлення рідини порівняно з водою.'}, populationContext: {description: '19 досліджень'}}),
  record('EVR-000212', 'SRC-000109', 'CLM-000101', {outcome: {name: 'Молоко, кокосова вода, пиво проти води'}, result: {summary: 'Знежирене або нежирне молоко — кращий водний баланс (4 дослідження, дуже низька певність); кокосова вода — без різниці (3 дослідження); пиво — даних недостатньо.'}, populationContext: {description: '11 досліджень'}}),
  record('EVR-000213', 'SRC-000110', 'CLM-000102', {roleForClaim: 'primary_support', outcome: {name: 'Гіпотонічний напій проти води'}, result: pv(1.1, 0.1, 2.0), populationContext: {description: '28 досліджень; p(перевага) = 0,72'}}),
  record('EVR-000214', 'SRC-000110', 'CLM-000102', {outcome: {name: 'Гіпотонічний напій проти ізотонічного'}, result: pv(2.3, 1.1, 3.5), populationContext: {description: 'p(перевага) = 0,984'}}),
  record('EVR-000215', 'SRC-000020', 'CLM-000103', {roleForClaim: 'primary_support', outcome: {name: 'Ризики недостатнього й надмірного пиття'}, result: {summary: 'І нестача рідини, і надмірне пиття можуть погіршувати результати й шкодити здоров’ю; потрібно знати про ризики перепивання й гіпонатріємії та пити достатньо, але не надмірно.'}, populationContext: {description: 'Позиційний документ NATA'}}),
  record('EVR-000216', 'SRC-000111', 'CLM-000104', {roleForClaim: 'primary_support', outcome: {name: 'Результат на витривалість'}, result: {summary: 'Різниці не виявлено: результат p = 0,59 (5 досліджень), окиснення вуглеводів p = 0,71, глюкоза p = 0,66.'}, populationContext: {description: '7 досліджень у метааналізі; I² = 0%'}})
];

export const electrolytesBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000101': 'Після зневоднення', 'CLM-000102': 'Під час навантаження', 'CLM-000103': 'Перепивання', 'CLM-000104': 'Гідрогелі'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
