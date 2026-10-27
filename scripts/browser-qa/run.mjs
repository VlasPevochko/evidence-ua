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

// Keep actionable failures available through GitHub's check annotations as well
// as runner logs, whose external storage may be inaccessible to a reviewer.
function annotateFailure(message) {
  const escaped=String(message).slice(0,12000).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A');
  console.error(`::error title=Browser QA::${escaped}`);
}
process.on('uncaughtExceptionMonitor', error => annotateFailure(error.stack || error));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = process.env.QA_DIST_DIRECTORY ? path.resolve(process.env.QA_DIST_DIRECTORY) : path.join(root, 'dist');
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
async function isolatedFlow(flow, browser, origin, viewport) {
  try { return await flow(browser, origin, viewport); }
  catch (error) {
    const message = error.stack || String(error);
    annotateFailure(`${flow.name} @${viewport.name}: ${message}`);
    fail(`${flow.name} @${viewport.name}`, message);
  }
}
let checks = 0;
const check = (where, ok, message) => { checks++; if (!ok) fail(where, message); };

async function open(browser, origin, viewport, route, {initScript} = {}) {
  const context = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, serviceWorkers: 'block'});
  if (initScript) await context.addInitScript(initScript);
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

// CI may retain small views of the changed states without screenshotting whole pages.
async function artifact(page, viewport, name, locator) {
  if (!process.env.QA_ARTIFACT_DIR) return;
  const dir = path.resolve(process.env.QA_ARTIFACT_DIR);
  fs.mkdirSync(dir, {recursive: true});
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No screenshot target for ${name}`);
  const x = Math.max(0, box.x), y = Math.max(0, box.y);
  const width = Math.min(box.x + box.width, viewport.width) - x;
  const height = Math.min(box.y + box.height, viewport.height) - y;
  if (width <= 0 || height <= 0) throw new Error(`Screenshot target outside viewport: ${name}`);
  await page.screenshot({path: path.join(dir, `${name}-${viewport.name}.png`), clip: {x, y, width, height}});
}

const headerGeometry = new Map();
async function generic(browser, origin, viewport, file) {
  const where = `${file} @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
  await page.waitForSelector('.eua-site-header');
  check(where, (await page.locator('.eua-site-header').count()) === 1, 'exactly one common header is required');
  check(where, (await page.locator('.eua-header-wordmark small').innerText()).includes('ЗДОРОВ’Я'), 'the common brand tagline is missing');
  check(where, (await page.locator('.eua-site-header nav a').count()) === 6, 'common navigation has six destinations after merging the duplicate catalog entry');
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
  const {context, page} = await open(browser, origin, viewport, '/index.html');
  // Regression: the visible general Nutrition CTA must not bypass the hub into physiology.
  await page.getByRole('link',{name:/Розібрати харчування/}).click();
  await page.waitForURL('**/nutrition.html');
  await page.locator('[data-nutrition-menu]').waitFor({state:'attached'});
  // Owner-approved 2026-10-25: Nutrition is the entry; all mechanisms live in its physiology branch.
  check(where,(await page.locator('.nutrition-branch').count())===2,'two clear Nutrition branches');
  check(where,(await page.locator('#nutrition-lab').count())===0,'the entry must not contain the lab');
  check(where,(await page.locator('.nd-card').count())===8,'all diets remain on the entry');
  const utilities=page.locator('[data-nutrition-menu]');
  check(where,!(await utilities.evaluate(n=>n.open)),'utilities start closed');
  await utilities.locator(':scope > summary').click();
  check(where,await utilities.locator('[data-eua-tool="share"]').isVisible(),'share action remains available');
  await page.keyboard.press('Escape');
  check(where,!(await utilities.evaluate(n=>n.open)),'Escape closes the utilities');
  check(where,await utilities.locator(':scope > summary').evaluate(n=>n===document.activeElement),'Escape returns focus');
  await utilities.locator(':scope > summary').click();
  // On a phone the popup covers the heading; the page gutter is actually outside it.
  await page.mouse.click(4,Math.min(200,viewport.height-1));
  check(where,!(await utilities.evaluate(n=>n.open)),'outside click closes the utilities');
  if(viewport.width<=760){
    const strip=await page.locator('.nd-grid').evaluate(n=>({scroll:n.scrollWidth,client:n.clientWidth,overflow:getComputedStyle(n).overflowX}));
    check(where,strip.overflow==='auto'&&strip.scroll>strip.client+50,'diets keep their phone strip');
  }
  await page.locator('.nutrition-branch[href="./nutrition-inside.html"]').click();
  await page.waitForSelector('#nl-cell');
  // The model SVG is authored HTML; wait for the deferred shared shell as well.
  await page.locator('.eua-platform-nav').waitFor({state:'attached'});
  const phone = viewport.width <= 760;
  check(where, (await page.locator('.eua-platform-nav').count()) === 1, 'shared navigation must be injected exactly once');
  check(where, (await page.locator('[data-nl-depth]').count()) === 0, 'the retired depth switcher is back');
  check(where, (await page.locator('.nl-page-nav').count()) === 1, 'expected a single page navigation');
  // User discovery: the Fat Burning Lab must be prominent within Nutrition, not only in the global catalogue.
  const featured=page.locator('#nutrition-fat-burning');
  check(where,await featured.isVisible(),'the Fat Burning Lab entry must be visible without expanding a disclosure');
  check(where,(await page.locator('.nl-page-nav .nf-nav').getAttribute('href'))==='#nutrition-fat-burning','top menu must point to the featured entry');
  check(where,(await featured.locator('.nf-open').getAttribute('href'))==='./fat-burning.html','featured CTA must open the Lab directly');
  check(where,(await page.locator('#nutrition-diets').count())===0,'diets stay on the entry');
  check(where,(await featured.locator('.nf-open').count())===1,'one clear featured action');
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
  // Explicit chips must bring the selected geometry inside the clipped stage,
  // including the pump (which is below the glucose route's ordinary focus).
  for (const route of ['glucose', 'protein', 'lipids']) {
    await page.locator(`[data-nl-nutrient="${route}"]`).click();
    const ids = await page.locator('[data-nl-structure]').evaluateAll(nodes => nodes.map(n => n.dataset.nlStructure));
    for (const id of ids) {
      await page.locator(`[data-nl-structure="${id}"]`).click();
      await page.waitForFunction(() => !document.querySelector('#nl-cell').getAnimations().some(a => a.playState === 'running'));
      const geometry = await page.locator(`#nl-stage [data-nl-highlight="${id}"]`).evaluate(node => {
        const target = node.getBoundingClientRect(), frame = document.getElementById('nl-stage').getBoundingClientRect();
        return {visible: target.width > 0 && target.height > 0 && getComputedStyle(node).display !== 'none',
          inside: target.left >= frame.left - 1 && target.right <= frame.right + 1 && target.top >= frame.top - 1 && target.bottom <= frame.bottom + 1};
      });
      check(where, (await page.locator(`[data-nl-structure="${id}"]`).getAttribute('aria-pressed')) === 'true', `${id} chip does not select its structure`);
      check(where, geometry.visible && geometry.inside, `${id} is clipped outside #nl-stage after the focus transition`);
      if (!phone) check(where, await page.locator('#nl-cell').evaluate(node => {
        const m = new DOMMatrix(getComputedStyle(node).transform);
        return m.isIdentity;
      }), `${id} must keep the ordinary desktop transform`);
      if (id === 'pump') await artifact(page, viewport, 'nutrition-pump', page.locator('#nl-stage'));
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
  await page.waitForFunction(() => !document.querySelector('#nl-cell').getAnimations().some(a => a.playState === 'running'));
  check(where, !new URL(page.url()).searchParams.has('structure'), 'ordinary playback must clear the manual structure selection');
  check(where, await page.locator('#nl-glucose-particle').evaluate(node => {
    const p = node.getBoundingClientRect(), stage = document.getElementById('nl-stage').getBoundingClientRect();
    return p.width > 0 && p.left >= stage.left - 1 && p.right <= stage.right + 1 && p.top >= stage.top - 1 && p.bottom <= stage.bottom + 1;
  }), 'ordinary playback must keep the current route particle in the stage after selecting a structure');

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
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  check(where, height < (phone ? 8350 : 6800), `page is too long again (${height}px)`);
  await featured.locator('.nf-open').click();
  await page.waitForURL(/\/fat-burning\.html$/);
  check(where,(await page.locator('#fb-title').innerText()).includes('зникає жир'),'featured link opens the real Fat Burning Lab');
  await page.goto(origin+'/nutrition.html?nutrient=protein&step=2&scale=cell#nutrition-lab');
  await page.waitForURL(/nutrition-inside\.html/);
  check(where,(await page.locator('[data-nl-nutrient="protein"]').getAttribute('aria-pressed'))==='true','legacy nutrient remains selected');
  check(where,(await page.locator('#nl-counter').innerText()).includes('3 / 4'),'legacy step remains selected');
  await page.goto(origin+'/nutrition.html#diet-vegan');
  check(where,(await page.locator('#diet-vegan').count())===1&&(await page.locator('#nutrition-lab').count())===0,'diet bookmark stays on Nutrition');
  await context.close();
}

async function continueFlow(browser, origin, viewport) {
  const where = `continue @${viewport.name}`;
  // A fresh visitor sees no card; after opening a material the home page offers to continue there.
  const first = await open(browser, origin, viewport, '/index.html');
  check(where, (await first.page.locator('.eua-continue').count()) === 0, 'a first-time visitor must not see «Продовжити»');
  await first.page.goto(origin + '/nutrition.html', {waitUntil: 'load'});
  await first.page.goto(origin + '/index.html', {waitUntil: 'load'});
  const card = first.page.locator('#start-here .eua-continue');
  check(where, (await card.count()) === 1, 'home must offer to continue after a material was opened');
  check(where, (await card.getAttribute('href')).startsWith('./nutrition.html'), 'the card must lead back to the last material (Nutrition keeps its own step in the URL)');
  check(where, !/Evidence UA/.test(await card.locator('strong').innerText()), 'the card names the material without the site suffix');
  const box = await card.boundingBox();
  check(where, box && box.height >= 44 && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'the card must be a comfortable tap target inside the viewport');
  check(where, (await first.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the continue card');
  await first.context.close();
}

async function trainerFlow(browser, origin, viewport) {
  const where = `trainer @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  const trainer = page.locator('.evidence-guide .eua-trainer');
  await trainer.waitFor({state: 'attached'});
  await trainer.scrollIntoViewIfNeeded();
  check(where, (await trainer.locator('.eua-trainer-option').count()) === 3, 'a card offers three readings');
  // Wrong answer first: it must be explained, not just marked.
  const options = trainer.locator('.eua-trainer-option');
  // On the first card the right reading is the second one, so the first option is a wrong answer.
  await options.nth(0).click();
  check(where, (await trainer.locator('.eua-trainer-why').count()) === 3, 'every reading is explained after an answer');
  check(where, (await trainer.locator('.eua-trainer-mark').count()) === 2, 'the right and the chosen option carry a text mark, not only colour');
  check(where, (await options.evaluateAll(nodes => nodes.every(n => n.disabled))), 'options lock after an answer');
  const link = trainer.locator('.eua-trainer-source');
  check(where, (await link.getAttribute('href')).startsWith('https://pubmed.ncbi.nlm.nih.gov/') && (await link.getAttribute('rel')).includes('noopener'), 'the source is a safe PubMed link');
  // 12 cards since 2026-10-22 (five cards from the new supplement cards).
  const cards = await trainer.evaluate(() => 12);
  for (let i = 0; i < cards; i++) {
    const next = trainer.locator('.eua-trainer-feedback .eua-trainer-btn');
    check(where, await next.isVisible(), 'the next button must be reachable');
    const box = await next.boundingBox();
    check(where, box && box.height >= 44 && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'next button must be a tap target inside the viewport');
    await next.click();
    if (i < cards - 1) await trainer.locator('.eua-trainer-option').first().click();
  }
  check(where, (await trainer.locator('.eua-trainer-done').count()) === 1, 'finishing shows the closing note');
  check(where, (await trainer.locator('.eua-trainer-note').innerText()).includes('не порада приймати добавки'), 'the safety note stays visible');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the trainer');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the trainer must not raise errors');
  await context.close();
}

async function appearanceFlow(browser, origin, viewport) {
  const where = `appearance @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  const html = page.locator('html');
  check(where, (await html.getAttribute('data-theme')) === null && (await html.getAttribute('data-text')) === null, 'first visit keeps the current dark look');
  const toggle = page.locator('.eua-appearance-toggle');
  check(where, (await toggle.count()) === 1 && (await toggle.getAttribute('aria-expanded')) === 'false', 'one appearance button in the header');
  const tbox = await toggle.boundingBox();
  check(where, tbox && tbox.width >= 44 && tbox.height >= 44 && tbox.x + tbox.width <= viewport.width + 1, 'the button must be a tap target inside the viewport');
  await toggle.click();
  const panel = page.locator('.eua-appearance-panel');
  check(where, await panel.isVisible(), 'the panel opens');
  const pbox = await panel.boundingBox();
  check(where, pbox && pbox.x >= 0 && pbox.x + pbox.width <= viewport.width + 1, 'the panel must stay inside the viewport');
  await panel.getByRole('radio', {name: 'Світла'}).click();
  check(where, (await html.getAttribute('data-theme')) === 'light', 'choosing «Світла» turns the light theme on');
  await panel.getByRole('radio', {name: 'Більший'}).click();
  check(where, (await html.getAttribute('data-text')) === 'lg', 'choosing «Більший» enlarges the text');
  await page.keyboard.press('Escape');
  check(where, !(await panel.isVisible()) && (await toggle.evaluate(n => n === document.activeElement)), 'Escape closes the panel and returns focus to the button');
  // The choice survives a reload and is applied before the page is shown.
  await page.reload({waitUntil: 'load'});
  check(where, (await html.getAttribute('data-theme')) === 'light' && (await html.getAttribute('data-text')) === 'lg', 'the choice must persist after reload');
  const nav = await open(browser, origin, viewport, '/nutrition-inside.html');
  await nav.context.close();
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow in light theme with larger text');
  await page.locator('.eua-appearance-toggle').click();
  await page.locator('.eua-appearance-panel').getByRole('radio', {name: 'Темна'}).click();
  await page.locator('.eua-appearance-panel').getByRole('radio', {name: 'Звичайний'}).click();
  check(where, (await html.getAttribute('data-theme')) === null && (await html.getAttribute('data-text')) === null, 'switching back restores the default look');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'appearance must not raise errors');
  await context.close();
}

async function deniedStorageFlow(browser, origin, viewport) {
  // Cover both failures browsers expose: accessing window.localStorage itself,
  // and storage methods that throw. Injection happens before any site script.
  for (const mode of ['getter', 'methods']) {
    const where = `appearance denied storage ${mode} @${viewport.name}`;
    const initScript = mode === 'getter' ? () => {
      window.__qaStorageDenials = 0;
      Object.defineProperty(window, 'localStorage', {configurable: true, get() {
        window.__qaStorageDenials++;
        throw new DOMException('Storage denied for QA', 'SecurityError');
      }});
    } : () => {
      window.__qaStorageDenials = 0;
      for (const name of ['getItem', 'setItem', 'removeItem']) Object.defineProperty(Storage.prototype, name, {configurable: true, value() {
        window.__qaStorageDenials++;
        throw new DOMException('Storage denied for QA', 'SecurityError');
      }});
    };
    const {context, page, seen} = await open(browser, origin, viewport, '/index.html', {initScript});
    const toggle = page.locator('.eua-appearance-toggle'), panel = page.locator('.eua-appearance-panel');
    await toggle.waitFor({state: 'visible'});
    check(where, await page.evaluate(() => window.__qaStorageDenials > 0), 'storage denial was not exercised at startup');
    check(where, await toggle.count() === 1, 'appearance controls still mount when reading storage is denied');
    await toggle.click();
    const denialsBeforeSave = await page.evaluate(() => window.__qaStorageDenials);
    await panel.getByRole('radio', {name: 'Світла', exact: true}).click();
    await panel.getByRole('radio', {name: 'Більший', exact: true}).click();
    check(where, await page.locator('html').getAttribute('data-theme') === 'light' && await page.locator('html').getAttribute('data-text') === 'lg', 'theme and text must apply despite denied persistence');
    check(where, await panel.getByRole('radio', {name: 'Світла', exact: true}).getAttribute('aria-checked') === 'true' && await panel.getByRole('radio', {name: 'Більший', exact: true}).getAttribute('aria-checked') === 'true', 'radio states must reflect the session choices');
    check(where, await page.evaluate(before => window.__qaStorageDenials > before, denialsBeforeSave), 'the choice must exercise denied storage writes');
    if (mode === 'getter') await artifact(page, viewport, 'appearance-storage-denied', panel);
    await page.keyboard.press('Escape');
    await toggle.click();
    check(where, await panel.getByRole('radio', {name: 'Світла', exact: true}).getAttribute('aria-checked') === 'true', 'reopening the controls must keep the current session choice');
    await panel.getByRole('radio', {name: 'Темна', exact: true}).click();
    await panel.getByRole('radio', {name: 'Звичайний', exact: true}).click();
    check(where, await page.locator('html').getAttribute('data-theme') === null && await page.locator('html').getAttribute('data-text') === null, 'defaults can still be restored without storage');
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `errors with denied storage: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
    await context.close();
  }
}

async function shareFlow(browser, origin, viewport) {
  const where = `share routes @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/exercises.html', {initScript: () => {
    // Only the browser clipboard boundary is replaced; site sanitization and
    // the real delegated click handler run unchanged.
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async text => {window.__qaCopiedLink = text;}}});
  }});
  async function copyCurrent() {
    const button = page.locator('[data-eua-tool="share"]').first();
    await button.waitFor({state: 'attached'});
    if (!await button.isVisible()) await button.locator('xpath=ancestor::details[1]').locator(':scope > summary').click();
    await page.evaluate(() => {window.__qaCopiedLink = null;});
    await button.click();
    await page.waitForFunction(() => typeof window.__qaCopiedLink === 'string');
    const link = new URL(await page.evaluate(() => window.__qaCopiedLink));
    check(where, link.origin === origin, 'the share action changed the origin');
    return link;
  }
  await page.selectOption('#ex-view', 'type');
  await page.selectOption('#ex-sort', 'title');
  await page.selectOption('#ex-filter-region', 'shoulder');
  // Add tracking and a private search to the real UI state. Share must retain
  // only validated library options, never arbitrary query parameters.
  await page.evaluate(() => {const u = new URL(location.href); u.searchParams.set('utm_source', 'qa'); u.searchParams.set('q', 'private query'); history.replaceState(null, '', u);});
  let copied = await copyCurrent();
  check(where, copied.pathname === '/exercises.html' && copied.searchParams.get('region') === 'shoulder' && copied.searchParams.get('view') === 'type' && copied.searchParams.get('sort') === 'title', 'share must preserve the library selection');
  check(where, [...copied.searchParams.keys()].every(k => ['region', 'view', 'sort'].includes(k)), 'library share leaked a private or unrelated query');
  await page.locator('.ex-card-title a').first().click();
  await page.locator('.ex-detail').waitFor({state: 'visible'});
  const selectedExercise = new URL(page.url()).searchParams.get('e');
  await page.evaluate(() => {const u = new URL(location.href); u.searchParams.set('utm_source', 'qa'); history.replaceState(null, '', u);});
  copied = await copyCurrent();
  check(where, !!selectedExercise && copied.pathname === '/exercises.html' && copied.searchParams.get('e') === selectedExercise, 'the actual share button lost the selected exercise');
  check(where, [...copied.searchParams.keys()].every(k => ['e', 'region', 'type', 'pattern', 'equipment', 'view', 'sort'].includes(k)), 'exercise share leaked unrelated parameters');
  await artifact(page, viewport, 'exercise-share', page.locator('[data-eua-tool="share"]').first().locator('xpath=ancestor::details[1]'));
  // Open the copied URL too: keeping e in a string must still lead to that detail.
  await page.goto(copied.href, {waitUntil: 'load'});
  await page.locator('.ex-detail').waitFor({state: 'visible'});
  check(where, new URL(page.url()).searchParams.get('e') === selectedExercise, 'the shared exercise address did not reopen its selection');
  await page.goto(origin + '/atlas.html?zone=spine&utm_source=qa&unrelated=value', {waitUntil: 'load'});
  check(where, /Хребет/.test(await page.locator('#atlas-zone-title').innerText()), 'share precondition: the spine zone must be selected');
  copied = await copyCurrent();
  check(where, copied.pathname === '/atlas.html' && copied.searchParams.get('zone') === 'spine' && copied.searchParams.size === 1, 'the actual share button must retain only the selected Atlas zone');
  await artifact(page, viewport, 'atlas-share', page.locator('[data-eua-tool="share"]').first().locator('xpath=ancestor::details[1]'));
  await page.goto(copied.href, {waitUntil: 'load'});
  check(where, /Хребет/.test(await page.locator('#atlas-zone-title').innerText()), 'the shared Atlas address did not reopen the spine zone');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `share errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, 'sharing must not send third-party requests');
  await context.close();
}

async function outcomeEvidenceFlow(browser, origin, viewport) {
  const where = `outcome evidence @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html#supplement-beta-alanine');
  await page.locator('#supplement-beta-alanine [data-claim-open="CLM-000096"]').click();
  let dialog = page.locator('dialog[open]');
  await dialog.waitFor({state: 'visible'});
  const source = dialog.locator('.eua-source[id$="-SRC-000103"]');
  const result = await source.locator('dd').nth(1).innerText();
  check(where, /95% Байєсівський інтервал вірогідності 2,2–32,6/.test(result) && !/95% ДІ/.test(result), 'the real SourceCard must preserve the Bayesian interval label and bounds');
  await artifact(page, viewport, 'source-bayesian-interval', source);
  await page.keyboard.press('Escape');
  await page.goto(origin + '/index.html#supplement-protein', {waitUntil: 'load'});
  await page.locator('#supplement-protein [data-claim-open="CLM-000053"]').click();
  dialog = page.locator('dialog[open]');
  const methods = dialog.locator('details').filter({has: page.locator('summary', {hasText: 'Рівень 3 · Записи доказів та методологія'})});
  check(where, !await methods.evaluate(n => n.open), 'outcome methodology must start folded');
  await methods.locator(':scope > summary').click();
  const record = methods.locator('.eua-record').filter({hasText: 'EVR-000104'});
  await record.waitFor({state: 'visible'});
  const text = await record.innerText();
  check(where, await record.getByText('Контекст запису:', {exact: true}).isVisible() && text.includes('42 групи досліджень, 723 учасники; p = 0,079'), 'outcome methodology must show the existing record population context');
  check(where, await record.getByText('Де в джерелі:', {exact: true}).isVisible() && text.includes('PMC5867436, Break point analysis / Figure 5'), 'outcome methodology must show the existing extraction locator');
  await artifact(page, viewport, 'outcome-methodology', record);
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `evidence errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, 'opening local evidence must not request third-party content');
  await context.close();
}

async function cellKeyboardFlow(browser, origin, viewport) {
  const where = `cell keyboard @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/cell-lab.html');
  const canvas = page.locator('#cell-canvas');
  const membrane = canvas.locator('[data-organelle="STRUCT-PLASMA-MEMBRANE"]');
  const cytoskeleton = canvas.locator('[data-organelle="STRUCT-CYTOSKELETON"]');
  await membrane.waitFor({state: 'visible'});
  // These are neighbours in the real SVG Tab order but differ from the semantic
  // organelle order used by the arrows. The current default is mitochondrion.
  for (const [key, expected] of [['ArrowRight', 'STRUCT-PLASMA-MEMBRANE'], ['ArrowDown', 'STRUCT-PLASMA-MEMBRANE'], ['ArrowLeft', 'ORG-PEROXISOME'], ['ArrowUp', 'ORG-PEROXISOME']]) {
    await membrane.focus();
    await page.keyboard.press('Tab');
    check(where, await cytoskeleton.evaluate(n => document.activeElement === n && n.getAttribute('aria-pressed') === 'false'), `${key} precondition: Tab must focus an unselected organelle`);
    await page.keyboard.press(key);
    const target = canvas.locator(`[data-organelle="${expected}"]`);
    check(where, await target.evaluate(n => document.activeElement === n && n.getAttribute('aria-pressed') === 'true'), `${key} must select and focus relative to the Tab-focused organelle`);
    check(where, new URL(page.url()).searchParams.get('organelle') === expected, `${key} must keep the selected organelle in the URL`);
  }
  await artifact(page, viewport, 'cell-keyboard', canvas);
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `cell keyboard errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  await context.close();
}

async function nextStepsFlow(browser, origin, viewport) {
  const files = ['nutrition', 'nutrition-inside', 'nutrition-digestion', 'fat-burning', 'muscle-lab', 'cell-lab', 'movement', 'sleep', 'atlas', 'exercises', 'supplements', 'protein-meta'];
  for (const name of files) {
    const where = `next @${viewport.name} ${name}`;
    const {context, page, seen} = await open(browser, origin, viewport, `/${name}.html`);
    const block = page.locator('.eua-next');
    await block.waitFor({state: 'attached'});
    check(where, (await block.count()) === 1 && (await block.locator('a').count()) === 3, 'three next steps, mounted once');
    const hrefs = await block.locator('a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    check(where, !hrefs.some(h => h.includes(`${name}.html`)), 'no self-link');
    await block.scrollIntoViewIfNeeded();
    const boxes = await block.locator('a').evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return [r.x, r.width, r.height]; }));
    check(where, boxes.every(([x, w, h]) => x >= 0 && x + w <= viewport.width + 1 && h >= 44), 'cards are tap targets inside the viewport');
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with the next-steps block');
    check(where, seen.pageErrors.length === 0, 'no page errors');
    await context.close();
  }
}

async function savedAndTermsFlow(browser, origin, viewport) {
  const where = `list+terms @${viewport.name}`;
  // Saved list: save a page, see it on the home page, remove it.
  const sleep = await open(browser, origin, viewport, '/sleep.html');
  const save = sleep.page.locator('.eua-save');
  await save.waitFor({state: 'attached'});
  await save.scrollIntoViewIfNeeded();
  check(where, (await save.getAttribute('aria-pressed')) === 'false', 'a page starts unsaved');
  await save.click();
  check(where, (await save.getAttribute('aria-pressed')) === 'true', 'saving marks the button pressed');
  await sleep.page.reload({waitUntil: 'load'});
  check(where, (await sleep.page.locator('.eua-save').getAttribute('aria-pressed')) === 'true', 'the saved state survives reload');
  await sleep.page.goto(origin + '/index.html', {waitUntil: 'load'});
  const item = sleep.page.locator('#start-here .eua-saved li a');
  check(where, (await item.count()) === 1 && (await item.getAttribute('href')) === './sleep.html', 'home shows the saved page');
  const box = await sleep.page.locator('#start-here .eua-saved').boundingBox();
  check(where, box && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'the saved block stays inside the viewport');
  await sleep.page.locator('#start-here .eua-saved li button').click();
  check(where, (await sleep.page.locator('#start-here .eua-saved').count()) === 0, 'removing the last item hides the block');
  check(where, sleep.seen.pageErrors.length === 0, 'no page errors with the saved list');
  await sleep.context.close();
  // Term hints: marked in reading text, opened by click, closed by Escape, kept inside the viewport.
  const fat = await open(browser, origin, viewport, '/fat-burning.html');
  const terms = fat.page.locator('.fb-main .eua-term');
  await terms.first().waitFor({state: 'attached'});
  check(where, (await terms.count()) >= 1, 'Fat Burning Lab marks its terms');
  const first = terms.first();
  await first.scrollIntoViewIfNeeded();
  const label = await first.innerText();
  await first.click();
  const pop = fat.page.locator('.eua-term-pop');
  check(where, (await pop.count()) === 1 && await pop.isVisible(), 'clicking a term opens the hint');
  const pbox = await pop.boundingBox();
  check(where, pbox && pbox.x >= 0 && pbox.x + pbox.width <= viewport.width + 1, 'the hint stays inside the viewport');
  check(where, (await pop.locator('a').first().getAttribute('rel')).includes('noopener') && (await pop.locator('a').first().getAttribute('href')).startsWith('https://'), 'the source link is safe');
  check(where, (await first.getAttribute('aria-expanded')) === 'true', 'the term button reports it is expanded');
  await fat.page.keyboard.press('Escape');
  check(where, (await fat.page.locator('.eua-term-pop').count()) === 0 && (await first.evaluate(n => n === document.activeElement)), 'Escape closes the hint and returns focus');
  check(where, label.length > 2, 'the visible wording stays the same as the page text');
  check(where, (await fat.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with term hints');
  check(where, fat.seen.pageErrors.length === 0, 'no page errors with term hints');
  await fat.context.close();
  const home = await open(browser, origin, viewport, '/index.html');
  await home.page.locator('.evidence-guide').waitFor({state: 'attached'});
  check(where, (await home.page.locator('.evidence-guide .eua-term').count()) >= 1, 'the evidence guide marks its terms');
  await home.context.close();
}

async function glossaryFlow(browser, origin, viewport) {
  const where = `glossary @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/glossary.html');
  const items = page.locator('.gl-term');
  await items.first().waitFor({state: 'attached'});
  const total = await items.count();
  check(where, total >= 17, 'the dictionary lists every hint, movement and sleep term');
  check(where, (await page.locator('.gl-term .gl-source[rel~="noopener"]').count()) === total, 'every entry has a safe source link');
  await page.fill('#gl-q', 'інтервал');
  const shown = await page.locator('.gl-term:not([hidden])').count();
  check(where, shown >= 1 && shown < total, 'search narrows the list');
  check(where, (await page.locator('#gl-count').innerText()).includes('Знайдено'), 'the count reports the result');
  await page.fill('#gl-q', 'цццццц');
  check(where, await page.locator('.gl-empty').isVisible(), 'an empty search says so');
  await page.fill('#gl-q', '');
  // A link from a hint lands on and highlights the entry.
  await page.goto(origin + '/glossary.html#term-ci', {waitUntil: 'load'});
  await page.locator('#term-ci.is-target').waitFor({state: 'attached'});
  const box = await page.locator('#term-ci').boundingBox();
  check(where, box && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'entries stay inside the viewport');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow in the dictionary');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the dictionary raises no errors');
  await context.close();
  // The hint in a text links to the matching entry.
  const fat = await open(browser, origin, viewport, '/fat-burning.html');
  await fat.page.locator('.fb-main .eua-term').first().click();
  const href = await fat.page.locator('.eua-term-pop a', {hasText: 'У словнику'}).getAttribute('href');
  check(where, /^\.\/glossary\.html#term-[a-z0-9-]+$/.test(href), 'the hint links to its dictionary entry');
  await fat.context.close();
}

