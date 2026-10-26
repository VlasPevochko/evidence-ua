import fs from 'node:fs';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {pathToFileURL} from 'node:url';
import {publicText} from '../src/evidence/core/public-text.mjs';
const root=process.cwd(), out=path.join(root,'dist/evidence');
fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(path.join(root,'src/evidence/core/registry.mjs'),path.join(out,'registry.js'));
fs.copyFileSync(path.join(root,'src/evidence/core/entities.mjs'),path.join(out,'entities.js'));
fs.writeFileSync(path.join(out,'components.js'),fs.readFileSync(path.join(root,'src/evidence/core/components.mjs'),'utf8').replace("'./public-text.mjs'","'./public-text.js'"));
fs.copyFileSync(path.join(root,'src/evidence/core/public-text.mjs'),path.join(out,'public-text.js'));
fs.writeFileSync(path.join(out,'module-composer.js'),fs.readFileSync(path.join(root,'src/evidence/core/module-composer.mjs'),'utf8').replace("'./components.js'","'./components.js?v=2.1'"));
fs.copyFileSync(path.join(root,'src/evidence/assets/muscle-fiber-v1.webp'),path.join(out,'muscle-fiber-v1.webp'));
const seed=path.join(root,'src/evidence/creatine');
let data=['// Generated topic registration; scientific content remains in the seed.',"import {createEvidenceBase} from './registry.js?v=1.5';"];
for(const file of ['claims.ts','sources.ts','evidenceRecords.ts','creatineModule.ts'])data.push(stripTypeScriptTypes(fs.readFileSync(path.join(seed,file),'utf8')));
data.push(fs.readFileSync(path.join(seed,'presentation.mjs'),'utf8'));
data.push('creatineSources.push(guidanceSource, physiologyModelSource);');
data.push(fs.readFileSync(path.join(seed,'reviews.mjs'),'utf8'));
data.push('const reviewSeed=seedReviewRecords(creatineClaims,creatineEvidenceRecords); export const evidenceBase=createEvidenceBase({claims:creatineClaims,sources:creatineSources,records:creatineEvidenceRecords,...reviewSeed,presentation:{labels:presentation.labels,confidenceNote:presentation.notes.confidence}});');
const indexPath=path.join(root,'dist/index.html');
let html=fs.readFileSync(indexPath,'utf8');
function balancedElement(input,start,tag){const re=new RegExp('<\\/?'+tag+'\\b[^>]*>','g');re.lastIndex=start;let depth=0,m;while((m=re.exec(input))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return {start,end:re.lastIndex,html:input.slice(start,re.lastIndex)};}throw Error('Unclosed '+tag);}
const sectionStart=html.search(/<section\b[^>]*\bid="creatine"/);
if(sectionStart<0)throw Error('Missing #creatine route');
const section=balancedElement(html,sectionStart,'section');
const snapshot=path.join(root,'src/evidence/creatine/legacy-page.html');
if(!fs.existsSync(snapshot))fs.writeFileSync(snapshot,section.html);
const legacy=fs.readFileSync(snapshot,'utf8');
const linkRE=/<a\b[^>]*href="(https:\/\/(?:pubmed\.ncbi\.nlm\.nih\.gov|ods\.od\.nih\.gov)[^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
const links=new Map();let m;while((m=linkRE.exec(legacy))){links.set(m[1],{url:m[1],title:m[2].replace(/<[^>]*>/g,'').trim(),reviewStatus:'Потребує outcome-level перевірки'});}
data.push('export const legacySources = '+JSON.stringify([...links.values()],null,2)+';');
fs.writeFileSync(path.join(out,'data.js'),data.join('\n'));
fs.writeFileSync(path.join(out,'ui.js'),fs.readFileSync(path.join(root,'src/evidence/evidence-ui.mjs'),'utf8').replace("from './data.js'", "from './data.js?v=1.8'").replace("from './components.js'", "from './components.js?v=2.1'").replace("from './module-composer.js'", "from './module-composer.js?v=1.9'"));
fs.copyFileSync(path.join(root,'src/evidence/evidence.css'),path.join(out,'evidence.css'));
const {renderModule}=await import(pathToFileURL(path.join(out,'ui.js'))+'?build='+Date.now());
const pubStart=legacy.lastIndexOf('<div',legacy.indexOf('id="pubmed-live"'));
const pub=balancedElement(legacy,pubStart,'div').html;
html=html.slice(0,section.start)+renderModule({pubmed:pub})+html.slice(section.end);
// This audited controller belonged only to the replaced two-card creatine UI.
html=html.replace(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g,(tag,body)=>body.includes("const studies={strength:")&&body.includes("getElementById('study-source')")?'':tag);
// Place CSS last in head to isolate current module overrides; load JS after legacy route initialization.
html=html.replace(/<link[^>]*data-evidence-style[^>]*>/g,'').replace(/<script[^>]*data-evidence-script[^>]*><\/script>/g,'');
html=html.replace('</head>','<link rel="stylesheet" href="./evidence/evidence.css?v=1.9" data-evidence-style></head>');
html=html.replace('</body>','<script type="module" src="./evidence/ui.js?v=2.2" data-evidence-script></script></body>');
// Only visible text: do not localize code, URLs, attributes, scientific values or article titles.
html=html.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/gi).map((part,i)=>i%2?part:part.replace(/>([^<>]+)</g,(all,text)=>'>'+publicText(text)+'<')).join('');
html=html.replace('<a href="#categories">Практика</a>','').replace('07 СВІТІВ ЗНАНЬ','НАПРЯМИ ЗНАНЬ').replace('Ця демонстрація не містить медичних рекомендацій.','Матеріал освітній і не є персональною медичною рекомендацією.');
fs.writeFileSync(indexPath,html);
await import('./build-dossiers.mjs?build='+Date.now());
console.log('Evidence module generated:',{claims:8,records:creatineRecordsCount(),legacySources:links.size});
function creatineRecordsCount(){return (data.join('\n').match(/id: "EVR-/g)||[]).length;}
