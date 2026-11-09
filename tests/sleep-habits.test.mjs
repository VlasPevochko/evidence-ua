import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHANGES, TAGS, SCIENCE} from '../dist/changes-data.js';
const sleep = await import('../src/sleep/page.mjs');
const read = f => fs.readFileSync(f, 'utf8');

// Картки звичок на телефоні (рішення власника «1 так», 2026-11-09): до 600 px кожна згортається в рядок «номер + назва» з кнопкою, текст відкривається дотиком.
// На комп'ютері й без JavaScript усе видно, як і раніше. Слова карток не змінювались: тест тримає їх дослівно (це викладення рекомендацій NIH/NHLBI), додано лише обгортки .habit-body.
const page = read('dist/sleep.html'), css = read('dist/sleep.css');

// 1) Розмітка: чотири картки, номер, назва, обгортка з унікальним id (на неї вказує aria-controls), посилання лише в четвертій; слова ті самі, що були.
const HABITS = [
  ['01', 'Стабільний ритм', '<p>Намагайся лягати й прокидатися приблизно в один час, зокрема у вихідні.</p>'],
  ['02', 'Світло й спокій', '<p>Проводь час надворі вдень, коли можливо. Перед сном дай собі спокійніший період і зменш яскраве штучне світло.</p>'],
  ['03', 'Тиха, темна, прохолодна спальня', '<p>Світло, шум і температура можуть заважати сну. Налаштуй середовище під комфортний відпочинок.</p>'],
  ['04', 'Увага до стимуляторів', '<p>Кофеїн і нікотин можуть порушувати сон. Час прийому та індивідуальна чутливість мають значення.</p><a href="./index.html#supplement-caffeine">Наш розбір кофеїну →</a>']
];
const list = (page.match(/<div class="habit-list">([\s\S]*?)<\/div><p class="sleep-source-note">/) || [])[1];
assert(list, 'the habit list is on the page');
const expected = HABITS.map(([num, title, body], i) => `<article><span>${num}</span><div><h3>${title}</h3><div class="habit-body" id="habit-body-${i + 1}">${body}</div></div></article>`).join('');
assert.equal(list, expected, 'four habit cards, the same words as before, each text inside .habit-body with its own id');
assert.equal((page.match(/id="habit-body-\d"/g) || []).length, 4, 'the ids are unique');
assert(page.indexOf('id="sleep-habits"') < page.indexOf('class="habit-list"') && page.indexOf('class="habit-list"') < page.indexOf('id="sleep-related"'), 'the habits stay in their own section, before «Дивись також»');
assert(read('dist/sleep.js').includes('export function mountHabits') && read('dist/sleep.js').includes('mountHabits(document)'), 'the delivered script folds the cards on a phone');

