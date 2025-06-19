<template>
  <div class="commission-details">
    <!-- 筛选工具栏 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-select
          v-model="selectedYear"
          placeholder="选择年份"
          clearable
          @change="handleFilterChange"
          style="width: 120px;"
        >
          <el-option
            v-for="year in availableYears"
            :key="year"
            :label="year + '年'"
            :value="year"
          />
        </el-select>

        <el-select
          v-model="selectedMonth"
          placeholder="选择月份"
          clearable
          @change="handleFilterChange"
          style="width: 120px;"
        >
          <el-option
            v-for="month in availableMonths"
            :key="month"
            :label="month + '月'"
            :value="month"
          />
        </el-select>

        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>

    <!-- 佣金明细列表 -->
    <div class="table-container">
      <el-table
        :data="monthlyRecords"
        :loading="loading"
        stripe
      >
        <el-table-column prop="period" label="时间" width="140">
          <template #default="{ row }">
            <div class="time-cell">{{ row.period }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="source" label="佣金来源" width="120">
          <template #default="{ row }">
            <div class="source-cell">下级分佣</div>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="佣金金额" width="140" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              ${{ row.amount.toFixed(2) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'pending' ? 'warning' : 'success'"
              size="small"
            >
              {{ row.status === 'pending' ? '待结算' : '已结算' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="settlementTime" label="结算时间" min-width="160">
          <template #default="{ row }">
            <div class="time-cell">
              {{ row.settlementTime ? formatSettlementTime(row.settlementTime) : '-' }}
            </div>
          </template>
        </el-table-column>


      </el-table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalRecords"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'


// Props
const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})



// 响应式数据
const currentPage = ref(1)
const pageSize = ref(20)
const selectedYear = ref('')
const selectedMonth = ref('')

// 计算属性 - 获取可用的年份和月份
const availableYears = computed(() => {
  const years = new Set()
  props.records.forEach(record => {
    const date = new Date(record.time)
    years.add(date.getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
})

const availableMonths = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i + 1)
})

// 计算属性 - 将原始记录按月汇总并应用筛选
const monthlyRecords = computed(() => {
  // 按月份分组汇总佣金数据
  const monthlyMap = new Map()

  props.records.forEach(record => {
    const date = new Date(record.time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const yearMonth = `${year}年${String(month).padStart(2, '0')}月`

    // 应用年份筛选
    if (selectedYear.value && year !== selectedYear.value) {
      return
    }

    // 应用月份筛选
    if (selectedMonth.value && month !== selectedMonth.value) {
      return
    }

    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, {
        period: yearMonth,
        source: '下级分佣',
        amount: 0,
        status: 'pending', // 默认待结算
        settlementTime: null,
        originalDate: date,
        records: [] // 存储该月的所有记录
      })
    }

    const monthData = monthlyMap.get(yearMonth)
    monthData.amount += record.amount
    monthData.records.push(record)
  })

  // 更新每月的结算状态
  monthlyMap.forEach(monthData => {
    // 检查该月是否所有记录都已结算
    const allSettled = monthData.records.every(record => record.status === 'settled')
    const hasSettled = monthData.records.some(record => record.status === 'settled')

    if (allSettled && monthData.records.length > 0) {
      monthData.status = 'settled'
      // 使用最早的结算时间
      const settlementTimes = monthData.records
        .filter(record => record.settlementTime)
        .map(record => new Date(record.settlementTime))

      if (settlementTimes.length > 0) {
        monthData.settlementTime = new Date(Math.min(...settlementTimes)).toISOString()
      }
    } else if (hasSettled) {
      // 部分结算的情况，仍显示为待结算
      monthData.status = 'pending'
    }
  })

  // 转换为数组并按时间倒序排列
  const monthlyArray = Array.from(monthlyMap.values())
    .sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime())

  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return monthlyArray.slice(start, end)
})

const totalRecords = computed(() => {
  // 计算按月汇总后的总记录数（应用筛选）
  const monthlyMap = new Map()

  props.records.forEach(record => {
    const date = new Date(record.time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const yearMonth = `${year}年${String(month).padStart(2, '0')}月`

    // 应用年份筛选
    if (selectedYear.value && year !== selectedYear.value) {
      return
    }

    // 应用月份筛选
    if (selectedMonth.value && month !== selectedMonth.value) {
      return
    }

    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, true)
    }
  })

  return monthlyMap.size
})

// 方法
const formatSettlementTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  selectedYear.value = ''
  selectedMonth.value = ''
  currentPage.value = 1
}



// 监听器
watch(() => props.records, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.commission-details {
  padding: 16px 0;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}



/* 表格容器 */
.table-container {
  margin-bottom: 20px;
}

/* 表格单元格样式 */
.time-cell {
  font-size: 14px;
  color: #606266;
}

.source-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.source-main {
  font-weight: 500;
  color: #303133;
}

.source-sub {
  font-size: 12px;
  color: #909399;
}

.amount-cell {
  font-weight: 600;
  color: #67c23a;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .filter-row .el-select {
    width: 100%;
  }
}
</style> 