import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderFoundationTemplates} from '../src/atlas/foundations.mjs';

const START='<!-- EUA_ATLAS_FOUNDATIONS_START -->',END='<!-- EUA_ATLAS_FOUNDATIONS_END -->';
function rewrite(text,pairs){
 for(const [from,to] of pairs){
  if(!text.includes(from))throw Error('Missing Atlas import to rewrite: '+from);
  text=text.replaceAll(from,to);
 }
 return text;
}
export function buildAtlasFoundations(root=process.cwd()){
 const file=path.join(root,'dist/atlas.html'),html=fs.readFileSync(file,'utf8');
 const start=html.indexOf(START),end=html.indexOf(END);
 if(start<0||end<start||html.lastIndexOf(START)!==start||html.lastIndexOf(END)!==end)throw Error('Atlas foundations fragment markers must occur exactly once in order');
 const source=file=>fs.readFileSync(path.join(root,file),'utf8');
 // Prepare every output before any write, so invalid inputs cannot leave a partial fragment.
 const data=rewrite(source('src/evidence/atlas/foundations.mjs'),[
  ["'../core/registry.mjs'","'./evidence/registry.js?v=55'"],
  ["'../nutrition/digestion/module.mjs'","'./digestion-data.js?v=1'"]
 ]);
 const controller=rewrite(source('src/atlas/foundations.mjs'),[
  ["'../evidence/atlas/foundations.mjs'","'./atlas-foundations-data.js?v=1'"]
 ]);
 const css=source('src/atlas/foundations.css');
 const fragment=renderFoundationTemplates();
 const next=html.slice(0,start+START.length)+'\n'+fragment+'\n'+html.slice(end);
 const output={'atlas-foundations-data.js':data,'atlas-foundations.js':controller,'atlas-foundations.css':css,'atlas.html':next};
 for(const [name,bytes] of Object.entries(output))fs.writeFileSync(path.join(root,'dist',name),bytes);
 return {zones:2,templates:6};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Atlas foundations built:',buildAtlasFoundations());
