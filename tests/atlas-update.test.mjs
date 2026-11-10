// Оновлення Атласу (2026-11-10, рішення власника «1-7 так» після аудиту шаблонності й функціональності):
// 1 зламане (світла тема, результат на телефоні, шрифти ≥ 12 px, вкладки за стандартом), 2 ліва колонка без дублів і «Стан атласу»,
// 3 «Мозок» і «ШКТ» з посиланнями на наші матеріали (без 14 однакових заглушок), 4 картки тем ведуть до точок карти болю,
// 5 карти болю (українські підписи, схеми в палітрі Атласу), 6 адреса, пошук, «Про Атлас», журнал.
// Тест тримає правила, які легко зламати непомітно: кожне перевірено навмисною поломкою коду (тест червоніє).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHANGES, TAGS, SCIENCE} from '../dist/changes-data.js';
import {materials, findMaterials, contextLink} from '../src/platform/materials.mjs';
import {painMaps, findPoint, shoulderTopics, kneeTopics, shoulderLabels, kneeLabels} from '../src/atlas/points.mjs';
import {shoulderDiagram, kneeDiagram, diagramViews} from '../src/atlas/diagrams.mjs';

const read = file => fs.readFileSync(file, 'utf8');
const html = read('dist/atlas.html'), js = read('dist/atlas.js'), css = read('dist/atlas-redesign.css'), diagramCss = read('dist/atlas-diagrams.css');
const kneeJs = read('dist/knee-pain-map.js'), shoulderJs = read('dist/shoulder-pain-map.js');

// ── 0) Модулі даних і схем: у dist лежать дослівні копії джерел (збірка нічого не змінює), версії піднято.
assert.equal(read('dist/atlas-points.js'), read('src/atlas/points.mjs'), 'dist/atlas-points.js is the build copy of src/atlas/points.mjs');
assert.equal(read('dist/atlas-diagrams.js'), read('src/atlas/diagrams.mjs'), 'dist/atlas-diagrams.js is the build copy of src/atlas/diagrams.mjs');
const versionOf = (text, name) => Number((text.match(new RegExp(name.replace(/\./g, '\\.') + '\\?v=(\\d+)')) || [])[1]);
assert(versionOf(html, 'atlas.js') >= 8 && versionOf(html, 'atlas-redesign.css') >= 3 && versionOf(html, 'knee-pain-map.js') >= 4 && versionOf(html, 'shoulder-pain-map.js') >= 4, 'the changed Atlas files carry new versions');
assert(html.includes('./atlas-diagrams.css?v='), 'the diagram stylesheet is linked');
assert(versionOf(js, 'atlas-points.js') === versionOf(kneeJs, 'atlas-points.js') && versionOf(js, 'atlas-points.js') === versionOf(shoulderJs, 'atlas-points.js') && versionOf(kneeJs, 'atlas-diagrams.js') === versionOf(shoulderJs, 'atlas-diagrams.js'), 'all scripts import the same version of the shared data and diagram modules');

