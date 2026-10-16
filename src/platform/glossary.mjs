import {glossary} from './glossary-data.mjs';

export function mountGlossary(root=document){
 const dialog=root.getElementById('term-dialog');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const terms=glossary[root.body.dataset.platformArea]||[];
 const close=root.getElementById('term-close');
 let opener=null;
 for(const trigger of root.querySelectorAll('[data-term]')){
  const term=terms.find(item=>item.id===trigger.dataset.term);
  if(!term)continue;
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-controls','term-dialog');
  trigger.setAttribute('aria-expanded','false');
  trigger.addEventListener('click',event=>{
   root.getElementById('term-dialog-title').textContent=term.title;
   root.getElementById('term-dialog-definition').textContent=term.definition;
   root.getElementById('term-dialog-example').textContent=term.example;
   const source=root.getElementById('term-dialog-source');
   source.textContent=term.source.label+' ↗';source.href=term.source.href;
   if(!dialog.open)dialog.showModal();
   opener?.setAttribute('aria-expanded','false');
   opener=trigger;opener.setAttribute('aria-expanded','true');
   close.focus();event.preventDefault();
  });
 }
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{
  const previous=opener;opener=null;
  previous?.setAttribute('aria-expanded','false');previous?.focus();
 });
}

if(typeof document!=='undefined')mountGlossary();
