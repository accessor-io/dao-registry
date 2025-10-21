/**
 * Listing Card Component
 * Displays individual marketplace listing with buy/cancel actions
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ShoppingCart as BuyIcon,
  Cancel as CancelIcon,
  FlashOn as OffchainIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { marketplaceHelpers, marketplaceApi } from '../../services/marketplace';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethToWei, formatErrorMessage, addressesEqual } from '../../utils/web3';

const ListingCard = ({ listing, enableOffchain = false, onBuy, onCancel }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState(listing.price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive = marketplaceHelpers.isActive(listing);
  const status = marketplaceHelpers.getStatus(listing);
  const formattedPrice = marketplaceHelpers.formatPrice(listing.price);
  const timeRemaining = listing.expiresAt ? marketplaceHelpers.formatTimeRemaining(listing.expiresAt) : 'No expiration';

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to buy this item');
        }
      }

      // Validate buy amount
      if (!marketplaceHelpers.isValidPrice(buyAmount)) {
        throw new Error('Invalid buy amount');
      }

      const buyData = {
        listingId: listing.id,
        price: ethToWei(buyAmount),
        buyer: account,
        enableOffchain
      };

      if (enableOffchain) {
        // Handle offchain buy
        const response = await marketplaceApi.offchainBuy(buyData);
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Failed to buy listing offchain');
        }
      } else {
        // Handle onchain buy
        const response = await marketplaceApi.buyListing(listing.id, buyData);
        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Failed to buy listing');
        }
      }
      
      if (onBuy) {
        await onBuy();
      }
      setBuyDialogOpen(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to cancel this listing');
        }
      }

      const cancelData = {
        listingId: listing.id,
        seller: account
      };

      const response = await marketplaceApi.cancelListing(listing.id, cancelData);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to cancel listing');
      }

      if (onCancel) {
        await onCancel();
      }
      setCancelDialogOpen(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Sold': return 'info';
      case 'Cancelled': return 'error';
      case 'Expired': return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h6" noWrap>
                {listing.listingName || `Token #${listing.tokenId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {listing.tokenId}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
              <Chip
                label={`${formattedPrice} ETH`}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip
                label={status}
                color={getStatusColor(status)}
                size="small"
              />
            </Box>
          </Box>

          {/* Metadata */}
          {listing.metadata && (
            <Typography variant="body2" color="text.secondary" mb={2} sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {listing.metadata}
            </Typography>
          )}

          {/* Details */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <AccountIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Seller: {listing.seller}
              </Typography>
            </Box>
            
            {listing.expiresAt && (
              <Box display="flex" alignItems="center" mb={1}>
                <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Expires: {new Date(listing.expiresAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {isActive && listing.expiresAt && (
              <Box display="flex" alignItems="center">
                <TimerIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="caption" color="warning.main">
                  {timeRemaining} remaining
                </Typography>
              </Box>
            )}
          </Box>

          {/* Payment Token */}
          <Box mb={2}>
            <Chip
              label={listing.paymentToken === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'Token'}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          {isActive && (
            <Button
              variant="contained"
              startIcon={enableOffchain ? <OffchainIcon /> : <BuyIcon />}
              fullWidth
              onClick={() => setBuyDialogOpen(true)}
              disabled={loading}
            >
              {enableOffchain ? 'Buy (Offchain)' : 'Buy Now'}
            </Button>
          )}
          
          {!isActive && addressesEqual(listing.seller, account) && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              fullWidth
              onClick={() => setCancelDialogOpen(true)}
              disabled={loading}
            >
              Cancel Listing
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Buy Dialog */}
      <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {enableOffchain ? 'Buy Item (Offchain)' : 'Buy Item'}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              You are about to buy {listing.listingName || `Token #${listing.tokenId}`} for {formattedPrice} ETH
            </Typography>
          </Box>

          {enableOffchain && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Offchain mode provides gas-efficient trading with signature verification.
            </Alert>
          )}

          <TextField
            fullWidth
            label="Payment Amount (ETH)"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.001 }}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBuy}
            disabled={loading || !marketplaceHelpers.isValidPrice(buyAmount)}
          >
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Listing</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to cancel this listing? This action cannot be undone.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
            Keep Listing
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Listing'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListingCard;
