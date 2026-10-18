// Own schematic drawings for the six structural scales of Muscle Lab.
// Drawings carry no text: labels live in an HTML legend so they stay readable on a phone.
// Everything is schematic: shapes and proportions are simplified and not to scale.
import { sarcomereSVG } from './sarcomere.mjs';

const tone = {
  muscle: '#d9626f', muscleLight: '#f08a92', muscleDark: '#8e2f3d',
  tissue: '#ead7b5', nucleus: '#6fa9ff', zdisc: '#c3d5e5',
  actin: '#a895ff', myosin: '#ff8496', troponin: '#58c4dd', zoom: '#ffd77e'
};

const frame = (inner, label, defs = '') =>
  `<svg class="scale-svg" viewBox="0 0 640 400" role="img" aria-label="${label}">
<defs>
<linearGradient id="sa-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d2230"/><stop offset="1" stop-color="#071723"/></linearGradient>
<linearGradient id="sa-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone.muscleLight}"/><stop offset=".55" stop-color="${tone.muscle}"/><stop offset="1" stop-color="${tone.muscleDark}"/></linearGradient>
<linearGradient id="sa-tissue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e8cc"/><stop offset="1" stop-color="#bfa57c"/></linearGradient>
${defs}
</defs>
<rect width="640" height="400" rx="18" fill="url(#sa-bg)"/>
${inner}
</svg>`;

const zoomRing = (cx, cy, r) =>
  `<circle class="zoom-ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${tone.zoom}" stroke-width="3" stroke-dasharray="7 6"/>`;
const zoomBox = (x, y, w, h) =>
  `<rect class="zoom-ring" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${tone.zoom}" stroke-width="3" stroke-dasharray="7 6"/>`;

function muscle() {
  const belly = 'M120 200C170 100 270 95 320 95C370 95 470 100 520 200C470 300 370 305 320 305C270 305 170 300 120 200Z';
  const strands = [-0.8, -0.5, -0.25, 0, 0.25, 0.5, 0.8]
    .map(k => `<path d="M124 200C220 ${200 + k * 150} 420 ${200 + k * 150} 516 200" fill="none" stroke="#ffd0d4" stroke-opacity=".38" stroke-width="3"/>`).join('');
  return frame(`
<clipPath id="sa-belly"><path d="${belly}"/></clipPath>
<path d="M14 178C60 190 100 194 126 194V206C100 206 60 210 14 222Z" fill="url(#sa-tissue)"/>
<path d="M626 178C580 190 540 194 514 194V206C540 206 580 210 626 222Z" fill="url(#sa-tissue)"/>
<path d="${belly}" fill="url(#sa-red)"/>
<g clip-path="url(#sa-belly)">${strands}</g>
<path d="${belly}" fill="none" stroke="#ffd0d4" stroke-opacity=".5" stroke-width="3"/>
${zoomRing(320, 200, 52)}`, 'Схема скелетного м’яза: сухожилля з обох боків і тіло м’яза з пучками волокон');
}

function fascicle() {
  const fibres = [];
  const step = 38;
  for (let row = -4; row <= 4; row++) {
    for (let col = -4; col <= 4; col++) {
      const x = 320 + col * step + (row % 2 ? step / 2 : 0);
      const y = 200 + row * step * 0.87;
      if (Math.hypot(x - 320, y - 200) <= 122) {
        fibres.push(`<circle cx="${Math.round(x)}" cy="${Math.round(y)}" r="16.5" fill="url(#sa-fibre)" stroke="${tone.tissue}" stroke-opacity=".55" stroke-width="2.2"/>`);
      }
    }
  }
  return frame(`
<circle cx="320" cy="200" r="150" fill="#3a1620" stroke="url(#sa-tissue)" stroke-width="15"/>
${fibres.join('')}
${zoomRing(320, 200, 25)}`, 'Схема пучка: поперечний переріз групи м’язових волокон у сполучній тканині',
  `<radialGradient id="sa-fibre" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${tone.muscleLight}"/><stop offset="1" stop-color="${tone.muscleDark}"/></radialGradient>`);
}

function fibre() {
  const tubes = [150, 183, 217, 250].map(y =>
    `<rect x="72" y="${y - 12}" width="470" height="24" rx="12" fill="url(#sa-bands)" stroke="#ffd0d4" stroke-opacity=".35"/>`).join('');
  const nuclei = [[160, 129], [265, 271], [372, 129], [470, 271]].map(([x, y]) =>
    `<ellipse cx="${x}" cy="${y}" rx="19" ry="8.5" fill="${tone.nucleus}" stroke="#cfe2ff" stroke-width="2"/>`).join('');
  const dots = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const x = 543 + j * 9, y = 200 + i * 28;
    if (Math.abs(j) <= 1) dots.push(`<circle cx="${x}" cy="${y}" r="4.2" fill="#ffc0c6"/>`);
  }
  return frame(`
<rect x="56" y="116" width="490" height="168" rx="34" fill="url(#sa-red)" stroke="#ffd0d4" stroke-opacity=".6" stroke-width="3"/>
${tubes}
${nuclei}
<ellipse cx="546" cy="200" rx="36" ry="84" fill="#5e1f2b" stroke="#ffd0d4" stroke-opacity=".6" stroke-width="3"/>
${dots.join('')}
${zoomBox(262, 202, 64, 30)}`, 'Схема м’язового волокна: довга клітина з ядрами та паралельними міофібрилами; праворуч її поперечний переріз',
  `<pattern id="sa-bands" width="30" height="24" patternUnits="userSpaceOnUse"><rect width="30" height="24" fill="#e9959d"/><rect x="5" width="20" height="24" fill="#b04558"/><rect x="14" width="2" height="24" fill="#e9959d" opacity=".7"/></pattern>`);
}

