import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';
import {mountNutritionLab} from '../dist/nutrition-lab.js';
import {mount as mountMuscle} from '../src/muscle-lab/controller.mjs';
import {mount as mountCell} from '../src/cell-lab/controller.mjs';
import {structures} from '../src/muscle-lab/module.mjs';
import {organelles} from '../src/cell-lab/module.mjs';
import {controllerDOM} from './helpers/controller-dom.mjs';

function nutrition(options={}){
 const dom=controllerDOM({href:'https://evidence.invalid/nutrition-inside.html',...options});
 for(const [field,values] of Object.entries({nlRoute:['glucose','protein','lipids'],nlNutrient:['glucose','protein','lipids'],nlAction:['play'],nlView:['body','cell'],nlStep:['0','1','2','3'],nlStructure:['sglt1','glut2','pump','pept1','micelle','chylomicron'],nlHighlight:['sglt1','glut2','pump','pept1','micelle','chylomicron']}))dom.buttons(`[data-${field.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`,field,values);
 return {...dom,ui:mountNutritionLab(dom.root,{schedule:dom.schedule,unschedule:dom.unschedule})};
}
function transform(dom){const style=dom.node('#nl-stage').style;return {zoom:Number(style['--nl-zoom']),tx:parseFloat(style['--nl-tx']),ty:parseFloat(style['--nl-ty'])};}

// Read the selectable shapes from the actual SVG, including the live position of
// the exported particle. This catches stale focus points if the drawing changes.
const drawing=fs.readFileSync(new URL('../dist/nutrition-inside.html',import.meta.url),'utf8');
function bounds(id,dom){
 const rect=drawing.match(new RegExp(`<rect data-nl-highlight="${id}"[^>]+>`));
 const attribute=(text,name)=>Number(text.match(new RegExp(`\\b${name}="([^"]+)"`))[1]);
 if(rect){const x=attribute(rect[0],'x'),y=attribute(rect[0],'y');return {left:x,right:x+attribute(rect[0],'width'),top:y,bottom:y+attribute(rect[0],'height')};}
 const group=drawing.match(new RegExp(`<g data-nl-highlight="${id}"[^>]*><circle r="([^"]+)"`));
 const translated=id==='chylomicron'?dom.node('#nl-chylomicron').attributes.transform:group[0];
 const [,x,y]=translated.match(/translate\(([-\d.]+) ([-\d.]+)\)/).map(Number),r=Number(group[1]);
 return {left:x-r,right:x+r,top:y-r,bottom:y+r};
}
function assertVisible(id,dom){
 const {zoom,tx,ty}=transform(dom),b=bounds(id,dom);
 for(const [edge,value] of Object.entries({left:b.left/900*100*zoom+tx,right:b.right/900*100*zoom+tx,top:b.top/560*100*zoom+ty,bottom:b.bottom/560*100*zoom+ty}))assert(value>=0&&value<=100,`${id} ${edge} at ${value.toFixed(1)}% must be inside the stage`);
}

test('phone selection keeps the complete pump in frame',()=>{
 const dom=nutrition({phone:true});
 try{dom.click({nlStructure:'pump'});assert.equal(dom.ui.state().selectedStructure,'pump');assertVisible('pump',dom);}finally{dom.ui.destroy();}
});
test('every selectable Nutrition structure stays in frame and resets on desktop',()=>{
 const dom=nutrition({phone:true});
 try{for(const id of ['sglt1','glut2','pump','pept1','micelle','chylomicron']){
  dom.click({nlStructure:id});assertVisible(id,dom);
  dom.resize(false);assert.deepEqual(transform(dom),{zoom:1,tx:0,ty:0},id+' desktop');
  dom.resize(true);assertVisible(id,dom);
 }}finally{dom.ui.destroy();}
});
test('Nutrition deep links and history focus the selected structure',()=>{
 const dom=nutrition({phone:true,href:'https://evidence.invalid/nutrition-inside.html?structure=pump'});
 try{assertVisible('pump',dom);dom.location.href='https://evidence.invalid/nutrition-inside.html?structure=micelle';dom.view.emit('popstate');assertVisible('micelle',dom);}finally{dom.ui.destroy();}
});
test('ordinary Nutrition steps and playback retain their step focus after structure selection',()=>{
 const dom=nutrition({phone:true});
 // Expected translations of the existing step-driven scenes, in stage percent.
 const expected={glucose:{x:[0,-2.8,-85.1,-90],y:-21.3},protein:{x:[0,-2.8,-85.1,-90],y:-45},lipids:{x:[0,-9.1,-66.1,-90],y:-85.7}};
 try{for(const route of ['glucose','protein','lipids']){
  dom.click({nlStructure:'pump'});dom.click({nlNutrient:route});
  for(let step=0;step<4;step++){dom.click({nlStep:String(step)});assert.equal(dom.ui.state().selectedStructure,null);assert.deepEqual(transform(dom),{zoom:1.9,tx:expected[route].x[step],ty:expected[route].y});}
 }
 dom.click({nlStructure:'pump'});dom.click({nlAction:'play'});assert.equal(dom.ui.state().selectedStructure,null);
 assert.deepEqual(transform(dom),{zoom:1.9,tx:-2.8,ty:-21.3});dom.tick();assert.deepEqual(transform(dom),{zoom:1.9,tx:-85.1,ty:-21.3});
 }finally{dom.ui.destroy();}
});