// 2) Розмір цілі й ефекти в CSS: рядок-кнопка не нижча за 44 px, видимий фокус, у друку текст розгорнуто, без JavaScript нічого не ховається (ховає лише клас, який ставить скрипт).
const rule = selector => { const at = css.indexOf(selector); assert(at >= 0, `${selector} exists`); return css.slice(at, css.indexOf('}', at)); };
assert(Number((rule('.habit-toggle{').match(/min-height:(\d+)px/) || [])[1]) >= 44, 'the fold button is at least 44 px tall');
assert(css.includes('.habit-toggle:focus-visible{outline:2px solid'), 'the fold button shows a focus ring');
assert(/@media print\{[^}]*\.habit-body\[hidden\]\{display:block!important\}/.test(css), 'on paper every habit text is shown (!important, because the site hides every [hidden] element with !important)');
assert(!/\.habit-body\{[^}]*display:none/.test(css), 'CSS alone never hides a text: only the hidden attribute set by the script does');
// «Рейка» замість стандартного акордеона з плюсами (вимога власника про шаблонність, 2026-11-09): вузол-кружок із номером картки, тонка лінія між вузлами (як лінії рядків схеми ночі), шеврон;
// відкритий вузол заповнений, як курсор схеми. Номер у вузлі береться з лічильника CSS, тож завжди збігається з порядком карток; він декоративний (порожня текстова альтернатива, з простим запасним варіантом).
assert(css.includes("content:counter(habit,decimal-leading-zero);content:counter(habit,decimal-leading-zero) / '';"), 'the node shows the card number from a CSS counter and is decorative for a screen reader');
assert(/\.habit-toggle\[aria-expanded=true\]::before\{background:var\(--gold\)/.test(css), 'an open node is filled');
assert(/\.habit-toggle::after\{content:'';[^}]*border-right[^}]*border-bottom/.test(css) && css.includes('.habit-toggle[aria-expanded=true]::after{transform:'), 'a chevron shows that the row opens and turns over when it is open');
assert(/@media screen\{\s*\.habit-list\.is-fold\{counter-reset:habit\}/.test(css), 'the fold styles apply on a screen only: paper keeps the plain layout');
assert(css.includes('@media (prefers-reduced-motion:reduce){.habit-toggle::after{transition:none}}'), 'the chevron does not animate for people who ask for no motion');

// 2а) Запис у журналі оновлень: правдивий (лише спосіб користування, слова не змінились), посилання веде на розділ звичок.
const day = CHANGES.find(d => d.date === '2026-11-09');
const entry = day && day.items.find(i => i.title === 'Сон: картки звичок на телефоні згортаються в рядки');
assert(entry, 'the journal has a record about the folded habit cards');
assert(TAGS[entry.tag] && SCIENCE[entry.science] && entry.science === 'none', 'known tag; no new science: only the way of use changed');
assert(entry.text.length > 20 && entry.text.length < 200, 'a short plain description');
assert.equal(entry.href, './sleep.html#sleep-habits');
assert(page.includes('id="sleep-habits"'), 'the section the record leads to exists');
assert(entry.text.includes('відкривається дотиком') && entry.text.includes('Слова не змінились') && entry.text.includes('без JavaScript усе видно'), 'the record says what the tests above prove');

// 3) Поведінка без браузера: умовний DOM із найменшим набором методів, який чіпає mountHabits.
function el(tag = 'div', attrs = {}) {
  const classes = new Set();
  return {
    tag, children: [], attrs: {...attrs}, listeners: {}, hidden: false, id: attrs.id || '', className: '', type: '', _text: '',
    classList: {add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c), toggle(c, on) { if (on) classes.add(c); else classes.delete(c); return on; }},
    setAttribute(key, value) { this.attrs[key] = String(value); },
    getAttribute(key) { return key in this.attrs ? this.attrs[key] : null; },
    addEventListener(type, fn) { this.listeners[type] = fn; },
    append(...nodes) { this.children.push(...nodes); },
    get textContent() { return this.children.length ? this.children.map(c => c.textContent).join('') : this._text; },
    set textContent(value) { this.children = []; this._text = String(value); }
  };
}
function setup({matches = true, legacy = false, noBodies = false} = {}) {
  const query = {matches, fire(next) { this.matches = next; (legacy ? this.legacyFn : this.changeFn)?.({matches: next}); }};
  if (legacy) query.addListener = fn => { query.legacyFn = fn; };
  else query.addEventListener = (type, fn) => { assert.equal(type, 'change'); query.changeFn = fn; };
  const doc = {createElement: tag => el(tag), defaultView: {matchMedia: q => { assert.equal(q, '(max-width: 600px)', 'the fold follows the phone breakpoint of the page styles'); return query; }}};
  const listEl = el('div');
  listEl.ownerDocument = doc;
  const articles = HABITS.map(([num, title], i) => {
    const heading = el('h3'); heading.textContent = title;
    const body = noBodies ? null : el('div', {id: `habit-body-${i + 1}`});
    const article = el('article');
    article.querySelector = selector => selector === 'h3' ? heading : selector === '.habit-body' ? body : null;
    return {article, heading, body, title};
  });
  listEl.querySelectorAll = selector => selector === 'article' ? articles.map(a => a.article) : [];
  const root = {querySelector: selector => selector === '.habit-list' ? listEl : null};
  const controller = sleep.mountHabits(root);
  return {controller, listEl, articles, query};
}

