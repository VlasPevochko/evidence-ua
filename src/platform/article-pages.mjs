// Розбори добавок окремими сторінками (рішення власника «3 та 7» і «2-4 так», 2026-11-15/16; план у docs/HOME_SPLIT_PLAN.md).
// Збірка, як і раніше, складає один спільний документ (dist/index.html: головна й 11 розборів). Цей модуль ріже з нього
// сторінку одного розбору: та сама шапка документа, той самий розділ розбору байт у байт, той самий хвіст зі скриптами.
// Змінюється лише те, що мусить змінитись, і більше нічого:
//   назва вкладки й канонічна адреса; позначки на <body>, які раніше ставив скрипт-перемикач головної;
//   посилання-якорі, що вели в інший розбір чи на головну (на окремій сторінці такого якоря немає);
//   скрипт-перемикач головної замінено коротким скриптом сторінки розбору.
// Наукові тексти не змінюються: tests/article-pages.test.mjs порівнює розділ у сторінці з розділом у спільному документі.
// Модуль чистий (без DOM і файлів).
export const ARTICLES=[
  {id:'creatine',file:'creatine.html',name:'Креатин'},
  {id:'supplement-protein',file:'supplement-protein.html',name:'Протеїн'},
  {id:'supplement-caffeine',file:'supplement-caffeine.html',name:'Кофеїн'},
  {id:'supplement-omega',file:'supplement-omega.html',name:'Омега-3'},
  {id:'supplement-vitd',file:'supplement-vitd.html',name:'Вітамін D'},
  {id:'supplement-magnesium',file:'supplement-magnesium.html',name:'Магній'},
  {id:'supplement-collagen',file:'supplement-collagen.html',name:'Колаген'},
  {id:'supplement-beta-alanine',file:'supplement-beta-alanine.html',name:'Бета-аланін'},
  {id:'supplement-citrulline',file:'supplement-citrulline.html',name:'Цитрулін'},
  {id:'supplement-electrolytes',file:'supplement-electrolytes.html',name:'Електроліти'},
  {id:'supplement-berberine',file:'supplement-berberine.html',name:'Берберин'}
];
// name: назва добавки, як у списку бібліотеки на головній (tests/article-pages.test.mjs звіряє їх зі списком .se-list).
export const ARTICLE_FILES=ARTICLES.map(article=>article.file);
const escapeRegExp=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const escAttr=text=>String(text).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const stripTags=text=>text.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();

// Межі розділу <section id="…">: від відкривного тега до парного </section> (рахуємо вкладені розділи).
export function sectionSpan(html,id){
  const open=new RegExp(`<section\\b[^>]*\\bid="${escapeRegExp(id)}"[^>]*>`).exec(html);
  if(!open)throw new Error(`The combined document has no <section id="${id}">`);
  let depth=0;
  const tags=/<section\b|<\/section>/g;
  tags.lastIndex=open.index;
  for(let tag;(tag=tags.exec(html));){
    depth+=tag[0]==='</section>'?-1:1;
    if(depth===0)return {start:open.index,end:tag.index+tag[0].length};
  }
  throw new Error(`<section id="${id}"> is not closed`);
}

// Розкладка спільного документа: шапка, головна, проміжок (діалог), розбори з тим, що стоїть одразу після них, і хвіст.
export function layout(html){
  const bodyOpen=/<body\b[^>]*>/.exec(html);
  if(!bodyOpen)throw new Error('The combined document has no <body>');
  const mainEnd=html.indexOf('</main>');
  if(mainEnd<0||mainEnd<bodyOpen.index)throw new Error('The combined document has no home <main>');
  const spans=ARTICLES.map(article=>({...article,...sectionSpan(html,article.id)}));
  spans.forEach((span,index)=>{
    if(span.start<mainEnd)throw new Error(`«${span.id}» must stand after the home <main>`);
    if(index&&span.start<spans[index-1].end)throw new Error(`«${span.id}» overlaps the previous review or is out of order`);
  });
  // Усі розділи-розбори в документі мають бути в списку: новий розбір без рядка в ARTICLES зупиняє збірку.
  const known=new Set(ARTICLES.map(article=>article.id));
  for(const match of html.slice(mainEnd).matchAll(/<section\b[^>]*\bid="(creatine|supplement-[a-z0-9-]+)"/g)){
    if(!known.has(match[1]))throw new Error(`A review section «${match[1]}» is missing from ARTICLES`);
  }
  const last=spans.at(-1);
  // Шапка головної: перший <header> у <main class="page">. Спільний скрипт сайту перетворює її на шапку сайту; у режимі розбору з усієї головної видно лише її.
  const mainOpen=html.indexOf('<main class="page">',bodyOpen.index);
  const headerStart=mainOpen+'<main class="page">'.length,headerEnd=html.indexOf('</header>',headerStart);
  if(mainOpen<0||!html.startsWith('<header class="home-header">',headerStart)||headerEnd<0||headerEnd>mainEnd)throw new Error('The home <main class="page"> must start with <header class="home-header">');
  return {
    head:html.slice(0,bodyOpen.index),
    bodyOpen:bodyOpen[0],
    header:html.slice(headerStart,headerEnd+'</header>'.length),
    between:html.slice(mainEnd+'</main>'.length,spans[0].start),
    articles:spans.map((span,index)=>({id:span.id,file:span.file,name:span.name,section:html.slice(span.start,span.end),
      // Те, що стоїть між цим розбором і наступним (скрипт і стилі пошуку PubMed після «Креатину»), належить цьому розбору.
      extra:index<spans.length-1?html.slice(span.end,spans[index+1].start):''})),
    tail:html.slice(last.end)
  };
}

