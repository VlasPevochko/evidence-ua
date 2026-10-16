import test from 'node:test';
import assert from 'node:assert/strict';
const sleep=await import('../src/sleep/page.mjs').catch(()=>null);

test('choosing a sleep stage shows its explanation and preserves one selected button',()=>{
 assert(sleep,'The sleep stage controller has not been implemented');
 const buttons=['n1','n2','n3','rem'].map(id=>({dataset:{sleepStage:id},attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;}}));
 const panels=buttons.map(b=>({dataset:{stagePanel:b.dataset.sleepStage},hidden:false}));
 const root={querySelectorAll:selector=>selector==='[data-sleep-stage]'?buttons:panels};
 sleep.mountSleep(root);
 assert.deepEqual(panels.map(p=>p.hidden),[false,true,true,true]);
 buttons[3].listeners.click();
 assert.deepEqual(panels.map(p=>p.hidden),[true,true,true,false]);
 assert.deepEqual(buttons.map(b=>b.attributes['aria-pressed']),['false','false','false','true']);
 buttons[2].listeners.click();
 assert.deepEqual(panels.map(p=>p.hidden),[true,true,false,true]);
});
