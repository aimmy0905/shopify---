<template>
  <div class="commission-details">
    <!-- 佣金统计信息 -->
    <div class="commission-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">筛选结果总佣金</div>
          <div class="stat-value">${{ filteredTotal.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">待结算总额</div>
          <div class="stat-value pending">${{ pendingTotal.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">已结算总额</div>
          <div class="stat-value settled">${{ settledTotal.toFixed(2) }}</div>
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
        
        <el-select 
          v-model="levelFilter" 
          placeholder="佣金层级" 
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="一级佣金" value="1"></el-option>
          <el-option label="二级佣金" value="2"></el-option>
        </el-select>
        
        <el-select 
          v-model="statusFilter" 
          placeholder="结算状态" 
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="待结算" value="pending"></el-option>
          <el-option label="已结算" value="settled"></el-option>
        </el-select>
        
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>

    <!-- 佣金明细列表 -->
    <div class="table-container">
      <el-table 
        :data="filteredRecords" 
        :loading="loading"
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column prop="time" label="时间" width="160" sortable="custom">
          <template #default="{ row }">
            <div class="time-cell">{{ formatTime(row.time) }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="source" label="佣金来源" min-width="200">
          <template #default="{ row }">
            <div class="source-cell">
              <div class="source-main">{{ row.source }}</div>
              <div class="source-sub">来自: {{ row.referralUser }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="level" label="佣金层级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.level === 1 ? 'primary' : 'success'" size="small">
              {{ row.level === 1 ? '一级' : '二级' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="佣金金额" width="120" align="right" sortable="custom">
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
        
        <el-table-column prop="settlementTime" label="结算时间" width="160">
          <template #default="{ row }">
            <div class="time-cell">
              {{ row.settlementTime ? formatTime(row.settlementTime) : '-' }}
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

// Emits
const emit = defineEmits(['filter-change'])

// 响应式数据
const dateRange = ref([])
const levelFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const sortField = ref('')
const sortOrder = ref('')

// 计算属性
const filteredRecords = computed(() => {
  let records = [...props.records]
  
  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    records = records.filter(record => {
      const recordDate = record.time.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  // 按层级筛选
  if (levelFilter.value) {
    records = records.filter(record => record.level === Number(levelFilter.value))
  }
  
  // 按状态筛选
  if (statusFilter.value) {
    records = records.filter(record => record.status === statusFilter.value)
  }
  
  // 排序
  if (sortField.value) {
    records.sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      if (sortField.value === 'amount') {
        return sortOrder.value === 'ascending' ? aVal - bVal : bVal - aVal
      } else if (sortField.value === 'time') {
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
      const recordDate = record.time.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  if (levelFilter.value) {
    records = records.filter(record => record.level === Number(levelFilter.value))
  }
  
  if (statusFilter.value) {
    records = records.filter(record => record.status === statusFilter.value)
  }
  
  return records.length
})

const filteredTotal = computed(() => {
  let records = [...props.records]
  
  // 应用筛选条件
  if (dateRange.value && dateRange.value.length === 2) {
    records = records.filter(record => {
      const recordDate = record.time.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  if (levelFilter.value) {
    records = records.filter(record => record.level === Number(levelFilter.value))
  }
  
  if (statusFilter.value) {
    records = records.filter(record => record.status === statusFilter.value)
  }
  
  return records.reduce((sum, record) => sum + record.amount, 0)
})

const pendingTotal = computed(() => {
  return props.records
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0)
})

const settledTotal = computed(() => {
  return props.records
    .filter(record => record.status === 'settled')
    .reduce((sum, record) => sum + record.amount, 0)
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
  levelFilter.value = ''
  statusFilter.value = ''
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

const emitFilterChange = () => {
  emit('filter-change', {
    dateRange: dateRange.value,
    levelFilter: levelFilter.value,
    statusFilter: statusFilter.value,
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
.commission-details {
  padding: 16px 0;
}

/* 统计信息 */
.commission-stats {
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

.stat-value.pending {
  color: #e6a23c;
}

.stat-value.settled {
  color: #67c23a;
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

.filter-row .el-select {
  min-width: 120px;
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
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .filter-row .el-date-editor,
  .filter-row .el-select {
    min-width: auto;
    width: 100%;
  }
}
</style> 