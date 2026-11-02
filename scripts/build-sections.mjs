// Індекс розділів сторінок для пошуку (рішення власника 2026-11-02: «давай всередині також»).
// Читає готові сторінки dist/*.html, знаходить розділи (заголовки h2/h3 і назви блоків <details> з id), складає для кожного посилання
// й записує dist/platform-sections.js. Пошук (src/platform/search.mjs) завантажує цей файл лише при першому відкритті вікна.
// Нічого не вигадуємо: назви беруться зі сторінок, а слова для пошуку з scripts/sections-config.mjs лише ведуть до розділу.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {SKIP_PAGES,SKIP_ANCHOR,WRAPPER_ANCHOR,SKIP_KEYS,SKIP_TITLES,SKIP_INSIDE_CLASS,TITLE_WORDS,ANCHOR_WORDS} from './sections-config.mjs';
import {normalizeTitle} from '../src/platform/anchor-reveal.mjs';
// Дані сторінки «Дослідження простими словами» (рішення D3, бриф T7): розбори малює скрипт сторінки, у готовому HTML їх немає, тому беремо з тих самих даних.
import {STUDIES,TOPICS} from '../dist/research-data.js';

const VOID=new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
const RAW=/<(script|style|template|textarea|title|svg|noscript)\b[\s\S]*?<\/\1>/gi;
const EXCLUDED_TAGS=new Set(['dialog','nav','header','footer','aside','form','template']);
const MIN_TITLE=3,MAX_TITLE=90;
const skipTitles=new Set([...SKIP_TITLES].map(normalizeTitle));
const titleWords=new Map(Object.entries(TITLE_WORDS).map(([title,words])=>[normalizeTitle(title),words]));
export const SIZE_BUDGET=70000;

const decode=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
  .replace(/&#(\d+);/g,(m,n)=>String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi,(m,n)=>String.fromCodePoint(parseInt(n,16)));

// Маленький розбирач HTML: достатньо для наших сторінок (теги, атрибути, вкладеність). Скрипти, стилі й шаблони відкидає.
export function parseHtml(html){
  html=html.replace(/<!--[\s\S]*?-->/g,'').replace(RAW,'');
  const root={tag:'#root',attrs:{},kids:[],parent:null};
  let cur=root;
  const re=/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)|</g;
  let m;
  while((m=re.exec(html))){
    if(m[5]!==undefined){cur.kids.push({text:m[5],parent:cur});continue;}
    if(!m[2])continue;
    const tag=m[2].toLowerCase();
    if(m[1]){let n=cur;while(n&&n.tag!==tag)n=n.parent;if(n&&n!==root)cur=n.parent;continue;}
    const attrs={};
    for(const a of m[3].matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g))attrs[a[1].toLowerCase()]=a[2]??a[3]??a[4]??'';
    if(tag==='li'&&cur.tag==='li')cur=cur.parent;
    if(tag==='p'&&cur.tag==='p')cur=cur.parent;
    const node={tag,attrs,kids:[],parent:cur};
    cur.kids.push(node);
    if(!VOID.has(tag)&&!m[4])cur=node;
  }
  return root;
}

const isEl=n=>n.tag!==undefined;
export function walk(n,fn){if(isEl(n))fn(n);for(const k of n.kids||[])walk(k,fn);}
export function ancestors(n){const out=[];for(let p=n.parent;p&&p.tag!=='#root';p=p.parent)out.push(p);return out;}
const hasClass=(n,re)=>re.test(n.attrs?.class||'');

// Текст елемента без декоративних частин (піктограми, приховані для читачів екрана, службові лічильники).
function plainText(n,skip){
  if(n.text!==undefined)return n.text;
  if(skip&&skip(n))return '';
  return n.kids.map(k=>plainText(k,skip)).join(' ');
}
export const clean=s=>decode(s).replace(/\s+/g,' ').replace(/\s+([,.;:!?…])/g,'$1').replace(/^[\s↑↓→←↗↘＋+•·▸▾\-–—]+/,'').replace(/[\s↑↓→←↗↘＋+•·▸▾]+$/,'').trim();
const decorative=n=>n.tag==='svg'||n.tag==='img'||n.attrs['aria-hidden']==='true'||n.tag==='small'||n.tag==='i'||hasClass(n,/count|number|icon|arrow|chev|hint|meta|open/i);

// Назва блоку <details>: окремий заголовок усередині (strong, h3, елемент із title у класі), інакше весь текст без службових частин.
export function summaryTitle(summary){
  let named=null;
  walk(summary,n=>{if(!named&&n!==summary&&(['strong','b','h2','h3','h4'].includes(n.tag)||hasClass(n,/title/i)))named=n;});
  const text=clean(plainText(named||summary,named?null:decorative)).replace(/\s*·\s*\d+$/,'');
  return text;
}

