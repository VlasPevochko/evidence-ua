import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const blocks=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const script=blocks.find(b=>b.includes('esearch.fcgi'));
class Node {constructor(){this.textContent='';this.innerHTML='';this.disabled=false;this.children=[];this.handlers={};this.value='performance';}append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}addEventListener(k,f){this.handlers[k]=f;}focus(){this.focused=true;}}
const results=[];
async function scenario(name,fetcher){
 const fields=Object.fromEntries(['research-load','research-status','research-results','research-checked','research-topic'].map(k=>[k,new Node()]));
 let timers=[];
 const document={getElementById:id=>fields[id],createElement:()=>new Node(),createDocumentFragment:()=>new Node()};
 vm.runInNewContext(script,{document,fetch:fetcher,AbortController,URLSearchParams,Number,Date,encodeURIComponent,setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout:()=>{}});
 const p=fields['research-load'].handlers.click();
 if(name==='timeout'){await Promise.resolve();timers[0]();}
 await p;
 const status=fields['research-status'].textContent;
 assert.equal(fields['research-load'].disabled,false);
 const fallback=fields['research-results'].children.find(n=>n.href?.startsWith('https://pubmed'));
 results.push({name,status,buttonEnabled:true,fallback:!!fallback});
}
await scenario('network rejection',async()=>{throw Error('test network');});
await scenario('HTTP 503',async()=>({ok:false,status:503}));
await scenario('invalid JSON',async()=>({ok:true,json:async()=>{throw SyntaxError('test invalid JSON');}}));
await scenario('timeout',(_,opts)=>new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(Error('test abort')))));
await scenario('valid empty search',async()=>({ok:true,json:async()=>({esearchresult:{idlist:[],count:'0'}})}));
await scenario('HTTP 200 API error at search',async()=>({ok:true,json:async()=>({error:'test API error'})}));
let calls=0;
await scenario('HTTP 200 API error at summary',async()=>({ok:true,json:async()=>++calls===1?{esearchresult:{idlist:['42765482'],count:'1'}}:{error:'test API error'}}));
calls=0;
await scenario('successful metadata',async()=>({ok:true,json:async()=>++calls===1?{esearchresult:{idlist:['42765482'],count:'1'}}:{result:{42765482:{title:'Test fixture',pubdate:'2026',authors:[],source:'Test'}}}}));

for(const r of results){
 const failure=!['valid empty search','successful metadata'].includes(r.name);
 assert.equal(r.fallback,failure,r.name);
 if(failure)assert(r.status.startsWith('Не вдалося'),r.name);
}
await scenario('malformed search',async()=>({ok:true,json:async()=>({esearchresult:{count:'1'}})}));
assert(results.at(-1).fallback);
console.log('PubMed: API errors, network, HTTP, JSON, timeout, empty results and success passed.');
