import React, { useState, useEffect } from 'react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { 
  Plus, 
  Save, 
  Upload, 
  Globe, 
  Users, 
  Shield, 
  Settings, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Link,
  Hash,
  DollarSign,
  Calendar,
  MapPin,
  Database,
  Network,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  Award,
  BookOpen,
  Code,
  Zap,
  Star,
  Heart,
  MessageCircle,
  ExternalLink,
  Download,
  Share2,
  RefreshCw,
  Trash2,
  Edit3,
  Copy,
  Search,
  Filter,
  MoreHorizontal,
  Info,
  HelpCircle,
  AlertTriangle,
  Success,
  Error,
  Warning
} from 'lucide-react';

const DAORegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(null);
  const [ajvValidator, setAjvValidator] = useState(null);
  const [formData, setFormData] = useState({
    // Core Identification (RFC-001 Section 4.1)
    id: '', // Will be generated
    name: '',
    symbol: '',
    description: '',
    
    // ENS Information (RFC-001 Section 4.1)
    ensDomain: '',
    ensSubdomains: {
      governance: '',
      treasury: '',
      token: '',
      docs: '',
      forum: '',
      analytics: ''
    },
    ensMetadata: {
      textRecords: {},
      contentHash: '',
      reverseRecord: ''
    },
    
    // Blockchain Information (RFC-001 Section 4.1)
    chainId: 1,
    governanceAddress: '',
    tokenAddress: '',
    treasuryAddress: '',
    timelockAddress: '',
    
    // Governance Structure (RFC-001 Section 4.1)
    governanceType: 'TokenWeighted',
    votingPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
    quorum: 4, // percentage
    proposalThreshold: 1000,
    executionDelay: 0,
    
    // Metadata (RFC-001 Section 4.1)
    logo: null,
    logoPreview: '',
    website: '',
    socialLinks: {
      twitter: '',
      discord: '',
      github: '',
      telegram: '',
      reddit: '',
      medium: ''
    },
    tags: [],
    
    // Timestamps (RFC-001 Section 4.1)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Status (RFC-001 Section 4.1)
    status: 'Pending',
    verified: false,
    
    // Additional Information
    memberCount: 0,
    totalSupply: 0,
    circulatingSupply: 0,
    treasuryValue: 0,
    treasuryCurrency: 'USD',
    
    // Latest Ethereum Research Integration (RFC-001 Section 4.4)
    accountAbstraction: {
      enabled: false,
      walletAddress: '',
      entryPoint: '',
      bundler: '',
      paymaster: '',
      gaslessTransactions: false,
      batchCapabilities: false
    },
    
    layer2Data: {
      enabled: false,
      chainId: 0,
      networkType: 'optimistic',
      bridgeAddress: '',
      finalityPeriod: 0,
      gasOptimization: {
        gasSavings: 0,
        transactionCost: 0,
        optimizationType: 'batch'
      },
      crossChainData: {
        sourceChain: 0,
        targetChain: 0,
        bridgeTransaction: '',
        verificationProof: '',
        finalityStatus: 'pending'
      }
    },
    
    mevProtection: {
      protectionEnabled: false,
      protectionType: 'fair-ordering',
      gasOptimization: 0,
      transactionOrdering: 'fair',
      mempoolType: 'protected'
    },
    
    blobTransactions: {
      enabled: false,
      blobGasUsed: 0,
      blobGasPrice: 0,
      blobData: '',
      dataAvailability: 'blob',
      compressionRatio: 0
    },
    
    // Advanced Settings
    customSettings: {
      enableDelegation: true,
      enableSnapshot: false,
      enableMultisig: false,
      enableTimelock: true,
      enableEmergencyPause: true,
      enableUpgradeable: false
    },
    
    // CCIP Integration
    ccipEnabled: false,
    crossChainData: {
      enabled: false,
      supportedChains: [],
      dataProviders: [],
      updateFrequency: 'per-block'
    },
    
    // Reserved Subdomains
    reservedSubdomains: {
      enabled: false,
      subdomain: '',
      priority: 'Medium',
      autoUpdate: true
    }
  });

  const [errors, setErrors] = useState({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const loadSchema = async () => {
      try {
        const res = await fetch('/api/schemas/CreateDAORequest');
        if (!res.ok) return;
        const json = await res.json();
        const ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(ajv);
        const validate = ajv.compile(json);
        setSchema(json);
        setAjvValidator(() => validate);
      } catch {}
    };
    loadSchema();
  }, []);

  const governanceTypes = [
    { id: 'TokenWeighted', name: 'Token Weighted Voting', description: 'Voting power based on token holdings' },
    { id: 'Quadratic', name: 'Quadratic Voting', description: 'Voting power increases with square root of tokens' },
    { id: 'Reputation', name: 'Reputation Based', description: 'Voting power based on reputation/contribution' },
    { id: 'Liquid', name: 'Liquid Democracy', description: 'Delegated voting with transferable votes' },
    { id: 'Hybrid', name: 'Hybrid System', description: 'Combination of multiple voting mechanisms' }
  ];

  const chains = [
    { id: 1, name: 'Ethereum Mainnet', icon: Network },
    { id: 137, name: 'Polygon', icon: Network },
    { id: 42161, name: 'Arbitrum One', icon: Network },
    { id: 10, name: 'Optimism', icon: Network },
    { id: 56, name: 'BNB Smart Chain', icon: Network },
    { id: 43114, name: 'Avalanche C-Chain', icon: Network },
    { id: 250, name: 'Fantom Opera', icon: Network }
  ];

  const priorities = [
    { id: 'Critical', name: 'Critical', description: 'Immediate updates required' },
    { id: 'High', name: 'High', description: 'Updates within 1 hour' },
    { id: 'Medium', name: 'Medium', description: 'Updates within 24 hours' },
    { id: 'Low', name: 'Low', description: 'Updates within 7 days' }
  ];

  const updateFrequencies = [
    { id: 'per-block', name: 'Per Block', description: 'Update on every block' },
    { id: 'per-hour', name: 'Per Hour', description: 'Update every hour' },
    { id: 'per-day', name: 'Per Day', description: 'Update daily' },
    { id: 'per-week', name: 'Per Week', description: 'Update weekly' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const runAjvValidation = () => {
    if (!ajvValidator) return true;
    const valid = ajvValidator(formData);
    if (valid) return true;
    const fieldErrors = {};
    (ajvValidator.errors || []).forEach(err => {
      const path = (err.instancePath || '').replace(/^\//, '');
      const key = path.includes('/') ? path.split('/')[0] : path || err.params.missingProperty || 'root';
      fieldErrors[key] = err.message;
    });
    setErrors(prev => ({ ...prev, ...fieldErrors }));
    return false;
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: file, logoPreview: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    // Local step checks
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'DAO name is required';
        if (!formData.symbol.trim()) newErrors.symbol = 'Token symbol is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.symbol.length > 10) newErrors.symbol = 'Symbol must be 10 characters or less';
        break;
      case 2:
        if (!formData.tokenAddress.trim()) newErrors.tokenAddress = 'Token address is required';
        if (!formData.governanceAddress.trim()) newErrors.governanceAddress = 'Governance address is required';
        if (!formData.treasuryAddress.trim()) newErrors.treasuryAddress = 'Treasury address is required';
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (formData.tokenAddress && !ethAddressRegex.test(formData.tokenAddress)) newErrors.tokenAddress = 'Invalid Ethereum address format';
        if (formData.governanceAddress && !ethAddressRegex.test(formData.governanceAddress)) newErrors.governanceAddress = 'Invalid Ethereum address format';
        if (formData.treasuryAddress && !ethAddressRegex.test(formData.treasuryAddress)) newErrors.treasuryAddress = 'Invalid Ethereum address format';
        break;
      case 3:
        if (formData.votingPeriod < 1) newErrors.votingPeriod = 'Voting period must be at least 1 day';
        if (formData.quorum < 0 || formData.quorum > 100) newErrors.quorum = 'Quorum must be between 0 and 100%';
        if (formData.proposalThreshold < 0) newErrors.proposalThreshold = 'Proposal threshold must be positive';
        break;
      case 4:
        if (formData.ensDomain && !formData.ensDomain.endsWith('.eth')) newErrors.ensDomain = 'ENS domain must end with .eth';
        if (formData.ensDomain && formData.ensDomain.length < 4) newErrors.ensDomain = 'ENS domain must be at least 4 characters';
        break;
      default:
        break;
    }
    setErrors(newErrors);
    // Global schema check (Ajv)
    const ajvOk = runAjvValidation();
    return Object.keys(newErrors).length === 0 && ajvOk;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    if (step < 6) { setStep(step + 1); return; }
    setLoading(true);
    try {
      const registrationData = { ...formData, registeredBy: walletAddress, registrationDate: new Date().toISOString(), status: 'Pending' };
      console.log('Registration data:', registrationData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('DAO registration submitted successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNumber === step 
                ? 'bg-blue-600 text-white' 
                : stepNumber < step 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
            </div>
            {stepNumber < 6 && (
              <div className={`w-16 h-1 mx-2 ${
                stepNumber < step ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-600">
          Step {step} of 6: {getStepTitle(step)}
        </p>
      </div>
    </div>
  );

  const getStepTitle = (stepNumber) => {
    const titles = {
      1: 'Core Identification',
      2: 'Smart Contract Addresses',
      3: 'Governance Configuration',
      4: 'ENS Integration',
      5: 'Advanced Features',
      6: 'Review & Submit'
    };
    return titles[stepNumber] || '';
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DAO Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Uniswap DAO"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Symbol *
          </label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.symbol ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., UNI"
            maxLength={10}
          />
          {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your DAO's purpose, goals, and governance structure..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yourdao.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blockchain Network
          </label>
          <select
            value={formData.chainId}
            onChange={(e) => {
              const chain = chains.find(c => c.id === parseInt(e.target.value));
              handleInputChange('chainId', parseInt(e.target.value));
              handleInputChange('networkName', chain.name);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          DAO Logo
        </label>
        <div className="flex items-center space-x-4">
          {formData.logoPreview && (
            <img 
              src={formData.logoPreview} 
              alt="Logo preview" 
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </label>
            <p className="text-xs text-gray-500 mt-1">Recommended: 512x512 PNG or JPG</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-blue-900">Smart Contract Addresses</h3>
        </div>
        <p className="text-blue-800 text-sm">
          Provide the Ethereum addresses of your DAO's smart contracts. These addresses will be verified on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Contract Address *
          </label>
          <input
            type="text"
            value={formData.tokenAddress}
            onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.tokenAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0x..."
          />
          {errors.tokenAddress && <p className="text-red-500 text-sm mt-1">{errors.tokenAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Governance Contract Address *
          </label>
          <input
            type="text"
            value={formData.governanceAddress}
            onChange={(e) => handleInputChange('governanceAddress', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.governanceAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0x..."
          />
          {errors.governanceAddress && <p className="text-red-500 text-sm mt-1">{errors.governanceAddress}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treasury Contract Address *
          </label>
          <input
            type="text"
            value={formData.treasuryAddress}
            onChange={(e) => handleInputChange('treasuryAddress', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.treasuryAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0x..."
          />
          {errors.treasuryAddress && <p className="text-red-500 text-sm mt-1">{errors.treasuryAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timelock Contract Address (Optional)
          </label>
          <input
            type="text"
            value={formData.timelockAddress}
            onChange={(e) => handleInputChange('timelockAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="0x..."
          />
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="font-medium text-yellow-900">Verification Notice</h3>
        </div>
        <p className="text-yellow-800 text-sm">
          All contract addresses will be verified on-chain. Ensure the contracts are deployed and accessible on {formData.networkName}.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Settings className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="font-medium text-purple-900">Governance Configuration</h3>
        </div>
        <p className="text-purple-800 text-sm">
          Configure your DAO's governance parameters. These settings will be used to verify your governance structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Governance Type
          </label>
          <select
            value={formData.governanceType}
            onChange={(e) => handleInputChange('governanceType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {governanceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {governanceTypes.find(t => t.id === formData.governanceType)?.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voting Period (Days)
          </label>
          <input
            type="number"
            value={formData.votingPeriod}
            onChange={(e) => handleInputChange('votingPeriod', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.votingPeriod ? 'border-red-500' : 'border-gray-300'
            }`}
            min="1"
            max="30"
          />
          {errors.votingPeriod && <p className="text-red-500 text-sm mt-1">{errors.votingPeriod}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quorum Percentage
          </label>
          <input
            type="number"
            value={formData.quorum}
            onChange={(e) => handleInputChange('quorum', parseFloat(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.quorum ? 'border-red-500' : 'border-gray-300'
            }`}
            min="0"
            max="100"
            step="0.1"
          />
          {errors.quorum && <p className="text-red-500 text-sm mt-1">{errors.quorum}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Threshold
          </label>
          <input
            type="number"
            value={formData.proposalThreshold}
            onChange={(e) => handleInputChange('proposalThreshold', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.proposalThreshold ? 'border-red-500' : 'border-gray-300'
            }`}
            min="0"
          />
          {errors.proposalThreshold && <p className="text-red-500 text-sm mt-1">{errors.proposalThreshold}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Execution Delay (Hours)
          </label>
          <input
            type="number"
            value={formData.executionDelay}
            onChange={(e) => handleInputChange('executionDelay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="168"
          />
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.customSettings).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleNestedChange('customSettings', key, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-green-800 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Globe className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="font-medium text-indigo-900">ENS Integration</h3>
        </div>
        <p className="text-indigo-800 text-sm">
          Configure Ethereum Name Service (ENS) domains for your DAO. This enables human-readable addresses and decentralized identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary ENS Domain *
          </label>
          <input
            type="text"
            value={formData.ensDomain}
            onChange={(e) => handleInputChange('ensDomain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="yourdao.eth"
          />
          <p className="text-xs text-gray-500 mt-1">This will be your main DAO domain</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Hash (Optional)
          </label>
          <input
            type="text"
            value={formData.ensMetadata.contentHash}
            onChange={(e) => handleNestedChange('ensMetadata', 'contentHash', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ipfs://..."
          />
          <p className="text-xs text-gray-500 mt-1">IPFS hash for decentralized content</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ENS Subdomains
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Governance Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.governance}
              onChange={(e) => handleNestedChange('ensSubdomains', 'governance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="governance.yourdao.eth"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Treasury Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.treasury}
              onChange={(e) => handleNestedChange('ensSubdomains', 'treasury', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="treasury.yourdao.eth"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Token Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.token}
              onChange={(e) => handleNestedChange('ensSubdomains', 'token', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="token.yourdao.eth"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Documentation Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.docs}
              onChange={(e) => handleNestedChange('ensSubdomains', 'docs', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="docs.yourdao.eth"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Forum Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.forum}
              onChange={(e) => handleNestedChange('ensSubdomains', 'forum', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="forum.yourdao.eth"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Analytics Subdomain</label>
            <input
              type="text"
              value={formData.ensSubdomains.analytics}
              onChange={(e) => handleNestedChange('ensSubdomains', 'analytics', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="analytics.yourdao.eth"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-blue-900">ENS Benefits</h3>
        </div>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Human-readable addresses for your DAO</li>
          <li>• Decentralized identity and branding</li>
          <li>• Subdomain organization for different components</li>
          <li>• Integration with Ethereum ecosystem</li>
          <li>• Future-proof naming system</li>
        </ul>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Zap className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="font-medium text-purple-900">Advanced Features</h3>
        </div>
        <p className="text-purple-800 text-sm">
          Configure advanced features including Account Abstraction, Layer 2 support, MEV protection, and blob transactions.
        </p>
      </div>

      {/* Account Abstraction */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Account Abstraction (EIP-4337)</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.accountAbstraction.enabled}
              onChange={(e) => handleNestedChange('accountAbstraction', 'enabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable Account Abstraction</span>
          </label>
          
          {formData.accountAbstraction.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Entry Point Address</label>
                <input
                  type="text"
                  value={formData.accountAbstraction.entryPoint}
                  onChange={(e) => handleNestedChange('accountAbstraction', 'entryPoint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bundler URL</label>
                <input
                  type="text"
                  value={formData.accountAbstraction.bundler}
                  onChange={(e) => handleNestedChange('accountAbstraction', 'bundler', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2 Support */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Layer 2 Integration</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.layer2Data.enabled}
              onChange={(e) => handleNestedChange('layer2Data', 'enabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable Layer 2 Support</span>
          </label>
          
          {formData.layer2Data.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">L2 Chain ID</label>
                <input
                  type="number"
                  value={formData.layer2Data.chainId}
                  onChange={(e) => handleNestedChange('layer2Data', 'chainId', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Network Type</label>
                <select
                  value={formData.layer2Data.networkType}
                  onChange={(e) => handleNestedChange('layer2Data', 'networkType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="optimistic">Optimistic Rollup</option>
                  <option value="zk-rollup">ZK Rollup</option>
                  <option value="validium">Validium</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MEV Protection */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">MEV Protection</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.mevProtection.protectionEnabled}
              onChange={(e) => handleNestedChange('mevProtection', 'protectionEnabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable MEV Protection</span>
          </label>
          
          {formData.mevProtection.protectionEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Protection Type</label>
                <select
                  value={formData.mevProtection.protectionType}
                  onChange={(e) => handleNestedChange('mevProtection', 'protectionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="fair-ordering">Fair Ordering</option>
                  <option value="time-boost">Time Boost</option>
                  <option value="sandwich-protection">Sandwich Protection</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mempool Type</label>
                <select
                  value={formData.mevProtection.mempoolType}
                  onChange={(e) => handleNestedChange('mevProtection', 'mempoolType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="protected">Protected</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blob Transactions */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3">Blob Transactions (EIP-4844)</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.blobTransactions.enabled}
              onChange={(e) => handleNestedChange('blobTransactions', 'enabled', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Enable Blob Transactions</span>
          </label>
          
          {formData.blobTransactions.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Data Availability</label>
                <select
                  value={formData.blobTransactions.dataAvailability}
                  onChange={(e) => handleNestedChange('blobTransactions', 'dataAvailability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="blob">Blob Storage</option>
                  <option value="calldata">Calldata</option>
                  <option value="ipfs">IPFS</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-medium text-green-900">Review Your DAO Registration</h3>
        </div>
        <p className="text-green-800 text-sm">
          Please review all information before submitting. You can go back to previous steps to make changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Core Information</h4>
          <div className="bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium">{formData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chain ID:</span>
                <span className="font-medium">{formData.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Governance Type:</span>
                <span className="font-medium">{governanceTypes.find(t => t.id === formData.governanceType)?.name}</span>
              </div>
              {formData.ensDomain && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ENS Domain:</span>
                  <span className="font-medium">{formData.ensDomain}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Smart Contracts</h4>
          <div className="bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Address:</span>
                <span className="font-medium font-mono text-sm">{formData.contractAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Address:</span>
                <span className="font-medium font-mono text-sm">{formData.tokenAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Treasury Address:</span>
                <span className="font-medium font-mono text-sm">{formData.treasuryAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="font-medium text-yellow-900">Important Notice</h3>
        </div>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Your DAO will be reviewed by our team before approval</li>
          <li>• Contract addresses will be verified on-chain</li>
          <li>• ENS domains will be validated for ownership</li>
          <li>• You may be contacted for additional verification</li>
          <li>• Registration fees may apply depending on your plan</li>
        </ul>
      </div>

      {!walletConnected && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Lock className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Connect Wallet Required</h3>
          </div>
          <p className="text-blue-800 text-sm mb-3">
            You need to connect your wallet to submit the registration.
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your DAO</h1>
          <p className="text-gray-600">Join the decentralized governance revolution</p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg border p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-2 rounded-lg transition-colors ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-3">
              {step < 6 && (
                <button
                  onClick={() => {
                    if (validateStep(step)) {
                      setStep(step + 1);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}

              {step === 5 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !walletConnected}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    loading || !walletConnected
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Documentation</h4>
              <p className="text-sm text-gray-600">Read our comprehensive guides</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Support</h4>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </div>
            <div className="text-center">
              <Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Smart Contracts</h4>
              <p className="text-sm text-gray-600">Review our contract standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAORegistration;