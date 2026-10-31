// Замінює кольори соснової (зеленої/золотої) палітри на var(--c-КЛЮЧ,оригінал). Ідемпотентно.
// Зелений варіант не задає токенів і тому лишається точно таким, як був (діє оригінал у var()).
// Запуск: node scripts/palette/tokenize.mjs [--check]   (--check лише перевіряє й завершується з кодом 1, якщо є непереведені кольори)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mapCss,parseColor,tokenKey} from './css-colors.mjs';
import {cosmicOf} from './cosmic-map.mjs';
import {CSS_TARGETS,HTML_TARGETS} from './targets.mjs';

export const tokenizeCss=css=>mapCss(css,lit=>{const c=parseColor(lit);if(!c)return null;if(!cosmicOf(c))return null;return `var(--c-${tokenKey(c)},${lit})`;});
export const tokenizeHtml=html=>html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,css,z)=>a+tokenizeCss(css)+z);

export function run(root=process.cwd(),{check=false}={}){
  const changed=[];
  for(const f of [...CSS_TARGETS,...HTML_TARGETS]){
    const file=path.join(root,f);if(!fs.existsSync(file))continue;
    const old=fs.readFileSync(file,'utf8'),next=f.endsWith('.html')?tokenizeHtml(old):tokenizeCss(old);
    if(next!==old){changed.push(f);if(!check)fs.writeFileSync(file,next);}
  }
  return changed;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const check=process.argv.includes('--check'),changed=run(process.cwd(),{check});
  console.log(check?(changed.length?`Непереведені кольори: ${changed.join(', ')}`:'Усі кольори палітри переведені на токени.'):`Переведено на токени: ${changed.length} файлів`);
  if(check&&changed.length)process.exit(1);
}
