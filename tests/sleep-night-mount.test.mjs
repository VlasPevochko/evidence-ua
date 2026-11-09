import test from 'node:test';
import assert from 'node:assert/strict';
import {SLOTS, NIGHT_MS, SEGMENTS, firstStart, segmentAt} from '../src/sleep/night.mjs';
const sleep = await import('../src/sleep/page.mjs');

// Поведінка схеми ночі (рішення власника 35, 2026-11-09) без браузера: умовний DOM із найменшим набором методів, який чіпає mountNight.
// Тут перевіряється логіка (автозапуск, пауза, зупинка у фоні, вибір стадії, повернення до руху); справжній вигляд і рух у Chromium міряє Browser QA (sleepNightFlow).
function el(tag = 'div') {
  const classes = new Set();
  return {
    tag, children: [], dataset: {}, attrs: {}, listeners: {}, className: '', textContent: '', innerHTML: '', type: '',
    style: {props: {}, setProperty(key, value) { this.props[key] = value; }},
    classList: {add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c)},
    setAttribute(key, value) { this.attrs[key] = value; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener(type, fn) { this.listeners[type] = fn; },
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

// options: reduced (prefers-reduced-motion), observer (даємо IntersectionObserver і керуємо ним з тесту)
function setup({reduced = false, observer = false, names = true} = {}) {
  const frames = new Map();
  let nextId = 1, io = null;
  const doc = {hidden: false, listeners: {}, createElement: tag => el(tag), addEventListener(type, fn) { this.listeners[type] = fn; }};
  const win = {
    matchMedia: () => ({matches: reduced}),
    requestAnimationFrame: fn => { const id = nextId++; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => { frames.delete(id); }
  };
  if (observer) win.IntersectionObserver = class { constructor(fn) { io = fn; } observe() {} };
  doc.defaultView = win;
  const figure = el('figure');
  figure.ownerDocument = doc;
  figure.querySelectorAll = selector => selector === '.night-bar' ? bars : [];
  const bars = SEGMENTS.map(() => el('i'));
  const root = {querySelector: selector => selector === '[data-sleep-night]' ? figure : null};
  const buttons = ['n1', 'n2', 'n3', 'rem'].map(id => {
    const span = {textContent: ` ${{n1: 'Перехід до сну', n2: 'Сон поглиблюється', n3: 'Глибокий сон', rem: 'Активність мозку'}[id]} `};
    return {dataset: {sleepStage: id}, querySelector: selector => selector === 'span' ? span : null};
  });
  const night = sleep.mountNight(root, names ? {buttons} : null);
  const foot = figure.children[0];
  const [now, toggle] = foot.children;
  // Один кадр: виконати те, що попросили в requestAnimationFrame, і повернути, чи було що виконувати.
  const frame = time => { const [id, fn] = frames.entries().next().value || []; if (!fn) return false; frames.delete(id); fn(time); return true; };
  return {night, figure, bars, doc, now, toggle, frames, frame, observe: entries => io(entries), hasObserver: () => Boolean(io)};
}

test('without IntersectionObserver the night starts moving by itself, one frame at a time, and the cursor advances by the real time', () => {
  const page = setup();
  assert(page.figure.classList.contains('is-live'), 'the scheme becomes live only when JavaScript has started it');
  assert.equal(page.night.state().playing, true);
  assert.equal(page.frames.size, 1, 'exactly one frame is requested at a time');
  assert(page.toggle.innerHTML.includes('Пауза'), 'the button offers to pause while the night moves');
  page.frame(1000);
  const afterFirst = page.night.state().t;
  assert(Math.abs(afterFirst - 16 / NIGHT_MS) < 1e-9, 'the first frame moves by one standard step of 16 ms');
  page.frame(1016);
  assert(Math.abs(page.night.state().t - 32 / NIGHT_MS) < 1e-9, 'the next frame moves by the real time between frames');
  page.frame(1016 + 5000);
  assert(Math.abs(page.night.state().t - (32 + 100) / NIGHT_MS) < 1e-9, 'after a long stall the cursor jumps by 100 ms at most, not by the whole stall');
  assert.equal(page.frames.size, 1, 'still exactly one frame in flight');
  assert(page.figure.style.props['--t'], 'the cursor position is passed to CSS as --t');
  const current = segmentAt(page.night.state().t);
  assert(page.bars[current.index].classList.contains('is-now'), 'the bar under the cursor is marked');
  assert.equal(page.bars.filter(bar => bar.classList.contains('is-now')).length, 1, 'only one bar is marked at a time');
  // Підпис «На схемі зараз» іде за курсором: після першого відрізка (неспання) назва стадії змінюється.
  assert.equal(page.now.textContent, 'На схемі зараз: Неспання', 'the night begins awake (the label has no stage button name for it)');
  let time = 1016 + 5000;
  for (let i = 0; i < 6; i++) page.frame(time += 100);
  assert.equal(segmentAt(page.night.state().t).stage, 'n1', 'after about half a second the cursor is in the first sleep stage');
  assert.equal(page.now.textContent, 'На схемі зараз: N1 · Перехід до сну', 'the label follows the cursor into the next segment');
  assert.equal(page.bars.filter(bar => bar.classList.contains('is-now')).length, 1);
});

test('prefers-reduced-motion: the scheme starts paused and only a person can start it', () => {
  const page = setup({reduced: true});
  assert.equal(page.night.state().playing, false);
  assert.equal(page.frames.size, 0, 'no animation frame is requested');
  assert.equal(page.now.textContent, 'Обери стадію або запусти ніч.');
  assert(page.toggle.innerHTML.includes('Відтворити'));
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, true, 'the button starts the night');
  assert.equal(page.frames.size, 1);
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, false, 'and pauses it');
  assert.equal(page.frames.size, 0, 'the pending frame is cancelled on pause');
});

test('the night stands still while the tab is in the background and goes on when it comes back', () => {
  const page = setup();
  page.doc.hidden = true;
  page.doc.listeners.visibilitychange();
  assert.equal(page.frames.size, 0, 'the frame is cancelled in the background');
  const stopped = page.night.state().t;
  page.doc.hidden = false;
  page.doc.listeners.visibilitychange();
  assert.equal(page.frames.size, 1, 'a frame is requested again when the tab is visible');
  page.frame(2000);
  assert(page.night.state().t > stopped, 'and the cursor moves on from where it stopped');
  assert.equal(page.night.state().playing, true, 'it never became paused by itself');
});

test('with IntersectionObserver the night starts only when the scheme is seen, stops when it leaves, and never overrides a person who paused it', () => {
  const page = setup({observer: true});
  assert(page.hasObserver());
  assert.equal(page.night.state().playing, false, 'not started before the scheme is on the screen');
  assert.equal(page.frames.size, 0);
  page.observe([{isIntersecting: true, intersectionRatio: 0.2}]);
  assert.equal(page.night.state().playing, false, 'a glimpse under 35% does not start it');
  page.observe([{isIntersecting: true, intersectionRatio: 0.6}]);
  assert.equal(page.night.state().playing, true, 'it starts when at least 35% is visible');
  assert.equal(page.frames.size, 1);
  page.observe([{isIntersecting: false, intersectionRatio: 0}]);
  assert.equal(page.frames.size, 0, 'it stands still when the scheme is off the screen');
  assert.equal(page.night.state().playing, true, 'but the person did not pause it, so it will go on');
  page.observe([{isIntersecting: true, intersectionRatio: 0.9}]);
  assert.equal(page.frames.size, 1, 'it goes on when the scheme comes back');
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, false, 'the person pauses it');
  page.observe([{isIntersecting: false, intersectionRatio: 0}]);
  page.observe([{isIntersecting: true, intersectionRatio: 0.9}]);
  assert.equal(page.night.state().playing, false, 'scrolling away and back never restarts a night the person paused');
  assert.equal(page.frames.size, 0);
});

