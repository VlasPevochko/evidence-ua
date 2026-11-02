// Бриф T7 (2026-11-02, рішення власника D3): поле пошуку в шапці головної каже, що воно вміє, «знайти розбір або перевірити твердження», і не схоже на чат.
// Пошук нічого не оцінює: він лише веде до сторінок. Тому тут перевіряється слово (підказка, кнопка, порожній результат), а не висновки: жодної відповіді розбору
// у результатах немає, а те, що написав відвідувач, ніколи не стає розміткою й нікуди не надсилається.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES,TOPICS} from '../dist/research-data.js';
import {materials,findMaterials,searchKeywords,scoreFields,enoughMatches} from '../src/platform/materials.mjs';
import {searchSite,mountSearch,SEARCH_PLACEHOLDER,EMPTY_RESULT_TEXT} from '../src/platform/search.mjs';
import {TERMS} from '../src/platform/terms.mjs';
import {homeSpectrumHTML} from '../src/platform/home-spectrum.mjs';
import {sections} from '../dist/platform-sections.js';

const read=file=>fs.readFileSync(file,'utf8');
const data={materials,findMaterials,scoreFields,searchKeywords,enoughMatches,sections,terms:TERMS};
const textOf=html=>html.replace(/<[^>]+>/g,'');

// 1. Слова, затверджені власником (D3): підказка й порожній результат. Підказка одна для поля на головній і вікна пошуку.
assert.equal(SEARCH_PLACEHOLDER,'Знайти розбір або перевірити твердження','the hint is the one the owner approved');
assert.equal(EMPTY_RESULT_TEXT,'Нічого не знайшли. Спробуйте інше слово або відкрийте всі напрями.','the empty-result text is the one the owner approved');

// 2. Поле на головній: підказка, мітка, кнопка зі словом, жодних ознак чату; без JavaScript форма й далі веде в каталог із запитом.
const hero=homeSpectrumHTML(),form=hero.match(/<form id="spectrum-search"[\s\S]*?<\/form>/)[0];
assert(form.includes(`placeholder="${SEARCH_PLACEHOLDER}"`),'the hero field shows the approved hint');
assert(new RegExp(`<label[^>]*for="spectrum-query"[^>]*>${SEARCH_PLACEHOLDER}</label>`).test(form),'the field label says the same words (its accessible name is the visible hint)');
const button=form.match(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/)[0];
assert.equal(textOf(button).trim(),'Знайти','the button names the action with a word, not only an arrow');
assert(!/aria-label|→|<svg/.test(button),'the button has no arrow and no second name: its visible word is its name');
assert(!/✨|⚡|sparkle|\bAI\b|асистент|чат|typing|animation/i.test(form),'no assistant cues in the hero field');
assert(form.includes('action="./directions.html"')&&form.includes('method="get"')&&form.includes('name="q"'),'without JavaScript the form still leads to the directory with the query');
assert(form.includes('enterkeyhint="search"')&&form.includes('type="search"'),'a phone keyboard offers a search key');
assert(!/Що хочеш зрозуміти/.test(hero),'the conversational hint is gone from the hero');
assert(read('dist/index.html').includes(hero),'the finished home page carries exactly the generated hero (run node scripts/build-site.mjs if this fails)');
// Мітка стоїть після поля (CSS показує її замість довгої підказки на телефоні): інакше правило «поле не порожнє» не спрацює.
assert(form.indexOf('<input')<form.indexOf('<label'),'the label follows the field so CSS can hide it when the field has text');

// 3. Вікно пошуку: та сама підказка, порожній результат із посиланням на всі напрями, без відлуння запиту.
const searchSource=read('src/platform/search.mjs');
assert(searchSource.includes('placeholder="${esc(SEARCH_PLACEHOLDER)}"'),'the dialog field uses the same constant');
assert.equal(read('dist/platform-search.js'),searchSource,'the built search copy equals the source');
assert(!/Що хочеш зрозуміти|Нічого не знайдено/.test(searchSource),'the old wording is gone from the dialog');
assert(!/\$\{q\}|\$\{query\}|\$\{input\.value\}/.test(searchSource),'what the visitor typed is never put into a template');

