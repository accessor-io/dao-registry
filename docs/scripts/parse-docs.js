#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DocParser {
  constructor() {
    this.docsDir = path.join(__dirname, '../docs');
    this.outputDir = path.join(__dirname, '../docs/parsed');
  }

  parseMetadata(content) {
    const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n## )/);
    if (!metadataMatch) return null;

    const metadata = {};
    const lines = metadataMatch[1].split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^\*\*([^:]+)\*\*: (.+)$/);
      if (match) {
        metadata[match[1].toLowerCase().replace(/\s+/g, '_')] = match[2];
      }
    });

    return metadata;
  }

  parseSections(content) {
    const sections = {};
    const sectionMatches = content.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g);
    
    for (const match of sectionMatches) {
      const sectionName = match[1].toLowerCase().replace(/\s+/g, '_');
      sections[sectionName] = match[2].trim();
    }

    return sections;
  }

  parseCodeBlocks(content) {
    const codeBlocks = [];
    const codeMatches = content.matchAll(/```(\w+)\n([\s\S]*?)```/g);
    
    for (const match of codeMatches) {
      codeBlocks.push({
        language: match[1],
        code: match[2].trim(),
        lineCount: match[2].split('\n').length
      });
    }

    return codeBlocks;
  }

  parseLinks(content) {
    const links = [];
    const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    
    for (const match of linkMatches) {
      links.push({
        text: match[1],
        url: match[2],
        isInternal: !match[2].startsWith('http')
      });
    }

    return links;
  }

  parseTags(content) {
    const tagMatch = content.match(/<!-- Tags: ([^>]+) -->/);
    if (tagMatch) {
      return tagMatch[1].split(',').map(tag => tag.trim());
    }
    return [];
  }

  parseKeywords(content) {
    const keywordMatch = content.match(/<!-- Keywords: ([^>]+) -->/);
    if (keywordMatch) {
      return keywordMatch[1].split(',').map(keyword => keyword.trim());
    }
    return [];
  }

  parseDocument(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const relativePath = path.relative(this.docsDir, filepath);
    
    return {
      filepath: relativePath,
      metadata: this.parseMetadata(content),
      sections: this.parseSections(content),
      codeBlocks: this.parseCodeBlocks(content),
      links: this.parseLinks(content),
      tags: this.parseTags(content),
      keywords: this.parseKeywords(content),
      wordCount: content.split(/\s+/).length,
      lineCount: content.split('\n').length,
      lastModified: fs.statSync(filepath).mtime
    };
  }

  parseAllDocuments() {
    const documents = [];
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        
        if (stat.isDirectory()) {
          walkDir(filepath);
        } else if (file.endsWith('.md')) {
          try {
            const parsed = this.parseDocument(filepath);
            documents.push(parsed);
            console.log(`✅ Parsed: ${parsed.filepath}`);
          } catch (error) {
            console.error(`❌ Error parsing ${filepath}:`, error.message);
          }
        }
      });
    };

    walkDir(this.docsDir);
    return documents;
  }

  generateIndex(documents) {
    const index = {
      totalDocuments: documents.length,
      categories: {},
      tags: {},
      keywords: {},
      lastUpdated: new Date().toISOString(),
      documents: documents.map(doc => ({
        filepath: doc.filepath,
        metadata: doc.metadata,
        tags: doc.tags,
        keywords: doc.keywords,
        wordCount: doc.wordCount,
        lastModified: doc.lastModified
      }))
    };

    // Group by categories
    documents.forEach(doc => {
      const category = doc.metadata?.category || 'unknown';
      if (!index.categories[category]) {
        index.categories[category] = [];
      }
      index.categories[category].push(doc.filepath);
    });

    // Group by tags
    documents.forEach(doc => {
      doc.tags.forEach(tag => {
        if (!index.tags[tag]) {
          index.tags[tag] = [];
        }
        index.tags[tag].push(doc.filepath);
      });
    });

    // Group by keywords
    documents.forEach(doc => {
      doc.keywords.forEach(keyword => {
        if (!index.keywords[keyword]) {
          index.keywords[keyword] = [];
        }
        index.keywords[keyword].push(doc.filepath);
      });
    });

    return index;
  }

  saveIndex(index) {
    const indexPath = path.join(this.outputDir, 'index.json');
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`✅ Generated index: ${indexPath}`);
  }

  generateSearchIndex(documents) {
    const searchIndex = documents.map(doc => ({
      filepath: doc.filepath,
      title: doc.metadata?.title || path.basename(doc.filepath, '.md'),
      category: doc.metadata?.category,
      tags: doc.tags,
      keywords: doc.keywords,
      content: this.extractSearchableContent(doc),
      lastModified: doc.lastModified
    }));

    const searchIndexPath = path.join(this.outputDir, 'search-index.json');
    fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2));
    console.log(`✅ Generated search index: ${searchIndexPath}`);
  }

  extractSearchableContent(doc) {
    const sections = Object.values(doc.sections).join(' ');
    const codeComments = doc.codeBlocks
      .filter(block => block.language === 'javascript' || block.language === 'typescript')
      .map(block => {
        const comments = block.code.match(/\/\/.*$/gm) || [];
        return comments.join(' ');
      })
      .join(' ');
    
    return `${sections} ${codeComments}`.toLowerCase();
  }

  generateReport(documents) {
    const report = {
      summary: {
        totalDocuments: documents.length,
        totalWords: documents.reduce((sum, doc) => sum + doc.wordCount, 0),
        totalLines: documents.reduce((sum, doc) => sum + doc.lineCount, 0),
        totalCodeBlocks: documents.reduce((sum, doc) => sum + doc.codeBlocks.length, 0),
        averageWordsPerDoc: Math.round(documents.reduce((sum, doc) => sum + doc.wordCount, 0) / documents.length)
      },
      categories: {},
      languages: {},
      mostReferenced: this.findMostReferenced(documents),
      outdated: this.findOutdatedDocuments(documents)
    };

    // Category breakdown
    documents.forEach(doc => {
      const category = doc.metadata?.category || 'unknown';
      if (!report.categories[category]) {
        report.categories[category] = { count: 0, documents: [] };
      }
      report.categories[category].count++;
      report.categories[category].documents.push(doc.filepath);
    });

    // Language breakdown
    documents.forEach(doc => {
      doc.codeBlocks.forEach(block => {
        if (!report.languages[block.language]) {
          report.languages[block.language] = 0;
        }
        report.languages[block.language]++;
      });
    });

    const reportPath = path.join(this.outputDir, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Generated report: ${reportPath}`);
  }

  findMostReferenced(documents) {
    const references = {};
    
    documents.forEach(doc => {
      doc.links.forEach(link => {
        if (link.isInternal) {
          const target = link.url.replace(/^\.\.\//, '');
          if (!references[target]) {
            references[target] = 0;
          }
          references[target]++;
        }
      });
    });

    return Object.entries(references)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));
  }

  findOutdatedDocuments(documents) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return documents
      .filter(doc => doc.lastModified < thirtyDaysAgo)
      .map(doc => ({
        filepath: doc.filepath,
        lastModified: doc.lastModified,
        daysOld: Math.floor((new Date() - doc.lastModified) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => b.daysOld - a.daysOld);
  }
}

// CLI Interface
if (require.main === module) {
  const parser = new DocParser();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node scripts/parse-docs.js [options]

Options:
  --file <filepath>     Parse specific file
  --all                 Parse all documentation files
  --index               Generate index
  --search              Generate search index
  --report              Generate analysis report
  --output <dir>        Output directory
  --help                Show this help

Examples:
  node scripts/parse-docs.js --file docs/component.md
  node scripts/parse-docs.js --all --index --search --report
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

  if (options.file) {
    const filepath = path.join(parser.docsDir, options.file);
    if (fs.existsSync(filepath)) {
      const parsed = parser.parseDocument(filepath);
      console.log(JSON.stringify(parsed, null, 2));
    } else {
      console.error(`❌ File not found: ${filepath}`);
      process.exit(1);
    }
  } else if (options.all || Object.keys(options).length === 0) {
    console.log('📖 Parsing all documentation files...');
    const documents = parser.parseAllDocuments();
    
    if (options.index || Object.keys(options).length === 0) {
      const index = parser.generateIndex(documents);
      parser.saveIndex(index);
    }
    
    if (options.search) {
      parser.generateSearchIndex(documents);
    }
    
    if (options.report) {
      parser.generateReport(documents);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total documents: ${documents.length}`);
    console.log(`   Categories: ${Object.keys(parser.generateIndex(documents).categories).length}`);
    console.log(`   Total code blocks: ${documents.reduce((sum, doc) => sum + doc.codeBlocks.length, 0)}`);
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

module.exports = DocParser;