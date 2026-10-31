// Генерує dist/palette-cosmic.css: значення токенів --c-* для космічної палітри (за замовчуванням) + ручні доповнення з src/palette/cosmic-extras.css.
// Токени знаходимо в самих стилях, тож нова var(--c-…) без запису тут неможлива. Зелений варіант: html[data-palette="green"] (токени не задано).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {toHex} from './palette/css-colors.mjs';
import {cosmicOf} from './palette/cosmic-map.mjs';
import {CSS_TARGETS,HTML_TARGETS,EXTRAS,OUTPUT} from './palette/targets.mjs';

export function tokenKeys(root=process.cwd()){
  const keys=new Set();
  for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    for(const m of fs.readFileSync(file,'utf8').matchAll(/var\(--c-([0-9a-f]{6}(?:[0-9a-f]{2})?),/g))keys.add(m[1]);
  }
  return [...keys].sort();
}
export function cosmicValue(key){
  const r=parseInt(key.slice(0,2),16),g=parseInt(key.slice(2,4),16),b=parseInt(key.slice(4,6),16),a=key.length===8?Math.round(parseInt(key.slice(6,8),16)/255*1000)/1000:1;
  const m=cosmicOf({r,g,b});if(!m)return null;return toHex({...m,a});
}
// Повний текст dist/palette-cosmic.css і кількість токенів. Нічого не пише (для тесту на свіжість).
export function paletteCss(root=process.cwd()){
  const decls=[];
  for(const k of tokenKeys(root)){const v=cosmicValue(k);if(!v)throw Error(`Токен --c-${k} не має космічного значення`);decls.push(`--c-${k}:${v}`);}
  const extras=fs.existsSync(path.join(root,EXTRAS))?fs.readFileSync(path.join(root,EXTRAS),'utf8').trim():'';
  const css=`/* Космічна палітра (за замовчуванням), як на головній. Згенеровано scripts/build-palette.mjs: не редагувати вручну.\n   Токени --c-* стоять у стилях сторінок; зелений варіант вмикає html[data-palette="green"] (токенів немає, діють оригінальні кольори). */\nhtml:not([data-palette="green"]){${decls.join(';')}}\n${extras}\n`;
  return {css,count:decls.length};
}
export function buildPalette(root=process.cwd()){
  const {css,count}=paletteCss(root);
  fs.writeFileSync(path.join(root,OUTPUT),css);
  return count;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(`Космічна палітра: ${buildPalette()} токенів.`);
