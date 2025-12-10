import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Navbar from '../components/Navbar';
import { ConsentProvider } from '../lib/consent/ConsentContext';
import ConsentExperience from '../components/consent/ConsentExperience';
import { useRouter } from 'next/router';

/**
 * Custom App Component
 * 
 * Wraps the entire application with:
 * - ConsentProvider (consent management)
 * - Material-UI ThemeProvider (styling)
 * - CssBaseline (CSS reset)
 * - Navbar (global navigation)
 * - ConsentExperience (consent UI - hidden on marketing simulator page)
 * 
 * Note: Auth0 UserProvider not needed in Pages Router
 * Authentication works via API routes and useUser hook
 */
export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    // Hide consent banner on marketing simulator page
    const showConsent = router.pathname !== '/marketing-simulator';

    return (
        <ConsentProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Navbar />
                {showConsent && <ConsentExperience />}
                <Component {...pageProps} />
            </ThemeProvider>
        </ConsentProvider>
    );
}
