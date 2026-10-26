// User-generated text only: no network, persistence, tracking or automatic sending. (feedback-send.mjs is inactive until an endpoint is configured.)
import {materials} from './platform-materials.js?v=100';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function feedbackMaterial(href,selection){
 const id=typeof selection==='string'?selection:new URL(href).searchParams.get('feedbackFor');
 return materials.find(m=>m.id===id)||null;
}
export function feedbackMaterialOptions(){
 return '<option value="">Головна сторінка</option>'+[...new Set(materials.map(m=>m.areaTitle))].map(area=>`<optgroup label="${esc(area)}">${materials.filter(m=>m.areaTitle===area).map(m=>`<option value="${esc(m.id)}">${esc(m.title)}</option>`).join('')}</optgroup>`).join('');
}
export function feedbackReport(answers={},href='https://evidence-ua.surecrow3.chatgpt.site/',device='Не вказано'){
 const clean=value=>String(value||'').trim().slice(0,2000);
 const entries=[['Що було корисним або зрозумілим?',clean(answers.useful)],['Де було незрозуміло або щось не працювало?',clean(answers.stuck)],['Що варто змінити в першу чергу?',clean(answers.change)]];
 if(entries.every(([,answer])=>!answer))return null;
 const url=new URL(href); // Do not copy UTM parameters, query tokens or fragment data.
 const material=feedbackMaterial(href,answers.materialId);
 return ['Evidence UA · перше враження',`Сторінка: ${url.origin}${url.pathname}`,...(material?[`Матеріал: ${material.title} · ${material.areaTitle}`]:[]),`Пристрій: ${clean(device)}`,'',...entries.flatMap(([question,answer])=>[question,answer||'Без відповіді',''])].join('\n').trim();
}
export function mountHomeFeedback(root=document){
 const form=root.querySelector('#home-feedback-form');if(!form)return;
 const output=root.querySelector('#home-feedback-output'),text=root.querySelector('#home-feedback-text'),status=root.querySelector('#home-feedback-status'),copy=root.querySelector('#home-feedback-copy');
 const material=root.querySelector('#feedback-material'),clear=root.querySelector('#feedback-clear');
 if(material){material.innerHTML=feedbackMaterialOptions();material.value=feedbackMaterial(root.defaultView?.location?.href)?.id||'';}
 root.querySelector('#feedback-generate').disabled=false;
 const openFeedback=e=>{if(e.target.closest('a[href="#home-feedback"]'))root.querySelector('#home-feedback').open=true;};
 if(root.defaultView?.location?.hash==='#home-feedback')root.querySelector('#home-feedback').open=true;
 root.addEventListener('click',openFeedback);
 const generate=e=>{
  e.preventDefault();const report=feedbackReport({materialId:material?.value,useful:root.querySelector('#feedback-useful').value,stuck:root.querySelector('#feedback-stuck').value,change:root.querySelector('#feedback-change').value},root.defaultView?.location?.href,root.querySelector('#feedback-device').value);
  if(!report){output.hidden=true;status.textContent='Додайте відповідь хоча б на одне запитання.';return;}
  text.value=report;output.hidden=false;status.textContent='Текст готовий. Він не надісланий: скопіюйте й передайте людині, яка поділилася сайтом.';text.focus();
 };
 const invalidate=()=>{output.hidden=true;status.textContent='Відповіді змінено. Зберіть текст ще раз.';};
 const clearAnswers=()=>{for(const id of ['#feedback-useful','#feedback-stuck','#feedback-change'])root.querySelector(id).value='';text.value='';output.hidden=true;status.textContent='Відповіді очищено.';root.querySelector('#feedback-useful').focus();};
 const copyText=async()=>{
  copy.disabled=true;
  try{const clipboard=root.defaultView?.navigator?.clipboard;if(!clipboard?.writeText)throw Error('Clipboard unavailable');await clipboard.writeText(text.value);status.textContent='Скопійовано. Передайте цей текст людині, яка поділилася сайтом.';}
  catch{status.textContent='Автоматичне копіювання недоступне. Текст виділено — скопіюйте його вручну.';text.focus();text.select();}
  finally{copy.disabled=false;}
 };
 form.addEventListener('submit',generate);form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);copy.addEventListener('click',copyText);clear?.addEventListener('click',clearAnswers);
 return ()=>{form.removeEventListener('submit',generate);form.removeEventListener('input',invalidate);form.removeEventListener('change',invalidate);copy.removeEventListener('click',copyText);clear?.removeEventListener('click',clearAnswers);root.removeEventListener('click',openFeedback);};
}
if(typeof document!=='undefined')mountHomeFeedback();
