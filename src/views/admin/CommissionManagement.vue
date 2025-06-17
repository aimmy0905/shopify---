<template>
  <div class="commission-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">佣金管理</h1>
        <p class="page-description">管理平台分佣体系和佣金结算</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="success" @click="batchSettlement">
          <el-icon><Money /></el-icon>
          批量结算
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ totalCommission.toLocaleString() }}</div>
            <div class="stat-label">累计佣金总额</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon settled">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ settledCommission.toLocaleString() }}</div>
            <div class="stat-label">已结算佣金</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ pendingCommission.toLocaleString() }}</div>
            <div class="stat-label">待结算佣金</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon monthly">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ monthlyCommission.toLocaleString() }}</div>
            <div class="stat-label">本月佣金</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 标签页内容 -->
    <el-card class="main-content">
      <el-tabs v-model="activeTab" class="commission-tabs">
        <!-- 推荐人管理 -->
        <el-tab-pane label="推荐人管理" name="referrers">
          <div class="tab-content">
            <!-- 搜索筛选区 -->
            <div class="search-filters">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-input
                    v-model="referrerFilters.search"
                    placeholder="搜索推荐人名称或账号"
                    clearable
                    @input="handleReferrerSearch"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="referrerFilters.status" placeholder="状态筛选" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="正常" value="active" />
                    <el-option label="禁用" value="disabled" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-date-picker
                    v-model="referrerFilters.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-col>
                <el-col :span="8">
                  <el-button type="primary" @click="searchReferrers">搜索</el-button>
                  <el-button @click="resetReferrerFilters">重置</el-button>
                  <el-button type="success" @click="batchSettleReferrers" :disabled="!selectedReferrers.length">
                    批量结算 ({{ selectedReferrers.length }})
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 推荐人列表 -->
            <el-table
              v-loading="referrersLoading"
              :data="referrersList"
              border
              @selection-change="handleReferrerSelection"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column label="推荐人信息" min-width="200">
                <template #default="scope">
                  <div class="user-info">
                    <div class="user-name">{{ scope.row.name }}</div>
                    <div class="user-email">{{ scope.row.email }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="inviteCode" label="邀请码" width="120" />
              <el-table-column label="邀请用户数" width="120">
                <template #default="scope">
                  <el-button type="text" @click="viewReferrals(scope.row)">
                    {{ scope.row.totalReferrals }}人
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="佣金总额" width="120">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.totalCommission.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="已结算" width="120">
                <template #default="scope">
                  <span class="amount-text settled">${{ scope.row.settledCommission.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="待结算" width="120">
                <template #default="scope">
                  <span class="amount-text pending">${{ scope.row.pendingCommission.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="joinTime" label="加入时间" width="180" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewReferrerDetail(scope.row)">查看详情</el-button>
                  <el-button size="small" type="primary" @click="viewCommissionRecords(scope.row)">佣金记录</el-button>
                  <el-button 
                    size="small" 
                    type="success" 
                    @click="settleCommission(scope.row)"
                    :disabled="scope.row.pendingCommission <= 0"
                  >
                    手动结算
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="referrerPagination.currentPage"
                v-model:page-size="referrerPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="referrerPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleReferrerSizeChange"
                @current-change="handleReferrerCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 结算记录 -->
        <el-tab-pane label="结算记录" name="settlements">
          <div class="tab-content">
            <!-- 搜索筛选区 -->
            <div class="search-filters">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-input
                    v-model="settlementFilters.search"
                    placeholder="搜索用户名称"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="6">
                  <el-date-picker
                    v-model="settlementFilters.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-col>
                <el-col :span="6">
                  <el-input-number
                    v-model="settlementFilters.minAmount"
                    placeholder="最小金额"
                    :min="0"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="6">
                  <el-button type="primary" @click="searchSettlements">搜索</el-button>
                  <el-button @click="resetSettlementFilters">重置</el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 结算记录列表 -->
            <el-table
              v-loading="settlementsLoading"
              :data="settlementsList"
              border
            >
              <el-table-column prop="id" label="结算ID" width="100" />
              <el-table-column label="用户信息" min-width="200">
                <template #default="scope">
                  <div class="user-info">
                    <div class="user-name">{{ scope.row.userName }}</div>
                    <div class="user-email">{{ scope.row.userEmail }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="settlementTime" label="结算时间" width="180" />
              <el-table-column prop="settlementPeriod" label="结算周期" width="120" />
              <el-table-column label="结算金额" width="120">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结算前余额" width="120">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.balanceBefore.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结算后余额" width="120">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.balanceAfter.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" min-width="150" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewSettlementDetail(scope.row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="settlementPagination.currentPage"
                v-model:page-size="settlementPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="settlementPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSettlementSizeChange"
                @current-change="handleSettlementCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 佣金规则 -->
        <el-tab-pane label="佣金规则" name="rules">
          <div class="tab-content">
            <commission-rules @save="handleRulesSave" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, 
  Money, 
  PieChart, 
  CircleCheck, 
  Clock, 
  Calendar,
  Search
} from '@element-plus/icons-vue'
import CommissionRules from './components/CommissionRules.vue'

// 响应式数据
const activeTab = ref('referrers')

// 统计数据
const totalCommission = ref(125680.50)
const settledCommission = ref(89420.30)
const pendingCommission = ref(36260.20)
const monthlyCommission = ref(12580.75)

// 推荐人管理相关
const referrersLoading = ref(false)
const referrersList = ref([])
const selectedReferrers = ref([])
const referrerFilters = reactive({
  search: '',
  status: '',
  dateRange: []
})
const referrerPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 结算记录相关
const settlementsLoading = ref(false)
const settlementsList = ref([])
const settlementFilters = reactive({
  search: '',
  dateRange: [],
  minAmount: null
})
const settlementPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 推荐人管理方法
const handleReferrerSearch = () => {
  // 实时搜索逻辑
  searchReferrers()
}

const searchReferrers = () => {
  referrerPagination.currentPage = 1
  loadReferrersList()
}

const resetReferrerFilters = () => {
  referrerFilters.search = ''
  referrerFilters.status = ''
  referrerFilters.dateRange = []
  searchReferrers()
}

const handleReferrerSelection = (selection) => {
  selectedReferrers.value = selection
}

const handleReferrerSizeChange = (size) => {
  referrerPagination.pageSize = size
  loadReferrersList()
}

const handleReferrerCurrentChange = (page) => {
  referrerPagination.currentPage = page
  loadReferrersList()
}

const loadReferrersList = async () => {
  referrersLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    referrersList.value = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@example.com',
        inviteCode: 'JS001',
        totalReferrals: 25,
        totalCommission: 2580.50,
        settledCommission: 1850.30,
        pendingCommission: 730.20,
        status: 'active',
        joinTime: '2023-01-15 10:30:00'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        inviteCode: 'SJ002',
        totalReferrals: 18,
        totalCommission: 1920.75,
        settledCommission: 1200.50,
        pendingCommission: 720.25,
        status: 'active',
        joinTime: '2023-02-20 14:15:00'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.w@example.com',
        inviteCode: 'MW003',
        totalReferrals: 32,
        totalCommission: 3250.80,
        settledCommission: 2100.60,
        pendingCommission: 1150.20,
        status: 'active',
        joinTime: '2023-01-08 09:45:00'
      }
    ]

    referrerPagination.total = 156
  } catch (error) {
    console.error('加载推荐人列表失败:', error)
    ElMessage.error('加载推荐人列表失败')
  } finally {
    referrersLoading.value = false
  }
}

// 结算记录方法
const searchSettlements = () => {
  settlementPagination.currentPage = 1
  loadSettlementsList()
}

const resetSettlementFilters = () => {
  settlementFilters.search = ''
  settlementFilters.dateRange = []
  settlementFilters.minAmount = null
  searchSettlements()
}

const handleSettlementSizeChange = (size) => {
  settlementPagination.pageSize = size
  loadSettlementsList()
}

const handleSettlementCurrentChange = (page) => {
  settlementPagination.currentPage = page
  loadSettlementsList()
}

const loadSettlementsList = async () => {
  settlementsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    settlementsList.value = [
      {
        id: 'ST001',
        userName: 'John Smith',
        userEmail: 'john.smith@example.com',
        settlementTime: '2023-12-01 10:00:00',
        settlementPeriod: '2023年11月',
        amount: 850.30,
        balanceBefore: 1200.50,
        balanceAfter: 2050.80,
        remark: '月度自动结算'
      },
      {
        id: 'ST002',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.j@example.com',
        settlementTime: '2023-12-01 10:05:00',
        settlementPeriod: '2023年11月',
        amount: 620.75,
        balanceBefore: 980.25,
        balanceAfter: 1601.00,
        remark: '月度自动结算'
      }
    ]

    settlementPagination.total = 89
  } catch (error) {
    console.error('加载结算记录失败:', error)
    ElMessage.error('加载结算记录失败')
  } finally {
    settlementsLoading.value = false
  }
}

// 操作方法
const exportData = () => {
  ElMessage.success('数据导出功能开发中...')
}

const batchSettlement = () => {
  ElMessageBox.confirm(
    '确定要执行批量结算吗？这将结算所有符合条件的待结算佣金。',
    '批量结算确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量结算已启动，请稍后查看结果')
  }).catch(() => {
    ElMessage.info('已取消批量结算')
  })
}

