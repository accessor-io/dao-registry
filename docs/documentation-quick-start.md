# Documentation Quick Start Guide

## Overview

This guide shows you how to use the streamlined documentation system for the DAO Registry project. The system provides standardized templates, automated generation, parsing, and search capabilities.

## Quick Commands

### Generate Documentation

```bash
# Generate a single document
npm run docs:generate -- --category frontend --title "My Component"

# Generate from configuration file
npm run docs:from-config

# Generate all documentation
npm run docs:all
```

### Parse and Index Documentation

```bash
# Parse all documentation files
npm run docs:parse-all

# Parse specific file
node scripts/parse-docs.js --file docs/my-component.md

# Generate search index
node scripts/parse-docs.js --search
```

### Search Documentation

```bash
# Search for specific terms
node scripts/search-docs.js "react hooks"

# Search by category
node scripts/search-docs.js --category frontend

# Search by tags
node scripts/search-docs.js --tags "components,ui"
```

## Standardized Format

All documentation follows this standardized format:

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

## Category-Specific Templates

### Frontend Documentation
- **Props Interface**: TypeScript interface definitions
- **Usage Examples**: JSX code examples
- **Styling**: CSS classes and Tailwind utilities
- **State Management**: React hooks and state patterns
- **Testing**: Component test examples

### Backend Documentation
- **API Endpoint**: HTTP method and path
- **Request/Response Schema**: TypeScript interfaces
- **Implementation**: Service logic details
- **Error Handling**: Error codes and messages
- **Testing**: API test examples

### Blockchain Documentation
- **Contract Interface**: Solidity interface definitions
- **Deployment**: Deployment instructions
- **Testing**: Contract test examples
- **Gas Optimization**: Gas usage tips

## Using the Documentation Viewer

The `DocumentationViewer` component provides an interactive interface for viewing parsed documentation:

```jsx
import DocumentationViewer from './components/DocumentationViewer';

// Basic usage
<DocumentationViewer 
  category="frontend"
  title="My Component"
  content={markdownContent}
/>

// With pre-parsed data
<DocumentationViewer 
  category="frontend"
  title="My Component"
  parsedData={parsedDocumentData}
/>
```

## Features

### 1. Automated Generation
- Generate documentation from templates
- Support for multiple categories
- Configurable content options
- Batch generation from config files

### 2. Smart Parsing
- Extract metadata automatically
- Parse code blocks with syntax highlighting
- Extract links and references
- Generate searchable content

### 3. Advanced Search
- Full-text search across all documentation
- Search by category, tags, or keywords
- Fuzzy matching for better results
- Search result ranking

### 4. Interactive Viewer
- Collapsible sections
- Code block copying
- Search within documents
- Statistics and analytics
- Related links display

### 5. Validation
- Check for required sections
- Validate markdown syntax
- Verify links and references
- Ensure proper formatting

## Configuration

The `docs-config.json` file defines the documentation structure:

```json
{
  "project": {
    "name": "DAO Registry",
    "version": "1.0.0"
  },
  "docs": [
    {
      "category": "frontend",
      "title": "Component Name",
      "filename": "component-name.md",
      "options": {
        "quickReference": "One-line description",
        "implementation": "Detailed implementation",
        "examples": "Code examples",
        "testing": "Test examples"
      }
    }
  ]
}
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

## Examples

### Generate Frontend Component Documentation

```bash
npm run docs:generate -- \
  --category frontend \
  --title "Button Component" \
  --quick-ref "Reusable button component with variants" \
  --implementation "The Button component supports multiple variants including primary, secondary, and outline styles. It includes proper accessibility attributes and supports loading states." \
  --examples "```jsx\n<Button variant=\"primary\">Click me</Button>\n```"
```

### Parse and Search

```bash
# Parse all documentation
npm run docs:parse-all

# Search for React components
node scripts/search-docs.js "react component"

# Search for blockchain topics
node scripts/search-docs.js --category blockchain
```

### View Documentation

```jsx
import DocumentationViewer from './components/DocumentationViewer';

function App() {
  return (
    <DocumentationViewer 
      category="frontend"
      title="Button Component"
      content={buttonComponentDoc}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Generation fails**: Check template syntax and required fields
2. **Parsing errors**: Verify markdown format and section headers
3. **Search not working**: Ensure documentation is properly indexed
4. **Viewer not rendering**: Check component props and content format

### Debug Commands

```bash
# Validate documentation format
npm run docs:validate

# Check parsing results
node scripts/parse-docs.js --file docs/my-doc.md

# Test search functionality
node scripts/search-docs.js "test query"
```

This streamlined system makes it easy to maintain consistent, searchable, and interactive documentation for your DAO Registry project.