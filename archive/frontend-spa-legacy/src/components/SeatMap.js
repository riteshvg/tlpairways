import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const Seat = styled(Paper)(({ theme, selected, occupied }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  cursor: occupied ? 'not-allowed' : 'pointer',
  backgroundColor: selected ? theme.palette.primary.main : 
                  occupied ? theme.palette.grey[300] : 
                  theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : 
         occupied ? theme.palette.text.disabled : 
         theme.palette.text.primary,
  '&:hover': {
    backgroundColor: occupied ? theme.palette.grey[300] : 
                    selected ? theme.palette.primary.dark : 
                    theme.palette.action.hover,
  },
}));

// Aircraft configurations
const aircraftConfigs = {
  'Boeing 737': {
    totalRows: 30,
    seatsPerRow: 6,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
    exitRows: [12, 13],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [12, 13, 14]
  },
  'Airbus A320': {
    totalRows: 30,
    seatsPerRow: 6,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
    exitRows: [12, 13],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [12, 13, 14]
  },
  'Boeing 777-300ER': {
    totalRows: 40,
    seatsPerRow: 9,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
    exitRows: [15, 16, 17],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [15, 16, 17, 18]
  },
  'Boeing 787-9': {
    totalRows: 35,
    seatsPerRow: 9,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
    exitRows: [14, 15, 16],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [14, 15, 16, 17]
  },
  'Airbus A350-900': {
    totalRows: 35,
    seatsPerRow: 9,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'],
    exitRows: [14, 15, 16],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [14, 15, 16, 17]
  },
  'Airbus A380': {
    totalRows: 45,
    seatsPerRow: 10,
    seatLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
    exitRows: [18, 19, 20],
    premiumRows: [1, 2, 3, 4, 5],
    extraLegroomRows: [18, 19, 20, 21]
  }
};

const SeatMap = ({ flight, onSeatSelect, occupiedSeats = [], selectedSeats = [] }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  // Get aircraft configuration or use default
  const config = aircraftConfigs[flight?.aircraft] || aircraftConfigs['Boeing 737'];
  const { totalRows, seatsPerRow, seatLabels, exitRows, premiumRows, extraLegroomRows } = config;

  const generateSeatNumber = (row, seat) => `${row + 1}${seatLabels[seat]}`;

  const getSeatPrice = (seatNumber) => {
    const row = parseInt(seatNumber.slice(0, -1));
    const isWindow = seatNumber.endsWith('A') || seatNumber.endsWith(seatLabels[seatLabels.length - 1]);
    const isFront = premiumRows.includes(row);
    const isExitRow = exitRows.includes(row);
    const isExtraLegroom = extraLegroomRows.includes(row);

    if (isFront && isWindow) {
      return 1000; // Front window seats are most expensive
    } else if (isFront) {
      return 800; // Front aisle/middle seats
    } else if (isExitRow || isExtraLegroom) {
      return 700; // Exit row or extra legroom seats
    } else if (isWindow) {
      return 600; // Window seats in other rows
    }
    return 100; // Regular seats
  };

  const isSeatOccupied = (seatNumber) => {
    return occupiedSeats.includes(seatNumber);
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeats.includes(seatNumber);
  };

  const handleSeatClick = (seatNumber) => {
    if (!isSeatOccupied(seatNumber)) {
      const price = getSeatPrice(seatNumber);
      onSeatSelect(seatNumber, price);
    }
  };

  const getSeatType = (seatNumber) => {
    const row = parseInt(seatNumber.slice(0, -1));
    const isWindow = seatNumber.endsWith('A') || seatNumber.endsWith(seatLabels[seatLabels.length - 1]);
    const isFront = premiumRows.includes(row);
    const isExitRow = exitRows.includes(row);
    const isExtraLegroom = extraLegroomRows.includes(row);

    if (isFront) return 'premium';
    if (isExitRow) return 'exit';
    if (isExtraLegroom) return 'extra-legroom';
    if (isWindow) return 'window';
    return 'standard';
  };

  const renderSeat = (seatNumber) => {
    const isOccupied = isSeatOccupied(seatNumber);
    const isSelected = isSeatSelected(seatNumber);
    const price = getSeatPrice(seatNumber);
    const seatType = getSeatType(seatNumber);

    return (
      <Seat
        key={seatNumber}
        selected={isSelected}
        occupied={isOccupied}
        onClick={() => handleSeatClick(seatNumber)}
        onMouseEnter={() => setHoveredSeat(seatNumber)}
        onMouseLeave={() => setHoveredSeat(null)}
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          bgcolor: isSelected ? 'primary.main' : 
                  isOccupied ? 'grey.300' :
                  seatType === 'premium' ? 'success.light' :
                  seatType === 'exit' ? 'warning.light' :
                  seatType === 'extra-legroom' ? 'info.light' :
                  seatType === 'window' ? 'secondary.light' :
                  'background.paper'
        }}
      >
        {seatNumber}
        {hoveredSeat === seatNumber && !isOccupied && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 0.5,
              zIndex: 1,
              whiteSpace: 'nowrap'
            }}
          >
            {price > 100 ? `₹${price}` : 'Free'}
          </Box>
        )}
      </Seat>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {flight?.aircraft || 'Boeing 737'} - Select Your Seat
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: totalRows }, (_, i) => i + 1).map((row) => (
          <Box key={row} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {seatLabels.map((seat) => {
              const seatId = `${row}${seat}`;
              return renderSeat(seatId);
            })}
          </Box>
        ))}
      </Box>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'center',
        mt: 2,
        flexWrap: 'wrap'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'primary.main',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Selected</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'grey.300',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Occupied</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'success.light',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Premium (₹800-1000)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'warning.light',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Exit Row (₹700)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'info.light',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Extra Legroom (₹700)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'secondary.light',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Window (₹600)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0.5 
          }} />
          <Typography variant="caption">Standard (₹100)</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SeatMap; 