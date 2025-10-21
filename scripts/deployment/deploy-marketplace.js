/**
 * Deploy Marketplace Contract
 * Deploys the ENS Marketplace contract with proper configuration
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting Marketplace deployment...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log('💰 Account balance:', ethers.utils.formatEther(balance), 'ETH');

  if (balance.lt(ethers.utils.parseEther('0.1'))) {
    throw new Error('❌ Insufficient balance for deployment');
  }

  // Deploy Marketplace contract
  console.log('📦 Deploying Marketplace contract...');
  const Marketplace = await ethers.getContractFactory('Marketplace');
  
  // Set fee recipient (can be the deployer or a multisig)
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  console.log('💸 Fee recipient:', feeRecipient);

  const marketplace = await Marketplace.deploy(feeRecipient);
  await marketplace.deployed();

  console.log('✅ Marketplace deployed to:', marketplace.address);

  // Configure marketplace settings
  console.log('⚙️  Configuring marketplace settings...');

  // Set supported payment tokens (ETH is supported by default)
  const supportedPaymentTokens = [
    '0x0000000000000000000000000000000000000000', // ETH
    // Add other supported tokens here
  ];

  for (const token of supportedPaymentTokens) {
    if (token !== '0x0000000000000000000000000000000000000000') {
      await marketplace.setSupportedPaymentToken(token, true);
      console.log('✅ Added payment token:', token);
    }
  }

  // Set supported token contracts
  const supportedTokenContracts = [
    '0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26', // ENS Registry
    // Add other supported contracts here
  ];

  for (const contract of supportedTokenContracts) {
    await marketplace.setSupportedTokenContract(contract, true);
    console.log('✅ Added token contract:', contract);
  }

  // Set platform fee (2.5% = 250 basis points)
  const platformFeePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 250;
  await marketplace.setPlatformFeePercentage(platformFeePercentage);
  console.log('✅ Set platform fee to:', platformFeePercentage / 100, '%');

  // Set listing durations
  const minDuration = 1 * 24 * 60 * 60; // 1 day
  const maxDuration = 365 * 24 * 60 * 60; // 1 year
  await marketplace.setListingDurations(minDuration, maxDuration);
  console.log('✅ Set listing durations: 1 day to 1 year');

  // Verify deployment
  console.log('🔍 Verifying deployment...');
  const totalListings = await marketplace.getTotalListings();
  const totalAuctions = await marketplace.getTotalAuctions();
  const feePercentage = await marketplace.platformFeePercentage();
  const feeRecipientAddr = await marketplace.feeRecipient();

  console.log('📊 Deployment verification:');
  console.log('  - Total listings:', totalListings.toString());
  console.log('  - Total auctions:', totalAuctions.toString());
  console.log('  - Platform fee:', feePercentage.toString(), 'basis points');
  console.log('  - Fee recipient:', feeRecipientAddr);

  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    marketplace: {
      address: marketplace.address,
      transactionHash: marketplace.deployTransaction.hash,
      blockNumber: await ethers.provider.getBlockNumber(),
      deployer: deployer.address,
      feeRecipient: feeRecipientAddr,
      platformFeePercentage: feePercentage.toString(),
      supportedPaymentTokens,
      supportedTokenContracts,
      minListingDuration: minDuration,
      maxListingDuration: maxDuration
    },
    timestamp: new Date().toISOString()
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, '..', '..', 'backend', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = deploymentInfo.network.name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  
  // Read existing deployments or create new object
  let deployments = {};
  if (fs.existsSync(deploymentFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  }

  deployments.marketplace = deploymentInfo.marketplace;
  deployments.lastUpdated = deploymentInfo.timestamp;

  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));
  console.log('💾 Deployment info saved to:', deploymentFile);

  // Create environment file template
  const envTemplate = `# Marketplace Contract Configuration
MARKETPLACE_CONTRACT_ADDRESS=${marketplace.address}
FEE_RECIPIENT=${feeRecipientAddr}
PLATFORM_FEE_PERCENTAGE=${platformFeePercentage}

# Network Configuration
RPC_URL=${process.env.RPC_URL || 'http://localhost:8545'}
CHAIN_ID=${deploymentInfo.network.chainId}

# Supported Contracts
ENS_REGISTRY_ADDRESS=0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26
`;

  const envFile = path.join(__dirname, '..', '..', '.env.marketplace');
  fs.writeFileSync(envFile, envTemplate);
  console.log('📄 Environment template saved to:', envFile);

  console.log('🎉 Marketplace deployment completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update your .env file with the contract address');
  console.log('2. Verify the contract on block explorer (if on mainnet/testnet)');
  console.log('3. Test the marketplace functionality');
  console.log('4. Configure frontend to use the new contract address');
  console.log('');
  console.log('🔗 Contract address:', marketplace.address);
  console.log('📊 Transaction hash:', marketplace.deployTransaction.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });




