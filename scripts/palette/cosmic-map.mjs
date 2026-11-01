// Відповідність «зелений сосновий → космічний фіолетовий» для одного кольору. Чиста функція.
// null означає «не чіпати» (нейтральні, червоні/помаранчеві, яскраві бірюзові акценти, ілюстрації).
export function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
export function hslToRgb(h,s,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
  if(s===0){const v=Math.round(l*255);return [v,v,v];}
  const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return [f(p,q,h+1/3),f(p,q,h),f(p,q,h-1/3)].map(v=>Math.round(v*255));}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const HUE=272;      // лавандовий акцент головної (#d1a5ff)
export const SURFACE_HUE=258; // темні поверхні головної (#0b0a12 ≈ 250°, #100e18 ≈ 253°)

// Опорні кольори: головні ролі соснової палітри (page-pine.css) відображаються точно у значення головної сторінки.
export const ANCHORS={
  '0d1916':'0b0a12', // фон сторінки (головна: --spectrum-bg)
  '142520':'14111d', // картки й панелі (головна: #100e18 на #0b0a12, трохи світліше для контрасту з рамкою)
  '26403a':'3b3647', // лінії й рамки (головна: --spectrum-line #cec2e23d поверх фону й панелі дає від #3a3644 до #413b4c)
  'e9efe9':'f7f3ef', // основний текст (головна: --spectrum-text)
  '9db1a7':'c3b9d1', // приглушений текст (головна: --spectrum-muted)
  '8fae9f':'a99cc0', // приглушений штрих
  'e3bd6b':'d1a5ff', // акцент (головна: --spectrum-accent)
  '1b1608':'170f26'  // текст на акценті
};
const hexOf=([r,g,b])=>[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
const fromHex=h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));

// Повертає {r,g,b} або null. Альфа-канал не чіпаємо (вирішує викликач).
export function cosmicOf({r,g,b}){
  const anchor=ANCHORS[hexOf([r,g,b])];
  if(anchor){const [R,G,B]=fromHex(anchor);return {r:R,g:G,b:B};}
  const [h,s,l]=rgbToHsl(r,g,b);
  if(s<.10||l>.975||l<.015)return null;                        // нейтральні й майже чорні/білі
  const green=h>=75&&h<=205, gold=h>=38&&h<75, blue=h>205&&h<=250;
  if(!(green||gold||blue))return null;                          // червоні, помаранчеві (лишаються попереджувальними), рожеві, фіолетові
  // Яскраві бірюзові й сині акценти (мітки, молекули) лишаються другим кольором поруч із лавандою.
  if(green&&h>=150&&s>=.38&&l>=.42)return null;
  if(blue&&s>=.38&&l>=.42)return null;
  let H,S,L=l;
  if(gold){
    if(l>.88){H=30;S=clamp(s*.9,.12,.30);}                     // майже білий теплий текст
    else if(l<.22){H=SURFACE_HUE;S=clamp(s*.55,.15,.40);}      // темний «текст на золоті»
    else if(l<.5){H=HUE;S=clamp(s*.7,.15,.5);}                 // приглушене золото (рамки, заливки)
    else{H=HUE;S=clamp(s,.4,.95);L=clamp(l+.12,.72,.86);}      // золото-акцент стає лавандою
  }else if(l<.30){H=SURFACE_HUE;S=clamp(s*.7,.14,.42);}         // темні поверхні й лінії
  else if(l<.72){H=HUE-6;S=clamp(s*.55,.10,.35);}               // середні тони (рамки, приглушений текст)
  else if(l<.90){H=HUE-4;S=clamp(s*.6,.10,.30);}                // світлий приглушений текст
  else{H=30;S=clamp(s*.9,.12,.30);}                             // майже білий текст стає теплим білим (#f7f3ef)
  const [R,G,B]=hslToRgb(H,S,L);return {r:R,g:G,b:B};
}
