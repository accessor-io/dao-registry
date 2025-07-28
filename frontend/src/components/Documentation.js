import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Code, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown,
  Search,
  Filter,
  BarChart3,
  Globe,
  Database,
  Activity,
  Award,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('user-guide');
  const [expandedSections, setExpandedSections] = useState({
    'getting-started': true,
    'searching': false,
    'dao-details': false,
    'statistics': false,
    'troubleshooting': false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderUserGuide = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">DAO Registry User Guide</h1>
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
              <h3 className="font-semibold text-green-900 mb-2">Basic Search</h3>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li>Navigate to the Search page (default landing page)</li>
                <li>Enter search terms in the search bar:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>DAO name or symbol</li>
                    <li>Description keywords</li>
                    <li>Governance type</li>
                    <li>Tags or categories</li>
                  </ul>
                </li>
                <li>View results as you type (minimum 2 characters required)</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Advanced Filtering</h3>
              <p className="text-blue-800 mb-3">Click the "Filters" button to access advanced search options:</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900">Chain Filter</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Ethereum</li>
                    <li>• Polygon</li>
                    <li>• Arbitrum</li>
                    <li>• Optimism</li>
                    <li>• Base</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Status Filter</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Active</li>
                    <li>• Pending</li>
                    <li>• Suspended</li>
                    <li>• Inactive</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Verification Filter</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Verified</li>
                    <li>• Unverified</li>
                    <li>• All</li>
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
              <h3 className="font-semibold text-purple-900 mb-2">DAO Information Sections</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Header Section</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• DAO Name and symbol</li>
                    <li>• Network (blockchain)</li>
                    <li>• Verification status</li>
                    <li>• Current operational status</li>
                    <li>• Website link</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Statistics Overview</h4>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Total members</li>
                    <li>• Total proposals</li>
                    <li>• Active proposals</li>
                    <li>• Participation rate</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Governance Details</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• <strong>Governance Type:</strong> Token-based, reputation-based, etc.</li>
                <li>• <strong>Voting Power:</strong> How voting power is distributed</li>
                <li>• <strong>Quorum:</strong> Minimum votes required for approval</li>
                <li>• <strong>Execution Delay:</strong> Time delay before proposal execution</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Technical Information</h3>
              <ul className="text-green-800 space-y-1">
                <li>• <strong>Contract Address:</strong> Main governance contract</li>
                <li>• <strong>Blockchain:</strong> Network where DAO is deployed</li>
                <li>• <strong>Registration Date:</strong> When DAO was registered</li>
                <li>• <strong>Last Updated:</strong> Most recent data update</li>
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
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Understanding Registry Statistics</h2>
          </div>
          {expandedSections['statistics'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {expandedSections['statistics'] && (
          <div className="px-4 pb-4 space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">Key Metrics Explained</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">Overview Statistics</h4>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• <strong>Total DAOs:</strong> Number of registered DAOs</li>
                    <li>• <strong>Total Members:</strong> Combined member count</li>
                    <li>• <strong>Total Proposals:</strong> Historical proposal count</li>
                    <li>• <strong>Verified DAOs:</strong> Percentage of audited DAOs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 mb-2">Growth Metrics</h4>
                  <ul className="text-orange-800 text-sm space-y-1">
                    <li>• <strong>DAO Growth Rate:</strong> New DAOs added</li>
                    <li>• <strong>Member Growth Rate:</strong> New members</li>
                    <li>• <strong>Proposal Growth Rate:</strong> New proposals</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Time Ranges</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Short-term Analysis</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <strong>24 Hours:</strong> Recent activity and trends</li>
                    <li>• <strong>7 Days:</strong> Weekly patterns and growth</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Long-term Analysis</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <strong>30 Days:</strong> Monthly performance analysis</li>
                    <li>• <strong>90 Days:</strong> Quarterly trends and insights</li>
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
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-900">Search Not Working</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• Check internet connection</li>
                    <li>• Try different search terms</li>
                    <li>• Clear browser cache</li>
                    <li>• Refresh the page</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-900">Data Not Loading</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• Check blockchain network status</li>
                    <li>• Verify API connectivity</li>
                    <li>• Try refreshing the page</li>
                    <li>• Contact support if persistent</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-900">Slow Performance</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• Check your internet speed</li>
                    <li>• Close unnecessary browser tabs</li>
                    <li>• Try a different browser</li>
                    <li>• Clear browser cache</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Getting Help</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Support Channels</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Documentation (this guide)</li>
                    <li>• GitHub Issues</li>
                    <li>• Discord Community</li>
                    <li>• Email Support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">When Reporting Issues</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Browser and version</li>
                    <li>• Operating system</li>
                    <li>• Steps to reproduce</li>
                    <li>• Expected vs actual behavior</li>
                    <li>• Screenshots if applicable</li>
                  </ul>
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
        <p className="text-green-100">Comprehensive guide for developers to understand, contribute to, and integrate with the DAO Registry platform.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-green-600" />
            Quick Start
          </h2>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm">Prerequisites</h3>
              <ul className="text-sm text-gray-700 mt-1 space-y-1">
                <li>• Node.js (v18 or higher)</li>
                <li>• npm or yarn</li>
                <li>• Git</li>
                <li>• PostgreSQL (v13 or higher)</li>
                <li>• Redis (v6 or higher)</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-blue-900">Installation</h3>
              <code className="text-xs text-blue-800 block mt-1">
                git clone https://github.com/your-org/dao-registry.git<br/>
                cd dao-registry<br/>
                npm install<br/>
                cd frontend && npm install
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            API Reference
          </h2>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-blue-900">Base URL</h3>
              <code className="text-xs text-blue-800 block mt-1">
                https://api.dao-registry.com/v1
              </code>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-green-900">Key Endpoints</h3>
              <ul className="text-xs text-green-800 mt-1 space-y-1">
                <li>• GET /daos - List all DAOs</li>
                <li>• GET /daos/{id} - Get specific DAO</li>
                <li>• GET /stats - Registry statistics</li>
                <li>• GET /health - API health check</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Development Workflow
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-semibold text-purple-900 mb-2">Frontend</h3>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• React 18 + TypeScript</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Lucide React for icons</li>
              <li>• Axios for API calls</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Backend</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Node.js + Express.js</li>
              <li>• TypeScript for type safety</li>
              <li>• Zod for validation</li>
              <li>• PostgreSQL + Redis</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold text-green-900 mb-2">Blockchain</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Solidity for contracts</li>
              <li>• Hardhat for development</li>
              <li>• ethers.js for integration</li>
              <li>• Multi-chain support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-orange-600" />
          Contributing
        </h2>
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded">
            <h3 className="font-semibold text-orange-900 mb-2">Development Workflow</h3>
            <ol className="text-orange-800 text-sm space-y-1">
              <li>1. Fork the repository</li>
              <li>2. Create a feature branch</li>
              <li>3. Make your changes</li>
              <li>4. Write tests for new functionality</li>
              <li>5. Update documentation as needed</li>
              <li>6. Run tests and linting</li>
              <li>7. Commit your changes</li>
              <li>8. Create a pull request</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Code Standards</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Use ESLint and Prettier</li>
              <li>• Follow Airbnb style guide</li>
              <li>• Use TypeScript for type safety</li>
              <li>• Write JSDoc comments</li>
              <li>• Use Conventional Commits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickReference = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Quick Reference</h1>
        <p className="text-purple-100">Common commands, API endpoints, and troubleshooting steps for developers and users.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-purple-600" />
            Development Commands
          </h2>
          <div className="space-y-3">
            <div className="bg-purple-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-purple-900">Frontend</h3>
              <code className="text-xs text-purple-800 block mt-1">
                cd frontend && npm start<br/>
                cd frontend && npm run build<br/>
                cd frontend && npm test
              </code>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-blue-900">Backend</h3>
              <code className="text-xs text-blue-800 block mt-1">
                npm run dev<br/>
                npm test<br/>
                npm run lint
              </code>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-green-900">Contracts</h3>
              <code className="text-xs text-green-800 block mt-1">
                npx hardhat compile<br/>
                npx hardhat test<br/>
                npx hardhat run scripts/deploy.js
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            API Endpoints
          </h2>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-green-900">Base URL</h3>
              <code className="text-xs text-green-800 block mt-1">
                http://localhost:3000/api/v1
              </code>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-blue-900">Common Endpoints</h3>
              <ul className="text-xs text-blue-800 mt-1 space-y-1">
                <li>• GET /daos - List all DAOs</li>
                <li>• GET /daos/{id} - Get specific DAO</li>
                <li>• GET /stats - Registry statistics</li>
                <li>• GET /health - API health check</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-red-600" />
          Troubleshooting
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-semibold text-red-900 mb-2">Port Conflicts</h3>
            <code className="text-xs text-red-800 block mt-1">
              lsof -ti:3000<br/>
              kill -9 $(lsof -ti:3000)<br/>
              PORT=3001 npm start
            </code>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <h3 className="font-semibold text-orange-900 mb-2">Build Issues</h3>
            <code className="text-xs text-orange-800 block mt-1">
              rm -rf node_modules<br/>
              npm install<br/>
              npm run build -- --reset-cache
            </code>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/your-org/dao-registry"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('user-guide')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'user-guide'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Guide
            </button>
            <button
              onClick={() => setActiveTab('developer-guide')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'developer-guide'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Developer Manual
            </button>
            <button
              onClick={() => setActiveTab('quick-reference')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'quick-reference'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              Quick Reference
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'user-guide' && renderUserGuide()}
          {activeTab === 'developer-guide' && renderDeveloperGuide()}
          {activeTab === 'quick-reference' && renderQuickReference()}
        </div>
      </div>
    </div>
  );
};

export default Documentation; 