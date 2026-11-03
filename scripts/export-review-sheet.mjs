// Таблиця для незалежного рецензента (2026-11-03, «Довіра 3», docs/REVIEWER_BRIEF.md).
// Збирається з тих самих даних і готових сторінок, що бачить відвідувач, і нічого не вигадує, не оцінює й не змінює: кожен рядок це дослівний текст сайту плюс джерела, які на сайті названо.
// Порожні колонки наприкінці заповнює рецензент.
//
//   node scripts/export-review-sheet.mjs          записує docs/review/REVIEW_SHEET.csv і docs/review/REVIEW_SCOPE.md
//   node scripts/export-review-sheet.mjs --check  лише звіряє файли з даними (код виходу 1, якщо розійшлись)
//
// Файли збережено в репозиторії, а tests/reviewer-brief.test.mjs перевіряє, що вони збігаються з даними: таблиця не може непомітно застаріти.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = file => import(pathToFileURL(path.join(root, file)).href);
const readJSON = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
export const SHEET_FILE = 'docs/review/REVIEW_SHEET.csv';
export const SCOPE_FILE = 'docs/review/REVIEW_SCOPE.md';

// Переклади службових значень з даних. Невідоме значення зупиняє скрипт: нове значення в даних має отримати переклад свідомо, а не мовчки потрапити в таблицю.
const strict = (map, what) => key => {
  if (!Object.hasOwn(map, key)) throw Error(`export-review-sheet: невідоме значення «${key}» (${what}). Додайте переклад у scripts/export-review-sheet.mjs.`);
  return map[key];
};
export const claimType = strict({efficacy: 'ефективність', safety: 'безпека', performance: 'спортивний результат', physiology: 'фізіологія'}, 'claimType');
const confidence = strict({high: 'Висока', moderate: 'Помірна', low: 'Низька', very_low: 'Дуже низька', insufficient: 'Недостатньо даних'}, 'evidenceConfidence');
const publicationType = strict({systematic_review_meta_analysis: 'систематичний огляд і мета-аналіз', systematic_review: 'систематичний огляд', meta_analysis: 'мета-аналіз', original_research: 'оригінальне дослідження', position_statement: 'позиційна заява', regulatory_opinion: 'висновок регуляторного органу', narrative_review: 'оглядова стаття'}, 'publicationType');
const access = strict({abstract: 'прочитано лише анотацію', secondary_summary: 'вторинний переказ, не першоджерело', full_text: 'повний текст'}, 'accessLevel');
const role = strict({primary_support: 'основна опора', supporting: 'додаткова опора', mechanistic_support: 'механізм', context_only: 'лише контекст'}, 'roleForClaim');
const direction = strict({supports_claim: 'підтверджує твердження', mixed: 'змішані результати', neutral: 'нейтрально'}, 'direction');
const relevance = strict({direct: 'прямий', partially_direct: 'частково прямий', indirect: 'непрямий'}, 'relevance');
const dossierRole = strict({background_reference: 'довідкове джерело', selected_publication: 'обрана публікація', published_study: 'опубліковане дослідження'}, 'dossier source role');
const dossierMetadata = strict({pending: 'метадані ще не перевірено', pubmed_verified: 'метадані звірено з PubMed'}, 'dossier source metadata');
const dossierLink = strict({not_assessed: 'відповідність твердженням не оцінено'}, 'dossier source claim link');
const researchTopic = strict({food: 'Харчування', move: 'Рух', sleep: 'Сон', supp: 'Добавки'}, 'research topic');

export const COLUMNS = ['№', 'Матеріал', 'Тема', 'Де на сайті', 'Ідентифікатор', 'Текст на сайті (дослівно)', 'Кого стосується й що порівнювали', 'Підсумок і межі, які вказано на сайті', 'Рівень впевненості на сайті', 'Джерела, на які спирається текст',
  'Рішення рецензента (згоден / згоден з правками / не згоден / не можу оцінити)', 'Коментар і запропонована правка', 'Чого бракує (джерела, застереження)'];
const REVIEWER_COLUMNS = 3;
const NO_CONFIDENCE = 'не оцінено';

const lines = parts => parts.filter(Boolean).join('\n');
const bullets = list => (list || []).map(item => `• ${item}`).join('\n');
const numbered = list => list.map((item, index) => `${index + 1}) ${item}`).join('\n');
const doiUrl = doi => `https://doi.org/${doi}`;
const refs = list => (list || []).map(ref => `${ref.label}: ${ref.href}`).join('\n');
let SITE;
const url = anchor => new URL(anchor, SITE.base).href;

