<template>
  <div class="customer-balance-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack" class="back-button">
          返回列表
        </el-button>
        <div class="header-info">
          <h1 class="page-title">{{ customer?.name }} - 余额详情</h1>
          <p class="page-description">查看客户账户余额和交易记录</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Edit" @click="showAdjustBalanceDialog">
          调整余额
        </el-button>
        <el-button :icon="Download" @click="exportCustomerData">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 客户信息卡片 -->
    <el-row :gutter="20" v-if="customer">
      <el-col :span="16">
        <el-card class="customer-info-card">
          <template #header>
            <div class="card-header">
              <span>客户信息</span>
              <el-tag :type="getAccountStatusType(customer.account_status)">
                {{ getAccountStatusText(customer.account_status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户ID">{{ customer.id }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ customer.name }}</el-descriptions-item>
            <el-descriptions-item label="邮箱地址">{{ customer.email }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ customer.phone }}</el-descriptions-item>
            <el-descriptions-item label="公司名称">{{ customer.company }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ customer.created_at }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ customer.address }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="balance-summary-card">
          <template #header>
            <span>余额概览</span>
          </template>
          <div class="balance-summary">
            <div class="balance-item">
              <div class="balance-label">可用余额</div>
              <div class="balance-value available">
                <div class="currency-balance">USD: ${{ formatAmount(customer.balances.USD) }}</div>
                <div class="currency-balance">CNY: ¥{{ formatAmount(customer.balances.CNY) }}</div>
                <div class="currency-balance">EUR: €{{ formatAmount(customer.balances.EUR) }}</div>
              </div>
            </div>
            <div class="balance-item">
              <div class="balance-label">冻结余额</div>
              <div class="balance-value frozen">
                <div class="currency-balance">USD: ${{ formatAmount(customer.frozen_balances.USD) }}</div>
                <div class="currency-balance">CNY: ¥{{ formatAmount(customer.frozen_balances.CNY) }}</div>
                <div class="currency-balance">EUR: €{{ formatAmount(customer.frozen_balances.EUR) }}</div>
              </div>
            </div>
            <div class="balance-item">
              <div class="balance-label">总余额</div>
              <div class="balance-value total">
                <div class="currency-balance">USD: ${{ formatAmount(customer.balances.USD + customer.frozen_balances.USD) }}</div>
                <div class="currency-balance">CNY: ¥{{ formatAmount(customer.balances.CNY + customer.frozen_balances.CNY) }}</div>
                <div class="currency-balance">EUR: €{{ formatAmount(customer.balances.EUR + customer.frozen_balances.EUR) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row" v-if="customer">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon recharge">
              <el-icon><CreditCard /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">
                <div class="currency-balance">USD: ${{ formatAmount(customer.total_recharge.USD) }}</div>
                <div class="currency-balance">CNY: ¥{{ formatAmount(customer.total_recharge.CNY) }}</div>
                <div class="currency-balance">EUR: €{{ formatAmount(customer.total_recharge.EUR) }}</div>
              </div>
              <div class="stats-label">累计充值</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon consumption">
              <el-icon><ShoppingBag /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">
                <div class="currency-balance">USD: ${{ formatAmount(customer.total_consumption.USD) }}</div>
                <div class="currency-balance">CNY: ¥{{ formatAmount(customer.total_consumption.CNY) }}</div>
                <div class="currency-balance">EUR: €{{ formatAmount(customer.total_consumption.EUR) }}</div>
              </div>
              <div class="stats-label">累计消费</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon commission">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">¥{{ formatAmount(customer.total_commission) }}</div>
              <div class="stats-label">累计佣金</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon transactions">
              <el-icon><List /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ customerTransactions.length }}</div>
              <div class="stats-label">交易笔数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交易记录 -->
    <el-card class="transactions-card">
      <template #header>
        <div class="card-header">
          <span>交易记录</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-right: 12px;"
              @change="handleDateChange"
            />
            <el-select
              v-model="filterTransactionType"
              placeholder="交易类型"
              style="width: 120px; margin-right: 12px;"
              clearable
            >
              <el-option label="全部类型" value="" />
              <el-option label="充值" value="recharge" />
              <el-option label="消费" value="consumption" />
              <el-option label="佣金" value="commission" />
              <el-option label="冻结" value="freeze" />
              <el-option label="解冻" value="unfreeze" />
            </el-select>
            <el-button @click="resetTransactionFilters">重置</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedTransactions" style="width: 100%" stripe>
        <el-table-column prop="id" label="交易ID" width="140" />
        <el-table-column label="交易类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTransactionTypeColor(row.type)" size="small">
              {{ getTransactionTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="交易金额" width="180" align="right">
          <template #default="{ row }">
            <div class="transaction-amount">
              <div :class="row.amount > 0 ? 'amount-positive' : 'amount-negative'">
                {{ row.amount > 0 ? '+' : '' }}{{ getCurrencySymbol(row.currency) }}{{ formatAmount(Math.abs(row.amount)) }}
              </div>
              <div class="usd-amount">
                ≈ ${{ formatAmount(Math.abs(row.usd_amount)) }}
              </div>
              <div class="exchange-rate" v-if="row.exchange_rate !== 1">
                汇率: {{ row.exchange_rate }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Edit, Download, CreditCard, ShoppingBag,
  Money, List
} from '@element-plus/icons-vue'
import { customers, balanceTransactions } from '@/data/mockData.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const customer = ref(null)
const dateRange = ref([])
const filterTransactionType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const customerTransactions = computed(() => {
  if (!customer.value) return []
  return balanceTransactions.filter(transaction =>
    transaction.customer_id === customer.value.id
  )
})

const filteredTransactions = computed(() => {
  let filtered = customerTransactions.value

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.created_at)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // 交易类型过滤
  if (filterTransactionType.value) {
    filtered = filtered.filter(transaction =>
      transaction.type === filterTransactionType.value
    )
  }

  return filtered
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTransactions.value.slice(start, end)
})

// 方法
const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getAccountStatusType = (status) => {
  const statusMap = {
    'normal': 'success',
    'frozen': 'danger',
    'restricted': 'warning'
  }
  return statusMap[status] || 'info'
}

const getAccountStatusText = (status) => {
  const statusMap = {
    'normal': '正常',
    'frozen': '冻结',
    'restricted': '限制'
  }
  return statusMap[status] || '未知'
}

const getTransactionTypeColor = (type) => {
  const colorMap = {
    'recharge': 'success',
    'consumption': 'warning',
    'commission': 'primary',
    'freeze': 'danger',
    'unfreeze': 'success'
  }
  return colorMap[type] || 'info'
}

const getTransactionTypeText = (type) => {
  const textMap = {
    'recharge': '充值',
    'consumption': '消费',
    'commission': '佣金',
    'freeze': '冻结',
    'unfreeze': '解冻'
  }
  return textMap[type] || '未知'
}

const goBack = () => {
  router.push('/admin/customer-balance')
}

const showAdjustBalanceDialog = () => {
  ElMessage.info('调整余额功能开发中...')
}

const exportCustomerData = () => {
  ElMessage.info('导出数据功能开发中...')
}

const getCurrencySymbol = (currency) => {
  const symbolMap = {
    'USD': '$',
    'CNY': '¥',
    'EUR': '€'
  }
  return symbolMap[currency] || currency
}

const handleDateChange = () => {
  currentPage.value = 1
}

const resetTransactionFilters = () => {
  dateRange.value = []
  filterTransactionType.value = ''
  currentPage.value = 1
}

// 生命周期
onMounted(() => {
  const customerId = parseInt(route.params.id)
  customer.value = customers.find(c => c.id === customerId)

  if (!customer.value) {
    ElMessage.error('客户不存在')
    router.push('/admin/customer-balance')
  }
})
</script>

<style scoped>
.customer-balance-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info .page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-info .page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 卡片样式 */
.customer-info-card,
.balance-summary-card,
.stats-card,
.transactions-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* 余额概览 */
.balance-summary {
  padding: 16px 0;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-item:last-child {
  margin-bottom: 0;
}

.balance-label {
  font-size: 14px;
  color: #606266;
}

.balance-value {
  font-size: 18px;
  font-weight: 600;
}

.balance-value.available {
  color: #67c23a;
}

.balance-value.frozen {
  color: #f56c6c;
}

.balance-value.total {
  color: #409eff;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stats-icon.recharge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.consumption {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.commission {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.transactions {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.currency-balance {
  font-size: 12px;
  margin-bottom: 2px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

/* 表格样式 */
.transaction-amount {
  text-align: right;
}

.amount-positive {
  color: #67c23a;
  font-weight: 500;
  margin-bottom: 2px;
}

.amount-negative {
  color: #f56c6c;
  font-weight: 500;
  margin-bottom: 2px;
}

.usd-amount {
  font-size: 11px;
  color: #909399;
  margin-bottom: 1px;
}

.exchange-rate {
  font-size: 10px;
  color: #c0c4cc;
}
</style>