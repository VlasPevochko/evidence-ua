import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';
import {CHANGES, TAGS, SCIENCE} from '../dist/changes-data.js';

// Сторінка «Сон і відновлення»: правки 34, 36 і 37 з рішення власника (2026-11-09): дрібниці (пропущений пробіл, одна кнопка замість трьох посилань), блок «Дивись також»,
// щільніший вигляд на телефоні, три записи в журналі. Блок «Дивись також» не містить жодного нового твердження: це чотири посилання на вже наявні матеріали, а їхні назви
// дослівно взяті з самих матеріалів. Тест перевіряє саме це: якщо матеріал перейменують або приберуть, посилання не залишиться «висіти» з іншою назвою.
const read = f => fs.readFileSync(f, 'utf8');
const page = read('dist/sleep.html'), css = read('dist/sleep.css');
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// 1) «Дивись також»: рівно чотири посилання, кожне веде на справжнє місце, а назва збігається з назвою там.
const block = page.match(/<section class="sleep-section sleep-related" id="sleep-related" aria-labelledby="sleep-related-title">([\s\S]*?)<\/section>/);
assert(block, 'the page has the related block as its own section with a labelled heading');
assert(page.includes('id="sleep-related-title"'), 'the section heading has the id the section points to');
const links = [...block[1].matchAll(/<li><a href="([^"]+)"><small>([^<]+)<\/small><span>([^<]+)<\/span><\/a><\/li>/g)].map(m => ({href: m[1], kind: decode(m[2]), title: decode(m[3])}));
assert.equal(links.length, 4, 'four links, no more (one control per action, nothing to scroll through)');
assert.equal((block[1].match(/<a /g) || []).length, 4, 'and nothing else in the block is a link');
assert.equal(new Set(links.map(l => l.href)).size, 4, 'all four lead to different places');

const research = links.filter(l => l.href.startsWith('./research.html#'));
assert.equal(research.length, 3, 'three research breakdowns');
for (const link of research) {
  const id = link.href.split('#')[1];
  const study = STUDIES.find(s => s.id === id);
  assert(study, `${id}: the research page has this breakdown (its card opens from the address)`);
  assert.equal(study.topic, 'sleep', `${id}: the breakdown is about sleep`);
  assert.equal(link.title, study.question, `${id}: the link text is exactly the question on the breakdown card`);
  assert.equal(link.kind, 'Розбір дослідження', `${id}: the label says what the link leads to`);
}
// Так на розбори посилаються й інші сторінки (index.html, mechanisms.html): адреса research.html#<id>. Без JavaScript це статичний якір у списку розборів, з JavaScript сторінка розборів сама відкриває картку з цим id
// (інакше посилання вело б «просто на сторінку»).
const researchHtml = read('dist/research.html'), researchPage = read('dist/research-page.js');
for (const link of research) assert(researchHtml.includes(`id="${link.href.split('#')[1]}"`), `${link.href}: the research page has a static anchor, so the link works without JavaScript too`);
assert(researchPage.includes("card.id='rs-'+s.id") && researchPage.includes("replace(/^#rs-?/,'').replace(/^#/,'')") && researchPage.includes('card.open=true'), 'the research page opens the card named in the address');

const mechanism = links.find(l => l.href === './mechanisms.html#caffeine');
assert(mechanism, 'one link goes to the caffeine scheme');
const mech = read('dist/mechanisms.html');
assert(mech.includes('<section class="mc" id="caffeine"'), 'the scheme section has the id the link points to');
const heading = decode((mech.match(/<h2 id="mc-caffeine-title">([^<]+)<\/h2>/) || [])[1] || '');
assert.equal(mechanism.title, heading, 'the link text is exactly the heading of the scheme');
assert.equal(mechanism.kind, 'Анімована схема', 'the label says it is an animated scheme');

