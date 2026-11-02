// Типи джерел у картках розборів (бриф T2, 2026-11-02). Одинадцять рядків `type` у research-data.js не розрізнити кольором, тому їх зведено в чотири родини
// однією явною таблицею. Це групування для значка, а не оцінка якості: колір і форма значка нічого не кажуть про рівень впевненості.
// Родини затверджені власником (D2). Коли в даних з’являється новий рядок типу без родини, tests/study-type-chips.test.mjs падає:
// додайте його сюди (до якої родини, вирішує людина), а не вгадуйте.
export const FAMILIES=[
  {id:'meta',label:'Мета-аналіз (усі види)',glyph:'circle',token:'--st-1',types:['Мета-аналіз','Мета-аналіз РКД','Мета-аналіз спостережень','Мета-аналіз РКД і спостережень','Мережевий мета-аналіз РКД','Мета-регресія досліджень']},
  {id:'systematic',label:'Систематичний огляд (усі види)',glyph:'square',token:'--st-2',types:['Систематичний огляд','Систематичний огляд РКД']},
  {id:'umbrella',label:'Огляд оглядів',glyph:'triangle',token:'--st-3',types:['Огляд мета-аналізів','Огляд систематичних оглядів']},
  {id:'review',label:'Огляд',glyph:'diamond',token:'--st-4',types:['Огляд']}
];
export const LEGEND_SENTENCE='Колір і значок показують лише тип джерела, а не рівень впевненості.';
export const familyOf=type=>FAMILIES.find(family=>family.types.includes(type))||null;
const esc=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// Значок типу: фігура (aria-hidden) і точний рядок типу з даних. Невідомий тип показуємо без фігури й кольору, текст той самий.
export function chipHTML(type){
  const family=familyOf(type);
  if(!family)return `<span class="rs-type rs-type--other"><span>${esc(type)}</span></span>`;
  return `<span class="rs-type rs-type--${family.id}"><i class="rs-glyph rs-glyph--${family.glyph}" aria-hidden="true"></i><span>${esc(type)}</span></span>`;
}
// Рядок легенди: фігура й назва родини; число розборів береться з даних.
export function legendHTML(studies){
  return FAMILIES.map(family=>{const count=studies.filter(study=>family.types.includes(study.type)).length;
    return `<li class="rs-type rs-type--${family.id}"><i class="rs-glyph rs-glyph--${family.glyph}" aria-hidden="true"></i><span>${esc(family.label)}</span><small>${count}</small></li>`;}).join('');
}
