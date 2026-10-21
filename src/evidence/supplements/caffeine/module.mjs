// Кофеїн: формулювання погоджено власником 21.10.2026 («Так»). Рівень впевненості свідомо не оцінено.
// Витяг: анотації PubMed — Martins 2026, Grgic 2019 (umbrella), Grgic 2018, Xiao 2025, Zhu 2026, Liang 2026,
// Gardiner 2023, Chang 2025, Gualberto 2024, Grinberg 2022, Greenwood 2014, Miraftabi 2026; ISSN 2021 (Guest).
// EFSA 2015: сам висновок із цього середовища не відкрився; числа звірено з переказом EUFIC (див. methodsSummary).
// SRC-000013 продовжує чернетку supplements/scientific-draft.mjs (вона не публікується).
import {createEvidenceBase} from '../../core/registry.mjs';

const checked = '2026-10-21';
export const caffeineAcceptance = {
  kind: 'user_wording_approval', at: '2026-10-21T14:20:00+03:00',
  scope: 'Кофеїн: вісім тверджень і докази до них (погоджено власником у робочому чаті 21.10.2026)',
  confidenceAssessed: false, formalScientificReview: false
};
const accepted = {publicationApproved: true, publicationAcceptance: caffeineAcceptance};

export const caffeineModule = {
  id: 'MOD-SUPPLEMENTS-CAFFEINE-001', title: 'Кофеїн', status: 'educational', version: '1.0', scientificApproval: null, ...accepted,
  route: 'supplement-caffeine', replacesDossier: 'DOS-CAFFEINE',
  claimIds: ['CLM-000076', 'CLM-000077', 'CLM-000078', 'CLM-000079', 'CLM-000080', 'CLM-000081', 'CLM-000082', 'CLM-000083'],
  notClaimed: [
    {topic: 'Звичка до кави «вимикає» ефект', reason: 'Дані суперечливі: в одних оглядах ефект менший у тих, хто п’є багато кави (Xiao 2025, Miraftabi 2026), в інших надійного впливу звички не знайдено (Zhu 2026, Liang 2026).'},
    {topic: 'Генетичний тест підкаже дозу', reason: 'ISSN пов’язує різну реакцію з генетикою обміну кофеїну, але перевіреного способу підбирати дозу за тестом ми не знайшли.'},
    {topic: 'Покращує мислення в дорослих спортсменів', reason: 'Переконливих даних у нашій вибірці немає: у жінок командних видів спорту ефект на мислення не доведено (Li 2026), а метааналіз про мислення стосувався людей до 20 років.'}
  ],
  commonLimits: ['Більшість досліджень — короткі лабораторні тести в молодих тренованих чоловіків; на змагання й щоденний прийом результати переносимо обережно.', 'Ефекти — стандартизовані різниці середніх (SMD, g): 0,2 — малий, 0,5 — помірний. Це не відсотки покращення.', 'Часто важко зберегти «сліпоту»: люди можуть відчути кофеїн і здогадатися, що прийняли.', 'Оцінки певності — авторів оглядів, а не Evidence UA. Прочитано анотації в PubMed, не повні тексти.'],
  guidance: {title: 'Практичний орієнтир для здорових дорослих — з позиційного документа ISSN 2021, не окреме твердження', dose: '3–6 мг/кг приблизно за 60 хв до навантаження', note: 'Мінімальна дієва доза, можливо, близько 2 мг/кг. Дози близько 9 мг/кг дають багато побічних ефектів і не потрібні. Рахуй і каву, чай, енергетики та передтренувальні добавки.'}
};

const notAssessed = {evidenceConfidence: null, confidenceFramework: 'not_assessed', confidenceRationale: {summary: 'Рівень впевненості Evidence UA для цього твердження не оцінено. Погодження формулювання не є завершеним науковим переглядом.'}};
const claim = (id, o) => ({id, claimType: 'efficacy', evidenceLayer: 'human_outcome', domain: 'supplements', topics: ['caffeine'], ...notAssessed, entityIds: [], status: 'educational', version: '1.0', lastReviewed: null, nextReview: null, scientificApproval: null, ...accepted,
  intervention: {name: 'Кофеїн одноразово перед навантаженням (переважно капсули безводного кофеїну)'}, comparator: {description: 'Плацебо'}, ...o});
const adults = {description: 'Здорові дорослі, переважно треновані молоді чоловіки, у рандомізованих плацебо-контрольованих дослідженнях.'};

