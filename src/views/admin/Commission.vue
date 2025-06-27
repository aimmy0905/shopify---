<template>
  <div class="referrers-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">推荐人列表</h1>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="支持按推荐人名称、账号搜索"
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchReferrers">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 推荐人列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">推荐人列表</span>
          <div class="table-actions">
            <el-button
              type="success"
              @click="batchSettlement"
              :disabled="!selectedReferrers.length"
            >
              批量结算佣金 ({{ selectedReferrers.length }})
            </el-button>
            <el-button @click="exportReferrers">
              <el-icon><Download /></el-icon>
              导出推荐人列表为Excel
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="referrersList"
        border
        @selection-change="handleSelectionChange"
        :expand-row-keys="expandedReferrers"
        row-key="id"
      >
        <el-table-column type="expand" width="55">
          <template #default="scope">
            <div class="referrer-expansion">
              <!-- 一级用户列表 -->
              <div class="level1-users-section">
                <h4 class="section-title">一级邀请用户 ({{ scope.row.level1Users?.length || 0 }}人)</h4>
                <div v-if="scope.row.level1Users?.length > 0" class="users-list">
                  <div
                    v-for="level1User in scope.row.level1Users"
                    :key="level1User.id"
                    class="user-item level1-user"
                  >
                    <div class="user-info" @click="viewUserDetail(level1User, 1)">
                      <div class="user-avatar">
                        <el-icon><User /></el-icon>
                      </div>
                      <div class="user-details">
                        <div class="user-name">{{ level1User.name }}</div>
                        <div class="user-meta">
                          <span class="join-time">加入时间: {{ formatDate(level1User.joinTime) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="commission-info">
                      <div class="commission-item">
                        <span class="label">总佣金:</span>
                        <span class="value total">${{ level1User.totalCommission.toFixed(2) }}</span>
                      </div>
                      <div class="commission-item">
                        <span class="label">累计佣金:</span>
                        <span class="value accumulated">${{ level1User.accumulatedCommission.toFixed(2) }}</span>
                      </div>
                      <div class="commission-item">
                        <span class="label">本月佣金:</span>
                        <span class="value monthly">${{ level1User.monthlyCommission.toFixed(2) }}</span>
                      </div>
                    </div>

                    <div class="user-actions">
                      <span class="level2-count">二级用户: {{ level1User.level2Count }}人</span>
                      <div class="action-buttons">
                        <el-button
                          size="small"
                          type="primary"
                          @click="viewUserDetail(level1User, 1)"
                        >
                          查看详情
                        </el-button>
                        <el-button
                          v-if="level1User.level2Count > 0"
                          size="small"
                          text
                          @click="toggleLevel2Users(level1User.id)"
                        >
                          <el-icon>
                            <ArrowDown v-if="!expandedLevel2Users.includes(level1User.id)" />
                            <ArrowUp v-else />
                          </el-icon>
                          {{ expandedLevel2Users.includes(level1User.id) ? '收起' : '展开' }}二级用户
                        </el-button>
                      </div>
                    </div>

                    <!-- 二级用户列表 -->
                    <div
                      v-if="expandedLevel2Users.includes(level1User.id) && level1User.level2Users?.length > 0"
                      class="level2-users"
                    >
                      <div
                        v-for="level2User in level1User.level2Users"
                        :key="level2User.id"
                        class="user-item level2-user"
                      >
                        <div class="user-info" @click="viewUserDetail(level2User, 2)">
                          <div class="user-avatar level2">
                            <el-icon><User /></el-icon>
                          </div>
                          <div class="user-details">
                            <div class="user-name">{{ level2User.name }}</div>
                            <div class="user-meta">
                              <span class="join-time">加入时间: {{ formatDate(level2User.joinTime) }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="commission-info">
                          <div class="commission-item">
                            <span class="label">总佣金:</span>
                            <span class="value total">${{ level2User.totalCommission.toFixed(2) }}</span>
                          </div>
                          <div class="commission-item">
                            <span class="label">累计佣金:</span>
                            <span class="value accumulated">${{ level2User.accumulatedCommission.toFixed(2) }}</span>
                          </div>
                          <div class="commission-item">
                            <span class="label">本月佣金:</span>
                            <span class="value monthly">${{ level2User.monthlyCommission.toFixed(2) }}</span>
                          </div>
                        </div>

                        <div class="user-actions level2-actions">
                          <el-button
                            size="small"
                            type="primary"
                            @click="viewUserDetail(level2User, 2)"
                          >
                            查看详情
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-users">
                  <el-empty description="暂无一级邀请用户" :image-size="60" />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column type="selection" width="55" />

        <el-table-column label="推荐人名称" min-width="150">
          <template #default="scope">
            <div class="referrer-info">
              <div class="referrer-name">{{ scope.row.name }}</div>
              <div class="referrer-email">{{ scope.row.email }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="邀请用户数量" width="120" align="center">
          <template #default="scope">
            <span class="count-text">{{ scope.row.inviteCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="本月邀请数" width="120" align="center">
          <template #default="scope">
            <span class="amount-text monthly-new">{{ scope.row.monthlyNewReferrals }}人</span>
          </template>
        </el-table-column>

        <el-table-column label="佣金总金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">${{ scope.row.totalCommission.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="本月佣金" width="120" align="right">
          <template #default="scope">
            <span class="amount-text monthly">${{ scope.row.monthlyCommission.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="已结算佣金" width="120" align="right">
          <template #default="scope">
            <span class="amount-text settled">${{ scope.row.settledCommission.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="待结算佣金" width="120" align="right">
          <template #default="scope">
            <span class="amount-text pending">${{ scope.row.pendingCommission.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="下级用户数量" width="120" align="center">
          <template #default="scope">
            <el-button
              type="text"
              @click="viewSubordinates(scope.row)"
              class="link-button"
            >
              {{ scope.row.subordinateCount }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="加入时间" width="180">
          <template #default="scope">
            {{ scope.row.joinTime }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewCommissionRecords(scope.row)">
              查看佣金结算记录
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="manualSettlement(scope.row)"
              :disabled="scope.row.pendingCommission <= 0"
            >
              手动结算佣金
            </el-button>
            <el-button size="small" @click="viewDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalReferrers"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadReferrers"
          @current-change="loadReferrers"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Download,
  User,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const tableLoading = ref(false)
const selectedReferrers = ref([])
const expandedReferrers = ref([])
const expandedLevel2Users = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalReferrers = ref(0)
const referrersList = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 方法
const loadReferrers = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟推荐人数据
    referrersList.value = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        inviteCount: 25,
        monthlyNewReferrals: 3,
        totalCommission: 1250.50,
        monthlyCommission: 425.80,
        settledCommission: 980.30,
        pendingCommission: 270.20,
        subordinateCount: 15,
        joinTime: '2023-08-15 10:30:00',
        level1Users: [
          {
            id: 101,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            joinTime: '2024-03-15',
            totalCommission: 680.50,
            accumulatedCommission: 580.30,
            monthlyCommission: 120.80,
            level2Count: 5,
            level2Users: [
              {
                id: 1001,
                name: 'Bob Wilson',
                email: 'bob@example.com',
                joinTime: '2024-04-20',
                totalCommission: 120.30,
                accumulatedCommission: 95.20,
                monthlyCommission: 25.10
              },
              {
                id: 1002,
                name: 'Carol Davis',
                email: 'carol@example.com',
                joinTime: '2024-05-01',
                totalCommission: 85.70,
                accumulatedCommission: 65.40,
                monthlyCommission: 20.30
              }
            ]
          },
          {
            id: 102,
            name: 'David Brown',
            email: 'david@example.com',
            joinTime: '2024-02-10',
            totalCommission: 920.80,
            accumulatedCommission: 820.50,
            monthlyCommission: 180.30,
            level2Count: 8,
            level2Users: []
          }
        ]
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        inviteCount: 18,
        monthlyNewReferrals: 2,
        totalCommission: 890.75,
        monthlyCommission: 320.50,
        settledCommission: 650.25,
        pendingCommission: 240.50,
        subordinateCount: 12,
        joinTime: '2023-09-02 14:20:00',
        level1Users: [
          {
            id: 201,
            name: 'Emma Wilson',
            email: 'emma@example.com',
            joinTime: '2024-01-20',
            totalCommission: 450.25,
            accumulatedCommission: 380.15,
            monthlyCommission: 85.60,
            level2Count: 3,
            level2Users: [
              {
                id: 2001,
                name: 'Frank Miller',
                email: 'frank@example.com',
                joinTime: '2024-03-10',
                totalCommission: 95.40,
                accumulatedCommission: 75.20,
                monthlyCommission: 20.20
              }
            ]
          }
        ]
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike@example.com',
        inviteCount: 32,
        monthlyNewReferrals: 5,
        totalCommission: 1580.90,
        monthlyCommission: 580.40,
        settledCommission: 1200.40,
        pendingCommission: 380.50,
        subordinateCount: 20,
        joinTime: '2023-07-20 09:15:00',
        level1Users: [
          {
            id: 301,
            name: 'Grace Lee',
            email: 'grace@example.com',
            joinTime: '2024-01-05',
            totalCommission: 1250.75,
            accumulatedCommission: 1100.50,
            monthlyCommission: 280.25,
            level2Count: 12,
            level2Users: []
          },
          {
            id: 302,
            name: 'Henry Chen',
            email: 'henry@example.com',
            joinTime: '2024-02-15',
            totalCommission: 890.30,
            accumulatedCommission: 750.20,
            monthlyCommission: 180.10,
            level2Count: 7,
            level2Users: []
          }
        ]
      }
    ]

    totalReferrers.value = 156
  } catch (error) {
    console.error('加载推荐人列表失败:', error)
    ElMessage.error('加载推荐人列表失败')
  } finally {
    tableLoading.value = false
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const viewUserDetail = (user, level) => {
  // 跳转到推荐人详情页，统一使用推荐人详情页查看用户信息
  router.push({
    name: 'ReferrerDetail',
    params: { id: user.id }
  })
}

const searchReferrers = () => {
  currentPage.value = 1
  loadReferrers()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchReferrers()
}

const handleSelectionChange = (selection) => {
  selectedReferrers.value = selection
}

const batchSettlement = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要为选中的 ${selectedReferrers.value.length} 个推荐人进行佣金结算吗？`,
      '批量结算佣金确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量结算已启动')
    selectedReferrers.value = []
    loadReferrers()
  } catch {
    // 用户取消
  }
}

const exportReferrers = () => {
  ElMessage.success('导出推荐人列表功能开发中...')
}

const viewSubordinates = (referrer) => {
  router.push(`/admin/referrers/${referrer.id}`)
}

const viewCommissionRecords = (referrer) => {
  router.push(`/admin/commission-settlements?referrer=${referrer.id}`)
}

const manualSettlement = async (referrer) => {
  try {
    await ElMessageBox.confirm(
      `确定要为 ${referrer.name} 结算 $${referrer.pendingCommission.toFixed(2)} 的待结算佣金吗？`,
      '手动结算佣金确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('佣金结算成功')
    loadReferrers()
  } catch {
    // 用户取消
  }
}

const viewDetail = (referrer) => {
  router.push(`/admin/referrers/${referrer.id}`)
}

// 生命周期
onMounted(() => {
  loadReferrers()
})
</script>

<style scoped>
.referrers-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  font-size: 18px;
}

.table-actions {
  display: flex;
  gap: 12px;
}

/* 推荐人信息 */
.referrer-info {
  line-height: 1.4;
}

.referrer-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.referrer-email {
  font-size: 12px;
  color: #909399;
}

/* 数量和金额显示 */
.count-text {
  font-weight: 500;
  color: #409eff;
}

.amount-text {
  font-weight: 600;
  color: #303133;
}

.amount-text.settled {
  color: #67c23a;
}

.amount-text.pending {
  color: #e6a23c;
}

.amount-text.monthly {
  color: #67c23a;
  font-weight: 600;
}

.amount-text.monthly-new {
  color: #409eff;
  font-weight: 600;
}

/* 推荐人展开区域样式 */
.referrer-expansion {
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

/* 链接按钮 */
.link-button {
  color: #409eff;
  font-weight: 500;
}

.link-button:hover {
  color: #66b1ff;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .referrers-page {
    padding: 12px;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
  }
}
</style>