test('a person who played and paused the night before the scheme was seen is not overridden by the first autostart', () => {
  const page = setup({observer: true});
  page.observe([{isIntersecting: true, intersectionRatio: 0.2}]);
  assert.equal(page.night.state().playing, false, 'a glimpse does not start it');
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, true, 'the person plays it (the button can be visible while most of the scheme is not)');
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, false, 'and pauses it');
  page.observe([{isIntersecting: true, intersectionRatio: 0.8}]);
  assert.equal(page.night.state().playing, false, 'the first time the scheme is seen well, the autostart does not override the pause');
  assert.equal(page.frames.size, 0);
});

test('choosing a stage before the scheme is seen well keeps it paused on that stage', () => {
  const page = setup({observer: true});
  page.night.show('n2');
  page.observe([{isIntersecting: true, intersectionRatio: 0.8}]);
  assert.equal(page.night.state().playing, false, 'the autostart does not override a chosen stage');
  assert.equal(page.night.state().selected, 'n2');
  assert.equal(page.frames.size, 0);
});

test('choosing a stage pauses the night on the first bar of that stage and shows it; the button brings the night back', () => {
  const page = setup();
  page.frame(1000);
  page.night.show('n3');
  const state = page.night.state();
  assert.equal(state.playing, false, 'choosing a stage pauses the night');
  assert.equal(state.selected, 'n3');
  assert.equal(page.frames.size, 0, 'no frame is left running');
  assert.equal(page.figure.dataset.selected, 'n3', 'CSS highlights all bars of the stage from this attribute');
  assert(Math.abs(state.t - (firstStart('n3') + 0.5 / SLOTS)) < 1e-12, 'the cursor stands in the middle of the first slot of the stage');
  assert.equal(segmentAt(state.t).stage, 'n3');
  assert.equal(page.now.textContent, 'Показано: N3 · Глибокий сон', 'the label names the stage as the stage buttons do');
  assert(page.bars[segmentAt(state.t).index].classList.contains('is-now'));
  assert(page.toggle.innerHTML.includes('Відтворити'));
  // Інша стадія замінює попередню, а не додається до неї.
  page.night.show('rem');
  assert.equal(page.figure.dataset.selected, 'rem');
  assert.equal(segmentAt(page.night.state().t).stage, 'rem');
  // Невідома стадія нічого не міняє.
  page.night.show('bogus');
  assert.equal(page.night.state().selected, 'rem');
  // «Відтворити» знімає виділення й запускає ніч.
  page.toggle.listeners.click();
  assert.equal(page.night.state().playing, true);
  assert.equal(page.night.state().selected, null);
  assert.equal(page.figure.dataset.selected, undefined, 'the highlight is removed');
  assert.equal(page.frames.size, 1);
  assert(page.now.textContent.startsWith('На схемі зараз: '), 'the label is back to the moving cursor');
});