// Куди веде якір: у свій розбір (лишається), в інший розбір (нова сторінка) або на головну.
export function anchorOwners(html){
  const parts=layout(html),owners=new Map();
  for(const article of parts.articles){
    for(const match of (article.section+article.extra).matchAll(/\bid="([^"]+)"/g))if(!owners.has(match[1]))owners.set(match[1],article.id);
  }
  return owners;
}
export function rewriteHashLinks(fragment,id,owners){
  const files=new Map(ARTICLES.map(article=>[article.id,article.file]));
  return fragment.replace(/\bhref="#([^"]*)"/g,(whole,anchor)=>{
    const owner=owners.get(anchor);
    if(owner===id)return whole;
    if(owner)return `href="./${files.get(owner)}${anchor===owner?'':'#'+anchor}"`;
    return `href="./index.html${anchor&&anchor!=='top'?'#'+anchor:''}"`;
  });
}

// Скрипти, потрібні лише самій головній (хвиля героя, лінза, каталог напрямів, путівник «Як читати докази», відгук, блок «Про сайт»).
// Вони шукають розмітку головної, якої на сторінці розбору немає, тому тут не підключаються.
export const HOME_ONLY_SCRIPTS=['home-catalog.js','navigation-v17.js','home-feedback.js','feedback-send.js','evidence-trainer.js','home-about.js','home-spectrum.js','home-lens.js'];

// Скрипт-перемикач головної (показував розбір замість головної за адресою index.html#…). На сторінці розбору його роль виконує розмітка.
export const ROUTER_MARK="const views=[document.getElementById('creatine'),...document.querySelectorAll('body>section[id^=\"supplement-\"]')];";
export function pageScript(){
  // Клас route-active раніше ставив перемикач; його читає evidence/ui.js. Закриття діалогу кліком по тлу перенесено без змін.
  return `<script>
(()=>{
 const view=document.querySelector('body>section[id]');
 if(view)view.classList.add('route-active');
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{
  if(e.target!==d)return;const r=d.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();
 }));
})();
</script>`;
}

// Назва вкладки: «Назва добавки — Evidence UA», як на решті внутрішніх сторінок. Перемикач головної брав текст <h1> розбору («ПРОТЕЇН», «Креатин.»);
// окрема сторінка з’являється в пошуку й закладках, тому назва береться зі списку добавок у звичайному написанні.
export function articleTitle(article){return article.name+' — Evidence UA';}
// Опис для пошуку й месенджерів: один шаблон на всі розбори, без жодного твердження про саму добавку.
export function articleDescription(article){return `Розбір добавки «${article.name}»: що показують дослідження, де межі висновків і які джерела. Матеріал освітній, не персональна медична рекомендація.`;}

