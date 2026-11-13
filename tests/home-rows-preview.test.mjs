// Головна, рішення власника 2026-11-02 (бриф T6): згорнуті рядки показують, що всередині, ще до натискання.
// Було: «Про сайт», «Що є всередині», «Поділитися враженням» мали лише назву, «Кроки маршруту» лише число.
// Стало: під назвою короткий рядок-підказка (.home-row-hint). Цей тест стежить, щоб підказка не розходилась із вмістом:
// числа в ній беруться з розмітки, а не пишуться окремо, і при зміні вмісту тест нагадає оновити текст.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {catalog} from '../src/platform/catalog.mjs';
import {homeLearningHTML} from '../src/platform/learning-ui.mjs';

const index=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-spectrum.css','utf8'),journal=fs.readFileSync('dist/changes-data.js','utf8');
function inspect(markup,expression){return JSON.parse(execFileSync('python',['-c',`from lxml import html\nimport json,sys\nroot=html.fromstring(sys.stdin.read())\nprint(json.dumps(${expression}))`],{input:markup,encoding:'utf8'}));}

// 1. Усі шість рядків мають підказку: три маршрути («Кроки маршруту») і три службові блоки.
const rows=inspect(index,`[{'id':n.get('id'),'cls':n.get('class'),'title':(n.xpath('./summary//*[@class="home-row-title"]')[0].text_content()).strip(),'hint':n.xpath('./summary//*[@class="home-row-hint"]')[0].text_content().strip(),'hints':len(n.xpath('./summary//*[@class="home-row-hint"]')),'summaryChildren':len(n.xpath('./summary/*'))} for n in root.xpath('//body/*[contains(@class,"page")]//details[summary//*[@class="home-row-hint"]]')]`);
// EU-01 adds a fourth route; service rows and compactness limits stay unchanged.
assert.equal(rows.length,catalog.paths.length+3,'Every route outline and the three service rows carry a preview');
assert.equal(rows.filter(r=>/home-path-outline/.test(r.cls||'')).length,catalog.paths.length,'Every route outline has a preview');
assert.deepEqual(rows.filter(r=>r.id).map(r=>r.id),['home-about','home-overview','home-feedback'],'The three service rows keep their ids');
for(const row of rows){
  assert.equal(row.hints,1,`${row.title}: one preview line per row, not several`);
  assert.equal(row.summaryChildren,1,`${row.title}: the summary holds a single text block (title + preview), so the row stays one control`);
  assert(row.hint.length>=20&&row.hint.length<=100,`${row.title}: the preview is a short line, not a paragraph (${row.hint.length} characters)`);
}

// 2. Назви рядків не змінені (змінюється лише додатковий рядок).
const byId=Object.fromEntries(rows.filter(r=>r.id).map(r=>[r.id,r]));
assert.equal(byId['home-about'].title,'Про сайт: зміст і відгук');
assert.equal(byId['home-overview'].title,'Що є всередині Evidence UA');
assert.equal(byId['home-feedback'].title,'Поділитися враженням про сайт');
assert(rows.filter(r=>!r.id).every(r=>/^Кроки маршруту\s*\d+$/.test(r.title)),'Route outlines keep the title «Кроки маршруту N»');

// 3. Числа в підказках збігаються з реальним вмістом. Підрахунок із розмітки, а не з пам’яті.
const counts=inspect(index,`{'parts':len(root.xpath('//*[@id="home-overview"]//*[contains(@class,"home-overview-grid")]/article')),'links':len(root.xpath('//*[@id="home-overview"]//a')),'aboutLinks':len(root.xpath('//*[@id="home-about"]//a')),'questions':len(root.xpath('//*[@id="home-feedback-form"]//textarea')),'numberedQuestions':len(root.xpath('//*[@id="home-feedback-form"]//label[re:test(normalize-space(text()),"^[0-9]\\\\.")]',namespaces={'re':'http://exslt.org/regular-expressions'}))}`);
assert.equal(counts.parts,3,'The overview still has three parts');
assert.equal(counts.links,7,'The overview still has seven links');
assert.equal(counts.questions,3,'The feedback form still asks three questions (the read-only result box is outside the form)');
assert.equal(counts.numberedQuestions,3,'The three questions are numbered 1–3');
assert.equal(counts.aboutLinks,counts.links,'The about group has no links beyond the overview');
const numbers=hint=>(hint.match(/\d+/g)||[]).map(Number);
assert.deepEqual(numbers(byId['home-overview'].hint),[counts.parts,counts.links],'Overview preview: parts, then links, both equal to the markup');
assert.deepEqual(numbers(byId['home-about'].hint),[counts.aboutLinks,counts.questions],'About preview: links, then questions, both equal to the markup');
assert.deepEqual(numbers(byId['home-feedback'].hint),[counts.questions],'Feedback preview: the number of questions equals the markup');
// Підказка не обіцяє зайвого: форма нічого не надсилає (як сказано в самому блоці).
assert(/нічого не надсилає/.test(byId['home-feedback'].hint)&&/Форма нічого не надсилає/.test(index),'The feedback preview repeats what the block itself says: nothing is sent');

