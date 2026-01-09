import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';

const ProfileDropdown = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const handleBookingsClick = () => {
    navigate('/my-bookings');
    handleClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleClose();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={user.picture}
          alt={user.name}
          sx={{ width: 32, height: 32 }}
        >
          <AccountCircleIcon />
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>

        {/* Profile Menu Items */}
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleBookingsClick}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Bookings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <LogoutButton variant="text" size="small" />
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileDropdown;
