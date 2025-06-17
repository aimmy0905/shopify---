<template>
  <el-dialog
    v-model="visible"
    title="佣金详情"
    width="900px"
    :before-close="handleClose"
  >
    <div v-if="user" class="commission-detail">
      <!-- 佣金概览 -->
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ user.name }} 的佣金概览</span>
            <el-tag :type="user.status === 'active' ? 'success' : 'danger'">
              {{ user.status === 'active' ? '活跃用户' : '非活跃用户' }}
            </el-tag>
          </div>
        </template>
        
        <div class="overview-stats">
          <div class="stat-item total">
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ user.totalCommission.toFixed(2) }}</div>
              <div class="stat-label">累计佣金</div>
            </div>
          </div>
          
          <div class="stat-item settled">
            <div class="stat-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ (user.totalCommission * 0.7).toFixed(2) }}</div>
              <div class="stat-label">已结算</div>
            </div>
          </div>
          
          <div class="stat-item pending">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ (user.totalCommission * 0.3).toFixed(2) }}</div>
              <div class="stat-label">待结算</div>
            </div>
          </div>
          
          <div class="stat-item monthly">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ user.monthlyCommission.toFixed(2) }}</div>
              <div class="stat-label">本月佣金</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 佣金明细 -->
      <el-card class="records-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">佣金明细记录</span>
            <div class="header-actions">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                @change="loadCommissionRecords"
              />
              <el-button size="small" @click="exportRecords">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table
          v-loading="recordsLoading"
          :data="commissionRecords"
          border
          max-height="400"
        >
          <el-table-column label="时间" width="180">
            <template #default="scope">
              {{ scope.row.createdAt }}
            </template>
          </el-table-column>
          <el-table-column label="来源" min-width="200">
            <template #default="scope">
              <div class="source-info">
                <div class="source-type">
                  <el-tag size="small" :type="getSourceTypeColor(scope.row.sourceType)">
                    {{ getSourceTypeName(scope.row.sourceType) }}
                  </el-tag>
                </div>
                <div class="source-detail">{{ scope.row.sourceDetail }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="层级" width="80" align="center">
            <template #default="scope">
              <el-tag size="small" :type="scope.row.level === 1 ? 'success' : 'warning'">
                L{{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="佣金金额" width="120" align="right">
            <template #default="scope">
              <span class="commission-amount">+${{ scope.row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag size="small" :type="getStatusColor(scope.row.status)">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="结算时间" width="180">
            <template #default="scope">
              <span v-if="scope.row.settledAt">{{ scope.row.settledAt }}</span>
              <span v-else class="not-settled">未结算</span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalRecords"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadCommissionRecords"
            @current-change="loadCommissionRecords"
          />
        </div>
      </el-card>

      <!-- 佣金趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">佣金趋势</span>
        </template>
        
        <div class="chart-container">
          <div class="chart-placeholder">
            <el-icon size="48"><TrendCharts /></el-icon>
            <p>佣金趋势图表</p>
            <p class="chart-note">显示最近12个月的佣金变化趋势</p>
          </div>
        </div>
      </el-card>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="success" @click="settleCommission" :disabled="!hasPendingCommission">
          立即结算
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Money, 
  Check, 
  Clock, 
  TrendCharts, 
  Download 
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const recordsLoading = ref(false)
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)
const commissionRecords = ref([])

// 计算属性
const hasPendingCommission = computed(() => {
  return props.user && (props.user.totalCommission * 0.3) > 0
})

// 监听显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.user) {
    loadCommissionRecords()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const handleClose = () => {
  visible.value = false
}

const loadCommissionRecords = async () => {
  if (!props.user) return
  
  recordsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟佣金记录数据
    commissionRecords.value = [
      {
        id: 1,
        createdAt: '2023-11-15 14:30:00',
        sourceType: 'order',
        sourceDetail: '用户 Alice Johnson 的订单 #ORD001',
        level: 1,
        amount: 25.50,
        status: 'settled',
        settledAt: '2023-12-01 10:00:00'
      },
      {
        id: 2,
        createdAt: '2023-11-20 09:15:00',
        sourceType: 'referral',
        sourceDetail: '下级用户 Bob Wilson 推荐奖励',
        level: 2,
        amount: 12.80,
        status: 'pending',
        settledAt: null
      },
      {
        id: 3,
        createdAt: '2023-11-25 16:45:00',
        sourceType: 'bonus',
        sourceDetail: '月度活跃奖励',
        level: 1,
        amount: 50.00,
        status: 'settled',
        settledAt: '2023-12-01 10:00:00'
      }
    ]
    
    totalRecords.value = 25
  } catch (error) {
    console.error('加载佣金记录失败:', error)
    ElMessage.error('加载佣金记录失败')
  } finally {
    recordsLoading.value = false
  }
}

const getSourceTypeColor = (type) => {
  const colorMap = {
    order: 'success',
    referral: 'primary',
    bonus: 'warning'
  }
  return colorMap[type] || 'info'
}

const getSourceTypeName = (type) => {
  const nameMap = {
    order: '订单佣金',
    referral: '推荐奖励',
    bonus: '奖励佣金'
  }
  return nameMap[type] || '其他'
}

const getStatusColor = (status) => {
  const colorMap = {
    settled: 'success',
    pending: 'warning',
    cancelled: 'danger'
  }
  return colorMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    settled: '已结算',
    pending: '待结算',
    cancelled: '已取消'
  }
  return nameMap[status] || '未知'
}

const exportRecords = () => {
  ElMessage.success('导出功能开发中...')
}

const settleCommission = () => {
  ElMessage.success('结算功能开发中...')
}
</script>

<style scoped>
.commission-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-card,
.records-card,
.chart-card {
  border: 1px solid #ebeef5;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 概览统计 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
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

.stat-item.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-item.settled .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-item.pending .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-item.monthly .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #606266;
}

/* 来源信息 */
.source-info {
  line-height: 1.4;
}

.source-type {
  margin-bottom: 4px;
}

.source-detail {
  font-size: 12px;
  color: #606266;
}

/* 佣金金额 */
.commission-amount {
  font-weight: 600;
  color: #67c23a;
}

.not-settled {
  color: #909399;
  font-style: italic;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 图表容器 */
.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 8px 0;
}

.chart-note {
  font-size: 12px;
  color: #c0c4cc;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>
