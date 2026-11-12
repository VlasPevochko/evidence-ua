// Owner 2026-11-12 («з першого до 12 одним PR», audit item 2): pin labels on the Atlas figure sit straight on a picture, and the older helper paintedContrast()
// took the most frequent colour of the rectangle as the background, so it called a label that really lay at 3.4 : 1 on skin-coloured muscle a 10 : 1 label.
// Browser QA now compares two screenshots (with the text and with the text made transparent) through scripts/browser-qa/glyph-contrast.mjs. This test proves
// the measuring code itself on synthetic images before CI relies on it.
import assert from 'node:assert/strict';
import {glyphContrast} from '../scripts/browser-qa/glyph-contrast.mjs';

// A decoded screenshot as decodePng returns it: {width, height, channels, data}.
function image(width, height, pixel, channels = 3) {
  const data = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const rgb = pixel(x, y); for (let c = 0; c < channels; c++) data[(y * width + x) * channels + c] = c < 3 ? rgb[c] : 255; }
  return {width, height, channels, data};
}
const whole = {x: 0, y: 0, width: 20, height: 10};

// 1) Nothing changed between the two screenshots: no letter, no verdict (a missing label must not pass as «readable»).
const flat = image(20, 10, () => [10, 20, 30]);
assert.equal(glyphContrast(flat, image(20, 10, () => [10, 20, 30]), whole), null);

// 2) White letters on a dark page: the contrast of a letter pixel against what is under it.
const dark = image(20, 10, () => [5, 14, 25]);
const lettersOnDark = image(20, 10, (x, y) => (x >= 5 && x < 10 && y >= 2 && y < 8) ? [255, 255, 255] : [5, 14, 25]);
const white = glyphContrast(lettersOnDark, dark, whole);
assert.equal(white.pixels, 30, 'only the 5 × 6 letter pixels count');
assert(white.median > 15 && white.min > 15, `white on near-black is about 19:1 (${white.median.toFixed(1)})`);

// 3) The case of the audit: letters of almost the same lightness as the picture beneath them (text on skin-coloured muscle). The background of the rectangle is dark,
// but the pixel under each letter is not: the verdict must follow the pixel under the letter, not the page.
const picture = image(20, 10, (x, y) => (x >= 5 && x < 10 && y >= 2 && y < 8) ? [110, 110, 110] : [5, 14, 25]);
const lettersOnPicture = image(20, 10, (x, y) => (x >= 5 && x < 10 && y >= 2 && y < 8) ? [200, 200, 200] : [5, 14, 25]);
const weak = glyphContrast(lettersOnPicture, picture, whole);
assert(weak.median > 2.9 && weak.median < 3.2, `200 on 110 grey is about 3:1, not the 10:1 that the page colour would suggest (${weak.median.toFixed(2)})`);
assert(weak.median < 4.5, 'and it fails the 4.5 gate');

// 4) A faint fringe (anti-aliasing, a shadow) is not a letter: it changes a pixel by less than the threshold and is ignored.
const fringe = image(20, 10, (x, y) => x === 3 ? [40, 50, 60] : [5, 14, 25]);
assert.equal(glyphContrast(fringe, dark, whole), null, 'a pixel that changed by 105 (of 765) is not a letter');
assert.equal(glyphContrast(fringe, dark, whole, {minDelta: 60}).pixels, 10, 'the threshold is adjustable');

// 5) The rectangle limits the measurement; letters outside it do not count, and a rectangle sticking out of the screenshot is clipped.
assert.equal(glyphContrast(lettersOnDark, dark, {x: 12, y: 0, width: 8, height: 10}), null, 'no letter inside the rectangle');
assert.equal(glyphContrast(lettersOnDark, dark, {x: -5, y: -5, width: 100, height: 100}).pixels, 30, 'a rectangle larger than the screenshot is clipped');
assert.equal(glyphContrast(lettersOnDark, dark, {x: 5, y: 2, width: 2, height: 2}).pixels, 4);

// 6) A mix of letter pixels: the minimum and the lower quartile show the weak pixels, the median the typical one (the gate in Browser QA uses the median, because the
// anti-aliased edge of thin 12 px text never reaches the nominal contrast: black on white measures far below 21:1 pixel by pixel).
const mixBase = image(20, 10, () => [0, 0, 0]);
const mixText = image(20, 10, (x, y) => y === 0 ? (x < 6 ? [90, 90, 90] : [255, 255, 255]) : [0, 0, 0]);
const mix = glyphContrast(mixText, mixBase, whole);
assert.equal(mix.pixels, 20, 'the top row: six dark-grey letter pixels and fourteen white ones, all above the threshold (90 × 3 = 270)');
assert(mix.min < 3.2 && mix.p25 < 3.2 && mix.median > 15, `the weak sixth is visible in the minimum and the lower quartile, the median stays typical (${mix.min.toFixed(2)}, ${mix.p25.toFixed(2)}, ${mix.median.toFixed(2)})`);

// 7) RGBA screenshots (Chromium may return either) give the same answer; mismatched screenshots are refused.
const rgba = glyphContrast(image(20, 10, (x, y) => (x >= 5 && x < 10 && y >= 2 && y < 8) ? [255, 255, 255] : [5, 14, 25], 4), image(20, 10, () => [5, 14, 25], 4), whole);
assert.equal(rgba.pixels, 30);
assert(Math.abs(rgba.median - white.median) < 1e-9);
assert.throws(() => glyphContrast(flat, image(10, 10, () => [0, 0, 0]), whole), /differ in size/);
assert.throws(() => glyphContrast(flat, image(20, 10, () => [0, 0, 0], 4), whole), /differ in size or format/);

console.log('Glyph contrast: only the pixels of the letters are measured, each against what is truly under it.');
