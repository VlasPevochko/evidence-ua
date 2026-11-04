// Генерує dist/palette-cosmic.css: значення токенів --c-* (кольори) і --rd-* (радіуси) космічного стилю (за замовчуванням) + ручні доповнення з src/palette/cosmic-extras.css.
// Токени знаходимо в самих стилях, тож нова var(--c-…) без запису тут неможлива. Зелений варіант: html[data-palette="green"] (токени не задано).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {toHex,parseColor} from './palette/css-colors.mjs';
import {cosmicOf,plateOf} from './palette/cosmic-map.mjs';
import {shapeOf,CARD_SHADOW_TOKEN,CARD_SHADOW_VALUE} from './shapes/shape-map.mjs';
import {CSS_TARGETS,HTML_TARGETS,EXTRAS,OUTPUT,SVG_ATTR,plateSources,ARTICLE_CSS,ARTICLE_EXTRAS,ARTICLE_OUTPUT,ARTICLE_SCOPE,ARTICLE_PARITY} from './palette/targets.mjs';
import {articleOverrides} from './palette/article-overrides.mjs';

// Правила для темних плит під схемами (SVG-атрибути без токенів): [fill="#0d2230" i]{fill:#…} лише в космічній палітрі. Зелений варіант їх не має, тож показує оригінал.
export function plateRules(root=process.cwd()){
  const found=new Map();
  for(const f of plateSources(root)){
    const text=fs.readFileSync(path.join(root,f),'utf8');
    for(const m of text.matchAll(SVG_ATTR)){
      const prop=m[1],raw=m[2].toLowerCase(),to=plateOf(parseColor(raw));
      if(to)found.set(`${prop} ${raw}`,`html:not([data-palette="green"]) [${prop}="${raw}" i]{${prop}:${toHex({...to,a:1})}}`);
    }
  }
  return [...found.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([,rule])=>rule);
}

