import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Execute the real decorative renderer: changing scroll must change desktop
// light, while the same scroll must leave the phone's existing wave untouched.
const source = fs.readFileSync('dist/home-geo-hero.js', 'utf8');
function scene({width = 1440, desktop = true, reduced = false, headingRight = 660} = {}) {
  let next = 0, random = 3, paints = [], observer;
  const pending = new Map(), events = new Map(), media = new Map();
  const context = {
    setTransform() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {},
    clearRect() { paints = []; }, fill() { paints.push(this.fillStyle); }
  };
  const canvas = {clientWidth: width, clientHeight: 900, setAttribute() {}, getContext: () => context,
    getBoundingClientRect: () => ({left: 0})};
  const heading = {};
  const page = {querySelector: selector => selector === '.hero h1' ? heading : null, insertBefore() {}};
  const document = {hidden: false, querySelector: () => page, createElement: () => canvas,
    createRange: () => ({selectNodeContents() {}, getBoundingClientRect: () => ({right: headingRight})}),
    addEventListener(name, fn) { events.set('document:' + name, fn); }};
  const window = {devicePixelRatio: 1, scrollY: 0,
    IntersectionObserver: true,
    addEventListener(name, fn, options) { events.set(name, fn); events.set(name + ':options', options); }};
  const math = Object.create(Math);
  math.random = () => ((random = (random * 16807) % 2147483647) / 2147483647);
  vm.runInNewContext(source, {window, document, Math: math, performance: {now: () => 0},
    matchMedia(query) {
      const mq = {matches: query.includes('reduced-motion') ? reduced : desktop,
        addEventListener(name, fn) { this.change = fn; }};
      media.set(query, mq); return mq;
    },
    requestAnimationFrame(fn) { pending.set(++next, fn); return next; },
    cancelAnimationFrame(id) { pending.delete(id); },
    IntersectionObserver: class { constructor(fn) { observer = fn; } observe() {} }
  });
  function tick(time = 1000) {
    const callbacks = [...pending.values()]; pending.clear();
    callbacks.forEach(fn => fn(time)); return [...paints];
  }
  function scroll(y) { window.scrollY = y; events.get('scroll')?.(); }
  return {tick, scroll, events, media, pending, document,
    hide() { document.hidden = true; events.get('document:visibilitychange')?.(); },
    offscreen() { observer?.([{isIntersecting: false}]); }};
}

const desktop = scene();
const before = desktop.tick();
desktop.scroll(260);
let after;
for (let i = 0; i < 60; i++) after = desktop.tick();
assert.notDeepEqual(after, before, 'desktop scroll must reshape light on the existing facets');
assert.equal(desktop.events.get('scroll:options')?.passive, true, 'scroll observation must be passive');
assert(!desktop.events.has('wheel'), 'do not intercept the mouse wheel or lock page scrolling');

for (const settings of [{width: 390, desktop: false}, {width: 1440, desktop: false}]) {
  const phone = scene(settings), original = phone.tick();
  phone.scroll(260);
  assert.deepEqual(phone.tick(), original, 'touch devices retain the existing wave at the same time');
}

const enlargedText = scene({headingRight: 1300}), textFrame = enlargedText.tick();
enlargedText.scroll(260);
assert.deepEqual(enlargedText.tick(), textFrame, 'disable extra light when enlarged text leaves too little room');

const reduced = scene({reduced: true});
reduced.tick();
reduced.scroll(260);
assert.equal(reduced.pending.size, 0, 'reduced motion must not animate on scroll');

desktop.hide();
assert.equal(desktop.pending.size, 0, 'hidden documents must stop rendering');
const outside = scene(); outside.tick(); outside.offscreen();
assert.equal(outside.pending.size, 0, 'offscreen hero must stop rendering');
console.log('desktop kaleidoscope: scroll response, touch retention, reduced motion and lifecycle verified');
