import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LogoutButton = ({ variant = 'outlined', size = 'medium', ...props }) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={isLoading ? <CircularProgress size={20} /> : <LogoutIcon />}
      onClick={handleLogout}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Signing Out...' : 'Sign Out'}
    </Button>
  );
};

export default LogoutButton;
