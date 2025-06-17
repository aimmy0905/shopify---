<template>
  <div class="referral-tree-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">推荐关系树</h1>
        <p class="page-description">查看用户推荐关系和分佣层级结构</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportTree">
          <el-icon><Download /></el-icon>
          导出关系图
        </el-button>
        <el-button @click="refreshTree">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名称、邮箱或邀请码"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.level" placeholder="选择层级" clearable>
            <el-option label="全部层级" value="" />
            <el-option label="顶级用户" value="0" />
            <el-option label="一级推荐" value="1" />
            <el-option label="二级推荐" value="2" />
            <el-option label="三级推荐" value="3" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="非活跃" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="注册开始日期"
            end-placeholder="注册结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="searchTree">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计信息 -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ treeStats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ treeStats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon commission">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ treeStats.totalCommission.toLocaleString() }}</div>
            <div class="stat-label">总佣金</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon levels">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ treeStats.maxLevel }}</div>
            <div class="stat-label">最大层级</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 关系树视图 -->
    <el-card class="tree-card">
      <template #header>
        <div class="tree-header">
          <span>推荐关系树</span>
          <div class="view-controls">
            <el-radio-group v-model="viewMode" @change="handleViewModeChange">
              <el-radio-button label="tree">树形视图</el-radio-button>
              <el-radio-button label="table">表格视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 树形视图 -->
      <div v-if="viewMode === 'tree'" class="tree-view" v-loading="treeLoading">
        <div class="tree-container">
          <div v-for="rootUser in treeData" :key="rootUser.id" class="root-node">
            <tree-node 
              :node="rootUser" 
              :level="0"
              @node-click="handleNodeClick"
              @show-commission="showCommissionDetail"
            />
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-else class="table-view">
        <el-table
          v-loading="treeLoading"
          :data="flatTreeData"
          border
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column label="用户信息" min-width="250">
            <template #default="scope">
              <div class="user-cell">
                <div class="level-indicator" :class="`level-${scope.row.level}`">
                  L{{ scope.row.level }}
                </div>
                <div class="user-info">
                  <div class="user-name">{{ scope.row.name }}</div>
                  <div class="user-email">{{ scope.row.email }}</div>
                  <div class="invite-code">邀请码: {{ scope.row.inviteCode }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="推荐人" width="180">
            <template #default="scope">
              <div v-if="scope.row.referrer" class="referrer-info">
                <div class="referrer-name">{{ scope.row.referrer.name }}</div>
                <div class="referrer-code">{{ scope.row.referrer.inviteCode }}</div>
              </div>
              <span v-else class="no-referrer">顶级用户</span>
            </template>
          </el-table-column>
          <el-table-column label="下级数量" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.directReferrals > 0 ? 'success' : 'info'">
                {{ scope.row.directReferrals }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="累计佣金" width="120" align="right">
            <template #default="scope">
              <span class="commission-amount">${{ scope.row.totalCommission.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="本月佣金" width="120" align="right">
            <template #default="scope">
              <span class="commission-amount monthly">${{ scope.row.monthlyCommission.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" width="180">
            <template #default="scope">
              {{ scope.row.registeredAt }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="viewUserDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="showCommissionDetail(scope.row)">佣金</el-button>
              <el-button size="small" type="success" @click="viewReferralChain(scope.row)">关系链</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 用户详情弹窗 -->
    <user-detail-dialog 
      v-model="userDetailVisible"
      :user="selectedUser"
    />

    <!-- 佣金详情弹窗 -->
    <commission-detail-dialog
      v-model="commissionDetailVisible"
      :user="selectedUser"
    />

    <!-- 推荐链条弹窗 -->
    <referral-chain-dialog
      v-model="referralChainVisible"
      :user="selectedUser"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Refresh, 
  Search, 
  User, 
  UserFilled, 
  Money, 
  Connection 
} from '@element-plus/icons-vue'
import TreeNode from './components/TreeNode.vue'
import UserDetailDialog from './components/UserDetailDialog.vue'
import CommissionDetailDialog from './components/CommissionDetailDialog.vue'
import ReferralChainDialog from './components/ReferralChainDialog.vue'

// 响应式数据
const treeLoading = ref(false)
const viewMode = ref('tree')
const treeData = ref([])
const flatTreeData = ref([])
const selectedUser = ref(null)
const userDetailVisible = ref(false)
const commissionDetailVisible = ref(false)
const referralChainVisible = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  level: '',
  status: '',
  dateRange: []
})

// 统计数据
const treeStats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  totalCommission: 0,
  maxLevel: 0
})

// 方法
const handleSearch = () => {
  // 实时搜索逻辑
  searchTree()
}

const searchTree = () => {
  loadTreeData()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    level: '',
    status: '',
    dateRange: []
  })
  loadTreeData()
}

