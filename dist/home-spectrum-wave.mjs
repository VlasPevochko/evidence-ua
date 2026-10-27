// Authored decorative overlay. The underlying ribbon image remains useful when
// Canvas is unavailable; this module owns no page scroll or navigation behavior.
const mounted = new WeakMap();
const noop = () => {};
const FRAME_MS = 1000 / 30;
const SETTLE_EPSILON = 0.0003;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 480;
const MAX_DPR = 1.5;
const TAU = Math.PI * 2;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function mountSpectrumWave(root = globalThis.document) {
  const canvas = root?.querySelector?.('#spectrum-wave');
  const holder = canvas?.closest?.('.spectrum-home');
  const doc = canvas?.ownerDocument;
  const win = doc?.defaultView;
  if (!canvas || !holder || !win) return noop;
  if (mounted.has(canvas)) return mounted.get(canvas);

  let context;
  try { context = canvas.getContext('2d'); } catch { return noop; }
  if (!context) return noop;

  const media = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const requestFrame = win.requestAnimationFrame?.bind(win);
  const cancelFrame = win.cancelAnimationFrame?.bind(win);
  const removers = [];
  let reduced = Boolean(media?.matches);
  let destroyed = false;
  let pageSuspended = false;
  let intersecting = false;
  let observer;
  let frame = null;
  let progress = 0;
  let target = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dirty = true;
  let lastUpdate = null;
  let lastPaint = -Infinity;
  let paintCount = 0;

  const clock = () => win.performance?.now?.() || 0;
  const mayPaint = () => !destroyed && !pageSuspended && !doc.hidden && intersecting && width > 0 && height > 0;
  const readProgress = () => {
    const scroll = Number(win.scrollY);
    return clamp((Number.isFinite(scroll) ? scroll : 0) / Math.max(480, win.innerHeight || 900), 0, 1);
  };

  function viewportIntersection() {
    const rect = canvas.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < (win.innerHeight || 900);
  }

  function measure() {
    const rect = canvas.getBoundingClientRect();
    width = Number.isFinite(rect.width) ? clamp(rect.width, 0, MAX_WIDTH) : 0;
    height = Number.isFinite(rect.height) ? clamp(rect.height, 0, MAX_HEIGHT) : 0;
    dpr = clamp(Number(win.devicePixelRatio) || 1, 1, MAX_DPR);
    if (width && height) {
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    }
    dirty = true;
  }

  function draw(time = clock()) {
    if (!mayPaint()) return;
    const phase = progress * TAU;
    const samples = width < 600 ? 72 : 112;
    const ink = context.createLinearGradient(0, 0, width, 0);
    ink.addColorStop(0, 'rgba(121, 158, 255, 0.12)');
    ink.addColorStop(0.24, 'rgba(125, 224, 255, 0.68)');
    ink.addColorStop(0.53, 'rgba(202, 150, 255, 0.8)');
    ink.addColorStop(0.8, 'rgba(255, 151, 226, 0.72)');
    ink.addColorStop(1, 'rgba(162, 142, 255, 0.12)');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'screen';
    context.strokeStyle = ink;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Scroll advances different spatial frequencies at different rates, so the
    // filaments really flow through one another rather than moving a flat image.
    // Eight short paths, without blur, particles or a page-sized pixel buffer.
    for (let strand = 0; strand < 8; strand++) {
      const offset = strand - 3.5;
      context.beginPath();
      for (let sample = 0; sample <= samples; sample++) {
        const x = sample / samples;
        const envelope = 0.35 + Math.sin(Math.PI * x) * 0.65;
        const spine = Math.sin(x * TAU * 1.2 + phase * 0.63) * 0.055
          + Math.sin(x * TAU * 2.7 - phase * 0.42) * 0.014;
        const filament = Math.sin(x * TAU * (3.1 + strand * 0.08) - phase + strand * 0.48) * 0.021
          + Math.cos(x * TAU * 5.2 + phase * 0.72 + strand * 0.3) * 0.008;
        const y = height * (0.5 + spine + (filament + offset * 0.009) * envelope);
        if (sample === 0) context.moveTo(0, y);
        else context.lineTo(x * width, y);
      }
      context.globalAlpha = strand === 3 || strand === 4 ? 0.8 : 0.28;
      context.lineWidth = strand === 3 || strand === 4 ? 1.2 : 0.7;
      context.stroke();
    }
    context.globalAlpha = 1;
    canvas.dataset.wavePhase = phase.toFixed(5);
    canvas.dataset.waveProgress = progress.toFixed(5);
    canvas.dataset.waveFrame = String(++paintCount);
    dirty = false;
    lastPaint = time;
  }

  function stop() {
    if (frame !== null) cancelFrame?.(frame);
    frame = null;
    lastUpdate = null;
  }

  function queue() {
    if (frame !== null || reduced || !requestFrame || !mayPaint()) return;
    if (Math.abs(target - progress) <= SETTLE_EPSILON && !dirty) return;
    frame = requestFrame(advance);
  }

  function advance(time) {
    frame = null;
    if (!mayPaint() || reduced) { lastUpdate = null; return; }
    const elapsed = lastUpdate === null ? FRAME_MS : clamp(time - lastUpdate, 0, 100);
    lastUpdate = time;
    progress += (target - progress) * (1 - Math.exp(-elapsed / 115));
    const settled = Math.abs(target - progress) <= SETTLE_EPSILON;
    if (settled) progress = target;
    if (time - lastPaint >= FRAME_MS - 0.01 || settled) draw(time);
    if (settled) lastUpdate = null;
    else queue();
  }

  function resume() {
    if (!mayPaint()) { stop(); return; }
    if (reduced) {
      progress = target = 0;
      if (dirty) draw();
      return;
    }
    target = readProgress();
    if (dirty) draw();
    queue();
  }

  function onScroll() {
    if (destroyed || reduced) return;
    target = readProgress();
    if (!observer) intersecting = viewportIntersection();
    if (!mayPaint()) stop();
    else queue();
  }

  function onResize() {
    stop();
    measure();
    // A viewport rect cannot detect clipping ancestors. Preserve a negative
    // observer result until that observer confirms the canvas is visible again.
    intersecting = observer ? intersecting && viewportIntersection() : viewportIntersection();
    resume();
  }

  function onMotionChange() {
    reduced = Boolean(media.matches);
    stop();
    dirty = true;
    if (reduced) progress = target = 0;
    resume();
  }

  function listen(targetElement, type, listener, options) {
    targetElement.addEventListener(type, listener, options);
    removers.push(() => targetElement.removeEventListener(type, listener, options));
  }

  measure();
  intersecting = viewportIntersection();
  target = reduced ? 0 : readProgress();
  // A restored page starts from its actual position without an entrance loop.
  progress = target;
  draw();

  if (win.IntersectionObserver) {
    observer = new win.IntersectionObserver(entries => {
      if (destroyed) return;
      const entry = entries.find(item => item.target === canvas);
      if (!entry) return;
      intersecting = entry.isIntersecting;
      resume();
    }, {threshold: 0});
    observer.observe(canvas);
  }
  listen(win, 'scroll', onScroll, {passive: true});
  listen(win, 'resize', onResize, {passive: true});
  listen(doc, 'visibilitychange', resume);
  listen(win, 'pagehide', () => { pageSuspended = true; stop(); });
  listen(win, 'pageshow', () => { pageSuspended = false; resume(); });
  if (media?.addEventListener) listen(media, 'change', onMotionChange);
  else if (media?.addListener) {
    media.addListener(onMotionChange);
    removers.push(() => media.removeListener(onMotionChange));
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    observer?.disconnect();
    removers.forEach(remove => remove());
    mounted.delete(canvas);
  }
  mounted.set(canvas, destroy);
  return destroy;
}
