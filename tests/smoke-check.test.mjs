import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const smokeCheckPath = fileURLToPath(new URL('../scripts/smoke-check.mjs', import.meta.url));

function runSmokeCheck(files) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-ua-smoke-'));
  try {
    // Match the real site's explicit ES modules; Node 24 can miss invalid exports in ambiguous .js files.
    fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({type:'module'}));
    const dist = path.join(workspace, 'dist');
    fs.mkdirSync(dist, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
      const filePath = path.join(dist, file);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    }

    return spawnSync(process.execPath, [smokeCheckPath], {
      cwd: workspace,
      encoding: 'utf8',
      timeout: 20_000,
    });
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

function validPage(body, head = '') {
  return `<!doctype html><html lang="uk"><head><title>Smoke</title>${head}</head><body><main><h1>Smoke</h1>${body}</main></body></html>`;
}

const valid = runSmokeCheck({
  'index.html': validPage('<img src="./pixel.svg" alt=""><a href="#destination">Go</a><div id="destination"></div><script type="module" src="./entry.js"></script>', '<link rel="stylesheet" href="./site.css">'),
  'site.css': '.hero{background-image:url("./pixel.svg")}',
  'pixel.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
  'entry.js': 'import "./nested/child.js";',
  'nested/child.js': 'export const ready = true;',
});
assert.equal(valid.status, 0, valid.stderr);
assert.match(valid.stdout, /local HTML anchors/);
assert.match(valid.stdout, /JavaScript syntax checks/);

const brokenAnchor = runSmokeCheck({
  'index.html': validPage('<a href="#missing">Missing</a><script type="module" src="./entry.js"></script>'),
  'entry.js': 'export const ready = true;',
});
assert.notEqual(brokenAnchor.status, 0);
assert.match(brokenAnchor.stderr, /Missing local HTML anchors/);

const unsafeUrl = runSmokeCheck({
  'index.html': validPage('<a href="javascript:alert(1)">Unsafe</a><script type="module" src="./entry.js"></script>'),
  'entry.js': 'export const ready = true;',
});
assert.notEqual(unsafeUrl.status, 0);
assert.match(unsafeUrl.stderr, /Executable URL scheme/);

const missingNestedImport = runSmokeCheck({
  'index.html': validPage('<script type="module" src="./entry.js"></script>'),
  'entry.js': 'import "./nested/child.js";',
  'nested/child.js': 'import "./missing.js";',
});
assert.notEqual(missingNestedImport.status, 0);
assert.match(missingNestedImport.stderr, /Missing JavaScript import/);

const unnamedLink = runSmokeCheck({
  'index.html': validPage('<a href="#destination"></a><div id="destination"></div>'),
});
assert.notEqual(unnamedLink.status, 0);
assert.match(unnamedLink.stderr, /link has no accessible name/);

// Glossary dialogs populate this source placeholder before making it a link.
const linkPlaceholder = runSmokeCheck({
  'index.html': validPage('<dialog><a id="term-dialog-source" target="_blank" rel="noopener noreferrer"></a></dialog>'),
});
assert.equal(linkPlaceholder.status, 0, linkPlaceholder.stderr);

const emptyHrefLink = runSmokeCheck({
  'index.html': validPage('<a href=""></a>'),
});
assert.notEqual(emptyHrefLink.status, 0);
assert.match(emptyHrefLink.stderr, /link has no accessible name/);

const valuelessHrefLink = runSmokeCheck({
  'index.html': validPage('<a href></a>'),
});
assert.notEqual(valuelessHrefLink.status, 0);
assert.match(valuelessHrefLink.stderr, /link has no accessible name/);

const explicitRoleLink = runSmokeCheck({
  'index.html': validPage('<a role="link" tabindex="0"></a>'),
});
assert.notEqual(explicitRoleLink.status, 0);
assert.match(explicitRoleLink.stderr, /link has no accessible name/);

const missingAriaTarget = runSmokeCheck({
  'index.html': validPage('<button aria-labelledby="missing-label">Open</button>'),
});
assert.notEqual(missingAriaTarget.status, 0);
assert.match(missingAriaTarget.stderr, /ARIA reference points to missing id/);

const duplicateId = runSmokeCheck({
  'index.html': validPage('<div id="same"></div><div id="same"></div>'),
});
assert.notEqual(duplicateId.status, 0);
assert.match(duplicateId.stderr, /Duplicate HTML id/);

const skippedHeading = runSmokeCheck({
  'index.html': validPage('<h3>Skipped level</h3>'),
});
assert.notEqual(skippedHeading.status, 0);
assert.match(skippedHeading.stderr, /heading level skips from h1 to h3/);

const missingImageAlt = runSmokeCheck({
  'index.html': validPage('<img src="./pixel.svg"><script type="module" src="./entry.js"></script>'),
  'pixel.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
  'entry.js': 'export const ready = true;',
});
assert.notEqual(missingImageAlt.status, 0);
assert.match(missingImageAlt.stderr, /img has no alt attribute/);

const unlabeledInput = runSmokeCheck({
  'index.html': validPage('<input id="query"><script type="module" src="./entry.js"></script>'),
  'entry.js': 'export const ready = true;',
});
assert.notEqual(unlabeledInput.status, 0);
assert.match(unlabeledInput.stderr, /input#query has no accessible label/);

const unsafeNewTab = runSmokeCheck({
  'index.html': validPage('<a href="https://example.com" target="_blank">External</a><script type="module" src="./entry.js"></script>'),
  'entry.js': 'export const ready = true;',
});
assert.notEqual(unsafeNewTab.status, 0);
assert.match(unsafeNewTab.stderr, /neither rel="noopener" nor rel="noreferrer"/);

const invalidJavaScript = runSmokeCheck({
  'index.html': validPage('<script type="module" src="./entry.js"></script>'),
  'entry.js': 'export const = ;',
});
assert.notEqual(invalidJavaScript.status, 0);
assert.match(invalidJavaScript.stderr, /JavaScript syntax checks failed/);

console.log('Smoke-check regression tests passed: valid graph; missing anchor/import/ARIA/accessible names; unsafe URL/new tab; duplicate IDs; skipped heading; missing alt/form label; invalid JS syntax.');
