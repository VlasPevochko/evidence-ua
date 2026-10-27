import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildSite} from '../scripts/build-site.mjs';
import {runSiteTests} from '../scripts/test-site.mjs';

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-build-contract-'));
try {
  fs.mkdirSync(path.join(temp, 'scripts'), {recursive:true});
  fs.mkdirSync(path.join(temp, 'dist/.well-known'), {recursive:true});
  fs.writeFileSync(path.join(temp, 'dist/index.html'), '<html>Authored home</html>');
  fs.writeFileSync(path.join(temp, 'dist/authored.css'), 'body{color:red}');
  fs.writeFileSync(path.join(temp, 'dist/.well-known/example'), 'retained hidden asset');
  fs.writeFileSync(path.join(temp, 'scripts/build-evidence.mjs'), `import fs from 'node:fs';fs.writeFileSync('dist/index.html','<html>Authored home + generated section</html>');`);
  fs.writeFileSync(path.join(temp, 'scripts/build-knowledge.mjs'), '');
  // build-site now also runs build-seo (sitemap and robots.txt); the contract fixture only needs a no-op stand-in for it.
  fs.writeFileSync(path.join(temp, 'scripts/build-seo.mjs'), '');
  // Follow-up comparison metadata is generated too; retain the full authored snapshot alongside it.
  fs.writeFileSync(path.join(temp, 'scripts/build-comparison-status.mjs'), `import fs from 'node:fs';fs.writeFileSync('dist/compare-status.js','export const comparisonStatus={};');`);
  const result = buildSite(temp, 'a'.repeat(40));
  assert.equal(result.files['authored.css'].sha256.length, 64);
  assert(result.files['.well-known/example'], 'Complete dist includes hidden assets');
  assert.equal(result.commit, 'a'.repeat(40));
  assert.equal(result.fileCount, 4);
  assert(result.files['compare-status.js'], 'Canonical comparison metadata is included in the verified artifact');
  assert.equal(fs.readFileSync(path.join(temp, 'dist/authored.css'),'utf8'),'body{color:red}');
  fs.writeFileSync(path.join(temp, 'scripts/build-knowledge.mjs'), `import fs from 'node:fs';fs.unlinkSync('dist/authored.css');`);
  assert.throws(() => buildSite(temp, 'a'.repeat(40)), /removed.*authored\.css/i);
  fs.writeFileSync(path.join(temp, 'dist/authored.css'), 'body{color:red}');
  fs.writeFileSync(path.join(temp, 'scripts/build-knowledge.mjs'), `import fs from 'node:fs';fs.writeFileSync('dist/authored.css','corrupted');`);
  assert.throws(() => buildSite(temp, 'a'.repeat(40)), /authored.*authored\.css/i);
  fs.writeFileSync(path.join(temp, 'dist/authored.css'), 'body{color:red}');
  fs.mkdirSync(path.join(temp,'tests'));
  fs.writeFileSync(path.join(temp,'tests/a-mutates.test.mjs'), `import fs from 'node:fs';fs.writeFileSync('dist/authored.css','test mutation');`);
  fs.writeFileSync(path.join(temp,'tests/b-pristine.test.mjs'), `import fs from 'node:fs';import assert from 'node:assert/strict';assert.equal(fs.readFileSync('dist/authored.css','utf8'),'body{color:red}');`);
  assert.deepEqual(runSiteTests(temp,{quiet:true}), {total:2,failed:0});
  assert.equal(fs.readFileSync(path.join(temp,'dist/authored.css'),'utf8'),'body{color:red}');
} finally {
  fs.rmSync(temp, {recursive:true,force:true});
}
console.log('Site build retains authored and hidden files, records provenance, rejects removal and corruption.');
