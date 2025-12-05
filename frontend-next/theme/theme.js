import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00695C', // Deep Teal - Professional and trustworthy
      light: '#4DB6AC', // Aqua - Modern and fresh
      dark: '#004D40', // Dark Teal - Sophisticated
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#26A69A', // Teal - Complementary accent
      light: '#80CBC4', // Light Teal - Soft accent
      dark: '#00695C', // Deep Teal - Strong accent
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#E0F2F1', // Light Teal - Calming background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#004D40', // Dark Teal - Professional text
      secondary: '#00695C', // Deep Teal - Secondary text
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FFA000',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    info: {
      main: '#00695C', // Use teal for info
      light: '#4DB6AC',
      dark: '#004D40',
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
    },
    h2: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.35,
    },
    h6: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1.1rem',
      fontWeight: 500,
      letterSpacing: '0.005em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.015em',
    },
    button: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
      fontSize: '0.95rem',
    },
    caption: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
      lineHeight: 1.4,
    },
    overline: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      lineHeight: 1.2,
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
            boxShadow: '0px 4px 8px rgba(0, 105, 92, 0.2)',
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.95rem',
            fontWeight: 400,
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
            fontWeight: 500,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#00695C', // Use Primary Teal
          color: '#FFFFFF', // White text
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    '0px 2px 4px rgba(0, 105, 92, 0.1)', // Subtle teal shadow
    '0px 4px 8px rgba(0, 105, 92, 0.1)',
    '0px 6px 12px rgba(0, 105, 92, 0.1)',
    '0px 8px 16px rgba(0, 105, 92, 0.1)',
    '0px 10px 20px rgba(0, 105, 92, 0.1)',
    '0px 12px 24px rgba(0, 105, 92, 0.1)',
    '0px 14px 28px rgba(0, 105, 92, 0.1)',
    '0px 16px 32px rgba(0, 105, 92, 0.1)',
    '0px 18px 36px rgba(0, 105, 92, 0.1)',
    '0px 20px 40px rgba(0, 105, 92, 0.1)',
    '0px 22px 44px rgba(0, 105, 92, 0.1)',
    '0px 24px 48px rgba(0, 105, 92, 0.1)',
    '0px 26px 52px rgba(0, 105, 92, 0.1)',
    '0px 28px 56px rgba(0, 105, 92, 0.1)',
    '0px 30px 60px rgba(0, 105, 92, 0.1)',
    '0px 32px 64px rgba(0, 105, 92, 0.1)',
    '0px 34px 68px rgba(0, 105, 92, 0.1)',
    '0px 36px 72px rgba(0, 105, 92, 0.1)',
    '0px 38px 76px rgba(0, 105, 92, 0.1)',
    '0px 40px 80px rgba(0, 105, 92, 0.1)',
    '0px 42px 84px rgba(0, 105, 92, 0.1)',
    '0px 44px 88px rgba(0, 105, 92, 0.1)',
    '0px 46px 92px rgba(0, 105, 92, 0.1)',
    '0px 48px 96px rgba(0, 105, 92, 0.1)',
  ],
});

export default theme; 