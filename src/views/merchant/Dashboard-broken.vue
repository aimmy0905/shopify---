<template>
  <div class="dashboard">
    <!-- 顶部余额卡片 - 蓝色主题 -->
    <div class="balance-card-new">
      <div class="balance-main">
        <div class="balance-left">
          <div class="balance-title">Balance</div>
          <div class="balance-amount-new">
            <span class="currency-new">$</span>
            <span class="amount-new">{{ accountBalance.toFixed(0) }}</span>
          </div>
          <div class="deposit-action">
            <el-button type="text" class="deposit-btn" @click="handleRecharge">
              Deposit >
            </el-button>
          </div>
        </div>
        <div class="balance-right">
          <div class="invoice-link">
            <el-button type="text" class="invoice-btn" @click="goToInvoice">
              Invoice >>
            </el-button>
          </div>
          <div class="help-contact">
            <el-icon class="phone-icon"><Phone /></el-icon>
            <span class="phone-number">+86 198 8418 1127</span>
          </div>
        </div>
      </div>
      <div class="update-time">
        <span>Updated Time：{{ currentDate }}</span>
      </div>
    </div>

    <!-- 简化的内容区域 -->
    <div class="dashboard-content">
      <h2>商户仪表板</h2>
      <p>欢迎使用商户管理系统</p>
    </div>

    <!-- 充值弹窗 -->
    <recharge-dialog v-model="showRechargeDialog" @success="handleRechargeSuccess" />

    <!-- 提现弹窗 -->
    <withdraw-dialog v-model="showWithdrawDialog" @success="handleWithdrawSuccess" />
  </div>
