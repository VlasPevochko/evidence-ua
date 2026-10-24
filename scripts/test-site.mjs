import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export function runSiteTests(root, {quiet = false} = {}) {
  const files = fs.readdirSync(path.join(root,'tests')).filter(file => file.endsWith('.test.mjs')).sort();
  if (!files.length) throw Error('No website tests found');
  let failed = 0;
  for (const file of files) {
    const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-site-test-'));
    try {
      for (const directory of ['src','dist','scripts','tests','docs']) {
        if (fs.existsSync(path.join(root,directory))) {
          fs.cpSync(path.join(root,directory), path.join(isolated,directory), {recursive:true});
        }
      }
      // site.json holds the site address that the build and several tests read.
      if (fs.existsSync(path.join(root,'site.json'))) fs.copyFileSync(path.join(root,'site.json'), path.join(isolated,'site.json'));
      // nutrition-proposal checks the tracked source list. No historical commits
      // or credentials are needed: old baselines are independent fixtures.
      execFileSync('git', ['init','--quiet'], {cwd:isolated,stdio:'pipe'});
      execFileSync('git', ['-c','core.autocrlf=false','add','.'], {cwd:isolated,stdio:'pipe'});
      const test = spawnSync(process.execPath, [path.join('tests',file)], {
        cwd:isolated, encoding:'utf8', env:{...process.env,PYTHONUTF8:'1'},
        timeout:120000, maxBuffer:4*1024*1024
      });
      if (test.status !== 0) {
        failed++;
        console.error(`FAIL ${file}\n${test.stdout || ''}${test.stderr || ''}${test.error?.message || ''}`);
      } else if (!quiet) console.log(`PASS ${file}`);
    } finally {
      fs.rmSync(isolated, {recursive:true,force:true});
    }
  }
  if (!quiet || failed) console.log(`Website tests: ${files.length-failed}/${files.length} passed.`);
  return {total:files.length,failed};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runSiteTests(process.cwd());
  if (result.failed) process.exitCode = 1;
}
