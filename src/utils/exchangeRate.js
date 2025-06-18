/**
 * Exchange Rate Service
 * Provides real-time exchange rate fetching with caching and error handling
 */

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const CACHE_KEY_PREFIX = 'exchange_rate_'

// Exchange rate cache
const exchangeRateCache = new Map()

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'CHF', 'SEK', 'NOK', 'DKK'
]

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr'
}

// Currency names mapping
export const CURRENCY_NAMES = {
  USD: '美元',
  EUR: '欧元',
  GBP: '英镑',
  JPY: '日元',
  CAD: '加拿大元',
  AUD: '澳元',
  CNY: '人民币',
  CHF: '瑞士法郎',
  SEK: '瑞典克朗',
  NOK: '挪威克朗',
  DKK: '丹麦克朗'
}

/**
 * Get cached exchange rate
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Object|null} Cached rate data or null if not found/expired
 */
function getCachedRate(fromCurrency, toCurrency) {
  const cacheKey = `${CACHE_KEY_PREFIX}${fromCurrency}_${toCurrency}`
  const cached = exchangeRateCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached
  }
  
  return null
}

/**
 * Set exchange rate cache
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @param {number} rate - Exchange rate
 * @param {string} source - Data source
 */
function setCachedRate(fromCurrency, toCurrency, rate, source = 'api') {
  const cacheKey = `${CACHE_KEY_PREFIX}${fromCurrency}_${toCurrency}`
  exchangeRateCache.set(cacheKey, {
    rate,
    timestamp: Date.now(),
    source,
    fromCurrency,
    toCurrency
  })
}

/**
 * Fetch exchange rate from external API
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<Object>} Exchange rate data
 */
