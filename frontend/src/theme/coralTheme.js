import { createTheme } from '@mui/material/styles';

// Coral Theme Configuration
const coralTheme = createTheme({
  palette: {
    primary: {
      main: '#FF5722', // Coral - Warm, energetic, attention-grabbing
      light: '#FF8A65', // Light Coral - Soft, welcoming
      dark: '#D84315', // Deep Coral - Sophisticated depth
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E91E63', // Pink - Gentle, friendly accent
      light: '#F8BBD9', // Soft Pink - Gentle highlights
      dark: '#AD1457', // Deep Pink - Strong accent
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFEBEE', // Light Coral - Soft, welcoming background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#D84315', // Deep Coral - Warm, readable text
      secondary: '#FF5722', // Coral - Secondary text
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FF9800', // Orange - Warm warning
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#FF5722', // Use coral for info
      light: '#FF8A65',
      dark: '#D84315',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.1,
      color: '#D84315', // Deep Coral
    },
    h2: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#D84315', // Deep Coral
    },
    h3: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.25,
      color: '#D84315', // Deep Coral
    },
    h4: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#D84315', // Deep Coral
    },
    h5: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.35,
      color: '#D84315', // Deep Coral
    },
    h6: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '0em',
      lineHeight: 1.4,
      color: '#D84315', // Deep Coral
    },
    body1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
      color: '#D84315', // Deep Coral
    },
    body2: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.015em',
      color: '#FF5722', // Coral
    },
    button: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(255, 87, 34, 0.3)', // Coral shadow
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(255, 87, 34, 0.1)', // Coral shadow
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(255, 87, 34, 0.1)', // Coral shadow
    '0px 4px 8px rgba(255, 87, 34, 0.1)',
    '0px 6px 12px rgba(255, 87, 34, 0.1)',
    '0px 8px 16px rgba(255, 87, 34, 0.1)',
    '0px 10px 20px rgba(255, 87, 34, 0.1)',
    '0px 12px 24px rgba(255, 87, 34, 0.1)',
    '0px 14px 28px rgba(255, 87, 34, 0.1)',
    '0px 16px 32px rgba(255, 87, 34, 0.1)',
    '0px 18px 36px rgba(255, 87, 34, 0.1)',
    '0px 20px 40px rgba(255, 87, 34, 0.1)',
    '0px 22px 44px rgba(255, 87, 34, 0.1)',
    '0px 24px 48px rgba(255, 87, 34, 0.1)',
    '0px 26px 52px rgba(255, 87, 34, 0.1)',
    '0px 28px 56px rgba(255, 87, 34, 0.1)',
    '0px 30px 60px rgba(255, 87, 34, 0.1)',
    '0px 32px 64px rgba(255, 87, 34, 0.1)',
    '0px 34px 68px rgba(255, 87, 34, 0.1)',
    '0px 36px 72px rgba(255, 87, 34, 0.1)',
    '0px 38px 76px rgba(255, 87, 34, 0.1)',
    '0px 40px 80px rgba(255, 87, 34, 0.1)',
    '0px 42px 84px rgba(255, 87, 34, 0.1)',
    '0px 44px 88px rgba(255, 87, 34, 0.1)',
    '0px 46px 92px rgba(255, 87, 34, 0.1)',
    '0px 48px 96px rgba(255, 87, 34, 0.1)',
  ],
});

export default coralTheme;
