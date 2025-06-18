<template>
  <div class="balance-records-table">
    <el-table :data="paginatedRecords" style="width: 100%" stripe>
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <div class="type-badge" :class="row.type">
            <el-icon v-if="row.type === 'recharge'"><CreditCard /></el-icon>
            <el-icon v-else-if="row.type === 'expense'"><Minus /></el-icon>
            <el-icon v-else><Plus /></el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="入账/消费金额（美元）" width="180">
        <template #default="{ row }">
          <div class="usd-amount-column">
            <span class="amount" :class="getAmountClass(row)">
              {{ getAmountPrefix(row) }}${{ Math.abs(row.usdAmount).toFixed(2) }}
            </span>
            <div class="currency-tag">USD</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column v-if="!hideOriginalCurrency" label="入账/消费（实际币种）" width="220">
        <template #default="{ row }">
          <div class="currency-info">
            <!-- 原始货币金额 -->
            <div class="original-currency">
              <span class="currency-name">{{ row.originalCurrency }}</span>
              <span class="original-amount">{{ Math.abs(row.originalAmount).toFixed(2) }}</span>
            </div>

            <!-- 汇率信息 -->
            <div v-if="row.originalCurrency !== 'USD'" class="exchange-rate">
              <span class="rate-text">汇率: 1:{{ row.exchangeRate.toFixed(4) }}</span>
            </div>

          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="time" label="时间" width="150">
        <template #default="{ row }">
          {{ formatDateTime(row.time) }}
        </template>
      </el-table-column>
      
      <el-table-column prop="source" label="来源/用途" min-width="200" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="description" label="详情/备注" min-width="150" />
      
      <el-table-column v-if="!hideViewDetail" label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text @click="$emit('view-detail', row)">
            查看详情
          </el-button>
          <el-button
            v-if="row.receiptUrl"
            size="small"
            text
            @click="viewReceipt(row)"
          >
            查看凭证
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="[currentReceiptUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { CreditCard, Minus, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  hideOriginalCurrency: {
    type: Boolean,
    default: false
  },
  hideViewDetail: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-detail'])

const showImageViewer = ref(false)
const currentReceiptUrl = ref('')

// 分页数据
const paginatedRecords = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  const end = start + props.pageSize
  return props.records.slice(start, end)
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取金额前缀符号
const getAmountPrefix = (row) => {
  // 退款类型显示为+，其他按原逻辑
  if (row.type === 'refund') {
    return '+'
  }
  return row.type === 'expense' ? '-' : '+'
}

// 获取金额样式类
const getAmountClass = (row) => {
  // 退款和佣金、充值都显示为正向（绿色）
  if (row.type === 'refund' || row.type === 'commission' || row.type === 'recharge') {
    return 'positive'
  }
  return 'negative'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'confirmed': 'success',
    'pending': 'warning', 
    'rejected': 'danger'
  }
  return typeMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'confirmed': '已确认',
    'pending': '待确认',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

// 查看凭证
const viewReceipt = (record) => {
  currentReceiptUrl.value = record.receiptUrl
  showImageViewer.value = true
}
</script>

<style scoped lang="scss">
.balance-records-table {
  .type-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    
    &.recharge {
      background: #e1f3ff;
      color: #409eff;
    }
    
    &.expense {
      background: #fef0f0;
      color: #f56c6c;
    }
    
    &.commission {
      background: #f0f9ff;
      color: #67c23a;
    }

    &.refund {
      background: #f0f9ff;
      color: #67c23a;
    }
  }
  
  .usd-amount-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    .amount {
      font-weight: 600;
      font-size: 16px;

      &.positive {
        color: #67c23a;
      }

      &.negative {
        color: #f56c6c;
      }
    }

    .currency-tag {
      background: #f0f2f5;
      color: #666;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .currency-info {
    .original-currency {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .currency-name {
        background: #e6f7ff;
        color: #1890ff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        min-width: 40px;
        text-align: center;
      }

      .original-amount {
        font-weight: 600;
        font-size: 14px;
        color: #2c3e50;
      }
    }

    .exchange-rate {
      .rate-text {
        font-size: 12px;
        color: #999;
        font-style: italic;
      }
    }
  }
}
</style> 