<template>
  <el-dialog
    v-model="visible"
    title="Invoice详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="invoice" class="invoice-detail">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <h4>基本信息</h4>
        </template>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <label>申请时间：</label>
              <span>{{ formatDateTime(invoice.applyTime) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>Invoice编号：</label>
              <span v-if="invoice.invoiceNo">{{ invoice.invoiceNo }}</span>
              <span v-else class="text-muted">待分配</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>开票金额：</label>
              <span class="amount-text">${{ invoice.amount.toFixed(2) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>开票状态：</label>
              <el-tag :type="getStatusType(invoice.status)">
                {{ getStatusText(invoice.status) }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 开票信息 -->
      <el-card class="info-card">
        <template #header>
          <h4>开票信息</h4>
        </template>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <label>收件人：</label>
              <span>{{ invoice.recipientInfo?.name || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>联系方式：</label>
              <span>{{ invoice.recipientInfo?.phone || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <label>邮寄地址：</label>
              <span>{{ invoice.recipientInfo?.address || '-' }}</span>
            </div>
          </el-col>
          <el-col v-if="invoice.remarks" :span="24">
            <div class="info-item">
              <label>备注信息：</label>
              <span>{{ invoice.remarks }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 订单信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h4>订单信息</h4>
            <span class="order-count">共 {{ invoice.orders?.length || 0 }} 个订单</span>
          </div>
        </template>
        <el-table :data="invoice.orders" size="small">
          <el-table-column prop="orderNo" label="订单号" width="140">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.id)">
                {{ row.orderNo }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="订单金额" width="120">
            <template #default="{ row }">
              ${{ row.amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="订单时间">
            <template #default="{ row }">
              {{ formatDateTime(row.time) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="orders-summary">
          <el-row>
            <el-col :span="12">
              <strong>订单总金额：${{ ordersTotalAmount.toFixed(2) }}</strong>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 发票预览（已完成状态显示） -->
      <el-card v-if="invoice.status === 'completed' && invoice.invoiceFile" class="info-card">
        <template #header>
          <div class="card-header">
            <h4>Invoice文件</h4>
            <el-button
              type="primary"
              size="small"
              @click="downloadInvoice"
              :loading="downloading"
            >
              <el-icon><Download /></el-icon>
              下载Invoice
            </el-button>
          </div>
        </template>
        
        <div class="invoice-preview">
          <div class="preview-placeholder">
            <el-icon size="48"><Document /></el-icon>
            <p>{{ invoice.invoiceFile }}</p>
            <p class="file-desc">PDF文件，点击上方按钮下载</p>
          </div>
        </div>
      </el-card>

      <!-- 处理状态（待开具状态显示） -->
      <el-card v-if="invoice.status === 'pending'" class="info-card">
        <template #header>
          <h4>处理状态</h4>
        </template>
        <el-timeline>
          <el-timeline-item timestamp="刚刚" type="primary">
            <div class="timeline-content">
              <h5>申请已提交</h5>
              <p>您的Invoice申请已提交，等待工作人员处理...</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="invoice?.status === 'completed' && invoice?.invoiceFile"
          type="primary"
          @click="downloadInvoice"
          :loading="downloading"
        >
          <el-icon><Download /></el-icon>
          下载Invoice
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Document } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  invoice: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const visible = ref(false)
const downloading = ref(false)

// 计算属性
const ordersTotalAmount = computed(() => {
  if (!props.invoice?.orders) return 0
  return props.invoice.orders.reduce((total, order) => total + order.amount, 0)
})

// 监听外部visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 监听内部visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 状态相关方法
const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'completed': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待开具',
    'completed': '已完成'
  }
  return texts[status] || '未知'
}

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
  handleClose()
}

// 下载Invoice
const downloadInvoice = async () => {
  if (!props.invoice?.invoiceFile) {
    ElMessage.warning('Invoice文件不存在')
    return
  }

  downloading.value = true
  try {
    // 模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际项目中这里会调用下载API
    ElMessage.success('Invoice下载开始')
    console.log('Downloading invoice file:', props.invoice.invoiceFile)
    
    // 模拟文件下载
    const link = document.createElement('a')
    link.href = '#' // 实际项目中这里是文件的下载URL
    link.download = props.invoice.invoiceFile
    // link.click()
  } catch (error) {
    ElMessage.error('下载失败，请重试')
    console.error('Download error:', error)
  } finally {
    downloading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.invoice-detail {
  .info-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h4 {
        margin: 0;
        color: #303133;
      }

      .order-count {
        color: #909399;
        font-size: 14px;
      }
    }

    .info-item {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      
      &:last-child {
        margin-bottom: 0;
      }

      label {
        min-width: 100px;
        color: #606266;
        font-weight: 500;
        margin-right: 8px;
      }

      span {
        flex: 1;
        color: #303133;
        word-break: break-all;
      }
    }

    .amount-text {
      font-weight: 600;
      color: #67C23A;
      font-size: 16px;
    }

    .text-muted {
      color: #909399;
    }

    .orders-summary {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #EBEEF5;
      text-align: right;
    }

    .invoice-preview {
      .preview-placeholder {
        text-align: center;
        padding: 40px 20px;
        background-color: #FAFAFA;
        border: 1px dashed #DCDFE6;
        border-radius: 4px;

        .el-icon {
          color: #C0C4CC;
          margin-bottom: 16px;
        }

        p {
          margin: 8px 0;
          color: #606266;
          
          &.file-desc {
            color: #909399;
            font-size: 12px;
          }
        }
      }
    }

    .timeline-content {
      h5 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style> 