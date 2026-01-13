import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const includeRoots = [path.join(root, 'app')];

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', '.git']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.env.local') {
      if (IGNORE_DIRS.has(e.name)) continue;
    }
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(full, out);
    } else {
      const ext = path.extname(e.name);
      if (EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

function stripStringsAndComments(source) {
  // Very lightweight; avoids scanning inside comments/strings where possible.
  // Not a parser; the scan is best-effort.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // block comments
    .replace(/(^|[^:])\/\/.*$/gm, '$1 ') // line comments
    .replace(/`(?:\\`|[\s\S])*?`/g, '`…`') // template literals
    .replace(/'(?:\\'|[^'])*?'/g, "'…'")
    .replace(/\"(?:\\\"|[^\"])*?\"/g, '"…"');
}

function scanFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const src = stripStringsAndComments(raw);
  const findings = [];

  // Heuristic: JSX text nodes like >Some text< (English/Arabic)
  const textNodeRegex = />\s*([A-Za-z][^<{\n]{2,}|[\u0600-\u06FF][^<{\n]{1,})\s*</g;
  let m;
  while ((m = textNodeRegex.exec(src))) {
    const text = m[1].trim();
    if (!text) continue;
    if (text === '…') continue;
    if (/^\d+$/.test(text)) continue;

    const upTo = src.slice(0, m.index);
    const line = upTo.split(/\r?\n/).length;
    findings.push({ line, text });
  }

  // Heuristic: placeholder props like placeholder="Search..." or aria-label="..."
  const propRegex = /(placeholder|aria-label|title)=\{?\"([^\"\n]{3,})\"\}?/g;
  while ((m = propRegex.exec(src))) {
    const text = m[2].trim();
    if (!text) continue;
    if (text === '…') continue;
    const upTo = src.slice(0, m.index);
    const line = upTo.split(/\r?\n/).length;
    findings.push({ line, text });
  }

  return findings;
}

const files = includeRoots.flatMap((d) => walk(d));
let total = 0;
let fileCount = 0;

for (const f of files) {
  const findings = scanFile(f);
  if (!findings.length) continue;
  fileCount += 1;
  total += findings.length;
  const rel = path.relative(root, f).replace(/\\/g, '/');
  console.log(`\n${rel}`);
  for (const it of findings.slice(0, 40)) {
    console.log(`  L${it.line}: ${it.text}`);
  }
  if (findings.length > 40) console.log(`  ... +${findings.length - 40} more`);
}

console.log(`\nScan complete: ${fileCount} files with hardcoded UI strings (${total} findings).`);
console.log('Tip: Use this report to replace strings with next-intl keys.');
