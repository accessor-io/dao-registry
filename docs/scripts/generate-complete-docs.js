#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CompleteDocGenerator {
  constructor() {
    this.docsDir = path.join(__dirname, '../docs');
    this.outputDir = path.join(__dirname, '../docs/structured');
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    return {
      frontend: this.getFrontendTemplate(),
      backend: this.getBackendTemplate(),
      blockchain: this.getBlockchainTemplate(),
      architecture: this.getArchitectureTemplate(),
      rfc: this.getRFCTemplate(),
      specification: this.getSpecificationTemplate(),
      research: this.getResearchTemplate(),
      appendix: this.getAppendixTemplate()
    };
  }

  getFrontendTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: frontend
- **Framework**: React/TypeScript
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

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
  }

  getBackendTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: backend
- **Framework**: Express/Node.js
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

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
  }

  getBlockchainTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: blockchain
- **Framework**: Hardhat/Solidity
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

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
  }

  getArchitectureTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: architecture
- **Framework**: System Design
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- System design knowledge
- Architecture patterns
- Technology stack understanding

## Implementation
{{IMPLEMENTATION}}

## Architecture Overview
{{ARCHITECTURE_OVERVIEW}}

## Component Design
{{COMPONENT_DESIGN}}

## Integration Patterns
{{INTEGRATION_PATTERNS}}

## Testing
{{TESTING}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
  }

  getRFCTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: rfc
- **Framework**: Specification
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- Understanding of RFC format
- Technical specification knowledge
- Implementation experience

## Implementation
{{IMPLEMENTATION}}

## Specification Details
{{SPECIFICATION_DETAILS}}

## Implementation Guide
{{IMPLEMENTATION_GUIDE}}

## Testing
{{TESTING}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
  }

  getSpecificationTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: specification
- **Framework**: Technical Specification
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- Technical specification knowledge
- Implementation experience
- Testing methodology

## Implementation
{{IMPLEMENTATION}}

## Specification Details
{{SPECIFICATION_DETAILS}}

## Implementation Guide
{{IMPLEMENTATION_GUIDE}}

## Testing
{{TESTING}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
  }

  getResearchTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: research
- **Framework**: Research Analysis
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
- Research methodology
- Technical background
- Analysis skills

## Implementation
{{IMPLEMENTATION}}

## Research Findings
{{RESEARCH_FINDINGS}}

## Analysis
{{ANALYSIS}}

