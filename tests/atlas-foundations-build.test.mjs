import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

assert.ok(fs.existsSync('scripts/build-atlas-foundations.mjs'),'Atlas foundations need a bounded, repeatable builder');
const {buildAtlasFoundations}=await import('../scripts/build-atlas-foundations.mjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'eua-atlas-build-'));
const start='<!-- EUA_ATLAS_FOUNDATIONS_START -->',end='<!-- EUA_ATLAS_FOUNDATIONS_END -->';
const outside='<!doctype html><html><body><main>Retained authored material &amp; existing Atlas.</main>'+start+end+'<footer>Retained footer</footer></body></html>';
try{
 for(const dir of ['src/evidence/atlas','src/atlas','dist/evidence'])fs.mkdirSync(path.join(tmp,dir),{recursive:true});
 for(const file of ['src/evidence/atlas/foundations.mjs','src/atlas/foundations.mjs','src/atlas/foundations.css'])fs.copyFileSync(file,path.join(tmp,file));
 for(const file of ['digestion-data.js','nutrition-data.js','evidence/registry.js','evidence/entities.js'])fs.copyFileSync('dist/'+file,path.join(tmp,'dist',file));
 fs.writeFileSync(path.join(tmp,'package.json'),'{"type":"module"}');
 const htmlFile=path.join(tmp,'dist/atlas.html');fs.writeFileSync(htmlFile,outside);
 buildAtlasFoundations(tmp);
 const html=fs.readFileSync(htmlFile,'utf8');
 assert.equal(html.slice(0,html.indexOf(start)),outside.slice(0,outside.indexOf(start)),'Authored bytes before the bounded fragment must stay intact');
 assert.equal(html.slice(html.indexOf(end)+end.length),outside.slice(outside.indexOf(end)+end.length),'Authored bytes after the fragment must stay intact');
 assert.equal((html.match(/<template id="atlas-foundation-/g)||[]).length,6);
 assert.ok(html.includes('<noscript>')&&html.includes('Мозок')&&html.includes('ШКТ'));
 const files=['atlas.html','atlas-foundations-data.js','atlas-foundations.js','atlas-foundations.css'];
 const first=new Map(files.map(f=>[f,fs.readFileSync(path.join(tmp,'dist',f),'utf8')]));
 buildAtlasFoundations(tmp);
 for(const file of files)assert.equal(fs.readFileSync(path.join(tmp,'dist',file),'utf8'),first.get(file),'Repeated builds must be byte-identical');
 const data=await import(pathToFileURL(path.join(tmp,'dist/atlas-foundations-data.js')));
 const render=await import(pathToFileURL(path.join(tmp,'dist/atlas-foundations.js')));
 assert.equal(data.atlasFoundationBase.claims.length,4,'The public data module must import its real existing physiology dependencies');
 assert.ok(render.renderFoundation('brain','overview').includes('нейрон')||render.renderFoundation('brain','overview').includes('Нейрон'));
 assert.ok(render.renderFoundation('gut','anatomy').includes('Тонка кишка'));
 assert.equal(fs.readFileSync(path.join(tmp,'dist/atlas-foundations.css'),'utf8'),fs.readFileSync('src/atlas/foundations.css','utf8'));
 // Fail before touching outputs when the insertion contract is invalid.
 fs.writeFileSync(htmlFile,'<html>no fragment</html>');
 assert.throws(()=>buildAtlasFoundations(tmp),/fragment|marker/i);
 assert.equal(fs.readFileSync(htmlFile,'utf8'),'<html>no fragment</html>');
 fs.writeFileSync(htmlFile,start+start+end);
 assert.throws(()=>buildAtlasFoundations(tmp),/fragment|marker/i);
}finally{
 const resolved=path.resolve(tmp);
 assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));
 assert.ok(path.basename(resolved).startsWith('eua-atlas-build-'));
 fs.rmSync(resolved,{recursive:true,force:true});
}
console.log('Atlas foundations build: bounded authored HTML preservation, public imports, idempotence and malformed-marker refusal passed.');
