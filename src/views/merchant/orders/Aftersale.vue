<template>
  <div class="aftersale-orders-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>售后订单</h2>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-section">
      <el-card>
        <div class="filter-row">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入订单号或原订单号"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleSearch"
              />
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.storeId"
                placeholder="选择店铺"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="store in storeList"
                  :key="store.id"
                  :label="store.name"
                  :value="store.id"
                />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.status"
                placeholder="售后状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="申请中" value="pending" />
                <el-option label="处理中" value="processing" />
                <el-option label="已完成" value="completed" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="success" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 高级筛选 -->
        <el-collapse v-model="advancedFilterVisible">
          <el-collapse-item title="高级筛选" name="advanced">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="退货金额范围">
                  <el-input-number
                    v-model="searchForm.minAmount"
                    placeholder="最小金额"
                    :min="0"
                    controls-position="right"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input-number
                    v-model="searchForm.maxAmount"
                    placeholder="最大金额"
                    :min="0"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <!-- 售后订单列表 -->
    <div class="orders-table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>售后订单列表 (共 {{ total }} 条)</span>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="orderList"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="refundOrderNo" label="售后订单号" width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.id)">
                {{ row.refundOrderNo }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="originalOrderNo" label="原订单号" width="180">
            <template #default="{ row }">
              <el-link type="success" @click="goToOriginalOrder(row.originalOrderId)">
                {{ row.originalOrderNo }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="customerName" label="客户信息" width="120">
            <template #default="{ row }">
              <div class="customer-info">
                <div>{{ row.customerName }}</div>
                <div class="customer-email">{{ row.customerEmail }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="退货商品" width="280">
            <template #default="{ row }">
              <div class="refund-products">
                <div
                  v-for="(product, index) in row.products.slice(0, 2)"
                  :key="index"
                  class="product-item"
                >
                  <el-image
                    :src="product.image"
                    fit="cover"
                    class="product-image"
                  />
                  <span class="product-name">{{ product.name }} ×{{ product.quantity }}</span>
                </div>
                <span v-if="row.products.length > 2" class="more-products">
                  等{{ row.products.length }}件商品
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="退货金额" width="120">
            <template #default="{ row }">
              <span class="refund-amount">${{ row.refundAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="退还结算金额" width="150">
            <template #default="{ row }">
              <div class="settlement-refund">
                <div>{{ row.settlementCurrency }} {{ row.refundSettlementAmount.toFixed(2) }}</div>
                <div class="exchange-info">
                  ≈ ${{ row.refundUsdAmount.toFixed(2) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="退货状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="storeName" label="退货来源店铺" width="120" />

          <el-table-column label="退货时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="退货原因" width="150">
            <template #default="{ row }">
              <el-tooltip 
                :content="row.refundReason" 
                placement="top"
                :disabled="!row.refundReason || row.refundReason.length <= 20"
              >
                <span class="refund-reason">
                  {{ row.refundReason && row.refundReason.length > 20 
                      ? row.refundReason.substring(0, 20) + '...' 
                      : row.refundReason }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                @click="goToOrderDetail(row.id)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const orderList = ref([])
const storeList = ref([])
const total = ref(0)
const selectedOrders = ref([])
const advancedFilterVisible = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  storeId: '',
  status: '',
  minAmount: null,
  maxAmount: null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 生命周期
onMounted(() => {
  loadStoreList()
  loadOrderList()
})

// 方法
const loadStoreList = async () => {
  // 模拟店铺数据
  storeList.value = [
    { id: '1', name: 'TechStore Pro' },
    { id: '2', name: 'AudioWorld' },
    { id: '3', name: 'PhoneAccessories' },
    { id: '4', name: 'GamerHub' },
    { id: '5', name: 'SmartHome Solutions' },
    { id: '6', name: 'FitnessGear' },
    { id: '7', name: 'OfficeSupplies' },
    { id: '8', name: 'TechAccessories' }
  ]
}

const loadOrderList = async () => {
  loading.value = true
  try {
    // 模拟售后订单数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    orderList.value = [
      {
        id: '1',
        refundOrderNo: 'RFD202312150001',
        originalOrderNo: 'ORD202312140001',
        originalOrderId: 'order_001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        products: [
          {
            name: '智能手表 Pro Max',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
            quantity: 1
          }
        ],
        refundAmount: 299.99,
        settlementCurrency: 'EUR',
        refundSettlementAmount: 280.50,
        refundUsdAmount: 299.99,
        status: 'processing',
        storeName: 'TechStore Pro',
        createdAt: '2023-12-15 10:30:00',
        refundReason: '商品质量问题，客户不满意，要求退货退款处理。手表在使用一周后出现屏幕闪烁问题，影响正常使用。'
      },
      {
        id: '2',
        refundOrderNo: 'RFD202312150002',
        originalOrderNo: 'ORD202312140002',
        originalOrderId: 'order_002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        products: [
          {
            name: '蓝牙耳机 AirPods Pro',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=50&h=50&fit=crop',
            quantity: 1
          },
          {
            name: 'USB-C 充电线',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop',
            quantity: 1
          }
        ],
        refundAmount: 129.99,
        settlementCurrency: 'GBP',
        refundSettlementAmount: 103.20,
        refundUsdAmount: 129.99,
        status: 'completed',
        storeName: 'AudioWorld',
        createdAt: '2023-12-14 16:45:00',
        refundReason: '收到商品与描述不符，耳机颜色与网站展示不一致'
      },
      {
        id: '3',
        refundOrderNo: 'RFD202312150003',
        originalOrderNo: 'ORD202312130001',
        originalOrderId: 'order_003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@example.com',
        products: [
          {
            name: 'iPhone 15 Pro 手机壳',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=50&h=50&fit=crop',
            quantity: 2
          }
        ],
        refundAmount: 39.98,
        settlementCurrency: 'USD',
        refundSettlementAmount: 39.98,
        refundUsdAmount: 39.98,
        status: 'rejected',
        storeName: 'PhoneAccessories',
        createdAt: '2023-12-13 14:20:00',
        refundReason: '超过退货期限，商品已使用超过30天'
      },
      {
        id: '4',
        refundOrderNo: 'RFD202312150004',
        originalOrderNo: 'ORD202312120001',
        originalOrderId: 'order_004',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah.wilson@example.com',
        products: [
          {
            name: '游戏机械键盘',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=50&h=50&fit=crop',
            quantity: 1
          }
        ],
        refundAmount: 189.99,
        settlementCurrency: 'CAD',
        refundSettlementAmount: 259.00,
        refundUsdAmount: 189.99,
        status: 'pending',
        storeName: 'GamerHub',
        createdAt: '2023-12-12 11:15:00',
        refundReason: '键盘按键失灵，多个按键无法正常工作'
      },
      {
        id: '5',
        refundOrderNo: 'RFD202312150005',
        originalOrderNo: 'ORD202312110001',
        originalOrderId: 'order_005',
        customerName: 'David Brown',
        customerEmail: 'david.brown@example.com',
        products: [
          {
            name: '智能家居摄像头',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop',
            quantity: 1
          }
        ],
        refundAmount: 79.99,
        settlementCurrency: 'AUD',
        refundSettlementAmount: 120.00,
        refundUsdAmount: 79.99,
        status: 'completed',
        storeName: 'SmartHome Solutions',
        createdAt: '2023-12-11 16:30:00',
        refundReason: '摄像头无法连接WiFi，技术支持无法解决问题'
      },
      {
        id: '6',
        refundOrderNo: 'RFD202312150006',
        originalOrderNo: 'ORD202312100001',
        originalOrderId: 'order_006',
        customerName: 'Emily Davis',
        customerEmail: 'emily.davis@example.com',
        products: [
          {
            name: '运动蓝牙耳机',
            image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=50&h=50&fit=crop',
            quantity: 1
          },
          {
            name: '运动臂带',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop',
            quantity: 1
          }
        ],
        refundAmount: 85.98,
        settlementCurrency: 'EUR',
        refundSettlementAmount: 77.50,
        refundUsdAmount: 85.98,
        status: 'processing',
        storeName: 'FitnessGear',
        createdAt: '2023-12-10 09:45:00',
        refundReason: '耳机电池续航时间远低于宣传，仅能使用2小时'
      },
      {
        id: '7',
        refundOrderNo: 'RFD202312150007',
        originalOrderNo: 'ORD202312090001',
        originalOrderId: 'order_007',
        customerName: 'Michael Johnson',
        customerEmail: 'michael.johnson@example.com',
        products: [
          {
            name: '钢化膜套装',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=50&h=50&fit=crop',
            quantity: 3
          }
        ],
        refundAmount: 29.97,
        settlementCurrency: 'USD',
        refundSettlementAmount: 29.97,
        refundUsdAmount: 29.97,
        status: 'rejected',
        storeName: 'PhoneAccessories',
        createdAt: '2023-12-09 14:20:00',
        refundReason: '商品已拆封使用，不符合退货条件'
      }
    ]
    
    total.value = 43
  } catch (error) {
    ElMessage.error('加载售后订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadOrderList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    dateRange: [],
    storeId: '',
    status: '',
    minAmount: null,
    maxAmount: null
  })
  pagination.page = 1
  loadOrderList()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadOrderList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadOrderList()
}

const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
}

const goToOriginalOrder = (originalOrderId) => {
  router.push(`/merchant/orders/${originalOrderId}`)
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '申请中',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.aftersale-orders-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-filter-section {
  margin-bottom: 20px;
}

.filter-row {
  margin-bottom: 16px;
}

.orders-table-section {
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-info .customer-email {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.refund-products {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.product-name {
  font-size: 12px;
  color: #606266;
  flex: 1;
}

.more-products {
  font-size: 12px;
  color: #909399;
}

.refund-amount {
  font-weight: 600;
  color: #F56C6C;
}

.settlement-refund .exchange-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.refund-reason {
  color: #606266;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
}

:deep(.el-tooltip__trigger) {
  cursor: help;
}
</style> 