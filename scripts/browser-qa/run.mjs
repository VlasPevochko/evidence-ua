// Browser QA for the static site. Run from the repository root:
//   npm ci --prefix scripts/browser-qa --ignore-scripts && node scripts/browser-qa/run.mjs
// Uses the Chrome already installed on the machine (BROWSER_EXECUTABLE overrides the path).
// Everything is served from a throw-away local server and third-party requests are blocked, so
// the run is hermetic. The static tests cannot see layout, focus or runtime errors; this can.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = path.join(root, 'dist');
const viewports = [{name: 'mobile', width: 390, height: 844}, {name: 'desktop', width: 1440, height: 900}];
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff'
};

function serve() {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://local');
      let file = path.normalize(path.join(dist, decodeURIComponent(url.pathname)));
      if (!file.startsWith(dist + path.sep) && file !== dist) { res.writeHead(403).end(); return; }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(400).end(); }
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);
let checks = 0;
const check = (where, ok, message) => { checks++; if (!ok) fail(where, message); };

async function open(browser, origin, viewport, route) {
  const context = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, serviceWorkers: 'block'});
  const page = await context.newPage();
  const seen = {console: [], pageErrors: [], badResponses: [], external: []};
  page.on('console', m => { if (m.type() === 'error') seen.console.push(m.text()); });
  page.on('pageerror', e => seen.pageErrors.push(String(e)));
  page.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) seen.badResponses.push(`${r.status()} ${r.url().slice(origin.length)}`); });
  await page.route('**/*', r => {
    const url = r.request().url();
    if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return r.continue();
    seen.external.push(url);
    return r.abort();
  });
  await page.goto(origin + route, {waitUntil: 'load'});
  await page.waitForTimeout(400);
  return {context, page, seen};
}

async function generic(browser, origin, viewport, file) {
  const where = `${file} @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
  check(where, (await page.title()).trim().length > 0, 'empty <title>');
  check(where, (await page.locator('html').getAttribute('lang')) === 'uk', 'html lang is not "uk"');
  check(where, seen.console.length === 0, `console errors: ${seen.console.join(' | ')}`);
  check(where, seen.pageErrors.length === 0, `uncaught errors: ${seen.pageErrors.join(' | ')}`);
  check(where, seen.badResponses.length === 0, `failed local requests: ${seen.badResponses.join(', ')}`);
  check(where, seen.external.length === 0, `third-party requests at load: ${seen.external.join(', ')}`);
  const facts = await page.evaluate(() => {
    const visible = element => { const box = element.getBoundingClientRect(); const style = getComputedStyle(element); return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: [...document.querySelectorAll('h1')].filter(visible).length,
      brokenImages: [...document.images].filter(img => visible(img) && img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src'))
    };
  });
  check(where, facts.overflow <= 1, `horizontal overflow of ${facts.overflow}px`);
  check(where, facts.h1 === 1, `${facts.h1} visible <h1> elements (expected 1)`);
  check(where, facts.brokenImages.length === 0, `broken images: ${facts.brokenImages.join(', ')}`);
  await context.close();
}

async function exerciseFlow(browser, origin, viewport) {
  const where = `exercise library @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/exercises.html');
  await page.waitForSelector('.ex-card');
  const total = await page.locator('.ex-card').count();
  check(where, total >= 3, `only ${total} cards`);
  await page.fill('#ex-search', 'zzzz-no-such');
  check(where, (await page.locator('.ex-card').count()) === 0, 'search does not filter');
  check(where, /не знайдено/.test(await page.locator('#ex-count').innerText()), 'no empty-result message');
  await page.fill('#ex-search', '');
  check(where, (await page.locator('.ex-card').count()) === total, 'clearing the search does not restore the list');
  // Keyboard path into a detail page.
  await page.locator('.ex-card-title a').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('.ex-detail');
  check(where, (await page.locator('h1:visible').count()) === 1, 'detail should show one visible <h1>');
  check(where, (await page.locator('.eua-platform-nav').count()) === 1, 'shared navigation is injected more than once');
  check(where, (await page.locator('iframe').count()) === 0, 'a video iframe exists before the click');
  check(where, seen.external.length === 0, `third-party request before the click: ${seen.external.join(', ')}`);
  await page.locator('.ex-video-play').focus();
  await page.keyboard.press('Enter');
  const src = await page.locator('.ex-video iframe').getAttribute('src');
  check(where, /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}/.test(src || ''), `unexpected embed address: ${src}`);
  // Old shared links keep working.
  await page.goto(origin + '/exercises.html?e=tyaha-hanteli-v-nahyli');
  await page.waitForSelector('.ex-detail');
  check(where, page.url().endsWith('?e=tyaha-hanteli-v-nahili'), 'legacy slug is not rewritten to the canonical address');
  await context.close();
}

async function atlasFlow(browser, origin, viewport) {
  const where = `atlas shoulder map @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/atlas.html');
  await page.click('[data-zone="shoulder"]');
  await page.waitForSelector('#shoulder-pain-map:not([hidden])');
  const tabs = page.locator('#shoulder-pain-map [role="tab"]');
  check(where, (await tabs.count()) >= 2, 'the map has no view tabs');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  const state = await page.evaluate(() => {
    const active = document.activeElement;
    return {role: active?.getAttribute('role'), selected: active?.getAttribute('aria-selected'), inMap: !!active?.closest('#shoulder-pain-map')};
  });
  check(where, state.role === 'tab' && state.selected === 'true' && state.inMap, `keyboard focus is lost after switching view: ${JSON.stringify(state)}`);
  const hiddenButtonsShown = await page.evaluate(() => [...document.querySelectorAll('.atlas-zone')].filter(b => b.offsetParent !== null).length);
  check(where, hiddenButtonsShown === 0, `${hiddenButtonsShown} body-zone buttons stay visible while the map is open`);
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the map open');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  await context.close();
}

async function homeMenuFlow(browser, origin) {
  const viewport = viewports[0];
  const where = `home menu @${viewport.name}`;
  const {context, page} = await open(browser, origin, viewport, '/index.html');
  const toggle = page.locator('.home-menu-toggle');
  check(where, await toggle.isVisible(), 'menu toggle is not visible on mobile');
  check(where, !(await page.locator('.page > header nav').first().isVisible()), 'menu is open before the click');
  await toggle.click();
  check(where, await page.locator('.page > header nav').first().isVisible(), 'menu does not open');
  const labels = await page.locator('.page > header nav a:visible').allInnerTexts();
  check(where, labels.length >= 4, `only ${labels.length} visible menu links`);
  await page.keyboard.press('Escape');
  check(where, !(await page.locator('.page > header nav').first().isVisible()), 'Escape does not close the menu');
  await context.close();
}

const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
const files = fs.readdirSync(dist).filter(f => f.endsWith('.html')).sort();
const browser = await chromium.launch(process.env.BROWSER_EXECUTABLE
  ? {executablePath: process.env.BROWSER_EXECUTABLE, args: ['--no-sandbox']}
  : {channel: 'chrome'});
try {
  for (const viewport of viewports) for (const file of files) await generic(browser, origin, viewport, file);
  for (const viewport of viewports) await exerciseFlow(browser, origin, viewport);
  for (const viewport of viewports) await atlasFlow(browser, origin, viewport);
  await homeMenuFlow(browser, origin);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`Browser QA failed (${failures.length} of ${checks} checks):\n` + failures.map(f => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks} checks over ${files.length} pages × ${viewports.length} viewports plus library, atlas and home-menu flows.`);
