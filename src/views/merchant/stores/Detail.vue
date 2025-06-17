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
          <el-button type="danger" @click="handleDeleteStore">
            <el-icon><Delete /></el-icon>
            删除店铺
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-section">
      <div class="overview-header">
        <h3>数据概览</h3>
        <el-radio-group v-model="overviewPeriod" @change="updateOverviewData">
          <el-radio-button label="7d">7天</el-radio-button>
          <el-radio-button label="30d">30天</el-radio-button>
          <el-radio-button label="90d">90天</el-radio-button>
          <el-radio-button label="1y">一年</el-radio-button>
        </el-radio-group>
      </div>
      <div class="overview-cards">
        <div class="overview-card sales-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon size="24"><Money /></el-icon>
            </div>
            <div class="card-title">今日销售额</div>
          </div>
          <div class="card-content">
            <div class="main-value">${{ todayStats.salesAmount }}</div>
            <div class="sub-info">
              <span class="sub-value">{{ todayStats.salesGrowth }}%</span>
              <span class="sub-label">较昨日</span>
            </div>
          </div>
        </div>
        
        <div class="overview-card orders-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon size="24"><DocumentChecked /></el-icon>
            </div>
            <div class="card-title">今日订单数</div>
          </div>
          <div class="card-content">
            <div class="main-value">{{ todayStats.orderCount }}</div>
            <div class="sub-info">
              <span class="sub-value">{{ todayStats.orderGrowth }}%</span>
              <span class="sub-label">较昨日</span>
            </div>
          </div>
        </div>
        
        <div class="overview-card avg-order-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon size="24"><Goods /></el-icon>
            </div>
            <div class="card-title">今日客单价</div>
          </div>
          <div class="card-content">
            <div class="main-value">${{ todayStats.avgOrderValue }}</div>
            <div class="sub-info">
              <span class="sub-value">{{ todayStats.avgOrderGrowth }}%</span>
              <span class="sub-label">较昨日</span>
            </div>
          </div>
        </div>

        <div class="overview-card aftersale-amount-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon size="24"><RefreshLeft /></el-icon>
            </div>
            <div class="card-title">今日售后金额</div>
          </div>
          <div class="card-content">
            <div class="main-value">${{ todayStats.aftersaleAmount }}</div>
            <div class="sub-info">
              <span class="sub-value">{{ todayStats.aftersaleAmountGrowth }}%</span>
              <span class="sub-label">较昨日</span>
            </div>
          </div>
        </div>

        <div class="overview-card aftersale-count-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon size="24"><Warning /></el-icon>
            </div>
            <div class="card-title">今日售后数量</div>
          </div>
          <div class="card-content">
            <div class="main-value">{{ todayStats.aftersaleCount }}</div>
            <div class="sub-info">
              <span class="sub-value">{{ todayStats.aftersaleCountGrowth }}%</span>
              <span class="sub-label">较昨日</span>
            </div>
          </div>
        </div>


      </div>
    </div>

    <!-- 历史数据图表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>数据趋势</h3>
        <div class="chart-controls">
          <el-radio-group v-model="chartPeriod" @change="updateChart">
            <el-radio-button label="7d">近7日</el-radio-button>
            <el-radio-button label="1m">近1个月</el-radio-button>
            <el-radio-button label="3m">近3个月</el-radio-button>
            <el-radio-button label="1y">近1年</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
          <div v-if="chartPeriod === 'custom'" class="custom-date-range">
            <el-date-picker
              v-model="customDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="updateChart"
            />
          </div>
        </div>
      </div>
      <div class="chart-container">
        <svg 
          ref="chartSvg" 
          width="100%" 
          height="350" 
          @mousemove="handleChartMouseMove"
          @mouseleave="hideTooltip"
        >
          <!-- 网格背景 -->
          <defs>
            <pattern id="grid" width="50" height="35" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 35" fill="none" stroke="#f0f0f0" stroke-width="1"/>
            </pattern>
            <!-- 渐变定义 -->
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.05" />
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#f093fb;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#f093fb;stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- Y轴标签 -->
          <g class="y-axis">
            <text v-for="(label, index) in yAxisLabels.sales" :key="'sales-' + index"
                  :x="30" 
                  :y="getSalesYPosition(label) + 5"
                  fill="#666" 
                  font-size="12" 
                  text-anchor="end">
              ${{ label }}
            </text>
            <text v-for="(label, index) in yAxisLabels.orders" :key="'orders-' + index"
                  :x="chartWidth - 10" 
                  :y="getOrderYPosition(label) + 5"
                  fill="#666" 
                  font-size="12" 
                  text-anchor="start">
              {{ label }}
            </text>
          </g>
          
          <!-- X轴标签 -->
          <g class="x-axis">
            <text v-for="(point, index) in chartData" :key="'x-' + index"
                  :x="getXPosition(index)" 
                  :y="chartHeight - 10"
                  fill="#666" 
                  font-size="12" 
                  text-anchor="middle">
              {{ point.date }}
            </text>
          </g>
          
          <!-- 销售额区域填充 -->
          <path
            :d="salesAreaPath"
            fill="url(#salesGradient)"
          />
          
          <!-- 订单量区域填充 -->
          <path
            :d="ordersAreaPath"
            fill="url(#ordersGradient)"
          />
          
          <!-- 销售额数据线 -->
          <polyline
            :points="salesLinePoints"
            fill="none"
            stroke="#667eea"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          
          <!-- 订单量数据线 -->
          <polyline
            :points="ordersLinePoints"
            fill="none"
            stroke="#f093fb"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          
          <!-- 销售额数据点 -->
          <circle
            v-for="(point, index) in chartData"
            :key="'sales-point-' + index"
            :cx="getXPosition(index)"
            :cy="getSalesYPosition(point.sales)"
            r="5"
            fill="#667eea"
            stroke="white"
            stroke-width="2"
            class="data-point"
            @mouseenter="showPointTooltip(point)"
          />
          
          <!-- 订单量数据点 -->
          <circle
            v-for="(point, index) in chartData"
            :key="'orders-point-' + index"
            :cx="getXPosition(index)"
            :cy="getOrderYPosition(point.orders)"
            r="5"
            fill="#f093fb"
            stroke="white"
            stroke-width="2"
            class="data-point"
            @mouseenter="showPointTooltip(point)"
          />
        </svg>
        
        <!-- 图表图例 -->
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></span>
            <span>销售额 (美元)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></span>
            <span>订单数量</span>
          </div>
        </div>
        
        <!-- 悬停提示框 -->
        <div 
          v-if="showTooltip" 
          class="chart-tooltip" 
          :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
        >
          <div class="tooltip-header">{{ tooltipData.date }}</div>
          <div class="tooltip-item">
            <span class="tooltip-label">销售额:</span>
            <span class="tooltip-value">${{ tooltipData.sales?.toLocaleString() }}</span>
          </div>
          <div class="tooltip-item">
            <span class="tooltip-label">订单数:</span>
            <span class="tooltip-value">{{ tooltipData.orders }}</span>
          </div>
          <div class="tooltip-item">
            <span class="tooltip-label">客单价:</span>
            <span class="tooltip-value">${{ tooltipData.avgOrderValue }}</span>
          </div>
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
  Delete,
  Goods,
  DocumentChecked,
  Money,
  Plus,
  RefreshLeft,
  Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const chartPeriod = ref('7d')
