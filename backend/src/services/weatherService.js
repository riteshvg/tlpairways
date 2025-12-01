/**
 * Weather Service
 * Fetches weather data from AWS S3 for email personalization
 * Includes comprehensive validation and error handling
 */

const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');
const { 
  isValidCity, 
  isValidTemperature, 
  isValidHumidity,
  isValidUnixTimestamp 
} = require('../utils/validators');
const { normalizeCityName, citiesMatch } = require('../utils/cityMapper');
const { logWeatherFetch, logS3Error, logCache } = require('./loggerService');

// In-memory cache with TTL
const weatherCache = new Map();
const CACHE_DURATION = parseInt(process.env.WEATHER_CACHE_DURATION) || 300000; // 5 minutes default

// AWS S3 Client
let s3Client = null;

/**
 * Initialize S3 client
 * @returns {S3Client|null} S3 client instance or null if not configured
 */
function getS3Client() {
  if (s3Client) return s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    console.warn('⚠️ AWS credentials not configured. Weather service will be disabled.');
    return null;
  }

  try {
    s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      }
    });
    return s3Client;
  } catch (error) {
    console.error('❌ Failed to initialize S3 client:', error.message);
    return null;
  }
}

/**
 * Convert stream to string
 * @param {Readable} stream - Stream to convert
 * @returns {Promise<string>} String content
 */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}

/**
 * Sanitize city name for cache key and file lookup
 * @param {string} city - City name
 * @returns {string} Sanitized city name
 */
function sanitizeCityName(city) {
  if (!city || typeof city !== 'string') return '';
  return city.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Detect temperature unit and convert to Celsius
 * Handles Kelvin (>200), Fahrenheit (<200), and Celsius (already converted)
 * @param {number} temp - Temperature value
 * @returns {number|null} Temperature in Celsius
 */
function convertToCelsius(temp) {
  if (typeof temp !== 'number' || isNaN(temp)) return null;
  
  // If temperature is > 200, assume Kelvin
  if (temp > 200) {
    return Math.round((temp - 273.15) * 10) / 10;
  }
  // If temperature is between 50-150, likely Fahrenheit
  else if (temp >= 50 && temp <= 150) {
    return Math.round(((temp - 32) * 5/9) * 10) / 10;
  }
  // Otherwise assume already in Celsius (or invalid)
  else if (temp >= -50 && temp <= 60) {
    return Math.round(temp * 10) / 10;
  }
  
  return null;
}

/**
 * Convert temperature to Fahrenheit
 * @param {number} temp - Temperature (Kelvin, Fahrenheit, or Celsius)
 * @param {string} unit - 'K' for Kelvin, 'F' for Fahrenheit, 'C' for Celsius
 * @returns {number|null} Temperature in Fahrenheit
 */
function convertToFahrenheit(temp, unit = 'auto') {
  if (typeof temp !== 'number' || isNaN(temp)) return null;
  
  // Auto-detect unit
  if (unit === 'auto') {
    if (temp > 200) unit = 'K'; // Kelvin
    else if (temp >= 50 && temp <= 150) unit = 'F'; // Already Fahrenheit
    else unit = 'C'; // Assume Celsius
  }
  
  let celsius = temp;
  if (unit === 'K') {
    celsius = temp - 273.15;
  } else if (unit === 'F') {
    return Math.round(temp * 10) / 10; // Already Fahrenheit
  }
  // If Celsius, convert to Fahrenheit
  const fahrenheit = (celsius * 9/5) + 32;
  return Math.round(fahrenheit * 10) / 10;
}

/**
 * Convert Kelvin to Celsius (legacy function for backward compatibility)
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Celsius
 */
function kelvinToCelsius(kelvin) {
  return convertToCelsius(kelvin);
}

/**
 * Convert Kelvin to Fahrenheit (legacy function for backward compatibility)
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} Temperature in Fahrenheit
 */
function kelvinToFahrenheit(kelvin) {
  return convertToFahrenheit(kelvin, 'K');
}

/**
 * Get weather emoji icon based on condition
 * @param {string} condition - Weather condition
 * @returns {string} Emoji icon
 */
function getWeatherIcon(condition) {
  if (!condition || typeof condition !== 'string') return '🌤️';
  
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
    return '☀️';
  } else if (lowerCondition.includes('cloud')) {
    if (lowerCondition.includes('few') || lowerCondition.includes('scattered')) {
      return '⛅';
    } else {
      return '☁️';
    }
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return '⛈️';
    } else {
      return '🌧️';
    }
  } else if (lowerCondition.includes('snow')) {
    return '❄️';
  } else if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) {
    return '🌫️';
  } else if (lowerCondition.includes('wind')) {
    return '💨';
  } else {
    return '🌤️';
  }
}