// Текст готової сторінки: усе, що бачить відвідувач у цьому блоці, без розмітки, діалогів і скриптів.
const entities = {nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', rsquo: '’'};
export function htmlText(html) {
  return html
    .replace(/<(script|style|dialog)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<li\b[^>]*>/g, '\n• ')
    .replace(/<(p|h[1-6]|div|article|details|summary|ul|ol|section|tr|blockquote)\b[^>]*>|<\/(p|h[1-6]|div|article|details|summary|ul|ol|section|tr|blockquote)>|<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name) => entities[name.toLowerCase()] ?? whole)
    .split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
}
// Елемент за id з урахуванням вкладених однойменних тегів.
export function elementById(html, id) {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) throw Error(`export-review-sheet: на сторінці немає елемента з id="${id}"`);
  const start = html.lastIndexOf('<', at), tag = html.slice(start + 1).match(/^[a-z0-9]+/i)[0];
  const open = new RegExp(`<${tag}\\b`, 'g'), close = new RegExp(`</${tag}>`, 'g');
  let depth = 1, cursor = html.indexOf('>', start) + 1;
  while (depth > 0) {
    open.lastIndex = close.lastIndex = cursor;
    const nextOpen = open.exec(html), nextClose = close.exec(html);
    if (!nextClose) throw Error(`export-review-sheet: не знайдено закриття елемента id="${id}"`);
    if (nextOpen && nextOpen.index < nextClose.index) { depth++; cursor = nextOpen.index + 1; } else { depth--; cursor = nextClose.index + tag.length + 3; if (!depth) return html.slice(start, cursor); }
  }
}

async function claimBases() {
  const bases = [];
  const creatine = await load('dist/evidence/data.js');
  const seed = creatine.evidenceBase;
  bases.push({title: creatine.creatineModule.title, route: 'creatine', module: null, claims: seed.claims, sources: seed.sources, records: seed.records, assessments: seed.assessments || [], reviews: seed.reviews || []});
  for (const name of ['caffeine', 'berberine', 'protein', 'electrolytes', 'magnesium', 'collagen', 'vitd', 'omega', 'citrulline', 'beta-alanine', 'creatine-more']) {
    const exports = Object.values(await load(`dist/evidence/${name}-data.js`));
    const base = exports.find(value => value && Array.isArray(value.claims)), module = exports.find(value => value && value.route && value.title);
    if (!base || !module) throw Error(`export-review-sheet: у dist/evidence/${name}-data.js немає бази тверджень або модуля`);
    bases.push({title: module.title, route: module.route, module, claims: base.claims, sources: base.sources, records: base.records, assessments: base.assessments || [], reviews: base.reviews || []});
  }
  return bases;
}

function sourceLine(source, record) {
  const id = source.identifiers || {}, pmid = id.pmid || source.pmid, doi = id.doi || source.doi;
  return lines([
    `${source.shortCitation || source.title} (${publicationType(source.publicationType)}${(source.shortCitation || '').includes(String(source.year)) ? '' : `, ${source.year}`})`,
    [pmid && `PubMed ${pmid}`, doi && `DOI ${doi}`].filter(Boolean).join(' · '),
    `Для цього твердження: ${role(record.roleForClaim)}; ${direction(record.direction)}; зв’язок ${relevance(record.relevance)}.`,
    `Як прочитано: ${source.accessLevel ? access(source.accessLevel) : 'не вказано'}; ризик упередженості ${record.riskOfBias?.status === 'assessed' ? 'оцінено' : 'не оцінено'}.`
  ]).replaceAll('\n', ' ');
}