function muscle(){
 const dom=controllerDOM({href:'https://evidence.invalid/muscle-lab.html'});
 dom.buttons('[data-structure]','structure',structures.map(s=>s.id));
 for(const {id} of structures)dom.node(`#scales [data-structure="${id}"]`).dataset.structure=id;
 return {...dom,ui:mountMuscle(dom.root)};
}
test('Muscle arrows start at the focused Sarcomere while Muscle remains selected',()=>{
 const dom=muscle();
 try{assert.equal(dom.ui.state().selected,'TISSUE-SKELETAL-MUSCLE');const focused=dom.node('sarcomere');focused.dataset.structure='STRUCT-SARCOMERE';focused.focus();
 assert(dom.key('ArrowRight'));assert.equal(dom.ui.state().selected,'PRT-ACTIN-MYOSIN');assert.equal(dom.active(),dom.node('#scales [data-structure="PRT-ACTIN-MYOSIN"]'));
 assert.equal(new URL(dom.location.href).searchParams.get('structure'),'PRT-ACTIN-MYOSIN');
 dom.key('ArrowLeft');assert.equal(dom.ui.state().selected,'STRUCT-SARCOMERE');dom.key('ArrowLeft');assert.equal(dom.ui.state().selected,'STRUCT-MYOFIBRIL');
 }finally{dom.ui.destroy();}
});
test('Muscle mixed Tab/arrow navigation clamps at both ends and ignores other keys',()=>{
 const dom=muscle();
 try{for(const [focused,key,expected] of [['PRT-ACTIN-MYOSIN','ArrowRight','PRT-ACTIN-MYOSIN'],['TISSUE-SKELETAL-MUSCLE','ArrowLeft','TISSUE-SKELETAL-MUSCLE'],['STRUCT-MYOFIBRIL','ArrowLeft','CELL-MUSCLE'],['STRUCT-FASCICLE','ArrowRight','CELL-MUSCLE']]){
  const button=dom.node('tab-to-'+focused);button.dataset.structure=focused;button.focus();assert(dom.key(key));assert.equal(dom.ui.state().selected,expected);
  const active=dom.active();assert.equal(active,dom.node(`#scales [data-structure="${expected}"]`));
 }
 const selected=dom.ui.state().selected;assert.equal(dom.key('Home'),false);assert.equal(dom.ui.state().selected,selected);
 }finally{dom.ui.destroy();}
});

function cell(){
 const dom=controllerDOM({href:'https://evidence.invalid/cell-lab.html'});
 dom.buttons('[data-organelle]','organelle',organelles.map(o=>o.id));
 for(const {id} of organelles)dom.node(`[data-organelle="${id}"]`).dataset.organelle=id;
 return {...dom,ui:mountCell(dom.root)};
}
test('Cell arrows start at focused plasma membrane while mitochondrion remains selected',()=>{
 const dom=cell();
 try{assert.equal(dom.ui.state().selected,'ORG-MITOCHONDRION');const button=dom.node('[data-organelle="STRUCT-PLASMA-MEMBRANE"]');button.dataset.organelle='STRUCT-PLASMA-MEMBRANE';button.focus();
 assert(dom.key('ArrowLeft',undefined,dom.node('#cell-canvas')));assert.equal(dom.ui.state().selected,'STRUCT-CYTOSKELETON');assert.equal(dom.active(),dom.node('[data-organelle="STRUCT-CYTOSKELETON"]'));
 assert.equal(new URL(dom.location.href).searchParams.get('organelle'),'STRUCT-CYTOSKELETON');
 dom.key('ArrowRight',undefined,dom.node('#cell-canvas'));assert.equal(dom.ui.state().selected,'STRUCT-PLASMA-MEMBRANE');dom.key('ArrowRight',undefined,dom.node('#cell-canvas'));assert.equal(dom.ui.state().selected,'ORG-NUCLEUS');
 }finally{dom.ui.destroy();}
});
test('Cell mixed Tab/arrow navigation wraps and supports all four arrow keys',()=>{
 const dom=cell();
 try{for(const [focused,key,expected] of [[organelles[0].id,'ArrowLeft',organelles.at(-1).id],[organelles.at(-1).id,'ArrowRight',organelles[0].id],['STRUCT-PLASMA-MEMBRANE','ArrowUp','STRUCT-CYTOSKELETON'],['ORG-NUCLEUS','ArrowDown',organelles[1].id]]){
  const button=dom.node(`[data-organelle="${focused}"]`);button.dataset.organelle=focused;button.focus();assert(dom.key(key,undefined,dom.node('#cell-canvas')));assert.equal(dom.ui.state().selected,expected);assert.equal(dom.active(),dom.node(`[data-organelle="${expected}"]`));
 }
 const selected=dom.ui.state().selected;assert.equal(dom.key('Home',undefined,dom.node('#cell-canvas')),false);assert.equal(dom.ui.state().selected,selected);
 }finally{dom.ui.destroy();}
});