function pageParts(href){
  const [beforeHash,hash='']=href.replace(/^\.\//,'').split('#');
  const [page,query='']=beforeHash.split('?');
  return {page,query,hash};
}

export function extractSections(html,{page,materials=[]}){
  const root=parseHtml(html);
  const all=[];walk(root,n=>all.push(n));
  const containsH1=n=>{let found=false;walk(n,x=>{if(x.tag==='h1')found=true;});return found;};
  const mats=materials.map(m=>({...pageParts(m.href),title:m.title})).filter(m=>m.page===page);
  const pageMaterial=mats.find(m=>!m.hash)?.title||null;
  const materialByAnchor=new Map();
  for(const m of mats)if(m.hash&&!materialByAnchor.has(m.hash))materialByAnchor.set(m.hash,m.title);
  const materialHrefs=new Set(mats.map(m=>m.hash?`${page}#${m.hash}`:page));

  const excluded=n=>ancestors(n).some(a=>EXCLUDED_TAGS.has(a.tag)||'hidden' in a.attrs||a.attrs['aria-hidden']==='true'||hasClass(a,/eua-site-header|eua-search/))||'hidden' in n.attrs;
  const candidates=all.filter(n=>n.tag==='h2'||n.tag==='h3'||(n.tag==='summary'&&n.parent?.tag==='details'&&n.parent.attrs.id));
  // Як заголовок шукатиме anchor-reveal.js: усередині цілі (#якір, а без якоря на всій сторінці) серед h2, h3 і summary, крім діалогів, навігації,
  // шапки, підвалу й прихованого; порівнюється весь текст елемента. Тут той самий відбір, щоб номер збігу (n) у посиланні збігався зі сторінкою.
  const hiddenForReveal=n=>[n,...ancestors(n)].some(a=>['dialog','nav','header','footer'].includes(a.tag)||'hidden' in a.attrs||a.attrs['aria-hidden']==='true');
  const fullText=n=>normalizeTitle(clean(plainText(n)));
  const sameTitleOrder=(scope,title,target)=>{
    const list=[];
    walk(scope,n=>{if(n!==scope&&(n.tag==='h2'||n.tag==='h3'||n.tag==='summary')&&!hiddenForReveal(n)&&fullText(n)===title)list.push(n);});
    return {k:list.indexOf(target)+1,total:list.length};
  };

  const groups=new Map(); // якір → скільки заголовків уже взято (перший заголовок блоку вважається його назвою)
  const firstTitle=new Map();
  const out=[];
  for(const h of candidates){
    if(excluded(h)||(h.tag!=='h2'&&ancestors(h).some(a=>SKIP_INSIDE_CLASS.test(a.attrs.class||''))))continue;
    const title=(h.tag==='summary'?summaryTitle(h):clean(plainText(h,decorative))).replace(/\.+$/,'');
    const norm=normalizeTitle(title);
    if(title.length<MIN_TITLE||title.length>MAX_TITLE||!/[\p{L}]/u.test(title)||skipTitles.has(norm))continue;
    const own=h.tag==='summary'?h.parent.attrs.id:h.attrs.id;
    let anchor=own||'',anchorNode=own?(h.tag==='summary'?h.parent:h):null,viaAncestor=false;
    if(!anchor){
      // Найближчий предок із id. Обгортки всієї сторінки пропускаємо вгору; якір джерел, вкладок чи словника означає, що це не розділ.
      for(const a of ancestors(h)){if(a.attrs.id&&!WRAPPER_ANCHOR.test(a.attrs.id)){anchor=a.attrs.id;anchorNode=a;viaAncestor=true;break;}}
    }
    if(anchor&&(SKIP_ANCHOR.test(anchor)||SKIP_KEYS.has(`${page}#${anchor}`)))continue;
    // До якого матеріалу належить розділ: найближчий предок із id матеріалу, інакше матеріал-сторінка. Без матеріалу розділ не показуємо.
    let parent=null;
    for(let n=h;n&&n.tag!=='#root';n=n.parent){if(n.attrs?.id&&materialByAnchor.has(n.attrs.id)){parent=materialByAnchor.get(n.attrs.id);break;}}
    parent=parent||pageMaterial;
    if(!parent)continue;
    const root_=viaAncestor&&anchorNode&&(containsH1(anchorNode)||['body','main'].includes(anchorNode.tag));
    const key=anchor?`${page}#${anchor}`:`${page}?`;
    const order=(groups.get(key)||0)+1;groups.set(key,order);
    if(order===1)firstTitle.set(key,norm);
    let href,needsTitle=false;
    if(anchor&&!root_){href=`${page}#${anchor}`;}
    else{
      // Розділ без власного якоря в кореневому блоці (картка твердження, заголовок сторінки): посилання з назвою, її знаходить anchor-reveal.js.
      if(root_&&order===1&&h.tag==='h2')continue; // заголовок-гасло самого матеріалу: він і так знаходиться як матеріал
      needsTitle=true;
      // Заголовок із декоративними частинами (піктограма, підпис) сторінка за назвою не знайде: такий розділ не беремо.
      if(fullText(h)!==norm||hiddenForReveal(h))continue;
      const {k,total}=sameTitleOrder(anchorNode||root,norm,h);
      href=`${page}?section=${encodeURIComponent(title)}${total>1&&k>1?`&n=${k}`:''}${anchor?`#${anchor}`:''}`;
    }
    // Назву самого матеріалу чи його блоку повторно не показуємо: вона вже є в групі «Матеріали».
    if(norm===normalizeTitle(parent))continue;
    if(!needsTitle&&materialHrefs.has(href)&&(order===1||norm===firstTitle.get(key)))continue;
    const kind=h.tag==='summary'?'block':h.parent&&hasClass(h.parent,/claim/i)?'claim':'section';
    const words=[titleWords.get(norm),order===1&&!needsTitle?ANCHOR_WORDS[key]:null].filter(Boolean).join(' ');
    out.push({href,title,parent,kind,words,key,needsTitle});
  }
  return out;
}

export function buildSections(root=process.cwd(),materials){
  const dist=path.join(root,'dist');
  const rows=[];
  for(const file of fs.readdirSync(dist).filter(f=>f.endsWith('.html')).sort()){
    if(SKIP_PAGES.has(file))continue;
    rows.push(...extractSections(fs.readFileSync(path.join(dist,file),'utf8'),{page:file,materials}));
  }
  // Один і той самий розділ двічі не показуємо.
  const seen=new Set();
  const unique=rows.filter(r=>{const id=`${r.href}|${normalizeTitle(r.title)}`;if(seen.has(id))return false;seen.add(id);return true;});
  // Розбори досліджень (kind «study»): назва це питання з даних, посилання research.html#rs-<id> (id картки; відкриває її research-page.js), слова це назва теми з картки
  // («Рух», «Сон», «Харчування», «Добавки»). Відповідей і висновків в індекс не беремо: пошук лише веде до сторінки й нічого не стверджує.
  const researchTitle=materials?.find(m=>m.href==='./research.html')?.title;
  if(researchTitle)for(const study of STUDIES){
    const href=`research.html#rs-${study.id}`; // справжній id картки (dist/research-page.js: card.id='rs-'+s.id); сторінка розуміє й «#<id>», але якір має існувати в документі
    unique.push({href,title:study.question,parent:researchTitle,kind:'study',words:String(TOPICS[study.topic]||'').toLocaleLowerCase('uk'),key:href,needsTitle:false});
  }
  // Слова для окремого розділу мусять вказувати на реальний розділ (інакше слово залишилось би після зміни сторінки).
  const keys=new Set(unique.map(r=>r.key));
  for(const k of Object.keys(ANCHOR_WORDS))if(!keys.has(k))throw Error(`scripts/sections-config.mjs: ANCHOR_WORDS has no section for ${k}`);
  return unique;
}

export function renderModule(rows){
  const lines=rows.map(r=>JSON.stringify([r.href,r.title,r.parent,r.kind,r.words]));
  return `// Згенеровано scripts/build-sections.mjs з готових сторінок dist/*.html. Не редагувати вручну: зміни робляться в сторінках або в scripts/sections-config.mjs.\n// Рядок: [посилання, назва розділу, матеріал, вид (section | block | claim | study), слова для пошуку]. Вид study це розбір дослідження зі сторінки research.html (дані dist/research-data.js).\nexport const sections=[\n${lines.join(',\n')}\n];\n`;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {materials}=await import('../src/platform/materials.mjs');
  const rows=buildSections(process.cwd(),materials);
  const text=renderModule(rows);
  if(text.length>SIZE_BUDGET)throw Error(`dist/platform-sections.js is ${text.length} bytes, over the ${SIZE_BUDGET} byte budget`);
  fs.writeFileSync('dist/platform-sections.js',text);
  console.log(`Section index: ${rows.length} sections, ${text.length} bytes.`);
}
