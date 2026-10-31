// Знаходить кольорові літерали (#hex, rgb(), rgba()) у значеннях CSS-оголошень і замінює їх через fn.
// Не чіпає селектори (#id), url(...), рядки, коментарі й уже замінені var(--c-...). Без залежностей: простий сканер.
const HEX=/^#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})$/;
const RULES_AT=new Set(['media','supports','layer','container','document','keyframes','-webkit-keyframes','-moz-keyframes','scope','starting-style']);

export function parseColor(lit){
  if(HEX.test(lit)){
    let h=lit.slice(1);if(h.length<=4)h=[...h].map(c=>c+c).join('');
    const n=i=>parseInt(h.slice(i,i+2),16);
    return {r:n(0),g:n(2),b:n(4),a:h.length===8?Math.round(n(6)/255*1000)/1000:1,hexAlpha:h.length===8};
  }
  const m=/^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*\.?\d+%?))?\s*\)$/i.exec(lit);
  if(!m)return null;
  let a=1;if(m[4]!==undefined){a=m[4].endsWith('%')?parseFloat(m[4])/100:parseFloat(m[4]);}
  return {r:Math.round(+m[1]),g:Math.round(+m[2]),b:Math.round(+m[3]),a};
}
export const toHex=({r,g,b,a})=>{const x=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');return '#'+x(r)+x(g)+x(b)+(a<1?x(a*255):'');};
// Ключ токена: нормалізований hex8/hex6 без '#'. Той самий колір у різному запису дає один токен.
export const tokenKey=c=>toHex(c).slice(1);

function skipString(s,i){const q=s[i];let j=i+1;while(j<s.length&&s[j]!==q){if(s[j]==='\\')j++;j++;}return j+1;}
function skipComment(s,i){const j=s.indexOf('*/',i+2);return j<0?s.length:j+2;}
function matchParen(s,i){ // i — позиція '(' ; повертає позицію після відповідної ')'
  let d=0,j=i;while(j<s.length){const c=s[j];if(c==='"'||c==="'"){j=skipString(s,j);continue;}if(c==='/'&&s[j+1]==='*'){j=skipComment(s,j);continue;}if(c==='(')d++;else if(c===')'){d--;if(d===0)return j+1;}j++;}return s.length;
}

export function mapValue(v,fn){
  let out='',i=0;
  while(i<v.length){
    const c=v[i];
    if(c==='/'&&v[i+1]==='*'){const j=skipComment(v,i);out+=v.slice(i,j);i=j;continue;}
    if(c==='"'||c==="'"){const j=skipString(v,i);out+=v.slice(i,j);i=j;continue;}
    const rest=v.slice(i,i+8).toLowerCase();
    if(rest.startsWith('url(')){const j=matchParen(v,i+3);out+=v.slice(i,j);i=j;continue;}
    if(rest.startsWith('var(')){
      const j=matchParen(v,i+3),inner=v.slice(i+4,j-1);
      if(inner.includes('--c-')){out+=v.slice(i,j);}
      else{const k=inner.indexOf(',');out+='var('+(k<0?inner:inner.slice(0,k+1)+mapValue(inner.slice(k+1),fn))+')';}
      i=j;continue;
    }
    if(c==='#'&&(i===0||!/[\w-]/.test(v[i-1]))){
      const m=/^#[0-9a-fA-F]+/.exec(v.slice(i));
      if(m&&HEX.test(m[0])&&!/[\w-]/.test(v[i+m[0].length]||' ')){const r=fn(m[0]);out+=r??m[0];i+=m[0].length;continue;}
    }
    if(/^(rgba?)\(/.test(rest)){
      const j=matchParen(v,i+(rest.startsWith('rgba')?4:3)),lit=v.slice(i,j);
      if(!/var\(/.test(lit)){const r=fn(lit);out+=r??lit;}else out+=lit;
      i=j;continue;
    }
    out+=c;i++;
  }
  return out;
}

// Обходить CSS і застосовує mapValue до значень оголошень (не до селекторів). Повертає новий текст.
export function mapCss(css,fn){
  let out='',i=0;const stack=['top'];
  const kind=()=>stack[stack.length-1];
  while(i<css.length){
    // читаємо шматок до ; { } з урахуванням дужок, рядків, коментарів
    let j=i,depth=0,chunkEnd=-1,term='';
    while(j<css.length){
      const c=css[j];
      if(c==='/'&&css[j+1]==='*'){j=skipComment(css,j);continue;}
      if(c==='"'||c==="'"){j=skipString(css,j);continue;}
      if(c==='('){j=matchParen(css,j);continue;}
      if(c===';'||c==='{'||c==='}'){term=c;chunkEnd=j;break;}
      j++;
    }
    if(chunkEnd<0){out+=css.slice(i);break;}
    const chunk=css.slice(i,chunkEnd);
    if(term==='{'){
      const pre=chunk.replace(/\/\*[\s\S]*?\*\//g,'').trim(),at=/^@([\w-]+)/.exec(pre);
      stack.push(at&&RULES_AT.has(at[1].toLowerCase())?'rules':'decls');
      out+=chunk+'{';
    }else if(term==='}'){
      out+=(kind()==='decls'&&chunk.includes(':')?declMap(chunk,fn):chunk)+'}';
      if(stack.length>1)stack.pop();
    }else{ // ';'
      out+=(kind()==='decls'&&chunk.includes(':')?declMap(chunk,fn):chunk)+';';
    }
    i=chunkEnd+1;
  }
  return out;
}
function declMap(chunk,fn){
  const k=chunk.indexOf(':');return chunk.slice(0,k+1)+mapValue(chunk.slice(k+1),fn);
}
