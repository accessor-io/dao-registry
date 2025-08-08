#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('comment-parser');
const yaml = require('js-yaml');

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function extractFromComments(source, filePath) {
  const blocks = parse(source, { spacing: 'preserve' });
  const items = [];
  for (const b of blocks) {
    const tags = Object.fromEntries(b.tags.map(t => [t.tag, (t.name ? `${t.name} ` : '') + (t.description || '')]));
    const summary = b.description?.trim() || '';
    const fqName = tags.custom || tags.dev || tags.title || '';
    const kind = tags.kind || tags.type || '';
    const id = (tags.uid || tags.id || '').trim() || (tags.notice || '').trim() || fqName || summary.slice(0, 64);
    if (!summary && !Object.keys(tags).length) continue;
    items.push({ id, file: filePath, kind: kind.trim(), name: (tags.title || tags.custom || '').trim() || null, summary, tags });
  }
  return items;
}

function extractSolidityNatSpec(source, filePath) {
  return extractFromComments(source, filePath).map(i => ({ ...i, lang: 'solidity' }));
}

function extractTsJsDoc(source, filePath) {
  return extractFromComments(source, filePath).map(i => ({ ...i, lang: filePath.endsWith('.ts') ? 'ts' : 'js' }));
}

(async function main() {
  const root = process.cwd();
  const { globby } = await import('globby');
  const patterns = [
    'backend/src/**/*.js',
    'backend/src/**/*.ts',
    'backend/contracts/**/*.sol',
    'docs/specifications/**/*.ts',
    'frontend/src/**/*.js',
    'frontend/src/**/*.ts',
  ];
  const files = await globby(patterns, { gitignore: true, absolute: true });

  const index = [];

  for (const file of files) {
    const src = read(file);
    if (!src) continue;
    if (file.endsWith('.sol')) {
      index.push(...extractSolidityNatSpec(src, path.relative(root, file)));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      index.push(...extractTsJsDoc(src, path.relative(root, file)));
    }
  }

  const byId = {};
  for (const item of index) {
    const key = item.id || `${item.file}#${item.name || item.kind}`;
    if (!byId[key]) byId[key] = [];
    byId[key].push(item);
  }

  const outJson = path.join(root, 'docs', 'definitions', 'definitions.index.json');
  const outYaml = path.join(root, 'docs', 'definitions', 'definitions.index.yaml');
  const outMd = path.join(root, 'docs', 'definitions', 'definitions.index.md');

  write(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), total: index.length, items: index, byId }, null, 2));
  write(outYaml, yaml.dump({ generatedAt: new Date().toISOString(), total: index.length, items: index }));

  const byKind = {};
  for (const it of index) {
    const k = it.kind || 'unknown';
    if (!byKind[k]) byKind[k] = [];
    byKind[k].push(it);
  }
  let md = `# Semantic Definitions Index\n\nGenerated: ${new Date().toISOString()}\n\n`;
  for (const [kind, arr] of Object.entries(byKind)) {
    md += `## ${kind} (${arr.length})\n\n`;
    for (const it of arr) {
      md += `- ${it.id || it.name || '(no-id)'} — ${it.summary || ''} \n  - file: ${it.file}\n`;
      if (it.tags && Object.keys(it.tags).length) md += `  - tags: ${Object.keys(it.tags).join(', ')}\n`;
    }
    md += `\n`;
  }
  write(outMd, md);
  console.log(`Definitions index generated: ${path.relative(root, outJson)} (${index.length} items)`);
})();
