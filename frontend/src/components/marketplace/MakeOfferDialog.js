/**
 * Make Offer Dialog Component
 * Dialog for making offers on domains
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  LinearProgress,
  Typography,
  Box
} from '@mui/material';
import { marketplaceHelpers, marketplaceApi } from '../../services/marketplace';
import { useWeb3 } from '../../hooks/useWeb3';
import { ethToWei, formatErrorMessage } from '../../utils/web3';

const MakeOfferDialog = ({ open, onClose, supportedTokens }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [formData, setFormData] = useState({
    domainOwner: '',
    tokenId: '',
    price: '',
    offerUntil: '',
    offerName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Check wallet connection
      if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Please connect your wallet to make an offer');
        }
      }

      // Validate form data
      if (!formData.domainOwner || !formData.tokenId || !formData.price || !formData.offerUntil) {
        throw new Error('Please fill in all required fields');
      }

      if (!marketplaceHelpers.isValidAddress(formData.domainOwner)) {
        throw new Error('Invalid domain owner address');
      }

      if (!marketplaceHelpers.isValidTokenId(formData.tokenId)) {
        throw new Error('Invalid token ID');
      }

      if (!marketplaceHelpers.isValidPrice(formData.price)) {
        throw new Error('Invalid offer price');
      }

      const offerUntilDate = new Date(formData.offerUntil);
      if (offerUntilDate <= new Date()) {
        throw new Error('Offer expiration must be in the future');
      }

      // Prepare offer data
      const offerData = {
        domainOwner: formData.domainOwner,
        tokenId: formData.tokenId,
        price: ethToWei(formData.price),
        offerUntil: Math.floor(offerUntilDate.getTime() / 1000),
        offerName: formData.offerName || `Offer for Token #${formData.tokenId}`,
        offerMaker: account
      };

      // Call the actual API
      const response = await marketplaceApi.makeOffer(offerData);
      
      if (response.data?.success) {
        onClose();
        setFormData({
          domainOwner: '',
          tokenId: '',
          price: '',
          offerUntil: '',
          offerName: ''
        });
        // You might want to show a success notification here
      } else {
        throw new Error(response.data?.error || 'Failed to create offer');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({
        domainOwner: '',
        tokenId: '',
        price: '',
        offerUntil: '',
        offerName: ''
      });
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Make an Offer</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Make an offer for an ENS domain or DAO registration owned by someone else
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Domain Owner Address"
              value={formData.domainOwner}
              onChange={handleInputChange('domainOwner')}
              disabled={loading}
              helperText="The Ethereum address of the domain owner"
              placeholder="0x..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Token ID"
              value={formData.tokenId}
              onChange={handleInputChange('tokenId')}
              disabled={loading}
              helperText="The ID of the token you want to make an offer for"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Offer Name (Optional)"
              value={formData.offerName}
              onChange={handleInputChange('offerName')}
              disabled={loading}
              helperText="A descriptive name for your offer"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Offer Price (ETH)"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
              helperText="The amount you're offering"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Offer Expiration"
              type="datetime-local"
              value={formData.offerUntil}
              onChange={handleInputChange('offerUntil')}
              disabled={loading}
              helperText="When this offer expires"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Token"
              value="ETH"
              disabled
              helperText="Currently only ETH is supported for offers"
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mt: 2 }} />}

        <Box mt={2}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Important:</strong> Making an offer will lock your payment until the offer is accepted, 
              rejected, or expires. The domain owner can accept or reject your offer at any time.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.domainOwner || !formData.tokenId || !formData.price || !formData.offerUntil}
        >
          {loading ? 'Making Offer...' : 'Make Offer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MakeOfferDialog;
