// Анімація «Космос усередині тебе» на сторінці «Про проєкт» (рішення власника 2026-11-25: «Там де про проєкт», «Перефарбувати в лаванду»).
// Оригінал власника лежить без змін у src/about/cosmos-source.json. Звідси збираються дві копії для сайту (scripts/make-about-cosmos.mjs):
//   dist/about-cosmos-green.json  — оригінальні кольори (золото пасує до «Зеленого» оформлення, де акцент теж золотий);
//   dist/about-cosmos.json        — космічна копія: золото стає лавандою сайту.
// Бірюзовий (мітохондрії, туманність), фіолетовий і теплий білий (зірки) не змінюються: це «другий колір» і колір зірок, як і в решті космічної палітри (docs/COLORS.md).
// Обидві копії компактні: числа округлені до тисячних (на екрані це менше за піксель), відступів немає.

const hex = value => value.replace('#', '').match(/../g).map(part => parseInt(part, 16) / 255);
const key = rgb => rgb.slice(0, 3).map(channel => Math.round(channel * 255)).join(',');

// Золото оригіналу → лаванда сайту (ті самі пари, що й у розборах: світле золото → #d1a5ff, глибше → #bb81ef).
export const GOLD_TO_LAVENDER = new Map([
  ['#e8c878', '#d1a5ff'],
  ['#c9a24b', '#bb81ef']
]);
const swaps = new Map([...GOLD_TO_LAVENDER].map(([from, to]) => [key(hex(from)), hex(to)]));

export const round = number => Math.round(number * 1000) / 1000;

function roundAll(node) {
  if (Array.isArray(node)) return node.map(roundAll);
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([name, value]) => [name, roundAll(value)]));
  return typeof node === 'number' ? round(node) : node;
}

const swapRgb = (values, at) => {
  const to = swaps.get(key(values.slice(at, at + 3)));
  if (to) to.forEach((channel, index) => { values[at + index] = channel; });
};

// Колір заливки чи лінії: [r,g,b,a] нерухомий або ключові кадри з s/e.
function swapColor(property) {
  if (!property) return;
  if (property.a) {
    for (const frame of property.k) for (const side of ['s', 'e']) if (Array.isArray(frame[side])) swapRgb(frame[side], 0);
  } else if (Array.isArray(property.k)) swapRgb(property.k, 0);
}

// Градієнт: перші p зупинок по чотири числа [місце, r, g, b], далі прозорість [місце, a] — її не чіпаємо.
function swapGradient(gradient) {
  const stops = gradient.p;
  const each = values => { for (let stop = 0; stop < stops; stop++) swapRgb(values, stop * 4 + 1); };
  if (gradient.k.a) for (const frame of gradient.k.k) for (const side of ['s', 'e']) { if (Array.isArray(frame[side])) each(frame[side]); }
  else each(gradient.k.k);
}

function recolor(node) {
  if (Array.isArray(node)) return node.forEach(recolor);
  if (!node || typeof node !== 'object') return;
  if (node.ty === 'fl' || node.ty === 'st') swapColor(node.c);
  if ((node.ty === 'gf' || node.ty === 'gs') && node.g) swapGradient(node.g);
  Object.values(node).forEach(recolor);
}

// palette: 'green' — оригінальні кольори; 'cosmic' — лаванда замість золота.
export function buildCosmos(source, palette) {
  const copy = structuredClone(source);
  if (palette === 'cosmic') recolor(copy.layers);
  return roundAll(copy);
}

// Усі кольори анімації (для тестів): шістнадцяткові рядки без повторів.
export function colorsOf(animation) {
  const found = new Set();
  const add = (values, at) => found.add('#' + values.slice(at, at + 3).map(channel => Math.round(channel * 255).toString(16).padStart(2, '0')).join(''));
  const walk = node => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if ((node.ty === 'fl' || node.ty === 'st') && node.c) {
      if (node.c.a) node.c.k.forEach(frame => Array.isArray(frame.s) && add(frame.s, 0)); else add(node.c.k, 0);
    }
    if ((node.ty === 'gf' || node.ty === 'gs') && node.g) {
      const frames = node.g.k.a ? node.g.k.k.map(frame => frame.s).filter(Array.isArray) : [node.g.k.k];
      for (const values of frames) for (let stop = 0; stop < node.g.p; stop++) add(values, stop * 4 + 1);
    }
    Object.values(node).forEach(walk);
  };
  walk(animation.layers);
  return [...found].sort();
}
