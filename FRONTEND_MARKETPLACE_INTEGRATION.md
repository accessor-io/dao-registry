# Frontend Marketplace Integration

This document describes the frontend components and integration for the enhanced marketplace functionality in the ENS DAO Registry.

## Overview

The frontend marketplace integration provides a comprehensive user interface for trading ENS domains and DAO registrations, featuring:

- **Enhanced Marketplace Component**: Main marketplace interface with tabs for listings, auctions, and offers
- **Individual Card Components**: Specialized components for displaying listings, auctions, and offers
- **Dialog Components**: Forms for creating listings, auctions, and making offers
- **Advanced Search**: Comprehensive search and filtering capabilities
- **Custom Hooks**: React hooks for marketplace functionality
- **Service Layer**: API integration and helper functions

## Component Architecture

### Main Components

#### EnhancedMarketplace.js
The main marketplace component that orchestrates all marketplace functionality:

```javascript
import EnhancedMarketplace from './components/EnhancedMarketplace';

// Features:
// - Tabbed interface (Listings, Auctions, Offers)
// - Search and filtering
// - Offchain mode toggle
// - Statistics display
// - Action buttons for creating items
```

#### MarketplaceStats.js
Displays key marketplace metrics:

```javascript
// Displays:
// - Active listings count
// - Active auctions count
// - Active offers count
// - Platform fee percentage
// - Offer fee percentage
// - Total trading volume
```

### Card Components

#### ListingCard.js
Displays individual marketplace listings:

```javascript
// Features:
// - Listing details (price, expiration, metadata)
// - Buy button (onchain/offchain)
// - Cancel button (for owners)
// - Status indicators
// - Time remaining display
```

#### AuctionCard.js
Displays individual marketplace auctions:

```javascript
// Features:
// - Auction details (starting price, reserve price, highest bid)
// - Bid placement functionality
// - End auction functionality (for owners)
// - Time remaining display
// - Bidder information
```

#### OfferCard.js
Displays individual marketplace offers:

```javascript
// Features:
// - Offer details (price, expiration, participants)
// - Accept/reject functionality (for domain owners)
// - Time remaining display
// - Cancel reason display
```

### Dialog Components

#### CreateListingDialog.js
Form for creating new marketplace listings:

```javascript
// Form fields:
// - Token contract selection
// - Token ID input
// - Listing name
// - Price (ETH)
// - Payment token selection
// - Duration selection
// - Metadata (optional)
```

#### CreateAuctionDialog.js
Form for creating new marketplace auctions:

```javascript
// Form fields:
// - Token contract selection
// - Token ID input
// - Auction name
// - Starting price
// - Reserve price
// - Payment token selection
// - Duration selection
// - Metadata (optional)
```

#### MakeOfferDialog.js
Form for making offers on domains:

```javascript
// Form fields:
// - Domain owner address
// - Token ID
// - Offer name (optional)
// - Offer price
// - Offer expiration
// - Payment token (ETH only)
```

#### AdvancedSearchDialog.js
Advanced search interface with multiple filters:

```javascript
// Filter options:
// - Search type (all, listings, auctions, offers)
// - Price range (min/max)
// - Token contract
// - Seller address
// - Domain name patterns (starts with, ends with)
// - Character types (letters, numbers, unicode, emojis)
// - Sorting options
// - Results limit
```

## Custom Hooks

### useMarketplace.js
Custom React hooks for marketplace functionality:

#### useMarketplace()
Main marketplace hook for loading general data:

```javascript
const { loading, error, stats, supportedTokens, supportedContracts } = useMarketplace();
```

#### useListings(filters, pagination)
Hook for managing listings:

```javascript
const { 
  listings, 
  loading, 
  error, 
  total, 
  loadListings, 
  createListing, 
  buyListing, 
  cancelListing 
} = useListings(filters, pagination);
```

#### useAuctions(filters, pagination)
Hook for managing auctions:

```javascript
const { 
  auctions, 
  loading, 
  error, 
  total, 
  loadAuctions, 
  createAuction, 
  placeBid, 
  endAuction 
} = useAuctions(filters, pagination);
```

