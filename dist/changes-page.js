// Журнал оновлень: найновіший день розгорнуто, старші дні складені.
import {CHANGES,TAGS,SCIENCE} from './changes-data.js?v=4';

const months=['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
export const formatDate=iso=>{const [y,m,d]=iso.split('-').map(Number);return `${d} ${months[m-1]} ${y}`;};
export const total=(changes=CHANGES)=>changes.reduce((n,day)=>n+day.items.length,0);

export function render(root=document){
  const list=root.getElementById('ch-list'),summary=root.getElementById('ch-summary');
  if(!list)return;
  const make=(tag,cls,text)=>{const n=root.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  CHANGES.forEach((day,i)=>{
    const box=make('details','ch-day');box.open=i===0;
    const head=make('summary','');const time=make('time','',formatDate(day.date));time.dateTime=day.date;head.append(time,make('span','ch-count',String(day.items.length)));
    box.append(head);
    const ul=make('ul','ch-items');
    for(const item of day.items){
      const li=make('li','ch-item');
      const tag=make('span','ch-tag ch-tag-'+item.tag,TAGS[item.tag]);
      const a=make('a','ch-title',item.title);a.href=item.href;
      li.append(tag,a,make('p','ch-text',item.text),make('p','ch-science ch-science-'+item.science,SCIENCE[item.science]));
      ul.append(li);
    }
    box.append(ul);list.append(box);
  });
  if(summary)summary.textContent=`Останнє оновлення: ${formatDate(CHANGES[0].date)}. Записів у журналі: ${total()}.`;
}
if(typeof document!=='undefined')render();
