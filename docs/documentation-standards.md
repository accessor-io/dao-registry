# Documentation Standards

## Overview

This document defines the standardized format for developer documentation in the DAO Registry project. All documentation should follow these standards for consistency and maintainability.

## Standard Documentation Format

### 1. File Structure

```markdown
# [Title]

## Metadata
- **Category**: [frontend|backend|blockchain|api|deployment|testing]
- **Priority**: [high|medium|low]
- **Last Updated**: [YYYY-MM-DD]
- **Version**: [semver]
- **Dependencies**: [list of related docs]

## Quick Reference
[One-line summary]

## Prerequisites
[List of requirements]

## Implementation
[Step-by-step instructions]

## Examples
[Code examples]

## Troubleshooting
[Common issues and solutions]

## Related
[Links to related documentation]
```

### 2. Category-Specific Templates

#### Frontend Documentation
```markdown
# [Component/Feature Name]

## Metadata
- **Category**: frontend
- **Framework**: React/TypeScript
- **Dependencies**: [list]

## Quick Reference
[One-line description]

## Props Interface
```typescript
interface ComponentProps {
  // Type definitions
}
```

## Usage Examples
```jsx
// Basic usage
<Component prop="value" />

// Advanced usage
<Component 
  prop="value"
  callback={() => {}}
/>
```

## Styling
[CSS classes, Tailwind utilities]

## State Management
[Redux/Context usage]

## Testing
[Test examples]
```

#### Backend Documentation
```markdown
# [Service/Endpoint Name]

## Metadata
- **Category**: backend
- **Framework**: Express/Node.js
- **Database**: [PostgreSQL/Redis/MongoDB]

## Quick Reference
[One-line description]

## API Endpoint
```
[HTTP Method] /api/v1/[endpoint]
```

## Request/Response Schema
```typescript
interface Request {
  // Request structure
}

interface Response {
  // Response structure
}
```

## Implementation
[Service logic]

## Error Handling
[Error codes and messages]

## Testing
[Test examples]
```

#### Blockchain Documentation
```markdown
# [Contract/Feature Name]

## Metadata
- **Category**: blockchain
- **Framework**: Hardhat/Solidity
- **Network**: [Ethereum/Polygon/etc]

## Quick Reference
[One-line description]

## Contract Interface
```solidity
interface IContract {
  // Function signatures
}
```

## Deployment
[Deployment instructions]

## Testing
[Test examples]

## Gas Optimization
[Gas usage tips]
```

### 3. Code Block Standards

#### JavaScript/TypeScript
```javascript
// Use ```javascript for JS/TS code
const example = {
  property: 'value'
};
```

#### Solidity
```solidity
// Use ```solidity for smart contracts
contract Example {
    function example() public {
        // Implementation
    }
}
```

#### Bash
```bash
# Use ```bash for shell commands
npm install
npm run dev
```

#### JSON
```json
// Use ```json for configuration
{
  "property": "value"
}
```

### 4. Link Standards

#### Internal Links
```markdown
[Link Text](../relative/path/to/file.md)
```

#### External Links
```markdown
[Link Text](https://external-url.com)
```

#### API Links
```markdown
[API Reference](../api/reference.md#endpoint)
```

### 5. Image Standards

#### File Naming
- Use kebab-case: `feature-diagram.png`
- Include dimensions: `feature-diagram-800x600.png`
- Use descriptive names

#### Markdown Syntax
```markdown
![Alt Text](../images/filename.png)
```

### 6. Version Control

#### File Headers
```markdown
---
title: "Document Title"
version: "1.0.0"
last_updated: "2024-01-01"
category: "frontend"
priority: "high"
dependencies:
  - "../api/reference.md"
  - "../deployment/guide.md"
---
```

### 7. Search and Navigation

#### Tags
```markdown
<!-- Tags: react, typescript, components, ui -->
```

#### Search Keywords
```markdown
<!-- Keywords: component, props, state, hooks, styling -->
```

## Implementation Guidelines

### 1. Documentation Generator

Create a script to generate documentation from templates:

```javascript
// scripts/generate-docs.js
const fs = require('fs');
const path = require('path');

class DocGenerator {
  constructor() {
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    return {
      frontend: this.loadTemplate('frontend'),
      backend: this.loadTemplate('backend'),
      blockchain: this.loadTemplate('blockchain')
    };
  }

  generateDoc(category, title, content) {
    const template = this.templates[category];
    return template
      .replace('{{TITLE}}', title)
      .replace('{{CONTENT}}', content)
      .replace('{{DATE}}', new Date().toISOString().split('T')[0]);
  }

  saveDoc(filename, content) {
    const filepath = path.join(__dirname, '../docs', filename);
    fs.writeFileSync(filepath, content);
  }
}
```

### 2. Documentation Parser

Create a parser to extract structured data:

```javascript
// scripts/parse-docs.js
class DocParser {
  parseMetadata(content) {
    const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n## )/);
    if (!metadataMatch) return null;

    const metadata = {};
    const lines = metadataMatch[1].split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^\*\*([^:]+)\*\*: (.+)$/);
      if (match) {
        metadata[match[1].toLowerCase()] = match[2];
      }
    });

    return metadata;
  }

  parseSections(content) {
    const sections = {};
    const sectionMatches = content.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g);
    
    for (const match of sectionMatches) {
      sections[match[1].toLowerCase().replace(/\s+/g, '_')] = match[2].trim();
    }

    return sections;
  }

  parseCodeBlocks(content) {
    const codeBlocks = [];
    const codeMatches = content.matchAll(/```(\w+)\n([\s\S]*?)```/g);
    
    for (const match of codeMatches) {
      codeBlocks.push({
        language: match[1],
        code: match[2].trim()
      });
    }

    return codeBlocks;
  }
}
```

### 3. Documentation Indexer

Create an index for quick navigation:

```javascript
// scripts/index-docs.js
class DocIndexer {
  constructor() {
    this.index = {};
  }

