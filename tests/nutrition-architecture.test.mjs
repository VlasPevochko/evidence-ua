// Owner-selected Spectrum home (2026-10-27): refresh shared header/search cache parents; historical scientific fixtures stay unchanged.
// 2026-10-26 Muscle Lab guide: catalog/materials gained muscle units and search words → versions cascade (catalog/materials/tools/shell/directions/home-feedback 98→99, site-header 5→6, search 3→4).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {earlyScript} from '../src/platform/appearance.mjs';

const sha=s=>createHash('sha256').update(s).digest('hex');
const baseline=JSON.parse(fs.readFileSync('tests/fixtures/nutrition-architecture-preservation.json','utf8'));
const hub=()=>fs.readFileSync('dist/nutrition.html','utf8');
// 2026-10-31 (палітра «космос / зелений», рішення власника): усі сторінки крім головної отримали <link palette-cosmic.css>, ранній скрипт вигляду
// тепер знає й про колір, а таблиці стилів і модулі оболонки — нові версії в query-рядку. Зміст сторінок не змінювався. Повертаємо ці зміни назад,
// а далі працює старий ланцюжок нижче (попередні версії → історичні).
const EARLY_BEFORE_PALETTE="try{var a=JSON.parse(localStorage.getItem('eua-appearance-v1')||'{}'),d=document.documentElement,t=a.theme;if(t==='auto')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';if(t==='light')d.dataset.theme='light';if(a.text==='lg'||a.text==='xl')d.dataset.text=a.text}catch(e){}";
// 2026-11-01 (малюнки й плити у фіолетовому стилі): файл палітри піднято до v=3, page-pine.css до v=22, а кожна плитка дієт тепер має пару зображень
// (оригінал для «Зеленого» + фіолетова копія diet-art-cosmic.svg). Зміст і тексти дієт не змінювались: повертаємо одну картинку на плитку.
// 2026-11-01 (заголовки карток як на головній): файл палітри піднято до v=4, бо в ньому з'явилось правило заголовків. Змінилась лише версія в query-рядку, зміст сторінок той самий.
// 2026-11-01 (назви сторінок як на головній): ще одне правило в тому самому файлі, версія v=5. Знову лише версія в query-рядку.
// 2026-11-01 (шапка й меню як на головній): ще одне правило в тому самому файлі, версія v=6. Знову лише версія в query-рядку.
// 2026-11-01 (без мазка під назвою сторінки): ще одне правило в тому самому файлі, версія v=7. Знову лише версія в query-рядку.
// 2026-11-01 (пошук за ключовими словами): каскад версій через materials.mjs (materials 104, tools 104, directions 110, home-feedback 104, shell 107, search 12, header 14, home-spectrum 4, fat-burning 12: дві останні сторінки самі імпортують пошук і шапку). Змінились лише версії в query-рядках.
const singleDietArt=text=>text.replace(/ data-art="green"><img src="\.\/diet-art-cosmic\.svg\?v=[12]#view-(?:[a-z-]+|\$\{esc\(d\.id\)\})"[^>]*data-art="cosmic">/g,'>').replace(/diet-art\.svg\?v=\d+/g,'diet-art.svg?v=86'); // Normalize art-pair versions while protecting the older card markup and content.
// 2026-11-03: normalize only the newly added, evidence-backed story presentation so the historical hash continues to protect every existing diet statement, source and research section.
// 2026-11-04: normalize the carousel controls and module as presentation-only markup; the same hash still protects all diet research and wording.
const withoutDietCarousel=text=>text.replace(/<div class="nd-carousel-controls"[\s\S]*?(?=<div class="nd-grid" data-diet-carousel)/g,'').replace('<div class="nd-grid" data-diet-carousel role="region" aria-label="Карусель дієт" aria-roledescription="карусель" tabindex="0">','<div class="nd-grid">').replace('<script type="module" src="./nutrition-diets-carousel.js?v=1"></script>','');
const withoutDietStories=text=>text.replace(/^const storyHTML=d=>\{[\s\S]*?^};\n/m,'').replace('${storyHTML(d)}','').replace('<script type="module" src="./nutrition-diets-share.js?v=2"></script>','').replace(/<details class="nd-story"[\s\S]*?<\/details>/g,'');
// 2026-11-09: the eight diet reviews add these named trial results and refine two DASH summaries.
// The historical hash still protects the other findings and all scientific blocks on the physiology page.
const dietTrialDois=new Set([
 '10.1056/NEJMoa1800389',
 '10.1016/S0140-6736(22)00122-2',
 '10.1056/NEJM199704173361601',
 '10.1056/NEJM200101043440101',
 '10.1093/ajcn/nqac154',
 '10.1001/jama.2018.0245',
 '10.3945/ajcn.115.119339',
 '10.1056/NEJMoa0804748',
 '10.1161/CIRCULATIONAHA.117.030088',
 '10.1001/jamanetworkopen.2023.44457',
 '10.1056/NEJMoa2114833',
]);
const dietEditorialChanges=[
 ["EVIDENCE_REVIEW_NOTE} from","EVIDENCE_CHECKED} from"],
 ["${esc(EVIDENCE_REVIEW_NOTE)}","Огляд опублікованих оглядів із PubMed, звірено ${EVIDENCE_CHECKED}. Це не оцінка Evidence UA: власні рівні впевненості ще не присвоєно."],
 ["Кожна картка пояснює принцип раціону та показує, у кого, за який час і порівняно з чим виміряли його ефект.","Спочатку — принцип і склад. Далі розбиратимемо дослідження: для кого, з чим порівнювали та які результати отримали."],
 ["Результати випробувань для 8 підходів","Огляд літератури додано, власні рівні впевненості ще ні"],
 ["Як читати результати","Як будемо оцінювати ефективність"],
 ["У перших результатах кожної картки вказано учасників, тривалість і групу порівняння. Величина ефекту залежить від цих умов.","Для кожного результату зазначимо учасників, групу порівняння, тривалість, величину ефекту та невизначеність. Окремо розглянемо дотримання раціону й небажані явища."],
 ["Артеріальний тиск, вага й частота інфарктів відповідають на різні питання. Результати окремих випробувань читають у межах конкретного показника й порівняння.","Картки переказують висновки опублікованих оглядів із посиланнями. Власну оцінку впевненості Evidence UA додамо після окремої перевірки."],
 ["Попередні джерела звірено 26.10.2026. Ключові випробування звірено 09.11.2026. Це не оцінка Evidence UA: власні рівні впевненості ще не присвоєно.","Огляд опублікованих оглядів із PubMed, звірено 26.10.2026. Це не оцінка Evidence UA: власні рівні впевненості ще не присвоєно."],
 ["В огляді Cochrane (5 РКД, 1397 учасників) даних про інфаркт, інсульт і смертність було недостатньо для надійного висновку. Спостереження тривало від 16 тижнів до 18 місяців, певність щодо клінічних подій була низькою або дуже низькою.","В огляді Cochrane (5 РКД, 1397 учасників) DASH, ймовірно, знижує тиск, загальний холестерин і тригліцериди порівняно зі звичайним харчуванням, а на ЛПНЩ майже не впливає. Вплив на інфаркт, інсульт і смертність невідомий; довіра низька або дуже низька."],
 ["В огляд увійшли 22 РКД, до кількісного синтезу — 10. Перевагу DASH над іншими раціонами за тиском не встановили (верхній тиск: різниця 1,30 мм рт. ст., 95% ДІ від −1,54 до 4,14). Результати досліджень помітно різнилися.","У мета-аналізі 22 РКД DASH не мав переваги над іншими дієтами за тиском (систолічний: різниця 1,30 мм рт. ст.; 95% ДІ −1,54…4,14). Є ефекти на ЛПНЩ (−8,59 мг/дл) і HbA1c (−0,49). Довіра від помірної до дуже низької."],
];
const historicalDietCopy=text=>{
 const withoutTrials=text.replace(/<li>[^<]* <a class="nd-source" href="https:\/\/doi\.org\/([^"]+)"[^>]*>[^<]*<\/a><\/li>/g,
  (row,doi)=>dietTrialDois.has(doi)?'':row);
 return dietEditorialChanges.reduce((html,[current,historical])=>html.replaceAll(current,historical),withoutTrials);
};
const retainedDietText=text=>historicalDietCopy(withoutDietStories(withoutDietCarousel(singleDietArt(text))));
// 2026-11-03 («Довіра», спільне застереження): збірка вставляє в кожну сторінку один рядок застереження (<div class="eua-site-notice">…</div>) перед кінцевими
// скриптами та підключає site-notice.css у <head>. Наукових блоків це не торкається; для звірки зі старим еталоном прибираємо лише ці два вставлені місця.
const withoutSiteNotice=html=>html.replace(/<div class="eua-site-notice"[\s\S]*?<\/div>\n?/,'').replace(/<link rel="stylesheet" href="\.\/site-notice\.css\?v=\d+">/,'');
const beforePalette=html=>withoutSiteNotice(singleDietArt(html)).replaceAll('platform-shell.js?v=110','platform-shell.js?v=106').replaceAll('site-header.js?v=17','site-header.js?v=13').replaceAll('fat-burning.js?v=15','fat-burning.js?v=11').replace('<script type="module" src="./anchor-reveal.js?v=1"></script>','').replace(/<link rel="stylesheet" href="\.\/palette-cosmic\.css\?v=\d+">/,'') /* 2026-11-02 (пошук у шапці головної, T7): shell v=109, header v=16, fat-burning v=14 (каскад версій пошуку, лише query-рядки). 2026-11-02 (T2, значки типів): palette-cosmic.css v=7 -> v=8; версія тепер будь-яка, щоб наступні підняття не ламали звірку зі старою сторінкою */.replaceAll(earlyScript,EARLY_BEFORE_PALETTE) // 2026-11-03 («Довіра»: сторінка «Про проєкт», спільне застереження): shell v=110, header v=17, fat-burning v=15 (лише query-рядки).
 .replaceAll('page-pine.css?v=22','page-pine.css?v=19').replaceAll('evidence/evidence.css?v=59','evidence/evidence.css?v=57').replaceAll('digestion.css?v=5','digestion.css?v=3')
 .replaceAll('appearance.css?v=6','appearance.css?v=4').replaceAll('appearance.js?v=4','appearance.js?v=2').replaceAll('platform-shell.js?v=106','platform-shell.js?v=104')
 .replaceAll('fat-burning.css?v=4','fat-burning.css?v=2').replaceAll('fat-burning-pine.css?v=5','fat-burning-pine.css?v=3').replaceAll('site-header.js?v=13','site-header.js?v=11')
 .replaceAll('platform-next-steps.js?v=6','platform-next-steps.js?v=3').replaceAll('platform-terms.js?v=4','platform-terms.js?v=2');