async function searchFlow(browser, origin, viewport) {
  const where = `search @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/sleep.html');
  const button = page.locator('.eua-header-search');
  await button.waitFor({state: 'attached'});
  const box = await button.boundingBox();
  check(where, box && box.width >= 44 && box.height >= 44, 'the search button is a 44px target');
  check(where, box && box.x + box.width <= viewport.width + 1, 'the search button stays inside the viewport');
  await button.click();
  const dialog = page.locator('dialog.eua-search');
  await dialog.waitFor({state: 'visible'});
  check(where, await page.evaluate(() => document.activeElement?.id === 'eua-search-q'), 'the field is focused on open');
  check(where, (await page.locator('.eua-search-chips button').count()) >= 3, 'suggestions show before typing');
  await page.fill('#eua-search-q', 'інтервал');
  await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  check(where, (await page.locator('.eua-search-results a[href^="./glossary.html#term-"]').count()) >= 1, 'a term result links to the dictionary');
  await page.fill('#eua-search-q', 'білок');
  await page.locator('.eua-search-results a[href$=".html"]').first().waitFor({state: 'visible'});
  const dbox = await dialog.boundingBox();
  check(where, dbox && dbox.x >= 0 && dbox.x + dbox.width <= viewport.width + 1 && dbox.y + dbox.height <= viewport.height + 1, 'the dialog fits the viewport');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow with search open');
  await page.keyboard.press('ArrowDown');
  check(where, await page.evaluate(() => !!document.activeElement?.closest('.eua-search-results a')), 'ArrowDown moves into the results');
  await page.keyboard.press('Escape');
  await dialog.waitFor({state: 'hidden'});
  check(where, await page.evaluate(() => document.activeElement?.classList.contains('eua-header-search')), 'focus returns to the button');
  // The / shortcut opens it again, but not while typing in a field.
  await page.keyboard.press('/');
  await dialog.waitFor({state: 'visible'});
  await page.fill('#eua-search-q', '');
  await page.fill('#eua-search-q', 'цццццц');
  check(where, (await page.locator('.eua-search-status').innerText()).includes('Нічого не знайдено'), 'an empty result says so');
  // Escape behavior was checked above from a result. Close explicitly here:
  // a search input may consume its first Escape to clear the current query.
  await dialog.locator('.eua-search-close').click();
  await dialog.waitFor({state: 'hidden'});
  // Follow the actual header results to existing pages, rather than only testing index text.
  for (const [query, file, target] of [['атлас', 'atlas.html', '#atlas-zone-title'], ['вправи', 'exercises.html', '.ex-card']]) {
    await page.locator('.eua-header-search').click();
    await page.locator('dialog.eua-search').waitFor({state: 'visible'});
    await page.fill('#eua-search-q', query);
    const result = page.locator(`.eua-search-results a[href="./${file}"]`);
    await result.waitFor({state: 'visible'});
    check(where, await result.count() === 1, `${query} must find the real ${file} destination`);
    await artifact(page, viewport, `search-${query === 'атлас' ? 'atlas' : 'exercises'}`, page.locator('dialog.eua-search'));
    await result.click();
    await page.waitForURL(`**/${file}`);
    await page.locator(target).first().waitFor({state: 'visible'});
    check(where, new URL(page.url()).pathname === `/${file}`, `${query} result did not open ${file}`);
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'search raises no errors');
  await context.close();
}

async function changesFlow(browser, origin, viewport) {
  const where = `changes @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/changes.html');
  await page.locator('.ch-day').first().waitFor({state: 'attached'});
  const days = await page.locator('.ch-day').count();
  check(where, days >= 4, 'the log lists several days');
  check(where, (await page.locator('.ch-day[open]').count()) === 1, 'only the newest day is open');
  const links = await page.locator('.ch-day[open] .ch-title').count();
  check(where, links >= 3, 'the open day lists its records');
  check(where, (await page.locator('.ch-science').first().innerText()).length > 10, 'every record states whether the science changed');
  await page.locator('.ch-day').nth(1).locator('summary').click();
  check(where, (await page.locator('.ch-day[open]').count()) === 2, 'another day opens on tap');
  await page.locator('#ch-how summary').click();
  check(where, await page.locator('.ch-limits').isVisible(), 'the limits are readable once unfolded');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow in the log');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the log raises no errors');
  await context.close();
}

