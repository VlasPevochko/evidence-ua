// Обгортає радіуси закруглення (var(--rd-N, оригінал): N — оригінальні пікселі) і підняті тіні карток (var(--sd-card, оригінал)) у стилях сторінок.
// Зелений варіант токенів не задає й показує оригінал; космічний задає їх у dist/palette-cosmic.css (див. scripts/build-palette.mjs).
// Запуск: node scripts/shapes/tokenize.mjs [--check]  (--check лише перевіряє й завершується з кодом 1, якщо є непереведені радіуси чи тіні)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {shapeOf,isExemptRadius,isElevation,isOverlayShadow,CARD_SHADOW_TOKEN} from './shape-map.mjs';
import {CSS_TARGETS,HTML_TARGETS} from '../palette/targets.mjs';

// Копія тексту тієї ж довжини, де коментарі, рядки й url(...) замінено пробілами: так шукаємо оголошення, не ловлячи їх у даних.
export function maskCss(css){
  let out='',i=0;
  while(i<css.length){
    const c=css[i];
    if(c==='/'&&css[i+1]==='*'){const j=css.indexOf('*/',i+2),e=j<0?css.length:j+2;out+=' '.repeat(e-i);i=e;continue;}
    if(c==='"'||c==="'"){let j=i+1;while(j<css.length&&css[j]!==c){if(css[j]==='\\')j++;j++;}const e=Math.min(css.length,j+1);out+=' '.repeat(e-i);i=e;continue;}
    if(css.slice(i,i+4).toLowerCase()==='url('){let d=0,j=i+3;while(j<css.length){if(css[j]==='(')d++;else if(css[j]===')'){d--;if(d===0)break;}j++;}const e=Math.min(css.length,j+1);out+=' '.repeat(e-i);i=e;continue;}
    out+=c;i++;
  }
  return out;
}
// Селектор правила, якому належить оголошення на позиції pos (у замаскованому тексті).
function selectorAt(masked,pos){
  const open=masked.lastIndexOf('{',pos);if(open<0)return '';
  let start=open;while(start>0&&!'};{'.includes(masked[start-1]))start--;
  return masked.slice(start,open).trim();
}
// Нове значення одного оголошення border-radius або null, якщо міняти нічого.
export function tokenizeRadiusValue(value){
  if(/var\(|calc\(|\/|[a-z]%|%.*%/i.test(value)&&!/^\s*50%\s*$/.test(value))return null;   // мішані відсотки, змінні, еліптичні форми: це малюнок
  if(value.includes('%'))return null;
  const parts=value.trim().split(/\s+/);let changed=false;
  const out=parts.map(p=>{
    const m=/^(\d+)px$/.exec(p);if(!m)return p;
    const px=+m[1],to=shapeOf(px);if(to===null)return p;
    changed=true;return `var(--rd-${px},${px}px)`;
  });
  return changed?out.join(' '):null;
}
export function tokenizeRadii(css,file=''){
  const masked=maskCss(css);let out='',last=0;
  const re=/(?<![-\w])border-radius\s*:\s*([^;}]*)/g;let m;
  while((m=re.exec(masked))){
    const vStart=m.index+m[0].length-m[1].length,raw=css.slice(vStart,vStart+m[1].length);
    const important=/\s*!important\s*$/i.exec(raw),value=important?raw.slice(0,important.index):raw;
    if(isExemptRadius(file,selectorAt(masked,m.index)))continue;
    const next=tokenizeRadiusValue(value);if(next===null)continue;
    out+=css.slice(last,vStart)+next+(important?important[0]:'');last=vStart+raw.length;
  }
  return out+css.slice(last);
}
export function tokenizeShadows(css,file=''){
  const masked=maskCss(css);let out='',last=0;
  const re=/(?<![-\w])box-shadow\s*:\s*([^;}]*)/g;let m;
  while((m=re.exec(masked))){
    const vStart=m.index+m[0].length-m[1].length,raw=css.slice(vStart,vStart+m[1].length);
    const important=/\s*!important\s*$/i.exec(raw),value=(important?raw.slice(0,important.index):raw).trim();
    if(value.includes(CARD_SHADOW_TOKEN)||!isElevation(value))continue;
    if(isOverlayShadow(selectorAt(masked,m.index)))continue;
    out+=css.slice(last,vStart)+`var(${CARD_SHADOW_TOKEN},${value})`+(important?important[0]:'');last=vStart+raw.length;
  }
  return out+css.slice(last);
}
export const tokenizeShapes=(css,file='')=>tokenizeShadows(tokenizeRadii(css,file),file);
export const tokenizeShapesHtml=(html,file='')=>html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,css,z)=>a+tokenizeShapes(css,file)+z);

export function run(root=process.cwd(),{check=false}={}){
  const changed=[];
  for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    const old=fs.readFileSync(file,'utf8'),next=f.endsWith('.html')?tokenizeShapesHtml(old,f):tokenizeShapes(old,f);
    if(next!==old){changed.push(f);if(!check)fs.writeFileSync(file,next);}
  }
  return changed;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const check=process.argv.includes('--check'),changed=run(process.cwd(),{check});
  console.log(check?(changed.length?`Непереведені радіуси чи тіні: ${changed.join(', ')}`:'Усі радіуси й тіні карток переведені на токени.'):`Радіуси й тіні переведено: ${changed.length} файлів`);
  if(check&&changed.length)process.exit(1);
}