#### useOffers(filters, pagination)
Hook for managing offers:

```javascript
const { 
  offers, 
  loading, 
  error, 
  total, 
  loadOffers, 
  makeOffer, 
  acceptOffer, 
  rejectOffers 
} = useOffers(filters, pagination);
```

#### useOffchainBuying()
Hook for offchain operations:

```javascript
const { 
  loading, 
  error, 
  generateSignature, 
  offchainBuy, 
  offchainBulkBuy 
} = useOffchainBuying();
```

#### useAdvancedSearch()
Hook for advanced search functionality:

```javascript
const { 
  results, 
  loading, 
  error, 
  search 
} = useAdvancedSearch();
```

## Service Layer

### marketplace.js
Frontend service for API integration:

```javascript
import { marketplaceApi, marketplaceHelpers, marketplaceErrors } from '../services/marketplace';

// API endpoints:
// - marketplaceApi.createListing()
// - marketplaceApi.createAuction()
// - marketplaceApi.makeOffer()
// - marketplaceApi.offchainBuy()
// - marketplaceApi.search()
// - etc.

// Helper functions:
// - marketplaceHelpers.formatPrice()
// - marketplaceHelpers.formatTimeRemaining()
// - marketplaceHelpers.isActive()
// - marketplaceHelpers.buildSearchFilters()
// - etc.

// Error handling:
// - marketplaceErrors.extractErrorMessage()
// - marketplaceErrors.isNetworkError()
// - marketplaceErrors.isValidationError()
// - etc.
```

## Usage Examples

### Basic Marketplace Integration

```javascript
import React from 'react';
import EnhancedMarketplace from './components/EnhancedMarketplace';

function App() {
  return (
    <div>
      <EnhancedMarketplace />
    </div>
  );
}
```

### Using Marketplace Hooks

```javascript
import React, { useState } from 'react';
import { useListings } from './hooks/useMarketplace';

function MyComponent() {
  const [filters, setFilters] = useState({});
  const { listings, loading, createListing } = useListings(filters);

  const handleCreateListing = async (listingData) => {
    try {
      await createListing(listingData);
      console.log('Listing created successfully');
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  return (
    <div>
      {loading ? 'Loading...' : listings.map(listing => (
        <div key={listing.id}>{listing.listingName}</div>
      ))}
    </div>
  );
}
```

### Offchain Buying Flow

```javascript
import React, { useState } from 'react';
import { useOffchainBuying } from './hooks/useMarketplace';

function OffchainBuyComponent({ listing }) {
  const { generateSignature, offchainBuy } = useOffchainBuying();
  const [loading, setLoading] = useState(false);

  const handleOffchainBuy = async () => {
    setLoading(true);
    try {
      // 1. Generate signature
      const signature = await generateSignature({
        seller: listing.seller,
        buyer: userAddress,
        tokenId: listing.tokenId,
        price: listing.price
      });

      // 2. Complete offchain buy
      await offchainBuy({
        tokenId: listing.tokenId,
        seller: listing.seller,
        paymentValue: listing.price,
        signature: signature,
        buyerWallet: userWallet
      });

      console.log('Offchain buy completed');
    } catch (error) {
      console.error('Offchain buy failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleOffchainBuy} disabled={loading}>
      {loading ? 'Processing...' : 'Buy (Offchain)'}
    </button>
  );
}
```

### Advanced Search

```javascript
import React, { useState } from 'react';
import { useAdvancedSearch } from './hooks/useMarketplace';

function SearchComponent() {
  const { results, loading, search } = useAdvancedSearch();
  const [searchData, setSearchData] = useState({});

  const handleSearch = async () => {
    try {
      await search({
        type: 'all',
        priceMin: '0.1',
        priceMax: '10.0',
        startsWith: 'crypto',
        letters: 'true',
        numbers: 'false',
        sortBy: 'price',
        sortDirection: 'ASC',
        limit: 50
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {results.listings && results.listings.map(listing => (
        <div key={listing.id}>{listing.listingName}</div>
      ))}
    </div>
  );
}
```

