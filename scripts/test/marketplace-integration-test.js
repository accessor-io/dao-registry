/**
 * Marketplace Integration Test
 * Tests the complete marketplace functionality end-to-end
 */

const { ethers } = require('hardhat');
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  MARKETPLACE_CONTRACT_ADDRESS: process.env.MARKETPLACE_CONTRACT_ADDRESS,
  ENS_REGISTRY_ADDRESS: '0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26',
  TEST_TOKEN_ID: '12345',
  TEST_PRICE: '0.1',
  TEST_DURATION: 7 * 24 * 60 * 60, // 7 days
  TEST_AUCTION_DURATION: 3 * 24 * 60 * 60 // 3 days
};

class MarketplaceIntegrationTest {
  constructor() {
    this.testResults = [];
    this.marketplace = null;
    this.ensRegistry = null;
    this.accounts = [];
  }

  async setup() {
    console.log('🔧 Setting up test environment...');
    
    // Get test accounts
    this.accounts = await ethers.getSigners();
    console.log(`📝 Using ${this.accounts.length} test accounts`);

    // Connect to contracts
    if (TEST_CONFIG.MARKETPLACE_CONTRACT_ADDRESS) {
      const Marketplace = await ethers.getContractFactory('Marketplace');
      this.marketplace = Marketplace.attach(TEST_CONFIG.MARKETPLACE_CONTRACT_ADDRESS);
      console.log('✅ Connected to Marketplace contract');
    } else {
      throw new Error('❌ MARKETPLACE_CONTRACT_ADDRESS not set');
    }

    // Connect to ENS Registry (mock for testing)
    const ENSRegistry = await ethers.getContractFactory('ENSRegistry');
    this.ensRegistry = ENSRegistry.attach(TEST_CONFIG.ENS_REGISTRY_ADDRESS);
    console.log('✅ Connected to ENS Registry contract');
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', result });
      console.log(`✅ ${testName}: PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
      throw error;
    }
  }

  async testMarketplaceStats() {
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/stats`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch marketplace stats');
    }

    const stats = response.data.data;
    console.log('📊 Marketplace stats:', stats);
    
    return stats;
  }

  async testCreateListing() {
    const seller = this.accounts[0];
    const tokenContract = TEST_CONFIG.ENS_REGISTRY_ADDRESS;
    const tokenId = TEST_CONFIG.TEST_TOKEN_ID;
    const price = ethers.utils.parseEther(TEST_CONFIG.TEST_PRICE);
    const duration = TEST_CONFIG.TEST_DURATION;
    const metadata = 'Test ENS domain listing';

    // Create listing via contract
    const tx = await this.marketplace
      .connect(seller)
      .createListing(
        tokenContract,
        tokenId,
        price,
        ethers.constants.AddressZero, // ETH
        duration,
        metadata
      );

    const receipt = await tx.wait();
    console.log('📝 Listing created, tx hash:', receipt.transactionHash);

    // Get listing ID from event
    const event = receipt.events?.find(e => e.event === 'ListingCreated');
    const listingId = event ? event.args.listingId.toNumber() : null;

    if (!listingId) {
      throw new Error('Failed to get listing ID from event');
    }

    // Verify listing via API
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/listings/${listingId}`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch listing via API');
    }

    const listing = response.data.data;
    console.log('📋 Listing details:', listing);

    return { listingId, listing };
  }

  async testGetListings() {
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/listings`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch listings');
    }

    const data = response.data.data;
    console.log(`📋 Found ${data.listings.length} listings`);

    return data;
  }

  async testCreateAuction() {
    const seller = this.accounts[1];
    const tokenContract = TEST_CONFIG.ENS_REGISTRY_ADDRESS;
    const tokenId = '67890';
    const startingPrice = ethers.utils.parseEther('0.05');
    const reservePrice = ethers.utils.parseEther('0.2');
    const duration = TEST_CONFIG.TEST_AUCTION_DURATION;
    const metadata = 'Test ENS domain auction';

    // Create auction via contract
    const tx = await this.marketplace
      .connect(seller)
      .createAuction(
        tokenContract,
        tokenId,
        startingPrice,
        reservePrice,
        ethers.constants.AddressZero, // ETH
        duration,
        metadata
      );

    const receipt = await tx.wait();
    console.log('🔨 Auction created, tx hash:', receipt.transactionHash);

    // Get auction ID from event
    const event = receipt.events?.find(e => e.event === 'AuctionCreated');
    const auctionId = event ? event.args.auctionId.toNumber() : null;

    if (!auctionId) {
      throw new Error('Failed to get auction ID from event');
    }

    // Verify auction via API
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/auctions/${auctionId}`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch auction via API');
    }

    const auction = response.data.data;
    console.log('🔨 Auction details:', auction);

    return { auctionId, auction };
  }

  async testGetAuctions() {
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/auctions`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch auctions');
    }

    const data = response.data.data;
    console.log(`🔨 Found ${data.auctions.length} auctions`);

    return data;
  }

  async testPlaceBid(auctionId) {
    const bidder = this.accounts[2];
    const bidAmount = ethers.utils.parseEther('0.1');

    // Place bid via contract
    const tx = await this.marketplace
      .connect(bidder)
      .placeBid(auctionId, { value: bidAmount });

    const receipt = await tx.wait();
    console.log('💰 Bid placed, tx hash:', receipt.transactionHash);

    // Verify bid via contract
    const auction = await this.marketplace.getAuction(auctionId);
    console.log('💰 Auction after bid:', {
      highestBidder: auction.highestBidder,
      highestBid: ethers.utils.formatEther(auction.highestBid)
    });

    return { bidAmount, receipt };
  }

  async testSearchMarketplace() {
    const searchParams = {
      query: 'test',
      type: 'all',
      minPrice: '0.01',
      maxPrice: '1.0'
    };

    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/search`, {
      params: searchParams
    });
    
    if (response.status !== 200) {
      throw new Error('Failed to search marketplace');
    }

    const data = response.data.data;
    console.log(`🔍 Search results: ${data.listings.length} listings, ${data.auctions.length} auctions`);

    return data;
  }

  async testPaymentTokens() {
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/payment-tokens`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch payment tokens');
    }

    const tokens = response.data.data;
    console.log('💳 Supported payment tokens:', tokens);

    return tokens;
  }

  async testTokenContracts() {
    const response = await axios.get(`${TEST_CONFIG.API_BASE_URL}/marketplace/token-contracts`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch token contracts');
    }

    const contracts = response.data.data;
    console.log('📦 Supported token contracts:', contracts);

    return contracts;
  }

  async runAllTests() {
    console.log('🚀 Starting Marketplace Integration Tests...\n');

    try {
      await this.setup();

      // Test API endpoints
      await this.runTest('Marketplace Stats', () => this.testMarketplaceStats());
      await this.runTest('Payment Tokens', () => this.testPaymentTokens());
      await this.runTest('Token Contracts', () => this.testTokenContracts());
      await this.runTest('Get Listings', () => this.testGetListings());
      await this.runTest('Get Auctions', () => this.testGetAuctions());
      await this.runTest('Search Marketplace', () => this.testSearchMarketplace());

      // Test contract interactions
      const { listingId } = await this.runTest('Create Listing', () => this.testCreateListing());
      const { auctionId } = await this.runTest('Create Auction', () => this.testCreateAuction());
      
      if (auctionId) {
        await this.runTest('Place Bid', () => this.testPlaceBid(auctionId));
      }

      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.printResults();
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 Marketplace integration test completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new MarketplaceIntegrationTest();
  tester.runAllTests().catch(console.error);
}

module.exports = MarketplaceIntegrationTest;




