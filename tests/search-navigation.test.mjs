import assert from 'node:assert/strict';
import {mountSearch} from '../src/platform/search.mjs';

// Exercise the controller's actual event handlers; this is not browser layout QA.
const handlers = () => ({events:new Map(), addEventListener(type, fn){this.events.set(type, fn);}, focus(){doc.activeElement=this;}});
const input = {...handlers(), value:''};
const list = {...handlers(), innerHTML:'', querySelectorAll(){return [result];}};
const status = {};
const dialog = {...handlers(), open:false, setAttribute(){}, showModal(){this.open=true;}, close(){this.open=false;this.events.get('close')?.();}, querySelector(selector){return selector==='input'?input:selector==='.eua-search-results'?list:status;}};
const doc = {activeElement:null, defaultView:{location:{href:'https://evidence.invalid/index.html'}}, body:{append(){}}, createElement(){return dialog;}, addEventListener(){}};
const button = {...handlers(), dataset:{}};
let prevented = false;
const clickResult = () => list.events.get('click')({target:{closest:selector=>selector==='a'?result:null}, preventDefault(){prevented=true;}});
const result = {href:'./index.html#creatine', click:clickResult, focus(){doc.activeElement=this;}};
const controller = mountSearch(doc, button, async()=>({materials:[{title:'Креатин', href:result.href, areaTitle:'Добавки'}], terms:[]}));

await controller.open();
input.value='Креатин';input.events.get('input')();
assert(list.innerHTML.includes('./index.html#creatine'));
clickResult();
assert.equal(dialog.open, false, 'Choosing a same-document result closes the search dialog');
assert.equal(prevented, false, 'Result links retain default browser navigation');

await controller.open();
input.value='';input.events.get('input')();
list.events.get('click')({target:{closest:selector=>selector==='[data-q]'?{dataset:{q:'сон'}}:null}});
assert.equal(dialog.open, true, 'Suggestion chips keep the search dialog open');
assert.equal(input.value, 'сон');

input.value='Креатин';input.events.get('input')();doc.activeElement=input;
dialog.events.get('keydown')({key:'Enter', preventDefault(){}});
assert.equal(dialog.open, false, 'Enter on the search field also dismisses the dialog for its first result');
console.log('Search navigation: mouse/keyboard result dismissal, default links and suggestion chips passed.');
