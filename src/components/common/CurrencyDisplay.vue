<template>
  <div class="currency-display" :class="{ 'loading': loading, 'error': hasError }">
    <!-- Debug info (remove in production) -->
    <div v-if="true" class="debug-info" style="font-size: 10px; color: #999; border: 1px solid #ddd; padding: 4px; margin-bottom: 4px;">
      Debug: {{ amount }} {{ currency }} → {{ targetCurrency }} | Loading: {{ loading }} | Error: {{ hasError }} | Conversion: {{ !!conversion }}
    </div>

    <!-- Primary amount display -->
    <div class="primary-amount">
      <span class="currency-code">{{ currency }}</span>
      <span class="amount">{{ formattedAmount }}</span>
    </div>

    <!-- Conversion display -->
    <div v-if="showConversion" class="conversion-display">
      <div v-if="conversion" class="conversion-amount">
        <span class="conversion-symbol">≈</span>
        <span class="converted-amount">{{ conversion.formatted }}</span>
      </div>
      <div v-else-if="loading" class="conversion-loading">
        <span>正在获取汇率...</span>
      </div>
      <div v-else-if="hasError" class="conversion-error">
        <span>汇率获取失败</span>
      </div>
      <div v-else class="conversion-pending">
        <span>等待汇率数据...</span>
      </div>

      <!-- Exchange rate info -->
      <div v-if="showExchangeRate && conversion && conversion.exchangeRate" class="exchange-rate-info">
        <span class="rate-text">
          1 {{ currency }} = {{ conversion.exchangeRate.toFixed(4) }} {{ targetCurrency }}
        </span>
      </div>
    </div>

    <!-- Timestamp and source info -->
    <div v-if="showTimestamp && conversion" class="rate-meta">
      <div class="timestamp">
        <el-icon><Clock /></el-icon>
        <span>{{ conversion.timestampDisplay }}</span>
      </div>
      <div v-if="showSource" class="source">
        <span class="source-badge" :class="conversion.source">
          {{ conversion.sourceDisplay }}
        </span>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>

    <!-- Error indicator -->
    <div v-if="hasError" class="error-indicator">
      <el-icon><Warning /></el-icon>
      <span class="error-text">汇率获取失败</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Clock, Loading, Warning } from '@element-plus/icons-vue'
import { convertCurrencyEnhanced, formatCurrencyAdvanced } from '@/utils/currency.js'

const props = defineProps({
  // Required props
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  
  // Conversion options
  showConversion: {
    type: Boolean,
    default: true
  },
  targetCurrency: {
    type: String,
    default: 'USD'
  },
  
  // Display options
  showExchangeRate: {
    type: Boolean,
    default: false
  },
  showTimestamp: {
    type: Boolean,
    default: false
  },
  showSource: {
    type: Boolean,
    default: false
  },
  
  // Formatting options
  decimals: {
    type: Number,
    default: 2
  },
  
  // Auto-refresh options
  autoRefresh: {
    type: Boolean,
    default: false
  },
  refreshInterval: {
    type: Number,
    default: 5 * 60 * 1000 // 5 minutes
  }
})

const emit = defineEmits(['conversion-updated', 'conversion-error'])

// Reactive data
const loading = ref(false)
const hasError = ref(false)
const conversion = ref(null)
const refreshTimer = ref(null)

// Computed properties
const formattedAmount = computed(() => {
  return formatCurrencyAdvanced(props.amount, props.currency, {
    decimals: props.decimals,
    showSymbol: false,
    showCode: false
  })
})

// Methods
const fetchConversion = async () => {
  console.log('🔄 CurrencyDisplay fetchConversion called:', {
    amount: props.amount,
    currency: props.currency,
    targetCurrency: props.targetCurrency,
    showConversion: props.showConversion
  })

  if (!props.showConversion || props.currency === props.targetCurrency) {
    console.log('⏭️ Skipping conversion:', {
      showConversion: props.showConversion,
      sameCurrency: props.currency === props.targetCurrency
    })
    return
  }

  loading.value = true
  hasError.value = false

  try {
    console.log('📡 Starting currency conversion...')
    const result = await convertCurrencyEnhanced(
      props.amount,
      props.currency,
      props.targetCurrency
    )

    console.log('✅ Conversion result:', result)

    conversion.value = {
      ...result,
      formatted: result.getFormattedConverted(props.decimals),
      timestampDisplay: result.getTimestampDisplay(),
      sourceDisplay: result.getSourceDisplay(),
      exchangeRate: result.exchangeRate,
      source: result.source
    }

    console.log('💾 Conversion stored:', conversion.value)
    emit('conversion-updated', conversion.value)
  } catch (error) {
    console.error('❌ Currency conversion failed:', error)
    hasError.value = true
    emit('conversion-error', error)
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  if (props.autoRefresh && props.refreshInterval > 0) {
    refreshTimer.value = setInterval(fetchConversion, props.refreshInterval)
  }
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

// Watchers
watch(
  () => [props.amount, props.currency, props.targetCurrency],
  () => {
    fetchConversion()
  },
  { immediate: true }
)

watch(
  () => props.autoRefresh,
  (newValue) => {
    if (newValue) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }
)

// Lifecycle
onMounted(() => {
  console.log('🔄 CurrencyDisplay mounted:', {
    amount: props.amount,
    currency: props.currency,
    targetCurrency: props.targetCurrency,
    showConversion: props.showConversion
  })

  if (props.showConversion) {
    console.log('🚀 Starting initial conversion...')
    fetchConversion()
  }
  if (props.autoRefresh) {
    console.log('⏰ Starting auto-refresh...')
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.currency-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.primary-amount {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.currency-code {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.amount {
  font-size: 14px;
  color: #303133;
}

.conversion-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.conversion-amount {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.conversion-symbol {
  font-weight: 500;
}

.converted-amount {
  font-weight: 500;
}

.conversion-loading,
.conversion-error,
.conversion-pending {
  font-size: 11px;
  font-style: italic;
}

.conversion-loading {
  color: #409EFF;
}

.conversion-error {
  color: #F56C6C;
}

.conversion-pending {
  color: #909399;
}

.exchange-rate-info {
  font-size: 11px;
  color: #C0C4CC;
}

.rate-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  color: #C0C4CC;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 2px;
}

.timestamp .el-icon {
  font-size: 10px;
}

.source-badge {
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 500;
}

.source-badge.mock_api {
  background-color: #E1F3D8;
  color: #67C23A;
}

.source-badge.fallback {
  background-color: #FDF6EC;
  color: #E6A23C;
}

.source-badge.same_currency {
  background-color: #F0F9FF;
  color: #409EFF;
}

.loading-indicator {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #909399;
}

.error-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: #F56C6C;
}

.currency-display.loading {
  opacity: 0.8;
}

.currency-display.error .conversion-display {
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rate-meta {
    display: none;
  }
  
  .exchange-rate-info {
    display: none;
  }
}
</style>
