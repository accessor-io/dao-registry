const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Registering test DAO on local blockchain...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Load deployment addresses
  const deploymentFile = path.join(__dirname, "..", "deployments", "1337.json");
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found. Please run deployment first.");
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const daoRegistryAddress = deploymentData.contracts.daoRegistry;
  const mockTokenAddress = deploymentData.contracts.mockToken;
  const mockTreasuryAddress = deploymentData.contracts.mockTreasury;
  const mockGovernanceAddress = deploymentData.contracts.mockGovernance;

  console.log("DAO Registry address:", daoRegistryAddress);

  // Get the DAO Registry contract
  const DAORegistry = await ethers.getContractFactory("DAORegistry");
  const daoRegistry = DAORegistry.attach(daoRegistryAddress);

  // Check current total DAOs
  const initialTotal = await daoRegistry.getTotalDAOs();
  console.log("Current total DAOs:", initialTotal.toString());

  // Register a test DAO
  const daoData = {
    name: "Test Blockchain DAO",
    symbol: "TBD",
    description: "A test DAO registered on the blockchain for testing the API integration",
    contractAddress: mockGovernanceAddress,
    tokenAddress: mockTokenAddress,
    treasuryAddress: mockTreasuryAddress,
    governanceAddress: mockGovernanceAddress,
    chainId: 1337,
    governanceType: 0, // TokenWeighted
    votingPeriod: 86400, // 1 day
    quorum: 1000, // 10%
    proposalThreshold: ethers.parseEther("1000"),
    tags: ["test", "blockchain", "integration"],
    socialLinks: {
      twitter: "https://twitter.com/testdao",
      discord: "https://discord.gg/testdao",
      telegram: "https://t.me/testdao",
      github: "https://github.com/testdao",
      medium: "https://medium.com/testdao",
      reddit: "https://reddit.com/r/testdao"
    }
  };

  console.log("\nRegistering DAO with data:", {
    name: daoData.name,
    symbol: daoData.symbol,
    contractAddress: daoData.contractAddress,
    chainId: daoData.chainId
  });

  // Get registration fee
  const registrationFee = await daoRegistry.registrationFee();
  console.log("Registration fee:", ethers.formatEther(registrationFee), "ETH");

  // Register the DAO
  const tx = await daoRegistry.registerDAO(
    daoData.name,
    daoData.symbol,
    daoData.description,
    daoData.contractAddress,
    daoData.tokenAddress,
    daoData.treasuryAddress,
    daoData.governanceAddress,
    daoData.chainId,
    daoData.governanceType,
    daoData.votingPeriod,
    daoData.quorum,
    daoData.proposalThreshold,
    daoData.tags,
    daoData.socialLinks,
    { value: registrationFee }
  );

  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✓ DAO registered successfully!");

  // Check updated total DAOs
  const newTotal = await daoRegistry.getTotalDAOs();
  console.log("Updated total DAOs:", newTotal.toString());

  // Get the registered DAO info
  const daoId = "1"; // First DAO
  const daoInfo = await daoRegistry.getDAO(daoId);
  console.log("\n✓ DAO info retrieved from blockchain:");
  console.log("  Name:", daoInfo.name);
  console.log("  Symbol:", daoInfo.symbol);
  console.log("  Description:", daoInfo.description);
  console.log("  Contract Address:", daoInfo.contractAddress);
  console.log("  Chain ID:", daoInfo.chainId.toString());
  console.log("  Verified:", daoInfo.verified);
  console.log("  Active:", daoInfo.active);

  // Verify the DAO
  console.log("\nVerifying DAO...");
  const verifyTx = await daoRegistry.verifyDAO(daoId, true);
  await verifyTx.wait();
  console.log("✓ DAO verified successfully!");

  // Check verification status
  const verifiedDAO = await daoRegistry.getDAO(daoId);
  console.log("✓ DAO verification status:", verifiedDAO.verified);

  console.log("\n🎉 Test DAO registration completed!");
  console.log("You can now test the API at: http://localhost:3000/api/v1/daos");

  return {
    daoId,
    daoInfo: verifiedDAO,
    transactionHash: tx.hash
  };
}

// Main execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nScript completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nScript failed:", error);
      process.exit(1);
    });
}

module.exports = { main }; 