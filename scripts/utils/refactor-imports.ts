#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');
const sharedSrc = path.join(repoRoot, 'shared', 'src');
const targets = [path.join(repoRoot, 'backend', 'src'), path.join(repoRoot, 'frontend', 'src'), path.join(repoRoot, 'frontend', 'packages')];

function isInsideSharedSrc(resolvedPath: string): boolean {
  const rel = path.relative(sharedSrc, resolvedPath);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function toSharedAlias(resolvedPath: string): string {
  const rel = path.relative(sharedSrc, resolvedPath).replace(/\\/g, '/');
  return `@shared/${rel.replace(/\.tsx?$/, '').replace(/\.jsx?$/, '')}`;
}

function processFile(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  const result = code.replace(/(import\s+[^'"\n]+from\s+['"])([^'"\n]+)(['"];?)/g, (_m, p1, spec, p3) => {
    if (!spec.startsWith('.')) return `${p1}${spec}${p3}`;
    const resolved = path.resolve(path.dirname(filePath), spec);
    let candidate = resolved;
    const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    for (const ext of exts) {
      const tryPath = resolved + ext;
      if (fs.existsSync(tryPath)) { candidate = tryPath; break; }
    }
    if (isInsideSharedSrc(candidate)) {
      changed = true;
      const alias = toSharedAlias(candidate);
      return `${p1}${alias}${p3}`;
    }
    return `${p1}${spec}${p3}`;
  }).replace(/(require\(\s*['"])([^'"\n]+)(['"]\s*\))/g, (_m, p1, spec, p3) => {
    if (!spec.startsWith('.')) return `${p1}${spec}${p3}`;
    const resolved = path.resolve(path.dirname(filePath), spec);
    let candidate = resolved;
    const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    for (const ext of exts) {
      const tryPath = resolved + ext;
      if (fs.existsSync(tryPath)) { candidate = tryPath; break; }
    }
    if (isInsideSharedSrc(candidate)) {
      changed = true;
      const alias = toSharedAlias(candidate);
      return `${p1}${alias}${p3}`;
    }
    return `${p1}${spec}${p3}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, result, 'utf8');
    // eslint-disable-next-line no-console
    console.log('Updated imports:', path.relative(repoRoot, filePath));
  }
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue;
      walk(full);
    } else if (/\.(t|j)sx?$/.test(entry)) {
      processFile(full);
    }
  }
}

for (const t of targets) walk(t);




