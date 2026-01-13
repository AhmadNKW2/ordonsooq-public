import fs from 'node:fs';
import path from 'node:path';

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function collectKeys(obj, prefix = '') {
  const keys = new Set();
  if (!isObject(obj)) return keys;

  for (const [key, value] of Object.entries(obj)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (isObject(value)) {
      for (const nested of collectKeys(value, nextPrefix)) keys.add(nested);
    } else {
      keys.add(nextPrefix);
    }
  }

  return keys;
}

function getAtPath(obj, dottedPath) {
  const parts = dottedPath.split('.');
  let cur = obj;
  for (const part of parts) {
    if (!isObject(cur) || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function extractPlaceholders(message) {
  if (typeof message !== 'string') return new Set();
  const matches = message.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*\}/g);
  const set = new Set();
  for (const m of matches) set.add(m[1]);
  return set;
}

function diffSets(a, b) {
  const onlyA = [];
  for (const k of a) if (!b.has(k)) onlyA.push(k);
  onlyA.sort();
  return onlyA;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

const root = process.cwd();
const enPath = path.join(root, 'messages', 'en.json');
const arPath = path.join(root, 'messages', 'ar.json');

const en = readJson(enPath);
const ar = readJson(arPath);

const enKeys = collectKeys(en);
const arKeys = collectKeys(ar);

const missingInAr = diffSets(enKeys, arKeys);
const missingInEn = diffSets(arKeys, enKeys);

let hasError = false;

if (missingInAr.length) {
  hasError = true;
  console.error(`\nMissing keys in ar.json (${missingInAr.length}):`);
  for (const k of missingInAr) console.error(`  - ${k}`);
}

if (missingInEn.length) {
  hasError = true;
  console.error(`\nMissing keys in en.json (${missingInEn.length}):`);
  for (const k of missingInEn) console.error(`  - ${k}`);
}

// Placeholder parity check
const placeholderMismatches = [];
for (const k of enKeys) {
  if (!arKeys.has(k)) continue;
  const enVal = getAtPath(en, k);
  const arVal = getAtPath(ar, k);
  const enVars = extractPlaceholders(enVal);
  const arVars = extractPlaceholders(arVal);

  const onlyEn = diffSets(enVars, arVars);
  const onlyAr = diffSets(arVars, enVars);

  if (onlyEn.length || onlyAr.length) {
    placeholderMismatches.push({ key: k, onlyEn, onlyAr });
  }
}

if (placeholderMismatches.length) {
  hasError = true;
  console.error(`\nPlaceholder mismatches (${placeholderMismatches.length}):`);
  for (const m of placeholderMismatches) {
    console.error(`  - ${m.key}`);
    if (m.onlyEn.length) console.error(`    only in en: ${m.onlyEn.join(', ')}`);
    if (m.onlyAr.length) console.error(`    only in ar: ${m.onlyAr.join(', ')}`);
  }
}

if (!hasError) {
  console.log('i18n-check: OK (en/ar keys + placeholders match)');
} else {
  process.exitCode = 1;
}
