// Conceptual SVG storyboards. No elapsed-time, concentration or effect-size model.
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nodes={
 contraction:['Ca²⁺ · регуляція','Актин ↔ міозин','ATP · від’єднання','Наступний цикл'],
 growth:['Навантаження','Сигнальні процеси','Білковий обмін','Адаптація з часом'],
 atrophy:['Контекст','Синтез / розпад','Втрата білків','Зменшення волокна']
};
export function sceneFrame(id,step=-1){
 if(!nodes[id])throw Error('Unknown scene: '+id);if(!Number.isInteger(step)||step< -1||step>3)throw Error('Invalid storyboard step');
 const color=id==='growth'?'#83e9b9':id==='atrophy'?'#f49bbc':'#77d9ff';
 const stage=nodes[id].map((label,i)=>{const x=12+(i%2)*178,y=130+Math.floor(i/2)*50;return `<g class="scene-node ${i===step?'active':''}"><rect x="${x}" y="${y}" width="166" height="38" rx="8"/><text x="${x+83}" y="${y+24}" text-anchor="middle">${escape(label)}</text></g>`;}).join('');
 let drawing;
 if(id==='contraction'){
  const shift=step>=1?24:0;
  drawing=`<g transform="translate(${shift} 0)"><path d="M35 22V108" stroke="#d4deed" stroke-width="5"/><path d="M35 40H165M35 90H165" stroke="#a398ff" stroke-width="8"/></g><g transform="translate(${-shift} 0)"><path d="M325 22V108" stroke="#d4deed" stroke-width="5"/><path d="M195 40H325M195 90H325" stroke="#a398ff" stroke-width="8"/></g><path d="M110 65H250" stroke="#fc94a7" stroke-width="12"/><path d="M135 65l-12 -14M160 65l-12 14M200 65l12 -14M225 65l12 14" stroke="#fc94a7" stroke-width="4" opacity="${step===2?'.25':'1'}"/><text x="58" y="118">Актин</text><text x="239" y="118">Міозин</text><text x="180" y="18" text-anchor="middle" fill="${color}">${step===0?'Ca²⁺ дозволяє взаємодію':step===2?'ATP: від’єднання головок':step===3?'Гідроліз ATP: підготовка':'Ковзання, не вкорочення філаментів'}</text>`;
 }else if(id==='growth'){
  drawing=`<path d="M25 65H335" stroke="#476474" stroke-width="2" stroke-dasharray="5 4"/><g class="scene-symbol ${step===0?'active':''}"><circle cx="53" cy="65" r="26"/><text x="53" y="70" text-anchor="middle">Н</text></g><g class="scene-symbol ${step===1?'active':''}"><rect x="113" y="39" width="104" height="52" rx="16"/><text x="165" y="70" text-anchor="middle">mTORC1*</text></g><g class="scene-symbol ${step>=2?'active':''}"><circle cx="287" cy="65" r="26"/><text x="287" y="70" text-anchor="middle">Білки</text></g><text x="180" y="118" text-anchor="middle">* Один із регуляторів, не весь механізм</text>`;
 }else{
  drawing=`<path d="M180 32V104M140 104H220" stroke="#a3b5c3" stroke-width="5"/><path d="M88 47H272" stroke="#d3e0eb" stroke-width="4"/><path d="M90 47L70 83H110ZM270 47L250 83H290Z" fill="none" stroke="#638397" stroke-width="2"/><circle cx="90" cy="84" r="8" fill="#82e5b8"/><circle cx="270" cy="84" r="8" fill="#f39abe"/><text x="90" y="25" text-anchor="middle">Синтез</text><text x="270" y="25" text-anchor="middle">Розпад</text><text x="180" y="122" text-anchor="middle">Співвідношення залежить від контексту</text>`;
 }
 return `<svg viewBox="0 0 360 232" role="img" aria-label="${escape(id==='contraction'?'Умовна схема актину та міозину':id==='growth'?'Схема регуляції адаптації м’яза':'Схема білкового обміну при атрофії')}" style="--scene-color:${color}">${drawing}${stage}</svg>`;
}
