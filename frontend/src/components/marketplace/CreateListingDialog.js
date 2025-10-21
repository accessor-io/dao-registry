/**
 * Create Listing Dialog Component
 * Dialog for creating new marketplace listings
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

const CreateListingDialog = ({ open, onClose, supportedTokens, supportedContracts }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [formData, setFormData] = useState({
    tokenContract: '',
    tokenId: '',
    price: '',
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH by default
    duration: '86400', // 1 day by default
    metadata: '',
    listingName: ''
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
          throw new Error('Please connect your wallet to create a listing');
        }
      }

      // Validate form data
      if (!formData.tokenContract || !formData.tokenId || !formData.price || !formData.duration) {
        throw new Error('Please fill in all required fields');
      }

      if (!marketplaceHelpers.isValidTokenId(formData.tokenId)) {
        throw new Error('Invalid token ID');
      }

      if (!marketplaceHelpers.isValidPrice(formData.price)) {
        throw new Error('Invalid price');
      }

      if (!marketplaceHelpers.isValidDuration(formData.duration)) {
        throw new Error('Invalid duration');
      }

      // Prepare listing data
      const listingData = {
        tokenContract: formData.tokenContract,
        tokenId: formData.tokenId,
        price: ethToWei(formData.price),
        paymentToken: formData.paymentToken,
        duration: parseInt(formData.duration),
        metadata: formData.metadata || '',
        listingName: formData.listingName || `Token #${formData.tokenId}`,
        seller: account
      };

      // Call the actual API
      const response = await marketplaceApi.createListing(listingData);
      
      if (response.data?.success) {
        onClose();
        setFormData({
          tokenContract: '',
          tokenId: '',
          price: '',
          paymentToken: '0x0000000000000000000000000000000000000000',
          duration: '86400',
          metadata: '',
          listingName: ''
        });
        // You might want to show a success notification here
      } else {
        throw new Error(response.data?.error || 'Failed to create listing');
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
        tokenContract: '',
        tokenId: '',
        price: '',
        paymentToken: '0x0000000000000000000000000000000000000000',
        duration: '86400',
        metadata: '',
        listingName: ''
      });
      setError('');
    }
  };

  const durationOptions = [
    { value: '3600', label: '1 Hour' },
    { value: '86400', label: '1 Day' },
    { value: '604800', label: '1 Week' },
    { value: '2592000', label: '1 Month' },
    { value: '7776000', label: '3 Months' },
    { value: '15552000', label: '6 Months' },
    { value: '31536000', label: '1 Year' }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Listing</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          List your ENS domain or DAO registration for sale on the marketplace
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Token Contract</InputLabel>
              <Select
                value={formData.tokenContract}
                onChange={handleInputChange('tokenContract')}
                label="Token Contract"
                disabled={loading}
              >
                {supportedContracts.map((contract) => (
                  <MenuItem key={contract.address} value={contract.address}>
                    {contract.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Token ID"
              value={formData.tokenId}
              onChange={handleInputChange('tokenId')}
              disabled={loading}
              helperText="The ID of the token you want to list"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Listing Name"
              value={formData.listingName}
              onChange={handleInputChange('listingName')}
              disabled={loading}
              helperText="A descriptive name for your listing"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Price (ETH)"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
              helperText="The price you want to sell for"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Token</InputLabel>
              <Select
                value={formData.paymentToken}
                onChange={handleInputChange('paymentToken')}
                label="Payment Token"
                disabled={loading}
              >
                {supportedTokens.map((token) => (
                  <MenuItem key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Duration</InputLabel>
              <Select
                value={formData.duration}
                onChange={handleInputChange('duration')}
                label="Duration"
                disabled={loading}
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Metadata (Optional)"
              multiline
              rows={3}
              value={formData.metadata}
              onChange={handleInputChange('metadata')}
              disabled={loading}
              helperText="Additional information about your listing (JSON format)"
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
              <strong>Important:</strong> Creating a listing will transfer your token to the marketplace contract. 
              You can cancel the listing at any time to get your token back.
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
          disabled={loading || !formData.tokenContract || !formData.tokenId || !formData.price || !formData.duration}
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateListingDialog;
