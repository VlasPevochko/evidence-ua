// Бриф T8 (2026-11-02), зменшений: один рядок «хто й коли перевірив», складений зі справжніх даних, нічого не вигаданий.
// Що перевіряємо: (1) дата погодження береться з даних картки, а не вписана в текст і не підставляється мовчки;
// (2) відсутня чи хибна дата зупиняє збірку; (3) текст рядка на сторінці той самий, що був до зміни (дати 18, 21, 22 жовтня);
// (4) рядок «Перевірено …» у розборах бере дату з CHECKED; (5) охоронець validateDossiers досі не пускає «завершений перегляд».
// Стану «перегляд завершено» немає навмисно: його вводить лише рішення власника (D4), а не код.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {approvalDate,provenanceStatus,STATUS_BEFORE_DATE,STATUS_AFTER_DATE} from '../src/evidence/core/provenance.mjs';
import {validateDossiers} from '../src/evidence/core/dossier.mjs';
import {cards,SupplementCard} from '../scripts/build-supplement-cards.mjs';
import {ProteinCard,approvedOn as proteinApproved} from '../scripts/build-protein.mjs';
import {BerberineCard,approvedOn as berberineApproved} from '../scripts/build-berberine.mjs';
import {CHECKED} from '../dist/research-data.js';

const index=fs.readFileSync('dist/index.html','utf8');

// 1. Формат дати: з ISO у текст «22 жовтня 2026 року». Хибне значення не перетворюється мовчки.
assert.equal(approvalDate('2026-10-22'),'22 жовтня 2026 року');
assert.equal(approvalDate('2026-01-05'),'5 січня 2026 року','a single-digit day has no leading zero, like the published text');
assert.equal(approvalDate('2026-12-31'),'31 грудня 2026 року');
for(const bad of [undefined,null,'','22 жовтня 2026 року','2026-10-1','2026-02-30','2026-13-01','2026-00-10','26-10-22',20261022])
  assert.throws(()=>approvalDate(bad),/approvedOn must be a real date/,`the value ${JSON.stringify(bad)} is refused`);

// 2. Кожна картка має свою дату в даних: підстановки за замовчуванням немає.
// Таблиця фіксує дати, що були на сторінці до цієї зміни (текст не змінився побайтно). Коли формулювання погодять знову, змінити дату в даних і тут: це свідома редакторська подія.
const PUBLISHED={protein:'2026-10-18',berberine:'2026-10-21',omega:'2026-10-21',vitd:'2026-10-21',caffeine:'2026-10-21',magnesium:'2026-10-22',collagen:'2026-10-22','beta-alanine':'2026-10-22',citrulline:'2026-10-22',electrolytes:'2026-10-22'};
assert.equal(proteinApproved,PUBLISHED.protein);assert.equal(berberineApproved,PUBLISHED.berberine);
assert.deepEqual(cards.map(card=>card.key),['omega','vitd','caffeine','magnesium','collagen','beta-alanine','citrulline','electrolytes']);
for(const card of cards){
  assert.equal(card.approvedOn,PUBLISHED[card.key],`${card.key}: approvedOn is in the card data and equals the published date`);
  assert.doesNotThrow(()=>approvalDate(card.approvedOn));
}

// 3. Рядок складається з даних: зміна дати змінює рядок, відсутня дата зупиняє збірку.
for(const card of cards){
  const html=SupplementCard(card);
  assert.equal(html.split(provenanceStatus(card.approvedOn)).length-1,1,`${card.key}: the card ends with exactly one provenance line built from its data`);
  const changed=SupplementCard({...card,approvedOn:'2026-11-05'});
  assert(changed.includes('Формулювання погоджено 5 листопада 2026 року')&&!changed.includes(approvalDate(card.approvedOn)),`${card.key}: changing the date in the data changes the stamp`);
  assert.throws(()=>SupplementCard({...card,approvedOn:undefined}),/approvedOn must be a real date/,`${card.key}: a missing date stops the build`);
}
assert(ProteinCard().includes(provenanceStatus(proteinApproved))&&BerberineCard().includes(provenanceStatus(berberineApproved)),'protein and berberine use the same helper and their own data');

