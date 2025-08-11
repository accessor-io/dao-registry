const { ethers } = require("hardhat");
const { DAOContractService } = require("../src/services/blockchain/dao-contract-service");

async function main() {
  console.log("Testing blockchain connection...");

  try {
    // Test 1: Basic Hardhat connection
    console.log("\n1. Testing Hardhat connection...");
    const [deployer] = await ethers.getSigners();
    console.log("✓ Connected to Hardhat network");
    console.log("  Account:", deployer.address);
    console.log("  Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // Test 2: Load deployment data
    console.log("\n2. Loading deployment data...");
    const fs = require("fs");
    const path = require("path");
    const deploymentFile = path.join(__dirname, "..", "deployments", "1337.json");
    
    if (!fs.existsSync(deploymentFile)) {
      console.log("❌ Deployment file not found");
      return;
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("✓ Deployment data loaded");
    console.log("  DAO Registry:", deploymentData.contracts.daoRegistry);

    // Test 3: Connect to DAO Registry contract
    console.log("\n3. Connecting to DAO Registry contract...");
    const DAORegistry = await ethers.getContractFactory("DAORegistry");
    const daoRegistry = DAORegistry.attach(deploymentData.contracts.daoRegistry);
    
    const totalDAOs = await daoRegistry.getTotalDAOs();
    console.log("✓ Connected to DAO Registry contract");
    console.log("  Total DAOs:", totalDAOs.toString());

    // Test 4: Test blockchain service
    console.log("\n4. Testing blockchain service...");
    const blockchainService = new DAOContractService();
    
    // Check if localhost network is supported
    const supportedNetworks = blockchainService.getSupportedNetworks();
    console.log("  Supported networks:", supportedNetworks);
    
    if (blockchainService.isNetworkSupported(1337)) {
      console.log("✓ Localhost network (1337) is supported");
      
      // Try to get DAOs
      const result = await blockchainService.getAllDAOs({}, { page: 1, limit: 10 });
      console.log("✓ Blockchain service working");
      console.log("  Retrieved DAOs:", result.daos.length);
      console.log("  Total DAOs:", result.total);
      
      if (result.daos.length > 0) {
        console.log("  First DAO:", result.daos[0].name);
      }
    } else {
      console.log("❌ Localhost network (1337) not supported");
    }

    // Test 5: Test individual DAO retrieval
    if (totalDAOs > 0) {
      console.log("\n5. Testing individual DAO retrieval...");
      const dao = await blockchainService.getDAOById("1", 1337);
      if (dao) {
        console.log("✓ Individual DAO retrieval working");
        console.log("  DAO Name:", dao.name);
        console.log("  DAO Symbol:", dao.symbol);
        console.log("  Contract Address:", dao.contractAddress);
      } else {
        console.log("❌ Individual DAO retrieval failed");
      }
    }

    console.log("\n🎉 Blockchain connection test completed!");

  } catch (error) {
    console.error("❌ Blockchain connection test failed:", error);
    console.error("Error details:", error.message);
  }
}

// Main execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nTest completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nTest failed:", error);
      process.exit(1);
    });
}

module.exports = { main }; 