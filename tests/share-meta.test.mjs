import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Every page must carry icons, a canonical address and Open Graph data so that links shared in
// messengers show a preview and browsers stop requesting a missing favicon.
import {readBase} from '../scripts/site-url.mjs';
// The site address lives in site.json, so these checks keep working after a move to its own domain.
const BASE = readBase();
const pages = fs.readdirSync('dist').filter(f => f.endsWith('.html')).sort();
assert(pages.length >= 11, 'Expected the full set of site pages');

const attr = (tag, name) => tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1];
const unescape = value => value.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const pngSize = file => {
  const data = fs.readFileSync(file);
  assert.equal(data.subarray(1, 4).toString(), 'PNG', `${file} must be a PNG`);
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
};

// Shared assets.
assert.deepEqual(pngSize('dist/og-image.png'), [1200, 630], 'Preview card is 1200x630');
assert(fs.statSync('dist/og-image.png').size < 1_000_000, 'Preview card stays small');
assert.deepEqual(pngSize('dist/apple-touch-icon.png'), [180, 180]);
const ico = fs.readFileSync('dist/favicon.ico');
assert.equal(ico.readUInt16LE(0), 0); assert.equal(ico.readUInt16LE(2), 1); assert(ico.readUInt16LE(4) >= 1, 'favicon.ico is a valid icon file');
assert(fs.readFileSync('dist/favicon.svg', 'utf8').includes('<svg'), 'favicon.svg exists');
assert(fs.readFileSync('docs/DEPLOYMENT.md', 'utf8').includes(BASE), 'Deployment notes name the same live address as the page metadata');

const canonicals = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join('dist', page), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]);
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
  const meta = key => {
    const tag = metas.find(m => attr(m, 'property') === key || attr(m, 'name') === key);
    return tag ? unescape(attr(tag, 'content') ?? '') : undefined;
  };

  // The shared block must sit before the builder-injected block at the end of <head> (index.html), so the committed file equals the build output.
  if (page === 'index.html') assert(head.indexOf('rel="canonical"') < head.indexOf('data-evidence-style'), 'index.html: share metadata must precede the generated evidence styles');

  // Icons: every referenced file exists.
  for (const [rel, target] of [['icon', './favicon.svg'], ['icon', './favicon.ico'], ['apple-touch-icon', './apple-touch-icon.png']]) {
    const link = links.find(l => attr(l, 'rel') === rel && attr(l, 'href') === target);
    assert(link, `${page}: <link rel="${rel}" href="${target}"> is missing`);
    assert(fs.existsSync(path.join('dist', target)), `${page}: ${target} does not exist`);
  }

  // Canonical: absolute, on the live address, one per page.
  const canonical = attr(links.find(l => attr(l, 'rel') === 'canonical') ?? '', 'href');
  assert(canonical, `${page}: canonical link is missing`);
  assert.equal(canonical, page === 'index.html' ? BASE : BASE + page, `${page}: canonical must be its own live address`);
  assert(!canonicals.has(canonical), `${page}: duplicate canonical`); canonicals.add(canonical);

  // Title and description feed the preview.
  const title = unescape(html.match(/<title>([\s\S]*?)<\/title>/i)[1].trim());
  const description = meta('description');
  assert(description && description.length >= 40 && description.length <= 300, `${page}: needs a 40-300 character description`);
  assert.equal(meta('og:title'), title, `${page}: og:title must match <title>`);
  assert.equal(meta('og:description'), description, `${page}: og:description must match the description`);
  assert.equal(meta('og:url'), canonical, `${page}: og:url must equal canonical`);
  assert.equal(meta('og:type'), 'website');
  assert.equal(meta('og:site_name'), 'Evidence UA');
  assert.equal(meta('og:locale'), 'uk_UA');
  // Since 2026-10-20 every page has its own 1200x630 card (scripts/make-og-cards.mjs); og-image.png stays as the brand default.
  assert.equal(meta('og:image'), BASE + 'og/' + page.replace('.html', '.jpg'), `${page}: og:image must be its own absolute card`);
  assert.equal(meta('og:image:width'), '1200'); assert.equal(meta('og:image:height'), '630');
  assert(meta('og:image:alt'), `${page}: og:image:alt is missing`);
  assert.equal(meta('twitter:card'), 'summary_large_image');
}

console.log(`Share metadata: ${pages.length} pages carry icons, canonical, Open Graph; preview card, favicon and deployment-notes address agree.`);
