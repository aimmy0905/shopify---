<template>
  <div class="admin-store-orders-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">店铺订单管理</h1>
        <p class="page-description">管理来自各个店铺的订单信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Document" @click="handleExport">
          导出订单
        </el-button>
        <el-button type="success" :icon="DataAnalysis" @click="handleStats">
          订单统计
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-card>
        <el-form :model="searchForm" inline>
          <el-form-item label="订单号">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入订单号"
              clearable
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="店铺">
            <el-select
              v-model="searchForm.storeId"
              placeholder="请选择店铺"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="store in storeList"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="订单状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="待发货" value="pending" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 订单列表 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>订单列表</span>
            <div class="table-actions">
              <el-button
                v-if="selectedOrders.length > 0"
                type="primary"
                size="small"
                @click="handleBatchProcess"
              >
                批量处理 ({{ selectedOrders.length }})
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="orderList"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column prop="orderNo" label="订单号" width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.id)">
                {{ row.orderNo }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <div v-for="(product, index) in row.products" :key="index" class="product-item">
                  <el-image
                    :src="product.image"
                    :alt="product.name"
                    class="product-image"
                    fit="cover"
                  />
                  <div class="product-details">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-specs">
                      <span v-if="product.specifications.color">{{ product.specifications.color }}</span>
                      <span v-if="product.specifications.size">{{ product.specifications.size }}</span>
                    </div>
                    <div class="product-price">
                      单价: ${{ product.unitPrice.toFixed(2) }} × {{ product.quantity }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="storeName" label="店铺" width="150" />

          <el-table-column prop="customerName" label="客户" width="120" />

          <el-table-column label="订单金额" width="120">
            <template #default="{ row }">
              <div class="amount-info">
                <div class="total-amount">${{ row.totalAmount.toFixed(2) }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="160" />

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                @click="goToOrderDetail(row.id)"
              >
                查看详情
              </el-button>

              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="success"
                link
                @click="handleShip(row)"
              >
                发货
              </el-button>

              <el-button
                v-if="row.status === 'shipped'"
                size="small"
                type="info"
                link
                @click="viewLogistics(row)"
              >
                查看物流
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
import { Search, Document, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const orderList = ref([])
const storeList = ref([])
const total = ref(0)
const selectedOrders = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  storeId: '',
  status: ''
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
    { id: '5', name: 'SmartHome Solutions' }
  ]
}

const loadOrderList = async () => {
  loading.value = true
  try {
    // 模拟订单数据
    await new Promise(resolve => setTimeout(resolve, 1000))

    orderList.value = [
      {
        id: '1',
        orderNo: 'ORD202312150001',
        products: [
          {
            name: '智能手表 Pro Max',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 299.99,
            specifications: {
              color: '深空黑',
              size: '44mm'
            }
          }
        ],
        storeName: 'TechStore Pro',
        customerName: 'John Doe',
        totalAmount: 329.99,
        status: 'shipped',
        createdAt: '2023-12-15 10:30:00'
      },
      {
        id: '2',
        orderNo: 'ORD202312150002',
        products: [
          {
            name: '无线耳机 AirPods Pro',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=50&h=50&fit=crop',
            quantity: 2,
            unitPrice: 199.99,
            specifications: {
              color: '白色'
            }
          }
        ],
        storeName: 'AudioWorld',
        customerName: 'Jane Smith',
        totalAmount: 419.98,
        status: 'pending',
        createdAt: '2023-12-15 11:15:00'
      },
      {
        id: '3',
        orderNo: 'ORD202312150003',
        products: [
          {
            name: '手机保护壳',
            image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=50&h=50&fit=crop',
            quantity: 3,
            unitPrice: 15.99,
            specifications: {
              color: '透明',
              model: 'iPhone 15 Pro'
            }
          }
        ],
        storeName: 'PhoneAccessories',
        customerName: 'Mike Johnson',
        totalAmount: 47.97,
        status: 'completed',
        createdAt: '2023-12-15 09:20:00'
      }
    ]

    total.value = 156
  } catch (error) {
    ElMessage.error('加载订单列表失败')
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
    status: ''
  })
  pagination.page = 1
  loadOrderList()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleStats = () => {
  ElMessage.success('统计功能开发中...')
}

const handleBatchProcess = () => {
  ElMessage.success(`批量处理 ${selectedOrders.value.length} 个订单`)
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
  router.push(`/admin/orders/${orderId}`)
}

const handleShip = (order) => {
  ElMessage.success(`订单 ${order.orderNo} 发货成功`)
  loadOrderList()
}

const viewLogistics = (order) => {
  ElMessage.info(`查看订单 ${order.orderNo} 的物流信息`)
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}
</script>

<style lang="scss" scoped>
.admin-store-orders-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-description {
      color: #909399;
      margin: 0;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.product-info {
  .product-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .product-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .product-details {
      flex: 1;
      min-width: 0;

      .product-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-specs {
        font-size: 12px;
        color: #909399;
        margin-bottom: 2px;

        span {
          margin-right: 8px;
        }
      }

      .product-price {
        font-size: 12px;
        color: #67C23A;
        font-weight: 500;
      }
    }
  }
}

.amount-info {
  .total-amount {
    font-weight: 600;
    color: #67C23A;
    font-size: 14px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>