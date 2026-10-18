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
  const seen = {console: [], pageErrors: [], badResponses: [], external: [], requested: []};
  page.on('console', m => { if (m.type() === 'error') seen.console.push(m.text()); });
  page.on('pageerror', e => seen.pageErrors.push(String(e)));
  page.on('request', r => { if (r.url().startsWith(origin)) seen.requested.push(r.url().slice(origin.length)); });
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
  // The shell script injects the navigation asynchronously: wait for it, let it settle, then count (duplicates still fail).
  await page.waitForSelector('.eua-platform-nav', {timeout: 5000}).catch(() => {});
  await page.waitForTimeout(300);
  const navCount = await page.locator('.eua-platform-nav').count();
  check(where, navCount === 1, `shared navigation should be injected exactly once, found ${navCount}`);
  check(where, (await page.locator('iframe').count()) === 0, 'a video iframe exists before the click');
  check(where, seen.external.length === 0, `third-party request before the click: ${seen.external.join(', ')}`);
  await page.locator('.ex-video-play').focus();
  await page.keyboard.press('Enter');
  const src = await page.locator('.ex-video iframe').getAttribute('src');
  check(where, /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}/.test(src || ''), `unexpected embed address: ${src}`);
  // Browsing: previous/next and related exercises lead to another existing detail page.
  check(where, (await page.locator('.ex-pager').count()) === 1, 'detail has no previous/next navigation');
  check(where, (await page.locator('.ex-related-list a').count()) >= 1, 'detail lists no related exercises');
  const before = await page.locator('h1:visible').innerText();
  await page.locator('.ex-pager-next').click();
  await page.waitForSelector('.ex-detail');
  check(where, (await page.locator('h1:visible').innerText()) !== before, 'next exercise did not open another exercise');
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

async function musclesFlow(browser, origin, viewport) {
  const where = `atlas muscles zone @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/atlas.html');
  await page.click('[data-zone="muscles"]');
  check(where, (await page.locator('#atlas-zone-status').innerText()).trim() === 'Бета', 'muscles zone is not marked Beta');
  check(where, (await page.locator('#atlas-zone-title').innerText()).includes('М’язова'), 'zone title not shown');
  await page.click('[data-atlas-tab="training"]');
  await page.waitForSelector('[data-related-practice] .atlas-practice-list');
  const hrefs = await page.locator('.atlas-practice-list a').evaluateAll(links => links.map(a => a.getAttribute('href')));
  check(where, hrefs.length >= 3 && hrefs.every(h => h.startsWith('./exercises.html?e=')), `related exercises look wrong: ${hrefs.length}`);
  await page.click('[data-atlas-tab="symptoms"]');
  check(where, /Готується/.test(await page.locator('#atlas-content').innerText()), 'symptoms tab should stay "Готується"');
  await page.click('[data-atlas-tab="training"]');
  await page.waitForSelector('.atlas-practice-list a');
  await page.locator('.atlas-practice-list a').first().click();
  await page.waitForSelector('.ex-detail');
  check(where, (await page.locator('h1:visible').count()) === 1, 'exercise page after the Atlas link has no single h1');
  // Exercise → Atlas zone, and the ?zone= deep link.
  await page.locator('.ex-detail a', {hasText: 'Атлас: М’язова система'}).click();
  await page.waitForSelector('#atlas-zone-title');
  await page.waitForTimeout(250);
  check(where, (await page.locator('#atlas-zone-title').innerText()).includes('М’язова'), 'zone link from the exercise did not select the zone');
  await page.goto(origin + '/atlas.html?zone=not-a-zone');
  await page.waitForTimeout(250);
  check(where, (await page.locator('#atlas-zone-title').innerText()).includes('Плечовий'), 'unknown ?zone= should fall back to the default zone');
  // Anchors that the pages create at runtime must exist for the links the zone offers.
  for (const [file, id] of [['muscle-lab.html', 'explorer'], ['muscle-lab.html', 'contraction'], ['muscle-lab.html', 'growth'], ['muscle-lab.html', 'sources'], ['movement.html', 'muscle-team'], ['movement.html', 'sources']]) {
    await page.goto(`${origin}/${file}`);
    await page.waitForTimeout(300);
    check(where, (await page.locator(`#${id}`).count()) === 1, `${file}#${id} does not exist at runtime`);
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, `third-party requests: ${seen.external.join(', ')}`);
  await context.close();
}