const activeTab = ref('products')
const productsPeriod = ref('30d')
const orderTypeFilter = ref('all')
const overviewPeriod = ref('30d')
const customDateRange = ref([])

// 图表相关
const showTooltip = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipData = ref({})
const chartWidth = ref(800)
const chartHeight = ref(350)

// 店铺基本信息（模拟数据）
const storeInfo = ref({
  id: route.params.id,
  name: 'Fashion Store',
  url: 'https://fashion-store.myshopify.com',
  shopify_id: 'shop_12345',
  status: 'active',
  created_at: '2023-12-01T10:00:00Z'
})



// 今日统计数据
const todayStats = ref({
  salesAmount: 1234.56,
  salesGrowth: 5.6,
  orderCount: 89,
  orderGrowth: 3.4,
  avgOrderValue: 13.87,
  avgOrderGrowth: 2.3,
  aftersaleAmount: 234.56,
  aftersaleAmountGrowth: 4.5,
  aftersaleCount: 12,
  aftersaleCountGrowth: 2.5
})

// 图表数据
const chartData = ref([
  { date: '12-04', sales: 1200, orders: 45, avgOrderValue: 26.67 },
  { date: '12-05', sales: 1500, orders: 67, avgOrderValue: 22.39 },
  { date: '12-06', sales: 1100, orders: 52, avgOrderValue: 21.15 },
  { date: '12-07', sales: 1800, orders: 78, avgOrderValue: 23.08 },
  { date: '12-08', sales: 1600, orders: 61, avgOrderValue: 26.23 },
  { date: '12-09', sales: 2000, orders: 80, avgOrderValue: 25.00 },
  { date: '12-10', sales: 1234, orders: 89, avgOrderValue: 13.87 }
])

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



