// Pixel measurements for the home lens. Browser QA takes real screenshots and
// these helpers read them back, so a defect that only exists in the painted
// pixels (a hairline where two clipped copies meet, a stray piece of the lens
// artwork in the opening) cannot hide behind correct-looking CSS values.
// The module has no dependencies; tests/lens-pixels.test.mjs covers it with
// synthetic PNGs.
import zlib from 'node:zlib';

/** Decodes an 8-bit, non-interlaced RGB or RGBA PNG (what Chromium screenshots are). */
export function decodePng(buffer) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (buffer.length < 33 || signature.some((byte, index) => buffer[index] !== byte)) throw new Error('not a PNG file');
  let position = 8, width = 0, height = 0, depth = 0, colour = 0, interlace = 0;
  const chunks = [];
  while (position + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(position), type = buffer.toString('ascii', position + 4, position + 8);
    const data = buffer.subarray(position + 8, position + 8 + length);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); depth = data[8]; colour = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') chunks.push(data);
    else if (type === 'IEND') break;
    position += 12 + length;
  }
  if (depth !== 8 || (colour !== 2 && colour !== 6) || interlace !== 0) throw new Error(`unsupported PNG (bit depth ${depth}, colour type ${colour}, interlace ${interlace}); expected 8-bit RGB or RGBA`);
  const channels = colour === 6 ? 4 : 3, stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  if (raw.length < height * (stride + 1)) throw new Error('truncated PNG data');
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = x >= channels && y ? pixels[(y - 1) * stride + x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const estimate = left + up - upLeft, a = Math.abs(estimate - left), b = Math.abs(estimate - up), c = Math.abs(estimate - upLeft);
        value += a <= b && a <= c ? left : b <= c ? up : upLeft;
      } else if (filter !== 0) throw new Error(`unknown PNG filter ${filter}`);
      pixels[y * stride + x] = value & 255;
    }
  }
  return {width, height, channels, data: pixels};
}

const luminance = (image, index) => .2126 * image.data[index] + .7152 * image.data[index + 1] + .0722 * image.data[index + 2];

function sameSize(a, b) {
  if (a.width !== b.width || a.height !== b.height) throw new Error(`the two screenshots differ in size (${a.width}×${a.height} and ${b.width}×${b.height})`);
}

function rowRange(image, rows) {
  const from = Math.max(0, Math.floor(image.height * rows[0])), to = Math.min(image.height, Math.ceil(image.height * rows[1]));
  if (to <= from) throw new Error('no rows to measure');
  return [from, to];
}

/** Mean luminance of every pixel column over the chosen rows. */
export function columnLuminance(image, rows = [.25, .75]) {
  const [from, to] = rowRange(image, rows), result = new Float64Array(image.width);
  for (let x = 0; x < image.width; x++) {
    let sum = 0;
    for (let y = from; y < to; y++) sum += luminance(image, (y * image.width + x) * image.channels);
    result[x] = sum / (to - from);
  }
  return result;
}

/**
 * How much darker the painted lens is than the single-image reference in the
 * columns next to `centre`, compared with the ordinary difference further away
 * (0–255 brightness levels). Two abutting clipped copies leave a dark
 * one-pixel line where the join falls between device pixels; a seamless
 * lens measures about zero.
 */
export function seamDepth(actual, reference, centre, {rows = [.25, .75], window = 3, near = 9, far = 40} = {}) {
  sameSize(actual, reference);
  const painted = columnLuminance(actual, rows), expected = columnLuminance(reference, rows);
  const difference = x => expected[x] - painted[x];
  const baseline = [];
  for (let x = Math.max(0, centre - far); x <= Math.min(actual.width - 1, centre + far); x++) if (Math.abs(x - centre) >= near) baseline.push(difference(x));
  if (baseline.length < 10) throw new Error('the screenshot is too narrow to measure a seam');
  baseline.sort((a, b) => a - b);
  const typical = baseline[baseline.length >> 1];
  let depth = -Infinity, column = centre;
  for (let x = Math.max(0, centre - window); x <= Math.min(actual.width - 1, centre + window); x++) {
    const value = difference(x) - typical;
    if (value > depth) { depth = value; column = x; }
  }
  return {depth, column, typical};
}

/**
 * The largest per-column mean difference (0–255, worst colour channel) between
 * two screenshots of the same area. With the lens artwork hidden in the
 * reference, a clean opening between the halves measures about zero; a stray
 * piece of the lens drawn there measures tens of levels.
 */
export function gapResidue(actual, reference, {rows = [0, 1], from = 0, to = actual.width} = {}) {
  sameSize(actual, reference);
  const [top, bottom] = rowRange(actual, rows), first = Math.max(0, Math.floor(from)), last = Math.min(actual.width, Math.ceil(to));
  if (last <= first) throw new Error('no columns to measure');
  let worst = 0, column = first;
  for (let x = first; x < last; x++) {
    let sum = 0;
    for (let y = top; y < bottom; y++) {
      const index = (y * actual.width + x) * actual.channels;
      sum += Math.max(Math.abs(actual.data[index] - reference.data[index]), Math.abs(actual.data[index + 1] - reference.data[index + 1]), Math.abs(actual.data[index + 2] - reference.data[index + 2]));
    }
    const mean = sum / (bottom - top);
    if (mean > worst) { worst = mean; column = x; }
  }
  return {max: worst, column};
}
