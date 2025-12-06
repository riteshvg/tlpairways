import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Navbar from '../components/Navbar';
import { ConsentProvider } from '../lib/consent/ConsentContext';
import ConsentExperience from '../components/consent/ConsentExperience';

/**
 * Custom App Component
 * 
 * Wraps the entire application with:
 * - ConsentProvider (consent management)
 * - Material-UI ThemeProvider (styling)
 * - CssBaseline (CSS reset)
 * - Navbar (global navigation)
 * - ConsentExperience (consent UI)
 * 
 * Note: Auth0 UserProvider not needed in Pages Router
 * Authentication works via API routes and useUser hook
 */
export default function App({ Component, pageProps }: AppProps) {
    return (
        <ConsentProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Navbar />
                <ConsentExperience />
                <Component {...pageProps} />
            </ThemeProvider>
        </ConsentProvider>
    );
}
