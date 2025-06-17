<template>
  <div class="commission-settlements-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">佣金结算记录</h1>
    </div>

    <!-- 搜索和筛选区 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.userName"
            placeholder="支持按用户名称搜索"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
          <el-button type="primary" @click="searchSettlements">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 结算记录列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">结算记录列表</span>
          <el-button @click="exportSettlements">
            <el-icon><Download /></el-icon>
            导出结算记录为Excel
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="settlementsList"
        border
      >
        <el-table-column label="用户名称" min-width="150">
          <template #default="scope">
            <div class="user-info">
              <div class="user-name">{{ scope.row.userName }}</div>
              <div class="user-email">{{ scope.row.userEmail }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="结算时间" width="180">
          <template #default="scope">
            {{ scope.row.settlementTime }}
          </template>
        </el-table-column>

        <el-table-column label="结算周期" width="150">
          <template #default="scope">
            {{ scope.row.settlementPeriod }}
          </template>
        </el-table-column>

        <el-table-column label="结算金额" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">${{ scope.row.settlementAmount.toFixed(2) }}</span>
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

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalSettlements"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadSettlements"
          @current-change="loadSettlements"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalSettlements = ref(0)
const settlementsList = ref([])

// 搜索表单
const searchForm = reactive({
  userName: '',
  dateRange: [],
  minAmount: '',
  maxAmount: ''
})

// 方法
const loadSettlements = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟结算记录数据
    settlementsList.value = [
      {
        id: 1,
        userName: 'John Smith',
        userEmail: 'john@example.com',
        settlementTime: '2023-12-01 10:00:00',
        settlementPeriod: '2023年11月',
        settlementAmount: 285.60,
        balanceBefore: 1250.40,
        balanceAfter: 1536.00
      },
      {
        id: 2,
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        settlementTime: '2023-12-01 10:05:00',
        settlementPeriod: '2023年11月',
        settlementAmount: 195.30,
        balanceBefore: 850.20,
        balanceAfter: 1045.50
      },
      {
        id: 3,
        userName: 'Mike Wilson',
        userEmail: 'mike@example.com',
        settlementTime: '2023-12-01 10:10:00',
        settlementPeriod: '2023年11月',
        settlementAmount: 420.80,
        balanceBefore: 1580.60,
        balanceAfter: 2001.40
      }
    ]

    totalSettlements.value = 89
  } catch (error) {
    console.error('加载结算记录失败:', error)
    ElMessage.error('加载结算记录失败')
  } finally {
    tableLoading.value = false
  }
}

const searchSettlements = () => {
  currentPage.value = 1
  loadSettlements()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    userName: '',
    dateRange: [],
    minAmount: '',
    maxAmount: ''
  })
  searchSettlements()
}

const exportSettlements = () => {
  ElMessage.success('导出结算记录功能开发中...')
}

const viewDetail = (settlement) => {
  ElMessage.info(`查看结算记录 ${settlement.id} 的详细信息`)
}

// 生命周期
onMounted(() => {
  loadSettlements()
})
</script>

<style scoped>
.commission-settlements-page {
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

/* 金额显示 */
.amount-text {
  font-weight: 600;
  color: #409eff;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .commission-settlements-page {
    padding: 12px;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
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