## Conclusions
{{CONCLUSIONS}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
  }

  getAppendixTemplate() {
    return `# {{TITLE}}

## Metadata
- **Category**: appendix
- **Framework**: Reference Material
- **Priority**: {{PRIORITY}}
- **Last Updated**: {{DATE}}
- **Version**: {{VERSION}}
- **Dependencies**: {{DEPENDENCIES}}

## Quick Reference
{{QUICK_REFERENCE}}

## Prerequisites
{{PREREQUISITES}}

## Implementation
{{IMPLEMENTATION}}

## Reference Material
{{REFERENCE_MATERIAL}}

## Examples
{{EXAMPLES}}

## Troubleshooting
{{TROUBLESHOOTING}}

## Related
{{RELATED}}`;
  }

  categorizeFile(filepath) {
    const filename = path.basename(filepath);
    const dirname = path.dirname(filepath).split(path.sep).pop();

    if (dirname === 'rfc') return 'rfc';
    if (dirname === 'specification') return 'specification';
    if (dirname === 'research') return 'research';
    if (dirname === 'appendices') return 'appendix';
    if (dirname === 'architecture') return 'architecture';
    if (dirname === 'integration') return 'backend';
    if (dirname === 'features') return 'frontend';
    if (dirname === 'technical') return 'backend';

    // Categorize by filename patterns
    if (filename.includes('contract') || filename.includes('blockchain')) return 'blockchain';
    if (filename.includes('api') || filename.includes('service')) return 'backend';
    if (filename.includes('component') || filename.includes('ui')) return 'frontend';
    if (filename.includes('architecture') || filename.includes('system')) return 'architecture';
    if (filename.includes('rfc')) return 'rfc';
    if (filename.includes('spec')) return 'specification';
    if (filename.includes('research')) return 'research';

    // Default categorization
    if (filename.includes('user') || filename.includes('guide')) return 'frontend';
    if (filename.includes('developer') || filename.includes('manual')) return 'backend';
    if (filename.includes('deployment') || filename.includes('security')) return 'appendix';

    return 'backend'; // Default fallback
  }

  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : path.basename(filepath, '.md');
  }

  extractQuickReference(content) {
    // Look for common patterns in the content
    const patterns = [
      /## Overview\n([\s\S]*?)(?=\n## )/,
      /## Summary\n([\s\S]*?)(?=\n## )/,
      /## Description\n([\s\S]*?)(?=\n## )/,
      /^# [^\n]+\n\n([\s\S]*?)(?=\n## )/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim().substring(0, 200) + '...';
      }
    }

    return 'Comprehensive documentation for this component or feature.';
  }

  extractImplementation(content) {
    const implementationMatch = content.match(/## Implementation\n([\s\S]*?)(?=\n## |$)/);
    if (implementationMatch) {
      return implementationMatch[1].trim();
    }

    // Look for other implementation-related sections
    const patterns = [
      /## Usage\n([\s\S]*?)(?=\n## )/,
      /## Setup\n([\s\S]*?)(?=\n## )/,
      /## Configuration\n([\s\S]*?)(?=\n## )/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Implementation details and usage instructions for this component.';
  }

  extractExamples(content) {
    const examplesMatch = content.match(/## Examples?\n([\s\S]*?)(?=\n## |$)/);
    if (examplesMatch) {
      return examplesMatch[1].trim();
    }

    // Look for code blocks
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      return codeBlocks.slice(0, 3).join('\n\n');
    }

    return 'Code examples and usage patterns for this component.';
  }

  extractTesting(content) {
    const testingMatch = content.match(/## Testing\n([\s\S]*?)(?=\n## |$)/);
    if (testingMatch) {
      return testingMatch[1].trim();
    }

    return 'Testing procedures and examples for this component.';
  }

  extractTroubleshooting(content) {
    const troubleshootingMatch = content.match(/## Troubleshooting\n([\s\S]*?)(?=\n## |$)/);
    if (troubleshootingMatch) {
      return troubleshootingMatch[1].trim();
    }

    return 'Common issues and solutions for this component.';
  }

  extractRelated(content) {
    const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (links && links.length > 0) {
      return links.slice(0, 5).join('\n');
    }

    return 'Links to related documentation and resources.';
  }

  generateStructuredDoc(filepath, content) {
    const category = this.categorizeFile(filepath);
    const template = this.templates[category];
    
    if (!template) {
      console.warn(`No template found for category: ${category}`);
      return content; // Return original content if no template
    }

    const title = this.extractTitle(content);
    const date = new Date().toISOString().split('T')[0];
    
    const structuredContent = template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{PRIORITY}}/g, 'medium')
      .replace(/{{DATE}}/g, date)
      .replace(/{{VERSION}}/g, '1.0.0')
      .replace(/{{DEPENDENCIES}}/g, '[]')
      .replace(/{{QUICK_REFERENCE}}/g, this.extractQuickReference(content))
      .replace(/{{IMPLEMENTATION}}/g, this.extractImplementation(content))
      .replace(/{{EXAMPLES}}/g, this.extractExamples(content))
      .replace(/{{TESTING}}/g, this.extractTesting(content))
      .replace(/{{TROUBLESHOOTING}}/g, this.extractTroubleshooting(content))
      .replace(/{{RELATED}}/g, this.extractRelated(content))
      .replace(/{{STYLING}}/g, 'CSS classes and Tailwind utilities for styling.')
      .replace(/{{STATE_MANAGEMENT}}/g, 'React hooks and state management patterns.')
      .replace(/{{API_ENDPOINT}}/g, 'HTTP method and endpoint path.')
      .replace(/{{SCHEMA}}/g, 'Request/response schema definitions.')
      .replace(/{{ERROR_HANDLING}}/g, 'Error codes and messages.')
      .replace(/{{CONTRACT_INTERFACE}}/g, 'Solidity interface definitions.')
      .replace(/{{DEPLOYMENT}}/g, 'Deployment instructions.')
      .replace(/{{GAS_OPTIMIZATION}}/g, 'Gas usage optimization tips.')
      .replace(/{{ARCHITECTURE_OVERVIEW}}/g, 'High-level architecture description.')
      .replace(/{{COMPONENT_DESIGN}}/g, 'Component design patterns.')
      .replace(/{{INTEGRATION_PATTERNS}}/g, 'Integration patterns and strategies.')
      .replace(/{{SPECIFICATION_DETAILS}}/g, 'Detailed specification information.')
      .replace(/{{IMPLEMENTATION_GUIDE}}/g, 'Step-by-step implementation guide.')
      .replace(/{{RESEARCH_FINDINGS}}/g, 'Key research findings and insights.')
      .replace(/{{ANALYSIS}}/g, 'Detailed analysis of research data.')
      .replace(/{{CONCLUSIONS}}/g, 'Research conclusions and recommendations.')
      .replace(/{{REFERENCE_MATERIAL}}/g, 'Reference material and resources.')
      .replace(/{{PREREQUISITES}}/g, 'Prerequisites and requirements.');

    return structuredContent;
  }

  processAllFiles() {
    const files = this.getAllMarkdownFiles();
    const processedFiles = [];

    console.log(`📖 Processing ${files.length} markdown files...`);

    files.forEach(filepath => {
      try {
        const content = fs.readFileSync(filepath, 'utf8');
        const structuredContent = this.generateStructuredDoc(filepath, content);
        
        const relativePath = path.relative(this.docsDir, filepath);
        const outputPath = path.join(this.outputDir, relativePath);
        
        // Ensure output directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Write structured content
        fs.writeFileSync(outputPath, structuredContent);
        
        processedFiles.push({
          original: relativePath,
          structured: relativePath,
          category: this.categorizeFile(filepath),
          title: this.extractTitle(content)
        });
        
        console.log(`✅ Processed: ${relativePath}`);
      } catch (error) {
        console.error(`❌ Error processing ${filepath}:`, error.message);
      }
    });

    // Generate index
    this.generateIndex(processedFiles);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total files processed: ${processedFiles.length}`);
    console.log(`   Output directory: ${this.outputDir}`);
    
    return processedFiles;
  }

  getAllMarkdownFiles() {
    const files = [];
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else if (item.endsWith('.md')) {
          files.push(itemPath);
        }
      });
    };

    walkDir(this.docsDir);
    return files;
  }

  generateIndex(processedFiles) {
    const index = {
      generated: new Date().toISOString(),
      totalFiles: processedFiles.length,
      categories: {},
      files: processedFiles
    };

    // Group by categories
    processedFiles.forEach(file => {
      if (!index.categories[file.category]) {
        index.categories[file.category] = [];
      }
      index.categories[file.category].push(file);
    });

    const indexPath = path.join(this.outputDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`📋 Generated index: ${indexPath}`);
  }

  generateSummaryReport(processedFiles) {
    const report = {
      summary: {
        totalFiles: processedFiles.length,
        categories: Object.keys(this.templates).length,
        generated: new Date().toISOString()
      },
      categories: {},
      recommendations: []
    };

    // Category breakdown
    processedFiles.forEach(file => {
      if (!report.categories[file.category]) {
        report.categories[file.category] = 0;
      }
      report.categories[file.category]++;
    });

    // Generate recommendations
    if (report.categories.frontend < 5) {
      report.recommendations.push('Consider adding more frontend component documentation');
    }
    if (report.categories.backend < 5) {
      report.recommendations.push('Consider adding more backend service documentation');
    }
    if (report.categories.blockchain < 3) {
      report.recommendations.push('Consider adding more blockchain contract documentation');
    }

    const reportPath = path.join(this.outputDir, 'summary-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated summary report: ${reportPath}`);
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new CompleteDocGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node scripts/generate-complete-docs.js [options]

Options:
  --process-all     Process all markdown files
  --generate-index  Generate index of processed files
  --summary-report  Generate summary report
  --help           Show this help

Examples:
  node scripts/generate-complete-docs.js --process-all
  node scripts/generate-complete-docs.js --process-all --summary-report
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

  if (options['process-all'] || Object.keys(options).length === 0) {
    console.log('🚀 Starting complete documentation generation...');
    const processedFiles = generator.processAllFiles();
    
    if (options['summary-report']) {
      generator.generateSummaryReport(processedFiles);
    }
    
    console.log('\n✅ Complete documentation generation finished!');
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

module.exports = CompleteDocGenerator;