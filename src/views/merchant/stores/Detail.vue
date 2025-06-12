<template>
  <div class="store-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item>
        <router-link to="/merchant/stores">我的店铺</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ storeInfo.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 店铺基本信息 -->
    <div class="store-header">
      <div class="store-basic-info">
        <div class="store-avatar">
          <el-icon size="40" color="#409eff"><Shop /></el-icon>
        </div>
        <div class="store-details">
          <h1 class="store-name">{{ storeInfo.name }}</h1>
          <div class="store-meta">
            <div class="meta-item">
              <el-icon><Link /></el-icon>
              <el-link :href="storeInfo.url" target="_blank" type="primary">
                {{ storeInfo.url }}
              </el-link>
            </div>
            <div class="meta-item">
              <el-icon><Key /></el-icon>
              <span>店铺ID: {{ storeInfo.shopify_id }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>添加时间: {{ formatDate(storeInfo.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="store-actions">
        <el-tag
          :type="storeInfo.status === 'active' ? 'success' : 'danger'"
          size="large"
        >
          {{ storeInfo.status === 'active' ? '授权正常' : '授权已过期' }}
        </el-tag>
        <div class="action-buttons">
          <el-button v-if="storeInfo.status !== 'active'" type="primary" @click="handleReauth">
            重新授权
          </el-button>
          <el-button type="success" @click="handleSync" :loading="syncing">
            <el-icon><Refresh /></el-icon>
            同步数据
          </el-button>
          <el-button type="danger" @click="handleDeleteStore">
            <el-icon><Delete /></el-icon>
            删除店铺
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card products-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon size="24"><Goods /></el-icon>
          </div>
          <div class="card-title">店铺商品</div>
        </div>
        <div class="card-content">
          <div class="main-value">{{ storeStats.totalProducts }}</div>
          <div class="sub-info">
            <span class="sub-value">+{{ storeStats.newProducts }}</span>
            <span class="sub-label">本月新增</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card orders-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon size="24"><DocumentChecked /></el-icon>
          </div>
          <div class="card-title">订单数量</div>
        </div>
        <div class="card-content">
          <div class="main-value">{{ storeStats.totalOrders }}</div>
          <div class="sub-info">
            <span class="sub-value">+{{ storeStats.newOrders }}</span>
            <span class="sub-label">本月新增</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card revenue-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon size="24"><Money /></el-icon>
          </div>
          <div class="card-title">销售收入</div>
        </div>
        <div class="card-content">
          <div class="main-value">${{ storeStats.totalRevenue }}</div>
          <div class="sub-info">
            <span class="sub-value">+${{ storeStats.monthlyRevenue }}</span>
            <span class="sub-label">本月收入</span>
          </div>
        </div>
      </div>
      
      <div class="overview-card sync-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon size="24"><Upload /></el-icon>
          </div>
          <div class="card-title">同步状态</div>
        </div>
        <div class="card-content">
          <div class="main-value">{{ storeStats.syncedProducts }}</div>
          <div class="sub-info">
            <span class="sub-value">{{ storeStats.syncRate }}%</span>
            <span class="sub-label">同步率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史数据图表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>数据趋势</h3>
        <el-radio-group v-model="chartPeriod" @change="updateChart">
          <el-radio-button label="7d">近7天</el-radio-button>
          <el-radio-button label="30d">近30天</el-radio-button>
          <el-radio-button label="90d">近90天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container">
        <div class="chart-placeholder">
          <el-icon size="48" color="#c0c4cc"><TrendCharts /></el-icon>
          <p>数据图表展示区域</p>
          <p class="chart-note">（实际项目中这里会显示 ECharts 图表）</p>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-section">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="店铺商品" name="products">
          <div class="tab-content">
            <div class="content-header">
              <h4>店铺商品列表</h4>
              <div class="header-actions">
                <el-radio-group v-model="productsPeriod" @change="updateProductsData">
                  <el-radio-button label="3d">3天</el-radio-button>
                  <el-radio-button label="15d">15天</el-radio-button>
                  <el-radio-button label="30d">30天</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small">
                  <el-icon><Plus /></el-icon>
                  添加商品
                </el-button>
              </div>
            </div>
            <el-table :data="productList" stripe>
              <el-table-column type="index" label="排名" width="60" />
              <el-table-column label="商品信息" min-width="200">
                <template #default="{ row }">
                  <div class="product-info">
                    <img :src="row.image" :alt="row.name" class="product-image" @error="handleImageError" />
                    <div class="product-details">
                      <div class="product-name">{{ row.name }}</div>
                      <div class="product-sku">SKU: {{ row.sku }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="price" label="价格" width="100">
                <template #default="{ row }">
                  ${{ row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="inventory" label="库存" width="80" />
              <el-table-column prop="sales" label="销量" width="80">
                <template #default="{ row }">
                  <span class="sales-count">{{ row.sales }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="revenue" label="销售额" width="100">
                <template #default="{ row }">
                  <span class="revenue-amount">${{ row.revenue }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'active' ? '上架' : '下架' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button size="small" type="text" @click="viewProduct(row)">查看</el-button>
                  <el-button size="small" type="text" @click="syncProduct(row)">同步</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="店铺订单" name="orders">
          <div class="tab-content">
            <div class="content-header">
              <h4>店铺订单列表</h4>
              <div class="header-actions">
                <el-select v-model="orderTypeFilter" placeholder="订单类型" style="width: 120px; margin-right: 12px;">
                  <el-option label="全部订单" value="all" />
                  <el-option label="普通订单" value="normal" />
                  <el-option label="售后订单" value="aftersale" />
                </el-select>
              </div>
            </div>
            <el-table :data="filteredOrderList" stripe>
              <el-table-column prop="order_number" label="订单号" width="140" />
              <el-table-column prop="customer_name" label="客户姓名" width="120" />
              <el-table-column label="订单类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.order_type === 'aftersale' ? 'warning' : 'primary'" size="small">
                    {{ row.order_type === 'aftersale' ? '售后订单' : '普通订单' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="total_amount" label="订单金额" width="100">
                <template #default="{ row }">
                  ${{ row.total_amount }}
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="下单时间" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="发货状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getShippingStatusType(row.shipping_status)" size="small">
                    {{ getShippingStatusText(row.shipping_status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="订单状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.status)" size="small">
                    {{ getOrderStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button size="small" type="text" @click="viewOrder(row)">查看</el-button>
                  <el-button 
                    v-if="row.shipping_status === 'shipped'" 
                    size="small" 
                    type="text" 
                    @click="viewShippingInfo(row)"
                  >
                    发货信息
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="同步记录" name="sync-logs">
          <div class="tab-content">
            <div class="content-header">
              <h4>数据同步记录</h4>
              <el-button type="primary" size="small" @click="handleSync">
                <el-icon><Refresh /></el-icon>
                立即同步
              </el-button>
            </div>
            <el-table :data="syncLogs" stripe>
              <el-table-column prop="sync_type" label="同步类型" />
              <el-table-column prop="sync_time" label="同步时间">
                <template #default="{ row }">
                  {{ formatDateTime(row.sync_time) }}
                </template>
              </el-table-column>
              <el-table-column label="同步状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sync_count" label="同步数量" />
              <el-table-column prop="message" label="备注" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Shop,
  Link,
  Key,
  Calendar,
  Refresh,
  Delete,
  Goods,
  DocumentChecked,
  Money,
  Upload,
  TrendCharts,
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const syncing = ref(false)
const chartPeriod = ref('30d')
const activeTab = ref('products')
const productsPeriod = ref('30d')
const orderTypeFilter = ref('all')

// 店铺基本信息（模拟数据）
const storeInfo = ref({
  id: route.params.id,
  name: 'Fashion Store',
  url: 'https://fashion-store.myshopify.com',
  shopify_id: 'shop_12345',
  status: 'active',
  created_at: '2023-12-01T10:00:00Z'
})

// 店铺统计数据
const storeStats = ref({
  totalProducts: 156,
  newProducts: 12,
  totalOrders: 1234,
  newOrders: 89,
  totalRevenue: '45,678.90',
  monthlyRevenue: '8,234.50',
  syncedProducts: 148,
  syncRate: 95
})

// 商品列表数据（按销量排序）
const productList = ref([
  {
    id: 1,
    name: '时尚连衣裙',
    sku: 'DRESS-001',
    price: '59.99',
    inventory: 25,
    sales: 156,
    revenue: '9,350.44',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    name: '运动鞋',
    sku: 'SHOES-002',
    price: '89.99',
    inventory: 12,
    sales: 89,
    revenue: '8,009.11',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    name: '休闲T恤',
    sku: 'TSHIRT-003',
    price: '29.99',
    inventory: 45,
    sales: 67,
    revenue: '2,009.33',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    name: '牛仔裤',
    sku: 'JEANS-004',
    price: '79.99',
    inventory: 18,
    sales: 34,
    revenue: '2,719.66',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop'
  },
  {
    id: 5,
    name: '手提包',
    sku: 'BAG-005',
    price: '129.99',
    inventory: 8,
    sales: 23,
    revenue: '2,989.77',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop'
  }
])

// 订单列表数据
const orderList = ref([
  {
    id: 1,
    order_number: 'ORD-2023-001',
    customer_name: 'John Doe',
    total_amount: '129.99',
    created_at: '2023-12-10T15:30:00Z',
    status: 'completed',
    order_type: 'normal',
    shipping_status: 'shipped',
    tracking_number: 'TN123456789'
  },
  {
    id: 2,
    order_number: 'ORD-2023-002',
    customer_name: 'Jane Smith',
    total_amount: '59.99',
    created_at: '2023-12-09T10:15:00Z',
    status: 'pending',
    order_type: 'normal',
    shipping_status: 'pending'
  },
  {
    id: 3,
    order_number: 'RET-2023-001',
    customer_name: 'Mike Johnson',
    total_amount: '-89.99',
    created_at: '2023-12-08T14:20:00Z',
    status: 'processing',
    order_type: 'aftersale',
    shipping_status: 'return_requested'
  },
  {
    id: 4,
    order_number: 'ORD-2023-003',
    customer_name: 'Sarah Wilson',
    total_amount: '199.99',
    created_at: '2023-12-07T09:45:00Z',
    status: 'completed',
    order_type: 'normal',
    shipping_status: 'delivered',
    tracking_number: 'TN987654321'
  },
  {
    id: 5,
    order_number: 'EXC-2023-001',
    customer_name: 'David Brown',
    total_amount: '0.00',
    created_at: '2023-12-06T16:30:00Z',
    status: 'completed',
    order_type: 'aftersale',
    shipping_status: 'exchanged'
  }
])

// 同步记录数据
const syncLogs = ref([
  {
    sync_type: '商品同步',
    sync_time: '2023-12-10T08:00:00Z',
    status: 'success',
    sync_count: 10,
    message: '成功同步10个商品'
  },
  {
    sync_type: '订单同步',
    sync_time: '2023-12-09T20:00:00Z',
    status: 'success',
    sync_count: 5,
    message: '成功同步5个订单'
  }
])

// 计算属性
const filteredOrderList = computed(() => {
  if (orderTypeFilter.value === 'all') {
    return orderList.value
  }
  return orderList.value.filter(order => order.order_type === orderTypeFilter.value)
})

// 方法
const handleReauth = () => {
  ElMessage.info('重新授权功能开发中')
}

const handleSync = async () => {
  syncing.value = true
  try {
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('数据同步成功')
  } catch (error) {
    ElMessage.error('数据同步失败')
  } finally {
    syncing.value = false
  }
}

const handleDeleteStore = async () => {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定要删除此店铺吗？',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    ElMessage.success('店铺删除成功')
    router.push('/merchant/stores')
  } catch {
    // 用户取消删除
  }
}

const updateChart = () => {
  ElMessage.info(`正在加载 ${chartPeriod.value} 的数据`)
}

const updateProductsData = () => {
  ElMessage.info(`正在加载 ${productsPeriod.value} 的销量数据`)
  // 这里可以根据时间段重新排序商品列表
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
}

const viewProduct = (product) => {
  ElMessage.info(`查看商品: ${product.name}`)
}

const syncProduct = (product) => {
  ElMessage.info(`同步商品: ${product.name}`)
}

const viewOrder = (order) => {
  ElMessage.info(`查看订单: ${order.order_number}`)
}

const viewShippingInfo = (order) => {
  ElMessage.info(`查看发货信息: ${order.tracking_number || '暂无物流信息'}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOrderStatusType = (status) => {
  const statusMap = {
    'completed': 'success',
    'pending': 'warning',
    'cancelled': 'danger',
    'processing': 'primary'
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'pending': '待处理',
    'cancelled': '已取消',
    'processing': '处理中'
  }
  return statusMap[status] || '未知'
}

const getShippingStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'shipped': 'primary',
    'delivered': 'success',
    'return_requested': 'danger',
    'exchanged': 'info'
  }
  return statusMap[status] || 'info'
}

const getShippingStatusText = (status) => {
  const statusMap = {
    'pending': '待发货',
    'shipped': '已发货',
    'delivered': '已送达',
    'return_requested': '退货中',
    'exchanged': '已换货'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  // 根据路由参数加载店铺详情
  console.log('加载店铺详情，ID:', route.params.id)
})
</script>

<style lang="scss" scoped>
.store-detail {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .store-header {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .store-basic-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .store-avatar {
        width: 60px;
        height: 60px;
        background: #f0f9ff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .store-details {
        .store-name {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .store-meta {
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
            font-size: 14px;
            color: #6b7280;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .store-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;

      .action-buttons {
        display: flex;
        gap: 8px;
      }
    }
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        .card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: white;
        }

        .card-title {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
        }
      }

      .card-content {
        .main-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .sub-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .sub-value {
            font-size: 14px;
            font-weight: 600;
            color: #10b981;
          }

          .sub-label {
            font-size: 12px;
            color: #9ca3af;
          }
        }
      }

      &.products-card .card-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.orders-card .card-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.revenue-card .card-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.sync-card .card-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }

  .chart-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .chart-container {
      height: 300px;
      
      .chart-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f9fafb;
        border-radius: 8px;
        border: 2px dashed #d1d5db;

        p {
          margin: 8px 0;
          color: #6b7280;
        }

        .chart-note {
          font-size: 12px;
          color: #9ca3af;
        }
      }
    }
  }

  .tabs-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .tab-content {
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .product-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .product-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
        }

        .product-details {
          .product-name {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .product-sku {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }

      .sales-count {
        font-weight: 600;
        color: #059669;
      }

      .revenue-amount {
        font-weight: 600;
        color: #dc2626;
      }
    }
  }
}
</style> 