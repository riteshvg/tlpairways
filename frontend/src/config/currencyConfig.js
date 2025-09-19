// Currency configuration for international flights
export const CURRENCY_CONFIG = {
  // Exchange rates (USD to other currencies)
  exchangeRates: {
    USD: {
      INR: 80,
      EUR: 0.85,
      GBP: 0.75
    }
  },
  
  // Default exchange rate for USD to INR
  defaultExchangeRate: 83,
  
  // Countries that should show USD prices
  usdCountries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF', 'FK'],
  
  // Countries that should show EUR prices
  eurCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'SE', 'DK', 'NO', 'CH', 'LU', 'MT', 'CY', 'EE', 'LV', 'LT', 'SI', 'SK', 'CZ', 'PL', 'HU', 'RO', 'BG', 'HR', 'GR'],
  
  // Countries that should show GBP prices
  gbpCountries: ['GB', 'IM', 'JE', 'GG'],
  
  // Map country names to country codes
  countryToCode: {
    'United States': 'US',
    'Canada': 'CA',
    'Mexico': 'MX',
    'Brazil': 'BR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Peru': 'PE',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Ecuador': 'EC',
    'Bolivia': 'BO',
    'Paraguay': 'PY',
    'Uruguay': 'UY',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'French Guiana': 'GF',
    'Falkland Islands': 'FK',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Portugal': 'PT',
    'Ireland': 'IE',
    'Finland': 'FI',
    'Sweden': 'SE',
    'Denmark': 'DK',
    'Norway': 'NO',
    'Switzerland': 'CH',
    'Luxembourg': 'LU',
    'Malta': 'MT',
    'Cyprus': 'CY',
    'Estonia': 'EE',
    'Latvia': 'LV',
    'Lithuania': 'LT',
    'Slovenia': 'SI',
    'Slovakia': 'SK',
    'Czech Republic': 'CZ',
    'Poland': 'PL',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Greece': 'GR',
    'United Kingdom': 'GB',
    'Isle of Man': 'IM',
    'Jersey': 'JE',
    'Guernsey': 'GG',
    'India': 'IN'
  },
  
  // Get currency for a country
  getCurrencyForCountry: (countryName) => {
    const countryCode = CURRENCY_CONFIG.countryToCode[countryName];
    if (!countryCode) return 'INR'; // Default to INR for unknown countries
    
    if (CURRENCY_CONFIG.usdCountries.includes(countryCode)) return 'USD';
    if (CURRENCY_CONFIG.eurCountries.includes(countryCode)) return 'EUR';
    if (CURRENCY_CONFIG.gbpCountries.includes(countryCode)) return 'GBP';
    return 'INR'; // Default to INR for other countries
  },
  
  // Check if flight is international (different countries)
  isInternationalFlight: (originCountry, destinationCountry) => {
    return originCountry !== destinationCountry;
  },
  
  // Convert price from one currency to another
  convertPrice: (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    const rates = CURRENCY_CONFIG.exchangeRates[fromCurrency];
    if (!rates || !rates[toCurrency]) {
      // Fallback to USD-INR rate if specific rate not found
      if (fromCurrency === 'USD' && toCurrency === 'INR') {
        return amount * CURRENCY_CONFIG.defaultExchangeRate;
      }
      return amount; // Return original if conversion not possible
    }
    
    return amount * rates[toCurrency];
  },
  
  // Format price with currency symbol
  formatPrice: (amount, currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  }
};

export default CURRENCY_CONFIG; 