<template>
  <div class="applications-container">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h1 class="page-title">采购申请列表</h1>
      <el-button type="primary" size="large" @click="$router.push('/merchant/purchase/create')">
        <el-icon><Plus /></el-icon>
        发起采购申请
      </el-button>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="按产品名称、ID搜索"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          style="width: 150px"
          @change="handleStatusFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="报价中" value="quoting" />
          <el-option label="报价成功" value="quoted" />
          <el-option label="报价失败" value="failed" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          @change="handleDateFilter"
        />

        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 采购申请列表 -->
    <div class="table-section">
      <el-table 
        :data="applicationList" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column label="产品信息" width="200">
          <template #default="scope">
            <div class="product-info">
              <img 
                :src="scope.row.productImage" 
                :alt="scope.row.productName"
                class="product-image"
                @error="handleImageError"
              />
              <div class="product-details">
                <div class="product-name">{{ scope.row.productName }}</div>
                <el-link 
                  :href="scope.row.productUrl" 
                  target="_blank" 
                  type="primary"
                  class="product-url"
                >
                  查看商品
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="targetCountry" label="目标国家/地区" width="120" />
        
        <el-table-column prop="targetPrice" label="目标价格" width="100">
          <template #default="scope">
            ${{ scope.row.targetPrice }}
          </template>
        </el-table-column>

        <el-table-column prop="dailyOrderCount" label="日单量" width="80" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="remarks" label="备注" width="150">
          <template #default="scope">
            <div class="remarks-text">
              {{ scope.row.remarks || '-' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="申请日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.quoteDocument"
                type="primary" 
                link 
                size="small"
                @click="viewQuote(scope.row)"
              >
                查看报价
              </el-button>
              <el-button 
                type="primary" 
                link 
                size="small"
                @click="viewDetail(scope.row.id)"
              >
                查看详情
              </el-button>
              <el-button 
                v-if="scope.row.status === 'pending'"
                type="danger" 
                link 
                size="small"
                @click="deleteApplication(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && applicationList.length === 0" class="empty-state">
        <el-empty description="暂无采购申请记录">
          <el-button type="primary" @click="$router.push('/merchant/purchase/create')">
            发起首个采购申请
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 报价单查看弹窗 -->
    <QuoteViewDialog 
      v-model="quoteDialogVisible"
      :quote-data="selectedQuote"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import QuoteViewDialog from './components/QuoteViewDialog.vue'
import { useRouter } from 'vue-router'
import { purchaseApplications } from '@/data/mockData.js'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const dateRange = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const applicationList = ref([])
const quoteDialogVisible = ref(false)
const selectedQuote = ref(null)

// 获取采购申请列表
const fetchApplications = async () => {
  loading.value = true
  try {
    // 使用实际的mock数据
    const mockData = purchaseApplications.map(app => ({
      id: app.id,
      productName: app.product_name,
      productImage: app.product_image,
      productUrl: app.product_url,
      targetCountry: app.target_country,
      targetPrice: app.target_price,
      dailyOrderCount: app.daily_orders,
      status: app.status,
      remarks: app.remark,
      createdAt: app.created_at,
      finalQuote: app.final_quote,
      quoteDocument: app.quote_document
    }))

    applicationList.value = mockData
    total.value = mockData.length
  } catch (error) {
    ElMessage.error('获取采购申请列表失败')
  } finally {
    loading.value = false
  }
}

// 状态处理方法
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    quotation_pending: 'info',
    quotation_processing: 'primary',
    quotation_success: 'success',
    quotation_failed: 'danger',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    quotation_pending: '待报价',
    quotation_processing: '报价中',
    quotation_success: '报价成功',
    quotation_failed: '报价失败',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchApplications()
}

// 状态筛选
const handleStatusFilter = () => {
  currentPage.value = 1
  fetchApplications()
}

// 日期筛选
const handleDateFilter = () => {
  currentPage.value = 1
  fetchApplications()
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  statusFilter.value = ''
  dateRange.value = ''
  currentPage.value = 1
  fetchApplications()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchApplications()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchApplications()
}

// 查看报价
const viewQuote = (row) => {
  selectedQuote.value = row
  quoteDialogVisible.value = true
}

// 查看详情
const viewDetail = (id) => {
  router.push(`/merchant/purchase/${id}`)
}

// 删除申请
const deleteApplication = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除采购申请"${row.productName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟删除API调用
    ElMessage.success('删除成功')
    fetchApplications()
  } catch {
    // 用户取消删除
  }
}

// 图片加载错误处理
const handleImageError = (event) => {
  // 设置默认的SVG图片
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEREREREQiLz4KPHRleHQgeD0iMzAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LXNpemU9IjgiPuWVhuWTgTwvdGV4dD4KPC9zdmc+Cg=='
}

// 初始化数据
onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.applications-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.table-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e4e7ed;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-url {
  font-size: 12px;
}

.remarks-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagination-section {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 40px;
  text-align: center;
}
</style> 