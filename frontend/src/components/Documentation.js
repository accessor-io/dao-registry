import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Code, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Search,
  CheckCircle,
  Star,
  Package,
  Globe
} from 'lucide-react';

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    'metadata': true,
    'api': false,
    'smart-contracts': false
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
        <p className="text-blue-100">A professional DAO registry with ISO-compliant metadata management and ENS integration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold">Metadata Management</h3>
            </div>
          <p className="text-gray-600 mb-4">
            ISO 23081-2:2021 compliant metadata framework for comprehensive DAO information management.
          </p>
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Fully Implemented</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Globe className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold">ENS Integration</h3>
            </div>
          <p className="text-gray-600 mb-4">
            Reserved subdomain management and ENS metadata resolution for DAO naming.
          </p>
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Core Features Ready</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Code className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold">Smart Contracts</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Solidity contracts for DAO registration, metadata storage, and subdomain management.
          </p>
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Production Ready</span>
          </div>
        </div>
      </div>
          </div>
  );

  const renderMetadata = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Metadata Management System</h2>
        <p className="text-gray-600 mb-6">
          Our metadata system is built on ISO 23081-2:2021 standards, providing enterprise-grade 
          records management for DAO information.
        </p>
          </div>
          
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Star className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Featured Implementation</h3>
            <p className="mt-1 text-sm text-blue-700">
              This is the most sophisticated part of our system - over 2,400 lines of TypeScript 
              implementing professional metadata standards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Core Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                <strong>ISO 23081-2 Compliance:</strong> Full records management metadata framework
                    </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <strong>Agent Management:</strong> Track persons, organizations, and software agents
                  </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <strong>Business Activity Tracking:</strong> Function and business process metadata
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <strong>Mandate Compliance:</strong> Legal and policy framework support
      </div>
              </li>
            </ul>
          </div>
          
          <div>
          <h3 className="text-lg font-semibold mb-4">Technical Implementation</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Package className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <strong>Schema Registry:</strong> Version-controlled metadata schemas
              </div>
              </li>
            <li className="flex items-start">
              <Package className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <strong>Controlled Vocabularies:</strong> Standardized terminology management
              </div>
              </li>
            <li className="flex items-start">
              <Package className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <strong>Cross-referencing:</strong> Entity relationship resolution
              </div>
              </li>
            <li className="flex items-start">
              <Package className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <strong>URL Encoding:</strong> Safe subdomain name generation
              </div>
              </li>
            </ul>
        </div>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h2>
        <p className="text-gray-600 mb-6">
          RESTful API endpoints for DAO management and metadata operations.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium">Core Endpoints</h3>
          </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</code>
                <span className="ml-3 font-mono">/api/daos</span>
              </div>
              <span className="text-gray-500">List all DAOs</span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</code>
                <span className="ml-3 font-mono">/api/daos/:id</span>
              </div>
              <span className="text-gray-500">Get DAO details</span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</code>
                <span className="ml-3 font-mono">/api/daos</span>
              </div>
              <span className="text-gray-500">Register new DAO</span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</code>
                <span className="ml-3 font-mono">/api/reserved-subdomains</span>
              </div>
              <span className="text-gray-500">Check subdomain availability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
          <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Contracts</h2>
        <p className="text-gray-600 mb-6">
          Solidity contracts deployed on Ethereum for decentralized DAO registry management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">DAORegistry.sol</h3>
          <p className="text-gray-600 mb-4">
            Main registry contract for DAO registration and management.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Functions:</span>
              <span className="font-mono">registerDAO(), getDAO(), updateDAO()</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Events:</span>
              <span className="font-mono">DAORegistered, DAOUpdated</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">ReservedSubdomains.sol</h3>
          <p className="text-gray-600 mb-4">
            Manages reserved ENS subdomains for DAO naming.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Functions:</span>
              <span className="font-mono">isReserved(), reserveSubdomain()</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Events:</span>
              <span className="font-mono">SubdomainReserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'metadata', label: 'Metadata System', icon: Database },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'contracts', label: 'Smart Contracts', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

      {/* Tab Content */}
          <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
            {activeTab === 'metadata' && renderMetadata()}
            {activeTab === 'api' && renderAPI()}
            {activeTab === 'contracts' && renderContracts()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 