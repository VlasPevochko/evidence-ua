import {catalog,learningHref} from './catalog.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Curriculum navigation only: reuse existing materials, not scientific conclusions.
export function pathCard(path){
 const steps=path.steps.map(catalog.resolveStep);
 return `<article class="path-card"><h3>${esc(path.title)}</h3><p>${esc(path.description)}</p><ol>${steps.map((s,i)=>`<li><a href="${esc(learningHref(path.id,i))}">${esc(s.title)}</a></li>`).join('')}</ol><a class="path-start" href="${esc(learningHref(path.id,0))}">Почати маршрут →</a></article>`;
}
export function homeLearningHTML(){
 const count=catalog.paths.length;
 const noun=({one:'маршрут',few:'маршрути',many:'маршрутів'})[new Intl.PluralRules('uk').select(count)]||'маршрутів';
 // Home keeps every route start visible, with its full outline one native
 // disclosure away. The directory's shared pathCard remains unchanged.
 const cards=catalog.paths.map((path,index)=>{
  const steps=path.steps.map(catalog.resolveStep);
  return `<article class="path-card" data-home-path="${esc(path.id)}"><span class="home-path-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><h3>${esc(path.title)}</h3><a class="path-start" href="${esc(learningHref(path.id,0))}" aria-label="Почати маршрут «${esc(path.title)}»">Почати маршрут →</a><details class="home-path-outline"><summary>Кроки маршруту <span>${steps.length}</span></summary><p>${esc(path.description)}</p><ol>${steps.map((step,i)=>`<li><a href="${esc(learningHref(path.id,i))}">${esc(step.title)}</a></li>`).join('')}</ol></details></article>`;
 }).join('');
 return `<details id="home-learning-paths"><summary><span class="home-chapter-number" aria-hidden="true">02</span><span><strong>Навчальні маршрути</strong><small>${count} ${noun} · крок за кроком</small></span></summary><p>Обери тему й почни з першого матеріалу. На сторінках маршруту є переходи до попереднього та наступного кроку.</p><div class="start-paths">${cards}</div></details>`;
}
