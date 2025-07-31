import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Code, 
  FileText, 
  Search, 
  Tag, 
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle
} from 'lucide-react';

const DocumentationViewer = ({ category, title, content, parsedData }) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['quick_reference', 'implementation']));
  const [copiedCode, setCopiedCode] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Parse content if not already parsed
  const data = parsedData || parseDocumentContent(content);

  const toggleSection = (sectionName) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const copyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(prev => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedCode(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const renderCodeBlock = (block, index) => {
    const isCopied = copiedCode.has(index);
    
    return (
      <div key={index} className="bg-gray-900 rounded-lg overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
          <span className="text-sm text-gray-300 font-mono">{block.language}</span>
          <button
            onClick={() => copyCode(block.code, index)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-gray-100 overflow-x-auto">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  };

  const renderSection = (sectionName, content) => {
    const isExpanded = expandedSections.has(sectionName);
    const displayName = sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <div key={sectionName} className="border border-gray-200 rounded-lg mb-4">
        <button
          onClick={() => toggleSection(sectionName)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {getSectionIcon(sectionName)}
            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              {renderContent(content)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getSectionIcon = (sectionName) => {
    const icons = {
      quick_reference: <BookOpen className="w-5 h-5 text-blue-600" />,
      implementation: <Code className="w-5 h-5 text-green-600" />,
      examples: <FileText className="w-5 h-5 text-purple-600" />,
      testing: <CheckCircle className="w-5 h-5 text-orange-600" />,
      troubleshooting: <Search className="w-5 h-5 text-red-600" />,
      related: <ExternalLink className="w-5 h-5 text-indigo-600" />
    };
    return icons[sectionName] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const renderContent = (content) => {
    // Extract code blocks
    const codeBlocks = [];
    const codeMatches = content.matchAll(/```(\w+)\n([\s\S]*?)```/g);
    
    for (const match of codeMatches) {
      codeBlocks.push({
        language: match[1],
        code: match[2].trim()
      });
    }

    // Replace code blocks with placeholders
    let processedContent = content;
    codeBlocks.forEach((block, index) => {
      processedContent = processedContent.replace(
        /```(\w+)\n([\s\S]*?)```/,
        `__CODE_BLOCK_${index}__`
      );
    });

    // Split content into paragraphs
    const paragraphs = processedContent.split('\n\n');

    return (
      <div>
        {paragraphs.map((paragraph, index) => {
          if (paragraph.startsWith('__CODE_BLOCK_')) {
            const blockIndex = parseInt(paragraph.match(/__CODE_BLOCK_(\d+)__/)[1]);
            return renderCodeBlock(codeBlocks[blockIndex], blockIndex);
          }
          
          return (
            <p key={index} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredSections = Object.entries(data.sections).filter(([sectionName, content]) => {
    if (!searchTerm) return true;
    return content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           sectionName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {data.metadata?.category || category}
              </span>
              {data.metadata?.version && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  v{data.metadata.version}
                </span>
              )}
              {data.metadata?.last_updated && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {new Date(data.metadata.last_updated).toLocaleDateString()}</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {data.metadata?.priority && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.metadata.priority === 'high' ? 'bg-red-100 text-red-800' :
                data.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {data.metadata.priority} priority
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </header>

      {/* Tags and Keywords */}
      {(data.tags.length > 0 || data.keywords.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {data.tags.map((tag, index) => (
            <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </span>
          ))}
          {data.keywords.map((keyword, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{data.wordCount}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{data.lineCount}</div>
          <div className="text-sm text-gray-600">Lines</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{data.codeBlocks.length}</div>
          <div className="text-sm text-gray-600">Code Blocks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{data.links.length}</div>
          <div className="text-sm text-gray-600">Links</div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map(([sectionName, content]) => 
          renderSection(sectionName, content)
        )}
      </div>

      {/* Links */}
      {data.links.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target={link.isInternal ? undefined : "_blank"}
                rel={link.isInternal ? undefined : "noopener noreferrer"}
                className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600 hover:text-blue-800">{link.text}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to parse document content
const parseDocumentContent = (content) => {
  // This is a simplified parser - in production, you'd use the full DocParser class
  const sections = {};
  const sectionMatches = content.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g);
  
  for (const match of sectionMatches) {
    const sectionName = match[1].toLowerCase().replace(/\s+/g, '_');
    sections[sectionName] = match[2].trim();
  }

  const metadata = {};
  const metadataMatch = content.match(/## Metadata\n([\s\S]*?)(?=\n## )/);
  if (metadataMatch) {
    const lines = metadataMatch[1].split('\n');
    lines.forEach(line => {
      const match = line.match(/^\*\*([^:]+)\*\*: (.+)$/);
      if (match) {
        metadata[match[1].toLowerCase().replace(/\s+/g, '_')] = match[2];
      }
    });
  }

  const codeBlocks = [];
  const codeMatches = content.matchAll(/```(\w+)\n([\s\S]*?)```/g);
  for (const match of codeMatches) {
    codeBlocks.push({
      language: match[1],
      code: match[2].trim()
    });
  }

  const links = [];
  const linkMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    links.push({
      text: match[1],
      url: match[2],
      isInternal: !match[2].startsWith('http')
    });
  }

  const tags = [];
  const tagMatch = content.match(/<!-- Tags: ([^>]+) -->/);
  if (tagMatch) {
    tags.push(...tagMatch[1].split(',').map(tag => tag.trim()));
  }

  const keywords = [];
  const keywordMatch = content.match(/<!-- Keywords: ([^>]+) -->/);
  if (keywordMatch) {
    keywords.push(...keywordMatch[1].split(',').map(keyword => keyword.trim()));
  }

  return {
    metadata,
    sections,
    codeBlocks,
    links,
    tags,
    keywords,
    wordCount: content.split(/\s+/).length,
    lineCount: content.split('\n').length
  };
};

export default DocumentationViewer;