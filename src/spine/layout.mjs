// Schematic spine layout (pure data, no rendering library, so it can be tested in Node).
// Units are arbitrary but proportional: ~1 unit ≈ 1 cm. y points up, z points to the front of the body.
// This is a teaching schematic, not an anatomically exact model: shapes are simplified on purpose.

export const REGIONS = [
  {id: 'cervical', title: 'Шийний відділ', range: 'C1–C7', count: 7},
  {id: 'thoracic', title: 'Грудний відділ', range: 'T1–T12', count: 12},
  {id: 'lumbar', title: 'Поперековий відділ', range: 'L1–L5', count: 5},
  {id: 'sacral', title: 'Крижі та куприк', range: 'S1–S5, куприк', count: 6}
];

// Sagittal curve of the whole column: [y, z]. Cervical and lumbar lordosis (convex to the front),
// thoracic and sacral kyphosis (convex to the back). Individual shapes vary; this is a typical outline.
const ANCHORS = [
  [0, 1.0], [-5, 2.0], [-10, 0.8], [-20, -1.8], [-33, -0.6], [-42, 2.2], [-50, 0.6], [-56, -1.6], [-62, -0.4]
];

// Monotone cubic interpolation of z over y (Catmull-Rom tangents, no overshoot between anchors).
export function curveZ(y) {
  const pts = ANCHORS;
  if (y >= pts[0][0]) return pts[0][1];
  if (y <= pts.at(-1)[0]) return pts.at(-1)[1];
  let i = 0;
  while (!(y <= pts[i][0] && y >= pts[i + 1][0])) i++;
  const [y0, z0] = pts[i], [y1, z1] = pts[i + 1];
  const slope = (a, b) => (b[1] - a[1]) / (b[0] - a[0]);
  const m0 = i === 0 ? slope(pts[0], pts[1]) : (slope(pts[i - 1], pts[i]) + slope(pts[i], pts[i + 1])) / 2;
  const m1 = i + 2 >= pts.length ? slope(pts[i], pts[i + 1]) : (slope(pts[i], pts[i + 1]) + slope(pts[i + 1], pts[i + 2])) / 2;
  const h = y1 - y0;
  const t = (y - y0) / h;
  const t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * z0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * z1 + (t3 - t2) * h * m1;
}

// Tilt (radians, rotation around the x axis) so that a vertebra follows the curve.
export function tiltAt(y) {
  const e = 0.25;
  return Math.atan2(curveZ(y + e) - curveZ(y - e), 2 * e);
}

const lerp = (a, b, t) => a + (b - a) * t;

// Per-region dimensions: [first, last] value is interpolated along the region.
const SHAPES = {
  cervical: {height: [1.0, 1.4], disc: [0.35, 0.4], width: [1.4, 1.9], depth: [1.1, 1.4], spine: [1.2, 2.2], spineDrop: [0.0, 0.5], transverse: [1.7, 1.5]},
  thoracic: {height: [1.7, 2.1], disc: [0.45, 0.55], width: [2.0, 2.7], depth: [1.5, 2.0], spine: [2.8, 2.4], spineDrop: [1.6, 0.4], transverse: [1.5, 1.7]},
  lumbar: {height: [2.4, 2.6], disc: [0.8, 0.9], width: [3.1, 3.5], depth: [2.4, 2.7], spine: [2.2, 2.0], spineDrop: [0.1, 0.0], transverse: [1.4, 1.35]}
};

const NAMES = {
  cervical: i => `C${i + 1}`,
  thoracic: i => `T${i + 1}`,
  lumbar: i => `L${i + 1}`
};

// Builds the whole column from top to bottom and centres it on the origin.
export function buildSpineLayout() {
  const vertebrae = [];
  const discs = [];
  let y = 0;
  for (const region of REGIONS.filter(r => r.id !== 'sacral')) {
    const shape = SHAPES[region.id];
    for (let i = 0; i < region.count; i++) {
      const t = region.count === 1 ? 0 : i / (region.count - 1);
      const height = lerp(...shape.height, t);
      const centerY = y - height / 2;
      const width = lerp(...shape.width, t);
      vertebrae.push({
        id: NAMES[region.id](i), region: region.id, index: vertebrae.length,
        y: centerY, z: curveZ(centerY), tilt: tiltAt(centerY),
        height, width, depth: lerp(...shape.depth, t),
        spineLength: lerp(...shape.spine, t), spineDrop: lerp(...shape.spineDrop, t),
        transverseSpan: width * lerp(...shape.transverse, t)
      });
      y -= height;
      const isLastMobile = region.id === 'lumbar' && i === region.count - 1;
      const gap = lerp(...shape.disc, t);
      discs.push({
        between: [vertebrae.length - 1, isLastMobile ? 'sacrum' : vertebrae.length],
        region: region.id, y: y - gap / 2, z: curveZ(y - gap / 2), tilt: tiltAt(y - gap / 2),
        height: gap, width: width * 0.96, depth: lerp(...shape.depth, t) * 0.96
      });
      y -= gap;
    }
  }
  const sacrumHeight = 9.5;
  const sacrumCenter = y - sacrumHeight / 2;
  const sacrum = {
    id: 'sacrum', region: 'sacral', y: sacrumCenter, z: curveZ(sacrumCenter), tilt: tiltAt(sacrumCenter),
    height: sacrumHeight, widthTop: 7.0, widthBottom: 2.2, depthTop: 3.2, depthBottom: 1.4
  };
  y -= sacrumHeight;
  const coccyx = [];
  for (let i = 0; i < 3; i++) {
    const h = 0.9 - i * 0.15;
    const cy = y - h / 2;
    coccyx.push({id: `Co${i + 1}`, region: 'sacral', y: cy, z: curveZ(cy) + i * 0.15, height: h, width: 1.5 - i * 0.3, depth: 1.1 - i * 0.2});
    y -= h;
  }
  const totalHeight = -y;
  const shift = totalHeight / 2;
  for (const item of [...vertebrae, ...discs, sacrum, ...coccyx]) item.y += shift;
  return {vertebrae, discs, sacrum, coccyx, totalHeight};
}

// Colour per region (also used by the legend). Not the only cue: regions are also named in the interface.
export const REGION_COLORS = {cervical: 0x5cc8ff, thoracic: 0x8fd3a4, lumbar: 0xffb35c, sacral: 0xc9a4ff};
