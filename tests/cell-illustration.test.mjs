import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {organelles} from '../src/cell-lab/module.mjs';
const api=await import('../src/cell-lab/illustration.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});

test('the atlas maps every existing structure to one accessible, separately highlighted region',()=>{
 assert.equal(typeof api.renderCellAtlas,'function','The new atlas renderer is missing');
 for(const selected of organelles){
  const html=api.renderCellAtlas(selected.id);
  assert.equal((html.match(/data-organelle=/g)||[]).length,11);
  assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
  for(const o of organelles){assert(html.includes(`data-organelle="${o.id}" role="button" tabindex="0" aria-pressed="${o.id===selected.id}"`));assert(html.includes(`Обрати: ${o.label}`));}
  assert(html.includes(`id="cell-preview-name">${selected.label}`));
  assert(html.includes('organelle-fragment'));assert(html.includes('organelle-contour'));
 }
});

test('raster and contour geometry share the uncropped image coordinate system',()=>{
 assert.equal(typeof api.renderCellAtlas,'function');
 const image=fs.readFileSync('dist/cell-atlas-v2.png');
 assert.deepEqual(api.atlasSize,{width:image.readUInt32BE(16),height:image.readUInt32BE(20)});
 const html=api.renderCellAtlas('ORG-NUCLEUS');
 assert(html.includes(`viewBox="0 0 ${api.atlasSize.width} ${api.atlasSize.height}"`));
 assert(html.includes('preserveAspectRatio="xMidYMid meet"'));
 assert(html.indexOf('data-organelle="ORG-NUCLEUS"')<html.indexOf('data-organelle="ORG-NUCLEOLUS"'),'Nucleolus wins hit targeting inside the nucleus');
 const membrane=html.slice(html.indexOf('data-organelle="STRUCT-PLASMA-MEMBRANE"'),html.indexOf('data-organelle="STRUCT-CYTOSKELETON"'));
 assert(membrane.includes('boundary-hit'));assert(membrane.includes('pointer-events="stroke"'));
 assert(membrane.includes('mask="url(#cell-mask-STRUCT-PLASMA-MEMBRANE)"'),'The thin boundary needs a stroked mask, rather than an empty clipping fill');
 assert.throws(()=>api.renderCellAtlas('UNKNOWN'),/Unknown organelle/);
});
