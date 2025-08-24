/**
 * NIEM-Inspired Core Service for DAO Registry
 * Provides standardized data exchange, validation, and governance capabilities
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

class NIEMCoreService {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true
    });
    addFormats(this.ajv);
    
    this.schemas = new Map();
    this.exchangeModels = new Map();
    this.validationRules = new Map();
    this.governancePolicies = new Map();
    
    this.initializeCore();
  }

  /**
   * Initialize NIEM core components
   */
  initializeCore() {
    this.loadSchemas();
    this.initializeExchangeModels();
    this.setupValidationRules();
    this.establishGovernancePolicies();
  }

  /**
   * Load all JSON schemas from shared directory
   */
  loadSchemas() {
    const schemasDir = path.join(__dirname, '../../../shared/schemas/niem');
    
    try {
      const schemaFiles = fs.readdirSync(schemasDir)
        .filter(file => file.endsWith('.schema.json'));
      
      schemaFiles.forEach(file => {
        const schemaPath = path.join(schemasDir, file);
        const schemaName = file.replace('.schema.json', '');
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        
        this.schemas.set(schemaName, schema);
        this.ajv.addSchema(schema, schemaName);
        
        console.log(`Loaded schema: ${schemaName}`);
      });
    } catch (error) {
      console.error('Error loading schemas:', error);
    }
  }

  /**
   * Initialize exchange models for data interoperability
   */
  initializeExchangeModels() {
    // Core DAO Exchange Model
    this.exchangeModels.set('dao-core', {
      version: '1.0.0',
      namespace: 'https://dao-registry.org/niem/dao-core',
      elements: {
        dao: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uri' },
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            governance: { $ref: '#/definitions/governance' },
            treasury: { $ref: '#/definitions/treasury' },
            members: { type: 'array', items: { $ref: '#/definitions/member' } },
            metadata: { $ref: '#/definitions/metadata' }
          },
          required: ['id', 'name', 'governance']
        },
        governance: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['token', 'reputation', 'hybrid'] },
            votingPower: { type: 'string' },
            quorum: { type: 'number', minimum: 0, maximum: 100 },
            proposalThreshold: { type: 'number', minimum: 0 }
          },
          required: ['type']
        },
        treasury: {
          type: 'object',
          properties: {
            address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
            balance: { type: 'string' },
            tokens: { type: 'array', items: { $ref: '#/definitions/token' } }
          }
        },
        member: {
          type: 'object',
          properties: {
            address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
            role: { type: 'string', enum: ['member', 'admin', 'moderator'] },
            votingPower: { type: 'number', minimum: 0 },
            joinedAt: { type: 'string', format: 'date-time' }
          },
          required: ['address', 'role']
        },
        metadata: {
          type: 'object',
          properties: {
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            categories: { type: 'array', items: { type: 'string' } }
          }
        },
        token: {
          type: 'object',
          properties: {
            address: { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$' },
            symbol: { type: 'string' },
            name: { type: 'string' },
            decimals: { type: 'number', minimum: 0, maximum: 18 }
          },
          required: ['address', 'symbol']
        }
      }
    });

    // Metadata Exchange Model
    this.exchangeModels.set('metadata-core', {
      version: '1.0.0',
      namespace: 'https://dao-registry.org/niem/metadata-core',
      elements: {
        metadata: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uri' },
            type: { type: 'string', enum: ['dao', 'proposal', 'member', 'treasury'] },
            content: { type: 'object' },
            schema: { type: 'string', format: 'uri' },
            version: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            validator: { type: 'string' },
            quality: { $ref: '#/definitions/quality' }
          },
          required: ['id', 'type', 'content', 'schema']
        },
        quality: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 0, maximum: 100 },
            completeness: { type: 'number', minimum: 0, maximum: 100 },
            accuracy: { type: 'number', minimum: 0, maximum: 100 },
            timeliness: { type: 'number', minimum: 0, maximum: 100 },
            issues: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    });
  }

  /**
   * Setup validation rules for data quality
   */
  setupValidationRules() {
    // Data Quality Rules
    this.validationRules.set('data-quality', {
      completeness: {
        required: ['id', 'name', 'governance'],
        recommended: ['description', 'treasury', 'members', 'metadata']
      },
      format: {
        addresses: '^0x[a-fA-F0-9]{40}$',
        uris: '^https?://',
        dates: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z$'
      },
      constraints: {
        name: { minLength: 1, maxLength: 100 },
        description: { maxLength: 1000 },
        quorum: { minimum: 0, maximum: 100 },
        votingPower: { minimum: 0 }
      }
    });

    // Business Logic Rules
    this.validationRules.set('business-logic', {
      governance: {
        token: { requires: ['treasury'] },
        reputation: { requires: ['members'] },
        hybrid: { requires: ['treasury', 'members'] }
      },
      treasury: {
        requiresValidAddress: true,
        requiresPositiveBalance: true
      },
      members: {
        uniqueAddresses: true,
        validRoles: ['member', 'admin', 'moderator']
      }
    });
  }

  /**
   * Establish governance policies for data management
   */
  establishGovernancePolicies() {
    this.governancePolicies.set('data-governance', {
      version: '1.0.0',
      policies: {
        dataRetention: {
          active: '7 years',
          archived: 'indefinite',
          backup: 'daily'
        },
        dataQuality: {
          minimumScore: 80,
          validationRequired: true,
          qualityMonitoring: true
        },
        accessControl: {
          public: ['read'],
          authenticated: ['read', 'create'],
          authorized: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete']
        },
        compliance: {
          gdpr: true,
          iso27001: true,
          blockchainStandards: true
        }
      }
    });
  }

  /**
   * Validate data against schema and rules
   */
  validateData(data, schemaName, options = {}) {
    const results = {
      valid: false,
      errors: [],
      warnings: [],
      quality: {
        score: 0,
        completeness: 0,
        accuracy: 0,
        timeliness: 0
      }
    };

    try {
      // Schema validation
      const schema = this.schemas.get(schemaName);
      if (!schema) {
        results.errors.push(`Schema not found: ${schemaName}`);
        return results;
      }

      const validate = this.ajv.compile(schema);
      const valid = validate(data);

      if (!valid) {
        results.errors.push(...validate.errors.map(err => ({
          path: err.instancePath,
          message: err.message,
          code: err.keyword
        })));
      }

      // Data quality validation
      const qualityRules = this.validationRules.get('data-quality');
      if (qualityRules) {
        const qualityResult = this.validateDataQuality(data, qualityRules);
        results.quality = qualityResult;
        results.warnings.push(...qualityResult.warnings);
      }

      // Business logic validation
      const businessRules = this.validationRules.get('business-logic');
      if (businessRules) {
        const businessResult = this.validateBusinessLogic(data, businessRules);
        results.errors.push(...businessResult.errors);
        results.warnings.push(...businessResult.warnings);
      }

      results.valid = results.errors.length === 0;
      
      return results;
    } catch (error) {
      results.errors.push({
        path: '',
        message: `Validation error: ${error.message}`,
        code: 'VALIDATION_ERROR'
      });
      return results;
    }
  }

  /**
   * Validate data quality metrics
   */
  validateDataQuality(data, rules) {
    const quality = {
      score: 0,
      completeness: 0,
      accuracy: 0,
      timeliness: 0,
      warnings: []
    };

    // Completeness check
    const required = rules.completeness.required || [];
    const recommended = rules.completeness.recommended || [];
    
    const requiredPresent = required.filter(field => data[field] !== undefined).length;
    const recommendedPresent = recommended.filter(field => data[field] !== undefined).length;
    
    quality.completeness = Math.round(
      ((requiredPresent / required.length) * 0.7 + 
       (recommendedPresent / recommended.length) * 0.3) * 100
    );

    // Format accuracy check
    let formatErrors = 0;
    let totalChecks = 0;

    if (rules.format) {
      Object.entries(rules.format).forEach(([type, pattern]) => {
        if (type === 'addresses' && data.address) {
          totalChecks++;
          if (!new RegExp(pattern).test(data.address)) {
            formatErrors++;
          }
        }
        if (type === 'uris' && data.id) {
          totalChecks++;
          if (!new RegExp(pattern).test(data.id)) {
            formatErrors++;
          }
        }
      });
    }

    quality.accuracy = totalChecks > 0 ? Math.round(((totalChecks - formatErrors) / totalChecks) * 100) : 100;

    // Timeliness check
    if (data.updatedAt) {
      const updatedAt = new Date(data.updatedAt);
      const now = new Date();
      const daysDiff = (now - updatedAt) / (1000 * 60 * 60 * 24);
      quality.timeliness = daysDiff <= 30 ? 100 : Math.max(0, 100 - Math.floor(daysDiff / 30) * 10);
    } else {
      quality.timeliness = 0;
    }

    // Overall quality score
    quality.score = Math.round(
      (quality.completeness * 0.4 + 
       quality.accuracy * 0.4 + 
       quality.timeliness * 0.2)
    );

    return quality;
  }

  /**
   * Validate business logic rules
   */
  validateBusinessLogic(data, rules) {
    const result = {
      errors: [],
      warnings: []
    };

    // Governance type validation
    if (data.governance && rules.governance) {
      const governanceType = data.governance.type;
      const governanceRule = rules.governance[governanceType];
      
      if (governanceRule && governanceRule.requires) {
        governanceRule.requires.forEach(required => {
          if (!data[required]) {
            result.errors.push({
              path: `governance.${governanceType}`,
              message: `Governance type '${governanceType}' requires '${required}'`,
              code: 'BUSINESS_RULE_VIOLATION'
            });
          }
        });
      }
    }

    // Treasury validation
    if (data.treasury && rules.treasury) {
      if (rules.treasury.requiresValidAddress && data.treasury.address) {
        const addressPattern = /^0x[a-fA-F0-9]{40}$/;
        if (!addressPattern.test(data.treasury.address)) {
          result.errors.push({
            path: 'treasury.address',
            message: 'Invalid treasury address format',
            code: 'INVALID_ADDRESS'
          });
        }
      }
    }

    // Members validation
    if (data.members && rules.members) {
      const addresses = new Set();
      data.members.forEach((member, index) => {
        if (addresses.has(member.address)) {
          result.errors.push({
            path: `members[${index}].address`,
            message: 'Duplicate member address',
            code: 'DUPLICATE_ADDRESS'
          });
        }
        addresses.add(member.address);

        if (rules.members.validRoles && !rules.members.validRoles.includes(member.role)) {
          result.errors.push({
            path: `members[${index}].role`,
            message: `Invalid role. Must be one of: ${rules.members.validRoles.join(', ')}`,
            code: 'INVALID_ROLE'
          });
        }
      });
    }

    return result;
  }

  /**
   * Transform data to exchange format
   */
  transformToExchangeFormat(data, exchangeModelName) {
    const exchangeModel = this.exchangeModels.get(exchangeModelName);
    if (!exchangeModel) {
      throw new Error(`Exchange model not found: ${exchangeModelName}`);
    }

    // Apply transformation rules
    const transformed = {
      ...data,
      _exchange: {
        model: exchangeModelName,
        version: exchangeModel.version,
        namespace: exchangeModel.namespace,
        transformedAt: new Date().toISOString()
      }
    };

    return transformed;
  }

  /**
   * Get governance policy
   */
  getGovernancePolicy(policyName) {
    return this.governancePolicies.get(policyName);
  }

  /**
   * Get available schemas
   */
  getAvailableSchemas() {
    return Array.from(this.schemas.keys());
  }

  /**
   * Get available exchange models
   */
  getAvailableExchangeModels() {
    return Array.from(this.exchangeModels.keys());
  }

  /**
   * Get validation rules
   */
  getValidationRules() {
    return Array.from(this.validationRules.keys());
  }
}

module.exports = new NIEMCoreService();