async function videosFlow(browser, origin, viewport) {
  const where = `videos @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/videos.html');
  await page.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await page.reload({waitUntil: 'load'});
  const url = page.locator('#vd-url');
  check(where, (await page.locator('label[for="vd-url"]').innerText()).includes('URL'), 'the field is labelled as a URL');
  check(where, (await url.getAttribute('placeholder')).startsWith('https://'), 'the field shows an example address');
  check(where, (await page.locator('#vd-help').innerText()).includes('Копіювати посилання'), 'the hint says where to copy the address');
  const send = page.locator('.vd-send');
  const box = await send.boundingBox();
  check(where, box && box.height >= 44 && box.x + box.width <= viewport.width + 1, 'the button is a 44px target inside the viewport');
  await send.click();
  check(where, (await page.locator('#vd-state').innerText()).includes('Вставте посилання'), 'an empty submit asks for the link');
  check(where, (await page.evaluate(() => window.__opened.length)) === 0, 'nothing opens for an empty field');
  await url.fill('привіт');
  check(where, (await page.locator('#vd-state').innerText()).includes('https://'), 'a wrong value explains the format');
  check(where, (await url.getAttribute('aria-invalid')) === 'true', 'the field is marked invalid');
  await url.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  check(where, (await page.locator('#vd-state').innerText()).includes('YouTube'), 'a valid link names its platform');
  await page.fill('#vd-note', 'техніка присіду');
  await send.click();
  check(where, (await page.locator('#vd-state').innerText()).includes('сторінку в соцмережі'), 'a missing social page is asked for');
  check(where, (await page.evaluate(() => window.__opened.length)) === 0, 'nothing opens without the social page');
  await page.fill('#vd-profile', 'https://www.instagram.com/olena');
  await send.click();
  const opened = await page.evaluate(() => window.__opened);
  check(where, opened.length === 1 && opened[0].startsWith('https://github.com/VlasPevochko/evidence-ua/issues/new?title='), 'the proposal opens a prefilled GitHub page');
  check(where, decodeURIComponent(opened[0]).includes('dQw4w9WgXcQ') && decodeURIComponent(opened[0]).includes('техніка присіду'), 'the link and the note travel in the draft');
  check(where, await page.locator('#vd-after').isVisible(), 'the next step is explained after the click');
  check(where, (await page.locator('.vd-empty').count()) === 1, 'the empty library says so');
  await page.locator('#vd-rules summary').click();
  check(where, await page.locator('#vd-rules li').first().isVisible(), 'the rules unfold');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the video page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the video page raises no errors');
  await context.close();
}

async function dietsFlow(browser, origin, viewport) {
  const where = `diets @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/nutrition.html');
  if (viewport.width > 760) {
    const geo = await page.evaluate(() => {
      const nav = document.querySelector('.eua-platform-nav').getBoundingClientRect(), hero = document.querySelector('.pb').getBoundingClientRect(), btn = document.querySelector('.eua-nutrition-menu > summary').getBoundingClientRect();
      return {nav: nav.height, heroH: hero.height, inHero: btn.top >= hero.top && btn.bottom <= hero.bottom && btn.right <= innerWidth};
    });
    check(where, geo.nav === 0, 'the tools strip takes no space under the header on wide screens');
    check(where, geo.heroH < 260, 'the banner is compact');
    check(where, geo.inHero, 'the tools button sits inside the banner');
    await page.locator('.eua-nutrition-menu > summary').click();
    const panel = await page.locator('.eua-nutrition-menu-content').boundingBox();
    check(where, panel && panel.x >= 0 && panel.x + panel.width <= viewport.width + 1 && panel.y + panel.height <= viewport.height + 1, 'the tools panel opens fully inside the window');
    await page.locator('.eua-nutrition-menu > summary').click();
  }
  const rec = page.locator('#nd-recommend');
  await rec.waitFor({state: 'attached'});
  await rec.scrollIntoViewIfNeeded();
  check(where, await rec.isVisible(), 'the editorial position is visible without opening anything');
  check(where, (await rec.innerText()).includes('не лікарська порада'), 'the position says it is not medical advice');
  check(where, (await rec.innerText()).includes('не обіцяє'), 'the position states the limits');
  await page.locator('#nd-recommend a[href="#diet-mediterranean"]').click();
  await page.locator('#diet-mediterranean').evaluate(el => { el.open = true; });
  const evidence = page.locator('#diet-mediterranean .nd-evidence');
  await evidence.waitFor({state: 'visible'});
  check(where, (await evidence.locator('.nd-findings a[href^="https://doi.org/"]').count()) >= 3, 'findings link to their sources');
  check(where, (await evidence.innerText()).includes('ПОКАЗИ') && (await evidence.innerText()).includes('ПРОТИПОКАЗИ'), 'indications and contraindications are both shown');
  check(where, (await evidence.locator('a[target="_blank"]:not([rel~="noopener"])').count()) === 0, 'all outgoing links are safe');
  const cols = await evidence.locator('.nd-fit').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(where, viewport.width <= 760 ? cols === 1 : cols === 2, `indications and cautions use ${viewport.width <= 760 ? 'one column on the phone' : 'two columns on the desktop'}`);
  const box = await evidence.boundingBox();
  check(where, box && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'the evidence block stays inside the viewport');
  await page.locator('#diet-ketogenic').evaluate(el => { el.open = true; });
  check(where, (await page.locator('#diet-ketogenic .nd-caution').innerText()).includes('панкреатит'), 'the keto card lists its contraindications');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the nutrition page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the diet cards raise no errors');
  await context.close();
}

