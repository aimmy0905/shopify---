/**
 * Test script for exchange rate functionality
 * Run this in browser console to debug issues
 */

import { getExchangeRate, convertCurrency, formatCurrency } from './exchangeRate.js'
import { convertCurrencyEnhanced, formatCurrencyAdvanced } from './currency.js'

// Test basic exchange rate functionality
export async function testExchangeRates() {
  console.log('🧪 Testing Exchange Rate Functionality...')
  
  try {
    // Test 1: Basic exchange rate fetching
    console.log('\n📊 Test 1: Basic Exchange Rate Fetching')
    const eurToUsd = await getExchangeRate('EUR', 'USD')
    console.log('EUR to USD:', eurToUsd)
    
    const gbpToUsd = await getExchangeRate('GBP', 'USD')
    console.log('GBP to USD:', gbpToUsd)
    
    // Test 2: Currency conversion
    console.log('\n💱 Test 2: Currency Conversion')
    const conversion1 = await convertCurrency(280.50, 'EUR', 'USD')
    console.log('280.50 EUR to USD:', conversion1)
    
    const conversion2 = await convertCurrency(103.20, 'GBP', 'USD')
    console.log('103.20 GBP to USD:', conversion2)
    
    // Test 3: Enhanced currency conversion
    console.log('\n✨ Test 3: Enhanced Currency Conversion')
    const enhanced1 = await convertCurrencyEnhanced(280.50, 'EUR', 'USD')
    console.log('Enhanced EUR conversion:', {
      original: enhanced1.getFormattedOriginal(),
      converted: enhanced1.getFormattedConverted(),
      rate: enhanced1.getExchangeRateDisplay(),
      timestamp: enhanced1.getTimestampDisplay(),
      source: enhanced1.getSourceDisplay()
    })
    
    // Test 4: Currency formatting
    console.log('\n🎨 Test 4: Currency Formatting')
    console.log('Format 280.50 EUR:', formatCurrency(280.50, 'EUR'))
    console.log('Format 103.20 GBP:', formatCurrency(103.20, 'GBP'))
    console.log('Format 259.00 CAD:', formatCurrency(259.00, 'CAD'))
    
    console.log('Advanced format 280.50 EUR:', formatCurrencyAdvanced(280.50, 'EUR'))
    console.log('Advanced format 103.20 GBP:', formatCurrencyAdvanced(103.20, 'GBP'))
    
    console.log('✅ All tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Test component data structure
export function testComponentData() {
  console.log('\n🔧 Testing Component Data Structure...')
  
  const sampleData = [
    { amount: 280.50, currency: 'EUR' },
    { amount: 103.20, currency: 'GBP' },
    { amount: 259.00, currency: 'CAD' },
    { amount: 120.00, currency: 'AUD' }
  ]
  
  sampleData.forEach((item, index) => {
    console.log(`Item ${index + 1}:`, {
      amount: item.amount,
      currency: item.currency,
      formatted: formatCurrency(item.amount, item.currency),
      isValid: typeof item.amount === 'number' && typeof item.currency === 'string'
    })
  })
  
  return true
}

// Test same currency conversion
export async function testSameCurrency() {
  console.log('\n🔄 Testing Same Currency Conversion...')
  
  try {
    const usdToUsd = await getExchangeRate('USD', 'USD')
    console.log('USD to USD:', usdToUsd)
    
    const conversion = await convertCurrency(39.98, 'USD', 'USD')
    console.log('39.98 USD to USD:', conversion)
    
    return true
  } catch (error) {
    console.error('❌ Same currency test failed:', error)
    return false
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Starting Exchange Rate Tests...')
  
  const results = {
    basicTests: await testExchangeRates(),
    componentData: testComponentData(),
    sameCurrency: await testSameCurrency()
  }
  
  console.log('\n📋 Test Results:', results)
  
  const allPassed = Object.values(results).every(result => result === true)
  console.log(allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed!')
  
  return results
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.testExchangeRates = {
    runAllTests,
    testExchangeRates,
    testComponentData,
    testSameCurrency
  }
  console.log('💡 Exchange rate tests available in window.testExchangeRates')
}
