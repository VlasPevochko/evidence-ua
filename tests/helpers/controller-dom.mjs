// A layout-free DOM boundary for exercising the mounted controllers and their
// registered handlers. Browser QA separately verifies CSS/layout and actual Tab.
export function controllerDOM({href='https://evidence.invalid/',phone=false}={}){
 const nodes=new Map(),groups=new Map(),media=new Map(),timers=new Map();let timerId=0,activeElement=null;
 function eventTarget(target={}){
  const handlers=new Map();
  return Object.assign(target,{handlers,
   addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(fn);},
   removeEventListener(type,fn){handlers.get(type)?.delete(fn);},
   emit(type,event={}){for(const fn of handlers.get(type)||[])fn(event);}
  });
 }
 function node(key){
  if(!nodes.has(key)){
   const item=eventTarget({innerHTML:'',textContent:'',hidden:false,disabled:false,value:0,dataset:{},attributes:{},
    style:{setProperty(name,value){this[name]=value;}},classList:{toggle(){},contains(){return false;}},
    setAttribute(name,value){this.attributes[name]=value;},
    toggleAttribute(name,on){this.attributes[name]=on;if(name==='hidden')this.hidden=on;},
    querySelector:selector=>node(selector==='svg'?key+' > svg':selector),
    querySelectorAll:selector=>groups.get(selector)||[],contains(){return false;},
    closest(selector){return selector.split(',').some(s=>this.matches(s))?this:null;},
    matches(selector){return selector==='button'||Object.keys(this.dataset).some(field=>selector===`[data-${field.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`);},
    focus(){activeElement=this;},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;this.emit('close');}
   });
   nodes.set(key,item);
  }
  return nodes.get(key);
 }
 const buttons=(selector,field,values)=>{
  const items=values.map(value=>{const item=node(`${selector}:${value}`);item.dataset[field]=value;return item;});
  groups.set(selector,items);return items;
 };
 const location={href,hash:new URL(href).hash};
 const view=eventTarget({location,history:{replaceState(_state,_title,url){location.href=String(url);location.hash=new URL(url).hash;}},
  matchMedia(query){if(!media.has(query))media.set(query,eventTarget({matches:query==='(max-width: 760px)'&&phone}));return media.get(query);},
  setInterval(fn){const id=++timerId;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);},
  requestAnimationFrame(){return 1;},cancelAnimationFrame(){}
 });
 const root=eventTarget({defaultView:view,hidden:false,querySelector:node,querySelectorAll:selector=>groups.get(selector)||[]});
 return {root,node,buttons,view,location,groups,
  active:()=>activeElement,
  click(dataset){const button=node('click-'+JSON.stringify(dataset));button.dataset=dataset;root.emit('click',{target:button});},
  key(key,target=activeElement,host=root){let prevented=false;host.emit('keydown',{key,target,preventDefault(){prevented=true;}});return prevented;},
  resize(phone){const query=view.matchMedia('(max-width: 760px)');query.matches=phone;query.emit('change');},
  tick(){for(const fn of [...timers.values()])fn();},
  schedule:fn=>view.setInterval(fn),unschedule:id=>view.clearInterval(id)
 };
}
