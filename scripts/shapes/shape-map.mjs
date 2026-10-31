// Форми карток і кнопок космічного стилю: ті самі, що на головній (Spectrum).
// Головна: картки, кнопки, поля й чипи мають радіус 3px (інколи 2px), великі панелі й діалоги 5px, кола лишаються колами.
// Тут: радіус із таблиці стилів сторінки → радіус космічного стилю. null означає «не чіпати».
export const CONTROL_RADIUS=3;   // картки, кнопки, чипи, поля, рядки-розгортки
export const PANEL_RADIUS=5;     // великі панелі, діалоги, рамки схем
export const KEEP_UP_TO=5;       // уже як на головній
export function shapeOf(px){
  if(!Number.isFinite(px)||px<=KEEP_UP_TO)return null;
  if(px<=17)return CONTROL_RADIUS;
  if(px<=32)return PANEL_RADIUS;
  return CONTROL_RADIUS;         // «пігулки» (99, 100, 999): на головній чипи теж прямокутні
}
// Форми, що лишаються як є, бо це малюнок або смуга даних, а не картка чи кнопка: [файл, шаблон селектора].
export const EXEMPT_RADIUS=[
  ['fat-burning.css',/^\.fb-bar(\s+span)?$/,'смуга балансу енергії'],
  ['muscle-lab.css',/^\.mg-fiber-scale$|^\.mg-fib$/,'шкала типів волокон']
];
export const isExemptRadius=(file,selector)=>EXEMPT_RADIUS.some(([f,re])=>file.endsWith(f)&&re.test(selector.replace(/\s+/g,' ').trim()));

// Тіні. На головній картки пласкі (box-shadow:none), підняті тіні лишаються тільки в накладок: меню, діалогів, випливаючих підказок.
export const CARD_SHADOW_TOKEN='--sd-card', CARD_SHADOW_VALUE='none';
export const OVERLAY_SHADOW=/eua-search|module-menu|nutrition-menu|term-dialog|term-pop|appearance-panel|primary-link/;
export const isOverlayShadow=selector=>OVERLAY_SHADOW.test(selector);
// «Підняте» оголошення: усі тіні зовнішні, зсув по вертикалі від 4px, розмиття від 12px.
export function isElevation(value){
  const parts=[];let d=0,cur='';
  for(const ch of value){if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){parts.push(cur.trim());cur='';}else cur+=ch;}
  parts.push(cur.trim());
  const VAR=/var\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g;
  return parts.length>0&&parts.every(p=>{
    if(!p||/inset/i.test(p))return false;
    const q=p.replace(VAR,' C ').replace(/#[0-9a-fA-F]+|rgba?\([^)]*\)/g,' C ');
    const nums=[...q.matchAll(/(?<![\w.-])(-?\d+(?:\.\d+)?)(?:px)?(?![\w.])/g)].map(m=>+m[1]);
    return nums.length>=3&&Math.abs(nums[1])>=4&&nums[2]>=12;
  });
}
