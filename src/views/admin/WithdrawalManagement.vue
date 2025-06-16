<template>
  <div class="withdrawal-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">余额提现管理</h1>
        <p class="page-description">管理客户提现申请，审核提现请求</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="batchApprove" :disabled="selectedRecords.length === 0">
          批量审核通过
        </el-button>
        <el-button :icon="Download" @click="exportWithdrawalData">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ pendingCount }}</div>
                <div class="stats-label">待审核</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon processing">
                <el-icon><Loading /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ processingCount }}</div>
                <div class="stats-label">处理中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon completed">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ completedCount }}</div>
                <div class="stats-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total-amount">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">${{ formatAmount(totalAmount) }}</div>
                <div class="stats-label">今日提现总额</div>
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
            placeholder="搜索客户名称或提现单号"
            :prefix-icon="Search"
            style="width: 250px; margin-right: 15px;"
            clearable
          />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 15px;"
          />
          <el-select
            v-model="filterStatus"
            placeholder="状态筛选"
            style="width: 150px; margin-right: 15px;"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-select
            v-model="filterCurrency"
            placeholder="币种筛选"
            style="width: 120px; margin-right: 15px;"
            clearable
          >
            <el-option label="全部币种" value="" />
            <el-option label="USD" value="USD" />
            <el-option label="CNY" value="CNY" />
            <el-option label="EUR" value="EUR" />
          </el-select>
          <el-select
            v-model="filterMethod"
            placeholder="提现方式"
            style="width: 150px; margin-right: 15px;"
            clearable
          >
            <el-option label="全部方式" value="" />
            <el-option label="银行转账" value="bank_transfer" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat_pay" />
            <el-option label="PayPal" value="paypal" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">搜索</el-button>
        </div>
      </div>
    </el-card>

    <!-- 提现记录表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <span>提现记录列表</span>
          <el-tag type="info" size="small">共 {{ filteredRecords.length }} 条记录</el-tag>
        </div>
        <div class="table-actions">
          <el-button size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        :data="paginatedRecords"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="提现单号" width="140" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column label="提现币种" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.currency }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" width="180" align="right">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="original-amount">{{ row.currency }} {{ formatAmount(row.amount) }}</div>
              <div class="fee-amount">手续费: {{ getCurrencySymbol(row.currency) }}{{ formatAmount(row.fee_amount) }}</div>
              <div class="actual-amount">实际到账: {{ getCurrencySymbol(row.currency) }}{{ formatAmount(row.actual_amount) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apply_time" label="申请时间" width="160" />
        <el-table-column label="提现方式" width="120">
          <template #default="{ row }">
            <span>{{ getWithdrawalMethodText(row.withdrawal_method) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收款信息" width="200">
          <template #default="{ row }">
            <div class="account-info">
              <div class="account-holder">{{ row.account_holder }}</div>
              <div class="account-number">{{ getAccountDisplay(row) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核信息" width="180">
          <template #default="{ row }">
            <div v-if="row.status !== 'pending'" class="audit-info">
              <div class="audit-time">{{ row.review_time }}</div>
              <div class="audit-person">{{ row.reviewer }}</div>
            </div>
            <span v-else class="pending-text">待审核</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewWithdrawalDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="auditWithdrawal(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="warning"
              size="small"
              @click="processWithdrawal(row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredRecords.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 提现详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="提现详情"
      width="800px"
    >
      <div v-if="currentRecord" class="withdrawal-detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="提现单号">{{ currentRecord.id }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ currentRecord.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="提现币种">
              <el-tag size="small">{{ currentRecord.currency }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提现金额">
              {{ getCurrencySymbol(currentRecord.currency) }}{{ formatAmount(currentRecord.amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="手续费">
              {{ getCurrencySymbol(currentRecord.currency) }}{{ formatAmount(currentRecord.fee_amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="实际到账">
              {{ getCurrencySymbol(currentRecord.currency) }}{{ formatAmount(currentRecord.actual_amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRecord.apply_time }}</el-descriptions-item>
            <el-descriptions-item label="提现方式">{{ getWithdrawalMethodText(currentRecord.withdrawal_method) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 收款信息 -->
        <div class="detail-section">
          <h3>收款信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="收款人">{{ currentRecord.account_holder }}</el-descriptions-item>
            <el-descriptions-item label="收款账户">{{ getAccountDisplay(currentRecord) }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.bank_name" label="银行名称">{{ currentRecord.bank_name }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.swift_code" label="SWIFT代码">{{ currentRecord.swift_code }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 状态信息 -->
        <div class="detail-section">
          <h3>状态信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(currentRecord.status)" size="small">
                {{ getStatusText(currentRecord.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.review_time" label="审核时间">{{ currentRecord.review_time }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.reviewer" label="审核人">{{ currentRecord.reviewer }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.processing_time" label="处理时间">{{ currentRecord.processing_time }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.completed_time" label="完成时间">{{ currentRecord.completed_time }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.transaction_id" label="交易ID">{{ currentRecord.transaction_id }}</el-descriptions-item>
            <el-descriptions-item v-if="currentRecord.review_remark" label="备注" :span="2">{{ currentRecord.review_remark }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="currentRecord && currentRecord.status === 'pending'"
            type="success"
            @click="showAuditDialog"
          >
            审核
          </el-button>
          <el-button
            v-if="currentRecord && currentRecord.status === 'approved'"
            type="warning"
            @click="showProcessDialog"
          >
            处理
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提现审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="提现审核"
      width="600px"
    >
      <div v-if="currentRecord" class="audit-dialog-content">
        <!-- 提现信息概要 -->
        <div class="withdrawal-summary">
          <h3>提现信息概要</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户名称">{{ currentRecord.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="提现金额">{{ currentRecord.currency }} {{ formatAmount(currentRecord.amount) }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ currentRecord.apply_time }}</el-descriptions-item>
            <el-descriptions-item label="提现方式">{{ getWithdrawalMethodText(currentRecord.withdrawal_method) }}</el-descriptions-item>
            <el-descriptions-item label="收款账户" :span="2">{{ getAccountDisplay(currentRecord) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 审核操作区 -->
        <div class="audit-section">
          <h3>审核操作</h3>
          <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px">
            <el-form-item label="审核结果" prop="result">
              <el-radio-group v-model="auditForm.result">
                <el-radio label="approved">通过</el-radio>
                <el-radio label="rejected">不通过</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="审核备注"
              prop="remark"
              :rules="auditForm.result === 'rejected' ? [{ required: true, message: '不通过时必须填写备注', trigger: 'blur' }] : []"
            >
              <el-input
                v-model="auditForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入审核备注"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAudit">确认审核</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提现处理弹窗 -->
    <el-dialog
      v-model="processDialogVisible"
      title="提现处理"
      width="600px"
    >
      <div v-if="currentRecord" class="process-dialog-content">
        <!-- 提现信息概要 -->
        <div class="withdrawal-summary">
          <h3>提现信息概要</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户名称">{{ currentRecord.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="提现金额">{{ currentRecord.currency }} {{ formatAmount(currentRecord.amount) }}</el-descriptions-item>
            <el-descriptions-item label="实际到账">{{ getCurrencySymbol(currentRecord.currency) }}{{ formatAmount(currentRecord.actual_amount) }}</el-descriptions-item>
            <el-descriptions-item label="提现方式">{{ getWithdrawalMethodText(currentRecord.withdrawal_method) }}</el-descriptions-item>
            <el-descriptions-item label="收款账户" :span="2">{{ getAccountDisplay(currentRecord) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 处理操作区 -->
        <div class="process-section">
          <h3>处理操作</h3>
          <el-form :model="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
            <el-form-item label="处理状态" prop="status">
              <el-radio-group v-model="processForm.status">
                <el-radio label="processing">开始处理</el-radio>
                <el-radio label="completed">处理完成</el-radio>
                <el-radio label="failed">处理失败</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="processForm.status === 'completed'"
              label="交易ID"
              prop="transactionId"
              :rules="[{ required: true, message: '完成时必须填写交易ID', trigger: 'blur' }]"
            >
              <el-input
                v-model="processForm.transactionId"
                placeholder="请输入银行或支付平台的交易ID"
              />
            </el-form-item>
            <el-form-item label="处理备注" prop="remark">
              <el-input
                v-model="processForm.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入处理备注"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">确认处理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Search, Refresh, Clock, Loading, Check, Money
} from '@element-plus/icons-vue'
import { withdrawalApplications } from '@/data/mockData.js'

// 响应式数据
const searchKeyword = ref('')
const dateRange = ref([])
const filterStatus = ref('')
const filterCurrency = ref('')
const filterMethod = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRecords = ref([])

// 弹窗状态
const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentRecord = ref(null)

// 审核表单
const auditForm = reactive({
  result: 'approved',
  remark: ''
})

const auditRules = {
  result: [{ required: true, message: '请选择审核结果', trigger: 'change' }]
}

// 处理表单
const processForm = reactive({
  status: 'processing',
  transactionId: '',
  remark: ''
})

const processRules = {
  status: [{ required: true, message: '请选择处理状态', trigger: 'change' }]
}

// 表单引用
const auditFormRef = ref(null)
const processFormRef = ref(null)

// 计算属性
const filteredRecords = computed(() => {
  let filtered = withdrawalApplications

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record =>
      record.customer_name.toLowerCase().includes(keyword) ||
      record.id.toLowerCase().includes(keyword)
    )
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.apply_time)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(record => record.status === filterStatus.value)
  }

  // 币种过滤
  if (filterCurrency.value) {
    filtered = filtered.filter(record => record.currency === filterCurrency.value)
  }

  // 提现方式过滤
  if (filterMethod.value) {
    filtered = filtered.filter(record => record.withdrawal_method === filterMethod.value)
  }

  return filtered
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const pendingCount = computed(() =>
  withdrawalApplications.filter(record => record.status === 'pending').length
)

const processingCount = computed(() =>
  withdrawalApplications.filter(record => record.status === 'processing').length
)

const completedCount = computed(() =>
  withdrawalApplications.filter(record => record.status === 'completed').length
)

const totalAmount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return withdrawalApplications
    .filter(record => record.apply_time.startsWith(today))
    .reduce((sum, record) => sum + record.usd_amount, 0)
})

// 方法
const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getCurrencySymbol = (currency) => {
  const symbolMap = {
    'USD': '$',
    'CNY': '¥',
    'EUR': '€'
  }
  return symbolMap[currency] || currency
}

const getWithdrawalMethodText = (method) => {
  const methodMap = {
    'bank_transfer': '银行转账',
    'alipay': '支付宝',
    'wechat_pay': '微信支付',
    'paypal': 'PayPal'
  }
  return methodMap[method] || method
}

const getAccountDisplay = (record) => {
  switch (record.withdrawal_method) {
    case 'bank_transfer':
      return record.account_number || record.bank_name || '-'
    case 'alipay':
      return record.alipay_account || '-'
    case 'wechat_pay':
      return record.wechat_account || '-'
    case 'paypal':
      return record.paypal_account || '-'
    default:
      return '-'
  }
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'approved': 'primary',
    'processing': 'info',
    'completed': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已审核',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return statusMap[status] || '未知'
}

const resetFilters = () => {
  searchKeyword.value = ''
  dateRange.value = []
  filterStatus.value = ''
  filterCurrency.value = ''
  filterMethod.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewWithdrawalDetail = (record) => {
  currentRecord.value = record
  detailDialogVisible.value = true
}

const auditWithdrawal = (record) => {
  currentRecord.value = record
  // 重置表单
  auditForm.result = 'approved'
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const processWithdrawal = (record) => {
  currentRecord.value = record
  // 重置表单
  processForm.status = 'processing'
  processForm.transactionId = ''
  processForm.remark = ''
  processDialogVisible.value = true
}

const showAuditDialog = () => {
  detailDialogVisible.value = false
  auditWithdrawal(currentRecord.value)
}

const showProcessDialog = () => {
  detailDialogVisible.value = false
  processWithdrawal(currentRecord.value)
}

const confirmAudit = async () => {
  if (!auditFormRef.value) return

  try {
    await auditFormRef.value.validate()

    ElMessageBox.confirm(
      `确定要${auditForm.result === 'approved' ? '通过' : '拒绝'}这个提现申请吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 更新记录状态
      const record = withdrawalApplications.find(r => r.id === currentRecord.value.id)
      if (record) {
        record.status = auditForm.result
        record.review_time = new Date().toLocaleString()
        record.reviewer = '当前用户'
        record.review_remark = auditForm.remark

        if (auditForm.result === 'approved') {
          record.status = 'approved'
        } else {
          record.status = 'rejected'
        }
      }

      ElMessage.success('审核完成')
      auditDialogVisible.value = false
      currentRecord.value = null
    })
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const confirmProcess = async () => {
  if (!processFormRef.value) return

  try {
    await processFormRef.value.validate()

    ElMessageBox.confirm(
      `确定要执行这个处理操作吗？`,
      '确认处理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 更新记录状态
      const record = withdrawalApplications.find(r => r.id === currentRecord.value.id)
      if (record) {
        record.status = processForm.status
        record.processing_time = new Date().toLocaleString()
        record.processor = '当前用户'
        record.process_remark = processForm.remark

        if (processForm.status === 'completed') {
          record.completed_time = new Date().toLocaleString()
          record.transaction_id = processForm.transactionId
        }
      }

      ElMessage.success('处理完成')
      processDialogVisible.value = false
      currentRecord.value = null
    })
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const batchApprove = () => {
  ElMessageBox.confirm(
    `确定要批量审核通过选中的 ${selectedRecords.value.length} 条记录吗？`,
    '批量审核',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量审核成功')
    selectedRecords.value = []
    refreshData()
  })
}

const exportWithdrawalData = () => {
  ElMessage.success('提现数据导出功能开发中...')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.withdrawal-management-page {
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
.stats-row {
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

.stats-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.processing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.completed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon.total-amount {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
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
.amount-info {
  text-align: right;
}

.original-amount {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.fee-amount {
  font-size: 11px;
  color: #f56c6c;
  margin-bottom: 1px;
}

.actual-amount {
  font-size: 11px;
  color: #67c23a;
}

.account-info {
  line-height: 1.4;
}

.account-holder {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.account-number {
  font-size: 12px;
  color: #909399;
}

.audit-info {
  line-height: 1.4;
}

.audit-time {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.audit-person {
  font-size: 12px;
  color: #909399;
}

.pending-text {
  color: #e6a23c;
  font-size: 13px;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 弹窗样式 */
.withdrawal-detail-content,
.audit-dialog-content,
.process-dialog-content {
  padding: 0;
}

.detail-section,
.withdrawal-summary,
.audit-section,
.process-section {
  margin-bottom: 24px;
}

.detail-section h3,
.withdrawal-summary h3,
.audit-section h3,
.process-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 描述列表样式优化 */
:deep(.el-descriptions__body) {
  background: #fafafa;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  background: #f5f7fa !important;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 表单样式 */
.audit-section .el-form,
.process-section .el-form {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
</style>