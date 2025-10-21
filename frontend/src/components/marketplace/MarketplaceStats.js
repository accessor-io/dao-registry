/**
 * Marketplace Statistics Component
 * Displays key marketplace metrics and statistics
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Gavel as AuctionIcon,
  AttachMoney as OfferIcon,
  FlashOn as OffchainIcon,
  Percent as PercentIcon
} from '@mui/icons-material';

const MarketplaceStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item}>
            <Card>
              <CardContent>
                <LinearProgress />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Active Listings',
      value: stats.totalListings || 0,
      icon: <AccountBalanceIcon />,
      color: 'primary',
      description: 'Currently listed items'
    },
    {
      title: 'Active Auctions',
      value: stats.totalAuctions || 0,
      icon: <AuctionIcon />,
      color: 'secondary',
      description: 'Ongoing auctions'
    },
    {
      title: 'Active Offers',
      value: stats.totalOffers || 0,
      icon: <OfferIcon />,
      color: 'success',
      description: 'Pending offers'
    },
    {
      title: 'Platform Fee',
      value: `${stats.platformFeePercentage || 0}%`,
      icon: <PercentIcon />,
      color: 'info',
      description: 'Transaction fee'
    },
    {
      title: 'Offer Fee',
      value: `${stats.offerFeePercentage || 0}%`,
      icon: <PercentIcon />,
      color: 'warning',
      description: 'Offer acceptance fee'
    },
    {
      title: 'Total Volume',
      value: `${stats.totalVolume || '0.0'} ETH`,
      icon: <TrendingUpIcon />,
      color: 'success',
      description: 'All-time trading volume'
    }
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${stat.color}.light`,
                      color: `${stat.color}.contrastText`,
                      mr: 1
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {stat.title}
                  </Typography>
                </Box>
                <Tooltip title={stat.description}>
                  <Chip
                    label={stat.value}
                    color={stat.color}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
              <Typography variant="h4" color={`${stat.color}.main`} fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MarketplaceStats;


