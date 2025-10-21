/**
 * Enhanced Marketplace Component
 * Comprehensive marketplace interface with listings, auctions, offers, and offchain operations
 */

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
  Badge,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Gavel as AuctionIcon,
  ShoppingCart as BuyIcon,
  Timer as TimerIcon,
  AttachMoney as OfferIcon,
  FlashOn as OffchainIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

import { useMarketplace, useListings, useAuctions, useOffers, useAdvancedSearch } from '../hooks/useMarketplace';
import { marketplaceHelpers } from '../services/marketplace';
import { useWeb3 } from '../hooks/useWeb3';
import CreateListingDialog from './marketplace/CreateListingDialog';
import CreateAuctionDialog from './marketplace/CreateAuctionDialog';
import MakeOfferDialog from './marketplace/MakeOfferDialog';
import AdvancedSearchDialog from './marketplace/AdvancedSearchDialog';
import ListingCard from './marketplace/ListingCard';
import AuctionCard from './marketplace/AuctionCard';
import OfferCard from './marketplace/OfferCard';
import MarketplaceStats from './marketplace/MarketplaceStats';

const EnhancedMarketplace = () => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedTokenContract, setSelectedTokenContract] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [enableOffchainMode, setEnableOffchainMode] = useState(false);
  
  // Dialog states
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [createAuctionOpen, setCreateAuctionOpen] = useState(false);
  const [makeOfferOpen, setMakeOfferOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  // Hooks
  const { stats, supportedTokens, supportedContracts, loading: statsLoading } = useMarketplace();
  
  const filters = {
    searchQuery,
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    tokenContract: selectedTokenContract,
    sortBy,
    sortDirection
  };

  const { listings, loading: listingsLoading, total: listingsTotal, buyListing, cancelListing } = useListings(filters);
  const { auctions, loading: auctionsLoading, total: auctionsTotal, placeBid, endAuction } = useAuctions(filters);
  const { offers, loading: offersLoading, total: offersTotal, acceptOffer, rejectOffers } = useOffers(filters);
  const { search: advancedSearch, loading: searchLoading } = useAdvancedSearch();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearch = () => {
    // Search is handled automatically by the hooks when filters change
    // No need for console.log in production
  };

  const handleAdvancedSearch = async (searchData) => {
    try {
      await advancedSearch(searchData);
      setAdvancedSearchOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCreateListing = () => {
    setCreateListingOpen(true);
  };

  const handleCreateAuction = () => {
    setCreateAuctionOpen(true);
  };

  const handleMakeOffer = () => {
    setMakeOfferOpen(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const renderSearchBar = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search by token ID, name, or metadata..."
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
              placeholder="Min Price (ETH)"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              type="number"
              inputProps={{ min: 0, step: 0.001 }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              placeholder="Max Price (ETH)"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              type="number"
              inputProps={{ min: 0, step: 0.001 }}
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
                {supportedContracts.map((contract) => (
                  <MenuItem key={contract.address} value={contract.address}>
                    {contract.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="expiresAt">Expiration</MenuItem>
                <MenuItem value="tokenId">Token ID</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Box display="flex" gap={1}>
              <Tooltip title="Advanced Search">
                <IconButton onClick={() => setAdvancedSearchOpen(true)}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={2} display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={enableOffchainMode}
                onChange={(e) => setEnableOffchainMode(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Offchain Mode"
          />
          <Chip
            icon={<OffchainIcon />}
            label="Gas-Efficient Trading"
            color={enableOffchainMode ? "primary" : "default"}
            variant={enableOffchainMode ? "filled" : "outlined"}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderListings = () => (
    <Grid container spacing={3}>
      {listingsLoading ? (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      ) : listings.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No listings found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search filters or create a new listing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        listings.map((listing) => (
          <Grid item xs={12} md={6} lg={4} key={listing.id}>
            <ListingCard
              listing={listing}
              enableOffchain={enableOffchainMode}
              onBuy={() => buyListing(listing.id)}
              onCancel={() => cancelListing(listing.id)}
            />
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderAuctions = () => (
    <Grid container spacing={3}>
      {auctionsLoading ? (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      ) : auctions.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No auctions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search filters or create a new auction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        auctions.map((auction) => (
          <Grid item xs={12} md={6} lg={4} key={auction.id}>
            <AuctionCard
              auction={auction}
              onBid={() => placeBid(auction.id)}
              onEnd={() => endAuction(auction.id)}
            />
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderOffers = () => (
    <Grid container spacing={3}>
      {offersLoading ? (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      ) : offers.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No offers found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search filters or make a new offer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        offers.map((offer) => (
          <Grid item xs={12} md={6} lg={4} key={offer.id}>
            <OfferCard
              offer={offer}
              onAccept={() => acceptOffer(offer.id)}
              onReject={() => rejectOffers([offer.id])}
            />
          </Grid>
        ))
      )}
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Enhanced ENS Marketplace
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Trade ENS domains and DAO registrations with advanced features
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateListing}
          >
            Create Listing
          </Button>
          <Button
            variant="outlined"
            startIcon={<AuctionIcon />}
            onClick={handleCreateAuction}
          >
            Create Auction
          </Button>
          <Button
            variant="contained"
            startIcon={<OfferIcon />}
            onClick={handleMakeOffer}
          >
            Make Offer
          </Button>
        </Box>
      </Box>

      {/* Marketplace Stats */}
      <MarketplaceStats stats={stats} loading={statsLoading} />

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={listingsTotal} color="primary">
                  Listings
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={auctionsTotal} color="secondary">
                  Auctions
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={offersTotal} color="success">
                  Offers
                </Badge>
              } 
            />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderListings()}
          {activeTab === 1 && renderAuctions()}
          {activeTab === 2 && renderOffers()}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateListingDialog
        open={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
        supportedTokens={supportedTokens}
        supportedContracts={supportedContracts}
      />

      <CreateAuctionDialog
        open={createAuctionOpen}
        onClose={() => setCreateAuctionOpen(false)}
        supportedTokens={supportedTokens}
        supportedContracts={supportedContracts}
      />

      <MakeOfferDialog
        open={makeOfferOpen}
        onClose={() => setMakeOfferOpen(false)}
        supportedTokens={supportedTokens}
      />

      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
        loading={searchLoading}
      />
    </Box>
  );
};

export default EnhancedMarketplace;
