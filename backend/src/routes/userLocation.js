const express = require('express');
const router = express.Router();

/**
 * Get user location based on IP address
 * This endpoint works server-side, avoiding CORS issues
 */
router.get('/', async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    console.log('Getting location for IP:', clientIP);
    
    // Try multiple IP geolocation services
    const services = [
      `https://ipapi.co/${clientIP}/json/`,
      `https://ip-api.com/json/${clientIP}`,
      `https://api.db-ip.com/v2/free/${clientIP}`,
      `https://freeipapi.com/api/json/${clientIP}`,
      `https://ipwho.is/${clientIP}`
    ];
    
    for (const service of services) {
      try {
        console.log(`Trying IP geolocation service: ${service}`);
        
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TL Airways App'
          },
          timeout: 5000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('IP geolocation data received:', data);
        
        // Handle different API response formats
        let locationData = {};
        
        if (service.includes('ipapi.co')) {
          locationData = {
            country: data.country_name || 'Unknown',
            state: data.region || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'UTC',
            ipCountry: data.country_code || 'Unknown',
            currency: data.currency || 'USD',
            language: data.languages ? data.languages.split(',')[0] : 'en'
          };
        } else if (service.includes('ip-api.com')) {
          locationData = {
            country: data.country || 'Unknown',
            state: data.regionName || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'UTC',
            ipCountry: data.countryCode || 'Unknown',
            currency: data.currency || 'USD',
            language: 'en'
          };
        } else if (service.includes('db-ip.com')) {
          locationData = {
            country: data.countryName || 'Unknown',
            state: data.stateProv || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timeZone || 'UTC',
            ipCountry: data.countryCode || 'Unknown',
            currency: 'USD',
            language: 'en'
          };
        } else if (service.includes('freeipapi.com')) {
          locationData = {
            country: data.countryName || 'Unknown',
            state: data.stateName || 'Unknown',
            city: data.cityName || 'Unknown',
            timezone: data.timeZone || 'UTC',
            ipCountry: data.countryCode || 'Unknown',
            currency: 'USD',
            language: 'en'
          };
        } else if (service.includes('ipwho.is')) {
          locationData = {
            country: data.country || 'Unknown',
            state: data.region || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'UTC',
            ipCountry: data.country_code || 'Unknown',
            currency: data.currency || 'USD',
            language: 'en'
          };
        } else {
          // Generic fallback
          locationData = {
            country: data.country || data.country_name || 'Unknown',
            state: data.region || data.state || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'UTC',
            ipCountry: data.country_code || data.countryCode || 'Unknown',
            currency: data.currency || 'USD',
            language: 'en'
          };
        }
        
        // Validate that we got meaningful data
        if (locationData.country !== 'Unknown' && locationData.country !== '') {
          console.log('Successfully got location data:', locationData);
          return res.json(locationData);
        }
        
      } catch (error) {
        console.warn(`Failed to get location from ${service}:`, error.message);
        continue; // Try next service
      }
    }
    
    // If all services fail, return fallback data
    console.warn('All IP geolocation services failed, returning fallback data');
    res.json({
      country: 'Unknown',
      state: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
      ipCountry: 'Unknown',
      currency: 'USD',
      language: 'en'
    });
    
  } catch (error) {
    console.error('Error getting user location:', error);
    res.status(500).json({ 
      error: 'Failed to get user location',
      fallback: {
        country: 'Unknown',
        state: 'Unknown',
        city: 'Unknown',
        timezone: 'UTC',
        ipCountry: 'Unknown',
        currency: 'USD',
        language: 'en'
      }
    });
  }
});

module.exports = router;
