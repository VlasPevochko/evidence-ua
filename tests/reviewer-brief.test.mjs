// «Довіра 3» (2026-11-03): пакет для незалежного рецензента (docs/REVIEWER_BRIEF.md). Таблицю й опис обсягу створює scripts/export-review-sheet.mjs з даних сайту,
// тож тест звіряє їх із даними: вони не можуть непомітно застаріти. Сам документ прив’язаний до коду: усі названі в ньому файли, поля й слова сайту мусять існувати.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {buildReviewSheet, COLUMNS, SHEET_FILE, SCOPE_FILE} from '../scripts/export-review-sheet.mjs';

const read = file => fs.readFileSync(file, 'utf8');
const {csv, scope, bases, dossiers, shownDossiers} = await buildReviewSheet();
const research = await import('../dist/research-data.js');
const diets = await import('../src/nutrition-diets/evidence.mjs');
const brief = read('docs/REVIEWER_BRIEF.md');

// Невеликий розбірник CSV (RFC 4180), незалежний від генератора: ловить помилки лапок і переносів у клітинках.
function parseCSV(text) {
  const out = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += ch; }
    else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); out.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); out.push(row); }
  return out;
}

// 1. Файли збігаються з даними (їх створює скрипт; вручну не правляться).
assert.equal(read(SHEET_FILE), csv, `${SHEET_FILE} застарів: запустіть node scripts/export-review-sheet.mjs і додайте файл до коміту`);
assert.equal(read(SCOPE_FILE), scope, `${SCOPE_FILE} застарів: запустіть node scripts/export-review-sheet.mjs і додайте файл до коміту`);
const check = spawnSync(process.execPath, ['scripts/export-review-sheet.mjs', '--check'], {encoding: 'utf8'});
assert.equal(check.status, 0, `export-review-sheet --check: ${check.stderr}${check.stdout}`);

