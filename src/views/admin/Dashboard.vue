<template>
  <div class="admin-dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>欢迎回来，管理员！</h1>
        <p class="date">{{ currentDate }}</p>
        <p class="role">管理员角色</p>
      </div>
      <div class="banner-decoration">
        <el-icon class="decoration-icon"><Star /></el-icon>
      </div>
    </div>

    <!-- 数据筛选 -->
    <div class="data-filters">
      <div class="filter-header">
        <h3>数据筛选</h3>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <label>时间范围选择</label>
            <el-select v-model="timeRange" placeholder="选择时间范围" @change="updateData">
              <el-option label="今日" value="today"></el-option>
              <el-option label="昨日" value="yesterday"></el-option>
              <el-option label="本周" value="thisWeek"></el-option>
              <el-option label="上周" value="lastWeek"></el-option>
              <el-option label="本月" value="thisMonth"></el-option>
              <el-option label="上月" value="lastMonth"></el-option>
              <el-option label="自定义" value="custom"></el-option>
            </el-select>
          </div>
          
          <el-date-picker
            v-if="timeRange === 'custom'"
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="updateData"
          />
        </div>
      </div>
    </div>

    <!-- 营收数据卡片组 -->
    <div class="revenue-cards">
      <div class="revenue-card" v-for="item in revenueData" :key="item.title">
        <div class="card-header">
          <div class="card-icon" :style="{ '--icon-color': item.color }">
            <component :is="item.icon"></component>
          </div>
          <h4>{{ item.title }}</h4>
        </div>
        <div class="card-content">
          <div class="card-value">{{ item.value }}</div>
          <div class="card-growth" :class="item.growth > 0 ? 'positive' : 'negative'">
            <el-icon><ArrowUp v-if="item.growth > 0" /><ArrowDown v-else /></el-icon>
            {{ Math.abs(item.growth) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 销售趋势图表 -->
    <div class="trend-chart-section">
      <div class="chart-header">
        <h3>销售趋势图表</h3>
        <el-radio-group v-model="trendTimeRange" @change="updateTrendData">
          <el-radio-button label="7days">最近7天</el-radio-button>
          <el-radio-button label="30days">最近30天</el-radio-button>
          <el-radio-button label="90days">最近90天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container">
        <div id="trendChart" style="width: 100%; height: 300px;"></div>
      </div>
    </div>

    <!-- 产品销量排名卡片 -->
    <div class="ranking-section">
      <div class="section-header">
        <h3>产品销量排名</h3>
        <el-select v-model="rankingTimeRange" placeholder="时间范围" size="small" @change="updateRankingData">
          <el-option label="最近3天" value="3days"></el-option>
          <el-option label="最近15天" value="15days"></el-option>
          <el-option label="最近30天" value="30days"></el-option>
        </el-select>
      </div>
      <div class="ranking-list">
        <div class="ranking-item" v-for="(product, index) in topProducts" :key="product.id">
          <div class="ranking-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
          <div class="product-image" @click="viewProductDetail(product)">
            <img :src="product.image" :alt="product.name" @error="handleImageError" />
          </div>
          <div class="product-info">
            <div class="product-name" @click="viewProductDetail(product)">{{ product.name }}</div>
            <div class="product-meta">
              <span class="product-sku">SKU: {{ product.sku }}</span>
              <span class="product-category">分类: {{ product.category }}</span>
            </div>
            <div class="product-details">
              <span class="product-sales">销量: {{ product.sales }}</span>
              <span class="product-revenue">销售额: ${{ product.revenue.toLocaleString() }}</span>
              <span class="product-change" :class="product.change > 0 ? 'positive' : 'negative'">
                环比: {{ product.change > 0 ? '+' : '' }}{{ product.change.toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="product-actions">
            <el-button type="primary" size="small" @click="viewProductDetail(product)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 待办事项卡片 -->
    <div class="todo-section">
      <div class="section-header">
        <h3>待办事项</h3>
      </div>
      <div class="todo-list">
        <div class="todo-item" v-for="item in todoItems" :key="item.key" @click="goToPage(item.route)">
          <div class="todo-icon" :style="{ '--icon-color': item.color }">
            <component :is="item.icon"></component>
          </div>
          <div class="todo-content">
            <div class="todo-title">{{ item.title }}</div>
            <div class="todo-count">{{ item.count }}个</div>
          </div>
          <el-icon class="todo-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  Star, 
  TrendCharts, 
  ShoppingBag, 
  Money, 
  User, 
  Document, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight,
  Warning,
  Clock
} from '@element-plus/icons-vue'

const router = useRouter()

// 基础数据
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 筛选器状态
const timeRange = ref('today')
const customDateRange = ref([])
const trendTimeRange = ref('7days')
const rankingTimeRange = ref('3days')

// 营收数据（6个卡片：销售额、订单数、客单价、售后金额、售后数量、利润）
const revenueData = ref([
  {
    title: '销售额（美元）',
    value: '$125,860',
    growth: 12.5,
    color: '#409eff',
    icon: Money
  },
  {
    title: '订单数',
    value: '1,248',
    growth: 8.3,
    color: '#67c23a',
    icon: ShoppingBag
  },
  {
    title: '客单价（美元）',
    value: '$98.5',
    growth: 5.2,
    color: '#e6a23c',
    icon: User
  },
  {
    title: '售后金额（美元）',
    value: '$8,456',
    growth: -2.1,
    color: '#f56c6c',
    icon: Document
  },
  {
    title: '售后数量',
    value: '89',
    growth: -3.5,
    color: '#909399',
    icon: Warning
  },
  {
    title: '利润（美元）',
    value: '$45,200',
    growth: 15.8,
    color: '#9c27b0',
    icon: TrendCharts
  }
])

// 产品排名数据（Top10商品列表）
const topProducts = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-naturaltitanium-select?wid=470&hei=556&fmt=png-alpha&.v=1692845702708',
    sku: 'IPH15PM-256-BLU',
    category: '电子产品',
    sales: 236,
    revenue: 256800,
    change: 12.5
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034',
    sku: 'MBA-M3-13-SLV',
    category: '电子产品',
    sales: 189,
    revenue: 189000,
    change: 8.3
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select?wid=556&hei=556&fmt=jpeg&qlt=90&.v=1660803972361',
    sku: 'APP2-WHT-USB',
    category: '电子产品',
    sales: 324,
    revenue: 81000,
    change: 15.2
  },
  {
    id: 4,
    name: 'Apple Watch Ultra',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-select-202209?wid=470&hei=556&fmt=jpeg&qlt=90&.v=1661371038312',
    sku: 'AWU-49-TIT-ORG',
    category: '智能穿戴',
    sales: 156,
    revenue: 124800,
    change: -2.1
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202405?wid=470&hei=556&fmt=jpeg&qlt=90&.v=1713308272877',
    sku: 'IPD-PRO-129-GRY',
    category: '电子产品',
    sales: 98,
    revenue: 107800,
    change: 6.8
  },
  {
    id: 6,
    name: 'Samsung Galaxy S24',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bzkcins-thumb-539573257?$344_344_PNG$',
    sku: 'SGS24-256-BLK',
    category: '电子产品',
    sales: 145,
    revenue: 98500,
    change: 4.2
  },
  {
    id: 7,
    name: 'Dell XPS 13',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/13-9340/media-gallery/notebook-xps-13-9340-nt-blue-gallery-4.psd?fmt=pjpg&pscan=auto&scl=1&wid=3491&hei=2623&qlt=100,1&resMode=sharp2&size=3491,2623&chrss=full&imwidth=5000',
    sku: 'DXP13-I7-16-SLV',
    category: '电脑配件',
    sales: 87,
    revenue: 87000,
    change: -1.5
  },
  {
    id: 8,
    name: 'Sony WH-1000XM5',
    image: 'https://www.sony.com/image/5d02da5df552836db894c9e3e5e5e85c?fmt=pjpg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
    sku: 'SWH1000XM5-BLK',
    category: '音频设备',
    sales: 203,
    revenue: 60900,
    change: 9.8
  },
  {
    id: 9,
    name: 'Nintendo Switch OLED',
    image: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_656/b_white/f_auto/q_auto/ncom/software/switch/70010000000964/811316ca6c0c2b2b48fcaa97c6f02e48e1e9d7b6c7b5b8b5b5b5b5b5b5b5b5b5',
    sku: 'NSW-OLED-WHT',
    category: '游戏设备',
    sales: 176,
    revenue: 61600,
    change: 7.3
  },
  {
    id: 10,
    name: 'Tesla Model Y Accessories',
    image: 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-Y-Main-Hero-Desktop-LHD.jpg',
    sku: 'TMY-ACC-KIT-BLK',
    category: '汽车配件',
    sales: 134,
    revenue: 53600,
    change: 11.2
  }
])

