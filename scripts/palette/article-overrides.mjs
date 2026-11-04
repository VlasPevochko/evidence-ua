// Космічні переписування для режиму «стаття» на головній (розбір добавки: index.html#creatine, #supplement-…).
// Стилі розборів лежать у вбудованих <style> самого index.html і в home-article.css: це стилі головної, їх у токени не переводять (див. docs/COLORS.md).
// Тому тут для кожного такого правила з золотим, коричневим чи оливковим літералом або радіусом 16/30px видається копія з космічними значеннями (cosmicOf, shapeOf),
// а scripts/build-palette.mjs ставить їх під ARTICLE_SCOPE. Копія містить усі оголошення малювання цілого правила (колір, фон, рамка, радіус, тінь), а не лише змінені:
// інакше вищий селектор змінив би, яке з двох правил перемагає на властивостях, що тут не змінювались. Розкладка й типографіка в копію не потрапляють.
import fs from 'node:fs';
import path from 'node:path';
import {parseColor,toHex,mapValue} from './css-colors.mjs';
import {cosmicOf} from './cosmic-map.mjs';
import {shapeOf} from '../shapes/shape-map.mjs';

export const ARTICLE_SOURCES=['dist/home-article.css'];   // поряд із вбудованими <style> з dist/index.html
const PAINT=/^(color|background(-color|-image)?|border(-[a-z]+)*|outline(-color)?|box-shadow|fill|stroke|--pc-[a-z-]+)$/;
const COLOUR_PROP=/^border(-(top|right|bottom|left))?$|^background(-color|-image)?$|^color$|^border-(top|right|bottom|left)-color$|^border-color$|^outline(-color)?$|^box-shadow$|^fill$|^stroke$|^--pc-/;
const ID_LIST=/:is\(((?:#(?:supplement-[a-z-]+|creatine),?)+)\)/g;
// Одинадцять розборів на головній: креатин і десять #supplement-… У стилях головної список id буває повним (11), без креатину (10) або коротшим (8).
// Скорочувати до :is(#creatine,[id^="supplement-"]) можна лише повний список: скорочення неповного поширило б копію правила на розбори, до яких оригінал не стосувався
// (помилка до 2026-11-04: правила кнопок «без креатину» зачепили креатин, і бірюзові кнопки «Докази й межі» в ньому стали лавандовими). Тому інші списки лишаються дослівно.
export const ARTICLE_IDS=['creatine','supplement-protein','supplement-berberine','supplement-omega','supplement-vitd','supplement-caffeine','supplement-magnesium','supplement-collagen','supplement-beta-alanine','supplement-citrulline','supplement-electrolytes'].sort();
export const shortenIds=selector=>selector.replace(ID_LIST,(whole,list)=>{const ids=list.split(',').filter(Boolean).map(id=>id.slice(1)).sort();return ids.length===ARTICLE_IDS.length&&ids.every((id,i)=>id===ARTICLE_IDS[i])?':is(#creatine,[id^="supplement-"])':whole;});
// Селектори розбору: сторінки добавок, їхній блок PubMed, фото-рамка, панель статті. Блоки головної (#start-here, #categories) сюди не входять.
const RELEVANT=/#supplement-|#creatine|^\.d-|^section\[id\^="supplement-"\]|\.eua-article-|data-article-mode|^\.base-art|#pubmed-live/;
const NOT_RELEVANT=/#start-here|#categories/;
// Смуги даних (дані, а не картки): лишаються округлими, як і в решті сайту (EXEMPT_RADIUS у scripts/shapes/shape-map.mjs).
const EXEMPT=/\.pc-track/;

const colour=lit=>{const c=parseColor(lit);if(!c)return null;const m=cosmicOf(c);return m?toHex({...m,a:c.a}):null;};
const radius=v=>v.trim().split(/\s+/).map(p=>{const m=/^(\d+)px$/.exec(p);if(!m)return p;const to=shapeOf(+m[1]);return to===null?p:to+'px';}).join(' ');
function splitDecls(body){
  const out=[];let d=0,cur='',q='';
  for(const ch of body){
    if(q){cur+=ch;if(ch===q)q='';continue;}
    if(ch==='"'||ch==="'"){q=ch;cur+=ch;continue;}
    if(ch==='(')d++;if(ch===')')d--;
    if(ch===';'&&d===0){out.push(cur);cur='';continue;}
    cur+=ch;
  }
  if(cur.trim())out.push(cur);
  return out;
}
function collect(css,media,rules){
  css=css.replace(/\/\*[\s\S]*?\*\//g,'');
  let i=0;
  while(i<css.length){
    const open=css.indexOf('{',i);if(open<0)break;
    const pre=css.slice(i,open).trim();
    let d=1,j=open+1;while(j<css.length&&d>0){if(css[j]==='{')d++;else if(css[j]==='}')d--;j++;}
    const body=css.slice(open+1,j-1);
    if(pre.startsWith('@media')||pre.startsWith('@supports'))collect(body,pre,rules);
    else if(!pre.startsWith('@')){
      const ours=pre.split(/,(?![^(]*\))/).map(s=>s.trim().replace(/\s+/g,' ')).filter(s=>s&&RELEVANT.test(s)&&!NOT_RELEVANT.test(s));
      if(ours.length){
        const full=[];let changed=false;
        for(const decl of splitDecls(body)){
          const k=decl.indexOf(':');if(k<0)continue;
          const prop=decl.slice(0,k).trim(),p=prop.toLowerCase(),val=decl.slice(k+1).trim();
          let nv=val;
          if(p==='border-radius'&&!ours.some(s=>EXEMPT.test(s)))nv=radius(val);
          else if(COLOUR_PROP.test(p))nv=mapValue(val,colour);
          if(nv!==val)changed=true;
          if(PAINT.test(p)&&!/url\(/i.test(val))full.push(`${prop}:${nv}`);   // картинки не перефарбовуємо й не дублюємо
        }
        if(changed)rules.push({media,sel:ours.map(s=>'@p '+shortenIds(s)).join(','),decl:full.join(';')});
      }
    }
    i=j;
  }
}
// Текст переписувань; «@p » на початку селектора підставляє build-palette.mjs (ARTICLE_PARITY: те саме місце дії, що в ARTICLE_SCOPE, але без додаткової сили селектора).
export function articleOverrides(root=process.cwd()){
  const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
  const blocks=[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]);
  for(const f of ARTICLE_SOURCES)blocks.push(fs.readFileSync(path.join(root,f),'utf8'));
  const rules=[];
  for(const css of blocks)collect(css,null,rules);
  const seen=new Set(),out=[];
  for(const r of rules){const key=(r.media||'')+'|'+r.sel+'|'+r.decl;if(seen.has(key))continue;seen.add(key);out.push(r);}
  return out.map(r=>r.media?`${r.media}{${r.sel}{${r.decl}}}`:`${r.sel}{${r.decl}}`).join('\n');
}