// 计算属性
const filteredOrderList = computed(() => {
  if (orderTypeFilter.value === 'all') {
    return orderList.value
  }
  return orderList.value.filter(order => order.order_type === orderTypeFilter.value)
})

// 图表计算属性
const yAxisLabels = computed(() => {
  const maxSales = Math.max(...chartData.value.map(d => d.sales))
  const maxOrders = Math.max(...chartData.value.map(d => d.orders))
  
  return {
    sales: [0, Math.round(maxSales * 0.25), Math.round(maxSales * 0.5), Math.round(maxSales * 0.75), maxSales],
    orders: [0, Math.round(maxOrders * 0.25), Math.round(maxOrders * 0.5), Math.round(maxOrders * 0.75), maxOrders]
  }
})

const salesLinePoints = computed(() => {
  return chartData.value.map((_, index) => {
    const x = getXPosition(index)
    const y = getSalesYPosition(chartData.value[index].sales)
    return `${x},${y}`
  }).join(' ')
})

const ordersLinePoints = computed(() => {
  return chartData.value.map((_, index) => {
    const x = getXPosition(index)
    const y = getOrderYPosition(chartData.value[index].orders)
    return `${x},${y}`
  }).join(' ')
})

const salesAreaPath = computed(() => {
  if (chartData.value.length === 0) return ''
  
  let path = `M 50 ${chartHeight.value - 50}`
  chartData.value.forEach((_, index) => {
    const x = getXPosition(index)
    const y = getSalesYPosition(chartData.value[index].sales)
    path += ` L ${x} ${y}`
  })
  path += ` L ${getXPosition(chartData.value.length - 1)} ${chartHeight.value - 50} Z`
  return path
})

const ordersAreaPath = computed(() => {
  if (chartData.value.length === 0) return ''
  
  let path = `M 50 ${chartHeight.value - 50}`
  chartData.value.forEach((_, index) => {
    const x = getXPosition(index)
    const y = getOrderYPosition(chartData.value[index].orders)
    path += ` L ${x} ${y}`
  })
  path += ` L ${getXPosition(chartData.value.length - 1)} ${chartHeight.value - 50} Z`
  return path
})

// 方法
const handleReauth = () => {
  ElMessage.info('重新授权功能开发中')
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

// 图表相关方法
const getXPosition = (index) => {
  const padding = 50
  const stepWidth = (chartWidth.value - 2 * padding) / (chartData.value.length - 1)
  return padding + index * stepWidth
}

const getSalesYPosition = (sales) => {
  const padding = 50
  const maxSales = Math.max(...chartData.value.map(d => d.sales))
  const ratio = (chartHeight.value - 2 * padding) / maxSales
  return chartHeight.value - padding - sales * ratio
}

const getOrderYPosition = (orders) => {
  const padding = 50
  const maxOrders = Math.max(...chartData.value.map(d => d.orders))
  const ratio = (chartHeight.value - 2 * padding) / maxOrders
  return chartHeight.value - padding - orders * ratio
}

const handleChartMouseMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const dataIndex = Math.round((x - 50) / ((chartWidth.value - 100) / (chartData.value.length - 1)))
  
  if (dataIndex >= 0 && dataIndex < chartData.value.length) {
    showTooltip.value = true
    tooltipX.value = event.clientX - rect.left
    tooltipY.value = event.clientY - rect.top - 10
    tooltipData.value = chartData.value[dataIndex]
  }
}