test('on a phone every habit becomes a row with a button inside its heading, the text is hidden', () => {
  const {controller, listEl, articles} = setup();
  assert(controller && listEl.classList.contains('is-fold'));
  for (const {heading, body, title} of articles) {
    assert.equal(heading.children.length, 1, 'the heading keeps one child, the button (the heading stays a heading)');
    const button = heading.children[0];
    assert.equal(button.tag, 'button');
    assert.equal(button.type, 'button', 'it never submits anything');
    assert.equal(button.textContent, title, 'the button says the title of the habit');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(button.getAttribute('aria-controls'), body.id);
    assert.equal(button.className, 'habit-toggle');
    assert.equal(body.hidden, true, 'the text is hidden until a tap');
  }
});

test('a tap opens one habit and closes it again, the others stay as they are', () => {
  const {articles} = setup();
  const button = i => articles[i].heading.children[0];
  button(3).listeners.click();
  assert.equal(button(3).getAttribute('aria-expanded'), 'true');
  assert.equal(articles[3].body.hidden, false);
  assert(articles.slice(0, 3).every(a => a.body.hidden && a.heading.children[0].getAttribute('aria-expanded') === 'false'), 'the rest stay folded');
  button(1).listeners.click();
  assert.equal(articles[1].body.hidden, false);
  assert.equal(articles[3].body.hidden, false, 'opening a second habit does not close the first: they are independent');
  button(3).listeners.click();
  assert.equal(button(3).getAttribute('aria-expanded'), 'false');
  assert.equal(articles[3].body.hidden, true);
});

test('on a computer nothing changes: no buttons, every text visible, headings keep their words', () => {
  const {controller, listEl, articles} = setup({matches: false});
  assert(controller);
  assert(!listEl.classList.contains('is-fold'));
  for (const {heading, body, title} of articles) {
    assert.equal(heading.children.length, 0, 'no button');
    assert.equal(heading.textContent, title);
    assert.equal(body.hidden, false);
  }
});

test('crossing the breakpoint either way brings back the state that fits the width, and forgets what was opened', () => {
  for (const legacy of [false, true]) {
    const {listEl, articles, query} = setup({matches: false, legacy});
    query.fire(true);
    assert(listEl.classList.contains('is-fold') && articles.every(a => a.body.hidden && a.heading.children.length === 1), `folds when the window narrows (legacy listener: ${legacy})`);
    articles[0].heading.children[0].listeners.click();
    assert.equal(articles[0].body.hidden, false);
    query.fire(false);
    assert(!listEl.classList.contains('is-fold'));
    assert(articles.every(a => !a.body.hidden && a.heading.children.length === 0 && a.heading.textContent === a.title), 'unfolds when the window widens: all texts visible, headings are plain again');
    query.fire(true);
    assert(articles.every(a => a.body.hidden && a.heading.children[0].getAttribute('aria-expanded') === 'false'), 'a habit opened earlier is folded again: nothing is left half-open');
    articles[2].heading.children[0].listeners.click();
    query.fire(true);
    assert(articles.every(a => a.heading.children.length === 1), 'a repeated notification does not add a second button');
    assert.equal(articles[2].body.hidden, false, 'and does not close a habit the person has just opened');
    assert.equal(articles[2].heading.children[0].getAttribute('aria-expanded'), 'true');
  }
});

test('a page without the list, or a list without bodies, does nothing', () => {
  assert.equal(sleep.mountHabits({querySelector: () => null}), null);
  assert.equal(setup({noBodies: true}).controller, null, 'without the wrappers the script leaves the cards alone');
});
