import fs from 'node:fs';
import {buildNutritionDiets} from './build-nutrition-diets.mjs';
import {buildNutritionFatBurning} from './build-nutrition-fat-burning.mjs';
import {nutritionBase,nutritionModule} from '../src/evidence/nutrition/module.mjs';
if(!nutritionModule.publicationApproved||!nutritionModule.publicationAcceptance||nutritionBase.claims.some(c=>!c.publicationApproved||c.evidenceConfidence!==null))throw Error('Nutrition wording not accepted or unsupported confidence added');
fs.writeFileSync('dist/nutrition-data.js',fs.readFileSync('src/evidence/nutrition/module.mjs','utf8').replace("'../core/registry.mjs'","'./evidence/registry.js?v=55'").replace("'../core/entities.mjs'","'./evidence/entities.js?v=55'"));
fs.copyFileSync('src/evidence/nutrition/player.mjs','dist/nutrition-player.js');
console.log('Nutrition module:',{claims:nutritionBase.claims.length,records:nutritionBase.records.length,routes:nutritionModule.routes.length,confidence:'not assessed'});

buildNutritionDiets(process.cwd());
buildNutritionFatBurning(process.cwd());

import './build-digestion.mjs';

// Routing/disclosure only; the authored lab controller remains unchanged.
fs.copyFileSync('src/nutrition/navigation.mjs','dist/nutrition-navigation.js');
