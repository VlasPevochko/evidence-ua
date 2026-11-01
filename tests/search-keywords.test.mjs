import assert from 'node:assert/strict';
import fs from 'node:fs';
import {materials,findMaterials,searchKeywords,scoreFields,enoughMatches,STOP_WORDS} from '../src/platform/materials.mjs';
import {searchSite,SUGGESTIONS} from '../src/platform/search.mjs';
import {TERMS} from '../src/platform/terms.mjs';

// Пошук за ключовими словами (скарга власника 2026-11-01: «коли я пишу "як пити креатин", написано "нічого не знайдено". Чому воно не шукає по ключовим словам?»).
// Причина: усі слова запиту мусили стояти в назві матеріалу, а «як» і «пити» там немає. Тепер службові слова відкидаються, слова шукаються в назві, у словах для пошуку,
// у назві напрямку й у виді матеріалу (з вагами), слово знаходить свої відмінки, а для запиту з кількох слів досить половини збігів.
// Пошук лише веде до матеріалів: нових тверджень він не робить, і кожне слово для пошуку записано в src/platform/materials.mjs (searchTerms).
const data={materials,findMaterials,scoreFields,searchKeywords,enoughMatches,terms:TERMS};
const titles=q=>searchSite(data,q).materials.map(m=>m.title);
const all=q=>{const r=searchSite(data,q);return [...r.materials.map(m=>m.title),...r.terms.map(t=>t.title)];};

// 1) Ключові слова запиту.
assert.deepEqual(searchKeywords('як пити креатин'),['пити','креатин'],'filler words are dropped');
assert.deepEqual(searchKeywords('  Як   ПИТИ   креатин? '),['пити','креатин'],'case, spaces and punctuation do not matter');
assert.deepEqual(searchKeywords('м’язи'),['мязи'],'apostrophes are ignored on both sides');
assert.deepEqual(searchKeywords('як це'),['як','це'],'a query made only of filler words is kept (so the page «Як це працює» can still be found)');
assert.deepEqual(searchKeywords('   '),[],'an empty query has no keywords');
for(const w of ['як','що','чи','для','про','це','можна','скільки'])assert(STOP_WORDS.has(w),`${w} is a filler word`);
assert(!STOP_WORDS.has('пити')&&!STOP_WORDS.has('креатин')&&!STOP_WORDS.has('сон'),'content words are never dropped');
assert.equal(enoughMatches(1,1),true);assert.equal(enoughMatches(0,1),false);assert.equal(enoughMatches(1,2),true,'one of two words is enough');assert.equal(enoughMatches(1,3),false,'one of three is not');assert.equal(enoughMatches(2,3),true);

// 2) Випадок власника й схожі: слова запиту не мусять усі бути в назві.
for(const q of ['як пити креатин','креатин','креатину','креа','КРЕАТИН?','скільки креатину пити'])assert.equal(titles(q)[0],'Креатин',`«${q}» starts with the creatine dossier`);
assert(titles('як пити креатин').length>=2,'the creatine topic has more than one page');
for(const [q,expected] of [
  ['як спати краще','Сон і працездатність'],['скільки білка треба','Протеїн'],['що таке метааналіз','Розбір метааналізу білка'],
  ['як схуднути','Жироспалення: куди зникає жир?'],['інтервальне голодування','Дієти й режими'],['кето','Дієти й режими'],['болить плече','Підйом руки вбік'],
  ['чому болить коліно','Крокування: рух кількох суглобів'],['вітамін д','Вітамін D'],['кофеїн і сон','Кофеїн'],['що нового','Що нового й що перевірено']
])assert(titles(q).includes(expected),`«${q}» finds «${expected}» (got ${titles(q).join(' | ')||'nothing'})`);
assert.equal(titles('м’язи ростуть')[0],'Ріст м’яза','a title that matches both words comes first');
assert.equal(findMaterials('кофеїн')[0].title,'Кофеїн','a title that starts with the query comes first');

// 3) Шум: слова, схожі лише початком, не знаходять чужого.
assert(!titles('як пити креатин').some(t=>/питання/i.test(t)),'«пити» does not find «питання»');
assert(!titles('інтервал').some(t=>materials.find(m=>m.title===t)?.kind==='interactive'),'«інтервал» does not find «інтерактив»');
assert.deepEqual(all('цццц'),[],'nonsense finds nothing');
assert.deepEqual(all('як що').length>=0,true,'a query of only filler words does not crash');
assert(searchSite(data,'інтервал').terms.some(t=>t.id==='ci'),'the confidence interval term is still found by its name');
assert(searchSite(data,'довірчий інтервал').terms.some(t=>t.id==='ci'),'and by two words');

