import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Code, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown,
  Search,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Zap,
  GitBranch,
  Layers,
  Book,
  Archive,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    'getting-started': true,
    'user-guide': false,
    'developer-manual': false,
    'architecture': false,
    'specifications': false,
    'research': false,
    'technical-references': false,
    'operations': false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">DAO Registry Documentation</h1>
        <p className="text-blue-100">Comprehensive documentation for the decentralized DAO registry with ENS integration and advanced Ethereum features.</p>
      </div>

      {/* Documentation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">48</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Book className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">500KB</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-600" />
          <span>Quick Navigation</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>For New Users</span>
            </h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Start with README.md</li>
              <li>• Read User Guide</li>
              <li>• Follow Quick Start</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>For Developers</span>
            </h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Read Developer Manual</li>
              <li>• Check Quick Reference</li>
              <li>• Review API Reference</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>For Architects</span>
            </h3>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Study System Overview</li>
              <li>• Review Architecture</li>
              <li>• Understand Schema Flow</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>For Spec Writers</span>
            </h3>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Review RFC-001</li>
              <li>• Study RFC-002</li>
              <li>• Follow RFC-003</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900 mb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>For Researchers</span>
            </h3>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Read Ethereum Research</li>
              <li>• Study Governance Research</li>
              <li>• Review Analytics</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>For Operators</span>
            </h3>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Follow Deployment Guide</li>
              <li>• Implement Security</li>
              <li>• Set up Monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documentation Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>Documentation Categories</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'User Documentation', count: 3, icon: Users, color: 'blue' },
            { name: 'Developer Documentation', count: 4, icon: Code, color: 'green' },
            { name: 'Architecture', count: 5, icon: Layers, color: 'purple' },
            { name: 'RFC Documents', count: 4, icon: FileText, color: 'orange' },
            { name: 'Specifications', count: 4, icon: Settings, color: 'indigo' },
            { name: 'Integration', count: 2, icon: GitBranch, color: 'pink' },
            { name: 'Features', count: 1, icon: Zap, color: 'yellow' },
            { name: 'Research', count: 4, icon: TrendingUp, color: 'red' },
            { name: 'Technical References', count: 5, icon: Database, color: 'gray' },
            { name: 'Technical Documentation', count: 2, icon: Code, color: 'teal' },
            { name: 'Strategy', count: 1, icon: Star, color: 'amber' },
            { name: 'Appendices', count: 9, icon: Archive, color: 'slate' }
          ].map((category, index) => {
            const Icon = category.icon;
            return (
              <div key={index} className={`bg-${category.color}-50 p-4 rounded-lg border border-${category.color}-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 text-${category.color}-600`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.count} files</p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold text-${category.color}-600`}>{category.count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documentation Standards */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Documentation Standards</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Format Standards</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Consistent structure across all documents</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Metadata requirements and versioning</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Code block formatting standards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Link standards and validation</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quality Assurance</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automated format checking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Link validation and testing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Content review and accuracy</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>User feedback integration</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserGuide = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">User Guide</h1>
        <p className="text-blue-100">Learn how to discover, analyze, and interact with DAOs across multiple blockchain networks.</p>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection('getting-started')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Getting Started</h2>
          </div>
          {expandedSections['getting-started'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['getting-started'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Platform Overview</h3>
              <p className="text-blue-800">The DAO Registry features three main sections:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                <li><strong>Search DAOs:</strong> Find and filter DAOs across different networks</li>
                <li><strong>DAO Details:</strong> Comprehensive information about individual DAOs</li>
                <li><strong>Registry Stats:</strong> Analytics and insights about the ecosystem</li>
              </ul>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">For DAO Researchers</h4>
                <ul className="text-green-800 space-y-1 text-sm">
                  <li>• Use multiple filters to find specific DAOs</li>
                  <li>• Check verification status for reliability</li>
                  <li>• Review governance details before participation</li>
                  <li>• Monitor activity levels for engagement</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">For DAO Participants</h4>
                <ul className="text-purple-800 space-y-1 text-sm">
                  <li>• Verify contract addresses before interactions</li>
                  <li>• Understand governance mechanisms before voting</li>
                  <li>• Check participation requirements</li>
                  <li>• Review proposal history for context</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Searching for DAOs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection('searching')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Searching for DAOs</h2>
          </div>
          {expandedSections['searching'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['searching'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Search Features</h3>
              <ul className="text-green-800 space-y-2">
                <li><strong>Text Search:</strong> Search by DAO name, description, or keywords</li>
                <li><strong>Network Filter:</strong> Filter by blockchain network (Ethereum, Polygon, etc.)</li>
                <li><strong>Governance Type:</strong> Filter by governance mechanism</li>
                <li><strong>Status Filter:</strong> Filter by verification status</li>
                <li><strong>Activity Level:</strong> Filter by recent activity</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Advanced Filters</h3>
              <div className="grid md:grid-cols-2 gap-4 text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Governance Types</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Token-Weighted Voting</li>
                    <li>• Quadratic Voting</li>
                    <li>• Reputation-Based</li>
                    <li>• Liquid Democracy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Networks</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Ethereum Mainnet</li>
                    <li>• Polygon</li>
                    <li>• Arbitrum</li>
                    <li>• Optimism</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewing DAO Details */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection('dao-details')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Viewing DAO Details</h2>
          </div>
          {expandedSections['dao-details'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['dao-details'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">DAO Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-purple-800">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <ul className="text-sm space-y-1">
                    <li>• DAO name and symbol</li>
                    <li>• Description and mission</li>
                    <li>• Contract addresses</li>
                    <li>• Network information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Governance Details</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Governance type</li>
                    <li>• Voting mechanisms</li>
                    <li>• Proposal requirements</li>
                    <li>• Quorum settings</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Activity Metrics</h3>
              <ul className="text-orange-800 space-y-2">
                <li><strong>Member Count:</strong> Total number of token holders</li>
                <li><strong>Proposal Activity:</strong> Recent proposals and votes</li>
                <li><strong>Treasury Value:</strong> Total assets under management</li>
                <li><strong>Participation Rate:</strong> Voting participation metrics</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Registry Statistics */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection('statistics')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Registry Statistics</h2>
          </div>
          {expandedSections['statistics'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['statistics'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">Analytics Dashboard</h3>
              <div className="grid md:grid-cols-2 gap-4 text-indigo-800">
                <div>
                  <h4 className="font-medium mb-2">Network Distribution</h4>
                  <ul className="text-sm space-y-1">
                    <li>• DAOs by blockchain network</li>
                    <li>• Total value locked per network</li>
                    <li>• Activity levels by network</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Governance Trends</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Popular governance types</li>
                    <li>• Average participation rates</li>
                    <li>• Proposal success rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection('troubleshooting')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold">Troubleshooting</h2>
          </div>
          {expandedSections['troubleshooting'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['troubleshooting'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Common Issues</h3>
              <div className="space-y-3 text-red-800">
                <div>
                  <h4 className="font-medium">Search Not Working</h4>
                  <p className="text-sm">Try clearing your browser cache or using different search terms.</p>
                </div>
                <div>
                  <h4 className="font-medium">DAO Details Not Loading</h4>
                  <p className="text-sm">Check your internet connection and try refreshing the page.</p>
                </div>
                <div>
                  <h4 className="font-medium">Wallet Connection Issues</h4>
                  <p className="text-sm">Ensure MetaMask is installed and connected to the correct network.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeveloperGuide = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Developer Manual</h1>
        <p className="text-green-100">Complete guide for developers integrating with the DAO Registry platform.</p>
      </div>

      {/* Architecture Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Architecture Overview</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Technology Stack</h3>
            <ul className="text-blue-800 space-y-2">
              <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS</li>
              <li><strong>Backend:</strong> Node.js, Express.js, TypeScript</li>
              <li><strong>Blockchain:</strong> Solidity, Hardhat, ethers.js</li>
              <li><strong>Database:</strong> PostgreSQL, Redis, MongoDB</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Key Components</h3>
            <ul className="text-green-800 space-y-2">
              <li><strong>DAO Registry Contract:</strong> Smart contract for DAO registration</li>
              <li><strong>ENS Integration:</strong> Ethereum Name Service integration</li>
              <li><strong>API Gateway:</strong> RESTful API for data access</li>
              <li><strong>Analytics Engine:</strong> Research-driven analytics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Development Setup */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-green-600" />
          <span>Development Setup</span>
        </h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Prerequisites</h3>
            <ul className="text-gray-700 space-y-1">
              <li>• Node.js 18+</li>
              <li>• PostgreSQL 13+</li>
              <li>• Redis 6+</li>
              <li>• MetaMask or Web3 wallet</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Installation</h3>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`# Clone repository
git clone https://github.com/your-org/dao-registry.git
cd dao-registry

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev          # Backend (port 3000)
cd frontend && npm start  # Frontend (port 3001)`}
            </pre>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-purple-600" />
          <span>API Documentation</span>
        </h2>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Base URL</h3>
            <code className="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm">
              http://localhost:3000/api/v1
            </code>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">DAO Endpoints</h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li><code>GET /daos</code> - List all DAOs</li>
                <li><code>GET /daos/{'{id}'}</code> - Get DAO details</li>
                <li><code>POST /daos</code> - Create DAO</li>
                <li><code>PUT /daos/{'{id}'}</code> - Update DAO</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Search Endpoints</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li><code>GET /search</code> - Search DAOs</li>
                <li><code>GET /stats</code> - Get statistics</li>
                <li><code>GET /networks</code> - List networks</li>
                <li><code>GET /governance-types</code> - List types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Contract Development */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-600" />
          <span>Smart Contract Development</span>
        </h2>
        
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">Contract Overview</h3>
            <ul className="text-orange-800 space-y-2">
              <li><strong>DAORegistry.sol:</strong> Main registry contract</li>
              <li><strong>DataRegistry.sol:</strong> Data storage contract</li>
              <li><strong>ReservedSubdomains.sol:</strong> ENS subdomain management</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Development Commands</h3>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickReference = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Quick Reference</h1>
        <p className="text-purple-100">Essential commands, endpoints, and information for quick access.</p>
      </div>

      {/* Development Commands */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span>Development Commands</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Setup & Development</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm install</code>
                <p className="text-xs text-gray-600 mt-1">Install dependencies</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run dev</code>
                <p className="text-xs text-gray-600 mt-1">Start backend server</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">cd frontend && npm start</code>
                <p className="text-xs text-gray-600 mt-1">Start frontend server</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm test</code>
                <p className="text-xs text-gray-600 mt-1">Run tests</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run docs:complete</code>
                <p className="text-xs text-gray-600 mt-1">Generate complete docs</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run docs:parse-all</code>
                <p className="text-xs text-gray-600 mt-1">Parse all documentation</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run docs:from-config</code>
                <p className="text-xs text-gray-600 mt-1">Generate from config</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Quick Reference */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-green-600" />
          <span>API Quick Reference</span>
        </h2>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Authentication</h3>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`Authorization: Bearer <your-token>
Content-Type: application/json`}
            </pre>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Common Endpoints</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li><code>GET /api/v1/daos</code> - List DAOs</li>
                <li><code>GET /api/v1/daos/{'{id}'}</code> - Get DAO</li>
                <li><code>POST /api/v1/daos</code> - Create DAO</li>
                <li><code>GET /api/v1/search</code> - Search DAOs</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Error Codes</h3>
              <ul className="text-purple-800 text-sm space-y-1">
                <li><code>400</code> - Bad Request</li>
                <li><code>401</code> - Unauthorized</li>
                <li><code>404</code> - Not Found</li>
                <li><code>500</code> - Server Error</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Database Operations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Archive className="w-5 h-5 text-orange-600" />
          <span>Database Operations</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">PostgreSQL</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">createdb dao_registry_dev</code>
                <p className="text-xs text-gray-600 mt-1">Create database</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run migrate</code>
                <p className="text-xs text-gray-600 mt-1">Run migrations</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">npm run db:seed</code>
                <p className="text-xs text-gray-600 mt-1">Seed data</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Redis</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">redis-server</code>
                <p className="text-xs text-gray-600 mt-1">Start Redis server</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm">redis-cli</code>
                <p className="text-xs text-gray-600 mt-1">Redis CLI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'user-guide', label: 'User Guide', icon: Users },
              { id: 'developer-manual', label: 'Developer Manual', icon: Code },
              { id: 'quick-reference', label: 'Quick Reference', icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'user-guide' && renderUserGuide()}
        {activeTab === 'developer-manual' && renderDeveloperGuide()}
        {activeTab === 'quick-reference' && renderQuickReference()}
      </div>
    </div>
  );
};

export default Documentation; 