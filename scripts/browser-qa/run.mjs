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

const headerGeometry = new Map();
async function generic(browser, origin, viewport, file) {
  const where = `${file} @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
  await page.waitForSelector('.eua-site-header');
  check(where, (await page.locator('.eua-site-header').count()) === 1, 'exactly one common header is required');
  check(where, (await page.locator('.eua-header-wordmark small').innerText()).includes('ЗДОРОВ’Я'), 'the common brand tagline is missing');
  check(where, (await page.locator('.eua-site-header nav a').count()) === 7, 'common navigation must contain the same seven destinations');
  // Compare actual rendered positions, not just common markup: the digestion
  // page previously lacked a border-box reset and made the same header taller.
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(mobile => {
    const selectors=['.eua-site-header','.eua-header-brand','.eua-header-emblem','.eua-header-wordmark',mobile?'.eua-header-toggle':'.eua-header-links'];
    return selectors.map(selector=>{
      const rect=document.querySelector(selector).getBoundingClientRect();
      return {selector,x:rect.x,y:rect.y,width:rect.width,height:rect.height};
    });
  }, viewport.name === 'mobile');
  const reference=headerGeometry.get(viewport.name);
  if(!reference)headerGeometry.set(viewport.name,geometry);
  else for(let i=0;i<geometry.length;i++)for(const axis of ['x','y','width','height']){
    check(where,Math.abs(geometry[i][axis]-reference[i][axis])<=1,`${geometry[i].selector} ${axis}=${geometry[i][axis]} differs from shared reference ${reference[i][axis]}`);
  }
  if(viewport.name === 'mobile'){
    const menu=page.locator('.eua-header-links'),toggle=page.locator('.eua-header-toggle');
    check(where, !(await menu.isVisible()), 'common menu must start closed on a phone');
    await toggle.click();
    check(where, await menu.isVisible(), 'common menu must open');
    await page.keyboard.press('Escape');
    check(where, !(await menu.isVisible()), 'Escape must close the common menu');
    check(where, await toggle.evaluate(n=>document.activeElement===n), 'Escape must restore focus to the menu toggle');
  }
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
  // Arrangement: grouping adds headings, sorting reorders, neither loses an exercise.
  await page.selectOption('#ex-view', 'type');
  check(where, (await page.locator('.ex-group-heading').count()) >= 3, 'grouped view shows no type headings');
  check(where, (await page.locator('.ex-card').count()) === total, 'grouping changed the number of exercises');
  check(where, /view=type/.test(page.url()), 'grouped view is not kept in the address');
  await page.selectOption('#ex-sort', 'title');
  const names = await page.locator('.ex-card-title a').allInnerTexts();
  check(where, names.length === total, 'sorting changed the number of exercises');
  await page.selectOption('#ex-view', '');
  await page.selectOption('#ex-sort', '');
  check(where, (await page.locator('.ex-group-heading').count()) === 0, 'plain view still shows group headings');
  if (viewport.width <= 640) {
    const navHeight = await page.locator('.eua-platform-nav').first().evaluate(node => node.getBoundingClientRect().height);
    check(where, navHeight < 135, `shared navigation takes ${Math.round(navHeight)}px on a phone`);
  }
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

async function nutritionFlow(browser, origin, viewport) {
  const where = `nutrition @${viewport.name}`;
  const {context, page} = await open(browser, origin, viewport, '/nutrition.html');
  await page.waitForSelector('#nl-cell');
  const phone = viewport.width <= 760;
  check(where, (await page.locator('.eua-platform-nav').count()) === 1, 'shared navigation must be injected exactly once');
  check(where, (await page.locator('[data-nl-depth]').count()) === 0, 'the retired depth switcher is back');
  check(where, (await page.locator('.nl-page-nav').count()) === 1, 'expected a single page navigation');
  // Folds are collapsed by default; the shared context paragraph is not repeated per card.
  check(where, (await page.locator('details.nl-fold[open]').count()) === 0, 'evidence folds must start collapsed');
  const routes = page.locator('[data-nl-nutrient]');
  check(where, (await routes.count()) === 3, 'expected three routes');
  for (let r = 0; r < 3; r++) {
    await routes.nth(r).click();
    check(where, (await page.locator('#nl-legend li').count()) >= 2, `route ${r + 1} has no legend`);
    const steps = page.locator('[data-nl-step]');
    check(where, (await steps.count()) === 4, `route ${r + 1} must have four steps`);
    for (let i = 0; i < 4; i++) {
      await steps.nth(i).click();
      check(where, (await steps.nth(i).getAttribute('aria-pressed')) === 'true', `route ${r + 1} step ${i + 1} not selected`);
      check(where, (await page.locator('#nl-step-text h3').innerText()).length > 3, `route ${r + 1} step ${i + 1} has no heading`);
    }
  }
  const stage = await page.locator('#nl-stage').boundingBox();
  check(where, stage && stage.width > (phone ? 280 : 500) && stage.height > 150, 'the diagram is too small');
  // Single play button toggles; a second press pauses.
  await routes.nth(0).click();
  const play = page.locator('[data-nl-action="play"]').first();
  await play.click();
  check(where, (await play.getAttribute('aria-pressed')) === 'true', 'play did not start');
  await page.waitForTimeout(2600);
  check(where, Number((await page.locator('#nl-counter').innerText()).match(/\d/)?.[0]) >= 2, 'playback did not advance');
  await play.click();
  check(where, (await play.getAttribute('aria-pressed')) === 'false', 'the second press must pause');
  // The timeline heading stays; the chart opens on demand and is compact.
  check(where, !(await page.locator('#chart').isVisible()), 'the timeline chart must be folded by default');
  const folded = (await page.locator('#nutrient-time').boundingBox()).height;
  check(where, folded < 260, `folded timeline is too tall (${folded}px)`);
  await page.locator('.nl-time-fold > summary').click();
  check(where, (await page.locator('#chart .row').first().isVisible()) && (await page.locator('#chart .row').count()) === 3, 'opening the fold must show the three nutrient rows');
  check(where, (await page.locator('#nutrient-time').boundingBox()).height < (phone ? 1700 : 1250), 'the open timeline is not compact');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the timeline open');
  // Timeline directly follows the lab, readable on the dark theme.
  const order = await page.evaluate(() => ['nutrition-lab', 'nutrient-time', 'nutrition-evidence'].map(id => document.getElementById(id).getBoundingClientRect().top + scrollY));
  check(where, order[0] < order[1] && order[1] < order[2], 'timeline must follow the lab and precede the evidence');
  check(where, (await page.locator('#nutrient-time').evaluate(n => getComputedStyle(n).backgroundColor)).match(/\d+/g).slice(0, 3).every(v => Number(v) < 80), 'the timeline is not dark');
  // Diets: horizontal strip on phones.
  if (phone) {
    const grid = page.locator('.nd-grid').first();
    const strip = await grid.evaluate(n => ({scroll: n.scrollWidth, client: n.clientWidth, overflowX: getComputedStyle(n).overflowX}));
    check(where, strip.overflowX === 'auto' && strip.scroll > strip.client + 50, 'diets must be a swipeable strip on phones');
  }
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  check(where, height < (phone ? 8000 : 6500), `page is too long again (${height}px)`);
  await context.close();
}

async function supplementsFlow(browser, origin, viewport) {
  const where = `supplements @${viewport.name}`;
  const {context, page} = await open(browser, origin, viewport, '/supplements.html');
  await page.waitForSelector('.sp-row');
  const phone = viewport.width <= 900;
  // Owner request: remove the entire secondary tools/navigation block on this page.
  check(where, (await page.locator('.eua-platform-nav').count()) === 0, 'retired secondary navigation returned');
  check(where, (await page.locator('.eua-site-header').count()) === 1, 'one common site header is required');
  const hero = await page.locator('.sp-head').boundingBox();
  const pattern = await page.locator('.sp-shippo').boundingBox();
  check(where, hero && hero.x <= 1 && hero.width >= viewport.width - 1, 'the title band must span the viewport');
  check(where, pattern && pattern.width >= viewport.width - 1, 'shippo pattern must span the viewport');
  check(where, (await page.locator('.sp-row').count()) === 10, 'expected ten supplements');
  // Every entry has a photo, a folded limit and a link to its existing dossier.
  const links = await page.locator('.sp-go').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
  check(where, links.length === 10 && links.every(h => h.startsWith('./index.html#')), 'every row must link to its dossier');
  check(where, (await page.locator('.sp-limit[open]').count()) === 0, 'limits must start folded');
  await page.locator('.sp-limit summary').first().click();
  check(where, (await page.locator('.sp-limit[open] p').first().isVisible()), 'opening the limit must show its text');
  const photo = await page.locator('.sp-photo').first().boundingBox();
  check(where, photo && photo.width >= (phone ? 80 : 120), `photo too small: ${photo && photo.width}`);
  // Filter and search.
  await page.locator('[data-sp-filter="health"]').click();
  check(where, (await page.locator('.sp-row').count()) === 3, 'the health filter must show three rows');
  check(where, (await page.locator('[data-sp-filter="health"]').getAttribute('aria-pressed')) === 'true', 'the filter is not marked pressed');
  await page.locator('[data-sp-filter="all"]').click();
  await page.locator('#sp-q').fill('креа');
  check(where, (await page.locator('.sp-row').count()) === 1 && (await page.locator('#sp-count').innerText()).includes('1 з 10'), 'search by name failed');
  await page.locator('#sp-q').fill('qwerty');
  check(where, await page.locator('#sp-empty').isVisible(), 'the empty state must show for no results');
  await page.locator('#sp-q').fill('');
  // Heading font is the self-hosted serif, nothing overflows, filters are one row on phones.
  check(where, (await page.locator('.sp-head h1').evaluate(n => getComputedStyle(n).fontFamily)).includes('Source Serif 4'), 'heading font is not the site serif');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
  if (phone) {
    const chips = await page.locator('.sp-chips').evaluate(n => ({scroll: n.scrollWidth, client: n.clientWidth}));
    check(where, chips.scroll >= chips.client, 'filter chips misbehave on phones');
  }
  // The photo strip is the real sprite, not an empty box.
  check(where, (await page.locator('.sp-photo').first().evaluate(n => getComputedStyle(n).backgroundImage)).includes('supplement-backgrounds'), 'photo sprite not applied');
  await context.close();
}

async function pineFlow(browser, origin, viewport) {
  // Pages that adopted the pine theme: patterned band, serif heading, folded tools line, no overflow, motif visible.
  for (const [file, motif] of [['exercises.html', 'yagasuri'], ['atlas.html', 'asanoha'], ['directions.html', 'kumiko'], ['nutrition.html', 'nami'], ['muscle-lab.html', 'take'], ['cell-lab.html', 'kikko'], ['movement.html', 'seigaiha'], ['sleep.html', 'kasumi'], ['nutrition-digestion.html', 'enso'], ['protein-meta.html', 'shippo']]) {
    const where = `pine ${file} @${viewport.name}`;
    const {context, page} = await open(browser, origin, viewport, '/' + file);
    await page.waitForSelector('.pb h1');
    check(where, (await page.locator('.pb').getAttribute('data-motif')) === motif, 'motif attribute');
    check(where, (await page.locator('.pb h1').evaluate(n => getComputedStyle(n).fontFamily)).includes('Source Serif 4'), 'heading font is not the site serif');
    const band = await page.locator('.pb').boundingBox();
    check(where, band && Math.abs(band.width - viewport.width) <= 1, `the band must span the full width (${band && band.width})`);
    check(where, (await page.locator('.pb').evaluate(n => getComputedStyle(n, '::before').backgroundImage)).includes('data:image/svg+xml'), 'the motif is not drawn');
    const toolsLines = (await page.locator('body[data-study-ui], body[data-pine-tools]').count()) ? 0 : await page.locator('body > .eua-platform-nav').count();
    check(where, toolsLines === 0 || (await page.locator('body > .eua-platform-nav details.eua-module-menu').count()) === 1, 'the tools line must be one folded disclosure');
    check(where, (await page.locator('body > .eua-platform-nav details[open]').count()) === 0, 'the tools line must start folded');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number));
    check(where, bg[1] > bg[2] && bg[0] < 30, `the page background is not pine-green: ${bg}`);
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
    await context.close();
  }
}

async function muscleLabFlow(browser, origin, viewport) {
  const where = `muscle lab @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/muscle-lab.html');
  await page.waitForSelector('#scale-art svg');
  const phone = viewport.width <= 760;
  check(where, (await page.locator('.eua-platform-nav').count()) === 1, 'shared navigation must be injected exactly once (no <header> inside topic cards)');
  check(where, (await page.locator('[data-level]').count()) === 0, 'the retired level switcher is back');
  // One scale control: six buttons, each shows its own drawing and legend.
  const scaleButtons = page.locator('#scales [data-structure]');
  check(where, (await scaleButtons.count()) === 6, 'expected six scale buttons');
  const drawings = new Set();
  for (let i = 0; i < 6; i++) {
    await scaleButtons.nth(i).click();
    drawings.add(await page.locator('#scale-art svg').getAttribute('aria-label'));
    check(where, (await scaleButtons.nth(i).getAttribute('aria-pressed')) === 'true', `scale ${i + 1} is not marked selected`);
    check(where, (await page.locator('#scale-legend li').count()) >= 3, `scale ${i + 1} has no legend`);
    const box = await page.locator('#scale-art svg').boundingBox();
    check(where, box && box.width > 200 && box.height > 100, `scale ${i + 1} drawing is too small`);
  }
  check(where, drawings.size === 6, 'each scale must show its own drawing');
  check(where, /structure=PRT-ACTIN-MYOSIN/.test(page.url()) && !/level=/.test(page.url()), 'the address keeps the structure and no level');
  // Contraction: the cycle changes by attribute, the sarcomere slides, filaments keep their length.
  await page.locator('#contraction').scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-step-topic="contraction"]').nth(i).click();
    check(where, (await page.locator('#scene-contraction svg').getAttribute('data-step')) === String(i), `cycle step ${i + 1} not applied`);
  }
  const head = await page.locator('.cy-head').evaluate(node => getComputedStyle(node).transform);
  check(where, head && head !== 'none', 'the myosin head has no transform');
  await page.locator('#shortening').fill('100');
  check(where, (await page.locator('[data-sarcomere-stage] svg').getAttribute('data-sarcomere-t')) === '1', 'the slider does not move the sarcomere');
  check(where, (await page.locator('[data-readout-state="length"]').innerText()).includes('не змінюється'), 'filament length must read as unchanged');
  await page.locator('#shortening').fill('0');
  await page.locator('[data-sarcomere-play]').click();
  await page.waitForTimeout(900);
  const moving = Number(await page.locator('[data-sarcomere-stage] svg').getAttribute('data-sarcomere-t'));
  check(where, moving > 0 && moving < 1, `the sarcomere animation is not running (t=${moving})`);
  await page.locator('[data-sarcomere-play]').click();
  const paused = await page.locator('[data-sarcomere-stage] svg').getAttribute('data-sarcomere-t');
  await page.waitForTimeout(300);
  check(where, (await page.locator('[data-sarcomere-stage] svg').getAttribute('data-sarcomere-t')) === paused, 'the animation did not pause');
  // Growth and atrophy share one stepper; on a phone one of them is shown at a time.
  await page.locator('#adaptation').scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-mirror-step]').nth(i).click();
    const steps = [await page.locator('#scene-growth svg').getAttribute('data-step'), await page.locator('#scene-atrophy svg').getAttribute('data-step')];
    check(where, steps.every(step => step === String(i)), `mirror step ${i + 1} not applied to both panels: ${steps}`);
  }
  const visible = async id => page.locator(id).isVisible();
  if (phone) {
    check(where, (await visible('#growth')) && !(await visible('#atrophy')), 'on a phone only growth should show first');
    await page.locator('[data-mirror-show="atrophy"]').click();
    check(where, !(await visible('#growth')) && (await visible('#atrophy')), 'the atrophy tab does not switch the panel');
    check(where, (await page.evaluate(() => document.documentElement.scrollHeight)) < 7000, 'the phone page is too long again');
  } else {
    check(where, (await visible('#growth')) && (await visible('#atrophy')), 'on a desktop both mirrored panels should show');
  }
  // Evidence stays one click away and sources are collapsed by default.
  await page.locator(`${phone ? '#atrophy' : '#growth'} [data-claim-open]`).click();
  check(where, await page.locator('#eua-evidence-dialog').evaluate(node => node.open), 'the evidence drawer does not open');
  await page.keyboard.press('Escape');
  check(where, !(await page.locator('.source-details').evaluate(node => node.open)), 'the source list should start collapsed');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `console errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, `third-party request: ${seen.external.join(', ')}`);
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

async function visibleAfterDisclosureTransition(locator){
  try{await locator.waitFor({state:'visible',timeout:1500});return true;}
  catch{return false;}
}

// Home restyle keeps the working library and disclosures; decorations never
// receive pointer input and the palette is shared with the Supplements page.
async function homeLowerFlow(browser, origin, viewport) {
  const where=`home pine/shippo @${viewport.name}`;
  const {context,page,seen}=await open(browser,origin,viewport,'/index.html');
  await page.waitForSelector('.evidence-guide');
  const style=await page.evaluate(()=>{
    const category=document.querySelector('#categories'),guide=document.querySelector('.evidence-guide');
    const fragments=[[category,'::before'],[category,'::after'],[guide,'::before']].map(([e,pseudo])=>{
      const css=getComputedStyle(e,pseudo);return {image:css.backgroundImage,pointer:css.pointerEvents,opacity:Number(css.opacity),width:parseFloat(css.width)};
    });
    return {background:getComputedStyle(category).backgroundColor,footer:getComputedStyle(document.querySelector('.mission')).backgroundColor,
      title:getComputedStyle(document.querySelector('#start-here-title')).fontFamily,
      surface:getComputedStyle(document.querySelector('.start-choices>a')).backgroundColor,fragments};
  });
  check(where,style.background==='rgb(13, 25, 22)'&&style.footer===style.background,'pine background must continue through the footer');
  check(where,style.surface==='rgb(20, 37, 32)','choice cards must use the Supplements surface');
  check(where,style.title.includes('Source Serif 4'),'section headings must share the Supplements serif');
  for(const fragment of style.fragments){
    check(where,fragment.image.includes('home-shippo.svg'),'each fragment must use the same shippo repeat');
    check(where,fragment.pointer==='none'&&fragment.opacity>0&&fragment.opacity<=.35,'decorations must stay quiet and noninteractive');
    check(where,fragment.width<=viewport.width*.7,'shippo must be fragmented, not a full-width stripe');
  }
  // The carousel is gone: one short entry leads to the catalogue and to every existing dossier.
  check(where,await page.locator('#supplement-carousel, .supplement-rail, #supplement-search').count()===0,'the retired supplement carousel is back on the home page');
  check(where,(await page.locator('.supplement-entry .se-cta').getAttribute('href'))==='./supplements.html','the entry must lead to the catalogue');
  const entryLinks=await page.locator('.supplement-entry .se-list a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  check(where,entryLinks.length===10&&entryLinks.every(h=>h.startsWith('#')),'ten entry chips must link to the existing dossiers');
  check(where,(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'horizontal overflow in the supplement entry');
  await page.locator('#home-overview>summary').click();
  // Details content expands over 280 ms; wait for actual visibility instead of
  // sampling during the first, clipped animation frame.
  const overviewContent=page.locator('#home-overview .home-overview-grid');
  check(where,await visibleAfterDisclosureTransition(overviewContent),'overview must still expand');
  await page.locator('.evidence-guide>details').nth(1).locator('summary').first().click();
  check(where,await visibleAfterDisclosureTransition(page.locator('.guide-example')),'evidence example must open');
  check(where,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'opened home content must not overflow horizontally');
  await page.emulateMedia({reducedMotion:'reduce'});
  check(where,await page.locator('#categories').evaluate(e=>getComputedStyle(e,'::before').animationName)==='none','reduced motion must disable shippo movement');
  check(where,seen.pageErrors.length===0&&seen.console.length===0,'home interactions must remain error-free');
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
  for (const viewport of viewports) await muscleLabFlow(browser, origin, viewport);
  for (const viewport of viewports) await nutritionFlow(browser, origin, viewport);
  for (const viewport of viewports) await supplementsFlow(browser, origin, viewport);
  for (const viewport of viewports) await pineFlow(browser, origin, viewport);
  for (const viewport of viewports) await atlasFlow(browser, origin, viewport);
  for (const viewport of viewports) await musclesFlow(browser, origin, viewport);
  for (const viewport of viewports) webgl.push(await spineFlow(browser, origin, viewport));
  await homeMenuFlow(browser, origin);
  for (const viewport of viewports) await homeLowerFlow(browser, origin, viewport);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`Browser QA failed (${failures.length} of ${checks} checks):\n` + failures.map(f => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks} checks over ${files.length} pages × ${viewports.length} viewports plus library, muscle lab, atlas, muscles-zone, spine-zone and home-menu flows (3D model rendered: ${webgl.filter(Boolean).length}/${webgl.length}).`);
