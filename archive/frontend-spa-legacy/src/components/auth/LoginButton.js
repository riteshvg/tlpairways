import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LoginButton = ({ variant = 'contained', size = 'medium', ...props }) => {
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
      onClick={handleLogin}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Signing In...' : 'Sign In'}
    </Button>
  );
};

export default LoginButton;
