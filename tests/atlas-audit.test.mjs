// Атлас: 12 виправлень за аудитом 2026-11-12 (рішення власника «з першого до 12 одним PR»). Опис і виміри: docs/ATLAS-AUDIT-FIXES.md.
// Тут статичні перевірки коду й даних. Те, що видно лише в справжньому браузері (контраст за пікселями, налізання, друк, рядки шляху, порядок Tab, режим без JavaScript),
// тримає atlasAuditFlow у Browser QA (scripts/browser-qa/run.mjs); кожне правило там перевірено навмисною поломкою коду.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {painMaps, shoulderTopics, kneeTopics} from '../src/atlas/points.mjs';
import {findMaterials, materials} from '../src/platform/materials.mjs';
import {NEXT_STEPS} from '../src/platform/next-steps.mjs';
import {CHANGES, TAGS, SCIENCE} from '../dist/changes-data.js';

const read = file => fs.readFileSync(file, 'utf8');
const html = read('dist/atlas.html'), js = read('dist/atlas.js'), css = read('dist/atlas-redesign.css');
const printCss = read('dist/print.css'), headerCss = read('dist/site-header.css');
const kneeJs = read('dist/knee-pain-map.js'), shoulderJs = read('dist/shoulder-pain-map.js');
const versionOf = (text, name) => Number((text.match(new RegExp(name.replace(/\./g, '\\.') + '\\?v=(\\d+)')) || [])[1]);

