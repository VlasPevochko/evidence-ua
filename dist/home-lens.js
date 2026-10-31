import {mountHomePicker} from './home-picker.js?v=2';

// Native links remain the baseline. This controller only advances decorative
// reversible scroll progress and opens home disclosures for fragment navigation.
const mounts = new WeakMap();
const noop = () => {};

export function lensProgress(top, viewportHeight, targetHeight = 0) {
  const distance = Math.min(320, Math.max(160, 0.38 * viewportHeight));
  const end = Math.min(24, viewportHeight - targetHeight - 16);
  const start = end + distance;
  // Native scrolling can round the final fractional CSS pixel.
  if (top <= end + 1) return 1;
  return Math.min(1, Math.max(0, (start - top) / distance));
}

export function mountHomeLens(doc = globalThis.document) {
  const view = doc?.defaultView;
  if (!view || doc.body?.dataset.platformArea !== 'home') return noop;
  if (mounts.has(doc)) return mounts.get(doc);
  const section = doc.querySelector('[data-home-lens]');
  if (!section) return noop;
  // Catalogue height includes choices below the artwork. Using it would reveal
  // the central action only after it left a short landscape viewport.
  const stage = section.querySelector('[data-lens-stage]') || section;
  const links = [...(section.querySelector('#cards')?.querySelectorAll('a.topic-card[data-area]') || [])];

  const cleanups = [];
  cleanups.push(mountHomePicker(doc,section));
  let observer;
  let frame = null;
  let disposed = false;
  let suspended = false;
  let near = false;
  let progress = 0;
  let reduced = false;

  const homeActive = () => !disposed && !suspended && !doc.hidden
    && doc.body.dataset.routeView !== 'article'
    && section.isConnected !== false && !section.closest('[hidden]')
    && section.getClientRects().length > 0;

  function listen(target, type, callback, options) {
    cleanups.push(() => target.removeEventListener(type, callback, options));
    target.addEventListener(type, callback, options);
  }

  function stop() {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null;
  }

  function paint(value) {
    const action = section.querySelector('[data-lens-reveal]');
    progress = action?.contains(doc.activeElement) ? 1 : value;
    section.style.setProperty('--lens-progress', String(progress));
    // Match the CSS interior fade: clamp(0, progress * 2 - .25, 1).
    // Any visible action must accept a pointer; zero opacity stays inactive.
    if (progress > 0.125) section.setAttribute('data-lens-open', '');
    else section.removeAttribute('data-lens-open');
    if (progress === 1) section.setAttribute('data-lens-complete', '');
    const complete = section.hasAttribute('data-lens-complete');
    // Match each card's CSS fade without removing it from keyboard navigation.
    links.forEach((link, index) => {
      if (!complete && progress * 2 <= index * .075) link.setAttribute('data-lens-hidden', '');
      else link.removeAttribute('data-lens-hidden');
    });
  }

  function reveal() { paint(1); }

  function update() {
    frame = null;
    if (!near || reduced || !homeActive()) return;
    try {
      const rect = stage.getBoundingClientRect();
      paint(lensProgress(rect.top, view.innerHeight, rect.height));
    }
    catch { dispose(); }
  }

  function schedule() {
    if (!near || reduced || !homeActive()) { stop(); return; }
    if (frame === null) frame = view.requestAnimationFrame(update);
  }

  function openHash() {
    let id;
    try { id = decodeURIComponent(view.location.hash.slice(1)); }
    catch { return; }
    if (!id) return;
    const target = doc.getElementById(id);
    // Home and article content share the body platform marker. Only the main
    // home .page containing this lens owns these native disclosures.
    if (!target || !section.closest('.page')?.contains(target)) return;
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    if (id === 'cards' || section.querySelector('#cards')?.contains(target)) reveal();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    observer?.disconnect();
    for (const cleanup of cleanups.splice(0).reverse()) cleanup();
    section.removeAttribute('data-lens-ready');
    section.removeAttribute('data-lens-complete');
    section.removeAttribute('data-lens-open');
    for (const link of links) link.removeAttribute('data-lens-hidden');
    section.style.removeProperty('--lens-progress');
    mounts.delete(doc);
  }

  mounts.set(doc, dispose);
  try {
    openHash();
    // These stay useful even when motion enhancement is unavailable.
    listen(view, 'hashchange', () => { openHash(); schedule(); });
    listen(view, 'load', openHash, {once: true});
    listen(view, 'pagehide', event => {
      if (!event.persisted) { dispose(); return; }
      suspended = true; near = false; stop(); observer?.disconnect();
    });
    listen(view, 'pageshow', () => {
      suspended = false;
      if (observer) observer.observe(section);
      openHash(); schedule();
    });

    if (typeof view.IntersectionObserver !== 'function'
      || typeof view.matchMedia !== 'function'
      || typeof view.requestAnimationFrame !== 'function'
      || typeof view.cancelAnimationFrame !== 'function') return dispose;

    const media = view.matchMedia('(prefers-reduced-motion: reduce)');
    if (!media || typeof media.addEventListener !== 'function') return dispose;
    reduced = media.matches;
    if (reduced) { reveal(); return dispose; }

    listen(media, 'change', event => {
      if (event.matches) {
        reduced = true;
        stop();
        // A preference change permanently completes this mount, so returning
        // to motion later cannot hide links the visitor has already seen.
        reveal(); section.removeAttribute('data-lens-ready');
      }
    });
    listen(section, 'focusin', event => {
      if (event.target.closest?.('[data-lens-reveal]')) reveal();
      const link = event.target.closest?.('a.topic-card[data-area]');
      if (link && section.querySelector('#cards')?.contains(link)) reveal();
    });
    listen(section, 'focusout', schedule);
    listen(section, 'click', event => {
      if (event.target.closest?.('[data-lens-reveal]')) reveal();
    });
    listen(view, 'scroll', schedule, {passive: true});
    listen(view, 'resize', schedule, {passive: true});
    listen(doc, 'visibilitychange', schedule);

    observer = new view.IntersectionObserver(entries => {
      if (disposed || suspended) return;
      for (const entry of entries) if (entry.target === section) near = entry.isIntersecting;
      schedule();
    }, {rootMargin: '240px 0px'});
    observer.observe(section);
    if (homeActive()) {
      const rect = stage.getBoundingClientRect();
      paint(lensProgress(rect.top, view.innerHeight, rect.height));
    }
    // Apply the hiding styles only after every enhancement dependency is ready.
    section.setAttribute('data-lens-ready', '');
    openHash();
  } catch {
    // Fail open even when an API exists but throws during setup.
    dispose();
  }
  return dispose;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'complete') mountHomeLens(document);
  else document.defaultView?.addEventListener('load', () => mountHomeLens(document), {once: true});
}
