<template>
  <div class="referrer-detail-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/commission' }">推荐人列表</el-breadcrumb-item>
      <el-breadcrumb-item>推荐人详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">推荐人详情 - {{ referrerInfo.name }}</h1>
    </div>

    <!-- 信息卡片区域 -->
    <div class="info-cards">
      <el-row :gutter="20">
        <!-- 基本信息卡片 -->
        <el-col :span="8">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">基本信息</span>
            </template>
            <div class="info-item">
              <span class="label">推荐人名称：</span>
              <span class="value">{{ referrerInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">账号（邮箱）：</span>
              <span class="value">{{ referrerInfo.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">邀请码：</span>
              <span class="value code">{{ referrerInfo.inviteCode }}</span>
            </div>
            <div class="info-item">
              <span class="label">加入时间：</span>
              <span class="value">{{ referrerInfo.joinTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="referrerInfo.status === 'active' ? 'success' : 'danger'">
                {{ referrerInfo.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <!-- 佣金信息卡片 -->
        <el-col :span="8">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">佣金信息</span>
            </template>
            <div class="info-item">
              <span class="label">佣金总金额：</span>
              <span class="value amount">${{ referrerInfo.totalCommission.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">已结算佣金：</span>
              <span class="value amount settled">${{ referrerInfo.settledCommission.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">待结算佣金：</span>
              <span class="value amount pending">${{ referrerInfo.pendingCommission.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">本月预计佣金：</span>
              <span class="value amount">${{ referrerInfo.monthlyCommission.toFixed(2) }}</span>
            </div>
          </el-card>
        </el-col>

        <!-- 下级用户统计卡片 -->
        <el-col :span="8">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">下级用户统计</span>
            </template>
            <div class="info-item">
              <span class="label">一级下级总数：</span>
              <span class="value count">{{ referrerInfo.firstLevelCount }}</span>
            </div>
            <div class="info-item">
              <span class="label">二级下级总数：</span>
              <span class="value count">{{ referrerInfo.secondLevelCount }}</span>
            </div>
            <div class="info-item">
              <span class="label">一级下级贡献佣金总额：</span>
              <span class="value amount">${{ referrerInfo.firstLevelCommission.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">二级下级贡献佣金总额：</span>
              <span class="value amount">${{ referrerInfo.secondLevelCommission.toFixed(2) }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 标签页导航 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab">
        <!-- 佣金明细 -->
        <el-tab-pane label="佣金明细" name="commission">
          <div class="tab-content">
            <el-table :data="commissionRecords" border>
              <el-table-column label="佣金产生时间" width="180">
                <template #default="scope">
                  {{ scope.row.createTime }}
                </template>
              </el-table-column>
              <el-table-column label="佣金来源" min-width="200">
                <template #default="scope">
                  {{ scope.row.source }}
                </template>
              </el-table-column>
              <el-table-column label="佣金类型" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'first' ? 'primary' : 'success'">
                    {{ scope.row.type === 'first' ? '一级分佣' : '二级分佣' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="佣金金额" width="120" align="right">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'settled' ? 'success' : 'warning'">
                    {{ scope.row.status === 'settled' ? '已结算' : '待结算' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="结算时间" width="180">
                <template #default="scope">
                  {{ scope.row.settlementTime || '未结算' }}
                </template>
              </el-table-column>
              <el-table-column label="备注" min-width="150">
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 下级用户 -->
        <el-tab-pane label="下级用户" name="subordinates">
          <div class="tab-content">
            <div class="search-bar">
              <el-input
                v-model="subordinateSearch"
                placeholder="支持按用户名称、账号搜索"
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            
            <el-table :data="subordinateUsers" border row-key="id" :tree-props="{ children: 'children' }">
              <el-table-column label="用户名称" min-width="150">
                <template #default="scope">
                  <div class="user-info">
                    <span class="user-name">{{ scope.row.name }}</span>
                    <span class="user-email">{{ scope.row.email }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="加入时间" width="180">
                <template #default="scope">
                  {{ scope.row.joinTime }}
                </template>
              </el-table-column>
              <el-table-column label="贡献佣金总额" width="150" align="right">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.contributionAmount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                    {{ scope.row.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="邀请的二级用户数量" width="150" align="center">
                <template #default="scope">
                  <span v-if="scope.row.level === 1" class="count-text">{{ scope.row.secondLevelCount || 0 }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="small" @click="viewUserDetail(scope.row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 结算记录 -->
        <el-tab-pane label="结算记录" name="settlements">
          <div class="tab-content">
            <el-table :data="settlementRecords" border>
              <el-table-column label="结算时间" width="180">
                <template #default="scope">
                  {{ scope.row.settlementTime }}
                </template>
              </el-table-column>
              <el-table-column label="结算周期" width="150">
                <template #default="scope">
                  {{ scope.row.period }}
                </template>
              </el-table-column>
              <el-table-column label="结算金额" width="120" align="right">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结算前账户余额" width="150" align="right">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.balanceBefore.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结算后账户余额" width="150" align="right">
                <template #default="scope">
                  <span class="amount-text">${{ scope.row.balanceAfter.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="备注" min-width="150">
                <template #default="scope">
                  {{ scope.row.remark || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const route = useRoute()
const activeTab = ref('commission')
const subordinateSearch = ref('')

// 推荐人信息
const referrerInfo = reactive({
  id: 1,
  name: 'John Smith',
  email: 'john@example.com',
  inviteCode: 'JS001',
  joinTime: '2023-08-15 10:30:00',
  status: 'active',
  totalCommission: 1250.50,
  settledCommission: 980.30,
  pendingCommission: 270.20,
  monthlyCommission: 125.75,
  firstLevelCount: 15,
  secondLevelCount: 8,
  firstLevelCommission: 850.30,
  secondLevelCommission: 400.20
})

// 佣金明细
const commissionRecords = ref([
  {
    id: 1,
    createTime: '2023-11-15 14:30:00',
    source: '订单 #ORD001 - Alice Johnson',
    type: 'first',
    amount: 25.50,
    status: 'settled',
    settlementTime: '2023-12-01 10:00:00',
    remark: '一级分佣'
  },
  {
    id: 2,
    createTime: '2023-11-20 09:15:00',
    source: '下级用户 Bob Wilson',
    type: 'second',
    amount: 12.30,
    status: 'pending',
    settlementTime: null,
    remark: '二级分佣'
  }
])

// 下级用户
const subordinateUsers = ref([
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    joinTime: '2023-09-01 15:20:00',
    contributionAmount: 450.80,
    status: 'active',
    level: 1,
    secondLevelCount: 3,
    children: [
      {
        id: 11,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        joinTime: '2023-10-05 11:30:00',
        contributionAmount: 180.50,
        status: 'active',
        level: 2
      }
    ]
  }
])

// 结算记录
const settlementRecords = ref([
  {
    id: 1,
    settlementTime: '2023-12-01 10:00:00',
    period: '2023年11月',
    amount: 285.60,
    balanceBefore: 1250.40,
    balanceAfter: 1536.00,
    remark: '月度自动结算'
  }
])

// 方法
const viewUserDetail = (user) => {
  ElMessage.info(`查看用户 ${user.name} 的详细信息`)
}

// 生命周期
onMounted(() => {
  const referrerId = route.params.id
  console.log('推荐人详情页面已加载，ID:', referrerId)
})
</script>

<style scoped>
.referrer-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.info-cards {
  margin-bottom: 20px;
}

.info-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  color: #303133;
  font-weight: 500;
}

.value.code {
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.value.amount {
  font-weight: 600;
  color: #409eff;
}

.value.amount.settled {
  color: #67c23a;
}

.value.amount.pending {
  color: #e6a23c;
}

.value.count {
  font-weight: 600;
  color: #409eff;
}

.tabs-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 20px 0;
}

.search-bar {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

.amount-text {
  font-weight: 600;
  color: #409eff;
}

.count-text {
  font-weight: 500;
  color: #409eff;
}
</style>
