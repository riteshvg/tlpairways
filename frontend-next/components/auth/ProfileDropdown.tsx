import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import {
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Typography,
    Box,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Person,
    Settings,
    History,
    Logout,
    AccountCircle
} from '@mui/icons-material';
import LogoutButton from './LogoutButton';

export default function ProfileDropdown() {
    const { user } = useUser();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    if (!user) return null;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigate = (path: string) => {
        router.push(path);
        handleClose();
    };

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
                    alt={user.name || 'User'}
                    sx={{ width: 32, height: 32 }}
                >
                    <AccountCircle />
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
                        minWidth: 220,
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
                <MenuItem onClick={() => navigate('/profile')}>
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => navigate('/my-bookings')}>
                    <ListItemIcon>
                        <History fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>My Bookings</ListItemText>
                </MenuItem>

                <MenuItem onClick={() => navigate('/settings')}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        <LogoutButton variant="text" size="small" sx={{ p: 0, minWidth: 0 }}>
                            Sign Out
                        </LogoutButton>
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
