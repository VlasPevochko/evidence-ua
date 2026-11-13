// Contrast of text measured on the painted pixels of the letters themselves.
// Owner 2026-11-12 («з першого до 12 одним PR», audit item 2): pin labels on the Atlas figure sit straight on a picture. The older helper
// paintedContrast() (run.mjs) takes the most frequent colour of the text rectangle as the background, which for text over a picture is the dark page, so it
// reported 10 : 1 for a label whose letters really lay on skin-coloured muscle at 3.4 : 1. This module compares two screenshots of the same page, one with the
// text and one with the text made transparent: the pixels that changed are the letters, and each of them is compared with what is truly under it (the page,
// the chip, the picture). It has no dependencies; tests/glyph-contrast.test.mjs proves it on synthetic images, because CI relies on it.

const linear = value => { value /= 255; return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
const luminance = (data, index) => .2126 * linear(data[index]) + .7152 * linear(data[index + 1]) + .0722 * linear(data[index + 2]);
const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

/**
 * withText, withoutText: two decoded screenshots (decodePng) of the same viewport, the second with the text colour transparent.
 * rect: {x, y, width, height} in screenshot pixels. A pixel belongs to a letter when it changed by more than minDelta (sum of |ΔR|+|ΔG|+|ΔB|, 0–765);
 * the default 240 keeps the body of a stroke and drops the faint anti-aliased fringe. Returns null when the area holds no letter pixel.
 */
export function glyphContrast(withText, withoutText, rect, {minDelta = 240} = {}) {
  if (withText.width !== withoutText.width || withText.height !== withoutText.height || withText.channels !== withoutText.channels) throw new Error('the two screenshots differ in size or format');
  const {width, height, channels} = withText;
  const x0 = Math.max(0, Math.floor(rect.x)), y0 = Math.max(0, Math.floor(rect.y)), x1 = Math.min(width, Math.ceil(rect.x + rect.width)), y1 = Math.min(height, Math.ceil(rect.y + rect.height));
  const ratios = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const index = (y * width + x) * channels;
    const delta = Math.abs(withText.data[index] - withoutText.data[index]) + Math.abs(withText.data[index + 1] - withoutText.data[index + 1]) + Math.abs(withText.data[index + 2] - withoutText.data[index + 2]);
    if (delta > minDelta) ratios.push(ratio(luminance(withText.data, index), luminance(withoutText.data, index)));
  }
  if (!ratios.length) return null;
  ratios.sort((a, b) => a - b);
  return {pixels: ratios.length, median: ratios[ratios.length >> 1], p25: ratios[Math.floor(ratios.length * .25)], min: ratios[0]};
}
