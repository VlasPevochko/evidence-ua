import {createRequire} from 'node:module';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
function metadata(name) {
  let folder=dirname(require.resolve(name));
  while (true) {
    const path=join(folder,'package.json');
    if (existsSync(path)) { const pkg=JSON.parse(readFileSync(path,'utf8')); if (pkg.name===name) return pkg; }
    const parent=dirname(folder); if(parent===folder) throw new Error('Package metadata not found'); folder=parent;
  }
}
const require = createRequire(import.meta.url);
const packages = ['remotion','@remotion/cli','@remotion/lottie','@remotion/three','@remotion/transitions','@remotion/captions','@remotion/motion-blur','@remotion/animated-emoji'];
let failed = false;
const version = metadata('remotion').version;
for (const name of [...packages, 'three', '@react-three/fiber']) {
  try {
    const pkg = metadata(name);
    if (packages.includes(name) && pkg.version !== version) throw new Error(`Expected Remotion ${version}, got ${pkg.version}`);
    console.log(`OK ${name} ${pkg.version}`);
  } catch (error) { failed=true; console.error(`FAIL ${name}: ${error.message}`); }
}
if (failed) process.exitCode=1;
else console.log('Dependency readiness only. Browser/GPU render, assets, scientific review and studio job execution require separate checks.');