// html: спільний документ; id: розбір; base: адреса сайту з site.json (з кінцевою «/»); indexable: чи пускати сторінку в пошукові системи.
// styles: стилі, які на головній підключав скрипт (navigation-v17.js додавав navigation-v17.css); тут вони стоять звичайним <link>.
export function articlePageHTML(html,id,{base,indexable=false,styles=[]}){
  if(!/^https:\/\/[^\s"]+\/$/.test(base||''))throw new Error('The site address (base) must be an https URL ending with «/»');
  const parts=layout(html),article=parts.articles.find(item=>item.id===id);
  if(!article)throw new Error(`Unknown review «${id}»`);
  const owners=anchorOwners(html);
  if(!/<h1\b/.test(article.section))throw new Error(`«${id}» must have an <h1>`);
  const title=articleTitle(article),description=articleDescription(article),address=base+article.file,card=base+'og/'+article.file.replace(/\.html$/,'.jpg');

  let head=parts.head;
  const replaceOnce=(pattern,replacement,what)=>{
    const matches=head.match(new RegExp(pattern.source,pattern.flags.includes('g')?pattern.flags:pattern.flags+'g'))||[];
    if(matches.length!==1)throw new Error(`The combined head must have exactly one ${what} (found ${matches.length})`);
    head=head.replace(pattern,replacement);
  };
  replaceOnce(/<title>[\s\S]*?<\/title>/,()=>`<title>${escAttr(title)}</title>`,'<title>');
  replaceOnce(/<link rel="canonical" href="[^"]*">/,()=>`<link rel="canonical" href="${escAttr(address)}">`+(indexable?'':'<meta name="robots" content="noindex">'),'canonical link');
  // Опис і картка для месенджерів: свої для кожного розбору (картки малює scripts/make-og-cards.mjs у dist/og/).
  const meta=(attribute,key,value)=>replaceOnce(new RegExp(`<meta ${attribute}="${escapeRegExp(key)}" content="[^"]*">`),()=>`<meta ${attribute}="${key}" content="${escAttr(value)}">`,`<meta ${attribute}="${key}">`);
  meta('name','description',description);
  meta('property','og:title',title);
  meta('property','og:description',description);
  meta('property','og:url',address);
  meta('property','og:image',card);
  meta('property','og:image:alt','Картка сторінки: '+title);
  // Без скрипта розбір має бути видно: раніше його показували :target і перемикач.
  // Правила головної ховають розбори й сам <main> у режимі розбору, а показував їх перемикач (стиль на елементі).
  // Тут це робить правило з тією самою силою, що й правила-схованки, але пізніше в документі.
  const visible=`<style data-article-page>body[data-article="${escAttr(id)}"][data-route-view="article"]>#${id}{display:block!important}body[data-article][data-route-view="article"]>.page{display:block!important}</style>`;
  for(const name of HOME_ONLY_SCRIPTS){
    const tag=new RegExp(`<script\\b[^>]*\\bsrc="\\./${escapeRegExp(name)}(?:\\?[^"]*)?"[^>]*></script>`,'g');
    const found=head.match(tag)||[];
    if(found.length!==1)throw new Error(`The combined head must load ${name} exactly once (found ${found.length})`);
    head=head.replace(tag,'');
  }
  if(!head.includes('</head>'))throw new Error('The combined head is not closed');
  for(const href of styles)if(!/^\.\/[a-z0-9.-]+\.css\?v=\d+$/.test(href))throw new Error(`Unexpected stylesheet address: ${href}`);
  head=head.replace('</head>',styles.map(href=>`<link rel="stylesheet" href="${href}">`).join('')+visible+'</head>');

  if(/\bdata-route-view=|\bdata-article=/.test(parts.bodyOpen))throw new Error('The combined <body> must not carry article markers');
  const bodyOpen=parts.bodyOpen.replace(/>$/,` data-route-view="article" data-article="${escAttr(id)}">`);

  const routerStart=parts.tail.indexOf('<script>'),routerEnd=parts.tail.indexOf('</script>',routerStart);
  if(routerStart<0||routerEnd<0||!parts.tail.slice(routerStart,routerEnd).includes(ROUTER_MARK))throw new Error('The home router script was not found right after the reviews');
  const tail=parts.tail.slice(0,routerStart)+pageScript()+parts.tail.slice(routerEnd+'</script>'.length);

  // Блоки <style>, що стоять між розборами (після «Креатину»), містять правила й для інших розборів, тому йдуть на кожну сторінку;
  // скрипт між розборами (пошук PubMed) лишається тільки на сторінці свого розбору.
  const foreignStyles=parts.articles.filter(item=>item.id!==id).map(item=>(item.extra.match(/<style\b[^>]*>[\s\S]*?<\/style>/g)||[]).join('')).join('');
  // У <main class="page" data-article-mode> лишається тільки шапка: так само, як на головній у режимі розбору.
  return head+bodyOpen+'<main class="page" data-article-mode>'+rewriteHashLinks(parts.header,id,owners)+'</main>'+parts.between
    +rewriteHashLinks(article.section,id,owners)+rewriteHashLinks(article.extra,id,owners)+foreignStyles+tail;
}
