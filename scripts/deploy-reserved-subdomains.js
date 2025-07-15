const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ReservedSubdomains contract...");

  // Get the contract factory
  const ReservedSubdomains = await ethers.getContractFactory("ReservedSubdomains");

  // Deploy the contract
  const reservedSubdomains = await ReservedSubdomains.deploy();
  await reservedSubdomains.deployed();

  console.log("ReservedSubdomains deployed to:", reservedSubdomains.address);

  // Verify deployment by checking critical reserved subdomains
  console.log("\nVerifying deployment...");
  
  const criticalSubdomains = [
    "governance", "treasury", "token", "docs", "forum", "analytics",
    "admin", "system", "root", "www", "api"
  ];

  console.log("Checking critical reserved subdomains:");
  for (const subdomain of criticalSubdomains) {
    const isReserved = await reservedSubdomains.isReserved(subdomain);
    const priority = await reservedSubdomains.getSubdomainPriority(subdomain);
    
    console.log(`  ${subdomain}: reserved=${isReserved}, priority=${priority}`);
    
    if (!isReserved) {
      throw new Error(`Critical subdomain ${subdomain} is not reserved!`);
    }
  }

  // Check high priority subdomains
  console.log("\nChecking high priority reserved subdomains:");
  const highPrioritySubdomains = [
    "voting", "proposals", "executive", "council",
    "vault", "rewards", "staking", "liquidity",
    "erc20", "nft", "vesting", "airdrop"
  ];

  for (const subdomain of highPrioritySubdomains) {
    const isReserved = await reservedSubdomains.isReserved(subdomain);
    const priority = await reservedSubdomains.getSubdomainPriority(subdomain);
    
    console.log(`  ${subdomain}: reserved=${isReserved}, priority=${priority}`);
    
    if (!isReserved) {
      throw new Error(`High priority subdomain ${subdomain} is not reserved!`);
    }
  }

  // Get statistics
  const stats = await reservedSubdomains.getStatistics();
  console.log("\nDeployment Statistics:");
  console.log(`  Total reserved subdomains: ${stats.total}`);
  console.log(`  Critical (Priority 1): ${stats.critical}`);
  console.log(`  High (Priority 2): ${stats.high}`);
  console.log(`  Medium (Priority 3): ${stats.medium}`);
  console.log(`  Low (Priority 4): ${stats.low}`);

  // Test administrator functions
  console.log("\nTesting administrator functions...");
  
  const [deployer] = await ethers.getSigners();
  const isAdmin = await reservedSubdomains.isAdministrator(deployer.address);
  console.log(`  Deployer is administrator: ${isAdmin}`);

  if (!isAdmin) {
    throw new Error("Deployer should be an administrator!");
  }

  // Test adding a new reserved subdomain
  console.log("\nTesting dynamic subdomain reservation...");
  
  const testSubdomain = "test-reserved";
  const isTestReserved = await reservedSubdomains.isReserved(testSubdomain);
  console.log(`  Test subdomain ${testSubdomain} is reserved: ${isTestReserved}`);

  if (isTestReserved) {
    throw new Error("Test subdomain should not be reserved initially!");
  }

  // Reserve the test subdomain
  const allowedRoles = ["DAO owners"];
  const restrictions = ["Test restriction"];
  
  await reservedSubdomains.reserveSubdomain(
    testSubdomain,
    2, // HIGH priority
    "Test Category",
    "Test subdomain for verification",
    allowedRoles,
    restrictions
  );

  console.log(`  Reserved test subdomain: ${testSubdomain}`);
  
  const isNowReserved = await reservedSubdomains.isReserved(testSubdomain);
  const testPriority = await reservedSubdomains.getSubdomainPriority(testSubdomain);
  
  console.log(`  Test subdomain is now reserved: ${isNowReserved}, priority: ${testPriority}`);

  if (!isNowReserved) {
    throw new Error("Test subdomain should be reserved after reservation!");
  }

  // Test releasing the subdomain
  await reservedSubdomains.releaseSubdomain(testSubdomain);
  console.log(`  Released test subdomain: ${testSubdomain}`);
  
  const isReleased = await reservedSubdomains.isReserved(testSubdomain);
  console.log(`  Test subdomain is now released: ${!isReleased}`);

  if (isReleased) {
    throw new Error("Test subdomain should be released!");
  }

  // Test moderator functions
  console.log("\nTesting moderator functions...");
  
  const testModerator = ethers.Wallet.createRandom();
  await reservedSubdomains.addModerator(testModerator.address);
  
  const isModerator = await reservedSubdomains.isModerator(testModerator.address);
  console.log(`  Test moderator is moderator: ${isModerator}`);

  if (!isModerator) {
    throw new Error("Test moderator should be a moderator!");
  }

  // Clean up test moderator
  await reservedSubdomains.removeModerator(testModerator.address);
  const isNoLongerModerator = await reservedSubdomains.isModerator(testModerator.address);
  console.log(`  Test moderator is no longer moderator: ${!isNoLongerModerator}`);

  // Test error conditions
  console.log("\nTesting error conditions...");
  
  try {
    await reservedSubdomains.reserveSubdomain("governance", 1, "Test", "Test", [], []);
    throw new Error("Should not be able to reserve already reserved subdomain!");
  } catch (error) {
    console.log("  ✓ Correctly prevented reserving already reserved subdomain");
  }

  try {
    await reservedSubdomains.releaseSubdomain("nonexistent");
    throw new Error("Should not be able to release non-existent subdomain!");
  } catch (error) {
    console.log("  ✓ Correctly prevented releasing non-existent subdomain");
  }

  // Test with non-administrator
  const nonAdmin = ethers.Wallet.createRandom();
  const nonAdminContract = reservedSubdomains.connect(nonAdmin);
  
  try {
    await nonAdminContract.reserveSubdomain("test", 1, "Test", "Test", [], []);
    throw new Error("Non-administrator should not be able to reserve subdomains!");
  } catch (error) {
    console.log("  ✓ Correctly prevented non-administrator from reserving subdomains");
  }

  console.log("\nAll tests passed! ReservedSubdomains contract is working correctly.");
  console.log("\nDeployment Summary:");
  console.log(`  Contract Address: ${reservedSubdomains.address}`);
  console.log(`  Network: ${network.name}`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Total Reserved Subdomains: ${stats.total}`);

  // Save deployment info
  const deploymentInfo = {
    contract: "ReservedSubdomains",
    address: reservedSubdomains.address,
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    statistics: {
      total: stats.total.toString(),
      critical: stats.critical.toString(),
      high: stats.high.toString(),
      medium: stats.medium.toString(),
      low: stats.low.toString()
    },
    criticalSubdomains,
    highPrioritySubdomains
  };

  console.log("\nDeployment Info (for verification):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return reservedSubdomains;
}

// Execute deployment
main()
  .then(() => {
    console.log("\n🎉 ReservedSubdomains deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nReservedSubdomains deployment failed:", error);
    process.exit(1);
  }); 