const claims = [
  claim('CLM-000076', {
    statement: 'Кофеїн перед навантаженням допомагає швидше пройти дистанцію на витривалість: ефект малий у дозі до 3 мг/кг і помірний у дозі 4–6 мг/кг.',
    shortStatement: 'Швидше на дистанції: малий ефект до 3 мг/кг, помірний — 4–6 мг/кг.',
    outcome: {name: 'Час проходження аеробного тесту на час'}, population: {description: 'Здорові дорослі 18–59 років; 48 РКД, 689 учасників.'},
    evidenceSummary: 'У метааналізі Martins 2026 низькі дози (до 3 мг/кг) скорочували час тесту: стандартизована різниця −0,27; помірні (4–6 мг/кг) — −0,52. Від’ємне число означає менший час, тобто кращий результат. Парасольковий огляд Grgic 2019 (21 метааналіз) також оцінює ефект на аеробну витривалість як доведений з помірною якістю доказів.',
    limitations: ['Досліджень з дозами понад 6 мг/кг у цьому метааналізі не було.', 'Порівняння двох оцінок саме по собі не доводить перевагу помірної дози.', 'Число — стандартизована різниця, а не секунди чи відсотки.']
  }),
  claim('CLM-000077', {
    statement: 'Кофеїн трохи покращує максимальну силу, висоту стрибка й швидкість штанги.',
    shortStatement: 'Трохи більше сили, стрибок і швидкість штанги.',
    outcome: {name: 'Максимальна сила (1ПМ), стрибок, швидкість і потужність у вправах з обтяженням'}, population: adults,
    evidenceSummary: 'У метааналізі Grgic 2018 сила в тесті 1ПМ зросла на 0,20 стандартизованої різниці, потужність у стрибку — на 0,17; для сили ніг окремо різниці не виявлено. У метааналізі Xiao 2025 середня швидкість штанги зросла на 0,42, потужність — на 0,21.',
    limitations: ['Нижня межа інтервалу для стрибка — 0,00: ефект на межі виявлення.', 'Для швидкості штанги неоднорідність досліджень висока (I² = 85%).']
  }),
  claim('CLM-000078', {
    statement: 'У жінок кофеїн теж дає невелике покращення результатів, а підстав підбирати дозу під фазу менструального циклу чи прийом контрацептивів немає.',
    shortStatement: 'Невелике покращення; фаза циклу дозу не змінює.',
    outcome: {name: 'Фізичні результати, максимальна сила'}, population: {description: 'Жінки в РКД з кофеїном перед навантаженням.'},
    evidenceSummary: 'У метааналізі Zhu 2026 (20 досліджень) загальний ефект g = 0,37, позитивний у всіх фазах циклу й при контрацепції без надійної різниці між ними. У Liang 2026 (24 дослідження) максимальна сила зросла на g = 0,17. Певність доказів автори обох оглядів оцінюють як низьку або дуже низьку.',
    limitations: ['Фазу циклу в дослідженнях часто не підтверджували аналізами.', 'Інтервал прогнозу в Zhu 2026 перетинає нуль: в окремих умовах ефекту може не бути.']
  }),
  claim('CLM-000079', {
    claimType: 'safety',
    statement: 'Кофеїн перед сном скорочує сон у середньому на 35–45 хвилин і подовжує засинання приблизно на 8–9 хвилин.',
    shortStatement: 'Мінус 35–45 хв сну, засинання довше на 8–9 хв.',
    outcome: {name: 'Загальний час сну, час засинання (полісомнографія)'}, population: {description: 'Здорові дорослі в контрольованих дослідженнях сну.'},
    intervention: {name: 'Кофеїн перед нічним сном'},
    evidenceSummary: 'У метааналізі Gardiner 2023 (24 дослідження) кофеїн скорочував сон на 45 хв і подовжував засинання на 9 хв; глибокого сну ставало менше. Автори розрахували, що каву (107 мг на 250 мл) варто пити щонайменше за 8,8 год до сну, а порцію передтренувальної добавки (217,5 мг) — за 13,2 год. У метааналізі Chang 2025 (22 перехресні дослідження, 956 учасників) сон скорочувався на 34,7 хв, засинання подовжувалось на 8,4 хв.',
    limitations: ['Довірчі інтервали в анотаціях не наведено.', 'Чутливість до кофеїну індивідуальна; години до сну — розрахунок для середньої людини.']
  }),
  claim('CLM-000080', {
    claimType: 'safety',
    statement: 'Енергетики тимчасово підвищують систолічний тиск: у спокої приблизно на 5 мм рт. ст., під час навантаження — приблизно на 9.',
    shortStatement: 'Енергетики: +5 у спокої, +9 під час навантаження.',
    outcome: {name: 'Систолічний артеріальний тиск'}, population: {description: 'Здорові дорослі в РКД з енергетичними напоями.'},
    intervention: {name: 'Енергетичні напої з кофеїном (не чистий кофеїн)'}, comparator: {description: 'Контрольний напій'},
    evidenceSummary: 'У метааналізі Gualberto 2024 (17 РКД) систолічний тиск у спокої був вищим на 4,71 мм рт. ст. через 60–80 хв після енергетика (помірна певність за авторами). У метааналізі Grinberg 2022 (21 РКД) під час аеробного навантаження систолічний тиск був вищим на 9,02 мм рт. ст., пульс — на 2,86 уд/хв.',
    limitations: ['Енергетики містять не лише кофеїн; висновок не переносимо напряму на каву чи капсули.', 'Мало досліджень, частина з високим ризиком упередженості.', 'Даних про людей з гіпертонією тут немає.']
  }),
  claim('CLM-000081', {
    claimType: 'safety',
    statement: 'За висновком EFSA для здорових дорослих безпечно до 400 мг кофеїну на добу і до 200 мг за один раз; для вагітних і жінок, які годують, — до 200 мг на добу; для дітей і підлітків — до 3 мг/кг на добу.',
    shortStatement: 'Дорослим до 400 мг/добу і 200 мг за раз; вагітним — до 200 мг.',
    outcome: {name: 'Безпечні рівні споживання'}, population: {description: 'Загальна популяція ЄС.'},
    intervention: {name: 'Кофеїн з усіх джерел'}, comparator: {description: 'Не застосовується (регуляторна оцінка)'},
    evidenceSummary: 'Наукова думка EFSA 2015: разові дози до 200 мг і до 400 мг за добу не викликають занепокоєння щодо безпеки в здорових дорослих, зокрема тих, хто інтенсивно тренується. Для вагітних і жінок, які годують груддю, — до 200 мг на добу. Для дітей і підлітків запропоновано обережний рівень 3 мг/кг маси тіла на добу. У деяких людей сон може погіршуватися вже від близько 100 мг перед сном.',
    limitations: ['Це регуляторна оцінка, а не окреме дослідження.', 'Повний текст висновку з цього середовища не відкрився; числа звірено з офіційним переказом EUFIC.', 'Межі не стосуються людей з хворобами серця чи іншими станами — для них питання до лікаря.']
  }),
  claim('CLM-000082', {
    claimType: 'safety',
    statement: 'Під час вагітності більше кофеїну пов’язане з вищим ризиком викидня й малої ваги дитини; це спостережні дані з можливими викривленнями, тому межа в 200 мг на добу — розумна обережність.',
    shortStatement: 'Більше кофеїну — вищий ризик викидня й малої ваги; тримай до 200 мг.',
    outcome: {name: 'Викидень, мертвонародження, мала вага при народженні'}, population: {description: 'Вагітні жінки; 53 когортні й «випадок-контроль» дослідження.'},
    intervention: {name: 'Кожні додаткові 100 мг кофеїну на добу'}, comparator: {description: 'Менше споживання кофеїну'},
    evidenceSummary: 'У дозозалежному метааналізі Greenwood 2014 кожні додаткові 100 мг на добу були пов’язані з ризиком викидня вищим на 14% (10–19%), мертвонародження — на 19% (5–35%), малої ваги дитини — на 7% (1–12%); для передчасних пологів різниці не виявлено. Безпечного порогу автори не знайшли, але зв’язки помірні й можуть пояснюватися викривленнями.',
    limitations: ['Спостережні дані: не доводять, що причина саме кофеїн.', 'Висока неоднорідність і ознаки публікаційного зсуву.']
  }),
  claim('CLM-000083', {
    statement: 'Жуйка з кофеїном покращує фізичні результати лише дуже мало.',
    shortStatement: 'Ефект дуже малий.',
    outcome: {name: 'Фізичні результати загалом'}, population: {description: '25 досліджень, 390 учасників.'},
    intervention: {name: 'Жувальна гумка з кофеїном'},
    evidenceSummary: 'У метааналізі Miraftabi 2026 загальний ефект становив 0,20 стандартизованої різниці — за оцінкою авторів, незначний на практиці; певність низька або дуже низька. Для сили й силової витривалості різниці не виявлено.',
    limitations: ['Більшість досліджень мали деякі або високі ризики упередженості.']
  })
];

