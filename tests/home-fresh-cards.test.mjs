// Бриф T4 (2026-11-02): три різні картки в блоці «Нове на сайті». Усе, що можна, береться з даних сторінок, на які ведуть картки.
// Картка А: питання з дослідженням, що має графік (з ручного списку «Останні розбори», рішення D6) і мініатюра цього графіка.
// Картка Б: два кадри схеми кофеїну; положення молекул звіряємо з mechanisms-page.css, тож кадри не вигадані.
// Картка В: три останні записи журналу з датами з changes-data.js; жодної дати не вписано вручну.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';
import {miniInterval} from '../dist/research-chart.js';
import {CHANGES,SCIENCE} from '../dist/changes-data.js';
import {SCENES} from '../dist/mechanisms-page.js';
import {homeFreshGridHTML,FRAMES,shortDate,plural} from '../src/platform/home-fresh.mjs';

const index=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/home-fresh.css','utf8');
const grid=homeFreshGridHTML({studies:STUDIES,latestStudyId:'sweeteners',changes:CHANGES,science:SCIENCE,scenes:SCENES,miniInterval});

// 1. Блок на головній збирається з даних: готова сторінка містить саме те, що дає генератор. Позначки стоять рівно по одній.
assert.equal(index.split('<!-- EUA_HOME_FRESH_START -->').length-1,1);assert.equal(index.split('<!-- EUA_HOME_FRESH_END -->').length-1,1);
assert(index.includes('<!-- EUA_HOME_FRESH_START -->'+grid+'<!-- EUA_HOME_FRESH_END -->'),'the home page carries exactly what the generator builds from the data (rebuild if this fails)');
// Яке дослідження показати, береться з ручного списку «Останні розбори» на самій головній: перше з тих, що мають графік (рішення D6).
const latest=index.match(/<ul class="home-fresh-latest"[\s\S]*?<\/ul>/)[0],ids=[...latest.matchAll(/research\.html#([a-z0-9-]+)/g)].map(match=>match[1]);
const featured=ids.find(id=>STUDIES.some(study=>study.id===id&&study.chart));
assert.equal(featured,'sweeteners','of the three hand-picked latest write-ups only «sweeteners» has a chart');
assert(!STUDIES.some(study=>Object.keys(study).some(key=>/date|published|order/i.test(key))),'no date field was added to the write-ups (D6): the featured one comes from the hand-written list');

// 2. Три картки, три різні форми, по одному посиланню на картку.
const cards=[...grid.matchAll(/<a class="(home-fresh-card home-fresh-card--(study|scheme|journal))" href="([^"]+)">([\s\S]*?)<\/a>/g)].map(match=>({cls:match[1],kind:match[2],href:match[3],html:match[4]}));
assert.deepEqual(cards.map(card=>card.kind),['study','scheme','journal'],'three cards, each with its own modifier class');
assert.deepEqual(cards.map(card=>card.href),['./research.html','./mechanisms.html','./changes.html']);
assert.equal((grid.match(/<a /g)||[]).length,3,'one link per card, none nested');
assert.equal(new Set(cards.map(card=>card.cls)).size,3);
// Форми справді різні за вмістом: у кожної картки є те, чого немає в двох інших.
assert(cards[0].html.includes('class="eua-mini"')&&!cards[1].html.includes('eua-mini')&&!cards[2].html.includes('eua-mini'),'only the first card has the chart thumbnail');
assert(cards[1].html.includes('fp-svg')&&!cards[0].html.includes('fp-svg')&&!cards[2].html.includes('fp-svg'),'only the second card has the scheme frames');
assert(cards[2].html.includes('<time ')&&!cards[0].html.includes('<time ')&&!cards[1].html.includes('<time '),'only the third card lists dated records');
for(const href of ['./research.html','./mechanisms.html','./changes.html'])assert(fs.existsSync('dist/'+href.slice(2)),`${href} exists`);

// 3. Картка А: питання й мініатюра з даних.
const study=STUDIES.find(item=>item.id===featured);
assert(cards[0].html.includes(`<strong class="home-fresh-question">${study.question}</strong>`),'card A shows the question of the featured write-up');
assert(cards[0].html.includes(miniInterval(study.chart)),'card A carries the same thumbnail the research page builds (same data, same geometry)');
assert(cards[0].html.includes('<span class="home-fresh-summary">Питання, коротка відповідь і чого дослідження не доводить. Можна прочитати лише відповідь.</span>'),'the existing summary sentence is kept');
assert(cards[0].html.includes(`${STUDIES.length} розборів`),'the card counts the write-ups from the data');
assert(!/<text|<title/.test(cards[0].html),'no text inside the thumbnail');
assert.throws(()=>homeFreshGridHTML({studies:STUDIES,latestStudyId:'steps-without-chart-id',changes:CHANGES,science:SCIENCE,scenes:SCENES,miniInterval}),/must exist and have a chart/,'a featured write-up without a chart stops the build');
assert.throws(()=>homeFreshGridHTML({studies:STUDIES,latestStudyId:'falls-older',changes:CHANGES,science:SCIENCE,scenes:SCENES,miniInterval}),/must exist and have a chart/,'«falls-older» has no chart: it cannot be the featured card');

// 4. Картка Б: кадри збігаються з кроками 2 і 3 схеми на сторінці, підписи беруться зі схеми.
const scheme=cards[1].html,schemeCss=fs.readFileSync('dist/mechanisms-page.css','utf8'),schemeHtml=fs.readFileSync('dist/mechanisms.html','utf8');
assert.equal((scheme.match(/<svg class="fp-svg"/g)||[]).length,2,'two frames');
assert((scheme.match(/<svg [^>]*aria-hidden="true"/g)||[]).length===2&&scheme.includes('home-fresh-then" aria-hidden="true"'),'the frames and the arrow between them are decorative');
assert(scheme.includes(`<span class="home-fresh-cap">${SCENES.caffeine[1].tab}</span>`)&&scheme.includes(`<span class="home-fresh-cap">${SCENES.caffeine[2].tab}</span>`),'captions are the step names of the scheme (steps 2 and 3), as text');
const cssMolecules=stage=>[...schemeCss.matchAll(new RegExp(`\\[data-scene="caffeine"\\]\\[data-stage="${stage}"\\] #([ac])(\\d)\\{--x:(-?\\d+)px;--y:(-?\\d+)px;--o:1\\}`,'g'))].map(match=>[match[1]==='a'?'ad':'cf',Number(match[3]),Number(match[4])]).sort((x,y)=>x[0].localeCompare(y[0])||x[1]-y[1]||x[2]-y[2]);
for(const frame of FRAMES){
  const wanted=cssMolecules(frame.stage),drawn=frame.mols.map(item=>item).sort((x,y)=>x[0].localeCompare(y[0])||x[1]-y[1]||x[2]-y[2]);
  assert.deepEqual(drawn,wanted,`frame for step ${frame.stage}: the molecules stand where the scheme puts them`);
  const lamp=Number((schemeCss.match(new RegExp(`\\[data-scene="caffeine"\\]\\[data-stage="${frame.stage}"\\]\\{[^}]*--lamp:([0-9.]+)`))||[])[1]);
  assert.equal(frame.lamp,lamp,`frame for step ${frame.stage}: the lamps glow as in the scheme`);
}
const sockets=[...schemeHtml.matchAll(/<g class="mc-socket" transform="translate\((\d+),204\)"/g)].map(match=>Number(match[1]));
assert.deepEqual([...scheme.slice(0,scheme.indexOf('</svg>')).matchAll(/<path class="fp-socket" transform="translate\((\d+),204\)"/g)].map(match=>Number(match[1])),sockets,'the receptors are where the scheme draws them');
assert(scheme.includes(`${Object.keys(SCENES).length} ${plural(Object.keys(SCENES).length,{one:'анімація',few:'анімації',many:'анімацій'})}`),'the animation count comes from the scenes');
assert(scheme.includes('Кофеїн і аденозин, фосфокреатин і АТФ: схеми, які рухаються крок за кроком.'),'the summary sentence is kept');
assert.deepEqual([plural(1,{one:'a',few:'b',many:'c'}),plural(2,{one:'a',few:'b',many:'c'}),plural(5,{one:'a',few:'b',many:'c'})],['a','b','c']);

// 5. Картка В: три останні записи з журналу, дати з даних.
const entries=CHANGES.flatMap(group=>group.items.map(item=>({date:group.date,...item}))).slice(0,3);
const times=[...cards[2].html.matchAll(/<time datetime="([^"]+)">([^<]+)<\/time>/g)].map(match=>({iso:match[1],text:match[2]}));
const titles=[...cards[2].html.matchAll(/<li>([^<]*)<\/li>/g)].map(match=>match[1].replace(/&quot;|&#39;|&amp;/g,m=>({'&quot;':'"','&#39;':"'",'&amp;':'&'}[m])));
assert.deepEqual(titles,entries.map(entry=>entry.title),'the three newest journal titles, newest first');
assert(times.every(time=>CHANGES.some(group=>group.date===time.iso)&&time.text===shortDate(time.iso)),'every date comes from the journal data');
assert.deepEqual(new Set(times.map(time=>time.iso)),new Set(entries.map(entry=>entry.date)),'the dates shown are the dates of the three entries');
assert(cards[2].html.includes(entries.every(entry=>entry.science==='none')?SCIENCE.none:SCIENCE.new),'the science note is the journal marker of those entries');
assert.equal(shortDate('2026-11-02'),'2 листопада');assert.equal(shortDate('2026-12-31'),'31 грудня');
assert.throws(()=>shortDate('2 листопада'),/YYYY-MM-DD/);assert.throws(()=>shortDate('2026-13-01'),/out of range/);
// Дат у генераторі нема: ні в коді, ні в тексті розмітки поза даними.
const source=fs.readFileSync('src/platform/home-fresh.mjs','utf8').replace(/\/\/[^\n]*/g,'');
assert(!/20\d\d-\d\d-\d\d/.test(source),'no date is written into the generator');
for(const iso of [...grid.matchAll(/datetime="([^"]+)"/g)].map(match=>match[1]))assert(CHANGES.some(group=>group.date===iso),`the date ${iso} is in the data`);
assert.throws(()=>homeFreshGridHTML({studies:STUDIES,latestStudyId:featured,changes:[{date:'2026-11-02',items:[CHANGES[0].items[0]]}],science:SCIENCE,scenes:SCENES,miniInterval}),/at least three entries/,'fewer than three journal entries stop the build');
// Записи двох різних днів стоять під своїми заголовками дат.
const mixed=homeFreshGridHTML({studies:STUDIES,latestStudyId:featured,changes:[{date:'2026-11-02',items:[CHANGES[0].items[0],CHANGES[0].items[1]]},{date:'2026-11-01',items:[CHANGES[1].items[0]]}],science:SCIENCE,scenes:SCENES,miniInterval});
assert.deepEqual([...mixed.matchAll(/<time datetime="([^"]+)"/g)].map(match=>match[1]),['2026-11-02','2026-11-01'],'two days, two date headings');

// 6. Стилі: різні форми, без руху, текст не менший за 12 px, без сторонніх запитів, версія піднята.
const mine=css.slice(css.indexOf('T4 (2026-11-02)'));
for(const selector of ['.home-fresh-card--study','.home-fresh-card--scheme','.home-fresh-card--journal','.home-fresh-question','.home-fresh-frames','.home-fresh-day'])assert(mine.includes(selector),`${selector} is styled`);
assert(!/animation|transition|@keyframes/.test(mine),'the new cards have no motion (the scheme frames are still)');
assert(!/font-size:(9|10|11)px/.test(mine)&&!/https?:\/\//.test(mine),'text not under 12px, no third-party requests');
assert(/grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.55fr\) minmax\(0,1fr\)/.test(mine),'the middle card is wider on the desktop');
assert(/@media\(max-width:860px\)\{[^}]*grid-template-columns:1fr/.test(mine),'the cards stack on narrow screens');
assert(index.includes('./home-fresh.css?v=3'),'the stylesheet version was raised');

// 7. Журнал і документ.
assert(fs.readFileSync('dist/changes-data.js','utf8').includes('Три різні картки в блоці «Нове на сайті»'),'the change log has a record');
const doc=fs.readFileSync('docs/HOME_FRESH_CARDS.md','utf8');
for(const part of ['Що змінено','Висота','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/HOME_FRESH_CARDS.md has the section «${part}»`);
console.log('Home fresh cards: three different shapes, data-driven, scheme frames equal the scheme, journal dates from the data passed.');