test('the home Nutrition entry opens the hub rather than bypassing it into physiology',()=>{
 const links=JSON.parse(execFileSync('python',['-c',`from pathlib import Path
from lxml import html
import json
root=html.fromstring(Path('dist/index.html').read_text(encoding='utf-8'))
print(json.dumps(root.xpath('//a[strong[normalize-space(.)="Розібрати харчування"]]/@href')))
`],{encoding:'utf8'}));
 assert.deepEqual(links,['./nutrition.html'],'general Nutrition choices must let the visitor choose a branch');
});

test('Nutrition retains the diets and offers the physiology branch without loading its models',()=>{
 const html=hub();
 assert(html.includes('href="./nutrition-inside.html"'),'the physiology branch must open from Nutrition');
 assert(html.includes('href="#nutrition-diets"'));
 for(const id of ['nutrition-fat-burning','nutrition-lab','nutrient-time','nutrition-evidence','nutrition-sources'])assert(!html.includes(`id="${id}"`),`${id} belongs on the physiology page`);
 assert(!/src="(?:\.\/)?nutrition-(?:lab|timeline)\.js/.test(html),'the entry must not boot missing model controls');
 const b=baseline.blocks.diets,diets=retainedDietText(html);assert.equal(sha(diets.slice(diets.indexOf(b.start),diets.indexOf(b.end)+b.end.length)),b.sha256,'diet research outside the reviewed updates must be retained verbatim');
});

// This UI controller intentionally changes for the audited focus bug. Reconstruct
// only those exact edits for the independent pre-move hash; all other code stays protected.
function historicalNutritionController(text){
 const edits=[
  ...['250,210','650,210','650,383','250,280','127,395','550,407'].map(point=>[',focus:['+point+']','']),
  [' // Explicit selection follows the structure; ordinary steps follow the route action.\n // Phone-only zoom uses drawing percentages, clamped so no empty edge shows.',' // Zoom the diagram towards the active point (phone only). Percentages of the drawing; clamped so no empty edge shows.'],
  ['  const [x,y]=selectedStructure?structures[selectedStructure].focus:[focusX[routeId][index],focusY[routeId]];\n  const px=x/900*100,py=y/560*100;','  const px=focusX[routeId][index]/900*100,py=focusY[routeId]/560*100;'],
  ["'./evidence/components.js?v=2.2'","'./evidence/components.js?v=55'"]
 ];
 for(const [current,historical] of edits){assert.equal(text.split(current).length-1,1,'Authorized controller edit must match exactly');text=text.replace(current,historical);}
 return text;
}

test('moved mechanisms, scientific SVGs and source disclosures retain their exact original blocks',()=>{
 assert(fs.existsSync('dist/nutrition-inside.html'),'the physiology page must exist');
 const html=fs.readFileSync('dist/nutrition-inside.html','utf8');
 for(const [name,b] of Object.entries(baseline.blocks).filter(([n])=>n!=='diets')){
  let end=html.indexOf(b.end,html.indexOf(b.start))+b.end.length;
  // Nested sections belong to the timeline, so bound complete top-level blocks by the next section.
  const next={lab:'<section class="nl-timeline"',timeline:'<section id="nutrition-evidence"',evidence:'<section id="nutrition-sources"',sources:'<footer class="nl-footer"'}[name];
  if(next)end=html.indexOf(next,html.indexOf(b.start));
  assert.equal(sha(html.slice(html.indexOf(b.start),end).trim()),b.sha256,name+' must be moved without rewriting');
 }
 // page-pine.css v16 -> v17 (компактні банери, рішення власника 2026-10-25): лише версія в query-рядку, зміст сторінок той самий. fat-burning-pine.css v2 -> v3 (компактний банер, 2026-10-25): так само лише версія.
 // Shared UI cache revisions only: the authored physiology controller is otherwise compared byte-for-byte.
 for(const [file,hash] of Object.entries(baseline.files))assert.equal(sha(file.endsWith('.html')?beforePalette(fs.readFileSync(file,'utf8')).replaceAll('fat-burning.js?v=11','fat-burning.js?v=4').replaceAll('fat-burning.js?v=9','fat-burning.js?v=4').replaceAll('fat-burning.js?v=6','fat-burning.js?v=4').replaceAll('fat-burning.js?v=5','fat-burning.js?v=4').replaceAll('appearance.js?v=2','appearance.js?v=1').replaceAll('platform-shell.js?v=104','platform-shell.js?v=97').replaceAll('platform-shell.js?v=101','platform-shell.js?v=97').replaceAll('platform-shell.js?v=100','platform-shell.js?v=97').replaceAll('site-header.js?v=11','site-header.js?v=4').replaceAll('site-header.js?v=8','site-header.js?v=4').replaceAll('site-header.js?v=7','site-header.js?v=4').replaceAll('digestion-viewer.js?v=4','digestion-viewer.js?v=1').replaceAll('digestion-viewer.js?v=3','digestion-viewer.js?v=1').replaceAll('page-pine.css?v=19','page-pine.css?v=16').replaceAll('page-pine.css?v=17','page-pine.css?v=16').replaceAll('fat-burning-pine.css?v=3','fat-burning-pine.css?v=2').replaceAll('./nutrition-inside.html#nutrition-lab','./nutrition.html#nutrition-lab').replaceAll('./nutrition-inside.html?nutrient=','./nutrition.html?nutrient='):file==='dist/nutrition-lab.js'?historicalNutritionController(fs.readFileSync(file,'utf8')):file==='src/nutrition-diets/render.mjs'?retainedDietText(fs.readFileSync(file,'utf8')):fs.readFileSync(file)),hash,file+' changed outside the authorized move');
 assert(!html.includes('id="nutrition-diets"'));
});

test('old Nutrition URLs preserve valid model state and the deployment subdirectory',async()=>{
 const {nutritionDestination}=await import('../src/nutrition/navigation.mjs').catch(()=>({}));
 assert.equal(typeof nutritionDestination,'function','legacy model links need their routing function');
 const cases=[
  ['https://example.test/evidence-ua/nutrition.html#nutrition-lab','https://example.test/evidence-ua/nutrition-inside.html#nutrition-lab'],
  ['https://example.test/evidence-ua/nutrition.html?nutrient=protein&step=2&scale=cell#nutrition-lab','https://example.test/evidence-ua/nutrition-inside.html?nutrient=protein&step=2&scale=cell#nutrition-lab'],
  ['https://example.test/nutrition.html?scale=body#nutrition-lab','https://example.test/nutrition-inside.html?scale=body#nutrition-lab'],
  ['https://example.test/nutrition.html#nutrient-time','https://example.test/nutrition-inside.html#nutrient-time'],
  ['https://example.test/nutrition.html#nutrition-diets',null],
  ['https://example.test/nutrition.html?nutrient=protein#diet-vegan',null],
  ['https://example.test/nutrition.html?utm_source=test',null],
  ['https://example.test/nutrition.html?step=999',null],
  ['https://example.test/nutrition-inside.html#nutrition-lab',null]
 ];
 for(const [input,want] of cases)assert.equal(nutritionDestination(input),want,input);
});

test('share links and discovery resolve the new physiology page without dropping selected state',async()=>{
 const {contextLink,findMaterials}=await import('../src/platform/materials.mjs');
 assert.equal(contextLink('https://example.test/evidence-ua/nutrition-inside.html?nutrient=lipids&step=3&scale=cell&token=private#nutrition-lab'),'https://example.test/evidence-ua/nutrition-inside.html?nutrient=lipids&step=3&scale=cell#nutrition-lab');
 assert(findMaterials('дієти').some(m=>m.href==='./nutrition.html#nutrition-diets'));
 assert(findMaterials('усмоктування').some(m=>m.href.startsWith('./nutrition-inside.html')));
});

test('the utility disclosure dismisses on Escape/outside clicks and leaves active dialogs in control',async()=>{
 const {mountNutritionNavigation}=await import('../src/nutrition/navigation.mjs');
 const handlers=new Map(),windowHandlers=new Map();
 let dialogOpen=false,focusReturned=false,redirected=null;
 const inside={closest:()=>null};
 const menu={open:true,contains:node=>node===inside,querySelector:()=>({focus(){focusReturned=true;}})};
 const root={body:{dataset:{}},defaultView:{location:{href:'https://example.test/nutrition.html#nutrient-time',replace(value){redirected=value;}},addEventListener(name,fn){windowHandlers.set(name,fn);}},querySelector:()=>dialogOpen?{}:null,querySelectorAll:()=>menu.open?[menu]:[],addEventListener(name,fn){handlers.set(name,fn);}};
 mountNutritionNavigation(root);
 assert.equal(redirected,'https://example.test/nutrition-inside.html#nutrient-time');
 handlers.get('keydown')({key:'Escape',preventDefault(){}});assert(!menu.open);assert(focusReturned);
 menu.open=true;dialogOpen=true;handlers.get('keydown')({key:'Escape'});assert(menu.open,'Escape belongs to an active dialog');
 handlers.get('click')({target:{closest:()=>({})}});assert(menu.open,'clicking in a dialog must preserve its hidden opener');
 dialogOpen=false;handlers.get('click')({target:{closest:()=>null}});assert(!menu.open,'outside click dismisses the disclosure');
 menu.open=true;handlers.get('click')({target:inside});assert(menu.open,'an inside click keeps controls usable');
 root.body.dataset.euaFocus='true';handlers.get('keydown')({key:'Escape'});assert(menu.open,'study mode receives Escape first');
});