// 4) Списки слів для пошуку не обрізаються (раніше з них брались лише перші 120 літер, і хвіст списку не знаходився).
assert(titles('коротко відповідь').includes('Дослідження простими словами'),'a word at the end of a long keyword list is found');
for(const m of materials)assert.equal(findMaterials('',m.group).filter(x=>x.id===m.id).length,1,`${m.id} is listed once in its group`);

// 5) Порожній запит дає всі матеріали в порядку каталогу, групи працюють.
assert.deepEqual(findMaterials('').map(m=>m.id),materials.map(m=>m.id),'an empty query lists everything in catalogue order');
assert(findMaterials('','evidence').every(m=>m.group==='evidence')&&findMaterials('','evidence').length<materials.length,'the group filter still works');

// 6) Підказки, поле й повідомлення.
assert(SUGGESTIONS.includes('креатин'),'creatine is a suggestion chip');
for(const s of SUGGESTIONS)assert(all(s).length>0,`suggestion «${s}» finds something`);
const src=fs.readFileSync('src/platform/search.mjs','utf8'),mat=fs.readFileSync('src/platform/materials.mjs','utf8');
assert(src.includes('placeholder="Що хочеш зрозуміти?"')&&!src.includes('placeholder="Матеріал або термін"'),'the search field asks the same question as the home page field');
assert(src.includes('Спробуйте одне-два ключові слова, наприклад «креатин» або «сон».'),'an empty result tells what to try');
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|https?:\/\//.test(src+mat.slice(mat.indexOf('// Пошук за ключовими словами'),mat.indexOf('export function findMaterials')+1200)),'search still stores and sends nothing');

// 7) Зібрані копії свіжі й версії каскадом змінені (браузер не покаже старий кеш).
const dist=f=>fs.readFileSync('dist/'+f,'utf8');
assert.equal(dist('platform-search.js'),src,'the built search copy equals the source');
assert(dist('platform-materials.js').includes('export function searchKeywords')&&dist('platform-materials.js').includes('export function scoreFields'),'the built materials copy has the keyword helpers');
assert(dist('platform-search.js').includes("import('./platform-materials.js?v=104')"),'search loads materials v=104');
assert(dist('site-header.js').includes("import('./platform-search.js?v=12')"),'the header loads search v=12');
for(const f of ['platform-tools.js','directions.js','home-feedback.js','platform-shell.js'])assert(!dist(f).includes('platform-materials.js?v=103')&&!dist(f).includes('platform-tools.js?v=103'),`${f} no longer points to the old materials/tools versions`);
for(const f of ['platform-tools.js','directions.js','home-feedback.js'])assert(dist(f).includes('platform-materials.js?v=104'),`${f} loads materials v=104`);
assert(dist('platform-shell.js').includes('platform-tools.js?v=104'),'the page shell loads tools v=104');
const pageVersions=(file,mod)=>[...new Set([...dist(file).matchAll(new RegExp(`${mod}\\.js\\?v=(\\d+)`,'g'))].map(m=>m[1]))];
assert.deepEqual(pageVersions('directions.html','directions'),['110'],'the catalogue page loads directions v=110');
assert.deepEqual(pageVersions('index.html','home-feedback'),['104'],'the home loads home-feedback v=104');
assert.deepEqual(pageVersions('atlas.html','platform-shell'),['107'],'pages load the shell v=107');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&dist(f).includes('site-header.js?v=')))assert.deepEqual(pageVersions(f,'site-header'),['14'],`${f} loads the header v=14`);

// 8) Журнал оновлень і документи.
const changes=dist('changes-data.js');
assert(changes.includes("title:'Пошук шукає за ключовими словами'")&&changes.indexOf("title:'Пошук шукає за ключовими словами'")<changes.indexOf("title:'Без мазка під назвою сторінки'"),'the journal tells about it, newest first');
assert(dist('changes.html').includes('changes-page.js?v=13')&&dist('changes-page.js').includes("from './changes-data.js?v=13'"),'the journal page and its data have new versions');
const doc=fs.readFileSync('docs/SEARCH.md','utf8');
assert(doc.includes('ключов')&&doc.includes('searchTerms')&&doc.includes('tests/search-keywords.test.mjs')&&doc.includes('searchFlow'),'docs/SEARCH.md explains the search, how to add words, and its checks');
console.log('Search by keywords: filler words dropped, weighted matches, inflections, no noise, long word lists whole, field and message, cascade versions, journal and docs passed.');
