<template>
  <el-dialog
    v-model="dialogVisible"
    :title="getDialogTitle()"
    width="500px"
    @close="handleClose"
  >
    <div v-if="record" class="record-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <div class="detail-item">
          <span class="label">交易类型：</span>
          <span class="value">
            <el-tag :type="getTypeTag(record.type)" size="small">
              {{ getTypeLabel(record.type) }}
            </el-tag>
          </span>
        </div>
        
        <div class="detail-item">
          <span class="label">交易金额：</span>
          <span class="value" :class="record.type">
            {{ record.type === 'expense' ? '-' : '+' }}${{ Math.abs(record.amount).toFixed(2) }}
          </span>
        </div>
        
        <div class="detail-item">
          <span class="label">交易时间：</span>
          <span class="value">{{ formatDateTime(record.time) }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">交易状态：</span>
          <span class="value">
            <el-tag :type="getStatusType(record.status)" size="small">
              {{ getStatusText(record.status) }}
            </el-tag>
          </span>
        </div>
      </div>

      <!-- 交易详情 -->
      <div class="detail-section">
        <h4>交易详情</h4>
        <div class="detail-item">
          <span class="label">来源/用途：</span>
          <span class="value">{{ record.source }}</span>
        </div>
        
        <div class="detail-item" v-if="record.description">
          <span class="label">详细说明：</span>
          <span class="value">{{ record.description }}</span>
        </div>

        <div class="detail-item" v-if="record.currency">
          <span class="label">币种：</span>
          <span class="value">{{ record.currency }}</span>
        </div>

        <div class="detail-item" v-if="record.orderId">
          <span class="label">关联订单：</span>
          <span class="value">
            <el-button 
              size="small" 
              text 
              type="primary" 
              @click="viewOrderDetail(record.orderId)"
            >
              {{ record.orderId }}
            </el-button>
          </span>
        </div>
      </div>

      <!-- 充值特有信息 -->
      <div v-if="record.type === 'recharge'" class="detail-section">
        <h4>充值信息</h4>
        <div class="detail-item" v-if="record.paymentMethod">
          <span class="label">支付方式：</span>
          <span class="value">{{ getPaymentMethodLabel(record.paymentMethod) }}</span>
        </div>
        
        <div class="detail-item" v-if="record.receiptUrl">
          <span class="label">支付凭证：</span>
          <span class="value">
            <el-button size="small" @click="viewReceipt">查看凭证</el-button>
          </span>
        </div>
      </div>

      <!-- 消费特有信息 -->
      <div v-if="record.type === 'expense' && record.exchangeRate" class="detail-section">
        <h4>汇率信息</h4>
        <div class="detail-item">
          <span class="label">汇率：</span>
          <span class="value">{{ record.exchangeRate }}</span>
        </div>
        
        <div class="detail-item" v-if="record.originalAmount">
          <span class="label">原币种金额：</span>
          <span class="value">{{ record.originalCurrency }} {{ record.originalAmount }}</span>
        </div>
      </div>

      <!-- 佣金特有信息 -->
      <div v-if="record.type === 'commission'" class="detail-section">
        <h4>佣金信息</h4>
        <div class="detail-item" v-if="record.commissionLevel">
          <span class="label">佣金层级：</span>
          <span class="value">{{ record.commissionLevel === 1 ? '一级佣金' : '二级佣金' }}</span>
        </div>
        
        <div class="detail-item" v-if="record.referralUser">
          <span class="label">下级用户：</span>
          <span class="value">{{ record.referralUser }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="record && record.orderId" 
          type="primary" 
          @click="viewOrderDetail(record.orderId)"
        >
          查看订单详情
        </el-button>
      </div>
    </template>

    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="[record?.receiptUrl]"
      @close="showImageViewer = false"
    />
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const dialogVisible = ref(false)
const showImageViewer = ref(false)

// 监听外部控制的显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const getDialogTitle = () => {
  if (!props.record) return '交易详情'
  const titleMap = {
    'recharge': '充值详情',
    'expense': '消费详情',
    'commission': '佣金详情'
  }
  return titleMap[props.record.type] || '交易详情'
}

const getTypeLabel = (type) => {
  const labelMap = {
    'recharge': '充值',
    'expense': '消费',
    'commission': '佣金'
  }
  return labelMap[type] || type
}

const getTypeTag = (type) => {
  const tagMap = {
    'recharge': 'primary',
    'expense': 'danger',
    'commission': 'success'
  }
  return tagMap[type] || ''
}

const getStatusType = (status) => {
  const typeMap = {
    'confirmed': 'success',
    'pending': 'warning',
    'rejected': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'confirmed': '已确认',
    'pending': '待确认',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    'paypal': 'PayPal',
    'bank': '银行转账',
    'wise': 'Wise',
    'revolut': 'Revolut'
  }
  return methodMap[method] || method
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const viewReceipt = () => {
  showImageViewer.value = true
}

const viewOrderDetail = (orderId) => {
  // 根据订单ID判断是店铺订单还是采购订单
  const orderType = orderId.startsWith('PO') ? 'purchase' : 'store'
  router.push(`/orders/${orderType}/${orderId}`)
  handleClose()
}

const handleClose = () => {
  showImageViewer.value = false
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.record-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 8px;
  }
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  
  .label {
    min-width: 100px;
    color: #666;
    font-weight: 500;
  }
  
  .value {
    flex: 1;
    color: #2c3e50;
    
    &.recharge, &.commission {
      color: #67c23a;
      font-weight: 600;
    }
    
    &.expense {
      color: #f56c6c;
      font-weight: 600;
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style> 