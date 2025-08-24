#!/usr/bin/env node

/**
 * NIEM-Inspired DAO Registry Naming Standardization Script
 * 
 * This script standardizes naming conventions across the entire system
 * following the NIEM-inspired patterns defined in docs/naming-conventions.md
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Source directories
  schemasDir: 'shared/schemas',
  servicesDir: 'backend/src/services',
  routesDir: 'backend/src/routes',
  
  // Target directories
  niemSchemasDir: 'shared/schemas/niem',
  niemServicesDir: 'backend/src/services/niem',
  niemRoutesDir: 'backend/src/routes/niem',
  
  // Domain structure
  domains: {
    core: ['dao', 'governance', 'metadata'],
    governance: ['voting', 'policies', 'compliance'],
    treasury: ['assets', 'transactions', 'budgets'],
    member: ['roles', 'permissions', 'activity'],
    proposal: ['lifecycle', 'voting', 'execution'],
    metadata: ['quality', 'audit', 'analytics']
  }
};

/**
 * Standardize schema file names
 */
function standardizeSchemaNames() {
  console.log('📋 Standardizing schema file names...');
  
  // Create domain directories
  Object.keys(CONFIG.domains).forEach(domain => {
    const domainDir = path.join(CONFIG.niemSchemasDir, domain);
    if (!fs.existsSync(domainDir)) {
      fs.mkdirSync(domainDir, { recursive: true });
      console.log(`  ✅ Created directory: ${domainDir}`);
    }
  });
  
  // Move and rename existing schemas
  const existingSchemas = [
    { 
      source: 'shared/schemas/niem-dao-core.schema.json',
      target: 'shared/schemas/niem/core/niem-dao-core-v1.0.0.schema.json'
    }
  ];
  
  existingSchemas.forEach(({ source, target }) => {
    if (fs.existsSync(source)) {
      const targetDir = path.dirname(target);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      if (!fs.existsSync(target)) {
        fs.copyFileSync(source, target);
        console.log(`  ✅ Moved: ${source} → ${target}`);
      } else {
        console.log(`  ⚠️  Target already exists: ${target}`);
      }
    }
  });
}

/**
 * Standardize service file names
 */
function standardizeServiceNames() {
  console.log('🔧 Standardizing service file names...');
  
  // Create niem services directory
  if (!fs.existsSync(CONFIG.niemServicesDir)) {
    fs.mkdirSync(CONFIG.niemServicesDir, { recursive: true });
    console.log(`  ✅ Created directory: ${CONFIG.niemServicesDir}`);
  }
  
  // Move and rename existing services
  const existingServices = [
    {
      source: 'backend/src/services/niem-core.js',
      target: 'backend/src/services/niem/niem-core-service.js'
    },
    {
      source: 'backend/src/services/niem-integration.js',
      target: 'backend/src/services/niem/niem-integration-service.js'
    },
    {
      source: 'backend/src/services/niem-governance.js',
      target: 'backend/src/services/niem/niem-governance-service.js'
    }
  ];
  
  existingServices.forEach(({ source, target }) => {
    if (fs.existsSync(source)) {
      if (!fs.existsSync(target)) {
        fs.copyFileSync(source, target);
        console.log(`  ✅ Moved: ${source} → ${target}`);
      } else {
        console.log(`  ⚠️  Target already exists: ${target}`);
      }
    }
  });
}

/**
 * Standardize route file names
 */
function standardizeRouteNames() {
  console.log('🛣️  Standardizing route file names...');
  
  // Create niem routes directory
  if (!fs.existsSync(CONFIG.niemRoutesDir)) {
    fs.mkdirSync(CONFIG.niemRoutesDir, { recursive: true });
    console.log(`  ✅ Created directory: ${CONFIG.niemRoutesDir}`);
  }
  
  // Move and rename existing routes
  const existingRoutes = [
    {
      source: 'backend/src/routes/niem.js',
      target: 'backend/src/routes/niem/niem-core-routes.js'
    }
  ];
  
  existingRoutes.forEach(({ source, target }) => {
    if (fs.existsSync(source)) {
      if (!fs.existsSync(target)) {
        fs.copyFileSync(source, target);
        console.log(`  ✅ Moved: ${source} → ${target}`);
      } else {
        console.log(`  ⚠️  Target already exists: ${target}`);
      }
    }
  });
}

