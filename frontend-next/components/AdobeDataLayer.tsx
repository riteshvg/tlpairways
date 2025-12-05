import { useEffect } from 'react';

interface PageData {
    pageType: string;
    pageName: string;
    pageSection?: string;
    pageSubSection?: string;
    [key: string]: any;
}

interface AdobeDataLayerProps {
    pageData: PageData;
}

declare global {
    interface Window {
        adobeDataLayer: any[];
    }
}

const AdobeDataLayer: React.FC<AdobeDataLayerProps> = ({ pageData }) => {
    useEffect(() => {
        // Initialize data layer if not exists
        window.adobeDataLayer = window.adobeDataLayer || [];

        // Push page data
        window.adobeDataLayer.push({
            pageData: {
                ...pageData,
                pageURL: window.location.href,
                referrer: document.referrer
            }
        });

        // Push page view event
        window.adobeDataLayer.push({
            event: 'pageView'
        });

    }, [pageData]);

    return null;
};

export default AdobeDataLayer;
