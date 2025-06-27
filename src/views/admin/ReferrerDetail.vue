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
      <div class="header-left">
        <h1 class="page-title">推荐人详情 - {{ referrerInfo.name }}</h1>
        <div class="user-status">
          <el-tag :type="referrerInfo.status === 'active' ? 'success' : 'danger'" size="large">
            {{ referrerInfo.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <el-button
          v-if="referrerInfo.pendingCommission > 0"
          type="primary"
          @click="settleCommission"
        >
          <el-icon><Money /></el-icon>
          结算佣金
        </el-button>
        <el-button
          :type="referrerInfo.status === 'active' ? 'warning' : 'success'"
          @click="toggleUserStatus"
        >
          <el-icon><User /></el-icon>
          {{ referrerInfo.status === 'active' ? '禁用用户' : '启用用户' }}
        </el-button>
        <el-button
          type="danger"
          @click="deleteUser"
        >
          <el-icon><Delete /></el-icon>
          删除用户
        </el-button>
      </div>
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
            <!-- 搜索栏 -->
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

            <!-- 下级用户列表 -->
            <div class="subordinate-users-container">
              <h4 class="section-title">一级邀请用户 ({{ filteredSubordinateUsers.length }}人)</h4>

              <div v-if="filteredSubordinateUsers.length > 0" class="users-list">
                <div
                  v-for="user in filteredSubordinateUsers"
                  :key="user.id"
                  class="user-card"
                >
                  <!-- 用户基本信息 -->
                  <div class="user-header">
                    <div class="user-avatar">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-info">
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-meta">
                        <span>{{ user.email }}</span>
                        <span>加入时间：{{ formatDate(user.joinTime) }}</span>
                        <el-tag :type="user.status === 'active' ? 'success' : 'danger'" size="small">
                          {{ user.status === 'active' ? '正常' : '禁用' }}
                        </el-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 佣金信息 -->
                  <div class="commission-section">
                    <div class="commission-item">
                      <span class="label">累计佣金</span>
                      <span class="value total">${{ user.totalCommission.toFixed(2) }}</span>
                    </div>
                    <div class="commission-item">
                      <span class="label">本月佣金</span>
                      <span class="value monthly">${{ user.monthlyCommission.toFixed(2) }}</span>
                    </div>
                    <div class="commission-item">
                      <span class="label">待结算</span>
                      <span class="value pending">${{ user.pendingCommission.toFixed(2) }}</span>
                    </div>
                  </div>

                  <!-- 操作区域 -->
                  <div class="user-actions">
                    <el-button
                      type="primary"
                      size="small"
                      text
                      @click="viewUserDetail(user)"
                    >
                      查看详情
                    </el-button>
                    <el-button
                      v-if="user.level2Users && user.level2Users.length > 0"
                      type="info"
                      size="small"
                      text
                      @click="toggleLevel2Users(user.id)"
                    >
                      <el-icon>
                        <ArrowDown v-if="!expandedLevel2Users.includes(user.id)" />
                        <ArrowUp v-else />
                      </el-icon>
                      {{ expandedLevel2Users.includes(user.id) ? '收起' : '展开' }}二级用户
                    </el-button>
                    <span v-if="user.level2Users && user.level2Users.length > 0" class="level2-count">
                      二级用户：{{ user.level2Users.length }}人
                    </span>
                  </div>

                  <!-- 二级用户列表 -->
                  <div
                    v-if="expandedLevel2Users.includes(user.id) && user.level2Users && user.level2Users.length > 0"
                    class="level2-users-container"
                  >
                    <div
                      v-for="level2User in user.level2Users"
                      :key="level2User.id"
                      class="user-card level2-user"
                    >
                      <!-- 二级用户信息 -->
                      <div class="user-header">
                        <div class="user-avatar level2">
                          {{ level2User.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="user-info">
                          <div class="user-name">{{ level2User.name }}</div>
                          <div class="user-meta">
                            <span>{{ level2User.email }}</span>
                            <span>加入时间：{{ formatDate(level2User.joinTime) }}</span>
                            <el-tag :type="level2User.status === 'active' ? 'success' : 'danger'" size="small">
                              {{ level2User.status === 'active' ? '正常' : '禁用' }}
                            </el-tag>
                          </div>
                        </div>
                      </div>

                      <!-- 二级用户佣金信息 -->
                      <div class="commission-section">
                        <div class="commission-item">
                          <span class="label">累计佣金</span>
                          <span class="value total">${{ level2User.totalCommission.toFixed(2) }}</span>
                        </div>
                        <div class="commission-item">
                          <span class="label">本月佣金</span>
                          <span class="value monthly">${{ level2User.monthlyCommission.toFixed(2) }}</span>
                        </div>
                        <div class="commission-item">
                          <span class="label">待结算</span>
                          <span class="value pending">${{ level2User.pendingCommission.toFixed(2) }}</span>
                        </div>
                      </div>

                      <!-- 二级用户操作 -->
                      <div class="user-actions">
                        <el-button
                          type="primary"
                          size="small"
                          text
                          @click="viewUserDetail(level2User)"
                        >
                          查看详情
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state">
                <el-empty description="暂无下级用户" />
              </div>
            </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowLeft, Money, User, Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('commission')
const subordinateSearch = ref('')
const expandedLevel2Users = ref([])

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
    totalCommission: 1250.50,
    monthlyCommission: 180.30,
    pendingCommission: 45.20,
    status: 'active',
    level: 1,
    level2Users: [
      {
        id: 11,
        name: 'David Chen',
        email: 'david@example.com',
        joinTime: '2023-09-15 09:20:00',
        totalCommission: 320.50,
        monthlyCommission: 65.30,
        pendingCommission: 15.20,
        status: 'active'
      },
      {
        id: 12,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        joinTime: '2023-10-01 11:45:00',
        totalCommission: 180.25,
        monthlyCommission: 42.10,
        pendingCommission: 8.50,
        status: 'active'
      },
      {
        id: 13,
        name: 'Frank Miller',
        email: 'frank@example.com',
        joinTime: '2023-10-20 16:30:00',
        totalCommission: 95.80,
        monthlyCommission: 28.40,
        pendingCommission: 12.30,
        status: 'disabled'
      }
    ]
  },
  {
    id: 2,
    name: 'Bob Wilson',
    email: 'bob@example.com',
    joinTime: '2023-10-15 10:30:00',
    totalCommission: 890.25,
    monthlyCommission: 125.60,
    pendingCommission: 32.80,
    status: 'active',
    level: 1,
    level2Users: [
      {
        id: 21,
        name: 'Grace Lee',
        email: 'grace@example.com',
        joinTime: '2023-11-01 14:20:00',
        totalCommission: 156.40,
        monthlyCommission: 38.90,
        pendingCommission: 18.60,
        status: 'active'
      }
    ]
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    joinTime: '2023-11-02 14:45:00',
    totalCommission: 567.80,
    monthlyCommission: 89.20,
    pendingCommission: 22.40,
    status: 'disabled',
    level: 1,
    level2Users: []
  }
])

// 过滤后的下级用户列表
const filteredSubordinateUsers = computed(() => {
  console.log('Computing filteredSubordinateUsers:', subordinateUsers.value)
  if (!subordinateSearch.value) {
    return subordinateUsers.value
  }

  const searchTerm = subordinateSearch.value.toLowerCase()
  return subordinateUsers.value.filter(user =>
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  )
})

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
const goBack = () => {
  router.push('/admin/commission')
}

const settleCommission = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要为 ${referrerInfo.name} 结算 $${referrerInfo.pendingCommission.toFixed(2)} 的待结算佣金吗？`,
      '结算佣金确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('佣金结算成功')
    // 更新数据
    referrerInfo.settledCommission += referrerInfo.pendingCommission
    referrerInfo.pendingCommission = 0
  } catch {
    // 用户取消
  }
}

const toggleUserStatus = async () => {
  const action = referrerInfo.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${referrerInfo.name} 吗？`,
      `${action}用户确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    referrerInfo.status = referrerInfo.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`用户${action}成功`)
  } catch {
    // 用户取消
  }
}

const deleteUser = async () => {
  try {
    await ElMessageBox.confirm(
      `删除用户将无法恢复，确定要删除用户 ${referrerInfo.name} 吗？`,
      '删除用户确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        dangerouslyUseHTMLString: true,
        message: `<p>删除用户 <strong>${referrerInfo.name}</strong> 将会：</p>
                  <ul>
                    <li>永久删除用户账户和所有相关数据</li>
                    <li>删除该用户的所有佣金记录</li>
                    <li>断开与下级用户的推荐关系</li>
                  </ul>
                  <p style="color: #f56c6c; font-weight: bold;">此操作不可撤销，请谨慎操作！</p>`
      }
    )

    ElMessage.success('用户删除成功')
    // 删除后返回列表页
    setTimeout(() => {
      router.push('/admin/commission')
    }, 1500)
  } catch {
    // 用户取消
  }
}

const toggleLevel2Users = (level1UserId) => {
  const index = expandedLevel2Users.value.indexOf(level1UserId)
  if (index > -1) {
    expandedLevel2Users.value.splice(index, 1)
  } else {
    expandedLevel2Users.value.push(level1UserId)
  }
}

const viewUserDetail = (user) => {
  // 跳转到推荐人详情页（递归查看下级用户）
  router.push(`/admin/referrers/${user.id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.user-status {
  display: flex;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 下级用户展开区域样式 - 与分佣管理主页面保持一致 */
.subordinate-expansion {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 10px 0;
}

.level1-users-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.user-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.level1-user {
  border-left: 4px solid #409eff;
}

.level2-user {
  border-left: 4px solid #67c23a;
  margin-left: 20px;
  background: #f0f9ff;
}

.user-item .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 8px;
  margin: -8px -8px 4px -8px;
}

.user-item .user-info:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateX(4px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.user-avatar.level2 {
  background: #67c23a;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.user-item .user-details {
  flex: 1;
}

.user-item .user-details .user-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.commission-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.commission-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.commission-item .label {
  font-size: 12px;
  color: #909399;
}

.commission-item .value {
  font-size: 14px;
  font-weight: 600;
}

.commission-item .value.total {
  color: #303133;
}

.commission-item .value.accumulated {
  color: #409eff;
}

.commission-item .value.monthly {
  color: #67c23a;
}

.user-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level2-actions {
  justify-content: flex-end;
  margin-top: 8px;
}

.level2-count {
  font-size: 12px;
  color: #909399;
}

.level2-users {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-users {
  text-align: center;
  padding: 40px 20px;
}

/* 下级用户样式 */
.subordinate-users-container {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.user-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.user-card.level2-user {
  margin-left: 40px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  margin-right: 16px;
}

.user-avatar.level2 {
  width: 40px;
  height: 40px;
  background: #67c23a;
  font-size: 16px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.commission-section {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.commission-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.commission-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.commission-item .value {
  font-size: 16px;
  font-weight: 600;
}

.commission-item .value.total {
  color: #409eff;
}

.commission-item .value.monthly {
  color: #67c23a;
}

.commission-item .value.pending {
  color: #e6a23c;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level2-count {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.level2-users-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

/* 链接按钮 */
.link-button {
  color: #409eff;
  font-weight: 500;
}

.link-button:hover {
  color: #66b1ff;
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