// ── 1) Друк. Корінь помилки: шапка сайту має правило «display:flex!important» (site-header.css) зі специфічністю вищою, ніж у «.eua-site-header{display:none!important}» з print.css,
// тож шапка друкувалась на кожній сторінці сайту, а на Атласі перша сторінка лишалась майже порожньою. Перевіряємо саме співвідношення специфічності, а не лише наявність правила.
const specificity = selector => {
  const text = selector.trim();
  const attrs = (text.match(/\[[^\]]+\]/g) || []).length;
  const bare = text.replace(/\[[^\]]+\]/g, ' ');
  const ids = (bare.match(/#[\w-]+/g) || []).length, classes = (bare.match(/\.[\w-]+/g) || []).length;
  const types = bare.replace(/[.#][\w-]+/g, ' ').split(/[\s>+~]+/).filter(token => /^[a-z][\w-]*$/i.test(token)).length;
  return [ids, classes + attrs, types];
};
const compare = (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
const noComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');
const showers = [...noComments(headerCss).matchAll(/([^{}]+)\{[^}]*display:flex!important[^}]*\}/g)].flatMap(match => match[1].split(',')).map(selector => selector.trim()).filter(selector => /header(\.eua-site-header)+$/.test(selector));
assert(showers.length >= 2, `the rules that show the header were found (${showers.join(' | ')})`);
const hiders = [...noComments(printCss).matchAll(/([^{}]+)\{display:none!important\}/g)].flatMap(match => match[1].split(',')).map(selector => selector.trim()).filter(selector => /header(\.eua-site-header)+$/.test(selector) && selector.startsWith('html '));
assert(hiders.length >= 2, `print.css has its own header-hiding rules (${hiders.join(' | ')})`);
// Сильніше правило: найслабше з правил друку має перемагати найсильніше з правил показу.
assert(compare(hiders.map(specificity).sort(compare)[0], showers.map(specificity).sort(compare).at(-1)) > 0, `the print rule beats the rule that shows the header (${JSON.stringify(hiders.map(specificity).sort(compare)[0])} vs ${JSON.stringify(showers.map(specificity).sort(compare).at(-1))})`);
// Раніше загальні правила друку лишались, і тест share-and-print їх теж вимагає.
assert(printCss.includes('.eua-site-header') && printCss.includes('@media print'));

// Друк самого Атласу: окремий блок @media print у atlas-redesign.css.
const printBlock = css.slice(css.lastIndexOf('@media print'));
assert(printBlock.startsWith('@media print'), 'the Atlas has its own print block at the end of the stylesheet');
for (const selector of ['.atlas-figure-panel', '.atlas-tabs', '.atlas-views', '.atlas-legend', '.atlas-to-figure', '#atlas-actions', '.spine-viewer-box']) assert(printBlock.includes(selector), `${selector} is hidden on paper`);
assert(/\.atlas-detail\s*\{[^}]*break-inside:\s*auto\s*!important/.test(printBlock), 'the zone panel may break across pages (as one unbreakable block it pushed everything to page 2, leaving page 1 empty)');
assert(/\.atlas-workspace\s*\{[^}]*display:\s*block\s*!important/.test(printBlock), 'the two-column grid becomes one column on paper');
assert(/\.atlas-page,\s*\.atlas-page \*\s*\{[^}]*color:\s*#111\s*!important/.test(printBlock), 'text is dark on paper');
const cardList = ((printBlock.match(/\.atlas-page :is\(([^)]*)\)\s*\{[^}]*background:\s*#fff\s*!important/) || [])[1] || '').split(',').map(item => item.trim());
for (const card of ['atlas-copy-card', 'atlas-alert', 'atlas-topic', 'atlas-practice', 'atlas-practice-item', 'atlas-reading-note', 'atlas-state', 'atlas-status', 'spine-region-info']) assert(cardList.includes('.' + card), `.${card} gets a white background on paper (it kept the dark screen colour while the text was forced to #111)`);
assert(/\.atlas-detail-head::before,\s*\.atlas-detail-head::after\s*\{[^}]*display:\s*none\s*!important/.test(printBlock), 'the decorative picture in the zone header is not printed');
assert(versionOf(html, 'print.css') >= 2, 'the Atlas loads the new version of print.css');

// ── 2) Підписи зон на фігурі стоять на напівпрозорій плашці: колір тексту більше не залежить від малюнка під ним.
const labelRule = (css.match(/\.atlas-body-canvas > \.atlas-zone > span \{[^}]*\}/) || [])[0] || '';
assert(/background:\s*rgba\(5, 14, 25, \.88\)/.test(labelRule) && /background:\s*color-mix\(in srgb, var\(--atlas-page-bg\) 88%, transparent\)/.test(labelRule), 'the pin label has a translucent chip (with a fallback for browsers without color-mix)');
assert(/padding:\s*\.2rem \.45rem/.test(labelRule) && /border-radius:\s*\.45rem/.test(labelRule) && !/text-shadow:\s*0 1px 3px/.test(labelRule), 'the chip has padding and rounded corners; the old halo is gone');
assert(/\.atlas-zone small \{[^}]*color:\s*var\(--atlas-muted\)/.test(css), 'the sub-label stays on the muted token');

// ── 3) Карта плеча й коліна: підписи не накриваються точками. Оцінка за даними (ширина тексту ≈ 7,5 px на літеру, рядок 14,4 px, зона дотику 44 × 44) на старих даних дає
// ті самі дві колізії, що знайшов браузер у аудиті («дельтоподібний м’яз» × «Верх плеча · AC-суглоб» 44 × 11 px і «головка малогомілкової кістки» × «Біля головки малогомілкової кістки» 7 × 3 px).
// Точну геометрію (справжній текст і шрифт) на 390, 360 і 1440 px міряє atlasAuditFlow.
const stages = {shoulder: {w: 330, h: 385}, knee: {w: 320, h: 420}};
for (const [zone, stage] of Object.entries(stages)) {
  const map = painMaps[zone];
  for (const view of map.views) {
    const spots = map.points.filter(point => point.view === view.id);
    for (const label of map.labels.filter(item => item.view === view.id)) {
      const maxWidth = (label.w ?? 40) / 100 * stage.w, textWidth = Math.min(maxWidth, label.text.length * 7.5), lines = Math.ceil(label.text.length * 7.5 / maxWidth), height = lines * 14.4;
      const x = label.x / 100 * stage.w, y = label.y / 100 * stage.h;
      const left = label.align === 'right' ? x - textWidth : label.align === 'center' ? x - textWidth / 2 : x;
      for (const point of spots) {
        const px = point.x / 100 * stage.w, py = point.y / 100 * stage.h;
        const overlapX = Math.min(left + textWidth, px + 22) - Math.max(left, px - 22), overlapY = Math.min(y + height / 2, py + 22) - Math.max(y - height / 2, py - 22);
        assert(!(overlapX > 0 && overlapY > 0), `${zone}/${view.id}: the label «${label.text}» is covered by the tap square of «${point.id}» (${Math.round(overlapX)} × ${Math.round(overlapY)} px)`);
      }
    }
  }
}
const front = painMaps.shoulder.points.filter(point => point.view === 'front');
assert.equal(front.find(point => point.id === 'bicipital-groove').y, 56, 'the bicipital groove point moved down along the groove, away from the glenohumeral point');

// ── 4) Англійських слів у назвах розділів і підписах немає: у меню сайту ці розділи називаються «М’язи та тренування» й «Рух і біомеханіка».
assert(!/Muscle Lab|Movement Lab|матеріал Atlas /.test(js), 'the Atlas script no longer shows «Muscle Lab», «Movement Lab» or the English «Atlas» in the shoulder research text');
assert(js.includes('М’язи та тренування: від м’яза до молекул') && js.includes('Розділ «М’язи та тренування» показує рівні організації') && js.includes('М’язи та тренування · Ріст м’яза'), 'muscles zone texts use the Ukrainian section name');
assert(js.includes('М’язи та тренування · Джерела та межі пояснень') && js.includes('Рух і біомеханіка · Джерела та межі моделі') && js.includes('розділів «М’язи та тренування» і «Рух і біомеханіка»'), 'the muscles zone «Дослідження» tab names the sections in Ukrainian');
assert(NEXT_STEPS['atlas.html'].every(([, , tag]) => tag && !/[A-Za-z]/.test(tag)), `the kickers of «Куди далі» on the Atlas page are Ukrainian (${NEXT_STEPS['atlas.html'].map(step => step[2]).join(', ')})`);
assert.deepEqual(NEXT_STEPS['atlas.html'].map(step => step[2]), ['М’язи', 'Рух', 'Практика']);
assert(!kneeTopics.some(topic => topic.title === 'ACL') && kneeTopics.some(topic => topic.title === 'Передня хрестоподібна зв’язка' && topic.copy.startsWith('ACL:')), 'the knee card is named in full; the abbreviation is explained in its text');

// ── 5) Низ сторінки: застереження Атласу не повторює першого речення спільної примітки; «Куди далі» не дублює вміст зон «М’язи», «Мозок», «ШКТ».
const aside = (html.match(/<aside class="atlas-disclaimer">([^<]*)<\/aside>/) || [])[1];
assert.equal(aside, 'Симптоми та діагноз не визначаються лише за вибором області на схемі.', 'the page disclaimer keeps only what is specific to the Atlas');
assert(!aside.includes('Матеріал освітній і не є персональною медичною рекомендацією'), 'the first sentence lives in the shared notice only');
assert(js.includes('document.body.dataset.atlasZone=selectedZone'), 'the script tells CSS which zone is open');
const nextRule = (css.match(/body\[data-atlas-zone="muscles"\][^{]*\{[^}]*\}/) || [])[0] || '';
for (const zone of ['muscles', 'brain', 'gut']) assert(nextRule.includes(`body[data-atlas-zone="${zone}"] .eua-next :is(h2, ul)`), `«Куди далі» is folded away in the zone «${zone}»`);
for (const zone of ['shoulder', 'spine', 'knee']) assert(!nextRule.includes(`"${zone}"`), `«Куди далі» stays in the zone «${zone}»`);
assert(/display:\s*none/.test(nextRule) && !nextRule.includes('.eua-save') && !nextRule.includes('.eua-print'), 'the «Зберегти» and «Друкувати» buttons are never hidden');

// ── 6) Довіра: вкладка «Дослідження» плеча й коліна чесно каже, що джерел і рівнів впевненості тут ще немає. Нових тверджень, рівнів чи джерел цим реченням не додано.
const honest = 'Поки що в цьому модулі немає наведених джерел і оцінених рівнів впевненості: вони з’являться разом із перевіреними висновками.';
const researchOf = name => (js.match(new RegExp(`const ${name}Content=\\{[\\s\\S]*?\\n research:\\(\\)=>\`([\\s\\S]*?)\`\\n\\};`)) || [])[1] || '';
for (const zone of ['shoulder', 'knee']) assert(researchOf(zone).includes(honest), `${zone}: the research tab says plainly that sources and confidence levels are not there yet`);
assert(!/PMID|doi\.org|pubmed|рівень впевненості:\s*(висок|помір|низьк)/i.test(researchOf('shoulder') + researchOf('knee')), 'the research tabs still name no source and assign no confidence level');
assert(researchOf('muscles').includes('рівні впевненості ще не оцінено'), 'the muscles zone keeps its own honest sentence');

// ── 7) Без JavaScript: порожня панель з мертвими кнопками замінена поясненням з прямими посиланнями.
assert(/<noscript><style>\.atlas-figure-panel,\.atlas-detail\{display:none!important\}<\/style><\/noscript>/.test(html), 'without JavaScript the dead figure and the empty panel are hidden');
const noscript = (html.match(/<noscript><div class="atlas-nojs"[\s\S]*?<\/noscript>/) || [])[0] || '';
assert(noscript.includes('Для інтерактивного атласу потрібен JavaScript'), 'the note says what is missing');
const noJsLinks = [...noscript.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
assert(noJsLinks.length >= 4, 'the note gives direct links');
for (const href of noJsLinks) assert(fs.existsSync('dist/' + href.replace('./', '').split(/[?#]/)[0]), `${href}: the page exists`);
assert((html.match(/href="\.\/about\.html#ab-atlas"/g) || []).length === 2, 'the note does not repeat the «Про атлас» link, which is visible without JavaScript anyway');

// ── 8) Шлях в Атласі: абзац, а не «nav без посилань»; стрілок у розмітці немає (їх малює CSS і вони не лишаються в кінці рядка); на телефоні без першої ланки.
const crumb = (html.match(/<p class="atlas-breadcrumb" id="atlas-breadcrumb">[\s\S]*?<\/p>/) || [])[0] || '';
assert(crumb && !crumb.includes('<i') && !/<nav[^>]*atlas-breadcrumb/.test(html), 'the path is a paragraph without arrow elements and without an empty navigation landmark');
assert(crumb.includes('id="atlas-breadcrumb-zone"') && crumb.includes('id="atlas-breadcrumb-tab"') && crumb.includes('atlas-crumb--root'), 'the zone and tab crumbs are still addressable by the scripts');
assert(/\.atlas-breadcrumb \.atlas-crumb \+ \.atlas-crumb::before \{[^}]*content:\s*"→"/.test(css), 'the arrow belongs to the crumb that follows it');
assert(/\.atlas-crumb \{[^}]*text-overflow:\s*ellipsis/.test(css), 'a long crumb (a pain-map point title) is cut with an ellipsis instead of wrapping to a third line');
assert(/@media \(max-width: 580px\) \{[\s\S]*?\.atlas-breadcrumb \.atlas-crumb--root \{ display: none; \}[\s\S]*?\.atlas-breadcrumb \.atlas-crumb--root \+ \.atlas-crumb::before \{ display: none; \}/.test(css), 'on a phone the first crumb «Атлас» (and the arrow after it) is hidden');

// ── 9) Назва вкладки браузера показує зону й розділ (раніше була однакова для всіх зон); «Перейти до змісту» — перша зупинка Tab.
assert(js.includes('const baseTitle=document.title;') && js.includes('document.title=selectedZone===DEFAULT_ZONE&&selectedTab===\'overview\'?baseTitle:`Атлас · ${meta.title}${available.length>1&&selectedTab!==\'overview\'?` · ${tabLabels[selectedTab]}`:\'\'} — Evidence UA`'), 'render() writes the document title from the zone and the tab; the default state (shoulder, overview) keeps the page title, because «Зберегти в мій список» remembers the title at load and its link opens atlas.html without a zone');
assert(/<body[^>]*>\s*<a class="atlas-skip" href="#atlas-title">Перейти до змісту<\/a>/.test(html), 'the skip link is the first element of the page');
assert(html.includes('<h1 id="atlas-title" tabindex="-1">'), 'the target of the skip link can take focus');
assert(js.includes("document.addEventListener('eua:header-mounted',placeSkipLink)") && js.includes('document.body.prepend(skipLink)'), 'the shared header is mounted at the start of <body> after load; the script puts the skip link before it again');
assert(/\.atlas-skip \{[^}]*top:\s*-5rem/.test(css) && /\.atlas-skip:focus \{ top: \.75rem; \}/.test(css), 'the skip link is off-screen until it has focus');
assert(/\[class\*="skip"\]/.test(printCss), 'the skip link is not printed');

// ── 10) Порядок Tab = порядок на фігурі (ШКТ вище за м’язи); карта коліна, як і плеча, лише на вкладці «Огляд».
const order = [...html.matchAll(/data-zone="([^"]+)"/g)].map(match => match[1]);
const yOf = {brain: 7, shoulder: 19, spine: 26, gut: 36, muscles: 58, knee: 69};
const matchY = zone => Number((css.match(new RegExp(`\\.atlas-zone--${zone} \\{ --x: [\\d.]+%; --y: ([\\d.]+)%`)) || [])[1]);
assert.deepEqual(Object.keys(yOf).map(matchY), Object.values(yOf), 'the vertical positions of the pins are read as expected');
assert.deepEqual(order, Object.keys(yOf).sort((a, b) => yOf[a] - yOf[b]), 'the pin buttons are in the order of their vertical position on the figure');
assert(/function sync\(\)\{\n if\(kneeSelected\(\)&&overviewSelected\(\)&&!suppressed\)showMap\(\);/.test(kneeJs), 'the knee map is open on the overview tab only (like the shoulder map)');
assert(/atlasTabs\.forEach\(button=>button\.addEventListener\('click',\(\)=>requestAnimationFrame\(\(\)=>\{\n sync\(\);/.test(kneeJs), 'switching a tab brings the figure back or the map again');
assert(/function sync\(\)\{if\(shoulderSelected\(\)&&overviewSelected\(\)/.test(shoulderJs), 'the shoulder map keeps working the same way');
assert(/activeHotspot=null;sync\(\);\n\}/.test(kneeJs) && !/activeHotspot=null;showMap\(\);/.test(kneeJs), 'restoring a state from the address does not open the map on another tab');

// ── 11) Пошук: «постава» знаходить «Хребет в Атласі», «карта болю» — Атлас і зони з картою болю, «acl» — картку зв’язки.
assert.equal(findMaterials('постава')[0]?.id, 'atlas-zone-spine', '«постава» → the spine zone');
assert.equal(findMaterials('поставу')[0]?.id, 'atlas-zone-spine', 'and its other case');
const painMapHits = findMaterials('карта болю').slice(0, 3).map(item => item.id);
for (const id of ['navigation-atlas', 'atlas-zone-shoulder', 'atlas-zone-knee']) assert(painMapHits.includes(id), `«карта болю» finds ${id} among the first three (${painMapHits.join(', ')})`);
assert(findMaterials('acl').some(item => item.title === 'Коліно: передня хрестоподібна зв’язка'), '«acl» still finds the renamed card');
assert(findMaterials('хрестоподібна зв’язка').some(item => item.title === 'Коліно: передня хрестоподібна зв’язка'), 'and so does its Ukrainian name');
assert.equal(materials.filter(item => item.areaId === 'atlas' && item.id !== 'navigation-atlas').length, 16, 'no entries were added or lost: six zones and ten topics');

// ── 12) Підпис під назвою в шапці (зелена палітра) мав 9 px; на сайті жодний видимий текст не менший за 12 px.
const smallInHeader = [...headerCss.matchAll(/font(?:-size)?:\s*(?:[\w ]*?)(\d+(?:\.\d+)?)px/g)].map(match => Number(match[1])).filter(size => size < 12);
assert.deepEqual(smallInHeader, [], `no declared font size below 12 px in the shared header stylesheet (${smallInHeader.join(', ')})`);
assert(/\.eua-header-wordmark small\{[^}]*font:500 12px\/1\.4/.test(headerCss), 'the tagline under the site name is 12 px');
assert(/@media\(max-width:430px\)\{\.eua-site-header \.eua-header-wordmark small\{display:none\}\}/.test(headerCss), 'on a phone (≤ 430 px) the tagline is hidden, as in the cosmic palette: 12 px does not fit one row with the buttons and the header grew from 81 to 139 px at 390 px');
assert.equal(read('dist/site-header.css'), read('src/platform/site-header.css'), 'dist/site-header.css is the build copy of the source');

// ── Журнал і версії.
const day = CHANGES.find(entry => entry.date === '2026-11-12');
assert(day && day.items.length === 1, 'one journal record for 2026-11-12');
for (const item of day.items) {
  assert(TAGS[item.tag] && item.science === 'none' && SCIENCE.none, `${item.title}: known tag, no new science`);
  assert(item.text.length > 20 && item.text.length < 200, `${item.title}: a short plain description (${item.text.length})`);
  assert(fs.existsSync('dist/' + item.href.replace('./', '').split(/[?#]/)[0]), `${item.title}: the link leads to a real page`);
  assert(!/допоможе|лікує|гарантує|позбавить/i.test(item.text), `${item.title}: no promises`);
}
assert(versionOf(read('dist/changes-page.js'), 'changes-data.js') === versionOf(read('dist/changes.html'), 'changes-page.js') && versionOf(read('dist/changes.html'), 'changes-page.js') >= 34, 'the journal page and its data have the same new version');
const versions = {'atlas-redesign.css': [html, 5], 'atlas.js': [html, 10], 'knee-pain-map.js': [html, 5], 'shoulder-pain-map.js': [html, 5], 'atlas-points.js': [js, 2]};
for (const [name, [text, minimum]] of Object.entries(versions)) assert(versionOf(text, name) >= minimum, `${name} carries the new version (≥ ${minimum})`);
assert(versionOf(kneeJs, 'atlas-points.js') >= 2 && versionOf(shoulderJs, 'atlas-points.js') >= 2, 'both pain maps import the new data module');

console.log('Atlas audit fixes: print, label chips, pain-map geometry, Ukrainian names, page bottom, honest research note, no-JS note, path, title and skip link, Tab order, knee map, search, header tagline, journal.');
