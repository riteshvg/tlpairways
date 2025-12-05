import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  BabyChangingStation as InfantIcon,
} from '@mui/icons-material';

interface PassengerCounts {
  adult: number;
  child: number;
  infant: number;
}

interface PassengerSelectorProps {
  passengerCounts: PassengerCounts;
  onPassengerCountsChange: React.Dispatch<React.SetStateAction<PassengerCounts>>;
  disabled?: boolean;
}

const PassengerSelector: React.FC<PassengerSelectorProps> = ({
  passengerCounts,
  onPassengerCountsChange,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

  const passengerTypes = [
    {
      key: 'adult' as keyof PassengerCounts,
      label: 'Adults',
      description: '12+ years',
      icon: <PersonIcon />,
      min: 1,
      max: 9
    },
    {
      key: 'child' as keyof PassengerCounts,
      label: 'Children',
      description: '2-11 years',
      icon: <ChildIcon />,
      min: 0,
      max: 2
    },
    {
      key: 'infant' as keyof PassengerCounts,
      label: 'Infants',
      description: 'Under 2 years',
      icon: <InfantIcon />,
      min: 0,
      max: 2
    }
  ];

  const totalPassengers = Object.values(passengerCounts).reduce((sum, count) => sum + count, 0);

  const handleIncrement = (type: keyof PassengerCounts) => {
    const maxCount = passengerTypes.find(p => p.key === type)?.max || 9;
    if (passengerCounts[type] < maxCount) {
      onPassengerCountsChange(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
    }
  };

  const handleDecrement = (type: keyof PassengerCounts) => {
    const minCount = passengerTypes.find(p => p.key === type)?.min || 0;
    if (passengerCounts[type] > minCount) {
      onPassengerCountsChange(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    }
  };

  const anchorRef = useRef(null);

  return (
    <Box sx={{ position: 'relative' }}>
      <FormControl fullWidth required>
        <InputLabel>Passengers</InputLabel>
        <Select
          ref={anchorRef}
          value="passengers"
          label="Passengers"
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={() => { }} // Prevent form validation issues
          disabled={disabled}
          renderValue={() => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2">
                {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
              </Typography>
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
                '& .MuiMenuItem-root': {
                  px: 0,
                  py: 0,
                }
              }
            }
          }}
        >
          <MenuItem value="passengers" sx={{ display: 'none' }}>
            {/* Hidden item to satisfy form validation */}
          </MenuItem>
          {passengerTypes.map((type, index) => (
            <Box key={type.key}>
              <MenuItem
                value={type.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                sx={{
                  py: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'transparent'
                  },
                  cursor: 'default'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'primary.main' }}>
                      {type.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDecrement(type.key);
                      }}
                      disabled={passengerCounts[type.key] <= type.min}
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>

                    <Typography
                      variant="h6"
                      sx={{
                        minWidth: 40,
                        textAlign: 'center',
                        fontWeight: 'medium'
                      }}
                    >
                      {passengerCounts[type.key]}
                    </Typography>

                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleIncrement(type.key);
                      }}
                      disabled={passengerCounts[type.key] >= type.max}
                      size="small"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: 32,
                        height: 32,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </MenuItem>

              {index < passengerTypes.length - 1 && (
                <Divider sx={{ mx: 2 }} />
              )}
            </Box>
          ))}

          <Box sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Passengers
            </Typography>
            <Typography variant="h6" color="primary">
              {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
            </Typography>
          </Box>
        </Select>
      </FormControl>
    </Box>
  );
};

export default PassengerSelector;
