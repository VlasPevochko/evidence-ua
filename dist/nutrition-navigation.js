// Navigation only: existing scientific content and model controllers are unchanged.
const modelHashes=new Set(['#nutrition-fat-burning','#nutrition-lab','#nutrient-time','#nutrition-evidence','#nutrition-sources']);
const modelParams={nutrient:/^(glucose|protein|lipids)$/,step:/^[0-3]$/,depth:/^(simple|detailed)$/,scale:/^(body|cell)$/,structure:/^(sglt1|glut2|pump|pept1|micelle|chylomicron)$/};

export function nutritionDestination(href){
 const url=new URL(href);
 if(!/\/nutrition(?:\.html)?$/.test(url.pathname)||url.hash==='#nutrition-diets'||url.hash.startsWith('#diet-'))return null;
 const selected=Object.entries(modelParams).filter(([key,rule])=>rule.test(url.searchParams.get(key)||''));
 if(!modelHashes.has(url.hash)&&!selected.length)return null;
 const target=new URL('./nutrition-inside.html',url);
 for(const [key] of selected)target.searchParams.set(key,url.searchParams.get(key));
 if(url.searchParams.get('path')==='evidence'&&url.searchParams.get('lesson')==='0'){
  target.searchParams.set('path','evidence');target.searchParams.set('lesson','0');
 }
 target.hash=modelHashes.has(url.hash)?url.hash:'#nutrition-lab';
 return target.href;
}

export function mountNutritionNavigation(root=document){
 const view=root.defaultView;
 const redirect=()=>{const target=nutritionDestination(view.location.href);if(target)view.location.replace(target);};
 redirect();
 view.addEventListener('hashchange',redirect);
 root.addEventListener('click',event=>{
  if(event.target.closest('dialog'))return;
  for(const menu of root.querySelectorAll('[data-nutrition-menu][open]'))if(!menu.contains(event.target))menu.open=false;
 });
 root.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||root.querySelector('dialog[open]')||root.body.dataset.euaFocus)return;
  for(const menu of root.querySelectorAll('[data-nutrition-menu][open]')){menu.open=false;menu.querySelector('summary')?.focus();event.preventDefault();}
 });
}

if(typeof document!=='undefined')mountNutritionNavigation();
