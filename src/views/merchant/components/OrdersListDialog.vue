<template>
  <el-dialog
    v-model="visible"
    title="订单列表"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="orders && orders.length > 0" class="orders-list">
      <el-table :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="goToOrderDetail(row.id)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">${{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="time" label="订单时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.time) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="customerName" label="客户名称">
          <template #default="{ row }">
            {{ row.customerName || '-' }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="orders-summary">
        <el-row>
          <el-col :span="12">
            <span>订单总数：{{ orders.length }} 个</span>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <span class="total-amount">总金额：${{ totalAmount.toFixed(2) }}</span>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="暂无订单数据" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const visible = ref(false)

// 计算属性
const totalAmount = computed(() => {
  if (!props.orders) return 0
  return props.orders.reduce((total, order) => total + order.amount, 0)
})

// 监听外部visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 监听内部visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.orders-list {
  .orders-summary {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #EBEEF5;
    
    .total-amount {
      font-weight: 600;
      color: #67C23A;
      font-size: 16px;
    }
  }
  
  .amount-text {
    font-weight: 600;
    color: #67C23A;
  }
}

.empty-state {
  padding: 40px 0;
}

.dialog-footer {
  text-align: center;
}
</style> 