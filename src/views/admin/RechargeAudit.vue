<template>
  <div class="recharge-audit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">充值审核管理</h1>
        <p class="page-description">审核客户充值申请，管理充值记录</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="batchApprove" :disabled="selectedRecords.length === 0">
          批量审核通过
        </el-button>
        <el-button :icon="Download" @click="exportRechargeData">
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <div class="filter-container">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索客户名称"
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
        </div>
        <div class="filter-right">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">搜索</el-button>
        </div>
      </div>
    </el-card>

    <!-- 充值记录表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <span>充值记录列表</span>
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
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column label="充值币种" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.currency }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="充值金额" width="150" align="right">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="original-amount">{{ row.currency }} {{ formatAmount(row.amount) }}</div>
              <div class="usd-amount">≈ ${{ formatAmount(row.usd_amount) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apply_time" label="充值时间" width="160" />
        <el-table-column prop="payment_method" label="充值方式" width="120">
          <template #default="{ row }">
            <span>{{ getPaymentMethodText(row.payment_method) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收款账户" width="150">
          <template #default="{ row }">
            <span class="account-info">{{ row.payment_account }}</span>
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
            <el-button type="primary" size="small" @click="viewRechargeDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="auditRecharge(row)"
            >
              审核
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

    <!-- 充值审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="充值审核"
      width="600px"
    >
      <div v-if="currentRecord" class="audit-dialog-content">
        <!-- 充值信息概要 -->
        <div class="recharge-summary">
          <h3>充值信息概要</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户名称">{{ currentRecord.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="充值金额">{{ currentRecord.currency }} {{ formatAmount(currentRecord.amount) }}</el-descriptions-item>
            <el-descriptions-item label="充值时间">{{ currentRecord.apply_time }}</el-descriptions-item>
            <el-descriptions-item label="充值方式">{{ getPaymentMethodText(currentRecord.payment_method) }}</el-descriptions-item>
            <el-descriptions-item label="收款账户" :span="2">{{ currentRecord.payment_account }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 凭证图片查看区 -->
        <div class="voucher-section">
          <h3>充值凭证</h3>
          <div class="voucher-image">
            <el-image
              :src="currentRecord.voucher_url"
              fit="contain"
              style="width: 100%; height: 200px;"
              :preview-src-list="[currentRecord.voucher_url]"
            />
          </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Search, Refresh, Plus
} from '@element-plus/icons-vue'
import { rechargeApplications } from '@/data/mockData.js'

// 响应式数据
const searchKeyword = ref('')
const dateRange = ref([])
const filterStatus = ref('')
const filterCurrency = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRecords = ref([])

// 审核弹窗
const auditDialogVisible = ref(false)
const currentRecord = ref(null)
const auditFormRef = ref(null)
const auditForm = reactive({
  result: 'approved',
  remark: ''
})

const auditRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ]
}

// 计算属性
const filteredRecords = computed(() => {
  let filtered = rechargeApplications

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record =>
      record.customer_name.toLowerCase().includes(keyword)
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

  return filtered
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 方法
const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    'alipay': '支付宝',
    'wechat_pay': '微信支付',
    'bank_transfer': '银行转账'
  }
  return methodMap[method] || method
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待审核',
    'approved': '已审核',
    'rejected': '已拒绝'
  }
  return statusMap[status] || '未知'
}

const resetFilters = () => {
  searchKeyword.value = ''
  dateRange.value = []
  filterStatus.value = ''
  filterCurrency.value = ''
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

const viewRechargeDetail = (record) => {
  ElMessage.info('查看充值详情功能开发中...')
}

const auditRecharge = (record) => {
  currentRecord.value = record
  auditForm.result = 'approved'
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const confirmAudit = async () => {
  if (!auditFormRef.value) return

  try {
    await auditFormRef.value.validate()

    const resultText = auditForm.result === 'approved' ? '通过' : '拒绝'
    ElMessage.success(`充值申请已${resultText}`)
    auditDialogVisible.value = false
    refreshData()
  } catch (error) {
    console.error('表单验证失败:', error)
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

const exportRechargeData = () => {
  ElMessage.success('充值数据导出功能开发中...')
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.recharge-audit-page {
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

.usd-amount {
  font-size: 12px;
  color: #909399;
}

.account-info {
  color: #606266;
  font-size: 13px;
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
.audit-dialog-content h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.recharge-summary {
  margin-bottom: 24px;
}

.voucher-section {
  margin-bottom: 24px;
}

.voucher-image {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.audit-section {
  margin-bottom: 16px;
}
</style>