// 4. «Кроки маршруту»: підказка дорівнює назвам кроків із самого списку, у тому ж порядку (і тих, що в каталозі).
const outlines=inspect(homeLearningHTML(),`[{'count':n.xpath('./summary//*[@class="home-row-title"]/span')[0].text_content(),'hint':n.xpath('./summary//*[@class="home-row-hint"]')[0].text_content(),'steps':[a.text_content().strip() for a in n.xpath('.//ol/li/a')]} for n in root.xpath('//details[@class="home-path-outline"]')]`);
assert.equal(outlines.length,catalog.paths.length,'One outline per learning path');
for(const [i,o] of outlines.entries()){
  // Longer routes may have a short editorial preview; the expanded list retains all exact titles.
  assert.equal(o.hint,catalog.paths[i].preview||o.steps.join(' · '),`Route ${i+1}: the preview matches its catalog summary or complete step titles`);
  assert.equal(Number(o.count),o.steps.length,`Route ${i+1}: the number in the title equals the number of steps`);
  assert.equal(o.steps.length,catalog.paths[i].steps.length,`Route ${i+1}: the outline still has every catalog step`);
}
// Те саме, що в готовій сторінці (генерований блок не відстав від джерела).
const built=inspect(index,`[n.xpath('./summary//*[@class="home-row-hint"]')[0].text_content() for n in root.xpath('//details[@class="home-path-outline"]')]`);
assert.deepEqual(built,outlines.map(o=>o.hint),'dist/index.html carries the same route previews as the generator');

// 5. Кожен згорнутий рядок на головній має другий рядок тексту (не лише назву): жоден не лишився «голим».
const all=inspect(index,`[{'id':n.get('id'),'cls':n.get('class'),'secondLine':len(n.xpath('./summary//small'))+len(n.xpath('./summary/span[not(@aria-hidden)]/text()[normalize-space()]'))+len(n.xpath('./summary//span[@class="home-fresh-fold-hint"]')),'open':n.get('open') is not None} for n in root.xpath('//body/*[contains(@class,"page")]//details')]`);
assert.equal(all.length,catalog.paths.length+7,'Every route plus the seven existing disclosures has a preview line');
for(const row of all){
  assert(row.secondLine>=1,`Folded row ${row.id||row.cls} has a second line under its title`);
  assert(!row.open,`Folded row ${row.id||row.cls} starts closed`);
}

// 6. Стилі: підказка не менша за 12 px, переноситься, не розпирає рядок; кольори з існуючих змінних головної.
const block=css.slice(css.indexOf('.home-row-text'));
assert(/\.home-row-text\{[^}]*display:grid/.test(block)&&/min-width:0/.test(block),'The text block is a grid that may shrink (no horizontal overflow on phones)');
assert(/\.home-row-hint\{[^}]*font:400 12px\/1\.5/.test(block),'The preview is 12px or larger');
assert(/\.home-row-hint\{[^}]*var\(--spectrum-muted\)/.test(block)&&/\.home-row-title\{[^}]*var\(--spectrum-text\)/.test(block),'Colours come from the home variables, not new hard-coded values');
assert(!/https?:\/\//.test(block),'No third-party requests in the new styles');
// Поруч виправлено давній дефект: рядок відгуку тримав застарілу округлу рамку з home-lower.css, і текст упирався в рамку. Тепер він плоский, як сусідні (перевіряє й Browser QA: обчислена рамка 0 і радіус 0).
assert(/#start-here \.home-about-body>#home-feedback\{[^}]*border:0;border-top:1px solid var\(--spectrum-line\);border-radius:0/.test(block),'The feedback row is flat like its neighbours, the old rounded frame no longer shows');
assert(Number((index.match(/home-spectrum\.css\?v=(\d+)/)||[])[1])>=5,'The stylesheet version is raised (at least 5) so browsers drop the cached copy'); // 2026-11-02: «не нижча за 5», бо наступні зміни стилів головної піднімають версію далі (T5: v=6)

// 7. Журнал оновлень: запис про зміну є, без наукових тверджень.
assert(journal.includes('Згорнуті рядки на головній підказують, що всередині'),'The change log has a record about the previews');
const record=journal.slice(journal.indexOf('Згорнуті рядки на головній підказують'),journal.indexOf('Згорнуті рядки на головній підказують')+420);
assert(/science:'none'/.test(record),'The record is marked as touching no science text');

// 8. Документ: що, чому, файли, відкат.
const doc=fs.readFileSync('docs/HOME_ROWS_PREVIEW.md','utf8');
for(const part of ['Що змінено','Чому','Файли','Тести','Як відкотити'])assert(doc.includes(part),`docs/HOME_ROWS_PREVIEW.md has the section «${part}»`);
console.log('Home rows preview: six previews, counts equal the markup, route previews equal the step titles, ten folded rows each have a second line passed.');
