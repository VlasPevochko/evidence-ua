import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dietCards} from '../src/nutrition-diets/catalog.mjs';
import {evidence} from '../src/nutrition-diets/evidence.mjs';
import {dietCatalogHTML} from '../src/nutrition-diets/render.mjs';
import {STORY_SIZE,STORY_NOTE,layoutStory,shareStory,storyFileName,storyText,storyUrl,wrapLines} from '../dist/nutrition-diets-share.js';

const pageUrl='https://vlaspevochko.github.io/evidence-ua/nutrition.html?ref=story#old';
const cardsHTML=dietCatalogHTML();
const measureFor=spec=>{
 const size=Number(/(\d+)px/.exec(spec)[1]);
 return text=>text.length*size*.5;
};

assert.deepEqual(STORY_SIZE,{width:1080,height:1920,pad:92});
assert.equal((cardsHTML.match(/data-diet-story/g)||[]).length,dietCards.length,'each diet has its own story creative');
assert(cardsHTML.includes('data-story-share')&&cardsHTML.includes('data-story-download'),'share and download actions are present');
assert(cardsHTML.includes('не може опублікувати сторіс напряму'),'the UI does not promise direct Instagram publishing');

for(const diet of dietCards){
 const result=evidence[diet.id].findings[0];
 const story={id:diet.id,title:diet.title,finding:result[0],sourceLabel:result[1].label,sourceUrl:result[1].href};
 const block=cardsHTML.slice(cardsHTML.indexOf(`data-story-id="${diet.id}"`));
 assert(block.startsWith(`data-story-id="${diet.id}"`),`${diet.id}: rendered`);
 assert(block.includes(`data-story-title="${diet.title}"`),`${diet.id}: title is carried into the story`);
 assert(block.includes(`data-story-finding="${result[0]}`),`${diet.id}: exact first reviewed finding is carried into the story`);
 assert(block.includes(`data-story-source="${result[1].label}"`),`${diet.id}: source label is carried into the story`);
 const layout=layoutStory(story,measureFor);
 assert(layout.fits,`${diet.id}: the complete story fits (${layout.bottom}/${STORY_SIZE.height})`);
 assert(layout.items.some(item=>item.kind==='finding'&&item.lines.join(' ').includes(story.finding.slice(0,40))),`${diet.id}: the full finding is visible`);
 assert.equal(storyFileName(story),`evidence-ua-diet-${diet.id}-story.png`);
 const target=storyUrl(diet.id,pageUrl);
 assert.equal(target,`https://vlaspevochko.github.io/evidence-ua/nutrition.html?ref=story#diet-${diet.id}`);
 const text=storyText(story,target);
 for(const part of [story.finding,story.sourceLabel,story.sourceUrl,STORY_NOTE,target])assert(text.includes(part),`${diet.id}: share text includes ${part}`);
}

assert.deepEqual(wrapLines('один два три чотири',80,text=>text.length*10),['один два','три','чотири']);

{
 let payload;
 const outcome=await shareStory({title:'DASH'},new Blob(['png'],{type:'image/png'}),pageUrl,{
  canShare:({files})=>files.length===1&&files[0].type==='image/png',
  share:async value=>{payload=value;}
 });
 assert.equal(outcome,'shared');
 assert.equal(payload.files[0].type,'image/png');
 assert(payload.text.includes(pageUrl.split('#')[0]));
}
assert.equal(await shareStory({},new Blob(),pageUrl,{}),'unsupported','unsupported browsers use the explicit PNG download fallback');
assert.equal(await shareStory({},new Blob(),pageUrl,{canShare:()=>false,share:async()=>{throw Error('must not run');}}),'unsupported');
assert.equal(await shareStory({},new Blob(),pageUrl,{canShare:()=>true,share:async()=>{const error=Error();error.name='AbortError';throw error;}}),'cancelled');
assert.equal(await shareStory({},new Blob(),pageUrl,{canShare:()=>true,share:async()=>{throw Error('share failed');}}),'failed');

const css=fs.readFileSync('dist/nutrition-diets.css','utf8');
assert(css.includes('.nd-story-preview')&&css.includes('aspect-ratio:9/16'),'the preview uses the Instagram Stories format');
assert(css.includes('@media(max-width:760px){.nd-story>summary'),'story controls adapt to mobile');
const page=fs.readFileSync('dist/nutrition.html','utf8');
assert(page.includes('nutrition-diets.css?v=94'),'story styling is cache-busted');
assert(page.includes('nutrition-diets-share.js?v=2'),'the story interaction module is loaded');

console.log(`Diet stories: ${dietCards.length} sourced story cards, complete layouts, safe share fallback and mobile styling passed.`);