function claimRows(bases) {
  const rows = [];
  for (const base of bases) for (const claim of base.claims) {
    const records = base.records.filter(record => record.claimId === claim.id);
    const sources = records.map(record => {
      const source = base.sources.find(item => item.id === record.sourceId);
      if (!source) throw Error(`export-review-sheet: для запису ${record.id} немає джерела ${record.sourceId}`);
      return sourceLine(source, record);
    });
    const dose = claim.intervention?.dose;
    rows.push([
      'Твердження', base.title, url(`index.html#${base.route}`), claim.id, claim.statement,
      lines([claim.population?.description && `Кого: ${claim.population.description}`, claim.intervention?.name && `Що давали: ${claim.intervention.name}${dose ? ` (${dose})` : ''}`, claim.comparator?.description && `З чим порівнювали: ${claim.comparator.description}`, claim.outcome?.name && `Результат: ${claim.outcome.name}`, `Вид твердження: ${claimType(claim.claimType)}`]),
      lines([claim.evidenceSummary && `Підсумок доказів: ${claim.evidenceSummary}`, claim.confidenceRationale?.summary && `Чому такий рівень: ${claim.confidenceRationale.summary}`, claim.confidenceRationale?.uncertaintyNotes?.length && `Застереження до рівня: ${claim.confidenceRationale.uncertaintyNotes.join(' ')}`, claim.limitations?.length && `Обмеження:\n${bullets(claim.limitations)}`]),
      claim.evidenceConfidence === null || claim.evidenceConfidence === undefined ? NO_CONFIDENCE : `${confidence(claim.evidenceConfidence)}${claim.provisional ? ' (попередня оцінка)' : ''}`,
      sources.join('\n')
    ]);
  }
  return rows;
}

// Тексти модулів добавок, які стоять біля тверджень, але самі твердженнями не є: практичний орієнтир (дози!), «чого ми не стверджуємо», спільні обмеження.
function moduleRows(bases) {
  const rows = [], noLevel = 'на сайті не оцінюється: це не окреме твердження';
  for (const {title, route, module} of bases) {
    if (!module) continue;
    const where = url(`index.html#${route}`);
    if (module.guidance) rows.push(['Добавка: практичний орієнтир', title, where, `${module.id}/guidance`, lines([module.guidance.title, module.guidance.dose && `Доза: ${module.guidance.dose}`, module.guidance.note]), '', '', noLevel, 'джерело названо в заголовку орієнтира']);
    if (module.notClaimed?.length) rows.push(['Добавка: чого ми не стверджуємо', title, where, `${module.id}/not-claimed`, bullets(module.notClaimed.map(item => `${item.topic}. ${item.reason}`)), '', '', noLevel, 'джерела названо в тексті (автор, рік, PMID)']);
    if (module.commonLimits?.length) rows.push(['Добавка: спільні обмеження', title, where, `${module.id}/limits`, bullets(module.commonLimits), '', '', noLevel, '']);
  }
  return rows;
}

// Блоки «Перш ніж приймати» (безпека) і ручні розділи креатину беруться з готової сторінки: їхній текст живе в скриптах збірки й старій сторінці, а не в даних тверджень.
function pageRows(bases) {
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const owners = bases.map(base => ({base, at: html.search(new RegExp(`<section\\b[^>]*\\bid="${base.route}"`))})).filter(owner => owner.at >= 0);
  const rows = [];
  for (const match of html.matchAll(/<section class="bc-safety"[^>]*>[\s\S]*?<\/section>/g)) {
    const owner = owners.filter(item => item.at < match.index).sort((a, b) => b.at - a.at)[0];
    if (!owner) throw Error('export-review-sheet: блок безпеки без добавки');
    const text = htmlText(match[0]), [heading, ...body] = text.split('\n');
    rows.push([`Добавка: блок «${heading}»`, owner.base.title, url(`index.html#${owner.base.route}`), `${owner.base.route}/safety`, body.join('\n'), '', '', 'на сайті не оцінюється: це застереження', 'джерел біля блока немає']);
  }
  for (const [id, label] of [['creatine-dosing', 'Як приймати'], ['creatine-kidney', 'Нирки й креатинін'], ['creatine-myths', 'Міфи'], ['creatine-mechanism', 'Механізм']]) {
    rows.push([`Креатин: розділ «${label}» (старіший текст сторінки)`, 'Креатин', url(`index.html#${id}`), `creatine/${id}`, htmlText(elementById(html, id)), '', 'Розділ написано до структурованих тверджень: джерела стоять усередині тексту розділу.', 'на сайті не оцінюється: це не окреме твердження', 'джерела названо всередині розділу']);
  }
  return rows;
}

