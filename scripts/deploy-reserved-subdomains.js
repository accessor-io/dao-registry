const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ReservedSubdomains contract...");

  // Get the contract factory
  const ReservedSubdomains = await ethers.getContractFactory("ReservedSubdomains");

  // Deploy the contract
  const reservedSubdomains = await ReservedSubdomains.deploy();
  await reservedSubdomains.waitForDeployment();

  console.log("ReservedSubdomains deployed to:", await reservedSubdomains.getAddress());

  // Get network info early
  const network = await ethers.provider.getNetwork();

  // Verify deployment by checking critical schemas
  console.log("\nVerifying deployment...");
  
  const criticalSchemas = [
    "governance", "treasury", "token", "api"
  ];

  for (const schema of criticalSchemas) {
    try {
      const hasSchema = await reservedSubdomains.hasSubdomainSchema(schema);
      const priority = await reservedSubdomains.getSchemaPriority(schema);
      
      if (hasSchema) {
        console.log(`✓ Schema '${schema}' is defined with priority: ${priority}`);
        
        // Get full schema information
        const schemaInfo = await reservedSubdomains.getSchema(schema);
        console.log(`  - Version: ${schemaInfo.version}`);
        console.log(`  - Category: ${schemaInfo.category}`);
        console.log(`  - Description: ${schemaInfo.description}`);
        console.log(`  - CCIP Interface: ${schemaInfo.ccipInterface}`);
        console.log(`  - API Endpoint: ${schemaInfo.apiEndpoint}`);
        console.log(`  - Documentation: ${schemaInfo.documentationUrl}`);
        console.log(`  - Fields: ${schemaInfo.fields.length}`);
      } else {
        console.log(`✗ Schema '${schema}' is NOT defined`);
      }
    } catch (error) {
      console.log(`✗ Error checking schema '${schema}':`, error.message);
    }
  }

  // Test CCIP data storage
  console.log("\nTesting CCIP data storage...");
  
  try {
    // Add deployer as data provider
    const [deployer] = await ethers.getSigners();
    await reservedSubdomains.addDataProvider(deployer.address);
    console.log("✓ Added deployer as data provider");

    // Store sample governance data
    const fieldNames = ["proposalCount", "activeProposals", "votingPeriod"];
    const fieldValues = [
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [5]),
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [2]),
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [604800])
    ];

    await reservedSubdomains.storeCCIPData(
      "governance",
      "1.0.0",
      fieldNames,
      fieldValues
    );
    console.log("✓ Stored governance CCIP data");

    // Get data hashes for governance
    const dataHashes = await reservedSubdomains.getSubdomainDataHashes("governance");
    console.log(`✓ Found ${dataHashes.length} data entries for governance`);

    if (dataHashes.length > 0) {
      // Get the first data entry
      const ccipData = await reservedSubdomains.getCCIPData("governance", dataHashes[0]);
      console.log("✓ Retrieved CCIP data:");
      console.log(`  - Subdomain: ${ccipData.subdomain}`);
      console.log(`  - Version: ${ccipData.schemaVersion}`);
      console.log(`  - Data Hash: ${ccipData.dataHash}`);
      console.log(`  - Timestamp: ${ccipData.timestamp}`);
      console.log(`  - Provider: ${ccipData.dataProvider}`);
      console.log(`  - Valid: ${ccipData.isValid}`);
      console.log(`  - Field Names: ${ccipData.fieldNames.join(", ")}`);
      console.log(`  - Field Values: ${ccipData.fieldValues.length} values`);
    }

  } catch (error) {
    console.log("✗ Error testing CCIP data storage:", error.message);
  }

  // Test statistics
  console.log("\nTesting statistics...");
  
  try {
    const stats = await reservedSubdomains.getStatistics();
    console.log("✓ Statistics:");
    console.log(`  - Total Schemas: ${stats.total}`);
    console.log(`  - Critical: ${stats.critical}`);
    console.log(`  - High: ${stats.high}`);
    console.log(`  - Medium: ${stats.medium}`);
    console.log(`  - Low: ${stats.low}`);
  } catch (error) {
    console.log("✗ Error getting statistics:", error.message);
  }

  // Test access control
  console.log("\nTesting access control...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const isAdmin = await reservedSubdomains.isAdministrator(deployer.address);
    const isDataProvider = await reservedSubdomains.isDataProvider(deployer.address);
    
    console.log(`✓ Deployer is administrator: ${isAdmin}`);
    console.log(`✓ Deployer is data provider: ${isDataProvider}`);
  } catch (error) {
    console.log("✗ Error testing access control:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Contract: ${await reservedSubdomains.getAddress()}`);
  console.log("✓ ReservedSubdomains contract deployed successfully!");
  console.log("✓ Schema-based approach implemented");
  console.log("✓ CCIP-compatible data structures ready");
  console.log("✓ API-queryable endpoints configured");
  console.log("\nThe contract now provides standardized schemas for:");
  console.log("- Governance data (proposals, voting, etc.)");
  console.log("- Treasury data (balances, tokens, etc.)");
  console.log("- Token data (supply, holders, etc.)");
  console.log("- API data (endpoints, versions, etc.)");
  console.log("\nThese schemas can be queried via API and CCIP on-chain reads!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 