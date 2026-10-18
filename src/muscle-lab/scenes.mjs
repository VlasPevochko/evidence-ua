// Conceptual SVG scenes. No elapsed-time, concentration or effect-size model.
// Each scene is drawn once; the step is a data attribute and CSS moves the parts, so steps animate smoothly.
// Text inside the drawings is limited to the symbols Ca²⁺ and ATP; everything else is explained in HTML.
const steps = [-1, 0, 1, 2, 3];

function frame(kind, step, label, inner) {
  return `<svg class="scene-svg scene-${kind}" data-scene="${kind}" data-step="${step}" viewBox="0 0 640 400" role="img" aria-label="${label}">
<defs><linearGradient id="sc-${kind}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2230"/><stop offset="1" stop-color="#071723"/></linearGradient>
<radialGradient id="sc-${kind}-fibre" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f08a92"/><stop offset="1" stop-color="#8e2f3d"/></radialGradient></defs>
<rect width="640" height="400" rx="18" fill="url(#sc-${kind}-bg)"/>
${inner}
</svg>`;
}

// One myosin head working on a thin filament. The actin line is the moving part; its tick marks make the sliding visible.
function contraction(step) {
  const ticks = Array.from({ length: 17 }, (_, i) => `<circle cx="${60 + i * 36}" cy="122" r="4" fill="#efeaff" fill-opacity=".75"/>`).join('');
  return frame('contraction', step, 'Схема одного циклу: головка міозину взаємодіє з актином і зміщує його', `
<path class="cy-ref" d="M300 70V350" stroke="#7a95a8" stroke-width="2" stroke-dasharray="5 6"/>
<g class="cy-actin">
  <path d="M30 122H610" stroke="#a895ff" stroke-width="22" stroke-linecap="round"/>
  ${ticks}
  <ellipse class="cy-troponin" cx="190" cy="122" rx="20" ry="15" fill="#58c4dd" stroke="#dff7ff" stroke-width="2"/>
  <path class="cy-tropomyosin" d="M30 134Q200 130 340 134T610 134" fill="none" stroke="#f1e6bd" stroke-width="6" stroke-linecap="round"/>
  <circle class="cy-site" cx="340" cy="135" r="12" fill="none" stroke="#ffd77e" stroke-width="4"/>
  <g class="cy-calcium" fill="#7be0ff"><circle cx="160" cy="84" r="9"/><circle cx="200" cy="72" r="9"/><circle cx="228" cy="92" r="9"/><text x="248" y="74" fill="#bff0ff" font-size="22" font-weight="700">Ca²⁺</text></g>
</g>
<rect x="18" y="330" width="604" height="34" rx="17" fill="#ff8496" fill-opacity=".85" stroke="#ffd3d9" stroke-width="2"/>
<g class="cy-head" style="transform-origin:300px 330px">
  <path d="M300 330V150" stroke="#ff8496" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="300" cy="140" rx="22" ry="30" fill="#ff8496" stroke="#ffd3d9" stroke-width="2.5"/>
  <g class="cy-atp"><circle cx="268" cy="200" r="21" fill="#ffd77e" stroke="#fff1c4" stroke-width="2"/><text x="268" y="207" text-anchor="middle" font-size="18" font-weight="800" fill="#4a3300">ATP</text></g>
  <circle class="cy-adp" cx="330" cy="205" r="9" fill="#c9b27a"/>
</g>`);
}

// Mirrored scenes for growth and atrophy: the same fibre, the same balance beam, opposite direction.
function adaptation(kind, step) {
  const growth = kind === 'growth';
  const colour = growth ? '#83e9b9' : '#f49bbc';
  const dots = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const r = i % 2 ? 34 : 52;
    return `<circle class="ad-dot" cx="${(320 + Math.cos(angle) * r).toFixed(1)}" cy="${(150 + Math.sin(angle) * r).toFixed(1)}" r="8" fill="#ffc0c6"/>`;
  }).join('');
  const extra = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + 0.3;
    return `<circle class="ad-extra" cx="${(320 + Math.cos(angle) * 78).toFixed(1)}" cy="${(150 + Math.sin(angle) * 78).toFixed(1)}" r="8" fill="#ffc0c6"/>`;
  }).join('');
  const arrows = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => {
    const sx = 320 + x * 138, sy = 150 + y * 100;
    return `<path d="M${sx} ${sy}L${320 + x * 108} ${150 + y * 76}" stroke="${colour}" stroke-width="7" stroke-linecap="round"/>`;
  }).join('');
  const label = growth
    ? 'Схема росту: навантаження, сигнальні процеси, перевага синтезу білків, збільшення волокна'
    : 'Схема атрофії: контекст, зміщення балансу до розпаду білків, втрата білка, зменшення волокна';
  return frame(kind, step, label, `
<g class="ad-load" opacity="0">${growth ? arrows : ''}</g>
<g class="ad-fibre" style="transform-origin:320px 150px">
  <circle class="ad-ring" cx="320" cy="150" r="92" fill="url(#sc-${kind}-fibre)" stroke="${colour}" stroke-width="5"/>
  ${dots}${extra}
</g>
<g class="ad-signal" opacity="0"><circle cx="320" cy="150" r="108" fill="none" stroke="${colour}" stroke-width="3" stroke-dasharray="4 8"/></g>
<g class="ad-beam" style="transform-origin:320px 300px">
  <path d="M170 300H470" stroke="#d3e0eb" stroke-width="7" stroke-linecap="round"/>
  <path d="M170 300L146 344H194ZM470 300L446 344H494Z" fill="none" stroke="#638397" stroke-width="3"/>
  <circle class="ad-pan-left" cx="170" cy="335" r="10" fill="#82e5b8"/>
  <circle class="ad-pan-right" cx="470" cy="335" r="10" fill="#f49bbc"/>
</g>
<path d="M320 300V372M280 372H360" stroke="#a3b5c3" stroke-width="6" stroke-linecap="round"/>`);
}

export function sceneFrame(id, step = -1) {
  if (!['contraction', 'growth', 'atrophy'].includes(id)) throw Error('Unknown scene: ' + id);
  if (!Number.isInteger(step) || !steps.includes(step)) throw Error('Invalid storyboard step');
  return id === 'contraction' ? contraction(step) : adaptation(id, step);
}