function myofibril() {
  const period = 150;
  const zs = [-55, 95, 245, 395, 545, 695];
  let bands = '';
  for (const z of zs.slice(0, -1)) {
    bands += `<rect x="${z + 25}" y="140" width="100" height="120" fill="#d8667a"/>`;
    bands += `<rect x="${z + 60}" y="140" width="30" height="120" fill="#f0a3af"/>`;
    bands += `<path d="M${z + 75} 140V260" stroke="#7a2a39" stroke-width="2"/>`;
  }
  const zlines = zs.map(z => `<path d="M${z} 136V264" stroke="${tone.zdisc}" stroke-width="6"/>`).join('');
  return frame(`
<clipPath id="sa-tube"><rect x="18" y="140" width="604" height="120" rx="60"/></clipPath>
<rect x="18" y="140" width="604" height="120" rx="60" fill="#f4c9cf"/>
<g clip-path="url(#sa-tube)">${bands}${zlines}</g>
<rect x="18" y="140" width="604" height="120" rx="60" fill="none" stroke="#ffd0d4" stroke-opacity=".7" stroke-width="3"/>
${zoomBox(236, 130, 168, 140)}`, 'Схема міофібрили: послідовність саркомерів між Z-дисками, темні та світлі смуги');
}

function molecules() {
  const beads = [];
  const groove = [];
  const n = 28;
  for (let i = 0; i < n; i++) {
    const x = 26 + i * 21.8;
    const wave = Math.sin(i * 0.62) * 15;
    beads.push(`<circle cx="${x.toFixed(1)}" cy="${(110 - wave).toFixed(1)}" r="9" fill="#8d79f0" stroke="#e1dbff" stroke-width="1.5"/>`);
    beads.push(`<circle cx="${x.toFixed(1)}" cy="${(110 + wave).toFixed(1)}" r="9" fill="${tone.actin}" stroke="#e1dbff" stroke-width="1.5"/>`);
    groove.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${(110 + Math.cos(i * 0.62) * 7).toFixed(1)}`);
  }
  const trop = [118, 300, 482].map(x => `<ellipse cx="${x}" cy="110" rx="13" ry="10" fill="${tone.troponin}" stroke="#dff7ff" stroke-width="2"/>`).join('');
  const head = (x, lean, attached) => {
    const topX = x + lean, topY = attached ? 150 : 186;
    return `<path d="M${x} 284Q${x + lean * 0.2} 236 ${topX} ${topY + 8}" fill="none" stroke="${tone.myosin}" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="${topX}" cy="${topY}" rx="21" ry="12" transform="rotate(${attached ? -70 : -28} ${topX} ${topY})" fill="${tone.myosin}" stroke="#ffd3d9" stroke-width="2"/>`;
  };
  return frame(`
<path d="${groove.join('')}" fill="none" stroke="#f1e6bd" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
${beads.join('')}
${trop}
<rect x="18" y="284" width="604" height="30" rx="15" fill="${tone.myosin}" fill-opacity=".85" stroke="#ffd3d9" stroke-width="2"/>
${head(120, 34, false)}${head(240, 28, true)}${head(360, 34, false)}${head(480, 36, false)}${head(580, 22, false)}`,
  'Умовна схема молекул: тонкий філамент актину з тропоніном і тропоміозином та товстий філамент міозину з головками');
}

const art = {
  'TISSUE-SKELETAL-MUSCLE': muscle,
  'STRUCT-FASCICLE': fascicle,
  'CELL-MUSCLE': fibre,
  'STRUCT-MYOFIBRIL': myofibril,
  'STRUCT-SARCOMERE': () => sarcomereSVG({ t: 0, label: 'Схема саркомера: Z-диски, тонкі філаменти актину та товсті філаменти міозину' }),
  'PRT-ACTIN-MYOSIN': molecules
};

export const scaleArtIds = Object.keys(art);

export function scaleArt(id) {
  if (!Object.hasOwn(art, id)) throw Error('Unknown scale: ' + id);
  return art[id]();
}

// Short legend per scale. Only terms already used in the module text; colours match the drawing.
export const scaleLegend = {
  'TISSUE-SKELETAL-MUSCLE': [
    { color: tone.muscle, text: 'Тіло м’яза: пучки волокон' },
    { color: tone.tissue, text: 'Сухожилля' },
    { color: tone.zoom, text: 'Пунктир: що збільшуємо далі' }
  ],
  'STRUCT-FASCICLE': [
    { color: tone.muscleLight, text: 'М’язові волокна (переріз)' },
    { color: tone.tissue, text: 'Сполучна тканина навколо' },
    { color: tone.zoom, text: 'Пунктир: одне волокно' }
  ],
  'CELL-MUSCLE': [
    { color: tone.nucleus, text: 'Ядра' },
    { color: '#a73d4e', text: 'Міофібрили всередині' },
    { color: tone.zoom, text: 'Пунктир: ділянка міофібрили' }
  ],
  'STRUCT-MYOFIBRIL': [
    { color: tone.zdisc, text: 'Z-диски обмежують саркомер' },
    { color: '#d8667a', text: 'Темніша смуга' },
    { color: '#f4c9cf', text: 'Світліша смуга' }
  ],
  'STRUCT-SARCOMERE': [
    { color: tone.zdisc, text: 'Z-диски' },
    { color: tone.actin, text: 'Актин (тонкі філаменти)' },
    { color: tone.myosin, text: 'Міозин (товсті філаменти)' }
  ],
  'PRT-ACTIN-MYOSIN': [
    { color: tone.actin, text: 'Актин' },
    { color: tone.troponin, text: 'Тропонін (з тропоміозином)' },
    { color: tone.myosin, text: 'Міозин: головки' }
  ]
};