// 2. Будова таблиці: колонки, кількість рядків за даними, послідовні номери, унікальні ідентифікатори, порожні колонки рецензента.
assert(csv.startsWith('﻿'), 'UTF-8 з позначкою порядку байтів, щоб Excel прочитав кирилицю');
const table = parseCSV(csv.slice(1)), [header, ...rows] = table;
assert.deepEqual(header, COLUMNS);
const claims = bases.flatMap(base => base.claims.map(claim => ({base, claim})));
const index = read('dist/index.html');
const modules = bases.map(base => base.module).filter(Boolean);
const moduleTexts = modules.filter(module => module.guidance).length + modules.filter(module => module.notClaimed?.length).length + modules.filter(module => module.commonLimits?.length).length;
const safetyBlocks = (index.match(/<section class="bc-safety"/g) || []).length;
const creatineSections = ['creatine-dosing', 'creatine-kidney', 'creatine-myths', 'creatine-mechanism'];
const expected = claims.length + moduleTexts + safetyBlocks + creatineSections.length + 3 * shownDossiers.length + research.STUDIES.length + 3 * Object.keys(diets.evidence).length + 1;
assert.equal(rows.length, expected, `рядків ${rows.length}, за даними мало б бути ${expected}`);
assert(claims.length >= 60 && safetyBlocks >= 10 && research.STUDIES.length === 16 && Object.keys(diets.evidence).length === 8, 'обсяг даних збігається з описом у документах');
rows.forEach((row, index) => {
  assert.equal(row.length, COLUMNS.length, `рядок ${index + 1}: ${row.length} колонок`);
  assert.equal(row[0], String(index + 1), 'номери послідовні');
  assert.deepEqual(row.slice(-3), ['', '', ''], `рядок ${index + 1}: колонки рецензента порожні`);
  assert(row[5].trim().length > 0, `рядок ${index + 1}: є дослівний текст сайту`);
  assert(/^https:\/\/vlaspevochko\.github\.io\/evidence-ua\//.test(row[3]), `рядок ${index + 1}: посилання на сайт (${row[3]})`);
});
assert.equal(new Set(rows.map(row => row[4])).size, rows.length, 'ідентифікатори рядків унікальні');
const byId = new Map(rows.map(row => [row[4], row]));
const labels = {high: 'Висока', moderate: 'Помірна', low: 'Низька', very_low: 'Дуже низька', insufficient: 'Недостатньо даних'};

// 3. Кожне твердження, досьє, розбір і дієта присутні й дослівні; рівні впевненості збігаються з даними; кожне джерело названо.
for (const {base, claim} of claims) {
  const row = byId.get(claim.id);
  assert(row, `твердження ${claim.id} є в таблиці`);
  assert.equal(row[5], claim.statement, `${claim.id}: текст дослівно`);
  const level = claim.evidenceConfidence == null ? 'не оцінено' : labels[claim.evidenceConfidence] + (claim.provisional ? ' (попередня оцінка)' : '');
  assert.equal(row[8], level, `${claim.id}: рівень впевненості`);
  const linked = base.records.filter(record => record.claimId === claim.id);
  assert.equal(row[9].split('\n').length, linked.length, `${claim.id}: кількість джерел збігається з кількістю записів доказів`);
  for (const record of linked) {
    const source = base.sources.find(item => item.id === record.sourceId);
    const pmid = source.identifiers?.pmid || source.pmid, doi = source.identifiers?.doi || source.doi;
    assert(pmid ? row[9].includes(`PubMed ${pmid}`) : doi ? row[9].includes(`DOI ${doi}`) : row[9].includes(source.shortCitation), `${claim.id}: джерело ${source.id} названо`);
  }
}
// Старі досьє, яких замінив схвалений модуль, на сайті не показуються: їхніх текстів немає на сторінці (тому їх і немає в таблиці). Якщо досьє знову стане видимим, воно потрапляє в таблицю саме.
for (const dossier of dossiers) {
  if (shownDossiers.includes(dossier)) continue;
  assert(bases.some(base => base.module?.replacesDossier === dossier.id), `${dossier.id}: замінене модулем`);
  assert(!index.includes(dossier.existingConclusion) && !index.includes('<!-- DOSSIER:' + dossier.id), `${dossier.id}: тексту старого досьє немає на сторінці`);
}
for (const dossier of shownDossiers) {
  assert.equal(byId.get(`${dossier.id}/conclusion`)[5], dossier.existingConclusion);
  assert.equal(byId.get(`${dossier.id}/guidance`)[5], dossier.practicalGuidance);
  assert.equal(byId.get(`${dossier.id}/limitations`)[5], dossier.limitations);
}
// Тексти модулів добавок (орієнтир із дозою, «чого ми не стверджуємо», спільні обмеження) дослівні.
for (const module of modules) {
  if (module.guidance) { const text = byId.get(`${module.id}/guidance`)[5]; assert(text.includes(module.guidance.title) && text.includes(module.guidance.dose) && text.includes(module.guidance.note), `${module.id}: орієнтир дослівно`); }
  for (const item of module.notClaimed || []) assert(byId.get(`${module.id}/not-claimed`)[5].includes(`${item.topic}. ${item.reason}`), `${module.id}: «${item.topic}» дослівно`);
  for (const text of module.commonLimits || []) assert(byId.get(`${module.id}/limits`)[5].includes(text), `${module.id}: спільне обмеження дослівно`);
}
// Блоки «Перш ніж приймати» й ручні розділи креатину: кожен пункт зі сторінки є в таблиці.
const plain = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const safetyRows = rows.filter(row => /^Добавка: блок/.test(row[1]));
assert.equal(safetyRows.length, safetyBlocks);
const blocks = [...index.matchAll(/<section class="bc-safety"[^>]*>[\s\S]*?<\/section>/g)].map(match => match[0]);
blocks.forEach((block, i) => { for (const [, item] of block.matchAll(/<li>([\s\S]*?)<\/li>/g)) assert(safetyRows[i][5].replace(/\s+/g, ' ').includes(plain(item)), `блок безпеки ${i + 1} («${safetyRows[i][2]}»): пункт «${plain(item).slice(0, 40)}…» є в таблиці`); });
for (const id of creatineSections) {
  const row = byId.get(`creatine/${id}`), start = index.indexOf(`id="${id}"`);
  assert(row && start > 0, `розділ креатину ${id}`);
  const heading = (index.slice(start, start + 2500).match(/<(?:h2|summary)[^>]*>([\s\S]*?)<\/(?:h2|summary)>/) || [])[1];
  assert(heading && row[5].replace(/\s+/g, ' ').includes(plain(heading)), `${id}: заголовок «${plain(heading || '')}» є в таблиці`);
  assert(row[5].length > 200, `${id}: узято весь розділ`);
}
for (const study of research.STUDIES) {
  const row = byId.get(study.id);
  assert(row && row[5] === `${study.question}\n${study.answer}`, `розбір ${study.id}: питання й відповідь дослівно`);
  assert(row[7].includes(study.found) && row[7].includes(study.limits), `розбір ${study.id}: що знайшли й межі`);
  assert(row[9].includes(study.type) && (!study.source.doi || row[9].includes(study.source.doi)), `розбір ${study.id}: тип і джерело`);
}
for (const [id, diet] of Object.entries(diets.evidence)) {
  for (const text of diet.fits) assert(byId.get(`${id}/fits`)[5].includes(text), `дієта ${id}: «кому підходить» дослівно`);
  for (const text of diet.cautions) assert(byId.get(`${id}/cautions`)[5].includes(text), `дієта ${id}: застереження дослівно`);
  diet.findings.forEach(([text, ref], index) => {
    assert(byId.get(`${id}/findings`)[5].includes(`${index + 1}) ${text}`), `дієта ${id}: висновок ${index + 1} дослівно`);
    assert(byId.get(`${id}/findings`)[9].includes(`${index + 1}) ${ref.label}: ${ref.href}`), `дієта ${id}: джерело висновку ${index + 1}`);
  });
  for (const kind of ['fits', 'findings', 'cautions']) assert(byId.get(`${id}/${kind}`)[7].includes(`звірено ${diets.EVIDENCE_CHECKED}`) && byId.get(`${id}/${kind}`)[7].includes('Це не оцінка Evidence UA'), `дієта ${id}/${kind}: слова сайту про те, що це не оцінка Evidence UA`);
}
if (shownDossiers.length) for (const quoted of ['Практичний текст не оформлено як окреме оцінене наукове твердження.', 'Пошук усіх релевантних досліджень і аналіз суперечливих результатів не завершено.']) assert(read('dist/index.html').includes(quoted), `слова сайту, які таблиця цитує біля досьє, справді є на сторінці: «${quoted}»`);
assert(read('dist/nutrition.html').includes('Це позиція редакції Evidence UA, а не лікарська порада.'), 'слова сайту про позицію редакції є на сторінці');
assert(read('dist/nutrition.html').includes(`звірено ${diets.EVIDENCE_CHECKED}`) && read('dist/nutrition.html').includes('Це не оцінка Evidence UA: власні рівні впевненості ще не присвоєно.'), 'слова сайту, які таблиця цитує біля дієт, справді є на сторінці');
assert(byId.get('recommendation')[5].includes(diets.recommendation.title) && byId.get('recommendation')[5].includes(diets.recommendation.limits));

// 4. Посилання таблиці ведуть у справжні місця: якорі існують у готових сторінках (розбори малює скрипт сторінки за id картки).
const html = file => read('dist/' + file);
for (const row of rows) {
  const [, file, anchor] = row[3].replace(/^https:\/\/vlaspevochko\.github\.io\/evidence-ua\//, '').match(/^([a-z-]+\.html)(?:#(.+))?$/) || [];
  assert(file && fs.existsSync('dist/' + file), `${row[4]}: сторінка існує (${row[3]})`);
  if (anchor && file !== 'research.html') assert(html(file).includes(`id="${anchor}"`), `${row[4]}: якір #${anchor} існує на ${file}`);
}
assert(read('dist/research-page.js').includes("'rs-'") || read('dist/research-page.js').includes('"rs-"') || /rs-\$\{/.test(read('dist/research-page.js')), 'картки розборів мають id rs-<id>');

// 5. Чесність: поки в даних немає записаного перегляду, пакет описує саме цей стан. Коли перегляд буде записано, тест зупинить збірку, доки документи не оновлено.
const reviews = bases.flatMap(base => base.reviews || []);
assert.equal(reviews.filter(review => review.status === 'approved').length, 0, 'у даних з’явилось затверджене схвалення: оновіть docs/REVIEWER_BRIEF.md (розділ «Слабкі місця»), сторінку «Про проєкт» і таблицю');
assert(dossiers.every(dossier => dossier.lastScientificReview === null), 'у досьє записано науковий перегляд: оновіть docs/REVIEWER_BRIEF.md і сторінку «Про проєкт»');
assert(scope.includes('затверджених: **0**') && scope.includes('записаного перегляду в них: 0') && scope.includes(`**0 із ${claims.length}**`), 'опис обсягу каже, що схвалень немає');

// 6. Документ: розділи, чотири відповіді, сім питань, шаблони з порожніми місцями, жодних справжніх контактів і вигаданих людей.
for (const part of ['## Частина 1. Для власника', '## Частина 2. Для рецензента', '## Частина 3. Як перегляд з’явиться на сайті', '### Рішення власника', '### Додаток А', '### Додаток Б', '### Додаток В']) assert(brief.includes(part), `документ має розділ «${part}»`);
for (const answer of ['**Згоден**', '**Згоден з правками**', '**Не згоден**', '**Не можу оцінити**', '**ТЕРМІНОВО**']) assert(brief.includes(answer), `відповідь ${answer}`);
const questions = brief.slice(brief.indexOf('### Питання до кожного рядка'), brief.indexOf('### Рівні впевненості на сайті')).match(/^\d+\. /gm) || [];
assert.equal(questions.length, 7, 'сім питань до кожного рядка');
for (const placeholder of ['[контакт автора сайту]', '[дата]', '[ім’я автора сайту]', '[ім’я по батькові]', '[посилання на сайт]']) assert(brief.includes(placeholder), `шаблон має порожнє місце ${placeholder}`);
assert(!/@|https?:\/\/|\+380|\b0\d{2}[ -]?\d{3}[ -]?\d{2}[ -]?\d{2}\b/.test(brief), 'у документі немає пошти, адрес і телефонів');
assert(!/(доктор|професор|академік|д\.\s?м\.\s?н|к\.\s?м\.\s?н)/i.test(brief) && !/\b(MD|PhD)\b/.test(brief), 'нікого з людей і звань не вигадано');
assert(!/(перевірено лікарем|схвалено фахівцем)(?![^.]*не)/i.test(brief.replace(/«перевірено лікарем» чи «схвалено фахівцем»|«перевірено фахівцем»|«перевірено лікарем»/g, '')), 'документ не стверджує, що перегляд уже відбувся');
const doc = brief.replace(/\r/g, '');
const decisions = doc.slice(doc.indexOf('### Рішення власника'), doc.indexOf('## Частина 2')).match(/^\d+\. \*\*/gm) || [];
assert.equal(decisions.length, 5, 'п’ять пронумерованих рішень власника');

// 7. Усе назване в документі існує в коді: файли, поля даних, слова сайту.
// Сторінка «Про проєкт» і її тест приходять окремим PR: поки сторінки в цьому дереві немає, посилання на її тест не вимагаємо; коли вона є, тест мусить існувати.
const aboutPage = fs.existsSync('dist/about.html');
for (const [, file] of brief.matchAll(/`((?:src|tests|docs|scripts|dist)\/[A-Za-z0-9_./-]+)`/g)) assert(fs.existsSync(file) || (!aboutPage && file === 'tests/about-page.test.mjs'), `названий файл існує: ${file}`);
if (aboutPage) assert(brief.includes('tests/about-page.test.mjs'), 'сторінка «Про проєкт» є в дереві, тож документ називає її тест');
const code = {
  registry: read('src/evidence/core/registry.mjs'), dossier: read('src/evidence/core/dossier.mjs'), provenance: read('src/evidence/core/provenance.mjs'),
  components: read('src/evidence/core/components.mjs'), types: read('src/evidence/core/types.ts'), seed: read('src/evidence/creatine/reviews.mjs'), dossiersJSON: read('src/evidence/supplements/dossiers.json')
};
assert(/export function approvalProblems/.test(code.registry) && /export function validateDossiers/.test(code.dossier) && /provenanceStatus/.test(code.provenance) && /export function ConfidenceBadge/.test(code.components));
for (const field of ['ScientificReview', 'ConfidenceAssessment', 'approverId', 'approvedAt', 'reason', 'history', 'changes_requested', 'ready_for_review', 'not_assessed', 'assessed']) assert(code.types.includes(field), `types.ts має «${field}»`);
for (const word of ['Migration cannot manufacture scientific review']) assert(code.dossier.includes(word));
assert(code.dossiersJSON.includes('"lastScientificReview": null'), 'у dossiers.json є поле lastScientificReview');
assert(code.seed.includes('provisional_seed'), 'чернетки оцінок креатину позначені provisional_seed');
for (const wording of ['Попередня оцінка · науковий перегляд триває', 'Наукове схвалення: ']) assert(code.components.includes(wording) && brief.includes(wording.trim().replace(/: $/, '')), `слова сайту «${wording}» названо в документі й вони є в коді`);
assert(code.provenance.includes('Науковий перегляд: не завершено') && brief.includes('Науковий перегляд: не завершено'), 'рядок під досьє існує в коді й названий у документі');
assert(read('tests/fixtures/visitor-v58-file-hashes.json').includes('src/evidence/supplements/dossiers.json'), 'відбиток dossiers.json заморожений там, де сказано в документі');
assert(read('tests/fixtures/README_BASELINES.md').includes('Deliberate revision'), 'процедура оновлення еталонів описана там, де сказано в документі');
console.log(`Reviewer brief: ${rows.length}-row sheet fresh and verbatim, scope fresh, brief tied to code and free of invented people or contacts passed.`);