</template>

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

    <!-- 订单统计图表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>订单统计</h3>
        <div class="chart-filters">
          <div class="time-filter">
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
          <div class="custom-date-filter" v-if="chartTimeRange === 'custom'">
            <el-date-picker
              v-model="customChartDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              @change="handleCustomDateChange"
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
          <!-- 图表网格线 -->
          <defs>
            <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" stroke-width="1"/>
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
            :key="'orders-' + index"
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

        <!-- 图表提示框 -->
        <div
          v-if="showTooltip"
          class="chart-tooltip"
          :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
        >
          <div class="tooltip-date">{{ tooltipData.date }}</div>
          <div class="tooltip-item">
            <span class="tooltip-label orders">订单数：</span>
            <span class="tooltip-value">{{ tooltipData.orders }}</span>
          </div>
          <div class="tooltip-item">
            <span class="tooltip-label sales">销售额：</span>
            <span class="tooltip-value">¥{{ tooltipData.sales }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易记录 -->
    <div class="transaction-history">
      <div class="transaction-header">
        <h3>交易记录</h3>
        <div class="transaction-filters">
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
      <div class="transaction-list">
        <div class="transaction-item" v-for="record in recentTransactions" :key="record.id">
          <div class="transaction-icon" :class="record.type">
            <component :is="getTransactionIcon(record.type)"></component>
          </div>
          <div class="transaction-content">
            <div class="transaction-title">{{ record.title }}</div>
            <div class="transaction-time">{{ record.time }}</div>
          </div>
          <div class="transaction-amount" :class="record.type">
            {{ record.type === 'income' ? '+' : '-' }}¥{{ Math.abs(record.amount).toFixed(2) }}
          </div>
          <div class="transaction-actions">
            <el-button type="text" size="small" @click="viewTransactionDetail(record)">
              查看详情
            </el-button>
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
  Management,
  CircleCheckFilled, CircleCloseFilled, Timer,
  Phone, VideoPlay, MoreFilled
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
    Management,
    CircleCheckFilled, CircleCloseFilled, Timer,
    Phone, VideoPlay, MoreFilled,
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
        color: '#409eff',
        icon: 'Coin'
      },
      {
        title: '订单数',
        value: '156',
        color: '#409eff',
        icon: 'ShoppingBag'
      },
      {
        title: '客户单价',
        value: '¥290.06',
        color: '#409eff',
        icon: 'UserFilled'
      },
      {
        title: '退款额',
        value: '¥1,240',
        color: '#409eff',
        icon: 'Refresh'
      },
      {
        title: '退款单数',
        value: '8',
        color: '#409eff',
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
        title: '订单指出',
        description: '订单 #ORD-2024-001 完成',
        amount: -299,
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
        title: '退款退回',
        description: '订单 #ORD-2024-002 退款',
        amount: 189,
        time: '2024-01-20 09:20',
        orderId: 'ORD-2024-002'
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
    

    
    const goToBalance = () => {
      router.push('/merchant/balance')
    }

    const goToInvoice = () => {
      router.push('/merchant/invoices')
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
      goToBalance,
      goToInvoice,
      handleRecharge,
      handleWithdraw,
      handleRechargeSuccess,
      handleWithdrawSuccess,
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

/* 新的余额卡片样式 */
.balance-card-new {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
}

.balance-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.balance-left {
  flex: 1;
}

.balance-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  opacity: 0.9;
}

.balance-amount-new {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
}

.currency-new {
  font-size: 24px;
  margin-right: 4px;
}

.amount-new {
  font-size: 48px;
  font-weight: 600;
  line-height: 1;
}

.deposit-action {
  margin-top: 8px;
}

.deposit-btn {
  color: white !important;
  font-size: 14px;
  padding: 0;
  text-decoration: underline;
}

.deposit-btn:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.balance-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.invoice-btn {
  color: white !important;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.invoice-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.help-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.phone-icon {
  font-size: 16px;
}

.update-time {
  font-size: 12px;
  opacity: 0.8;
}

/* 今日指标样式 */
.today-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  color: #1890ff;
}

/* Sales图表样式 */
.sales-chart-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chart-filters-new {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-filter-btn {
  min-width: 60px;
}

.help-video-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chart-container-new {
  height: 300px;
  position: relative;
}

/* 底部两栏布局 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.transaction-section,
.bestsellers-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.time-filters-small {
  display: flex;
  gap: 4px;
}

.time-filters-small .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.more-btn {
  color: #666 !important;
  padding: 4px;
}

/* 交易记录样式 */
.transaction-list-new {
  margin-bottom: 16px;
}

.transaction-item-new {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.transaction-item-new:last-child {
  border-bottom: none;
}

.transaction-icon-new {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  color: white;
}

.transaction-icon-new.income {
  background: #52c41a;
}

.transaction-icon-new.expense {
  background: #ff4d4f;
}

.transaction-content-new {
  flex: 1;
}

.transaction-title-new {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.transaction-time-new {
  font-size: 12px;
  color: #999;
}

.transaction-amount-new {
  font-size: 14px;
  font-weight: 600;
}

.transaction-amount-new.income {
  color: #52c41a;
}

.transaction-amount-new.expense {
  color: #ff4d4f;
}

.view-detail-section {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.view-detail-btn {
  width: 100%;
}

/* Best Sellers样式 */
.bestsellers-content {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-data-placeholder {
  text-align: center;
  color: #999;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f5f5f5;
  min-height: 80px;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  font-size: 20px;
  background: var(--icon-color);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.card-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.card-content h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1;
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

/* 交易记录 - 参考截图优化 */
.transaction-history {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f5f5f5;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.transaction-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.transaction-filters .el-button-group .el-button {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

.transaction-list {
  margin-top: 16px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:hover {
  background-color: #fafafa;
  border-radius: 6px;
  margin: 0 -8px;
  padding: 16px 8px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
  color: white;
}

.transaction-icon.income {
  background: #52c41a;
}

.transaction-icon.expense {
  background: #ff4d4f;
}

.transaction-content {
  flex: 1;
}

.transaction-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #999;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
  margin-right: 16px;
}

.transaction-amount.income {
  color: #52c41a;
}

.transaction-amount.expense {
  color: #ff4d4f;
}

.transaction-actions .el-button {
  color: #1890ff;
}

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





/* 响应式设计 - 参考截图优化 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .balance-main {
    flex-direction: column;
    gap: 16px;
  }

  .balance-right {
    align-items: flex-start;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-filters {
    width: 100%;
    justify-content: flex-start;
  }

  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .transaction-filters {
    width: 100%;
  }

  .ranking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .ranking-filters {
    width: 100%;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
  }

  .balance-card-new {
    padding: 20px;
  }

  .amount-new {
    font-size: 36px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .overview-card {
    padding: 16px;
  }

  .card-value {
    font-size: 20px;
  }

  .chart-section {
    padding: 16px;
  }

  .transaction-history {
    padding: 16px;
  }

  .product-ranking {
    padding: 16px;
  }

  .transaction-item {
    padding: 12px 0;
  }

  .transaction-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  .transaction-amount {
    font-size: 14px;
  }
}
</style> 