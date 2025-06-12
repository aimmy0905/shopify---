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
      
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="{ row }">
          <span class="amount" :class="row.type">
            {{ row.type === 'expense' ? '-' : '+' }}${{ Math.abs(row.amount).toFixed(2) }}
          </span>
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
      
      <el-table-column label="操作" width="120" fixed="right">
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
  }
  
  .amount {
    font-weight: 600;
    
    &.recharge, &.commission {
      color: #67c23a;
    }
    
    &.expense {
      color: #f56c6c;
    }
  }
}
</style> 