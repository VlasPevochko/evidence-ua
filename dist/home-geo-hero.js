/* Геометричний hero-фон: трикутна сітка, вершини повільно дрейфують,
   грані мерехтять відтінками палітри сайту, зрідка спалахують золотом.
   Працює лише на головній; паузиться поза екраном; при prefers-reduced-motion
   малює один статичний кадр. */
(function () {
  var page = document.querySelector('body[data-platform-area="home"] .page');
  if (!page || page.querySelector('.home-geo-hero')) return;
  var cv = document.createElement('canvas');
  cv.className = 'home-geo-hero';
  cv.setAttribute('aria-hidden', 'true');
  page.insertBefore(cv, page.firstChild);
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var desktopQuery = matchMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)');
  var reduce = motionQuery.matches;
  var W = 0, H = 0, cols = 0, rows = 0, pts = [], visible = true, raf = 0;
  var pattern = 0, targetPattern = 0, patternLeft = 0;
  var t0 = performance.now();

  function cell() { return W < 700 ? 72 : 110; }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
    // Keep the light outside the actual text column, including enlarged text.
    var heading = page.querySelector('.hero h1');
    var description = page.querySelector('.hero .desc');
    var copyRight = 0;
    if (heading) {
      // The .copy box is wider than its text. Measure the glyph range so the
      // unused right side remains available for the kaleidoscope.
      var range = document.createRange();
      range.selectNodeContents(heading);
      copyRight = Math.max(range.getBoundingClientRect().right, description ? description.getBoundingClientRect().right : 0) - cv.getBoundingClientRect().left + 36;
    }
    patternLeft = Math.max(W * 0.52, copyRight);
    updateScroll();
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var c = cell();
    cols = Math.ceil(W / c) + 2; rows = Math.ceil(H / (c * 0.866)) + 2;
    pts = [];
    for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
      pts.push({
        bx: (q - 1 + (r % 2) * 0.5) * c, by: (r - 1) * c * 0.866,
        ph: Math.random() * 6.283, sp: 0.25 + Math.random() * 0.35, am: c * (0.1 + Math.random() * 0.2)
      });
    }
  }

  function P(r, c, t) {
    var p = pts[r * cols + c];
    return [p.bx + Math.cos(t * p.sp + p.ph) * p.am, p.by + Math.sin(t * p.sp * 1.3 + p.ph) * p.am];
  }

  function smooth(a, b, x) {
    var v = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return v * v * (3 - 2 * v);
  }

  function kaleidoscope(x, y) {
    if (!desktopQuery.matches || reduce || W < 1100 || W - patternLeft < 240) return 0;
    var radius = Math.min((W - patternLeft) * 0.53, H * 0.34);
    var dx = (x - (patternLeft + (W - patternLeft) * 0.5)) / radius;
    var dy = (y - H * 0.45) / radius;
    var r = Math.hypot(dx, dy);
    var angle = Math.atan2(dy, dx) - pattern * 1.7;
    // Six mirrored lobes and nested rings, sampled on the existing mesh.
    // Scroll turns the symmetry and folds the rings into a new arrangement.
    var petal = 0.55 + 0.17 * Math.cos(angle * 6 + pattern * 2.4);
    var ring = Math.exp(-Math.pow((r - petal) / 0.13, 2));
    var inner = Math.exp(-Math.pow((r - 0.25 - 0.05 * Math.cos(angle * 6)) / 0.1, 2));
    var edge = smooth(patternLeft, patternLeft + 65, x) * (1 - smooth(0.86, 1.15, r));
    return Math.min(1, ring + inner * 0.6) * edge;
  }

  function tri(a, b, c, t, k) {
    var cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    var n = 0.5 + 0.5 * Math.sin(cx * 0.0042 + cy * 0.0031 + t * 0.35 + k * 1.7);
    var glow = Math.max(0, Math.sin(cx * 0.002 - cy * 0.0027 + t * 0.22 + k * 0.9) - 0.88) * 8;
    var side = Math.min(1, cx / W);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath();
    ctx.fillStyle = 'hsl(' + (158 + n * 14) + ' ' + (34 + side * 8) + '% ' + (7 + n * 11 + side * 7) + '%)';
    ctx.fill();
    if (glow > 0.05) {
      ctx.fillStyle = 'rgba(227,189,107,' + Math.min(0.55, glow * 0.6) + ')';
      ctx.fill();
    }
    var light = kaleidoscope(cx, cy);
    if (light > 0.025) {
      ctx.fillStyle = 'rgba(227,189,107,' + (light * 0.64) + ')';
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(157,205,185,' + (0.06 + n * 0.08) + ')';
    ctx.lineWidth = 1; ctx.stroke();
  }

  function frame(now) {
    raf = 0;
    if (!W || !H || !pts.length) return;
    var t = (now - t0) / 1000;
    pattern += (targetPattern - pattern) * 0.09;
    ctx.clearRect(0, 0, W, H);
    for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
      var a = P(r, c, t), b = P(r, c + 1, t), d = P(r + 1, c, t), e = P(r + 1, c + 1, t), k = r * 31 + c;
      if (r % 2) { tri(a, b, e, t, k); tri(a, e, d, t, k + 1); }
      else { tri(a, b, d, t, k); tri(b, e, d, t, k + 1); }
    }
    if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function updateScroll() {
    targetPattern = desktopQuery.matches && !reduce ? Math.max(0, Math.min(1, (window.scrollY || 0) / Math.max(H * 0.65, 1))) : 0;
  }

  resize(); start();
  // Observe normal page scrolling. Never consume wheel/touch events.
  window.addEventListener('scroll', updateScroll, {passive: true});
  window.addEventListener('resize', function () { resize(); start(); });
  motionQuery.addEventListener('change', function () {
    reduce = motionQuery.matches; updateScroll(); stop(); start();
  });
  desktopQuery.addEventListener('change', function () { updateScroll(); start(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); }).observe(cv);
  }
})();
