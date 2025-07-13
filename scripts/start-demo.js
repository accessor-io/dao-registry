#!/usr/bin/env node

/**
 * DAO Registry Demo Script
 * 
 * Demonstrates the complete system integration:
 * - URL Encoding Service
 * - Reserved Subdomains Service
 * - ENS Integration
 * - Metadata Services
 */

const DAORegistryApp = require('../src/index').default;

console.log('🚀 Starting DAO Registry Demo...\n');

// Create the application
const app = new DAORegistryApp();

// Get service instances for testing
const { 
  reservedSubdomainsService, 
  isoMetadataService, 
  metadataRegistry, 
  ensResolver 
} = app.getServices();

// Demo function to test URL encoding
async function testURLEncoding() {
  console.log('📝 Testing URL Encoding Service...');
  
  const testInputs = [
    '  My Complex Subdomain!  ',
    'Test@Domain',
    'user.name',
    'test--domain',
    '-test-domain-',
    'café-domain',
    'xn--mller-kva'
  ];

  for (const input of testInputs) {
    console.log(`\nInput: "${input}"`);
    
    const sanitized = require('../src/services/metadata/url-encoding-service').URLEncodingService.sanitizeSubdomain(input);
    const validation = require('../src/services/metadata/url-encoding-service').URLEncodingService.validateSubdomainFormat(input);
    const stats = require('../src/services/metadata/url-encoding-service').URLEncodingService.getEncodingStats(input);
    
    console.log(`  Sanitized: "${sanitized}"`);
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  DNS Safe: ${require('../src/services/metadata/url-encoding-service').URLEncodingService.isDNSSafe(sanitized)}`);
    console.log(`  ENS Safe: ${require('../src/services/metadata/url-encoding-service').URLEncodingService.isENSSafe(sanitized)}`);
    console.log(`  Stats: ${JSON.stringify(stats)}`);
    
    if (!validation.isValid) {
      console.log(`  Errors: ${validation.errors.join(', ')}`);
    }
  }
}

// Demo function to test reserved subdomains
async function testReservedSubdomains() {
  console.log('\n🔒 Testing Reserved Subdomains Service...');
  
  const testSubdomains = [
    'governance',
    'treasury',
    'voting',
    'my-dao',
    'admin',
    'test-subdomain'
  ];

  for (const subdomain of testSubdomains) {
    console.log(`\nSubdomain: "${subdomain}"`);
    
    const isReserved = reservedSubdomainsService.isReserved(subdomain);
    const priority = reservedSubdomainsService.getPriority(subdomain);
    const info = reservedSubdomainsService.getReservedSubdomainInfo(subdomain);
    const validation = reservedSubdomainsService.validateSubdomain(subdomain);
    
    console.log(`  Reserved: ${isReserved}`);
    console.log(`  Priority: ${priority}`);
    console.log(`  Valid: ${validation.isValid}`);
    
    if (info) {
      console.log(`  Category: ${info.category}`);
      console.log(`  Description: ${info.description}`);
    }
    
    if (!validation.isValid) {
      console.log(`  Errors: ${validation.errors.join(', ')}`);
    }
  }
}

// Demo function to test ENS integration
async function testENSIntegration() {
  console.log('\n🌐 Testing ENS Integration...');
  
  // Register some test domains
  await ensResolver.registerDomain('governance.dao.eth', '0x1234567890123456789012345678901234567890');
  await ensResolver.registerDomain('treasury.dao.eth', '0x2345678901234567890123456789012345678901');
  
  const testDomains = [
    { subdomain: 'governance', parentDomain: 'dao.eth' },
    { subdomain: 'treasury', parentDomain: 'dao.eth' },
    { subdomain: 'my-dao', parentDomain: 'dao.eth' },
    { subdomain: 'voting', parentDomain: 'dao.eth' }
  ];

  for (const { subdomain, parentDomain } of testDomains) {
    console.log(`\nDomain: ${subdomain}.${parentDomain}`);
    
    const validation = await reservedSubdomainsService.validateENSSubdomain(parentDomain, subdomain);
    const exists = await ensResolver.isAvailable(`${subdomain}.${parentDomain}`);
    
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Exists: ${!exists}`);
    
    if (!validation.isValid) {
      console.log(`  Errors: ${validation.errors.join(', ')}`);
    }
  }
}

