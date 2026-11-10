import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHtml,extractSections,buildSections,renderModule,walk,ancestors,SIZE_BUDGET} from '../scripts/build-sections.mjs';
import {SKIP_PAGES,SKIP_ANCHOR,SKIP_TITLES,TITLE_WORDS,ANCHOR_WORDS} from '../scripts/sections-config.mjs';
import {normalizeTitle,pickByTitle} from '../src/platform/anchor-reveal.mjs';
import {materials,findMaterials,searchKeywords,scoreFields,enoughMatches} from '../src/platform/materials.mjs';
import {searchSite,findSections} from '../src/platform/search.mjs';
import {TERMS} from '../src/platform/terms.mjs';
import {sections} from '../dist/platform-sections.js';

// Пошук по розділах усередині сторінок (рішення власника 2026-11-02: «давай всередині також», після питання, чи шукати «дозування» всередині сторінки про креатин).
// Збірка сама знаходить розділи в готових сторінках (scripts/build-sections.mjs), пошук показує їх окремою групою, а посилання відкриває потрібне місце
// (src/platform/anchor-reveal.mjs). Нових тверджень тут немає: назви беруться зі сторінок, слова з sections-config.mjs лише ведуть до розділу.
// Справжнє приземлення в браузері (відкритий блок, положення на екрані) міряє sectionsFlow у Browser QA.
const read=f=>fs.readFileSync(f,'utf8');

// 1) Розбір сторінки на маленькому прикладі: що береться, що ні, які посилання виходять.
const fixture=`<!doctype html><html><body><main>
<h1>Матеріал.</h1>
<section id="dosing"><h2>Як приймати</h2><p>Текст</p><h3>Фаза.</h3></section>
<details id="myths"><summary><span class="num">01</span><strong class="title">Міфи про матеріал</strong><small>підпис</small><span class="count">3</span></summary><h3>«Перший міф»</h3></details>
<section class="pc-not" aria-labelledby="n"><h2 id="n">Чого ми не стверджуємо</h2><article><h3>Хибне твердження</h3></article></section>
<article class="eua-claim"><h3>Вагітність</h3></article>
<article class="eua-claim"><h3>Сила</h3></article><article class="eua-claim"><h3>Сила</h3></article>
<section id="source-SRC-1"><h3>Джерело одне</h3></section><section id="term-abc"><h3>Термін</h3></section>
<dialog><h2 id="dlg">Діалог</h2></dialog><nav><h2>Навігація</h2></nav><footer><h2>Підвал</h2></footer><div hidden><h2>Прихований</h2></div>
<h2>Та</h2><h2>Занадто довгий заголовок, який нічого не означає і тягнеться далеко за межі дозволеної довжини назви розділу</h2>
<script>var s='<h2>Скрипт</h2>';</script><!-- <h2>Коментар</h2> -->
</main></body></html>`;
const rows=extractSections(fixture,{page:'fx.html',materials:[{href:'./fx.html',title:'Матеріал'}]});
const brief=rows.map(r=>[decodeURIComponent(r.href),r.title,r.kind]);
assert.deepEqual(brief,[
  ['fx.html#dosing','Як приймати','section'],['fx.html#dosing','Фаза','section'],
  ['fx.html#myths','Міфи про матеріал','block'],['fx.html#myths','«Перший міф»','section'],
  ['fx.html#n','Чого ми не стверджуємо','section'],
  ['fx.html?section=Вагітність','Вагітність','claim'],['fx.html?section=Сила','Сила','claim'],['fx.html?section=Сила&n=2','Сила','claim']
],'the extractor takes h2/h3 and named <details>, drops dialogs, navigation, hidden parts, scripts, comments, sources, dictionary entries, "not claimed" items, too short and too long names');
assert(rows[0].words.includes('дозування')&&rows[0].words.includes('скільки'),'a known section name brings its search words');
assert.equal(rows.find(r=>r.title==='Міфи про матеріал').title,'Міфи про матеріал','the name of a <details> block is the title inside it, without the number, caption and counter');
assert(rows.every(r=>r.parent==='Матеріал'),'every section knows the material it belongs to');
assert.deepEqual(extractSections(fixture,{page:'fx.html',materials:[]}),[],'a section whose page has no material is not shown');
const tree=parseHtml('<ul><li>один<li>два</ul><p>а<p>б<br><img src="x">в');
let lis=0,ps=0;walk(tree,n=>{if(n.tag==='li')lis++;if(n.tag==='p')ps++;});
assert.deepEqual([lis,ps],[2,2],'implied end tags of li and p do not nest');

