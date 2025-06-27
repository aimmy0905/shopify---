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
      <el-col :span="24">
        <el-card class="customer-info-card">
          <template #header>
            <div class="card-header">
              <span>客户信息</span>
              <el-tag :type="getAccountStatusType(customer.account_status)">
                {{ getAccountStatusText(customer.account_status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="客户ID">{{ customer.id }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ customer.name }}</el-descriptions-item>
            <el-descriptions-item label="邮箱地址">{{ customer.email }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ customer.phone }}</el-descriptions-item>
            <el-descriptions-item label="公司名称">{{ customer.company }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ customer.created_at }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="3">{{ customer.address }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计卡片 -->
    <div class="stats-container" v-if="customer">
      <el-card class="stats-card">
        <div class="stats-content">
          <div class="stats-icon balance">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">
              ${{ formatAmount(customer.balances.USD) }}
            </div>
            <div class="stats-label">账户余额</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <div class="stats-content">
          <div class="stats-icon recharge">
            <el-icon><CreditCard /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">
              ${{ formatAmount(customer.total_recharge.USD) }}
            </div>
            <div class="stats-label">累计充值</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <div class="stats-content">
          <div class="stats-icon consumption">
            <el-icon><ShoppingBag /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">
              ${{ formatAmount(customer.total_consumption.USD) }}
            </div>
            <div class="stats-label">累计消费</div>
          </div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <div class="stats-content">
          <div class="stats-icon commission">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-value">${{ formatAmount(customer.total_commission) }}</div>
            <div class="stats-label">累计佣金</div>
          </div>
        </div>
      </el-card>

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
    </div>

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
            <el-button @click="resetTransactionFilters">重置</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="transaction-tabs">
        <!-- 充值记录标签页 -->
        <el-tab-pane label="充值记录" name="recharge">
          <el-table :data="paginatedRechargeRecords" style="width: 100%" stripe>
            <el-table-column prop="created_at" label="充值时间" width="160" />
            <el-table-column label="充值金额" width="120" align="right">
              <template #default="{ row }">
                <div class="amount-positive">
                  ${{ formatAmount(row.usd_amount) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="原始货币" width="120" align="center">
              <template #default="{ row }">
                {{ row.currency }} {{ getCurrencySymbol(row.currency) }}{{ formatAmount(Math.abs(row.amount)) }}
              </template>
            </el-table-column>
            <el-table-column prop="exchange_rate" label="汇率" width="80" align="center" />
            <el-table-column prop="description" label="充值明细" min-width="150" />
            <el-table-column prop="payment_method" label="充值方式" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getPaymentMethodText(row.payment_method) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="充值凭证" width="100" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.voucher_url || row.remark"
                  type="text"
                  size="small"
                  @click="viewVoucher(row.voucher_url || '#')"
                >
                  查看凭证
                </el-button>
                <span v-else class="text-muted">无</span>
              </template>
            </el-table-column>
            <el-table-column label="审核状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getAuditStatusType(row.audit_status || 'approved')" size="small">
                  {{ getAuditStatusText(row.audit_status || 'approved') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="充值状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getTransactionStatusType(row.status)" size="small">
                  {{ getTransactionStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="rechargeCurrentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filteredRechargeRecords.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleRechargePageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 消费记录标签页 -->
        <el-tab-pane label="消费记录" name="consumption">
          <el-table :data="paginatedConsumptionRecords" style="width: 100%" stripe>
            <el-table-column prop="created_at" label="消费时间" width="160" />
            <el-table-column label="消费金额" width="120" align="right">
              <template #default="{ row }">
                <div class="amount-negative">
                  ${{ formatAmount(Math.abs(row.usd_amount)) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="消费类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getConsumptionTypeColor(row.consumption_type || 'shop_order')" size="small">
                  {{ getConsumptionTypeText(row.consumption_type || 'shop_order') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关联订单号" width="140">
              <template #default="{ row }">
                {{ row.order_id || row.transaction_id || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="订单总金额" width="120" align="right">
              <template #default="{ row }">
                ${{ formatAmount(row.order_amount || Math.abs(row.usd_amount)) }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="消费描述" min-width="200" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="consumptionCurrentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filteredConsumptionRecords.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleConsumptionPageChange"
            />
          </div>
        </el-tab-pane>

        <!-- 佣金收入标签页 -->
        <el-tab-pane label="佣金收入" name="commission">
          <el-table :data="paginatedCommissionRecords" style="width: 100%" stripe>
            <el-table-column prop="created_at" label="佣金入账时间" min-width="200" />
            <el-table-column label="佣金金额" min-width="150" align="right">
              <template #default="{ row }">
                <div class="amount-positive">
                  ${{ formatAmount(row.usd_amount) }}
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="commissionCurrentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filteredCommissionRecords.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCommissionPageChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Edit, Download, CreditCard, ShoppingBag,
  Money, List, Wallet
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
const activeTab = ref('recharge')
const rechargeCurrentPage = ref(1)
const consumptionCurrentPage = ref(1)
const commissionCurrentPage = ref(1)

// 计算属性
const customerTransactions = computed(() => {
  if (!customer.value) return []
  return balanceTransactions.filter(transaction =>
    transaction.customer_id === customer.value.id
  )
})



// 充值记录相关计算属性
const rechargeRecords = computed(() => {
  if (!customer.value) return []
  return balanceTransactions.filter(transaction =>
    transaction.customer_id === customer.value.id && transaction.type === 'recharge'
  )
})

const filteredRechargeRecords = computed(() => {
  let filtered = rechargeRecords.value

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.created_at)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  return filtered
})

const paginatedRechargeRecords = computed(() => {
  const start = (rechargeCurrentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRechargeRecords.value.slice(start, end)
})

// 消费记录相关计算属性
const consumptionRecords = computed(() => {
  if (!customer.value) return []
  return balanceTransactions.filter(transaction =>
    transaction.customer_id === customer.value.id && transaction.type === 'consumption'
  )
})

const filteredConsumptionRecords = computed(() => {
  let filtered = consumptionRecords.value

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.created_at)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  return filtered
})

const paginatedConsumptionRecords = computed(() => {
  const start = (consumptionCurrentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredConsumptionRecords.value.slice(start, end)
})

// 佣金记录相关计算属性
const commissionRecords = computed(() => {
  if (!customer.value) return []
  return balanceTransactions.filter(transaction =>
    transaction.customer_id === customer.value.id && transaction.type === 'commission'
  )
})

const filteredCommissionRecords = computed(() => {
  let filtered = commissionRecords.value

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.created_at)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  return filtered
})

const paginatedCommissionRecords = computed(() => {
  const start = (commissionCurrentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCommissionRecords.value.slice(start, end)
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
  rechargeCurrentPage.value = 1
  consumptionCurrentPage.value = 1
  commissionCurrentPage.value = 1
}

// 新增的方法
const getPaymentMethodText = (method) => {
  const methodMap = {
    'alipay': '支付宝',
    'wechat_pay': '微信支付',
    'bank_transfer': '银行转账',
    'paypal': 'PayPal',
    'credit_card': '信用卡'
  }
  return methodMap[method] || method
}

const getAuditStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getAuditStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return statusMap[status] || '未知'
}

const getTransactionStatusType = (status) => {
  const statusMap = {
    'completed': 'success',
    'failed': 'danger',
    'processing': 'warning'
  }
  return statusMap[status] || 'info'
}

const getTransactionStatusText = (status) => {
  const statusMap = {
    'completed': '成功',
    'failed': '失败',
    'processing': '处理中'
  }
  return statusMap[status] || '未知'
}

const getConsumptionTypeColor = (type) => {
  const colorMap = {
    'shop_order': 'primary',
    'purchase_order': 'warning'
  }
  return colorMap[type] || 'info'
}

const getConsumptionTypeText = (type) => {
  const textMap = {
    'shop_order': '店铺订单',
    'purchase_order': '采购订单'
  }
  return textMap[type] || '其他'
}



const viewVoucher = (url) => {
  window.open(url, '_blank')
}

const handleSizeChange = (size) => {
  pageSize.value = size
  rechargeCurrentPage.value = 1
  consumptionCurrentPage.value = 1
  commissionCurrentPage.value = 1
}

const handleRechargePageChange = (page) => {
  rechargeCurrentPage.value = page
}

const handleConsumptionPageChange = (page) => {
  consumptionCurrentPage.value = page
}

const handleCommissionPageChange = (page) => {
  commissionCurrentPage.value = page
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



/* 统计卡片 */
.stats-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stats-container .stats-card {
  flex: 1;
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

.stats-icon.balance {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.recharge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.consumption {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.commission {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon.transactions {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
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

/* 标签页样式 */
.transaction-tabs {
  margin-top: 16px;
}

.transaction-tabs .el-tabs__content {
  padding-top: 16px;
}

/* 用户信息样式 */
.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.text-muted {
  color: #c0c4cc;
  font-size: 12px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>