import assert from 'node:assert/strict';
import fs from 'node:fs';
import {supplements,groups,filterSupplements,renderRow} from '../dist/supplements.js';

const html=fs.readFileSync('dist/supplements.html','utf8'),css=fs.readFileSync('dist/supplements.css','utf8'),home=fs.readFileSync('dist/index.html','utf8');

// The catalogue repeats the wording of the former home carousel word for word (frozen; captured from it
// before the carousel was retired on 2026-10-19). Science is not rewritten here.
const frozen=[
  {"id": "creatine", "tag": "Сила · безжирова маса", "summary": "Силові тренування та повторні інтенсивні зусилля — найкраще вивчені напрями.", "limit": "Безжирова маса включає воду; результат не гарантований."},
  {"id": "supplement-protein", "tag": "Білок · гіпертрофія", "summary": "У розборі — роль білка в адаптації до силових тренувань.", "limit": "Важливий загальний білок у раціоні, а не лише добавка."},
  {"id": "supplement-caffeine", "tag": "Працездатність · сон", "summary": "Може покращувати окремі показники спортивної працездатності.", "limit": "Враховуй індивідуальну реакцію та вплив на сон."},
  {"id": "supplement-omega", "tag": "EPA · DHA", "summary": "Розглядаємо серцево-судинні результати окремо для різних показань.", "limit": "Ефект залежить від складу, дози та досліджуваної групи."},
  {"id": "supplement-vitd", "tag": "Кістки · дефіцит", "summary": "У розборі — кісткове здоров’я та межі користі додаткового прийому.", "limit": "Не переносимо висновки для дефіциту на всіх людей."},
  {"id": "supplement-magnesium", "tag": "Мінерал · дефіцит", "summary": "Необхідний для нервової та м’язової функції; важливе достатнє споживання.", "limit": "Фізіологічна роль не доводить користь додаткової дози для кожного."},
  {"id": "supplement-collagen", "tag": "Сухожилля · навантаження", "summary": "Досліджують як доповнення до тренувань для опорно-рухового апарату.", "limit": "Для багатьох результатів певність доказів низька або дуже низька."},
  {"id": "supplement-beta-alanine", "tag": "Карнозин · інтенсивність", "summary": "Може допомагати в окремих видах інтенсивної роботи після регулярного прийому.", "limit": "Ефект залежить від тривалості та типу зусилля."},
  {"id": "supplement-citrulline", "tag": "Зусилля · відновлення", "summary": "Досліджують вплив на сприйняття навантаження та біль після тренування.", "limit": "Зміна самопочуття не означає доведений приріст м’язів."},
  {"id": "supplement-electrolytes", "tag": "Гідратація · потовиділення", "summary": "Відновлення рідини й натрію залежить від тривалості, спеки та втрат із потом.", "limit": "Спортивний напій не усуває ризик надмірного пиття."}
];
// Berberine was added as the 11th entry on 2026-10-21 (owner decision); the ten frozen rows stay unchanged.
assert.equal(supplements.length,11);
frozen.forEach((original,index)=>{
  const item=supplements[index];
  assert.equal(item.id,original.id,`Same order as before: ${original.id}`);
  assert.equal(item.tag,original.tag);
  assert.equal(item.summary,original.summary);
  assert.equal(item.limit,original.limit);
  assert(home.includes(`id="${original.id}"`),`The dossier ${original.id} exists on the home page`);
  assert.equal(item.x,(index%5)*25);assert.equal(item.y,Math.floor(index/5)*100);
});
assert.equal(new Set(supplements.map(s=>s.id)).size,11);
const berberine=supplements[10];
assert.equal(berberine.id,'supplement-berberine');assert(home.includes('id="supplement-berberine"'));
assert.equal(berberine.photo,'./supplement-berberine-v1.webp');assert(fs.existsSync('dist/supplement-berberine-v1.webp'));
assert(renderRow(berberine).includes('background-image:url(./supplement-berberine-v1.webp)'),'Berberine uses its own photo, not the sprite');

// Filtering and search.
assert.deepEqual(Object.keys(groups),['all','sport','health']);
assert.equal(filterSupplements(supplements).length,11);
assert.equal(filterSupplements(supplements,{group:'sport'}).length+filterSupplements(supplements,{group:'health'}).length,11);
assert.deepEqual(filterSupplements(supplements,{group:'health'}).map(s=>s.name),['Омега-3','Вітамін D','Магній','Берберин']);
assert.deepEqual(filterSupplements(supplements,{query:'  КРЕА '}).map(s=>s.id),['creatine']);
assert.equal(filterSupplements(supplements,{query:'немає такої'}).length,0);

// Row markup: a link to the existing dossier, limits folded, no <header> (the shell injects navigation after every one).
const row=renderRow(supplements[0]);
assert(row.includes('href="./index.html#creatine"')&&row.includes('<details class="sp-limit">')&&!row.includes('<details class="sp-limit" open'));
assert(!/<header\b/.test(row)&&!/<h1\b/.test(row)&&/<h2>Креатин<\/h2>/.test(row));
assert(renderRow({...supplements[0],name:'<b>x</b>'}).includes('&lt;b&gt;'),'Names are escaped');

// Page structure.
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert.equal((html.match(/<header\b/g)||[]).length,1);
assert(html.includes('data-platform-area="supplements"')&&html.includes('supplements.css?v=')&&html.includes('supplements.js?v='));
assert(html.includes('aria-current="page">Добавки</a>'));
for(const id of ['sp-q','sp-list','sp-count','sp-empty'])assert(html.includes(`id="${id}"`),`Missing #${id}`);
assert.equal((html.match(/data-sp-filter=/g)||[]).length,3);
assert(!/https?:\/\/(?!vlaspevochko\.github\.io)/.test(html.replace(/<a [^>]*>/g,'')),'No third-party requests');
assert(!/https?:\/\//.test((css+fs.readFileSync('dist/supplements.js','utf8')).replaceAll('http://www.w3.org/2000/svg','')),'No third-party requests in CSS/JS');
for(const key of ['prefers-reduced-motion','min-height:44px','max-width:900px','position:sticky','source-serif-4-cyrillic-wght-normal.woff2'])assert(css.includes(key),`CSS missing ${key}`);
for(const file of ['source-serif-4-cyrillic-wght-normal.woff2','source-serif-4-latin-wght-normal.woff2'])assert(fs.existsSync('dist/fonts/'+file));

// The other pages point to the new page.
for(const file of ['dist/atlas.html','dist/exercises.html'])assert(fs.readFileSync(file,'utf8').includes('<a href="./supplements.html">Добавки</a>'),`${file} links to the catalogue`);
assert(fs.readFileSync('dist/platform-catalog.js','utf8').includes("href:'./supplements.html'"));
console.log('Supplements page: ten entries with unchanged home texts, links to existing dossiers, filter and search, folded limits, one header and no third-party requests passed. Browser verification is in Browser QA.');
