// Бриф T1 (2026-11-02): мініатюра інтервального графіка в шапці згорнутої картки розбору, «лінія інтервалу» на головній.
// Мініатюра малюється з тих самих даних і тією самою розкладкою (chartGeometry), що й повний графік у картці: тест порівнює позиції.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';
import {chartGeometry,crossesNull,miniInterval,MINI_ROWS} from '../dist/research-chart.js';

const charted=STUDIES.filter(study=>study.chart);
assert.deepEqual(charted.map(study=>study.id).sort(),['coffee','dash-vs-others','short-sleep-weight','steps','sweeteners'],'five write-ups have a chart (a new chart gets its thumbnail automatically; update this list)');
assert.equal(MINI_ROWS,4);

// Розбір SVG-рядка без DOM: нам потрібні лише числа атрибутів.
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([A-Za-z0-9-]+)="([^"]*)"/g)].map(match=>[match[1],match[2]]));
const parse=svg=>({
  root:attrs(svg.match(/^<svg[^>]*>/)[0]),
  nullLine:attrs(svg.match(/<line class="eua-mi-null"[^>]*>/)[0]),
  rows:[...svg.matchAll(/<g class="(eua-mi-row[^"]*)">(.*?)<\/g>/g)].map(match=>({
    cls:match[1],
    ci:attrs(match[2].match(/<line class="eua-mi-ci"[^>]*>/)[0]),
    caps:[...match[2].matchAll(/<line class="eua-mi-cap"[^>]*>/g)].map(cap=>attrs(cap[0])),
    dot:attrs(match[2].match(/<circle class="eua-mi-dot"[^>]*>/)[0])
  }))
});
const near=(actual,expected,message)=>assert(Math.abs(Number(actual)-expected)<=0.11,`${message}: ${actual} vs ${expected}`);

for(const study of charted){
  const chart=study.chart,svg=miniInterval(chart),geo=chartGeometry(chart),shown=geo.rows.slice(0,MINI_ROWS),parsed=parse(svg);
  const W=132,H=48,pad=5,plotW=W-2*pad,X=p=>pad+p/100*plotW;
  assert.equal(parsed.rows.length,Math.min(chart.rows.length,MINI_ROWS),`${study.id}: min(rows, 4) rows are drawn (the full chart in the card keeps all ${chart.rows.length})`);
  assert(!/<text|<tspan|<title|<desc|<foreignObject|<script/.test(svg),`${study.id}: no text, script or foreign content inside the SVG (labels stay HTML)`);
  assert.equal(parsed.root.viewBox,`0 0 ${W} ${H}`);assert.equal(parsed.root.width,String(W));assert.equal(parsed.root.height,String(H));
  assert.equal(parsed.root['aria-hidden'],'true',`${study.id}: the thumbnail is decorative by default (the numbers are in the card body)`);
  // Лінія «немає різниці» всередині поля малюнка й там, де її ставить повний графік.
  near(parsed.nullLine.x1,X(geo.nullPos),`${study.id}: the null line is where the full chart puts it`);
  assert(Number(parsed.nullLine.x1)>=pad&&Number(parsed.nullLine.x1)<=W-pad,`${study.id}: the null line is inside the plot`);
  for(const [i,row] of parsed.rows.entries()){
    const source=shown[i];
    near(row.ci.x1,X(source.pLo),`${study.id} row ${i}: left end`);near(row.ci.x2,X(source.pHi),`${study.id} row ${i}: right end`);
    near(row.dot.cx,X(source.p),`${study.id} row ${i}: the point`);
    assert.equal(row.caps.length,2,`${study.id} row ${i}: two whisker caps`);
    // Порядок рядків і точок збігається з даними, а не з якоюсь іншою сортуванням.
    if(i>0)assert(Number(row.dot.cy)>Number(parsed.rows[i-1].dot.cy),`${study.id}: rows keep the data order, top to bottom`);
    // Ряд «перетинає лінію» тоді й лише тоді, коли так каже crossesNull; і на малюнку вусик справді охоплює лінію.
    const crosses=crossesNull(chart.rows[i],chart.null),spans=Number(row.ci.x1)<=Number(parsed.nullLine.x1)+0.11&&Number(row.ci.x2)>=Number(parsed.nullLine.x1)-0.11;
    assert.equal(/eua-mi-cross/.test(row.cls),crosses,`${study.id} row ${i}: the hollow grey style marks exactly the intervals that cross the null line`);
    assert.equal(spans,crosses,`${study.id} row ${i}: the drawn interval spans the null line only when crossesNull says so`);
  }
}

// Вісь «немає різниці» і для різниць (0), і для відношень (1): обидва види графіків є серед п’яти.
assert(charted.some(study=>study.chart.null===0)&&charted.some(study=>study.chart.null===1),'both difference (0) and ratio (1) charts are covered');
// Приклад: DASH, обидва інтервали перетинають 0: обидва ряди порожні й сірі.
const dash=parse(miniInterval(STUDIES.find(study=>study.id==='dash-vs-others').chart));
assert(dash.rows.every(row=>/eua-mi-cross/.test(row.cls)),'DASH: both intervals cross zero, both rows are drawn hollow');
// Приклад: перші чотири з п’яти рядків кроків.
assert.equal(parse(miniInterval(STUDIES.find(study=>study.id==='steps').chart)).rows.length,4,'steps: five rows in the chart, four in the thumbnail');

