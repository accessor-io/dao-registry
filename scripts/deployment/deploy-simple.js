const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting simplified DAO Registry deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy DAO Registry
  console.log("\nDeploying DAO Registry...");
  const DAORegistry = await ethers.getContractFactory("DAORegistry");
  const daoRegistry = await DAORegistry.deploy();
  await daoRegistry.waitForDeployment();

  console.log("DAO Registry deployed to:", await daoRegistry.getAddress());

  // Deploy Mock Governance Token for testing
  console.log("\nDeploying Mock Governance Token...");
  const MockToken = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockToken.deploy("Mock DAO Token", "MDAO", 18);
  await mockToken.waitForDeployment();

  console.log("Mock Governance Token deployed to:", await mockToken.getAddress());

  // Deploy Mock Treasury for testing
  console.log("\nDeploying Mock Treasury...");
  const MockTreasury = await ethers.getContractFactory("MockTreasury");
  const mockTreasury = await MockTreasury.deploy();
  await mockTreasury.waitForDeployment();

  console.log("Mock Treasury deployed to:", await mockTreasury.getAddress());

  // Deploy Mock Governance for testing
  console.log("\nDeploying Mock Governance...");
  const MockGovernance = await ethers.getContractFactory("MockGovernance");
  const mockGovernance = await MockGovernance.deploy(
    await mockToken.getAddress(),
    await daoRegistry.getAddress()
  );
  await mockGovernance.waitForDeployment();

  console.log("Mock Governance deployed to:", await mockGovernance.getAddress());

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      daoRegistry: await daoRegistry.getAddress(),
      mockToken: await mockToken.getAddress(),
      mockTreasury: await mockTreasury.getAddress(),
      mockGovernance: await mockGovernance.getAddress(),
    },
    deploymentTime: new Date().toISOString(),
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\nDeployment completed successfully!");
  console.log("Deployment info saved to:", deploymentFile);
  console.log("\nContract Addresses:");
  console.log("DAO Registry:", await daoRegistry.getAddress());
  console.log("Mock Token:", await mockToken.getAddress());
  console.log("Mock Treasury:", await mockTreasury.getAddress());
  console.log("Mock Governance:", await mockGovernance.getAddress());

  // Test the deployment
  console.log("\nRunning deployment tests...");
  await testDeployment(daoRegistry, mockToken, mockTreasury, mockGovernance);

  return {
    daoRegistry,
    mockToken,
    mockTreasury,
    mockGovernance,
  };
}

async function testDeployment(daoRegistry, mockToken, mockTreasury, mockGovernance) {
  try {
    console.log("Testing DAO Registry functionality...");

    // Test 1: Check initial state
    const totalDAOs = await daoRegistry.getTotalDAOs();
    console.log("✓ Initial total DAOs:", totalDAOs.toString());

    // Test 2: Register a test DAO
    const [deployer] = await ethers.getSigners();
    
    const daoData = {
      name: "Test DAO",
      symbol: "TEST",
      description: "A test DAO for deployment verification",
      contractAddress: await mockGovernance.getAddress(),
      tokenAddress: await mockToken.getAddress(),
      treasuryAddress: await mockTreasury.getAddress(),
      governanceAddress: await mockGovernance.getAddress(),
      chainId: await deployer.provider.getNetwork().then(n => n.chainId),
      governanceType: 0, // TokenWeighted
      votingPeriod: 86400, // 1 day
      quorum: 1000, // 10%
      proposalThreshold: ethers.parseEther("1000"),
      tags: ["test", "deployment"],
      socialLinks: {
        twitter: "",
        discord: "",
        telegram: "",
        github: "",
        medium: "",
        reddit: ""
      }
    };

    const registrationFee = await daoRegistry.registrationFee();
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

    await tx.wait();
    console.log("✓ Test DAO registered successfully");

    // Test 3: Verify DAO was registered
    const newTotalDAOs = await daoRegistry.getTotalDAOs();
    console.log("✓ Updated total DAOs:", newTotalDAOs.toString());

    // Test 4: Get DAO info
    const daoId = "1"; // First DAO
    const daoInfo = await daoRegistry.getDAO(daoId);
    console.log("✓ DAO info retrieved:", daoInfo.name);

    // Test 5: Verify DAO
    const verifyTx = await daoRegistry.verifyDAO(daoId, true);
    await verifyTx.wait();
    console.log("✓ DAO verified successfully");

    // Test 6: Check verification status
    const verifiedDAO = await daoRegistry.getDAO(daoId);
    console.log("✓ DAO verification status:", verifiedDAO.verified);

    console.log("\n🎉 All deployment tests passed!");

  } catch (error) {
    console.error("Deployment test failed:", error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  main()
    .then(() => {
      console.log("\nDeployment script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nDeployment script failed:", error);
      process.exit(1);
    });
}

module.exports = { main, testDeployment }; 