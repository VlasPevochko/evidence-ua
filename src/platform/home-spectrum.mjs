import {catalog,learningHref} from './catalog.mjs';
// Рішення власника D3 (2026-11-02, бриф T7): підказка поля пошуку одна для головної й вікна пошуку, тож береться з src/platform/search.mjs.
// Мітка поля (label) стоїть після поля й дорівнює підказці: на комп’ютері вона прихована для зору, на телефоні (CSS у dist/home-spectrum.css) показується замість
// підказки у два рядки, бо довга підказка в одному рядку там не вміщається. Кнопка називає дію словом «Знайти», а не лише стрілкою.
import {SEARCH_PLACEHOLDER} from './search.mjs';

const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<span aria-hidden="true">→</span>';
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="7.25"/><path d="m16 16 5 5"/></svg>';
// These are editorial entrances, not a second content catalog. Their targets,
// route chapters and availability remain owned by the shared catalog.
// `action` is the visible label of the row. Рішення власника (бриф T5, 2026-11-02): три однакові «Відкрити →» замінено підписами, що називають,
// куди веде рядок, словами самого сайту: «модель» (провідник Muscle Lab), «гід» (сторінка про жироспалення), «читати про креатин» (текстовий навчальний модуль; слова «досьє» на ньому немає).
// Унікальність і зв’язок підпису з призначенням перевіряє tests/link-text.test.mjs.
const entrances=[
  {id:'muscle',area:'muscle',unit:'structure',question:'Як працюють м’язи?',action:'Відкрити модель м’яза'},
  {id:'fat',area:'nutrition',unit:'fat-loss',question:'Куди зникає жир?',action:'Відкрити гід про жир'},
  {id:'creatine',area:'supplements',unit:'creatine',question:'Що відомо про креатин?',action:'Читати про креатин'}
];

export function homeSpectrumHTML(){
  const energy=catalog.paths.find(path=>path.id==='energy');
  const questions=entrances.map((entrance,index)=>{
    const unit=catalog.getArea(entrance.area).units.find(unit=>unit.id===entrance.unit);
    return `<a class="spectrum-question spectrum-question--${entrance.id}" data-spectrum-question="${entrance.id}" href="${escapeHTML(unit.href)}"><span class="spectrum-question-number" aria-hidden="true">0${index+1}</span><h2>${escapeHTML(entrance.question)}</h2><span class="spectrum-question-open">${escapeHTML(entrance.action)} ${arrow}</span></a>`;
  }).join('');
  const directions=catalog.areas.filter(area=>area.available).map(area=>`<a class="spectrum-directions-link" data-spectrum-area="${escapeHTML(area.id)}" href="${escapeHTML(area.href)}"><span class="spectrum-directions-name">${escapeHTML(area.title)}</span>${arrow}<span class="spectrum-directions-state">${escapeHTML(area.state)}</span></a>`).join('');
  return `<section id="top" class="spectrum-home" aria-labelledby="spectrum-title">
  <div class="spectrum-ribbon" aria-hidden="true"><canvas id="spectrum-wave" class="spectrum-wave" data-spectrum-wave aria-hidden="true"></canvas></div>
  <div class="spectrum-intro">
    <h1 id="spectrum-title">Почни з питання.</h1>
    <form id="spectrum-search" class="spectrum-search" role="search" action="./directions.html" method="get">
      ${searchIcon}<span class="spectrum-search-field"><input id="spectrum-query" name="q" type="search" placeholder="${escapeHTML(SEARCH_PLACEHOLDER)}" autocomplete="off" enterkeyhint="search" maxlength="120"><label class="spectrum-sr-only spectrum-search-label" for="spectrum-query">${escapeHTML(SEARCH_PLACEHOLDER)}</label></span>
      <button class="spectrum-search-submit" type="submit">Знайти</button>
    </form>
  </div>
  <div class="spectrum-questions" aria-label="З чого почати">${questions}</div>
  <div class="spectrum-route-bar">
    <p class="spectrum-route-title" data-spectrum-route-label>${escapeHTML(energy.title)}</p>
    <ol class="spectrum-route-steps" aria-label="Кроки маршруту">${energy.steps.map(step=>`<li data-spectrum-step>${escapeHTML(catalog.resolveStep(step).title)}</li>`).join('')}</ol>
    <a class="spectrum-route-start" href="${escapeHTML(learningHref(energy.id,0))}" data-spectrum-route>Почати маршрут: ${escapeHTML(catalog.resolveStep(energy.steps[0]).title)} ${arrow}</a>
    <a id="spectrum-directions-trigger" class="spectrum-directions-trigger" href="./directions.html">Усі напрями</a>
  </div>
  <dialog id="spectrum-directions" class="spectrum-directions" aria-labelledby="spectrum-directions-title">
    <button class="spectrum-directions-close" type="button" data-spectrum-close aria-label="Закрити напрями"><span aria-hidden="true">×</span></button>
    <h2 id="spectrum-directions-title">Напрями Evidence UA</h2>
    <nav class="spectrum-directions-list" aria-label="Навчальні напрями">${directions}</nav>
    <a class="spectrum-directions-all" href="./directions.html">Усі матеріали ${arrow}</a>
  </dialog>
</section>`;
}
