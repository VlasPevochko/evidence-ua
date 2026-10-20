// «Куди далі»: три сусідні матеріали внизу кожної сторінки. Це навігація, а не наукові твердження:
// назви беруться з каталогу, жодних нових пояснень чи обіцянок тут немає.
export const NEXT_STEPS={
  'nutrition.html':[['./nutrition-digestion.html','Травлення та всмоктування','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування'],['./supplements.html','Що відомо про добавки','Докази']],
  'nutrition-digestion.html':[['./nutrition.html','Від їжі до клітини','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування'],['./cell-lab.html','Клітина людини','Cell Lab']],
  'fat-burning.html':[['./nutrition.html','Від їжі до клітини','Харчування'],['./exercises.html','Бібліотека вправ','Практика'],['./sleep.html','Сон і відновлення','Відновлення']],
  'muscle-lab.html':[['./movement.html','Рух і біомеханіка','Movement Lab'],['./exercises.html','Бібліотека вправ','Практика'],['./cell-lab.html','Клітина людини','Cell Lab']],
  'cell-lab.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./nutrition.html','Від їжі до клітини','Харчування'],['./atlas.html','Атлас людського тіла','Атлас']],
  'movement.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./exercises.html','Бібліотека вправ','Практика'],['./atlas.html','Атлас людського тіла','Атлас']],
  'sleep.html':[['./movement.html','Рух і біомеханіка','Movement Lab'],['./nutrition.html','Від їжі до клітини','Харчування'],['./fat-burning.html','Куди зникає жир?','Харчування']],
  'atlas.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./movement.html','Рух і біомеханіка','Movement Lab'],['./exercises.html','Бібліотека вправ','Практика']],
  'exercises.html':[['./muscle-lab.html','Від м’яза до молекул','Muscle Lab'],['./movement.html','Рух і біомеханіка','Movement Lab'],['./atlas.html','Атлас людського тіла','Атлас']],
  'supplements.html':[['./protein-meta.html','Розбір метааналізу білка','Докази'],['./nutrition.html','Від їжі до клітини','Харчування'],['./index.html#evidence-guide-title','Як читати докази','Докази']],
  'protein-meta.html':[['./supplements.html','Що відомо про добавки','Докази'],['./nutrition.html','Від їжі до клітини','Харчування'],['./exercises.html','Бібліотека вправ','Практика']]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function nextStepsHTML(file){
  const items=NEXT_STEPS[file];if(!items)return '';
  return `<h2 id="eua-next-title">Куди далі</h2><ul>${items.map(([href,title,tag])=>`<li><a href="${esc(href)}"><span>${esc(tag)}</span><strong>${esc(title)}</strong><b aria-hidden="true">→</b></a></li>`).join('')}</ul>`;
}
export function mountNextSteps(root=document){
  const view=root.defaultView;if(!view||view.self!==view.top||root.querySelector('.eua-next'))return;
  const file=String(view.location?.pathname||'').split('/').pop()||'index.html',html=nextStepsHTML(file);if(!html)return;
  const host=root.querySelector('main')||root.body;if(!host)return;
  const head=root.head;if(head&&!root.querySelector('link[data-next-steps-style]')){const css=root.createElement('link');css.rel='stylesheet';css.href='./next-steps.css?v=1';css.dataset.nextStepsStyle='';head.append(css);}
  const nav=root.createElement('nav');nav.className='eua-next';nav.setAttribute('aria-labelledby','eua-next-title');nav.innerHTML=html;
  const footer=[...host.children].reverse().find(c=>c.tagName==='FOOTER');
  if(footer)footer.before(nav);else host.append(nav);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mountNextSteps(document),{once:true});else mountNextSteps(document);}