// 待办事项数据（5个待办事项）
const todoItems = ref([
  {
    key: 'products',
    title: '待审核商品数量',
    count: 12,
    color: '#67c23a',
    icon: ShoppingBag,
    route: '/admin/products'
  },
  {
    key: 'purchase',
    title: '待处理采购申请数量',
    count: 8,
    color: '#e6a23c',
    icon: Document,
    route: '/admin/purchase-applications'
  },
  {
    key: 'recharge',
    title: '待审核充值数量',
    count: 15,
    color: '#f56c6c',
    icon: Money,
    route: '/admin/recharge-audit'
  },
  {
    key: 'withdrawal',
    title: '待审核提现数量',
    count: 7,
    color: '#909399',
    icon: Clock,
    route: '/admin/withdrawal-management'
  },
  {
    key: 'balance-withdrawal',
    title: '待审核余额提现数量',
    count: 5,
    color: '#409eff',
    icon: Money,
    route: '/admin/withdrawal-management'
  }
])

// 图表实例
let trendChart = null

// 方法
const updateData = () => {
  console.log('更新数据', timeRange.value, customDateRange.value)
  // 这里可以根据时间范围更新数据
}

const updateTrendData = () => {
  if (trendChart) {
    const option = getTrendChartOption()
    trendChart.setOption(option)
  }
}