/**
 * Format Unix timestamp to HH:MM AM/PM
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time
 */
function formatUnixTime(timestamp) {
  if (!isValidUnixTimestamp(timestamp)) return null;
  
  try {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch {
    return null;
  }
}

/**
 * Validate weather data structure
 * @param {Object} data - Weather data to validate
 * @returns {Object|null} Validated weather data or null
 */
function validateWeatherData(data) {
  if (!data || typeof data !== 'object') return null;

  // Check for Adobe Event Forwarding format
  const payload = data.payload || data;
  
  if (!payload.city || !isValidCity(payload.city)) {
    return null;
  }

  if (typeof payload.temperature !== 'number' || !isValidTemperature(payload.temperature)) {
    return null;
  }

  if (typeof payload.humidity !== 'number' || !isValidHumidity(payload.humidity)) {
    return null;
  }

  if (!payload.weather || typeof payload.weather !== 'string') {
    return null;
  }

  return payload;
}

/**
 * Fetch weather data from S3
 * @param {string} city - City name
 * @returns {Promise<Object|null>} Weather data or null
 */
async function fetchWeatherFromS3(city) {
  const client = getS3Client();
  if (!client) {
    return null;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const eventsPath = process.env.AWS_S3_EVENTS_PATH || 'events/';
  
  if (!bucket) {
    console.warn('⚠️ AWS_S3_BUCKET not configured');
    return null;
  }

  // Weather data is stored in events folder with timestamped structure
  // Search in events folder for weather data matching the city
  try {
    const weatherFromEvents = await searchWeatherInEventsFolder(city, eventsPath);
    if (weatherFromEvents) {
      return weatherFromEvents;
    }
  } catch (error) {
    logS3Error('searchWeatherInEventsFolder', city, error);
  }

  return null;
}

/**
 * Search for weather data in events folder (timestamped structure)
 * This searches recent files in the events folder for weather data
 * @param {string} city - City name
 * @param {string} eventsPath - Path to events folder
 * @returns {Promise<Object|null>} Weather data or null
 */
async function searchWeatherInEventsFolder(city, eventsPath) {
  const client = getS3Client();
  if (!client) return null;

  const bucket = process.env.AWS_S3_BUCKET;
  
  try {
    // Get current date for recent files
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Search in today's folder and yesterday's folder (in case of timezone differences)
    const todayPath = `${eventsPath}${year}/${month}/${day}/`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayPath = `${eventsPath}${yesterdayYear}/${yesterdayMonth}/${yesterdayDay}/`;
    
    // Search both today and yesterday
    const searchPaths = [todayPath, yesterdayPath];
    const allFiles = [];
    
    for (const searchPath of searchPaths) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: searchPath,
          MaxKeys: 200 // Increased to search more files
        });
        
        const response = await client.send(listCommand);
        
        if (response.Contents && response.Contents.length > 0) {
          allFiles.push(...response.Contents);
        }
      } catch (error) {
        // Skip if folder doesn't exist
        continue;
      }
    }
    
    if (allFiles.length === 0) {
      return null;
    }
    
    // Sort by last modified (most recent first) and search through files
    allFiles.sort((a, b) => {
      const dateA = a.LastModified ? new Date(a.LastModified) : new Date(0);
      const dateB = b.LastModified ? new Date(b.LastModified) : new Date(0);
      return dateB - dateA;
    });
    
    // Search through recent files for weather data matching the city
    // Check up to 50 most recent files
    for (const obj of allFiles.slice(0, 50)) {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: obj.Key
        });
        
        const fileResponse = await client.send(getCommand);
        const content = await streamToString(fileResponse.Body);
        const jsonData = JSON.parse(content);
        
        // Check if this is a weather event for the target city
        // Structure: { "data": { "xdm": {...}, "payload": { "city": "Dubai", ... } } }
        if (jsonData.data) {
          let weatherCity = null;
          let weatherPayload = null;
          
          // First check for payload at data.payload (Adobe Event Forwarding format)
          if (jsonData.data.payload && jsonData.data.payload.city) {
            weatherCity = jsonData.data.payload.city;
            weatherPayload = jsonData.data.payload;
          } 
          // Fallback to XDM structure
          else if (jsonData.data.xdm) {
            const xdm = jsonData.data.xdm;
            weatherCity = xdm.customFields?.weather?.city || 
                         xdm.weather?.city ||
                         xdm.placeContext?.geoCity;
            
            if (xdm.customFields?.weather) {
              weatherPayload = xdm.customFields.weather;
            } else if (xdm.weather) {
              weatherPayload = xdm.weather;
            }
          }
          
          // Check if city matches using normalized city names
          const cityMatch = weatherCity && citiesMatch(weatherCity, city);
          
          if (cityMatch && weatherPayload) {
            // Found weather data for this city
            const validatedData = validateWeatherData({ payload: weatherPayload });
            if (validatedData) {
              return validatedData;
            }
          }
        }
      } catch (error) {
        // Skip files that don't match
        continue;
      }
    }
  } catch (error) {
    // Events search failed, return null
    return null;
  }
  
  return null;
}

