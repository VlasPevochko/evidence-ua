// Схеми для «силових» розділів (2026-11-15, рішення власника «1-4 виконуємо»): залучення одиниць із повзунком, «сила й розмір»,
// три способи навантажити м’яз, шлях росту. Перевіряємо: без тексту в SVG, кожен крок має свою частину й правило світла,
// повзунок справді перемикає стан (через мінімальний DOM у пам’яті), підписи не розходяться між джерелом і скриптом,
// а збірка вставила все в сторінку.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {recruitArt, curvesArt, loadTypesArt, growthArt, RECRUIT_UNITS, GROWTH_STEPS} from '../src/muscle-lab/training-art.mjs';
import {recruitTexts} from '../src/muscle-lab/guide.mjs';
import {mountGuide} from '../src/muscle-lab/guide-ui.mjs';

for (const [name, svg] of Object.entries({recruitArt: recruitArt(), curvesArt: curvesArt(), loadTypesArt: loadTypesArt(), growthArt: growthArt()})) {
  assert.ok(!/<text[\s>]/.test(svg), `${name}: без тексту в малюнку, підписи це HTML`);
  assert.ok(/aria-hidden="true"/.test(svg), `${name}: малюнок декоративний, зміст дає текст поруч`);
}

const css = fs.readFileSync('dist/muscle-lab.css', 'utf8');
const html = fs.readFileSync('dist/muscle-lab.html', 'utf8');

// 1. Залучення: вісім груп, правило світла на кожну, повзунок схований, поки немає скрипта.
assert.equal((recruitArt().match(/class="rc-unit /g) || []).length, RECRUIT_UNITS);
for (let i = 0; i < RECRUIT_UNITS; i++) {
  const lv = Array.from({length: RECRUIT_UNITS - i}, (_, k) => `[data-recruit-level="${i + 1 + k}"]`).join(',');
  assert.ok(css.includes(`.mg-recruit:is(${lv}) .rc-u${i} .rc-cell{fill:var(--gold)}`), `CSS світить групу ${i} від рівня ${i + 1}`);
}
assert.ok(/data-recruit-ctl hidden/.test(html), 'без скрипта повзунка немає: його показує muscle-guide.js');
assert.ok(html.includes('data-recruit-level="3"') && html.includes(recruitTexts[0]), 'початковий стан видно й без скрипта');
const uiSource = fs.readFileSync('dist/muscle-guide.js', 'utf8');
for (const t of recruitTexts) assert.ok(uiSource.includes(t), 'текст стану однаковий у розмітці й у скрипті: ' + t);

// Поведінка повзунка через мінімальний DOM.
const mk = (attrs = {}) => ({attrs, textContent: '', hidden: true, style: {vars: {}, setProperty(k, v) { this.vars[k] = v; }}, value: '38',
  setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }});
const range = mk(), text = mk(), ctl = mk(), recruit = mk({'data-recruit-level': '3'});
recruit.querySelector = s => ({'[data-recruit-range]': range, '[data-recruit-text]': text, '[data-recruit-ctl]': ctl})[s] || null;
const listeners = new Map();
const root = {defaultView: {location: {hash: ''}, matchMedia: () => ({matches: false, addEventListener() {}}), addEventListener() {}}, hidden: false,
  querySelector: s => (s === '[data-recruit]' ? recruit : null), querySelectorAll: () => [], getElementById: () => null,
  addEventListener(k, f) { listeners.set(k, f); }, removeEventListener() {}};
const ui = mountGuide(root);
assert.equal(ctl.hidden, false, 'скрипт показує повзунок');
assert.equal(recruit.attrs['data-recruit-level'], '4', 'початкове значення 38 дає четвертий рівень');
assert.equal(ui.effort(0).level, 0); assert.equal(text.textContent, recruitTexts[0]);
assert.equal(ui.effort(50).level, 4); assert.equal(text.textContent, recruitTexts[1]);
assert.equal(ui.effort(100).level, 8); assert.equal(text.textContent, recruitTexts[2]);
assert.equal(range.attrs['aria-valuetext'], recruitTexts[2], 'читач з екрана чує той самий текст');
assert.ok(Number(recruit.style.vars['--gap']) < 2, 'на максимумі імпульси найчастіші (пунктир найгустіший)');
range.value = '10'; listeners.get('input')({target: {closest: s => (s === '[data-recruit-range]' ? range : null)}});
assert.equal(recruit.attrs['data-recruit-level'], '1', 'подія input перемикає рівень');
ui.destroy();

// 2. Сила й розмір.
assert.equal((curvesArt().match(/pathLength="1"/g) || []).length, 2, 'дві лінії домальовуються');
assert.ok(html.includes('class="mg-curves"') && html.includes('Що росте першим: сила чи розмір'));

// 3. Три способи навантажити.
assert.equal((loadTypesArt().match(/class="lt-panel /g) || []).length, 3);
assert.ok(html.includes('Піднімання') && html.includes('Опускання') && html.includes('Утримання'));
assert.ok(html.includes('Пошкодження м’яза (особливо від незвичної ексцентричної роботи) може супроводжувати тренування'), 'речення про пошкодження повторює текст розділу, нових тверджень немає');

// 4. Шлях росту: стільки частин, скільки карток-кроків.
const flowCards = (html.match(/<ol class="mg-flow"[\s\S]*?<\/ol>/)[0].match(/<li /g) || []).length;
assert.equal(flowCards, GROWTH_STEPS, 'кроків у малюнку стільки, скільки карток під ним');
const used = new Set([...growthArt().matchAll(/gr-p(\d)/g)].map(m => Number(m[1])));
assert.deepEqual([...used].sort(), Array.from({length: GROWTH_STEPS}, (_, i) => i));
assert.ok(/\.mg-chapter\[open\] \.gr-p\{animation:gr-on/.test(css), 'кроки загораються, коли розгортаєш розділ');
assert.ok(/prefers-reduced-motion:reduce\)\{[^@]*\.gr-p\{animation:none\}/.test(css.replace(/\n/g, '')), 'без руху все вже «загорілось»');

// Збірка вставила все, версії піднято.
for (const c of ['mg-recruit-art', 'mg-curves-art', 'mg-loadtypes-art', 'mg-growth-art']) assert.ok(html.includes(c), c);
assert.ok(html.includes('muscle-guide.js?v=5') && Number(html.match(/muscle-lab\.css\?v=(\d+)/)[1]) >= 80, 'версії модуля й стилів піднято');
console.log('muscle-training-art: ok');
