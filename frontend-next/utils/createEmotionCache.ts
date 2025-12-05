import createCache from '@emotion/cache';

// Create emotion cache for MUI styling
// This ensures consistent class names between server and client
export default function createEmotionCache() {
    return createCache({ key: 'css', prepend: true });
}