/**
 * Get weather for city (with caching)
 * @param {string} city - City name
 * @returns {Promise<Object|null>} Weather data with formatted fields or null
 */
async function getWeatherForCity(city) {
  // Validate input
  if (!isValidCity(city)) {
    logWeatherFetch(city, false);
    return null;
  }

  const sanitizedCity = sanitizeCityName(city);
  
  // Check cache
  const cached = weatherCache.get(sanitizedCity);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < CACHE_DURATION) {
      logCache(city, true);
      return cached.data;
    } else {
      // Cache expired
      weatherCache.delete(sanitizedCity);
    }
  }

  logCache(city, false);

  // Fetch from S3
  const rawData = await fetchWeatherFromS3(city);
  
  if (!rawData) {
    logWeatherFetch(city, false);
    return null;
  }

  // Format and validate data
  // Handle temperature in any unit (Kelvin, Fahrenheit, or Celsius)
  const temperatureCelsius = convertToCelsius(rawData.temperature);
  const temperatureFahrenheit = convertToFahrenheit(rawData.temperature, 'auto');
  
  if (temperatureCelsius === null) {
    logWeatherFetch(city, false);
    return null;
  }

  const weatherData = {
    city: rawData.city,
    temperatureCelsius: temperatureCelsius,
    temperatureFahrenheit: temperatureFahrenheit,
    humidity: Math.round(rawData.humidity),
    weather: rawData.weather,
    icon: getWeatherIcon(rawData.weather),
    sunrise: rawData.sunrise ? formatUnixTime(rawData.sunrise) : null,
    sunset: rawData.sunset ? formatUnixTime(rawData.sunset) : null,
    timestamp: rawData.timestamp || new Date().toISOString()
  };

  // Cache the result
  weatherCache.set(sanitizedCity, {
    data: weatherData,
    timestamp: Date.now()
  });

  logWeatherFetch(city, true, weatherData);
  return weatherData;
}

/**
 * Test S3 connection and bucket accessibility
 * @returns {Promise<boolean>} True if accessible
 */
async function testS3Connection() {
  const client = getS3Client();
  if (!client) {
    return false;
  }

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    return false;
  }

  try {
    // Try to list objects (with limit 1) to test access
    const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1
    });
    
    await client.send(command);
    console.log('✅ S3 connection test successful');
    return true;
  } catch (error) {
    console.error('❌ S3 connection test failed:', error.message);
    return false;
  }
}

// Test connection on startup (non-blocking)
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    testS3Connection().catch(() => {
      // Silently fail - weather service will still work, just won't fetch
    });
  }, 2000);
}

module.exports = {
  getWeatherForCity,
  testS3Connection,
  kelvinToCelsius,
  kelvinToFahrenheit,
  getWeatherIcon,
  formatUnixTime,
  sanitizeCityName
};

