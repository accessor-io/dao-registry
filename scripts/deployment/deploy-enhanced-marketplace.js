/**
 * Enhanced Marketplace Deployment Script
 * Deploys the enhanced marketplace contract with all integrated features
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting Enhanced Marketplace deployment...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  // Get contract addresses from environment or use defaults
  const ensNFT = process.env.ENS_NFT_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  const ensPublicResolver = process.env.ENS_PUBLIC_RESOLVER_ADDRESS || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';
  const marketplaceSigner = process.env.MARKETPLACE_SIGNER_ADDRESS || deployer.address;

  console.log('Configuration:');
  console.log('- ENS NFT Address:', ensNFT);
  console.log('- ENS Public Resolver Address:', ensPublicResolver);
  console.log('- Marketplace Signer Address:', marketplaceSigner);

  // Deploy Enhanced Marketplace contract
  console.log('\nDeploying Enhanced Marketplace contract...');
  const EnhancedMarketplace = await ethers.getContractFactory('EnhancedMarketplace');
  const enhancedMarketplace = await EnhancedMarketplace.deploy(
    ensNFT,
    ensPublicResolver,
    marketplaceSigner
  );

  await enhancedMarketplace.deployed();
  console.log('Enhanced Marketplace deployed to:', enhancedMarketplace.address);

  // Configure the marketplace
  console.log('\nConfiguring marketplace...');
  
  // Set supported payment tokens (ETH is already supported by default)
  console.log('- ETH is supported by default');
  
  // Set supported token contracts
  const ensRegistryAddress = process.env.ENS_REGISTRY_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  await enhancedMarketplace.setSupportedTokenContract(ensRegistryAddress, true);
  console.log('- ENS Registry added as supported token contract');

  // Set platform fees (1% = 100 basis points)
  await enhancedMarketplace.setPlatformFeePercentage(100);
  console.log('- Platform fee set to 1%');

  // Set offer fees (1% = 100 basis points)
  await enhancedMarketplace.setOfferFee(100);
  console.log('- Offer fee set to 1%');

  // Set listing durations (1 day to 365 days)
  await enhancedMarketplace.setListingDurations(86400, 31536000);
  console.log('- Listing durations set to 1 day to 365 days');

  // Verify deployment
  console.log('\nVerifying deployment...');
  const platformFee = await enhancedMarketplace.FEE_PERCENTAGE();
  const offerFee = await enhancedMarketplace.OFFER_FEE();
  const feeDenominator = await enhancedMarketplace.FEE_DENOMINATOR();
  const signer = await enhancedMarketplace.getSigner();

  console.log('Verification results:');
  console.log('- Platform fee:', platformFee.toString(), 'basis points');
  console.log('- Offer fee:', offerFee.toString(), 'basis points');
  console.log('- Fee denominator:', feeDenominator.toString());
  console.log('- Signer address:', signer);

  // Save deployment information
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      EnhancedMarketplace: {
        address: enhancedMarketplace.address,
        ensNFT: ensNFT,
        ensPublicResolver: ensPublicResolver,
        marketplaceSigner: marketplaceSigner,
        platformFee: platformFee.toString(),
        offerFee: offerFee.toString(),
        feeDenominator: feeDenominator.toString()
      }
    },
    configuration: {
      ensRegistryAddress: ensRegistryAddress,
      supportedPaymentTokens: ['0x0000000000000000000000000000000000000000'], // ETH
      supportedTokenContracts: [ensRegistryAddress],
      minimumListingDuration: '86400', // 1 day
      maximumListingDuration: '31536000' // 365 days
    },
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, '../../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = deploymentInfo.network.name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  
  // Read existing deployments if they exist
  let existingDeployments = {};
  if (fs.existsSync(deploymentFile)) {
    existingDeployments = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  }

  // Merge with existing deployments
  existingDeployments.enhancedMarketplace = deploymentInfo;

  // Write updated deployments
  fs.writeFileSync(deploymentFile, JSON.stringify(existingDeployments, null, 2));
  console.log(`\nDeployment information saved to: ${deploymentFile}`);

  // Create environment file template
  const envTemplate = `# Enhanced Marketplace Configuration
ENHANCED_MARKETPLACE_CONTRACT_ADDRESS=${enhancedMarketplace.address}
MARKETPLACE_SIGNER_ADDRESS=${marketplaceSigner}
MARKETPLACE_SIGNER_PRIVATE_KEY=your_signer_private_key_here

# ENS Configuration
ENS_NFT_ADDRESS=${ensNFT}
ENS_PUBLIC_RESOLVER_ADDRESS=${ensPublicResolver}
ENS_REGISTRY_ADDRESS=${ensRegistryAddress}

# Network Configuration
RPC_URL=your_rpc_url_here
CHAIN_ID=${deploymentInfo.network.chainId}
`;

  const envFile = path.join(__dirname, '../../.env.marketplace');
  fs.writeFileSync(envFile, envTemplate);
  console.log(`Environment template saved to: ${envFile}`);

  console.log('\n=== Deployment Summary ===');
  console.log('Enhanced Marketplace Address:', enhancedMarketplace.address);
  console.log('Network:', networkName);
  console.log('Chain ID:', deploymentInfo.network.chainId);
  console.log('Block Number:', deploymentInfo.blockNumber);
  console.log('Deployer:', deployer.address);
  console.log('\nNext steps:');
  console.log('1. Update your .env file with the contract address');
  console.log('2. Set the MARKETPLACE_SIGNER_PRIVATE_KEY for offchain operations');
  console.log('3. Verify the contract on block explorer (optional)');
  console.log('4. Test the marketplace functionality');

  return {
    enhancedMarketplace: enhancedMarketplace.address,
    deploymentInfo
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = main;


