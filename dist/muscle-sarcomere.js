// Sarcomere drawing shared by the structure explorer (resting state) and the contraction animation.
// Conceptual geometry, not a measured model: the filaments keep a fixed length; only their overlap changes.
// t = 0 is the relaxed drawing, t = 1 the most contracted drawing (Z-discs closest to the thick filaments).
const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
const lerp = (a, b, t) => a + (b - a) * t;

export const GEOMETRY = Object.freeze({
  centre: 320,
  relaxedLength: 440,   // Z-disc to Z-disc, drawing units
  contractedLength: 340,
  actinLength: 190,     // fixed
  myosinLength: 240     // fixed
});

export function sarcomereState(t) {
  const p = clamp01(t);
  const { centre, relaxedLength, contractedLength, actinLength, myosinLength } = GEOMETRY;
  const length = lerp(relaxedLength, contractedLength, p);
  const zLeft = centre - length / 2;
  const zRight = centre + length / 2;
  const myosinLeft = centre - myosinLength / 2;
  const myosinRight = centre + myosinLength / 2;
  const hZone = Math.max(0, length - 2 * actinLength);
  const iBand = Math.max(0, myosinLeft - zLeft);
  return {
    t: p, length, zLeft, zRight, myosinLeft, myosinRight,
    actinLeftTip: zLeft + actinLength, actinRightTip: zRight - actinLength,
    // Widths relative to the relaxed drawing (1 = as relaxed). The A-band never changes.
    relative: {
      sarcomere: length / relaxedLength,
      iBand: iBand / (myosinLeft - (centre - relaxedLength / 2)),
      hZone: hZone / (relaxedLength - 2 * actinLength),
      aBand: 1,
      // Share of the thick filament that the thin filaments cover (0 to 1).
      overlap: Math.max(0, Math.min(myosinLength, (zLeft + actinLength) - myosinLeft)) / myosinLength
    }
  };
}

const ACTIN = '#a895ff';
const MYOSIN = '#ff8496';
const ZDISC = '#c3d5e5';

const ACTIN_ROWS = [118, 200, 282];
const MYOSIN_ROWS = [159, 241];

export function sarcomereSVG({ t = 0, label = 'Схема саркомера: Z-диски, тонкі та товсті філаменти', idPrefix = 'sc' } = {}) {
  const s = sarcomereState(t);
  const f = n => Math.round(n * 10) / 10;
  const actin = ACTIN_ROWS.map(y => `<path d="M${f(s.zLeft)} ${y}H${f(s.actinLeftTip)}M${f(s.zRight)} ${y}H${f(s.actinRightTip)}"/>`).join('');
  const heads = [];
  for (const y of MYOSIN_ROWS) {
    for (let i = 0; i < 4; i++) {
      const dx = 16 + i * 26;
      const lean = (i % 2 ? 1 : -1) * 36;
      heads.push(`M${f(s.myosinLeft + dx)} ${y}l11 ${lean}`);
      heads.push(`M${f(s.myosinRight - dx)} ${y}l-11 ${lean}`);
    }
  }
  const myosin = MYOSIN_ROWS.map(y => `<path d="M${f(s.myosinLeft)} ${y}H${f(s.myosinRight)}"/>`).join('');
  return `<svg class="sarcomere-svg" viewBox="0 0 640 400" role="img" aria-label="${label}" data-sarcomere-t="${f(s.t)}">
<defs><linearGradient id="${idPrefix}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2230"/><stop offset="1" stop-color="#071723"/></linearGradient></defs>
<rect width="640" height="400" rx="18" fill="url(#${idPrefix}-bg)"/>
<rect class="sc-aband" x="${f(s.myosinLeft)}" y="64" width="${f(s.myosinRight - s.myosinLeft)}" height="272" rx="10" fill="${MYOSIN}" fill-opacity=".07"/>
<g class="sc-zdisc" stroke="${ZDISC}" stroke-width="9" stroke-linecap="round"><path d="M${f(s.zLeft)} 84V316M${f(s.zRight)} 84V316"/></g>
<g class="sc-actin" stroke="${ACTIN}" stroke-width="11" stroke-linecap="round" fill="none">${actin}</g>
<g class="sc-myosin" stroke="${MYOSIN}" stroke-width="15" stroke-linecap="round" fill="none">${myosin}</g>
<g class="sc-heads" stroke="${MYOSIN}" stroke-width="6" stroke-linecap="round" fill="none"><path d="${heads.join("")}"/></g>
<path class="sc-mline" d="M320 70V330" stroke="#7a95a8" stroke-width="2" stroke-dasharray="5 6"/>
</svg>`;
}
