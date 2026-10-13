// Data-driven stepper. Playback timing is a UI cadence, not measured physiology.
export function createNutritionPlayer(module,{route='glucose'}={}){
 let routeId=module.routes.some(r=>r.id===route)?route:module.routes[0].id,index=0,running=false;
 const current=()=>module.routes.find(r=>r.id===routeId);
 const state=()=>({routeId,index,running,route:current(),step:current().steps[index]});
 return {
  state,
  selectRoute(id){if(!module.routes.some(r=>r.id===id))throw Error('Unknown nutrient route');routeId=id;index=0;running=false;return state();},
  selectStep(value){if(!Number.isInteger(value)||value<0||value>=current().steps.length)throw Error('Unknown step');index=value;running=false;return state();},
  previous(){running=false;index=Math.max(0,index-1);return state();},
  next(){running=false;index=Math.min(current().steps.length-1,index+1);return state();},
  reset(){running=false;index=0;return state();},
  play(){if(index===current().steps.length-1)index=0;running=true;return state();},
  pause(){running=false;return state();},
  tick(){if(running){index=Math.min(current().steps.length-1,index+1);if(index===current().steps.length-1)running=false;}return state();}
 };
}