async function cardArtFlow(browser, origin, viewport) {
  const where = `card art @${viewport.name}`;
  // The picture cards belong to the «З чого почнемо?» section, which is laid out when opened through its anchor.
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html#start-here');
  await page.locator('.home-picker-visual').first().waitFor({state: 'attached'});
  // The cards are built by a script after load: wait until they have a real size before measuring.
  await page.waitForFunction(() => [...document.querySelectorAll('.home-picker-visual')].length === 6 && [...document.querySelectorAll('.home-picker-visual')].every(e => e.getBoundingClientRect().width > 60));
  const cards = await page.evaluate(async () => {
    const out = [];
    for (const el of document.querySelectorAll('.home-picker-visual')) {
      const url = (getComputedStyle(el).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1];
      const ok = url ? await new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth > 0); i.onerror = () => r(false); i.src = url; }) : false;
      const b = el.getBoundingClientRect();
      out.push({area: el.parentElement.dataset.area, file: (url || '').split('/').pop(), ok, w: Math.round(b.width), h: Math.round(b.height)});
    }
    return out;
  });
  check(where, cards.length === 6, 'six direction cards have a picture');
  check(where, cards.every(c => /^card-art-[a-z]+-v[12]\.webp$/.test(c.file)), 'every card uses its card-art file');
  check(where, new Set(cards.map(c => c.file)).size === 6, 'six different pictures');
  check(where, cards.every(c => c.ok), 'every picture loads');
  check(where, cards.every(c => c.w >= 80 && c.h >= 80), 'pictures are big enough to read');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the home page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the cards raise no errors');
  await context.close();
}