  indexDocument(filepath, content) {
    const parser = new DocParser();
    const metadata = parser.parseMetadata(content);
    const sections = parser.parseSections(content);
    
    this.index[filepath] = {
      metadata,
      sections,
      searchable: this.extractSearchableText(content)
    };
  }

  search(query) {
    const results = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    Object.entries(this.index).forEach(([filepath, doc]) => {
      const score = this.calculateSearchScore(doc.searchable, searchTerms);
      if (score > 0) {
        results.push({ filepath, score, metadata: doc.metadata });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }
}
```

### 4. Frontend Integration

Create a React component to display documentation:

```typescript
// frontend/src/components/DocumentationViewer.tsx
interface DocViewerProps {
  category: 'frontend' | 'backend' | 'blockchain';
  title: string;
  content: string;
}

const DocumentationViewer: React.FC<DocViewerProps> = ({ category, title, content }) => {
  const parser = new DocParser();
  const metadata = parser.parseMetadata(content);
  const sections = parser.parseSections(content);
  const codeBlocks = parser.parseCodeBlocks(content);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {metadata?.category}
          </span>
          <span>v{metadata?.version}</span>
          <span>Updated: {metadata?.last_updated}</span>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        {Object.entries(sections).map(([sectionName, content]) => (
          <section key={sectionName} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <div className="text-gray-700">
              {this.renderContent(content, codeBlocks)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
```

## Usage Examples

### 1. Generate Frontend Documentation

```bash
# Generate component documentation
node scripts/generate-docs.js frontend ComponentName "Component description"
```

### 2. Parse Existing Documentation

```bash
# Parse and index all documentation
node scripts/parse-docs.js
```

### 3. Search Documentation

```bash
# Search for specific topics
node scripts/search-docs.js "react hooks"
```

### 4. Update Documentation

```bash
# Update documentation with new content
node scripts/update-docs.js frontend ComponentName
```

## Best Practices

### 1. Keep Documentation Updated
- Update docs when code changes
- Use automated tools to detect outdated docs
- Regular review cycles

### 2. Use Consistent Formatting
- Follow the templates exactly
- Use proper markdown syntax
- Include all required sections

### 3. Make Documentation Searchable
- Use descriptive titles
- Include relevant keywords
- Add proper tags

### 4. Test Documentation
- Verify code examples work
- Test links and references
- Validate markdown syntax

### 5. Version Control
- Track documentation changes
- Use semantic versioning
- Maintain changelog

## Tools and Scripts

### 1. Documentation Generator
```bash
npm run docs:generate -- --category frontend --title "Component Name"
```

### 2. Documentation Parser
```bash
npm run docs:parse -- --file path/to/doc.md
```

### 3. Documentation Search
```bash
npm run docs:search -- --query "search terms"
```

### 4. Documentation Validator
```bash
npm run docs:validate -- --file path/to/doc.md
```

This standardized format ensures consistency across all documentation and makes it easy to maintain, search, and update developer information efficiently.