function dossierRows(dossiers) {
  const rows = [];
  for (const dossier of dossiers) {
    const sources = dossier.sources.map(source => `${source.url} (${dossierRole(source.role)}; ${dossierMetadata(source.metadataReview)}; ${dossierLink(source.claimLinkStatus)})`).join('\n');
    const where = url(`index.html#${dossier.route}`), title = dossier.title[0] + dossier.title.slice(1).toLowerCase();
    const pending = `На сайті названо ще не перевіреним:\n${bullets(dossier.pendingFields)}`;
    rows.push(
      ['Досьє: поточний висновок', title, where, `${dossier.id}/conclusion`, dossier.existingConclusion, '', lines([dossier.sourceContext && `Основа тексту: ${dossier.sourceContext}`, pending]), NO_CONFIDENCE, sources],
      ['Досьє: практичні орієнтири', title, where, `${dossier.id}/guidance`, dossier.practicalGuidance, '', 'На сайті: «Практичний текст не оформлено як окреме оцінене наукове твердження».', NO_CONFIDENCE, sources],
      ['Досьє: обмеження', title, where, `${dossier.id}/limitations`, dossier.limitations, '', 'На сайті: «Пошук усіх релевантних досліджень і аналіз суперечливих результатів не завершено».', NO_CONFIDENCE, sources]
    );
  }
  return rows;
}

function researchRows(research) {
  return research.STUDIES.map(study => [
    'Розбір дослідження', researchTopic(study.topic), url(`research.html#rs-${study.id}`), study.id, `${study.question}\n${study.answer}`,
    study.who ? `Кого стосується: ${study.who}` : '',
    lines([`Що знайшли: ${study.found}`, `Межі: ${study.limits}`]),
    'на сайті не показано',
    `${study.type}: ${study.source.label}${study.source.doi ? ` · DOI ${study.source.doi} · ${doiUrl(study.source.doi)}` : ''}`
  ]);
}

function dietRows(diets, titles) {
  const rows = [];
  const note = `На сайті: «Огляд опублікованих оглядів із PubMed, звірено ${diets.EVIDENCE_CHECKED}. Це не оцінка Evidence UA: власні рівні впевненості ще не присвоєно.»`;
  for (const id of Object.keys(diets.evidence)) {
    const diet = diets.evidence[id], title = titles.get(id), where = url(`nutrition.html#diet-${id}`);
    if (!title) throw Error(`export-review-sheet: для дієти ${id} немає назви в каталозі`);
    if (!Array.isArray(diet.findings) || !diet.findings.length) throw Error(`export-review-sheet: у дієти ${id} немає висновків оглядів`);
    rows.push(
      ['Дієта: кому може підходити', title, where, `${id}/fits`, bullets(diet.fits), '', note, 'не присвоєно', 'посилань біля цього блоку на сайті немає'],
      ['Дієта: що показали огляди', title, where, `${id}/findings`, numbered(diet.findings.map(([text]) => text)), '', note, 'не присвоєно', numbered(diet.findings.map(([, ...links]) => links.flat().map(ref => `${ref.label}: ${ref.href}`).join('; ')))],
      ['Дієта: застереження', title, where, `${id}/cautions`, bullets(diet.cautions), '', note, 'не присвоєно', refs(diet.cautionRefs)]
    );
  }
  const rec = diets.recommendation;
  rows.push(['Дієта: чому ми радимо Середземноморський підхід', 'Дієти', url('nutrition.html#nutrition-diets'), 'recommendation',
    lines([rec.title, rec.note, bullets(rec.reasons.map(([head, text]) => `${head} ${text}`)), rec.limits]), '', 'На сайті: «Це позиція редакції Evidence UA, а не лікарська порада».', 'не присвоєно', refs(rec.refs)]);
  return rows;
}

export async function buildReviewSheet() {
  SITE = readJSON('site.json');
  const bases = await claimBases();
  const dossiers = readJSON('src/evidence/supplements/dossiers.json');
  // Старі досьє показуються лише там, де їх не замінив схвалений модуль (replacesDossier); решта лишилась даними перенесення, відвідувач їх не бачить.
  const replaced = new Set(bases.map(base => base.module?.replacesDossier).filter(Boolean));
  const shownDossiers = dossiers.filter(dossier => !replaced.has(dossier.id));
  const research = await load('dist/research-data.js');
  const diets = await load('src/nutrition-diets/evidence.mjs');
  const catalog = await load('src/nutrition-diets/catalog.mjs');
  const titles = new Map(catalog.dietCards.map(card => [card.id, card.title]));
  const body = [...claimRows(bases), ...moduleRows(bases), ...pageRows(bases), ...dossierRows(shownDossiers), ...researchRows(research), ...dietRows(diets, titles)];
  const rows = body.map((row, index) => [String(index + 1), ...row, ...Array(REVIEWER_COLUMNS).fill('')]);
  for (const row of rows) if (row.length !== COLUMNS.length) throw Error(`export-review-sheet: рядок ${row[0]} має ${row.length} колонок замість ${COLUMNS.length}`);
  const csv = '﻿' + [COLUMNS, ...rows].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
  return {csv, rows, scope: buildScope({bases, dossiers, shownDossiers, research, diets, rows}), bases, dossiers, shownDossiers};
}

