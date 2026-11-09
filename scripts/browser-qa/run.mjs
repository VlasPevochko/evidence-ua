// Browser QA for the static site. Run from the repository root:
//   npm ci --prefix scripts/browser-qa --ignore-scripts && node scripts/browser-qa/run.mjs
// Optional focused iteration: QA_HOME_ONLY=1 node scripts/browser-qa/run.mjs (home), QA_SECTIONS_ONLY=1 (search by page sections)
// The default run and CI still execute every page and regression flow.
// Uses the Chrome already installed on the machine (BROWSER_EXECUTABLE overrides the path).
// Everything is served from a throw-away local server and third-party requests are blocked, so
// the run is hermetic. The static tests cannot see layout, focus or runtime errors; this can.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright-core';
import {areas} from '../../src/platform/catalog.mjs';

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
async function isolatedFlow(flow, browser, origin, viewport, ...args) {
  try { return await flow(browser, origin, viewport, ...args); }
  catch (error) {
    const message = error.stack || String(error);
    annotateFailure(`${flow.name} @${viewport.name}: ${message}`);
    fail(`${flow.name} @${viewport.name}`, message);
  }
}
let checks = 0;
const check = (where, ok, message) => { checks++; if (!ok) fail(where, message); };

async function open(browser, origin, viewport, route, {initScript, contextOptions = {}} = {}) {
  const context = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, serviceWorkers: 'block', ...contextOptions});
  if (initScript) await context.addInitScript(initScript);
  const page = await context.newPage();
  const seen = await observePage(page, origin);
  await page.goto(origin + route, {waitUntil: 'load'});
  await page.waitForTimeout(400);
  return {context, page, seen};
}

async function observePage(page, origin) {
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
  return seen;
}

// CI may retain small views of the changed states without screenshotting whole pages.
async function artifact(page, viewport, name, locator, {scroll = true} = {}) {
  if (!process.env.QA_ARTIFACT_DIR) return;
  const dir = path.resolve(process.env.QA_ARTIFACT_DIR);
  fs.mkdirSync(dir, {recursive: true});
  if (scroll) await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No screenshot target for ${name}`);
  const x = Math.max(0, box.x), y = Math.max(0, box.y);
  const width = Math.min(box.x + box.width, viewport.width) - x;
  const height = Math.min(box.y + box.height, viewport.height) - y;
  if (width <= 0 || height <= 0) throw new Error(`Screenshot target outside viewport: ${name}`);
  await page.screenshot({path: path.join(dir, `${name}-${viewport.name}.png`), clip: {x, y, width, height}});
}

// «Довіра 2» (2026-11-03): спільне застереження внизу кожної сторінки (src/platform/site-notice.mjs). Перевіряємо в самому браузері: воно одне, видиме, з точним текстом,
// нічим не перекрите, останнє на сторінці, з посиланням не менше 44 px і читабельним контрастом. Контраст міряємо по справжніх пікселях (колір тексту береться від сторінки,
// а світла тема робиться фільтром на <html>, тож обчислений колір не відповідає тому, що бачить людина): див. нижче.
const NOTICE_TEXT = 'Матеріал освітній і не є персональною медичною рекомендацією.';
async function checkNotice(page, where, {contrast = true} = {}) {
  const notice = page.locator('.eua-site-notice');
  const count = await notice.count();
  check(where, count === 1, `exactly one shared notice is required (found ${count})`);
  if (count !== 1) return;
  await notice.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const facts = await page.evaluate(() => {
    const n = document.querySelector('.eua-site-notice'), p = n.querySelector('p'), a = n.querySelector('a');
    const r = n.getBoundingClientRect(), pr = p.getBoundingClientRect(), ar = a.getBoundingClientRect(), style = getComputedStyle(n);
    const hit = box => { const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2); return !!top && n.contains(top); };
    return {
      text: p.textContent.trim(), linkText: a.textContent.trim(), href: a.getAttribute('href'), role: n.getAttribute('role'),
      visible: r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
      linkHeight: ar.height, linkHit: hit(ar), textHit: hit(pr), fits: r.left >= -1 && r.right <= innerWidth + 1,
      fromBottom: document.documentElement.scrollHeight - (r.bottom + scrollY), fontSize: parseFloat(getComputedStyle(p).fontSize)
    };
  });
  check(where, facts.visible, 'the notice is visible');
  check(where, facts.text === NOTICE_TEXT, `the notice says exactly the approved sentence; found «${facts.text}»`);
  check(where, facts.linkText === 'Про проєкт' && facts.href === './about.html', `the notice links to the About page; found «${facts.linkText}» ${facts.href}`);
  check(where, facts.role === 'note', 'the notice has role="note"');
  check(where, facts.linkHeight >= 44, `the notice link is a 44px target (${facts.linkHeight})`);
  check(where, facts.linkHit && facts.textHit, 'nothing covers the notice');
  check(where, facts.fits, 'the notice stays inside the viewport width');
  check(where, facts.fromBottom <= 40, `the notice is the last thing on the page (${Math.round(facts.fromBottom)}px of page below it)`);
  check(where, facts.fontSize >= 14, `the notice text is at least 14px (${facts.fontSize})`);
  if (!contrast) return;
  // Контраст міряємо по справжніх пікселях, а не за обчисленим кольором: світла тема робиться фільтром на <html>, тож колір у CSS не той, що бачить людина.
  // 1) тло без тексту; 2) той самий текст, але великий і жирний, щоб серцевина штрихів була суцільного кольору (колір чорнила з урахуванням прозорості й фільтра);
  // найгірший піксель тла порівнюється з кольором чорнила для абзацу й для посилання окремо.
  const setStyle = (selector, css) => page.evaluate(([sel, text]) => document.querySelectorAll(sel).forEach(node => { if (node.dataset.qaStyle === undefined) node.dataset.qaStyle = node.getAttribute('style') || ''; node.style.cssText = (node.dataset.qaStyle ? node.dataset.qaStyle + ';' : '') + text; }), [selector, css]);
  const restore = () => page.evaluate(() => document.querySelectorAll('.eua-site-notice [data-qa-style]').forEach(node => { const old = node.dataset.qaStyle; delete node.dataset.qaStyle; if (old) node.setAttribute('style', old); else node.removeAttribute('style'); }));
  // Знімок самої смуги в координатах сторінки (fullPage + clip): так він не залежить від того, чи смуга ціла вміщується у вікно (низ сторінки, дробові пікселі, збільшений текст).
  const grab = async () => {
    const box = await page.evaluate(() => { const r = document.querySelector('.eua-site-notice').getBoundingClientRect(); return {x: Math.max(0, r.left + scrollX), y: r.top + scrollY, width: r.width, height: r.height}; });
    return (await page.screenshot({fullPage: true, clip: box})).toString('base64');
  };
  await setStyle('.eua-site-notice p, .eua-site-notice a', 'visibility:hidden');
  const backdrop = await grab();
  await restore();
  const inks = {};
  for (const [name, other] of [['p', 'a'], ['a', 'p']]) {
    await setStyle(`.eua-site-notice ${other}`, 'visibility:hidden');
    await setStyle(`.eua-site-notice ${name}`, 'font-size:72px;font-weight:900;line-height:1.1;letter-spacing:0');
    inks[name] = await grab();
    await restore();
  }
  const worst = await page.evaluate(async ({backdropShot, inkShots}) => {
    const pixels = async base64 => {
      const image = new Image(); image.src = 'data:image/png;base64,' + base64; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d', {willReadFrequently: true}); context.drawImage(image, 0, 0);
      return {width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data};
    };
    const linear = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const luminance = (r, g, b) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const back = await pixels(backdropShot), samples = [];
    for (let y = 4; y < back.height; y += 3) for (let x = 0; x < back.width; x += 5) { const i = (y * back.width + x) * 4; samples.push(luminance(back.data[i], back.data[i + 1], back.data[i + 2])); }
    const sorted = [...samples].sort((a, b) => a - b), median = sorted[Math.floor(sorted.length / 2)];
    let worstRatio = Infinity;
    for (const shot of Object.values(inkShots)) {
      const ink = await pixels(shot);
      let inkLuminance = median, far = 0;
      for (let y = 4; y < ink.height; y += 1) for (let x = 0; x < ink.width; x += 1) {
        const i = (y * ink.width + x) * 4, l = luminance(ink.data[i], ink.data[i + 1], ink.data[i + 2]);
        if (Math.abs(l - median) > far) { far = Math.abs(l - median); inkLuminance = l; }
      }
      for (const l of samples) worstRatio = Math.min(worstRatio, ratio(inkLuminance, l));
    }
    return worstRatio;
  }, {backdropShot: backdrop, inkShots: inks});
  check(where, worst >= 4.5, `the notice text keeps a contrast of at least 4.5:1 against the page behind it (worst pixel ${worst.toFixed(2)}:1)`);
}

const headerGeometry = new Map();
async function generic(browser, origin, viewport, file) {
  const where = `${file} @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
  await page.waitForSelector('.eua-site-header');
  check(where, (await page.locator('.eua-site-header').count()) === 1, 'exactly one common header is required');
  check(where, (await page.locator('.eua-header-wordmark small').innerText()).includes('ЗДОРОВ’Я'), 'the common brand tagline is missing');
  // Owner decision 2026-10-27: retain all canonical anchors in the DOM so the
  // home article router can reveal them; CSS compacts only the active home.
  const home = file === 'index.html';
  const canonicalNavigation = [
    ['Напрями', './directions.html'], ['Харчування', './nutrition.html'],
    ['Дослідження', './index.html#pubmed-live'], ['Атлас', './atlas.html'],
    ['Вправи', './exercises.html'], ['Добавки', './supplements.html']
  ];
  const navigation = await page.locator('.eua-site-header nav a').evaluateAll(nodes => nodes.map(node => [node.textContent.trim(), node.getAttribute('href')]));
  check(where, JSON.stringify(navigation) === JSON.stringify(canonicalNavigation), `the DOM must retain all six canonical navigation labels and targets; found ${JSON.stringify(navigation)}`);
  const checkVisibleNavigation = async () => {
    const expected = home ? ['Напрями', 'Дослідження'] : canonicalNavigation.map(([label]) => label);
    const visible = (await page.locator('.eua-site-header nav a:visible').allTextContents()).map(text => text.trim());
    check(where, JSON.stringify(visible) === JSON.stringify(expected), `rendered navigation must contain ${expected.join(', ')}; found ${visible.join(', ')}`);
  };
  if (home) check(where, await page.locator('.eua-site-header.eua-header-home-spectrum .eua-header-about').count() === 1, 'the compact home header keeps the about action');
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
  // The approved home masthead has its own serif composition and height;
  // retain identical-header geometry assertions for all other pages.
  if(!home&&!reference)headerGeometry.set(viewport.name,geometry);
  else if(!home)for(let i=0;i<geometry.length;i++)for(const axis of ['x','y','width','height']){
    check(where,Math.abs(geometry[i][axis]-reference[i][axis])<=1,`${geometry[i].selector} ${axis}=${geometry[i][axis]} differs from shared reference ${reference[i][axis]}`);
  }
  if(viewport.name === 'mobile'){
    const menu=page.locator('.eua-header-links'),toggle=page.locator('.eua-header-toggle');
    check(where, !(await menu.isVisible()), 'common menu must start closed on a phone');
    await toggle.click();
    check(where, await menu.isVisible(), 'common menu must open');
    await checkVisibleNavigation();
    await page.keyboard.press('Escape');
    check(where, !(await menu.isVisible()), 'Escape must close the common menu');
    check(where, await toggle.evaluate(n=>document.activeElement===n), 'Escape must restore focus to the menu toggle');
  } else await checkVisibleNavigation();
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
  await checkNotice(page, where);
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
  // The home examples are now folded; use the visible Nutrition direction.
  // Select by its name, not href: this must still catch a link that bypasses the hub.
  await openLensPicker(page);
  await page.locator('#cards').getByRole('link',{name:/Харчування/}).click();
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
  // Вибраний рядок графіка: назва читається на власному тлі (раніше це було золото на золоті).
  const rowContrast = await page.evaluate(() => {
    const row = document.querySelector('#chart .row[aria-pressed="true"]');
    if (!row) return {missing: true};
    const parse = s => s.match(/[\d.]+/g).map(Number);
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
    const bg = parse(getComputedStyle(row).backgroundColor), name = parse(getComputedStyle(row.querySelector('.name')).color), meta = parse(getComputedStyle(row.querySelector('.meta')).color);
    return {bg, name: ratio(bg, name), meta: ratio(bg, meta)};
  });
  check(where, !rowContrast.missing && rowContrast.name >= 4.5 && rowContrast.meta >= 3, `the selected timeline row must be readable: ${JSON.stringify(rowContrast)}`);
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
  // Owner 2026-10-28: the native library entrance starts closed.
  await toggleHomeFold(page, '.home-library-fold', true);
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
  // Рішення власника 2026-10-31: на головній кнопка «Аа», її меню й кнопка меню на телефоні лавандові, а не золоті; розмір дотику той самий.
  const lavender = 'rgb(209, 165, 255)';
  const toggleStyle = await toggle.evaluate(n => { const s = getComputedStyle(n); return {color: s.color, radius: s.borderTopLeftRadius, borderWidth: s.borderTopWidth}; });
  check(where, toggleStyle.color === lavender && toggleStyle.radius === '2px' && toggleStyle.borderWidth === '1px', `the home «Аа» button must be lavender with the home's straight corners: ${JSON.stringify(toggleStyle)}`);
  if (viewport.width <= 760) {
    const menu = page.locator('.home-menu-toggle');
    if (await menu.count() && await menu.first().isVisible()) {
      const menuStyle = await menu.first().evaluate(n => { const s = getComputedStyle(n), r = n.getBoundingClientRect(); return {color: s.color, radius: s.borderTopLeftRadius, w: r.width, h: r.height}; });
      check(where, menuStyle.color === lavender && menuStyle.radius === '2px' && menuStyle.w >= 44 && menuStyle.h >= 44, `the home menu button on the phone must be lavender too: ${JSON.stringify(menuStyle)}`);
    }
  }
  await toggle.click();
  const panel = page.locator('.eua-appearance-panel');
  check(where, await panel.getByRole('radio', {name: 'Темна', exact: true}).evaluate(n => getComputedStyle(n).color) === lavender, 'the chosen option in the home menu is lavender, not gold');
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

async function paletteFlow(browser, origin, viewport) {
  // Палітри (рішення власника 2026-10-31): космічна за замовчуванням, зелена — варіант у меню «Аа». Головна лишається власною.
  const where = `palette @${viewport.name}`;
  const COSMIC_BG = 'rgb(11, 10, 18)', PINE_BG = 'rgb(13, 25, 22)';
  const background = page => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const accent = page => page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--pine-accent').trim().toLowerCase());
  const {context, page, seen} = await open(browser, origin, viewport, '/research.html');
  const html = page.locator('html');
  check(where, (await html.getAttribute('data-palette')) === null, 'first visit: the cosmic palette is the default, no attribute');
  check(where, (await background(page)) === COSMIC_BG, `the cosmic page background must equal the home background: ${await background(page)}`);
  check(where, (await accent(page)) === '#d1a5ff', `the cosmic accent must equal the home accent: ${await accent(page)}`);
  await page.locator('.eua-appearance-toggle').click();
  const panel = page.locator('.eua-appearance-panel'), group = panel.locator('[data-kind="palette"]');
  check(where, (await group.count()) === 1 && (await group.getByRole('radio').count()) === 2, 'the panel has one colour group with two choices');
  check(where, (await group.getByRole('radio', {name: 'Космос', exact: true}).getAttribute('aria-checked')) === 'true' && (await group.getByRole('radio', {name: 'Зелений', exact: true}).getAttribute('aria-checked')) === 'false', 'cosmic is the selected colour at first');
  const pbox = await panel.boundingBox();
  check(where, pbox && pbox.x >= 0 && pbox.x + pbox.width <= viewport.width + 1, 'the panel with the colour group must stay inside the viewport');
  await artifact(page, viewport, 'palette-panel', panel);
  await group.getByRole('radio', {name: 'Зелений', exact: true}).click();
  check(where, (await html.getAttribute('data-palette')) === 'green', 'choosing «Зелений» sets data-palette on the root');
  check(where, (await background(page)) === PINE_BG, `the green palette shows the former pine background: ${await background(page)}`);
  check(where, (await accent(page)) === '#e3bd6b', `the green palette shows the former gold accent: ${await accent(page)}`);
  check(where, (await group.getByRole('radio', {name: 'Зелений', exact: true}).getAttribute('aria-checked')) === 'true', 'the green choice is marked');
  check(where, await group.getByRole('radio', {name: 'Зелений', exact: true}).evaluate(n => n === document.activeElement), 'focus stays on the chosen colour after the panel is rebuilt');
  check(where, (await page.evaluate(() => JSON.parse(localStorage.getItem('eua-appearance-v1')).palette)) === 'green', 'the choice is stored in the existing appearance record');
  // Збережений вибір діє на інших сторінках цього ж браузера.
  await page.goto(origin + '/fat-burning.html', {waitUntil: 'load'});
  check(where, (await html.getAttribute('data-palette')) === 'green' && (await background(page)) === PINE_BG, 'the green choice follows the visitor to another page');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the green palette');
  // Повернення до космосу.
  await page.locator('.eua-appearance-toggle').click();
  await page.locator('.eua-appearance-panel [data-kind="palette"]').getByRole('radio', {name: 'Космос', exact: true}).click();
  check(where, (await html.getAttribute('data-palette')) === null && (await background(page)) === COSMIC_BG, 'switching back restores the cosmic palette');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the cosmic palette');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, `the palette switch must not raise errors or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external].join(' | ')}`);
  await context.close();
  // Головна: власні стилі. Вибір кольору там не показується, не змінює її вигляд і файл палітри на ній не вантажиться.
  const home = await open(browser, origin, viewport, '/index.html', {initScript: () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}))});
  check(where, (await background(home.page)) === COSMIC_BG, `the home page keeps its own cosmic background even if green is chosen: ${await background(home.page)}`);
  check(where, !home.seen.requested.some(u => u.startsWith('/palette-cosmic.css')), 'the home page never loads the palette file');
  await home.page.locator('.eua-appearance-toggle').click();
  check(where, (await home.page.locator('.eua-appearance-panel [data-kind="palette"]').count()) === 0 && (await home.page.locator('.eua-appearance-panel [data-kind]').count()) === 2, 'the home panel has theme and text size only');
  check(where, (await home.page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the home page with green chosen');
  check(where, home.seen.pageErrors.length === 0 && home.seen.console.length === 0, `the home page must not raise errors: ${[...home.seen.pageErrors, ...home.seen.console].join(' | ')}`);
  await home.context.close();
  // Ранній скрипт у <head> ставить колір до першого малювання: навіть коли модуль appearance.js не завантажився.
  const early = await open(browser, origin, viewport, '/glossary.html', {initScript: () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}))});
  check(where, (await early.page.locator('html').getAttribute('data-palette')) === 'green' && (await background(early.page)) === PINE_BG, 'a stored green choice is applied at load');
  await early.context.close();
  const blocked = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, serviceWorkers: 'block'});
  await blocked.addInitScript(() => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'})));
  await blocked.route('**/appearance.js*', r => r.abort());
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(origin + '/glossary.html', {waitUntil: 'domcontentloaded'});
  check(where, (await blockedPage.locator('html').getAttribute('data-palette')) === 'green', 'the inline head script applies the saved palette even when the appearance module never loads');
  await blocked.close();
}

