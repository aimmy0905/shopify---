<template>
  <div class="currency-test-page">
    <div class="page-header">
      <h2>Currency Display Test</h2>
      <p>Testing the CurrencyDisplay component in isolation</p>
    </div>

    <el-card class="test-section">
      <template #header>
        <span>Basic Currency Display Test</span>
      </template>

      <div class="test-grid">
        <div class="test-item">
          <h4>Test 1: EUR to USD</h4>
          <CurrencyDisplay
            :amount="280.50"
            currency="EUR"
            :show-conversion="true"
            target-currency="USD"
            :show-timestamp="true"
            :show-source="true"
            @conversion-updated="onConversionUpdated"
            @conversion-error="onConversionError"
          />
        </div>

        <div class="test-item">
          <h4>Test 2: GBP to USD</h4>
          <CurrencyDisplay
            :amount="103.20"
            currency="GBP"
            :show-conversion="true"
            target-currency="USD"
            :show-timestamp="true"
            :show-source="true"
            @conversion-updated="onConversionUpdated"
            @conversion-error="onConversionError"
          />
        </div>

        <div class="test-item">
          <h4>Test 3: USD to USD (Same Currency)</h4>
          <CurrencyDisplay
            :amount="39.98"
            currency="USD"
            :show-conversion="true"
            target-currency="USD"
            :show-timestamp="true"
            :show-source="true"
            @conversion-updated="onConversionUpdated"
            @conversion-error="onConversionError"
          />
        </div>

        <div class="test-item">
          <h4>Test 4: CAD to USD</h4>
          <CurrencyDisplay
            :amount="259.00"
            currency="CAD"
            :show-conversion="true"
            target-currency="USD"
            :show-timestamp="true"
            :show-source="true"
            @conversion-updated="onConversionUpdated"
            @conversion-error="onConversionError"
          />
        </div>
      </div>
    </el-card>

    <el-card class="test-section">
      <template #header>
        <span>Manual Test Controls</span>
      </template>

      <div class="controls">
        <el-button type="primary" @click="testExchangeRates">Test Exchange Rates</el-button>
        <el-button type="success" @click="testCurrencyConversion">Test Currency Conversion</el-button>
        <el-button type="warning" @click="clearConsole">Clear Console</el-button>
      </div>

      <div class="results" v-if="testResults.length > 0">
        <h4>Test Results:</h4>
        <div v-for="(result, index) in testResults" :key="index" class="result-item">
          <strong>{{ result.test }}:</strong> {{ result.result }}
        </div>
      </div>
    </el-card>

    <el-card class="test-section">
      <template #header>
        <span>Event Log</span>
      </template>

      <div class="event-log">
        <div v-for="(event, index) in eventLog" :key="index" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type" :class="event.type">{{ event.type }}</span>
          <span class="event-message">{{ event.message }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'
import { getExchangeRate, convertCurrency } from '@/utils/exchangeRate.js'
import { convertCurrencyEnhanced } from '@/utils/currency.js'

const testResults = ref([])
const eventLog = ref([])

const addEvent = (type, message) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  
  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20)
  }
}

const onConversionUpdated = (conversionData) => {
  console.log('✅ Conversion updated:', conversionData)
  addEvent('success', `Conversion updated: ${conversionData.fromCurrency} to ${conversionData.toCurrency}`)
  ElMessage.success('汇率转换成功')
}

const onConversionError = (error) => {
  console.error('❌ Conversion error:', error)
  addEvent('error', `Conversion error: ${error.message}`)
  ElMessage.error('汇率转换失败')
}

const testExchangeRates = async () => {
  console.log('🧪 Testing exchange rates...')
  addEvent('info', 'Starting exchange rate tests...')
  
  try {
    const tests = [
      { from: 'EUR', to: 'USD' },
      { from: 'GBP', to: 'USD' },
      { from: 'CAD', to: 'USD' },
      { from: 'USD', to: 'USD' }
    ]
    
    for (const test of tests) {
      const result = await getExchangeRate(test.from, test.to)
      console.log(`${test.from} to ${test.to}:`, result)
      addEvent('success', `${test.from} to ${test.to}: ${result.rate}`)
    }
    
    ElMessage.success('汇率测试完成')
  } catch (error) {
    console.error('Test failed:', error)
    addEvent('error', `Test failed: ${error.message}`)
    ElMessage.error('汇率测试失败')
  }
}

const testCurrencyConversion = async () => {
  console.log('🧪 Testing currency conversion...')
  addEvent('info', 'Starting currency conversion tests...')
  
  try {
    const tests = [
      { amount: 280.50, from: 'EUR', to: 'USD' },
      { amount: 103.20, from: 'GBP', to: 'USD' },
      { amount: 259.00, from: 'CAD', to: 'USD' }
    ]
    
    for (const test of tests) {
      const result = await convertCurrencyEnhanced(test.amount, test.from, test.to)
      console.log(`${test.amount} ${test.from} to ${test.to}:`, result)
      addEvent('success', `${test.amount} ${test.from} = ${result.convertedAmount} ${test.to}`)
    }
    
    ElMessage.success('货币转换测试完成')
  } catch (error) {
    console.error('Conversion test failed:', error)
    addEvent('error', `Conversion test failed: ${error.message}`)
    ElMessage.error('货币转换测试失败')
  }
}

const clearConsole = () => {
  console.clear()
  eventLog.value = []
  testResults.value = []
  addEvent('info', 'Console and logs cleared')
}
</script>

<style scoped>
.currency-test-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.test-section {
  margin-bottom: 20px;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.test-item {
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.test-item h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.results {
  margin-top: 20px;
}

.result-item {
  padding: 8px;
  margin-bottom: 4px;
  background-color: #F5F7FA;
  border-radius: 4px;
  font-size: 12px;
}

.event-log {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 8px;
}

.event-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #F5F7FA;
  font-size: 12px;
}

.event-time {
  color: #909399;
  min-width: 80px;
}

.event-type {
  min-width: 60px;
  font-weight: 600;
}

.event-type.success {
  color: #67C23A;
}

.event-type.error {
  color: #F56C6C;
}

.event-type.info {
  color: #409EFF;
}

.event-message {
  color: #303133;
}
</style>
