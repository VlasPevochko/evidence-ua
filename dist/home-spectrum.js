import {mountSpectrumWave} from './home-spectrum-wave.mjs?v=1';

const mounts=new WeakMap();
const plainActivation=event=>!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&(event.button==null||event.button===0);
const visible=node=>node&&node.isConnected!==false&&!node.closest?.('[hidden]')&&(typeof node.getClientRects!=='function'||node.getClientRects().length>0);

// Enhance the canonical links and shared search; the authored HTML is useful
// on its own. No wheel/touch listeners or alternate catalog/search state.
export function mountHomeSpectrum(doc=globalThis.document) {
  const view=doc?.defaultView;
  const home=doc?.querySelector('.spectrum-home');
  if(!view||doc.body?.dataset.platformArea!=='home'||!home)return ()=>{};
  if(mounts.has(doc))return mounts.get(doc);
  const cleanups=[],triggers=new Map();
  const form=doc.getElementById('spectrum-search'),query=doc.getElementById('spectrum-query');
  const menu=doc.getElementById('spectrum-directions'),trigger=doc.getElementById('spectrum-directions-trigger');
  const canOpenMenu=typeof menu?.showModal==='function';
  const closeButton=menu?.querySelector('[data-spectrum-close]');
  const destroyWave=mountSpectrumWave(doc);
  let opener=null,restoreFocus=true,disposed=false,searchModule=null,request=0;
  const homeActive=()=>doc.body.dataset.routeView!=='article'&&visible(home);
  const listen=(node,type,handler,options)=>{
    if(!node)return;
    node.addEventListener(type,handler,options);
    cleanups.push(()=>node.removeEventListener(type,handler,options));
  };
  const expanded=value=>{for(const [item,restore]of triggers){if(homeActive())item.setAttribute('aria-expanded',String(value));else restore();}};
  function closeMenu(restore=true) {
    if(!menu?.open)return;
    restoreFocus=restore;
    menu.close();
  }
  function showMenu(event,item) {
    if(!canOpenMenu||!homeActive()||!plainActivation(event))return;
    event.preventDefault();
    opener=item;restoreFocus=true;
    // Native dialogs must not layer search and directions over one another.
    doc.querySelector('.eua-search[open]')?.close();
    if(!menu.open)menu.showModal();
    expanded(true);
    closeButton?.focus({preventScroll:true});
  }
  function bindTrigger(item) {
    if(!canOpenMenu||!item||triggers.has(item))return;
    const names=['role','aria-haspopup','aria-controls','aria-expanded'];
    const original=names.map(name=>[name,item.getAttribute(name)]);
    triggers.set(item,()=>{for(const [name,value]of original){if(value===null)item.removeAttribute(name);else item.setAttribute(name,value);}});
    syncTriggers();
    listen(item,'click',event=>showMenu(event,item));
    listen(item,'keydown',event=>{if(event.key===' '&&!event.repeat)showMenu(event,item);});
  }
  function syncTriggers() {
    for(const [item,restore]of triggers){
      if(!homeActive()){restore();continue;}
      item.setAttribute('role','button');item.setAttribute('aria-haspopup','dialog');
      item.setAttribute('aria-controls',menu.id);item.setAttribute('aria-expanded',String(menu.open));
    }
  }
  function bindHeader() {
    const header=doc.querySelector('.eua-site-header');
    bindTrigger(header?.querySelector('nav a[href="./directions.html"]'));
  }
  if(canOpenMenu){
    bindTrigger(trigger);bindHeader();
    // The shared header can mount on load after this module. Its lifecycle
    // event also covers a later explicit mount, without a MutationObserver.
    listen(doc,'eua:header-mounted',bindHeader);
    listen(view,'load',bindHeader,{once:true});
    listen(closeButton,'click',()=>closeMenu());
    listen(menu,'cancel',event=>{event.preventDefault();closeMenu();});
    listen(menu,'click',event=>{
      if(event.target===menu){
        const bounds=menu.getBoundingClientRect();
        if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeMenu();
        return;
      }
      const destination=event.target.closest?.('a');
      if(destination&&menu.contains(destination)&&plainActivation(event))closeMenu(false);
    });
    listen(menu,'close',()=>{
      expanded(false);
      if(!restoreFocus||disposed)return;
      const target=[opener,doc.querySelector('.eua-header-toggle'),trigger,query].find(visible);
      target?.focus({preventScroll:true});
    });
  }
  listen(view,'hashchange',()=>{request++;closeMenu(false);syncTriggers();});
  listen(view,'pagehide',()=>{request++;closeMenu(false);});
  function catalogFallback() {
    const target=new URL(form.getAttribute('action')||'./directions.html',view.location.href);
    if(query.value.trim())target.searchParams.set('q',query.value.trim());
    view.location.href=target.href;
  }
  if(form&&query)listen(form,'submit',async event=>{
    if(!homeActive())return;
    event.preventDefault();
    const current=++request,value=query.value;
    const searchButton=doc.querySelector('.eua-header-search');
    if(!searchButton){catalogFallback();return;}
    try{
      searchModule||=import('./platform-search.js?v=9');
      const {mountSearch}=await searchModule;
      if(disposed||current!==request||!homeActive())return;
      const controller=mountSearch(doc,searchButton);
      if(!controller){catalogFallback();return;}
      closeMenu(false);
      await controller.open(value,query);
    }catch{
      searchModule=null;
      if(!disposed&&current===request)catalogFallback();
    }
  });
  function dispose() {
    if(disposed)return;
    disposed=true;request++;
    closeMenu(false);
    for(const cleanup of cleanups)cleanup();
    for(const restore of triggers.values())restore();
    destroyWave();mounts.delete(doc);
  }
  mounts.set(doc,dispose);
  return dispose;
}

if(typeof document!=='undefined'){
  if(document.readyState==='complete')mountHomeSpectrum(document);
  else document.defaultView.addEventListener('load',()=>mountHomeSpectrum(document),{once:true});
}