// Малюнки й плити у двох палітрах (рішення власника 2026-11-01). Космос (за замовчуванням) показує фіолетову копію малюнка, «Зелений» — оригінал;
// друга копія не показується й не завантажується. Міряємо те, що справді намальовано: видимість, завантаження, колір тла плиток дієт і плит схем.
async function artPairsFlow(browser, origin, viewport) {
  const where = `art pairs @${viewport.name}`;
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  const ORIGINAL = /\/(?:diet-art|home-sleep|home-anatomy|home-movement|card-organism|card-nutrition|card-evidence|muscle-lab-art-v1|card-thumb-[a-z]+-v1)\.(?:svg|webp)/;
  const hueOf = ([r, g, b]) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (!d) return 0;
    const h = 60 * (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
    return h < 0 ? h + 360 : h;
  };
  for (const palette of ['cosmic', 'green']) {
    const mine = palette === 'cosmic' ? 'cosmic' : 'green', other = palette === 'cosmic' ? 'green' : 'cosmic';
    for (const route of ['/nutrition.html', '/sleep.html', '/atlas.html', '/directions.html']) {
      const {context, page, seen} = await open(browser, origin, viewport, route, palette === 'green' ? {initScript: green} : {});
      // Ледачі картинки вантажаться біля екрана: підводимо до екрана кожну показану, а сховані пропускаємо (вони й не мають вантажитись).
      await page.evaluate(async () => { for (const img of document.querySelectorAll('img[data-art]')) { if (getComputedStyle(img).display === 'none') continue; img.scrollIntoView({block: 'center'}); await Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 2500))]); } scrollTo(0, 0); });
      await page.waitForTimeout(500);
      const images = await page.evaluate(() => [...document.querySelectorAll('img[data-art]')].map(img => {
        const box = img.getBoundingClientRect();
        let corner = null;
        try { const c = document.createElement('canvas'); c.width = c.height = 40; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(img, 0, 0, img.naturalWidth || 480, img.naturalHeight || 300, 0, 0, 40, 40); corner = [...x.getImageData(2, 2, 1, 1).data].slice(0, 3); } catch {}
        return {art: img.dataset.art, shown: box.width > 0 && getComputedStyle(img).display !== 'none', loaded: img.complete && img.naturalWidth > 0, corner, alt: img.alt};
      }));
      const tag = `${palette} ${route}`;
      check(where, images.length > 0 && images.length % 2 === 0 && images.filter(i => i.art === 'green').length === images.filter(i => i.art === 'cosmic').length, `${tag}: every picture comes as a green/cosmic pair (${images.length})`);
      check(where, images.filter(i => i.art === mine).every(i => i.shown && i.loaded) && images.some(i => i.art === mine && i.shown), `${tag}: the ${mine} pictures are shown and loaded`);
      check(where, images.filter(i => i.art === other).every(i => !i.shown), `${tag}: no ${other} picture is shown`);
      check(where, palette === 'cosmic' ? !seen.requested.some(u => ORIGINAL.test(u)) : !seen.requested.some(u => /-cosmic\.(?:svg|webp)/.test(u)), `${tag}: the hidden copies are not downloaded (${seen.requested.filter(u => ORIGINAL.test(u) || /-cosmic\./.test(u)).join(' ')})`);
      if (route === '/nutrition.html') {
        const tiles = images.filter(i => i.art === mine);
        check(where, tiles.length === 8 && tiles.every(i => i.corner), `${tag}: eight diet tiles can be measured`);
        const hues = tiles.filter(i => i.corner).map(i => Math.round(hueOf(i.corner)));
        check(where, palette === 'cosmic' ? hues.every(h => h >= 235 && h <= 295) : hues.every(h => h < 235), `${tag}: the diet tile backgrounds are ${palette === 'cosmic' ? 'violet' : 'the old green/olive/blue-grey'} (${hues.join(', ')}°)`);
      }
      if (route === '/atlas.html') {
        await page.locator('[data-zone="knee"]').first().click();
        await page.waitForTimeout(400);
        const left = await page.evaluate(() => [...document.querySelectorAll('img.atlas-figure')].filter(i => i.getBoundingClientRect().width > 0 && getComputedStyle(i).display !== 'none').length);
        check(where, left === 0, `${tag}: opening the knee map hides the figure whichever copy is shown (${left} left)`);
      }
      check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `${tag}: no errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
      await context.close();
    }
  }
  // Плити схем: градієнти, намальовані SVG-атрибутами, у космосі фіолетові, у «Зеленому» колишні бірюзові.
  for (const [palette, route, selector, expected] of [['cosmic', '/muscle-lab.html', '#sa-bg stop', 'rgb(29, 19, 42)'], ['green', '/muscle-lab.html', '#sa-bg stop', 'rgb(13, 34, 48)'], ['cosmic', '/nutrition-inside.html', '#nl-cytoplasm stop', 'rgb(58, 44, 83)'], ['green', '/nutrition-inside.html', '#nl-cytoplasm stop', 'rgb(33, 86, 94)']]) {
    const {context, page, seen} = await open(browser, origin, viewport, route, palette === 'green' ? {initScript: green} : {});
    const colour = await page.evaluate(sel => { const stop = document.querySelector(sel); return stop && getComputedStyle(stop).stopColor; }, selector);
    check(where, colour === expected, `${palette} ${route}: the plate gradient ${selector} is ${expected} (got ${colour})`);
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `${palette} ${route}: no errors`);
    await context.close();
  }
}

// Картка «Клітини та органели» в каталозі напрямів (2026-11-03, власник: «пропала картинка клітини у напрямку про клітину … клітина там де органели всередині …
// яка на сторінці „Клітина людини“ сама головна»). Було: лише тьмяна піктограма card-organism (після фіолетового перефарбування майже невидима), а в «М'язів» стояла справжня
// картина. Стало: головна картина сторінки «Клітина людини» (кадр cell-atlas-v2.webp, scripts/make-cell-card-art.py). Міряємо те, що справді намальовано в браузері: картина
// в картці одна, завантажена й видима в обох палітрах, яскрава й кольорова (піктограма мала яскравість близько 1 із 255), і це саме кадр головної картини: різниця до вирізки
// cell-atlas-v2.webp (координати беремо зі скрипта, що її робить) мала, а до зсунутої вирізки й до всієї картини, стиснутої в квадрат, велика. Контроль від зворотного: стара
// піктограма card-organism-cosmic.svg ті самі мірки не проходить.
async function catalogCellPictureFlow(browser, origin, viewport) {
  const where = `catalog cell picture @${viewport.name}`;
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  const tool = fs.readFileSync(path.join(root, 'scripts', 'make-cell-card-art.py'), 'utf8');
  const crop = tool.match(/CROP = \((\d+), (\d+), (\d+), (\d+)\)/);
  check(where, Boolean(crop), 'scripts/make-cell-card-art.py states the crop of the main picture');
  const [left, top, right, bottom] = crop ? crop.slice(1).map(Number) : [0, 0, 1, 1];
  const sources = [];
  for (const palette of ['cosmic', 'green']) {
    const {context, page, seen} = await open(browser, origin, viewport, '/directions.html', palette === 'green' ? {initScript: green} : {});
    await page.waitForSelector('.area-card');
    const tag = `${palette}`;
    const stats = await page.evaluate(async ([l, t, r, b]) => {
      const cards = [...document.querySelectorAll('.area-card')].filter(c => c.querySelector('a.area-open[href="./cell-lab.html"]'));
      const out = {cards: cards.length};
      const card = cards[0];
      if (!card) return out;
      const imgs = [...card.querySelectorAll('.area-visual img')];
      const visible = imgs.filter(i => getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0);
      Object.assign(out, {total: imgs.length, visible: visible.length, paired: imgs.some(i => i.hasAttribute('data-art'))});
      const img = visible[0];
      if (!img) return out;
      img.scrollIntoView({block: 'center'});
      await Promise.race([img.decode().catch(() => {}), new Promise(done => setTimeout(done, 4000))]);
      const N = 24;
      const sample = (image, sx, sy, sw, sh) => { const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(image, sx, sy, sw, sh, 0, 0, N, N); return x.getImageData(0, 0, N, N).data; };
      const bright = data => { let lum = 0, colour = 0, n = 0; for (let i = 0; i < data.length; i += 4) { const red = data[i], green = data[i + 1], blue = data[i + 2]; lum += 0.2126 * red + 0.7152 * green + 0.0722 * blue; if (Math.max(red, green, blue) - Math.min(red, green, blue) > 40) colour++; n++; } return {lum: lum / n, colourShare: colour / n}; };
      const diff = (a, c) => { let sum = 0; for (let i = 0; i < a.length; i += 4) sum += Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]); return sum / (a.length / 4 * 3); };
      const load = src => new Promise(done => { const i = new Image(); i.onload = () => done(i); i.onerror = () => done(null); i.src = src; });
      const [atlas, icon] = await Promise.all([load('/cell-atlas-v2.webp'), load('/card-organism-cosmic.svg')]);
      const box = img.getBoundingClientRect(), style = getComputedStyle(img);
      Object.assign(out, {src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0, natural: img.naturalWidth, width: Math.round(box.width), height: Math.round(box.height), fit: style.objectFit, padding: style.paddingLeft});
      const mine = sample(img, 0, 0, img.naturalWidth, img.naturalHeight);
      Object.assign(out, bright(mine));
      if (atlas) {
        out.sameCrop = diff(mine, sample(atlas, l, t, r - l, b - t));
        out.shifted = diff(mine, sample(atlas, l + 100, t, r - l, b - t));
        out.squashed = diff(mine, sample(atlas, 0, 0, atlas.naturalWidth, atlas.naturalHeight));
      }
      if (icon) out.control = bright(sample(icon, 0, 0, icon.naturalWidth || 360, icon.naturalHeight || 176));
      return out;
    }, [left, top, right, bottom]);
    check(where, stats.cards === 1, `${tag}: exactly one cell card in the catalogue (${stats.cards})`);
    check(where, stats.total === 1 && stats.visible === 1 && stats.paired === false, `${tag}: the cell tile holds one picture for both palettes, and it is shown (${stats.visible}/${stats.total}, paired ${stats.paired})`);
    check(where, stats.loaded === true && stats.natural === 240 && /cell-atlas-card-v1\.webp$/.test(stats.src || ''), `${tag}: the card shows cell-atlas-card-v1.webp, loaded (${stats.src}, ${stats.natural}px)`);
    check(where, stats.width >= 56 && stats.height >= 56 && stats.fit === 'cover' && stats.padding === '0px', `${tag}: the picture fills the tile without margins (${stats.width}×${stats.height}, ${stats.fit}, padding ${stats.padding})`);
    check(where, stats.lum >= 40 && stats.colourShare >= 0.25, `${tag}: the picture is bright and colourful, not a dim icon (luminance ${Math.round(stats.lum)}/255, colourful share ${(stats.colourShare * 100).toFixed(0)} %)`);
    check(where, stats.sameCrop <= 12 && stats.shifted >= 16 && stats.squashed >= 16, `${tag}: it is the crop of the main picture of the page «Клітина людини» (difference ${stats.sameCrop?.toFixed(1)}; shifted ${stats.shifted?.toFixed(1)}, squashed ${stats.squashed?.toFixed(1)})`);
    check(where, Boolean(stats.control) && stats.control.lum < 40 && stats.control.colourShare < 0.25, `${tag}: control: the old dim icon fails the same brightness gauge (luminance ${Math.round(stats.control?.lum ?? -1)}, colourful share ${((stats.control?.colourShare ?? -1) * 100).toFixed(1)} %)`);
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, `${tag}: no horizontal overflow`);
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `${tag}: no errors, failed or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external, ...seen.badResponses].join(' | ')}`);
    sources.push(stats.src);
    await artifact(page, viewport, `catalog-cell-${palette}`, page.locator('.area-card', {has: page.locator('a.area-open[href="./cell-lab.html"]')}).first());
    await context.close();
  }
  check(where, sources.length === 2 && sources[0] === sources[1], `the same picture is shown in both palettes (${sources.join(' / ')})`);
}

// Картки Харчування, Добавок, Руху й Сну в каталозі напрямів (2026-11-03, власник: «26 так»). Було: лише тьмяні піктограми (яскравість від 0,2 до 1,6 із 255). Стало: квадратні кадри картин
// напрямів із вікна «Куди рушимо далі?» (scripts/make-direction-thumbs.py), у двох палітрах (пара data-art). Міряємо те, що намальовано: у кожній картці показано рівно один файл палітри
// (-cosmic у космосі, оригінал у «Зеленому»), він завантажений, заповнює плитку, яскравий і не плаский (яскравість та розкид яскравості), і це саме кадр картини напряму: різниця до вирізки
// цієї картини (координати беремо зі скрипта) мала, а до зсунутої вирізки й до всієї картини, стиснутої в квадрат, велика. Контроль від зворотного: стара піктограма тих самих мірок не проходить.
async function catalogThumbsFlow(browser, origin, viewport) {
  const where = `catalog direction pictures @${viewport.name}`;
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  const tool = fs.readFileSync(path.join(root, 'scripts', 'make-direction-thumbs.py'), 'utf8');
  const rows = [...tool.matchAll(/\('(\w+)', '(card-art-[\w-]+)', \((\d+), (\d+), (\d+), (\d+)\)\)/g)].map(m => ({area: m[1], source: m[2], crop: m.slice(3).map(Number)}));
  check(where, rows.map(r => r.area).join() === 'nutrition,supplements,movement,sleep', 'scripts/make-direction-thumbs.py states the crops of the four direction pictures');
  const hrefs = {nutrition: './nutrition.html', supplements: './supplements.html', movement: './movement.html', sleep: './sleep.html'};
  const icons = {nutrition: '/card-nutrition-cosmic.svg', supplements: '/card-evidence-cosmic.svg', movement: '/home-movement-cosmic.svg', sleep: '/home-sleep-cosmic.svg'};
  for (const palette of ['cosmic', 'green']) {
    const {context, page, seen} = await open(browser, origin, viewport, '/directions.html', palette === 'green' ? {initScript: green} : {});
    await page.waitForSelector('.area-card');
    const suffix = palette === 'cosmic' ? '-cosmic' : '';
    for (const row of rows) {
      const tag = `${palette} ${row.area}`;
      const stats = await page.evaluate(async ({href, art, source, crop, icon}) => {
        const card = [...document.querySelectorAll('.area-card')].find(c => c.querySelector(`a.area-open[href="${href}"]`));
        const out = {found: Boolean(card)};
        if (!card) return out;
        const imgs = [...card.querySelectorAll('.area-visual img')];
        const visible = imgs.filter(i => getComputedStyle(i).display !== 'none' && i.getBoundingClientRect().width > 0);
        Object.assign(out, {total: imgs.length, visible: visible.length, tile: card.querySelector('.area-visual')?.className || ''});
        const img = visible[0];
        if (!img) return out;
        img.scrollIntoView({block: 'center'});
        await Promise.race([img.decode().catch(() => {}), new Promise(done => setTimeout(done, 4000))]);
        const N = 24;
        const sample = (image, sx, sy, sw, sh) => { const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', {willReadFrequently: true}); x.drawImage(image, sx, sy, sw, sh, 0, 0, N, N); return x.getImageData(0, 0, N, N).data; };
        const gauge = data => { const lum = []; for (let i = 0; i < data.length; i += 4) lum.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]); const mean = lum.reduce((a, b) => a + b, 0) / lum.length; return {lum: mean, spread: Math.sqrt(lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length)}; };
        const diff = (a, c) => { let sum = 0; for (let i = 0; i < a.length; i += 4) sum += Math.abs(a[i] - c[i]) + Math.abs(a[i + 1] - c[i + 1]) + Math.abs(a[i + 2] - c[i + 2]); return sum / (a.length / 4 * 3); };
        const load = src => new Promise(done => { const i = new Image(); i.onload = () => done(i); i.onerror = () => done(null); i.src = src; });
        const [original, oldIcon] = await Promise.all([load(source), load(icon)]);
        const box = img.getBoundingClientRect(), style = getComputedStyle(img);
        Object.assign(out, {src: img.getAttribute('src'), art: img.dataset.art, loaded: img.complete && img.naturalWidth > 0, natural: img.naturalWidth, width: Math.round(box.width), height: Math.round(box.height), fit: style.objectFit, padding: style.paddingLeft});
        const mine = sample(img, 0, 0, img.naturalWidth, img.naturalHeight);
        Object.assign(out, gauge(mine));
        if (original) {
          const [l, t, r, b] = crop, w = r - l, h = b - t, moved = Math.min(Math.max(0, l + 100), original.naturalWidth - w), shifted = moved === l ? Math.max(0, l - 100) : moved;
          out.sameCrop = diff(mine, sample(original, l, t, w, h));
          out.shifted = diff(mine, sample(original, shifted, t, w, h));
          out.squashed = diff(mine, sample(original, 0, 0, original.naturalWidth, original.naturalHeight));
        }
        if (oldIcon) out.control = gauge(sample(oldIcon, 0, 0, oldIcon.naturalWidth || 360, oldIcon.naturalHeight || 176));
        return out;
      }, {href: hrefs[row.area], art: `card-thumb-${row.area}-v1${suffix}.webp`, source: `/${row.source}${suffix}.webp`, crop: row.crop, icon: icons[row.area]});
      check(where, stats.found === true, `${tag}: the card is in the catalogue`);
      check(where, stats.total === 2 && stats.visible === 1 && stats.art === palette && /area-visual-photo/.test(stats.tile), `${tag}: the tile holds the green/cosmic pair, shows only the ${palette} copy and is a photo tile (${stats.visible}/${stats.total}, ${stats.art}, ${stats.tile})`);
      check(where, stats.loaded === true && stats.natural === 240 && stats.src === `./card-thumb-${row.area}-v1${suffix}.webp`, `${tag}: the card shows card-thumb-${row.area}-v1${suffix}.webp, loaded (${stats.src}, ${stats.natural}px)`);
      check(where, stats.width >= 56 && stats.height >= 56 && stats.fit === 'cover' && stats.padding === '0px', `${tag}: the picture fills the tile without margins (${stats.width}×${stats.height}, ${stats.fit}, padding ${stats.padding})`);
      check(where, stats.lum >= 40 && stats.spread >= 25, `${tag}: the picture is bright and not flat, not a dim icon (luminance ${Math.round(stats.lum)}/255, spread ${Math.round(stats.spread)})`);
      check(where, stats.sameCrop <= 10 && stats.shifted >= 12 && stats.squashed >= 12, `${tag}: it is the crop of the picture of the direction (difference ${stats.sameCrop?.toFixed(1)}; shifted ${stats.shifted?.toFixed(1)}, squashed ${stats.squashed?.toFixed(1)})`);
      check(where, Boolean(stats.control) && stats.control.lum < 40 && stats.control.spread < 25, `${tag}: control: the old dim icon fails the same gauge (luminance ${Math.round(stats.control?.lum ?? -1)}, spread ${Math.round(stats.control?.spread ?? -1)})`);
      await artifact(page, viewport, `catalog-thumb-${row.area}-${palette}`, page.locator('.area-card', {has: page.locator(`a.area-open[href="${hrefs[row.area]}"]`)}).first());
    }
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, `${palette}: no horizontal overflow`);
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `${palette}: no errors, failed or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external, ...seen.badResponses].join(' | ')}`);
    await context.close();
  }
}

// Сторінка «Клітина людини» на телефоні: головна картина першою (2026-11-03, власник: «27 так»). Було: у першому екрані телефона лише кнопки кроків і перемикач рівня, картина починалася
// на 902 px від верху, а на екрані Safari вміщується близько 660 px. Стало: до 800 px картина зі станом, «Назад / Далі» і швидким вибором йде одразу після назви (близько 410 px), далі кроки й
// рівень, примітка про перегляд, пояснення, список. Міряємо те, що справді показано: порядок блоків на екрані, положення й видимість картини в першому екрані, прихований дубль «До пояснення ↓»,
// незмінений порядок у документі (табуляція), вибір структури зі списку (тап відкриває деталь, закрити повертає картину), маршрут з ?path= (рядок маршруту після картини) і незмінність
// комп'ютерної версії (від 801 px блок .explorer лишається сіткою, кроки й примітка над картиною).
async function cellPictureFirstFlow(browser, origin, viewport) {
  const where = `cell picture first @${viewport.name}`;
  const phone = viewport.width <= 800;
  const {context, page, seen} = await open(browser, origin, viewport, '/cell-lab.html');
  await page.waitForSelector('svg.cell-atlas');
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const box = selector => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return {top: r.top + scrollY, bottom: r.bottom + scrollY, height: r.height, width: r.width, display: getComputedStyle(e).display}; };
    const explorer = document.querySelector('.explorer'), list = explorer.querySelector(':scope>.structure-list'), figure = explorer.querySelector(':scope>figure'), panel = explorer.querySelector(':scope>.panel'), intro = document.querySelector('.intro'), note = document.querySelector('.review-note');
    const before = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const step2 = document.querySelector('.cell-route a[href="#organelle-panel"]');
    return {
      svg: box('svg.cell-atlas'), figure: box('.explorer>figure'), intro: box('.intro'), note: box('.review-note'), panel: box('.explorer>.panel'), list: box('.explorer>.structure-list'), explorer: box('.explorer'), pb: box('section.pb'),
      jump: box('.explorer>figure>.model-jumps'), back: box('.explorer>.panel .model-jumps'),
      step2: step2 ? {display: getComputedStyle(step2).display, width: step2.getBoundingClientRect().width} : null,
      domOrder: before(intro, note) && before(note, explorer) && before(list, figure) && before(figure, panel), vh: innerHeight, overflow: document.documentElement.scrollWidth - innerWidth,
      levels: (() => { const shown = e => Boolean(e) && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; return {top: shown(document.querySelector('.intro .levels')), panel: shown(document.querySelector('.panel .reading-level-options')), buttons: document.querySelectorAll('[data-level]').length}; })(),
    };
  });
  const show = (a, b) => a && b && a.top < b.top;
  if (phone) {
    check(where, show(m.figure, m.intro) && show(m.intro, m.note) && show(m.note, m.panel) && show(m.panel, m.list), `the blocks follow the new order: picture, steps, note, explanation, list (${[m.figure, m.intro, m.note, m.panel, m.list].map(b => Math.round(b?.top)).join(' < ')})`);
    check(where, m.explorer.display === 'contents', `the explorer block lets its children join the column (display ${m.explorer.display})`);
    check(where, m.svg.top <= 450, `the picture starts near the top of the page (${Math.round(m.svg.top)} px, was 902 on 390 px)`);
    const seen1 = Math.max(0, Math.min(m.svg.bottom, m.vh) - m.svg.top) / m.svg.height;
    check(where, m.vh < 664 || seen1 >= 0.9, `at least 90 % of the picture is in the first screen of ${m.vh} px (${Math.round(seen1 * 100)} %)`);
    check(where, m.jump && m.jump.display === 'none' && m.back && m.back.display !== 'none', `the jump «До пояснення ↓» above the picture is hidden, «До моделі ↑» in the explanation stays (${m.jump?.display}, ${m.back?.display})`);
    check(where, m.step2 && m.step2.display !== 'none' && m.step2.width > 100, 'step «02 Прочитай функцію» still leads to the explanation');
    check(where, m.levels.top === false && m.levels.panel === true && m.levels.buttons === 6, `on a phone the level switch is shown once, in the explanation; both copies stay in the markup (top ${m.levels.top}, explanation ${m.levels.panel}, buttons ${m.levels.buttons})`);
  } else {
    check(where, m.explorer.display === 'grid', `above 800 px the explorer stays a grid (${m.explorer.display})`);
    check(where, show(m.intro, m.note) && show(m.note, m.figure) && m.intro.bottom <= m.figure.top + 1, 'above 800 px the steps and the note stay above the picture');
    check(where, m.jump && m.jump.display !== 'none', 'above 800 px the jump above the picture stays');
    check(where, m.levels.top === true && m.levels.panel === true, `above 800 px both level switches stay (top ${m.levels.top}, explanation ${m.levels.panel})`);
    if (viewport.width >= 1100) check(where, Math.abs(m.list.top - m.figure.top) <= 2 && Math.abs(m.panel.top - m.figure.top) <= 2, 'on a wide screen the list, the picture and the explanation share one row');
  }
  check(where, m.domOrder, 'the order of the blocks in the document is unchanged (steps, note, list, picture, explanation), so tab order is unchanged');
  check(where, m.overflow <= 1, `no horizontal overflow (${m.overflow})`);
  if (phone) {
    // Єдиний видимий перемикач рівня працює і тримає в ногу прихований дубль: «Школа» міняє пояснення, «Університет» повертає.
    await page.locator('.panel .reading-level-options [data-level="school"]').click();
    await page.waitForTimeout(200);
    const school = await page.evaluate(() => ({pressed: [...document.querySelectorAll('[data-level="school"]')].map(b => b.getAttribute('aria-pressed')), other: [...document.querySelectorAll('[data-level="university"]')].map(b => b.getAttribute('aria-pressed')), text: document.querySelector('#organelle-copy').textContent}));
    check(where, school.pressed.join() === 'true,true' && school.other.join() === 'false,false' && /Почни з ролі структури/.test(school.text), `the level switch in the explanation changes the level in both copies and the text (${school.pressed}; ${school.other})`);
    await page.locator('.panel .reading-level-options [data-level="university"]').click();
    await page.waitForTimeout(200);
    const university = await page.evaluate(() => ({pressed: [...document.querySelectorAll('[data-level="university"]')].map(b => b.getAttribute('aria-pressed')), text: document.querySelector('#organelle-copy').textContent}));
    check(where, university.pressed.join() === 'true,true' && /Функції різних структур/.test(university.text), 'switching back to the university level restores the text in both copies');
    // Вибір структури зі списку працює: тап відкриває детальний вигляд, сторінка піднімається до картини, «Закрити» повертає схему.
    await page.locator('#organelle-list button[data-organelle="ORG-NUCLEUS"]').click();
    await page.waitForTimeout(500);
    const open1 = await page.evaluate(() => ({detail: !document.querySelector('#cell-detail').hidden, atlas: !document.querySelector('.cell-atlas-frame').hidden, label: document.querySelector('#selected-label').textContent, canvasTop: document.querySelector('#cell-canvas').getBoundingClientRect().top}));
    check(where, open1.detail && !open1.atlas && /Ядро/.test(open1.label) && Math.abs(open1.canvasTop) < 140, `a tap on «Ядро» in the list opens the detail view and brings the picture to the top (${open1.label}, canvas at ${Math.round(open1.canvasTop)} px)`);
    await page.locator('[data-cell-detail-action="close"]').first().click();
    await page.waitForTimeout(300);
    const closed = await page.evaluate(() => ({detail: !document.querySelector('#cell-detail').hidden, atlas: !document.querySelector('.cell-atlas-frame').hidden}));
    check(where, !closed.detail && closed.atlas, 'closing the detail view brings the whole cell picture back');
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `no errors, failed or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external, ...seen.badResponses].join(' | ')}`);
  await context.close();

  // Маршрут з головної («Почати маршрут: Загальна клітина»): рядок маршруту стоїть після картини на телефоні й, як раніше, перед нею на комп'ютері; картина в кадрі після переходу до #cell-canvas.
  const route = await open(browser, origin, viewport, '/cell-lab.html?path=structure&lesson=0#cell-canvas');
  await route.page.waitForSelector('.eua-learning-nav');
  await route.page.waitForTimeout(500);
  const r = await route.page.evaluate(() => { const canvas = document.querySelector('#cell-canvas').getBoundingClientRect(), nav = document.querySelector('.eua-learning-nav').getBoundingClientRect(); return {canvasTop: canvas.top, canvasBottom: canvas.bottom, navTop: nav.top, navBottom: nav.bottom, vh: innerHeight, svg: document.querySelector('svg.cell-atlas').getBoundingClientRect().height}; });
  if (phone) check(where, r.navTop >= r.canvasBottom - 1, `route mode: the route line comes after the picture block (picture ends ${Math.round(r.canvasBottom)}, line starts ${Math.round(r.navTop)})`);
  else check(where, r.navBottom <= r.canvasTop + 1, 'route mode on a wide screen: the route line stays above the picture');
  check(where, r.canvasTop >= -2 && r.canvasBottom <= r.vh + 2, `route mode: the picture block is fully in view after the jump to #cell-canvas (${Math.round(r.canvasTop)}…${Math.round(r.canvasBottom)} of ${r.vh})`);
  check(where, route.seen.pageErrors.length === 0 && route.seen.console.length === 0 && route.seen.external.length === 0, 'route mode: no errors or third-party requests');
  await artifact(route.page, viewport, 'cell-picture-first-route', route.page.locator('#cell-canvas'), {scroll: false});
  await route.context.close();
  const top = await open(browser, origin, viewport, '/cell-lab.html');
  await top.page.waitForSelector('svg.cell-atlas');
  await top.page.waitForTimeout(400);
  await artifact(top.page, viewport, 'cell-picture-first', top.page.locator('body'), {scroll: false});
  await top.context.close();
}

// Розбори добавок на головній (index.html#creatine, #supplement-…, режим «стаття») у космічних кольорах і формах решти сайту (2026-11-03, «A: кольори й форми»; гілку довів
// до PR і виправив 2026-11-04 за рішенням власника 30). Стилі розборів лежать у самій головній, яка файл палітри не вантажить, тож їх перефарбовує згенерований файл
// home-article-cosmic.css під body[data-route-view="article"]. Міряємо справжній вигляд у браузері, а не наявність правил у файлі:
//  • золото зникло (жодного елемента з золотим кольором тексту, тла, рамки чи контуру; відкрите меню шапки теж), радіуси лише 3 і 5 px, тло сторінки й смуга шапки фіолетово-чорні;
//  • заголовки (h1–h4, крім підписів .pc-bar-group > h3) тонкі, із засічками (Source Serif 4, вага 400, стиснуті літери);
//  • копії старих правил НЕ перемагають сильніших: «← На головну» (темний текст на лавандовій кнопці), бірюзові кнопки «Докази й межі» й керування анімації в Креатині лишились
//    бірюзовими, а в добавок стали лавандовими; жоден текст (крім вимкнених кнопок) не гірший за 4,5:1 (3:1 для великого);
//  • три кнопки шапки (Пошук, «Аа», меню на телефоні) однакові: радіус 3 px, лавандовий колір; розкладка та сама (немає горизонтальної прокрутки);
//  • «Зелений» варіант і сама головна лишаються як були; режим перемикається туди й назад без перезавантаження.
const ARTICLE_IDS = ['creatine', 'supplement-protein', 'supplement-berberine', 'supplement-omega', 'supplement-vitd', 'supplement-caffeine', 'supplement-magnesium', 'supplement-collagen', 'supplement-beta-alanine', 'supplement-citrulline', 'supplement-electrolytes'];
const articleProbe = id => {
  const parse = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (fg, bg) => ({r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1});
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hsl = c => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return {h, s, l}; };
  const goldish = c => { if (!c || c.a < 0.2) return false; const q = hsl(c); return q.h >= 36 && q.h <= 52 && q.s >= 0.5 && q.l >= 0.4 && q.l <= 0.85; };
  const stops = img => [...(img || '').matchAll(/rgba?\([^)]+\)/g)].map(m => parse(m[0])).filter(Boolean);
  const backgrounds = el => {
    // Найгірші можливі тла під елементом: суцільний колір найближчого непрозорого предка (або кожна зупинка градієнта), поверх нього всі прозорі шари між ними.
    let chain = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    let cands = [{r: 0, g: 0, b: 0, a: 1}], cut = chain.length;
    for (let i = 0; i < chain.length; i++) {
      const cs = getComputedStyle(chain[i]), c = parse(cs.backgroundColor), grad = /gradient/.test(cs.backgroundImage), s = grad ? stops(cs.backgroundImage) : [];
      if (grad && s.length && s.every(x => x.a >= 0.99)) { cands = s.map(x => ({r: x.r, g: x.g, b: x.b, a: 1})); cut = i; break; }
      if (c && c.a >= 0.99) { cands = [{r: c.r, g: c.g, b: c.b, a: 1}]; cut = i; break; }
    }
    for (let i = cut - 1; i >= 0; i--) {
      const cs = getComputedStyle(chain[i]), c = parse(cs.backgroundColor);
      if (c && c.a > 0 && c.a < 0.99) cands = cands.map(b => over(c, b));
      else if (/gradient/.test(cs.backgroundImage)) { const s = stops(cs.backgroundImage); if (s.length) cands = cands.flatMap(b => s.map(x => over(x, b))); }
    }
    return cands;
  };
  const shown = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && (!el.checkVisibility || el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})); };
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  // На телефоні відкриваємо меню шапки: його пункти теж не повинні лишитися золотими.
  const toggle = document.querySelector('.home-menu-toggle');
  if (toggle && shown(toggle) && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
  const all = [...document.querySelectorAll('body *')].filter(shown);
  let gold = 0; const goldWhere = {}; const radii = {};
  for (const el of all) {
    const cs = getComputedStyle(el);
    for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'borderLeftColor', 'borderBottomColor', 'outlineColor']) {
      const width = prop.startsWith('border') ? parseFloat(cs[prop.replace('Color', 'Width')]) : (prop === 'outlineColor' ? (cs.outlineStyle === 'none' ? 0 : 1) : 1);
      if (width > 0 && goldish(parse(cs[prop]))) { gold++; const k = `${el.tagName.toLowerCase()}.${String(el.getAttribute('class') || '').split(' ')[0]}`; goldWhere[k] = (goldWhere[k] || 0) + 1; }
    }
    // Радіус рахуємо лише в елементів, що щось малюють (тло, картинка, рамка): прозорий блок із радіусом 16 px, як панель меню шапки, нічого не показує.
    const r = el.getBoundingClientRect(), bgc = parse(cs.backgroundColor);
    const paints = (bgc && bgc.a > 0.02) || cs.backgroundImage !== 'none' || /^(img|svg|picture|video)$/.test(el.tagName.toLowerCase()) || ['Top', 'Right', 'Bottom', 'Left'].some(side => { const c = parse(cs[`border${side}Color`]); return parseFloat(cs[`border${side}Width`]) > 0 && c && c.a > 0.02 && cs[`border${side}Style`] !== 'none'; });
    if (paints && r.width >= 40 && r.height >= 20 && cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
  }
  const family = cs => cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
  const heads = [...document.querySelectorAll('h1,h2,h3,h4')].filter(el => shown(el) && !el.matches('.pc-bar-group>h3'));
  const wrongHeads = heads.filter(el => { const cs = getComputedStyle(el); return family(cs) !== 'Source Serif 4' || cs.fontWeight !== '400' || !(parseFloat(cs.letterSpacing) < 0); }).map(el => `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 24)}» ${family(getComputedStyle(el))} ${getComputedStyle(el).fontWeight}`);
  const bad = [];
  for (const el of all) {
    if (!([...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0))) continue;
    if (el.closest('button:disabled,[aria-disabled="true"],fieldset:disabled')) continue;     // вимкнені елементи від вимог до контрасту звільнені
    const cs = getComputedStyle(el), fg0 = parse(cs.color); if (!fg0) continue;
    let opacity = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) opacity *= parseFloat(getComputedStyle(n).opacity);
    const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700), need = large ? 3 : 4.5;
    let worst = Infinity; for (const bg of backgrounds(el)) worst = Math.min(worst, ratio(over({...fg0, a: fg0.a * opacity}, bg), bg));
    if (worst < need) bad.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute('class') || '').split(' ')[0]} «${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)}» ${worst.toFixed(2)}<${need}`);
  }
  const paint = el => { if (!el || !shown(el)) return null; const cs = getComputedStyle(el), c = parse(cs.color), b = parse(cs.backgroundColor); return {color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor, radius: cs.borderTopLeftRadius, hue: c ? Math.round(hsl(c).h) : null, bgLight: b ? hsl(b).l : null, bgHue: b ? Math.round(hsl(b).h) : null, contrast: c && b && b.a > 0.99 ? ratio(c, b) : null}; };
  const section = document.getElementById(id);
  const page = document.querySelector('main.page'), body = getComputedStyle(document.body);
  return {
    routeView: document.body.dataset.routeView || '', overflow: document.documentElement.scrollWidth - innerWidth, gold, goldWhere: Object.entries(goldWhere).sort((a, b) => b[1] - a[1]).slice(0, 4), radii, headings: heads.length, wrongHeads: wrongHeads.slice(0, 4), bad: bad.slice(0, 5), badCount: bad.length, checked: all.length,
    bodyBg: body.backgroundColor, pageBg: page ? getComputedStyle(page).backgroundColor : '', rd16: body.getPropertyValue('--rd-16').trim(), h1: paint(section && section.querySelector('h1')) && getComputedStyle(section.querySelector('h1')).fontWeight,
    header: {search: paint(document.querySelector('.eua-header-search')), aa: paint(document.querySelector('.eua-appearance-toggle')), menu: paint(document.querySelector('.home-menu-toggle')), menuOpen: toggle ? toggle.getAttribute('aria-expanded') : null},
    primary: paint(document.querySelector('#creatine a.eua-primary')), evidence: paint(section && [...section.querySelectorAll('.eua-evidence-button')].find(shown)),
    control: paint(id === 'creatine' ? [...document.querySelectorAll('#creatine .eua-controls button')].find(b => /Далі/.test(b.textContent) && shown(b)) : null),
    sectionBg: section ? getComputedStyle(section).backgroundColor : ''
  };
};
async function articleCosmicFlow(browser, origin, viewport) {
  const where = `article palette @${viewport.name}`;
  const ids = viewport.fullArticles === false ? ['creatine', 'supplement-protein'] : ARTICLE_IDS;
  const phone = viewport.width <= 1024;
  const lavender = hue => hue >= 255 && hue <= 290, cyan = hue => hue >= 165 && hue <= 215;
  let withGold = 0;
  for (const id of ids) {
    const {context, page, seen} = await open(browser, origin, viewport, `/index.html#${id}`);
    await page.waitForFunction(() => document.body.dataset.routeView === 'article');
    await page.waitForTimeout(400);
    const m = await page.evaluate(articleProbe, id);
    const at = `${where} ${id}`;
    check(at, m.routeView === 'article' && m.checked > 200, `the article view is open and has content (${m.routeView}, ${m.checked} visible elements)`);
    check(at, m.gold === 0, `no gold left in colours, backgrounds, borders or outlines (${m.gold}: ${m.goldWhere.map(([k, n]) => `${k}×${n}`).join(', ')})`);
    const oldShapes = Object.keys(m.radii).filter(r => !['3px', '5px'].includes(r));
    check(at, oldShapes.length === 0 && (m.radii['3px'] || 0) > 20, `cards and buttons are 3 px, panels 5 px, no old 16/30/999 px shapes (${JSON.stringify(m.radii)})`);
    check(at, m.headings > 0 && m.wrongHeads.length === 0, `all ${m.headings} headings are thin Source Serif 4 with tight letters (wrong: ${m.wrongHeads.join('; ')})`);
    check(at, m.badCount === 0, `every text has enough contrast, except disabled controls (${m.badCount}: ${m.bad.join('; ')})`);
    check(at, m.bodyBg === 'rgb(12, 11, 15)' && m.pageBg === 'rgb(19, 13, 33)', `the page is violet-black and the band behind the header too, not the old turquoise (body ${m.bodyBg}, band ${m.pageBg})`);
    check(at, m.rd16 === '3px', `the article palette is active (--rd-16 ${m.rd16 || 'empty'})`);
    check(at, m.overflow <= 1, `no horizontal overflow (${m.overflow})`);
    // Три кнопки шапки однакові: «Пошук», «Аа» і (до 1024 px) меню; меню на момент заміру відкрите, тож його колір рамки такий, як у «Аа» при наведенні.
    const {search, aa, menu} = m.header;
    check(at, search && aa && search.radius === '3px' && aa.radius === '3px', `the header search and «Аа» are 3 px (${search?.radius}, ${aa?.radius})`);
    check(at, aa && lavender(aa.hue), `«Аа» is lavender (hue ${aa?.hue})`);
    if (phone) {
      check(at, menu && menu.radius === '3px' && menu.color === aa.color && lavender(menu.hue), `the menu button is drawn like «Аа»: 3 px, the same lavender (${menu?.radius}, ${menu?.color} vs ${aa?.color})`);
      check(at, menu && menu.border === 'rgb(222, 185, 253)', `the open menu button has a lavender border (${menu?.border})`);
    }
    if (id === 'creatine') {
      // Копії старих правил не мають перемагати сильніших: ці три місця були зламані, коли копії були сильнішими за оригінали.
      check(at, m.primary && m.primary.contrast !== null && m.primary.contrast >= 4.5 && lavender(m.primary.bgHue), `«← На головну»: dark text on a lavender button, readable (contrast ${m.primary?.contrast?.toFixed(2)}, text ${m.primary?.color}, button ${m.primary?.bg})`);
      check(at, m.evidence && cyan(m.evidence.hue) && m.evidence.bgLight < 0.2, `the evidence buttons in creatine stay cyan on a dark background, as before (text hue ${m.evidence?.hue}, background lightness ${m.evidence?.bgLight?.toFixed(2)})`);
      check(at, m.control && cyan(m.control.hue) && m.control.bgLight < 0.2, `the animation controls in creatine keep their cyan text on a dark background (text hue ${m.control?.hue}, background lightness ${m.control?.bgLight?.toFixed(2)})`);
    } else if (m.evidence) {
      check(at, lavender(m.evidence.hue), `the evidence buttons in ${id} became lavender, as the old gold ones (text hue ${m.evidence.hue})`);
    }
    withGold += m.gold;
    check(at, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `no errors, failed or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external, ...seen.badResponses].join(' | ')}`);
    if (id === 'creatine') await artifact(page, viewport, 'article-cosmic-creatine', page.locator('body'), {scroll: false});
    await context.close();
  }
  check(where, withGold === 0, `no gold in any of the ${ids.length} articles`);

  // «Зелений» варіант лишається як був: старе золото, радіуси 16 і 30 px, бірюзова смуга шапки, жодних космічних токенів (контроль: той самий замір бачить золото, коли воно є).
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  for (const id of ['creatine', 'supplement-protein']) {
    const {context, page} = await open(browser, origin, viewport, `/index.html#${id}`, {initScript: green});
    await page.waitForFunction(() => document.body.dataset.routeView === 'article');
    await page.waitForTimeout(400);
    const g = await page.evaluate(articleProbe, id);
    check(`${where} green ${id}`, g.gold > 20 && g.radii['16px'] > 10 && (id === 'creatine' || g.radii['30px'] > 5), `the green variant keeps its gold and its 16/30 px shapes (gold ${g.gold}, ${JSON.stringify(g.radii)})`);
    check(`${where} green ${id}`, g.rd16 === '' && g.pageBg === 'rgb(4, 23, 34)' && g.bodyBg !== 'rgb(12, 11, 15)', `the green variant has no cosmic tokens and keeps the old band (--rd-16 «${g.rd16}», band ${g.pageBg}, body ${g.bodyBg})`);
    check(`${where} green ${id}`, g.wrongHeads.length > 0, 'the green variant keeps its old headings (the measure sees them as not thin serif)');
    await context.close();
  }

  // Сама головна не змінилась: токенів розбору немає, кнопка меню на телефоні лишається такою, якою її робить home-spectrum.css (радіус 2 px).
  const home = await open(browser, origin, viewport, '/index.html#top');
  await home.page.waitForTimeout(500);
  const h = await home.page.evaluate(() => { const t = document.querySelector('.home-menu-toggle'), r = t && t.getBoundingClientRect(); return {route: document.body.dataset.routeView || '', rd16: getComputedStyle(document.body).getPropertyValue('--rd-16').trim(), menuRadius: t && r.width > 0 ? getComputedStyle(t).borderTopLeftRadius : null}; });
  check(where, h.route !== 'article' && h.rd16 === '', `the home does not get the article palette (route «${h.route}», --rd-16 «${h.rd16}»)`);
  if (phone) check(where, h.menuRadius === '2px', `the home keeps its own menu button, 2 px (${h.menuRadius})`);
  // Перемикання без перезавантаження: головна → розбір → назад. Палітра розбору вмикається й вимикається разом з режимом.
  await home.page.evaluate(() => { location.hash = '#creatine'; });
  await home.page.waitForFunction(() => document.body.dataset.routeView === 'article');
  const inArticle = await home.page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--rd-16').trim());
  await home.page.evaluate(() => history.back());
  await home.page.waitForFunction(() => document.body.dataset.routeView !== 'article');
  const backHome = await home.page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--rd-16').trim());
  check(where, inArticle === '3px' && backHome === '', `the palette follows the mode without a reload (article «${inArticle}», back home «${backHome}»)`);
  await home.context.close();
}

