import test from 'node:test';
import assert from 'node:assert/strict';
const learning=await import('../src/movement/learning.mjs').catch(()=>null);
const model=await import('../src/movement/model.mjs');
const page=await import('../src/movement/page.mjs');
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('the external moment converts centimetres to metres and scales with mass',()=>{
 assert.equal(typeof learning?.externalMoment,'function','The lever lesson is missing');
 near(learning.externalMoment(2,30),5.886);
 near(learning.externalMoment(4,15),5.886);
 near(learning.externalMoment(2,15),2.943);
 near(learning.externalMoment(0,30),0);
 assert.throws(()=>learning.externalMoment(-2,30),RangeError);
 assert.throws(()=>learning.externalMoment(2,NaN),RangeError);
});

test('walking stops wrap at the cycle boundary instead of showing a fifth phase',()=>{
 assert.equal(typeof model.walkStateAt,'function','Guided walking stops are missing');
 for(const [percent,key] of [[0,'contact'],[30,'support'],[75,'swing'],[95,'prepare'],[100,'contact'],[-5,'prepare']])assert.equal(model.walkStateAt(percent),key);
});

test('the teaching walk keeps its stance foot at the reference plane and clears it in swing',()=>{
 for(const percent of [0,30,59]){
  const pose=model.poseFor('walk',percent/100*Math.PI*2-Math.PI/2,{side:1});
  near(pose.ankle[1],14);
 }
 const left=model.poseFor('walk',.75*Math.PI*2-Math.PI/2,{side:1});
 const right=model.poseFor('walk',.75*Math.PI*2-Math.PI/2,{side:-1});
 assert(left.ankle[1]>25);near(right.ankle[1],14);
});

function element(dataset={},value=''){
 return {dataset,value,hidden:false,textContent:'',attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},addEventListener(k,v){this.events[k]=v;},scrollIntoView(){this.scrolled=true;},focus(){this.focused=true;}};
}
function fixture(){
 const ids=Object.fromEntries(['lever-mass','lever-distance','lever-mass-value','lever-distance-value','lever-moment','lever-force','lever-load','lever-distance-mark','lever-distance-label','lever-lab','lever-result-status'].map(id=>[id,element()]));
 ids['lever-mass'].value='2';ids['lever-distance'].value='15';
 const preset=element({leverPreset:'far',returnFocus:'lever'});
 const roles=['mover','helper','stabilizer','opponent'].map(role=>element({muscleRole:role}));
 const panels=roles.map(b=>element({rolePanel:b.dataset.muscleRole}));
 const zones=roles.map(b=>element({muscleZone:b.dataset.muscleRole}));
 const selectors={'[data-lever-preset]':[preset],'[data-muscle-role]':roles,'[data-role-panel]':panels,'[data-muscle-zone]':zones};
 return {ids,preset,roles,panels,zones,root:{getElementById:id=>ids[id],querySelectorAll:selector=>selectors[selector]||[]}};
}

test('moving the load changes the displayed moment and keeps the matching diagram position',()=>{
 assert.equal(typeof learning?.mountMovementLearning,'function','Learning controls are missing');
 const f=fixture();learning.mountMovementLearning(f.root);
 assert.equal(f.ids['lever-moment'].textContent,'2,94');
 f.preset.events.click();
 assert.equal(f.ids['lever-distance'].value,'30');assert.equal(f.ids['lever-mass'].value,'2');
 assert.equal(f.ids['lever-moment'].textContent,'5,89');
 assert.equal(f.ids['lever-load'].attributes.transform,'translate(320 0)');
 assert.equal(f.ids['lever-result-status'].textContent,'Момент сили: 5,89 ньютон-метра.');
 assert.equal(f.ids['lever-mass'].focused,true);
 f.ids['lever-mass'].value='4';f.ids['lever-mass'].events.input();
 assert.equal(f.ids['lever-moment'].textContent,'11,77');
});

test('seeking updates the displayed cycle and walking explanation without waiting for a paint',()=>{
 assert.equal(typeof page.syncCycleUI,'function','Cycle UI still depends on animation paint');
 const ids={phase:element(), 'phase-value':element()};
 const buttons=[0,30,75,95].map(percent=>element({walkStop:String(percent)}));
 const panels=['contact','support','swing','prepare'].map(key=>element({walkPanel:key}));
 const root={getElementById:id=>ids[id],querySelectorAll:s=>s==='[data-walk-stop]'?buttons:s==='[data-walk-panel]'?panels:[]};
 page.syncCycleUI(root,75,'walk');
 assert.equal(ids.phase.value,'75');assert.equal(ids['phase-value'].textContent,'75%');
 assert.deepEqual(panels.map(p=>p.hidden),[true,true,false,true]);
 assert.deepEqual(buttons.map(b=>b.attributes['aria-pressed']),['false','false','true','false']);
});

test('choosing a muscle role reveals only its explanation and highlighted schematic zone',()=>{
 assert.equal(typeof learning?.mountMovementLearning,'function','Learning controls are missing');
 const f=fixture();learning.mountMovementLearning(f.root);f.roles[3].events.click();
 assert.deepEqual(f.roles.map(x=>x.attributes['aria-pressed']),['false','false','false','true']);
 assert.deepEqual(f.panels.map(x=>x.hidden),[true,true,true,false]);
 assert.deepEqual(f.zones.map(x=>x.attributes.visibility),['hidden','hidden','hidden','visible']);
});
