import test from 'node:test';
import assert from 'node:assert/strict';
const model=await import('../src/movement/model.mjs').catch(()=>null);
const page=await import('../src/movement/page.mjs');
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('moving a joint never stretches the model arm or leg',()=>{
 assert(model,'The movement kinematics module has not been implemented');
 for(const mode of ['walk','sagittal','frontal','transverse','all','puppet'])for(const side of [-1,1])for(const phase of [-Math.PI/2,0,Math.PI/2,Math.PI]){
  const p=model.poseFor(mode,phase,{side,manual:{shoulder:110,elbow:120,hip:75,knee:90}});
  near(distance(p.shoulder,p.elbow),30);near(distance(p.elbow,p.wrist),28);
  near(distance(p.hip,p.knee),42);near(distance(p.knee,p.ankle),42);
 }
});

test('manual elbow flexion changes the forearm around a fixed elbow',()=>{
 assert(model,'The movement kinematics module has not been implemented');
 const p=model.poseFor('puppet',0,{side:1,manual:{elbow:90}});
 assert.deepEqual(p.shoulder,[23,139,0]);assert.deepEqual(p.elbow,[23,109,0]);
 near(p.wrist[0],23);near(p.wrist[1],109);near(p.wrist[2],28);
});

test('knee flexion bends back relative to the thigh, independently on each side',()=>{
 assert(model,'The movement kinematics module has not been implemented');
 const p=model.poseFor('puppet',0,{side:-1,manual:{hip:90,knee:90}});
 near(p.knee[0],-13);near(p.knee[1],91);near(p.knee[2],42);
 near(p.ankle[1],49);near(p.ankle[2],42);
});

test('a fragment link reveals its hidden lesson before scrolling to it',()=>{
 assert.equal(typeof page.revealLessonFromHash,'function','Same-page lesson fragment handling is missing');
 const panel={hidden:true,scrolled:false,scrollIntoView(){assert.equal(this.hidden,false);this.scrolled=true;}};
 const root={defaultView:{location:{hash:'#lesson-shoulder'}},getElementById:id=>id==='lesson-shoulder'?panel:null};
 let selected;page.revealLessonFromHash(root,key=>{selected=key;panel.hidden=false;});
 assert.equal(selected,'shoulder');assert.equal(panel.scrolled,true);
});

test('unrelated fragments do not switch or scroll a movement lesson',()=>{
 assert.equal(typeof page.revealLessonFromHash,'function','Same-page lesson fragment handling is missing');
 let changed=false,scrolled=false;
 page.revealLessonFromHash({defaultView:{location:{hash:'#sources'}},getElementById(){scrolled=true;}},()=>{changed=true;});
 assert.equal(changed,false);assert.equal(scrolled,false);
});