function buildScope({bases, dossiers, shownDossiers, research, diets, rows}) {
  const count = kind => rows.filter(row => row[1].startsWith(kind)).length;
  const hours = n => (n * 10 / 60).toFixed(1).replace('.', ',');
  const all = bases.flatMap(base => base.claims.map(claim => ({base, claim})));
  const levels = {high: 0, moderate: 0, low: 0, very_low: 0, insufficient: 0, none: 0};
  for (const {claim} of all) levels[claim.evidenceConfidence ?? 'none']++;
  const usedSources = new Map();
  for (const base of bases) for (const record of base.records) usedSources.set(`${base.route}|${record.sourceId}`, base.sources.find(source => source.id === record.sourceId));
  const sourceAccess = {abstract: 0, secondary_summary: 0, full_text: 0, none: 0};
  for (const source of usedSources.values()) sourceAccess[source.accessLevel ?? 'none']++;
  const assessments = bases.flatMap(base => base.assessments || []), reviews = bases.flatMap(base => base.reviews || []);
  const byStatus = list => { const map = {}; for (const item of list) map[item.status] = (map[item.status] || 0) + 1; return Object.keys(map).length ? Object.entries(map).map(([status, n]) => `${n} зі статусом «${status}»`).join(', ') : 'немає'; };
  const approved = reviews.filter(review => review.status === 'approved').length;
  const finished = dossiers.filter(dossier => dossier.lastScientificReview !== null).length;
  const perTopic = bases.map(base => {
    const ids = new Set(base.claims.map(claim => claim.id)), sources = new Set(base.records.filter(record => ids.has(record.claimId)).map(record => record.sourceId));
    const level = key => [...sources].filter(id => (base.sources.find(source => source.id === id)?.accessLevel ?? 'none') === key).length;
    return `| ${base.title} | ${base.claims.length} | ${rows.filter(row => row[2] === base.title).length} | ${sources.size} | ${level('abstract')} | ${level('secondary_summary')} | ${level('full_text')} | ${level('none')} |`;
  });
  const perTopicRows = bases.map(base => rows.filter(row => row[2] === base.title).length);
  const total = rows.length, smallest = Math.min(...perTopicRows), biggest = Math.max(...perTopicRows);
  return `# Обсяг для незалежного перегляду: що саме можна дати рецензентові

Файл створює \`node scripts/export-review-sheet.mjs\` з даних сайту й не редагується вручну (його звіряє \`tests/reviewer-brief.test.mjs\`). Таблиця рядків: [\`REVIEW_SHEET.csv\`](./REVIEW_SHEET.csv). Правила й листи: [\`../REVIEWER_BRIEF.md\`](../REVIEWER_BRIEF.md).

## Стан наукового перегляду в даних (на цей момент)

- Записів оцінки впевненості (\`assessments\`): **${assessments.length}** (${byStatus(assessments)}). Записів наукового схвалення (\`reviews\`): **${reviews.length}** (${byStatus(reviews)}); затверджених: **${approved}**.
- Тверджень, для яких записано наукове схвалення: **${new Set(reviews.filter(review => review.status === 'approved').map(review => review.claimId)).size} із ${all.length}**. Погодження формулювань власником (\`publicationAcceptance\`) науковим переглядом не є: у кожному такому записі \`formalScientificReview\` має значення «false».
- Модулів добавок із записаним схваленням (\`scientificApproval\`): **${bases.filter(base => base.module && base.module.scientificApproval).length} із ${bases.filter(base => base.module).length}**.
- Джерел, на які спираються твердження: **${usedSources.size}**; з них прочитано лише за анотацією: **${sourceAccess.abstract}**, вторинний переказ: **${sourceAccess.secondary_summary}**, повний текст: **${sourceAccess.full_text}**, не вказано: **${sourceAccess.none}**.

## З чого складається таблиця

| Група | Рядків | Що в ній |
|---|---|---|
| Твердження | ${count('Твердження')} | Структуровані твердження про добавки (${bases.length} груп, див. нижче): текст, кого стосується, підсумок доказів, обмеження, рівень впевненості, джерела |
| Добавки: інші тексти | ${count('Добавка') + count('Креатин')} | Те, що стоїть біля тверджень, але твердженням не є: практичний орієнтир із дозами, «чого ми не стверджуємо», спільні обмеження, блоки «Перш ніж приймати» (безпека) і старіші ручні розділи креатину («Як приймати», нирки, міфи, механізм) |
| Досьє | ${count('Досьє')} | ${shownDossiers.length ? `Досьє, яких не замінив схвалений модуль (${shownDossiers.length})` : 'Немає: усі старі досьє замінено схваленими модулями, див. нижче'} |
| Розбори досліджень | ${count('Розбір')} | ${research.STUDIES.length} коротких розборів зі сторінки «Дослідження простими словами»: питання, відповідь, що знайшли, межі, джерело |
| Дієти | ${count('Дієта')} | Для кожної з ${Object.keys(diets.evidence).length} дієт: кому може підходити, що показали огляди (числа з посиланнями) й застереження; окремий рядок про те, чому редакція радить Середземноморський підхід |
| **Разом** | **${total}** | |

Орієнтир за часом (припущення, а не вимірювання: по 10 хвилин на рядок): повна таблиця ≈ ${hours(total)} год; лише твердження ≈ ${hours(count('Твердження'))} год; одна добавка (усі її рядки: твердження й інші тексти) від ${hours(smallest)} до ${hours(biggest)} год. Рецензент сам оцінить, скільки йому потрібно.

## Добавки за темами

| Тема | Тверджень | Рядків у таблиці (з іншими текстами) | Джерел | лише анотація | вторинний переказ | повний текст | не вказано |
|---|---|---|---|---|---|---|---|
${perTopic.join('\n')}

Рівні впевненості на сайті: висока ${levels.high}, помірна ${levels.moderate}, низька ${levels.low}, дуже низька ${levels.very_low}, недостатньо даних ${levels.insufficient}, не оцінено ${levels.none}.

## Чого в таблиці немає

З даних:

- Старі досьє (\`src/evidence/supplements/dossiers.json\`, ${dossiers.length} шт.; записаного перегляду в них: ${finished}) ${shownDossiers.length ? `показуються на сайті лише ${shownDossiers.length}, їх додано до таблиці` : 'на сайті **не показуються**: їх замінили схвалені модулі (поле \`replacesDossier\`), це дані перенесення, а не тексти для читача'}.

Складено вручну 2026-11-03, не з даних:

- Пояснення будови й процесів на сторінках «Харчування зсередини», «Клітина», «М’язова лабораторія», «Рух», «Сон», «Атлас», «Як це працює»: це освітні схеми й описи, а не структуровані твердження; їх оцінює фахівець відповідного профілю окремо.
- Бібліотека вправ і зони спини в «Атласі»: тексти безпеки потребують лікаря або рівноцінного фахівця (див. \`docs/EXERCISE_REVIEW_RULES.md\`, розділ 5).
- Добавки: короткі підсумки («Коротко»), заголовки й схеми результатів на самих сторінках; їх зручно читати на сайті поруч із таблицею.
- Словник, журнал оновлень, підказки інтерфейсу.
`;
}

export async function writeReviewSheet({check = false} = {}) {
  const {csv, scope} = await buildReviewSheet();
  const stale = [];
  for (const [file, text] of [[SHEET_FILE, csv], [SCOPE_FILE, scope]]) {
    const target = path.join(root, file);
    if (check) { if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) stale.push(file); continue; }
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, text);
  }
  return stale;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const stale = await writeReviewSheet({check});
  if (stale.length) { console.error(`Застаріли: ${stale.join(', ')}. Запустіть node scripts/export-review-sheet.mjs і додайте файли до коміту.`); process.exitCode = 1; }
  else console.log(check ? 'Таблиця для рецензента збігається з даними.' : `Записано ${SHEET_FILE} і ${SCOPE_FILE}.`);
}