export function tokenKeys(root=process.cwd()){
  const keys=new Set();
  for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    for(const m of fs.readFileSync(file,'utf8').matchAll(/var\(--c-([0-9a-f]{6}(?:[0-9a-f]{2})?),/g))keys.add(m[1]);
  }
  return [...keys].sort();
}
// Ключі радіусів: --rd-14 означає «радіус, що був 14px». Значення дає shapeOf.
export function shapeKeys(root=process.cwd()){
  const keys=new Set();
  for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    for(const m of fs.readFileSync(file,'utf8').matchAll(/var\(--rd-(\d+),/g))keys.add(+m[1]);
  }
  return [...keys].sort((a,b)=>a-b);
}
export function cosmicValue(key){
  const r=parseInt(key.slice(0,2),16),g=parseInt(key.slice(2,4),16),b=parseInt(key.slice(4,6),16),a=key.length===8?Math.round(parseInt(key.slice(6,8),16)/255*1000)/1000:1;
  const m=cosmicOf({r,g,b});if(!m)return null;return toHex({...m,a});
}
// Повний текст dist/palette-cosmic.css і кількість токенів. Нічого не пише (для тесту на свіжість).
export function paletteCss(root=process.cwd()){
  const decls=[];
  for(const k of tokenKeys(root)){const v=cosmicValue(k);if(!v)throw Error(`Токен --c-${k} не має космічного значення`);decls.push(`--c-${k}:${v}`);}
  const shapes=shapeKeys(root);
  for(const px of shapes){const to=shapeOf(px);if(to===null)throw Error(`Токен --rd-${px} не має значення космічного стилю`);decls.push(`--rd-${px}:${to}px`);}
  // Підняті тіні карток: на головній їх немає. Токен потрібен лише тоді, коли хоч одна тінь у стилях ним обгорнута.
  const usesCardShadow=[...CSS_TARGETS,...HTML_TARGETS].some(f=>fs.existsSync(path.join(root,f))&&fs.readFileSync(path.join(root,f),'utf8').includes(`var(${CARD_SHADOW_TOKEN},`));
  if(usesCardShadow)decls.push(`${CARD_SHADOW_TOKEN}:${CARD_SHADOW_VALUE}`);
  const extras=fs.existsSync(path.join(root,EXTRAS))?fs.readFileSync(path.join(root,EXTRAS),'utf8').trim():'';
  const plates=plateRules(root);
  const plateBlock=plates.length?`/* Плити під схемами: темні бірюзові й оливкові тла, намальовані SVG-атрибутами (токенів там немає), у космосі стають фіолетовими. Світлі деталі схем лишаються. */\n${plates.join('\n')}\n`:'';
  const css=`/* Космічний стиль (за замовчуванням), як на головній: кольори (--c-*) і форми карток та кнопок (--rd-*). Згенеровано scripts/build-palette.mjs: не редагувати вручну.\n   Токени стоять у стилях сторінок; зелений варіант вмикає html[data-palette="green"] (токенів немає, діють оригінальні кольори й форми). */\nhtml:not([data-palette="green"]){${decls.join(';')}}\n${plateBlock}${extras}\n`;
  return {css,count:decls.length,colours:tokenKeys(root).length,shapes:shapes.length,plates:plates.length};
}
// Повний текст dist/home-article-cosmic.css: ті самі космічні значення токенів, але лише для тих, що є у стилях режиму «стаття», і лише під ARTICLE_SCOPE.
// Головна файл palette-cosmic.css не вантажить, тож без цього розбір добавки (index.html#supplement-…) лишався б у старих кольорах і з радіусами 16 і 30 px.
export function articlePaletteCss(root=process.cwd()){
  const keys=new Set(),shapes=new Set();let usesCardShadow=false;
  for(const f of ARTICLE_CSS){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    const text=fs.readFileSync(file,'utf8');
    for(const m of text.matchAll(/var\(--c-([0-9a-f]{6}(?:[0-9a-f]{2})?),/g))keys.add(m[1]);
    for(const m of text.matchAll(/var\(--rd-(\d+),/g))shapes.add(+m[1]);
    if(text.includes(`var(${CARD_SHADOW_TOKEN},`))usesCardShadow=true;
  }
  const decls=[];
  for(const k of [...keys].sort()){const v=cosmicValue(k);if(!v)throw Error(`Токен --c-${k} не має космічного значення`);decls.push(`--c-${k}:${v}`);}
  for(const px of [...shapes].sort((a,b)=>a-b)){const to=shapeOf(px);if(to===null)throw Error(`Токен --rd-${px} не має значення космічного стилю`);decls.push(`--rd-${px}:${to}px`);}
  if(usesCardShadow)decls.push(`${CARD_SHADOW_TOKEN}:${CARD_SHADOW_VALUE}`);
  // «@p » (копії старих правил розбору) стає ARTICLE_PARITY, «@s » (ручні доповнення) стає повним ARTICLE_SCOPE; пояснення в scripts/palette/targets.mjs.
  const scoped=(text,mark,prefix)=>text.replace(new RegExp('(^|[,{])'+mark+' ','gm'),(m,p)=>p+prefix+' ');
  const overrides=scoped(articleOverrides(root),'@p',ARTICLE_PARITY);
  const extras=fs.existsSync(path.join(root,ARTICLE_EXTRAS))?scoped(fs.readFileSync(path.join(root,ARTICLE_EXTRAS),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').trim(),'@s',ARTICLE_SCOPE):'';
  const css=`/* Розбір добавки на головній (режим «стаття») у космічних кольорах і формах решти сайту. Згенеровано scripts/build-palette.mjs: не редагувати вручну.\n   Діє лише під body[data-route-view="article"] і не для зеленого варіанта; саму головну не торкається. Перше правило: токени; далі переписування старих правил розбору\n   (scripts/palette/article-overrides.mjs); наприкінці ручні доповнення з src/palette/cosmic-article-extras.css. */\n${ARTICLE_SCOPE}{${decls.join(';')}}\n${overrides}\n${extras}\n`;
  return {css,count:decls.length};
}
export function buildPalette(root=process.cwd()){
  const {css,count}=paletteCss(root);
  fs.writeFileSync(path.join(root,OUTPUT),css);
  fs.writeFileSync(path.join(root,ARTICLE_OUTPUT),articlePaletteCss(root).css);
  return count;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`Космічна палітра: ${buildPalette()} токенів.`);