const updateRankingData = () => {
  console.log('更新产品排名数据', rankingTimeRange.value)
  // 这里可以根据时间范围更新产品排名数据
}

const goToPage = (route) => {
  router.push(route)
}

const viewProductDetail = (product) => {
  // 跳转到产品详情页面
  router.push(`/admin/products/${product.id}`)
}

const handleImageError = (event) => {
  // 图片加载失败时显示默认图标
  const img = event.target
  const container = img.parentElement
  
  // 移除图片
  img.remove()
  
  // 添加图标
  container.innerHTML = '<i class="el-icon"><svg viewBox="0 0 1024 1024" width="18" height="18"><path d="M832 312H696l-16-64c-8.8-35.2-40.8-56-72-56H416c-31.2 0-63.2 20.8-72 56l-16 64H192c-17.7 0-32 14.3-32 32v16c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32v-16c0-17.7-14.3-32-32-32zM224 902.9c0 16.2 13.1 29.1 29.3 29.1h517.4c16.2 0 29.3-12.9 29.3-29.1V424H224v478.9z" fill="currentColor"></path></svg></i>'
  container.classList.add('image-error')
}

// 图表配置
const getTrendChartOption = () => {
  const dates = []
  const salesData = []
  const orderData = []
  
  // 根据时间范围生成数据
  const days = trendTimeRange.value === '7days' ? 7 : 
               trendTimeRange.value === '30days' ? 30 : 90
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }))
    salesData.push(Math.floor(Math.random() * 50000) + 100000)
    orderData.push(Math.floor(Math.random() * 200) + 800)
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['销售额', '订单数']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额($)',
        position: 'left',
        axisLabel: {
          formatter: '${value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
        axisLabel: {
          formatter: '{value}单'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        yAxisIndex: 0,
        data: salesData,
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: orderData,
        smooth: true,
        lineStyle: {
          color: '#67c23a',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
            ]
          }
        }
      }
    ]
  }
}

// 生命周期
onMounted(() => {
  // 初始化趋势图表
  trendChart = echarts.init(document.getElementById('trendChart'))
  trendChart.setOption(getTrendChartOption())
  
  // 响应式处理
  window.addEventListener('resize', () => {
    trendChart?.resize()
  })
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 欢迎横幅 */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-content .date {
  margin: 0 0 4px 0;
  opacity: 0.9;
  font-size: 16px;
}

.welcome-content .role {
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
}

.banner-decoration .decoration-icon {
  font-size: 48px;
  opacity: 0.3;
}

/* 数据筛选 */
.data-filters {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-header h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 营收数据卡片 */
.revenue-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.revenue-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.revenue-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: var(--icon-color, #409eff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.9;
}

.card-header h4 {
  margin: 0;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.card-growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.card-growth.positive {
  color: #67c23a;
}

.card-growth.negative {
  color: #f56c6c;
}

/* 销售趋势图表 */
.trend-chart-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

/* 产品排名 */
.ranking-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.ranking-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  transition: all 0.2s;
}

.ranking-item:hover {
  background-color: #f9f9f9;
  border-color: #409eff;
}

.ranking-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.rank-1 { background-color: #ffd700; }
.rank-2 { background-color: #c0c0c0; }
.rank-3 { background-color: #cd7f32; }
.ranking-number:not(.rank-1):not(.rank-2):not(.rank-3) {
  background-color: #e0e0e0;
  color: #666;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.product-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image.image-error {
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image.image-error i {
  color: #909399;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.product-name:hover {
  color: #409eff;
}

.product-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 11px;
}

.product-sku {
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.product-category {
  color: #606266;
  background: #e1f3d8;
  padding: 2px 6px;
  border-radius: 3px;
}

.product-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.product-sales, .product-revenue {
  color: #666;
}

.product-change {
  font-weight: 600;
}

.product-change.positive { color: #67c23a; }
.product-change.negative { color: #f56c6c; }

.product-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.product-actions .el-button {
  padding: 4px 12px;
  font-size: 12px;
}

/* 待办事项 */
.todo-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-item:hover {
  background-color: #f9f9f9;
  border-color: #409eff;
}

.todo-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background-color: var(--icon-color, #409eff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.todo-count {
  font-size: 14px;
  color: #666;
}

.todo-arrow {
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 15px;
  }
  
  .revenue-cards {
    grid-template-columns: 1fr;
  }
  
  .ranking-list {
    grid-template-columns: 1fr;
  }
  
  .todo-list {
    grid-template-columns: 1fr;
  }
  
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 