test('without stage buttons the label falls back to the short stage name', () => {
  const page = setup({names: false});
  page.night.show('n2');
  assert.equal(page.now.textContent, 'Показано: N2');
});

test('the stage buttons ask the scheme to show a stage only when a person chose it, not on the first selection', () => {
  const calls = [];
  const buttons = ['n1', 'n2', 'n3', 'rem'].map(id => ({dataset: {sleepStage: id}, attributes: {}, listeners: {}, setAttribute(key, value) { this.attributes[key] = value; }, addEventListener(type, fn) { this.listeners[type] = fn; }}));
  const panels = buttons.map(button => ({dataset: {stagePanel: button.dataset.sleepStage}, hidden: false}));
  const root = {querySelectorAll: selector => selector === '[data-sleep-stage]' ? buttons : panels};
  const controller = sleep.mountSleep(root, {onSelect: id => calls.push(id)});
  assert.deepEqual(calls, [], 'the starting selection (N1) does not move the scheme');
  buttons[2].listeners.click();
  buttons[3].listeners.click();
  assert.deepEqual(calls, ['n3', 'rem'], 'every click of a person is passed on');
  controller.select('n2');
  assert.deepEqual(calls, ['n3', 'rem'], 'a selection made by the code itself is not');
  assert.equal(sleep.mountSleep({querySelectorAll: () => []}), null, 'a page without stage buttons does nothing');
});

test('a page without the scheme does nothing', () => {
  assert.equal(sleep.mountNight({querySelector: () => null}), null);
});
