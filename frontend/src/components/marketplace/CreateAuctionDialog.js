/**
 * Create Auction Dialog Component
 * Dialog for creating new marketplace auctions
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

const CreateAuctionDialog = ({ open, onClose, supportedTokens, supportedContracts }) => {
  const { account, isConnected, connectWallet } = useWeb3();
  const [formData, setFormData] = useState({
    tokenContract: '',
    tokenId: '',
    startingPrice: '',
    reservePrice: '',
    paymentToken: '0x0000000000000000000000000000000000000000', // ETH by default
    duration: '86400', // 1 day by default
    metadata: '',
    auctionName: ''
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
          throw new Error('Please connect your wallet to create an auction');
        }
      }

      // Validate form data
      if (!formData.tokenContract || !formData.tokenId || !formData.startingPrice || !formData.reservePrice || !formData.duration) {
        throw new Error('Please fill in all required fields');
      }

      if (!marketplaceHelpers.isValidTokenId(formData.tokenId)) {
        throw new Error('Invalid token ID');
      }

      if (!marketplaceHelpers.isValidPrice(formData.startingPrice)) {
        throw new Error('Invalid starting price');
      }

      if (!marketplaceHelpers.isValidPrice(formData.reservePrice)) {
        throw new Error('Invalid reserve price');
      }

      if (parseFloat(formData.reservePrice) < parseFloat(formData.startingPrice)) {
        throw new Error('Reserve price must be greater than or equal to starting price');
      }

      if (!marketplaceHelpers.isValidDuration(formData.duration)) {
        throw new Error('Invalid duration');
      }

      // Prepare auction data
      const auctionData = {
        tokenContract: formData.tokenContract,
        tokenId: formData.tokenId,
        startingPrice: ethToWei(formData.startingPrice),
        reservePrice: ethToWei(formData.reservePrice),
        paymentToken: formData.paymentToken,
        duration: parseInt(formData.duration),
        metadata: formData.metadata || '',
        auctionName: formData.auctionName || `Auction for Token #${formData.tokenId}`,
        seller: account
      };

      // Call the actual API
      const response = await marketplaceApi.createAuction(auctionData);
      
      if (response.data?.success) {
        onClose();
        setFormData({
          tokenContract: '',
          tokenId: '',
          startingPrice: '',
          reservePrice: '',
          paymentToken: '0x0000000000000000000000000000000000000000',
          duration: '86400',
          metadata: '',
          auctionName: ''
        });
        // You might want to show a success notification here
      } else {
        throw new Error(response.data?.error || 'Failed to create auction');
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
        startingPrice: '',
        reservePrice: '',
        paymentToken: '0x0000000000000000000000000000000000000000',
        duration: '86400',
        metadata: '',
        auctionName: ''
      });
      setError('');
    }
  };

  const durationOptions = [
    { value: '3600', label: '1 Hour' },
    { value: '21600', label: '6 Hours' },
    { value: '43200', label: '12 Hours' },
    { value: '86400', label: '1 Day' },
    { value: '172800', label: '2 Days' },
    { value: '259200', label: '3 Days' },
    { value: '432000', label: '5 Days' },
    { value: '604800', label: '1 Week' }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Auction</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Start an auction for your ENS domain or DAO registration
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
              helperText="The ID of the token you want to auction"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Auction Name"
              value={formData.auctionName}
              onChange={handleInputChange('auctionName')}
              disabled={loading}
              helperText="A descriptive name for your auction"
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
            <TextField
              fullWidth
              required
              label="Starting Price (ETH)"
              type="number"
              value={formData.startingPrice}
              onChange={handleInputChange('startingPrice')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
              helperText="The minimum bid amount"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Reserve Price (ETH)"
              type="number"
              value={formData.reservePrice}
              onChange={handleInputChange('reservePrice')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
              helperText="The minimum price to sell (hidden from bidders)"
            />
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Time"
              value={new Date(Date.now() + parseInt(formData.duration) * 1000).toLocaleString()}
              disabled
              helperText="Calculated based on duration"
            />
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
              helperText="Additional information about your auction (JSON format)"
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
              <strong>Important:</strong> Creating an auction will transfer your token to the marketplace contract. 
              The auction will end automatically after the specified duration, or you can end it manually.
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
          disabled={loading || !formData.tokenContract || !formData.tokenId || !formData.startingPrice || !formData.reservePrice || !formData.duration}
        >
          {loading ? 'Creating...' : 'Create Auction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAuctionDialog;