// Заголовки карток як на головній (рішення власника 2026-11-01): у космосі h2–h4 усередині main і назви карток («Куди далі», картки дієт, записи журналу)
// мають шрифт головної (Source Serif 4, звичайна вага, трохи стиснуті літери); у «Зеленому» лишаються колишніми; головна не змінюється.
// Назви сторінок (h1) отримали той самий стиль другим рішенням власника того ж дня (тонкі, із засічками, літери -0,03 em).
// Міряємо обчислений стиль кожного заголовка (також у згорнутих блоках: обчислений стиль є й у прихованих елементів), а не наявність правила в файлі.
async function headingsFlow(browser, origin, viewport) {
  const where = `card headings @${viewport.name}`;
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  const inner = files.filter(f => f !== 'index.html');
  const probe = () => {
    const sel = 'main :is(h2,h3,h4), [role="main"] :is(h2,h3,h4), .eua-next strong, .nd-card-title, .ch-title';
    const first = cs => cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const rows = [...new Set(document.querySelectorAll(sel))].map(el => {
      const cs = getComputedStyle(el), box = el.getBoundingClientRect();
      return {tag: el.tagName.toLowerCase(), cls: String(el.getAttribute('class') || '').split(' ')[0], text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36), family: first(cs), weight: cs.fontWeight, spacing: parseFloat(cs.letterSpacing), adjust: cs.fontSizeAdjust, clipped: box.width > 0 && el.scrollWidth > el.clientWidth + 1};
    });
    const titles = [...document.querySelectorAll('h1')].map(el => ({family: first(getComputedStyle(el)), weight: getComputedStyle(el).fontWeight, spacing: parseFloat(getComputedStyle(el).letterSpacing)}));
    // Мазок-підкреслення під назвою: псевдоелемент h1::after (усі сторінки зі смугою) або піктограма svg.sp-brush («Добавки»).
    const brush = document.querySelector('.sp-brush'), h1 = document.querySelector('h1');
    const stroke = {after: h1 ? getComputedStyle(h1, '::after').content : 'none', brush: !!brush && brush.getBoundingClientRect().width > 0 && getComputedStyle(brush).display !== 'none'};
    return {rows, titles, stroke, adjustSupported: CSS.supports('font-size-adjust', '0.55')};
  };
  let total = 0;
  for (const file of inner) {
    const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
    await page.waitForTimeout(500);
    const {rows, titles, stroke, adjustSupported} = await page.evaluate(probe);
    total += rows.length;
    // 2026-11-01, третє рішення власника: мазок-підкреслення під назвою прибрано (у «Зеленому» лишається).
    check(where, stroke.after === 'none' && !stroke.brush, `cosmic ${file}: no brush stroke under the page title (${JSON.stringify(stroke)})`);
    const wrong = rows.filter(r => r.family !== 'Source Serif 4' || r.weight !== '400' || !(r.spacing < 0));
    check(where, wrong.length === 0, `cosmic ${file}: all ${rows.length} card headings are Source Serif 4, weight 400, tight letters (wrong: ${wrong.slice(0, 3).map(r => `${r.tag}.${r.cls} «${r.text}» ${r.family} ${r.weight} ${r.spacing}`).join('; ')})`);
    check(where, rows.every(r => !r.clipped), `cosmic ${file}: no card heading is clipped (${rows.filter(r => r.clipped).map(r => r.text).slice(0, 3).join('; ')})`);
    // 2026-11-01, друге рішення власника: назви сторінок теж тонкі, як на головній (до того h1 лишався жирним).
    check(where, titles.length === 1 && titles.every(t => t.family === 'Source Serif 4' && t.weight === '400' && t.spacing < 0), `cosmic ${file}: the page title (h1) is thin Source Serif 4 with tight letters, like the home (${titles.map(t => `${t.family} ${t.weight} ${t.spacing}`).join(', ')})`);
    if (file === 'muscle-lab.html' && adjustSupported) check(where, rows.filter(r => r.cls === 'mg-ch-title').length > 0 && rows.filter(r => r.cls === 'mg-ch-title').every(r => r.adjust === '0.55'), 'cosmic muscle-lab.html: the small chapter titles get the optical size correction');
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `cosmic ${file}: no errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
    if (['directions.html', 'glossary.html', 'movement.html'].includes(file)) {
      // Шрифт справді завантажено (кирилична частина), а не лише названо: без цього заголовки показувались би запасним Georgia.
      const faces = await page.evaluate(async () => (await document.fonts.load('400 24px "Source Serif 4"', 'Заголовок картки')).map(f => `${f.family}:${f.status}`));
      check(where, faces.length > 0 && faces.every(f => f.endsWith(':loaded')), `cosmic ${file}: the Source Serif 4 face for Ukrainian letters is loaded (${faces.join(', ')})`);
    }
    await context.close();
  }
  check(where, total >= 150, `cosmic: the card headings were really found (${total} over ${inner.length} pages)`);
  // «Зелений» лишає все як було: серед заголовків немає жодного, схожого на нові (колишні були жирні), а три сторінки лишають свої шрифти.
  const sentinels = {'directions.html': ['Inter', '700'], 'movement.html': ['Arial', '700'], 'glossary.html': ['Source Serif 4', '700']};
  for (const [file, [family, weight]] of Object.entries(sentinels)) {
    const {context, page, seen} = await open(browser, origin, viewport, '/' + file, {initScript: green});
    await page.waitForTimeout(500);
    const {rows, titles, stroke} = await page.evaluate(probe);
    check(where, rows.length > 0 && rows.every(r => r.weight !== '400'), `green ${file}: no heading became regular weight`);
    check(where, stroke.after !== 'none', `green ${file}: the brush stroke under the page title stays (${JSON.stringify(stroke)})`);
    check(where, titles.length === 1 && titles.every(t => Number(t.weight) >= 600), `green ${file}: the page title (h1) stays bold as before (${titles.map(t => t.weight).join(', ')})`);
    const h3s = rows.filter(r => r.tag === 'h3');
    check(where, h3s.length > 0 && h3s.every(r => r.family === family && r.weight === weight), `green ${file}: the h3 headings stay ${family} ${weight} as before (${[...new Set(h3s.map(r => `${r.family} ${r.weight}`))].join(', ')})`);
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `green ${file}: no errors`);
    await context.close();
  }
  {
    const {context, page} = await open(browser, origin, viewport, '/supplements.html', {initScript: green});
    const {stroke} = await page.evaluate(probe);
    check(where, stroke.brush, `green supplements.html: the brush stroke icon stays (${JSON.stringify(stroke)})`);
    await context.close();
  }
  // Головна не змінюється: вона не вантажить файл палітри, її заголовки лишаються Spectrum Serif.
  const home = await open(browser, origin, viewport, '/index.html');
  const homeFacts = await home.page.evaluate(() => ({palette: !!document.querySelector('link[href*="palette-cosmic"]'), card: getComputedStyle(document.querySelector('.path-card h3')).fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: getComputedStyle(document.querySelector('.path-card h3')).fontWeight}));
  check(where, !homeFacts.palette && homeFacts.card === 'Spectrum Serif' && homeFacts.weight === '400', `home: card headings stay Spectrum Serif 400 and the palette file is not loaded (${JSON.stringify(homeFacts)})`);
  await home.context.close();
}

// Шапка й меню як на головній (рішення власника 2026-11-01, «в»). У космосі шапка внутрішніх сторінок легка, як на головній: 78 px (76 на телефоні), прозора, назва шрифтом із засічками,
// текстові посилання без піктограм, кнопки пошуку, «Аа» й меню з рамкою-лінією; квадратної емблеми й підпису немає. Розмітка, посилання й поведінка ті самі. У «Зеленому» лишається колишня шапка.
// Міряємо обчислений стиль і справжні розміри, а не наявність правил у файлі.
async function headerFlow(browser, origin, viewport) {
  const where = `header @${viewport.name}`;
  const mobile = viewport.name === 'mobile';
  const green = () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}));
  const inner = files.filter(f => f !== 'index.html');
  const probe = () => {
    const h = document.querySelector('.eua-site-header');
    const shown = el => { if (!el) return false; const b = el.getBoundingClientRect(), c = getComputedStyle(el); return b.width > 0 && b.height > 0 && c.display !== 'none' && c.visibility !== 'hidden'; };
    const font = el => { const c = getComputedStyle(el); return {family: c.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: c.fontWeight, size: parseFloat(c.fontSize)}; };
    const box = el => { const b = el.getBoundingClientRect(); return {x: b.x, y: b.y, w: b.width, h: b.height, right: b.right}; };
    const after = getComputedStyle(h, '::after');
    const links = [...h.querySelectorAll('nav a')].filter(shown);
    const current = [...h.querySelectorAll('nav a[aria-current="page"]')];
    const aa = document.querySelector('.eua-appearance-toggle'), search = h.querySelector('.eua-header-search'), toggle = h.querySelector('.eua-header-toggle');
    const style = el => getComputedStyle(el);
    return {
      height: h.getBoundingClientRect().height, background: style(h).backgroundColor, borderBottom: parseFloat(style(h).borderBottomWidth),
      line: after.content !== 'none' ? {height: parseFloat(after.height), position: after.position} : null,
      emblem: shown(h.querySelector('.eua-header-emblem')), tagline: shown(h.querySelector('.eua-header-wordmark small')),
      word: font(h.querySelector('.eua-header-wordmark strong')), wordB: font(h.querySelector('.eua-header-wordmark b')),
      links: links.map(a => ({text: a.textContent.trim(), ...font(a), icon: !!a.querySelector('svg') && shown(a.querySelector('svg')), h: a.getBoundingClientRect().height, y: Math.round(a.getBoundingClientRect().top)})),
      about: shown(h.querySelector('.eua-header-about')) ? {...font(h.querySelector('.eua-header-about')), border: parseFloat(style(h.querySelector('.eua-header-about')).borderTopWidth), arrow: shown(h.querySelector('.eua-header-about>span'))} : null,
      current: current.map(a => ({text: a.textContent.trim(), color: style(a).color, underline: style(a).textDecorationLine})),
      search: shown(search) ? {...box(search), label: shown(search.querySelector('span')), radius: parseFloat(style(search).borderTopLeftRadius), color: style(search).color} : null,
      aa: shown(aa) ? {...box(aa), radius: parseFloat(style(aa).borderTopLeftRadius), color: style(aa).color, border: parseFloat(style(aa).borderTopWidth), font: `${style(aa).fontWeight} ${style(aa).fontSize}`} : null,
      toggle: shown(toggle) ? {...box(toggle), radius: parseFloat(style(toggle).borderTopLeftRadius)} : null,
      accent: style(document.documentElement).getPropertyValue('--pine-accent').trim(),
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  };
  const rows = new Set();
  for (const file of inner) {
    const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
    await page.evaluate(() => document.fonts.ready);
    const f = await page.evaluate(probe);
    const tag = `cosmic ${file}`;
    check(where, Math.abs(f.height - (mobile ? 76 : 78)) <= 1, `${tag}: the header is as light as the home's (${f.height}px, ${mobile ? 76 : 78} expected)`);
    check(where, f.background === 'rgba(0, 0, 0, 0)' && f.borderBottom === 0 && f.line && f.line.height === 1, `${tag}: transparent header with a thin inset line below instead of a full-width border (${f.background}, border ${f.borderBottom}, line ${JSON.stringify(f.line)})`);
    check(where, !f.emblem && !f.tagline, `${tag}: no square emblem and no tagline, as on the home`);
    check(where, f.word.family === 'Source Serif 4' && f.word.weight === '400' && f.word.size === (mobile ? 27 : 30) && f.wordB.family === 'Source Serif 4', `${tag}: the name is regular Source Serif 4 (${JSON.stringify(f.word)})`);
    if (!mobile) {
      check(where, f.links.map(l => l.text).join('|') === 'Напрями|Харчування|Дослідження|Атлас|Вправи|Добавки', `${tag}: all six menu links stay visible (${f.links.map(l => l.text).join(', ')})`);
      check(where, f.links.every(l => l.family === 'Source Serif 4' && l.weight === '400' && l.size === 17 && !l.icon && l.h >= 44), `${tag}: menu links are 17px serif text without icons and still at least 44px tall`);
      check(where, new Set(f.links.map(l => l.y)).size === 1, `${tag}: the menu stays in one row`);
    }
    if (!mobile) check(where, f.about && f.about.family === 'Source Serif 4' && f.about.border === 0 && !f.about.arrow, `${tag}: "Про проєкт" is plain serif text, as on the home`);
    check(where, f.search && f.search.w === 44 && f.search.h === 44 && !f.search.label && f.search.radius === 2, `${tag}: search is a 44px icon button with a 2px corner and no label (${JSON.stringify(f.search)})`);
    check(where, f.aa && f.aa.radius === 2 && f.aa.border === 1 && f.aa.w === 44 && f.aa.h === 44 && f.aa.font === '700 17px', `${tag}: the "Аа" button matches the home (2px corner, thin line, the same 700 17px letters on every page; got ${f.aa && f.aa.font})`);
    check(where, f.current.every(c => c.underline.includes('underline')), `${tag}: the current page link is underlined and lavender (${JSON.stringify(f.current)})`);
    const rights = [f.search, f.aa, f.toggle].filter(Boolean);
    check(where, rights.every(r => r.right <= viewport.width - 16) && f.overflow === 0, `${tag}: the controls fit the screen, no sideways scroll (${f.overflow}px over)`);
    if (mobile) check(where, f.toggle && f.toggle.w === 44 && f.toggle.radius === 2 && new Set([f.search, f.aa, f.toggle].map(r => Math.round(r.y))).size === 1, `${tag}: search, "Аа" and the menu button sit in one row (${JSON.stringify(f.toggle)})`);
    rows.add(JSON.stringify([f.height, f.word.size, f.links.length]));
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `${tag}: no errors: ${[...seen.pageErrors, ...seen.console].join(' | ')}`);
    await context.close();
  }
  check(where, rows.size === 1, `cosmic: every inner page has the same header (${[...rows].join(' / ')})`);
  // Меню на телефоні: відкрита панель має ті самі пункти текстом із засічками й закривається, як і раніше.
  if (mobile) {
    const {context, page} = await open(browser, origin, viewport, '/directions.html');
    await page.locator('.eua-header-toggle').click();
    const panel = await page.evaluate(() => { const links = document.querySelector('.eua-header-links'), c = getComputedStyle(links), b = links.getBoundingClientRect(); const items = [...links.querySelectorAll('nav a, .eua-header-about')].map(a => ({text: a.textContent.trim().replace(/\s+/g, ' '), family: getComputedStyle(a).fontFamily.split(',')[0].replace(/["']/g, '').trim(), h: a.getBoundingClientRect().height, icon: !!a.querySelector('svg') && getComputedStyle(a.querySelector('svg')).display !== 'none'})); return {radius: parseFloat(c.borderTopLeftRadius), border: parseFloat(c.borderTopWidth), items, right: b.right}; });
    check(where, panel.items.length === 7 && panel.items.every(i => i.family === 'Source Serif 4' && !i.icon && i.h >= 44), `the open menu has seven text items in serif, each at least 44px tall (${panel.items.map(i => i.text).join(', ')})`);
    check(where, panel.radius === 2 && panel.border === 1 && panel.right <= viewport.width, 'the open menu panel is a thin-line box with a 2px corner inside the screen');
    await context.close();
  }
  // Пошук і «Аа» працюють, як і раніше: кнопка пошуку відкриває вікно пошуку, «Аа» відкриває меню вигляду.
  {
    const {context, page} = await open(browser, origin, viewport, '/glossary.html');
    await page.locator('.eua-header-search').click();
    await page.locator('dialog.eua-search').waitFor({state: 'visible'});
    check(where, await page.evaluate(() => !!document.querySelector('dialog.eua-search[open]')), 'the search button still opens the search window');
    await page.locator('dialog.eua-search .eua-search-close').click();
    await page.locator('.eua-appearance-toggle').click();
    const panel = await page.evaluate(() => { const p = document.querySelector('.eua-appearance-panel'), b = p.getBoundingClientRect(), c = getComputedStyle(p); return {shown: b.width > 0 && !p.hidden, radius: parseFloat(c.borderTopLeftRadius), inside: b.left >= 0 && b.right <= innerWidth}; });
    check(where, panel.shown && panel.inside && panel.radius === 3, `the "Аа" button still opens the appearance menu, styled as on the home (${JSON.stringify(panel)})`);
    await context.close();
  }
  // «Зелений» і головна лишаються як були.
  for (const file of ['directions.html', 'sleep.html']) {
    const {context, page, seen} = await open(browser, origin, viewport, '/' + file, {initScript: green});
    const f = await page.evaluate(probe);
    check(where, f.height > 79 && f.emblem && f.tagline && f.word.family === 'Inter' && f.word.weight === '800' && f.search && f.search.radius > 2 && (mobile || f.links.every(l => l.icon)), `green ${file}: the old header stays (height ${f.height}, emblem ${f.emblem}, name ${f.word.family} ${f.word.weight}, icons ${f.links.map(l => l.icon).join('/')})`);
    check(where, f.borderBottom === 1 && f.line === null, `green ${file}: the old full-width border stays`);
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0, `green ${file}: no errors`);
    await context.close();
  }
  const home = await open(browser, origin, viewport, '/index.html');
  const hf = await home.page.evaluate(probe);
  check(where, !hf.emblem && hf.word.family === 'Spectrum Serif' && Math.abs(hf.height - (mobile ? 80 : 78)) <= 4, `home: its own header is not touched (${JSON.stringify({emblem: hf.emblem, word: hf.word, height: hf.height})})`);
  await home.context.close();
}

// Картинки для поширення (рішення власника 2026-10-31): у космічних кольорах сайту, а не в сосново-зелених.
// Міряємо кути справжніх JPEG (там лише тло й ледь помітний візерунок), а не назви файлів: Node тут JPEG не розбирає.
async function shareCardsFlow(browser, origin, viewport) {
  const where = `share cards @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  const names = files.map(file => file.replace('.html', ''));
  const cards = await page.evaluate(list => Promise.all(list.map(name => new Promise(resolve => {
    const image = new Image();
    image.onerror = () => resolve({name, error: true});
    image.onload = () => {
      const w = image.naturalWidth, h = image.naturalHeight, canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d', {willReadFrequently: true}); ctx.drawImage(image, 0, 0);
      const sum = [0, 0, 0]; let count = 0;
      for (const [x, y] of [[0, 0], [w - 40, 0], [0, h - 40], [w - 40, h - 40]]) {
        const data = ctx.getImageData(x, y, 40, 40).data;
        for (let i = 0; i < data.length; i += 4) { sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; count++; }
      }
      resolve({name, w, h, r: sum[0] / count, g: sum[1] / count, b: sum[2] / count});
    };
    image.src = `/og/${name}.jpg`;
  }))), names);
  const hueOf = ({r, g, b}) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (!d) return 0;
    const h = 60 * (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
    return h < 0 ? h + 360 : h;
  };
  check(where, cards.length === names.length && cards.every(card => !card.error && card.w === 1200 && card.h === 630), `every page has a decoded 1200x630 card: ${cards.filter(card => card.error).map(card => card.name).join(', ')}`);
  const wrong = cards.filter(card => !card.error && !(hueOf(card) >= 235 && hueOf(card) <= 290 && card.b > card.g + 3));
  check(where, wrong.length === 0, `the share cards must sit on the cosmic violet, not on pine green: ${wrong.map(card => `${card.name} ${Math.round(hueOf(card))}°`).join(', ')}`);
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, `measuring the cards must not raise errors or third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external].join(' | ')}`);
  await context.close();
}

async function dietStoryFlow(browser, origin, viewport) {
  const where = `diet stories @${viewport.name}`;
  const initScript = () => {
    window.__dietStoryShare = null;
    Object.defineProperty(navigator, 'canShare', {configurable: true, value: () => true});
    Object.defineProperty(navigator, 'share', {configurable: true, value: async data => {
      window.__dietStoryShare = {
        title: data.title, text: data.text,
        fileName: data.files[0]?.name, fileType: data.files[0]?.type, fileSize: data.files[0]?.size
      };
    }});
  };
  const {context, page, seen} = await open(browser, origin, viewport, '/nutrition.html', {initScript});
  await page.waitForFunction(() => document.querySelectorAll('.nd-story[data-ready="true"]').length === 8);
  const stories = page.locator('.nd-story');
  check(where, await stories.count() === 8, 'all eight diet cards have story creatives');
  for (let index = 0; index < await stories.count(); index++) {
    const story = stories.nth(index);
    await page.locator('.nd-card').nth(index).locator(':scope > summary').click();
    await story.locator(':scope > summary').click();
    const canvas = story.locator('canvas');
    await page.waitForFunction(el => el.closest('.nd-story').dataset.rendered === 'true' && el.width === 1080 && el.height === 1920 && el.getContext('2d').getImageData(1, 1, 1, 1).data[3] === 255, await canvas.elementHandle());
    const facts = await canvas.evaluate(el => ({
      label: el.getAttribute('aria-label'), width: el.width, height: el.height,
      visible: el.getBoundingClientRect().width > 0
    }));
    check(where, facts.width === 1080 && facts.height === 1920 && facts.visible && facts.label.includes('Джерело:'), `story ${index + 1} has a visible, accessible 9:16 canvas`);
    check(where, !(await story.locator('[data-story-status]').innerText()).includes('не вміщується'), `story ${index + 1} fits without clipping`);
    if (index === 0) {
      await story.locator('[data-story-share]').click();
      await page.waitForFunction(() => window.__dietStoryShare?.fileType === 'image/png');
      const payload = await page.evaluate(() => window.__dietStoryShare);
      check(where, payload.fileName === 'evidence-ua-diet-mediterranean-story.png' && payload.fileSize > 0, 'native sharing receives the generated PNG');
      check(where, payload.text.includes('#diet-mediterranean') && payload.text.includes('doi.org/'), 'the share caption carries the diet link and source');
      const download = page.waitForEvent('download');
      await story.locator('[data-story-download]').click();
      const saved = await download;
      check(where, saved.suggestedFilename() === 'evidence-ua-diet-mediterranean-story.png', 'the fallback download is a named PNG');
    }
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, `story creation has no runtime or third-party errors: ${[...seen.pageErrors, ...seen.console, ...seen.external].join(' | ')}`);
  await context.close();
}

async function dietCarouselFlow(browser, origin, viewport) {
  const where = `diet carousel @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/nutrition.html');
  await page.waitForFunction(() => document.querySelector('[data-diet-carousel]')?.dataset.carouselReady === 'true');
  const track = page.locator('[data-diet-carousel]');
  const cards = track.locator('.nd-card');
  const previous = page.locator('[data-diet-previous]');
  const next = page.locator('[data-diet-next]');
  const count = page.locator('[data-diet-count]');
  const waitForCentered = index => page.waitForFunction(expected => {
    const track = document.querySelector('[data-diet-carousel]');
    const card = track?.querySelectorAll('.nd-card')[expected];
    if (!card) return false;
    const a = track.getBoundingClientRect(), b = card.getBoundingClientRect();
    return Math.abs((b.left + b.width / 2) - (a.left + track.clientWidth / 2)) < 4;
  }, index);
  check(where, await cards.count() === 8, 'all eight diet cards are in the carousel');
  check(where, await count.innerText() === '01 / 08' && await previous.isDisabled() && !(await next.isDisabled()), 'the first card is selected and controls are bounded');
  const initial = await page.evaluate(() => {
    const track = document.querySelector('[data-diet-carousel]'), card = track.querySelector('.nd-card');
    const a = track.getBoundingClientRect(), b = card.getBoundingClientRect();
    return {centered: Math.abs((b.left + b.width / 2) - (a.left + track.clientWidth / 2)) < 3, artHeight: Math.round(card.querySelector('.nd-art').getBoundingClientRect().height), pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth};
  });
  check(where, initial.centered, 'the first illustrated card starts centered');
  check(where, initial.artHeight >= (viewport.width <= 760 ? 180 : 210), 'the artwork is prominent at this viewport');
  check(where, !initial.pageOverflow, 'the carousel does not cause page-level horizontal overflow');

  await next.click();
  await page.waitForFunction(() => document.querySelector('[data-diet-count]')?.textContent === '02 / 08');
  await waitForCentered(1);
  check(where, await count.innerText() === '02 / 08', 'the next control selects and centers the next card');
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => document.querySelector('[data-diet-count]')?.textContent === '03 / 08');
  await waitForCentered(2);
  check(where, await count.innerText() === '03 / 08', 'focused carousel supports right-arrow navigation');
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(() => document.querySelector('[data-diet-count]')?.textContent === '02 / 08');
  await waitForCentered(1);

  const card = cards.nth(1);
  const closedSize = await card.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return {height: bounds.height, width: bounds.width};
  });
  await card.locator(':scope > summary').click();
  await page.waitForFunction(() => document.querySelector('#diet-dash')?.open === true);
  await waitForCentered(1);
  const opened = await card.evaluate(element => ({
    height: element.getBoundingClientRect().height,
    width: element.getBoundingClientRect().width,
    source: element.querySelector('.nd-evidence .nd-source')?.getAttribute('href'),
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  check(where, opened.height > closedSize.height && opened.width > closedSize.width * 1.2, 'opening a card reveals its detail in the carousel');
  check(where, Boolean(opened.source) && !opened.pageOverflow, 'expanded evidence remains available without page overflow');
  await next.click();
  await page.waitForFunction(() => document.querySelector('[data-diet-count]')?.textContent === '03 / 08');
  await waitForCentered(2);
  check(where, !(await card.evaluate(element => element.open)), 'moving to another card closes the expanded card');

  for (let index = 4; index <= 8; index++) {
    await next.click();
    await page.waitForFunction(expected => document.querySelector('[data-diet-count]')?.textContent === `${String(expected).padStart(2, '0')} / 08`, index);
    await waitForCentered(index - 1);
  }
  await page.waitForFunction(() => document.querySelector('[data-diet-count]')?.textContent === '08 / 08');
  check(where, await next.isDisabled(), 'the final card disables the next control');
  check(where, await count.innerText() === '08 / 08', 'the carousel cannot advance past the final card');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, `the carousel raises no runtime or third-party errors: ${[...seen.pageErrors, ...seen.console, ...seen.external].join(' | ')}`);
  await context.close();
}

async function shapesFlow(browser, origin, viewport) {
  // Форми (рішення власника 2026-10-31): у космічному стилі картки, кнопки й чипи мають прямі кути головної (3px, великі панелі 5px),
  // підняті тіні карток зникають, а зелений варіант лишає колишні форми.
  const where = `shapes @${viewport.name}`;
  // Малюнки й смуги даних, що не є картками чи кнопками: для них великі радіуси дозволені.
  const artOnly = '.fb-cell,.fb-cell-edge,.fb-lipid,.fb-bar,.fb-bar span,.mg-fiber-scale,.mg-fib,.sleep-art,.step-dot';
  // Накладки й світіння малюнків зберігають тінь.
  const overlays = '.eua-module-menu-content,.eua-nutrition-menu-content,.eua-search,.term-dialog,.eua-term-pop,.eua-appearance-panel,.fb-hero-art,.fb-lipid,.primary-link';
  const measure = (page) => page.evaluate(([art, over]) => {
    const rounded = [], raised = []; let big = 0;
    const label = el => el.tagName.toLowerCase() + '.' + (el.getAttribute('class') || '').split(/\s+/)[0];
    for (const el of document.querySelectorAll('body *')) {
      if (el instanceof SVGElement) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 16 || r.height < 16) continue;
      const rad = Math.max(...[cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(parseFloat));
      const circle = rad >= Math.min(r.width, r.height) / 2 - 0.5 && Math.abs(r.width - r.height) <= 3;
      if (rad > 5 && !circle) { big++; if (!el.matches(art)) rounded.push(label(el) + ' ' + rad); }
      if (cs.boxShadow !== 'none' && !el.matches(over) && !el.closest(over)) {
        const parts = []; let depth = 0, cur = '';
        for (const ch of cs.boxShadow) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch; }
        parts.push(cur.trim());
        for (const part of parts) {
          const nums = (part.replace(/rgba?\([^)]*\)/g, '').match(/-?\d+(?:\.\d+)?px/g) || []).map(parseFloat);
          if (!/inset/.test(part) && nums.length >= 3 && Math.abs(nums[1]) >= 4 && nums[2] >= 12) { raised.push(label(el) + ' ' + part.slice(-30)); break; }
        }
      }
    }
    return {rounded: [...new Set(rounded)], raised: [...new Set(raised)], big};
  }, [artOnly, overlays]);
  for (const file of ['research.html', 'atlas.html', 'muscle-lab.html', 'cell-lab.html', 'nutrition.html', 'nutrition-inside.html', 'supplements.html', 'fat-burning.html', 'exercises.html', 'directions.html']) {
    const {context, page, seen} = await open(browser, origin, viewport, '/' + file);
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
    await page.waitForTimeout(300);
    const cosmic = await measure(page);
    check(`${where} ${file}`, cosmic.rounded.length === 0, `cards, buttons and chips must have the straight corners of the home page: ${cosmic.rounded.slice(0, 6).join(', ')}`);
    check(`${where} ${file}`, cosmic.raised.length === 0, `cards must be flat like on the home page: ${cosmic.raised.slice(0, 4).join(', ')}`);
    await page.evaluate(() => { document.documentElement.dataset.palette = 'green'; });
    const green = await measure(page);
    check(`${where} ${file}`, green.big >= 5 && green.big > cosmic.big, `the green style must keep the former rounded shapes (${green.big} rounded elements, ${cosmic.big} in the cosmic style)`);
    check(`${where} ${file}`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow');
    check(`${where} ${file}`, seen.pageErrors.length === 0 && seen.console.length === 0, 'shapes must not raise errors');
    await context.close();
  }
  // Головна: форми не змінюються, токенів форм там немає (файл стилю не підключається).
  const home = await open(browser, origin, viewport, '/index.html');
  check(where, (await home.page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rd-14') + getComputedStyle(document.documentElement).getPropertyValue('--sd-card'))) === '', 'the home page defines no shape tokens');
  await home.context.close();
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
  // Підказки малюються, щойно підвантажились дані пошуку (кілька мілісекунд після відкриття вікна), тож спершу дочекаємось їх, а не рахуємо одразу: на повільній машині рахунок одразу був би гонкою.
  await page.locator('.eua-search-chips button').first().waitFor({state: 'attached', timeout: 5000}).catch(() => {});
  check(where, (await page.locator('.eua-search-chips button').count()) >= 3, 'suggestions show before typing');
  await page.fill('#eua-search-q', 'інтервал');
  await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  check(where, (await page.locator('.eua-search-results a[href^="./glossary.html#term-"]').count()) >= 1, 'a term result links to the dictionary');
  // Пошук за ключовими словами (рішення власника 2026-11-01): питання зі службовими словами знаходить матеріал за ключовим словом, поле питає так само, як поле на головній.
  // T7 (2026-11-02, рішення D3): підказка «Знайти розбір або перевірити твердження» одна для поля на головній і вікна пошуку.
  check(where, (await page.locator('#eua-search-q').getAttribute('placeholder')) === 'Знайти розбір або перевірити твердження', 'the search field shows the same hint as the home page field');
  await page.fill('#eua-search-q', 'як пити креатин');
  await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  check(where, /Креатин/.test(await page.locator('.eua-search-results a').first().innerText()) && (await page.locator('.eua-search-status').innerText()).includes('Знайдено'), 'a question with filler words finds the creatine page by its keyword');
  await page.fill('#eua-search-q', 'як спати краще');
  await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  check(where, (await page.locator('.eua-search-results a').allInnerTexts()).some(text => /сну|Сон/.test(text)), 'a question about sleeping finds a sleep page');
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
  // T7 (2026-11-02, рішення D3): новий текст порожнього результату.
  check(where, (await page.locator('.eua-search-status').innerText()).includes('Нічого не знайшли') && (await page.locator('.eua-search-status').innerText()).includes('відкрийте всі напрями'), 'an empty result says so and tells what to try');
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

// Пошук по розділах сторінок (рішення власника 2026-11-02): вікно показує розділи, перехід відкриває потрібне місце на екрані.
// Усі посилання з dist/platform-sections.js перевіряє tests/search-sections.test.mjs на рівні сторінок і окремий прогін у Chromium при створенні індексу;
// тут справжні сценарії (вікно пошуку, клік, положення, згорнутий блок, підсвічування) і вибірка: перше посилання кожної сторінки.
async function sectionsFlow(browser, origin, viewport) {
  const where = `sections @${viewport.name}`;
  const {sections} = await import(pathToFileURL(path.join(dist, 'platform-sections.js')).href);
  check(where, sections.length >= 120, 'the section index is not empty');
  // Де стоїть ціль переходу, знайдена тим самим способом, що й на сторінці (findTarget із anchor-reveal.js).
  const measure = page => page.evaluate(async () => {
    const {findTarget} = await import('./anchor-reveal.js?v=1');
    const {el, byTitle} = findTarget(document, {hash: location.hash, search: location.search});
    if (!el) return {status: 'MISSING'};
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const outer = el.parentElement ? el.parentElement.closest('details') : null;
    const hiddenInDetails = !!(outer && !outer.open && !(el.tagName === 'SUMMARY' && el.parentElement === outer));
    const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !hiddenInDetails;
    const atEnd = scrollY >= document.documentElement.scrollHeight - innerHeight - 2;
    const from = byTitle ? 8 : -2, to = byTitle ? Math.min(160, innerHeight * 0.3) : innerHeight * 0.62;
    const inBand = (r.top >= from && r.top <= to) || (atEnd && r.top >= 0 && r.top < innerHeight * 0.8);
    return {status: !visible ? (hiddenInDetails ? 'HIDDEN_IN_DETAILS' : 'NOT_VISIBLE') : inBand ? 'OK' : 'NOT_IN_VIEW', top: Math.round(r.top), vh: innerHeight, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), overflow: document.documentElement.scrollWidth - innerWidth};
  });
  const settle = page => page.waitForTimeout(3000); // anchor-reveal.js пробує до ~2,6 с, поки сторінка дозавантажується
  const openSearch = async (page, query) => {
    await page.locator('.eua-header-search').click();
    await page.locator('dialog.eua-search').waitFor({state: 'visible'});
    await page.fill('#eua-search-q', query);
    await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  };

  // 1) «дозування» → «Як приймати» у креатині (питання власника): група в вікні, перехід на інший сторінці, розділ видно вгорі.
  let {context, page, seen} = await open(browser, origin, viewport, '/sleep.html');
  await openSearch(page, 'дозування');
  const group = page.locator('.eua-search-results h2', {hasText: 'Розділи на сторінках'});
  check(where, await group.count() === 1, 'the dialog has a group «Розділи на сторінках»');
  const dosing = page.locator('.eua-search-results a[href="./index.html#creatine-dosing"]');
  check(where, await dosing.count() === 1, '«дозування» finds the creatine dosing section');
  const dosingText = await dosing.innerText();
  check(where, /Як приймати/.test(dosingText) && /Розділ · Креатин/.test(dosingText), 'the result names the section, says it is a section and names the material');
  check(where, await page.evaluate(() => { const h = [...document.querySelectorAll('.eua-search-results h2')].find(x => /Розділи/.test(x.textContent)); const l = h?.nextElementSibling?.querySelector('a'); return !!l && /creatine-dosing/.test(l.getAttribute('href')); }), 'the dosing section is the first in its group');
  await artifact(page, viewport, 'sections-dosing', page.locator('dialog.eua-search'));
  await dosing.click();
  await page.waitForURL('**/index.html#creatine-dosing');
  await settle(page);
  let at = await measure(page);
  check(where, at.status === 'OK', `the dosing section is visible near the top after the jump (${JSON.stringify(at)})`);
  check(where, await page.evaluate(() => document.body.dataset.routeView === 'article'), 'the creatine dossier is open');
  check(where, at.overflow <= 1, 'no horizontal overflow after the jump');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the jump raises no errors');
  await context.close();

  // 2) Картка твердження без власного id («Вагітність» у кофеїні): посилання з назвою, заголовок підсвічено й стоїть угорі.
  ({context, page, seen} = await open(browser, origin, viewport, '/sleep.html'));
  await openSearch(page, 'вагітність');
  const claim = page.locator('.eua-search-results a[href*="supplement-caffeine"][href*="section="]');
  check(where, await claim.count() === 1, '«вагітність» finds the caffeine claim');
  check(where, /Твердження · Кофеїн/.test(await claim.innerText()), 'a claim card is labelled «Твердження»');
  await claim.click();
  await page.waitForURL('**/index.html?section=*');
  await page.locator('.eua-landed').waitFor({state: 'attached', timeout: 5000});
  check(where, (await page.locator('.eua-landed').first().innerText()).trim() === 'Вагітність', 'the found heading is highlighted');
  // Підсвічування саме зникає (воно живе трохи менше трьох секунд від першого входу); після цього міряємо остаточне положення.
  await page.waitForFunction(() => !document.querySelector('.eua-landed'), null, {timeout: 9000});
  await page.waitForTimeout(300);
  at = await measure(page);
  check(where, at.status === 'OK' && /Вагітність/.test(at.text), `the claim «Вагітність» stands near the top (${JSON.stringify(at)})`);
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the claim jump raises no errors');
  await context.close();

  // 3) Згорнутий блок відкривається сам: міфи про креатин.
  ({context, page, seen} = await open(browser, origin, viewport, '/sleep.html'));
  await openSearch(page, 'кава і креатин');
  const myth = page.locator('.eua-search-results a[href="./index.html#creatine-myths"]');
  check(where, await myth.count() === 1, 'the myth about coffee and creatine is a section');
  check(where, await page.evaluate(() => { const d = document.querySelector('.eua-search-results'); return d.querySelectorAll('a').length >= 1; }), 'the results are not empty');
  await myth.click();
  await page.waitForURL('**/index.html#creatine-myths');
  await settle(page);
  check(where, await page.evaluate(() => document.getElementById('creatine-myths').open === true), 'the folded block of myths opened by itself');
  at = await measure(page);
  check(where, at.status === 'OK', `the opened block is near the top (${JSON.stringify(at)})`);
  await context.close();

  // 4) Перехід на тій самій сторінці (змінюється лише #якір), без перезавантаження.
  ({context, page, seen} = await open(browser, origin, viewport, '/fat-burning.html'));
  await openSearch(page, 'стійкий раціон');
  const same = page.locator('.eua-search-results a[href="./fat-burning.html#practice"]');
  check(where, await same.count() === 1, 'the fat-burning practice section is found');
  await page.evaluate(() => { window.__sameDocument = true; });
  await same.click();
  await page.waitForFunction(() => location.hash === '#practice');
  await page.waitForTimeout(900);
  check(where, await page.evaluate(() => window.__sameDocument === true), 'a link to the same page does not reload it');
  at = await measure(page);
  check(where, at.status === 'OK', `the section on the same page is near the top (${JSON.stringify(at)})`);
  await context.close();

  // 5) Сторінка без якорів: розділ знаходиться за назвою.
  ({context, page, seen} = await open(browser, origin, viewport, '/sleep.html'));
  await openSearch(page, 'що показали результати');
  const meta = page.locator('.eua-search-results a[href^="./protein-meta.html?section="]');
  check(where, await meta.count() >= 1, 'a section of the page without anchors is found');
  await meta.first().click();
  await page.waitForURL('**/protein-meta.html?section=*');
  await settle(page);
  at = await measure(page);
  check(where, at.status === 'OK' && /результати/i.test(at.text), `the section found by name stands near the top (${JSON.stringify(at)})`);
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the page without anchors raises no errors');
  await context.close();

  // 6) Вибірка: перше посилання кожної сторінки індексу приводить у видиме місце.
  ({context, page, seen} = await open(browser, origin, viewport, '/sleep.html'));
  const firsts = [...new Map(sections.map(row => [row[0].split(/[?#]/)[0], row])).values()];
  check(where, firsts.length >= 8, `sections come from at least eight pages (${firsts.length})`);
  for (const [href, title] of firsts) {
    await page.goto(`${origin}/${href}`, {waitUntil: 'load'});
    await settle(page);
    at = await measure(page);
    check(where, at.status === 'OK', `${href} («${title}») lands in view (${JSON.stringify(at)})`);
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'sample jumps raise no errors and no third-party requests');
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
  // 2026-11-02: найновіший день може мати і один запис (пошук по розділах), тому перевіряємо, що день не порожній; раніше було «не менше трьох».
  check(where, links >= 1, 'the open day lists its records');
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
  // 2026-11-04: чекаємо, поки карусель ЗУПИНИЛАСЬ, а не лише «майже по центру». Допуск «по центру» 4 px спрацьовує ще під час плавного докочування (картка на 2 px від кінцевого
  // місця), а межу блоку доказів нижче міряємо з допуском 1 px: на мобільному блок стояв на 0,1 px за краєм екрана, і перевірка «блок доказів у межах видимої сторінки» падала
  // навмання (двічі поспіль на main після злиття PR #165, хоча в PR проходила; у мене на вільній машині в 4 запусках із 6). Тепер ще й прокрутка каруселі стоїть вісім кадрів поспіль.
  await page.waitForFunction(() => {
    const track = document.querySelector('[data-diet-carousel]'), card = document.querySelector('#diet-mediterranean');
    const a = track.getBoundingClientRect(), b = card.getBoundingClientRect();
    const state = window.__qaDietScroll ??= {left: null, still: 0};
    state.still = state.left === track.scrollLeft ? state.still + 1 : 0;
    state.left = track.scrollLeft;
    return Math.abs((b.left + b.width / 2) - (a.left + track.clientWidth / 2)) < 4 && state.still >= 8;
  });
  check(where, (await evidence.locator('.nd-findings a[href^="https://doi.org/"]').count()) >= 3, 'findings link to their sources');
  const featured = evidence.locator('.nd-findings li:first-child');
  const featureStyle = await featured.evaluate(el => ({
    fontSize: parseFloat(getComputedStyle(el).fontSize),
    kicker: getComputedStyle(el, '::before').content
  }));
  check(where, featureStyle.kicker === '"КЛЮЧОВИЙ РЕЗУЛЬТАТ"' && featureStyle.fontSize >= (viewport.width <= 760 ? 15 : 17), 'the first evidence-based result is visually emphasized');
  check(where, (await evidence.innerText()).includes('ПОКАЗИ') && (await evidence.innerText()).includes('ПРОТИПОКАЗИ'), 'indications and contraindications are both shown');
  check(where, (await evidence.locator('a[target="_blank"]:not([rel~="noopener"])').count()) === 0, 'all outgoing links are safe');
  const cols = await evidence.locator('.nd-fit').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(where, viewport.width <= 760 ? cols === 1 : cols === 2, `indications and cautions use ${viewport.width <= 760 ? 'one column on the phone' : 'two columns on the desktop'}`);
  const box = await evidence.boundingBox();
  const contentWidth = await page.evaluate(() => document.documentElement.clientWidth);
  check(where, box && box.x >= 0 && box.x + box.width <= contentWidth + 1, 'the evidence block stays inside the visible page area');
  await page.locator('#diet-ketogenic').evaluate(el => { el.open = true; });
  check(where, (await page.locator('#diet-ketogenic .nd-caution').innerText()).includes('панкреатит'), 'the keto card lists its contraindications');
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'horizontal overflow on the nutrition page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the diet cards raise no errors');
  await context.close();
}

// Owner decision 2026-10-27 replaces the old picture picker/geometric hero
// with Spectrum questions, shared search/directions and a native-scroll wave.
// Check rendered pixels as well as telemetry: a changing dataset alone does
// not prove that the visitor sees the canvas change.
async function waveSnapshot(page) {
  return page.locator('canvas#spectrum-wave').evaluate(canvas => {
    const {width, height} = canvas;
    const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
    const step = Math.max(1, Math.floor(width * height / 20000));
    let hash = 2166136261;
    const colors = new Set();
    for (let pixel = 0; pixel < width * height; pixel += step) {
      const at = pixel * 4;
      for (let channel = 0; channel < 4; channel++) hash = Math.imul(hash ^ pixels[at + channel], 16777619);
      if (pixels[at + 3]) colors.add(`${pixels[at]},${pixels[at + 1]},${pixels[at + 2]}`);
    }
    const rect = canvas.getBoundingClientRect();
    return {width, height, digest: (hash >>> 0).toString(16), colors: colors.size,
      phase: canvas.dataset.wavePhase, progress: canvas.dataset.waveProgress, frame: canvas.dataset.waveFrame,
      visible: rect.bottom > 24 && rect.top < innerHeight - 24, scrollY};
  });
}

async function waitForWaveIdle(page) {
  await page.locator('canvas#spectrum-wave').evaluate(async canvas => {
    const start = performance.now();
    const view=canvas.ownerDocument.defaultView;
    let frame = canvas.dataset.waveFrame, stableSince = start;
    if (frame === undefined) throw new Error('wave frame telemetry is missing');
    while (performance.now() - start < 4000) {
      await new Promise(resolve => setTimeout(resolve, 80));
      // A temporarily delayed compositor frame can look idle while native-scroll
      // easing is unfinished. Require the actual target AND the original quiet
      // window; the later strict frame/pixel equality check remains unchanged.
      const target=view.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.min(1,Math.max(0,view.scrollY / Math.max(480,view.innerHeight || 900)));
      const converged=Math.abs(Number(canvas.dataset.waveProgress)-target)<=.00001;
      if (canvas.dataset.waveFrame !== frame || !converged) { frame = canvas.dataset.waveFrame; stableSince = performance.now(); }
      if (converged && performance.now() - stableSince >= 320) return;
    }
    throw new Error('wave keeps rendering after native scrolling stops');
  });
}

function checkBrowserHealth(where, seen) {
  check(where, seen.console.length === 0, `console errors: ${seen.console.join(' | ')}`);
  check(where, seen.pageErrors.length === 0, `uncaught errors: ${seen.pageErrors.join(' | ')}`);
  check(where, seen.badResponses.length === 0, `failed local requests: ${seen.badResponses.join(', ')}`);
  check(where, seen.external.length === 0, `third-party requests: ${seen.external.join(', ')}`);
}

async function nativeHomeScroll(page, context, touch, {target = 'canvas#spectrum-wave', steps = 16} = {}) {
  if (touch) {
    // CDP injects a native finger gesture into a touch-capable Chromium
    // context. No dispatchEvent(), scrollTo() or synthetic scroll event can
    // stand in for the browser actually moving the document here.
    const client = await context.newCDPSession(page);
    try {
      const position = await page.locator(target).evaluate(node => {
        const rect = node.getBoundingClientRect();
        return {x: Math.min(innerWidth - 24, innerWidth * .75), y: Math.min(innerHeight - 24, Math.max(180, rect.top + 150))};
      });
      // A trusted finger sequence exercises real touch scrolling. Chromium's
      // synthesizeScrollGesture(touch) can report success without moving a page.
      await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [position]});
      for (let step = 1; step <= steps; step++) {
        await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: position.x, y: Math.max(24, position.y - step * 10)}]});
        await page.waitForTimeout(16);
      }
      await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    } finally { await client.detach(); }
  } else {
    await page.mouse.move(Math.round((await page.viewportSize()).width / 2), 330);
    await page.mouse.wheel(0, 140);
  }
}

// Toggle native details through its actual summary and keyboard activation.
// Used by preserved lower-home flows after the owner-approved compact defaults.
async function toggleHomeFold(page, selector, openState) {
  const fold = page.locator(selector);
  if (await fold.evaluate(node => node.open) === openState) return;
  const summary = fold.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  // The native open flag precedes the inherited 280ms ::details-content
  // expansion. Wait for its actual body to fit before clicking nested links.
  // Poll from Node: the pinned driver's retry timers and main-world RAF polling
  // stall in JavaScript-disabled contexts after transient clipping/interception.
  const deadline = Date.now() + 1500;
  let state;
  do {
    state = await fold.evaluate(node => {
      const content = [...node.children].filter(child => child.tagName !== 'SUMMARY').at(-1);
      const outer = node.getBoundingClientRect(), body = content?.getBoundingClientRect();
      return {open: node.open, bodyFits: !body || (body.height > 0 && body.bottom <= outer.bottom + 1), outerBottom: outer.bottom, bodyBottom: body?.bottom};
    });
    if (state.open === openState && (!openState || state.bodyFits)) return;
    await page.waitForTimeout(20);
  } while (Date.now() < deadline);
  throw new Error(`Native home disclosure ${selector} did not settle: ${JSON.stringify(state)}`);
}

async function lensSnapshot(page) {
  return page.locator('[data-home-lens]').evaluate(section => {
    const box = section.getBoundingClientRect();
    const rendered = node => {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || node.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
      for (let parent = node; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) < .99) return false;
      }
      return true;
    };
    const rect = node => {
      const r = node.getBoundingClientRect();
      return {left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height};
    };
    const stage = section.querySelector('[data-lens-stage]');
    const interior = section.querySelector('.home-lens-interior');
    const action = section.querySelector('[data-lens-reveal]');
    const stageRect = rect(stage), actionRect = rect(action);
    // Resolve the computed clip, then measure the actual image's visible edge.
    // A transform on a transparent overlay cannot satisfy this geometry gate.
    const halves = [...section.querySelectorAll('.home-lens-half')].map(node => {
      const image = node.querySelector('img'), imageRect = rect(image);
      const clip = getComputedStyle(node).clipPath;
      const values = clip.match(/^inset\(([^)]+)\)$/)?.[1].split(/\s+/) || [];
      const inset = [values[0], values[1] || values[0], values[2] || values[0], values[3] || values[1] || values[0]];
      const pixels = (value, size) => parseFloat(value) * (value?.endsWith('%') ? size / 100 : 1);
      return {image: imageRect, transform:getComputedStyle(node).transform, clip,
        left:imageRect.left + pixels(inset[3], imageRect.width), right:imageRect.right - pixels(inset[1], imageRect.width),
        loaded:image.complete && image.naturalWidth > 0, src:image.getAttribute('src')};
    });
    const hit = (x,y) => {const node = document.elementFromPoint(x,y);return !!node && (node === action || action.contains(node));};
    const hitPoints = [[.5,.5],[.1,.1],[.9,.1],[.1,.9],[.9,.9]].map(([x,y]) => hit(actionRect.left+actionRect.width*x,actionRect.top+actionRect.height*y));
    const textFits = [...interior.querySelectorAll('p,a')].every(node => {
      const range=document.createRange();range.selectNodeContents(node);
      return [...range.getClientRects()].every(r => r.left >= stageRect.left && r.right <= stageRect.right && r.top >= stageRect.top && r.bottom <= stageRect.bottom);
    });
    return {
      height:document.documentElement.scrollHeight,
      complete:section.hasAttribute('data-lens-complete'),
      stage:stageRect, halves, gap:halves.length === 2 ? halves[1].left-halves[0].right : null,
      interior:{...rect(interior), opacity:Number(getComputedStyle(interior).opacity), text:interior.innerText, textFits},
      action:{...actionRect, visible:rendered(action), href:action.getAttribute('href'), tag:action.tagName,
        inside:stage.contains(action), accessible:!action.closest('[hidden], [inert], [aria-hidden="true"]'), focused:document.activeElement===action, controls:stage.querySelectorAll('a,button,input,[role="button"]').length,
        count:section.querySelectorAll('[data-lens-reveal]').length, hitPoints, centerHit:hitPoints[0],
        pointerEvents:getComputedStyle(action).pointerEvents,
        onScreen:actionRect.left>=0 && actionRect.right<=innerWidth && actionRect.top>=0 && actionRect.bottom<=innerHeight},
      progress: Number(getComputedStyle(section).getPropertyValue('--lens-progress')),
      top: box.top, scrollY, overflow: document.documentElement.scrollWidth - innerWidth,
      cards: [...section.querySelectorAll('#cards > a.topic-card')].map(node => {
        const rect = node.getBoundingClientRect();
        const parts = [...node.querySelectorAll('strong, .topic-state, .topic-open')];
        const textFits = parts.every(part => {
          const range = document.createRange(); range.selectNodeContents(part);
          return [...range.getClientRects()].every(line => line.left >= rect.left - 1 && line.right <= rect.right + 1 && line.top >= rect.top - 1 && line.bottom <= rect.bottom + 1);
        });
        return {visible: rendered(node), opacity: Number(getComputedStyle(node).opacity), transform:getComputedStyle(node).transform, pointerEvents:getComputedStyle(node).pointerEvents,
          width: rect.width, height: rect.height, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, textFits,
          href: node.getAttribute('href'), title: node.querySelector('strong')?.textContent.trim()};
      })
    };
  });
}

