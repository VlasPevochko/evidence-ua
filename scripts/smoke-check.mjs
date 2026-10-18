import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = process.cwd();
const distDirectory = path.join(root, 'dist');
const runtimeAnchors = new Map([
  ['index.html', new Set(['evidence-guide-title', 'supplement-library'])],
  ['muscle-lab.html', new Set(['contraction', 'growth', 'atrophy'])],
]);
const runtimeAccessibilityIds = new Map([
  ['cell-lab.html', new Set(['eua-drawer-title'])],
  ['index.html', new Set(['eua-drawer-title'])],
  ['muscle-lab.html', new Set(['eua-drawer-title'])],
  ['nutrition.html', new Set(['eua-drawer-title'])],
  ['nutrition-digestion.html', new Set(['eua-drawer-title'])],
]);

function localPath(reference, basePath, origin) {
  let url;
  try {
    url = new URL(reference, `http://127.0.0.1${basePath}`);
  } catch {
    throw new Error(`Invalid local reference "${reference}" in ${basePath}.`);
  }
  if (url.origin !== origin) return null;

  const decodedPath = decodeURIComponent(url.pathname);
  const targetPath = path.resolve(distDirectory, `.${decodedPath}`);
  if (targetPath !== distDirectory && !targetPath.startsWith(`${distDirectory}${path.sep}`)) {
    throw new Error(`Local reference escapes dist/: "${reference}" in ${basePath}.`);
  }
  return decodedPath.endsWith('/') ? `${decodedPath}index.html` : decodedPath || '/index.html';
}

function listHtmlPages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlPages(filePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [filePath] : [];
  });
}

function listJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(filePath);
    return entry.isFile() && /\.m?js$/i.test(entry.name) ? [filePath] : [];
  });
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2]?.trim() ?? '';
}

