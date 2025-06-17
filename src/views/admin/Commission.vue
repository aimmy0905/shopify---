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
      >
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

        <el-table-column label="佣金总金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">${{ scope.row.totalCommission.toFixed(2) }}</span>
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
  Download
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const tableLoading = ref(false)
const selectedReferrers = ref([])
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
        totalCommission: 1250.50,
        settledCommission: 980.30,
        pendingCommission: 270.20,
        subordinateCount: 15,
        joinTime: '2023-08-15 10:30:00'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        inviteCount: 18,
        totalCommission: 890.75,
        settledCommission: 650.25,
        pendingCommission: 240.50,
        subordinateCount: 12,
        joinTime: '2023-09-02 14:20:00'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike@example.com',
        inviteCount: 32,
        totalCommission: 1580.90,
        settledCommission: 1200.40,
        pendingCommission: 380.50,
        subordinateCount: 20,
        joinTime: '2023-07-20 09:15:00'
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