function checkLensLinks(where, snapshot, viewport) {
  check(where, snapshot.cards.length === 6 && snapshot.cards.every(card => card.visible && card.opacity >= .99), 'all six native directions must be truly rendered at full opacity');
  check(where, snapshot.cards.length === 6 && snapshot.cards.every(card => card.width >= 44 && card.height >= 44 && card.left >= -1 && card.right <= viewport.width + 1 && card.textFits && card.href && card.title), 'all six links need readable text rectangles and 44px tap targets within the viewport width');
  check(where, snapshot.overflow <= 1, `lens layout has ${snapshot.overflow}px horizontal overflow`);
}

function checkLensAction(where, snapshot, {onScreen = false} = {}) {
  const {action, interior, stage} = snapshot;
  check(where, action.count === 1 && action.controls === 1 && action.tag === 'A' && action.href === './directions.html' && action.inside && action.visible,
    'the single native directory fallback must be rendered inside the accessible stage, without hidden/inert ancestors');
  check(where, interior.opacity === 1 && interior.text.includes('6 напрямів') && interior.text.includes('Знайди свою тему') && interior.textFits && action.width >= 44 && action.height >= 44 && action.left >= stage.left && action.right <= stage.right && action.top >= stage.top && action.bottom <= stage.bottom,
    'readable HTML and an opaque 44px action must fit physically inside the lens');
  if (onScreen) check(where, action.onScreen && action.hitPoints.every(Boolean), 'the on-screen action must pass real center and corner hit tests');
}

async function positionLensOnset(page, {before = 0} = {}) {
  await page.evaluate(before => {
    // Owner-approved 2026-10-31: stage timing keeps the action visible even
    // when the catalogue below it cannot fit in a short viewport.
    const rect = document.querySelector('[data-lens-stage]').getBoundingClientRect();
    const distance = Math.min(320, Math.max(160, innerHeight * .38));
    const end = Math.min(24, innerHeight - rect.height - 16);
    scrollTo({top:rect.top + scrollY - end - distance - before, behavior:'instant'});
  }, before);
  await page.waitForTimeout(240);
}

async function waitForLensLinksSettled(page, viewport, state) {
  const before=await lensSnapshot(page);
  // Completion changes the target immediately; native CSS transitions take
  // 160ms. Assert their real final paint rather than an arbitrary earlier frame.
  await page.waitForFunction(() => [...document.querySelectorAll('#cards > a.topic-card')].every(node => {
    const style=getComputedStyle(node);
    return Number(style.opacity)>=.999 && (style.transform==='none' || Math.abs(new DOMMatrixReadOnly(style.transform).f)<.1);
  }), null, {timeout:2000});
  if(process.env.QA_ARTIFACT_DIR) {
    const dir=path.resolve(process.env.QA_ARTIFACT_DIR);fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,`home-lens-transition-${state}-${viewport.name}.json`),JSON.stringify({state,viewport,before,settled:await lensSnapshot(page)},null,2));
  }
}

