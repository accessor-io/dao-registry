import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Gavel as AuctionIcon,
  ShoppingCart as BuyIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [listings, setListings] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedTokenContract, setSelectedTokenContract] = useState('');
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [createAuctionOpen, setCreateAuctionOpen] = useState(false);
  const [marketplaceStats, setMarketplaceStats] = useState(null);

  // Mock data for demonstration
  const mockListings = [
    {
      id: 1,
      seller: '0x1234...5678',
      tokenContract: '0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26',
      tokenId: '12345',
      price: '0.5',
      paymentToken: 'ETH',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-02-15'),
      metadata: 'Premium ENS domain for sale'
    },
    {
      id: 2,
      seller: '0x9876...5432',
      tokenContract: '0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26',
      tokenId: '67890',
      price: '2.0',
      paymentToken: 'ETH',
      isActive: true,
      createdAt: new Date('2024-01-16'),
      expiresAt: new Date('2024-02-16'),
      metadata: 'Rare 3-letter ENS domain'
    }
  ];

  const mockAuctions = [
    {
      id: 1,
      seller: '0x1111...2222',
      tokenContract: '0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26',
      tokenId: '11111',
      startingPrice: '1.0',
      reservePrice: '5.0',
      paymentToken: 'ETH',
      startTime: new Date('2024-01-10'),
      endTime: new Date('2024-01-20'),
      isActive: true,
      highestBidder: '0x3333...4444',
      highestBid: '3.5',
      metadata: 'Ultra-rare ENS domain auction'
    }
  ];

  const mockStats = {
    totalListings: 150,
    totalAuctions: 25,
    platformFeePercentage: 2.5,
    feeRecipient: '0x0000...0000'
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be API calls
      // API call handled by hooks
      
      setListings(mockListings);
      setAuctions(mockAuctions);
      setMarketplaceStats(mockStats);
    } catch (err) {
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = () => {
    // Search is handled automatically by the hooks when filters change
  };

  const handleCreateListing = () => {
    setCreateListingOpen(true);
  };

  const handleCreateAuction = () => {
    setCreateAuctionOpen(true);
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderListings = () => (
    <Grid container spacing={3}>
      {listings.map((listing) => (
        <Grid item xs={12} md={6} lg={4} key={listing.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6" noWrap>
                  Token #{listing.tokenId}
                </Typography>
                <Chip 
                  label={`${listing.price} ${listing.paymentToken}`} 
                  color="primary" 
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                {listing.metadata}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Seller: {listing.seller}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires: {listing.expiresAt.toLocaleDateString()}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                startIcon={<BuyIcon />}
                fullWidth
                onClick={() => {/* Buy functionality handled by ListingCard */}}
              >
                Buy Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderAuctions = () => (
    <Grid container spacing={3}>
      {auctions.map((auction) => (
        <Grid item xs={12} md={6} lg={4} key={auction.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6" noWrap>
                  Token #{auction.tokenId}
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="end">
                  <Chip 
                    label={`${auction.highestBid} ${auction.paymentToken}`} 
                    color="secondary" 
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Reserve: {auction.reservePrice} {auction.paymentToken}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                {auction.metadata}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Seller: {auction.seller}
                </Typography>
                <Box display="flex" alignItems="center">
                  <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeRemaining(auction.endTime)}
                  </Typography>
                </Box>
              </Box>
              
              {auction.highestBidder && (
                <Typography variant="caption" color="text.secondary" mb={1}>
                  Highest bidder: {auction.highestBidder}
                </Typography>
              )}
              
              <Button
                variant="contained"
                startIcon={<AuctionIcon />}
                fullWidth
                onClick={() => {/* Bid functionality handled by AuctionCard */}}
              >
                Place Bid
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderStats = () => (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Listings
            </Typography>
            <Typography variant="h4" color="primary">
              {marketplaceStats?.totalListings || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Auctions
            </Typography>
            <Typography variant="h4" color="secondary">
              {marketplaceStats?.totalAuctions || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Fee
            </Typography>
            <Typography variant="h4" color="info.main">
              {marketplaceStats?.platformFeePercentage || 0}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Volume
            </Typography>
            <Typography variant="h4" color="success.main">
              1,234 ETH
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          ENS Marketplace
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateListing}
            sx={{ mr: 1 }}
          >
            Create Listing
          </Button>
          <Button
            variant="contained"
            startIcon={<AuctionIcon />}
            onClick={handleCreateAuction}
          >
            Create Auction
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Trade ENS domains and DAO registrations in a decentralized marketplace
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStats()}

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by token ID or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Token Contract</InputLabel>
                <Select
                  value={selectedTokenContract}
                  onChange={(e) => setSelectedTokenContract(e.target.value)}
                  label="Token Contract"
                >
                  <MenuItem value="">All Contracts</MenuItem>
                  <MenuItem value="0x57f1887a8BF19d14Bc7DfD3783E9aF5A015223C26">ENS Registry</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={listings.length} color="primary">
                  Listings
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={auctions.length} color="secondary">
                  Auctions
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {activeTab === 0 && renderListings()}
          {activeTab === 1 && renderAuctions()}
        </CardContent>
      </Card>

      {/* Create Listing Dialog */}
      <Dialog open={createListingOpen} onClose={() => setCreateListingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Listing</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            List your ENS domain or DAO registration for sale
          </Typography>
          {/* Form fields would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateListingOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Listing</Button>
        </DialogActions>
      </Dialog>

      {/* Create Auction Dialog */}
      <Dialog open={createAuctionOpen} onClose={() => setCreateAuctionOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Auction</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Start an auction for your ENS domain or DAO registration
          </Typography>
          {/* Form fields would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAuctionOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Auction</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Marketplace;


