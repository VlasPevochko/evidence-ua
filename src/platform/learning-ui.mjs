import {catalog,learningHref} from './catalog.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Curriculum navigation only: reuse existing materials, not scientific conclusions.
export function pathCard(path){
 const steps=path.steps.map(catalog.resolveStep);
 return `<article class="path-card"><h3>${esc(path.title)}</h3><p>${esc(path.description)}</p><ol>${steps.map((s,i)=>`<li><a href="${esc(learningHref(path.id,i))}">${esc(s.title)}</a></li>`).join('')}</ol><a class="path-start" href="${esc(learningHref(path.id,0))}">Почати маршрут →</a></article>`;
}
export function homeLearningHTML(){
 return `<details id="home-learning-paths" open><summary>Хочу навчатися послідовно — обрати маршрут</summary><p>Обери тему й почни з першого матеріалу. На сторінках маршруту є переходи до попереднього та наступного кроку.</p><div class="start-paths">${catalog.paths.map(pathCard).join('')}</div></details>`;
}