// 4. На сторінці: рівно десять рядків, слова ті самі, спільний клас, дати за даними.
const lines=[...index.matchAll(/<p class="pc-status">([^<]*)<\/p>/g)].map(match=>match[1]);
assert.equal(lines.length,10,'ten dossier cards carry the provenance line');
for(const line of lines)assert(line.startsWith(STATUS_BEFORE_DATE)&&line.endsWith(STATUS_AFTER_DATE),`the sentence is unchanged: ${line}`);
// Розмітка досьє лишається побайтно такою, як була: у ній немає нових атрибутів (їх урахували б заморожені відбитки наукових розділів), спільний вигляд задає CSS.
assert.equal((index.match(/<p class="pc-status">/g)||[]).length,10,'the dossier markup is unchanged: class pc-status only');
assert(!/<p class="pc-status [^"]/.test(index),'no extra classes were added to the dossier lines');
const dates=lines.map(line=>line.slice(STATUS_BEFORE_DATE.length,line.length-STATUS_AFTER_DATE.length)).sort();
assert.deepEqual(dates,Object.values(PUBLISHED).map(approvalDate).sort(),'the dates on the page are the dates in the data (18 Oct ×1, 21 Oct ×4, 22 Oct ×5)');
for(const card of cards)assert(index.includes(SupplementCard(card)),`${card.key}: the built home page contains the card exactly as the generator renders it`);
// Слова про те, що перегляд не завершено, не зникли й не замінені на «перевірено експертами».
assert(!/(завершено|перевірено)[^<]{0,40}(експерт|лікар|рецензент)/i.test(lines.join(' ')),'the line does not claim an expert review');

// 5. Рядок «Перевірено …» у розборах: дата з CHECKED, клас спільний.
const research=fs.readFileSync('dist/research-page.js','utf8');
assert(research.includes("make('p','rs-source eua-stamp')")&&research.includes("' Перевірено '+CHECKED+'.'"),'the research source line keeps its sentence, takes the date from CHECKED and wears the shared class');
assert.match(CHECKED,/^\d{2}\.\d{2}\.2026$/);

// 6. Спільний вигляд: один файл стилів, підключений на головній і на сторінці розборів.
const css=fs.readFileSync('dist/eua-stamp.css','utf8');
assert(/\.eua-stamp,\.pc-status\{[^}]*border-left:2px solid/.test(css)&&!/https?:\/\//.test(css),'one shared rule for both lines, no third-party requests');
assert(index.includes('./eua-stamp.css?v=1')&&fs.readFileSync('dist/research.html','utf8').includes('./eua-stamp.css?v=1'),'both pages load the shared stylesheet');

// 7. Охоронець: «завершений науковий перегляд» не з’являється з коду чи даних без рішення власника.
// Перевіряємо на виготовлених записах і не торкаємось dossiers.json (він заморожений).
const real=JSON.parse(fs.readFileSync('src/evidence/supplements/dossiers.json','utf8'));
assert.doesNotThrow(()=>validateDossiers(real),'the real dossiers still validate');
assert(real.every(dossier=>dossier.lastScientificReview===null&&dossier.confidenceAssessment==='not_assessed'),'no dossier claims a scientific review or an assessed confidence');
for(const forged of [{lastScientificReview:'2026-10-30'},{confidenceAssessment:'moderate'},{lastScientificReview:'2026-10-30',reviewers:['Хтось']}])
  assert.throws(()=>validateDossiers([{...real[0],...forged}]),/Migration cannot manufacture scientific review/,`a manufactured review is refused: ${JSON.stringify(forged)}`);
// Дати погодження нічого не кажуть про перегляд: їх немає серед полів, які читає охоронець.
assert(!/lastScientificReview|confidenceAssessment|reviewers/.test(fs.readFileSync('src/evidence/core/provenance.mjs','utf8').replace(/\/\/[^\n]*/g,'')),'the provenance helper never reads or sets review fields');

// 8. Журнал і документ.
assert(fs.readFileSync('dist/changes-data.js','utf8').includes('Рядок про перегляд оформлено однаково'),'the change log has a record');
const doc=fs.readFileSync('docs/PROVENANCE_STAMP.md','utf8');
for(const part of ['Що змінено','Що навмисно не змінено','Як перевірено','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/PROVENANCE_STAMP.md has the section «${part}»`);
console.log('Provenance stamp: dates come from data, a missing date stops the build, text unchanged, review guard intact passed.');
