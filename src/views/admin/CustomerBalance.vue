<template>
  <div class="customer-balance-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">客户余额管理</h1>
        <p class="page-description">管理客户账户余额，查看交易记录和资金流水</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="showAdjustBalanceDialog">
          调整余额
        </el-button>
        <el-button :icon="Download" @click="exportBalanceData">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total-customers">
                <el-icon><User /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ totalCustomers }}</div>
                <div class="stats-label">总客户数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total-balance">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">
                  <div class="currency-balance">${{ formatAmount(totalBalance.USD) }}</div>
                  <div class="currency-balance">¥{{ formatAmount(totalBalance.CNY) }}</div>
                  <div class="currency-balance">€{{ formatAmount(totalBalance.EUR) }}</div>
                </div>
                <div class="stats-label">总余额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon frozen-balance">
                <el-icon><Lock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">
                  <div class="currency-balance">${{ formatAmount(totalFrozenBalance.USD) }}</div>
                  <div class="currency-balance">¥{{ formatAmount(totalFrozenBalance.CNY) }}</div>
                  <div class="currency-balance">€{{ formatAmount(totalFrozenBalance.EUR) }}</div>
                </div>
                <div class="stats-label">冻结余额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon today-transactions">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ todayTransactions }}</div>
                <div class="stats-label">今日交易</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <div class="filter-container">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索客户名称、邮箱、公司"
            :prefix-icon="Search"
            style="width: 300px; margin-right: 15px;"
            clearable
          />
          <el-select
            v-model="filterStatus"
            placeholder="账户状态"
            style="width: 150px; margin-right: 15px;"
            clearable
          >
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="冻结" value="frozen" />
            <el-option label="限制" value="restricted" />
          </el-select>
          <el-select
            v-model="filterBalanceRange"
            placeholder="余额范围"
            style="width: 150px; margin-right: 15px;"
            clearable
          >
            <el-option label="全部余额" value="" />
            <el-option label="0-1000" value="0-1000" />
            <el-option label="1000-5000" value="1000-5000" />
            <el-option label="5000-10000" value="5000-10000" />
            <el-option label="10000以上" value="10000+" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">搜索</el-button>
        </div>
      </div>
    </el-card>

    <!-- 客户余额表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <span>客户余额列表</span>
          <el-tag type="info" size="small">共 {{ filteredCustomers.length }} 条记录</el-tag>
        </div>
        <div class="table-actions">
          <el-button size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        :data="paginatedCustomers"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="客户ID" width="80" />
        <el-table-column label="客户信息" min-width="200">
          <template #default="{ row }">
            <div class="customer-info">
              <div class="customer-name">{{ row.name }}</div>
              <div class="customer-email">{{ row.email }}</div>
              <div class="customer-company">{{ row.company }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column label="账户余额" width="180" align="right">
          <template #default="{ row }">
            <div class="balance-info">
              <div class="currency-balances">
                <div class="currency-item">USD: ${{ formatAmount(row.balances.USD) }}</div>
                <div class="currency-item">CNY: ¥{{ formatAmount(row.balances.CNY) }}</div>
                <div class="currency-item">EUR: €{{ formatAmount(row.balances.EUR) }}</div>
              </div>
              <div class="frozen-balance" v-if="getTotalFrozenBalance(row) > 0">
                冻结: ${{ formatAmount(getTotalFrozenBalance(row)) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="账户状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAccountStatusType(row.account_status)" size="small">
              {{ getAccountStatusText(row.account_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="累计充值" width="150" align="right">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="currency-item">USD: ${{ formatAmount(row.total_recharge.USD) }}</div>
              <div class="currency-item">CNY: ¥{{ formatAmount(row.total_recharge.CNY) }}</div>
              <div class="currency-item">EUR: €{{ formatAmount(row.total_recharge.EUR) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="累计消费" width="150" align="right">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="currency-item">USD: ${{ formatAmount(row.total_consumption.USD) }}</div>
              <div class="currency-item">CNY: ¥{{ formatAmount(row.total_consumption.CNY) }}</div>
              <div class="currency-item">EUR: €{{ formatAmount(row.total_consumption.EUR) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后交易" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ row.last_transaction_at }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewCustomerDetail(row)">
              查看详情
            </el-button>
            <el-dropdown @command="handleCustomerAction">
              <el-button size="small" type="text">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'adjust', customer: row}">
                    调整余额
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'freeze', customer: row}" v-if="row.account_status === 'normal'">
                    冻结账户
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'unfreeze', customer: row}" v-if="row.account_status === 'frozen'">
                    解冻账户
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'transactions', customer: row}">
                    交易记录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredCustomers.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 调整余额弹窗 -->
    <el-dialog
      v-model="adjustBalanceDialogVisible"
      title="调整客户余额"
      width="500px"
    >
      <el-form :model="adjustBalanceForm" :rules="adjustBalanceRules" ref="adjustBalanceFormRef" label-width="100px">
        <el-form-item label="客户信息">
          <div class="customer-select-info" v-if="adjustBalanceForm.customer_id">
            <div class="customer-name">{{ adjustBalanceForm.customer_name }}</div>
            <div class="customer-email">{{ adjustBalanceForm.customer_email }}</div>
            <div class="current-balance">当前余额: ¥{{ formatAmount(adjustBalanceForm.current_balance) }}</div>
          </div>
          <el-select
            v-else
            v-model="adjustBalanceForm.customer_id"
            placeholder="请选择客户"
            style="width: 100%"
            filterable
            @change="handleCustomerSelect"
          >
            <el-option
              v-for="customer in customers"
              :key="customer.id"
              :label="`${customer.name} (${customer.email})`"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调整类型" prop="adjust_type">
          <el-radio-group v-model="adjustBalanceForm.adjust_type">
            <el-radio label="increase">增加余额</el-radio>
            <el-radio label="decrease">减少余额</el-radio>
            <el-radio label="freeze">冻结余额</el-radio>
            <el-radio label="unfreeze">解冻余额</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整金额" prop="amount" v-if="['increase', 'decrease'].includes(adjustBalanceForm.adjust_type)">
          <el-input-number
            v-model="adjustBalanceForm.amount"
            :min="0.01"
            :max="100000"
            :precision="2"
            style="width: 100%"
            placeholder="请输入调整金额"
          />
        </el-form-item>
        <el-form-item label="冻结金额" prop="freeze_amount" v-if="adjustBalanceForm.adjust_type === 'freeze'">
          <el-input-number
            v-model="adjustBalanceForm.freeze_amount"
            :min="0.01"
            :max="adjustBalanceForm.current_balance"
            :precision="2"
            style="width: 100%"
            placeholder="请输入冻结金额"
          />
        </el-form-item>
        <el-form-item label="解冻金额" prop="unfreeze_amount" v-if="adjustBalanceForm.adjust_type === 'unfreeze'">
          <el-input-number
            v-model="adjustBalanceForm.unfreeze_amount"
            :min="0.01"
            :max="adjustBalanceForm.frozen_balance"
            :precision="2"
            style="width: 100%"
            placeholder="请输入解冻金额"
          />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input
            v-model="adjustBalanceForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustBalanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdjustBalance">确认调整</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Download, User, Money, Lock, TrendCharts,
  Search, Refresh, ArrowDown
} from '@element-plus/icons-vue'
import { customers, balanceTransactions } from '@/data/mockData.js'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const filterBalanceRange = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedCustomers = ref([])

// 调整余额弹窗
const adjustBalanceDialogVisible = ref(false)
const adjustBalanceFormRef = ref(null)
const adjustBalanceForm = reactive({
  customer_id: null,
  customer_name: '',
  customer_email: '',
  current_balance: 0,
  frozen_balance: 0,
  adjust_type: 'increase',
  amount: null,
  freeze_amount: null,
  unfreeze_amount: null,
  reason: ''
})

// 表单验证规则
const adjustBalanceRules = {
  adjust_type: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入调整金额', trigger: 'blur' }
  ],
  freeze_amount: [
    { required: true, message: '请输入冻结金额', trigger: 'blur' }
  ],
  unfreeze_amount: [
    { required: true, message: '请输入解冻金额', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ]
}

// 计算属性
const totalCustomers = computed(() => customers.length)
const totalBalance = computed(() => {
  const totals = { USD: 0, CNY: 0, EUR: 0 }
  customers.forEach(customer => {
    Object.keys(customer.balances).forEach(currency => {
      totals[currency] += customer.balances[currency]
    })
  })
  return totals
})
const totalFrozenBalance = computed(() => {
  const totals = { USD: 0, CNY: 0, EUR: 0 }
  customers.forEach(customer => {
    Object.keys(customer.frozen_balances).forEach(currency => {
      totals[currency] += customer.frozen_balances[currency]
    })
  })
  return totals
})
const todayTransactions = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return balanceTransactions.filter(transaction =>
    transaction.created_at.startsWith(today)
  ).length
})

const filteredCustomers = computed(() => {
  let filtered = customers

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(customer =>
      customer.name.toLowerCase().includes(keyword) ||
      customer.email.toLowerCase().includes(keyword) ||
      customer.company.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(customer => customer.account_status === filterStatus.value)
  }

  // 余额范围过滤
  if (filterBalanceRange.value) {
    filtered = filtered.filter(customer => {
      const balance = customer.balance
      switch (filterBalanceRange.value) {
        case '0-1000':
          return balance >= 0 && balance <= 1000
        case '1000-5000':
          return balance > 1000 && balance <= 5000
        case '5000-10000':
          return balance > 5000 && balance <= 10000
        case '10000+':
          return balance > 10000
        default:
          return true
      }
    })
  }

  return filtered
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCustomers.value.slice(start, end)
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

const getTotalFrozenBalance = (customer) => {
  return Object.values(customer.frozen_balances).reduce((sum, balance) => sum + balance, 0)
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterBalanceRange.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const handleSelectionChange = (selection) => {
  selectedCustomers.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewCustomerDetail = (customer) => {
  router.push(`/admin/customer-balance/${customer.id}`)
}

const handleCustomerAction = ({ action, customer }) => {
  switch (action) {
    case 'adjust':
      showAdjustBalanceDialog(customer)
      break
    case 'freeze':
      freezeCustomerAccount(customer)
      break
    case 'unfreeze':
      unfreezeCustomerAccount(customer)
      break
    case 'transactions':
      viewCustomerTransactions(customer)
      break
  }
}

const showAdjustBalanceDialog = (customer = null) => {
  if (customer) {
    Object.assign(adjustBalanceForm, {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      current_balance: customer.balance,
      frozen_balance: customer.frozen_balance,
      adjust_type: 'increase',
      amount: null,
      freeze_amount: null,
      unfreeze_amount: null,
      reason: ''
    })
  } else {
    Object.assign(adjustBalanceForm, {
      customer_id: null,
      customer_name: '',
      customer_email: '',
      current_balance: 0,
      frozen_balance: 0,
      adjust_type: 'increase',
      amount: null,
      freeze_amount: null,
      unfreeze_amount: null,
      reason: ''
    })
  }
  adjustBalanceDialogVisible.value = true
}

const handleCustomerSelect = (customerId) => {
  const customer = customers.find(c => c.id === customerId)
  if (customer) {
    adjustBalanceForm.customer_name = customer.name
    adjustBalanceForm.customer_email = customer.email
    adjustBalanceForm.current_balance = customer.balance
    adjustBalanceForm.frozen_balance = customer.frozen_balance
  }
}

const confirmAdjustBalance = async () => {
  if (!adjustBalanceFormRef.value) return

  try {
    await adjustBalanceFormRef.value.validate()

    // 模拟调整余额操作
    const { adjust_type, amount, freeze_amount, unfreeze_amount, reason } = adjustBalanceForm
    let message = ''

    switch (adjust_type) {
      case 'increase':
        message = `成功为客户增加余额 ¥${formatAmount(amount)}`
        break
      case 'decrease':
        message = `成功为客户减少余额 ¥${formatAmount(amount)}`
        break
      case 'freeze':
        message = `成功冻结客户余额 ¥${formatAmount(freeze_amount)}`
        break
      case 'unfreeze':
        message = `成功解冻客户余额 ¥${formatAmount(unfreeze_amount)}`
        break
    }

    ElMessage.success(message)
    adjustBalanceDialogVisible.value = false
    refreshData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const freezeCustomerAccount = (customer) => {
  ElMessageBox.confirm(
    `确定要冻结客户 "${customer.name}" 的账户吗？`,
    '冻结账户',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('账户已冻结')
    refreshData()
  })
}

const unfreezeCustomerAccount = (customer) => {
  ElMessageBox.confirm(
    `确定要解冻客户 "${customer.name}" 的账户吗？`,
    '解冻账户',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('账户已解冻')
    refreshData()
  })
}

const viewCustomerTransactions = (customer) => {
  router.push(`/admin/customer-balance/${customer.id}?tab=transactions`)
}

const exportBalanceData = () => {
  ElMessage.success('余额数据导出功能开发中...')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.customer-balance-page {
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

.header-left .page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left .page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-cards {
  margin-bottom: 20px;
}

.stats-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.stats-icon.total-customers {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.total-balance {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.frozen-balance {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.today-transactions {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.currency-balance {
  font-size: 14px;
  margin-bottom: 2px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 12px;
}

/* 表格卡片 */
.table-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-actions {
  display: flex;
  gap: 8px;
}

/* 表格内容样式 */
.customer-info {
  line-height: 1.4;
}

.customer-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.customer-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.customer-company {
  font-size: 12px;
  color: #606266;
}

.balance-info {
  text-align: right;
}

.currency-balances {
  margin-bottom: 4px;
}

.currency-item {
  font-size: 12px;
  color: #606266;
  margin-bottom: 1px;
  font-weight: 500;
}

.amount-info .currency-item {
  font-size: 11px;
  color: #909399;
}

.frozen-balance {
  font-size: 11px;
  color: #f56c6c;
}

.amount-text {
  color: #606266;
  font-weight: 500;
}

.time-text {
  color: #909399;
  font-size: 13px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 弹窗样式 */
.customer-select-info {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

.customer-select-info .customer-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.customer-select-info .customer-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.customer-select-info .current-balance {
  font-size: 14px;
  color: #67c23a;
  font-weight: 500;
}
</style>