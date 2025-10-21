# Enhanced Marketplace Integration

This document describes the integration of the Enstools marketplace functionality into the ENS DAO Registry system, creating a comprehensive marketplace for ENS domains and DAO registrations.

## Overview

The enhanced marketplace combines the best features from both the original ENS DAO Registry marketplace and the Enstools marketplace, providing:

- **Onchain Listings**: Traditional marketplace listings with smart contract escrow
- **Offchain Operations**: Gas-efficient offchain buying with signature verification
- **Offer System**: Allow users to make offers on domains owned by others
- **Auction System**: Time-based auctions with bidding functionality
- **Bulk Operations**: Create multiple listings or buy multiple items in single transactions
- **Advanced Filtering**: Comprehensive search and filtering capabilities

## Architecture

### Smart Contracts

#### EnhancedMarketplace.sol
The main marketplace contract that combines all functionality:

```solidity
contract EnhancedMarketplace is ReentrancyGuard, Ownable, ERC1155Holder {
    // Listing functionality
    function createListing(...)
    function createBulkListing(...)
    function buyItem(...)
    function cancelListing(...)
    
    // Offchain functionality
    function offchainBuy(...)
    function offchainBulkBuy(...)
    
    // Offer functionality
    function makeOffer(...)
    function acceptOffer(...)
    function rejectOffers(...)
    
    // Auction functionality
    function createAuction(...)
    function placeBid(...)
    function endAuction(...)
}
```

#### Key Features

1. **ERC1155 Support**: Full support for ERC1155 tokens (ENS domains)
2. **Signature Verification**: Offchain operations use cryptographic signatures
3. **Fee Management**: Configurable platform and offer fees
4. **Bulk Operations**: Efficient batch processing
5. **Event Logging**: Comprehensive event system for tracking

### Backend Services

#### Enhanced Marketplace Service
Located at `backend/src/services/marketplace/enhanced-marketplace-service.js`

Provides:
- Contract interaction methods
- Signature generation for offchain operations
- Data formatting and validation
- Error handling and logging

#### Marketplace Filters
Located at `backend/src/services/marketplace/marketplace-filters.js`

Provides:
- Advanced filtering capabilities
- Search functionality
- Sorting options
- Query building utilities

### Database Models

#### Core Models
- `MarketplaceListing`: Onchain and offchain listings
- `MarketplaceAuction`: Auction data and state
- `MarketplaceOffer`: Offer management
- `MarketplaceBid`: Auction bidding history
- `OffchainMarketplaceTransaction`: Offchain transaction records
- `MarketplaceStats`: Analytics and statistics
- `MarketplaceConfig`: Configuration management

### API Routes

#### Listing Routes
- `POST /api/marketplace/listings` - Create listing
- `POST /api/marketplace/listings/bulk` - Create bulk listings
- `GET /api/marketplace/listings` - Get listings with filters
- `GET /api/marketplace/listings/:id` - Get specific listing
- `POST /api/marketplace/listings/:id/buy` - Buy from listing
- `DELETE /api/marketplace/listings/:id` - Cancel listing

#### Offchain Routes
- `POST /api/marketplace/offchain/signature` - Generate signature
- `POST /api/marketplace/offchain/buy` - Offchain buy
- `POST /api/marketplace/offchain/bulk-buy` - Bulk offchain buy

#### Offer Routes
- `POST /api/marketplace/offers` - Make offer
- `GET /api/marketplace/offers` - Get offers with filters
- `GET /api/marketplace/offers/:id` - Get specific offer
- `POST /api/marketplace/offers/:id/accept` - Accept offer
- `POST /api/marketplace/offers/reject` - Reject offers

#### Auction Routes
- `POST /api/marketplace/auctions` - Create auction
- `GET /api/marketplace/auctions` - Get auctions with filters
- `GET /api/marketplace/auctions/:id` - Get specific auction
- `POST /api/marketplace/auctions/:id/bid` - Place bid
- `POST /api/marketplace/auctions/:id/end` - End auction

#### Utility Routes
- `GET /api/marketplace/stats` - Get marketplace statistics
- `GET /api/marketplace/supported-tokens` - Get supported payment tokens
- `GET /api/marketplace/supported-contracts` - Get supported token contracts
- `POST /api/marketplace/search` - Advanced search

## Installation and Setup

### Prerequisites

1. Node.js 16+ and npm
2. Hardhat development environment
3. Database (PostgreSQL recommended)
4. Ethereum node (local or remote)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Enhanced Marketplace Configuration
ENHANCED_MARKETPLACE_CONTRACT_ADDRESS=0x...
MARKETPLACE_SIGNER_ADDRESS=0x...
MARKETPLACE_SIGNER_PRIVATE_KEY=0x...

# ENS Configuration
ENS_NFT_ADDRESS=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
ENS_PUBLIC_RESOLVER_ADDRESS=0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
ENS_REGISTRY_ADDRESS=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e

