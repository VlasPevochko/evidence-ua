// «Дослідження простими словами»: картки з однією відповіддю, деталі згорнуті; фільтр за темою.
import {STUDIES,TOPICS,CHECKED} from './research-data.js?v=4';
import {shareStudy,saveCard} from './research-share.js?v=2';
import {renderChart} from './research-chart.js?v=2';

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
      const actions=make('div','rs-actions'),status=make('p','rs-status');status.setAttribute('role','status');
      const shareBtn=make('button','rs-btn','Поділитись');shareBtn.type='button';
      const imgBtn=make('button','rs-btn','Зберегти картинку');imgBtn.type='button';
      shareBtn.addEventListener('click',async()=>{const r=await shareStudy(s,root.defaultView.location.href,root.defaultView.navigator);status.textContent=r==='copied'?'Текст і посилання скопійовано.':r==='manual'?'Не вдалося скопіювати. Скопіюйте адресу з рядка браузера.':'';});
      imgBtn.addEventListener('click',async()=>{imgBtn.disabled=true;try{await saveCard(s,TOPICS[s.topic],root);status.textContent='Картинку збережено.';}catch{status.textContent='Не вдалося створити картинку.';}imgBtn.disabled=false;});
      actions.append(shareBtn,imgBtn);
      card.id='rs-'+s.id;
      card.addEventListener('toggle',()=>{const f=card.querySelector('.rs-chart');if(!f)return;f.classList.remove('is-in');if(card.open)root.defaultView.requestAnimationFrame(()=>root.defaultView.requestAnimationFrame(()=>f.classList.add('is-in')));});
      if(s.chart)body.append(dl,renderChart(root,s.chart),src,actions,status);else body.append(dl,src,actions,status);card.append(head,body);list.append(card);
    }
    if(summary)summary.textContent=countLabel(items.length,STUDIES.length);
    for(const b of filters.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.topic===topic));
  };
  const topics=[['all','Усі'],...Object.entries(TOPICS)];
  for(const [id,label] of topics){const b=make('button','rs-chip',label);b.type='button';b.dataset.topic=id;b.addEventListener('click',()=>draw(id));filters.append(b);}
  draw('all');
  const openFromHash=()=>{
    const id=(root.defaultView?.location.hash||'').replace(/^#rs-?/,'').replace(/^#/,'');
    if(!id||!STUDIES.some(x=>x.id===id))return;
    let card=root.getElementById('rs-'+id);if(!card){draw('all');card=root.getElementById('rs-'+id);}
    if(card){card.open=true;card.scrollIntoView({block:'start'});}
  };
  openFromHash();root.defaultView?.addEventListener('hashchange',openFromHash);
}
if(typeof document!=='undefined')render();
