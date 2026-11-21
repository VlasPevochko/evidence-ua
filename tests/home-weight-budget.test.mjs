// Обмежувач ваги головної (рішення власника «3 та 7», 2026-11-15). Головна не повинна непомітно товщати:
// тест рахує з самих файлів у dist те, що браузер завантажує для першого показу головної, і порівнює з межами нижче.
//   документ: розмір dist/index.html;
//   стилі: усі <link rel="stylesheet"> головної (без друкованих) і їхні @import;
//   скрипти: усі <script src> головної та все, що вони статично імпортують (import … from, import '…');
//   картинки: кожен файл, на який посилається <img> головної (вони ледачі, тому межа лише на найважчий файл).
// Це вага без стиснення: сервер стискає текст, але порівнювати між собою зміни так само чесно.
// Якщо зміна свідомо додає вагу, підніміть відповідну межу тут і напишіть у коментарі чому. Якщо зміна полегшує сторінку,
// опустіть межу до нового значення плюс запас (близько 5%), щоб виграш не з’їли наступні зміни.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const KB=1024;
// Межі = виміряні значення плюс запас близько 5%.
// 2026-11-17 (розбори добавок окремими сторінками, етап 3): з головної прибрано 11 розборів і все, що потрібне лише їм.
// Було: документ 425 КБ, стилі 25 файлів / 272 КБ, скрипти 42 файли / 546 КБ. Стало: документ 80 КБ, стилі 22 / 227 КБ,
// скрипти 21 / 189 КБ, найважча картинка без змін 272 КБ (home-lens-core.webp).
// 2026-11-17 («2 і 3»: перший екран не стрибає + одне твердження наживо): свідомо додано картку твердження під героєм (+6 КБ документа),
// її стилі home-claim.css (+1 файл, ~5 КБ) і раннє підключення site-header.css у <head> (+1 файл; раніше він вантажився скриптом
// уже після показу, тому сюди не потрапляв, а шапка стрибала). Стало: документ 86 КБ, стилі 24 / 244 КБ.
export const BUDGET={
  documentKB:90,
  stylesheetFiles:25,stylesheetKB:256,
  scriptFiles:22,scriptKB:198,
  largestImageKB:286
};

const dist='dist';
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const local=ref=>{
  if(/^(?:[a-z]+:)?\/\//i.test(ref)||ref.startsWith('data:'))return null;
  return ref.split(/[?#]/)[0];
};
const size=file=>fs.statSync(file).size;

// Документ.
const documentBytes=Buffer.byteLength(html);

// Стилі: <link rel="stylesheet"> без media="print", плюс @import усередині.
const sheets=new Set();
function addSheet(file){
  if(sheets.has(file))return;
  assert(fs.existsSync(file),`stylesheet is missing: ${file}`);
  sheets.add(file);
  for(const m of fs.readFileSync(file,'utf8').matchAll(/@import\s+(?:url\()?["']?([^"')\s;]+)/g)){const ref=local(m[1]);if(ref)addSheet(path.join(path.dirname(file),ref));}
}
for(const tag of html.match(/<link\b[^>]*>/g)||[]){
  if(!/rel="stylesheet"/.test(tag)||/media="print"/.test(tag))continue;
  const ref=local((/href="([^"]+)"/.exec(tag)||[])[1]||'');
  if(ref)addSheet(path.join(dist,ref));
}
const sheetBytes=[...sheets].reduce((sum,file)=>sum+size(file),0);

// Скрипти: <script src> і їхні статичні імпорти (динамічний import() вантажиться лише на вимогу й сюди не входить).
const scripts=new Set();
function addScript(file){
  if(scripts.has(file))return;
  assert(fs.existsSync(file),`script is missing: ${file}`);
  scripts.add(file);
  const source=fs.readFileSync(file,'utf8');
  const refs=[...source.matchAll(/(?:^|[;\n}])\s*import\s*(?:[^'"()]*?\bfrom\s*)?["']([^"']+)["']/g),...source.matchAll(/(?:^|[;\n}])\s*export\s*[^'"]*?\bfrom\s*["']([^"']+)["']/g)].map(m=>m[1]);
  for(const raw of refs){const ref=local(raw);if(ref&&/^\.{1,2}\//.test(ref))addScript(path.join(path.dirname(file),ref));}
}
for(const tag of html.match(/<script\b[^>]*\bsrc="[^"]+"[^>]*>/g)||[]){
  const ref=local(/src="([^"]+)"/.exec(tag)[1]);
  if(ref)addScript(path.join(dist,ref));
}
const scriptBytes=[...scripts].reduce((sum,file)=>sum+size(file),0);

// Картинки: усі <img src> головної; усі мають бути ледачими й мати розміри, інакше межа «найважчий файл» нічого не означає.
const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
const imageFiles=new Map();
for(const tag of images){
  const ref=local((/\bsrc="([^"]+)"/.exec(tag)||[])[1]||'');
  if(!ref)continue;
  const file=path.join(dist,ref);
  assert(fs.existsSync(file),`image is missing: ${file}`);
  imageFiles.set(file,size(file));
  assert(/\bloading="lazy"/.test(tag),`an image on the home must load lazily: ${ref}`);
  assert(/\bwidth="\d+"/.test(tag)&&/\bheight="\d+"/.test(tag),`an image on the home must state its size so the page does not jump: ${ref}`);
}
const [largestImage,largestBytes]=[...imageFiles].sort((a,b)=>b[1]-a[1])[0]||['',0];

const kb=bytes=>Math.round(bytes/KB);
const measured={documentKB:kb(documentBytes),stylesheetFiles:sheets.size,stylesheetKB:kb(sheetBytes),scriptFiles:scripts.size,scriptKB:kb(scriptBytes),largestImageKB:kb(largestBytes)};
const names={documentKB:'сам файл сторінки, КБ',stylesheetFiles:'файлів стилів',stylesheetKB:'стилі, КБ',scriptFiles:'файлів скриптів',scriptKB:'скрипти, КБ',largestImageKB:`найважча картинка (${path.basename(largestImage)}), КБ`};
const over=Object.keys(BUDGET).filter(key=>measured[key]>BUDGET[key]);
assert.equal(over.length,0,'Головна стала важчою за межу:\n'+over.map(key=>`  ${names[key]}: ${measured[key]} > ${BUDGET[key]}`).join('\n')+'\nЯкщо це свідомо, підніміть межу в tests/home-weight-budget.test.mjs і поясніть у коментарі.');
// Межа не повинна бути надто вільною: якщо сторінка полегшала більш ніж на 15%, межу треба опустити, інакше вона нічого не стереже.
const slack=Object.keys(BUDGET).filter(key=>measured[key]<BUDGET[key]*0.85);
assert.equal(slack.length,0,'Головна полегшала, а межа лишилась старою (опустіть її до нового значення плюс близько 5%):\n'+slack.map(key=>`  ${names[key]}: ${measured[key]} при межі ${BUDGET[key]}`).join('\n'));
// Сам лічильник має щось бачити: порожній підрахунок означав би, що тест зламано, а не що сторінка легка.
assert(sheets.size>=5&&scripts.size>=5&&imageFiles.size>=5&&documentBytes>20*KB,'the counter found the styles, scripts and images of the home');
console.log(`Home weight budget: document ${measured.documentKB} KB, ${measured.stylesheetFiles} stylesheets ${measured.stylesheetKB} KB, ${measured.scriptFiles} scripts ${measured.scriptKB} KB, largest image ${measured.largestImageKB} KB.`);
