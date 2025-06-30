<template>
  <div class="aftersale-orders-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>售后订单管理</h2>
      <p>管理所有商家的售后订单，处理退货退款申请</p>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号、客户名称、商家名称"
            style="width: 300px"
            :prefix-icon="Search"
            clearable
          />
          <el-select v-model="filterStatus" placeholder="售后状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="申请中" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-select v-model="filterType" placeholder="售后类型" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="仅退款" value="refund_only" />
            <el-option label="退货退款" value="return_refund" />
            <el-option label="换货" value="exchange" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </div>
        <div class="filter-right">
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Download" @click="exportOrders">
            导出数据
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 售后订单列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>售后订单列表 (共 {{ total }} 条)</span>
          <div class="header-actions">
            <el-button 
              type="danger" 
              size="small"
              :disabled="selectedOrders.length === 0"
              @click="handleBatchOperation"
            >
              批量处理 ({{ selectedOrders.length }})
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredOrders" 
        style="width: 100%" 
        stripe
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="售后订单号" width="160">
          <template #default="scope">
            <el-link type="primary" @click="viewOrderDetail(scope.row)">
              {{ scope.row.aftersale_order_no }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="原订单号" width="160">
          <template #default="scope">
            <el-link type="success" @click="viewOriginalOrder(scope.row)">
              {{ scope.row.original_order_no }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="商家信息" width="150">
          <template #default="scope">
            <div>
              <div style="font-weight: 500;">{{ scope.row.merchant_name }}</div>
              <div style="font-size: 12px; color: #909399;">
                ID: {{ scope.row.merchant_id }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="客户信息" width="150">
          <template #default="scope">
            <div>
              <div style="font-weight: 500;">{{ scope.row.customer_name }}</div>
              <div style="font-size: 12px; color: #909399;">
                {{ scope.row.customer_email }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="售后类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="退款金额" width="120">
          <template #default="scope">
            <div style="font-weight: 500; color: #E6A23C;">
              ${{ scope.row.refund_amount.toFixed(2) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="退款商家余额" width="140">
          <template #default="scope">
            <div style="font-weight: 500; color: #67C23A;">
              ${{ (scope.row.refund_amount * 0.95).toFixed(2) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewOrderDetail(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const dateRange = ref([])
const selectedOrders = ref([])

// 分页数据
const pagination = reactive({
  current: 1,
  size: 20
})

// 模拟售后订单数据
const orderList = ref([
  {
    id: 1,
    aftersale_order_no: 'AS202401001',
    original_order_no: 'SO202312001',
    merchant_id: 1001,
    merchant_name: '优质商家A',
    customer_name: '张三',
    customer_email: 'zhang@example.com',
    type: 'refund_only',
    status: 'pending',
    refund_amount: 299.99,
    reason: '商品质量问题',
    created_at: '2024-01-15 10:30:00',
    processed_at: null
  },
  {
    id: 2,
    aftersale_order_no: 'AS202401002',
    original_order_no: 'SO202312002',
    merchant_id: 1002,
    merchant_name: '品质商家B',
    customer_name: '李四',
    customer_email: 'li@example.com',
    type: 'return_refund',
    status: 'processing',
    refund_amount: 459.50,
    reason: '商品不符合描述',
    created_at: '2024-01-14 15:20:00',
    processed_at: '2024-01-15 09:00:00'
  },
  {
    id: 3,
    aftersale_order_no: 'AS202401003',
    original_order_no: 'SO202312003',
    merchant_id: 1001,
    merchant_name: '优质商家A',
    customer_name: '王五',
    customer_email: 'wang@example.com',
    type: 'exchange',
    status: 'completed',
    refund_amount: 0,
    reason: '尺寸不合适',
    created_at: '2024-01-13 11:45:00',
    processed_at: '2024-01-14 16:30:00'
  },
  {
    id: 4,
    aftersale_order_no: 'AS202401004',
    original_order_no: 'SO202312004',
    merchant_id: 1003,
    merchant_name: '信誉商家C',
    customer_name: '赵六',
    customer_email: 'zhao@example.com',
    type: 'refund_only',
    status: 'rejected',
    refund_amount: 199.00,
    reason: '不喜欢',
    created_at: '2024-01-12 14:15:00',
    processed_at: '2024-01-13 10:20:00'
  }
])

// 计算属性
const filteredOrders = computed(() => {
  return orderList.value.filter(order => {
    const matchKeyword = !searchKeyword.value || 
      order.aftersale_order_no.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      order.original_order_no.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      order.merchant_name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchStatus = !filterStatus.value || order.status === filterStatus.value
    const matchType = !filterType.value || order.type === filterType.value
    
    return matchKeyword && matchStatus && matchType
  })
})

const total = computed(() => filteredOrders.value.length)

// 状态映射函数
const getStatusType = (status) => {
  const statusTypes = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'rejected': 'danger'
  }
  return statusTypes[status] || 'info'
}

const getStatusText = (status) => {
  const statusTexts = {
    'pending': '申请中',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return statusTexts[status] || '未知状态'
}

const getTypeTagType = (type) => {
  const typeMap = {
    'refund_only': 'warning',
    'return_refund': 'primary',
    'exchange': 'success'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type) => {
  const typeTexts = {
    'refund_only': '仅退款',
    'return_refund': '退货退款',
    'exchange': '换货'
  }
  return typeTexts[type] || '未知类型'
}

// 方法
const handleSearch = () => {
  pagination.current = 1
  // 这里可以添加API调用逻辑
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const viewOrderDetail = (order) => {
  router.push(`/admin/orders/aftersale/${order.id}`)
}

const viewOriginalOrder = (order) => {
  router.push(`/admin/orders/store/${order.original_order_no}`)
}

// 移除了批准和拒绝的操作方法，页面改为仅查看模式

const handleBatchOperation = () => {
  ElMessage.info('批量操作功能开发中...')
}

const exportOrders = () => {
  ElMessage.success('数据导出功能开发中...')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
}

const handleCurrentChange = (current) => {
  pagination.current = current
}

onMounted(() => {
  // 页面加载时的初始化操作
})
</script>

<style scoped>
.aftersale-orders-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left {
    flex-direction: column;
  }
  
  .filter-right {
    justify-content: center;
  }
}
</style> 