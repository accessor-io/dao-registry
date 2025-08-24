/**
 * NIEM Routes for DAO Registry
 * Exposes NIEM core, integration, and governance services through REST API
 */

const express = require('express');
const router = express.Router();
const niemCore = require('../services/niem/niem-core-service');
const niemIntegration = require('../services/niem/niem-integration-service');
const niemGovernance = require('../services/niem/niem-governance-service');

/**
 * NIEM Core Routes
 */

// Get available schemas
router.get('/schemas', (req, res) => {
  try {
    const schemas = niemCore.getAvailableSchemas();
    res.json({
      success: true,
      data: schemas,
      count: schemas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get schema details
router.get('/schemas/:name', (req, res) => {
  try {
    const { name } = req.params;
    const schema = niemCore.schemas.get(name);
    
    if (!schema) {
      return res.status(404).json({
        success: false,
        error: `Schema not found: ${name}`
      });
    }
    
    res.json({
      success: true,
      data: {
        name: name,
        schema: schema,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate data against schema
router.post('/validate/:schema', (req, res) => {
  try {
    const { schema } = req.params;
    const { data, options = {} } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for validation'
      });
    }
    
    const validation = niemCore.validateData(data, schema, options);
    
    res.json({
      success: true,
      data: validation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transform data to exchange format
router.post('/transform/:model', (req, res) => {
  try {
    const { model } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for transformation'
      });
    }
    
    const transformed = niemCore.transformToExchangeFormat(data, model);
    
    res.json({
      success: true,
      data: transformed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * NIEM Integration Routes
 */

// Get available adapters
router.get('/adapters', (req, res) => {
  try {
    const adapters = niemIntegration.getAvailableAdapters();
    const adapterDetails = adapters.map(name => {
      const adapter = niemIntegration.adapters.get(name);
      return {
        name: name,
        displayName: adapter.name,
        version: adapter.version,
        capabilities: adapter.capabilities
      };
    });
    
    res.json({
      success: true,
      data: adapterDetails,
      count: adapters.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transform data using adapter
router.post('/adapters/:adapter/transform', (req, res) => {
  try {
    const { adapter } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for transformation'
      });
    }
    
    const transformed = niemIntegration.transformWithAdapter(data, adapter);
    
    res.json({
      success: true,
      data: transformed,
      adapter: adapter,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate data using adapter
router.post('/adapters/:adapter/validate', (req, res) => {
  try {
    const { adapter } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for validation'
      });
    }
    
    const validation = niemIntegration.validateWithAdapter(data, adapter);
    
    res.json({
      success: true,
      data: validation,
      adapter: adapter,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available transformers
router.get('/transformers', (req, res) => {
  try {
    const transformers = niemIntegration.getAvailableTransformers();
    
    res.json({
      success: true,
      data: transformers,
      count: transformers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transform data using specific transformer
router.post('/transformers/:transformer', (req, res) => {
  try {
    const { transformer } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for transformation'
      });
    }
    
    const transformerObj = niemIntegration.transformers.get(transformer);
    if (!transformerObj) {
      return res.status(404).json({
        success: false,
        error: `Transformer not found: ${transformer}`
      });
    }
    
    const transformed = transformerObj.transform(data);
    
    res.json({
      success: true,
      data: transformed,
      transformer: transformer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available exchange protocols
router.get('/protocols', (req, res) => {
  try {
    const protocols = niemIntegration.getAvailableExchangeProtocols();
    const protocolDetails = protocols.map(name => {
      const protocol = niemIntegration.exchangeProtocols.get(name);
      return {
        name: name,
        displayName: protocol.name,
        version: protocol.version,
        methods: protocol.methods,
        format: protocol.format,
        security: protocol.security
      };
    });
    
    res.json({
      success: true,
      data: protocolDetails,
      count: protocols.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transform data for specific protocol
router.post('/protocols/:protocol/transform', (req, res) => {
  try {
    const { protocol } = req.params;
    const { data, method = 'GET' } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for transformation'
      });
    }
    
    const protocolObj = niemIntegration.exchangeProtocols.get(protocol);
    if (!protocolObj) {
      return res.status(404).json({
        success: false,
        error: `Protocol not found: ${protocol}`
      });
    }
    
    const transformed = protocolObj.transform(data, method);
    
    res.json({
      success: true,
      data: transformed,
      protocol: protocol,
      method: method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available interoperability standards
router.get('/standards', (req, res) => {
  try {
    const standards = niemIntegration.getAvailableStandards();
    const standardDetails = standards.map(name => {
      const standard = niemIntegration.interoperabilityStandards.get(name);
      return {
        name: name,
        displayName: standard.name,
        version: standard.version,
        requirements: standard.requirements
      };
    });
    
    res.json({
      success: true,
      data: standardDetails,
      count: standards.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate data against standard
router.post('/standards/:standard/validate', (req, res) => {
  try {
    const { standard } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for validation'
      });
    }
    
    const standardObj = niemIntegration.interoperabilityStandards.get(standard);
    if (!standardObj) {
      return res.status(404).json({
        success: false,
        error: `Standard not found: ${standard}`
      });
    }
    
    const validation = standardObj.validate(data);
    
    res.json({
      success: true,
      data: validation,
      standard: standard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * NIEM Governance Routes
 */

// Get available standards
router.get('/governance/standards', (req, res) => {
  try {
    const standards = Array.from(niemGovernance.standards.keys());
    const standardDetails = standards.map(name => {
      const standard = niemGovernance.standards.get(name);
      return {
        name: name,
        displayName: standard.name,
        version: standard.version,
        description: standard.description,
        requirements: standard.requirements
      };
    });
    
    res.json({
      success: true,
      data: standardDetails,
      count: standards.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate data against governance standard
router.post('/governance/standards/:standard/validate', (req, res) => {
  try {
    const { standard } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for validation'
      });
    }
    
    const standardObj = niemGovernance.standards.get(standard);
    if (!standardObj) {
      return res.status(404).json({
        success: false,
        error: `Standard not found: ${standard}`
      });
    }
    
    const validation = standardObj.validation(data);
    
    res.json({
      success: true,
      data: validation,
      standard: standard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available policies
router.get('/governance/policies', (req, res) => {
  try {
    const policies = Array.from(niemGovernance.policies.keys());
    const policyDetails = policies.map(name => {
      const policy = niemGovernance.policies.get(name);
      return {
        name: name,
        displayName: policy.name,
        version: policy.version,
        description: policy.description,
        rules: policy.rules
      };
    });
    
    res.json({
      success: true,
      data: policyDetails,
      count: policies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enforce policy
router.post('/governance/policies/:policy/enforce', (req, res) => {
  try {
    const { policy } = req.params;
    const { action, data } = req.body;
    
    if (!action || !data) {
      return res.status(400).json({
        success: false,
        error: 'Action and data are required for policy enforcement'
      });
    }
    
    const policyObj = niemGovernance.policies.get(policy);
    if (!policyObj) {
      return res.status(404).json({
        success: false,
        error: `Policy not found: ${policy}`
      });
    }
    
    const result = policyObj.enforcement(action, data);
    
    res.json({
      success: true,
      data: result,
      policy: policy,
      action: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get compliance rules
router.get('/governance/compliance', (req, res) => {
  try {
    const compliance = Array.from(niemGovernance.complianceRules.keys());
    const complianceDetails = compliance.map(name => {
      const rule = niemGovernance.complianceRules.get(name);
      return {
        name: name,
        displayName: rule.name,
        version: rule.version,
        description: rule.description,
        rules: rule.rules
      };
    });
    
    res.json({
      success: true,
      data: complianceDetails,
      count: compliance.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate compliance
router.post('/governance/compliance/:rule/validate', (req, res) => {
  try {
    const { rule } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for compliance validation'
      });
    }
    
    const ruleObj = niemGovernance.complianceRules.get(rule);
    if (!ruleObj) {
      return res.status(404).json({
        success: false,
        error: `Compliance rule not found: ${rule}`
      });
    }
    
    const validation = ruleObj.validate(data);
    
    res.json({
      success: true,
      data: validation,
      rule: rule,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get quality metrics
router.get('/governance/quality', (req, res) => {
  try {
    const metrics = niemGovernance.qualityMetrics.get('dao-registry');
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update quality metric
router.put('/governance/quality/:metric', (req, res) => {
  try {
    const { metric } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required for metric update'
      });
    }
    
    niemGovernance.updateQualityMetric(metric, value);
    
    res.json({
      success: true,
      data: {
        metric: metric,
        value: value,
        updated: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get audit trail
router.get('/governance/audit', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const auditTrail = niemGovernance.getAuditTrail();
    
    const paginatedTrail = auditTrail
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse(); // Most recent first
    
    res.json({
      success: true,
      data: paginatedTrail,
      pagination: {
        total: auditTrail.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < auditTrail.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add audit entry
router.post('/governance/audit', (req, res) => {
  try {
    const { action, data, user, result } = req.body;
    
    if (!action || !data) {
      return res.status(400).json({
        success: false,
        error: 'Action and data are required for audit entry'
      });
    }
    
    niemGovernance.addAuditEntry(action, data, user, result);
    
    res.json({
      success: true,
      data: {
        action: action,
        user: user,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get governance report
router.get('/governance/report', (req, res) => {
  try {
    const report = niemGovernance.getGovernanceReport();
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * NIEM System Information
 */

// Get NIEM system information
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      name: 'NIEM-Inspired DAO Registry System',
      version: '1.0.0',
      description: 'Professional DAO registry with NIEM-inspired architecture for data exchange, validation, and governance',
      components: {
        core: {
          schemas: niemCore.getAvailableSchemas().length,
          exchangeModels: niemCore.getAvailableExchangeModels().length,
          validationRules: niemCore.getValidationRules().length
        },
        integration: {
          adapters: niemIntegration.getAvailableAdapters().length,
          transformers: niemIntegration.getAvailableTransformers().length,
          protocols: niemIntegration.getAvailableExchangeProtocols().length,
          standards: niemIntegration.getAvailableStandards().length
        },
        governance: {
          standards: Array.from(niemGovernance.standards.keys()).length,
          policies: Array.from(niemGovernance.policies.keys()).length,
          compliance: Array.from(niemGovernance.complianceRules.keys()).length
        }
      },
      capabilities: [
        'Schema validation and management',
        'Data quality assessment',
        'Cross-system interoperability',
        'Standards compliance monitoring',
        'Policy enforcement',
        'Audit trail management',
        'Quality metrics tracking'
      ],
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
