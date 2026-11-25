// «Космос усередині тебе» на сторінці «Про проєкт» (рішення власника 2026-11-25). Опис і межі: docs/ABOUT_COSMOS.md.
// Без JavaScript, зі зменшеним рухом і в друку видно нерухомий кадр (img у розмітці). Програвач Lottie (власна копія, vendor/) вантажиться
// лише коли сцена на екрані й рух дозволено, після завантаження сторінки; сторонніх запитів немає.
// Анімація триває 12 с і повторюється, тому поруч є кнопка «Зупинити / Продовжити» (одна на одну дію); її створює скрипт, без нього вона не потрібна.
// Палітра: космос — about-cosmos.json (лаванда), «Зелений» — about-cosmos-green.json (оригінальне золото); перемикач «Оформлення» підміняє файл на льоту.
const PLAYER = './vendor/lottie-light-5.12.2.min.js';
const FILES = {cosmic: './about-cosmos.json?v=1', green: './about-cosmos-green.json?v=1'};
export const START_FRAME = 165; // той самий кадр, що й на заставці: рух починається з того, що вже видно

const figure = document.querySelector('[data-about-cosmos]');
const stage = figure && figure.querySelector('.ab-cosmos-stage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const palette = () => document.documentElement.dataset.palette === 'green' ? 'green' : 'cosmic';

let anim = null, loadedPalette = null, userPaused = false, visible = false, button = null, playerPromise = null;

function loadPlayer() {
  if (window.lottie) return Promise.resolve(window.lottie);
  playerPromise ||= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), {src: PLAYER, async: true});
    script.onload = () => resolve(window.lottie);
    script.onerror = reject;
    document.head.append(script);
  });
  return playerPromise;
}

function sync() {
  if (!anim) return;
  const run = visible && !userPaused && !reduce.matches && !document.hidden;
  if (run) anim.play(); else anim.pause();
  if (button) {
    button.setAttribute('aria-pressed', String(userPaused));
    button.setAttribute('aria-label', userPaused ? 'Продовжити анімацію' : 'Зупинити анімацію');
    button.dataset.state = userPaused ? 'paused' : 'playing';
  }
}

function addButton() {
  if (button) return;
  button = document.createElement('button');
  button.type = 'button';
  button.className = 'ab-cosmos-toggle';
  button.innerHTML = '<span class="ab-cosmos-icon" aria-hidden="true"></span>';
  button.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  figure.append(button);
}

async function mount() {
  if (reduce.matches) return;
  const want = palette();
  if (anim && loadedPalette === want) return sync();
  const lottie = await loadPlayer();
  const data = await (await fetch(FILES[want])).json();
  if (palette() !== want || reduce.matches) return; // поки вантажилось, щось змінилось: наступний виклик зробить правильно
  const frame = anim ? Math.round(anim.currentFrame) : START_FRAME;
  anim?.destroy();
  anim = lottie.loadAnimation({container: stage, renderer: 'svg', loop: true, autoplay: false, animationData: data,
    rendererSettings: {preserveAspectRatio: 'xMidYMid slice', progressiveLoad: false, hideOnTransparent: true}});
  loadedPalette = want;
  anim.addEventListener('DOMLoaded', () => {
    anim.goToAndStop(frame, true);
    figure.dataset.playing = '';
    addButton();
    sync();
  }, {once: true});
}

function unmount() {
  anim?.destroy();
  anim = null;
  loadedPalette = null;
  delete figure.dataset.playing;
  button?.remove();
  button = null;
}

if (figure && stage) {
  const start = () => {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible && !anim) mount().catch(() => {}); // без програвача лишається заставка
      sync();
    }).observe(figure);
  };
  if (document.readyState === 'complete') start(); else addEventListener('load', start, {once: true});
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', () => { if (reduce.matches) unmount(); else if (visible) mount().catch(() => {}); });
  new MutationObserver(() => { if (anim) mount().catch(() => {}); }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-palette']});
}
