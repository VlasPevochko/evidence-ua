// «Довіра 1» (2026-11-03): сторінка «Про проєкт». Текст пише лише те, що можна перевірити за самим сайтом; імен, посад і кваліфікацій автора на ній немає, бо власник їх не вказував.
// Тест зв’язує кожне твердження сторінки з кодом чи даними: якщо сайт зміниться (з’явиться лічильник відвідувань чи записаний науковий перегляд), тест зупинить збірку, доки сторінку не оновлено.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {materials,findMaterials} from '../src/platform/materials.mjs';
import {sections} from '../dist/platform-sections.js';

const read=file=>fs.readFileSync(file,'utf8');
const page=read('dist/about.html'),index=read('dist/index.html');
const body=page.slice(page.indexOf('<body'));
const textOf=html=>html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const text=textOf(body);

// 1. Будова: один h1, перший <header> лише заглушка для спільної шапки, шість розділів з якорями, коротка сторінка.
assert.equal((page.match(/<h1\b/g)||[]).length,1);
assert.equal((page.match(/<header\b/g)||[]).length,1,'only the placeholder for the shared header (the navigation is inserted after every header)');
assert.deepEqual([...page.matchAll(/<h2 id="(ab-[a-z]+)">([^<]+)<\/h2>/g)].map(match=>[match[1],match[2]]),[
  ['ab-what','Що це за сайт'],['ab-not','Чого сайт не робить'],['ab-method','Як ми працюємо з доказами'],['ab-atlas','Про Атлас'],['ab-review','Стан наукового перегляду'],['ab-fix','Як ми виправляємо помилки'],['ab-privacy','Приватність']
],'seven sections, each with an anchor (the Atlas section was added on 2026-11-10: owner decision «1-7 так», item 6)');
// Ліміт слів 460 → 540: власник вирішив додати розділ «Про Атлас» (2026-11-10, «1-7 так», п. 6); реальну висоту міряє Browser QA (ліміт на телефоні піднято з 4,4 до 4,8 екрана).
assert(text.split(' ').length<=540,`the page stays short (${text.split(' ').length} words; Browser QA measures the real height)`);
assert(!/<form|<input|<button|<iframe|<img|<video|<audio/i.test(body),'the page is plain text and links');
// Скрипти лише спільні: шапка, вигляд (ранній вбудований скрипт + модуль) і перехід до якоря; власного коду на сторінці немає.
const scripts=[...page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(match=>({attrs:match[1],body:match[2]}));
assert.deepEqual(scripts.filter(script=>/\bsrc=/.test(script.attrs)).map(script=>script.attrs.match(/src="\.\/([a-z-]+\.js)\?v=\d+"/)?.[1]).sort(),['anchor-reveal.js','appearance.js','site-header.js'],'only the shared modules are loaded');
assert.deepEqual(scripts.filter(script=>!/\bsrc=/.test(script.attrs)).map(script=>script.body.includes('eua-appearance-v1')),[true],'the only inline script is the shared early appearance one');
assert.equal(new Set(body.match(/<a [^>]*href="[^"]+"/g).map(tag=>tag.match(/href="([^"]+)"/)[1])).size,body.match(/<a [^>]*href="[^"]+"/g).length,'one control per action: no link target is repeated on the page');

// 2. Чого на сторінці немає: вигаданих осіб, кваліфікацій, перевірок, контактів.
assert(!/@|https?:\/\/|\+380|tel:|mailto:/i.test(body),'no e-mail, phone or outside address');
assert(!/(перевірено|рецензовано|затверджено|підтверджено)\s+(лікар|доктор|професор|фахівц|експерт)/i.test(text),'no claim that anyone reviewed the material');
assert(!/(доктор|кандидат наук|професор|PhD|MD\b)/i.test(text),'no invented titles or degrees of anybody');
assert(text.includes('Матеріал освітній і не є персональною медичною рекомендацією.'),'the approved sentence');
assert(text.includes('Незалежного наукового перегляду')&&text.includes('Науковий перегляд: не завершено'),'the state of the review is stated plainly');

// 3. Посилання сторінки ведуть на справжні місця (файл і якір існують).
const ids=file=>new Set([...read('dist/'+file).matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
const links=[...body.matchAll(/<a [^>]*href="([^"]+)"/g)].map(match=>match[1].replace(/&amp;/g,'&').replace(/^\.\//,''));
assert(links.length>=6,`links found: ${links.length}`);
for(const href of links){
  const [path,hash]=href.replace(/^\.\//,'').split('#'),file=path.split('?')[0];
  assert(fs.existsSync('dist/'+file),`${href}: the page exists`);
  // «Як читати докази» на головній створюється скриптом уже в браузері, тому якоря немає в готовому HTML (так само дозволяє tests/platform.test.mjs); справжнє відкриття цього посилання перевіряє Browser QA (aboutFlow).
  if(hash)assert(ids(file).has(hash)||(file==='index.html'&&hash==='evidence-guide-title'),`${href}: the anchor #${hash} exists on ${file}`);
}
for(const required of ['research.html','changes.html','changes.html#ch-how','index.html#home-feedback','index.html?path=evidence&lesson=3#evidence-guide-title','directions.html'])assert(links.includes(required),`the page links to ${required}`);

// 4. Розділ «Приватність» і «Чого сайт не робить» спираються на код: нічого з цього не відбувається на сайті.
const sources=fs.readdirSync('dist').filter(file=>/\.(html|js|css)$/.test(file)).map(file=>[file,read('dist/'+file)]);
for(const [file,content] of sources)assert(!/document\.cookie/.test(content),`${file}: the site sets no cookies`);
const external=file=>file.endsWith('.html')?/<(script|img|iframe|source|video|audio)\b[^>]*\b(src)="https?:\/\/|<link\b[^>]*\bhref="https?:\/\/(?![^"]*\/(evidence-ua\/)?$)[^"]*"[^>]*rel="stylesheet|<link\b[^>]*rel="stylesheet"[^>]*href="https?:\/\//i:/@import\s+(url\()?["']?https?:\/\/|url\(\s*["']?https?:\/\//i;
for(const [file,content] of sources.filter(([file])=>/\.(html|css)$/.test(file)))assert(!external(file).test(content),`${file}: no script, image, style or frame is loaded from a third-party address`);
const tracker=/goatcounter|google-analytics|googletagmanager|gtag\(|plausible|matomo|metrika|hotjar|clarity\.ms|fbq\(|counter\.js/i;
const trackers=sources.filter(([file,content])=>!file.startsWith('platform-sections')&&tracker.test(content)).map(([file])=>file);
if(trackers.length)assert(text.includes('лічильник')&&!text.includes('не рахує'),`a visitor counter is present (${trackers.join(', ')}), so the privacy section must say so (update docs/ABOUT_AND_NOTICE.md too)`);
else assert(text.includes('Зараз сайт не рахує відвідувачів.'),'no counter exists, and the page says exactly that');
// Єдине, що йде назовні, — заявка на відео через GitHub (її відкриває сам відвідувач). Якщо власник підключить Formspree (рішення 16, FORM_ENDPOINT), розділ «Приватність» мусить це назвати.
const endpoint=(read('dist/videos-page.js').match(/export const FORM_ENDPOINT='([^']*)'/)||[])[1];
assert.notEqual(endpoint,undefined,'the video form endpoint constant exists');
if(endpoint)assert(text.includes('Formspree'),'a Formspree form is configured, so the «Приватність» section must name it (and docs/ABOUT_AND_NOTICE.md)');
else assert(text.includes('заявка на GitHub'),'the video form opens a GitHub issue after a click, and the page says so');
// Хостинг названо в розділі «Приватність»: поки сайт на github.io, там «GitHub Pages»; після переїзду на власну адресу текст треба переглянути.
const host=new URL((page.match(/<link rel="canonical" href="([^"]+)"/)||[])[1]).hostname;
assert.equal(text.includes('GitHub Pages'),host.endsWith('.github.io'),`the hosting sentence matches the real address (${host}); after a move to an own domain review the «Приватність» section and this test`);
const commerce=/iherb|amazon\.|aliexpress|rozetka|prom\.ua|olx\.|\bshop\b|\bstore\b|affiliate|[?&](utm_|ref=|aff=)|promo/i;
for(const [file,content] of sources.filter(([file])=>file.endsWith('.html')||file.endsWith('.js'))){
  for(const url of content.match(/https?:\/\/[^\s"'<>)]+/g)||[])assert(!commerce.test(url),`${file}: ${url} looks commercial, but the page says the site sells nothing and shows no ads`);
}
assert(!/adsbygoogle|googlesyndication|doubleclick/i.test(sources.map(([,content])=>content).join('\n')),'no advertising scripts');
const searchSource=read('src/platform/search.mjs');
assert(!/fetch\(|XMLHttpRequest|sendBeacon/.test(searchSource),'search never sends what is typed');
// Налаштування лежать у браузері: localStorage/sessionStorage без жодного мережевого запису поруч з ними.
for(const [file,content] of sources.filter(([file])=>file.endsWith('.js')))assert(!(/localStorage\.setItem/.test(content)&&/sendBeacon|XMLHttpRequest/.test(content)),`${file}: stored settings are not sent anywhere`);

// 5. Твердження про науковий перегляд правдиве: у даних, які показує сайт (модулі добавок і їхні твердження), немає жодного записаного схвалення, а на сторінках стоїть «не завершено».
// Старі досьє (dossiers.json) на сайті не показуються (їх замінили модулі), але охоронець validateDossiers досі не пускає в них запис перегляду: перевіряємо й це.
const evidenceFiles=['caffeine','berberine','protein','electrolytes','magnesium','collagen','vitd','omega','citrulline','beta-alanine','creatine-more'];
const approvals=[];
for(const name of evidenceFiles){
  const exports=Object.values(await import('../dist/evidence/'+name+'-data.js'));
  const module=exports.find(value=>value&&value.route&&value.title),base=exports.find(value=>value&&Array.isArray(value.claims));
  assert(module&&base,`${name}: module and base found`);
  approvals.push(module.scientificApproval,...base.claims.map(claim=>claim.scientificApproval),...(base.reviews||[]).filter(review=>review.status==='approved'));
}
const creatine=await import('../dist/evidence/data.js');
approvals.push(...creatine.creatineClaims.map(claim=>claim.scientificApproval),...creatine.evidenceBase.reviews.filter(review=>review.status==='approved'));
assert.deepEqual(approvals.filter(value=>value!==null&&value!==undefined),[],'no module, claim or review records a scientific approval, so the page may say that none took place (when one is recorded, update the «Стан наукового перегляду» section first)');
const dossiers=JSON.parse(read('src/evidence/supplements/dossiers.json'));
assert(dossiers.every(dossier=>dossier.lastScientificReview===null),'the old dossiers record no finished scientific review either');
assert(index.includes('Науковий перегляд: не завершено'),'the home page cards say the same');

// 6. Шапка, пошук, мета-теги, карта сайту, картка для соцмереж.
assert(read('src/platform/site-header.mjs').includes('href="./about.html">Про проєкт'),'the header link leads to the page');
assert(read('dist/site-header.js').includes('href="./about.html">Про проєкт')&&!read('dist/site-header.js').includes("getElementById('about')"),'the built header has the link and no dialog hook');
assert(!/<dialog id="about"/.test(index),'the old short dialog is gone from the home page (its sentences moved here)');
assert(page.includes('Не відповідь. Початок дослідження.')&&page.includes('Ми залишаємо місце для сумніву'),'the sentences of the old dialog are kept on this page');
const material=materials.find(item=>item.id==='navigation-about');
assert(material&&material.href==='./about.html'&&material.title==='Про проєкт','the page is a material of its own');
for(const query of ['про проєкт','приватність','застереження','рецензент','помилки'])assert(findMaterials(query).some(item=>item.href==='./about.html'),`search finds the page for «${query}»`);
const rows=sections.filter(row=>row[0].startsWith('about.html#'));
assert.deepEqual(rows.map(row=>row[0]),['about.html#ab-what','about.html#ab-not','about.html#ab-method','about.html#ab-atlas','about.html#ab-review','about.html#ab-fix','about.html#ab-privacy'],'the seven sections are in the section search');
assert(rows.every(row=>row[2]==='Про проєкт'&&row[3]==='section'));
assert(/<link rel="canonical" href="https:\/\/[^"]+\/about\.html">/.test(page)&&/<meta property="og:url" content="https:\/\/[^"]+\/about\.html">/.test(page)&&page.includes('/og/about.jpg"'),'canonical, og:url and the share card point to this page');
const card=fs.readFileSync('dist/og/about.jpg');
assert(card.length>20000&&card[0]===0xff&&card[1]===0xd8,'the share card exists and is a JPEG');
assert(read('dist/sitemap.xml').includes('/about.html</loc>'),'the page is in the sitemap');
const description=(page.match(/<meta name="description" content="([^"]*)"/)||[])[1];
assert(description&&description.length<=150,`the description fits the share card (${description?.length})`);

// 7. Журнал, документ, правило проєкту.
assert(read('dist/changes-data.js').includes('Сторінка «Про проєкт» і застереження на кожній сторінці'),'the change log has a record');
assert(fs.existsSync('docs/ABOUT_AND_NOTICE.md'),'the document exists');
// CLAUDE.md не потрапляє в ізольовану копію для тестів (її збирають лише src, dist, scripts, tests і docs), тож рядок правила в ньому тут не перевіряємо: його читає людина під час огляду.
console.log('About page: facts tied to the code, no invented people, links resolve, search and share card, honest review state passed.');
