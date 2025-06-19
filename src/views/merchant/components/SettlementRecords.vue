<template>
  <div class="settlement-records">
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

    <!-- 结算记录列表 -->
    <div class="table-container">
      <el-table 
        :data="filteredRecords" 
        :loading="loading"
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column prop="settlementTime" label="结算时间" width="160" sortable="custom">
          <template #default="{ row }">
            <div class="time-cell">{{ formatTime(row.settlementTime) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="period" label="结算周期" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.period }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="结算金额" width="120" align="right" sortable="custom">
          <template #default="{ row }">
            <div class="amount-cell positive">
              +${{ row.amount.toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="balanceBefore" label="结算前余额" width="140" align="right">
          <template #default="{ row }">
            <div class="balance-cell">
              ${{ row.balanceBefore.toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="balanceAfter" label="结算后余额" width="140" align="right">
          <template #default="{ row }">
            <div class="balance-cell">
              ${{ row.balanceAfter.toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="note" label="备注" min-width="150">
          <template #default="{ row }">
            <div class="note-cell">{{ row.note || '-' }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text @click="viewDetail(row)">查看详情</el-button>
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

    <!-- 结算详情弹窗 -->
    <settlement-detail-dialog 
      v-model="showDetailDialog" 
      :record="selectedRecord"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SettlementDetailDialog from './SettlementDetailDialog.vue'

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

// Emits
const emit = defineEmits(['filter-change'])

// 响应式数据
const selectedYear = ref('')
const selectedMonth = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref('')
const sortOrder = ref('')
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

// 计算属性 - 获取可用的年份和月份
const availableYears = computed(() => {
  const years = new Set()
  props.records.forEach(record => {
    const date = new Date(record.settlementTime)
    years.add(date.getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
})

const availableMonths = computed(() => {
  return Array.from({ length: 12 }, (_, i) => i + 1)
})

// 计算属性 - 筛选记录
const filteredRecords = computed(() => {
  let records = [...props.records]

  // 按年份筛选
  if (selectedYear.value) {
    records = records.filter(record => {
      const date = new Date(record.settlementTime)
      return date.getFullYear() === selectedYear.value
    })
  }

  // 按月份筛选
  if (selectedMonth.value) {
    records = records.filter(record => {
      const date = new Date(record.settlementTime)
      return date.getMonth() + 1 === selectedMonth.value
    })
  }
  
  // 排序
  if (sortField.value) {
    records.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      if (sortField.value === 'amount') {
        return sortOrder.value === 'ascending' ? aVal - bVal : bVal - aVal
      } else if (sortField.value === 'settlementTime') {
        const aTime = new Date(aVal).getTime()
        const bTime = new Date(bVal).getTime()
        return sortOrder.value === 'ascending' ? aTime - bTime : bTime - aTime
      }
      return 0
    })
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return records.slice(start, end)
})

const totalRecords = computed(() => {
  let records = [...props.records]

  // 按年份筛选
  if (selectedYear.value) {
    records = records.filter(record => {
      const date = new Date(record.settlementTime)
      return date.getFullYear() === selectedYear.value
    })
  }

  // 按月份筛选
  if (selectedMonth.value) {
    records = records.filter(record => {
      const date = new Date(record.settlementTime)
      return date.getMonth() + 1 === selectedMonth.value
    })
  }

  return records.length
})



// 方法
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleFilterChange = () => {
  currentPage.value = 1
  emitFilterChange()
}

const resetFilters = () => {
  selectedYear.value = ''
  selectedMonth.value = ''
  currentPage.value = 1
  sortField.value = ''
  sortOrder.value = ''
  emitFilterChange()
}

const handleSortChange = ({ prop, order }) => {
  sortField.value = prop
  sortOrder.value = order
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

const viewDetail = (record) => {
  selectedRecord.value = record
  showDetailDialog.value = true
}

const emitFilterChange = () => {
  emit('filter-change', {
    selectedYear: selectedYear.value,
    selectedMonth: selectedMonth.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
}

// 监听器
watch(() => props.records, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.settlement-records {
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

.amount-cell {
  font-weight: 600;
}

.amount-cell.positive {
  color: #67c23a;
}

.balance-cell {
  font-weight: 500;
  color: #303133;
}

.note-cell {
  font-size: 14px;
  color: #606266;
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