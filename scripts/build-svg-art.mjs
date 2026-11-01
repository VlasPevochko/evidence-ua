// Космічні копії малюнків-SVG, які сторінки показують через <img>: стилі сторінки на такі малюнки не діють, тому окремий файл на кожен.
// Фони, плити й лінійні значки стають фіолетовими (та сама логіка, що в палітрі: scripts/palette/cosmic-map.mjs); предмети малюнка
// (їжа на тарілках, місяць, хвиля) лишаються. Оригінал лишається для «Зеленого»: сторінка показує одну з двох копій за палітрою (img[data-art]).
// Запуск: node scripts/build-svg-art.mjs (його викликає scripts/build-site.mjs). Результат: dist/*-cosmic.svg (згенеровані файли, не редагувати вручну).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {cosmicOf,plateOf,rgbToHsl,hslToRgb,clamp} from './palette/cosmic-map.mjs';
import {parseColor,toHex} from './palette/css-colors.mjs';

// Плитки дієт: фон кожної плитки має власний відтінок (оливковий, зелений, бірюзовий, синьо-сірий). Відтінки 52–208° стискаємо в 238–274°:
// плитки лишаються різними, але всі в одній фіолетовій гамі. Яскравість зберігаємо, насиченість трохи піднімаємо (фіолет у темних тонах без неї сірий).
export function tileOf({r,g,b}){
  const [h,s,l]=rgbToHsl(r,g,b);
  const [R,G,B]=hslToRgb(238+(clamp(h,52,208)-52)*(274-238)/(208-52),clamp(.14+s*.5,.18,.30),l);return {r:R,g:G,b:B};
}

export const JOBS=[
  // Їжа на тарілках (теплі й зелені кольори) не змінюється: змінюються лише фони плиток, пагорби на «Середземноморській», смуга на DASH і тінь.
  {src:'diet-art.svg',dst:'diet-art-cosmic.svg',how:'tiles',only:['#29433d','#20352f','#30424b','#3b4230','#263d42','#424036','#394334','#284639','#2c3d4d'],set:{'#8fa297':'#a99cc0','#071412':'#0b0a12'}},
  // Шапка «Сон» і мініатюра каталогу: арка стає фіолетовою; місяць (кремово-жовтий) і хвиля лишаються, як і в картинках напрямів головної.
  {src:'home-sleep.svg',dst:'home-sleep-cosmic.svg',how:'cosmic',keep:['#fff0b6','#e1d7a3','#d6b765','#7fd8cd']},
  // Шапка «Атлас»: золоті лінії фігури стають лавандовими, як вузли поверх неї, сірі частини стають фіолетово-сірими.
  {src:'home-anatomy.svg',dst:'home-anatomy-cosmic.svg',how:'cosmic'},
  // Мініатюри каталогу: золоті лінійні значки стають лавандовими (акцент сторінок), сірі лінії лишаються.
  {src:'home-movement.svg',dst:'home-movement-cosmic.svg',how:'cosmic'},
  {src:'card-nutrition.svg',dst:'card-nutrition-cosmic.svg',how:'cosmic',set:{'#e7bd46':'#d1a5ff'}},
  {src:'card-evidence.svg',dst:'card-evidence-cosmic.svg',how:'cosmic',set:{'#e7bd46':'#d1a5ff'}},
  {src:'card-organism.svg',dst:'card-organism-cosmic.svg',how:'cosmic',set:{'#e7bd46':'#d1a5ff'}}
];

const ATTR=/="(#[0-9a-fA-F]{6})"/g,ANY=/#[0-9a-fA-F]{6}\b/g;
const hexOf=c=>toHex({...c,a:1});

// Чиста функція: текст оригіналу → текст космічної копії. Кожен колір малюнка стоїть у атрибуті, інакше збірка зупиняється (щоб жоден колір не лишився непоміченим).
export function cosmicSvg(svg,job){
  const all=svg.match(ANY)||[],inAttr=[...svg.matchAll(ATTR)];
  if(all.length!==inAttr.length)throw Error(`${job.src}: є кольори поза атрибутами (${all.length} проти ${inAttr.length}): скрипт їх не перефарбовує`);
  const keep=new Set(job.keep||[]),only=job.only?new Set(job.only):null,set=job.set||{};
  const body=svg.replace(ATTR,(whole,hex)=>{
    const key=hex.toLowerCase();
    if(set[key])return `="${set[key]}"`;
    if(keep.has(key)||(only&&!only.has(key)))return whole;
    const c=parseColor(key),to=job.how==='tiles'?tileOf(c):(plateOf(c)||cosmicOf(c));
    return to?`="${hexOf(to)}"`:whole;
  });
  return `<!-- Космічна копія ${job.src}: згенеровано scripts/build-svg-art.mjs, не редагувати вручну. -->\n${body}`;
}

export function buildSvgArt(root=process.cwd()){
  for(const job of JOBS){
    const src=path.join(root,'dist',job.src);
    fs.writeFileSync(path.join(root,'dist',job.dst),cosmicSvg(fs.readFileSync(src,'utf8'),job));
  }
  return JOBS.length;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`Космічні малюнки SVG: ${buildSvgArt()} файлів.`);