const fetchCalls=[];const realFetch=globalThis.fetch;globalThis.fetch=(...args)=>{fetchCalls.push(args);throw Error('network is not allowed');};
function harness(){
  const handlers=()=>({events:new Map(),addEventListener(type,fn){this.events.set(type,fn);},focus(){doc.activeElement=this;}});
  const input={...handlers(),value:''},list={...handlers(),innerHTML:'',querySelectorAll(){return [];}},status={};
  const dialog={...handlers(),open:false,setAttribute(){},showModal(){this.open=true;},close(){this.open=false;},querySelector(selector){return selector==='input'?input:selector==='.eua-search-results'?list:status;}};
  const doc={activeElement:null,defaultView:{location:{href:'https://evidence.invalid/index.html'}},body:{append(){}},createElement(){return dialog;},addEventListener(){}};
  const button={...handlers(),dataset:{}};
  return {input,list,status,controller:mountSearch(doc,button,async()=>data)};
}
{
  const {controller,input,list,status}=harness();
  await controller.open('детокс виводить токсини');
  assert.equal(status.innerHTML,'Нічого не знайшли. Спробуйте інше слово або відкрийте <a href="./directions.html">всі напрями</a>.','an unsupported claim gives the approved empty state');
  assert.equal(textOf(status.innerHTML),EMPTY_RESULT_TEXT,'the link sits on «всі напрями»; the visible sentence is unchanged');
  assert.equal(list.innerHTML,'','nothing is listed for an unsupported claim');
  // Запит із розміткою ніколи не стає розміткою: порожній результат складається зі сталого тексту, у списку немає нічого.
  const payload='<img src=x onerror=alert(1)>';
  input.value=payload;input.events.get('input')();
  assert(!/img|onerror|alert/.test(status.innerHTML+list.innerHTML),'a query with markup is not echoed');
  assert.equal(status.innerHTML,'Нічого не знайшли. Спробуйте інше слово або відкрийте <a href="./directions.html">всі напрями</a>.');
  // Знайдене показується окремою групою «Розбори»: лише питання й сторінка, без відповіді розбору.
  input.value='підсолоджувачі';input.events.get('input')();
  const sweeteners=STUDIES.find(study=>study.id==='sweeteners');
  assert.equal(status.textContent,'Знайдено: 1');
  assert(list.innerHTML.includes('<h2>Розбори</h2>')&&list.innerHTML.includes('href="./research.html#rs-sweeteners"')&&list.innerHTML.includes(sweeteners.question),'a write-up is found by a word from its question and leads to its card');
  for(const study of STUDIES)assert(!list.innerHTML.includes(study.answer.slice(0,20)),'no answer of any write-up is shown in the results');
  input.value='';input.events.get('input')();
  assert(list.innerHTML.includes('Часті запити'),'an empty field still offers the usual suggestions');
}
globalThis.fetch=realFetch;
assert.equal(fetchCalls.length,0,'searching makes no network request');

// 4. Запити за твердженнями: кожен розбір знаходиться за своїм питанням і за словом із нього; матеріал про кофеїн знаходиться за «кофеїн перед сном».
const caffeine=searchSite(data,'кофеїн перед сном');
assert.equal(caffeine.materials[0]?.title,'Кофеїн','«кофеїн перед сном» finds the caffeine material first («сном» is a form of the word «сон» already listed for it)');
assert.equal(findMaterials('магній перед сном')[0]?.id,'supplements-magnesium','the same for magnesium');
for(const study of STUDIES){
  const found=searchSite(data,study.question).studies.map(row=>row.href);
  assert(found.includes(`research.html#rs-${study.id}`),`${study.id}: the write-up is found by its own question`);
}
const pick=(query,id)=>assert(searchSite(data,query).studies.some(row=>row.href===`research.html#rs-${id}`),`«${query}» finds the write-up «${id}»`);
pick('підсолоджувачі','sweeteners');pick('кава шкодить','coffee');pick('вино','wine');pick('магній сон','magnesium-sleep');pick('кроки на день','steps');pick('падіння літні','falls-older');
assert.deepEqual(searchSite(data,'детокс виводить токсини'),{materials:[],studies:[],sections:[],terms:[]},'an unsupported claim finds nothing in any group');
assert.deepEqual(searchSite(data,'   '),{materials:[],studies:[],sections:[],terms:[]},'an empty query finds nothing');
assert(searchSite(data,'дослідження').studies.length===0,'a query that only names the page does not list all sixteen write-ups (the page itself is in the materials)');
assert(searchSite(data,'сон').studies.length<=4,'at most four write-ups are shown');

