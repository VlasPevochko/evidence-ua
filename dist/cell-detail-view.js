import {getOrganelle,sources} from './cell-lab-data.js?v=56';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Labels describe an illustrative close-up; the frozen functional claims stay in module.mjs.
const detailDefinitions={
 'ORG-MITOCHONDRION':{file:'mitochondrion',parts:['Зовнішня мембрана','Внутрішня мембрана','Кристи','Міжмембранний простір'],locator:'3.2 · Figure 3.16 · Mitochondrion'},
 'ORG-NUCLEUS':{file:'nucleus',parts:['Ядерна оболонка','Ядерні пори','Хроматин','Ядерце'],locator:'3.3 · Figure 3.19 · The Nucleus'},
 'ORG-NUCLEOLUS':{file:'nucleolus',parts:['рРНК','Рибосомні субодиниці','Ділянка всередині ядра'],note:'Ядерце — ділянка ядра без власної мембрани.',locator:'3.3 · Organization of the Nucleus and Its DNA'},
 'ORG-RIBOSOME':{file:'ribosome',parts:['Велика субодиниця','Мала субодиниця','мРНК'],note:'Рибосома не оточена мембраною.',locator:'3.2 · Endoplasmic Reticulum / ribosomes'},
 'ORG-ROUGH-ER':{file:'rough-er',parts:['Мембрана','Просвіт цистерн','Прикріплені рибосоми'],locator:'3.2 · Figure 3.14 · Endoplasmic Reticulum'},
 'ORG-SMOOTH-ER':{file:'smooth-er',parts:['Мембрана','Трубочки','Внутрішній просвіт'],locator:'3.2 · Figure 3.14 · Endoplasmic Reticulum'},
 'ORG-GOLGI':{file:'golgi',parts:['Цистерни','Внутрішній простір','Транспортні везикули'],locator:'3.2 · Figure 3.15 · Golgi Apparatus'},
 'ORG-LYSOSOME':{file:'lysosome',parts:['Мембрана','Ферменти','Матеріал для розщеплення'],locator:'3.2 · Lysosomes'},
 'ORG-PEROXISOME':{file:'peroxisome',parts:['Мембрана','Ферменти','Внутрішній простір'],locator:'3.2 · Peroxisomes'},
 'STRUCT-CYTOSKELETON':{file:'cytoskeleton',parts:['Мікротрубочки','Актинові філаменти','Проміжні філаменти'],note:'Цитоскелет — мережа філаментів, а не мембранна органела.',locator:'3.2 · Figure 3.18 · The Three Components of the Cytoskeleton'},
 'STRUCT-PLASMA-MEMBRANE':{file:'membrane',parts:['Фосфоліпідний бішар','Мембранні білки','Вуглеводні ланцюги','Холестерин'],locator:'3.1 · Structure and Composition of the Cell Membrane'}
};
export function getCellDetail(id){
 const o=getOrganelle(id),definition=detailDefinitions[id];
 return {...definition,organelleId:id,image:`./cell-details/${definition.file}.png`,sourceId:o.sourceIds[0],scientificApproval:null};
}
export function renderCellDetail(id,zoom=4){
 if(![2,4,6,8].includes(zoom))throw Error('Invalid zoom');
 const o=getOrganelle(id),d=getCellDetail(id),source=sources.find(s=>s.id===d.sourceId);
 return `<div class="cell-detail-toolbar"><button type="button" data-cell-detail-action="close" aria-label="Повернутися до клітини">← До клітини</button><div class="cell-detail-zoom" role="group" aria-label="Наближення ілюстрації"><button type="button" data-cell-detail-action="zoom-out"${zoom===2?' disabled':''} aria-label="Зменшити наближення">−</button><span role="status" aria-live="polite">${zoom}×</span><button type="button" data-cell-detail-action="zoom-in"${zoom===8?' disabled':''} aria-label="Збільшити наближення">+</button><button type="button" data-cell-detail-action="fit">Умістити</button></div></div>
<div class="cell-detail-heading"><span>Детальний вигляд</span><h3>${esc(o.label)}</h3></div>
<div class="cell-detail-stage" tabindex="0" role="group" aria-label="${esc(o.label)}: збільшена ілюстрація. При великому наближенні прокручуй для огляду." style="--detail-scale:${zoom/4}"><img src="${esc(d.image)}" width="1448" height="1086" alt="Навчальна ілюстрація: ${esc(o.label)}; ${esc(d.parts.join(', '))}" decoding="async" draggable="false"></div>
<div class="cell-detail-legend"><p>Структури та компоненти</p><ul>${d.parts.map(part=>`<li>${esc(part)}</li>`).join('')}</ul>${d.note?`<p class="cell-detail-special-note">${esc(d.note)}</p>`:''}</div>
<div class="cell-detail-reference"><p>Навчальна ілюстрація. Кольори, частинки та масштаб умовні.</p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">OpenStax · розділ ${esc(d.locator.split(' · ')[0])} ↗</a><span class="cell-detail-locator">${esc(d.locator)}</span></div>`;
}
