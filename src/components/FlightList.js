import React from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FlightList = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Flight List
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          This page will display the list of available flights.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ display: 'block', mx: 'auto' }}
        >
          Back to Search
        </Button>
      </Paper>
    </Container>
  );
};

export default FlightList; 