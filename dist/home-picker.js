// The chooser is intentional navigation, independent of decorative scroll motion.
export function mountHomePicker(doc, section) {
  const view=doc?.defaultView;
  const panel=section?.querySelector('[data-lens-picker]');
  const trigger=section?.querySelector('[data-lens-reveal]');
  const close=panel?.querySelector('[data-lens-picker-close]');
  if(!view||!trigger||!close||typeof panel.showModal!=='function')return ()=>{};
  const names=['role','aria-haspopup','aria-controls','aria-expanded'];
  const original=names.map(name=>[name,trigger.getAttribute(name)]);
  const cleanups=[];
  let restore=true,disposed=false;
  const listen=(node,type,handler)=>{
    node.addEventListener(type,handler);
    cleanups.push(()=>node.removeEventListener(type,handler));
  };
  const plain=event=>!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey
    &&!event.shiftKey&&!event.altKey&&!(event.button>0);
  function finishClose(){
    // Native close events are queued: an older event can arrive after reopen.
    if(panel.open)return;
    trigger.setAttribute('aria-expanded','false');
    if(restore&&!disposed){restore=false;trigger.focus({preventScroll:true});}
  }
  function dismiss(returnFocus=true){
    if(!panel.open)return;
    restore=returnFocus;
    panel.close();
    finishClose();
  }
  function show(event){
    if(disposed||(event&&!plain(event)))return;
    try{
      restore=true;
      if(!panel.open)panel.showModal();
      trigger.setAttribute('aria-expanded','true');
      close.focus({preventScroll:true});
      // Prevent only after successful opening so failure retains the real link.
      event?.preventDefault();
    }catch{ /* Native ./directions.html remains available. */ }
  }
  function followHash(){
    if(view.location.hash==='#cards')show();
    else dismiss(false);
  }
  trigger.setAttribute('role','button');
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-controls','home-directions-picker');
  trigger.setAttribute('aria-expanded','false');
  listen(trigger,'click',show);
  listen(trigger,'keydown',event=>{if(event.key===' '&&!event.repeat)show(event);});
  listen(close,'click',()=>dismiss());
  listen(panel,'cancel',event=>{event.preventDefault();dismiss();});
  listen(panel,'close',finishClose);
  listen(panel,'click',event=>{
    const link=event.target.closest?.('a');
    if(link&&panel.contains(link)&&plain(event)){dismiss(false);return;}
    if(event.target!==panel)return;
    const box=panel.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dismiss();
  });
  listen(view,'hashchange',followHash);
  listen(view,'pagehide',()=>dismiss(false));
  followHash();
  return ()=>{
    if(disposed)return;
    disposed=true;dismiss(false);
    for(const cleanup of cleanups.reverse())cleanup();
    for(const [name,value]of original){if(value===null)trigger.removeAttribute(name);else trigger.setAttribute(name,value);}
  };
}