function accessibilityIssues(html, pagePath) {
  const issues = [];
  const labelsFor = new Set();
  const wrappedControls = new Set();
  const ids = new Set();
  const tags = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<\/?[^>]+>/gi;
  const documentTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  const language = attributeValue(documentTag, 'lang');
  if (!language) issues.push('html element has no language');
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]
    ?.replace(/<[^>]*>/g, '')
    .trim();
  if (!title) issues.push('document title is missing or empty');
  const mainCount = [...html.matchAll(/<main\b[^>]*>/gi)].length;
  if (mainCount !== 1) issues.push(`expected one main landmark, found ${mainCount}`);
  let previousHeadingLevel = 0;
  for (const heading of html.matchAll(tags)) {
    if (heading[0].startsWith('<!--') || /^<(script|style)\b/i.test(heading[0])) continue;
    const headingTag = heading[0].match(/^<h([1-6])\b/i);
    if (!headingTag) continue;
    const level = Number(headingTag[1]);
    if (previousHeadingLevel && level > previousHeadingLevel + 1) {
      issues.push(`heading level skips from h${previousHeadingLevel} to h${level}`);
    }
    previousHeadingLevel = level;
  }

  for (const match of html.matchAll(tags)) {
    if (match[0].startsWith('<!--') || /^<(script|style)\b/i.test(match[0])) continue;
    const id = attributeValue(match[0], 'id');
    if (id) ids.add(id);
  }

  for (const label of html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label\s*>/gi)) {
    const target = attributeValue(`<label ${label[1]}>`, 'for');
    if (target) labelsFor.add(target);
    const contentStart = label.index + label[0].indexOf('>') + 1;
    for (const control of label[2].matchAll(/<(?:input|select|textarea)\b[^>]*>/gi)) {
      wrappedControls.add(contentStart + control.index);
    }
  }
  for (const match of html.matchAll(tags)) {
    const tag = match[0];
    if (tag.startsWith('<!--') || /^<(script|style)\b/i.test(tag)) continue;

    for (const reference of tag.matchAll(/(?:^|\s)aria-(?:labelledby|describedby|controls|owns|errormessage)\s*=\s*(["'])(.*?)\1/gi)) {
      for (const id of reference[2].trim().split(/\s+/).filter(Boolean)) {
        if (!ids.has(id) && !runtimeAccessibilityIds.get(path.basename(pagePath))?.has(id)) {
          issues.push(`ARIA reference points to missing id "${id}"`);
        }
      }
    }

    if (/^<input\b/i.test(tag) && !/^<input\b[^>]*\btype\s*=\s*(["'])hidden\1/i.test(tag)) {
      const id = attributeValue(tag, 'id');
      const named = attributeValue(tag, 'aria-label') || attributeValue(tag, 'aria-labelledby');
      if (!named && !(id && labelsFor.has(id)) && !wrappedControls.has(match.index)) {
        issues.push(`input${id ? `#${id}` : ''} has no accessible label`);
      }
      continue;
    }

    if (/^<(select|textarea)\b/i.test(tag)) {
      const id = attributeValue(tag, 'id');
      const named = attributeValue(tag, 'aria-label') || attributeValue(tag, 'aria-labelledby');
      if (!named && !(id && labelsFor.has(id)) && !wrappedControls.has(match.index)) {
        issues.push(`${tag.match(/^<(\w+)/)[1]}${id ? `#${id}` : ''} has no accessible label`);
      }
      continue;
    }

    if (/^<img\b/i.test(tag) && !/(?:^|\s)alt\s*=\s*(["'])/i.test(tag)) {
      issues.push('img has no alt attribute');
    }

    // An anchor without href is a placeholder, unless explicitly exposed as a link.
    const isLink = /^<a\b/i.test(tag) && (/(?:^|\s)href(?=\s|=|\/?>)/i.test(tag) || attributeValue(tag, 'role').toLowerCase() === 'link');
    if (isLink && !attributeValue(tag, 'aria-label') && !attributeValue(tag, 'aria-labelledby')) {
      const linkEnd = html.indexOf('</a', match.index + tag.length);
      const content = linkEnd < 0 ? '' : html.slice(match.index + tag.length, linkEnd);
      const visibleText = content
        .replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]*>/gi, ' ')
        .replace(/&(?:nbsp|#160);/gi, ' ')
        .trim();
      const namedImage = [...content.matchAll(/<img\b[^>]*>/gi)].some((image) => attributeValue(image[0], 'alt'));
      const namedSvg = /<svg\b[^>]*(?:aria-label|aria-labelledby)\s*=|<svg\b[\s\S]*?<title\b[^>]*>\s*\S/i.test(content);
      if (!visibleText && !namedImage && !namedSvg) issues.push('link has no accessible name');
    }

    if (/^<a\b/i.test(tag) && attributeValue(tag, 'target').toLowerCase() === '_blank') {
      const rel = attributeValue(tag, 'rel').toLowerCase().split(/\s+/);
      if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
        issues.push('link opening a new tab has neither rel="noopener" nor rel="noreferrer"');
      }
    }

    if (/^<button\b/i.test(tag) && !attributeValue(tag, 'aria-label') && !attributeValue(tag, 'aria-labelledby')) {
      const buttonEnd = html.indexOf('</button', match.index + tag.length);
      const content = buttonEnd < 0 ? '' : html.slice(match.index + tag.length, buttonEnd);
      const visibleText = content.replace(/<!--[\s\S]*?-->|<[^>]*>/g, '').replace(/&(?:nbsp|#160);/gi, ' ').trim();
      const namedImage = [...content.matchAll(/<img\b[^>]*>/gi)].some((image) => attributeValue(image[0], 'alt'));
      const namedSvg = /<svg\b[^>]*(?:aria-label|aria-labelledby)\s*=|<svg\b[\s\S]*?<title\b[^>]*>\s*\S/i.test(content);
      if (!visibleText && !namedImage && !namedSvg) issues.push('button has no accessible name');
    }
  }

  return issues.map((issue) => `${pagePath}: ${issue}`);
}

function localReferences(html, pagePath, origin) {
  const references = new Set();
  const ids = new Set();
  const anchors = [];
  const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((match) => match[1]);
  const tags = /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<[^>]+>/gi;

  for (const match of html.matchAll(tags)) {
    const tag = match[0];
    if (tag.startsWith('<!--')) continue;
    const openingTag = tag.match(/^<script\b[^>]*>/i)?.[0] ?? tag;
    const attributes = /(?:^|\s)(?:href|src|poster|action)\s*=\s*(["'])(.*?)\1/gi;
    const inlineStyle = openingTag.match(/(?:^|\s)style\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (inlineStyle) inlineStyles.push(inlineStyle);
    const id = openingTag.match(/(?:^|\s)id\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (id) {
      if (ids.has(id)) throw new Error(`Duplicate HTML id "${id}" in ${pagePath}.`);
      ids.add(id);
    }

    for (const attribute of openingTag.matchAll(attributes)) {
      const reference = attribute[2].replaceAll('&amp;', '&').trim();
      if (!reference) continue;

      const parsedUrl = new URL(reference, `http://127.0.0.1${pagePath}`);
      if (parsedUrl.protocol === 'javascript:' || parsedUrl.protocol === 'vbscript:') {
        throw new Error(`Executable URL scheme "${parsedUrl.protocol}" in ${pagePath}: "${reference}".`);
      }
      const targetPath = localPath(reference, pagePath, origin);
      if (!targetPath) continue;
      if (/^<a\b/i.test(openingTag) && parsedUrl.hash) {
        anchors.push({
          targetPath,
          fragment: decodeURIComponent(parsedUrl.hash.slice(1)),
          reference,
        });
      }
      references.add(targetPath);
    }
  }

  return { references, ids, anchors, inlineStyles };
}

function cssReferences(css, stylesheetPath, origin) {
  const references = new Set();
  const patterns = [
    /url\(\s*(?:(["'])(.*?)\1|([^)]*?))\s*\)/gi,
    /@import\s+(["'])(.*?)\1/gi,
  ];

  for (const pattern of patterns) {
    for (const match of css.matchAll(pattern)) {
      const reference = (match[2] ?? match[3] ?? '').trim();
      if (!reference || reference.startsWith('#')) continue;
      const targetPath = localPath(reference, stylesheetPath, origin);
      if (targetPath) references.add(targetPath);
    }
  }

  return references;
}

function jsReferences(source, modulePath, origin) {
  const references = new Set();
  const patterns = [
    /\bimport\s+(?:[\s\S]*?\s+from\s*)?(["'])([^"']+)\1/g,
    /\bexport\s+(?:\*|\{[\s\S]*?\})\s+from\s*(["'])([^"']+)\1/g,
    /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[2].trim();
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
      const targetPath = localPath(specifier, modulePath, origin);
      if (targetPath) references.add(targetPath);
    }
  }

  return references;
}

async function waitForServer(server) {
  let output = '';
  let errorOutput = '';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for the preview server to start.'));
    }, 10_000);

    const cleanup = () => {
      clearTimeout(timeout);
      server.stdout.off('data', onOutput);
      server.stderr.off('data', onErrorOutput);
      server.off('error', onError);
      server.off('exit', onExit);
    };

    const onOutput = (chunk) => {
      output += chunk.toString();
      const match = output.match(/Serving HTTP on 127\.0\.0\.1 port (\d+)/);
      if (match) {
        cleanup();
        resolve(Number(match[1]));
      }
    };

    const onErrorOutput = (chunk) => {
      errorOutput += chunk.toString();
    };

    const onError = (error) => {
      cleanup();
      reject(new Error(`Failed to start preview server: ${error.message}`));
    };

    const onExit = (code, signal) => {
      cleanup();
      reject(new Error(
        `Preview server exited before becoming ready (code ${code}, signal ${signal}).${errorOutput ? ` ${errorOutput.trim()}` : ''}`
      ));
    };

    server.stdout.on('data', onOutput);
    server.stderr.on('data', onErrorOutput);
    server.once('error', onError);
    server.once('exit', onExit);
  });
}

async function stopServer(server) {
  if (server.pid === undefined || server.exitCode !== null || server.signalCode !== null) return;

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      server.kill('SIGKILL');
    }, 2_000);

    server.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    server.kill('SIGTERM');
  });
}

const server = spawn(
  process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
  ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', distDirectory],
  { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
);

try {
  const htmlPages = listHtmlPages(distDirectory);
  if (htmlPages.length === 0) throw new Error('No generated HTML pages found in dist/. Run npm run build first.');
  const javascriptFiles = listJavaScriptFiles(distDirectory);
  const syntaxFailures = [];
  for (const filePath of javascriptFiles) {
    const check = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
    if (check.error || check.status !== 0) {
      syntaxFailures.push(`${path.relative(distDirectory, filePath)}: ${(check.stderr || check.error?.message || 'syntax check failed').trim()}`);
    }
  }
  if (syntaxFailures.length) {
    throw new Error(`Generated JavaScript syntax checks failed:\n${syntaxFailures.map((failure) => `- ${failure}`).join('\n')}`);
  }

  const references = new Set(['/']);
  const cssFiles = new Set();
  const inlineStyles = [];
  const pageIds = new Map();
  const anchorLinks = [];
  const accessibilityFailures = [];
  for (const filePath of htmlPages) {
    const pagePath = `/${path.relative(distDirectory, filePath).split(path.sep).join('/')}`;
    references.add(pagePath);
    const html = fs.readFileSync(filePath, 'utf8');
    accessibilityFailures.push(...accessibilityIssues(html, pagePath));
    const pageContents = localReferences(html, pagePath, 'http://127.0.0.1');
    pageIds.set(pagePath, pageContents.ids);
    anchorLinks.push(...pageContents.anchors.map((anchor) => ({ ...anchor, sourcePath: pagePath })));
    inlineStyles.push(...pageContents.inlineStyles.map((css) => ({ css, pagePath })));
    for (const reference of pageContents.references) {
      const targetPath = path.resolve(distDirectory, `.${reference}`);
      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        throw new Error(`Missing local target "${reference}" referenced from ${pagePath}.`);
      }
      references.add(reference);
      if (reference.endsWith('.css')) cssFiles.add(reference);
    }
  }

  if (accessibilityFailures.length) {
    throw new Error(`Basic HTML accessibility checks failed:\n${accessibilityFailures.map((failure) => `- ${failure}`).join('\n')}`);
  }

  for (const { css, pagePath } of inlineStyles) {
    for (const reference of cssReferences(css, pagePath, 'http://127.0.0.1')) {
      const targetPath = path.resolve(distDirectory, `.${reference}`);
      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        throw new Error(`Missing inline CSS target "${reference}" referenced from ${pagePath}.`);
      }
      references.add(reference);
      if (reference.endsWith('.css')) cssFiles.add(reference);
    }
  }

  for (const stylesheetPath of cssFiles) {
    const stylesheet = fs.readFileSync(path.join(distDirectory, stylesheetPath.slice(1)), 'utf8');
    for (const reference of cssReferences(stylesheet, stylesheetPath, 'http://127.0.0.1')) {
      const targetPath = path.resolve(distDirectory, `.${reference}`);
      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        throw new Error(`Missing CSS target "${reference}" referenced from ${stylesheetPath}.`);
      }
      references.add(reference);
      if (reference.endsWith('.css')) cssFiles.add(reference);
    }
  }

  const jsModules = [...references].filter((reference) => /\.(?:m?js)$/i.test(reference));
  const inspectedModules = new Set();
  while (jsModules.length) {
    const modulePath = jsModules.pop();
    if (inspectedModules.has(modulePath)) continue;
    inspectedModules.add(modulePath);

    const module = fs.readFileSync(path.join(distDirectory, modulePath.slice(1)), 'utf8');
    for (const reference of jsReferences(module, modulePath, 'http://127.0.0.1')) {
      const targetPath = path.resolve(distDirectory, `.${reference}`);
      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        throw new Error(`Missing JavaScript import "${reference}" referenced from ${modulePath}.`);
      }
      references.add(reference);
      if (/\.m?js$/i.test(reference) && !inspectedModules.has(reference)) {
        jsModules.push(reference);
      }
    }
  }

  const invalidAnchors = anchorLinks.filter(({ targetPath, fragment }) => {
    if (!targetPath.endsWith('.html')) return false;
    const relativeTarget = targetPath.replace(/^\//, '');
    return !pageIds.get(targetPath)?.has(fragment) && !runtimeAnchors.get(relativeTarget)?.has(fragment);
  });
  if (invalidAnchors.length) {
    throw new Error(`Missing local HTML anchors:\n${invalidAnchors.map(({ sourcePath, reference }) => `- ${sourcePath}: ${reference}`).join('\n')}`);
  }

  const port = await waitForServer(server);
  const origin = `http://127.0.0.1:${port}`;
  const failures = [];
  for (const reference of references) {
    const response = await fetch(new URL(reference, origin), {
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.text();
    if (!response.ok) {
      failures.push(`${reference}: HTTP ${response.status}`);
    } else if (reference.endsWith('.html') || reference === '/') {
      if (!/<html\b/i.test(body)) failures.push(`${reference}: response is not HTML`);
    } else if (!body.trim()) {
      failures.push(`${reference}: response is empty`);
    }
  }
  if (failures.length) throw new Error(`Local HTTP checks failed:\n- ${failures.join('\n- ')}`);

  console.log(`Smoke check passed: ${htmlPages.length} HTML pages, ${javascriptFiles.length} JavaScript syntax checks, ${references.size - htmlPages.length} local targets, ${anchorLinks.length} local HTML anchors, and basic document/image/form/link/button accessibility checks.`);
} catch (error) {
  console.error(`Smoke check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await stopServer(server);
}
