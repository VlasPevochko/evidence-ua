import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {dietCatalogHTML} from '../src/nutrition-diets/render.mjs';

export function buildNutritionDiets(root){
 const file=path.join(root,'dist/nutrition.html'),before=fs.readFileSync(file,'utf8');
 const start='<!-- EUA_NUTRITION_DIETS_START -->',end='<!-- EUA_NUTRITION_DIETS_END -->';
 const first=before.indexOf(start),last=before.indexOf(end);
 if(first<0||last<first||before.indexOf(start,first+start.length)>=0||before.indexOf(end,last+end.length)>=0)throw Error('Expected one ordered nutrition diet marker pair');
 const after=before.slice(0,first+start.length)+dietCatalogHTML()+before.slice(last);
 if(after!==before)fs.writeFileSync(file,after);
 return file;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildNutritionDiets(process.cwd());
