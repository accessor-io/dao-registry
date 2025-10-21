/**
 * Auction Card Component
 * Displays individual marketplace auction with bidding functionality
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Gavel as AuctionIcon,
  Timer as TimerIcon,
  AccountCircle as AccountIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { marketplaceHelpers, marketplaceApi } from '../../services/marketplace';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethToWei, formatErrorMessage, addressesEqual } from '../../utils/web3';

const AuctionCard = ({ auction, onBid, onEnd }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(auction.highestBid || auction.startingPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive = marketplaceHelpers.isActive(auction);
  const status = marketplaceHelpers.getStatus(auction);
  const formattedStartingPrice = marketplaceHelpers.formatPrice(auction.startingPrice);
  const formattedReservePrice = marketplaceHelpers.formatPrice(auction.reservePrice);
  const formattedHighestBid = marketplaceHelpers.formatPrice(auction.highestBid);
  const timeRemaining = marketplaceHelpers.formatTimeRemaining(auction.endTime);

  const handleBid = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to place a bid');
        }
      }

      // Validate bid amount
      if (!marketplaceHelpers.isValidPrice(bidAmount)) {
        throw new Error('Invalid bid amount');
      }

      if (parseFloat(bidAmount) <= parseFloat(auction.highestBid)) {
        throw new Error('Bid must be higher than current highest bid');
      }

      const bidData = {
        auctionId: auction.id,
        bidAmount: ethToWei(bidAmount),
        bidder: account
      };

      const response = await marketplaceApi.placeBid(auction.id, bidData);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to place bid');
      }

      if (onBid) {
        await onBid();
      }
      setBidDialogOpen(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to end this auction');
        }
      }

      const endData = {
        auctionId: auction.id,
        seller: account
      };

      const response = await marketplaceApi.endAuction(auction.id, endData);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to end auction');
      }

      if (onEnd) {
        await onEnd();
      }
      setEndDialogOpen(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Ended': return 'info';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTimeColor = () => {
    const now = new Date();
    const end = new Date(auction.endTime);
    const timeLeft = end - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 1) return 'error';
    if (hoursLeft < 24) return 'warning';
    return 'success';
  };

  const canBid = isActive && !addressesEqual(auction.highestBidder, account);
  const canEnd = addressesEqual(auction.seller, account);

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h6" noWrap>
                {auction.auctionName || `Token #${auction.tokenId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {auction.tokenId}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
              <Chip
                label={status}
                color={getStatusColor(status)}
                size="small"
              />
              <Chip
                icon={<TimerIcon />}
                label={timeRemaining}
                color={getTimeColor()}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Metadata */}
          {auction.metadata && (
            <Typography variant="body2" color="text.secondary" mb={2} sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {auction.metadata}
            </Typography>
          )}

          {/* Auction Details */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Starting Price:
              </Typography>
              <Chip
                label={`${formattedStartingPrice} ETH`}
                size="small"
                variant="outlined"
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Reserve Price:
              </Typography>
              <Chip
                label={`${formattedReservePrice} ETH`}
                size="small"
                variant="outlined"
                color="warning"
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Highest Bid:
              </Typography>
              <Chip
                label={`${formattedHighestBid} ETH`}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Seller and Bidder Info */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccountIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Seller: {auction.seller}
              </Typography>
            </Box>
            
            {auction.highestBidder && auction.highestBidder !== '0x0000000000000000000000000000000000000000' && (
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Highest Bidder: {auction.highestBidder}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center">
              <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Ends: {new Date(auction.endTime).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Payment Token */}
          <Box mb={2}>
            <Chip
              label={auction.paymentToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'Token'}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          {canBid && isActive && (
            <Button
              variant="contained"
              startIcon={<AuctionIcon />}
              fullWidth
              onClick={() => setBidDialogOpen(true)}
              disabled={loading}
            >
              Place Bid
            </Button>
          )}
          
          {canEnd && isActive && (
            <Button
              variant="outlined"
              startIcon={<FlagIcon />}
              fullWidth
              onClick={() => setEndDialogOpen(true)}
              disabled={loading}
            >
              End Auction
            </Button>
          )}

          {!isActive && (
            <Button
              variant="outlined"
              fullWidth
              disabled
            >
              Auction {status}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onClose={() => setBidDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Place Bid</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              You are bidding on {auction.auctionName || `Token #${auction.tokenId}`}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Current highest bid: {formattedHighestBid} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reserve price: {formattedReservePrice} ETH
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Bid Amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            type="number"
            inputProps={{ min: parseFloat(auction.highestBid) + 0.001, step: 0.001 }}
            disabled={loading}
            sx={{ mb: 2 }}
            helperText={`Minimum bid: ${parseFloat(auction.highestBid) + 0.001} ETH`}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBidDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBid}
            disabled={loading || !marketplaceHelpers.isValidPrice(bidAmount) || parseFloat(bidAmount) <= parseFloat(auction.highestBid)}
          >
            {loading ? 'Placing Bid...' : 'Place Bid'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Auction Dialog */}
      <Dialog open={endDialogOpen} onClose={() => setEndDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>End Auction</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to end this auction? This action cannot be undone.
          </Typography>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Current highest bid: {formattedHighestBid} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reserve price: {formattedReservePrice} ETH
            </Typography>
          </Box>

          {parseFloat(auction.highestBid) >= parseFloat(auction.reservePrice) ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              The auction will be successful as the highest bid meets the reserve price.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mb: 2 }}>
              The auction will not be successful as the highest bid is below the reserve price.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndDialogOpen(false)} disabled={loading}>
            Keep Auction
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleEnd}
            disabled={loading}
          >
            {loading ? 'Ending...' : 'End Auction'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuctionCard;
