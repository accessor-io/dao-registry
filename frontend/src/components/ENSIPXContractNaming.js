import React, { useState } from 'react';
import { 
  Shield, 
  Code, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Zap, 
  Lock, 
  Copy, 
  Award,
  Layers,
  Database,
  Info
} from 'lucide-react';
import useENSIPX from '../hooks/useENSIPX';
import { useContractNaming, useENSDomainNaming, useDAOStructureNaming } from '../hooks/useNamingStandards';

const ENSIPXContractNaming = () => {
  const {
    loading,
    error,
    data,
    registerCompleteDAO,
    generateAndValidateStructure,
    validateInput,
    clearError
  } = useENSIPX();

  // NIEM-Inspired Naming Standards hooks
  const contractNaming = useContractNaming();
  const ensNaming = useENSDomainNaming();
  const daoNames = useDAOStructureNaming();

  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ens: '',
    license: 'MIT',
    authors: [],
    url: '',
    avatar: '',
    keywords: ['DAO', 'Governance', 'Web3'],
    socialLinks: {
      twitter: '',
      github: ''
    },
    contracts: ['governance', 'treasury', 'token', 'voting'],
    metadata: {}
  });
  const [generatedStructure, setGeneratedStructure] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [complianceStatus, setComplianceStatus] = useState(null);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle contract type selection
  const handleContractTypeChange = (contractType, checked) => {
    setFormData(prev => ({
      ...prev,
      contracts: checked 
        ? [...prev.contracts, contractType]
        : prev.contracts.filter(type => type !== contractType)
    }));
  };

  // Handle author addition
  const handleAddAuthor = () => {
    const author = prompt('Enter author name:');
    if (author) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, author]
      }));
    }
  };

  // Handle keyword addition
  const handleAddKeyword = () => {
    const keyword = prompt('Enter keyword:');
    if (keyword) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  // Generate complete structure
  const handleGenerateStructure = async () => {
    try {
      const validation = validateInput('dao', formData);
      if (!validation.isValid) {
        alert(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      const result = await generateAndValidateStructure(formData);
      setGeneratedStructure(result.structure);
      setComplianceStatus(result.compliance);
    } catch (err) {
      alert(`Failed to generate structure: ${err.message}`);
    }
  };

  // Register DAO
  const handleRegisterDAO = async () => {
    try {
      const validation = validateInput('dao', formData);
      if (!validation.isValid) {
        alert(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      const result = await registerCompleteDAO(formData);
      alert(`DAO registered successfully! ID: ${result.result.dao.id}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        ens: '',
        license: 'MIT',
        authors: [],
        url: '',
        avatar: '',
        keywords: ['DAO', 'Governance', 'Web3'],
        socialLinks: {
          twitter: '',
          github: ''
        },
        contracts: ['governance', 'treasury', 'token', 'voting'],
        metadata: {}
      });
      setGeneratedStructure(null);
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'register', label: 'Register DAO', icon: Shield },
    { id: 'structure', label: 'Generated Structure', icon: Layers },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'standards', label: 'ENSIP-X Standards', icon: Award },
    { id: 'naming', label: 'NIEM Naming Standards', icon: Database }
  ];

  const contractTypes = [
    { id: 'governance', label: 'Governance', description: 'Voting and proposal management' },
    { id: 'treasury', label: 'Treasury', description: 'Fund management and distribution' },
    { id: 'token', label: 'Token', description: 'ERC-20 token implementation' },
    { id: 'voting', label: 'Voting', description: 'Voting mechanism implementation' },
    { id: 'execution', label: 'Execution', description: 'Proposal execution logic' }
  ];

  const renderRegisterTab = () => (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DAO Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter DAO name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ENS Domain</label>
            <input
              type="text"
              value={formData.ens}
              onChange={(e) => handleInputChange('ens', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.eth"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter DAO description"
          />
        </div>
      </div>

      {/* Contract Types */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Contract Types
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contractTypes.map((type) => (
            <div key={type.id} className="flex items-start">
              <input
                type="checkbox"
                id={type.id}
                checked={formData.contracts.includes(type.id)}
                onChange={(e) => handleContractTypeChange(type.id, e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label htmlFor={type.id} className="text-sm font-medium text-gray-700">
                  {type.label}
                </label>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Metadata
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License</label>
            <select
              value={formData.license}
              onChange={(e) => handleInputChange('license', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="GPL-3.0">GPL 3.0</option>
              <option value="Unlicense">Unlicense</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.authors.map((author, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {author}
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    authors: prev.authors.filter((_, i) => i !== index)
                  }))}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={handleAddAuthor}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Author
          </button>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.keywords.map((keyword, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {keyword}
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    keywords: prev.keywords.filter((_, i) => i !== index)
                  }))}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={handleAddKeyword}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Keyword
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4">
          <button
            onClick={handleGenerateStructure}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Generate Structure
          </button>
          
          <button
            onClick={handleRegisterDAO}
            disabled={loading || !generatedStructure}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Register DAO
          </button>
        </div>
      </div>
    </div>
  );

  const renderStructureTab = () => (
    <div className="space-y-6">
      {generatedStructure ? (
        <>
          {/* Contract Names */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Generated Contract Names
            </h3>
            
            <div className="space-y-4">
              {Object.entries(generatedStructure.contracts).map(([type, contracts]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{type} Contracts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(contracts).map(([contractType, name]) => (
                      <div key={contractType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">{contractType}:</span>
                        <div className="flex items-center">
                          <code className="text-sm text-gray-900 mr-2">{name}</code>
                          <button
                            onClick={() => copyToClipboard(name)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ENS Domains */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Generated ENS Domains
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(generatedStructure.ens).map(([type, domain]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}:</span>
                    <div className="text-sm text-gray-900 font-mono">{domain}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(domain)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata Signature */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Metadata Signature (SOMU)
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">Hash:</span>
                <code className="text-sm text-gray-900">{generatedStructure.signature.hash}</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">Signer:</span>
                <code className="text-sm text-gray-900">{generatedStructure.signature.signer}</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">Timestamp:</span>
                <span className="text-sm text-gray-900">{new Date(generatedStructure.signature.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Generate a structure to view contract names and ENS domains</p>
        </div>
      )}
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {complianceStatus ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            ENSIP-X Compliance Status
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Compliance</span>
              <span className={`text-sm font-medium ${complianceStatus.compliant ? 'text-green-600' : 'text-red-600'}`}>
                {complianceStatus.compliant ? 'Compliant' : 'Non-Compliant'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${complianceStatus.compliant ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${complianceStatus.score * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: {(complianceStatus.score * 100).toFixed(0)}%</p>
          </div>
          
          <div className="space-y-3">
            {Object.entries(complianceStatus.checks).map(([check, result]) => (
              <div key={check} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                  )}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {check.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{result.details}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Generate a structure to view compliance status</p>
        </div>
      )}
    </div>
  );

  const renderStandardsTab = () => (
    <div className="space-y-6">
      {data?.standards && (
        <>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              ENSIP-X Standard Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Standard Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Standard:</span>
                    <span className="text-sm font-medium">{data.standards.standard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Version:</span>
                    <span className="text-sm font-medium">{data.standards.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Description:</span>
                    <span className="text-sm font-medium">{data.standards.description}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Compliance</h4>
                <div className="space-y-2">
                  {Object.entries(data.standards.compliance).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key}:</span>
                      <span className="text-sm font-medium text-green-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Naming Standards
            </h3>
            
            <div className="space-y-4">
              {Object.entries(data.standards.namingStandards.patterns).map(([type, patterns]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{type} Patterns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(patterns).map(([patternType, pattern]) => (
                      <div key={patternType} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{patternType}:</span>
                        <code className="text-sm text-gray-900">{pattern}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderNamingStandardsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          NIEM-Inspired Naming Standards
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Core Principles</h4>
          </div>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Hierarchical Structure: Follow NIEM domain-based organization</li>
            <li>• Semantic Clarity: Names should be self-documenting</li>
            <li>• Consistency: Uniform patterns across all components</li>
            <li>• Extensibility: Support for future additions and modifications</li>
            <li>• Interoperability: Compatible with industry standards</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Contract Types</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">GOVERNANCE:</span>
                <span className="text-gray-600">governance</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">TREASURY:</span>
                <span className="text-gray-600">treasury</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">TOKEN:</span>
                <span className="text-gray-600">token</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">REGISTRY:</span>
                <span className="text-gray-600">registry</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">PROPOSAL:</span>
                <span className="text-gray-600">proposal</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Naming Patterns</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Standard:</span>
                <span className="text-gray-600 font-mono text-xs">{'{DAO}Governance'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Interface:</span>
                <span className="text-gray-600 font-mono text-xs">{'I{DAO}Governance'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Implementation:</span>
                <span className="text-gray-600 font-mono text-xs">{'{DAO}GovernanceImpl'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Versioned:</span>
                <span className="text-gray-600 font-mono text-xs">{'{DAO}GovernanceV2'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ENS Standards</h4>
            <div className="space-y-1 text-sm">
              <div className="text-gray-600">Primary: {formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.eth</div>
              <div className="text-gray-600">Subdomains:</div>
              <div className="text-gray-600 ml-2">• governance.{formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.eth</div>
              <div className="text-gray-600 ml-2">• treasury.{formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.eth</div>
              <div className="text-gray-600 ml-2">• token.{formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.eth</div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-green-900">Integration Status</h4>
          </div>
          <p className="text-green-800 text-sm">
            NIEM-Inspired naming standards are now integrated into the frontend, providing consistent naming conventions across all DAO components.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Shield className="h-8 w-8 mr-3 text-blue-600" />
          ENSIP-X Contract Naming Application
        </h1>
        <p className="text-gray-600">
          Production-ready contract naming with ENSIP-X compliant metadata registration
        </p>
      </div>

      {/* Status Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            {data?.health ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className="text-sm font-medium">
              {data?.health ? 'ENSIP-X Service Online' : 'ENSIP-X Service Offline'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Standard: ENSIP-X v1.0.0
            </span>
            <span className="text-sm text-gray-500">
              Compliance: SOMU
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'register' && renderRegisterTab()}
        {activeTab === 'structure' && renderStructureTab()}
        {activeTab === 'compliance' && renderComplianceTab()}
        {activeTab === 'standards' && renderStandardsTab()}
        {activeTab === 'naming' && renderNamingStandardsTab()}
      </div>
    </div>
  );
};

export default ENSIPXContractNaming;


