import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import '../styles/DestinationTriviaBanner.css';

// Destination data for fallback and testing
const DESTINATION_DATA = {
  BLR: {
    city: "Bengaluru",
    emoji: "🌳",
    population: "12.8M",
    temperature: "15-28°C",
    climate: "Pleasant year-round",
    transport: "Moderate traffic. Metro connects key areas; avoid peak hours (8-10 AM, 5-8 PM).",
    food: "Masala dosa at MTR, filter coffee, benne dosa at Vidyarthi Bhavan.",
    tip: "The \"Garden City\" has beautiful parks - Cubbon Park & Lalbagh are perfect for morning walks."
  },
  DEL: {
    city: "Delhi",
    emoji: "🏛️",
    population: "32.9M",
    temperature: "7-40°C",
    climate: "Hot summers, cold winters",
    transport: "Heavy traffic. Metro is your best bet. Auto-rickshaws and Uber are readily available.",
    food: "Chandni Chowk street food, butter chicken at Moti Mahal, parathas at Paranthe Wali Gali.",
    tip: "Check AQI before outdoor activities. Best visit: Nov-Feb when weather is pleasant."
  },
  CCU: {
    city: "Kolkata",
    emoji: "🎭",
    population: "14.8M",
    temperature: "12-35°C",
    climate: "Humid summers, mild winters",
    transport: "Moderate traffic. Yellow taxis iconic. Metro connects major areas. Howrah Bridge busy during peak hours.",
    food: "Kathi rolls, Park Street fish fry, rosogolla, and phuchka (local pani puri).",
    tip: "The \"City of Joy\" comes alive during Durga Puja (Sept-Oct). Book early if visiting during festivals!"
  },
  HYD: {
    city: "Hyderabad",
    emoji: "🕌",
    population: "10.5M",
    temperature: "15-38°C",
    climate: "Hot & dry climate",
    transport: "Manageable traffic. Metro connects IT hubs. ORR links major areas efficiently.",
    food: "Hyderabadi biryani at Paradise/Bawarchi, Irani chai with Osmania biscuits, haleem during Ramadan.",
    tip: "Visit Charminar & Golconda Fort in the evening. HITEC City is the bustling tech hub."
  },
  COK: {
    city: "Kochi",
    emoji: "⛵",
    population: "2.1M",
    temperature: "23-33°C",
    climate: "Tropical, monsoons Jun-Sept",
    transport: "Light traffic. Ferry rides between islands are scenic and popular. Metro connects main areas.",
    food: "Kerala sadya, Fort Kochi seafood, appam with stew, traditional Kerala thali.",
    tip: "\"Queen of Arabian Sea\" - Don't miss Chinese fishing nets at sunset. Alleppey backwaters just 1hr away!"
  }
};

/**
 * DestinationTriviaBanner Component
 * 
 * Displays dynamic destination trivia using Adobe Target Experience Targeting.
 * Falls back to local data if Adobe Target is unavailable.
 * 
 * @param {string} destination - Airport code (BLR, DEL, CCU, HYD, COK)
 * @param {function} onLoad - Callback when banner is loaded
 */
