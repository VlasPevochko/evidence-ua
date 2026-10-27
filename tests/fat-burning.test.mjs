// Follow-up audit fixes refresh shared imports; these wiring expectations follow the cache cascade.
// 2026-10-22: search finds supplements by topic (new keywords in platform-materials) → cascade: materials v84, search v2, header v4, tools v85, shell v97.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {fatStages,energyCases} from "../dist/fat-burning.js";
import {findMaterials} from "../src/platform/materials.mjs";

test("fat-burning page is a discoverable Ukrainian educational route",()=>{
  const html=fs.readFileSync("dist/fat-burning.html","utf8");
  const css=fs.readFileSync("dist/fat-burning.css","utf8");
  assert.match(html,/<html lang="uk">/);
  assert.match(html,/<title>[^<]+<\/title>/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const id of ["main","process","balance","practice","myths","sources"]){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/https:\/\/vlaspevochko\.github\.io\/evidence-ua\/fat-burning\.html/);
  // v=2: pine recolour, serif headings and folded sources (owner decision 2026-10-20: page aligned with the site standard).
  // v=3: fat-burning.js now imports the header module with the search button (site-header.js?v=3), so its cache version moved.
  // v=5: shared header v7 removes the duplicate primary catalog entry.
  assert.match(html,/src="\.\/fat-burning\.js\?v=8"/);
  assert.match(html,/href="\.\/fat-burning\.css\?v=2"/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert(!/<iframe\b/i.test(html),"no unlicensed third-party media");
  const results=findMaterials("жироспалення");
  assert(results.some(item=>item.href==="./fat-burning.html"),"page must be searchable in the canonical catalog");
});

test("stages separate lipolysis, oxidation and mass balance",()=>{
  assert.equal(fatStages.length,4);
  const combined=fatStages.map(stage=>stage.title+" "+stage.body+" "+stage.limit).join(" ");
  for(const term of ["тригліцерид","ліполіз","окиснення","вуглекисл"])assert(combined.toLowerCase().includes(term));
  assert.match(fatStages[1].limit,/не тотожний втраті жиру/);
  assert.match(fatStages[3].limit,/не спосіб/);
  const html=fs.readFileSync("dist/fat-burning.html","utf8");
  assert.equal((html.match(/data-fb-step="[0-3]"/g)||[]).length,4);
  assert.equal((html.match(/data-visual="[0-3]"/g)||[]).length,4);
  for(const key of ["deficit","equal","surplus"])assert(energyCases[key]?.title);
  assert.equal((html.match(/data-fb-balance="(?:deficit|equal|surplus)"/g)||[]).length,3);
});

test("source notes are explicit about study type and preliminary review",()=>{
  const html=fs.readFileSync("dist/fat-burning.html","utf8");
  for(const fragment of ["bmj.g7257","body-weight-planner","bmjsem-2024-002363","nccih.nih.gov"]){
    assert(html.includes(fragment),"missing primary or institutional source "+fragment);
  }
  assert(html.includes("Формальний Claim/EVR-перегляд матеріалу ще не завершено"));
  // Percent literals in SVG geometry (e.g. gradient 100%) are not efficacy claims.
  assert(!/95% ефективності|100% ефективності|гарантован.{0,40}(схуднен|результат)/i.test(html),"no invented efficacy promises");
});