const source = (id, o) => ({id, publicationType: 'systematic_review_meta_analysis', metadataStatus: 'checked', lastChecked: checked, publicationStatus: null, publicationStatusCheck: 'pending', sourceStatus: 'not_checked',
  identifiers: {doi: o.doi, pmid: o.pmid, pmcid: o.pmcid || null}, url: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/' + o.pmid + '/', accessLevel: 'abstract', funding: null, conflicts: null, methodsSummary: 'Прочитано анотацію в PubMed.', ...o});
const sources = [
  source('SRC-000082', {title: 'Dose-Response Effect of Oral Caffeine Use on Aerobic Exercise Performance: A Systematic Review and Meta-Analysis', authors: ['Martins GL', 'Aparecido JM', 'Marquezi ML', 'et al.'], year: 2026, journal: 'Nutrients', doi: '10.3390/nu18121989', pmid: '42356375', pmcid: 'PMC13305852', shortCitation: 'Martins GL et al. · 2026', populationSummary: '48 РКД, 689 здорових дорослих 18–59 років.', keyLimitations: ['Лише тести на час; досліджень з дозою понад 6 мг/кг не було.']}),
  source('SRC-000083', {title: 'Wake up and smell the coffee: caffeine supplementation and exercise performance — an umbrella review of 21 published meta-analyses', authors: ['Grgic J', 'Grgic I', 'Pickering C', 'et al.'], year: 2019, journal: 'British Journal of Sports Medicine', doi: '10.1136/bjsports-2018-100278', pmid: '30926628', shortCitation: 'Grgic J et al. · 2019 (парасольковий огляд)', populationSummary: '11 оглядів, 21 метааналіз.', keyLimitations: ['Більшість первинних досліджень — молоді чоловіки.']}),
  source('SRC-000084', {title: 'Effects of caffeine intake on muscle strength and power: a systematic review and meta-analysis', authors: ['Grgic J', 'Trexler ET', 'Lazinica B', 'Pedisic Z'], year: 2018, journal: 'Journal of the International Society of Sports Nutrition', doi: '10.1186/s12970-018-0216-0', pmid: '29527137', pmcid: 'PMC5839013', shortCitation: 'Grgic J et al. · 2018', populationSummary: '10 досліджень сили (1ПМ) і 10 — стрибка.', keyLimitations: ['Автори радять суворіше контролювати «сліпоту».']}),
  source('SRC-000085', {title: 'Effects of acute caffeine intake on muscular power during resistance exercise: a systematic review and meta-analysis', authors: ['Xiao Y', 'Ding L', 'Xu Z', 'et al.'], year: 2025, journal: 'Frontiers in Nutrition', publicationType: 'systematic_review', doi: '10.3389/fnut.2025.1686283', pmid: '41127092', pmcid: 'PMC12537405', shortCitation: 'Xiao Y et al. · 2025', populationSummary: '12 досліджень, 230 учасників.', keyLimitations: ['Висока неоднорідність для швидкості штанги.']}),
  source('SRC-000086', {title: 'Acute caffeine ingestion and exercise performance in women: a systematic review and meta-analysis of menstrual-cycle phase and hormonal contraceptive status', authors: ['Zhu J', 'Zhang Y', 'Li M', 'et al.'], year: 2026, journal: 'Frontiers in Nutrition', publicationType: 'systematic_review', doi: '10.3389/fnut.2026.1876198', pmid: '42500255', pmcid: 'PMC13395651', shortCitation: 'Zhu J et al. · 2026', populationSummary: '20 досліджень, 144 оцінки ефекту.', keyLimitations: ['Низька або дуже низька певність за GRADE.']}),
  source('SRC-000087', {title: 'Acute caffeine supplementation and resistance exercise performance in female participants: a systematic review and three-level meta-analysis', authors: ['Liang L', 'Chen M', 'Qi B'], year: 2026, journal: 'Frontiers in Physiology', publicationType: 'systematic_review', doi: '10.3389/fphys.2026.1892370', pmid: '42591203', pmcid: 'PMC13461412', shortCitation: 'Liang L et al. · 2026', populationSummary: '24 дослідження, 107 оцінок ефекту.', keyLimitations: ['Низька певність; широкі інтервали прогнозу.']}),
  source('SRC-000088', {title: 'The effect of caffeine on subsequent sleep: A systematic review and meta-analysis', authors: ['Gardiner C', 'Weakley J', 'Burke LM', 'et al.'], year: 2023, journal: 'Sleep Medicine Reviews', doi: '10.1016/j.smrv.2023.101764', pmid: '36870101', shortCitation: 'Gardiner C et al. · 2023', populationSummary: '24 дослідження.', keyLimitations: ['Інтервали в анотації не наведено.']}),
  source('SRC-000089', {title: 'Age- and dose-specific effects of caffeine on sleep: A meta-analysis of controlled crossover trials', authors: ['Chang YH', 'Cheng YC', 'Cheng WJ'], year: 2025, journal: 'Sleep Medicine', doi: '10.1016/j.sleep.2025.106874', pmid: '41124973', shortCitation: 'Chang YH et al. · 2025', populationSummary: '22 перехресні дослідження, 956 здорових дорослих.', keyLimitations: ['Інтервали в анотації не наведено.']}),
  source('SRC-000090', {title: 'Acute effects of energy drink consumption on cardiovascular parameters in healthy adults: a systematic review and meta-analysis of randomized clinical trials', authors: ['Gualberto PIB', 'Benvindo VV', 'Waclawovsky G', 'Deresz LF'], year: 2024, journal: 'Nutrition Reviews', doi: '10.1093/nutrit/nuad112', pmid: '37695306', shortCitation: 'Gualberto PIB et al. · 2024', populationSummary: '17 РКД, здорові дорослі.', keyLimitations: ['Енергетики, а не чистий кофеїн; 6 досліджень з високим ризиком упередженості.']}),
  source('SRC-000091', {title: 'Effects of caffeinated energy drinks on cardiovascular responses during exercise in healthy adults: a systematic review and meta-analysis of randomized controlled trials', authors: ['Grinberg N', 'Benkhedda K', 'Barber J', 'et al.'], year: 2022, journal: 'Applied Physiology, Nutrition, and Metabolism', doi: '10.1139/apnm-2021-0807', pmid: '35358397', shortCitation: 'Grinberg N et al. · 2022', populationSummary: '21 РКД, 296 здорових дорослих.', keyLimitations: ['Енергетики, а не чистий кофеїн; мало даних.']}),
  source('SRC-000092', {title: 'Scientific Opinion on the safety of caffeine', authors: ['EFSA NDA Panel'], year: 2015, journal: 'EFSA Journal', publicationType: 'regulatory_opinion', doi: '10.2903/j.efsa.2015.4102', pmid: null, url: 'https://doi.org/10.2903/j.efsa.2015.4102', pubmedUrl: null, accessLevel: 'secondary_summary', shortCitation: 'EFSA · 2015', populationSummary: 'Загальна популяція ЄС.', methodsSummary: 'Повний текст висновку з робочого середовища не відкрився; числа звірено з переказом EUFIC (eufic.org, «EFSA opinion on the safety of caffeine»).', keyLimitations: ['Регуляторна оцінка, не окреме дослідження.']}),
  source('SRC-000093', {title: 'Caffeine intake during pregnancy and adverse birth outcomes: a systematic review and dose-response meta-analysis', authors: ['Greenwood DC', 'Thatcher NJ', 'Ye J', 'et al.'], year: 2014, journal: 'European Journal of Epidemiology', doi: '10.1007/s10654-014-9944-x', pmid: '25179792', shortCitation: 'Greenwood DC et al. · 2014', populationSummary: '60 публікацій, 53 когортні й «випадок-контроль» дослідження.', keyLimitations: ['Спостережні дані; ознаки публікаційного зсуву.']}),
  source('SRC-000094', {title: 'Fast-Acting Caffeine Strategy: A Systematic Review and Meta-Analysis of the Ergogenic Effects of Caffeine Chewing Gum on Physical Performance', authors: ['Miraftabi H', 'Berjisian E', 'Pickering C', 'et al.'], year: 2026, journal: 'Sports Medicine — Open', publicationType: 'systematic_review', doi: '10.1186/s40798-026-01104-y', pmid: '42714767', pmcid: 'PMC13558504', shortCitation: 'Miraftabi H et al. · 2026', populationSummary: '25 досліджень, 390 учасників.', keyLimitations: ['Певність низька або дуже низька за GRADE.']}),
  source('SRC-000013', {title: 'International society of sports nutrition position stand: caffeine and exercise performance', authors: ['Guest NS', 'VanDusseldorp TA', 'Nelson MT', 'et al.'], year: 2021, journal: 'Journal of the International Society of Sports Nutrition', publicationType: 'position_statement', doi: '10.1186/s12970-020-00383-4', pmid: '33388079', pmcid: 'PMC7777221', shortCitation: 'Guest NS et al. · 2021 (ISSN)', populationSummary: 'Позиційний документ.', keyLimitations: ['Не окреме дослідження й не оцінка ефекту.']})
];

const record = (id, sourceId, claimId, o) => ({id, sourceId, claimId, evidenceLayer: 'human_outcome', direction: 'supports_claim', relevance: 'direct', roleForClaim: 'supporting', riskOfBias: {status: 'not_assessed'}, reviewStatus: 'pending', lastChecked: checked, extractionLocator: 'Анотація PubMed', ...accepted, ...o});
const smd = (estimate, lowerCI, upperCI, effectMeasure = 'Стандартизована різниця середніх') => ({effectMeasure, estimate, lowerCI, upperCI, unit: '', confidenceLevel: 95});
const md = (estimate, lowerCI, upperCI, unit) => ({effectMeasure: 'Різниця середніх', estimate, lowerCI, upperCI, unit, confidenceLevel: 95});
const records = [
  record('EVR-000165', 'SRC-000082', 'CLM-000076', {roleForClaim: 'primary_support', outcome: {name: 'Час тесту, до 3 мг/кг (менше — краще)'}, result: smd(-0.27, -0.44, -0.11), populationContext: {description: 'Низькі дози 1,3–3 мг/кг'}}),
  record('EVR-000166', 'SRC-000082', 'CLM-000076', {roleForClaim: 'primary_support', outcome: {name: 'Час тесту, 4–6 мг/кг (менше — краще)'}, result: smd(-0.52, -0.77, -0.28), populationContext: {description: 'Помірні дози 4–6 мг/кг'}}),
  record('EVR-000167', 'SRC-000083', 'CLM-000076', {roleForClaim: 'context_only', outcome: {name: 'Аеробна витривалість та інші результати'}, result: {summary: 'Кофеїн покращував аеробну витривалість, силу, м’язову витривалість, потужність, стрибок і швидкість; для витривалості, сили й потужності — помірна якість доказів за GRADE. Ефект загалом більший для аеробних навантажень.'}, populationContext: {description: '21 метааналіз'}}),
  record('EVR-000168', 'SRC-000084', 'CLM-000077', {roleForClaim: 'primary_support', outcome: {name: 'Максимальна сила (1ПМ)'}, result: smd(0.20, 0.03, 0.36), populationContext: {description: '10 досліджень'}}),
  record('EVR-000169', 'SRC-000084', 'CLM-000077', {outcome: {name: 'Потужність, вертикальний стрибок'}, result: {...smd(0.17, 0.00, 0.34), pValue: 0.047}, populationContext: {description: '10 досліджень; p = 0,047'}}),
  record('EVR-000170', 'SRC-000084', 'CLM-000077', {direction: 'mixed', outcome: {name: 'Сила ніг (1ПМ)'}, result: smd(0.15, -0.05, 0.34), populationContext: {description: 'Підгрупа; різниці не виявлено'}}),
  record('EVR-000171', 'SRC-000085', 'CLM-000077', {outcome: {name: 'Середня швидкість штанги'}, result: smd(0.42, 0.19, 0.65), populationContext: {description: '12 досліджень, 230 учасників; I² = 85%'}}),
  record('EVR-000172', 'SRC-000085', 'CLM-000077', {outcome: {name: 'Середня потужність'}, result: smd(0.21, 0.12, 0.30), populationContext: {description: 'I² = 14%'}}),
  record('EVR-000173', 'SRC-000086', 'CLM-000078', {roleForClaim: 'primary_support', outcome: {name: 'Фізичні результати в жінок'}, result: smd(0.37, 0.24, 0.50, 'Hedges g'), populationContext: {description: '20 досліджень; низька або дуже низька певність; різниці між фазами циклу не виявлено'}}),
  record('EVR-000174', 'SRC-000087', 'CLM-000078', {outcome: {name: 'Максимальна сила в жінок'}, result: smd(0.17, 0.06, 0.29, 'Hedges g'), populationContext: {description: '23 дослідження в кількісному аналізі; низька певність'}}),
  record('EVR-000175', 'SRC-000088', 'CLM-000079', {roleForClaim: 'primary_support', outcome: {name: 'Загальний час сну та засинання'}, result: {summary: 'Загальний час сну −45 хв, ефективність сну −7%, засинання +9 хв, пробудження після засинання +12 хв; глибокий сон −11,4 хв.'}, populationContext: {description: '24 дослідження'}}),
  record('EVR-000176', 'SRC-000089', 'CLM-000079', {roleForClaim: 'primary_support', outcome: {name: 'Загальний час сну та засинання'}, result: {summary: 'Загальний час сну −34,67 хв, ефективність сну −4,74%, засинання +8,35 хв; на фазу швидкого сну — без значущого впливу.'}, populationContext: {description: '22 перехресні дослідження, 956 учасників'}}),
  record('EVR-000177', 'SRC-000090', 'CLM-000080', {roleForClaim: 'primary_support', outcome: {name: 'Систолічний тиск у спокої, 60–80 хв'}, result: md(4.71, 2.97, 6.45, 'mmHg'), populationContext: {description: '17 РКД; помірна певність за авторами'}}),
  record('EVR-000178', 'SRC-000091', 'CLM-000080', {roleForClaim: 'primary_support', outcome: {name: 'Систолічний тиск під час навантаження'}, result: md(9.02, 4.25, 13.79, 'mmHg'), populationContext: {description: '21 РКД, 296 учасників'}}),
  record('EVR-000179', 'SRC-000092', 'CLM-000081', {roleForClaim: 'primary_support', extractionLocator: 'Переказ EUFIC висновку EFSA 2015', outcome: {name: 'Безпечні рівні споживання'}, result: {summary: 'Дорослі: до 200 мг за раз і до 400 мг за добу. Вагітні й жінки, які годують: до 200 мг за добу. Діти й підлітки: 3 мг/кг на добу. Сон може погіршуватися від близько 100 мг перед сном.'}, populationContext: {description: 'Загальна популяція ЄС'}}),
  record('EVR-000180', 'SRC-000093', 'CLM-000082', {roleForClaim: 'primary_support', outcome: {name: 'Викидень, на кожні +100 мг/добу'}, result: {effectMeasure: 'Зміна ризику', estimate: 14, lowerCI: 10, upperCI: 19, unit: '%', confidenceLevel: 95}, populationContext: {description: 'Спостережні дослідження'}}),
  record('EVR-000181', 'SRC-000093', 'CLM-000082', {outcome: {name: 'Мала вага при народженні, на кожні +100 мг/добу'}, result: {effectMeasure: 'Зміна ризику', estimate: 7, lowerCI: 1, upperCI: 12, unit: '%', confidenceLevel: 95}, populationContext: {description: 'Спостережні дослідження'}}),
  record('EVR-000182', 'SRC-000094', 'CLM-000083', {roleForClaim: 'primary_support', outcome: {name: 'Фізичні результати загалом'}, result: smd(0.195, 0.115, 0.275), populationContext: {description: '25 досліджень, 390 учасників; низька певність'}}),
  record('EVR-000183', 'SRC-000013', 'CLM-000076', {roleForClaim: 'context_only', extractionLocator: 'Анотація PubMed: пункти 2–4', outcome: {name: 'Практичні дози й час'}, result: {summary: 'Кофеїн стабільно покращує результати в дозах 3–6 мг/кг; мінімальна доза, можливо, близько 2 мг/кг; дози близько 9 мг/кг дають багато побічних ефектів. Найчастіше приймають за 60 хв до навантаження.'}, populationContext: {description: 'Позиційний документ ISSN'}})
];

export const caffeineBase = createEvidenceBase({claims, sources, records, presentation: {
  labels: {'CLM-000076': 'Витривалість', 'CLM-000077': 'Сила й потужність', 'CLM-000078': 'Жінки', 'CLM-000079': 'Сон', 'CLM-000080': 'Тиск', 'CLM-000081': 'Скільки безпечно', 'CLM-000082': 'Вагітність', 'CLM-000083': 'Жуйка з кофеїном'},
  confidenceNote: 'Числа — середні по багатьох дослідженнях. Вони не прогнозують результат конкретної людини.'
}});
