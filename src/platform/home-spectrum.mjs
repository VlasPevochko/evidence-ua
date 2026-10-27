import {catalog,learningHref} from './catalog.mjs';

const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<span aria-hidden="true">→</span>';
const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="7.25"/><path d="m16 16 5 5"/></svg>';
// These are editorial entrances, not a second content catalog. Their targets,
// route chapters and availability remain owned by the shared catalog.
const entrances=[
  {id:'muscle',area:'muscle',unit:'structure',question:'Як працюють м’язи?'},
  {id:'fat',area:'nutrition',unit:'fat-loss',question:'Куди зникає жир?'},
  {id:'creatine',area:'supplements',unit:'creatine',question:'Що відомо про креатин?'}
];

export function homeSpectrumHTML(){
  const energy=catalog.paths.find(path=>path.id==='energy');
  const questions=entrances.map((entrance,index)=>{
    const unit=catalog.getArea(entrance.area).units.find(unit=>unit.id===entrance.unit);
    return `<a class="spectrum-question spectrum-question--${entrance.id}" data-spectrum-question="${entrance.id}" href="${escapeHTML(unit.href)}"><span class="spectrum-question-number" aria-hidden="true">0${index+1}</span><h2>${escapeHTML(entrance.question)}</h2><span class="spectrum-question-open">Відкрити ${arrow}</span></a>`;
  }).join('');
  const directions=catalog.areas.filter(area=>area.available).map(area=>`<a class="spectrum-directions-link" data-spectrum-area="${escapeHTML(area.id)}" href="${escapeHTML(area.href)}"><span class="spectrum-directions-name">${escapeHTML(area.title)}</span>${arrow}<span class="spectrum-directions-state">${escapeHTML(area.state)}</span></a>`).join('');
  return `<section id="top" class="spectrum-home" aria-labelledby="spectrum-title">
  <div class="spectrum-ribbon" aria-hidden="true"><canvas id="spectrum-wave" class="spectrum-wave" data-spectrum-wave aria-hidden="true"></canvas></div>
  <div class="spectrum-intro">
    <h1 id="spectrum-title">Почни з питання.</h1>
    <form id="spectrum-search" class="spectrum-search" role="search" action="./directions.html" method="get">
      <label class="spectrum-sr-only" for="spectrum-query">Що хочеш зрозуміти?</label>
      ${searchIcon}<input id="spectrum-query" name="q" type="search" placeholder="Що хочеш зрозуміти?" autocomplete="off" maxlength="120">
      <button class="spectrum-search-submit" type="submit" aria-label="Знайти матеріал">${arrow}</button>
    </form>
  </div>
  <div class="spectrum-questions" aria-label="З чого почати">${questions}</div>
  <div class="spectrum-route-bar">
    <p class="spectrum-route-title" data-spectrum-route-label>${escapeHTML(energy.title)}</p>
    <ol class="spectrum-route-steps" aria-label="Кроки маршруту">${energy.steps.map(step=>`<li data-spectrum-step>${escapeHTML(catalog.resolveStep(step).title)}</li>`).join('')}</ol>
    <a class="spectrum-route-start" href="${escapeHTML(learningHref(energy.id,0))}" data-spectrum-route>Почати маршрут ${arrow}</a>
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
