/**
 * Offer Card Component
 * Displays individual marketplace offer with accept/reject actions
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
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  AttachMoney as OfferIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  Timer as TimerIcon,
  AccountCircle as AccountIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { marketplaceHelpers, marketplaceApi } from '../../services/marketplace';
import { useWeb3 } from '../../hooks/useWeb3';
import { formatErrorMessage, addressesEqual } from '../../utils/web3';

const OfferCard = ({ offer, onAccept, onReject }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive = marketplaceHelpers.isActive(offer);
  const status = marketplaceHelpers.getStatus(offer);
  const formattedPrice = marketplaceHelpers.formatPrice(offer.price);
  const timeRemaining = marketplaceHelpers.formatTimeRemaining(offer.offerUntil);

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to accept this offer');
        }
      }

      const acceptData = {
        offerId: offer.id,
        domainOwner: account
      };

      const response = await marketplaceApi.acceptOffer(offer.id, acceptData);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to accept offer');
      }

      if (onAccept) {
        await onAccept();
      }
      setAcceptDialogOpen(false);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to reject this offer');
        }
      }

      const rejectData = {
        offerIds: [offer.id],
        domainOwner: account
      };

      const response = await marketplaceApi.rejectOffers(rejectData);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to reject offer');
      }

      if (onReject) {
        await onReject();
      }
      setRejectDialogOpen(false);
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

  const getTimeColor = () => {
    const now = new Date();
    const end = new Date(offer.offerUntil);
    const timeLeft = end - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 1) return 'error';
    if (hoursLeft < 24) return 'warning';
    return 'success';
  };

  const canAccept = isActive && addressesEqual(offer.domainOwner, account);
  const canReject = addressesEqual(offer.domainOwner, account);

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box>
              <Typography variant="h6" noWrap>
                {offer.offerName || `Offer for Token #${offer.tokenId}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {offer.tokenId}
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

          {/* Offer Details */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Offer Amount:
              </Typography>
              <Chip
                label={`${formattedPrice} ETH`}
                size="small"
                color="primary"
              />
            </Box>

            <Box display="flex" alignItems="center" mb={1}>
              <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Expires: {new Date(offer.offerUntil).toLocaleString()}
              </Typography>
            </Box>

            {isActive && (
              <Box display="flex" alignItems="center">
                <TimerIcon fontSize="small" sx={{ mr: 1, color: getTimeColor() }} />
                <Typography variant="caption" color={getTimeColor()}>
                  {timeRemaining} remaining
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Participants */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Domain Owner: {offer.domainOwner}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" mb={1}>
              <AccountIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Offer Maker: {offer.offerMaker}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <OfferIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Made: {new Date(offer.offeredAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Cancel Reason */}
          {offer.cancelReason && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="caption">
                Cancelled: {offer.cancelReason}
              </Typography>
            </Alert>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          {canAccept && isActive && (
            <Button
              variant="contained"
              startIcon={<AcceptIcon />}
              fullWidth
              onClick={() => setAcceptDialogOpen(true)}
              disabled={loading}
              color="success"
            >
              Accept Offer
            </Button>
          )}
          
          {canReject && isActive && (
            <Button
              variant="outlined"
              startIcon={<RejectIcon />}
              fullWidth
              onClick={() => setRejectDialogOpen(true)}
              disabled={loading}
              color="error"
            >
              Reject Offer
            </Button>
          )}

          {!isActive && (
            <Button
              variant="outlined"
              fullWidth
              disabled
            >
              Offer {status}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Accept Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You are about to accept an offer of {formattedPrice} ETH for Token #{offer.tokenId}
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Accepting this offer will transfer the domain to the offer maker and you will receive the payment.
          </Alert>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Offer Maker: {offer.offerMaker}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Offer Amount: {formattedPrice} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform Fee: 1% (deducted from payment)
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? 'Accepting...' : 'Accept Offer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Are you sure you want to reject this offer? The offer maker will receive a refund.
          </Typography>

          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Offer Maker: {offer.offerMaker}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Offer Amount: {formattedPrice} ETH
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={loading}>
            Keep Offer
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={loading}
          >
            {loading ? 'Rejecting...' : 'Reject Offer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OfferCard;