/**
 * Update import statements in files
 */
function updateImports() {
  console.log('📝 Updating import statements...');
  
  const filesToUpdate = [
    {
      path: 'backend/src/index.js',
      updates: [
        {
          old: "app.use('/api/niem', require('./routes/niem'));",
          new: "app.use('/api/niem', require('./routes/niem/niem-core-routes'));"
        }
      ]
    },
    {
      path: 'backend/src/services/niem/niem-integration-service.js',
      updates: [
        {
          old: "const niemCore = require('./niem-core');",
          new: "const niemCore = require('./niem-core-service');"
        }
      ]
    },
    {
      path: 'backend/src/services/niem/niem-governance-service.js',
      updates: [
        {
          old: "const niemCore = require('./niem-core');",
          new: "const niemCore = require('./niem-core-service');"
        },
        {
          old: "const niemIntegration = require('./niem-integration');",
          new: "const niemIntegration = require('./niem-integration-service');"
        }
      ]
    },
    {
      path: 'backend/src/routes/niem/niem-core-routes.js',
      updates: [
        {
          old: "const niemCore = require('../services/niem-core');",
          new: "const niemCore = require('../services/niem/niem-core-service');"
        },
        {
          old: "const niemIntegration = require('../services/niem-integration');",
          new: "const niemIntegration = require('../services/niem/niem-integration-service');"
        },
        {
          old: "const niemGovernance = require('../services/niem-governance');",
          new: "const niemGovernance = require('../services/niem/niem-governance-service');"
        }
      ]
    }
  ];
  
  filesToUpdate.forEach(({ path: filePath, updates }) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      updates.forEach(({ old, new: newContent }) => {
        if (content.includes(old)) {
          content = content.replace(old, newContent);
          updated = true;
          console.log(`  ✅ Updated: ${filePath}`);
        }
      });
      
      if (updated) {
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

/**
 * Generate standardized schema templates
 */
function generateSchemaTemplates() {
  console.log('📄 Generating schema templates...');
  
  const templates = [
    {
      domain: 'governance',
      component: 'voting',
      filename: 'niem-governance-voting-v1.0.0.schema.json',
      title: 'NIEM Governance Voting Schema',
      description: 'Governance voting mechanisms and rules for DAO registry'
    },
    {
      domain: 'treasury',
      component: 'assets',
      filename: 'niem-treasury-assets-v1.0.0.schema.json',
      title: 'NIEM Treasury Assets Schema',
      description: 'Treasury assets and financial management for DAO registry'
    },
    {
      domain: 'member',
      component: 'roles',
      filename: 'niem-member-roles-v1.0.0.schema.json',
      title: 'NIEM Member Roles Schema',
      description: 'Member roles and permissions for DAO registry'
    },
    {
      domain: 'proposal',
      component: 'lifecycle',
      filename: 'niem-proposal-lifecycle-v1.0.0.schema.json',
      title: 'NIEM Proposal Lifecycle Schema',
      description: 'Proposal lifecycle management for DAO registry'
    },
    {
      domain: 'metadata',
      component: 'quality',
      filename: 'niem-metadata-quality-v1.0.0.schema.json',
      title: 'NIEM Metadata Quality Schema',
      description: 'Data quality metrics and validation for DAO registry'
    }
  ];
  
  templates.forEach(template => {
    const filePath = path.join(CONFIG.niemSchemasDir, template.domain, template.filename);
    const targetDir = path.dirname(filePath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      const schemaContent = generateSchemaTemplate(template);
      fs.writeFileSync(filePath, JSON.stringify(schemaContent, null, 2));
      console.log(`  ✅ Generated: ${filePath}`);
    } else {
      console.log(`  ⚠️  Schema already exists: ${filePath}`);
    }
  });
}

/**
 * Generate a basic schema template
 */
function generateSchemaTemplate(template) {
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": `https://dao-registry.org/niem/${template.domain}/${template.component}`,
    "title": template.title,
    "description": template.description,
    "version": "1.0.0",
    "namespace": `https://dao-registry.org/niem/${template.domain}/${template.component}`,
    "type": "object",
    "definitions": {
      [`${template.component.charAt(0).toUpperCase() + template.component.slice(1)}`]: {
        "type": "object",
        "description": `A ${template.component} for DAO registry`,
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "description": "JSON-LD context for semantic interoperability",
            "default": `https://dao-registry.org/contexts/${template.domain}.jsonld`
          },
          "@type": {
            "type": "string",
            "const": template.component.charAt(0).toUpperCase() + template.component.slice(1),
            "description": `Type identifier for ${template.component}`
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "description": `Unique identifier for the ${template.component}`
          },
          "id": {
            "type": "string",
            "format": "uri",
            "description": `Unique identifier for the ${template.component}`
          },
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 100,
            "description": `Human-readable name of the ${template.component}`
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "description": "Timestamp when the item was created"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "description": "Timestamp when the item was last updated"
          }
        },
        "required": ["id", "name"],
        "additionalProperties": false
      }
    },
    "properties": {
      [template.component]: {
        "$ref": `#/definitions/${template.component.charAt(0).toUpperCase() + template.component.slice(1)}`
      }
    },
    "required": [template.component],
    "additionalProperties": false
  };
}

