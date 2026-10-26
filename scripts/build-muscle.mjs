import fs from 'node:fs';
import {muscleKnowledge,structures,topics} from '../src/muscle-lab/module.mjs';
if(muscleKnowledge.claims.length!==9||muscleKnowledge.claims.some(c=>c.evidenceConfidence!==null||c.lastReviewed!==null)||muscleKnowledge.records.some(r=>r.roleForClaim!=='context_only'))throw Error('Muscle migration must not invent assessment or verified outcome evidence');
fs.writeFileSync('dist/muscle-lab-data.js',fs.readFileSync('src/muscle-lab/module.mjs','utf8').replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=58'").replace("'../evidence/core/registry.mjs'","'./evidence/registry.js?v=58'"));
fs.writeFileSync('dist/muscle-lab.js',fs.readFileSync('src/muscle-lab/controller.mjs','utf8').replace("'./module.mjs'","'./muscle-lab-data.js?v=61'").replace("'./scenes.mjs'","'./muscle-lab-scenes.js?v=59'").replace("'./learning-copy.mjs'","'./muscle-learning-copy.js?v=68'").replace("'./scale-art.mjs'","'./muscle-scale-art.js?v=1'").replace("'./sarcomere.mjs'","'./muscle-sarcomere.js?v=1'").replace("'../evidence/core/components.mjs'","'./evidence/components.js?v=61'"));
fs.writeFileSync('dist/muscle-scale-art.js',fs.readFileSync('src/muscle-lab/scale-art.mjs','utf8').replace("'./sarcomere.mjs'","'./muscle-sarcomere.js?v=1'"));
fs.copyFileSync('src/muscle-lab/sarcomere.mjs','dist/muscle-sarcomere.js');
fs.copyFileSync('src/muscle-lab/scenes.mjs','dist/muscle-lab-scenes.js');
fs.copyFileSync('src/muscle-lab/learning-copy.mjs','dist/muscle-learning-copy.js');
console.log('Muscle Lab:',{scales:structures.length,topics:topics.length,claims:muscleKnowledge.claims.length,contextRecords:muscleKnowledge.records.length,confidence:'not assessed'});
// 2026-10-26 «Від нерва до росту» (owner's PDF): rendered from src/muscle-lab/guide.mjs into marked blocks of the authored page.
{
 const {guideParts}=await import('../src/muscle-lab/guide.mjs');
 const page='dist/muscle-lab.html';let html=fs.readFileSync(page,'utf8');
 for(const [key,content] of Object.entries(guideParts())){
  const re=new RegExp(`<!-- MUSCLE-GUIDE:${key}:START -->[\\s\\S]*?<!-- MUSCLE-GUIDE:${key}:END -->`);
  if(!re.test(html))throw Error('Missing MUSCLE-GUIDE marker '+key);
  html=html.replace(re,()=>`<!-- MUSCLE-GUIDE:${key}:START -->${content}<!-- MUSCLE-GUIDE:${key}:END -->`);
 }
 fs.writeFileSync(page,html);
 // 2026-10-26: outcome Claims (practice.mjs) with their own drawer; protein Claims come from the published protein data.
 fs.writeFileSync('dist/muscle-practice-data.js',fs.readFileSync('src/muscle-lab/practice.mjs','utf8').replace("'../evidence/core/registry.mjs'","'./evidence/registry.js?v=58'").replace("'../evidence/supplements/protein/module.mjs'","'./evidence/protein-data.js?v=1'"));
 fs.writeFileSync('dist/muscle-guide.js',fs.readFileSync('src/muscle-lab/guide-ui.mjs','utf8').replace("'../evidence/core/components.mjs'","'./evidence/components.js?v=61'").replace("'./practice.mjs'","'./muscle-practice-data.js?v=1'"));
}
