import React, { useState } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import PassengerSelector from './PassengerSelector';

const PassengerSelectorTest = () => {
  const [passengerCounts, setPassengerCounts] = useState({ adult: 1, child: 0, infant: 0 });

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Passenger Selector Test
        </Typography>
        <Typography variant="body1" gutterBottom>
          Current passenger counts: Adults: {passengerCounts.adult}, Children: {passengerCounts.child}, Infants: {passengerCounts.infant}
        </Typography>
        <PassengerSelector
          passengerCounts={passengerCounts}
          onPassengerCountsChange={setPassengerCounts}
        />
      </Paper>
    </Container>
  );
};

export default PassengerSelectorTest;
