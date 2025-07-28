const { ethers } = require("hardhat");

async function main() {
  console.log("Checking contract at deployment address...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Load deployment data
    const fs = require("fs");
    const path = require("path");
    const deploymentFile = path.join(__dirname, "..", "deployments", "1337.json");
    
    if (!fs.existsSync(deploymentFile)) {
      console.log("❌ Deployment file not found");
      return;
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const daoRegistryAddress = deploymentData.contracts.daoRegistry;
    
    console.log("DAO Registry address:", daoRegistryAddress);

    // Check if there's a contract at that address
    const code = await deployer.provider.getCode(daoRegistryAddress);
    console.log("Contract code exists:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ No contract deployed at this address");
      return;
    }

    // Try to get the contract factory and attach
    console.log("\nTrying to get DAO Registry contract...");
    const DAORegistry = await ethers.getContractFactory("DAORegistry");
    const daoRegistry = DAORegistry.attach(daoRegistryAddress);

    // Try different functions to see what works
    console.log("\nTesting contract functions...");
    
    try {
      const totalDAOs = await daoRegistry.getTotalDAOs();
      console.log("✓ getTotalDAOs() works:", totalDAOs.toString());
    } catch (error) {
      console.log("❌ getTotalDAOs() failed:", error.message);
    }

    try {
      const owner = await daoRegistry.owner();
      console.log("✓ owner() works:", owner);
    } catch (error) {
      console.log("❌ owner() failed:", error.message);
    }

    try {
      const registrationFee = await daoRegistry.registrationFee();
      console.log("✓ registrationFee() works:", ethers.formatEther(registrationFee), "ETH");
    } catch (error) {
      console.log("❌ registrationFee() failed:", error.message);
    }

    // Try to get the contract's ABI and see what functions are available
    console.log("\nChecking contract interface...");
    const contractInterface = daoRegistry.interface;
    const functions = contractInterface.fragments.filter(f => f.type === 'function');
    console.log("Available functions:", functions.map(f => f.name));

    // Try to call a simple function that should exist
    console.log("\nTrying to call a simple function...");
    try {
      const paused = await daoRegistry.paused();
      console.log("✓ paused() works:", paused);
    } catch (error) {
      console.log("❌ paused() failed:", error.message);
    }

    console.log("\n🎉 Contract check completed!");

  } catch (error) {
    console.error("❌ Contract check failed:", error);
    console.error("Error details:", error.message);
  }
}

// Main execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nCheck completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nCheck failed:", error);
      process.exit(1);
    });
}

module.exports = { main }; 