// Owner 2026-10-31: scroll opens the artwork only; an intentional action
// opens the six choices. These checks replace the old always-visible grid contract.
async function openLensPicker(page) {
  await page.locator('[data-lens-reveal]').focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-lens-picker][open]').waitFor({state:'visible'});
  await page.locator('[data-lens-picker] img').evaluateAll(nodes=>Promise.all(nodes.map(node=>node.decode())));
}
// Owner 2026-10-31: the six picture tiles sit on the cosmic violet of the home, not on teal.
// Measure the edge of what the browser actually decoded (the backdrop of each picture), not the file names.
async function lensTileColours(page) {
  return page.locator('#cards .home-picker-image').evaluateAll(nodes=>nodes.map(node=>{
    const canvas=document.createElement('canvas'),w=canvas.width=node.naturalWidth,h=canvas.height=node.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(node,0,0);
    const band=8,sum=[0,0,0];let count=0;
    for(const [x,y,bw,bh] of [[0,0,w,band],[0,h-band,w,band],[0,band,band,h-2*band],[w-band,band,band,h-2*band]]){
      const data=ctx.getImageData(x,y,bw,bh).data;
      for(let i=0;i<data.length;i+=4){sum[0]+=data[i];sum[1]+=data[i+1];sum[2]+=data[i+2];count++;}
    }
    const [r,g,b]=sum.map(value=>value/count/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let hue=0;if(d>0)hue=60*(max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4);if(hue<0)hue+=360;
    return {src:node.currentSrc.split('/').pop().replace('card-art-','').replace('.webp',''),hue,sat:max?d/max:0,val:max,width:w};
  }));
}
async function homeLensFlow(browser, origin, viewport) {
  const where=`home lens chooser @${viewport.name}`;
  const {context,page,seen}=await open(browser,origin,viewport,'/index.html',{contextOptions:{reducedMotion:'no-preference'}});
  try {
    await page.locator('[data-home-lens][data-lens-ready]').waitFor({state:'attached'});
    const panel=page.locator('[data-lens-picker]'),jump=page.locator('[data-lens-reveal]');
    check(where,!(await panel.isVisible())&&await page.locator('#cards>a:visible').count()===0,'directions must start outside page layout, pointer and keyboard navigation');
    await positionLensOnset(page,{before:2});
    const closed=await lensSnapshot(page);
    check(where,closed.progress<=.01&&Math.abs(closed.gap)<=1&&closed.interior.opacity===0&&!closed.action.centerHit,'the two real image halves must begin joined with no invisible core hit');
    await page.mouse.move(viewport.width/2,viewport.height/2);
    await page.mouse.wheel(0,128);await page.waitForTimeout(240);
    const middle=await lensSnapshot(page);
    check(where,middle.progress>closed.progress&&middle.progress<1&&middle.gap>closed.gap+20,'native scrolling must still separate the actual image halves');
    check(where,!(await panel.isVisible())&&middle.cards.every(card=>!card.visible&&card.width===0),'partial reveal must never expose a direction');
    const beforeOpen=await page.evaluate(()=>scrollY);
    await page.mouse.click(middle.action.left+middle.action.width/2,middle.action.top+middle.action.height/2);
    await panel.waitFor({state:'visible'});
    await page.locator('[data-lens-picker] img').evaluateAll(nodes=>Promise.all(nodes.map(node=>node.decode())));
    const tiles=await lensTileColours(page);
    check(where,tiles.length===6&&tiles.every(tile=>tile.width>0&&tile.src.endsWith('-cosmic')),`all six direction pictures are the decoded cosmic versions (${tiles.map(tile=>tile.src).join(', ')})`);
    check(where,tiles.every(tile=>tile.hue>=245&&tile.hue<=290&&tile.sat>=.2&&tile.val<=.6),`the picture backgrounds are violet, not teal (${tiles.map(tile=>`${tile.src} ${Math.round(tile.hue)}°`).join(', ')})`);
    checkLensLinks(where,await lensSnapshot(page),viewport);
    check(where,await panel.evaluate(node=>node.matches(':modal')),'choices must occupy the native modal top layer');
    check(where,await page.locator('[data-lens-picker-close]').evaluate(node=>document.activeElement===node),'opening moves focus to the close control');
    check(where,Math.abs(await page.evaluate(()=>scrollY)-beforeOpen)<=1,'opening must preserve the background scroll position');
    await artifact(page,viewport,'home-picker-open',panel,{scroll:false});
    await page.keyboard.press('Tab');
    check(where,await page.locator('#cards>a').first().evaluate(node=>document.activeElement===node&&node.matches(':focus-visible')),'Tab from close must visibly reach the first real direction');
    await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
    check(where,await jump.evaluate(node=>document.activeElement===node&&node.getAttribute('aria-expanded')==='false'),'Escape must return focus to the lens action');
    check(where,await page.locator('#cards>a:visible').count()===0,'closing removes all six choices again');
    await jump.press(' ');await panel.waitFor({state:'visible'});
    await page.locator('[data-lens-picker-close]').click();await panel.waitFor({state:'hidden'});
    await openLensPicker(page);await page.mouse.click(1,1);await panel.waitFor({state:'hidden'});
    check(where,await jump.evaluate(node=>document.activeElement===node),'backdrop dismissal must restore focus');
    // Full decorative reveal still does not authorize opening navigation.
    await page.goto(origin+'/index.html',{waitUntil:'load'});
    await page.locator('[data-home-lens][data-lens-ready]').waitFor({state:'attached'});
    await positionLensOnset(page,{before:2});await page.mouse.wheel(0,324);await page.waitForTimeout(260);
    const full=await lensSnapshot(page);
    check(where,full.progress===1&&full.gap>100&&full.halves.every(half=>half.loaded),'the short native reveal must retain loaded, substantially separated artwork');
    check(where,!(await panel.isVisible())&&full.cards.every(card=>!card.visible),'even full scroll reveal keeps choices closed');
    checkLensAction(where,full,{onScreen:true});
    const idle=await page.locator('[data-home-lens]').getAttribute('style');
    await page.waitForTimeout(350);
    check(where,await page.locator('[data-home-lens]').getAttribute('style')===idle,'the decorative lens must settle without idle style writes');
    await page.mouse.wheel(0,-324);await page.waitForTimeout(240);
    check(where,(await lensSnapshot(page)).progress<=.01&&!(await panel.isVisible()),'reverse scroll must rejoin artwork while choices remain closed');
    await page.goto(origin+'/index.html#cards',{waitUntil:'load'});
    await panel.waitFor({state:'visible'});checkLensLinks(`${where} legacy fragment`,await lensSnapshot(page),viewport);
    await page.locator('#cards>a[data-area="supplements"]').click();
    await page.waitForURL(url=>url.hash==='#supplement-library');
    check(where,!(await panel.isVisible())&&await page.locator('.home-library-fold').evaluate(node=>node.open),'the Supplements choice closes the panel and opens its existing library');
    for(const hash of ['#supplement-library','#evidence-guide-title']){
      await page.goto(origin+'/index.html'+hash,{waitUntil:'load'});
      await page.locator(hash).waitFor({state:'visible'});
      check(where,await page.locator(hash).evaluate(node=>{for(let n=node.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS'&&!n.open)return false;return true;}),'existing deep links retain every ancestor disclosure');
    }
    await page.goto(origin+'/index.html',{waitUntil:'load'});
    await openLensPicker(page);
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
    check(where,!(await panel.isVisible()),'pagehide closes the panel before page-cache restoration');
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await openLensPicker(page);await page.keyboard.press('Escape');
    await page.emulateMedia({reducedMotion:'reduce'});
    check(where,!(await panel.isVisible()),'changing motion preference must never open navigation');
    await openLensPicker(page);checkLensLinks(`${where} reduced motion`,await lensSnapshot(page),viewport);
    checkBrowserHealth(where,seen);
  } finally {await context.close();}
  for(const fallback of ['without JavaScript','missing dialog','missing observer','observer setup failure']){
    const state=await open(browser,origin,viewport,'/index.html',{
      contextOptions:fallback==='without JavaScript'?{javaScriptEnabled:false}:{},
      initScript:fallback==='missing dialog'?()=>{HTMLDialogElement.prototype.showModal=undefined;}:fallback==='missing observer'?()=>{window.IntersectionObserver=undefined;}:fallback==='observer setup failure'?()=>{const Native=window.IntersectionObserver;window.IntersectionObserver=class extends Native{observe(node){if(node.matches('[data-home-lens]'))throw Error('QA observer setup failure');return super.observe(node);}};}:undefined
    });
    try{
      check(where,await state.page.locator('#cards>a:visible').count()===0,`${fallback}: choices remain closed`);
      await state.page.locator('[data-lens-reveal]').click();
      if(fallback==='missing observer'){
        await state.page.locator('[data-lens-picker][open]').waitFor({state:'visible'});
        checkLensLinks(`${where} ${fallback}`,await lensSnapshot(state.page),viewport);
      }else{
        await state.page.waitForURL(url=>url.pathname==='/directions.html');
        check(where,await state.page.locator('h1').isVisible(),`${fallback}: native action reaches the complete directory`);
      }
      checkBrowserHealth(`${where} ${fallback}`,state.seen);
    }finally{await state.context.close();}
  }
}

async function homeLensTouchFlow(browser, origin, viewport) {
  const where = `home cosmic lens native touch @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html', {contextOptions: {hasTouch: true, isMobile: true, reducedMotion: 'no-preference'}});
  try {
    await page.locator('[data-home-lens][data-lens-ready]').waitFor({state: 'attached'});
    check(where, await page.evaluate(() => navigator.maxTouchPoints > 0), 'lens gestures need an actual touch-capable context');
    await page.evaluate(() => {
      const rect = document.querySelector('[data-lens-stage]').getBoundingClientRect();
      const distance = Math.min(320, Math.max(160, innerHeight * .38));
      const end = Math.min(24, innerHeight - rect.height - 16);
      scrollTo({top: rect.top + scrollY - end - distance, behavior: 'instant'});
    });
    await page.waitForTimeout(200);
    const before = await lensSnapshot(page);
    await nativeHomeScroll(page, context, true, {target: '[data-lens-stage]', steps: 20});
    await page.waitForFunction(y => scrollY > y + 20, before.scrollY);
    await page.waitForTimeout(350);
    const middle = await lensSnapshot(page);
    await nativeHomeScroll(page, context, true, {target: '[data-lens-stage]', steps: 20});
    await waitForLensLinksSettled(page,viewport,'native-touch-open');
    const after = await lensSnapshot(page);
    check(where, after.scrollY > before.scrollY + 100 && before.progress <= middle.progress && middle.progress <= after.progress, 'real finger scrolling must move the document and monotonically open the lens');
    check(where,after.cards.every(card=>!card.visible),'native finger scrolling must not expose the directions');
    await positionLensOnset(page);
    await page.mouse.wheel(0,320);
    await page.waitForTimeout(300);
    checkLensAction(`${where} touch action`, await lensSnapshot(page), {onScreen:true});
    await page.locator('[data-lens-reveal]').tap();
    await page.locator('[data-lens-picker][open]').waitFor({state:'visible'});
    checkLensLinks(`${where} actual touch activation`, await lensSnapshot(page), viewport);
    checkBrowserHealth(where, seen);
  } finally { await context.close(); }
}

// The old 844/900px-tall matrix missed both the invisible-card hit and a
// landscape action that faded in only after scrolling above the viewport.
async function homeLensViewportFlow(browser, origin, viewport) {
  const where = `home lens viewport regression @${viewport.name}`;
  const {context,page,seen} = await open(browser,origin,viewport,'/index.html',{contextOptions:{reducedMotion:'no-preference'}});
  try {
    await page.locator('[data-home-lens][data-lens-ready]').waitFor({state:'attached'});
    if (viewport.largeText) {
      const appearance = page.getByRole('button',{name:'Вигляд сайту: тема й розмір тексту',exact:true});
      await appearance.click();
      // Appearance exposes button[role=radio], rather than native inputs.
      await page.getByRole('radio',{name:'Великий',exact:true}).click();
      check(where,await page.evaluate(()=>document.documentElement.dataset.text==='xl'),'the large-text probe must activate the actual appearance setting');
      await appearance.click();
    }
    await page.evaluate(()=>document.fonts.ready);
    // A 2px lead absorbs native fractional rounding; the blank-hit probe must
    // start at genuine zero opacity, not a tiny positive first-card fade.
    await positionLensOnset(page,{before:2});
    const closed=await lensSnapshot(page);
    check(where,closed.progress<=.01 && closed.cards.every(card=>!card.visible&&card.width===0),'closed directions must have no rendered or clickable rectangles');
    const blank=await page.locator('#cards').evaluate(cards=>{
      for(const link of cards.querySelectorAll('a.topic-card')) {
        const r=link.getBoundingClientRect(),top=Math.max(1,r.top),bottom=Math.min(innerHeight-1,r.bottom);
        if(bottom-top<4)continue;
        const x=r.left+r.width/2,y=(top+bottom)/2,hit=document.elementFromPoint(x,y);
        return {x,y,receivesHit:!!hit&&(hit===link||link.contains(hit))};
      }
      return null;
    });
    check(where,!blank?.receivesHit,'a visible portion of a transparent card must not intercept a real pointer');
    if(blank) {
      const before=page.url();
      await page.mouse.click(blank.x,blank.y);
      await page.waitForTimeout(80);
      check(where,page.url()===before,'clicking the blank card area must keep the visitor on the home page');
    }
    const distance=Math.min(320,Math.max(160,viewport.height*.38));
    await page.mouse.move(viewport.width/2,viewport.height/2);
    await page.mouse.wheel(0,distance/2);
    await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('[data-home-lens]')).getPropertyValue('--lens-progress'))>.4);
    const middle=await lensSnapshot(page);
    check(where,middle.progress<.65 && middle.interior.opacity>0 && middle.action.onScreen && middle.action.hitPoints.every(Boolean),'the central action must be visible and clickable halfway through short-screen reveal');
    check(where,middle.action.width>=44&&middle.action.height>=44,'core scaling must preserve the 44px pointer target');
    await page.mouse.wheel(0,distance/2+3);
    await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('[data-home-lens]')).getPropertyValue('--lens-progress'))===1);
    const opened=await lensSnapshot(page);
    checkLensAction(where,opened,{onScreen:true});
    check(where,opened.cards.every(card=>!card.visible),'scroll alone must keep every choice hidden');
    await artifact(page,viewport,'home-lens-upgrade-open',page.locator('body'),{scroll:false});
    await page.locator('[data-lens-reveal]').press('Enter');
    await page.locator('[data-lens-picker][open]').waitFor({state:'visible'});
    await page.keyboard.press('Tab');
    check(where,await page.locator('#cards>a').first().evaluate(node=>document.activeElement===node),'Enter opens the panel and Tab reaches its first direction');
    // Root appearance zoom changes the fixed containing block, but not dvh.
    // The short-screen contract includes the panel itself, not only its first link.
    const panelBounds=await page.locator('[data-lens-picker]').evaluate(node=>{
      const r=node.getBoundingClientRect(),close=node.querySelector('[data-lens-picker-close]').getBoundingClientRect();
      return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,overflow:node.scrollWidth-node.clientWidth,closeTop:close.top,closeBottom:close.bottom};
    });
    check(where,panelBounds.top>=-1&&panelBounds.bottom<=viewport.height+1&&panelBounds.left>=-1&&panelBounds.right<=viewport.width+1&&panelBounds.overflow<=1&&panelBounds.closeTop>=0&&panelBounds.closeBottom<=viewport.height,'the enlarged-text panel and its close control must remain within the actual viewport');
    await page.locator('#cards>a').last().scrollIntoViewIfNeeded();
    check(where,await page.locator('#cards>a').last().evaluate(node=>{const r=node.getBoundingClientRect(),p=node.closest('dialog').getBoundingClientRect();return r.top>=p.top&&r.bottom<=Math.min(p.bottom,innerHeight)+1;}),'the last direction must be reachable by scrolling inside the panel');
    check(where,await page.locator('[data-lens-picker-close]').evaluate(node=>{const r=node.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'the sticky close control remains available after scrolling to the last choice');
    checkBrowserHealth(where,seen);
  } finally {await context.close();}
}

async function homeWaveFlow(browser, origin, viewport, {touch = false, reduced = false} = {}) {
  const where = `home ${reduced ? 'reduced motion' : touch ? 'native touch' : 'native wheel'} @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html', {
    contextOptions: {hasTouch: touch, reducedMotion: reduced ? 'reduce' : 'no-preference'}
  });
  try {
    await page.waitForFunction(() => document.querySelector('canvas#spectrum-wave')?.dataset.waveFrame !== undefined);
    await waitForWaveIdle(page);
    if (touch) check(where, await page.evaluate(() => navigator.maxTouchPoints > 0), 'the finger gesture must run in a touch-capable context');
    const before = await waveSnapshot(page);
    check(where, before.width > 0 && before.height > 0 && before.colors > 12 && before.visible, 'the visible wave must contain rendered, nonempty geometry');
    await nativeHomeScroll(page, context, touch);
    await page.waitForFunction(y => scrollY > y + 20, before.scrollY);
    await waitForWaveIdle(page);
    const after = await waveSnapshot(page);
    check(where, after.scrollY > before.scrollY + 20, 'ordinary native input must move the document');
    check(where, after.visible, 'the wave must remain in view while its geometry is compared');
    check(where, after.width === before.width && after.height === before.height, 'scrolling must not resize the canvas backing buffer');
    if (reduced) {
      check(where, after.phase === before.phase && after.frame === before.frame && after.digest === before.digest, 'reduced motion must keep the actual wave pixels, phase and frame static after native scrolling');
    } else {
      check(where, after.phase !== before.phase && after.progress !== before.progress, 'actual scrollY must update the wave phase and progress');
      check(where, after.digest !== before.digest, 'the actual RGBA canvas pixels must change after native scrolling');
      await artifact(page, viewport, touch ? 'home-wave-touch-scrolled' : 'home-wave-scrolled', page.locator('body'), {scroll: false});
    }
    await page.waitForTimeout(400);
    const idle = await waveSnapshot(page);
    check(where, idle.frame === after.frame && idle.digest === after.digest, 'an idle visible wave must stop drawing: ' + JSON.stringify({after, idle}));
    check(where, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'native scrolling must not create horizontal overflow');
    checkBrowserHealth(where, seen);
  } finally { await context.close(); }
}

async function homeSpectrumFlow(browser, origin, viewport) {
  const where = `home Spectrum @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  try {
    await page.locator('canvas#spectrum-wave').waitFor({state: 'visible'});
    await page.evaluate(() => document.fonts.ready);
    const homeSurface = await page.locator('.page').evaluate(node => ({background: getComputedStyle(node).backgroundColor, before: getComputedStyle(node, '::before').display, after: getComputedStyle(node, '::after').display}));
    check(where, homeSurface.background === 'rgb(11, 10, 18)' && homeSurface.before === 'none' && homeSurface.after === 'none', 'the chosen dark cosmic surface must replace every legacy teal wrapper layer');
    if (viewport.width >= 1400) check(where, await page.locator('.spectrum-route-bar').evaluate(node => node.getBoundingClientRect().bottom <= innerHeight), 'the desktop route must remain visible within the first screen');
    check(where, (await page.locator('#top h1').innerText()).trim() === 'Почни з питання.', 'the real HTML heading must state the chosen entry');
    check(where, await page.locator('#spectrum-search').getAttribute('role') === 'search' && await page.locator('label[for="spectrum-query"]').count() === 1, 'the question search has a semantic form and accessible input label');
    const controls = await page.locator('#spectrum-query, #spectrum-search button[type="submit"], [data-spectrum-question], [data-spectrum-route], #spectrum-directions-trigger').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect(); return {width: box.width, height: box.height, left: box.left, right: box.right};
    }));
    check(where, controls.length === 7 && controls.every(box => box.width >= 44 && box.height >= 44 && box.left >= 0 && box.right <= viewport.width + 1), 'all hero controls must be usable tap targets within the viewport');
    const questionBoxes = await page.locator('[data-spectrum-question]').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();return {x: box.x, y: box.y, right: box.right, bottom: box.bottom};
    }));
    check(where, viewport.width <= 700 ? questionBoxes[0].right <= questionBoxes[1].x + 1 && questionBoxes[2].y >= questionBoxes[1].bottom - 1 : questionBoxes.every((box, index) => !index || box.x > questionBoxes[index - 1].right), 'three questions must retain the readable phone 2+1 / desktop three-column hierarchy');
    check(where, await page.locator('canvas#spectrum-wave').evaluate(canvas => canvas.getAttribute('aria-hidden') === 'true' && getComputedStyle(canvas).pointerEvents === 'none'), 'the decorative wave must stay out of accessibility and pointer navigation');
    await artifact(page, viewport, 'home-first-screen', page.locator('body'), {scroll: false});
    await page.locator('#spectrum-query').focus();
    await page.keyboard.press('Tab');
    const submit = page.locator('#spectrum-search button[type="submit"]');
    check(where, await submit.evaluate(node => document.activeElement === node && node.matches(':focus-visible') && getComputedStyle(node).outlineStyle !== 'none' && parseFloat(getComputedStyle(node).outlineWidth) >= 2), 'keyboard navigation must visibly focus the search submit button');
    await page.keyboard.press('Tab');
    check(where, await page.locator('[data-spectrum-question="muscle"]').evaluate(node => document.activeElement === node && node.matches(':focus-visible') && getComputedStyle(node).outlineStyle !== 'none'), 'keyboard navigation must visibly focus the first real question');
    if (viewport.width > 700) {
      await page.locator('[data-spectrum-question="muscle"]').hover();
      check(where, await page.locator('[data-spectrum-question="muscle"] h2').evaluate(node => getComputedStyle(node).textDecorationLine.includes('underline')), 'the question link must give visible pointer feedback');
    }
    const search = page.locator('dialog.eua-search');
    // Search indexes catalog units, whose Sleep destination includes its
    // section anchor; the hub's bare page URL is not an indexed material.
    const sleepStagesHref = areas.find(area => area.id === 'sleep').units.find(unit => unit.id === 'stages').href;
    const sleepStagesURL = new URL(sleepStagesHref, origin + '/index.html');
    for (const [query, href] of [['креатин', './index.html#creatine'], ['як пити креатин', './index.html#creatine'], ['сон', sleepStagesHref]]) {
      await page.locator('#spectrum-query').fill(query);
      await page.locator('#spectrum-query').press('Enter');
      await search.waitFor({state: 'visible'});
      const result = search.locator(`.eua-search-results a[href="${href}"]`);
      await result.waitFor({state: 'visible'});
      check(where, await search.count() === 1 && await page.locator('#eua-search-q').inputValue() === query, 'the hero must seed one actual shared search dialog');
      check(where, await page.locator('#eua-search-q').evaluate(node => node === document.activeElement), 'opening the shared search must focus its query');
      check(where, (await search.locator('.eua-search-status').innerText()).includes('Знайдено'), 'the typed question must produce real indexed results');
      if (query === 'креатин') await artifact(page, viewport, 'home-search-open', search);
      await result.focus();
      await page.keyboard.press('Escape');
      await search.waitFor({state: 'hidden'});
      check(where, await page.locator('#spectrum-query').evaluate(node => node === document.activeElement), 'Escape from a result must close search and restore the hero query focus');
    }
    // A repeated submit must still navigate through a real result, rather
    // than merely showing a matching label in a standalone hero widget.
    await submit.click();
    await search.waitFor({state: 'visible'});
    await search.locator(`.eua-search-results a[href="${sleepStagesHref}"]`).click();
    await page.waitForURL(url => url.pathname === sleepStagesURL.pathname && url.hash === sleepStagesURL.hash);
    await page.locator(sleepStagesURL.hash).waitFor({state: 'visible'});
    check(where, await page.locator('#sleep-stages').count() === 1, 'the home search result must open the actual Sleep material');
    await page.goto(origin + '/index.html#top', {waitUntil: 'load'});
    await page.locator('.eua-header-home-spectrum').waitFor();
    const directions = page.locator('dialog#spectrum-directions');
    const openDirections = async source => {
      const opener = source === 'hero' ? page.locator('#spectrum-directions-trigger') : page.locator('.eua-site-header nav a[href="./directions.html"]');
      if (!(await opener.isVisible())) await page.locator('.eua-header-toggle').click();
      await opener.click();
      await directions.waitFor({state: 'visible'});
      check(where, await directions.count() === 1, 'repeated entry points must reuse one native directions dialog');
      return source === 'header' && viewport.width <= 1100 ? page.locator('.eua-header-toggle') : opener;
    };
    for (const source of ['hero', 'header']) for (let repeat = 0; repeat < 2; repeat++) {
      const focusTarget = await openDirections(source);
      const actual = await directions.locator('.spectrum-directions-list a').evaluateAll(nodes => nodes.map(node => ({id: node.dataset.spectrumArea, href: node.getAttribute('href'), title: node.querySelector('.spectrum-directions-name')?.textContent.trim(), state: node.querySelector('.spectrum-directions-state')?.textContent.trim()})));
      const expected = areas.filter(area => area.available).map(({id, href, title, state}) => ({id, href, title, state}));
      check(where, JSON.stringify(actual) === JSON.stringify(expected), `${source} directions must show all six real catalog destinations and their current statuses`);
      const box = await directions.boundingBox();
      check(where, box && box.x >= 0 && box.x + box.width <= viewport.width + 1 && box.y >= 0 && box.y + box.height <= viewport.height + 1, 'the native directions drawer must fit the viewport');
      if (source === 'hero' && repeat === 0) {
        await artifact(page, viewport, 'home-directions-open', directions);
        // A click targeted at dialog padding is inside its rectangle, not a
        // backdrop dismissal; this previously closed the home drawer.
        await page.mouse.click(box.x + 8, box.y + 8);
        check(where, await directions.isVisible() && await directions.evaluate(node => node.open), 'clicking inside the directions padding must keep the drawer open');
      }
      if (repeat === 0) { await directions.locator('.spectrum-directions-list a').first().focus(); await page.keyboard.press('Escape'); }
      else await directions.locator('[data-spectrum-close]').click();
      await directions.waitFor({state: 'hidden'});
      // Native close hides the dialog synchronously but queues its close event.
      // A collapsed mobile header needs that event to focus the visible toggle.
      // Wait for the actual focus contract, not merely the earlier hidden state.
      await page.waitForFunction(node => node === document.activeElement, await focusTarget.elementHandle());
      check(where, await focusTarget.evaluate(node => node === document.activeElement), `${source} directions close must restore a visible opener's focus`);
    }
    // The phone drawer fills the viewport. Exercise an actual outside click
    // only where the desktop drawer leaves a visible native backdrop.
    if (viewport.width > 700) {
      const focusTarget = await openDirections('hero');
      const box = await directions.boundingBox();
      check(where, box.x > 1, 'the desktop directions drawer must leave a backdrop');
      await page.mouse.click(box.x / 2, 100);
      await directions.waitFor({state: 'hidden'});
      await page.waitForFunction(node => node === document.activeElement, await focusTarget.elementHandle());
      check(where, await focusTarget.evaluate(node => node === document.activeElement), 'backdrop dismissal must return focus to the directions opener');
    }
    await openDirections('hero');
    await directions.locator('.spectrum-directions-list a[href="./nutrition.html"]').click();
    await page.waitForURL('**/nutrition.html');
    check(where, await page.locator('.nutrition-branch').count() === 2, 'choosing a direction must open its actual Nutrition entry');
    for (const [question, pathname, hash, target] of [
      ['muscle', '/muscle-lab.html', '#explorer', '#explorer'],
      ['fat', '/fat-burning.html', '', '#fb-step-title'],
      ['creatine', '/index.html', '#creatine', 'body > #creatine']
    ]) {
      await page.goto(origin + '/index.html#top', {waitUntil: 'load'});
      await page.locator(`[data-spectrum-question="${question}"]`).click();
      await page.waitForURL(url => url.pathname === pathname && url.hash === hash);
      await page.locator(target).waitFor({state: 'visible'});
      check(where, new URL(page.url()).pathname === pathname && new URL(page.url()).hash === hash, `${question} must reach its real existing material and section`);
      if (question === 'creatine') {
        await page.waitForFunction(() => document.body.dataset.routeView === 'article');
        check(where, !(await page.locator('#top').isVisible()), 'the question must activate the preserved creatine article router');
        // The same home header stays mounted on a dossier. Its configured
        // hero query is hidden here, so Escape must focus the visible button.
        const headerSearch = page.locator('.eua-site-header .eua-header-search');
        await headerSearch.waitFor({state: 'visible'});
        await headerSearch.click();
        await search.waitFor({state: 'visible'});
        await page.keyboard.press('Escape');
        await search.waitFor({state: 'hidden'});
        check(where, await headerSearch.isVisible() && await headerSearch.evaluate(node => node === document.activeElement), 'Escape from article search must restore the visible header search button');
        const headerDirections = page.locator('.eua-site-header nav a[href="./directions.html"]');
        if (!(await headerDirections.isVisible())) await page.locator('.eua-header-toggle').click();
        check(where, await page.locator('.eua-site-header nav a:visible').count() === 6, 'the dossier header must reveal all six canonical navigation entries');
        check(where, await headerDirections.getAttribute('role') === null && await headerDirections.getAttribute('aria-haspopup') === null && await headerDirections.getAttribute('aria-controls') === null, 'article Directions must retain native catalog-link semantics');
        await headerDirections.click();
        await page.waitForURL(url => url.pathname === '/directions.html' && !url.hash);
        check(where, await page.locator('h1').isVisible(), 'article Directions must navigate to the actual catalog instead of opening the home drawer');
      }
    }
    await page.goto(origin + '/index.html#top', {waitUntil: 'load'});
    await page.locator('[data-spectrum-route]').click();
    await page.waitForURL(url => url.pathname === '/cell-lab.html' && url.searchParams.get('path') === 'energy' && url.searchParams.get('lesson') === '0');
    await page.locator('#cell-canvas [data-organelle="ORG-MITOCHONDRION"][aria-pressed="true"]').waitFor();
    check(where, new URL(page.url()).searchParams.get('organelle') === 'ORG-MITOCHONDRION' && new URL(page.url()).hash === '#cell-canvas', 'starting the energy route must retain its real organelle and canvas deep link');
    check(where, /Мітохондрія/.test(await page.locator('#organelle-title').innerText()) && /Клітина та енергія/.test(await page.locator('.eua-learning-nav').innerText()), 'the destination must select the mitochondrion model and mount the energy curriculum');
    check(where, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'home transitions must not introduce horizontal overflow');
    checkBrowserHealth(where, seen);
  } finally { await context.close(); }
}

async function homeNoScriptFlow(browser, origin, viewport) {
  const where = `home without JavaScript @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html', {contextOptions: {javaScriptEnabled: false}});
  try {
    check(where, await page.locator('#spectrum-title').isVisible(), 'the question heading must be readable without JavaScript');
    // Computed styles catch CSS selectors that accidentally depend on the
    // router setting data-route-view, and the inherited legacy home grid.
    const layout = await page.evaluate(async () => {
      const page = document.querySelector('body > .page'), home = document.querySelector('.spectrum-home'), ribbon = document.querySelector('.spectrum-ribbon');
      const pageStyle = getComputedStyle(page), homeStyle = getComputedStyle(home), ribbonStyle = getComputedStyle(ribbon);
      const fullWidth = node => { const box = node.getBoundingClientRect(); return Math.abs(box.left) <= 1 && Math.abs(box.width - document.documentElement.clientWidth) <= 1; };
      const imageURL = (ribbonStyle.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/) || [])[1];
      let ribbonLoaded = false;
      if (imageURL) {
        const image = new Image(); image.src = imageURL;
        try { await image.decode(); ribbonLoaded = image.naturalWidth > 0 && image.naturalHeight > 0; } catch {}
      }
      const ribbonBox = ribbon.getBoundingClientRect(), homeBox = home.getBoundingClientRect();
      return {
        display: pageStyle.display, pageFullWidth: fullWidth(page), homeFullWidth: fullWidth(home),
        background: getComputedStyle(document.body).backgroundColor, homeBackground: homeStyle.backgroundImage,
        headingFont: getComputedStyle(document.getElementById('spectrum-title')).fontFamily,
        ribbonPosition: ribbonStyle.position, ribbonImage: ribbonStyle.backgroundImage, ribbonLoaded,
        ribbonVisible: ribbonStyle.display !== 'none' && ribbonStyle.visibility !== 'hidden' && Number(ribbonStyle.opacity) > 0 && ribbonBox.width > 0 && ribbonBox.height > 0 && ribbonBox.bottom > homeBox.top && ribbonBox.top < homeBox.bottom,
        ribbonPointerEvents: ribbonStyle.pointerEvents,
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    check(where, layout.display === 'block' && layout.pageFullWidth && layout.homeFullWidth, `the static home must keep its full-width block layout: ${JSON.stringify(layout)}`);
    check(where, layout.background === 'rgb(11, 10, 18)' && layout.homeBackground.includes('radial-gradient') && layout.headingFont.includes('Spectrum Serif'), 'the no-script home must retain its cosmic background and heading typography');
    check(where, layout.ribbonPosition === 'absolute' && layout.ribbonPointerEvents === 'none' && layout.ribbonVisible && layout.ribbonLoaded && layout.ribbonImage.includes('home-spectrum-ribbon.webp'), 'the authored static ribbon must load and retain its decorative positioned styles without JavaScript');
    check(where, layout.overflow <= 1, `the no-script home has ${layout.overflow}px horizontal overflow`);
    check(where, await page.locator('header a[href="./directions.html"]').first().isVisible(), 'the native fallback header must retain a visible directions link');
    check(where, await page.locator('[data-spectrum-question][href]').count() === 3 && await page.locator('#cards a[href]').count() === 6, 'all questions and all six directions must remain real fallback links');
    await artifact(page, viewport, 'home-without-javascript', page.locator('body'), {scroll: false});
    await page.locator('.home-examples>summary').click();
    check(where,await page.locator('.home-example-links a:visible').count()===3,'the folded examples must open natively without JavaScript');
    // Native outer route disclosure also starts closed without JavaScript.
    await toggleHomeFold(page, '#home-learning-paths', true);
    await page.locator('.home-path-outline>summary').first().click();
    check(where,await page.locator('.home-path-outline').first().locator('ol a:visible').count()>=3,'the complete route outline must open natively without JavaScript');
    await page.locator('[data-spectrum-question="creatine"]').click();
    await page.waitForURL(url => url.pathname === '/index.html' && url.hash === '#creatine');
    await page.locator('body > #creatine').waitFor({state: 'visible'});
    check(where, await page.locator('body > #creatine').evaluate(node => node.matches(':target') && getComputedStyle(node).display === 'block') && await page.locator('body > #creatine h1').isVisible(), 'the native #creatine target must reveal the existing dossier without JavaScript');
    check(where, await page.locator('body > .page').evaluate(node => getComputedStyle(node).display === 'none') && !(await page.locator('.spectrum-home').isVisible()), 'native article targeting must hide the static home without JavaScript');
    // Start from a fresh home document so the native :target test cannot
    // accidentally substitute for the independent GET form fallback.
    await page.goto(origin + '/index.html', {waitUntil: 'load'});
    await page.locator('#spectrum-title').waitFor({state: 'visible'});
    check(where, await page.locator('#spectrum-search').getAttribute('method') === 'get' && await page.locator('#spectrum-search').getAttribute('action') === './directions.html', 'the no-script query must use the actual catalog GET fallback');
    await page.locator('#spectrum-query').fill('сон');
    await page.locator('#spectrum-search button[type="submit"]').click();
    await page.waitForURL(url => url.pathname === '/directions.html' && url.searchParams.get('q') === 'сон');
    check(where, await page.locator('h1').isVisible(), 'submitting the fallback must reach the actual catalog page');
    checkBrowserHealth(where, seen);
  } finally { await context.close(); }
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

async function provenanceStampFlow(browser, origin, viewport) {
  // Бриф T8 (2026-11-02): рядок «хто й коли перевірив» має однаковий вигляд під досьє добавок і в картці розбору, слова не змінені.
  // Дивимось у браузері: рядок видимий, не виходить за ширину, лінія ліворуч є, контраст не менший за 4,5:1.
  const where = `provenance stamp @${viewport.name}`;
  const measure = node => {
    const channel = value => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const luminance = rgb => { const [r, g, b] = rgb.match(/[\d.]+/g).map(Number); return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
    let background = 'rgb(0, 0, 0)';
    for (let el = node; el; el = el.parentElement) { const color = getComputedStyle(el).backgroundColor; const alpha = color.match(/[\d.]+/g)[3]; if (alpha === undefined || Number(alpha) > 0.9) { background = color; break; } }
    const [hi, lo] = [luminance(getComputedStyle(node).color), luminance(background)].sort((a, b) => b - a);
    const box = node.getBoundingClientRect(), style = getComputedStyle(node);
    return {text: node.textContent.replace(/\s+/g, ' ').trim(), right: Math.round(box.right), width: Math.round(box.width), height: Math.round(box.height), rule: style.borderLeftWidth, ruleStyle: style.borderLeftStyle, contrast: (hi + 0.05) / (lo + 0.05), fontSize: parseFloat(style.fontSize)};
  };
  for (const id of ['supplement-caffeine', 'supplement-protein']) {
    const {context, page, seen} = await open(browser, origin, viewport, '/index.html#' + id);
    try {
      const line = page.locator(`#${id} .pc-status`);
      await line.waitFor({state: 'attached'});
      await line.scrollIntoViewIfNeeded();
      const info = await line.evaluate(measure);
      check(where, /^Науковий перегляд: не завершено · Формулювання погоджено \d{1,2} жовтня 2026 року · Матеріал освітній і не є персональною медичною рекомендацією\.$/.test(info.text), `${id}: the sentence is unchanged: ${info.text}`);
      check(where, info.rule === '2px' && info.ruleStyle === 'solid', `${id}: the shared rule on the left is drawn (${info.rule} ${info.ruleStyle})`);
      check(where, info.right <= viewport.width && info.fontSize >= 12, `${id}: the line fits the screen width and is at least 12px`);
      check(where, info.contrast >= 4.5, `${id}: contrast ${info.contrast.toFixed(2)}:1 is below 4.5:1`);
      check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, `${id}: no sideways scrolling`);
      if (id === 'supplement-caffeine') await artifact(page, viewport, 'provenance-stamp-dossier', line);
      check(where, seen.pageErrors.length === 0 && seen.external.length === 0, `${id}: no errors and no third-party requests`);
    } finally { await context.close(); }
  }
  const {context, page, seen} = await open(browser, origin, viewport, '/research.html');
  try {
    await page.locator('.rs-card summary').first().click();
    // T3: від 1360 px рядок джерела в картці схований, а «Перевірено …» стоїть у бічній примітці (той самий клас eua-stamp).
    const line = viewport.width >= 1360 ? page.locator('.rs-item:has(.rs-card[open]) .eua-sidenote.eua-stamp').first() : page.locator('.rs-card[open] .rs-source.eua-stamp').first();
    await line.waitFor({state: 'visible'});
    const info = await line.evaluate(measure);
    check(where, /Перевірено \d{2}\.\d{2}\.2026\.$/.test(info.text), `research: the sentence ends with the check date: ${info.text}`);
    check(where, info.rule === '2px' && info.ruleStyle === 'solid', `research: the shared rule on the left is drawn (${info.rule} ${info.ruleStyle})`);
    check(where, info.right <= viewport.width && info.contrast >= 4.5, `research: the line fits (${info.right}px) and has contrast ${info.contrast.toFixed(2)}:1`);
    await artifact(page, viewport, 'provenance-stamp-research', line);
    check(where, seen.pageErrors.length === 0 && seen.external.length === 0, 'research: no errors and no third-party requests');
  } finally { await context.close(); }
}

