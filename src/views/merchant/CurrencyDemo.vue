<template>
  <div class="currency-demo-page">
    <div class="page-header">
      <h2>实时汇率功能演示</h2>
      <p>展示售后订单列表中的实时汇率转换功能</p>
    </div>

    <el-card class="demo-section">
      <template #header>
        <div class="card-header">
          <span>汇率转换演示</span>
          <el-button type="primary" @click="refreshRates">刷新汇率</el-button>
        </div>
      </template>

      <div class="demo-grid">
        <div class="demo-item" v-for="demo in demoData" :key="demo.id">
          <div class="demo-label">{{ demo.label }}</div>
          <CurrencyDisplay
            :amount="demo.amount"
            :currency="demo.currency"
            :show-conversion="true"
            :target-currency="'USD'"
            :show-timestamp="true"
            :show-source="true"
            :auto-refresh="true"
            :refresh-interval="60000"
            @conversion-updated="onConversionUpdated"
            @conversion-error="onConversionError"
          />
        </div>
      </div>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <span>售后订单退还结算金额示例</span>
      </template>

      <el-table :data="sampleOrders" style="width: 100%">
        <el-table-column prop="orderNo" label="售后订单号" width="180" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column label="退还结算金额" width="200">
          <template #default="{ row }">
            <CurrencyDisplay
              :amount="row.refundAmount"
              :currency="row.currency"
              :show-conversion="true"
              :target-currency="'USD'"
              :show-timestamp="true"
              :show-source="false"
              :auto-refresh="true"
              :refresh-interval="300000"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <span>功能特性说明</span>
      </template>

      <div class="features-list">
        <div class="feature-item">
          <el-icon class="feature-icon"><Check /></el-icon>
          <div class="feature-content">
            <h4>实时汇率获取</h4>
            <p>每5分钟自动更新汇率数据，确保显示最新的汇率信息</p>
          </div>
        </div>

        <div class="feature-item">
          <el-icon class="feature-icon"><Clock /></el-icon>
          <div class="feature-content">
            <h4>时间戳显示</h4>
            <p>显示汇率获取时间，让用户了解数据的时效性</p>
          </div>
        </div>

        <div class="feature-item">
          <el-icon class="feature-icon"><Connection /></el-icon>
          <div class="feature-content">
            <h4>缓存机制</h4>
            <p>智能缓存汇率数据，减少API调用，提升页面性能</p>
          </div>
        </div>

        <div class="feature-item">
          <el-icon class="feature-icon"><Warning /></el-icon>
          <div class="feature-content">
            <h4>错误处理</h4>
            <p>当汇率API不可用时，自动使用备用汇率，确保功能正常</p>
          </div>
        </div>

        <div class="feature-item">
          <el-icon class="feature-icon"><Monitor /></el-icon>
          <div class="feature-content">
            <h4>响应式设计</h4>
            <p>在移动设备上自动隐藏详细信息，保持界面简洁</p>
          </div>
        </div>

        <div class="feature-item">
          <el-icon class="feature-icon"><Setting /></el-icon>
          <div class="feature-content">
            <h4>可配置选项</h4>
            <p>支持自定义刷新间隔、显示选项等，满足不同场景需求</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Clock, Connection, Warning, Monitor, Setting } from '@element-plus/icons-vue'
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'

// Demo data
const demoData = ref([
  { id: 1, label: '欧元退款', amount: 280.50, currency: 'EUR' },
  { id: 2, label: '英镑退款', amount: 103.20, currency: 'GBP' },
  { id: 3, label: '加元退款', amount: 259.00, currency: 'CAD' },
  { id: 4, label: '澳元退款', amount: 120.00, currency: 'AUD' },
  { id: 5, label: '日元退款', amount: 15000, currency: 'JPY' },
  { id: 6, label: '人民币退款', amount: 720.00, currency: 'CNY' }
])

// Sample orders for table demo
const sampleOrders = ref([
  {
    orderNo: 'RFD202312150001',
    customerName: 'John Doe',
    refundAmount: 280.50,
    currency: 'EUR',
    status: 'processing'
  },
  {
    orderNo: 'RFD202312150002',
    customerName: 'Jane Smith',
    refundAmount: 103.20,
    currency: 'GBP',
    status: 'completed'
  },
  {
    orderNo: 'RFD202312150003',
    customerName: 'Bob Johnson',
    refundAmount: 259.00,
    currency: 'CAD',
    status: 'pending'
  },
  {
    orderNo: 'RFD202312150004',
    customerName: 'Sarah Wilson',
    refundAmount: 120.00,
    currency: 'AUD',
    status: 'completed'
  }
])

// Methods
const refreshRates = () => {
  ElMessage.success('汇率刷新中...')
  // Force refresh by updating component keys or triggering refresh
}

const onConversionUpdated = (conversionData) => {
  console.log('汇率更新:', conversionData)
}

const onConversionError = (error) => {
  console.warn('汇率转换失败:', error.message)
  ElMessage.warning('汇率获取失败，使用备用汇率')
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '申请中',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.currency-demo-page {
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

.demo-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.demo-item {
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.demo-label {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.feature-icon {
  color: #409EFF;
  font-size: 20px;
  margin-top: 2px;
}

.feature-content h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 14px;
}

.feature-content p {
  margin: 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .features-list {
    grid-template-columns: 1fr;
  }
}
</style>