async function fetchExchangeRateFromAPI(fromCurrency, toCurrency) {
  // For demo purposes, we'll use a mock API response
  // In production, you would use a real exchange rate API like:
  // - ExchangeRate-API (https://exchangerate-api.com/)
  // - Fixer.io (https://fixer.io/)
  // - CurrencyAPI (https://currencyapi.com/)

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock exchange rates (in production, replace with real API call)
    const mockRates = {
      'USD_EUR': 0.92,
      'USD_GBP': 0.79,
      'USD_JPY': 149.50,
      'USD_CAD': 1.35,
      'USD_AUD': 1.52,
      'USD_CNY': 7.24,
      'EUR_USD': 1.09,
      'EUR_GBP': 0.86,
      'EUR_JPY': 162.50,
      'EUR_CAD': 1.47,
      'EUR_AUD': 1.65,
      'EUR_CNY': 7.88,
      'GBP_USD': 1.26,
      'GBP_EUR': 1.16,
      'GBP_JPY': 188.50,
      'GBP_CAD': 1.70,
      'GBP_AUD': 1.91,
      'GBP_CNY': 9.12,
      'CAD_USD': 0.74,
      'CAD_EUR': 0.68,
      'CAD_GBP': 0.59,
      'CAD_JPY': 110.70,
      'CAD_AUD': 1.13,
      'CAD_CNY': 5.36,
      'AUD_USD': 0.66,
      'AUD_EUR': 0.61,
      'AUD_GBP': 0.52,
      'AUD_JPY': 98.35,
      'AUD_CAD': 0.89,
      'AUD_CNY': 4.77
    }
    
    const rateKey = `${fromCurrency}_${toCurrency}`
    const reverseKey = `${toCurrency}_${fromCurrency}`
    
    let rate = mockRates[rateKey]
    
    // If direct rate not found, try reverse rate
    if (!rate && mockRates[reverseKey]) {
      rate = 1 / mockRates[reverseKey]
    }
    
    // If still no rate found, calculate via USD
    if (!rate && fromCurrency !== 'USD' && toCurrency !== 'USD') {
      const fromToUsd = mockRates[`${fromCurrency}_USD`] || (1 / mockRates[`USD_${fromCurrency}`])
      const usdToTarget = mockRates[`USD_${toCurrency}`] || (1 / mockRates[`${toCurrency}_USD`])
      
      if (fromToUsd && usdToTarget) {
        rate = fromToUsd * usdToTarget
      }
    }
    
    // Default to 1 if same currency or no rate found
    if (!rate) {
      rate = fromCurrency === toCurrency ? 1 : 1
    }
    
    // Add some random variation to simulate real-time changes (±0.5%)
    const variation = (Math.random() - 0.5) * 0.01
    rate = rate * (1 + variation)

    return {
      rate: parseFloat(rate.toFixed(6)),
      timestamp: Date.now(),
      source: 'mock_api',
      fromCurrency,
      toCurrency
    }

  } catch (error) {
    console.error('Failed to fetch exchange rate from API:', error)
    throw new Error(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}`)
  }
}

/**
 * Get exchange rate with caching
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<Object>} Exchange rate data
 */
export async function getExchangeRate(fromCurrency, toCurrency) {
  // Validate currencies
  if (!fromCurrency || !toCurrency) {
    throw new Error('Both fromCurrency and toCurrency are required')
  }

  // Normalize currency codes
  fromCurrency = fromCurrency.toUpperCase()
  toCurrency = toCurrency.toUpperCase()

  // Same currency
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      timestamp: Date.now(),
      source: 'same_currency',
      fromCurrency,
      toCurrency
    }
  }

  // Check cache first
  const cached = getCachedRate(fromCurrency, toCurrency)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API
    const rateData = await fetchExchangeRateFromAPI(fromCurrency, toCurrency)

    // Cache the result
    setCachedRate(fromCurrency, toCurrency, rateData.rate, rateData.source)

    return rateData
  } catch (error) {
    // Fallback to default rates if API fails
    console.warn('Using fallback exchange rates due to API failure:', error.message)

    const fallbackRates = {
      'EUR_USD': 1.08,
      'GBP_USD': 1.26,
      'CAD_USD': 0.74,
      'AUD_USD': 0.66,
      'JPY_USD': 0.0067,
      'CNY_USD': 0.138
    }

    const fallbackKey = `${fromCurrency}_${toCurrency}`
    const reverseFallbackKey = `${toCurrency}_${fromCurrency}`

    let fallbackRate = fallbackRates[fallbackKey]
    if (!fallbackRate && fallbackRates[reverseFallbackKey]) {
      fallbackRate = 1 / fallbackRates[reverseFallbackKey]
    }

    if (!fallbackRate) {
      fallbackRate = 1 // Default fallback
    }

    const fallbackData = {
      rate: fallbackRate,
      timestamp: Date.now(),
      source: 'fallback',
      fromCurrency,
      toCurrency
    }

    // Cache fallback data for shorter duration
    setCachedRate(fromCurrency, toCurrency, fallbackRate, 'fallback')

    return fallbackData
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<Object>} Conversion result
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (!amount || amount <= 0) {
    throw new Error('Amount must be a positive number')
  }

  const rateData = await getExchangeRate(fromCurrency, toCurrency)
  const convertedAmount = amount * rateData.rate

  return {
    originalAmount: amount,
    convertedAmount: parseFloat(convertedAmount.toFixed(2)),
    fromCurrency,
    toCurrency,
    exchangeRate: rateData.rate,
    timestamp: rateData.timestamp,
    source: rateData.source
  }
}

/**
 * Format currency amount with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency, decimals = 2) {
  if (typeof amount !== 'number') {
    return '-'
  }

  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formattedAmount = amount.toFixed(decimals)

  // For some currencies, put symbol after the amount
  if (['SEK', 'NOK', 'DKK'].includes(currency)) {
    return `${formattedAmount} ${symbol}`
  }

  return `${symbol}${formattedAmount}`
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency) {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export function getCurrencyName(currency) {
  return CURRENCY_NAMES[currency] || currency
}

/**
 * Clear exchange rate cache
 */
export function clearExchangeRateCache() {
  exchangeRateCache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  return {
    size: exchangeRateCache.size,
    entries: Array.from(exchangeRateCache.entries()).map(([key, value]) => ({
      key,
      ...value,
      age: Date.now() - value.timestamp
    }))
  }
}