const hideTooltip = () => {
  showTooltip.value = false
}

const showPointTooltip = (point) => {
  showTooltip.value = true
  tooltipData.value = point
}

const updateChart = () => {
  ElMessage.info(`正在加载 ${chartPeriod.value} 的数据`)
  // 根据时间段更新图表数据
  if (chartPeriod.value === '7d') {
    chartData.value = [
      { date: '12-04', sales: 1200, orders: 45, avgOrderValue: 26.67 },
      { date: '12-05', sales: 1500, orders: 67, avgOrderValue: 22.39 },
      { date: '12-06', sales: 1100, orders: 52, avgOrderValue: 21.15 },
      { date: '12-07', sales: 1800, orders: 78, avgOrderValue: 23.08 },
      { date: '12-08', sales: 1600, orders: 61, avgOrderValue: 26.23 },
      { date: '12-09', sales: 2000, orders: 80, avgOrderValue: 25.00 },
      { date: '12-10', sales: 1234, orders: 89, avgOrderValue: 13.87 }
    ]
  } else if (chartPeriod.value === '1m') {
    // 1个月数据示例
    chartData.value = [
      { date: '11-11', sales: 800, orders: 35, avgOrderValue: 22.86 },
      { date: '11-18', sales: 1200, orders: 45, avgOrderValue: 26.67 },
      { date: '11-25', sales: 1500, orders: 67, avgOrderValue: 22.39 },
      { date: '12-02', sales: 1800, orders: 78, avgOrderValue: 23.08 },
      { date: '12-09', sales: 2000, orders: 80, avgOrderValue: 25.00 }
    ]
  } else if (chartPeriod.value === '3m') {
    // 3个月数据示例
    chartData.value = [
      { date: '09-10', sales: 600, orders: 25, avgOrderValue: 24.00 },
      { date: '10-10', sales: 1000, orders: 40, avgOrderValue: 25.00 },
      { date: '11-10', sales: 1500, orders: 60, avgOrderValue: 25.00 },
      { date: '12-10', sales: 2000, orders: 80, avgOrderValue: 25.00 }
    ]
  } else if (chartPeriod.value === '1y') {
    // 1年数据示例
    chartData.value = [
      { date: '2023-03', sales: 5000, orders: 200, avgOrderValue: 25.00 },
      { date: '2023-06', sales: 8000, orders: 320, avgOrderValue: 25.00 },
      { date: '2023-09', sales: 12000, orders: 480, avgOrderValue: 25.00 },
      { date: '2023-12', sales: 15000, orders: 600, avgOrderValue: 25.00 }
    ]
  } else if (chartPeriod.value === 'custom' && customDateRange.value.length === 2) {
    // 自定义时间范围数据
    chartData.value = [
      { date: '自定义1', sales: 1000, orders: 40, avgOrderValue: 25.00 },
      { date: '自定义2', sales: 1200, orders: 48, avgOrderValue: 25.00 },
      { date: '自定义3', sales: 1500, orders: 60, avgOrderValue: 25.00 }
    ]
  }
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

const updateOverviewData = () => {
  ElMessage.info(`正在加载 ${overviewPeriod.value} 的数据`)
  // 这里可以根据时间段重新计算今日统计数据
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

  .overview-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .overview-header {
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

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

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

        &.sales-card .card-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.orders-card .card-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.avg-order-card .card-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.aftersale-amount-card .card-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        &.aftersale-count-card .card-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }


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

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }

      .chart-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: flex-end;

        .custom-date-range {
          margin-top: 8px;
        }
      }
    }

    .chart-container {
      position: relative;
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;

      svg {
        border-radius: 8px;
        background: white;
      }

      .data-point {
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          r: 7;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }
      }

      .chart-legend {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 16px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;

          .legend-color {
            width: 16px;
            height: 3px;
            border-radius: 2px;
          }
        }
      }

      .chart-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px;
        border-radius: 8px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        min-width: 120px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

        .tooltip-header {
          font-weight: 600;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tooltip-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;

          .tooltip-label {
            color: #d1d5db;
          }

          .tooltip-value {
            font-weight: 600;
            color: white;
          }
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