# Network Configuration
RPC_URL=http://localhost:8545
CHAIN_ID=1337
GAS_LIMIT=8000000

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ens_dao_registry

# Feature Flags
ENABLE_OFFCHAIN_BUYING=true
ENABLE_BULK_OPERATIONS=true
ENABLE_OFFERS=true
ENABLE_AUCTIONS=true
ENABLE_SIGNATURE_VERIFICATION=true
ENABLE_ADVANCED_FILTERING=true
```

### Deployment

1. **Deploy the Enhanced Marketplace Contract**:
   ```bash
   npx hardhat run scripts/deployment/deploy-enhanced-marketplace.js --network localhost
   ```

2. **Set up the Database**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Start the Backend Server**:
   ```bash
   npm run dev
   ```

### Configuration

The marketplace can be configured through the configuration file at `backend/src/config/marketplace.js`:

- **Fees**: Platform and offer fees (default: 1% each)
- **Durations**: Minimum and maximum listing/auction durations
- **Supported Tokens**: Payment tokens and token contracts
- **Feature Flags**: Enable/disable specific features
- **Validation Rules**: Input validation parameters

## Usage Examples

### Creating a Listing

```javascript
const response = await fetch('/api/marketplace/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenContract: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    tokenId: '123456789',
    price: '1.0',
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH
    duration: 86400, // 1 day
    metadata: '{"name": "example.eth", "description": "Premium domain"}',
    listingName: 'Premium ENS Domain',
    sellerWallet: '0x...'
  })
});
```

### Making an Offer

```javascript
const response = await fetch('/api/marketplace/offers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domainOwner: '0x...',
    offerName: 'My Offer',
    tokenId: '123456789',
    offerUntil: Math.floor(Date.now() / 1000) + 86400, // 1 day
    price: '0.8',
    offerMakerWallet: '0x...'
  })
});
```

### Offchain Buying

```javascript
// 1. Generate signature
const signatureResponse = await fetch('/api/marketplace/offchain/signature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    seller: '0x...',
    buyer: '0x...',
    tokenId: '123456789',
    price: '1.0'
  })
});

const { signature } = await signatureResponse.json();

// 2. Complete offchain buy
const buyResponse = await fetch('/api/marketplace/offchain/buy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: '123456789',
    seller: '0x...',
    paymentValue: '1.0',
    signature: signature,
    buyerWallet: '0x...'
  })
});
```

### Advanced Search

```javascript
const response = await fetch('/api/marketplace/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'all', // 'listings', 'auctions', 'offers', 'all'
    filters: {
      price_min: '0.1',
      price_max: '10.0',
      starts_with: 'crypto',
      letters: 'true',
      numbers: 'false'
    },
    sortby: 'price',
    sortdirection: 'ASC',
    limit: 20,
    offset: 0
  })
});
```

## Security Considerations

### Signature Verification
- All offchain operations require cryptographic signatures
- Signatures are generated by a trusted signer
- Signature verification prevents unauthorized transactions

### Access Control
- Only contract owners can modify fees and supported tokens
- Only listing/auction owners can cancel their items
- Only domain owners can accept offers

### Input Validation
- All inputs are validated on both frontend and backend
- Address validation ensures proper Ethereum addresses
- Price and duration validation prevents invalid values

### Reentrancy Protection
- All state-changing functions use reentrancy guards
- Proper checks-effects-interactions pattern implemented

## Monitoring and Analytics

### Statistics
The marketplace provides comprehensive statistics:
- Total listings, auctions, and offers
- Sales volume and average prices
- Platform fee collection
- User activity metrics

### Event Logging
All marketplace activities are logged as events:
- Listing creation, updates, and cancellations
- Sales and purchases
- Offer creation, acceptance, and rejection
- Auction creation, bidding, and completion

### Health Monitoring
- Contract connectivity monitoring
- Database health checks
- API endpoint monitoring
- Error rate tracking

## Troubleshooting

### Common Issues

1. **Contract Not Deployed**
   - Ensure `ENHANCED_MARKETPLACE_CONTRACT_ADDRESS` is set
   - Verify the contract is deployed on the correct network

2. **Signature Verification Failed**
   - Check `MARKETPLACE_SIGNER_PRIVATE_KEY` is set correctly
   - Ensure the signer address matches the contract configuration

3. **Transaction Failures**
   - Verify sufficient gas and ETH balance
   - Check token approvals for ERC1155 transfers
   - Ensure the token contract is supported

4. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Ensure database migrations are run
   - Check database permissions

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
ENABLE_CONTRACT_LOGS=true
ENABLE_API_LOGS=true
```

## Contributing

When contributing to the marketplace:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new functionality
3. Update documentation for API changes
4. Ensure security best practices are followed
5. Test with both onchain and offchain operations

## License

This marketplace integration is part of the ENS DAO Registry project and follows the same licensing terms.


