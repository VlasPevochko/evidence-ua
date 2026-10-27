// «Дослідження простими словами»: картки з однією відповіддю, деталі згорнуті; фільтр за темою.
import {STUDIES,TOPICS,CHECKED} from './research-data.js?v=3';

export const countLabel=(shown,total)=>shown===total?`Розборів: ${total}`:`Показано ${shown} із ${total}`;
export const filterStudies=(topic,studies=STUDIES)=>topic==='all'?studies.slice():studies.filter(s=>s.topic===topic);

export function render(root=document){
  const list=root.getElementById('rs-list'),filters=root.getElementById('rs-filters'),summary=root.getElementById('rs-summary');
  if(!list||!filters)return;
  const make=(tag,cls,text)=>{const n=root.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const row=(label,text)=>{const d=make('div','rs-row');d.append(make('dt','',label),make('dd','',text));return d;};
  const draw=topic=>{
    const items=filterStudies(topic);
    list.replaceChildren();
    for(const s of items){
      const card=make('details','rs-card');
      const head=make('summary','');
      head.append(make('span','rs-tag rs-tag-'+s.topic,TOPICS[s.topic]),make('span','rs-question',s.question),make('span','rs-answer',s.answer),make('span','rs-more','Докладніше'));
      const body=make('div','rs-body');const dl=make('dl','rs-rows');
      dl.append(row('Хто досліджувався',s.who),row('Що знайшли',s.found),row('Чого це не доводить',s.limits));
      const src=make('p','rs-source');src.append(make('span','',s.type+'. '));
      const a=make('a','',s.source.label+' ↗');a.href=s.source.doi?'https://doi.org/'+s.source.doi:'https://pubmed.ncbi.nlm.nih.gov/'+s.source.pmid+'/';a.target='_blank';a.rel='noopener noreferrer';
      src.append(a,make('span','rs-checked',' Перевірено '+CHECKED+'.'));
      body.append(dl,src);card.append(head,body);list.append(card);
    }
    if(summary)summary.textContent=countLabel(items.length,STUDIES.length);
    for(const b of filters.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.topic===topic));
  };
  const topics=[['all','Усі'],...Object.entries(TOPICS)];
  for(const [id,label] of topics){const b=make('button','rs-chip',label);b.type='button';b.dataset.topic=id;b.addEventListener('click',()=>draw(id));filters.append(b);}
  draw('all');
}
if(typeof document!=='undefined')render();
