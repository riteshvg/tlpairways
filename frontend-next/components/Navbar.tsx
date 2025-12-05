import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const navItems = [
        { label: 'Book', path: '/search' },
        { label: 'Manage Booking', path: '/manage-booking' },
        { label: 'Offers', path: '/offers' },
        { label: 'About Us', path: '/about' },
    ];

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: 'background.default',
                boxShadow: 'none',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo */}
                    <Typography
                        variant="h5"
                        component="a"
                        href="/"
                        sx={{
                            fontFamily: 'Playfair Display',
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'none',
                            flexGrow: { xs: 1, md: 0 },
                            mr: { md: 4 },
                        }}
                    >
                        TLP Airways
                    </Typography>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    component="a"
                                    href={item.path}
                                    sx={{
                                        color: 'text.primary',
                                        '&:hover': {
                                            color: 'primary.main',
                                            backgroundColor: 'transparent',
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {/* Authentication Section - Placeholder for now */}
                    <Box sx={{ ml: { xs: 'auto', md: 2 }, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            component="a"
                            href="/profile"
                            variant="outlined"
                            size="small"
                            sx={{
                                textTransform: 'none',
                            }}
                        >
                            Sign In
                        </Button>
                    </Box>

                    {/* Mobile Menu */}
                    {isMobile && (
                        <>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenu}
                                sx={{ ml: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        minWidth: 200,
                                    },
                                }}
                            >
                                {navItems.map((item) => (
                                    <MenuItem
                                        key={item.label}
                                        component="a"
                                        href={item.path}
                                        onClick={handleClose}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
