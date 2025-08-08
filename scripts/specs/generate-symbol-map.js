#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { keccak256, toUtf8Bytes } = require('ethers');

function read(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return ''; } }
function json(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function write(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }

async function glob(patterns) {
  const { globby } = await import('globby');
  return globby(patterns, { gitignore: true, absolute: true });
}

function buildTsProgram(files) {
  const options = { allowJs: true, checkJs: false, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS };
  return ts.createProgram(files, options);
}

function collectTsSymbols(program, root) {
  const checker = program.getTypeChecker();
  const symbols = [];
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) continue;
    const filePath = path.relative(root, sf.fileName);
    function visit(node) {
      let kind = null;
      if (ts.isFunctionDeclaration(node) && node.name) kind = 'function';
      else if (ts.isClassDeclaration(node) && node.name) kind = 'class';
      else if (ts.isVariableStatement(node)) kind = 'variable';
      else if (ts.isMethodDeclaration(node) && node.name) kind = 'method';
      if (kind) {
        const name = node.name ? node.name.getText() : (node.declarationList ? node.declarationList.declarations[0]?.name?.getText() : null);
        const isExported = !!(node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword));
        if (name || kind === 'variable') {
          const { line, character } = sf.getLineAndCharacterOfPosition(node.pos);
          const tagsArr = ts.getJSDocTags(node) || [];
          const tags = {};
          for (const t of tagsArr) {
            const tagName = t.tagName?.getText() || '';
            const text = (t.comment && (Array.isArray(t.comment) ? t.comment.map(p=>p.text).join('') : t.comment)) || '';
            if (!tags[tagName]) tags[tagName] = text.trim();
          }
          const symbol = { lang: 'ts/js', file: filePath, line: line + 1, kind, name: name || '(anonymous)', exported: isExported, tags };
          symbols.push(symbol);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  return symbols;
}

function collectSolidityFromArtifacts(root) {
  const artifactsDir = path.join(root, 'backend', 'artifacts');
  const results = [];
  function walk(dir) {
    for (const entry of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (stat.isFile() && p.endsWith('.json')) {
        const data = json(p);
        if (!data || !data.abi) return;
        const contractName = data.contractName || path.basename(p, '.json');
        for (const item of data.abi) {
          if (item.type === 'function') {
            const sig = `${item.name}(${(item.inputs||[]).map(i=>i.type).join(',')})`;
            const selector = keccak256(toUtf8Bytes(sig)).slice(0, 10);
            results.push({
              lang: 'solidity',
              contract: contractName,
              kind: 'function',
              name: item.name,
              signature: sig,
              selector,
              stateMutability: item.stateMutability,
              inputs: item.inputs || [],
              outputs: item.outputs || [],
              file: path.relative(root, p)
            });
          } else if (item.type === 'event') {
            const sig = `${item.name}(${(item.inputs||[]).map(i=>i.type).join(',')})`;
            const topic0 = keccak256(toUtf8Bytes(sig));
            results.push({ lang: 'solidity', contract: contractName, kind: 'event', name: item.name, signature: sig, topic0, inputs: item.inputs||[], file: path.relative(root,p) });
          } else if (item.type === 'error') {
            const sig = `${item.name}(${(item.inputs||[]).map(i=>i.type).join(',')})`;
            const selector = keccak256(toUtf8Bytes(sig)).slice(0,10);
            results.push({ lang: 'solidity', contract: contractName, kind: 'error', name: item.name, signature: sig, selector, inputs: item.inputs||[], file: path.relative(root,p) });
          }
        }
      }
    }
  }
  if (fs.existsSync(artifactsDir)) walk(artifactsDir);
  return results;
}

function buildCrossReferences(sol, tsjs) {
  const byUid = {};
  const byName = {};
  function add(map, key, val) { if (!map[key]) map[key] = []; map[key].push(val); }
  for (const s of tsjs) {
    const uid = s.tags?.uid || s.tags?.custom || null;
    if (uid) add(byUid, uid, s);
    add(byName, s.name?.toLowerCase?.() || '', s);
  }
  const xrefs = [];
  for (const s of sol) {
    const uidMatch = (byUid[s.name] || []);
    const nameMatch = (byName[s.name?.toLowerCase?.()] || []);
    const candidates = [...new Set([...uidMatch, ...nameMatch])];
    if (candidates.length) {
      xrefs.push({ solidity: { contract: s.contract, kind: s.kind, name: s.name, signature: s.signature }, matches: candidates.map(c => ({ file: c.file, kind: c.kind, name: c.name, line: c.line })) });
    }
  }
  return xrefs;
}

(async function main() {
  const root = process.cwd();
  const tsFiles = await glob(['backend/src/**/*.{ts,js}', 'frontend/src/**/*.{ts,js}', 'docs/specifications/**/*.ts']);
  const program = buildTsProgram(tsFiles);
  const tsSymbols = collectTsSymbols(program, root);
  const solSymbols = collectSolidityFromArtifacts(root);
  const xrefs = buildCrossReferences(solSymbols, tsSymbols);

  const outDir = path.join(root, 'docs', 'definitions');
  write(path.join(outDir, 'symbol-map.json'), JSON.stringify({ generatedAt: new Date().toISOString(), solidity: solSymbols, tsjs: tsSymbols, crossReferences: xrefs }, null, 2));

  let md = `# Symbol Map\n\nGenerated: ${new Date().toISOString()}\n\n## Solidity\n\n`;
  for (const s of solSymbols) md += `- [${s.contract}] ${s.kind} ${s.name} ${s.signature || ''} (${s.stateMutability||''})\n`;
  md += `\n## TypeScript/JavaScript\n\n`;
  for (const s of tsSymbols.filter(s=>s.exported)) md += `- ${s.kind} ${s.name} — ${s.file}:${s.line}\n`;
  md += `\n## Cross References\n\n`;
  for (const x of xrefs) {
    md += `- ${x.solidity.contract}::${x.solidity.name} — matches:\n`;
    for (const m of x.matches) md += `  - ${m.kind} ${m.name} (${m.file}:${m.line})\n`;
  }
  write(path.join(outDir, 'symbol-map.md'), md);
  console.log(`Symbol map generated: docs/definitions/symbol-map.json (solidity: ${solSymbols.length}, ts/js: ${tsSymbols.length}, xrefs: ${xrefs.length})`);
})();
