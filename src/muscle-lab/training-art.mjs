// Four own drawings for the «силові» chapters of «Від нерва до росту» (2026-11-15, owner: «1-4 виконуємо»).
// None of them contains <text> (labels are HTML next to them) and none states a number or a new finding:
//  - recruitArt:  chapter 3, «Сила ≠ маса»: motor units switch on from «light» to «heavy» (the chapter already says so) and fire more often.
//  - curvesArt:   chapter 3: strength rises before size in the first weeks (the chapter already says so). No axis values.
//  - loadTypesArt: chapter 4 fold: lifting / lowering / holding as filament overlap. The sentence about damage repeats chapter 4.
//  - growthArt:   chapter 4: the six steps of `growthFlow` as one picture; the cards below it stay as the legend.
// Every drawing is schematic: proportions, order of events and curve shapes are simplified.

export const RECRUIT_UNITS = 8;
export const GROWTH_STEPS = 6;

const f = n => Number(n.toFixed(1));

export function recruitArt() {
  const units = Array.from({length: RECRUIT_UNITS}, (_, i) => {
    const x = 28 + i * 43.5, r = 6 + i * 1.3, h = 8 + i * 3.2;
    return `<g class="rc-unit rc-u${i}"><circle class="rc-cell" cx="${f(x)}" cy="30" r="${f(r)}"/><path class="rc-axon" d="M${f(x)} ${f(30 + r)}V${f(56)}" fill="none"/><rect class="rc-fibre" x="${f(x - 9)}" y="${f(60)}" width="18" height="${f(h)}" rx="4"/></g>`;
  }).join('');
  return `<svg class="mg-recruit-art" viewBox="0 0 360 126" aria-hidden="true" focusable="false">${units}<line class="rc-train" x1="14" y1="112" x2="346" y2="112" pathLength="100"/></svg>`;
}

export function curvesArt() {
  return `<svg class="mg-curves-art" viewBox="0 0 360 130" aria-hidden="true" focusable="false">
<path class="cv-axis" d="M16 112H344M16 112V14" fill="none"/>
<path class="cv-size" d="M16 110C120 108 200 88 344 40" fill="none" pathLength="1"/>
<path class="cv-force" d="M16 110C64 46 108 34 344 22" fill="none" pathLength="1"/>
</svg>`;
}

// Three little sarcomeres. Start state = long enough to move both ways; CSS moves the Z-discs once when the fold opens.
// Direction cue above the Z-discs: lifting = discs approach, lowering = discs move apart, holding = «=».
const dir = (kind, zl, zr, mid) => {
  const arrow = (x, d) => `M${f(x - 7 * d)} 10H${f(x + 7 * d)}M${f(x + 3 * d)} 6L${f(x + 7 * d)} 10L${f(x + 3 * d)} 14`;
  if (kind === 'lift') return arrow(zl, 1) + arrow(zr, -1);
  if (kind === 'lower') return arrow(zl, -1) + arrow(zr, 1);
  return `M${f(mid - 8)} 7H${f(mid + 8)}M${f(mid - 8)} 13H${f(mid + 8)}`;
};

export function loadTypesArt() {
  const panel = (i, kind) => {
    const x0 = 8 + i * 118;
    // z = [left Z, right Z] at the start of the move; the CSS translate gives the end state.
    const zl = x0 + 14, zr = x0 + 94, mid = (zl + zr) / 2;
    return `<g class="lt-panel lt-${kind}">
<g class="lt-l"><line class="lt-z" x1="${zl}" y1="22" x2="${zl}" y2="76"/><line class="lt-actin" x1="${zl}" y1="36" x2="${f(mid - 6)}" y2="36"/><line class="lt-actin" x1="${zl}" y1="62" x2="${f(mid - 6)}" y2="62"/></g>
<g class="lt-r"><line class="lt-z" x1="${zr}" y1="22" x2="${zr}" y2="76"/><line class="lt-actin" x1="${zr}" y1="36" x2="${f(mid + 6)}" y2="36"/><line class="lt-actin" x1="${zr}" y1="62" x2="${f(mid + 6)}" y2="62"/></g>
<line class="lt-myosin" x1="${f(mid - 24)}" y1="49" x2="${f(mid + 24)}" y2="49"/>
<path class="lt-dir" d="${dir(kind, zl, zr, mid)}" fill="none"/>
<path class="lt-load" d="M${f(mid)} 88V108M${f(mid - 6)} 102L${f(mid)} 108L${f(mid + 6)} 102" fill="none"/>
</g>`;
  };
  return `<svg class="mg-loadtypes-art" viewBox="0 0 360 116" aria-hidden="true" focusable="false">${panel(0, 'lift')}${panel(1, 'lower')}${panel(2, 'hold')}</svg>`;
}

// One fibre, six steps: load → sensors → mTORC1 → S6K1/4E-BP1 → ribosomes → bigger fibre. Part N has class gr-pN and --i:N.
export function growthArt() {
  const sensors = [96, 138, 180, 222, 264].map(x => `<path class="gr-p gr-p1" style="--i:1" d="M${x} 36l5 5-5 5-5-5z"/><path class="gr-p gr-p1" style="--i:1" d="M${x} 94l5 5-5 5-5-5z"/>`).join('');
  const ribosomes = [[110, 62], [128, 80], [150, 58], [244, 76], [262, 60], [282, 78], [200, 84], [226, 56]].map(([x, y]) => `<circle class="gr-p gr-p4" style="--i:4" cx="${x}" cy="${y}" r="3.2"/>`).join('');
  return `<svg class="mg-growth-art" viewBox="0 0 360 140" aria-hidden="true" focusable="false">
<rect class="gr-p gr-p5" style="--i:5" x="46" y="22" width="268" height="96" rx="30" fill="none"/>
<rect class="gr-fibre" x="58" y="30" width="244" height="80" rx="26"/>
<g class="gr-p gr-p0" style="--i:0"><path d="M54 70H14M26 62L14 70L26 78M306 70H346M334 62L346 70L334 78" fill="none"/></g>
${sensors}
<ellipse class="gr-p gr-p2" style="--i:2" cx="180" cy="70" rx="26" ry="15"/>
<g class="gr-p gr-p3" style="--i:3" fill="none"><path d="M158 68C146 66 140 62 134 58M202 68C214 66 222 64 234 62"/></g>
${ribosomes}
</svg>`;
}