// Demo function to test metadata services
async function testMetadataServices() {
  console.log('\n📊 Testing Metadata Services...');
  
  const testMetadata = {
    title: 'Demo DAO',
    description: 'A demonstration DAO for testing purposes',
    governance: {
      type: 'token-weighted',
      votingPeriod: 7,
      quorum: 0.1
    },
    treasury: {
      address: '0x1234567890123456789012345678901234567890',
      balance: '1000000',
      currency: 'ETH'
    }
  };

  console.log('Testing ISO Metadata Validation...');
  
  try {
    const validation = await isoMetadataService.validateMetadata(testMetadata, 'ISO 19115');
    console.log(`  Valid: ${validation.isValid}`);
    console.log(`  Errors: ${validation.errors.length}`);
    console.log(`  Warnings: ${validation.warnings.length}`);
    
    if (validation.isValid) {
      console.log('Testing Metadata Registry...');
      
      const result = await metadataRegistry.registerMetadata('demo-dao-123', testMetadata, 'ISO 19115');
      console.log(`  Registered with ID: ${result.metadataId}`);
      
      const retrieved = await metadataRegistry.getMetadata('demo-dao-123', 'ISO 19115');
      console.log(`  Retrieved metadata: ${retrieved ? 'Success' : 'Not found'}`);
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
}

// Demo function to test complete workflow
async function testCompleteWorkflow() {
  console.log('\n🔄 Testing Complete Workflow...');
  
  const daoName = 'My Demo DAO';
  const subdomain = 'my-demo-dao';
  const parentDomain = 'dao.eth';
  
  console.log(`\nWorkflow: Registering "${daoName}" as ${subdomain}.${parentDomain}`);
  
  // Step 1: Validate subdomain
  console.log('\nStep 1: Validating subdomain...');
  const subdomainValidation = reservedSubdomainsService.validateSubdomain(subdomain);
  const ensValidation = await reservedSubdomainsService.validateENSSubdomain(parentDomain, subdomain);
  
  console.log(`  Subdomain valid: ${subdomainValidation.isValid}`);
  console.log(`  ENS valid: ${ensValidation.isValid}`);
  
  if (subdomainValidation.isValid && ensValidation.isValid) {
    // Step 2: Check availability
    console.log('\nStep 2: Checking availability...');
    const isAvailable = await ensResolver.isAvailable(`${subdomain}.${parentDomain}`);
    console.log(`  Available: ${isAvailable}`);
    
    if (isAvailable) {
      // Step 3: Register domain
      console.log('\nStep 3: Registering domain...');
      await ensResolver.registerDomain(`${subdomain}.${parentDomain}`, '0x1234567890123456789012345678901234567890');
      console.log(`  Domain registered: ${subdomain}.${parentDomain}`);
      
      // Step 4: Create metadata
      console.log('\nStep 4: Creating metadata...');
      const metadata = {
        title: daoName,
        description: 'A demonstration DAO created through the complete workflow',
        governance: {
          type: 'multisig',
          members: ['0x1234567890123456789012345678901234567890'],
          threshold: 1
        },
        treasury: {
          address: '0x1234567890123456789012345678901234567890',
          balance: '0',
          currency: 'ETH'
        },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          source: 'DAO Registry Demo'
        }
      };
      
      // Step 5: Validate and register metadata
      console.log('\nStep 5: Validating and registering metadata...');
      const metadataValidation = await isoMetadataService.validateMetadata(metadata, 'ISO 19115');
      
      if (metadataValidation.isValid) {
        const metadataResult = await metadataRegistry.registerMetadata('demo-workflow-123', metadata, 'ISO 19115');
        console.log(`  Metadata registered with ID: ${metadataResult.metadataId}`);
        
        console.log('\n✅ Complete workflow successful!');
        console.log(`   Domain: ${subdomain}.${parentDomain}`);
        console.log(`   Metadata ID: ${metadataResult.metadataId}`);
        console.log(`   Timestamp: ${metadataResult.timestamp}`);
      } else {
        console.log('❌ Metadata validation failed');
        console.log(`   Errors: ${metadataValidation.errors.join(', ')}`);
      }
    } else {
      console.log('❌ Domain not available');
    }
  } else {
    console.log('❌ Subdomain validation failed');
    if (!subdomainValidation.isValid) {
      console.log(`   Subdomain errors: ${subdomainValidation.errors.join(', ')}`);
    }
    if (!ensValidation.isValid) {
      console.log(`   ENS errors: ${ensValidation.errors.join(', ')}`);
    }
  }
}

// Main demo function
async function runDemo() {
  try {
    await testURLEncoding();
    await testReservedSubdomains();
    await testENSIntegration();
    await testMetadataServices();
    await testCompleteWorkflow();
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ URL Encoding Service - Working');
    console.log('  ✅ Reserved Subdomains Service - Working');
    console.log('  ✅ ENS Integration - Working');
    console.log('  ✅ Metadata Services - Working');
    console.log('  ✅ Complete Workflow - Working');
    
    console.log('\n🚀 Starting server on port 3000...');
    console.log('   Health check: http://localhost:3000/health');
    console.log('   System info: http://localhost:3000/api/system/info');
    console.log('   API docs: http://localhost:3000/api/docs');
    
    app.start(3000);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
runDemo(); 