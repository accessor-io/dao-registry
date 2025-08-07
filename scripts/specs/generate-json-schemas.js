#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

async function main() {
  const root = process.cwd();
  const specsRoot = path.join(root, 'docs', 'specifications');
  const outDir = path.join(root, 'shared', 'schemas');

  // Allowed TS spec files (explicit list to avoid Solidity-like TS)
  const sources = [
    path.join(specsRoot, 'core', 'dao.types.ts'),
    path.join(specsRoot, 'core', 'proposal.types.ts'),
    path.join(specsRoot, 'core', 'member.types.ts'),
    path.join(specsRoot, 'ens', 'ens-integration.types.ts'),
    path.join(specsRoot, 'analytics', 'analytics.types.ts'),
    path.join(specsRoot, 'validation', 'validation.types.ts'),
    path.join(specsRoot, 'api', 'api.types.ts')
  ].filter(fs.existsSync);

  // Lazy install if module not present
  let TJS;
  try {
    TJS = require('typescript-json-schema');
  } catch (e) {
    console.error('Missing dependency typescript-json-schema. Install it with:');
    console.error('  npm i -D typescript-json-schema');
    process.exit(1);
  }

  if (sources.length === 0) {
    console.error('No specification source files found');
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const compilerOptions = {
    strictNullChecks: true,
    esModuleInterop: true,
    skipLibCheck: true
  };

  const program = TJS.getProgramFromFiles(sources, compilerOptions);

  const settings = {
    required: true,
    noExtraProps: false,
    ref: true,
    topRef: true
  };

  const generator = TJS.buildGenerator(program, settings);
  if (!generator) {
    console.error('Failed to build schema generator');
    process.exit(1);
  }

  const symbols = generator.getUserSymbols();

  const exportList = [
    'DAO', 'CreateDAORequest', 'UpdateDAORequest', 'DAOResponse',
    'Proposal', 'CreateProposalRequest', 'VoteRequest', 'ProposalResponse',
    'Member', 'AddMemberRequest', 'UpdateMemberRequest', 'MemberResponse',
    'ENSRegistrationRequest', 'ENSUpdateRequest', 'ENSOwnershipVerificationRequest', 'ENSResolveRequest',
    'AnalyticsRequest', 'AnalyticsResponse'
  ].filter((name) => symbols.includes(name));

  for (const typeName of exportList) {
    const schema = generator.getSchemaForSymbol(typeName);
    const target = path.join(outDir, `${typeName}.schema.json`);
    fs.writeFileSync(target, JSON.stringify(schema, null, 2));
    console.log('Wrote schema:', path.relative(root, target));
  }

  console.log('Schema generation complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