const handleViewModeChange = () => {
  if (viewMode.value === 'table') {
    generateFlatTreeData()
  }
}

const loadTreeData = async () => {
  treeLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟树形数据
    treeData.value = generateMockTreeData()
    
    // 更新统计
    updateTreeStats()
    
    if (viewMode.value === 'table') {
      generateFlatTreeData()
    }
  } catch (error) {
    console.error('加载推荐关系树失败:', error)
    ElMessage.error('加载推荐关系树失败')
  } finally {
    treeLoading.value = false
  }
}

const generateFlatTreeData = () => {
  const flatData = []
  
  const flatten = (nodes, level = 0) => {
    nodes.forEach(node => {
      flatData.push({
        ...node,
        level
      })
      if (node.children && node.children.length > 0) {
        flatten(node.children, level + 1)
      }
    })
  }
  
  flatten(treeData.value)
  flatTreeData.value = flatData
}

const updateTreeStats = () => {
  let totalUsers = 0
  let activeUsers = 0
  let totalCommission = 0
  let maxLevel = 0
  
  const traverse = (nodes, level = 0) => {
    maxLevel = Math.max(maxLevel, level)
    nodes.forEach(node => {
      totalUsers++
      if (node.status === 'active') activeUsers++
      totalCommission += node.totalCommission
      
      if (node.children && node.children.length > 0) {
        traverse(node.children, level + 1)
      }
    })
  }
  
  traverse(treeData.value)
  
  Object.assign(treeStats, {
    totalUsers,
    activeUsers,
    totalCommission,
    maxLevel
  })
}

const generateMockTreeData = () => {
  // 生成模拟的树形数据
  return [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      inviteCode: 'JS001',
      directReferrals: 3,
      totalCommission: 5280.50,
      monthlyCommission: 850.30,
      status: 'active',
      registeredAt: '2023-01-15 10:30:00',
      referrer: null,
      children: [
        {
          id: 2,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          inviteCode: 'AJ002',
          directReferrals: 2,
          totalCommission: 2150.75,
          monthlyCommission: 320.50,
          status: 'active',
          registeredAt: '2023-02-01 14:20:00',
          referrer: { name: 'John Smith', inviteCode: 'JS001' },
          children: [
            {
              id: 5,
              name: 'Charlie Brown',
              email: 'charlie@example.com',
              inviteCode: 'CB005',
              directReferrals: 1,
              totalCommission: 680.25,
              monthlyCommission: 120.00,
              status: 'active',
              registeredAt: '2023-03-01 11:30:00',
              referrer: { name: 'Alice Johnson', inviteCode: 'AJ002' },
              children: []
            }
          ]
        }
      ]
    }
  ]
}

const handleNodeClick = (node) => {
  selectedUser.value = node
}

const showCommissionDetail = (user) => {
  selectedUser.value = user
  commissionDetailVisible.value = true
}

const viewUserDetail = (user) => {
  selectedUser.value = user
  userDetailVisible.value = true
}

const viewReferralChain = (user) => {
  selectedUser.value = user
  referralChainVisible.value = true
}

const exportTree = () => {
  ElMessage.success('导出功能开发中...')
}

const refreshTree = () => {
  loadTreeData()
}

// 生命周期
onMounted(() => {
  loadTreeData()
})
</script>

<style scoped>
.referral-tree-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
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

.stat-icon.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.commission {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.levels {
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

/* 树形卡片 */
.tree-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 树形视图 */
.tree-view {
  min-height: 400px;
}

.tree-container {
  padding: 20px;
}

/* 表格视图 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.level-indicator.level-0 {
  background: #409eff;
}

.level-indicator.level-1 {
  background: #67c23a;
}

.level-indicator.level-2 {
  background: #e6a23c;
}

.level-indicator.level-3 {
  background: #f56c6c;
}

.user-info {
  flex: 1;
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
}

.referrer-info {
  line-height: 1.4;
}

.referrer-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.referrer-code {
  font-size: 12px;
  color: #909399;
}

.no-referrer {
  color: #909399;
  font-style: italic;
}

.commission-amount {
  font-weight: 500;
  color: #303133;
}

.commission-amount.monthly {
  color: #67c23a;
}
</style>
