// Група «Про сайт» на головній: вкладені блоки (зміст, відгук) мають власні id, і інші скрипти
// відкривають їх через .open = true або через якір. Тут група розкривається разом із вкладеним блоком.
(()=>{
  const about=document.getElementById('home-about');
  if(!about)return;
  const inner=[...about.querySelectorAll('.home-about-body>details')];
  const reveal=()=>{about.open=true;};
  const observer=new MutationObserver(records=>{if(records.some(r=>r.target.open))reveal();});
  inner.forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
  const fromHash=()=>{const id=decodeURIComponent(location.hash.slice(1));if(id&&about.contains(document.getElementById(id)))reveal();};
  fromHash();
  addEventListener('hashchange',fromHash);
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;const id=decodeURIComponent(a.getAttribute('href').slice(1));if(id&&about.contains(document.getElementById(id)))reveal();});
})();
