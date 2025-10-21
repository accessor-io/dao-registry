/**
 * Advanced Search Dialog Component
 * Dialog for advanced marketplace search with multiple filters
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
  Box,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';

const AdvancedSearchDialog = ({ open, onClose, onSearch, loading }) => {
  const [searchData, setSearchData] = useState({
    type: 'all',
    priceMin: '',
    priceMax: '',
    tokenContract: '',
    seller: '',
    startsWith: '',
    endsWith: '',
    letters: '',
    numbers: '',
    unicode: '',
    emojis: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    limit: 50
  });
  const [error, setError] = useState('');

  const handleInputChange = (field) => (event) => {
    setSearchData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setSearchData(prev => ({
      ...prev,
      [field]: event.target.checked ? 'true' : 'false'
    }));
  };

  const handleSubmit = async () => {
    setError('');

    try {
      // Validate search data
      if (searchData.priceMin && searchData.priceMax && parseFloat(searchData.priceMin) > parseFloat(searchData.priceMax)) {
        throw new Error('Minimum price cannot be greater than maximum price');
      }

      // Filter out empty values
      const filteredData = Object.fromEntries(
        Object.entries(searchData).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      await onSearch(filteredData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSearchData({
        type: 'all',
        priceMin: '',
        priceMax: '',
        tokenContract: '',
        seller: '',
        startsWith: '',
        endsWith: '',
        letters: '',
        numbers: '',
        unicode: '',
        emojis: '',
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        limit: 50
      });
      setError('');
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'listings', label: 'Listings Only' },
    { value: 'auctions', label: 'Auctions Only' },
    { value: 'offers', label: 'Offers Only' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'price', label: 'Price' },
    { value: 'expiresAt', label: 'Expiration Date' },
    { value: 'tokenId', label: 'Token ID' }
  ];

  const sortDirectionOptions = [
    { value: 'ASC', label: 'Ascending' },
    { value: 'DESC', label: 'Descending' }
  ];

  const limitOptions = [
    { value: 10, label: '10 items' },
    { value: 25, label: '25 items' },
    { value: 50, label: '50 items' },
    { value: 100, label: '100 items' }
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Advanced Search</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Use advanced filters to find specific items in the marketplace
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Filters */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Filters
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Search Type</InputLabel>
              <Select
                value={searchData.type}
                onChange={handleInputChange('type')}
                label="Search Type"
                disabled={loading}
              >
                {typeOptions.map((option) => (
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
              label="Token Contract Address"
              value={searchData.tokenContract}
              onChange={handleInputChange('tokenContract')}
              disabled={loading}
              placeholder="0x..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Seller Address"
              value={searchData.seller}
              onChange={handleInputChange('seller')}
              disabled={loading}
              placeholder="0x..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Results Limit"
              value={searchData.limit}
              onChange={handleInputChange('limit')}
              disabled={loading}
              select
            >
              {limitOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Price Filters */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Price Filters
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Minimum Price (ETH)"
              type="number"
              value={searchData.priceMin}
              onChange={handleInputChange('priceMin')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maximum Price (ETH)"
              type="number"
              value={searchData.priceMax}
              onChange={handleInputChange('priceMax')}
              disabled={loading}
              inputProps={{ min: 0, step: 0.001 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Domain Name Filters */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Domain Name Filters
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Starts With"
              value={searchData.startsWith}
              onChange={handleInputChange('startsWith')}
              disabled={loading}
              placeholder="crypto"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ends With"
              value={searchData.endsWith}
              onChange={handleInputChange('endsWith')}
              disabled={loading}
              placeholder=".eth"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Contains Letters</InputLabel>
              <Select
                value={searchData.letters}
                onChange={handleInputChange('letters')}
                label="Contains Letters"
                disabled={loading}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Contains Numbers</InputLabel>
              <Select
                value={searchData.numbers}
                onChange={handleInputChange('numbers')}
                label="Contains Numbers"
                disabled={loading}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Contains Unicode</InputLabel>
              <Select
                value={searchData.unicode}
                onChange={handleInputChange('unicode')}
                label="Contains Unicode"
                disabled={loading}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Contains Emojis</InputLabel>
              <Select
                value={searchData.emojis}
                onChange={handleInputChange('emojis')}
                label="Contains Emojis"
                disabled={loading}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Sorting */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Sorting
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={searchData.sortBy}
                onChange={handleInputChange('sortBy')}
                label="Sort By"
                disabled={loading}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={searchData.sortDirection}
                onChange={handleInputChange('sortDirection')}
                label="Sort Direction"
                disabled={loading}
              >
                {sortDirectionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSearchDialog;


