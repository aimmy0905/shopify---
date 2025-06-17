<template>
  <div class="commission-records-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">佣金明细</h1>
        <p class="page-description">查看所有用户的详细佣金记录和交易明细</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportRecords">
          <el-icon><Download /></el-icon>
          导出明细
        </el-button>
        <el-button @click="refreshRecords">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名称、邮箱或邀请码"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="佣金类型">
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="订单佣金" value="order" />
            <el-option label="推荐奖励" value="referral" />
            <el-option label="奖励佣金" value="bonus" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="结算状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="全部状态" value="" />
            <el-option label="已结算" value="settled" />
            <el-option label="待结算" value="pending" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        
        <el-form-item label="金额范围">
          <el-input
            v-model="searchForm.minAmount"
            placeholder="最小金额"
            style="width: 100px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input
            v-model="searchForm.maxAmount"
            placeholder="最大金额"
            style="width: 100px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="searchRecords">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><List /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ recordsStats.totalRecords.toLocaleString() }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon amount">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ recordsStats.totalAmount.toLocaleString() }}</div>
            <div class="stat-label">总佣金金额</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon settled">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ recordsStats.settledAmount.toLocaleString() }}</div>
            <div class="stat-label">已结算金额</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ recordsStats.pendingAmount.toLocaleString() }}</div>
            <div class="stat-label">待结算金额</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 佣金记录表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">佣金记录列表</span>
          <div class="table-actions">
            <el-button size="small" @click="batchSettle" :disabled="!selectedRecords.length">
              批量结算 ({{ selectedRecords.length }})
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="tableLoading"
        :data="commissionRecords"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="时间" width="180" sortable>
          <template #default="scope">
            {{ scope.row.createdAt }}
          </template>
        </el-table-column>
        
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <div class="user-name">{{ scope.row.userName }}</div>
              <div class="user-email">{{ scope.row.userEmail }}</div>
              <div class="invite-code">{{ scope.row.inviteCode }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="佣金来源" min-width="250">
          <template #default="scope">
            <div class="source-info">
              <div class="source-type">
                <el-tag size="small" :type="getSourceTypeColor(scope.row.sourceType)">
                  {{ getSourceTypeName(scope.row.sourceType) }}
                </el-tag>
              </div>
              <div class="source-detail">{{ scope.row.sourceDetail }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="层级" width="80" align="center">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.level === 1 ? 'success' : 'warning'">
              L{{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="佣金金额" width="120" align="right" sortable>
          <template #default="scope">
            <span class="commission-amount">+${{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag size="small" :type="getStatusColor(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="结算时间" width="180">
          <template #default="scope">
            <span v-if="scope.row.settledAt">{{ scope.row.settledAt }}</span>
            <span v-else class="not-settled">未结算</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button 
              v-if="scope.row.status === 'pending'" 
              size="small" 
              type="primary" 
              @click="settleRecord(scope.row)"
            >
              结算
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalRecords"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadRecords"
          @current-change="loadRecords"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="佣金记录详情" width="600px">
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ selectedRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名称">{{ selectedRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ selectedRecord.userEmail }}</el-descriptions-item>
          <el-descriptions-item label="邀请码">{{ selectedRecord.inviteCode }}</el-descriptions-item>
          <el-descriptions-item label="佣金类型">
            <el-tag :type="getSourceTypeColor(selectedRecord.sourceType)">
              {{ getSourceTypeName(selectedRecord.sourceType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="推荐层级">
            <el-tag :type="selectedRecord.level === 1 ? 'success' : 'warning'">
              L{{ selectedRecord.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="佣金金额">
            <span class="commission-amount">${{ selectedRecord.amount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusColor(selectedRecord.status)">
              {{ getStatusName(selectedRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedRecord.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="结算时间">
            {{ selectedRecord.settledAt || '未结算' }}
          </el-descriptions-item>
          <el-descriptions-item label="来源详情" :span="2">
            {{ selectedRecord.sourceDetail }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button 
          v-if="selectedRecord && selectedRecord.status === 'pending'" 
          type="primary" 
          @click="settleRecord(selectedRecord)"
        >
          立即结算
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, 
  Refresh, 
  Search, 
  List, 
  Money, 
  Check, 
  Clock 
} from '@element-plus/icons-vue'

// 响应式数据
const tableLoading = ref(false)
const detailVisible = ref(false)
const selectedRecord = ref(null)
const selectedRecords = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)
const commissionRecords = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: '',
  dateRange: [],
  minAmount: '',
  maxAmount: ''
})

// 统计数据
const recordsStats = reactive({
  totalRecords: 15420,
  totalAmount: 285600,
  settledAmount: 198420,
  pendingAmount: 87180
})

// 方法
const loadRecords = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟佣金记录数据
    commissionRecords.value = [
      {
        id: 'CR001',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        inviteCode: 'JS001',
        sourceType: 'order',
        sourceDetail: '用户 Alice Johnson 的订单 #ORD001',
        level: 1,
        amount: 25.50,
        status: 'settled',
        createdAt: '2023-11-15 14:30:00',
        settledAt: '2023-12-01 10:00:00'
      },
      {
        id: 'CR002',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        inviteCode: 'SJ002',
        sourceType: 'referral',
        sourceDetail: '推荐用户 Bob Wilson 注册奖励',
        level: 1,
        amount: 50.00,
        status: 'pending',
        createdAt: '2023-11-20 09:15:00',
        settledAt: null
      },
      {
        id: 'CR003',
        userName: 'Mike Wilson',
        userEmail: 'mike@example.com',
        inviteCode: 'MW003',
        sourceType: 'bonus',
        sourceDetail: '月度活跃用户奖励',
        level: 1,
        amount: 100.00,
        status: 'settled',
        createdAt: '2023-11-25 16:45:00',
        settledAt: '2023-12-01 10:00:00'
      }
    ]
    
    totalRecords.value = 156
  } catch (error) {
    console.error('加载佣金记录失败:', error)
    ElMessage.error('加载佣金记录失败')
  } finally {
    tableLoading.value = false
  }
}

const searchRecords = () => {
  currentPage.value = 1
  loadRecords()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    type: '',
    status: '',
    dateRange: [],
    minAmount: '',
    maxAmount: ''
  })
  searchRecords()
}

const refreshRecords = () => {
  loadRecords()
}

const exportRecords = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

const batchSettle = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要结算选中的 ${selectedRecords.value.length} 条记录吗？`,
      '批量结算确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('批量结算功能开发中...')
  } catch {
    // 用户取消
  }
}

const viewDetail = (record) => {
  selectedRecord.value = record
  detailVisible.value = true
}

const settleRecord = async (record) => {
  try {
    await ElMessageBox.confirm(
      `确定要结算用户 ${record.userName} 的佣金 $${record.amount.toFixed(2)} 吗？`,
      '结算确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('结算功能开发中...')
    detailVisible.value = false
  } catch {
    // 用户取消
  }
}

const getSourceTypeColor = (type) => {
  const colorMap = {
    order: 'success',
    referral: 'primary',
    bonus: 'warning'
  }
  return colorMap[type] || 'info'
}

const getSourceTypeName = (type) => {
  const nameMap = {
    order: '订单佣金',
    referral: '推荐奖励',
    bonus: '奖励佣金'
  }
  return nameMap[type] || '其他'
}

const getStatusColor = (status) => {
  const colorMap = {
    settled: 'success',
    pending: 'warning',
    cancelled: 'danger'
  }
  return colorMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    settled: '已结算',
    pending: '待结算',
    cancelled: '已取消'
  }
  return nameMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.commission-records-page {
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

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.amount {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.settled {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
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
}

.table-title {
  font-weight: 600;
  color: #303133;
}

/* 用户信息 */
.user-info {
  line-height: 1.4;
}

.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.invite-code {
  font-size: 12px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

/* 来源信息 */
.source-info {
  line-height: 1.4;
}

.source-type {
  margin-bottom: 4px;
}

.source-detail {
  font-size: 12px;
  color: #606266;
}

/* 佣金金额 */
.commission-amount {
  font-weight: 600;
  color: #67c23a;
}

.not-settled {
  color: #909399;
  font-style: italic;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 记录详情 */
.record-detail {
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-records-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .search-card .el-form {
    flex-direction: column;
  }
  
  .search-card .el-form-item {
    width: 100%;
    margin-bottom: 12px;
  }
}
</style>
