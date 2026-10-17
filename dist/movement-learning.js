// The external load alone: a horizontal lever and a vertical gravitational force.
export function externalMoment(massKg,distanceCm){
 if(!Number.isFinite(massKg)||!Number.isFinite(distanceCm)||massKg<0||distanceCm<0)throw new RangeError('Non-negative finite mass and distance required');
 return massKg*9.81*distanceCm/100;
}

export function mountMovementLearning(root=document){
 const mass=root.getElementById('lever-mass'),distance=root.getElementById('lever-distance');
 if(mass&&distance){
  const number=new Intl.NumberFormat('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2});
  function update(announce=false){
   const kg=Number(mass.value),cm=Number(distance.value),x=80+cm*8;
   root.getElementById('lever-mass-value').textContent=mass.value+' кг';
   root.getElementById('lever-distance-value').textContent=distance.value+' см';
   root.getElementById('lever-force').textContent=number.format(kg*9.81)+' Н';
   root.getElementById('lever-moment').textContent=number.format(externalMoment(kg,cm));
   root.getElementById('lever-load').setAttribute('transform',`translate(${x} 0)`);
   root.getElementById('lever-distance-mark').setAttribute('x2',String(x));
   root.getElementById('lever-distance-label').setAttribute('x',String((80+x)/2));
   root.getElementById('lever-distance-label').textContent=cm+' см';
   if(announce)root.getElementById('lever-result-status').textContent='Момент сили: '+number.format(externalMoment(kg,cm))+' ньютон-метра.';
  }
  mass.addEventListener('input',()=>update(true));distance.addEventListener('input',()=>update(true));
  root.querySelectorAll('[data-lever-preset]').forEach(button=>button.addEventListener('click',()=>{
   mass.value='2';distance.value=button.dataset.leverPreset==='far'?'30':'15';update(true);
   root.getElementById('lever-lab').scrollIntoView({block:'start'});
   if(button.dataset.returnFocus==='lever')mass.focus();
  }));
  update();
 }
 const roles=[...root.querySelectorAll('[data-muscle-role]')];
 function selectRole(role){
  roles.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.muscleRole===role)));
  root.querySelectorAll('[data-role-panel]').forEach(panel=>{panel.hidden=panel.dataset.rolePanel!==role;});
  root.querySelectorAll('[data-muscle-zone]').forEach(zone=>zone.setAttribute('visibility',zone.dataset.muscleZone===role?'visible':'hidden'));
 }
 roles.forEach(button=>button.addEventListener('click',()=>selectRole(button.dataset.muscleRole)));
 if(roles.length)selectRole('mover');
}
