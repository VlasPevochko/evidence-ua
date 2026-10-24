import assert from 'node:assert/strict';
import fs from 'node:fs';
import {supplements,groups,filterSupplements,renderRow} from '../dist/supplements.js';

const html=fs.readFileSync('dist/supplements.html','utf8'),css=fs.readFileSync('dist/supplements.css','utf8'),home=fs.readFileSync('dist/index.html','utf8');

// 2026-10-22 (owner decision «1» — align the catalogue with the new cards): tags, summaries and limits were rewritten from
// the approved Claims of each card; no new scientific conclusions. The rows below freeze that wording; order and ids unchanged.
const frozen=[
  {"id": "creatine", "tag": "Сила · безжирова маса", "summary": "Разом із силовими тренуваннями — більше сили й безжирової маси. Витривалість не покращує.", "limit": "Креатинін у крові може трохи зрости без шкоди ниркам — скажи лікарю перед аналізами."},
  {"id": "supplement-protein", "tag": "Білок · гіпертрофія", "summary": "З тренуваннями білок трохи додає сили й безжирової маси. Без тренувань силу не збільшує.", "limit": "Орієнтир близько 1,6 г на кг на добу — не точна норма; головне — самі тренування."},
  {"id": "supplement-caffeine", "tag": "Працездатність · сон", "summary": "Допомагає швидше пройти дистанцію й трохи додає сили.", "limit": "Увечері скорочує сон; енергетики підвищують тиск. Дорослим — до 400 мг на добу."},
  {"id": "supplement-omega", "tag": "EPA · DHA", "summary": "Знижує тригліцериди приблизно на 15%. На серце й смертність майже не впливає.", "limit": "Підвищує ризик фібриляції передсердь, особливо понад 1 г на добу."},
  {"id": "supplement-vitd", "tag": "Кістки · дефіцит", "summary": "Без дефіциту переломів не зменшує; застуд і подібних інфекцій трохи менше.", "limit": "Великі разові дози підвищують ризик падінь і переломів."},
  {"id": "supplement-magnesium", "tag": "Тиск · сон · судоми", "summary": "Трохи знижує тиск. Нічних судом у літніх людей не зменшує.", "limit": "Найчастіший побічний ефект — діарея; з добавок не більше 350 мг на добу."},
  {"id": "supplement-collagen", "tag": "Сухожилля · суглоби", "summary": "Разом із тренуваннями — трохи більше безжирової маси й сили.", "limit": "Певність доказів здебільшого низька; дослідження дуже різні, частина — упереджена."},
  {"id": "supplement-beta-alanine", "tag": "Карнозин · інтенсивність", "summary": "Малий ефект у виснажливих зусиллях на 0,5–10 хв після тижнів щоденного прийому.", "limit": "Склад тіла не змінює; єдиний побічний ефект — поколювання шкіри."},
  {"id": "supplement-citrulline", "tag": "Зусилля · відновлення", "summary": "Ефект малий або відсутній: витривалість і силу не покращує.", "limit": "Певність доказів низька або дуже низька; надійної дози не встановлено."},
  {"id": "supplement-electrolytes", "tag": "Гідратація · потовиділення", "summary": "Після зневоднення спортивний напій відновлює рідину краще за воду.", "limit": "Користь — для довгих навантажень і спеки; пити забагато небезпечно."}
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
console.log('Supplements page: ten entries with card-aligned texts, links to existing dossiers, filter and search, folded limits, one header and no third-party requests passed. Browser verification is in Browser QA.');