// ── 1) Світла тема: власної світлої палітри немає (загальна інверсія), картини-фони повертаються до природних кольорів, схеми — темна «сцена».
assert(!/html\[data-theme="light"\]\s+body\[data-platform-area="atlas"\]\s*\{/.test(css), 'the Atlas has no own light palette: the site light theme inverts the page, and an own light palette was inverted back to dark (header links, «Куди далі» and buttons vanished)');
assert(/html\[data-theme="light"\] \.atlas-detail\[data-zone-art="shoulder"\] \.atlas-detail-head::before,[\s\S]*?\{[^}]*filter:\s*invert\(1\) hue-rotate\(180deg\)/.test(css), 'the shoulder art in the header is returned to natural colours in the light theme');
assert(css.includes('html[data-theme="light"] .atlas-shoulder-topic .atlas-topic-icon::before') && css.includes('html[data-theme="light"] .shoulder-stage, html[data-theme="light"] .knee-stage'), 'thumbnails and diagram stages keep natural colours in the light theme');
assert(/\.atlas-topic-icon::before\s*\{[^}]*background:\s*url\("\.\/atlas-shoulder\.webp"\)/.test(css) && !/\.atlas-shoulder-topic \.atlas-topic-icon\s*\{[^}]*background:\s*url/.test(css), 'the thumbnail picture sits in ::before, so only the picture (not the border) is re-inverted');

// Висота фігури залежить і від висоти вікна (інакше на 1440 × 900 перемикач «Спереду / Ззаду» виходив за нижній край); полотно фігури бере ту саму змінну.
assert(/--atlas-figure-h:\s*clamp\(31rem,\s*min\(51vw,\s*calc\(100vh\s*-\s*17\.5rem\)\),\s*43rem\)/.test(css), 'the figure height follows the window height as well as its width');
assert(css.includes('min-height: var(--atlas-figure-h)') && css.includes('max-width: calc(var(--atlas-figure-h) * .586)'), 'the figure and its canvas share one height variable');

// ── 1) Шрифти не менші за 12 px (аудит: 9–11,5 px) — у стилях Атласу й обох карт болю.
const fontSizes = text => [...text.matchAll(/font-size:\s*(clamp\(\s*)?([\d.]+)(rem|px)/g)].map(m => ({value: Number(m[2]) * (m[3] === 'rem' ? 16 : 1), raw: m[0]}));
for (const [name, text] of [['atlas-redesign.css', css], ['atlas-diagrams.css', diagramCss], ['shoulder-pain-map.css', read('dist/shoulder-pain-map.css')], ['knee-pain-map.css', read('dist/knee-pain-map.css')]]) {
  for (const size of fontSizes(text)) assert(size.value >= 12, `${name}: ${size.raw} is below 12 px`);
}
assert(/\.atlas-reading-note summary\s*\{[^}]*min-height:\s*2\.75rem/.test(css) && /\.atlas-to-figure\s*\{[^}]*min-height:\s*2\.75rem/.test(css) && /\.atlas-topics-back\s*\{[^}]*min-height:\s*2\.75rem/.test(css), 'text controls are 44 px high');

// ── 1) Вкладки за стандартом: id, aria-controls, tabpanel, один пункт у порядку Tab (roving tabindex), жива область лише для короткого повідомлення.
const tabTags = [...html.matchAll(/<button[^>]*role="tab"[^>]*data-atlas-tab="([a-z]+)"[^>]*>/g)];
assert.equal(tabTags.length, 6);
for (const [tag, name] of tabTags) {
  assert(tag.includes(`id="atlas-tab-${name}"`) && tag.includes('aria-controls="atlas-content"'), `tab ${name} has an id and controls the panel`);
  assert(tag.includes(name === 'overview' ? 'tabindex="0"' : 'tabindex="-1"'), `tab ${name}: only the selected tab is in the Tab order`);
}
assert(html.includes('id="atlas-content" class="atlas-content" role="tabpanel" aria-labelledby="atlas-tab-overview"'), 'the content area is the tab panel');
assert(!/<article[^>]*aria-live/.test(html), 'the whole detail panel is not a live region (it announced 860 characters at every change)');
assert(/<p class="atlas-sr-only" id="atlas-status" role="status" aria-live="polite"><\/p>/.test(html), 'a short status line is the live region');
assert(js.includes("button.tabIndex=on?0:-1") && js.includes("setAttribute('aria-labelledby',`atlas-tab-${selectedTab}`)"), 'the script keeps roving tabindex and the panel label in step with the selected tab');
assert(js.includes("Home:visible[0]") && js.includes("End:visible[visible.length-1]") && js.includes('ArrowRight') && js.includes('ArrowLeft'), 'arrow keys, Home and End move between the visible tabs');

// ── 2) Ліва колонка без дублів і «Стан атласу» з тих самих даних, що статуси зон.
assert(!/data-atlas-shortcut|atlas-side-menu|atlas-evidence-footer/.test(html + js + css), 'the six tiles (four duplicated the tabs, two the menu) and the principles strip are gone');
const zoneMeta = {};
for (const m of js.matchAll(/\n (\w+):\{title:'([^']+)',summary:'[^']*',state:'([^']+)',stateKey:'(\w+)'\}/g)) zoneMeta[m[1]] = {title: m[2], state: m[3], key: m[4]};
assert.deepEqual(Object.keys(zoneMeta), ['brain', 'shoulder', 'spine', 'muscles', 'gut', 'knee'], 'zoneMeta was read from the script');
const pins = Object.fromEntries([...html.matchAll(/<button class="atlas-zone[^"]*" type="button" data-zone="(\w+)" data-state="(\w+)"[^>]*aria-label="([^"]+)"/g)].map(m => [m[1], {state: m[2], name: m[3]}]));
for (const [zone, meta] of Object.entries(zoneMeta)) assert.equal(pins[zone]?.state, meta.key, `the pin of «${zone}» carries the same state as zoneMeta`);
const stateRows = [...html.matchAll(/<div data-state="(\w+)"><dt>([^<]+)<\/dt><dd>([^<]+)<\/dd><\/div>/g)].map(m => [m[1], m[2], m[3]]);
const expectedRows = [['full', 'Повний модуль'], ['beta', 'Бета'], ['planned', 'Готується']].map(([key, label]) => [key, label, Object.keys(zoneMeta).filter(zone => zoneMeta[zone].key === key).map(zone => pins[zone].name).join(' · ')]);
assert.deepEqual(stateRows, expectedRows, '«Стан атласу» in the markup equals what the script computes from the data (so the no-script page does not lie)');
assert(js.includes('function renderState()') && js.includes('renderState();\nrender();'), 'the state block is rebuilt from the same data on load');
assert(html.includes('href="./about.html#ab-atlas"') && (html.match(/href="\.\/about\.html#ab-atlas"/g) || []).length === 2, 'the intro link and the state note lead to the real «Про Атлас» section');
assert(read('dist/about.html').includes('<h2 id="ab-atlas">Про Атлас</h2>'), 'the section exists');

// ── 3) «Мозок» і «ШКТ»: одна вкладка з посиланнями на справжні матеріали сайту, заглушок «Готується» на кожну вкладку немає.
assert(!js.includes('Ця вкладка вже є частиною загальної архітектури') && !js.includes('function previewContent'), 'the identical placeholder text is gone (it filled 14 of 36 views)');
assert(/brain:\{overview:\(\)=>plannedOverview\('brain'\)\},\n gut:\{overview:\(\)=>plannedOverview\('gut'\)\}/.test(js), 'the planned zones have exactly one view');
assert(js.includes('tablist.hidden=available.length<2'), 'a zone with a single view shows no tab row');
const related = js.slice(js.indexOf('const relatedMaterials={'), js.indexOf('function plannedOverview'));
const hrefs = [...related.matchAll(/href:'([^']+)'/g)].map(m => m[1]);
assert.deepEqual(hrefs, ['./sleep.html', './mechanisms.html#caffeine', './index.html#supplement-caffeine', './nutrition-digestion.html', './nutrition-inside.html'], 'brain → sleep and caffeine, gut → 3D digestion and «Харчування зсередини»');
for (const href of hrefs) {
  const [file, hash] = href.replace('./', '').split('#');
  assert(fs.existsSync('dist/' + file), `${href}: the page exists`);
  // Картка кофеїну на головній створюється скриптом у браузері (як і в каталозі, tests/navigation-flow), тож для неї якір у готовому HTML не вимагаємо.
  if (hash && file !== 'index.html') assert(new RegExp(`\\bid="${hash}"`).test(read('dist/' + file)), `${href}: the anchor exists`);
}
// Описи карток дослівно з метаопису сторінок: нових тверджень немає.
for (const [file, text] of [['sleep.html', 'Як влаштований сон, що відомо про недосипання й фізичну працездатність та які звички допомагають створити умови для сну.'], ['nutrition-digestion.html', '3D-модель травного тракту: як їжа проходить від стравоходу до товстої кишки, з джерелами для кожного твердження.'], ['nutrition-inside.html', 'Від їжі до клітини: інтерактивний шлях нутрієнтів — перетравлення, всмоктування та подальший транспорт.']]) {
  assert(read('dist/' + file).includes(`content="${text}"`), `${file}: the card quotes the page's own description`);
  assert(related.includes(text), `the card for ${file} uses that description word for word`);
}
for (const forbidden of ['допоможе', 'лікує', 'гарантує', 'позбавить', 'виправляє']) assert(!related.toLocaleLowerCase('uk').includes(forbidden), `the cards promise nothing (${forbidden})`);

// ── 4) Картки тем плеча й коліна ведуть до точок карти болю, де збіг очевидний.
const pointOf = zone => Object.fromEntries((zone === 'shoulder' ? shoulderTopics : kneeTopics).map(topic => [topic.title, topic.point || null]));
assert.deepEqual(pointOf('shoulder'), {'Ротаторна манжета': 'posterior-cuff', 'Субакроміальний біль': 'lateral-deltoid', 'Нестабільність плеча': 'anterior-gh', 'Біцепс': 'bicipital-groove', 'AC-суглоб': 'ac-joint'}, 'every shoulder topic leads to its own point');
assert.deepEqual(pointOf('knee'), {'Пателофеморальний біль': 'anterior-patella', 'Меніски': 'medial-joint-line', 'ACL': null, 'Сухожилок надколінка': 'inferior-patella', 'Остеоартроз коліна': null}, 'knee topics lead to a point only where one names the structure (no point for ACL and osteoarthritis, they stay reference cards)');
for (const zone of ['shoulder', 'knee']) for (const [title, point] of Object.entries(pointOf(zone))) assert(!point || findPoint(zone, point), `${title}: the point exists`);
assert.equal(new Set(Object.values(pointOf('shoulder'))).size, 5, 'no two shoulder topics share a point');
assert(js.includes("document.dispatchEvent(new CustomEvent('atlas:goto-point'") && js.includes("'atlas:clear-point'") && js.includes('data-atlas-topics'), 'cards, the way back «← Усі теми» and the maps talk through events');
for (const [name, script] of [['shoulder', shoulderJs], ['knee', kneeJs]]) {
  assert(script.includes("document.addEventListener('atlas:goto-point'") && script.includes("document.addEventListener('atlas:state'") && script.includes("document.addEventListener('atlas:clear-point'"), `${name} map listens to the Atlas events`);
  assert(script.includes('data-atlas-topics') && script.includes('← Усі теми'), `${name} point card has the way back to the topics`);
  assert(script.includes("new CustomEvent('atlas:point'"), `${name} map reports the selected point`);
}

// ── 5) Карти болю: підписи українські, схеми без тексту всередині, колір лише в CSS, точки не перекривають одна одну (зона дотику 44 px).
const latin = text => text.replace(/\([^)]*\)/g, '').replace(/\b(AC|MCL|LCL|ACL|3D)\b/g, '').match(/[A-Za-z]{2,}/g);
for (const zone of ['shoulder', 'knee']) {
  const map = painMaps[zone];
  const strings = [...map.views.flatMap(v => [v.label, v.title]), ...map.points.flatMap(p => [p.title, p.location, p.clarify, ...p.structures, ...p.similar]), ...map.labels.map(l => l.text)];
  for (const text of strings) assert(!latin(text), `${zone}: «${text}» has English words outside parentheses`);
}
for (const forbidden of ['Pain Map', 'PAIN', 'pain-hotspots', 'map-badge', '>v1<']) assert(!shoulderJs.includes(forbidden) && !kneeJs.includes(forbidden), `no «${forbidden}» left in the interface`);
const stages = {shoulder: {w: 330, h: 385}, knee: {w: 320, h: 420}};
for (const [zone, stage] of Object.entries(stages)) {
  const map = painMaps[zone];
  for (const view of map.views) {
    const spots = map.points.filter(p => p.view === view.id);
    assert(spots.length >= 1, `${zone}/${view.id}: the view has a point`);
    for (const p of spots) assert(p.x >= 4 && p.x <= 96 && p.y >= 4 && p.y <= 96, `${zone}/${p.id} is inside the stage`);
    for (const [i, a] of spots.entries()) for (const b of spots.slice(i + 1)) {
      const distance = Math.hypot((a.x - b.x) / 100 * stage.w, (a.y - b.y) / 100 * stage.h);
      assert(distance >= 44, `${zone}/${view.id}: ${a.id} and ${b.id} are ${Math.round(distance)} px apart on the smallest stage (tap targets must not overlap)`);
    }
    for (const label of map[zone === 'shoulder' ? 'labels' : 'labels'].filter(l => l.view === view.id)) {
      assert(label.x >= 0 && label.x <= 100 && label.y >= 0 && label.y <= 100, `${zone}/${label.text}: the label is on the stage`);
      if (label.line) assert(label.line.every(n => n >= 0 && n <= 100), `${zone}/${label.text}: the leader line stays on the stage`);
    }
  }
}
const usedClasses = new Set();
for (const [zone, views] of Object.entries(diagramViews)) {
  for (const view of views) {
    const svg = (zone === 'shoulder' ? shoulderDiagram : kneeDiagram)(view);
    assert(svg.startsWith('<svg') && svg.includes('role="img"') && /aria-label="Схема [^"]+"/.test(svg), `${zone}/${view}: an SVG with a Ukrainian accessible name`);
    assert(!svg.includes('<text'), `${zone}/${view}: no text inside the picture (labels are HTML, 12 px and up)`);
    assert(!/(fill|stroke|stop-color)="#/.test(svg), `${zone}/${view}: colours live in atlas-diagrams.css, not in attributes`);
    for (const m of svg.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach(name => usedClasses.add(name));
  }
}
// shoulder-diagram і knee-diagram — лише зачіпки для стилів сцени (atlas-coordinate-map.css), решта класів малює atlas-diagrams.css.
const styled = diagramCss + read('dist/atlas-coordinate-map.css');
for (const name of usedClasses) if (!/-diagram$/.test(name)) assert(styled.includes('.' + name), `the class «${name}» used in a diagram is styled`);
assert.deepEqual(Object.keys(diagramViews).sort(), ['knee', 'shoulder']);
assert.equal(diagramViews.shoulder.length, 3);
assert.equal(diagramViews.knee.length, 4);

// ── 6) Адреса: зона, вкладка, точка; «Назад» (pushState на зону, replaceState на вкладку й точку), поділитися посиланням.
assert(js.includes("history[mode==='push'?'pushState':'replaceState']") && js.includes("writeLocation('push')") && js.includes("window.addEventListener('popstate'"), 'zone changes add history entries, tabs and points only update the address, Back restores the state');
assert(js.includes("params.get('tab')") && js.includes("params.get('point')"), 'the address is read back');
// Карти болю — окремі скрипти й можуть завершити завантаження раніше за atlas.js: без повторного повідомлення стану після першого показу «?zone=knee» не відкривав карту,
// а картку точки з «?point=…» затирав огляд зони (знайдено перевіркою навмисними поломками; порядок вимірює atlasLoadOrderFlow у Browser QA).
assert(/\nrender\(\);\n[^]*document\.dispatchEvent\(new CustomEvent\('atlas:state',\{detail:\{zone:selectedZone,point:currentPoint\}\}\)\);\s*$/.test(js), 'atlas.js replays the address state to the pain maps right after the first render');
const base = 'https://x.test/atlas.html';
assert.equal(contextLink(`${base}?zone=knee&tab=symptoms&point=medial-joint-line&utm_source=qa`), `${base}?zone=knee&tab=symptoms&point=medial-joint-line`, 'sharing keeps zone, tab and point and nothing else');
assert.equal(contextLink(`${base}?zone=nope&tab=nope&point=nope`), base, 'unknown values are dropped from a shared link');
assert.equal(contextLink(`${base}?zone=shoulder&point=ac-joint`), `${base}?zone=shoulder&point=ac-joint`);

// ── 6) Пошук знаходить зони й теми Атласу.
for (const [query, expected] of [['плече', 'Плече в Атласі'], ['коліно', 'Коліно в Атласі'], ['хребет', 'Хребет в Атласі'], ['мозок', 'Мозок в Атласі'], ['шкт', 'ШКТ в Атласі'], ['м’язи', 'М’язи в Атласі'], ['ротаторна манжета', 'Плече: ротаторна манжета'], ['меніск', 'Коліно: меніски'], ['біцепс', 'Плече: біцепс']]) {
  assert(findMaterials(query).some(m => m.title === expected && m.areaId === 'atlas'), `the search for «${query}» finds «${expected}»`);
}
const atlasEntries = materials.filter(m => m.areaId === 'atlas' && m.id !== 'navigation-atlas');
assert.equal(atlasEntries.length, 16, 'six zones and ten topics');
for (const entry of atlasEntries) {
  const url = new URL(entry.href, 'https://x.test/');
  assert.equal(url.pathname, '/atlas.html');
  assert(['brain', 'shoulder', 'spine', 'muscles', 'gut', 'knee'].includes(url.searchParams.get('zone')), `${entry.title}: a known zone`);
  if (url.searchParams.get('point')) assert(findPoint(url.searchParams.get('zone'), url.searchParams.get('point')), `${entry.title}: a known point`);
}

// ── 6) Журнал: правдиві записи про те, що зроблено, без нових наукових тверджень.
const day = CHANGES.find(d => d.date === '2026-11-10');
assert(day && day.items.length === 6, 'six records for 2026-11-10');
for (const item of day.items) {
  assert(TAGS[item.tag] && item.science === 'none' && SCIENCE.none, `${item.title}: known tag, no new science`);
  assert(item.text.length > 20 && item.text.length < 200, `${item.title}: a short plain description`);
  assert(fs.existsSync('dist/' + item.href.replace('./', '').split('#')[0].split('?')[0]), `${item.title}: the link leads to a real page`);
  assert(!/допоможе|лікує|гарантує|позбавить/i.test(item.text), `${item.title}: no promises`);
}
assert(read('dist/changes-page.js').includes('changes-data.js?v=') && versionOf(read('dist/changes-page.js'), 'changes-data.js') === versionOf(read('dist/changes.html'), 'changes-page.js'), 'the journal page and its data have the same new version');

console.log('Atlas update: tabs by the standard, no duplicate controls, state block from data, planned zones with real links, topics lead to points, Ukrainian pain maps, address, search, journal passed.');