// Доступна назва лише тоді, коли малюнок не декоративний; опис складений з даних, без вигаданих чисел.
const sweeteners=STUDIES.find(study=>study.id==='sweeteners').chart,described=miniInterval(sweeteners,{decorative:false});
assert(/role="img"/.test(described)&&!/aria-hidden/.test(described),'a non-decorative thumbnail is an image with a name');
assert(described.includes(`Інтервальна діаграма: ${sweeteners.title}`)&&described.includes('Рядків: 4, з них перетинають лінію «немає різниці»: 0.'),'the name is built from the data');
const tricky=miniInterval({...sweeteners,title:'A "<b>&</b>"'},{decorative:false});
assert(!tricky.includes('<b>')&&tricky.includes('&quot;'),'the title is escaped inside the attribute');

// Підключення на сторінці розборів: мініатюра лише там, де є графік; до згорнутої шапки; без ліній-заглушок для решти.
const page=fs.readFileSync('dist/research-page.js','utf8');
assert(page.includes("import {renderChart,miniInterval} from './research-chart.js?v=3';"),'the page imports the thumbnail with a raised module version');
assert(page.includes("if(s.chart){card.classList.add('has-mini');head.insertAdjacentHTML('beforeend',miniInterval(s.chart));}"),'only studies with a chart get a thumbnail');
const research=fs.readFileSync('dist/research.html','utf8');
assert(research.includes('research-page.css?v=6')&&research.includes('research-page.js?v=8'),'the page versions were raised');

// Стилі: токени палітри, як у повному графіку; нічого нового за кольором; ряд без перетину не лише сірий (порожній кружок).
const css=fs.readFileSync('dist/research-page.css','utf8').slice(fs.readFileSync('dist/research-page.css','utf8').indexOf('T1 (2026-11-02)'));
assert(/\.eua-mi-ci\{stroke:var\(--pine-accent,var\(--c-e3bd6b,#e3bd6b\)\)/.test(css)&&/\.eua-mi-cross \.eua-mi-dot\{fill:var\(--c-10201b,#10201b\);stroke:var\(--c-8aa398,#8aa398\)/.test(css),'the thumbnail reuses the full chart colours (tokens, hollow dot for crossing rows)');
assert(!/#[0-9a-f]{3,8}(?![0-9a-f])/i.test(css.replace(/var\(--[a-z0-9-]+,(?:var\(--[a-z0-9-]+,)?#[0-9a-f]{3,8}\)?\)/gi,'')),'no bare colours outside var() fallbacks');
assert(!/animation|transition/.test(css),'the thumbnail has no motion');

// «Лінія інтервалу» на головній: декоративна (aria-hidden), рівно між великими блоками, кольори головної, без руху.
const home=fs.readFileSync('dist/index.html','utf8'),fresh=fs.readFileSync('dist/home-fresh.css','utf8');
const rules=[...home.matchAll(/<hr class="eua-interval-rule" aria-hidden="true">/g)];
assert.equal(rules.length,2,'two interval rules: before «Нове на сайті» and before the library');
assert(home.indexOf('<hr class="eua-interval-rule" aria-hidden="true"><section class="home-fresh"')>0&&/<hr class="eua-interval-rule" aria-hidden="true">\s*<section class="home-library-section"/.test(home),'the rules stand between the big blocks');
assert(!/<hr[^>]*eua-interval-rule[^>]*>[\s\S]{0,5}<hr/.test(home),'no two rules in a row');
assert(/\.eua-interval-rule\{[^}]*height:14px[^}]*radial-gradient[^}]*linear-gradient/.test(fresh)&&!/animation|transition/.test(fresh.slice(fresh.indexOf('T1 (2026-11-02)'))),'the rule is a hairline with a point and whisker caps, without motion');
assert(Number((home.match(/home-fresh\.css\?v=(\d+)/)||[])[1])>=2,'the home stylesheet version was raised (at least 2)'); // 2026-11-02: «не нижча за 2», бо наступні зміни стилів блоку «Нове» піднімають версію далі (T4: v=3)

// Журнал і документ.
assert(fs.readFileSync('dist/changes-data.js','utf8').includes('Мініатюри графіків у розборах і знак інтервалу на головній'),'the change log has a record');
const doc=fs.readFileSync('docs/INTERVAL_MOTIF.md','utf8');
for(const part of ['Що змінено','Чому','Як перевірено','Межі','Рішення власника','Як відкотити'])assert(doc.includes(part),`docs/INTERVAL_MOTIF.md has the section «${part}»`);
console.log(`Interval motif: ${charted.length} thumbnails match the full charts, crossing rows are hollow, no text in the SVG, home rules decorative passed.`);