// 2) Готовий файл свіжий, невеликий і правильної форми.
const text=read('dist/platform-sections.js');
assert.equal(renderModule(buildSections(process.cwd(),materials)),text,'dist/platform-sections.js equals what the builder makes from the pages (run node scripts/build-site.mjs)');
assert(text.length<=SIZE_BUDGET&&text.length>5000,`the index is small enough to load on first search (${text.length} bytes)`);
assert(sections.length>=120&&sections.length<=400,`a reasonable number of sections (${sections.length})`);
for(const row of sections){
  assert.equal(row.length,5,`${row[1]} has five fields`);
  const [href,title,parent,kind,words]=row;
  // 2026-11-02 (пошук у шапці головної, T7): з’явився вид «study» (розбір дослідження з dist/research-data.js, посилання research.html#<id>); докладно в tests/claim-search.test.mjs.
  assert(title.length>=3&&title.length<=90&&parent&&['section','block','claim','study'].includes(kind)&&typeof words==='string',`${href} is well formed`);
  assert(/^[a-z-]+\.html(\?section=[^#&]+(&n=\d+)?)?(#[A-Za-z0-9_-]+)?$/.test(href),`${href} is a plain page link`);
  // Сторінку розборів і далі не розбираємо за заголовками (SKIP_PAGES): на неї ведуть лише рядки «study» з даних.
  assert(kind==='study'?href.startsWith('research.html#'):!SKIP_PAGES.has(href.split(/[?#]/)[0]),`${href} is not on a skipped page`);
  const anchor=href.split('#')[1];
  assert(!anchor||!SKIP_ANCHOR.test(anchor),`${href} is not an anchor of sources, tabs, the dictionary or dialogs`);
}
assert.equal(new Set(sections.map(r=>`${r[0]}|${normalizeTitle(r[1])}`)).size,sections.length,'no section is listed twice');
const asLink=m=>m.href.replace(/^\.\//,'');
assert(sections.every(r=>!materials.some(m=>asLink(m)===r[0]&&normalizeTitle(m.title)===normalizeTitle(r[1]))),'a section never repeats the name of a material that lives at the same place (materials have their own group)');
const shown=searchSite(data0(),'механізм креатинкінази');
function data0(){return {materials,findMaterials,scoreFields,searchKeywords,enoughMatches,sections,terms:TERMS};}
assert(shown.sections.every(s=>!shown.materials.some(m=>asLink(m)===s.href)),'a section that leads where a shown material already leads is not repeated');

// 3) Договір з anchor-reveal.js: кожне посилання знаходить свій розділ у справжній сторінці тим самим способом, що й браузер.
const pages=new Map();
const pageTree=file=>{if(!pages.has(file))pages.set(file,parseHtml(read('dist/'+file)));return pages.get(file);};
const findById=(root,id)=>{let found=null;walk(root,n=>{if(!found&&n.attrs.id===id)found=n;});return found;};
const hidden=n=>[n,...ancestors(n)].some(a=>['dialog','nav','header','footer'].includes(a.tag)||'hidden' in a.attrs||a.attrs['aria-hidden']==='true');
const textOf=n=>n.text!==undefined?n.text:n.kids.map(textOf).join(' ');
const decodeText=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
for(const [href,title,,kind] of sections){
  if(kind==='study')continue; // 2026-11-02 (пошук у шапці головної, T7): картки розборів малює скрипт сторінки, у готовому HTML їх немає; що посилання відкриває картку, перевіряє tests/claim-search.test.mjs
  const [beforeHash,hash=''] =href.split('#');
  const [file,query='']=beforeHash.split('?');
  const root=pageTree(file);
  const container=hash?findById(root,hash):root;
  assert(container,`${href}: the page has the anchor #${hash}`);
  if(!query)continue;
  const params=new URLSearchParams(query);
  const items=[];
  walk(container,n=>{if(n!==container&&['h2','h3','summary'].includes(n.tag)&&!hidden(n))items.push({el:n,text:decodeText(textOf(n))});});
  const found=pickByTitle(items,params.get('section'),params.get('n'));
  assert(found&&found.el.tag!=='summary',`${href}: the page has a heading named «${title}» inside the target (the same lookup anchor-reveal.js does)`);
}

// 4) Що не потрапило в індекс: списки «Чого ми не стверджуємо» (їхні заголовки читаються як твердження), джерела, словник.
const titles=new Set(sections.map(r=>r[1]));
for(const notClaimed of ['Креатин спалює жир або підвищує витривалість','Лікує хвороби мозку','Покращує мислення в усіх','Цитрулін «спалює жир»','Замінює метформін'])assert(!titles.has(notClaimed),`«${notClaimed}» is something we do NOT claim: it is not a search result of its own`);
assert([...titles].some(t=>t==='Чого ми не стверджуємо'),'the section "What we do not claim" itself can be found by its name');
assert(sections.every(r=>!/^[A-Z][a-z]+ /.test(r[1])),'no English study titles (sources) among the sections');
for(const t of SKIP_TITLES)assert(!titles.has(t),`the generic name «${t}» is not listed`);
assert(!sections.some(r=>r[0].startsWith('changes.html')||r[0].startsWith('glossary.html')),'journal and dictionary pages draw their content with scripts and are not indexed');

// 5) Приклади з життя, у тому числі питання власника про дозування.
const find=(href,title)=>sections.find(r=>r[0]===href&&(!title||r[1]===title));
assert.deepEqual(find('index.html#creatine-dosing','Як приймати')?.slice(1,4),['Як приймати','Креатин','section'],'creatine dosing section');
assert(find('index.html#creatine-dosing','Як приймати')[4].includes('дозування'),'«дозування» leads to «Як приймати»');
assert.deepEqual(find('index.html?section='+encodeURIComponent('Вагітність')+'#supplement-caffeine')?.slice(1,4),['Вагітність','Кофеїн','claim'],'a claim card without its own id is reached by its name inside the dossier');
assert(find('nutrition.html#diet-intermittent-fasting','Інтервальне голодування'),'diets are sections of the diet page');
assert(sections.some(r=>r[0].startsWith('protein-meta.html?section=')&&r[1]==='Що таке метааналіз?'),'a page without any anchors is reached by section names');
assert(sections.filter(r=>r[0].includes('&n=')).every(r=>sections.some(o=>o!==r&&o[1]===r[1]&&o[0]===r[0].replace(/&n=\d+/,''))),'a repeated name inside one block carries its number (the first one has none)');

// 6) Пошук: що показується за запитом.
const data={materials,findMaterials,scoreFields,searchKeywords,enoughMatches,sections,terms:TERMS};
const secs=q=>searchSite(data,q).sections;
const top=q=>secs(q).map(s=>s.href);
assert.equal(top('дозування')[0],'index.html#creatine-dosing','«дозування» finds the creatine dosing section first');
assert.deepEqual(top('як пити креатин'),['index.html#creatine-dosing'],'the owner\'s question finds the dosing section (the word «креатин» only names the material)');
assert(top('нирки').includes('index.html#creatine-kidney'),'«нирки» finds the kidney section');
assert(secs('вагітність').some(s=>s.parent==='Кофеїн'&&s.kind==='claim'),'«вагітність» finds the caffeine claim');
assert(secs('вагітність').length>=3&&secs('вагітність').every(s=>/вагітн/i.test(s.title)),'and the other pregnancy sections');
assert.deepEqual(secs('кава і креатин').map(s=>s.title),['«Кава нейтралізує креатин»'],'both words of the query must be met: the myth about coffee and creatine');
assert.deepEqual(secs('креатин'),secs('креатин').filter(s=>s.parent!=='Креатин'),'a query that only names a material does not list that material\'s sections');
assert.deepEqual(secs('спалює жир'),[],'items from "what we do not claim" are not found as results');
assert(secs('світло перед сном').some(s=>s.title==='Світло й спокій'),'everyday words reach the sleep section');
assert(secs('що показали результати').some(s=>s.href.startsWith('protein-meta.html?section=')),'a page without anchors: its sections are found by their names');
assert.deepEqual(secs('метааналіз'),[],'a query that only names a material lists none of the material\'s sections (the material itself is in the other group)');
assert.equal(secs('цццц').length+secs('   ').length,0,'nonsense and an empty query find no sections');
for(const title of ['Що змінюється','Перш ніж приймати','Чого ми не стверджуємо']){const same=secs(title).filter(s=>s.title===title);assert(same.length>=1&&same.length<=2,`«${title}» exists in every dossier but at most two of them are shown`);}
assert(secs('побічні ефекти').length===2&&secs('побічні ефекти').every(s=>s.title==='Побічні ефекти'),'both words must match: only the sections that are about side effects');
assert(secs('сон').some(s=>s.title==='Сон'&&s.parent==='Кофеїн'),'«сон» finds the caffeine claim «Сон»');
assert(secs('сон').length<=6,'at most six sections are shown');
const ranked=findSections([['a.html#x','Один','М','section',''],['a.html#y','Один два','М','section','']],['один','два'],{scoreFields});
assert.equal(ranked.length,1,'a section that does not match both words of a two-word query is not shown');
assert.deepEqual(findSections([],['а'],{scoreFields}),[],'no index, no sections');
assert.deepEqual(searchSite({materials,terms:TERMS},'креатин').sections,[],'the search without an index still works and returns an empty group');
for(const s of ['білок','креатин','сон','кофеїн','жир','інтервал'])assert(searchSite(data,s).materials.length+searchSite(data,s).sections.length>0,`suggestion «${s}» finds something`);

// 7) Вікно пошуку, завантаження й каскад версій.
const src=read('src/platform/search.mjs'),dist=f=>read('dist/'+f);
assert(src.includes('<h2>Розділи на сторінках</h2>')&&src.includes("s.kind==='claim'?'Твердження':'Розділ'"),'the dialog has its own group «Розділи на сторінках» and says whether it is a claim or a section');
assert(src.includes("import('./platform-sections.js?v=3').catch(()=>({sections:[]}))"),'the index loads only when the search opens, and the search still works without it'); // 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
assert.equal(dist('platform-search.js'),src,'the built search copy equals the source');
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(src+read('scripts/sections-config.mjs')+text),'the sections search stores and sends nothing');
assert(dist('site-header.js').includes("import('./platform-search.js?v=15')"),'the header loads search v=15'); // 2026-11-02 (пошук у шапці головної, T7): 13 -> 14 (група «Розбори», новий порожній результат) 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
assert(dist('home-spectrum.js').includes("import('./platform-search.js?v=15')"),'the home search form loads search v=15'); // 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
const versions=(file,mod)=>[...new Set([...dist(file).matchAll(new RegExp(`${mod}\\.js\\?v=(\\d+)`,'g'))].map(m=>m[1]))];
assert.deepEqual(versions('index.html','home-spectrum'),['8'],'the home loads home-spectrum v=8'); // 2026-11-10: bump the entry after increasing the wave renderer to v=2 for slow idle drift.
assert.deepEqual(versions('directions.html','directions'),['115'],'the catalogue loads directions v=115'); // 2026-11-02 (пошук у шапці головної, T7): 111 -> 112 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки. 2026-11-03 (картка «Клітини та органели» в каталозі показує головну картину сторінки «Клітина людини»): 113 -> 114, змінився лише query-рядок; індекс розділів той самий. 2026-11-03 (картки Харчування, Добавок, Руху й Сну в каталозі з картинками, «26 так»): 114 -> 115, змінився лише query-рядок; індекс розділів той самий.
assert.deepEqual(versions('atlas.html','platform-shell'),['110'],'pages load the shell v=110'); // 2026-11-02 (пошук у шапці головної, T7): 108 -> 109 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&dist(f).includes('site-header.js?v=')))assert.deepEqual(versions(f,'site-header'),['17'],`${f} loads the header v=17`); // 2026-11-02 (пошук у шапці головної, T7): 15 -> 16 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
assert(dist('platform-shell.js').includes('./site-header.js?v=17'),'the shell loads the header v=17'); // 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.
assert(dist('fat-burning.js').includes('./site-header.js?v=17'),'the fat-burning page loads the header v=17'); // 2026-11-03 («Довіра», сторінка «Про проєкт»): версію піднято в каскаді, змінились лише query-рядки.

// 8) Журнал оновлень і документи.
const changes=dist('changes-data.js');
assert(changes.includes("title:'Пошук знаходить розділи всередині сторінок'")&&changes.indexOf("title:'Пошук знаходить розділи всередині сторінок'")<changes.indexOf("title:'Пошук шукає за ключовими словами'"),'the journal tells about it, newest first');
const doc=read('docs/SEARCH.md');
assert(doc.includes('Розділи сторінок')&&doc.includes('scripts/build-sections.mjs')&&doc.includes('sections-config.mjs')&&doc.includes('anchor-reveal')&&doc.includes('tests/search-sections.test.mjs')&&doc.includes('sectionsFlow'),'docs/SEARCH.md explains section search, how to add words, the landing module and the checks');
console.log('Section search: parser, generated index fresh and safe, every link resolves like the browser does, not-claimed items kept out, owner\'s dosing question, ranking and limits, dialog, cascade versions, journal and docs passed.');
