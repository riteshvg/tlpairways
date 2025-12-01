/**
 * City Name Mapper
 * Maps airport codes and city name variations to standardized city names
 * Dynamically loads from airports.json to avoid hardcoding
 */

const fs = require('fs');
const path = require('path');

// Dynamically load airport-to-city mappings from airports.json
let airportToCity = {};
let cityAliasesMap = {};

try {
  // Try multiple paths to find airports.json
  const possiblePaths = [
    path.join(__dirname, '../../../frontend/src/data/airports.json'), // From backend/src/utils/
    path.join(__dirname, '../../../../frontend/src/data/airports.json'), // Alternative
    path.join(process.cwd(), 'frontend/src/data/airports.json'), // From project root
    path.join(process.cwd(), '../frontend/src/data/airports.json') // Alternative root
  ];
  
  let airportsPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      airportsPath = testPath;
      break;
    }
  }
  
  if (airportsPath && fs.existsSync(airportsPath)) {
    const airportsData = JSON.parse(fs.readFileSync(airportsPath, 'utf8'));
    
    // Build airport code to city mapping dynamically
    airportsData.airports.forEach(cityData => {
      cityData.airports.forEach(airport => {
        airportToCity[airport.code] = cityData.city;
      });
      
      // Build city aliases (city name itself is the standard)
      if (!cityAliasesMap[cityData.city]) {
        cityAliasesMap[cityData.city] = [];
      }
      cityData.airports.forEach(airport => {
        if (!cityAliasesMap[cityData.city].includes(airport.code)) {
          cityAliasesMap[cityData.city].push(airport.code);
        }
      });
    });
    
    console.log(`✅ Loaded ${Object.keys(airportToCity).length} airport codes dynamically from airports.json`);
  } else {
    console.warn('⚠️ airports.json not found, using fallback mappings');
  }
} catch (error) {
  console.warn('⚠️ Could not load airports.json, using fallback mappings:', error.message);
  // Fallback to essential mappings if file not found
  airportToCity = {
    'DEL': 'Delhi', 'BOM': 'Mumbai', 'BLR': 'Bengaluru', 'CCU': 'Kolkata',
    'MAA': 'Chennai', 'HYD': 'Hyderabad', 'DXB': 'Dubai', 'BKK': 'Bangkok'
  };
}

// City name variations and aliases (for common name variations, not airport codes)
const cityNameAliases = {
  'Bengaluru': ['Bangalore'],
  'Mumbai': ['Bombay'],
  'Kolkata': ['Calcutta'],
  'Chennai': ['Madras'],
  'Thiruvananthapuram': ['Trivandrum'],
  'New York': ['NYC'],
  'Los Angeles': ['LA']
};

/**
 * Normalize city name - converts airport codes and variations to standard city name
 * @param {string} cityInput - City name, airport code, or variation
 * @returns {string} Normalized city name
 */
function normalizeCityName(cityInput) {
  if (!cityInput || typeof cityInput !== 'string') {
    return '';
  }

  const trimmed = cityInput.trim();
  if (!trimmed) return '';

  // If it's an airport code (3 uppercase letters), map to city from dynamic data
  if (/^[A-Z]{3}$/.test(trimmed)) {
    return airportToCity[trimmed] || trimmed;
  }

  // Check if it's a known city name alias (variations like "Bangalore" → "Bengaluru")
  for (const [standardName, aliases] of Object.entries(cityNameAliases)) {
    if (aliases.some(alias => alias.toLowerCase() === trimmed.toLowerCase())) {
      return standardName;
    }
    if (standardName.toLowerCase() === trimmed.toLowerCase()) {
      return standardName;
    }
  }
  
  // Check dynamically loaded city aliases (airport codes for cities)
  for (const [standardName, aliases] of Object.entries(cityAliasesMap)) {
    const aliasList = Array.isArray(aliases) ? aliases : [];
    if (aliasList.some(alias => alias.toLowerCase() === trimmed.toLowerCase())) {
      return standardName;
    }
    if (standardName.toLowerCase() === trimmed.toLowerCase()) {
      return standardName;
    }
  }

  // Return as-is (capitalize first letter of each word)
  return trimmed.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

/**
 * Check if two city names match (handles variations)
 * @param {string} city1 - First city name
 * @param {string} city2 - Second city name
 * @returns {boolean} True if cities match
 */
function citiesMatch(city1, city2) {
  if (!city1 || !city2) return false;

  const normalized1 = normalizeCityName(city1).toLowerCase();
  const normalized2 = normalizeCityName(city2).toLowerCase();

  // Exact match
  if (normalized1 === normalized2) return true;

  // One contains the other (for cases like "New York" vs "New York City")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  return false;
}

module.exports = {
  normalizeCityName,
  citiesMatch,
  airportToCity,
  cityAliases: cityNameAliases
};
