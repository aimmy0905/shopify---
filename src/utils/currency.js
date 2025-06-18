/**
 * Currency Conversion Utility
 * Provides currency conversion, formatting, and display utilities
 */

import { 
  getExchangeRate, 
  convertCurrency, 
  formatCurrency, 
  getCurrencySymbol, 
  getCurrencyName,
  SUPPORTED_CURRENCIES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
} from './exchangeRate.js'

/**
 * Currency conversion result with display formatting
 */
export class CurrencyConversion {
  constructor(data) {
    this.originalAmount = data.originalAmount
    this.convertedAmount = data.convertedAmount
    this.fromCurrency = data.fromCurrency
    this.toCurrency = data.toCurrency
    this.exchangeRate = data.exchangeRate
    this.timestamp = data.timestamp
    this.source = data.source
  }

  /**
   * Get formatted original amount
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted original amount
   */
  getFormattedOriginal(decimals = 2) {
    return formatCurrency(this.originalAmount, this.fromCurrency, decimals)
  }

  /**
   * Get formatted converted amount
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted converted amount
   */
  getFormattedConverted(decimals = 2) {
    return formatCurrency(this.convertedAmount, this.toCurrency, decimals)
  }

  /**
   * Get exchange rate display text
   * @returns {string} Exchange rate display
   */
  getExchangeRateDisplay() {
    return `1 ${this.fromCurrency} = ${this.exchangeRate.toFixed(4)} ${this.toCurrency}`
  }

  /**
   * Get timestamp display
   * @returns {string} Formatted timestamp
   */
  getTimestampDisplay() {
    const date = new Date(this.timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Check if conversion is real-time
   * @returns {boolean} True if conversion is recent (within 10 minutes)
   */
  isRealTime() {
    const tenMinutes = 10 * 60 * 1000
    return (Date.now() - this.timestamp) < tenMinutes
  }

  /**
   * Get data source display
   * @returns {string} Source display text
   */
  getSourceDisplay() {
    const sourceMap = {
      'mock_api': '实时汇率',
      'fallback': '参考汇率',
      'same_currency': '相同币种',
      'cache': '缓存汇率'
    }
    return sourceMap[this.source] || '未知来源'
  }
}

/**
 * Convert currency with enhanced result
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<CurrencyConversion>} Enhanced conversion result
 */
export async function convertCurrencyEnhanced(amount, fromCurrency, toCurrency) {
  const result = await convertCurrency(amount, fromCurrency, toCurrency)
  return new CurrencyConversion(result)
}

/**
 * Format amount with currency symbol and proper localization
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrencyAdvanced(amount, currency, options = {}) {
  console.log('🎨 formatCurrencyAdvanced called:', { amount, currency, options })

  const {
    decimals = 2,
    showSymbol = true,
    showCode = false,
    locale = 'zh-CN'
  } = options

  if (typeof amount !== 'number' || isNaN(amount)) {
    console.log('⚠️ Invalid amount:', amount)
    return '-'
  }

  let formatted = amount.toFixed(decimals)

  // Add thousand separators for Chinese locale
  if (locale === 'zh-CN') {
    formatted = Number(formatted).toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  let result = formatted

  if (showSymbol) {
    const symbol = getCurrencySymbol(currency)
    // For some currencies, put symbol after the amount
    if (['SEK', 'NOK', 'DKK'].includes(currency)) {
      result = `${formatted} ${symbol}`
    } else {
      result = `${symbol}${formatted}`
    }
  }

  if (showCode) {
    result = `${result} ${currency}`
  }

  console.log('✅ formatCurrencyAdvanced result:', result)
  return result
}

/**
 * Get currency display info
 * @param {string} currency - Currency code
 * @returns {Object} Currency display information
 */
export function getCurrencyInfo(currency) {
  return {
    code: currency,
    symbol: getCurrencySymbol(currency),
    name: getCurrencyName(currency),
    isSupported: SUPPORTED_CURRENCIES.includes(currency)
  }
}

/**
 * Validate currency code
 * @param {string} currency - Currency code to validate
 * @returns {boolean} True if currency is supported
 */
export function isValidCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency?.toUpperCase())
}

/**
 * Get all supported currencies with their info
 * @returns {Array} Array of currency info objects
 */
export function getAllCurrencies() {
  return SUPPORTED_CURRENCIES.map(code => getCurrencyInfo(code))
}

/**
 * Calculate percentage change between two amounts
 * @param {number} oldAmount - Original amount
 * @param {number} newAmount - New amount
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldAmount, newAmount) {
  if (!oldAmount || oldAmount === 0) return 0
  return ((newAmount - oldAmount) / oldAmount) * 100
}

/**
 * Format percentage change with appropriate styling
 * @param {number} percentage - Percentage change
 * @param {number} decimals - Number of decimal places
 * @returns {Object} Formatted percentage with styling info
 */
export function formatPercentageChange(percentage, decimals = 2) {
  const formatted = Math.abs(percentage).toFixed(decimals)
  const isPositive = percentage > 0
  const isNegative = percentage < 0
  
  return {
    value: percentage,
    formatted: `${isPositive ? '+' : isNegative ? '-' : ''}${formatted}%`,
    isPositive,
    isNegative,
    isNeutral: percentage === 0,
    className: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
  }
}

/**
 * Create currency display component data
 * @param {number} amount - Amount to display
 * @param {string} currency - Currency code
 * @param {Object} options - Display options
 * @returns {Object} Component data for currency display
 */
export function createCurrencyDisplayData(amount, currency, options = {}) {
  const {
    showConversion = false,
    targetCurrency = 'USD',
    showTimestamp = false,
    showSource = false
  } = options

  const info = getCurrencyInfo(currency)
  const formatted = formatCurrencyAdvanced(amount, currency)

  const data = {
    amount,
    currency,
    formatted,
    symbol: info.symbol,
    name: info.name,
    isSupported: info.isSupported
  }

  if (showConversion && currency !== targetCurrency) {
    data.conversion = {
      targetCurrency,
      pending: true // Will be populated by async conversion
    }
  }

  if (showTimestamp) {
    data.timestamp = Date.now()
  }

  if (showSource) {
    data.source = 'display'
  }

  return data
}

// Re-export commonly used functions from exchangeRate
export {
  getExchangeRate,
  convertCurrency,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyName,
  SUPPORTED_CURRENCIES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
}
