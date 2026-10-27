import fs from 'node:fs';
import {digestionBase,digestionModule} from '../src/evidence/nutrition/digestion/module.mjs';
import {foodPathSteps} from '../src/evidence/nutrition/digestion/steps.mjs';

// «Шлях їжі» is published as approved educational wording only: no confidence level.
const shown=new Set(foodPathSteps.map(s=>s.claimId).filter(Boolean));
if(!digestionModule.publicationApproved||!digestionModule.publicationAcceptance)throw Error('Food path wording not accepted');
for(const c of digestionBase.claims){if(!c.publicationApproved||c.evidenceConfidence!==null)throw Error('Food path: unsupported confidence or unapproved wording: '+c.id);}
for(const id of shown)if(!digestionBase.claims.some(c=>c.id===id))throw Error('Food path step references unknown Claim: '+id);
for(const r of digestionBase.records)if(r.reviewStatus!=='pending'&&r.reviewStatus!=='scientifically_reviewed')throw Error('Unexpected record status: '+r.id);

const swap=(text,pairs)=>pairs.reduce((t,[from,to])=>{if(!t.includes(from))throw Error('Missing import to rewrite: '+from);return t.replaceAll(from,to);},text);
fs.writeFileSync('dist/digestion-data.js',swap(fs.readFileSync('src/evidence/nutrition/digestion/module.mjs','utf8'),[
 ["'../../core/registry.mjs'","'./evidence/registry.js?v=55'"],["'../module.mjs'","'./nutrition-data.js?v=55'"]]));
fs.copyFileSync('src/evidence/nutrition/digestion/steps.mjs','dist/digestion-steps.js');
fs.writeFileSync('dist/digestion-viewer.js',swap(fs.readFileSync('src/evidence/nutrition/digestion/viewer.mjs','utf8'),[
 ["from 'three/addons/controls/OrbitControls.js'","from './vendor/three/addons/controls/OrbitControls.js'"],
 ["from 'three/addons/loaders/GLTFLoader.js'","from './vendor/three/addons/loaders/GLTFLoader.js'"],
 ["from 'three'","from './vendor/three/three.module.js'"],
 ["'../../core/components.mjs'","'./evidence/components.js?v=2.2'"],["'./module.mjs'","'./digestion-data.js?v=1'"],["'./steps.mjs'","'./digestion-steps.js?v=2'"]]));
console.log('Food path module:',{claims:digestionBase.claims.length,records:digestionBase.records.length,sources:digestionBase.sources.length,steps:foodPathSteps.length,confidence:'not assessed'});
