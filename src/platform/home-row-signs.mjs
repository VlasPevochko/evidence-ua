// Знаки згорнутих рядків головної (рішення власника «давай 1 пункт», 2026-11-15): замість «+» рядок показує малюнок того, що в ньому лежить.
// Кожен знак збирається під час збірки з тих самих даних, що й вміст рядка, тому не може з ним розійтися:
//   «Навчальні маршрути»: одна лінія на маршрут, один вузол на крок (каталог маршрутів);
//   «Бібліотека доказів»: один стовпчик на добавку, одна риска на розібране твердження (dist/compare-status.js);
//   «Оновлення»: мініатюра графіка того самого розбору, що й перша картка блоку (miniInterval, T1).
// Знаки декоративні (aria-hidden), без тексту всередині SVG. Це підрахунок, а не оцінка: висота стовпчика нічого не каже про силу доказів.
// Модуль чистий (без DOM і файлів): його читає збірка й tests/home-row-signs.test.mjs.
const r1=value=>Math.round(value*10)/10;

// stepCounts: кількість кроків кожного маршруту в порядку каталогу, наприклад [6,3,3,4].
export const RAIL={step:13,row:10,pad:4,node:2.2,start:3.2};
export function routesSignSVG(stepCounts){
  if(!Array.isArray(stepCounts)||!stepCounts.length||stepCounts.some(count=>!Number.isInteger(count)||count<1))throw new Error('Route sign needs a positive step count for every route');
  const {step,row,pad,node,start}=RAIL,longest=Math.max(...stepCounts);
  const width=pad*2+(longest-1)*step,height=pad*2+(stepCounts.length-1)*row;
  const rails=stepCounts.map((count,index)=>{
    const y=pad+index*row,end=pad+(count-1)*step;
    const nodes=Array.from({length:count},(_,i)=>`<circle class="hs-node${i===0?' hs-start':''}" cx="${pad+i*step}" cy="${y}" r="${i===0?start:node}"/>`).join('');
    return `<g class="hs-rail" data-steps="${count}">${count>1?`<line class="hs-line" x1="${pad}" y1="${y}" x2="${end}" y2="${y}"/>`:''}${nodes}</g>`;
  }).join('');
  return `<svg class="hs-svg hs-routes" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" focusable="false" aria-hidden="true">${rails}</svg>`;
}

// claimCounts: кількість розібраних тверджень кожної добавки в порядку списку бібліотеки, наприклад [16,5,8,…].
export const SHELF={spine:5,gap:3,mark:2,space:1,base:3};
export function shelfSignSVG(claimCounts){
  if(!Array.isArray(claimCounts)||!claimCounts.length||claimCounts.some(count=>!Number.isInteger(count)||count<1))throw new Error('Library sign needs a positive claim count for every supplement');
  const {spine,gap,mark,space,base}=SHELF,tallest=Math.max(...claimCounts);
  const width=claimCounts.length*spine+(claimCounts.length-1)*gap,floor=tallest*(mark+space),height=floor+base;
  const spines=claimCounts.map((count,index)=>{
    const x=index*(spine+gap);
    const marks=Array.from({length:count},(_,i)=>`<rect class="hs-mark" x="${x}" y="${r1(floor-(i+1)*(mark+space))}" width="${spine}" height="${mark}"/>`).join('');
    return `<g class="hs-spine" data-claims="${count}">${marks}</g>`;
  }).join('');
  return `<svg class="hs-svg hs-shelf" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" focusable="false" aria-hidden="true">${spines}<line class="hs-floor" x1="0" y1="${r1(floor+base/2)}" x2="${width}" y2="${r1(floor+base/2)}"/></svg>`;
}

export const signHTML=(kind,svg)=>`<span class="home-row-sign home-row-sign--${kind}" aria-hidden="true">${svg}</span>`;

// Вставляє знак між позначками <!-- EUA_HOME_SIGN_<NAME>_START/END --> (позначки стоять у <summary> рядка в dist/index.html).
export function placeSign(html,name,content){
  const pattern=new RegExp(`<!-- EUA_HOME_SIGN_${name}_START -->[\\s\\S]*?<!-- EUA_HOME_SIGN_${name}_END -->`);
  if(!pattern.test(html))throw new Error(`EUA_HOME_SIGN_${name} markers are missing in dist/index.html`);
  return html.replace(pattern,()=>`<!-- EUA_HOME_SIGN_${name}_START -->${content}<!-- EUA_HOME_SIGN_${name}_END -->`);
}

// Порядок добавок у списку бібліотеки головної: './creatine.html' -> 'creatine', './supplement-omega.html' -> 'supplement-omega'.
export function libraryRoutes(html){
  const list=(html.match(/<ul class="se-list"[\s\S]*?<\/ul>/)||[''])[0];
  // Посилання списку ведуть на сторінки розборів (./creatine.html, ./supplement-omega.html); ключ у compare-status.js це назва без «.html».
  const routes=[...list.matchAll(/<li><a href="\.\/([a-z0-9-]+)\.html"/g)].map(match=>match[1]);
  if(!routes.length)throw new Error('The library list (.se-list) on the home is missing or empty');
  return routes;
}
export function libraryClaimCounts(html,comparisonStatus){
  return libraryRoutes(html).map(route=>{
    const status=comparisonStatus[route];
    if(!status||!Number.isInteger(status.total)||status.total<1)throw new Error(`No claim count for «${route}» in compare-status.js`);
    return status.total;
  });
}
