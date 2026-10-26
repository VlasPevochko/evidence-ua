import fs from 'node:fs';
import {cellKnowledge,organelles,definitions} from '../src/cell-lab/module.mjs';
if(cellKnowledge.claims.length!==11||cellKnowledge.claims.some((c,i)=>c.statement!==definitions[i][2]||c.evidenceSummary!==definitions[i][3]||c.evidenceConfidence!==null||c.lastReviewed!==null))throw Error('Cell migration changed existing wording or added unsupported confidence');
fs.writeFileSync('dist/cell-lab-data.js',fs.readFileSync('src/cell-lab/module.mjs','utf8').replace("'../evidence/core/entities.mjs'","'./evidence/entities.js?v=56'").replace("'../evidence/core/registry.mjs'","'./evidence/registry.js?v=56'"));
fs.writeFileSync('dist/cell-lab.js',fs.readFileSync('src/cell-lab/controller.mjs','utf8').replace("'./module.mjs'","'./cell-lab-data.js?v=56'").replace("'./illustration.mjs'","'./cell-illustration.js?v=73'").replace("'./sources.mjs'","'./cell-sources.js?v=72'").replace("'./detail-view.mjs'","'./cell-detail-view.js?v=73'").replace("'../evidence/core/components.mjs'","'./evidence/components.js?v=2.1'"));
fs.writeFileSync('dist/cell-illustration.js',fs.readFileSync('src/cell-lab/illustration.mjs','utf8').replace("'./module.mjs'","'./cell-lab-data.js?v=56'"));
fs.writeFileSync('dist/cell-sources.js',fs.readFileSync('src/cell-lab/sources.mjs','utf8').replace("'./module.mjs'","'./cell-lab-data.js?v=56'"));
fs.writeFileSync('dist/cell-detail-view.js',fs.readFileSync('src/cell-lab/detail-view.mjs','utf8').replace("'./module.mjs'","'./cell-lab-data.js?v=56'"));
console.log('Cell Lab:',{structures:organelles.length,claims:cellKnowledge.claims.length,descriptiveRecords:cellKnowledge.records.length,confidence:'not assessed'});