async function intervalMotifFlow(browser, origin, viewport) {
  // Бриф T1 (2026-11-02): мініатюри інтервальних графіків у згорнутих картках розборів і «лінія інтервалу» між великими блоками головної.
  const where = `interval motif @${viewport.name}`;
  const research = await open(browser, origin, viewport, '/research.html');
  try {
    const page = research.page;
    await page.locator('.rs-card').first().waitFor({state: 'attached'});
    const minis = await page.evaluate(() => [...document.querySelectorAll('.rs-card')].map(card => {
      const mini = card.querySelector(':scope > summary > .eua-mini'), more = card.querySelector(':scope > summary > .rs-more');
      if (!mini) return {id: card.id, mini: false, open: card.open};
      const box = mini.getBoundingClientRect(), cardBox = card.getBoundingClientRect(), moreBox = more.getBoundingClientRect();
      return {id: card.id, mini: true, open: card.open, hidden: mini.getAttribute('aria-hidden') === 'true', width: Math.round(box.width), height: Math.round(box.height),
        insideCard: box.left >= cardBox.left && box.right <= cardBox.right, sameRowAsMore: box.top < moreBox.bottom && box.bottom > moreBox.top,
        rows: mini.querySelectorAll('.eua-mi-row').length, texts: mini.querySelectorAll('text').length, nullInside: (() => { const n = mini.querySelector('.eua-mi-null'); return !!n && n.x1.baseVal.value >= 0 && n.x1.baseVal.value <= 132; })()};
    }));
    const withMini = minis.filter(item => item.mini);
    check(where, minis.length >= 16 && withMini.length === 5, `exactly the five write-ups with a chart show a thumbnail, found ${withMini.length} of ${minis.length}`);
    check(where, withMini.every(item => item.hidden && item.width >= 100 && item.height >= 40 && item.insideCard && item.sameRowAsMore), `every thumbnail is decorative, readable in size, inside its card and in the row of «Докладніше»: ${JSON.stringify(withMini.filter(item => !(item.hidden && item.insideCard && item.sameRowAsMore)))}`);
    check(where, withMini.every(item => item.rows >= 2 && item.rows <= 4 && item.texts === 0 && item.nullInside), 'every thumbnail has two to four rows, a null line inside the plot and no text');
    check(where, minis.filter(item => !item.mini).length === minis.length - 5, 'write-ups without a chart get no thumbnail and no placeholder');
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'the research page must not scroll sideways');
    // Згорнута картка з мініатюрою лишається компактною: мініатюра в одному рядку з «Докладніше», а не окремим рядком під ним.
    const heights = await page.evaluate(() => {
      const h = el => Math.round(el.getBoundingClientRect().height);
      const withMini = document.querySelector('.rs-card.has-mini'), without = [...document.querySelectorAll('.rs-card')].find(card => !card.classList.contains('has-mini'));
      return {withMini: h(withMini), without: h(without)};
    });
    check(where, heights.withMini - heights.without < 140, `a folded card with a thumbnail stays compact: ${JSON.stringify(heights)}`);
    await artifact(page, viewport, 'interval-thumbnail-card', page.locator('.rs-card.has-mini').first());
    // Відкриття картки не зламано: графік у тілі повний (усі ряди), а мініатюра лишається в шапці.
    await page.locator('.rs-card.has-mini > summary').first().click();
    const opened = await page.evaluate(() => { const card = document.querySelector('.rs-card.has-mini[open]'); return {full: card.querySelectorAll('.rs-crow:not(.rs-caxisrow)').length, mini: card.querySelectorAll('.eua-mi-row').length}; });
    check(where, opened.full >= opened.mini && opened.mini >= 2, `the full chart keeps all rows while the thumbnail shows at most four: ${JSON.stringify(opened)}`);
    check(where, research.seen.pageErrors.length === 0 && research.seen.external.length === 0, 'research: no errors and no third-party requests');
  } finally { await research.context.close(); }
  const home = await open(browser, origin, viewport, '/index.html');
  try {
    const page = home.page;
    await page.locator('.home-fresh').scrollIntoViewIfNeeded();
    const rules = await page.evaluate(() => [...document.querySelectorAll('.eua-interval-rule')].map(rule => {
      const box = rule.getBoundingClientRect(), style = getComputedStyle(rule), next = rule.nextElementSibling;
      return {width: Math.round(box.width), right: Math.round(box.right), height: Math.round(box.height), hidden: rule.getAttribute('aria-hidden') === 'true', drawn: style.backgroundImage.includes('radial-gradient') && style.backgroundImage.includes('linear-gradient'), next: next && (next.className || next.tagName), animated: style.animationName !== 'none' || parseFloat(style.transitionDuration) > 0};
    }));
    check(where, rules.length === 2, `two interval rules on the home, found ${rules.length}`);
    check(where, rules.every(rule => rule.hidden && rule.drawn && !rule.animated && rule.width >= 120 && rule.right <= viewport.width && rule.height >= 10 && rule.height <= 20), `the rules are decorative, drawn, still and fit the screen: ${JSON.stringify(rules)}`);
    check(where, rules.map(rule => rule.next).join('|') === 'home-fresh|home-library-section', `the rules stand before «Нове на сайті» and before the library: ${rules.map(rule => rule.next).join('|')}`);
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'the home must not scroll sideways');
    await artifact(page, viewport, 'interval-rule-home', page.locator('.eua-interval-rule').first());
    check(where, home.seen.pageErrors.length === 0 && home.seen.external.length === 0, 'home: no errors and no third-party requests');
  } finally { await home.context.close(); }
}

async function studyTypeChipsFlow(browser, origin, viewport) {
  // Бриф T2 (2026-11-02): значок типу джерела в кожній картці розбору. Фігура й точний рядок типу первинні, колір другорядний; це не рейтинг.
  const where = `study type chips @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/research.html');
  try {
    await page.locator('.rs-card').first().waitFor({state: 'attached'});
    const data = await page.evaluate(async () => { const m = await import('./research-data.js?v=4'), t = await import('./research-types.js?v=1'); return {types: m.STUDIES.map(s => s.type), families: m.STUDIES.map(s => (t.familyOf(s.type) || {}).id)}; });
    const read = () => page.evaluate(() => {
      const channel = value => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const luminance = rgb => { const [r, g, b] = rgb.match(/[\d.]+/g).map(Number); return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
      const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
      return [...document.querySelectorAll('.rs-card')].map(card => {
        const chip = card.querySelector('.rs-meta .rs-type'); if (!chip) return null;
        const glyph = chip.querySelector('.rs-glyph'), box = chip.getBoundingClientRect(), cardBox = card.getBoundingClientRect(), g = getComputedStyle(glyph), text = getComputedStyle(chip);
        return {text: chip.querySelector('span').textContent, family: [...chip.classList].find(name => name.startsWith('rs-type--')).slice(9), right: Math.round(box.right), cardRight: Math.round(cardBox.right), left: Math.round(box.left), cardLeft: Math.round(cardBox.left), height: Math.round(box.height),
          color: g.backgroundColor, radius: g.borderRadius, clip: g.clipPath, hidden: glyph.getAttribute('aria-hidden'), border: text.borderTopColor, textContrast: ratio(text.color, getComputedStyle(card).backgroundColor)};
      });
    });
    const chips = await read();
    check(where, chips.length === data.types.length && chips.every(Boolean), `every card has a chip: ${chips.length} of ${data.types.length}`);
    check(where, chips.every((chip, i) => chip && chip.text === data.types[i]), 'every chip shows the exact type string from the data, in the data order');
    check(where, chips.every((chip, i) => chip && chip.family === data.families[i]), 'every chip belongs to the family the table gives its type');
    const expected = {meta: 'rgb(153, 217, 115)', systematic: 'rgb(58, 223, 215)', umbrella: 'rgb(255, 163, 207)', review: 'rgb(203, 193, 196)'};
    check(where, chips.every(chip => chip && chip.color === expected[chip.family] && chip.border === expected[chip.family]), 'the shape and the border carry the family colour (cosmic palette)');
    check(where, chips.every(chip => chip && chip.hidden === 'true'), 'every shape is decorative');
    const shapeOk = chip => chip.family === 'meta' ? chip.radius === '50%' : chip.family === 'systematic' ? chip.clip === 'none' && chip.radius === '0px' : chip.clip !== 'none';
    check(where, chips.every(chip => chip && shapeOk(chip)), 'each family has its own shape (circle, square, triangle, diamond)');
    check(where, new Set(chips.map(chip => chip.family + ':' + chip.clip + ':' + chip.radius)).size === 4, 'four shapes are told apart without colour');
    check(where, chips.every(chip => chip && chip.right <= chip.cardRight && chip.left >= chip.cardLeft && chip.height >= 20), 'chips stay inside their cards');
    check(where, chips.every(chip => chip && chip.textContrast >= 4.5), `chip text contrast in the cosmic palette: ${Math.min(...chips.map(chip => chip.textContrast)).toFixed(2)}:1`);
    // Зелена палітра: ті самі фігури й ті самі запасні кольори, текст не менш контрастний.
    await page.evaluate(() => { document.documentElement.dataset.palette = 'green'; });
    const green = await read();
    check(where, green.every((chip, i) => chip && chip.family === chips[i].family && chip.color === expected[chip.family]), 'the green palette shows the same families with the fallback colours');
    check(where, green.every(chip => chip && chip.textContrast >= 4.5), `chip text contrast in the green palette: ${Math.min(...green.map(chip => chip.textContrast)).toFixed(2)}:1`);
    await page.evaluate(() => { delete document.documentElement.dataset.palette; });
    const legend = await page.evaluate(() => ({rows: [...document.querySelectorAll('#rs-legend li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()), visible: document.querySelector('#rs-legend').getBoundingClientRect().height > 0, sentence: document.body.innerText.split('Колір і значок показують лише тип джерела, а не рівень впевненості.').length - 1, overflow: document.documentElement.scrollWidth - innerWidth}));
    check(where, legend.rows.length === 4 && legend.visible && legend.rows[0].includes('Мета-аналіз') && legend.rows[3].startsWith('Огляд'), `the legend has one row per family: ${legend.rows.join(' | ')}`);
    check(where, legend.sentence === 1, 'the sentence that colour and shape show only the type appears once');
    check(where, legend.overflow <= 1, 'the research page must not scroll sideways');
    await artifact(page, viewport, 'study-type-chips-legend', page.locator('.rs-note'));
    await artifact(page, viewport, 'study-type-chips-card', page.locator('.rs-card').nth(1));
    check(where, seen.pageErrors.length === 0 && seen.external.length === 0, 'no errors and no third-party requests');
  } finally { await context.close(); }
}

async function sidenotesFlow(browser, origin, viewport) {
  // Бриф T3 (2026-11-02, рішення D5): бічні примітки з джерелами від 1360 px; нижче лишається рядок джерела в картці. Колонку 860 px не зсуваємо.
  const where = `sidenotes @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/research.html');
  try {
    await page.locator('.rs-item').first().waitFor({state: 'attached'});
    const margin = viewport.width >= 1360;
    const read = () => page.evaluate(() => {
      const visible = node => { const rect = node.getBoundingClientRect(), style = getComputedStyle(node); return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'; };
      return [...document.querySelectorAll('.rs-item')].map(item => {
        const card = item.querySelector(':scope > .rs-card'), note = item.querySelector(':scope > .eua-sidenote'), inline = card.querySelector('.rs-source'), a = note.querySelector('a'), b = inline.querySelector('a');
        const c = card.getBoundingClientRect(), n = note.getBoundingClientRect();
        return {id: card.id, noteVisible: visible(note), inlineVisible: visible(inline), sibling: note.previousElementSibling === card, insideCard: !!card.querySelector('.eua-sidenote'),
          same: a.href === b.href && a.target === '_blank' && a.rel === 'noopener noreferrer' && a.textContent.replace(/\s+/g, ' ') === b.textContent.replace(/\s+/g, ' '),
          top: Math.round(n.top - c.top), left: Math.round(n.left), right: Math.round(n.right), cardRight: Math.round(c.right), noteTop: Math.round(n.top + scrollY), noteBottom: Math.round(n.bottom + scrollY), width: Math.round(n.width), cardBottom: Math.round(c.bottom + scrollY)};
      });
    });
    const overlaps = items => items.slice(1).filter((item, i) => item.noteTop < items[i].noteBottom - 1).map(item => item.id);
    let items = await read();
    check(where, items.length === 16, `sixteen items, sixteen notes: ${items.length}`);
    check(where, items.every(item => item.sibling && !item.insideCard), 'every note is the sibling of its card, not inside it');
    check(where, items.every(item => item.same), 'every note link equals the link in its card (address, target, rel, label)');
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'the research page must not scroll sideways');
    if (margin) {
      check(where, items.every(item => item.noteVisible), 'from 1360 px every note is visible next to its card');
      check(where, items.every(item => Math.abs(item.top) <= 2), `each note starts at the top of its card: ${JSON.stringify(items.filter(item => Math.abs(item.top) > 2).map(item => [item.id, item.top]))}`);
      check(where, items.every(item => item.left >= item.cardRight + 8 && item.right <= viewport.width - 4 && item.width >= 220), `notes stay in the margin, inside the window, at least 220px wide: ${JSON.stringify(items.slice(0, 1))}`);
      check(where, overlaps(items).length === 0, `notes do not overlap each other: ${overlaps(items).join(',')}`);
      // Картку відкрито: рядок джерела в картці схований, примітка на місці, сусідні примітки не накладаються, колонка не зсунулась.
      const before = await page.locator('.rs-card').first().evaluate(card => Math.round(card.getBoundingClientRect().left));
      await page.locator('.rs-card summary').first().click();
      await page.waitForTimeout(450);
      items = await read();
      check(where, !items[0].inlineVisible && items[0].noteVisible && Math.abs(items[0].top) <= 2, 'the open card hides its own source line and keeps its note');
      check(where, overlaps(items).length === 0 && items[1].noteTop >= items[0].cardBottom - 1, 'the next note moved down with the opened card');
      check(where, Math.round(await page.locator('.rs-card').first().evaluate(card => card.getBoundingClientRect().left)) === before, 'the column did not shift');
      // Порядок табуляції: картка, потім її примітка.
      await page.locator('.rs-card summary').first().click();
      await page.locator('.rs-card summary').first().focus();
      await page.keyboard.press('Tab');
      check(where, await page.evaluate(() => document.activeElement && document.activeElement.closest('.eua-sidenote') !== null && document.activeElement.closest('.rs-item') === document.querySelector('.rs-item')), 'after the card the focus goes to its note');
      await artifact(page, viewport, 'sidenotes', page.locator('#rs-list'));
    } else {
      check(where, items.every(item => !item.noteVisible), 'below 1360 px no note is shown');
      await page.locator('.rs-card summary').first().click();
      await page.waitForTimeout(450);
      items = await read();
      check(where, items[0].inlineVisible && !items[0].noteVisible, 'below 1360 px the source line stays in the card');
    }
    check(where, seen.pageErrors.length === 0 && seen.external.length === 0, 'no errors and no third-party requests');
  } finally { await context.close(); }
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
    const mod = await import('./research-share.js?v=3'), data = await import('./research-data.js?v=4'), bad = [];
    for (const s of data.STUDIES) { const {layout} = await mod.drawCard(s, data.TOPICS[s.topic]); if (!mod.FITS(layout)) bad.push(s.id); }
    return bad;
  });
  check(where, fits.length === 0, 'the text fits on the picture for every write-up' + (fits.length ? ': ' + fits.join(',') : ''));
  // Палітри (2026-10-31): картинка для соцмереж має кольори поточної палітри сторінки.
  const cardBg = await page.evaluate(async () => {
    const mod = await import('./research-share.js?v=3'), data = await import('./research-data.js?v=4'), s = data.STUDIES[0];
    const read = async () => { const {canvas} = await mod.drawCard(s, data.TOPICS[s.topic]); return Array.from(canvas.getContext('2d').getImageData(2, 2, 1, 1).data.slice(0, 3)); };
    const cosmic = await read(); document.documentElement.dataset.palette = 'green'; const green = await read(); delete document.documentElement.dataset.palette;
    return {cosmic, green};
  });
  check(where, cardBg.cosmic.join() === '11,10,18' && cardBg.green.join() === '13,25,22', `the share picture follows the palette: ${JSON.stringify(cardBg)}`);
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

// Схема ночі на сторінці «Сон і відновлення» та блок «Дивись також» (рішення власника 34–37, 2026-11-09). Тести в Node бачать дані й логіку; тут міряємо те, що видно й рухається в Chromium:
// розкладку (смуги в сітці, підписи проти своїх рядків, без виходу за ширину), рух курсора, паузу, зупинку поза екраном, вибір стадії кнопками, режим без руху, клавіатуру,
// розмір цілей дотику, справжність посилань і кольори (різниця між стадіями, що йдуть у ночі підряд, у космічній і зеленій палітрах за правилами скіла dataviz).
const NIGHT_STAGE_ORDER = ['wake', 'rem', 'n1', 'n2', 'n3'];
// Пари стадій, що в умовній ночі стоять поруч у часі (див. SEGMENTS у src/sleep/night.mjs): колір саме цих пар мусить відрізнятися.
// «cat» — різні категорії (неспання, REM, ряд N1–N3): на нормальному зорі ΔE ≥ 15, при протанопії/дейтеранопії ≥ 8 (правила dataviz для категорій).
// «ord» — сусідні кроки одного ряду «глибше = насиченіше»: за правилом dataviz для впорядкованих рядів крок світлоти ΔL ≥ 0,06; ΔE ≥ 12 (нормальний зір і CVD) тут як страховка.
const NIGHT_NEIGHBOURS = [['wake', 'n1', 'cat'], ['wake', 'n2', 'cat'], ['n1', 'n2', 'ord'], ['n2', 'n3', 'ord'], ['n2', 'rem', 'cat'], ['rem', 'n1', 'cat']];
const nightLin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const nightLab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
// Machado, Oliveira, Fernandes (2009), severity 1.0, лінійний RGB: ті самі матриці, що в validate_palette.js скіла dataviz.
const NIGHT_CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]]
};
const nightDeltaE = (a, b, kind) => {
  const lin = c => c.map(nightLin), sim = c => { if (!kind) return lin(c); const L = lin(c); return NIGHT_CVD[kind].map(row => Math.min(1, Math.max(0, row[0] * L[0] + row[1] * L[1] + row[2] * L[2]))); };
  const x = nightLab(sim(a)), y = nightLab(sim(b));
  return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};
