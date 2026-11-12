// Owner 2026-11-12: the closed home lens showed a dark one-pixel line down its
// middle on many screens, and an earlier build drew a stray piece of the lens
// inside the opening. Neither is visible in CSS values, so Browser QA measures
// real screenshots with scripts/browser-qa/lens-pixels.mjs. This test proves
// the measuring code itself on synthetic images before CI relies on it.
import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import {decodePng, seamDepth, gapResidue, columnLuminance} from '../scripts/browser-qa/lens-pixels.mjs';

const crcTable = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buffer => { let c = 0xffffffff; for (const byte of buffer) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
// Encodes with every PNG row filter in turn, so the decoder is exercised on all five.
function encodePng(width, height, pixel, {channels = 4, colour = channels === 4 ? 6 : 2} = {}) {
  const stride = width * channels, rows = [];
  const image = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const rgba = pixel(x, y); for (let c = 0; c < channels; c++) image[y * stride + x * channels + c] = rgba[c]; }
  for (let y = 0; y < height; y++) {
    const filter = y % 5, line = Buffer.alloc(stride + 1); line[0] = filter;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? image[y * stride + x - channels] : 0, up = y ? image[(y - 1) * stride + x] : 0, upLeft = x >= channels && y ? image[(y - 1) * stride + x - channels] : 0;
      const raw = image[y * stride + x];
      const estimate = left + up - upLeft, a = Math.abs(estimate - left), b = Math.abs(estimate - up), c = Math.abs(estimate - upLeft);
      const predicted = [0, left, up, (left + up) >> 1, a <= b && a <= c ? left : b <= c ? up : upLeft][filter];
      line[x + 1] = (raw - predicted) & 255;
    }
    rows.push(line);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = colour;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
const image = (width, height, pixel, options) => decodePng(encodePng(width, height, pixel, options));

// A smooth backdrop with texture, like the lens artwork, but identical in both images.
const texture = (x, y) => { const v = 90 + ((x * 7 + y * 13) % 23); return [v, v - 20, v + 30, 255]; };

// decodePng: exact round trip for RGBA and RGB, every filter type.
{
  const pixel = (x, y) => [(x * 5) & 255, (y * 11) & 255, (x * y) & 255, 255];
  const rgba = image(37, 21, pixel);
  assert.equal(rgba.width, 37); assert.equal(rgba.height, 21); assert.equal(rgba.channels, 4);
  for (const [x, y] of [[0, 0], [36, 20], [17, 9], [3, 19]]) assert.deepEqual([...rgba.data.subarray((y * 37 + x) * 4, (y * 37 + x) * 4 + 4)], pixel(x, y));
  const rgb = image(19, 8, pixel, {channels: 3});
  assert.equal(rgb.channels, 3);
  assert.deepEqual([...rgb.data.subarray((5 * 19 + 7) * 3, (5 * 19 + 7) * 3 + 3)], pixel(7, 5).slice(0, 3));
}
assert.throws(() => decodePng(Buffer.from('not an image at all, just text')), /not a PNG/);
assert.throws(() => decodePng(encodePng(4, 4, () => [0, 0, 0, 255], {channels: 1, colour: 0})), /unsupported PNG/, 'greyscale screenshots are refused loudly, not misread');

// seamDepth: a dark one-pixel line at the join is found; a seamless lens measures about zero.
{
  const reference = image(240, 80, texture);
  const seamless = image(240, 80, texture);
  assert(Math.abs(seamDepth(seamless, reference, 120).depth) < 0.01, 'identical images have no seam');
  const withSeam = (column, level) => image(240, 80, (x, y) => x === column ? [level, level, level, 255] : texture(x, y));
  const dark = seamDepth(withSeam(120, 35), reference, 120);
  assert(dark.depth > 50 && dark.column === 120, `a one-pixel line of brightness 35 must be found at the join (${JSON.stringify(dark)})`);
  assert(seamDepth(withSeam(122, 35), reference, 120).depth > 50, 'a line two pixels off the computed centre is still inside the window');
  assert(seamDepth(withSeam(131, 35), reference, 120).depth < 1, 'a line far from the join is ordinary artwork difference, not a seam');
  // Small uniform differences elsewhere (resampling, dithering) move the baseline, not the verdict.
  const shifted = image(240, 80, (x, y) => { const base = texture(x, y); return x === 120 ? [35, 35, 35, 255] : [base[0] - 4, base[1] - 4, base[2] - 4, 255]; });
  const relative = seamDepth(shifted, reference, 120);
  assert(relative.depth > 50 && Math.abs(relative.typical - 4) < 1, 'the typical difference is subtracted before judging the join');
  assert.throws(() => seamDepth(image(240, 80, texture), image(120, 80, texture), 60), /differ in size/);
  assert.throws(() => seamDepth(image(20, 20, texture), image(20, 20, texture), 10), /too narrow/);
}

// gapResidue: a clean opening matches the reference without the artwork; a stray piece of lens does not.
{
  const reference = image(120, 60, () => [20, 10, 40, 255]);
  const clean = image(120, 60, () => [20, 10, 40, 255]);
  assert.equal(gapResidue(clean, reference).max, 0);
  const stray = image(120, 60, (x, y) => x >= 30 && x < 90 ? texture(x, y) : [20, 10, 40, 255]);
  const found = gapResidue(stray, reference);
  assert(found.max > 60 && found.column >= 30 && found.column < 90, `a fragment of lens artwork in the opening must be reported (${JSON.stringify(found)})`);
  assert.equal(gapResidue(stray, reference, {from: 0, to: 25}).max, 0, 'the measured columns can be limited to the inside of the opening');
  const partial = image(120, 60, (x, y) => x === 50 && y < 30 ? [220, 210, 240, 255] : [20, 10, 40, 255]);
  assert(Math.abs(gapResidue(partial, reference).max - 100) < 1, 'the mean difference over the rows is reported');
  assert.throws(() => gapResidue(clean, reference, {from: 200, to: 300}), /no columns/);
}

// columnLuminance uses the standard weights and the requested rows only.
{
  const stripes = image(4, 10, (x, y) => y < 5 ? [255, 0, 0, 255] : [0, 255, 0, 255]);
  assert(Math.abs(columnLuminance(stripes, [0, .5])[0] - .2126 * 255) < .01);
  assert(Math.abs(columnLuminance(stripes, [.5, 1])[0] - .7152 * 255) < .01);
}

console.log('Lens pixels: PNG decoding with every filter, seam depth at the join, stray artwork in the opening and input checks passed.');