const DestinationTriviaBanner = ({ destination, onLoad }) => {
  const [bannerContent, setBannerContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const bannerRef = useRef(null);
  const hasInitialized = useRef(false);
  const targetTimeout = useRef(null);

  useEffect(() => {
    // Only initialize once
    if (hasInitialized.current || !destination) {
      return;
    }

    hasInitialized.current = true;
    console.log('🎯 DestinationTriviaBanner: Initializing for destination:', destination);

    // Track banner impression
    trackBannerImpression(destination);

    // Try Adobe Target first
    loadFromAdobeTarget(destination);

    // Cleanup timeout on unmount
    return () => {
      if (targetTimeout.current) {
        clearTimeout(targetTimeout.current);
      }
    };
  }, [destination]);

  /**
   * Load content from Adobe Target
   */
  const loadFromAdobeTarget = (dest) => {
    // Check if Adobe Target is available
    if (typeof window === 'undefined' || !window.adobe || !window.adobe.target) {
      console.warn('⚠️ Adobe Target not available, using fallback content');
      loadFallbackContent(dest);
      return;
    }

    try {
      console.log('🎯 Requesting Adobe Target mbox for destination:', dest);

      // Set timeout for Target response (3 seconds)
      targetTimeout.current = setTimeout(() => {
        console.warn('⚠️ Adobe Target timeout, using fallback content');
        loadFallbackContent(dest);
      }, 3000);

      // Request content from Adobe Target
      window.adobe.target.getOffer({
        mbox: 'flight-search-trivia-banner',
        params: {
          destination: dest,
          destinationCode: dest,
          city: DESTINATION_DATA[dest]?.city || dest
        },
        success: (offer) => {
          clearTimeout(targetTimeout.current);
          console.log('✅ Adobe Target offer received:', offer);

          // Apply the offer
          window.adobe.target.applyOffer({
            mbox: 'flight-search-trivia-banner',
            offer: offer,
            success: () => {
              console.log('✅ Adobe Target offer applied successfully');
              
              // Check if Target injected content into the container
              const container = bannerRef.current;
              if (container && container.querySelector('.target-injected-content')) {
                setIsLoading(false);
                setBannerContent('target'); // Flag that Target content is loaded
                if (onLoad) onLoad();
              } else {
                // No content injected, use fallback
                loadFallbackContent(dest);
              }
            },
            error: (error) => {
              console.error('❌ Adobe Target apply offer error:', error);
              loadFallbackContent(dest);
            }
          });
        },
        error: (status, error) => {
          clearTimeout(targetTimeout.current);
          console.error('❌ Adobe Target getOffer error:', status, error);
          loadFallbackContent(dest);
        }
      });
    } catch (error) {
      clearTimeout(targetTimeout.current);
      console.error('❌ Adobe Target exception:', error);
      loadFallbackContent(dest);
    }
  };

  /**
   * Load fallback content from local data
   */
  const loadFallbackContent = (dest) => {
    const data = DESTINATION_DATA[dest];
    
    if (!data) {
      console.error('❌ No destination data found for:', dest);
      setError(`Destination ${dest} not found`);
      setIsLoading(false);
      return;
    }

    console.log('✅ Loading fallback content for:', dest);
    setBannerContent(data);
    setIsLoading(false);
    
    if (onLoad) {
      onLoad();
    }
  };

  /**
   * Track banner impression for analytics
   */
  const trackBannerImpression = (dest) => {
    try {
      // Push to Adobe Data Layer
      if (window.adobeDataLayer) {
        window.adobeDataLayer.push({
          event: 'bannerImpression',
          banner: {
            type: 'destination-trivia',
            destination: dest,
            location: 'search-results',
            timestamp: new Date().toISOString()
          }
        });
        console.log('✅ Banner impression tracked:', dest);
      }

      // Track in Target if available
      if (window.adobe && window.adobe.target && window.adobe.target.trackEvent) {
        window.adobe.target.trackEvent({
          mbox: 'flight-search-trivia-banner',
          params: {
            destination: dest,
            action: 'impression'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error tracking banner impression:', error);
    }
  };

  // Don't render if no destination
  if (!destination) {
    return null;
  }

  // Don't render if error
  if (error) {
    console.error('DestinationTriviaBanner error:', error);
    return null;
  }

  // Show loading state briefly
  if (isLoading) {
    return (
      <Box className="destination-trivia-banner destination-trivia-loading" sx={{ my: 3 }}>
        <Typography variant="body2" color="white">
          Loading destination info...
        </Typography>
      </Box>
    );
  }

  // If Adobe Target loaded content, show the container
  if (bannerContent === 'target') {
    return (
      <Box 
        ref={bannerRef}
        className="destination-trivia-banner-container"
        sx={{ my: 3 }}
        role="complementary"
        aria-label={`Destination information for ${destination}`}
      >
        <div className="target-injected-content" />
      </Box>
    );
  }

  // Render fallback content
  const data = bannerContent;
  
  return (
    <Box 
      ref={bannerRef}
      className="destination-trivia-banner"
      sx={{ my: 3 }}
      role="complementary"
      aria-label={`Destination information for ${data.city}`}
    >
      <Typography variant="h5" className="banner-title" component="h3">
        {data.emoji} Discover {data.city}
      </Typography>
      
      <Box className="banner-stats" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
        <Typography variant="body2" className="stat-item">
          👥 {data.population}
        </Typography>
        <Typography variant="body2" className="stat-item">
          🌡️ {data.temperature} ({data.climate})
        </Typography>
      </Box>

      <Box className="banner-details" sx={{ mt: 2 }}>
        <Box className="detail-item" sx={{ mb: 1.5 }}>
          <Typography variant="body2" className="detail-label">
            🚗 Getting Around:
          </Typography>
          <Typography variant="body2" className="detail-text">
            {data.transport}
          </Typography>
        </Box>

        <Box className="detail-item" sx={{ mb: 1.5 }}>
          <Typography variant="body2" className="detail-label">
            🍽️ Must-Try:
          </Typography>
          <Typography variant="body2" className="detail-text">
            {data.food}
          </Typography>
        </Box>

        <Box className="detail-item">
          <Typography variant="body2" className="detail-label">
            💡 Pro Tip:
          </Typography>
          <Typography variant="body2" className="detail-text">
            {data.tip}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DestinationTriviaBanner;

