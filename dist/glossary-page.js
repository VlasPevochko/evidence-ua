// Словник: терміни з підказок (докази, жир) і з модулів «Рух» та «Сон». Дані беруться з тих самих файлів, що й підказки в тексті.
import {TERMS} from './platform-terms.js?v=3';
import {glossary} from './platform-glossary-data.js';

const GROUPS=[
  ['Читання доказів',TERMS.filter(t=>['rkd','meta','ci','smd','i2','grade'].includes(t.id)).map(t=>({id:t.id,title:t.title,definition:t.definition,source:t.source}))],
  ['Жир і енергія',TERMS.filter(t=>['triglycerides','lipolysis'].includes(t.id)).map(t=>({id:t.id,title:t.title,definition:t.definition,source:t.source}))],
  ['Рух і біомеханіка',(glossary.movement||[]).map(t=>({id:t.id,title:t.title,definition:t.definition,example:t.example,source:t.source}))],
  ['Сон і відновлення',(glossary.sleep||[]).map(t=>({id:t.id,title:t.title,definition:t.definition,example:t.example,source:t.source}))]
];
export const ENTRIES=GROUPS.flatMap(([group,items])=>items.map(i=>({...i,group})));
export const normalize=s=>String(s||'').toLocaleLowerCase('uk').replace(/[’‘ʼ`]/g,"'").replace(/\s+/g,' ').trim();

export function render(root=document){
  const list=root.getElementById('gl-list'),input=root.getElementById('gl-q'),count=root.getElementById('gl-count');
  if(!list||!input)return;
  const make=(tag,cls,text)=>{const n=root.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const sections=GROUPS.map(([group,items])=>{
    const section=make('section','gl-group'),h=make('h2','',group);h.id='gl-'+normalize(group).replace(/[^a-zа-яіїєґ0-9]+/g,'-');section.setAttribute('aria-labelledby',h.id);section.append(h);
    const dl=make('div','gl-items');
    const cards=items.map(item=>{
      const a=make('article','gl-term');a.id='term-'+item.id;
      a.append(make('h3','',item.title),make('p','gl-def',item.definition));
      if(item.example)a.append(make('p','gl-example','Приклад: '+item.example));
      const link=make('a','gl-source',item.source.label.replace(/\s*↗$/,'')+' ↗');link.href=item.source.href;link.target='_blank';link.rel='noopener';a.append(link);
      a.dataset.search=normalize(item.title+' '+item.definition+' '+(item.example||''));
      dl.append(a);return a;
    });
    section.append(dl);list.append(section);return {section,cards};
  });
  const empty=make('p','gl-empty','Нічого не знайдено. Спробуйте інше слово.');empty.hidden=true;list.append(empty);
  const total=ENTRIES.length;
  function apply(){
    const q=normalize(input.value);let shown=0;
    for(const {section,cards} of sections){let any=false;for(const c of cards){const hit=!q||c.dataset.search.includes(q);c.hidden=!hit;if(hit){any=true;shown++;}}section.hidden=!any;}
    empty.hidden=shown>0;count.textContent=q?`Знайдено ${shown} з ${total}`:`Усього термінів: ${total}`;
  }
  input.addEventListener('input',apply);apply();
  // Deep links from the hints in the text (#term-ci) land on the entry and highlight it.
  const target=()=>{const id=decodeURIComponent(location.hash.slice(1));const el=id?root.getElementById(id):null;if(el&&el.classList.contains('gl-term')){input.value='';apply();el.scrollIntoView({block:'center'});el.classList.add('is-target');setTimeout(()=>el.classList.remove('is-target'),2400);}};
  target();addEventListener('hashchange',target);
}
if(typeof document!=='undefined')render();
