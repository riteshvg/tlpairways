import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import analytics from '../services/analytics';

const AdobeDataLayerDebugger = () => {
  const { user, isAuthenticated } = useAuth();
  const [dataLayer, setDataLayer] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const refreshDataLayer = () => {
    if (window.adobeDataLayer) {
      setDataLayer([...window.adobeDataLayer]);
      const currentUserInfo = analytics.getCurrentUserInfo();
      setUserInfo(currentUserInfo);
    }
  };

  useEffect(() => {
    refreshDataLayer();
    
    // Refresh every 2 seconds to show real-time updates
    const interval = setInterval(refreshDataLayer, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const clearDataLayer = () => {
    if (window.adobeDataLayer) {
      window.adobeDataLayer.length = 0;
      refreshDataLayer();
    }
  };

  const testUserLogin = () => {
    if (user) {
      analytics.trackUserLogin(user);
    }
  };

  const testUserLogout = () => {
    analytics.trackUserLogout();
  };

  const testProfileUpdate = () => {
    if (user) {
      analytics.trackUserProfileUpdate({
        ...user,
        phone: '+1234567890',
        address: 'Test Address',
      });
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔍 Adobe Data Layer Debugger
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Real-time view of Adobe Data Layer events and user information
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refreshDataLayer}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearDataLayer}
              size="small"
              color="warning"
            >
              Clear
            </Button>
          </Box>
        </Box>

        {/* Current User Info */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              👤 Current User Info
              {userInfo && (
                <Chip
                  label={userInfo.status}
                  color={userInfo.status === 'authenticated' ? 'success' : 'default'}
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {userInfo ? (
              <Box>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                  {JSON.stringify(userInfo, null, 2)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No user info found in data layer
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Data Layer Events */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              📊 Data Layer Events ({dataLayer.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {dataLayer.length > 0 ? (
              <Box>
                {dataLayer.map((event, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={event.event || 'No Event'}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem' }}>
                      {JSON.stringify(event, null, 2)}
                    </Typography>
                    {index < dataLayer.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No events in data layer
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Test Buttons */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              🧪 Test Functions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={testUserLogin}
                disabled={!isAuthenticated}
                size="small"
              >
                Test Login
              </Button>
              <Button
                variant="contained"
                onClick={testUserLogout}
                size="small"
              >
                Test Logout
              </Button>
              <Button
                variant="contained"
                onClick={testProfileUpdate}
                disabled={!isAuthenticated}
                size="small"
              >
                Test Profile Update
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AdobeDataLayerDebugger;
