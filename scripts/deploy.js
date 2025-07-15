const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting DAO Registry deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy DAO Registry
  console.log("\nDeploying DAO Registry...");
  const DAORegistry = await ethers.getContractFactory("DAORegistry");
  const daoRegistry = await DAORegistry.deploy();
  await daoRegistry.deployed();

  console.log("DAO Registry deployed to:", daoRegistry.address);

  // Deploy Mock Governance Token for testing
  console.log("\nDeploying Mock Governance Token...");
  const MockToken = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockToken.deploy("Mock DAO Token", "MDAO");
  await mockToken.deployed();

  console.log("Mock Governance Token deployed to:", mockToken.address);

  // Deploy Mock Treasury for testing
  console.log("\nDeploying Mock Treasury...");
  const MockTreasury = await ethers.getContractFactory("MockTreasury");
  const mockTreasury = await MockTreasury.deploy();
  await mockTreasury.deployed();

  console.log("Mock Treasury deployed to:", mockTreasury.address);

  // Deploy Mock Governance for testing
  console.log("\nDeploying Mock Governance...");
  const MockGovernance = await ethers.getContractFactory("MockGovernance");
  const mockGovernance = await MockGovernance.deploy(
    mockToken.address,
    daoRegistry.address
  );
  await mockGovernance.deployed();

  console.log("Mock Governance deployed to:", mockGovernance.address);

  // Verify contracts on Etherscan (if not on localhost)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1337 && network.chainId !== 31337) {
    console.log("\nWaiting for block confirmations...");
    await daoRegistry.deployTransaction.wait(6);
    await mockToken.deployTransaction.wait(6);
    await mockTreasury.deployTransaction.wait(6);
    await mockGovernance.deployTransaction.wait(6);

    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: daoRegistry.address,
        constructorArguments: [],
      });
      console.log("DAO Registry verified on Etherscan");
    } catch (error) {
      console.log("DAO Registry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: mockToken.address,
        constructorArguments: ["Mock DAO Token", "MDAO"],
      });
      console.log("Mock Token verified on Etherscan");
    } catch (error) {
      console.log("Mock Token verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: mockTreasury.address,
        constructorArguments: [],
      });
      console.log("Mock Treasury verified on Etherscan");
    } catch (error) {
      console.log("Mock Treasury verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: mockGovernance.address,
        constructorArguments: [mockToken.address, daoRegistry.address],
      });
      console.log("Mock Governance verified on Etherscan");
    } catch (error) {
      console.log("Mock Governance verification failed:", error.message);
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      daoRegistry: daoRegistry.address,
      mockToken: mockToken.address,
      mockTreasury: mockTreasury.address,
      mockGovernance: mockGovernance.address,
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
  console.log("DAO Registry:", daoRegistry.address);
  console.log("Mock Token:", mockToken.address);
  console.log("Mock Treasury:", mockTreasury.address);
  console.log("Mock Governance:", mockGovernance.address);

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
      contractAddress: mockGovernance.address,
      tokenAddress: mockToken.address,
      treasuryAddress: mockTreasury.address,
      governanceAddress: mockGovernance.address,
      chainId: await deployer.provider.getNetwork().then(n => n.chainId),
      governanceType: 0, // TokenWeighted
      votingPeriod: 86400, // 1 day
      quorum: 1000, // 10%
      proposalThreshold: ethers.utils.parseEther("1000"),
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

// Helper function to get network info
async function getNetworkInfo() {
  const network = await ethers.provider.getNetwork();
  const blockNumber = await ethers.provider.getBlockNumber();
  const gasPrice = await ethers.provider.getGasPrice();

  return {
    name: network.name,
    chainId: network.chainId,
    blockNumber,
    gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
  };
}

// Helper function to estimate gas costs
async function estimateGasCosts(daoRegistry, mockToken, mockTreasury, mockGovernance) {
  console.log("\nEstimating gas costs...");

  const [deployer] = await ethers.getSigners();
  const gasPrice = await ethers.provider.getGasPrice();

  // Estimate registration fee
  const registrationFee = await daoRegistry.registrationFee();
  console.log("Registration fee:", ethers.utils.formatEther(registrationFee), "ETH");

  // Estimate gas for DAO registration
  const daoData = {
    name: "Test DAO",
    symbol: "TEST",
    description: "A test DAO for gas estimation",
    contractAddress: mockGovernance.address,
    tokenAddress: mockToken.address,
    treasuryAddress: mockTreasury.address,
    governanceAddress: mockGovernance.address,
    chainId: await deployer.provider.getNetwork().then(n => n.chainId),
    governanceType: 0,
    votingPeriod: 86400,
    quorum: 1000,
    proposalThreshold: ethers.utils.parseEther("1000"),
    tags: ["test"],
    socialLinks: {
      twitter: "",
      discord: "",
      telegram: "",
      github: "",
      medium: "",
      reddit: ""
    }
  };

  const estimatedGas = await daoRegistry.estimateGas.registerDAO(
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

  const gasCost = estimatedGas.mul(gasPrice);
  console.log("Estimated gas for DAO registration:", estimatedGas.toString());
  console.log("Estimated gas cost:", ethers.utils.formatEther(gasCost), "ETH");

  return {
    registrationFee: ethers.utils.formatEther(registrationFee),
    estimatedGas: estimatedGas.toString(),
    gasCost: ethers.utils.formatEther(gasCost),
  };
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

module.exports = { main, testDeployment, estimateGasCosts }; 