## Styling and Theming

The marketplace components use Material-UI (MUI) for consistent styling:

```javascript
// Theme customization
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
  },
});

// Component styling
<Card sx={{ 
  height: '100%', 
  display: 'flex', 
  flexDirection: 'column',
  '&:hover': {
    boxShadow: 4,
  }
}}>
```

## Error Handling

Comprehensive error handling throughout the application:

```javascript
// Error boundaries
class MarketplaceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Marketplace error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong with the marketplace.</h1>;
    }

    return this.props.children;
  }
}

// Error handling in components
const handleAction = async () => {
  try {
    setLoading(true);
    setError('');
    await performAction();
  } catch (err) {
    setError(marketplaceErrors.extractErrorMessage(err));
  } finally {
    setLoading(false);
  }
};
```

## Performance Optimization

### Lazy Loading
```javascript
import { lazy, Suspense } from 'react';

const EnhancedMarketplace = lazy(() => import('./components/EnhancedMarketplace'));

function App() {
  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <EnhancedMarketplace />
    </Suspense>
  );
}
```

### Memoization
```javascript
import { memo, useMemo } from 'react';

const ListingCard = memo(({ listing, onBuy, onCancel }) => {
  const formattedPrice = useMemo(() => 
    marketplaceHelpers.formatPrice(listing.price), 
    [listing.price]
  );

  return (
    <Card>
      <Typography>{formattedPrice} ETH</Typography>
    </Card>
  );
});
```

### Virtual Scrolling
```javascript
import { FixedSizeList as List } from 'react-window';

function VirtualizedListings({ listings }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ListingCard listing={listings[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={listings.length}
      itemSize={200}
    >
      {Row}
    </List>
  );
}
```

## Testing

### Component Testing
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedMarketplace } from './EnhancedMarketplace';

test('renders marketplace with tabs', () => {
  render(<EnhancedMarketplace />);
  
  expect(screen.getByText('Listings')).toBeInTheDocument();
  expect(screen.getByText('Auctions')).toBeInTheDocument();
  expect(screen.getByText('Offers')).toBeInTheDocument();
});

test('creates listing when form is submitted', async () => {
  render(<EnhancedMarketplace />);
  
  fireEvent.click(screen.getByText('Create Listing'));
  fireEvent.change(screen.getByLabelText('Token ID'), { target: { value: '123' } });
  fireEvent.change(screen.getByLabelText('Price (ETH)'), { target: { value: '1.0' } });
  fireEvent.click(screen.getByText('Create Listing'));
  
  await waitFor(() => {
    expect(screen.getByText('Listing created successfully')).toBeInTheDocument();
  });
});
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react';
import { useListings } from './hooks/useMarketplace';

test('useListings hook loads listings', async () => {
  const { result } = renderHook(() => useListings());
  
  await act(async () => {
    await result.current.loadListings();
  });
  
  expect(result.current.listings).toHaveLength(2);
  expect(result.current.loading).toBe(false);
});
```

## Deployment

### Environment Configuration
```javascript
// .env
REACT_APP_API_URL=http://localhost:3100
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=0x...
REACT_APP_ENABLE_OFFCHAIN_MODE=true
REACT_APP_ENABLE_DEBUG_LOGS=false
```

### Build Configuration
```javascript
// package.json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:3100"
}
```

## Browser Support

The marketplace components support modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

Components include accessibility features:

```javascript
// ARIA labels
<Button
  aria-label="Buy listing"
  aria-describedby="listing-description"
  onClick={handleBuy}
>
  Buy Now
</Button>

// Keyboard navigation
<Dialog
  open={open}
  onClose={handleClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
```

## Security Considerations

- Input validation on all forms
- XSS protection through React's built-in escaping
- CSRF protection through API tokens
- Secure wallet integration
- Signature verification for offchain operations

## Future Enhancements

- Real-time updates using WebSockets
- Push notifications for marketplace events
- Mobile-responsive design improvements
- Advanced analytics dashboard
- Multi-language support
- Dark mode theme
- PWA capabilities