/**
 * Create migration report
 */
function createMigrationReport() {
  console.log('📊 Creating migration report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      schemasStandardized: 0,
      servicesStandardized: 0,
      routesStandardized: 0,
      importsUpdated: 0
    },
    details: {
      schemas: [],
      services: [],
      routes: [],
      imports: []
    },
    recommendations: [
      "Update all documentation to reflect new naming conventions",
      "Update API documentation with new endpoint paths",
      "Create tests for new file structure",
      "Update deployment scripts if needed",
      "Notify team members of naming convention changes"
    ]
  };
  
  // Count standardized files
  Object.keys(CONFIG.domains).forEach(domain => {
    const domainDir = path.join(CONFIG.niemSchemasDir, domain);
    if (fs.existsSync(domainDir)) {
      const files = fs.readdirSync(domainDir);
      report.summary.schemasStandardized += files.length;
      report.details.schemas.push(...files.map(f => `${domain}/${f}`));
    }
  });
  
  if (fs.existsSync(CONFIG.niemServicesDir)) {
    const files = fs.readdirSync(CONFIG.niemServicesDir);
    report.summary.servicesStandardized = files.length;
    report.details.services = files;
  }
  
  if (fs.existsSync(CONFIG.niemRoutesDir)) {
    const files = fs.readdirSync(CONFIG.niemRoutesDir);
    report.summary.routesStandardized = files.length;
    report.details.routes = files;
  }
  
  // Save report
  const reportPath = 'docs/niem-naming-migration-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  ✅ Migration report saved: ${reportPath}`);
  
  return report;
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting NIEM naming standardization...\n');
  
  try {
    standardizeSchemaNames();
    standardizeServiceNames();
    standardizeRouteNames();
    updateImports();
    generateSchemaTemplates();
    const report = createMigrationReport();
    
    console.log('\n✅ Naming standardization completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  • Schemas standardized: ${report.summary.schemasStandardized}`);
    console.log(`  • Services standardized: ${report.summary.servicesStandardized}`);
    console.log(`  • Routes standardized: ${report.summary.routesStandardized}`);
    console.log(`  • Import statements updated: ${report.summary.importsUpdated}`);
    
    console.log('\n📋 Next steps:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error during standardization:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  standardizeSchemaNames,
  standardizeServiceNames,
  standardizeRouteNames,
  updateImports,
  generateSchemaTemplates,
  createMigrationReport
};