async function spineFlow(browser, origin, viewport) {
  const where = `atlas spine zone @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/atlas.html?zone=spine');
  check(where, (await page.locator('#atlas-zone-title').innerText()).includes('Хребет'), '?zone=spine did not select the zone');
  check(where, (await page.locator('#atlas-zone-status').innerText()).trim() === 'Бета', 'spine zone is not Beta');
  // Safety first: the overview points to red flags, and the red-flag tab is static.
  await page.locator('#atlas-content [data-goto-tab="symptoms"]').first().click();
  check(where, (await page.locator('[data-atlas-tab="symptoms"]').getAttribute('aria-selected')) === 'true', 'safety link did not open the symptoms tab');
  check(where, (await page.locator('.atlas-alert li').count()) >= 7, 'red-flag list is incomplete');
  check(where, /Точка болю не дорівнює джерелу болю/.test(await page.locator('#atlas-content').innerText()), 'pain-location caveat is missing');
  // Practice is after the safety link and is generic (not tied to a pointed spot).
  await page.click('[data-atlas-tab="training"]');
  await page.waitForSelector('.atlas-practice-list a');
  const order = await page.evaluate(() => {
    const content = document.getElementById('atlas-content');
    const safety = content.querySelector('[data-goto-tab="symptoms"]');
    const list = content.querySelector('.atlas-practice-list');
    return !!safety && !!list && !!(safety.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  check(where, order, 'the safety link must come before the exercise list');
  // Anatomy hub: regions work without 3D, and 3D is only requested after a click.
  await page.click('[data-atlas-tab="anatomy"]');
  await page.waitForSelector('.spine-region-btn');
  check(where, (await page.locator('.spine-region-btn').count()) === 4, 'expected four regions');
  check(where, !seen.requested.some(u => u.startsWith('/spine-viewer.js')), 'the 3D bundle was requested before the click');
  await page.locator('.spine-region-btn', {hasText: 'Поперековий'}).click();
  check(where, /L1–L5/.test(await page.locator('.spine-region-info').innerText()), 'region info did not update');
  check(where, (await page.locator('.spine-region-btn[aria-pressed="true"]').count()) === 1, 'one region should be pressed');
  await page.locator('.spine-region-btn', {hasText: 'Поперековий'}).click();
  check(where, (await page.locator('.spine-region-btn[aria-pressed="true"]').count()) === 0, 'second click should clear the region');
  await page.click('.spine-launch');
  await page.waitForFunction(() => document.querySelector('.spine-canvas') || /недоступна|Не вдалося/.test(document.querySelector('.spine-viewer-note')?.textContent || ''), null, {timeout: 15000});
  const hasCanvas = (await page.locator('.spine-canvas').count()) === 1;
  if (hasCanvas) {
    check(where, seen.requested.some(u => u.startsWith('/spine-viewer.js')), 'canvas shown without loading the bundle');
    const canvas = page.locator('.spine-canvas');
    check(where, (await canvas.getAttribute('role')) === 'img' && /3D-модель хребта/.test(await canvas.getAttribute('aria-label')), 'canvas has no accessible name');
    const box = await canvas.boundingBox();
    check(where, box.width > 200 && box.height > 200, 'canvas is too small');
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('+');
    check(where, await page.evaluate(() => document.activeElement?.classList.contains('spine-canvas')), 'keyboard focus left the canvas');
    // A press on the model selects a region (drawn at the centre of the column).
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.45);
    await page.waitForTimeout(250);
    check(where, (await page.locator('.spine-region-btn[aria-pressed="true"]').count()) <= 1, 'pressing the model must select at most one region');
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the 3D model open');
    await page.click('text=Сховати 3D');
    check(where, (await page.locator('.spine-canvas').count()) === 0, 'the canvas stays after "Сховати 3D"');
  } else {
    check(where, /WebGL|недоступна|Не вдалося/.test(await page.locator('.spine-viewer-note').innerText()), 'no 3D and no fallback message');
  }
  await page.locator('.spine-region-btn', {hasText: 'Шийний'}).click();
  check(where, /C1–C7/.test(await page.locator('.spine-region-info').innerText()), 'regions stop working after the 3D step');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, `third-party requests: ${seen.external.join(', ')}`);
  await context.close();
  return hasCanvas;
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

const webgl = [];
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
  for (const viewport of viewports) await musclesFlow(browser, origin, viewport);
  for (const viewport of viewports) webgl.push(await spineFlow(browser, origin, viewport));
  await homeMenuFlow(browser, origin);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`Browser QA failed (${failures.length} of ${checks} checks):\n` + failures.map(f => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks} checks over ${files.length} pages × ${viewports.length} viewports plus library, atlas, muscles-zone, spine-zone and home-menu flows (3D model rendered: ${webgl.filter(Boolean).length}/${webgl.length}).`);
