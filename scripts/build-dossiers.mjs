import fs from 'node:fs';
import {DossierPanel,validateDossiers} from '../src/evidence/core/dossier.mjs';
import {proteinModule} from '../src/evidence/supplements/protein/module.mjs';
import {buildProtein} from './build-protein.mjs';
import {buildBerberine} from './build-berberine.mjs';
import {buildSupplementCards} from './build-supplement-cards.mjs';
import {omegaModule} from '../src/evidence/supplements/omega/module.mjs';
import {vitdModule} from '../src/evidence/supplements/vitd/module.mjs';
// Dossiers whose route now shows an approved evidence module are not rendered as preliminary panels.
export const replacedDossiers=new Set([proteinModule.replacesDossier,omegaModule.replacesDossier,vitdModule.replacesDossier]);
const file='dist/index.html';
const dossiers=validateDossiers(JSON.parse(fs.readFileSync('src/evidence/supplements/dossiers.json','utf8')));
let html=fs.readFileSync(file,'utf8').replace(/<!-- DOSSIER:[^>]+ -->[\s\S]*?<!-- \/DOSSIER -->/g,'').replace(/<style data-dossier-style>[\s\S]*?<\/style>/g,'');
for(const d of dossiers){
 if(replacedDossiers.has(d.id))continue;
 const re=new RegExp('(<section\\b[^>]*id="'+d.route+'"[^>]*>[\\s\\S]*?<\\/h1>)');
 if(!re.test(html))throw Error('Missing dossier route: '+d.route);
 html=html.replace(re,(_,header)=>header+'<!-- DOSSIER:'+d.id+' -->'+DossierPanel(d)+'<!-- /DOSSIER -->');
}
const css=`.dossier-panel{margin:28px 0;padding:clamp(18px,3vw,32px);border:1px solid #48636a;border-radius:16px;background:#111c21;line-height:1.65;min-width:0;overflow-wrap:anywhere}.dossier-panel h2{font-size:clamp(23px,3vw,34px);line-height:1.25;margin:16px 0}.dossier-status{color:#b9f5ff;border-left:3px solid #65ddf2;padding-left:14px}.dossier-panel nav{display:flex;flex-wrap:wrap;gap:10px}.dossier-panel a,.dossier-panel summary{color:#b9f5ff}.dossier-panel nav a{padding:12px;border:1px solid #48636a;border-radius:8px;min-height:44px;box-sizing:border-box}.dossier-panel article{margin:24px 0}.dossier-panel summary{cursor:pointer;padding:12px 0;min-height:44px;box-sizing:border-box}.dossier-panel a:focus-visible,.dossier-panel summary:focus-visible{outline:3px solid #65ddf2;outline-offset:4px}.dossier-reason{border:1px solid #48636a;padding:0 16px;border-radius:16px}.dossier-source-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.dossier-source{background:#0d1418;padding:18px;border-radius:16px}.dossier-panel footer{border-top:1px solid #48636a;padding-top:16px;color:#c7d0d3}@media(max-width:700px){.dossier-source-grid{grid-template-columns:minmax(0,1fr)}}`;
html=html.replace('</head>','<style data-dossier-style>'+css+'</style></head>');
fs.writeFileSync(file,html);
buildProtein();
buildBerberine();
buildSupplementCards();
console.log('Structured preliminary dossiers: '+dossiers.length+'; creatine retained unchanged.');
