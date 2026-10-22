// Порівняння двох добавок: ті самі короткі висновки й межі, що в каталозі «Добавки» (тексти не змінено).
import {supplements} from './supplements.js?v=2';

export const REVIEW={
  creatine:'Попередні оцінки окремих тверджень; науковий перегляд триває.',
  other:'Рівень впевненості не оцінено; це попередній огляд.'
};
export const rows=item=>[
  ['Напрям',item.tag],
  ['Короткий висновок',item.summary],
  ['Межі висновку',item.limit],
  ['Стан перегляду',item.id==='creatine'?REVIEW.creatine:REVIEW.other]
];
export function pick(id,fallback){return supplements.find(s=>s.id===id)||supplements[fallback];}
export function resolve(search){
  const p=new URLSearchParams(search);
  let a=pick(p.get('a'),0),b=pick(p.get('b'),2);
  if(a.id===b.id)b=supplements.find(s=>s.id!==a.id);
  return [a,b];
}
const make=(root,tag,cls,text)=>{const n=root.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
export function mountCompare(root=document){
  const out=root.getElementById('cp-out'),A=root.getElementById('cp-a'),B=root.getElementById('cp-b'),swap=root.getElementById('cp-swap');
  if(!out||!A||!B)return;
  for(const select of [A,B])for(const s of supplements){const o=root.createElement('option');o.value=s.id;o.textContent=s.name;select.append(o);}
  let [a,b]=resolve(root.defaultView.location.search);A.value=a.id;B.value=b.id;
  function card(item,side){
    const c=make(root,'article','cp-card');c.dataset.side=side;
    c.append(make(root,'h2','',item.name));
    const dl=make(root,'dl');
    for(const [k,v] of rows(item)){const d=make(root,'div');d.append(make(root,'dt','',k),make(root,'dd','',v));dl.append(d);}
    c.append(dl);
    const link=make(root,'a','cp-open','Відкрити розбір: '+item.name+' →');link.href='./index.html#'+item.id;c.append(link);
    return c;
  }
  function paint(){
    a=pick(A.value,0);b=pick(B.value,2);
    if(a.id===b.id){b=supplements.find(s=>s.id!==a.id);B.value=b.id;}
    out.replaceChildren(card(a,'a'),card(b,'b'));
    const url=new URL(root.defaultView.location.href);url.searchParams.set('a',a.id);url.searchParams.set('b',b.id);
    root.defaultView.history.replaceState(null,'',url);
    root.title=`${a.name} і ${b.name}: порівняння добавок — Evidence UA`;
  }
  A.addEventListener('change',paint);B.addEventListener('change',paint);
  swap.addEventListener('click',()=>{const t=A.value;A.value=B.value;B.value=t;paint();});
  paint();
}
if(typeof document!=='undefined')mountCompare();
