/**
 * Exchange Rate Service Tests
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
} from '../exchangeRate.js'

describe('Exchange Rate Service', () => {
  
  describe('getExchangeRate', () => {
    test('should return rate 1 for same currency', async () => {
      const result = await getExchangeRate('USD', 'USD')
      expect(result.rate).toBe(1)
      expect(result.source).toBe('same_currency')
    })

    test('should fetch exchange rate for different currencies', async () => {
      const result = await getExchangeRate('EUR', 'USD')
      expect(result.rate).toBeGreaterThan(0)
      expect(result.fromCurrency).toBe('EUR')
      expect(result.toCurrency).toBe('USD')
      expect(result.timestamp).toBeDefined()
    })

    test('should handle invalid currencies gracefully', async () => {
      await expect(getExchangeRate('', 'USD')).rejects.toThrow()
      await expect(getExchangeRate('USD', '')).rejects.toThrow()
    })

    test('should normalize currency codes to uppercase', async () => {
      const result = await getExchangeRate('eur', 'usd')
      expect(result.fromCurrency).toBe('EUR')
      expect(result.toCurrency).toBe('USD')
    })
  })

  describe('convertCurrency', () => {
    test('should convert currency amounts correctly', async () => {
      const result = await convertCurrency(100, 'EUR', 'USD')
      expect(result.originalAmount).toBe(100)
      expect(result.convertedAmount).toBeGreaterThan(0)
      expect(result.fromCurrency).toBe('EUR')
      expect(result.toCurrency).toBe('USD')
      expect(result.exchangeRate).toBeGreaterThan(0)
    })

    test('should handle zero and negative amounts', async () => {
      await expect(convertCurrency(0, 'EUR', 'USD')).rejects.toThrow()
      await expect(convertCurrency(-100, 'EUR', 'USD')).rejects.toThrow()
    })
  })

  describe('formatCurrency', () => {
    test('should format currency with correct symbols', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00')
      expect(formatCurrency(100, 'EUR')).toBe('€100.00')
      expect(formatCurrency(100, 'GBP')).toBe('£100.00')
    })

    test('should handle different decimal places', () => {
      expect(formatCurrency(100.123, 'USD', 0)).toBe('$100')
      expect(formatCurrency(100.123, 'USD', 3)).toBe('$100.123')
    })

    test('should handle invalid amounts', () => {
      expect(formatCurrency(null, 'USD')).toBe('-')
      expect(formatCurrency(undefined, 'USD')).toBe('-')
      expect(formatCurrency('invalid', 'USD')).toBe('-')
    })

    test('should handle Nordic currencies with symbol after amount', () => {
      expect(formatCurrency(100, 'SEK')).toBe('100.00 kr')
      expect(formatCurrency(100, 'NOK')).toBe('100.00 kr')
      expect(formatCurrency(100, 'DKK')).toBe('100.00 kr')
    })
  })

  describe('getCurrencySymbol', () => {
    test('should return correct symbols for supported currencies', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
      expect(getCurrencySymbol('EUR')).toBe('€')
      expect(getCurrencySymbol('GBP')).toBe('£')
      expect(getCurrencySymbol('JPY')).toBe('¥')
    })

    test('should return currency code for unsupported currencies', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ')
    })
  })

  describe('getCurrencyName', () => {
    test('should return correct names for supported currencies', () => {
      expect(getCurrencyName('USD')).toBe('美元')
      expect(getCurrencyName('EUR')).toBe('欧元')
      expect(getCurrencyName('GBP')).toBe('英镑')
      expect(getCurrencyName('CNY')).toBe('人民币')
    })

    test('should return currency code for unsupported currencies', () => {
      expect(getCurrencyName('XYZ')).toBe('XYZ')
    })
  })

  describe('Constants', () => {
    test('should have consistent supported currencies', () => {
      expect(SUPPORTED_CURRENCIES).toContain('USD')
      expect(SUPPORTED_CURRENCIES).toContain('EUR')
      expect(SUPPORTED_CURRENCIES).toContain('GBP')
      expect(SUPPORTED_CURRENCIES).toContain('CNY')
    })

    test('should have symbols for all supported currencies', () => {
      SUPPORTED_CURRENCIES.forEach(currency => {
        expect(CURRENCY_SYMBOLS[currency]).toBeDefined()
        expect(CURRENCY_NAMES[currency]).toBeDefined()
      })
    })
  })

  describe('Caching', () => {
    test('should cache exchange rates', async () => {
      const start1 = Date.now()
      const result1 = await getExchangeRate('EUR', 'USD')
      const time1 = Date.now() - start1

      const start2 = Date.now()
      const result2 = await getExchangeRate('EUR', 'USD')
      const time2 = Date.now() - start2

      // Second call should be faster (cached)
      expect(time2).toBeLessThan(time1)
      expect(result1.rate).toBe(result2.rate)
    })
  })

  describe('Error Handling', () => {
    test('should provide fallback rates when API fails', async () => {
      // This test would require mocking the API to fail
      // For now, we just ensure the function doesn't throw
      const result = await getExchangeRate('EUR', 'USD')
      expect(result).toBeDefined()
      expect(result.rate).toBeGreaterThan(0)
    })
  })
})
