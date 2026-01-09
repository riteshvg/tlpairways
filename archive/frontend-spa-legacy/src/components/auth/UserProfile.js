import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from './LogoutButton';

const UserProfile = ({ showLogout = true, ...props }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Card {...props}>
        <CardContent>
          <Typography>Loading profile...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card {...props}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={user.picture}
            alt={user.name}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {user.name}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <EmailIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={user.email_verified ? 'Verified' : 'Unverified'}
            color={user.email_verified ? 'success' : 'warning'}
            size="small"
          />
          <Chip
            label="Member"
            color="primary"
            size="small"
          />
        </Box>

        {showLogout && (
          <>
            <Divider sx={{ my: 2 }} />
            <LogoutButton fullWidth />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
