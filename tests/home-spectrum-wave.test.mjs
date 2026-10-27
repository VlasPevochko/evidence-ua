import assert from 'node:assert/strict';

const {mountSpectrumWave} = await import('../dist/home-spectrum-wave.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
assert.equal(typeof mountSpectrumWave, 'function', 'the home wave needs its isolated lifecycle controller');

// Use real EventTarget dispatch; only browser layout, Canvas paint and frame
// scheduling need deterministic fixtures in this Node-only test suite.
class Target extends EventTarget {
  listeners = new Map();
  options = new Map();
  addEventListener(type, callback, options) {
    super.addEventListener(type, callback, options);
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
    this.options.set(type, options);
  }
  removeEventListener(type, callback, options) {
    super.removeEventListener(type, callback, options);
    this.listeners.get(type)?.delete(callback);
  }
  listenerCount(type) { return this.listeners.get(type)?.size || 0; }
  totalListeners() { return [...this.listeners.values()].reduce((sum, entries) => sum + entries.size, 0); }
}

function scene({width = 1440, height = 360, reduced = false, ratio = 1,
  contextAvailable = true, observerAvailable = true, canvasAvailable = true} = {}) {
  const window = new Target(), document = new Target(), media = new Target();
  const pending = new Map(), observers = [], paints = [];
  let frameId = 0, now = 0, currentPath = [], paint, dimensions = {width, height};
  const context = {
    setTransform() {},
    clearRect() { paint = []; paints.push(paint); },
    beginPath() { currentPath = []; },
    moveTo(x, y) { currentPath.push([x, y]); },
    lineTo(x, y) { currentPath.push([x, y]); },
    stroke() { paint.push(currentPath.map(point => [...point])); },
    createLinearGradient() { return {addColorStop() {}}; }
  };
  const holder = {ownerDocument: document};
  const canvas = {
    width: 300, height: 150, dataset: {}, ownerDocument: document,
    closest: selector => selector === '.spectrum-home' ? holder : null,
    getBoundingClientRect: () => ({...dimensions, top: 180 - window.scrollY,
      bottom: 180 - window.scrollY + dimensions.height, left: 0, right: dimensions.width}),
    getContext: type => contextAvailable && type === '2d' ? context : null
  };
  document.defaultView = window;
  document.hidden = false;
  document.querySelector = selector => selector === '#spectrum-wave' && canvasAvailable ? canvas : null;
  Object.assign(window, {
    document, scrollY: 0, innerWidth: width, innerHeight: 900, devicePixelRatio: ratio,
    performance: {now: () => now},
    matchMedia: () => media,
    requestAnimationFrame(callback) { pending.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { pending.delete(id); }
  });
  media.matches = reduced;
  if (observerAvailable) window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  };
  function tick(milliseconds = 1000 / 60) {
    now += milliseconds;
    const callbacks = [...pending.values()];
    pending.clear();
    callbacks.forEach(callback => callback(now));
  }
  function settle() {
    for (let i = 0; i < 300 && pending.size; i++) tick();
    assert.equal(pending.size, 0, 'the wave must stop requesting frames when the scroll response settles');
  }
  function scroll(y) {
    window.scrollY = y;
    const event = new Event('scroll', {cancelable: true});
    window.dispatchEvent(event);
    return event;
  }
  function visible(isIntersecting) {
    for (const observer of observers) {
      if (!observer.disconnected) observer.callback([{target: observer.target, isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0}]);
    }
  }
  function hidden(value) {
    document.hidden = value;
    document.dispatchEvent(new Event('visibilitychange'));
  }
  return {window, document, media, canvas, holder, pending, paints, observers, tick, settle, scroll, visible, hidden,
    currentPaint: () => paints.at(-1),
    resize(newWidth, newHeight) {
      dimensions = {width: newWidth, height: newHeight};
      window.dispatchEvent(new Event('resize'));
    },
    motion(value) {
      media.matches = value;
      media.dispatchEvent(new Event('change'));
    }
  };
}

function shape(paint) {
  const line = paint.find(path => path.length > 3);
  assert.ok(line, 'the renderer must draw a real wave path');
  assert.ok(line.flat().every(Number.isFinite), 'all painted geometry must remain finite');
  return line.map(([x, y]) => [x, y - line[0][1]]);
}

// A missing phase update, phone-only static branch, or image translation would
// leave these relative path coordinates unchanged after a native scroll event.
for (const width of [390, 1440]) {
  const page = scene({width});
  const destroy = mountSpectrumWave(page.document);
  const before = shape(page.currentPaint());
  assert.equal(page.pending.size, 0, 'initial still must not start a permanent animation');
  const event = page.scroll(320);
  assert.equal(event.defaultPrevented, false);
  assert.equal(page.window.scrollY, 320, 'the native page position must be left alone');
  assert.equal(page.window.options.get('scroll')?.passive, true);
  for (const type of ['wheel', 'touchstart', 'touchmove']) {
    assert.equal(page.window.listenerCount(type), 0, `${type} must stay native`);
    const input = new Event(type, {cancelable: true});
    page.window.dispatchEvent(input);
    assert.equal(input.defaultPrevented, false);
  }
  assert.ok(page.pending.size > 0, 'scroll should schedule a real flowing response');
  page.settle();
  assert.notDeepEqual(shape(page.currentPaint()), before, `${width}px scroll must reshape the filaments`);
  assert.ok(Number(page.canvas.dataset.wavePhase) > 0);
  assert.ok(Number(page.canvas.dataset.waveProgress) > 0 && Number(page.canvas.dataset.waveProgress) <= 1);
  destroy();
}

// Drawing every 60 Hz frame during active input would exceed this budget.
{
  const page = scene();
  const destroy = mountSpectrumWave(page.document);
  const originalPaints = page.paints.length;
  for (let i = 1; i <= 120; i++) {
    page.scroll(i * 3);
    page.tick();
  }
  assert.ok(page.paints.length - originalPaints <= 62, 'continuous input must paint at about 30 FPS or less');
  page.settle();
  const settledPaints = page.paints.length;
  for (let i = 0; i < 60; i++) page.tick();
  assert.equal(page.paints.length, settledPaints, 'idle time must not generate new paints');
  destroy();
}

{
  const page = scene({reduced: true});
  const destroy = mountSpectrumWave(page.document);
  const initial = shape(page.currentPaint());
  assert.equal(page.paints.length, 1, 'reduced motion receives one static composition');
  page.scroll(280);
  page.settle();
  assert.equal(page.paints.length, 1);
  assert.deepEqual(shape(page.currentPaint()), initial);
  page.motion(false);
  assert.ok(page.pending.size, 'enabling motion may respond to the real current page position');
  page.tick();
  page.motion(true);
  assert.equal(page.pending.size, 0, 'enabling reduced motion cancels the pending response');
  assert.deepEqual(shape(page.currentPaint()), initial, 'reduced motion restores the stable composition');
  page.scroll(350);
  assert.equal(page.pending.size, 0);
  page.resize(780, 360);
  assert.equal(page.pending.size, 0, 'a reduced-motion resize must also remain still');
  assert.ok(page.currentPaint().flat(2).every(Number.isFinite));
  destroy();
}

// Removing any pause guard would leave work queued or restart a hidden wave.
{
  const page = scene();
  const destroy = mountSpectrumWave(page.document);
  page.scroll(300);
  page.hidden(true);
  assert.equal(page.pending.size, 0, 'a hidden document cancels scheduled frames');
  const count = page.paints.length;
  page.scroll(350);
  page.tick();
  assert.equal(page.paints.length, count);
  page.visible(false);
  page.hidden(false);
  assert.equal(page.pending.size, 0, 'visibility alone cannot restart an offscreen wave');
  page.resize(1400, 360);
  assert.equal(page.pending.size, 0, 'resize must preserve an observer-reported offscreen pause');
  page.visible(true);
  assert.ok(page.pending.size, 'a visible onscreen wave resumes toward current scroll position');
  page.settle();
  assert.ok(Number(page.canvas.dataset.wavePhase) > 0);
  page.scroll(420);
  page.visible(false);
  assert.equal(page.pending.size, 0, 'IntersectionObserver cancels rendering outside the viewport');
  page.scroll(460);
  assert.equal(page.pending.size, 0);
  page.visible(true);
  page.settle();
  destroy();
}

{
  const page = scene();
  const destroy = mountSpectrumWave(page.document);
  page.scroll(240);
  page.window.dispatchEvent(new Event('pagehide'));
  assert.equal(page.pending.size, 0, 'pagehide cancels all pending work');
  page.hidden(true);
  page.window.dispatchEvent(new Event('pageshow'));
  assert.equal(page.pending.size, 0, 'pageshow must still honor document visibility');
  page.visible(false);
  page.hidden(false);
  assert.equal(page.pending.size, 0, 'pageshow must also honor the offscreen state');
  page.visible(true);
  page.settle();
  assert.ok(Number(page.canvas.dataset.wavePhase) > 0);
  destroy();
}

{
  const page = scene({width: 8192, height: 4096, ratio: 4});
  const destroy = mountSpectrumWave(page.document);
  assert.ok(page.canvas.width <= 1920 * 1.5, 'wide screens must not allocate a page-sized backing bitmap');
  assert.ok(page.canvas.height <= 640 * 1.5, 'the decorative layer has a bounded vertical bitmap');
  page.scroll(180);
  page.tick();
  const oldPaint = page.currentPaint();
  page.resize(390, 240);
  assert.equal(page.canvas.width, 585, 'DPR is capped at 1.5 on a phone too');
  assert.equal(page.canvas.height, 360);
  assert.notDeepEqual(page.currentPaint(), oldPaint, 'resize repaints within the new bounds');
  assert.ok(page.pending.size <= 1, 'resize must never duplicate an existing frame loop');
  page.settle();
  destroy();
}

{
  const page = scene();
  const destroy = mountSpectrumWave(page.document);
  assert.equal(mountSpectrumWave(page.document), destroy, 'repeat mounting must reuse one active controller');
  assert.equal(page.window.listenerCount('scroll'), 1);
  page.scroll(220);
  destroy();
  destroy();
  assert.equal(page.pending.size, 0);
  assert.equal(page.window.totalListeners(), 0);
  assert.equal(page.document.totalListeners(), 0);
  assert.equal(page.media.totalListeners(), 0);
  assert.ok(page.observers.every(observer => observer.disconnected));
  const count = page.paints.length;
  page.scroll(330);
  page.resize(500, 300);
  page.motion(true);
  page.visible(true);
  page.tick();
  assert.equal(page.paints.length, count, 'destroyed controllers cannot draw again');
  const remounted = mountSpectrumWave(page.document);
  assert.notEqual(remounted, destroy, 'a later route mount receives a fresh controller');
  assert.equal(page.window.listenerCount('scroll'), 1);
  remounted();
}

for (const settings of [{contextAvailable: false}, {canvasAvailable: false}]) {
  const page = scene(settings);
  const destroy = mountSpectrumWave(page.document);
  assert.equal(typeof destroy, 'function');
  assert.doesNotThrow(destroy);
  assert.equal(page.paints.length, 0, 'missing Canvas support leaves the existing static artwork alone');
  assert.equal(page.pending.size, 0);
  assert.equal(page.window.totalListeners(), 0);
}

{
  const page = scene({observerAvailable: false});
  const destroy = mountSpectrumWave(page.document);
  page.scroll(800);
  assert.equal(page.pending.size, 0, 'without IntersectionObserver an offscreen rect still pauses rendering');
  page.scroll(100);
  assert.ok(page.pending.size, 'the fallback resumes when the actual canvas returns to the viewport');
  page.settle();
  destroy();
}

console.log('spectrum wave: scroll geometry, native input, frame budget, motion preference and lifecycle verified');
