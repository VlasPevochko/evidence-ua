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

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, cols = 0, rows = 0, pts = [], visible = true, raf = 0;
  var t0 = performance.now();

  function cell() { return W < 700 ? 72 : 110; }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    if (!W || !H) return;
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

  function tri(a, b, c, t, k) {
    var cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    var n = 0.5 + 0.5 * Math.sin(cx * 0.0042 + cy * 0.0031 + t * 0.35 + k * 1.7);
    var glow = Math.max(0, Math.sin(cx * 0.002 - cy * 0.0027 + t * 0.22 + k * 0.9) - 0.88) * 8;
    var side = Math.min(1, cx / W);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath();
    ctx.fillStyle = 'hsl(' + (196 + n * 12) + ' ' + (48 + side * 10) + '% ' + (10 + n * 16 + side * 10) + '%)';
    ctx.fill();
    if (glow > 0.05) {
      ctx.fillStyle = 'rgba(255,211,103,' + Math.min(0.55, glow * 0.6) + ')';
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(105,217,245,' + (0.07 + n * 0.1) + ')';
    ctx.lineWidth = 1; ctx.stroke();
  }

  function frame(now) {
    raf = 0;
    if (!W || !H || !pts.length) return;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    for (var r = 0; r < rows - 1; r++) for (var c = 0; c < cols - 1; c++) {
      var a = P(r, c, t), b = P(r, c + 1, t), d = P(r + 1, c, t), e = P(r + 1, c + 1, t), k = r * 31 + c;
      if (r % 2) { tri(a, b, e, t, k); tri(a, e, d, t, k + 1); }
      else { tri(a, b, d, t, k); tri(b, e, d, t, k + 1); }
    }
    if (visible && !reduce) raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  resize(); start();
  window.addEventListener('resize', function () { resize(); start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(cv);
  }
})();
