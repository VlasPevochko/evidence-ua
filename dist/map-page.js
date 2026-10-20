// Карта знань: вузли — сторінки сайту, лінії — ті самі сусідні матеріали, що в блоці «Куди далі».
import {NEXT_STEPS} from './platform-next-steps.js?v=2';

export const NODES={
  'cell-lab.html':{label:'Клітина',tag:'Cell Lab',x:11,y:30},
  'muscle-lab.html':{label:'М’язи',tag:'Muscle Lab',x:30,y:44},
  'atlas.html':{label:'Атлас тіла',tag:'Атлас',x:12,y:70},
  'movement.html':{label:'Рух',tag:'Movement Lab',x:35,y:80},
  'exercises.html':{label:'Вправи',tag:'Практика',x:57,y:70},
  'sleep.html':{label:'Сон',tag:'Відновлення',x:78,y:80},
  'nutrition-digestion.html':{label:'Травлення',tag:'Харчування',x:28,y:12},
  'nutrition.html':{label:'Від їжі до клітини',tag:'Харчування',x:52,y:24},
  'fat-burning.html':{label:'Куди зникає жир?',tag:'Харчування',x:77,y:34},
  'supplements.html':{label:'Добавки',tag:'Докази',x:90,y:14},
  'protein-meta.html':{label:'Розбір білка',tag:'Докази',x:90,y:56}
};
export function edges(){
  const seen=new Set(),out=[];
  for(const [file,items] of Object.entries(NEXT_STEPS))for(const [href] of items){
    const other=href.replace('./','').split('#')[0];
    if(!NODES[file]||!NODES[other]||file===other)continue;
    const key=[file,other].sort().join('|');if(seen.has(key))continue;seen.add(key);out.push([file,other]);
  }
  return out;
}
export const neighbours=file=>{const set=new Set();for(const [a,b] of edges()){if(a===file)set.add(b);if(b===file)set.add(a);}return [...set];};

export function mountMap(root=document){
  const stage=root.getElementById('km-stage'),svg=root.getElementById('km-lines'),holder=root.getElementById('km-nodes'),list=root.getElementById('km-list'),caption=root.getElementById('km-caption');
  if(!stage||!svg||!holder||!list)return;
  const NS='http://www.w3.org/2000/svg',reduce=root.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ex=file=>NODES[file].x*10,ey=file=>NODES[file].y*5.6;
  const lines=new Map(),nodes=new Map();
  edges().forEach(([a,b],i)=>{
    const g=root.createElementNS(NS,'g');g.dataset.a=a;g.dataset.b=b;
    const d=`M${ex(a)} ${ey(a)} L${ex(b)} ${ey(b)}`;
    const path=root.createElementNS(NS,'path');path.setAttribute('d',d);path.setAttribute('class','km-edge');g.append(path);
    if(!reduce){const dot=root.createElementNS(NS,'circle');dot.setAttribute('r','3');dot.setAttribute('class','km-dot');
      const m=root.createElementNS(NS,'animateMotion');m.setAttribute('dur',(5+(i%5))+'s');m.setAttribute('repeatCount','indefinite');m.setAttribute('path',d);m.setAttribute('begin',(-(i*0.9)%5)+'s');dot.append(m);g.append(dot);}
    svg.append(g);lines.set(i,g);
  });
  for(const [file,n] of Object.entries(NODES)){
    const a=root.createElement('a');a.className='km-node';a.href='./'+file;a.style.left=n.x+'%';a.style.top=n.y+'%';a.dataset.file=file;
    const s=root.createElement('span');s.textContent=n.tag;const b=root.createElement('strong');b.textContent=n.label;a.append(s,b);holder.append(a);nodes.set(file,a);
    const li=root.createElement('li');const link=root.createElement('a');link.href='./'+file;link.textContent=n.label;
    const near=root.createElement('p');near.textContent='Поруч: '+neighbours(file).map(f=>NODES[f].label).join(' · ');
    li.append(link,near);list.append(li);
  }
  const reset='Наведи або натисни на тему, щоб побачити сусідні матеріали.';
  function focus(file){
    const near=new Set(neighbours(file));
    stage.classList.add('has-focus');
    for(const [f,a] of nodes)a.classList.toggle('is-on',f===file||near.has(f));
    for(const g of lines.values())g.classList.toggle('is-on',g.dataset.a===file||g.dataset.b===file);
    caption.textContent=`${NODES[file].label}: поруч ${[...near].map(f=>NODES[f].label).join(', ')}.`;
  }
  function clear(){stage.classList.remove('has-focus');for(const a of nodes.values())a.classList.remove('is-on');for(const g of lines.values())g.classList.remove('is-on');caption.textContent=reset;}
  for(const [file,a] of nodes){a.addEventListener('mouseenter',()=>focus(file));a.addEventListener('focus',()=>focus(file));a.addEventListener('mouseleave',clear);a.addEventListener('blur',clear);}
}
if(typeof document!=='undefined')mountMap();
