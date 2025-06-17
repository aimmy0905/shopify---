<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>欢迎回来，商家用户！</h1>
        <p class="date">{{ currentDate }}</p>
      </div>
      <div class="banner-decoration">
        <el-icon class="decoration-icon"><Sunny /></el-icon>
      </div>
    </div>

    <!-- 账户余额卡片 -->
    <div class="balance-card">
      <div class="balance-header">
        <h3>账户余额</h3>
        <el-link @click="goToBalance" type="primary">查看详情</el-link>
      </div>
      <div class="balance-amount">
        <span class="currency">$</span>
        <span class="amount">{{ accountBalance.toFixed(2) }}</span>
      </div>
      <div class="balance-actions">
        <el-button type="primary" @click="handleRecharge">
          <el-icon><CreditCard /></el-icon>
          余额充值
        </el-button>
        <el-button @click="handleWithdraw">
          <el-icon><Money /></el-icon>
          余额提现
        </el-button>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="data-overview">
      <div class="overview-header">
        <h3>数据概览</h3>
        <div class="time-filter-buttons">
          <el-button-group>
            <el-button
              v-for="option in timeRangeOptions"
              :key="option.value"
              :type="overviewTimeRange === option.value ? 'primary' : 'default'"
              @click="overviewTimeRange = option.value"
              size="small"
            >
              {{ option.label }}
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="overview-cards">
        <div class="overview-card" v-for="item in overviewData" :key="item.title">
          <div class="card-icon" :style="{ '--icon-color': item.color }">
            <component :is="item.icon"></component>
          </div>
          <div class="card-content">
            <h4>{{ item.title }}</h4>
            <div class="card-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品销售排行 -->
    <div class="product-ranking">
      <div class="ranking-header">
        <h3>产品销售排行</h3>
        <div class="ranking-filters">
          <div class="filter-group">
            <span class="filter-label">时间范围：</span>
            <el-button-group>
              <el-button
                v-for="option in rankingTimeOptions"
                :key="option.value"
                :type="rankingTimeRange === option.value ? 'primary' : 'default'"
                @click="rankingTimeRange = option.value"
                size="small"
              >
                {{ option.label }}
              </el-button>
            </el-button-group>
          </div>
          <div class="filter-group">
            <span class="filter-label">店铺：</span>
            <el-button-group>
              <el-button
                v-for="option in storeOptions"
                :key="option.value"
                :type="selectedStore === option.value ? 'primary' : 'default'"
                @click="selectedStore = option.value"
                size="small"
              >
                {{ option.label }}
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
      <div class="ranking-table">
        <div class="table-header">
          <div class="header-cell">排名</div>
          <div class="header-cell">产品</div>
          <div class="header-cell">类别</div>
          <div class="header-cell">SKU</div>
          <div class="header-cell">店铺</div>
          <div class="header-cell">销量</div>
          <div class="header-cell">收入</div>
        </div>
        <div class="table-body">
          <div class="table-row" v-for="(product, index) in topProducts" :key="product.id">
            <div class="cell ranking-cell">
              <span class="ranking-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            </div>
            <div class="cell product-cell">
              <img :src="product.image" :alt="product.name" @error="handleImageError" />
              <span class="product-name">{{ product.name }}</span>
            </div>
            <div class="cell">{{ product.category }}</div>
            <div class="cell">{{ product.sku }}</div>
            <div class="cell">
              <el-tag :type="getStoreTagType(product.store)" size="small">{{ product.store }}</el-tag>
            </div>
            <div class="cell">{{ product.sales }}</div>
            <div class="cell">¥{{ product.revenue.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单统计图表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>订单统计</h3>
        <div class="chart-filters">
          <div class="chart-time-filter">
            <el-button-group>
              <el-button
                v-for="option in chartTimeOptions"
                :key="option.value"
                :type="chartTimeRange === option.value ? 'primary' : 'default'"
                @click="handleChartTimeChange(option.value)"
                size="small"
              >
                {{ option.label }}
              </el-button>
            </el-button-group>
          </div>
          <div class="custom-date-picker" v-if="chartTimeRange === 'custom'">
            <el-date-picker
              v-model="customChartDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="handleCustomDateChange"
              style="margin-left: 12px;"
            />
          </div>
        </div>
      </div>
      <div class="chart-container">
        <svg 
          ref="chartSvg" 
          width="100%" 
          height="300" 
          @mousemove="handleChartMouseMove"
          @mouseleave="hideTooltip"
        >
          <!-- 网格背景 -->
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- 订单数据线 -->
          <polyline
            :points="orderLinePoints"
            fill="none"
            stroke="#409eff"
            stroke-width="2"
          />
          
          <!-- 销售额数据线 -->
          <polyline
            :points="salesLinePoints"
            fill="none"
            stroke="#67c23a"
            stroke-width="2"
          />
          
          <!-- 数据点 -->
          <circle
            v-for="(point, index) in chartData"
            :key="'order-' + index"
            :cx="getXPosition(index)"
            :cy="getOrderYPosition(point.orders)"
            r="4"
            fill="#409eff"
          />
          
          <circle
            v-for="(point, index) in chartData"
            :key="'sales-' + index"
            :cx="getXPosition(index)"
            :cy="getSalesYPosition(point.sales)"
            r="4"
            fill="#67c23a"
          />
        </svg>
        
        <!-- 图表图例 -->
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: #409eff;"></span>
            <span>订单数</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #67c23a;"></span>
            <span>销售额</span>
          </div>
        </div>
        
        <!-- 悬停提示框 -->
        <div 
          v-if="showTooltip" 
          class="chart-tooltip" 
          :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
        >
          <div><strong>{{ tooltipData.date }}</strong></div>
          <div>订单数: {{ tooltipData.orders }}</div>
          <div>销售额: ¥{{ tooltipData.sales.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- 最近交易记录 -->
    <div class="transaction-records">
      <div class="records-header">
        <h3>最近交易记录</h3>
        <el-link @click="goToBalance" type="primary">查看全部</el-link>
      </div>
      <div class="records-list">
        <div class="record-item" v-for="record in recentTransactions" :key="record.id">
          <div class="record-icon" :class="record.type">
            <component :is="getTransactionIcon(record.type)"></component>
          </div>
          <div class="record-content">
            <div class="record-title">{{ record.title }}</div>
            <div class="record-description">{{ record.description }}</div>
            <div class="record-time">{{ record.time }}</div>
          </div>
          <div class="record-amount" :class="record.type">
            {{ record.type === 'income' ? '+' : '-' }}¥{{ Math.abs(record.amount).toLocaleString() }}
          </div>
          <div class="record-actions">
            <el-button size="small" text @click="viewTransactionDetail(record)">详情</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-cards">
        <div class="action-card" v-for="action in quickActions" :key="action.key" @click="handleQuickAction(action.key)">
          <div class="action-icon" :style="{ '--icon-color': action.color }">
            <component :is="action.icon"></component>
          </div>
          <div class="action-title">{{ action.title }}</div>
          <div class="action-description">{{ action.description }}</div>
        </div>
      </div>
    </div>

    <!-- 通知与公告 -->
    <div class="notifications">
      <h3>通知与公告</h3>
      <div class="notification-list">
        <div class="notification-item" v-for="notice in notifications" :key="notice.id">
          <div class="notification-icon" :class="notice.type">
            <component :is="getNotificationIcon(notice.type)"></component>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notice.title }}</div>
            <div class="notification-time">{{ notice.time }}</div>
          </div>
          <div class="notification-actions">
            <el-button size="small" text>查看</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 充值弹窗 -->
    <recharge-dialog v-model="showRechargeDialog" @success="handleRechargeSuccess" />

    <!-- 提现弹窗 -->
    <withdraw-dialog v-model="showWithdrawDialog" @success="handleWithdrawSuccess" />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Element Plus图标
import {
  Sunny, DataAnalysis, ShoppingBag, UserFilled, Refresh,
  Coin, CirclePlus, DocumentAdd, View, ShoppingCartFull,
  CreditCard, BellFilled, WarningFilled, PieChart,
  TrendCharts, Goods, Ship, Service, Money,
  // 新增更好看的图标
  WalletFilled, Wallet, Plus, ShoppingCart,
  Management, InfoFilled, Bell, SuccessFilled,
  CircleCheckFilled, CircleCloseFilled, Timer,
  Notification, Warning
} from '@element-plus/icons-vue'

// 导入充值和提现弹窗组件
import RechargeDialog from './components/RechargeDialog.vue'
import WithdrawDialog from './components/WithdrawDialog.vue'

export default {
  name: 'Dashboard',
  components: {
    Sunny, DataAnalysis, ShoppingBag, UserFilled, Refresh,
    Coin, CirclePlus, DocumentAdd, View, ShoppingCartFull,
    CreditCard, BellFilled, WarningFilled, PieChart,
    TrendCharts, Goods, Ship, Service, Money,
    // 新增图标组件
    WalletFilled, Wallet, Plus, ShoppingCart,
    Management, InfoFilled, Bell, SuccessFilled,
    CircleCheckFilled, CircleCloseFilled, Timer,
    Notification, Warning,
    RechargeDialog, WithdrawDialog
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const currentDate = ref('')
    const accountBalance = ref(1285.69)
    const overviewTimeRange = ref('7days')
    const rankingTimeRange = ref('30days')
    const selectedStore = ref('all')
    const chartTimeRange = ref('7days')
    const customChartDateRange = ref([])

    // 弹窗状态
    const showRechargeDialog = ref(false)
    const showWithdrawDialog = ref(false)

    // 时间范围选项
    const timeRangeOptions = reactive([
      { label: '今日', value: 'today' },
      { label: '近七日', value: '7days' },
      { label: '近30天', value: '30days' },
      { label: '近60天', value: '60days' },
      { label: '近1年', value: '1year' },
      { label: '自定义', value: 'custom' }
    ])

    // 产品排行时间选项
    const rankingTimeOptions = reactive([
      { label: '最近3天', value: '3days' },
      { label: '最近15天', value: '15days' },
      { label: '最近30天', value: '30days' }
    ])

    // 店铺选项
    const storeOptions = reactive([
      { label: '全部店铺', value: 'all' },
      { label: 'Shopify店铺A', value: 'shopify-a' },
      { label: 'Shopify店铺B', value: 'shopify-b' }
    ])

    // 图表时间选项
    const chartTimeOptions = reactive([
      { label: '近7天', value: '7days' },
      { label: '本周', value: 'thisWeek' },
      { label: '本月', value: 'thisMonth' },
      { label: '近30天', value: '30days' },
      { label: '自定义', value: 'custom' }
    ])

    // 图表相关
    const showTooltip = ref(false)
    const tooltipX = ref(0)
    const tooltipY = ref(0)
    const tooltipData = ref({})
    
    // 数据概览（移除利润卡片，保留5个）
    const overviewData = reactive([
      {
        title: '销售额',
        value: '¥45,230',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: 'Coin'
      },
      {
        title: '订单数',
        value: '156',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: 'ShoppingBag'
      },
      {
        title: '客户单价',
        value: '¥290.06',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: 'UserFilled'
      },
      {
        title: '退款额',
        value: '¥1,240',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        icon: 'Refresh'
      },
      {
        title: '退款单数',
        value: '8',
        color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        icon: 'DocumentAdd'
      }
    ])
    
    // 产品排行数据
    const topProducts = reactive([
      {
        id: 1,
        name: '无线蓝牙耳机',
        category: '电子产品',
        sku: 'WBT-001',
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=80&h=80&fit=crop&crop=center',
        store: 'Shopify店铺A',
        sales: 245,
        revenue: 12250
      },
      {
        id: 2,
        name: '智能手表',
        category: '电子产品',
        sku: 'SW-002',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop&crop=center',
        store: 'Shopify店铺B',
        sales: 189,
        revenue: 18900
      },
      {
        id: 3,
        name: '运动鞋',
        category: '服装',
        sku: 'SHOE-003',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop&crop=center',
        store: 'Shopify店铺A',
        sales: 167,
        revenue: 8350
      },
      {
        id: 4,
        name: '咖啡机',
        category: '家居',
        sku: 'CM-004',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop&crop=center',
        store: 'Shopify店铺B',
        sales: 134,
        revenue: 13400
      },
      {
        id: 5,
        name: '护肤套装',
        category: '美容',
        sku: 'SK-005',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop&crop=center',
        store: 'Shopify店铺A',
        sales: 98,
        revenue: 4900
      }
    ])
    
    // 图表数据
    const chartData = reactive([
      { date: '01-15', orders: 45, sales: 12500 },
      { date: '01-16', orders: 52, sales: 14800 },
      { date: '01-17', orders: 38, sales: 10200 },
      { date: '01-18', orders: 67, sales: 18900 },
      { date: '01-19', orders: 43, sales: 11600 },
      { date: '01-20', orders: 58, sales: 16400 },
      { date: '01-21', orders: 71, sales: 21300 }
    ])
    
    // 最近交易记录
    const recentTransactions = reactive([
      {
        id: 1,
        type: 'income',
        title: '订单收入',
        description: '订单 #ORD-2024-001 完成',
        amount: 299,
        time: '2024-01-21 14:30',
        orderId: 'ORD-2024-001'
      },
      {
        id: 2,
        type: 'expense',
        title: '采购支出',
        description: '供应商付款',
        amount: -1580,
        time: '2024-01-21 10:15'
      },
      {
        id: 3,
        type: 'income',
        title: '佣金收入',
        description: '推广佣金结算',
        amount: 125,
        time: '2024-01-20 16:45'
      },
      {
        id: 4,
        type: 'expense',
        title: '退款支出',
        description: '订单 #ORD-2024-002 退款',
        amount: -189,
        time: '2024-01-20 09:20',
        orderId: 'ORD-2024-002'
      }
    ])
    
    // 快捷操作
    const quickActions = reactive([
      {
        key: 'add-product',
        title: '上架产品',
        description: '添加新产品到店铺',
        icon: 'Plus',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        key: 'view-orders',
        title: '查看订单',
        description: '管理所有订单',
        icon: 'ShoppingCart',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        key: 'procurement',
        title: '采购管理',
        description: '处理采购订单',
        icon: 'Management',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        key: 'commission',
        title: '佣金管理',
        description: '查看佣金收益',
        icon: 'WalletFilled',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ])
    
    // 通知公告
    const notifications = reactive([
      {
        id: 1,
        type: 'warning',
        title: '库存不足提醒',
        time: '1小时前'
      },
      {
        id: 2,
        type: 'notice',
        title: '系统维护通知',
        time: '3小时前'
      },
      {
        id: 3,
        type: 'success',
        title: '订单处理完成',
        time: '5小时前'
      },
      {
        id: 4,
        type: 'info',
        title: '新功能上线通知',
        time: '1天前'
      }
    ])
    
    // 计算属性
    const orderLinePoints = computed(() => {
      return chartData.map((_, index) => {
        const x = getXPosition(index)
        const y = getOrderYPosition(chartData[index].orders)
        return `${x},${y}`
      }).join(' ')
    })
    
    const salesLinePoints = computed(() => {
      return chartData.map((_, index) => {
        const x = getXPosition(index)
        const y = getSalesYPosition(chartData[index].sales)
        return `${x},${y}`
      }).join(' ')
    })
    
    // 方法
    const updateCurrentDate = () => {
      const now = new Date()
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      }
      currentDate.value = now.toLocaleDateString('zh-CN', options)
    }
    
    const getXPosition = (index) => {
      const width = 600 // SVG宽度
      const padding = 50
      const stepWidth = (width - 2 * padding) / (chartData.length - 1)
      return padding + index * stepWidth
    }
    
    const getOrderYPosition = (orders) => {
      const height = 300
      const padding = 30
      const maxOrders = Math.max(...chartData.map(d => d.orders))
      const ratio = (height - 2 * padding) / maxOrders
      return height - padding - orders * ratio
    }
    
    const getSalesYPosition = (sales) => {
      const height = 300
      const padding = 30
      const maxSales = Math.max(...chartData.map(d => d.sales))
      const ratio = (height - 2 * padding) / maxSales
      return height - padding - sales * ratio
    }
    
    const handleChartMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const dataIndex = Math.round((x - 50) / ((600 - 100) / (chartData.length - 1)))
      
      if (dataIndex >= 0 && dataIndex < chartData.length) {
        showTooltip.value = true
        tooltipX.value = event.clientX - rect.left
        tooltipY.value = event.clientY - rect.top - 10
        tooltipData.value = chartData[dataIndex]
      }
    }
    
    const hideTooltip = () => {
      showTooltip.value = false
    }
    
    const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAzMEM0My4zMTM3IDMwIDQ2IDMyLjY4NjMgNDYgMzZDNDYgMzkuMzEzNyA0My4zMTM3IDQyIDQwIDQyQzM2LjY4NjMgNDIgMzQgMzkuMzEzNyAzNCAzNkMzNCAzMi42ODYzIDM2LjY4NjMgMzAgNDAgMzBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0yOCA1MEw1MiA1MEw0NiA0NEw0MCA0NkwzNCA0NEwyOCA1MFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPC9zdmc+'
    }
    
    const getStoreTagType = (store) => {
      const types = {
        'Shopify店铺A': 'primary',
        'Shopify店铺B': 'success'
      }
      return types[store] || 'info'
    }
    
    const getTransactionIcon = (type) => {
      return type === 'income' ? 'CircleCheckFilled' : 'CircleCloseFilled'
    }
    
    const getNotificationIcon = (type) => {
      const iconMap = {
        'warning': 'Warning',
        'notice': 'Notification',
        'info': 'InfoFilled',
        'success': 'SuccessFilled'
      }
      return iconMap[type] || 'Bell'
    }
    
    const goToBalance = () => {
      router.push('/merchant/balance')
    }
    
    const handleRecharge = () => {
      showRechargeDialog.value = true
    }

    const handleWithdraw = () => {
      showWithdrawDialog.value = true
    }

    const handleRechargeSuccess = (data) => {
      console.log('充值成功:', data)
      // 这里可以刷新余额数据
      // accountBalance.value += parseFloat(data.amount)
    }

    const handleWithdrawSuccess = (data) => {
      console.log('提现申请成功:', data)
      // 这里可以处理提现成功后的逻辑
    }
    
    const handleQuickAction = (key) => {
      const routes = {
        'add-product': '/merchant/products/add',
        'view-orders': '/merchant/orders',
        'procurement': '/merchant/procurement',
        'commission': '/merchant/commission'
      }
      if (routes[key]) {
        router.push(routes[key])
      }
    }
    
    const viewTransactionDetail = (record) => {
      if (record.orderId) {
        router.push(`/merchant/orders/${record.orderId}`)
      } else {
        router.push('/merchant/balance')
      }
    }

    // 图表时间处理方法
    const handleChartTimeChange = (timeRange) => {
      chartTimeRange.value = timeRange
      if (timeRange !== 'custom') {
        customChartDateRange.value = []
      }
      updateChartData(timeRange)
    }

    const handleCustomDateChange = (dateRange) => {
      if (dateRange && dateRange.length === 2) {
        updateChartData('custom', dateRange)
      }
    }

    const updateChartData = (timeRange, customRange = null) => {
      console.log('更新图表数据:', timeRange, customRange)

      // 根据时间范围生成不同的数据
      let newData = []
      const today = new Date()

      switch (timeRange) {
        case '7days':
          newData = generateChartData(7, '近7天')
          break
        case 'thisWeek':
          newData = generateWeekData()
          break
        case 'thisMonth':
          newData = generateMonthData()
          break
        case '30days':
          newData = generateChartData(30, '近30天')
          break
        case 'custom':
          if (customRange) {
            newData = generateCustomData(customRange)
          }
          break
        default:
          newData = generateChartData(7, '近7天')
      }

      // 更新图表数据
      chartData.splice(0, chartData.length, ...newData)
    }

    const generateChartData = (days, label) => {
      const data = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        data.push({
          date: dateStr,
          orders: Math.floor(Math.random() * 50) + 30,
          sales: Math.floor(Math.random() * 15000) + 8000
        })
      }
      return data
    }

    const generateWeekData = () => {
      const data = []
      const today = new Date()
      const currentDay = today.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - currentDay + 1) // 本周一

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        data.push({
          date: dateStr,
          orders: Math.floor(Math.random() * 60) + 25,
          sales: Math.floor(Math.random() * 18000) + 10000
        })
      }
      return data
    }

    const generateMonthData = () => {
      const data = []
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      // 生成本月每天的数据（最多显示30个点，如果天数太多则按周聚合）
      const step = daysInMonth > 30 ? Math.ceil(daysInMonth / 30) : 1

      for (let i = 1; i <= daysInMonth; i += step) {
        const date = new Date(year, month, i)
        const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        data.push({
          date: dateStr,
          orders: Math.floor(Math.random() * 80) + 40,
          sales: Math.floor(Math.random() * 25000) + 15000
        })
      }
      return data
    }

    const generateCustomData = (dateRange) => {
      const data = []
      const startDate = new Date(dateRange[0])
      const endDate = new Date(dateRange[1])
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 如果天数太多，按周或月聚合
      const step = diffDays > 30 ? Math.ceil(diffDays / 30) : 1

      for (let i = 0; i <= diffDays; i += step) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

        data.push({
          date: dateStr,
          orders: Math.floor(Math.random() * 70) + 20,
          sales: Math.floor(Math.random() * 20000) + 8000
        })
      }
      return data
    }

    // 生命周期
    onMounted(() => {
      updateCurrentDate()
      updateChartData('7days') // 初始化图表数据
    })
    
    return {
      currentDate,
      accountBalance,
      overviewTimeRange,
      rankingTimeRange,
      selectedStore,
      chartTimeRange,
      customChartDateRange,
      timeRangeOptions,
      rankingTimeOptions,
      storeOptions,
      chartTimeOptions,
      overviewData,
      topProducts,
      chartData,
      recentTransactions,
      quickActions,
      notifications,
      showTooltip,
      tooltipX,
      tooltipY,
      tooltipData,
      orderLinePoints,
      salesLinePoints,
      showRechargeDialog,
      showWithdrawDialog,
      getXPosition,
      getOrderYPosition,
      getSalesYPosition,
      handleChartMouseMove,
      hideTooltip,
      handleImageError,
      getStoreTagType,
      getTransactionIcon,
      getNotificationIcon,
      goToBalance,
      handleRecharge,
      handleWithdraw,
      handleRechargeSuccess,
      handleWithdrawSuccess,
      handleQuickAction,
      viewTransactionDetail,
      handleChartTimeChange,
      handleCustomDateChange,
      updateChartData
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-content .date {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.banner-decoration {
  font-size: 48px;
  opacity: 0.9;
  animation: float 3s ease-in-out infinite;
}

.decoration-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 账户余额卡片 */
.balance-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-header h3 {
  margin: 0;
  color: #333;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
}

.balance-amount .currency {
  font-size: 20px;
  color: #666;
  margin-right: 4px;
}

.balance-amount .amount {
  font-size: 36px;
  font-weight: 600;
  color: #333;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

/* 数据概览 */
.data-overview {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-header h3 {
  margin: 0;
  color: #333;
}

.time-filter-buttons {
  display: flex;
  align-items: center;
}

.time-filter-buttons .el-button-group {
  border-radius: 6px;
  overflow: hidden;
}

.time-filter-buttons .el-button {
  border-radius: 0;
  transition: all 0.3s ease;
}

.time-filter-buttons .el-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.time-filter-buttons .el-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  font-size: 20px;
  background: var(--icon-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.card-icon:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.card-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 产品排行 */
.product-ranking {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ranking-header h3 {
  margin: 0;
  color: #333;
}

.ranking-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  min-width: 60px;
}

.filter-group .el-button-group {
  border-radius: 6px;
  overflow: hidden;
}

.filter-group .el-button {
  border-radius: 0;
  transition: all 0.3s ease;
  font-size: 12px;
  padding: 6px 12px;
}

.filter-group .el-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.filter-group .el-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.filter-group .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.filter-group .el-button--default:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .ranking-filters {
    flex-direction: row;
    align-items: center;
    gap: 24px;
  }
}

.ranking-table {
  overflow-x: auto;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 60px 200px 100px 120px 120px 80px 100px;
  gap: 16px;
  align-items: center;
  padding: 12px 0;
}

.table-header {
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #eee;
}

.table-row {
  border-bottom: 1px solid #f5f5f5;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.ranking-cell {
  display: flex;
  justify-content: center;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 12px;
}

.rank-1 { background-color: #f56c6c; }
.rank-2 { background-color: #e6a23c; }
.rank-3 { background-color: #67c23a; }
.rank-4, .rank-5 { background-color: #909399; }

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-cell img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
}

/* 图表区域 */
.chart-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-header h3 {
  margin: 0;
  color: #333;
}

.chart-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.chart-time-filter .el-button-group {
  border-radius: 6px;
  overflow: hidden;
}

.chart-time-filter .el-button {
  border-radius: 0;
  transition: all 0.3s ease;
  font-size: 12px;
  padding: 6px 12px;
}

.chart-time-filter .el-button:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.chart-time-filter .el-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.chart-time-filter .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.chart-time-filter .el-button--default:hover {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.custom-date-picker {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-filters {
    width: 100%;
    justify-content: flex-start;
  }
}

.chart-container {
  position: relative;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
}

/* 交易记录 */
.transaction-records {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.records-header h3 {
  margin: 0;
  color: #333;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.record-icon.income {
  background: linear-gradient(135deg, #67c23a 0%, #27ae60 100%);
}

.record-icon.expense {
  background: linear-gradient(135deg, #f56c6c 0%, #e74c3c 100%);
}

.record-item:hover .record-icon {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.record-content {
  flex: 1;
}

.record-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.record-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  margin-right: 16px;
}

.record-amount.income {
  color: #67c23a;
}

.record-amount.expense {
  color: #f56c6c;
}

/* 快捷操作 */
.quick-actions {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 20px;
  background: var(--icon-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.action-card:hover .action-icon {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.action-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.action-description {
  font-size: 12px;
  color: #666;
}

/* 通知公告 */
.notifications {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.notifications h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.notification-icon.warning {
  background: linear-gradient(135deg, #ff9a56 0%, #ff8a80 100%);
}

.notification-icon.notice {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.notification-icon.success {
  background: linear-gradient(135deg, #67c23a 0%, #27ae60 100%);
}

.notification-icon.info {
  background: linear-gradient(135deg, #909399 0%, #7f8c8d 100%);
}

.notification-icon:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .action-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header, .table-row {
    grid-template-columns: 40px 150px 80px 80px 80px 60px 80px;
    gap: 8px;
    font-size: 12px;
  }
}
</style> 