// Жодних нових тверджень: у блоці лише ці назви, мітки типу й заголовок (без власного пояснювального тексту).
const own = decode(block[1].replace(/<a [\s\S]*?<\/a>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
assert.equal(own, 'ДИВИСЬ ТАКОЖ Про сон в інших розділах.', 'the block adds no sentence of its own that would need a source');
assert(!/\d+\s*(%|відсот|рази|разів)|допомага|покращ|лікує|гарантує/i.test(own), 'and promises nothing');

// Блок стоїть після основних розділів і перед джерелами; пошук по розділах бачить його.
const order = ['id="sleep-stages"', 'id="sleep-performance"', 'id="sleep-habits"', 'id="sleep-related"', 'id="sources"'].map(m => page.indexOf(m));
assert(order.every((x, i) => x > 0 && (!i || x > order[i - 1])), 'the order is stages, performance, habits, related, sources');

// 2) Правка 34: одна кнопка в шапці замість трьох дрібних посилань; пропущений пробіл у заголовку.
const meta = page.match(/<div class="module-meta">([\s\S]*?)<\/div>/);
assert(meta, 'the hero has its meta row');
assert.equal((meta[1].match(/<a /g) || []).length, 1, 'one link, not three');
assert(/<a class="meta-button" href="#sources">Джерела й межі ↓<\/a>/.test(meta[1]), 'the one button leads to sources and limits');
assert(page.includes('id="sources"'), 'and the place it leads to exists');
assert(!/<h[1-3][^>]*>[^<]*,<br>/.test(page), 'no heading has «,<br>»: on a phone the <br> is hidden and the comma would stick to the next word');
assert(page.includes('<h3>Результат залежить від того, <br>що саме вимірюють.</h3>'), 'the heading of the evidence card keeps the space before the break');

// 3) Розміри цілей дотику й щільність: усе, що натискається в нових частинах, не нижче 44 px; на телефоні шрифти не зменшені, лише інтервали.
const minHeight = (selectorStart, from = 0) => {
  const at = css.indexOf(selectorStart, from);
  assert(at >= 0, `${selectorStart} exists in sleep.css`);
  const rule = css.slice(at, css.indexOf('}', at));
  return Number((rule.match(/min-height:(\d+)px/) || [])[1]);
};
assert(minHeight('.night-play{') >= 44, 'the play/pause button is at least 44 px tall');
assert(minHeight('body[data-platform-area=sleep] .pb .module-meta a.meta-button{') >= 44, 'the hero button is at least 44 px tall');
assert(minHeight('.related-list a{') >= 44, 'a related link is at least 44 px tall');
// «Дивись також» стало «рейкою» (рішення власника «5 так», 2026-11-09): раніше стрілка стояла в кінці назви (тут перевірялась нерозривна пробіл-стрілка й телефонне правило плиток 2 × 2), тепер стрілка в кружку-вузлі
// ліворуч від рядка. Вона декоративна (порожня текстова альтернатива, з простим запасним варіантом), а висота рядка не нижча за 44 px на будь-якій ширині (окремого телефонного правила для неї більше немає).
assert(css.includes("content:'→';content:'→' / '';"), 'the arrow of a related link sits in a round node and is decorative for a screen reader, with a plain fallback for browsers without alt text in content');
assert(/\.related-list li::before,\.related-list li::after\{content:'';position:absolute;left:12\.5px;width:1px/.test(css), 'a hairline joins the nodes (the rail)');
assert(!/max-width:600px\)\{[^}]*\.related-list a\{[^}]*min-height/.test(css), 'no phone rule lowers the row height');
// Блок «щільніші інтервали» закінчується першим рядком «}» після його коментаря. Раніше зріз ішов до кінця файла; відтоді після нього додано блок карток звичок (там є розмір значка «＋»),
// тож зріз обмежено самим блоком: він, як і раніше, не має права міняти розміри шрифтів.
const phoneStart = css.indexOf('/* Телефон: той самий текст');
// Рядки схеми ночі торкаються пальцем (рішення власника «3 так»; висоту 44 px затверджено «6 так», 2026-11-10): на телефоні й на сенсорних екранах будь-якої ширини рядок не нижчий за 44 px,
// смуга не вища за 20 px (поточна смуга вища ще на 4 px, тож смуги лишаються не вищими за 24 px).
const phoneRow = css.match(/@media\(max-width:600px\)\{\.sleep-night\{--row:(\d+)px;--bar:(\d+)px/);
assert(phoneRow && Number(phoneRow[1]) >= 44 && Number(phoneRow[2]) <= 20, 'on a phone a row of the scheme is at least 44 px tall and its bar at most 20 px');
const coarse = css.match(/@media \(pointer:coarse\)\{\.sleep-night\{--row:(\d+)px;--bar:(\d+)px\}\}/);
assert(coarse && Number(coarse[1]) >= 44 && Number(coarse[2]) <= 20, 'the same on touch screens of any width (pointer: coarse)');
assert(css.indexOf('@media (pointer:coarse)') > css.indexOf('@media(min-width:1000px){.sleep-stage-top'), 'the touch rule comes after the wide-screen rule, so it wins on a wide touch screen too');
const phoneBlock = css.slice(phoneStart, css.indexOf('\n}\n', phoneStart) + 3);
assert(phoneBlock.includes('@media(max-width:600px)') && !/font-size/.test(phoneBlock), 'the phone block changes only spacing, never font sizes');

// 4) Журнал: три записи за 2026-11-09, правдиві й без нових наукових тверджень.
const day = CHANGES.find(d => d.date === '2026-11-09');
assert(day, 'the journal has the day of the change');
// 2026-11-10: після записів про сон журнал отримав новий день (Атлас), тож «найновіший день» уже не 2026-11-09; достатньо, щоб день змін існував і не був новішим за журнал.
assert(CHANGES[0].date >= '2026-11-09', 'and the journal is not older than that day');
const titles = {scheme: 'Схема ночі на сторінці «Сон і відновлення»', related: 'Сон: блок «Дивись також»', phone: 'Сон: щільніший вигляд на телефоні й одна кнопка в шапці'};
const entry = key => day.items.find(i => i.title === titles[key]);
for (const key of Object.keys(titles)) {
  const it = entry(key);
  assert(it, `${key}: there is a record`);
  assert(TAGS[it.tag] && SCIENCE[it.science], `${key}: known tag and science marker`);
  assert.equal(it.science, 'none', `${key}: only the look and the way of use changed, nothing new is claimed`);
  assert(it.text.length > 20 && it.text.length < 200, `${key}: a short plain description`);
  const target = it.href.split('#');
  assert.equal(target[0], './sleep.html', `${key}: the record leads to the sleep page`);
  if (target[1]) assert(page.includes(`id="${target[1]}"`), `${key}: the place the record leads to exists`);
}
assert(entry('scheme').text.includes('Це приклад, а не запис чиєїсь ночі') && page.includes('data-sleep-night'), 'the scheme record says it is an example, as the scheme itself does');
assert(entry('related').text.includes('чотири посилання'), 'the related record says four links');
assert(/магній/.test(entry('related').text) && /інтервальне голодування/.test(entry('related').text) && /короткий сон/.test(entry('related').text) && /кофеїн/.test(entry('related').text), 'and names what they lead to');
assert(entry('phone').text.includes('одна кнопка замість трьох'), 'the phone record says what happened to the three links');
// Версії: сторінка журналу й її дані піднято, сторінка сну несе нові версії.
// Записи за «3 так» і «5 так» (2026-11-09): схему ночі можна торкатися; «Дивись також» у стилі «рейки».
for (const [title, href, words] of [['Сон: схему ночі можна торкатися', './sleep.html#sleep-stages', ['Торкніться рядка', 'як після кнопки стадії']], ['Сон: «Дивись також» у стилі рейки', './sleep.html#sleep-related', ['вузлами-стрілками', 'Слова й посилання не змінились']]]) {
  const it = day.items.find(i => i.title === title);
  assert(it, `${title}: there is a record`);
  assert(TAGS[it.tag] && SCIENCE[it.science] && it.science === 'none', `${title}: known tag, no new science`);
  assert(it.text.length > 20 && it.text.length < 200, `${title}: a short plain description`);
  assert.equal(it.href, href);
  assert(page.includes(`id="${href.split('#')[1]}"`), `${title}: the place the record leads to exists`);
  assert(words.every(w => it.text.includes(w)), `${title}: the record says what the page does`);
}
// Версії не прив'язані до точних чисел (2026-11-09, після картки звичок): кожна наступна зміна цих файлів піднімає їх, а тест мусить лишатися чинним. Важливе: журнал і його дані мають ОДНУ версію, не нижчу за ту,
// з якою вийшли записи про схему ночі (30), а сторінка сну несе версії не нижчі за ті, з якими вийшла схема (стиль 86, скрипт 83).
const versionOf = (text, name) => Number((text.match(new RegExp(name.replace(/[.]/g, '\\.') + '\\?v=(\\d+)')) || [])[1]);
const journalVersion = versionOf(read('dist/changes.html'), 'changes-page.js');
assert(journalVersion >= 30 && journalVersion === versionOf(read('dist/changes-page.js'), 'changes-data.js'), 'the journal page and its data have the same, new version');
assert(versionOf(page, 'sleep.css') >= 86 && versionOf(page, 'sleep.js') >= 83, 'the sleep page carries the new versions of its style and script');
// Картка «Нове на сайті» на головній збирається з журналу, тож найновіший запис про сон має бути в ній.
const home = read('dist/index.html');
// Картка показує перші записи найновішого дня, тож перевіряємо найновіший запис дня (а не конкретну назву: щойно за цей день додано нові записи, перший з них зсуває старші за межу картки).
assert(home.includes(`<time datetime="${CHANGES[0].date}">`) && home.includes(`<li>${CHANGES[0].items[0].title}</li>`), 'the home card «Нове на сайті» shows the newest day with its newest record');

console.log('Sleep related block, hero button, heading space, 44 px targets, phone spacing and journal records passed.');
