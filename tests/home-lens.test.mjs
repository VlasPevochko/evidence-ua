import test from 'node:test';
import assert from 'node:assert/strict';

// A missing module produces an explicit feature assertion during the RED run.
const {lensProgress, mountHomeLens} = await import('../src/platform/home-lens.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

class Events {
  handlers = new Map();
  addEventListener(type, callback, options) {
    const list = this.handlers.get(type) || [];
    list.push({callback, options});
    this.handlers.set(type, list);
  }
  removeEventListener(type, callback) {
    this.handlers.set(type, (this.handlers.get(type) || []).filter(item => item.callback !== callback));
  }
  fire(type, event = {}) {
    for (const item of [...(this.handlers.get(type) || [])]) {
      item.callback(event);
      if (item.options?.once) this.removeEventListener(type, item.callback);
    }
  }
  count() { return [...this.handlers.values()].reduce((sum, items) => sum + items.length, 0); }
}

class Element extends Events {
  constructor(tagName = 'DIV', parentElement = null) {
    super(); this.tagName = tagName; this.parentElement = parentElement;
    this.dataset = {}; this.attributes = new Map(); this.open = false;
    this.values = new Map(); this.style = {
      setProperty: (name, value) => this.values.set(name, String(value)),
      removeProperty: name => this.values.delete(name),
      getPropertyValue: name => this.values.get(name) || '',
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  contains(target) { for (let node = target; node; node = node.parentElement) if (node === this) return true; return false; }
  closest(selector) {
    for (let node = this; node; node = node.parentElement) {
      if (selector === 'details' && node.tagName === 'DETAILS') return node;
      if (selector === '[data-home-lens]' && node.lens) return node;
      if (selector === '[data-lens-reveal]' && node.jump) return node;
      if (selector.includes('.topic-card') && node.card) return node;
      if (selector === '[data-platform-area="home"]' && node.home) return node;
      if (selector === '.page' && node.page) return node;
      if (selector === '[hidden]' && node.hasAttribute('hidden')) return node;
    }
    return null;
  }
}

function fixture({reduced = false, missing = null, failure = null, route = 'home', top = 344, viewportHeight = 1000, sectionHeight = 600} = {}) {
  const doc = new Events(), win = new Events(), media = new Events();
  doc.defaultView = win; doc.hidden = false; doc.readyState = 'complete';
  doc.activeElement = null;
  doc.body = new Element('BODY'); doc.body.home = true;
  doc.body.dataset = {platformArea: 'home', routeView: route};
  win.location = {hash: ''}; win.innerHeight = viewportHeight;
  const home = new Element('MAIN', doc.body), section = new Element('SECTION', home);
  home.home = true; home.page = true; section.lens = true;
  const cards = new Element('DIV', section), jump = new Element('A', section);
  jump.jump = true; jump.setAttribute('href', '#cards');
  const links = Array.from({length: 6}, (_, index) => {
    const link = new Element('A', cards); link.card = true; link.dataset.area = `area-${index}`;
    link.setAttribute('href', `./area-${index}.html`); return link;
  });
  let rect = {top, bottom: top + sectionHeight, width: 800, height: sectionHeight};
  section.getBoundingClientRect = () => ({...rect});
  section.getClientRects = () => doc.body.dataset.routeView === 'article' ? [] : [rect];
  section.querySelector = selector => selector === '#cards' ? cards : selector === '[data-lens-reveal]' ? jump : null;
  section.querySelectorAll = selector => selector.includes('.topic-card') ? links : [];
  cards.querySelectorAll = selector => selector.includes('a') ? links : [];
  doc.querySelector = selector => selector.includes('data-home-lens') ? section : null;
  const ids = new Map([['cards', cards]]); doc.getElementById = id => ids.get(id) || null;
  media.matches = reduced;
  win.matchMedia = () => { if (failure === 'media') throw Error('blocked media'); return media; };
  let observer, nextFrame = 1;
  const frames = new Map();
  win.requestAnimationFrame = callback => { const id = nextFrame++; frames.set(id, callback); return id; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.connected = false; observer = this; }
    observe(target) { if (failure === 'observe') throw Error('observer setup failed'); this.target = target; this.connected = true; }
    disconnect() { this.connected = false; }
  };
  if (missing) delete win[missing];
  const mount = () => { assert.equal(typeof mountHomeLens, 'function', 'mountHomeLens is implemented'); return mountHomeLens(doc); };
  return {
    doc, win, media, section, cards, jump, links, home, ids, frames, mount,
    get observer() { return observer; },
    move(value) { rect = {...rect, top: value, bottom: value + sectionHeight}; },
    intersect(value) { observer.callback([{target: section, isIntersecting: value}]); },
    flush() { const queued = [...frames.values()]; frames.clear(); for (const callback of queued) callback(16); },
    progress() { return Number(section.style.getPropertyValue('--lens-progress')); },
    ready() { return section.hasAttribute('data-lens-ready'); },
    complete() { return section.hasAttribute('data-lens-complete'); },
  };
}

test('progress ends with the section inside the viewport after a short native scroll window', () => {
  assert.equal(typeof lensProgress, 'function', 'lensProgress is implemented');
  // Completion must position the choices on screen, not just finish their opacity.
  for (const [top, height, sectionHeight, expected] of [
    [1000, 1000, 600, 0], [344, 1000, 600, 0], [184, 1000, 600, 0.5], [24, 1000, 600, 1], [-200, 1000, 600, 1],
    [194, 500, 480, 0], [99, 500, 480, 0.5], [4, 500, 480, 1],
    [124, 300, 320, 0], [44, 300, 320, 0.5], [-36, 300, 320, 1],
  ]) assert.equal(lensProgress(top, height, sectionHeight), expected);
  assert.equal(lensProgress(344, 1000), 0, 'omitting section height remains supported');
  assert.equal(lensProgress(24, 1000), 1);
});

test('taller sections delay reveal onset and completion until the section clears the viewport bottom', () => {
  assert.equal(lensProgress(194, 500, 480), 0);
  assert.ok(lensProgress(194, 500, 400) > 0);
  assert.ok(lensProgress(24, 500, 480) < 1, 'a tall section still needs to clear the bottom edge');
  assert.equal(lensProgress(24, 500, 400), 1);
  assert.equal(lensProgress(4, 500, 480), 1);
});

test('fractional native scroll rounding completes the mounted reveal within its short window', () => {
  assert.ok(lensProgress(22.1, 844, 806.95) < 1, 'more than one pixel before the endpoint is incomplete');
  assert.equal(lensProgress(22, 844, 806.95), 1, 'subpixel endpoint rounding must not leave the reveal unfinished');
  const f = fixture({top: 341.05, viewportHeight: 844, sectionHeight: 806.95});
  f.mount(); assert.equal(f.progress(), 0);
  f.intersect(true); f.move(181.05); f.win.fire('scroll'); f.flush();
  assert.ok(Math.abs(f.progress() - 0.5) < 1e-12);
  f.move(22); f.win.fire('scroll'); f.flush();
  assert.equal(f.progress(), 1); assert.equal(f.complete(), true);
  assert.ok(f.section.getBoundingClientRect().bottom <= 829, 'section fits with the 16px bottom margin plus rounding tolerance');
});

test('native scroll reverses after completion while discovered choices stay open without an idle loop', () => {
  const f = fixture(), dispose = f.mount();
  assert.equal(f.mount(), dispose);
  assert.equal(f.ready(), true); assert.equal(f.progress(), 0);
  f.win.fire('scroll'); assert.equal(f.frames.size, 0, 'offscreen section schedules no work');
  f.intersect(true); f.move(184);
  f.win.fire('scroll'); f.win.fire('scroll'); f.win.fire('resize');
  assert.equal(f.frames.size, 1); f.flush();
  assert.equal(f.progress(), 0.5); assert.equal(f.frames.size, 0);
  f.move(324); f.win.fire('scroll'); f.flush(); assert.equal(f.progress(), 0.0625);
  f.move(24); f.win.fire('scroll'); f.flush();
  assert.equal(f.progress(), 1); assert.equal(f.complete(), true);
  f.move(344); f.win.fire('scroll'); f.flush(); assert.equal(f.progress(), 0);
  assert.equal(f.complete(), true, 'six discovered choices stay visible when the image closes');
  assert.equal(f.frames.size, 0, 'completion does not start an idle loop');
  f.move(184); f.win.fire('scroll'); f.flush(); assert.equal(f.progress(), 0.5);
  assert.equal(f.complete(), true);
  assert.equal(f.frames.size, 0);
  assert.equal(f.win.handlers.get('scroll')[0].options.passive, true);
  assert.equal(f.win.handlers.has('wheel'), false); assert.equal(f.win.handlers.has('touchmove'), false);
  dispose();
});

test('full reveal remains reversible across hidden-tab and bfcache restoration', () => {
  const f = fixture(); f.mount(); f.intersect(true); f.move(24); f.flush();
  assert.equal(f.progress(), 1); assert.equal(f.complete(), true); assert.equal(f.frames.size, 0);
  f.move(344); f.win.fire('scroll'); f.flush();
  assert.equal(f.progress(), 0, 'completion must not freeze the actual image open');
  assert.equal(f.complete(), true);
  f.win.fire('scroll'); f.doc.hidden = true; f.doc.fire('visibilitychange');
  assert.equal(f.frames.size, 0);
  f.move(184); f.doc.hidden = false; f.doc.fire('visibilitychange'); f.flush();
  assert.equal(f.progress(), 0.5); assert.equal(f.complete(), true);
  f.win.fire('pagehide', {persisted: true}); f.move(24);
  f.win.fire('pageshow', {persisted: true}); f.intersect(true); f.flush();
  assert.equal(f.progress(), 1); assert.equal(f.complete(), true);
  f.move(344); f.win.fire('scroll'); f.flush();
  assert.equal(f.progress(), 0); assert.equal(f.frames.size, 0);
});

// Browser evidence at native +128/+208px showed a visible but inert action.
// The interior opacity starts above zero at p>.125; pointer readiness must
// follow that boundary in both directions, rather than waiting for OPEN.
test('visible interior action accepts pointer input throughout its fade and disables at zero opacity', () => {
  const f = fixture(); f.mount(); f.intersect(true); f.flush();
  for (const [top, interactive] of [
    [344, false], [304.032, false], [304, false], [303.968, true],
    [216, true], [136, true], [24, true],
    [136, true], [216, true], [304, false], [344, false],
  ]) {
    f.move(top); f.win.fire('scroll'); f.flush();
    assert.equal(f.section.hasAttribute('data-lens-open'), interactive,
      `pointer readiness at section top ${top}, progress ${f.progress()}`);
    assert.equal(f.frames.size, 0, 'pointer readiness adds no idle frame');
  }
  assert.equal(f.complete(), true, 'closing the action keeps discovered choices visible');
});

test('focus reveals all six native links and jump activation keeps its browser default', () => {
  const f = fixture(); f.mount();
  f.section.fire('focusin', {target: f.links[3]});
  assert.equal(f.complete(), true); assert.equal(f.progress(), 1);
  for (const [index, link] of f.links.entries()) {
    assert.equal(link.getAttribute('href'), `./area-${index}.html`);
    for (const name of ['hidden', 'inert', 'aria-hidden', 'tabindex']) assert.equal(link.hasAttribute(name), false);
  }
  const jump = fixture(); jump.mount(); let cancelled = false;
  jump.section.fire('click', {target: jump.jump, preventDefault() { cancelled = true; }});
  assert.equal(jump.complete(), true); assert.equal(cancelled, false);
  assert.equal(jump.jump.getAttribute('href'), '#cards');
});

// A hidden central anchor must open before keyboard use and cannot disappear
// while focused, even when native scroll geometry returns to CLOSED.
test('central keyboard focus holds the image open until focus leaves the action', () => {
  const f = fixture(); f.mount(); f.intersect(true); f.flush();
  assert.equal(f.progress(), 0); assert.equal(f.section.hasAttribute('data-lens-open'), false);
  f.doc.activeElement = f.jump; f.section.fire('focusin', {target: f.jump});
  assert.equal(f.progress(), 1); assert.equal(f.section.hasAttribute('data-lens-open'), true);
  f.move(344); f.win.fire('scroll'); f.flush();
  assert.equal(f.progress(), 1, 'keyboard target stays visible and clickable');
  f.doc.activeElement = f.links[0]; f.section.fire('focusout', {target: f.jump}); f.flush();
  assert.equal(f.progress(), 0); assert.equal(f.complete(), true);
  assert.equal(f.section.hasAttribute('data-lens-open'), false);
  assert.equal(f.frames.size, 0);
});

test('hidden tabs, article routes and offscreen exit cancel pending work and resume once', () => {
  const f = fixture(); f.mount(); f.intersect(true);
  assert.equal(f.frames.size, 1);
  f.doc.hidden = true; f.doc.fire('visibilitychange'); assert.equal(f.frames.size, 0);
  f.win.fire('scroll'); assert.equal(f.frames.size, 0);
  f.doc.hidden = false; f.doc.fire('visibilitychange'); assert.equal(f.frames.size, 1);
  f.doc.body.dataset.routeView = 'article'; f.win.fire('hashchange'); assert.equal(f.frames.size, 0);
  f.win.fire('scroll'); assert.equal(f.frames.size, 0);
  f.doc.body.dataset.routeView = 'home'; f.win.fire('hashchange'); assert.equal(f.frames.size, 1);
  f.intersect(false); assert.equal(f.frames.size, 0);
  f.win.fire('resize'); assert.equal(f.frames.size, 0);
});

test('persisted pagehide pauses observation and pageshow restores without duplicate mounting', () => {
  const f = fixture(), dispose = f.mount(); f.intersect(true);
  f.win.fire('pagehide', {persisted: true});
  assert.equal(f.frames.size, 0); assert.equal(f.observer.connected, false);
  f.win.fire('scroll'); assert.equal(f.frames.size, 0);
  f.win.fire('pageshow', {persisted: true}); assert.equal(f.observer.connected, true);
  f.intersect(true); f.move(184); f.flush(); assert.equal(f.progress(), 0.5);
  assert.equal(f.mount(), dispose);
  f.win.fire('pagehide', {persisted: false});
  assert.equal(f.ready(), false); assert.equal(f.frames.size, 0); assert.equal(f.observer.connected, false);
  assert.equal(f.win.count(), 0); assert.equal(f.doc.count(), 0); assert.equal(f.media.count(), 0);
});

test('cleanup restores visible native content, cancels pending frames and permits a fresh mount', () => {
  const f = fixture(), dispose = f.mount(); f.intersect(true);
  dispose(); dispose();
  assert.equal(f.ready(), false); assert.equal(f.complete(), false);
  assert.equal(f.section.hasAttribute('data-lens-open'), false);
  assert.equal(f.section.style.getPropertyValue('--lens-progress'), '');
  assert.equal(f.frames.size, 0); assert.equal(f.observer.connected, false);
  assert.equal(f.win.count() + f.doc.count() + f.media.count() + f.section.count(), 0);
  const next = f.mount(); assert.notEqual(next, dispose); next();
});

test('missing enhancement APIs and initialization errors leave the six links visible', () => {
  for (const options of [{missing: 'IntersectionObserver'}, {missing: 'matchMedia'}, {missing: 'requestAnimationFrame'}, {missing: 'cancelAnimationFrame'}, {failure: 'observe'}, {failure: 'media'}]) {
    const f = fixture(options); const dispose = f.mount();
    assert.equal(typeof dispose, 'function'); assert.equal(f.ready(), false);
    assert.equal(f.frames.size, 0);
    assert.equal((f.win.handlers.get('scroll') || []).length, 0);
    assert.equal(f.doc.count() + f.media.count() + f.section.count(), 0);
    if (f.observer) assert.equal(f.observer.connected, false);
    dispose(); assert.equal(f.win.count(), 0);
  }
});

test('reduced motion is immediately final and live changes never hide revealed actions', () => {
  const initial = fixture({reduced: true}); initial.mount();
  assert.equal(initial.ready(), false); assert.equal(initial.frames.size, 0);
  assert.equal(initial.progress(), 1); assert.equal(initial.complete(), true);
  const f = fixture(); f.mount(); f.intersect(true);
  f.media.matches = true; f.media.fire('change', {matches: true});
  assert.equal(f.ready(), false); assert.equal(f.progress(), 1); assert.equal(f.complete(), true);
  assert.equal(f.frames.size, 0);
  f.media.matches = false; f.media.fire('change', {matches: false});
  assert.equal(f.progress(), 1); assert.equal(f.complete(), true);
  f.win.fire('scroll'); assert.equal(f.frames.size, 0);
});

test('hash navigation opens only home ancestor details including content injected before load', () => {
  const f = fixture();
  const outer = new Element('DETAILS', f.home), inner = new Element('DETAILS', outer);
  const target = new Element('H2', inner); f.ids.set('supplement-library', target);
  const unrelated = new Element('DETAILS', f.home);
  f.win.location.hash = '#supplement-library'; f.mount();
  assert.equal(outer.open, true); assert.equal(inner.open, true); assert.equal(unrelated.open, false);
  const late = new Element('DETAILS', f.home); f.ids.set('evidence-guide-title', new Element('H2', late));
  f.win.location.hash = '#evidence-guide-title'; f.win.fire('load'); assert.equal(late.open, true);
  const article = new Element('DETAILS', f.doc.body); f.ids.set('article-detail', new Element('H2', article));
  f.win.location.hash = '#article-detail'; f.win.fire('hashchange'); assert.equal(article.open, false);
  f.win.location.hash = '#%E0%A4%A'; assert.doesNotThrow(() => f.win.fire('hashchange'));
});

test('mounting beyond the reveal window and direct cards hashes never leave hidden destinations', () => {
  const restored = fixture({top: -500}); restored.mount();
  assert.equal(restored.complete(), true); assert.equal(restored.progress(), 1);
  const anchor = fixture(); anchor.win.location.hash = '#cards'; anchor.mount();
  assert.equal(anchor.complete(), true); assert.equal(anchor.progress(), 1);
});
