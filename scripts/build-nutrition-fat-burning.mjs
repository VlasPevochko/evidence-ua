import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fatBurningEntryHTML} from '../src/nutrition-fat-burning/entry.mjs';

// Regenerate only this single marked educational entry; diet and lab markup stay intact.
export function buildNutritionFatBurning(root){
 const file=path.join(root,'dist/nutrition.html');
 const before=fs.readFileSync(file,'utf8');
 const start='<!-- EUA_NUTRITION_FAT_BURNING_START -->', end='<!-- EUA_NUTRITION_FAT_BURNING_END -->';
 const first=before.indexOf(start),last=before.indexOf(end);
 if(first<0||last<first||before.indexOf(start,first+start.length)>=0||before.indexOf(end,last+end.length)>=0)
   throw Error('Expected one ordered nutrition fat-burning marker pair');
 const after=before.slice(0,first+start.length)+fatBurningEntryHTML()+before.slice(last);
 if(after!==before)fs.writeFileSync(file,after);
 return file;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildNutritionFatBurning(process.cwd());
