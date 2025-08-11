#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DocGenerator {
  constructor() {
    this.templates = this.loadTemplates();
    this.outputDir = path.join(__dirname, '../docs');
  }

  loadTemplates() {
    return {
      frontend: this.loadTemplate('frontend'),
      backend: this.loadTemplate('backend'),
      blockchain: this.loadTemplate('blockchain'),
      api: this.loadTemplate('api'),
      deployment: this.loadTemplate('deployment'),
      testing: this.loadTemplate('testing')
    };
  }

  loadTemplate(category) {
    const templatePath = path.join(__dirname, 'templates', `${category}.md`);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    return this.getDefaultTemplate(category);
  }

  getDefaultTemplate(category) {
    const date = new Date().toISOString().split('T')[0];
    
    switch (category) {
      case 'frontend':
        return `# {{TITLE}}

## Metadata
- **Category**: frontend
- **Framework**: React/TypeScript
- **Priority**: medium
- **Last Updated**: ${date}
- **Version**: 1.0.0
- **Dependencies**: []

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- React 18+
- TypeScript 4.5+
- Node.js 18+

## Implementation
{{IMPLEMENTATION}}

## Examples
{{EXAMPLES}}

## Styling
{{STYLING}}

## State Management
{{STATE_MANAGEMENT}}

## Testing
{{TESTING}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;

      case 'backend':
        return `# {{TITLE}}

## Metadata
- **Category**: backend
- **Framework**: Express/Node.js
- **Priority**: medium
- **Last Updated**: ${date}
- **Version**: 1.0.0
- **Dependencies**: []

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- Node.js 18+
- Express.js 4.18+
- TypeScript 4.5+

## Implementation
{{IMPLEMENTATION}}

## API Endpoint
{{API_ENDPOINT}}

## Request/Response Schema
{{SCHEMA}}

## Error Handling
{{ERROR_HANDLING}}

## Testing
{{TESTING}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;

      case 'blockchain':
        return `# {{TITLE}}

## Metadata
- **Category**: blockchain
- **Framework**: Hardhat/Solidity
- **Priority**: medium
- **Last Updated**: ${date}
- **Version**: 1.0.0
- **Dependencies**: []

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- Node.js 18+
- Hardhat 2.12+
- Solidity 0.8.19+

## Implementation
{{IMPLEMENTATION}}

## Contract Interface
{{CONTRACT_INTERFACE}}

## Deployment
{{DEPLOYMENT}}

## Testing
{{TESTING}}

## Gas Optimization
{{GAS_OPTIMIZATION}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;

      default:
        return `# {{TITLE}}

## Metadata
- **Category**: ${category}
- **Priority**: medium
- **Last Updated**: ${date}
- **Version**: 1.0.0
- **Dependencies**: []

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
{{PREREQUISITES}}

## Implementation
{{IMPLEMENTATION}}

## Examples
{{EXAMPLES}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
    }
  }

  generateDoc(category, title, options = {}) {
    const template = this.templates[category];
    if (!template) {
      throw new Error(`Unknown category: ${category}`);
    }

    const content = template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{QUICK_REFERENCE}}/g, options.quickReference || 'One-line description of the feature')
      .replace(/{{IMPLEMENTATION}}/g, options.implementation || 'Step-by-step implementation instructions')
      .replace(/{{EXAMPLES}}/g, options.examples || 'Code examples and usage patterns')
      .replace(/{{STYLING}}/g, options.styling || 'CSS classes and Tailwind utilities')
      .replace(/{{STATE_MANAGEMENT}}/g, options.stateManagement || 'Redux/Context usage patterns')
      .replace(/{{TESTING}}/g, options.testing || 'Test examples and patterns')
      .replace(/{{TROUBLESHOOTING}}/g, options.troubleshooting || 'Common issues and solutions')
      .replace(/{{RELATED}}/g, options.related || 'Links to related documentation')
      .replace(/{{API_ENDPOINT}}/g, options.apiEndpoint || 'HTTP Method /api/v1/endpoint')
      .replace(/{{SCHEMA}}/g, options.schema || 'Request/Response schema definitions')
      .replace(/{{ERROR_HANDLING}}/g, options.errorHandling || 'Error codes and messages')
      .replace(/{{CONTRACT_INTERFACE}}/g, options.contractInterface || 'Solidity interface definitions')
      .replace(/{{DEPLOYMENT}}/g, options.deployment || 'Deployment instructions')
      .replace(/{{GAS_OPTIMIZATION}}/g, options.gasOptimization || 'Gas usage optimization tips')
      .replace(/{{PREREQUISITES}}/g, options.prerequisites || 'List of requirements');

    return content;
  }

  saveDoc(filename, content) {
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, content);
    console.log(`✅ Generated: ${filepath}`);
  }

  generateFromConfig(configPath) {
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Config file not found: ${configPath}`);
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    config.docs.forEach(doc => {
      const content = this.generateDoc(doc.category, doc.title, doc.options);
      const filename = `${doc.filename || doc.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      this.saveDoc(filename, content);
    });
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new DocGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node scripts/generate-docs.js [options]

Options:
  --category <category>     Category (frontend|backend|blockchain|api|deployment|testing)
  --title <title>          Document title
  --filename <filename>     Output filename (optional)
  --config <config.json>   Generate from config file
  --quick-ref <text>       Quick reference text
  --implementation <text>   Implementation instructions
  --examples <text>        Code examples
  --help                   Show this help

Examples:
  node scripts/generate-docs.js --category frontend --title "Button Component"
  node scripts/generate-docs.js --config docs-config.json
    `);
    process.exit(0);
  }

  // Parse command line arguments
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }

  if (options.config) {
    generator.generateFromConfig(options.config);
  } else if (options.category && options.title) {
    const content = generator.generateDoc(options.category, options.title, {
      quickReference: options['quick-ref'],
      implementation: options.implementation,
      examples: options.examples
    });
    
    const filename = options.filename || `${options.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    generator.saveDoc(filename, content);
  } else {
    console.error('❌ Missing required arguments. Use --help for usage information.');
    process.exit(1);
  }
}

module.exports = DocGenerator;