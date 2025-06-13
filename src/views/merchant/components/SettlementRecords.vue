<template>
  <div class="settlement-records">
    <!-- 结算统计信息 -->
    <div class="settlement-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">累计结算总金额</div>
          <div class="stat-value">${{ totalSettlementAmount.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">平均每月结算金额</div>
          <div class="stat-value">${{ averageMonthlyAmount.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总结算次数</div>
          <div class="stat-value">{{ records.length }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选工具 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />
        
        <div class="amount-filter">
          <el-input 
            v-model="amountRange[0]" 
            placeholder="最小金额" 
            type="number"
            @input="handleFilterChange"
          />
          <span class="range-separator">-</span>
          <el-input 
            v-model="amountRange[1]" 
            placeholder="最大金额" 
            type="number"
            @input="handleFilterChange"
          />
        </div>
        
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
const dateRange = ref([])
const amountRange = ref(['', ''])
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref('')
const sortOrder = ref('')
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

// 计算属性
const filteredRecords = computed(() => {
  let records = [...props.records]
  
  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    records = records.filter(record => {
      const recordDate = record.settlementTime.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  // 按金额筛选
  if (amountRange.value[0] !== '') {
    records = records.filter(record => record.amount >= Number(amountRange.value[0]))
  }
  if (amountRange.value[1] !== '') {
    records = records.filter(record => record.amount <= Number(amountRange.value[1]))
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
  
  // 应用筛选条件
  if (dateRange.value && dateRange.value.length === 2) {
    records = records.filter(record => {
      const recordDate = record.settlementTime.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  if (amountRange.value[0] !== '') {
    records = records.filter(record => record.amount >= Number(amountRange.value[0]))
  }
  if (amountRange.value[1] !== '') {
    records = records.filter(record => record.amount <= Number(amountRange.value[1]))
  }
  
  return records.length
})

const totalSettlementAmount = computed(() => {
  return props.records.reduce((sum, record) => sum + record.amount, 0)
})

const averageMonthlyAmount = computed(() => {
  if (props.records.length === 0) return 0
  return totalSettlementAmount.value / props.records.length
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
  dateRange.value = []
  amountRange.value = ['', '']
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
    dateRange: dateRange.value,
    amountRange: amountRange.value,
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

/* 统计信息 */
.settlement-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
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

.filter-row .el-date-editor {
  min-width: 280px;
}

.amount-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-filter .el-input {
  width: 120px;
}

.range-separator {
  color: #909399;
  font-weight: 500;
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
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-row .el-date-editor {
    min-width: auto;
    width: 100%;
  }
  
  .amount-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .amount-filter .el-input {
    width: 100%;
  }
  
  .range-separator {
    text-align: center;
  }
}
</style> 