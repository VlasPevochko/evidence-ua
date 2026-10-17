export function mountSleep(root=document){
 const buttons=[...root.querySelectorAll('[data-sleep-stage]')],panels=[...root.querySelectorAll('[data-stage-panel]')];
 if(!buttons.length||!panels.length)return;
 const select=id=>{buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sleepStage===id)));panels.forEach(panel=>{panel.hidden=panel.dataset.stagePanel!==id;});};
 buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.sleepStage)));
 select(buttons[0].dataset.sleepStage);
}
if(typeof document!=='undefined')mountSleep();
