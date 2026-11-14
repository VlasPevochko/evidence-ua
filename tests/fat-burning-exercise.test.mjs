import assert from 'node:assert/strict';
import fs from 'node:fs';
import {paceCurvePath,fatCurveY,energyCurveY,paceZone,paceZones,paceX} from '../dist/fat-burning.js';

// Розділ «Рух» на «Куди зникає жир?» (запит власника 2026-11-14: «як впливають аеробні та анаеробні навантаження на жир», рішення «1 три групи разом»).
// Тест тримає три речі: (1) кожне число в розділі є в повному тексті відкритого джерела, яке його містить; (2) графік і текст не переходять межі доказів;
// (3) повзунок і інтервали будуються з тих самих даних, що й розмітка.
const html=fs.readFileSync('dist/fat-burning.html','utf8'),css=fs.readFileSync('dist/fat-burning.css','utf8');
const sec=html.slice(html.indexOf('<section class="fb-section" id="exercise"'),html.indexOf('<section class="fb-section" id="practice"'));
assert(sec.length>1000,'the exercise section exists between balance and practice');

// 1) Числа: дозволений набір, кожне з джерела.
// Lafontant 2025 (PMC12107660, повний текст прочитано): аеробні проти силових −1,06 кг (−1,88…−0,24), поєднані проти силових −1,09 (−1,91…−0,27), від 10 тижнів.
// Bellicha 2021 (PMC8365736): втрата жирової маси −1,3…−2,6 кг у 4 оглядах; безжирова маса +0,8 кг (0,4…1,3) в одному огляді.
// Morze 2021 (PMC8244024): 32 РКД, 4774 учасники, ≥ 6 місяців; HIIT-випробувань не знайдено.
const allowed=new Set(['1,06','1,88','0,24','1,09','1,91','0,27','1,3','2,6','0,8','0,4','2,5','1','10','6','0','3']);
const visible=sec.replace(/<p class="fb-kicker">[^<]*<\/p>/,'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]+>/g,' ');
const nums=new Set([...visible.matchAll(/(?<![\d,])(\d+(?:,\d+)?)(?![\d,])/g)].map(m=>m[1]));
for(const n of nums)assert(allowed.has(n),`number ${n} in the exercise section is not in the verified set`);
assert(sec.includes('−1,06')&&sec.includes('−1,09')&&sec.includes('1,3–2,6'));
// інтервали на малюнку збігаються з підписами: позиція = (значення + 2,5) / 3
const pct=x=>Math.round((x+2.5)/3*1000)/10;
for(const [lo,pt,hi] of [[-1.88,-1.06,-0.24],[-1.91,-1.09,-0.27]])assert(sec.includes(`--l:${pct(lo)}%;--r:${pct(hi)}%;--p:${pct(pt)}%`),`interval ${lo}…${hi} is drawn where its label says`);

// 2) Межі доказів сказано вголос.
for(const phrase of ['не містило інтервальних випробувань','низьку або помірну','Це не персональна рекомендація','небагато','один огляд','Менш ніж за 10 тижнів','підсумок оглядів для дорослих'])
  assert(sec.replace(/\s+/g,' ').includes(phrase)||sec.replace(/\s+/g,' ').includes(phrase.replace('небагато','було мало')),`limit is stated: ${phrase}`);
assert(!/(найкращ|рекомендуємо|треба тренуватись|потрібно робити|спалює більше жиру|гарантовано)/i.test(visible),'no prescription and no "best exercise" claim');
assert(!/анаеробн/i.test(visible),'we do not use the loose word "anaerobic": groups are aerobic, interval and resistance');
for(const part of ['10.1111/obr.13256','10.1080/15502783.2025.2507949','10.1111/obr.13218','10.1016/j.nut.2004.04.005'])assert(html.includes(part),`source ${part} is listed`);
assert(html.includes('за анотацією'),'the abstract-only source is marked as such');

// 3) Повзунок: криві з одного джерела істини; HTML має ті самі шляхи, що й скрипт.
assert(sec.includes(`d="${paceCurvePath(fatCurveY)}"`)&&sec.includes(`d="${paceCurvePath(energyCurveY)}"`),'the static chart equals what the script draws');
const fat=Array.from({length:21},(_,i)=>fatCurveY(i/20));
assert(Math.min(...fat)===fat[10]-0&&fat[10]<fat[0]&&fat[10]<fat[20],'fat oxidation rises, peaks in the middle and falls (SVG y is inverted)');
assert(energyCurveY(1)<energyCurveY(0),'total energy use grows with pace');
assert.equal(paceZones.length,3);
assert.equal(paceZone(0.1).name,'Низький темп');assert.equal(paceZone(0.5).name,'Помірний темп');assert.equal(paceZone(0.9).name,'Високий темп');assert.equal(paceZone(1).name,'Високий темп');
assert.equal(paceX(0),10);assert.equal(paceX(1),350);
assert(/<input type="range" id="fb-pace" min="0" max="100"[^>]*aria-describedby="fb-pace-text"/.test(sec),'a native range input with a description');
assert(/\.fb-slider input\{[^}]*height:44px/.test(css),'the slider is at least 44px tall');
assert(!sec.includes('<details')&&!/\shidden[\s>=]/.test(sec),'nothing in the section is hidden: no JS needed to read it');
assert(!/font-size:(9|10|11)px/.test(css),'no text under 12px');
console.log('Fat burning exercise section: verified numbers, limits, slider data passed.');
