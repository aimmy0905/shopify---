<template>
  <div class="invoice-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft" circle />
        <div class="header-info">
          <h2>Invoice详情</h2>
          <div class="breadcrumb">
            <el-link @click="goToInvoiceList" type="primary">Invoice管理</el-link>
            <span class="separator">/</span>
            <span>Invoice详情</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          v-if="invoiceInfo?.status === 'completed' && invoiceInfo?.invoiceFile"
          type="primary"
          @click="downloadInvoice"
          :loading="downloading"
          :icon="Download"
        >
          下载Invoice
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Invoice详情内容 -->
    <div v-else-if="invoiceInfo" class="invoice-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>基本信息</h3>
            <el-tag :type="getStatusType(invoiceInfo.status)" size="large">
              {{ getStatusText(invoiceInfo.status) }}
            </el-tag>
          </div>
        </template>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <label>发票编号：</label>
              <span v-if="invoiceInfo.invoiceNo">{{ invoiceInfo.invoiceNo }}</span>
              <span v-else class="text-muted">待分配</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>发票类型：</label>
              <el-tag :type="invoiceInfo.invoiceType === 'enterprise' ? 'primary' : 'success'" size="small">
                {{ invoiceInfo.invoiceType === 'enterprise' ? '企业' : '个人' }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>申请时间：</label>
              <span>{{ formatDateTime(invoiceInfo.applyTime) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 发票信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <h3>发票信息</h3>
        </template>

        <!-- 企业类型发票信息 -->
        <div v-if="invoiceInfo.invoiceType === 'enterprise'">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>公司名称/Invoice抬头：</label>
                <span>{{ getInvoiceHeader(invoiceInfo) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>公司地址：</label>
                <span>{{ invoiceInfo.companyAddress || invoiceInfo.recipientInfo?.address || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>公司税号/VAT号：</label>
                <span>{{ invoiceInfo.taxNumber || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>联系人姓名：</label>
                <span>{{ invoiceInfo.contactName || invoiceInfo.recipientInfo?.name || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>联系人邮箱：</label>
                <span>{{ invoiceInfo.contactEmail || invoiceInfo.individualEmail || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>付款方式：</label>
                <span>{{ getPaymentMethodText(invoiceInfo.paymentMethod) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 个人类型发票信息 -->
        <div v-else-if="invoiceInfo.invoiceType === 'individual'">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <label>邮箱地址：</label>
                <span>{{ invoiceInfo.individualEmail || invoiceInfo.contactEmail || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>联系人姓名：</label>
                <span>{{ invoiceInfo.individualName || invoiceInfo.contactName || invoiceInfo.recipientInfo?.name || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>联系人邮箱：</label>
                <span>{{ invoiceInfo.individualEmail || invoiceInfo.contactEmail || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>付款方式：</label>
                <span>{{ getPaymentMethodText(invoiceInfo.paymentMethod) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 订单信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>订单信息</h3>
            <span class="order-count">共 {{ invoiceInfo.orders?.length || 0 }} 个订单</span>
          </div>
        </template>
        <el-table :data="invoiceInfo.orders" size="small" stripe>
          <el-table-column prop="orderNo" label="订单号" width="160">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.id)">
                {{ row.orderNo }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="订单金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-text">${{ row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="币种" width="80" align="center">
            <template #default="{ row }">
              <span>{{ row.currency || 'USD' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="订单时间" width="160">
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

      <!-- Invoice状态卡片 -->
      <el-card class="info-card">
        <template #header>
          <h3>开票状态</h3>
        </template>
        <div v-if="invoiceInfo.status === 'pending'" class="status-pending">
          <el-timeline>
            <el-timeline-item timestamp="刚刚" type="primary">
              <div class="timeline-content">
                <h5>申请已提交</h5>
                <p>您的Invoice申请已提交，等待工作人员处理...</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <div v-else-if="invoiceInfo.status === 'completed'" class="status-completed">
          <el-result icon="success" title="Invoice已完成" sub-title="您的Invoice已成功开具">
            <template #extra>
              <div class="invoice-file-info">
                <el-icon size="24"><Document /></el-icon>
                <span>{{ invoiceInfo.invoiceFile }}</span>
                <el-button
                  type="primary"
                  size="small"
                  @click="downloadInvoice"
                  :loading="downloading"
                >
                  下载
                </el-button>
              </div>
            </template>
          </el-result>
        </div>
      </el-card>

      <!-- 备注信息 -->
      <el-card v-if="invoiceInfo.remarks" class="info-card">
        <template #header>
          <h3>备注信息</h3>
        </template>
        <div class="remarks-content">
          <p>{{ invoiceInfo.remarks }}</p>
        </div>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-result icon="error" title="Invoice不存在" sub-title="未找到对应的Invoice信息">
        <template #extra>
          <el-button type="primary" @click="goToInvoiceList">返回Invoice列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Document } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const downloading = ref(false)
const invoiceInfo = ref(null)

// 计算属性
const ordersTotalAmount = computed(() => {
  if (!invoiceInfo.value?.orders) return 0
  return invoiceInfo.value.orders.reduce((total, order) => total + order.amount, 0)
})

// 生命周期
onMounted(() => {
  loadInvoiceDetail()
})

// 方法
const loadInvoiceDetail = async () => {
  loading.value = true
  try {
    const invoiceId = route.params.id
    
    // 模拟加载Invoice详情
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟Invoice数据 - 这里应该从API获取
    const mockInvoices = [
      {
        id: '1',
        applyTime: '2024-01-15 10:30:00',
        invoiceNo: 'INV-2024-001',
        amount: 1250.00,
        status: 'completed',
        invoiceType: 'enterprise',
        companyName: 'TechCorp Solutions Ltd.',
        companyAddress: '123 Business District, New York, NY 10001',
        taxNumber: 'TAX123456789',
        contactName: 'John Smith',
        contactEmail: 'john.smith@techcorp.com',
        paymentMethod: 'credit_card',
        recipientInfo: {
          name: 'John Smith',
          phone: '+1234567890',
          address: '123 Main St, New York, NY 10001'
        },
        orders: [
          { id: 1, orderNo: 'ORD-2024-001', amount: 500.00, currency: 'USD', time: '2024-01-10 09:15:00' },
          { id: 2, orderNo: 'ORD-2024-002', amount: 750.00, currency: 'USD', time: '2024-01-12 14:20:00' }
        ],
        invoiceFile: 'invoice_001.pdf',
        remarks: '季度结算'
      },
      {
        id: '2',
        applyTime: '2024-01-20 15:45:00',
        invoiceNo: null,
        amount: 800.00,
        status: 'pending',
        invoiceType: 'individual',
        individualName: 'Jane Doe',
        individualEmail: 'jane.doe@example.com',
        contactName: 'Jane Doe',
        contactEmail: 'jane.doe@example.com',
        paymentMethod: 'paypal',
        recipientInfo: {
          name: 'Jane Doe',
          phone: '+1987654321',
          address: '456 Oak Ave, Los Angeles, CA 90210'
        },
        orders: [
          { id: 3, orderNo: 'ORD-2024-003', amount: 300.00, currency: 'USD', time: '2024-01-18 11:30:00' },
          { id: 4, orderNo: 'ORD-2024-004', amount: 500.00, currency: 'USD', time: '2024-01-19 16:45:00' }
        ],
        invoiceFile: null,
        remarks: ''
      }
    ]
    
    const invoice = mockInvoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      invoiceInfo.value = invoice
    } else {
      invoiceInfo.value = null
    }
    
  } catch (error) {
    ElMessage.error('加载Invoice详情失败')
    console.error('Error loading invoice detail:', error)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 跳转到Invoice列表
const goToInvoiceList = () => {
  router.push('/merchant/invoices')
}

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
}

// 下载Invoice
const downloadInvoice = async () => {
  if (!invoiceInfo.value?.invoiceFile) {
    ElMessage.warning('Invoice文件不存在')
    return
  }

  downloading.value = true
  try {
    // 模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('Invoice下载开始')
    console.log('Downloading invoice file:', invoiceInfo.value.invoiceFile)

    // 实际项目中这里会调用下载API
    // const link = document.createElement('a')
    // link.href = downloadUrl
    // link.download = invoiceInfo.value.invoiceFile
    // link.click()
  } catch (error) {
    ElMessage.error('下载失败，请重试')
    console.error('Download error:', error)
  } finally {
    downloading.value = false
  }
}

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

// 获取发票抬头
const getInvoiceHeader = (invoice) => {
  if (invoice.invoiceType === 'enterprise') {
    return invoice.companyName || '-'
  } else {
    return invoice.individualName || '-'
  }
}

// 获取付款方式文本
const getPaymentMethodText = (method) => {
  const methods = {
    'credit_card': '信用卡',
    'paypal': 'PayPal',
    'bank_card': '银行卡',
    'wire_transfer': '银行转账'
  }
  return methods[method] || '-'
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/global.scss";

.invoice-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #EBEEF5;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-info {
        h2 {
          margin: 0 0 4px 0;
          color: #303133;
          font-size: 24px;
          font-weight: 600;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #909399;
          font-size: 14px;

          .separator {
            color: #C0C4CC;
          }
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .loading-container {
    padding: 40px 0;
  }

  .invoice-content {
    .info-card {
      margin-bottom: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          color: #303133;
          font-size: 18px;
          font-weight: 600;
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
          min-width: 140px;
          color: #606266;
          font-weight: 500;
          margin-right: 12px;
          flex-shrink: 0;
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

      .status-pending {
        .timeline-content {
          h5 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #606266;
            font-size: 14px;
          }
        }
      }

      .status-completed {
        .invoice-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-top: 16px;
          padding: 16px;
          background-color: #F5F7FA;
          border-radius: 6px;

          .el-icon {
            color: #409EFF;
          }

          span {
            color: #303133;
            font-weight: 500;
          }
        }
      }

      .remarks-content {
        p {
          margin: 0;
          color: #303133;
          line-height: 1.6;
          font-size: 14px;
        }
      }
    }
  }

  .error-container {
    padding: 40px 0;
    text-align: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .invoice-detail-page {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-left {
        width: 100%;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .invoice-content {
      .info-card {
        .info-item {
          flex-direction: column;
          align-items: flex-start;

          label {
            min-width: auto;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}
</style>
