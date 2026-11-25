// Анімація «Космос усередині тебе» для сторінки «Про проєкт» (рішення власника 2026-11-25).
// Із оригіналу власника (src/about/cosmos-source.json) робить:
//   dist/about-cosmos.json, dist/about-cosmos-green.json  — дві копії для програвача (src/about/cosmos-colors.mjs);
//   dist/about-cosmos-poster.webp, dist/about-cosmos-poster-green.webp — нерухомий кадр POSTER_FRAME
//     (сузір'я вже склалося): його бачать без JavaScript, зі зменшеним рухом і поки програвач вантажиться.
// Запуск: node scripts/make-about-cosmos.mjs  (потрібен Playwright з Chromium; POSTER_ONLY=0 пропускає кадри).
// Тест tests/about-cosmos.test.mjs звіряє JSON-копії з оригіналом, тож після зміни оригіналу чи кольорів скрипт треба запустити.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildCosmos} from '../src/about/cosmos-colors.mjs';

export const POSTER_FRAME = 165;
export const POSTER_SIZE = [1120, 630];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const source = JSON.parse(fs.readFileSync(path.join(root, 'src/about/cosmos-source.json'), 'utf8'));
const outputs = {cosmic: 'about-cosmos.json', green: 'about-cosmos-green.json'};
for (const [palette, file] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(dist, file), JSON.stringify(buildCosmos(source, palette)) + '\n');
  console.log(`${file}: ${fs.statSync(path.join(dist, file)).size} bytes`);
}

if (process.env.POSTER_ONLY !== '0') {
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); } catch { playwright = createRequire(path.join(root, 'scripts/browser-qa/package.json'))('playwright'); }
  const server = http.createServer((request, response) => {
    const file = path.join(dist, decodeURIComponent(request.url.split('?')[0]));
    if (request.url === '/stage.html') {
      response.setHeader('content-type', 'text/html');
      return response.end(`<!doctype html><body style="margin:0;background:#000"><div id="s" style="width:${POSTER_SIZE[0]}px;height:${POSTER_SIZE[1]}px"></div><script src="./vendor/lottie-light-5.12.2.min.js"></script>`);
    }
    if (!file.startsWith(dist) || !fs.existsSync(file)) { response.statusCode = 404; return response.end(); }
    response.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : 'application/json');
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, resolve));
  const origin = `http://localhost:${server.address().port}`;
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: POSTER_SIZE[0], height: POSTER_SIZE[1]}});
    await page.goto(origin + '/stage.html');
    for (const [palette, file] of Object.entries(outputs)) {
      await page.evaluate(async ({file, frame}) => {
        window.anim?.destroy();
        const data = await (await fetch('./' + file)).json();
        window.anim = lottie.loadAnimation({container: document.getElementById('s'), renderer: 'svg', loop: false, autoplay: false, animationData: data, rendererSettings: {preserveAspectRatio: 'xMidYMid slice'}});
        await new Promise(resolve => window.anim.addEventListener('DOMLoaded', resolve));
        window.anim.goToAndStop(frame, true);
      }, {file, frame: POSTER_FRAME});
      const png = await page.screenshot({type: 'png'});
      // Chromium сам кодує WebP: малюємо знімок на canvas і беремо toDataURL.
      const webp = await page.evaluate(async base64 => {
        const image = new Image();
        image.src = 'data:image/png;base64,' + base64;
        await image.decode();
        const canvas = Object.assign(document.createElement('canvas'), {width: image.width, height: image.height});
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', 0.8).split(',')[1];
      }, png.toString('base64'));
      const name = palette === 'cosmic' ? 'about-cosmos-poster.webp' : 'about-cosmos-poster-green.webp';
      fs.writeFileSync(path.join(dist, name), Buffer.from(webp, 'base64'));
      console.log(`${name}: ${fs.statSync(path.join(dist, name)).size} bytes`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}
