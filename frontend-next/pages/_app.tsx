import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Navbar from '../components/Navbar';

/**
 * Custom App Component
 * 
 * Wraps the entire application with:
 * - Material-UI ThemeProvider (styling)
 * - CssBaseline (CSS reset)
 * - Navbar (global navigation)
 * 
 * Note: Auth0 UserProvider not needed in Pages Router
 * Authentication works via API routes and useUser hook
 */
export default function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}