const nightLum = c => { const [r, g, b] = c.map(nightLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const nightContrast = (a, b) => { const x = nightLum(a), y = nightLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const nightRgb = text => { const m = /rgba?\(([^)]+)\)/.exec(text || ''); const p = m ? m[1].split(/[,\s/]+/).filter(Boolean).map(Number) : []; return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };

// Реальні кольори смуг: колір смуги з її прозорістю, накладений на тло схеми (так їх складає браузер).
async function nightColours(page) {
  const raw = await page.evaluate(() => {
    const fig = document.querySelector('[data-sleep-night]');
    const pick = stage => { const bars = [...fig.querySelectorAll(`.night-bar[data-stage="${stage}"]`)].filter(b => !b.classList.contains('is-now')); const bar = bars[bars.length - 1]; const cs = getComputedStyle(bar); return {color: cs.backgroundColor, opacity: parseFloat(cs.opacity)}; };
    const out = {surface: getComputedStyle(fig).backgroundColor, bars: {}};
    for (const stage of ['wake', 'rem', 'n1', 'n2', 'n3']) out.bars[stage] = pick(stage);
    out.label = getComputedStyle(fig.querySelector('.night-label')).color;
    out.now = getComputedStyle(fig.querySelector('.night-now')).color;
    out.head = getComputedStyle(fig.querySelector('.night-head span')).color;
    return out;
  });
  const surface = nightRgb(raw.surface), surf = [surface.r, surface.g, surface.b];
  const colours = {};
  for (const [stage, {color, opacity}] of Object.entries(raw.bars)) { const c = nightRgb(color); colours[stage] = [c.r, c.g, c.b].map((v, i) => v * opacity + surf[i] * (1 - opacity)); }
  const text = key => { const c = nightRgb(raw[key]); return [c.r, c.g, c.b]; };
  return {surface: surf, surfaceAlpha: surface.a, colours, label: text('label'), now: text('now'), head: text('head')};
}

async function sleepNightFlow(browser, origin, viewport) {
  const where = `sleep night @${viewport.name}`;
  const wide = viewport.width >= 1000;
  const night = await import(pathToFileURL(path.join(dist, 'sleep-night.js')).href).catch(() => null);
  check(where, night && night.SEGMENTS && night.SEGMENTS.length > 8, 'the page delivers the night module (sleep-night.js) with the data of the scheme');
  if (!night) return;
  const read = page => page.evaluate(() => { const f = document.querySelector('[data-sleep-night]'); return {clock: performance.now(), t: parseFloat(f.style.getPropertyValue('--t')), selected: f.dataset.selected || null, button: f.querySelector('.night-play').textContent.trim(), now: f.querySelector('.night-now').textContent.trim(), nowStage: f.querySelector('.night-bar.is-now')?.dataset.stage || null, nowCount: f.querySelectorAll('.night-bar.is-now').length, cursor: f.querySelector('.night-cursor').getBoundingClientRect().x + 1, plotX: f.querySelector('.night-plot').getBoundingClientRect().x, plotW: f.querySelector('.night-plot').getBoundingClientRect().width}; });
  const advance = (a, b) => ((b - a) % 1 + 1) % 1;
  const centre = page => page.evaluate(() => document.querySelector('[data-sleep-night]').scrollIntoView({block: 'center'}));

  // 1) Розмітка й розкладка.
  const {context, page, seen} = await open(browser, origin, viewport, '/sleep.html');
  const figure = page.locator('[data-sleep-night]');
  await page.waitForFunction(() => document.querySelector('[data-sleep-night]')?.classList.contains('is-live'), null, {timeout: 5000});
  await centre(page);
  const layout = await page.evaluate(() => {
    const fig = document.querySelector('[data-sleep-night]'), plot = fig.querySelector('.night-plot').getBoundingClientRect(), box = fig.getBoundingClientRect();
    const intro = document.querySelector('.sleep-stage-top > .section-intro').getBoundingClientRect();
    const bars = [...fig.querySelectorAll('.night-bar')].map(b => { const q = b.getBoundingClientRect(); return {stage: b.dataset.stage, i: Number(b.dataset.i), x: q.x, right: q.right, cy: q.y + q.height / 2, h: q.height, w: q.width}; });
    const labels = [...fig.querySelectorAll('.night-label')].map(l => { const q = l.getBoundingClientRect(); return {text: l.textContent.trim(), row: l.dataset.row, cy: q.y + q.height / 2, size: parseFloat(getComputedStyle(l).fontSize), right: q.right}; });
    const chart = fig.querySelector('.night-chart');
    return {box: {x: box.x, right: box.right, y: box.y}, intro: {right: intro.right, bottom: intro.bottom}, plot: {x: plot.x, w: plot.width, right: plot.right}, bars, labels, role: chart.getAttribute('role'), aria: chart.getAttribute('aria-label'), hidden: [...fig.querySelectorAll('.night-rows,.night-plot,.night-axis')].map(e => e.getAttribute('aria-hidden')), caption: fig.querySelector('.night-head span').textContent.trim(), axis: [...fig.querySelectorAll('.night-axis span')].map(s => s.textContent.trim()), overflow: document.documentElement.scrollWidth - innerWidth, svg: fig.querySelectorAll('svg,canvas,img').length};
  });
  check(where, layout.box.x >= -0.5 && layout.box.right <= viewport.width + 0.5 && layout.overflow <= 1, `the scheme fits the width (${layout.box.x}…${layout.box.right}, overflow ${layout.overflow})`);
  if (wide) check(where, layout.box.x >= layout.intro.right - 1, 'on a computer the scheme stands beside the intro text, not under it');
  else check(where, await page.evaluate(() => document.querySelector('[data-sleep-night]').getBoundingClientRect().top >= document.querySelector('.sleep-stage-top > .section-intro').getBoundingClientRect().bottom - 1), 'on a phone the scheme comes right after the intro text');
  check(where, layout.bars.length === night.SEGMENTS.length, `one bar per segment (${layout.bars.length} of ${night.SEGMENTS.length})`);
  check(where, layout.labels.map(l => l.text).join('|') === 'Неспання|REM|N1|N2|N3', `five row labels in the order of a hypnogram: ${layout.labels.map(l => l.text)}`);
  check(where, layout.labels.every(l => l.size >= 12), 'row labels are real text, not smaller than 12 px');
  check(where, layout.svg === 0, 'no picture, canvas or SVG: labels and bars are plain HTML');
  check(where, layout.role === 'img' && layout.aria === night.SUMMARY && layout.hidden.every(v => v === 'true'), 'a screen reader gets one text description of the scheme; the drawn parts are hidden from it');
  check(where, /Умовний приклад/.test(layout.caption) && layout.axis.join('|') === 'початок ночі|ранок', 'the scheme says it is a conditional example and marks the start and the morning, without any times');
  const rowY = {};
  for (const stage of NIGHT_STAGE_ORDER) { const ys = layout.bars.filter(b => b.stage === stage).map(b => b.cy); rowY[stage] = ys[0]; check(where, ys.every(y => Math.abs(y - ys[0]) <= 1), `all ${stage} bars stand on one row`); }
  check(where, NIGHT_STAGE_ORDER.every((s, i) => !i || rowY[s] > rowY[NIGHT_STAGE_ORDER[i - 1]] + 8), `rows go wake, REM, N1, N2, N3 from top to bottom: ${NIGHT_STAGE_ORDER.map(s => Math.round(rowY[s]))}`);
  check(where, layout.labels.every(l => Math.abs(l.cy - rowY[l.row]) <= 2), 'every label stands against its own row');
  check(where, layout.labels.every(l => l.right <= layout.plot.x + 1), 'labels do not run into the plot');
  check(where, layout.bars.every(b => b.h >= 10 && b.h <= 24 && b.w >= 4.5), `bars are between 10 and 24 px tall and at least 5 px wide (max ${Math.max(...layout.bars.map(b => b.h))} px)`);
  const slots = night.SLOTS;
  check(where, layout.bars.every(b => { const seg = night.SEGMENTS[b.i]; return Math.abs(b.x - (layout.plot.x + layout.plot.w * seg.start / slots)) <= 1.5 && (b.w >= layout.plot.w * seg.len / slots - 1.5 || b.w <= 5.5); }), 'a bar starts where its segment starts and is as long as the segment (the time axis is honest)');
  check(where, layout.bars.every(b => b.x >= layout.plot.x - 1 && b.right <= layout.plot.right + 1), 'no bar leaves the plot');

  // 2) Рух: схема, яку видно, рухається сама; курсор іде вперед і збігається з підписом «зараз».
  await page.waitForFunction(() => /Пауза/.test(document.querySelector('.night-play')?.textContent || ''), null, {timeout: 4000}).catch(() => {});
  const m0 = await read(page);
  check(where, /Пауза/.test(m0.button) && m0.now.startsWith('На схемі зараз: '), `the night moves by itself once the scheme is on the screen (${m0.button}; ${m0.now})`);
  await page.waitForTimeout(800);
  const m1 = await read(page);
  const step = advance(m0.t, m1.t), elapsed = (m1.clock - m0.clock) / night.NIGHT_MS;
  check(where, step >= elapsed * 0.4 && step <= elapsed + 0.003, `the cursor moves forward by the time that passed, not faster (${step.toFixed(4)} of the night, ${elapsed.toFixed(4)} of real time)`);
  check(where, m1.nowCount === 1 && m1.now.includes(night.labelOf(m1.nowStage)), `exactly one bar is «now» and the label names its stage (${m1.nowStage}: ${m1.now})`);
  check(where, Math.abs(m1.cursor - (m1.plotX + m1.t * m1.plotW)) <= 2, 'the cursor stands where --t says');

  // 3) Пауза.
  await page.locator('.night-play').click();
  const p0 = await read(page);
  await page.waitForTimeout(700);
  const p1 = await read(page);
  check(where, /Відтворити/.test(p0.button) && p1.t === p0.t && p1.now === p0.now, 'the pause button stops the cursor and the label');
  check(where, await page.locator('.night-play').evaluate(el => { const r = el.getBoundingClientRect(); return r.height >= 44 && r.width >= 44; }), 'the play/pause button is at least 44 × 44 px');

  // 4) Вибір стадії кнопками: схема стає на першу смугу цієї стадії й підсвічує всі її смуги; решта притушена.
  const opacity = stage => page.evaluate(s => [...document.querySelectorAll(`.night-bar[data-stage="${s}"]`)].map(b => parseFloat(getComputedStyle(b).opacity)), stage);
  const labelColour = row => page.evaluate(r => getComputedStyle(document.querySelector(`.night-label[data-row="${r}"]`)).color, row);
  // Стадію обирають, поки ніч іде: вибір сам ставить схему на паузу (без цього курсор побіг би далі від обраної смуги).
  await page.locator('.night-play').click();
  await page.waitForTimeout(300);
  check(where, /Пауза/.test((await read(page)).button), 'the night is moving again before a stage is chosen');
  await page.locator('[data-sleep-stage="n3"]').click();
  await page.waitForTimeout(450);
  const s0 = await read(page);
  check(where, s0.selected === 'n3' && /Відтворити/.test(s0.button) && s0.now === 'Показано: N3 · Глибокий сон', `choosing N3 pauses the scheme and names the stage (${s0.selected}; ${s0.now})`);
  const firstN3 = night.SEGMENTS.find(s => s.stage === 'n3');
  check(where, Math.abs(s0.t - (firstN3.start + 0.5) / slots) < 1e-4 && s0.nowStage === 'n3', 'the cursor stands in the middle of the first N3 bar');
  const n3 = await opacity('n3'), n2 = await opacity('n2'), rem = await opacity('rem');
  check(where, n3.every(o => o === 1) && [...n2, ...rem].every(o => o < 0.4), `every N3 bar is lit and the other stages are dimmed (N3 ${n3}; N2 max ${Math.max(...n2)})`);
  check(where, (await labelColour('n3')) !== (await labelColour('n2')), 'the label of the chosen row is brighter than the others');
  const sT = await read(page);
  await page.waitForTimeout(600);
  check(where, (await read(page)).t === sT.t, 'a chosen stage stays put: the cursor does not move');
  check(where, (await page.locator('[data-stage-panel="n3"]').isVisible()) && (await page.locator('[data-stage-panel="n2"]').isHidden()), 'the explanation of the chosen stage is shown, as before');
  await page.locator('[data-sleep-stage="rem"]').click();
  await page.waitForTimeout(450);
  const s1 = await read(page), remO = await opacity('rem'), n3b = await opacity('n3');
  check(where, s1.selected === 'rem' && s1.nowStage === 'rem' && remO.every(o => o === 1) && n3b.every(o => o < 0.4), 'another stage takes the highlight over from the first');
  // «Відтворити» знімає виділення й запускає ніч.
  await page.locator('.night-play').click();
  await page.waitForTimeout(450);
  const r0 = await read(page);
  await page.waitForTimeout(600);
  const r1 = await read(page);
  check(where, r0.selected === null && /Пауза/.test(r0.button) && advance(r0.t, r1.t) > 0.005, 'Play removes the highlight and the night goes on');
  check(where, (await opacity('n2')).some(o => o > 0.5) && (await opacity('rem')).every(o => o > 0.9), 'all stages are shown normally again');

  // 5) Клавіатура: кнопка керується Enter і пропуском.
  await page.locator('.night-play').focus();
  await page.keyboard.press('Enter');
  const k0 = await read(page);
  check(where, /Відтворити/.test(k0.button), 'Enter pauses');
  await page.keyboard.press('Space');
  check(where, /Пауза/.test((await read(page)).button), 'Space plays');
  await page.keyboard.press('Enter');

  // 6) Поза екраном схема стоїть, повернулась — іде далі (якщо людина не ставила паузу).
  await page.locator('.night-play').click();
  await centre(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const o0 = await read(page);
  await page.waitForTimeout(700);
  const o1 = await read(page);
  check(where, o1.t === o0.t, 'while the scheme is off the screen the night stands still');
  await centre(page);
  await page.waitForTimeout(500);
  const o2 = await read(page);
  await page.waitForTimeout(600);
  check(where, advance(o2.t, (await read(page)).t) > 0.005 && /Пауза/.test((await read(page)).button), 'and goes on when the scheme comes back');

  // 7) Дрібниці з правки 34: одна кнопка в шапці, пропущений пробіл, без виходу за ширину.
  await page.evaluate(() => scrollTo(0, 0));
  const hero = page.locator('.module-meta a');
  check(where, (await hero.count()) === 1 && (await hero.evaluate(el => el.getBoundingClientRect().height)) >= 44, 'the hero has one button of at least 44 px instead of three small links');
  check(where, /від того,\s+що саме вимірюють/.test(await page.locator('#sleep-performance h3').first().innerText()), 'the heading «від того, що саме вимірюють» has its space on every width');
  // 8) «Дивись також»: чотири посилання не нижче 44 px, справжні адреси, перше відкриває картку розбору.
  const related = await page.locator('.related-list a').evaluateAll(els => els.map(a => { const r = a.getBoundingClientRect(); return {href: a.getAttribute('href'), w: r.width, h: r.height, right: r.right, left: r.left, text: a.innerText.replace(/\s+/g, ' ').trim(), arrow: getComputedStyle(a.querySelector('span'), '::after').content}; }));
  check(where, related.length === 4 && related.every(l => l.h >= 44 && l.w >= 120 && l.left >= -0.5 && l.right <= viewport.width + 0.5), `four related links, each at least 44 px tall and inside the width (${related.map(l => Math.round(l.w) + '×' + Math.round(l.h))})`);
  check(where, related.every(l => l.arrow.startsWith('"\u00a0→"') && l.text.length > 20), `every related link has its arrow after a non-breaking space, so the arrow never wraps alone (${JSON.stringify(related.map(l => l.arrow))})`);
  check(where, related.every(l => /\/ ""$/.test(l.arrow)), 'the arrow is decorative: it has an empty text alternative, so a screen reader reads the link without it');
  for (const link of related) { const response = await context.request.get(origin + '/' + link.href.replace(/^\.\//, '').split('#')[0]); check(where, response.status() === 200, `${link.href} opens`); }
  check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'no horizontal overflow on the page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `no errors, no third-party requests, no bad responses: ${JSON.stringify(seen.pageErrors.concat(seen.console, seen.external, seen.badResponses))}`);
  await artifact(page, viewport, 'sleep-night', figure);
  await context.close();

  // 9) Перехід за посиланням «Дивись також» відкриває саме ту картку розбору.
  const jump = await open(browser, origin, viewport, '/sleep.html');
  await jump.page.locator('.related-list a').first().scrollIntoViewIfNeeded();
  await jump.page.locator('.related-list a').first().click();
  const opened = await jump.page.waitForURL(/research\.html#magnesium-sleep$/, {timeout: 5000}).then(() => jump.page.waitForFunction(() => document.getElementById('rs-magnesium-sleep')?.open === true, null, {timeout: 5000})).then(() => true, () => false);
  check(where, opened, 'the first related link opens the research page with the magnesium card opened');
  await jump.context.close();

  // 10) Без руху: система просить без анімації, тож схема починає зі стану «пауза» й рухається лише від людини.
  const calm = await open(browser, origin, viewport, '/sleep.html', {contextOptions: {reducedMotion: 'reduce'}});
  await calm.page.waitForFunction(() => document.querySelector('[data-sleep-night]')?.classList.contains('is-live'), null, {timeout: 5000});
  await centre(calm.page);
  await calm.page.waitForTimeout(900);
  const c0 = await read(calm.page);
  await calm.page.waitForTimeout(700);
  const c1 = await read(calm.page);
  check(where, c1.t === c0.t && /Відтворити/.test(c0.button) && c0.now === 'Обери стадію або запусти ніч.', `reduced motion: the scheme starts paused and says what to do (${c0.now})`);
  await calm.page.locator('.night-play').click();
  await calm.page.waitForTimeout(700);
  check(where, advance(c0.t, (await read(calm.page)).t) > 0.005, 'reduced motion: a person can still start the night');
  await calm.page.locator('.night-play').click();
  await calm.page.reload({waitUntil: 'load'});
  await calm.page.waitForFunction(() => document.querySelector('[data-sleep-night]')?.classList.contains('is-live'), null, {timeout: 5000});
  await centre(calm.page);
  await calm.page.waitForTimeout(700);
  const colours = {cosmic: await nightColours(calm.page)};
  await calm.context.close();
  const green = await open(browser, origin, viewport, '/sleep.html', {contextOptions: {reducedMotion: 'reduce'}, initScript: () => localStorage.setItem('eua-appearance-v1', JSON.stringify({theme: 'dark', text: 'md', palette: 'green'}))});
  await green.page.waitForFunction(() => document.querySelector('[data-sleep-night]')?.classList.contains('is-live'), null, {timeout: 5000});
  await centre(green.page);
  await green.page.waitForTimeout(700);
  colours.green = await nightColours(green.page);
  check(where, (await green.page.locator('html').getAttribute('data-palette')) === 'green', 'the green palette is on for the second colour check');
  await artifact(green.page, viewport, 'sleep-night-green', green.page.locator('[data-sleep-night]'));
  await green.context.close();

  // 11) Кольори: у кожній палітрі стадії, що йдуть у ночі підряд, відрізняються (ΔE у OKLab ×100: ≥ 15 на нормальному зорі, ≥ 8 при протанопії й дейтеранопії),
  // а кожна смуга має контраст із тлом ≥ 3 (WCAG 1.4.11 для значущої графіки). Це правила скіла dataviz.
  for (const [palette, data] of Object.entries(colours)) {
    check(where, data.surfaceAlpha >= 0.99, `${palette}: the scheme background is opaque, so the colours are real`);
    for (const [a, b, kind] of NIGHT_NEIGHBOURS) {
      const normal = nightDeltaE(data.colours[a], data.colours[b], null), cvd = Math.min(nightDeltaE(data.colours[a], data.colours[b], 'protan'), nightDeltaE(data.colours[a], data.colours[b], 'deutan'));
      const stepL = Math.abs(nightLab(data.colours[a].map(nightLin))[0] - nightLab(data.colours[b].map(nightLin))[0]);
      const ok = kind === 'cat' ? normal >= 15 && cvd >= 8 : stepL >= 0.06 && normal >= 12 && cvd >= 12;
      check(where, ok, `${palette}: ${a} and ${b} (${kind}) differ enough (normal ${normal.toFixed(1)}, colour-blind ${cvd.toFixed(1)}, lightness step ${stepL.toFixed(3)})`);
    }
    for (const stage of NIGHT_STAGE_ORDER) { const ratio = nightContrast(data.colours[stage], data.surface); check(where, ratio >= 3, `${palette}: the ${stage} bar against the background ${ratio.toFixed(2)} (WCAG 1.4.11 asks for 3)`); }
    for (const key of ['label', 'now', 'head']) { const ratio = nightContrast(data[key], data.surface); check(where, ratio >= 4.5, `${palette}: the ${key} text against the background ${ratio.toFixed(2)}`); }
  }
}

// Картки звичок на сторінці сну (рішення власника «1 так», 2026-11-09): до 600 px кожна згортається в рядок-кнопку, на комп'ютері й без JavaScript усе видно, як і раніше.
// Тести в Node бачать логіку й розмітку; тут міряємо у справжньому браузері: розмір рядків, видимість тексту, дотик і клавіатуру, зміну ширини в обидва боки, друк, висоту розділу.
const HABIT_TITLES = ['Стабільний ритм', 'Світло й спокій', 'Тиха, темна, прохолодна спальня', 'Увага до стимуляторів'];
async function sleepHabitsFlow(browser, origin, viewport) {
  const where = `sleep habits @${viewport.name}`;
  const phone = viewport.width <= 600;
  const {context, page, seen} = await open(browser, origin, viewport, '/sleep.html');
  const list = page.locator('.habit-list');
  const bodies = page.locator('.habit-body');
  check(where, (await bodies.count()) === 4, 'four habit texts, each in its own .habit-body');
  const state = () => page.evaluate(() => ({
    folded: document.querySelector('.habit-list').classList.contains('is-fold'),
    buttons: [...document.querySelectorAll('.habit-list .habit-toggle')].map(b => ({text: b.textContent.trim(), expanded: b.getAttribute('aria-expanded'), controls: b.getAttribute('aria-controls'), h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width, left: b.getBoundingClientRect().left, right: b.getBoundingClientRect().right, inHeading: b.parentElement.tagName === 'H3'})),
    shown: [...document.querySelectorAll('.habit-body')].map(b => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return cs.display !== 'none' && r.height > 0; }),
    headings: [...document.querySelectorAll('.habit-list h3')].map(h => h.textContent.trim()),
    section: document.getElementById('sleep-habits').getBoundingClientRect().height,
    overflow: document.documentElement.scrollWidth - innerWidth
  }));
  await page.waitForTimeout(300);
  let s = await state();
  check(where, s.overflow <= 1, `no horizontal overflow (${s.overflow})`);
  check(where, s.headings.join('|') === HABIT_TITLES.join('|'), `the four habit titles are headings in the same order: ${s.headings}`);
  if (phone) {
    check(where, s.folded && s.buttons.length === 4, 'on a phone the cards are folded into four rows with a button each');
    check(where, s.buttons.every(b => b.inHeading), 'the button sits inside the heading, so the heading stays a heading');
    check(where, s.buttons.every(b => b.h >= 56 && b.w >= 200 && b.left >= 0 && b.right <= viewport.width + 0.5), `every row is at least 56 px tall and inside the width (${s.buttons.map(b => Math.round(b.h))})`);
    check(where, s.buttons.map(b => b.text).join('|') === HABIT_TITLES.join('|'), 'every button says the title of its habit');
    check(where, s.buttons.every((b, i) => b.expanded === 'false' && b.controls === `habit-body-${i + 1}`), 'every button says it is collapsed and names the text it controls');
    check(where, s.shown.every(v => !v), 'all four texts are hidden at first');
    check(where, s.section <= 680, `the habits section is short on a phone (${Math.round(s.section)} px; it was 928 px with the cards open)`);
    check(where, (await page.getByRole('heading', {name: HABIT_TITLES[0], level: 3}).count()) === 1, 'a screen reader still finds the habits by their headings');
    // Дотик відкриває одну картку й закриває її; інші не зачіпає.
    const toggles = page.locator('.habit-toggle');
    await toggles.nth(3).click();
    s = await state();
    check(where, s.buttons[3].expanded === 'true' && s.shown.join() === 'false,false,false,true', 'a tap opens the fourth habit only');
    check(where, await page.locator('#habit-body-4').getByRole('link', {name: /Наш розбір кофеїну/}).isVisible(), 'its link to the caffeine breakdown is visible and tappable');
    check(where, await page.locator('#habit-body-4 a').evaluate(a => a.getBoundingClientRect().height >= 44), 'the link is at least 44 px tall');
    await toggles.nth(1).click();
    s = await state();
    check(where, s.shown.join() === 'false,true,false,true', 'a second habit opens without closing the first');
    await toggles.nth(3).click();
    await toggles.nth(1).click();
    s = await state();
    check(where, s.shown.every(v => !v) && s.buttons.every(b => b.expanded === 'false'), 'tapping again closes them');
    // Клавіатура: кнопка керується Enter і пропуском.
    await toggles.nth(0).focus();
    await page.keyboard.press('Enter');
    check(where, (await state()).shown[0] === true, 'Enter opens a habit');
    await page.keyboard.press('Space');
    check(where, (await state()).shown[0] === false, 'Space closes it');
    // «Рейка»: у кожного рядка вузол-кружок із номером і шеврон; відкритий вузол заповнений (закритий порожній), шеврон перевертається.
    const look = i => toggles.nth(i).evaluate(el => { const node = getComputedStyle(el, '::before'), chevron = getComputedStyle(el, '::after'); return {nodeW: parseFloat(node.width), nodeRadius: node.borderTopLeftRadius, nodeFill: node.backgroundColor, nodeContent: node.content, chevron: parseFloat(chevron.width), turn: chevron.transform}; });
    const closed = await look(0);
    check(where, closed.nodeW >= 24 && closed.nodeRadius !== '0px' && /counter/.test(closed.nodeContent) && closed.chevron > 0, `each row shows a round numbered node and a chevron (${JSON.stringify(closed)})`);
    check(where, /rgba\(0, 0, 0, 0\)|transparent/.test(closed.nodeFill), 'a closed node is empty');
    await toggles.nth(0).click();
    await page.waitForTimeout(350);
    const opened = await look(0);
    check(where, !/rgba\(0, 0, 0, 0\)|transparent/.test(opened.nodeFill) && opened.turn !== closed.turn, 'an open node is filled and its chevron turns over');
    await toggles.nth(0).click();
    // У друку всі тексти розгорнуті.
    await page.emulateMedia({media: 'print'});
    check(where, (await state()).shown.every(v => v), 'on paper every habit text is shown');
    await page.emulateMedia({media: 'screen'});
    // Ширина росте: до комп'ютерної все розгортається, повертається вузька: знову згорнуто, і відкрите раніше теж.
    await toggles.nth(2).click();
    await page.setViewportSize({width: 1000, height: 800});
    await page.waitForTimeout(250);
    s = await state();
    check(where, !s.folded && s.buttons.length === 0 && s.shown.every(v => v) && s.headings.join('|') === HABIT_TITLES.join('|'), 'widening the window unfolds everything and removes the buttons');
    await page.setViewportSize({width: viewport.width, height: viewport.height});
    await page.waitForTimeout(250);
    s = await state();
    check(where, s.folded && s.buttons.length === 4 && s.shown.every(v => !v) && s.buttons.every(b => b.expanded === 'false'), 'narrowing it again folds everything, nothing is left half open');
    // Перехід за «03 Звички ↓» приводить до розділу, де видно чотири рядки.
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('.sleep-chapters a[href="#sleep-habits"]').click();
    const landed = await page.waitForFunction(() => { const t = document.getElementById('sleep-habits').getBoundingClientRect().top; return t > -40 && t < 220; }, null, {timeout: 6000}).then(() => true, () => false);
    check(where, landed, 'the chapter link «03 Звички» lands on the habits section');
    check(where, (await state()).buttons.every(b => b.h >= 56), 'and the four rows are there');
  } else {
    check(where, !s.folded && s.buttons.length === 0, 'on a computer there are no buttons and nothing is folded');
    check(where, s.shown.every(v => v), 'all four habit texts are visible');
    const rows = await page.locator('.habit-list article').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y)}; }));
    check(where, rows[0].y === rows[1].y && rows[2].y === rows[3].y && rows[0].x < rows[1].x && rows[2].y > rows[0].y, `the cards stand in two columns as before (${JSON.stringify(rows)})`);
    check(where, s.section >= 600, `the section keeps its size on a computer (${Math.round(s.section)} px)`);
    // Вікно звужують до телефона: картки згортаються самі (без перезавантаження).
    await page.setViewportSize({width: 390, height: 844});
    await page.waitForTimeout(250);
    s = await state();
    check(where, s.folded && s.buttons.length === 4 && s.shown.every(v => !v), 'narrowing the window to a phone folds the cards without a reload');
    await page.setViewportSize({width: viewport.width, height: viewport.height});
    await page.waitForTimeout(250);
    s = await state();
    check(where, !s.folded && s.buttons.length === 0 && s.shown.every(v => v), 'and widening it brings everything back');
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `no errors, no third-party requests: ${JSON.stringify(seen.pageErrors.concat(seen.console, seen.external, seen.badResponses))}`);
  await artifact(page, viewport, 'sleep-habits', list);
  await context.close();
  // Без JavaScript нічого не ховається: усі чотири тексти на місці й видимі (на будь-якій ширині).
  const plain = await open(browser, origin, viewport, '/sleep.html', {contextOptions: {javaScriptEnabled: false}});
  const plainShown = await plain.page.evaluate(() => [...document.querySelectorAll('.habit-body')].map(b => getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().height > 0));
  check(where, plainShown.length === 4 && plainShown.every(v => v) && (await plain.page.locator('.habit-toggle').count()) === 0, 'without JavaScript every habit text is shown and there are no buttons');
  await plain.context.close();
}

async function homeFreshCardsFlow(browser, origin, viewport) {
  // Бриф T4 (2026-11-02): три картки різної форми в блоці «Нове на сайті». Висота блоку на телефоні до зміни: 950 px (390), бюджет брифу +150.
  const where = `home fresh cards @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  try {
    await page.locator('.home-fresh').scrollIntoViewIfNeeded();
    const info = await page.evaluate(() => {
      const box = node => { const rect = node.getBoundingClientRect(); return {x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), right: Math.round(rect.right)}; };
      const cards = [...document.querySelectorAll('.home-fresh-card')];
      const visible = node => { const rect = node.getBoundingClientRect(), style = getComputedStyle(node); return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
      const small = cards.flatMap(card => [...card.querySelectorAll('*')].filter(node => node.children.length === 0 && node.textContent.trim().length > 2 && visible(node) && parseFloat(getComputedStyle(node).fontSize) < 12).map(node => node.textContent.trim().slice(0, 24)));
      return {
        block: box(document.querySelector('.home-fresh')), cards: cards.map(box), kinds: cards.map(card => card.className.replace('home-fresh-card ', '')),
        thumb: box(cards[0].querySelector('.eua-mini')), frames: [...cards[1].querySelectorAll('.fp-svg')].map(box), captions: [...cards[1].querySelectorAll('.home-fresh-cap')].map(node => node.textContent.trim()),
        days: [...cards[2].querySelectorAll('.home-fresh-day time')].map(node => node.textContent.trim()), entries: [...cards[2].querySelectorAll('.home-fresh-day li')].map(node => ({text: node.textContent.trim(), visible: visible(node), height: Math.round(node.getBoundingClientRect().height)})),
        question: cards[0].querySelector('.home-fresh-question').textContent.trim(), links: cards.map(card => (card.tagName === 'A' ? 1 : 0) + card.querySelectorAll('a').length), small,
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    check(where, info.cards.length === 3 && new Set(info.kinds).size === 3 && info.kinds.join() === 'home-fresh-card--study,home-fresh-card--scheme,home-fresh-card--journal', `three cards with three different forms: ${info.kinds.join()}`);
    check(where, info.cards.every(card => card.height >= 44 && card.right <= viewport.width) && info.overflow <= 1, `every card is tall enough to tap and fits the screen: ${JSON.stringify(info.cards)}`);
    check(where, info.thumb.width >= 100 && info.thumb.height >= 30, `the chart thumbnail is readable: ${JSON.stringify(info.thumb)}`);
    check(where, info.frames.length === 2 && info.frames.every(frame => frame.width >= 90 && frame.height >= 36), `the two scheme frames are readable: ${JSON.stringify(info.frames)}`);
    check(where, info.captions.length === 2 && info.captions.every(text => text.length > 8), `both frames have a text caption: ${info.captions.join(' | ')}`);
    check(where, info.days.length >= 1 && info.entries.length === 3 && info.entries.every(entry => entry.visible && entry.height >= 14 && entry.text.length > 10), `three journal entries with a date heading: ${info.days.join(', ')}`);
    check(where, info.links.every(count => count === 1), `one link per card: ${info.links.join()}`);
    check(where, info.small.length === 0, `no text under 12px in the cards: ${info.small.join(' | ')}`);
    if (viewport.width >= 1100) {
      // Комп’ютер: три картки в один ряд, середня найширша, форми справді різні.
      check(where, new Set(info.cards.map(card => card.y)).size === 1 && info.cards[0].x < info.cards[1].x && info.cards[1].x < info.cards[2].x, 'on the desktop the three cards stand in one row');
      check(where, info.cards[1].width > info.cards[0].width * 1.3 && info.cards[1].width > info.cards[2].width * 1.3, `the scheme card is the wide one: ${info.cards.map(card => card.width).join(' / ')}`);
    } else {
      // Телефон: картки одна під одною, блок вищий не більш ніж на 150 px.
      check(where, new Set(info.cards.map(card => card.x)).size === 1 && info.cards[0].y < info.cards[1].y && info.cards[1].y < info.cards[2].y, 'on the phone the cards are stacked');
      if (viewport.width === 390) check(where, info.block.height <= 950 + 150, `the block grew by ${info.block.height - 950}px on the phone, the budget is 150px`);
    }
    await artifact(page, viewport, 'home-fresh-cards', page.locator('.home-fresh'));
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'no errors and no third-party requests');
  } finally {
    await context.close();
  }
}

async function homeFreshFlow(browser, origin, viewport) {
  // Рішення власника 2026-10-31: на головній є блок «Нове на сайті»; дрібний текст не менший за 12 px; терміни мають зону дотику 44 px.
  const where = `home fresh @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  await page.locator('.home-fresh').scrollIntoViewIfNeeded();
  const cards = await page.locator('.home-fresh-card').evaluateAll(els => els.map(e => ({h: Math.round(e.getBoundingClientRect().height), href: e.getAttribute('href'), right: e.getBoundingClientRect().right})));
  check(where, cards.length === 3 && cards.every(c => c.h >= 44 && c.right <= viewport.width), 'three cards fit the screen and are tall enough to tap');
  check(where, cards.map(c => c.href).join() === './research.html,./mechanisms.html,./changes.html', 'they lead to the write-ups, the schemes and the change log');
  const latest = await page.locator('.home-fresh-latest a').evaluateAll(els => els.map(e => e.getBoundingClientRect().height));
  check(where, latest.length === 3 && latest.every(h => h >= 44), 'the latest write-up links are tappable');
  const tiny = await page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    return [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim().length > 2 && vis(e) && parseFloat(getComputedStyle(e).fontSize) < 12).map(e => e.textContent.trim().slice(0, 24)); });
  check(where, tiny.length === 0, 'no visible text under 12 px on the home page' + (tiny.length ? ': ' + tiny.join(' | ') : ''));
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  const hit = await page.evaluate(() => { const b = document.querySelector('button.eua-term'); if (!b) return null; b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(), cx = r.x + r.width / 2; return document.elementFromPoint(cx, r.y - 8) === b && document.elementFromPoint(cx, r.bottom + 8) === b; });
  check(where, hit === true, 'glossary terms react to a touch 8 px above and below the text (44 px area)');
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
    // Палітра (2026-10-31): за замовчуванням сторінка космічна (фон як на головній), а сосновий вигляд лишається варіантом «Зелений».
    // Перемикаємо атрибутом так само, як це робить меню «Аа»: усе має змінитися лише завдяки CSS.
    // Деякі сторінки мають власний, трохи інший майже чорний фон (наприклад, «Харчування»): у космосі він теж майже чорний із фіолетовим відтінком.
    const cosmicBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor.match(/\d+/g).slice(0, 3).map(Number));
    check(where, cosmicBg[0] < 20 && cosmicBg[2] > cosmicBg[1] && cosmicBg[2] >= cosmicBg[0], `the default page background is not the dark purple cosmic one: ${cosmicBg}`);
    await page.evaluate(() => { document.documentElement.dataset.palette = 'green'; });
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

// Owner decision 2026-10-27 replaces only the home pine/shippo presentation.
// Its working library, evidence guide, disclosures and feedback stay covered.
async function homeLowerFlow(browser, origin, viewport) {
  const where=`home library and disclosures @${viewport.name}`;
  const {context,page,seen}=await open(browser,origin,viewport,'/index.html');
  try {
  await page.locator('.evidence-guide').waitFor({state:'attached'});
  check(where,await page.locator('#home-learning-paths, .home-library-fold').evaluateAll(nodes=>nodes.length===2&&nodes.every(node=>!node.open)),'owner-approved route and library entrances must start closed');
  // Owner 2026-10-28: scrolling should reveal distinct navigation, route and
  // library chapters, with real visible actions instead of one text column.
  const chapters=await page.locator('.home-directory-section, #home-learning-paths, .home-library-section').evaluateAll(nodes=>nodes.map(node=>{
    const style=getComputedStyle(node),rect=node.getBoundingClientRect();
    const summary=node.querySelector(':scope > summary, :scope > .home-library-fold > summary'),headingStyle=summary?getComputedStyle(summary):null;
    // A native details chapter puts its top inset on its own summary.
    const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+(headingStyle?parseFloat(headingStyle.paddingTop)+parseFloat(headingStyle.paddingBottom):0);
    return {top:rect.top+scrollY,left:rect.left,right:rect.right,padding,background:style.backgroundColor,image:style.backgroundImage,border:parseFloat(style.borderTopWidth)};
  }));
  const background=await page.locator('body').evaluate(node=>getComputedStyle(node).backgroundColor);
  // The selected lens is intentionally borderless: its loaded graphic supplies
  // the visual chapter. Native route/library entrances retain bounded surfaces.
  await page.locator('[data-lens-stage]').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-lens-stage] img')].length===3&&[...document.querySelectorAll('[data-lens-stage] img')].every(img=>img.complete&&img.naturalWidth>0));
  check(where,await page.locator('[data-lens-stage]').evaluate(node=>{const box=node.getBoundingClientRect();return box.width>0&&box.height>=200&&getComputedStyle(node).visibility==='visible';}),'the direction chapter must contain its loaded, visible lens graphic');
  check(where,chapters.length===3&&chapters.slice(1).every(chapter=>chapter.padding>=24&&chapter.border>=1&&(chapter.image!=='none'||(chapter.background!==background&&chapter.background!=='rgba(0, 0, 0, 0)'))),'route and library entrances need readable, visibly bounded surfaces');
  check(where,chapters.length===3&&chapters[0].top<chapters[1].top&&chapters[1].top<chapters[2].top,'the page must progress from choosing a direction to routes and the library');
  check(where,(await page.locator('#start-here-title').innerText())==='Обери напрям','the directory heading must explicitly identify the choice');
  // This flow measures the final chooser layout; dedicated wheel flows above
  // already cover the intermediate reveal. Native focus fully reveals it.
  // Record the pre-focus state too, so per-card stagger offsets are reviewable.
  if(process.env.QA_ARTIFACT_DIR) {
    const dir=path.resolve(process.env.QA_ARTIFACT_DIR);fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,`home-lens-lower-before-focus-${viewport.name}.json`),JSON.stringify(await lensSnapshot(page),null,2));
  }
  await openLensPicker(page);
  await waitForLensLinksSettled(page,viewport,'lower-focus');
  const topicBoxes=await page.locator('#cards>.topic-card').evaluateAll(nodes=>nodes.map(node=>{
    const rect=node.getBoundingClientRect();
    const contentFits=[...node.querySelectorAll('strong,.topic-state,.topic-open')].every(part=>{
      const range=document.createRange();range.selectNodeContents(part);
      return [...range.getClientRects()].every(line=>line.left>=rect.left-1&&line.right<=rect.right+1);
    });
    return {x:rect.x,y:rect.y,right:rect.right,width:rect.width,height:rect.height,contentFits,titleFont:parseFloat(getComputedStyle(node.querySelector('strong')).fontSize),action:node.querySelector('.topic-open')?.textContent.trim()};
  }));
  check(where,topicBoxes.length===6&&topicBoxes.every(box=>box.x>=0&&box.right<=viewport.width+1&&box.width>=44&&box.height>=44&&box.titleFont>=18&&box.contentFits&&box.action?.includes('Відкрити')),'all six directions and their text must fit as readable, tappable links with an explicit opening cue');
  if(viewport.width<=700)check(where,topicBoxes.every(box=>Math.abs(box.x-topicBoxes[0].x)<2)&&new Set(topicBoxes.map(box=>Math.round(box.y))).size===6,'the mobile chooser has one readable column inside its scrollable sheet');
  await page.locator('[data-lens-picker-close]').click();
  const examples=page.locator('.home-examples');
  check(where,!(await examples.evaluate(node=>node.open))&&await examples.locator('a:visible').count()===0,'the repeated introductory examples should start folded');
  await examples.locator('summary').click();
  check(where,await examples.locator('a:visible').count()===3,'all three existing example destinations must remain available');
  await examples.locator('summary').click();
  await toggleHomeFold(page,'#home-learning-paths',true);
  const starts=page.locator('#home-learning-paths .path-card>.path-start');
  check(where,await starts.count()===3&&await starts.evaluateAll(nodes=>nodes.every(node=>{const rect=node.getBoundingClientRect();return rect.width>=44&&rect.height>=44;})),'all three route starts must remain visible without opening lesson outlines');
  check(where,await page.locator('.home-path-outline[open]').count()===0,'full lesson outlines must start folded to keep the route previews compact');
  const outline=page.locator('.home-path-outline').first(),outlineSummary=outline.locator('summary');
  await outlineSummary.focus();await page.keyboard.press('Enter');
  check(where,await outline.evaluate(node=>node.open)&&await visibleAfterDisclosureTransition(outline.locator('ol')),'the complete route outline must open with the keyboard');
  await outlineSummary.press('Enter');
  check(where,!(await outline.evaluate(node=>node.open)),'route outlines must close without hiding the route start');
  await toggleHomeFold(page,'.home-library-fold',true);
  const cta=page.locator('.supplement-entry .se-cta');
  check(where,await cta.evaluate(node=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node);return rect.height>=44&&style.backgroundColor!=='rgba(0, 0, 0, 0)';}),'the library catalog action must be a clearly filled, tappable control');
  check(where,!(await page.locator('.supplement-feature-link').isVisible()),'the library wrapper must not revive the retired duplicate creatine action');
  if(process.env.QA_ARTIFACT_DIR){
    await artifact(page,viewport,'home-directions-section',page.locator('.home-directory-section'));
    await artifact(page,viewport,'home-routes-section',page.locator('#home-learning-paths'));
    await artifact(page,viewport,'home-library-section',page.locator('.home-library-section'));
    await page.screenshot({path:path.join(path.resolve(process.env.QA_ARTIFACT_DIR),`home-full-${viewport.name}.png`),fullPage:true});
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
  const feedbackSeen=await observePage(feedbackPage,origin);
  await feedbackPage.goto(page.url().split('#')[0]+'#home-feedback',{waitUntil:'load'});
  check(where,await feedbackPage.evaluate(()=>document.getElementById('home-about').open&&document.getElementById('home-feedback').open),'#home-feedback must open «Про сайт» and the feedback form');
  await feedbackPage.locator('#feedback-useful').fill('Зрозумілий перехід від запитання до джерел.');
  await feedbackPage.locator('#feedback-generate').click();
  check(where,await feedbackPage.locator('#home-feedback-output').isVisible()&&(await feedbackPage.locator('#home-feedback-text').inputValue()).includes('Зрозумілий перехід від запитання до джерел.'),'the preserved feedback form must generate the actual local report');
  check(where,(await feedbackPage.locator('#home-feedback-status').innerText()).includes('не надісланий'),'feedback generation must retain its explicit local-only status');
  checkBrowserHealth(`${where} feedback`,feedbackSeen);
  await feedbackPage.close();
  // Reduced motion now has an actual pixel/static-frame native-scroll
  // regression in homeWaveFlow, replacing the removed shippo animation.
  checkBrowserHealth(where,seen);
  } finally { await context.close(); }
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
  // The historical home has the old hero DOM. Capture its real first screen
  // without asserting the new Spectrum markup or any corrected behavior.
  await page.goto(origin + '/index.html', {waitUntil: 'load'});
  await page.locator('#top').waitFor({state: 'visible'});
  await page.evaluate(() => document.fonts.ready);
  await artifact(page, viewport, 'home-first-screen', page.locator('body'), {scroll: false});
  await context.close();
}