async function compactBannerFlow(browser, origin, viewport) {
  // Рішення власника 2026-10-25: на сторінках зі смугою «Навігація й інструменти» кнопка живе в банері (широкі екрани), на телефоні смуга лишається.
  for (const route of ['/atlas.html', '/sleep.html', '/movement.html', '/exercises.html', '/protein-meta.html', '/nutrition-digestion.html']) {
    const where = `compact banner ${route} @${viewport.name}`;
    const {context, page, seen} = await open(browser, origin, viewport, route);
    // The strip is built by the platform shell script after load.
    await page.waitForSelector('body > .eua-platform-nav > .eua-module-menu > summary', {state: 'attached'});
    const geo = await page.evaluate(() => {
      const nav = document.querySelector('body > .eua-platform-nav'), hero = document.querySelector('.pb').getBoundingClientRect(), btn = nav.querySelector('.eua-module-menu > summary').getBoundingClientRect();
      return {nav: nav.getBoundingClientRect().height, inHero: btn.top >= hero.top && btn.bottom <= hero.bottom && btn.right <= innerWidth, heroTop: hero.top};
    });
    if (viewport.width > 760) {
      check(where, geo.nav === 0, 'the tools strip takes no space on wide screens');
      check(where, geo.inHero, 'the tools button sits inside the banner');
      check(where, geo.heroTop < 130, 'the banner starts right under the header');
      await page.locator('body > .eua-platform-nav > .eua-module-menu > summary').click();
      const panel = await page.locator('body > .eua-platform-nav > .eua-module-menu > .eua-module-menu-content').boundingBox();
      check(where, panel && panel.x >= 0 && panel.x + panel.width <= viewport.width + 1 && panel.y + panel.height <= viewport.height + 1, 'the tools panel opens fully inside the window');
    } else {
      check(where, geo.nav > 30, 'on the phone the strip is kept');
    }
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'no errors');
    await context.close();
  }
}