const batchSettleReferrers = () => {
  if (selectedReferrers.value.length === 0) {
    ElMessage.warning('请选择要结算的推荐人')
    return
  }

  ElMessageBox.confirm(
    `确定要为选中的 ${selectedReferrers.value.length} 个推荐人进行佣金结算吗？`,
    '批量结算确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('批量结算已启动')
    selectedReferrers.value = []
    loadReferrersList()
  }).catch(() => {
    ElMessage.info('已取消批量结算')
  })
}

const viewReferrals = (referrer) => {
  ElMessage.info(`查看 ${referrer.name} 的下级用户`)
}

const viewReferrerDetail = (referrer) => {
  ElMessage.info(`查看 ${referrer.name} 的详细信息`)
}

const viewCommissionRecords = (referrer) => {
  ElMessage.info(`查看 ${referrer.name} 的佣金记录`)
}

const settleCommission = (referrer) => {
  ElMessageBox.confirm(
    `确定要为 ${referrer.name} 结算 $${referrer.pendingCommission.toFixed(2)} 的待结算佣金吗？`,
    '手动结算确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('佣金结算成功')
    loadReferrersList()
  }).catch(() => {
    ElMessage.info('已取消结算')
  })
}

const viewSettlementDetail = (settlement) => {
  ElMessage.info(`查看结算记录 ${settlement.id} 的详细信息`)
}

const handleRulesSave = (rules) => {
  ElMessage.success('佣金规则保存成功')
}

// 生命周期
onMounted(() => {
  loadReferrersList()
  loadSettlementsList()
})
</script>

<style scoped>
.commission-management-page {
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.stat-icon.settled {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.monthly {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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

/* 主要内容 */
.main-content {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.commission-tabs {
  min-height: 600px;
}

.tab-content {
  padding: 20px 0;
}

/* 搜索筛选区 */
.search-filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
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
}

/* 金额文本 */
.amount-text {
  font-weight: 500;
  color: #303133;
}

.amount-text.settled {
  color: #67c23a;
}

.amount-text.pending {
  color: #e6a23c;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-management-page {
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

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .search-filters .el-row {
    flex-direction: column;
  }

  .search-filters .el-col {
    width: 100% !important;
    margin-bottom: 12px;
  }
}
</style>
