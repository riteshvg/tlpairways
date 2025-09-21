import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FlightTakeoff as FlightIcon,
  Star as StarIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  };

  const handleSave = () => {
    // In a real app, you would save this to your backend
    console.log('Saving user profile:', editedUser);
    
    // Track profile update in Adobe Data Layer
    // Analytics call removed
    
    setSnackbar({
      open: true,
      message: 'Profile updated successfully!',
      severity: 'success',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  };

  const handleInputChange = (field) => (event) => {
    setEditedUser({
      ...editedUser,
      [field]: event.target.value,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  const handleChangePassword = () => {
    // In a real app, this would redirect to password change page
    setSnackbar({
      open: true,
      message: 'Password change feature coming soon!',
      severity: 'info',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Personal Information</Typography>
              {!isEditing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  variant="outlined"
                  size="small"
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              {/* Profile Picture */}
              <Grid item xs={12} sm={4}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    src={user.picture}
                    alt={user.name}
                    sx={{ width: 120, height: 120, mb: 2 }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  {isEditing && (
                    <Button variant="outlined" size="small">
                      Change Photo
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Profile Details */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      value={isEditing ? editedUser.name : user.name}
                      onChange={isEditing ? handleInputChange('name') : undefined}
                      disabled={!isEditing}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      value={isEditing ? editedUser.email : user.email}
                      onChange={isEditing ? handleInputChange('email') : undefined}
                      disabled={!isEditing}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      value={isEditing ? editedUser.phone : (user.phone || 'Not provided')}
                      onChange={isEditing ? handleInputChange('phone') : undefined}
                      disabled={!isEditing}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Address"
                      value={isEditing ? editedUser.address : (user.address || 'Not provided')}
                      onChange={isEditing ? handleInputChange('address') : undefined}
                      disabled={!isEditing}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                {isEditing && (
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      variant="contained"
                      color="primary"
                    >
                      Save Changes
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Account Status & Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Chip
                icon={<EmailIcon />}
                label={user.email_verified ? 'Email Verified' : 'Email Not Verified'}
                color={user.email_verified ? 'success' : 'warning'}
                variant="outlined"
              />
              <Chip
                icon={<StarIcon />}
                label="TLAirways Member"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<SecurityIcon />}
                label="Secure Account"
                color="success"
                variant="outlined"
              />
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button onClick={handleViewBookings}>
                <ListItemIcon>
                  <FlightIcon />
                </ListItemIcon>
                <ListItemText primary="View My Bookings" />
              </ListItem>
              <ListItem button onClick={handleChangePassword}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>


      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfilePage;