async function researchFlow(browser, origin, viewport) {
  // Рішення власника 2026-10-27: розбори дослідження коротко й ясно; відповідь видно одразу, деталі згорнуті.
  const where = `research @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/research.html');
  await page.locator('.rs-card').first().waitFor({state: 'attached'});
  const total = await page.locator('.rs-card').count();
  check(where, total >= 16, 'the page lists the write-ups');
  check(where, (await page.locator('.rs-card[open]').count()) === 0, 'every card starts folded');
  const answers = await page.locator('.rs-answer').evaluateAll(els => els.map(e => e.getBoundingClientRect().height > 0 && e.innerText.length > 10));
  check(where, answers.every(Boolean), 'every card shows its one-line answer without opening');
  await page.locator('.rs-card summary').first().click();
  check(where, await page.locator('.rs-card[open] .rs-row').first().isVisible() && (await page.locator('.rs-card[open] .rs-row').count()) === 3, 'opening shows who, what was found and what it does not prove');
  check(where, await page.locator('.rs-card[open] .rs-source a').first().getAttribute('href').then(h => /^https:\/\/(doi\.org\/10\.|pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/)/.test(h)), 'the source is a DOI or PubMed link');
  // «Поділитись»: рідне вікно (підмінене), копіювання, картинка-файл, глибоке посилання, вмістимість тексту на картинці.
  await page.evaluate(() => { window.__shared = null; Object.defineProperty(navigator, 'share', {value: async d => { window.__shared = d; }, configurable: true}); });
  await page.locator('.rs-card[open] .rs-btn').first().click();
  const shared = await page.evaluate(() => window.__shared);
  check(where, shared && /#[a-z-]+$/.test(shared.url) && shared.title.length > 10 && shared.text.includes('Джерело:'), 'the share button hands over the question, answer, source and a link to this write-up');
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', {value: undefined, configurable: true}); window.__copied = ''; Object.defineProperty(navigator, 'clipboard', {value: {writeText: async t => { window.__copied = t; }}, configurable: true}); });
  await page.locator('.rs-card[open] .rs-btn').first().click();
  check(where, (await page.evaluate(() => window.__copied)).includes('research.html#') && (await page.locator('.rs-card[open] .rs-status').first().innerText()).includes('скопійовано'), 'without the share sheet the text is copied and the reader is told');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.rs-card[open] .rs-btn').nth(1).click()]);
  const png = await download.path();
  const head = png ? (await import('node:fs')).readFileSync(png).subarray(0, 24) : null;
  check(where, /^evidence-ua-[a-z-]+\.png$/.test(download.suggestedFilename()) && head && head.readUInt32BE(16) === 1080 && head.readUInt32BE(20) === 1350, 'the picture is saved as a 1080×1350 PNG');
  const fits = await page.evaluate(async () => {
    const mod = await import('./research-share.js?v=2'), data = await import('./research-data.js?v=4'), bad = [];
    for (const s of data.STUDIES) { const {layout} = await mod.drawCard(s, data.TOPICS[s.topic]); if (!mod.FITS(layout)) bad.push(s.id); }
    return bad;
  });
  check(where, fits.length === 0, 'the text fits on the picture for every write-up' + (fits.length ? ': ' + fits.join(',') : ''));
  await page.goto(origin + '/research.html#coffee');
  await page.locator('#rs-coffee[open]').waitFor({state: 'attached'});
  check(where, await page.locator('#rs-coffee').evaluate(el => el.open), 'a link with #id opens that write-up');
  // Графік у картці «кава»: п'ять рядків, великі точки, поява анімацією, без переповнення.
  await page.locator('#rs-coffee .rs-chart.is-in').waitFor({state: 'attached'});
  const chart = await page.evaluate(() => { const f = document.querySelector('#rs-coffee .rs-chart'); return f && {rows: f.querySelectorAll('.rs-crow:not(.rs-caxisrow)').length, dot: f.querySelector('.rs-cdot').offsetWidth, shown: f.classList.contains('is-in'), nulls: f.querySelectorAll('.is-null').length, over: f.scrollWidth - f.clientWidth}; });
  check(where, chart && chart.rows === 5 && chart.dot >= 8 && chart.shown && chart.nulls === 0 && chart.over <= 1, 'the coffee card draws its interval chart (5 rows, markers of 8 px or more, appears on open, fits the card) ' + JSON.stringify(chart));
  await page.locator('.rs-chip[data-topic="move"]').click();
  const moveCount = await page.locator('.rs-card').count();
  check(where, moveCount >= 2 && moveCount < total && (await page.locator('.rs-tag').evaluateAll(els => els.every(e => e.innerText === 'Рух'))), 'the topic filter narrows the list');
  check(where, (await page.locator('#rs-summary').innerText()).includes('із ' + total), 'the counter follows the filter');
  check(where, (await page.locator('.rs-chip').evaluateAll(els => els.every(e => e.getBoundingClientRect().height >= 44))), 'filter buttons are tappable');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'no errors');
  await context.close();
}

async function mechanismsFlow(browser, origin, viewport) {
  // Рішення власника 2026-10-27, пункт 5: анімовані схеми механізмів. Перевіряємо, що кроки справді рухають молекули й шкали.
  const where = `mechanisms @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/mechanisms.html');
  await page.locator('[data-scene="caffeine"] .mc-step').first().waitFor({state: 'attached'});
  check(where, (await page.locator('.mc-step').count()) === 7, 'both schemes have their step buttons (3 + 4)');
  const sc = '[data-scene="caffeine"]';
  const geo = () => page.evaluate(() => {
    const box = e => { const r = document.querySelector(e).getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width}; };
    const near = id => { const b = box('#' + id); const idx = Number(id.slice(1)), sockets = [...document.querySelectorAll('[data-scene="caffeine"] .mc-socket')].map(e => e.getBoundingClientRect()); if (idx > 3) return false; const sk = sockets[idx - 1]; return Math.abs(b.x - (sk.x + sk.width / 2)) < sk.width * 0.35 && b.y > sk.y - sk.height * 0.9 && b.y < sk.y + sk.height * 0.5; };
    const lamp = parseFloat(getComputedStyle(document.querySelector('[data-scene="caffeine"] .mc-lamp')).opacity);
    const bar = i => parseFloat(getComputedStyle(document.querySelectorAll('[data-scene="caffeine"] .mc-bar i')[i]).width) / document.querySelectorAll('[data-scene="caffeine"] .mc-bar')[i].getBoundingClientRect().width;
    return {a1Docked: near('a1'), c1Docked: near('c1'), lamp, adenosine: bar(0), signal: bar(1)};
  });
  await page.locator(sc + ' .mc-step').nth(1).click();
  await page.waitForTimeout(1700);
  const s2 = await geo();
  check(where, (await page.locator(sc).getAttribute('data-stage')) === '2' && (await page.locator(sc + ' .mc-caption h3').innerText()).includes('Аденозин сідає'), 'step 2 sets the stage and the caption');
  check(where, s2.a1Docked && !s2.c1Docked && s2.lamp > 0.9 && s2.signal > 0.8, 'step 2: adenosine sits in the receptor and the sleepiness signal is strong');
  await page.locator(sc + ' .mc-step').nth(2).click();
  await page.waitForTimeout(1700);
  const s3 = await geo();
  check(where, s3.c1Docked && !s3.a1Docked && s3.lamp < 0.4 && s3.signal < 0.4 && s3.adenosine > 0.7, 'step 3: caffeine sits in the receptor, adenosine stays high, the signal drops');
  const play = page.locator(sc + ' .mc-play');
  await play.click();
  check(where, (await play.innerText()) === 'Пауза' && (await page.locator(sc).getAttribute('data-playing')) === '1', 'the play button starts the autoplay');
  await play.click();
  check(where, (await play.innerText()) === 'Грати', 'and pauses it again');
  // Креатин.
  const cr = '[data-scene="creatine"]';
  await page.locator(cr).scrollIntoViewIfNeeded();
  const pcr = () => page.evaluate(() => { const i = document.querySelector('[data-scene="creatine"] .cr-store i'); return parseFloat(getComputedStyle(i).width) / i.parentElement.getBoundingClientRect().width; });
  await page.locator(cr + ' .mc-step').nth(0).click(); await page.waitForTimeout(1500);
  const rest = await pcr();
  await page.locator(cr + ' .mc-step').nth(1).click(); await page.waitForTimeout(1500);
  const sprint = await pcr();
  check(where, (await page.locator(cr + ' .cr-flow i').first().evaluate(el => getComputedStyle(el).animationName)) === 'cr-run', 'sprint: phosphate dots flow from the store to ATP');
  await page.locator(cr + ' .mc-step').nth(2).click(); await page.waitForTimeout(1500);
  const empty = await pcr();
  const power3 = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-scene="creatine"] .cr-power i')).width) / document.querySelector('[data-scene="creatine"] .cr-power').getBoundingClientRect().width);
  check(where, rest > 0.7 && sprint < rest && empty < 0.15 && power3 < 0.5, 'the store is full at rest, shrinks in a sprint and is nearly empty after ~10 s while power falls');
  await page.locator(cr + ' .mc-step').nth(3).click(); await page.waitForTimeout(1500);
  check(where, (await pcr()) > 0.7, 'rest: the store refills');
  await page.locator(cr + ' .mc-step').nth(0).click(); await page.waitForTimeout(1500);
  await page.locator(cr + ' .mc-switch').click(); await page.waitForTimeout(1500);
  check(where, (await pcr()) > rest + 0.1, 'with creatine the store is larger (schematic)');
  // Без руху: крок вмикається, але нічого не анімується.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.locator(cr + ' .mc-step').nth(1).click();
  check(where, (await page.locator(cr + ' .cr-flow i').first().evaluate(el => getComputedStyle(el).animationName)) === 'none', 'reduced motion stops the animation');
  check(where, (await page.locator('.mc-step').evaluateAll(els => els.every(e => e.getBoundingClientRect().height >= 44))), 'step buttons are tappable');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'no errors');
  await context.close();
}