async function homeRowsFlow(browser, origin, viewport) {
  // Рішення власника 2026-11-02 (бриф T6): згорнуті рядки головної показують під назвою, що всередині (.home-row-hint).
  // У справжньому браузері перевіряємо: підказка видима, не менша за 12 px і контрастна; рядок не стає абзацом (до 3 рядків підказки),
  // не виходить за ширину; Enter і Пробіл відкривають та закривають рядок; рядок відгуку без застарілої округлої рамки (home-lower.css).
  const where = `home rows preview @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  try {
    await page.locator('#home-about').waitFor({state: 'attached'});
    // Рядки всередині закритих блоків не мають розмірів: спершу відкриваємо зовнішні, з клавіатури (так перевіряється й сам рядок «Про сайт»).
    const about = page.locator('#home-about');
    await about.locator(':scope > summary').scrollIntoViewIfNeeded();
    await about.locator(':scope > summary').focus();
    await page.keyboard.press('Enter');
    check(where, await about.evaluate(node => node.open), 'Enter opens the «Про сайт» row');
    await page.keyboard.press('Space');
    check(where, !(await about.evaluate(node => node.open)), 'Space closes the «Про сайт» row');
    await page.keyboard.press('Space');
    check(where, await about.evaluate(node => node.open), 'Space opens the «Про сайт» row again');
    await toggleHomeFold(page, '#home-learning-paths', true);
    await page.waitForTimeout(450);
    const rows = await page.evaluate(() => {
      const channel = value => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const luminance = rgb => { const [r, g, b] = rgb.match(/[\d.]+/g).map(Number); return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); };
      const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
      const pageBackground = getComputedStyle(document.body).backgroundColor;
      const panel = getComputedStyle(document.querySelector('#home-about')).backgroundColor;
      return [...document.querySelectorAll('body > .page details')].filter(d => d.querySelector(':scope > summary .home-row-hint')).map(d => {
        const summary = d.querySelector(':scope > summary'), hint = summary.querySelector('.home-row-hint'), title = summary.querySelector('.home-row-title');
        const box = summary.getBoundingClientRect(), hintBox = hint.getBoundingClientRect(), style = getComputedStyle(hint), own = getComputedStyle(d);
        return {
          name: d.id || 'outline', height: Math.round(box.height), right: Math.round(box.right),
          hintLines: Math.round(hintBox.height / parseFloat(style.lineHeight)), hintFont: parseFloat(style.fontSize),
          hintVisible: hintBox.width > 0 && hintBox.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
          hintOverflow: hint.scrollWidth - hint.clientWidth, titleAbove: title.getBoundingClientRect().bottom <= hintBox.top + 1,
          contrast: Math.min(ratio(style.color, pageBackground), ratio(style.color, panel.startsWith('rgba(0, 0, 0, 0)') ? pageBackground : panel)),
          borderLeft: own.borderLeftWidth, radius: own.borderTopLeftRadius
        };
      });
    });
    check(where, rows.length === 6, `six rows carry a preview, found ${rows.length}`);
    for (const row of rows) {
      const name = `${row.name} (${row.height}px)`;
      check(where, row.hintVisible && row.titleAbove, `${name}: the preview is visible under the title`);
      check(where, row.hintFont >= 12, `${name}: the preview is ${row.hintFont}px, under 12px`);
      check(where, row.hintLines <= 3, `${name}: the preview takes ${row.hintLines} lines, it must stay a short line`);
      check(where, row.height <= 100, `${name}: the folded row is ${row.height}px tall, over 100px`);
      check(where, row.right <= viewport.width && row.hintOverflow <= 0, `${name}: the row must fit the screen width`);
      check(where, row.contrast >= 4.5, `${name}: preview contrast ${row.contrast.toFixed(2)}:1 is below 4.5:1`);
    }
    // Рядок відгуку такий самий, як сусідні: без округлої рамки зі старого home-lower.css (текст упирався в рамку).
    const feedback = rows.find(row => row.name === 'home-feedback');
    check(where, feedback && feedback.borderLeft === '0px' && feedback.radius === '0px', `the feedback row must be flat like its neighbours: ${JSON.stringify(feedback && {border: feedback.borderLeft, radius: feedback.radius})}`);
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'the home must not scroll sideways');
    await artifact(page, viewport, 'home-rows-preview', page.locator('#home-about'));
    // Той самий рядок відкривається з клавіатури, і вміст стає видимим: Enter відкриває, Пробіл закриває.
    for (const [selector, inner, least] of [['#home-overview', '.home-overview-grid article', 3], ['#home-feedback', '#feedback-useful', 1], ['#home-learning-paths .home-path-outline', 'ol a', 3]]) {
      const row = page.locator(selector).first(), summary = row.locator(':scope > summary');
      await summary.scrollIntoViewIfNeeded();
      await summary.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(450);
      check(where, await row.evaluate(node => node.open) && await row.locator(inner + ':visible').count() >= least, `${selector}: Enter opens the row and its content becomes visible`);
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
      check(where, !(await row.evaluate(node => node.open)), `${selector}: Space closes the row again`);
    }
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'no errors and no third-party requests');
  } finally {
    await context.close();
  }
}

async function homeLinkTextFlow(browser, origin, viewport) {
  // Рішення власника 2026-11-02 (бриф T5): підписи кнопок-посилань називають, куди вони ведуть, і не повторюються.
  // Дивимось на справжній видимий текст у браузері: верхні питання, кнопка маршруту, маршрути, блок «Нове» і (після відкриття) меню напрямів.
  const where = `home link text @${viewport.name}`;
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  try {
    await page.locator('.spectrum-question-open').first().waitFor({state: 'visible'});
    await toggleHomeFold(page, '#home-learning-paths', true);
    await page.waitForTimeout(450);
    const read = () => page.evaluate(() => {
      const visible = node => { const box = node.getBoundingClientRect(), style = getComputedStyle(node); return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
      const label = node => { const copy = node.cloneNode(true); copy.querySelectorAll('[aria-hidden="true"]').forEach(inner => inner.remove()); return copy.textContent.replace(/\s+/g, ' ').replace(/[\s→↗]+$/u, '').trim(); };
      return [...document.querySelectorAll('.spectrum-question-open, .spectrum-route-start, .path-start, .home-fresh-go, .topic-open, .se-cta')].filter(visible).map(node => {
        const link = node.closest('a'), box = (link || node).getBoundingClientRect();
        return {kind: node.className.split(' ')[0], label: label(node), href: link && link.getAttribute('href'), right: Math.round(box.right), height: Math.round(box.height), selfHidden: node.getAttribute('aria-hidden') === 'true', hiddenArrows: [...node.querySelectorAll('[aria-hidden="true"]')].map(inner => inner.textContent.trim())};
      });
    });
    const generic = /^(відкрити|читати|дивитись|дивитися|докладніше|детальніше|перейти|більше|далі|почати|почати маршрут|розібрати)$/iu;
    const verify = (labels, expected, stage) => {
      for (const [kind, count] of Object.entries(expected)) check(where, labels.filter(item => item.kind === kind).length === count, `${stage}: ${count} visible «${kind}» labels expected, found ${labels.filter(item => item.kind === kind).length}`);
      for (const item of labels) {
        check(where, !generic.test(item.label) && item.label.split(' ').length >= 2, `${stage}: «${item.label}» is a bare generic label`);
        check(where, item.right <= viewport.width && item.height >= 24, `${stage}: «${item.label}» must fit the screen width (right edge ${item.right})`);
        if (!item.selfHidden) check(where, item.hiddenArrows.every(arrow => /^[→↗]$/u.test(arrow)) && !/[→↗]/u.test(item.label), `${stage}: the arrow of «${item.label}» must sit in an aria-hidden span`);
      }
      const byLabel = new Map();
      for (const item of labels) byLabel.set(item.label, (byLabel.get(item.label) || new Set()).add(item.href));
      for (const [text, hrefs] of byLabel) check(where, hrefs.size === 1, `${stage}: «${text}» names more than one destination`);
      for (const kind of Object.keys(expected)) { const set = labels.filter(item => item.kind === kind).map(item => item.label); check(where, new Set(set).size === set.length, `${stage}: the «${kind}» labels must differ from each other: ${set.join(' | ')}`); }
    };
    const home = await read();
    verify(home, {'spectrum-question-open': 3, 'spectrum-route-start': 1, 'path-start': 3, 'home-fresh-go': 3}, 'home');
    check(where, home.filter(item => item.kind === 'path-start' || item.kind === 'spectrum-route-start').every(item => item.height >= 44), 'route start buttons must stay tappable (44px)');
    const routeLabels = home.filter(item => item.kind === 'path-start' || item.kind === 'spectrum-route-start').map(item => item.label);
    check(where, routeLabels.every(text => /^Почати маршрут: .{4,}/u.test(text)), `route buttons must name the first step: ${routeLabels.join(' | ')}`);
    check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'the home must not scroll sideways');
    await artifact(page, viewport, 'home-link-text-hero', page.locator('.spectrum-questions'));
    await artifact(page, viewport, 'home-link-text-routes', page.locator('#home-learning-paths .start-paths'));
    await openLensPicker(page);
    const picker = await read();
    verify(picker.filter(item => item.kind === 'topic-open'), {'topic-open': 6}, 'picker');
    check(where, picker.filter(item => item.kind === 'topic-open').every(item => /^Відкрити «.+»$/u.test(item.label)), 'every direction card must name its direction');
    await artifact(page, viewport, 'home-link-text-picker', page.locator('[data-lens-picker]'));
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'no errors and no third-party requests');
  } finally {
    await context.close();
  }
}

// T7 (2026-11-02, рішення D3): поле пошуку в героєві головної. Підказка «Знайти розбір або перевірити твердження», кнопка зі словом «Знайти», жодних ознак чату.
// До 560 px довга підказка не вміщається в один рядок, тому йде у два рядки всередині поля (мітка поля лягає на поле), а рядок поля лишається 52 px: композиція героя не зсувається.
async function heroSearchFlow(browser, origin, viewport) {
  const where = `hero search @${viewport.name}`;
  const hint = 'Знайти розбір або перевірити твердження';
  const emptyText = 'Нічого не знайшли. Спробуйте інше слово або відкрийте всі напрями.';
  const overlay = viewport.width <= 700, iconHidden = viewport.width <= 560; // до 700 px підказка лежить на полі у два рядки, до 560 px лупа прихована
  const {context, page, seen} = await open(browser, origin, viewport, '/index.html');
  const ready = async () => {
    await page.locator('#spectrum-query').waitFor({state: 'visible'});
    await page.waitForFunction(() => document.querySelector('.eua-site-header .eua-header-search') && document.getElementById('spectrum-search'));
    await page.waitForTimeout(300);
  };
  try {
    await ready();
    const read = () => page.evaluate(() => {
      const form = document.getElementById('spectrum-search'), input = document.getElementById('spectrum-query'), label = form.querySelector('.spectrum-search-label'), button = form.querySelector('.spectrum-search-submit'), icon = form.querySelector(':scope > svg');
      const rect = node => { const box = node.getBoundingClientRect(); return {x: box.x, y: box.y, w: box.width, h: box.height, r: box.right, b: box.bottom}; };
      const shown = node => { if (!node) return false; const style = getComputedStyle(node), box = node.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1; };
      const range = document.createRange(); range.selectNodeContents(label);
      const lines = [...range.getClientRects()], inputBox = input.getBoundingClientRect();
      const ctx = document.createElement('canvas').getContext('2d'); ctx.font = getComputedStyle(input).font;
      return {placeholder: input.placeholder, labelText: label.textContent.trim(), labelFor: label.htmlFor, enter: input.getAttribute('enterkeyhint'), type: input.type,
        form: rect(form), input: rect(input), button: rect(button), buttonText: button.textContent.trim(), buttonAria: button.getAttribute('aria-label'), buttonType: button.type,
        labelShown: shown(label), iconShown: shown(icon), placeholderColor: getComputedStyle(input, '::placeholder').color,
        labelLineCount: new Set(lines.map(box => Math.round(box.top))).size,
        labelInside: lines.length > 0 && lines.every(box => box.left >= inputBox.left - 1 && box.right <= inputBox.right + 1 && box.top >= inputBox.top - 1 && box.bottom <= inputBox.bottom + 1),
        textWidth: ctx.measureText(input.placeholder).width, overflow: document.documentElement.scrollWidth - innerWidth};
    });
    const info = await read();
    check(where, info.placeholder === hint && info.labelText === hint && info.labelFor === 'spectrum-query', `the field shows the approved hint and its label says the same: ${info.placeholder} / ${info.labelText}`);
    check(where, info.buttonText === 'Знайти' && info.buttonAria === null && info.buttonType === 'submit', `the button names the action with a word: ${info.buttonText}`);
    check(where, info.button.w >= 44 && info.button.h >= 44 && info.button.x >= 0 && info.button.r <= viewport.width + 1, `the button is a 44px target inside the window: ${Math.round(info.button.w)}x${Math.round(info.button.h)}`);
    check(where, info.type === 'search' && info.enter === 'search', 'a phone keyboard offers a search key');
    check(where, info.form.h >= 51 && info.form.h <= 53 && Math.round(info.input.h) === 48, `the row of the field keeps its height (52px), so the hero does not move: ${info.form.h}`);
    check(where, info.overflow <= 1 && info.input.x >= 0 && info.input.r <= viewport.width + 1, 'nothing sticks out sideways');
    check(where, info.iconShown === !iconHidden, `the magnifier is ${iconHidden ? 'hidden on a phone' : 'shown'}`);
    if (overlay) {
      check(where, info.labelShown, 'the hint label lies over the field');
      check(where, /^rgba\(0, 0, 0, 0\)$|transparent/.test(info.placeholderColor), `the real placeholder is transparent here (the label shows instead): ${info.placeholderColor}`);
      check(where, info.labelLineCount >= 1 && info.labelLineCount <= 2 && info.labelInside, `the whole hint fits in the field in at most two lines: ${info.labelLineCount} lines, inside=${info.labelInside}`);
    } else {
      check(where, !info.labelShown, 'on a wide screen the label is hidden for the eye');
      check(where, !/rgba\(0, 0, 0, 0\)|transparent/.test(info.placeholderColor) && info.textWidth <= info.input.w, `the hint fits in one line and is visible: needs ${Math.round(info.textWidth)}px of ${Math.round(info.input.w)}px`);
    }
    await artifact(page, viewport, 'hero-search-field', page.locator('.spectrum-intro'));
    if (overlay) {
      // Щойно в полі є текст, мітка-підказка зникає й нічого не лишається поверх тексту; порожнє поле повертає її.
      await page.locator('#spectrum-query').fill('к');
      check(where, !(await read()).labelShown, 'text in the field hides the hint label');
      await page.locator('#spectrum-query').fill('');
      check(where, (await read()).labelShown, 'an empty field shows the hint label again');
    }
    // Розбір знаходиться за словом із питання, показується окремою групою «Розбори» без відповіді; клік відкриває його картку.
    const dialog = page.locator('dialog.eua-search');
    await page.locator('#spectrum-query').fill('підсолоджувачі');
    await page.locator('#spectrum-query').press('Enter');
    await dialog.waitFor({state: 'visible'});
    const link = dialog.locator('.eua-search-results a[href="./research.html#rs-sweeteners"]');
    await link.waitFor({state: 'visible'});
    check(where, await dialog.locator('#eua-search-q').getAttribute('placeholder') === hint, 'the dialog field shows the same hint');
    check(where, (await dialog.locator('.eua-search-results h2').allInnerTexts()).includes('Розбори'), 'write-ups are a group of their own');
    check(where, await link.evaluate(node => node.children.length === 2 && /підсолоджувач/i.test(node.querySelector('strong').textContent)), 'a write-up result shows only its question and the page, no answer');
    await artifact(page, viewport, 'hero-search-results', dialog);
    await link.click();
    await page.waitForURL('**/research.html#rs-sweeteners');
    const card = page.locator('#rs-sweeteners');
    await card.waitFor({state: 'visible'});
    check(where, await card.evaluate(node => node.open && node.getBoundingClientRect().top >= -1 && node.getBoundingClientRect().top < innerHeight), 'the card of the write-up is open and in view');
    // Безглуздий запит: затверджений текст, посилання на всі напрями, у списку нічого.
    await page.goto(origin + '/index.html');
    await ready();
    await page.locator('#spectrum-query').fill('детокс виводить токсини');
    await page.locator('#spectrum-query').press('Enter');
    await dialog.waitFor({state: 'visible'});
    const status = dialog.locator('.eua-search-status');
    await page.waitForFunction(() => /Нічого не знайшли/.test(document.querySelector('.eua-search-status')?.textContent || ''));
    check(where, (await status.innerText()).replace(/\s+/g, ' ').trim() === emptyText, `an unsupported claim gives the approved text: ${await status.innerText()}`);
    check(where, await status.locator('a').evaluate(node => node.getAttribute('href') === './directions.html' && node.textContent === 'всі напрями' && getComputedStyle(node).textDecorationLine.includes('underline')), 'the words «всі напрями» are an underlined link to the directory');
    check(where, await dialog.locator('.eua-search-results li').count() === 0, 'nothing is listed for an unsupported claim');
    await artifact(page, viewport, 'hero-search-empty', dialog);
    // Те, що написав відвідувач, ніколи не стає розміткою.
    await dialog.locator('#eua-search-q').fill('<img src=x onerror=window.__pwned=1>');
    await page.waitForTimeout(150);
    check(where, await page.evaluate(() => window.__pwned === undefined && !document.querySelector('dialog.eua-search img')), 'a query with markup stays plain text');
    // «Кофеїн перед сном» знаходить матеріал про кофеїн.
    await dialog.locator('#eua-search-q').fill('кофеїн перед сном');
    await dialog.locator('.eua-search-results a').first().waitFor({state: 'visible'});
    check(where, /^Кофеїн/.test(await dialog.locator('.eua-search-results a strong').first().innerText()), 'the caffeine material comes first for «кофеїн перед сном»');
    check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, `no errors and no third-party requests: ${[...seen.pageErrors, ...seen.console, ...seen.external].join(' | ')}`);
  } finally {
    await context.close();
  }
}

// «Довіра 1» (2026-11-03): сторінка «Про проєкт». Коротка (не більше ~4,4 екрана телефона), шість розділів із якорями, шапка веде на неї з будь-якої сторінки (на телефоні через меню),
// пошук знаходить і сторінку, і розділи, посилання на якорі відкривають потрібний розділ угорі. Тексти сторінки прив’язані до коду тестом tests/about-page.test.mjs.
async function aboutFlow(browser, origin, viewport) {
  const where = `about @${viewport.name}`;
  const phone = viewport.width < 600;
  let {context, page, seen} = await open(browser, origin, viewport, '/about.html');
  await page.waitForSelector('.eua-site-header');
  check(where, (await page.title()) === 'Про проєкт — Evidence UA', 'the page has its own title');
  check(where, (await page.locator('h1:visible').allInnerTexts()).join('|') === 'Про проєкт', 'one visible heading «Про проєкт»');
  const ids = await page.locator('main h2').evaluateAll(nodes => nodes.map(node => node.id));
  check(where, ids.join() === 'ab-what,ab-not,ab-method,ab-review,ab-fix,ab-privacy', `six sections with anchors (${ids.join()})`);
  check(where, (await page.locator('.eua-header-about').getAttribute('aria-current')) === 'page', 'the header link marks the current page');
  const facts = await page.evaluate(() => {
    const flow = [...document.querySelectorAll('main p, main li')];
    return {
      height: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth,
      minFont: Math.min(...flow.map(node => parseFloat(getComputedStyle(node).fontSize))), widest: Math.max(...flow.map(node => node.getBoundingClientRect().width)),
      emptyLinks: [...document.querySelectorAll('main a')].filter(link => !link.textContent.trim()).length,
      closing: (() => { const link = document.querySelector('.ab-links a'); const box = link && link.getBoundingClientRect(); return box ? {h: box.height, w: box.width} : null; })()
    };
  });
  check(where, facts.overflow <= 1, `no horizontal overflow (${facts.overflow}px)`);
  check(where, facts.minFont >= 16, `body text is at least 16px (${facts.minFont})`);
  check(where, facts.widest <= 780, `lines stay readable, not wider than 780px (${Math.round(facts.widest)})`);
  check(where, facts.emptyLinks === 0, 'every link has a visible name');
  check(where, facts.closing && facts.closing.h >= 44, `the closing link is a 44px target (${facts.closing && Math.round(facts.closing.h)})`);
  if (phone) check(where, facts.height / viewport.height <= 4.4, `the page is short on a phone: ${(facts.height / viewport.height).toFixed(2)} screens (limit 4.4)`);
  else check(where, facts.height / viewport.height <= 3.2, `the page is short on a desktop: ${(facts.height / viewport.height).toFixed(2)} screens (limit 3.2)`);
  await artifact(page, viewport, 'about-top', page.locator('.pb'), {scroll: false});
  // Якорі: кожен розділ відкривається на екрані (на коротких кінцях сторінки допускаємо, що розділ не дійшов до верху, бо далі прокручувати нічого).
  for (const id of ids) {
    await page.goto(`${origin}/about.html#${id}`, {waitUntil: 'load'});
    await page.waitForTimeout(1300);
    const at = await page.evaluate(sectionId => {
      const top = document.getElementById(sectionId).getBoundingClientRect().top, atEnd = scrollY >= document.documentElement.scrollHeight - innerHeight - 2;
      return {top: Math.round(top), ok: top >= -2 && (top <= innerHeight * 0.62 || (atEnd && top < innerHeight * 0.9))};
    }, id);
    check(where, at.ok, `#${id} lands in view (top ${at.top}px)`);
  }
  // Найскладніше посилання сторінки: «Як читати докази» веде на головну, де розділ створює скрипт уже в браузері (у готовому HTML його немає), тож відкриваємо його по-справжньому.
  await page.goto(`${origin}/about.html`, {waitUntil: 'load'});
  await page.locator('main a[href^="./index.html?path=evidence"]').click();
  await page.waitForURL('**/index.html?path=evidence*');
  const guideShown = await page.waitForFunction(() => { const heading = document.getElementById('evidence-guide-title'); if (!heading) return false; const box = heading.getBoundingClientRect(); return box.width > 0 && box.height > 0; }, null, {timeout: 8000}).then(() => true, () => false);
  check(where, guideShown, 'the link «Як читати докази» opens its heading on the home page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0 && seen.badResponses.length === 0, `the page raises no errors, no failed or third-party requests (${[...seen.console, ...seen.pageErrors, ...seen.external, ...seen.badResponses].join(' | ')})`);
  await context.close();

  // Шапка з головної веде на сторінку (на телефоні через меню).
  ({context, page, seen} = await open(browser, origin, viewport, '/index.html'));
  await page.waitForSelector('.eua-site-header .eua-header-about', {state: 'attached'});
  const toggle = page.locator('.eua-header-toggle');
  if (await toggle.isVisible()) await toggle.click();
  const link = page.locator('.eua-site-header .eua-header-about');
  await link.waitFor({state: 'visible'});
  const box = await link.boundingBox();
  check(where, box && box.height >= 44 && box.x >= 0 && box.x + box.width <= viewport.width + 1, `the header link is a 44px target inside the viewport (${box && Math.round(box.height)})`);
  check(where, (await link.getAttribute('href')) === './about.html' && /^Про проєкт/.test((await link.innerText()).trim()), 'the header link is a real link to the About page');
  await link.click();
  await page.waitForURL('**/about.html');
  await page.locator('h1').waitFor({state: 'visible'});
  check(where, (await page.locator('h1').innerText()).trim() === 'Про проєкт', 'the header link from the home opens the About page');
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0, 'the transition raises no errors');
  await context.close();

  // Пошук: сторінка й розділи.
  ({context, page, seen} = await open(browser, origin, viewport, '/sleep.html'));
  await page.locator('.eua-header-search').click();
  await page.locator('dialog.eua-search').waitFor({state: 'visible'});
  await page.fill('#eua-search-q', 'приватність');
  await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
  check(where, await page.locator('.eua-search-results a[href="./about.html"]').count() === 1, '«приватність» finds the About page');
  const section = page.locator('.eua-search-results a[href="./about.html#ab-privacy"]');
  check(where, await section.count() === 1, '«приватність» finds the privacy section');
  check(where, /Розділ · Про проєкт/.test(await section.innerText()), 'the section result names the page it belongs to');
  await artifact(page, viewport, 'about-search', page.locator('dialog.eua-search'));
  await section.click();
  await page.waitForURL('**/about.html#ab-privacy');
  await page.waitForTimeout(1500);
  const where2 = await page.evaluate(() => { const top = document.getElementById('ab-privacy').getBoundingClientRect().top; return {top: Math.round(top), ok: top >= -2 && top < innerHeight * 0.9}; });
  check(where, where2.ok, `the section found by search is on screen (top ${where2.top}px)`);
  for (const query of ['рецензент', 'застереження', 'помилки']) {
    await page.locator('.eua-header-search').click();
    await page.locator('dialog.eua-search').waitFor({state: 'visible'});
    await page.fill('#eua-search-q', '');
    await page.fill('#eua-search-q', query);
    await page.locator('.eua-search-results a').first().waitFor({state: 'visible'});
    check(where, await page.locator('.eua-search-results a[href^="./about.html"]').count() >= 1, `«${query}» finds the About page or its sections`);
    // Закриваємо кнопкою: перший Escape у полі пошуку очищає запит (див. searchFlow).
    await page.locator('dialog.eua-search .eua-search-close').click();
    await page.locator('dialog.eua-search').waitFor({state: 'hidden'});
  }
  check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'search for the About page raises no errors or third-party requests');
  await context.close();
}

// Те саме застереження в іншому вигляді (світла тема, «Зелений», великий текст): власних кольорів воно не має й бере їх від сторінки, тому контраст міряємо піксельно в кожному вигляді.
async function noticeThemeFlow(browser, origin, viewport) {
  const looks = [['light', {theme: 'light', text: 'md'}], ['green', {theme: 'dark', text: 'md', palette: 'green'}], ['light-green', {theme: 'light', text: 'md', palette: 'green'}], ['large-text', {theme: 'dark', text: 'xl'}]];
  for (const [label, appearance] of looks) {
    for (const file of ['index.html', 'about.html', 'sleep.html', 'supplements.html']) {
      const where = `notice ${label} ${file} @${viewport.name}`;
      const {context, page, seen} = await open(browser, origin, viewport, '/' + file, {initScript: `localStorage.setItem('eua-appearance-v1', ${JSON.stringify(JSON.stringify(appearance))})`});
      await page.waitForSelector('.eua-site-header');
      await checkNotice(page, where);
      check(where, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 1, 'no horizontal overflow');
      check(where, seen.pageErrors.length === 0 && seen.console.length === 0 && seen.external.length === 0, 'no errors or third-party requests');
      await artifact(page, viewport, `notice-${label}-${file.replace('.html', '')}`, page.locator('.eua-site-notice'));
      await context.close();
    }
  }
}

async function homeFlows(browser, origin) {
  for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 844}]) await isolatedFlow(homeLensFlow, browser, origin, viewport);
  for (const viewport of [
    {name:'mobile-short',width:390,height:667},
    {name:'landscape-short',width:844,height:390},
    {name:'mobile-large-text',width:390,height:844,largeText:true}
  ]) await isolatedFlow(homeLensViewportFlow,browser,origin,viewport);
  await isolatedFlow(homeLensTouchFlow, browser, origin, viewports[0]);
  for (const viewport of viewports) await isolatedFlow(homeSpectrumFlow, browser, origin, viewport);
  // The extra narrow phone is home-only; all other pages retain the normal
  // two-viewport matrix instead of silently tripling the entire suite.
  await isolatedFlow(homeSpectrumFlow, browser, origin, {name: 'mobile-narrow', width: 360, height: 844});
  for (const viewport of viewports) await isolatedFlow(homeNoScriptFlow, browser, origin, viewport);
  // T6 (2026-11-02): рядки з підказками; вузький телефон 360 включено, бо там підказки переносяться найбільше.
  for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 844}]) await isolatedFlow(homeRowsFlow, browser, origin, viewport);
  // T5 (2026-11-02): підписи кнопок-посилань; 360 включено, бо довгі підписи там переносяться.
  for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 844}]) await isolatedFlow(homeLinkTextFlow, browser, origin, viewport);
  // T7 (2026-11-02): поле пошуку в героєві; 360 і 320 px (підказка у два рядки, найвужчі телефони) і 600 px (підказка в один рядок, найвужчий «широкий» вигляд).
  for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}, {name: 'mobile-tiny', width: 320, height: 640}, {name: 'tablet-small', width: 600, height: 900}, {name: 'tablet', width: 720, height: 900}]) await isolatedFlow(heroSearchFlow, browser, origin, viewport);
  for (const viewport of viewports) await isolatedFlow(homeWaveFlow, browser, origin, viewport);
  await isolatedFlow(homeWaveFlow, browser, origin, viewports[0], {touch: true});
  for (const viewport of viewports) await isolatedFlow(homeWaveFlow, browser, origin, viewport, {reduced: true, touch: viewport.name === 'mobile'});
}

const homeOnly = process.env.QA_HOME_ONLY === '1';
const sectionsOnly = process.env.QA_SECTIONS_ONLY === '1';
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
  } else if (sectionsOnly) {
    for (const viewport of viewports) await isolatedFlow(sectionsFlow, browser, origin, viewport);
  } else if (homeOnly) {
    await homeFlows(browser, origin);
    for (const viewport of viewports) await isolatedFlow(homeLowerFlow, browser, origin, viewport);
    await isolatedFlow(homeLowerFlow, browser, origin, {name: 'mobile-narrow', width: 360, height: 844});
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
    for (const viewport of viewports) await isolatedFlow(paletteFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(shapesFlow, browser, origin, viewport);
    await isolatedFlow(shareCardsFlow, browser, origin, viewports[0]);
    for (const viewport of viewports) await isolatedFlow(dietCarouselFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(dietStoryFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(artPairsFlow, browser, origin, viewport);
    // Картка клітини в каталозі (2026-11-03): справжня головна картина замість тьмяної піктограми; 360 включено, бо на вузькому телефоні плитка найменша.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}]) await isolatedFlow(catalogCellPictureFlow, browser, origin, viewport);
    // Картки Харчування, Добавок, Руху й Сну в каталозі (2026-11-03): картини напрямів замість тьмяних піктограм, обидві палітри, три розміри екрана.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}]) await isolatedFlow(catalogThumbsFlow, browser, origin, viewport);
    // Сторінка «Клітина людини»: на телефоні картина першою (390 × 664 як Safari, 390 × 844, 360, планшет 700), від 801 px нічого не змінилося (801 і 1440).
    for (const viewport of [...viewports, {name: 'phone-safari', width: 390, height: 664}, {name: 'mobile-narrow', width: 360, height: 780}, {name: 'tablet-portrait', width: 700, height: 900}, {name: 'tablet-801', width: 801, height: 900}]) await isolatedFlow(cellPictureFirstFlow, browser, origin, viewport);
    // Розбори добавок на головній (2026-11-04): усі одинадцять на 390 і 1440; на 360 і 1024 (там іще видно кнопку меню) Креатин і Протеїн.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780, fullArticles: false}, {name: 'tablet-1024', width: 1024, height: 800, fullArticles: false}]) await isolatedFlow(articleCosmicFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(headingsFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(headerFlow, browser, origin, viewport);
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
    for (const viewport of viewports) await isolatedFlow(sectionsFlow, browser, origin, viewport);
    // «Довіра» (2026-11-03): сторінка «Про проєкт» (360 включено: вузький телефон найдовший) і спільне застереження в інших виглядах.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}]) await isolatedFlow(aboutFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(noticeThemeFlow, browser, origin, viewport);
    for (const viewport of viewports) await changesFlow(browser, origin, viewport);
    for (const viewport of viewports) await researchFlow(browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(provenanceStampFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(intervalMotifFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(studyTypeChipsFlow, browser, origin, viewport);
    for (const viewport of viewports) await isolatedFlow(sidenotesFlow, browser, origin, viewport);
    // T3: ширини навколо порогу 1360 px: до нього приміток немає, від нього вони видимі й нічого не накладається.
    for (const width of [1100, 1280, 1360]) await isolatedFlow(sidenotesFlow, browser, origin, {name: 'wide-' + width, width, height: 900});
    for (const viewport of viewports) await mechanismsFlow(browser, origin, viewport);
    // Сторінка сну (2026-11-09, рішення власника 34–37): схема ночі, блок «Дивись також», одна кнопка в шапці; 360 включено, бо вузький телефон найдовший і найтісніший.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}]) await isolatedFlow(sleepNightFlow, browser, origin, viewport);
    // Картки звичок на сторінці сну (2026-11-09, рішення власника «1 так»): на телефоні згорнуті в рядки, на комп’ютері й без JavaScript усе видно.
    for (const viewport of [...viewports, {name: 'mobile-narrow', width: 360, height: 780}]) await isolatedFlow(sleepHabitsFlow, browser, origin, viewport);
  for (const viewport of viewports) await homeFreshFlow(browser, origin, viewport);
  for (const viewport of viewports) await isolatedFlow(homeFreshCardsFlow, browser, origin, viewport);
    await homeFlows(browser, origin);
    for (const viewport of viewports) await compactBannerFlow(browser, origin, viewport);
    for (const viewport of viewports) await videosFlow(browser, origin, viewport);
    for (const viewport of viewports) await dietsFlow(browser, origin, viewport);
    for (const viewport of viewports) await pineFlow(browser, origin, viewport);
    for (const viewport of viewports) await atlasFlow(browser, origin, viewport);
    for (const viewport of viewports) await musclesFlow(browser, origin, viewport);
    for (const viewport of viewports) webgl.push(await spineFlow(browser, origin, viewport));
    for (const viewport of viewports) await isolatedFlow(homeLowerFlow, browser, origin, viewport);
    await isolatedFlow(homeLowerFlow, browser, origin, {name: 'mobile-narrow', width: 360, height: 844});
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
  console.error(`${homeOnly ? 'Homepage QA' : 'Browser QA'} failed (${failures.length} of ${checks} checks):\n` + failures.map(f => ` - ${f}`).join('\n'));
  process.exit(1);
}
if (homeOnly) console.log(`Homepage QA passed: ${checks} checks; Spectrum interactions at three viewports plus cosmic-lens wheel/touch/keyboard/fallback/deep-link, no-script, native-scroll, reduced-motion and lower-home flows.`);
else console.log(`Browser QA passed: ${checks} checks over ${files.length} pages × ${viewports.length} viewports plus library, muscle lab, atlas, muscles-zone, spine-zone and Spectrum home/search/directions/native-scroll flows (3D model rendered: ${webgl.filter(Boolean).length}/${webgl.length}).`);