// 5. Індекс: шістнадцять рядків kind «study» з тих самих даних, що й сторінка розборів; відповідей і висновків у них немає.
const studyRows=sections.filter(row=>row[3]==='study');
assert.equal(studyRows.length,STUDIES.length,'one row per write-up (update this if a write-up is added: run node scripts/build-site.mjs)');
const pageTitle=materials.find(m=>m.href==='./research.html').title;
for(const study of STUDIES){
  const row=studyRows.find(item=>item[0]===`research.html#rs-${study.id}`);
  assert.deepEqual(row,[`research.html#rs-${study.id}`,study.question,pageTitle,'study',TOPICS[study.topic].toLocaleLowerCase('uk')],`${study.id}: the row is built from the data and carries only the question, the page and the topic name`);
}
assert(sections.filter(row=>row[3]!=='study').every(row=>!row[0].startsWith('research.html')),'the page itself is still not indexed by its headings; only the data rows lead there');
// Посилання research.html#rs-<id> веде на справжній id картки; сторінка розборів сама відкриває її з адреси (розуміє і «#rs-<id>», і «#<id>»).
const page=read('dist/research-page.js');
assert(page.includes("card.id='rs-'+s.id")&&page.includes("replace(/^#rs-?/,'').replace(/^#/,'')")&&page.includes('card.open=true'),'the research page opens the card named in the address');

// 6. Стилі поля: на телефоні довга підказка йде у два рядки всередині поля, рядок поля лишається тієї ж висоти; рух не додано.
const css=read('dist/home-spectrum.css'),scope='body[data-platform-area="home"]:not([data-route-view="article"])';
// До 700 px форма не ширша за 450 px, а підказка потребує близько 330 px: тоді справжня підказка прозора, а мітка поля лягає на поле у два рядки. Лупа прихована до 560 px.
const t7=css.slice(css.indexOf('/* T7 (2026-11-02, рішення D3)'));
assert(t7.length>200,'the block for the search field exists at the end of the stylesheet');
const overlayStart=t7.indexOf('@media(max-width:700px){'),overlayBlock=t7.slice(overlayStart,t7.indexOf('\n}',overlayStart)+2),iconBlock=t7.slice(t7.indexOf('@media(max-width:560px){'));
for(const rule of ['.spectrum-search input::placeholder{color:transparent}','.spectrum-search input:not(:placeholder-shown)+.spectrum-search-label{display:none}'])assert(overlayBlock.includes(scope+' '+rule),`overlay rule: ${rule}`);
assert(iconBlock.includes(scope+' .spectrum-search>svg{display:none}'),'the magnifier is hidden on a phone to leave room for the hint');
assert(/\.spectrum-search-label\{inset:0;[^}]*pointer-events:none;[^}]*text-align:left;text-wrap:balance\}/.test(overlayBlock),'the label lies over the field, lets clicks through, is left-aligned and balanced');
const phoneBlock=overlayBlock+iconBlock;
assert(!/animation|transition/.test(phoneBlock),'no motion added');
assert(/\.spectrum-search\{display:flex;align-items:center;gap:15px;width:min\(540px,100%\);min-height:52px;/.test(css),'the row of the field keeps its height of 52 px (the hero composition does not move)');
assert(/\.spectrum-search-submit\{[^}]*min-width:44px;min-height:44px;[^}]*padding:0 16px/.test(css),'the word button is at least 44 px');
assert(!/https?:\/\//.test(phoneBlock),'no third-party requests');

// 7. Версії, журнал, документи.
const versionOf=(file,name)=>Number((read(file).match(new RegExp(name.replace('.','\\.')+'\\?v=(\\d+)'))||[])[1]);
assert(versionOf('dist/index.html','home-spectrum.css')>=7&&versionOf('dist/index.html','home-spectrum.js')>=6,'home styles and script versions raised (at least css 7, js 6)');
assert(versionOf('dist/home-spectrum.js','platform-search.js')>=14&&versionOf('dist/site-header.js','platform-search.js')>=14,'the home and the header load the new search');
assert(versionOf('dist/platform-search.js','platform-materials.js')>=105&&versionOf('dist/platform-search.js','platform-sections.js')>=2,'search loads the new materials and the new index');
assert(versionOf('dist/site-header.js','site-header.css')>=8,'the header loads the stylesheet with the link style');
assert(/\.eua-search-status a\{color:inherit;text-decoration:underline;/.test(read('dist/site-header.css')),'the link in the empty result looks like a link');
assert(read('dist/changes-data.js').includes('Пошук на головній: знайти розбір або перевірити твердження'),'the change log has a record');
const doc=read('docs/HERO_SEARCH.md');
for(const part of ['Що змінено','Як це влаштовано','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/HERO_SEARCH.md has the section «${part}»`);
console.log('Claim search: approved wording, word button, no chat cues, write-ups found by their questions, empty state, no echo, no network passed.');