async function compareFlow(browser, origin, viewport) {
  const where = `compare @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/compare.html?a=creatine&b=supplement-caffeine');
  const cards = page.locator('.cp-card');
  await cards.first().waitFor({state: 'attached'});
  check(where, (await cards.count()) === 2, 'two supplements side by side');
  check(where, (await cards.nth(0).locator('h2').innerText()) === 'Креатин' && (await cards.nth(1).locator('h2').innerText()) === 'Кофеїн', 'the addresses choose the pair');
  check(where, (await cards.first().locator('dt').count()) === 4, 'four comparable rows per card');
  // Both dossiers have existing provisional Claim assessments. The comparison
  // must retain that distinction from the still-incomplete formal review.
  await page.selectOption('#cp-a', 'supplement-protein');
  for (const [side, name] of [[0, 'Білок / протеїн'], [1, 'Кофеїн']]) {
    const status = await cards.nth(side).locator('dl > div').filter({has: page.locator('dt', {hasText: 'Стан перегляду'})}).locator('dd').innerText();
    check(where, !/Рівень впевненості не оцінено|Стан оцінки тверджень не внесено/.test(status), `${name} incorrectly reports no Claim assessments`);
    check(where, /попередн/iu.test(status) && /окрем[а-яіїєґ]* тверджен/iu.test(status), `${name} does not identify provisional Claim assessments`);
    check(where, /Формальний науковий перегляд не завершено/.test(status), `${name} incorrectly implies a completed formal review`);
  }
  await artifact(page, viewport, 'comparison-status', page.locator('#cp-out'));
  await page.selectOption('#cp-a', 'creatine');
  await page.selectOption('#cp-b', 'supplement-magnesium');
  check(where, (await cards.nth(1).locator('h2').innerText()) === 'Магній' && page.url().includes('b=supplement-magnesium'), 'the second choice changes the card and the shareable address');
  await page.selectOption('#cp-b', 'creatine');
  check(where, (await cards.nth(0).locator('h2').innerText()) !== (await cards.nth(1).locator('h2').innerText()), 'the same supplement is never compared with itself');
  await page.click('#cp-swap');
  const names = await cards.locator('h2').allInnerTexts();
  check(where, names.length === 2 && names[0] !== names[1], 'swap keeps two different supplements');
  check(where, (await page.locator('.cp-open').first().getAttribute('href')).startsWith('./index.html#'), 'each card opens its dossier');
  const box = await cards.nth(1).boundingBox();
  check(where, box && box.x >= 0 && box.x + box.width <= viewport.width + 1, 'cards stay inside the viewport');
  if (viewport.width > 900) { const b0 = await cards.nth(0).boundingBox(); check(where, box && b0 && Math.abs(box.y - b0.y) < 4, 'on a wide screen the cards are side by side'); }
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow in the comparison');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'no errors in the comparison');
  await context.close();
}

async function mapFlow(browser, origin, viewport) {
  const where = `map @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/map.html');
  await page.locator('.km-list li').first().waitFor({state: 'attached'});
  check(where, (await page.locator('.km-list li').count()) === 12, 'every page appears in the list');
  check(where, (await page.locator('.km-list li p').first().innerText()).startsWith('Поруч:'), 'every item names its neighbours');
  if (viewport.width > 820) {
    check(where, (await page.locator('.km-node').count()) === 12, 'twelve nodes on the map');
    await page.locator('.km-node[data-file="nutrition.html"]').focus();
    check(where, await page.locator('.km-stage.has-focus').count() === 1, 'focusing a node highlights its neighbours');
    check(where, (await page.locator('#km-caption').innerText()).includes('поруч'), 'the caption names the neighbours');
    check(where, (await page.locator('.km-node.is-on').count()) >= 2 && (await page.locator('.km-node.is-on').count()) < 11, 'only related nodes stay lit');
    const lit = await page.locator('g.is-on').count();
    check(where, lit >= 2, 'the connected lines are highlighted');
    const boxes = await page.locator('.km-node').evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return [r.x, r.width, r.height]; }));
    check(where, boxes.every(([x, w, h]) => x >= 0 && x + w <= viewport.width + 1 && h >= 40), 'nodes stay inside the viewport and are tappable');
    const stage = await page.locator('.km-stage').boundingBox();
    check(where, boxes.every(([x, w]) => x >= stage.x - 1 && x + w <= stage.x + stage.width + 1), 'nodes stay inside the map');
    await page.locator('.km-node[data-file="nutrition.html"]').blur();
    check(where, (await page.locator('.km-stage.has-focus').count()) === 0, 'leaving a node resets the map');
  } else {
    check(where, !(await page.locator('.km-stage').isVisible()), 'the graph is replaced by a list on phones');
  }
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the map');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'no errors on the map');
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
  check(where, (await page.locator('.sp-row').count()) === 11, 'expected eleven supplements');
  // Every entry has a photo, a folded limit and a link to its existing dossier.
  const links = await page.locator('.sp-go').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
  check(where, links.length === 11 && links.every(h => h.startsWith('./index.html#')), 'every row must link to its dossier');
  check(where, (await page.locator('.sp-limit[open]').count()) === 0, 'limits must start folded');
  await page.locator('.sp-limit summary').first().click();
  check(where, (await page.locator('.sp-limit[open] p').first().isVisible()), 'opening the limit must show its text');
  const photo = await page.locator('.sp-photo').first().boundingBox();
  check(where, photo && photo.width >= (phone ? 80 : 120), `photo too small: ${photo && photo.width}`);
  // Filter and search.
  await page.locator('[data-sp-filter="health"]').click();
  check(where, (await page.locator('.sp-row').count()) === 4, 'the health filter must show four rows (berberine added 2026-10-21)');
  check(where, (await page.locator('[data-sp-filter="health"]').getAttribute('aria-pressed')) === 'true', 'the filter is not marked pressed');
  await page.locator('[data-sp-filter="all"]').click();
  await page.locator('#sp-q').fill('креа');
  check(where, (await page.locator('.sp-row').count()) === 1 && (await page.locator('#sp-count').innerText()).includes('1 з 11'), 'search by name failed');
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
  // Tab can focus a different button without changing the selection. Arrows
  // should start there; testing only the already-selected button misses this bug.
  for (const [key, expected] of [['ArrowRight', 2], ['ArrowLeft', 0]]) {
    await scaleButtons.first().click();
    await scaleButtons.first().focus();
    await page.keyboard.press('Tab');
    check(where, await scaleButtons.nth(1).evaluate(n => document.activeElement === n && n.getAttribute('aria-pressed') === 'false'), `${key} precondition: Tab must focus an unselected scale`);
    await page.keyboard.press(key);
    check(where, await scaleButtons.nth(expected).evaluate(n => document.activeElement === n && n.getAttribute('aria-pressed') === 'true'), `${key} must select and focus relative to the Tab-focused scale`);
  }
  await artifact(page, viewport, 'muscle-keyboard', page.locator('#scales'));
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
    // 2026-10-26: +10 folded chapters from the owner's PDF (≈1300 px closed); related links went two-column to compensate.
    check(where, (await page.evaluate(() => document.documentElement.scrollHeight)) < 7500, 'the phone page is too long again');
  } else {
    check(where, (await visible('#growth')) && (await visible('#atrophy')), 'on a desktop both mirrored panels should show');
  }
  // Evidence stays one click away and sources are collapsed by default.
  await page.locator(`${phone ? '#atrophy' : '#growth'} [data-claim-open]`).click();
  check(where, await page.locator('#eua-evidence-dialog').evaluate(node => node.open), 'the evidence drawer does not open');
  await page.keyboard.press('Escape');
  check(where, (await page.locator('.source-details').evaluateAll(nodes => nodes.every(node => !node.open))), 'the source lists should start collapsed');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `console errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
  check(where, seen.external.length === 0, `third-party request: ${seen.external.join(', ')}`);
  await context.close();
}

async function muscleGuideFlow(browser, origin, viewport) {
  const where = `muscle guide @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/muscle-lab.html#training');
  await page.waitForSelector('#guide');
  check(where, (await page.locator('.mg-chapter').count()) === 10, 'expected ten chapters');
  check(where, await page.locator('#training').evaluate(node => node.open), 'a deep link must open its folded chapter');
  check(where, (await page.locator('.mg-chapter[open]').count()) === 1, 'only the linked chapter opens');
  check(where, (await page.locator('.mg-ev-row').count()) === 8 && (await page.locator('.mg-ev-noci .mg-ev-ci').count()) === 0, 'forest rows: eight, and none invents an interval');
  // Outcome Claims open their own drawer, not the model's.
  await page.locator('#training [data-claim-open="CLM-000106"]').click();
  check(where, await page.locator('[data-muscle-practice-dialog]').evaluate(node => node.open) && !(await page.locator('#eua-evidence-dialog').evaluate(node => node.open)), 'the Claim drawer does not open (or the wrong one opens)');
  check(where, (await page.locator('[data-muscle-practice-dialog] h2').innerText()).includes('відмови'), 'the drawer shows another Claim');
  await page.keyboard.press('Escape');
  check(where, (await page.locator('#guide .eua-confidence').count()) === 14, 'every guide Claim shows its level');
  await page.locator('#signal > summary').click();
  await page.locator('[data-chain-play]').click();
  await page.waitForTimeout(1300);
  const step = Number(await page.locator('[data-chain]').getAttribute('data-chain-step'));
  check(where, step >= 1 && step < 7, `the signal chain is not running (step ${step})`);
  await page.locator('[data-chain-play]').click();
  check(where, (await page.locator('[data-chain-play]').getAttribute('aria-pressed')) === 'false', 'the chain did not pause');
  await page.locator('#disorders > summary').click();
  await page.locator('[data-condition="mg"]').click();
  check(where, (await page.locator('.mg-path-levels .is-hit').innerText()).includes('синапс'), 'myasthenia must point to the synapse');
  check(where, await page.locator('[data-condition-panel="mg"]').isVisible() && !(await page.locator('[data-condition-panel="als"]').isVisible()), 'one disorder text at a time');
  await page.evaluate(() => document.querySelectorAll('#guide details').forEach(d => { d.open = true; }));
  const wide = await page.evaluate(() => [...document.querySelectorAll('#guide *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length);
  check(where, wide === 0 && (await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), 'guide content overflows the screen');
  const small = await page.evaluate(() => [...document.querySelectorAll('#guide p, #guide li, #guide td')].filter(e => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 12).length);
  check(where, small === 0, `text smaller than 12 px: ${small}`);
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
  check(where,entryLinks.length===11&&entryLinks.every(h=>h.startsWith('#')),'eleven entry chips must link to the existing dossiers');
  check(where,(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'horizontal overflow in the supplement entry');
  // The three explainer blocks now live inside the folded «Про сайт» group (owner decision 2026-10-19).
  check(where,!(await page.locator('#home-overview').isVisible()),'the group must start folded');
  await page.locator('#home-about>summary').click();
  await page.locator('#home-overview>summary').click();
  // Details content expands over 280 ms; wait for actual visibility instead of
  // sampling during the first, clipped animation frame.
  const overviewContent=page.locator('#home-overview .home-overview-grid');
  check(where,await visibleAfterDisclosureTransition(overviewContent),'overview must still expand');
  await page.locator('.evidence-guide>details').nth(1).locator('summary').first().click();
  check(where,await visibleAfterDisclosureTransition(page.locator('.guide-example')),'evidence example must open');
  check(where,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'opened home content must not overflow horizontally');
  // Deep links from other pages (#home-feedback) must open the folded group together with the block.
  const feedbackPage=await context.newPage();
  await feedbackPage.goto(page.url().split('#')[0]+'#home-feedback',{waitUntil:'load'});
  check(where,await feedbackPage.evaluate(()=>document.getElementById('home-about').open&&document.getElementById('home-feedback').open),'#home-feedback must open «Про сайт» and the feedback form');
  await feedbackPage.close();
  await page.emulateMedia({reducedMotion:'reduce'});
  check(where,await page.locator('#categories').evaluate(e=>getComputedStyle(e,'::before').animationName)==='none','reduced motion must disable shippo movement');
  check(where,seen.pageErrors.length===0&&seen.console.length===0,'home interactions must remain error-free');
  await context.close();
}

// Fat Burning Lab: verify actual controls, not only presence of labels in static HTML.
async function fatBurningFlow(browser, origin, viewport) {
  const where = "fat burning @" + viewport.name;
  const {context, page, seen} = await open(browser, origin, viewport, "/fat-burning.html");
  await page.waitForSelector("#fb-step-title");
  // Рішення власника 2026-10-25: верхній банер компактний (було 559 px на комп'ютері і 829 px на телефоні).
  const bandH = await page.locator(".fb-band").evaluate(el => el.getBoundingClientRect().height);
  check(where, bandH < (viewport.width > 760 ? 460 : 640), "the top banner is compact");
  check(where, await page.locator(".fb-hero-actions .fb-button").evaluateAll(els => els.every(e => e.getBoundingClientRect().right <= innerWidth && e.getBoundingClientRect().height >= 40)), "the banner buttons fit the screen and stay tappable");
  check(where, (await page.locator("#fb-step-title").innerText()).includes("Енергія у запасі"), "initial stage");
  await page.locator('[data-fb-step="1"]').click();
  check(where, (await page.locator("#fb-step-title").innerText()).includes("Мобілізація"), "click selects lipolysis");
  check(where, await page.locator('[data-visual="1"]').evaluate(el => el.classList.contains("is-active")), "stage visual does not change");
  check(where, (await page.locator('[data-fb-step="1"]').getAttribute("aria-pressed")) === "true", "stage button state");
  await page.locator("#fb-step-next").click();
  check(where, (await page.locator("#fb-step-title").innerText()).includes("Окиснення"), "next stage");
  await page.locator('[data-fb-step="3"]').click();
  await page.locator("#fb-step-next").click();
  check(where, (await page.locator("#fb-step-title").innerText()).includes("Енергія у запасі"), "last stage wraps to start");
  await page.locator('[data-fb-balance="surplus"]').click();
  check(where, (await page.locator(".fb-balance").getAttribute("data-balance")) === "surplus", "surplus chart state");
  check(where, (await page.locator("#fb-balance-title").innerText()).includes("більше"), "surplus explanation state");
  await page.locator('[data-fb-balance="equal"]').click();
  check(where, (await page.locator('[data-fb-balance="equal"]').getAttribute("aria-pressed")) === "true", "energy balance button state");
  await page.locator(".fb-myth-list summary").first().click();
  check(where, await page.locator(".fb-myth-list details").first().evaluate(el => el.open), "myth explanation disclosure");
  await page.emulateMedia({reducedMotion:"reduce"});
  check(where, await page.locator(".fb-trace").evaluate(el => getComputedStyle(el).animationName === "none"), "reduced motion must stop diagram animation");
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, "interactive console or runtime error");
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, "interaction causes horizontal overflow");
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

// A historical dist can be served by the current pinned QA runner in CI for
// before/after artifacts. This mode captures known audit states only: it neither
// asserts fixed behavior nor prints a Browser QA success message for the baseline.
async function baselineScreenshots(browser, origin, viewport) {
  if (!process.env.QA_ARTIFACT_DIR) throw new Error('QA_SCREENSHOT_ONLY requires QA_ARTIFACT_DIR');
  const {context, page} = await open(browser, origin, viewport, '/nutrition-inside.html?structure=pump');
  await page.locator('[data-nl-structure="pump"][aria-pressed="true"]').waitFor({state: 'visible'});
  await page.waitForFunction(() => !document.querySelector('#nl-cell').getAnimations().some(a => a.playState === 'running'));
  await artifact(page, viewport, 'nutrition-pump', page.locator('#nl-stage'));
  await page.goto(origin + '/compare.html?a=supplement-protein&b=supplement-caffeine', {waitUntil: 'load'});
  await page.locator('.cp-card').first().waitFor({state: 'visible'});
  await artifact(page, viewport, 'comparison-status', page.locator('#cp-out'));
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
  if (process.env.QA_SCREENSHOT_ONLY === '1') {
    for (const viewport of viewports) await baselineScreenshots(browser, origin, viewport);
  } else {
    for (const viewport of viewports) for (const file of files) await generic(browser, origin, viewport, file);
    for (const viewport of viewports) await exerciseFlow(browser, origin, viewport);
    for (const viewport of viewports) await muscleLabFlow(browser, origin, viewport);
    for (const viewport of viewports) await muscleGuideFlow(browser, origin, viewport);
    for (const viewport of viewports) await nutritionFlow(browser, origin, viewport);
    for (const viewport of viewports) await supplementsFlow(browser, origin, viewport);
    for (const viewport of viewports) await continueFlow(browser, origin, viewport);
    for (const viewport of viewports) await trainerFlow(browser, origin, viewport);
    for (const viewport of viewports) await appearanceFlow(browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(deniedStorageFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(shareFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(outcomeEvidenceFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(cellKeyboardFlow, browser, origin, viewport);
    for (const viewport of viewports) await nextStepsFlow(browser, origin, viewport);
    for (const viewport of viewports) await savedAndTermsFlow(browser, origin, viewport);
    for (const viewport of viewports) await glossaryFlow(browser, origin, viewport);
    for (const viewport of viewports) await compareFlow(browser, origin, viewport);
    for (const viewport of viewports) await mapFlow(browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(searchFlow, browser, origin, viewport);
    for (const viewport of viewports) await changesFlow(browser, origin, viewport);
    for (const viewport of viewports) await researchFlow(browser, origin, viewport);
    for (const viewport of viewports) await mechanismsFlow(browser, origin, viewport);
    for (const viewport of viewports) await cardArtFlow(browser, origin, viewport);
    for (const viewport of viewports) await compactBannerFlow(browser, origin, viewport);
    for (const viewport of viewports) await videosFlow(browser, origin, viewport);
    for (const viewport of viewports) await dietsFlow(browser, origin, viewport);
    for (const viewport of viewports) await pineFlow(browser, origin, viewport);
    for (const viewport of viewports) await atlasFlow(browser, origin, viewport);
    for (const viewport of viewports) await musclesFlow(browser, origin, viewport);
    for (const viewport of viewports) webgl.push(await spineFlow(browser, origin, viewport));
    await homeMenuFlow(browser, origin);
    for (const viewport of viewports) await homeLowerFlow(browser, origin, viewport);
    for (const viewport of viewports) await fatBurningFlow(browser, origin, viewport);
  }
} finally {
  await browser.close();
  server.close();
}

if (process.env.QA_SCREENSHOT_ONLY === '1') {
  console.log('Historical-state screenshots captured; browser regression checks were not run.');
  process.exit(0);
}

if (failures.length) {
  for (const failure of failures) annotateFailure(failure);
  console.error(`Browser QA failed (${failures.length} of ${checks} checks):\n` + failures.map(f => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks} checks over ${files.length} pages × ${viewports.length} viewports plus library, muscle lab, atlas, muscles-zone, spine-zone and home-menu flows (3D model rendered: ${webgl.filter(Boolean).length}/${webgl.length}).`);
