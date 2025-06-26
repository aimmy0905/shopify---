<template>
  <div class="dashboard">
    <!-- 顶部余额卡片 - 蓝色主题 -->
    <div class="balance-card-new">
      <div class="balance-main">
        <div class="balance-left">
          <div class="balance-title">账户余额</div>
          <div class="balance-amount-new">
            <span class="currency-new">$</span>
            <span class="amount-new">{{ accountBalance.toFixed(2) }}</span>
          </div>
          <div class="balance-actions">
            <el-button type="text" class="action-btn" @click="handleRecharge">
              余额充值
            </el-button>
            <el-button type="text" class="action-btn" @click="handleWithdraw">
              余额提现
            </el-button>
            <el-button type="text" class="action-btn" @click="handleViewMore">
              查看更多
            </el-button>
          </div>
        </div>
        <div class="balance-right">
          <!-- 右侧预留空间，可用于其他功能 -->
        </div>
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
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-title">{{ item.title }}</div>
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
            <el-icon><component :is="getTransactionIcon(record.type)" /></el-icon>
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
import {
  Phone, Coin, ShoppingBag, UserFilled, Refresh, DocumentAdd,
  Money, CreditCard, ShoppingCart, Goods
} from '@element-plus/icons-vue'
import RechargeDialog from './components/RechargeDialog.vue'
import WithdrawDialog from './components/WithdrawDialog.vue'

export default {
  name: 'Dashboard',
  components: {
    Phone, Coin, ShoppingBag, UserFilled, Refresh, DocumentAdd,
    Money, CreditCard, ShoppingCart, Goods,
    RechargeDialog,
    WithdrawDialog
  },
  setup() {
    const router = useRouter()

    // 响应式数据
    const accountBalance = ref(12580.50)
    const showRechargeDialog = ref(false)
    const showWithdrawDialog = ref(false)
    const overviewTimeRange = ref('7days')
    const rankingTimeRange = ref('30days')
    const selectedStore = ref('all')
    const chartTimeRange = ref('7days')
    const customChartDateRange = ref([])

    // 图表相关
    const showTooltip = ref(false)
    const tooltipX = ref(0)
    const tooltipY = ref(0)
    const tooltipData = ref({})

    // 计算属性
    const currentDate = computed(() => {
      return new Date().toLocaleString('zh-CN')
    })

    // 时间范围选项
    const timeRangeOptions = reactive([
      { label: '今日', value: 'today' },
      { label: '近七日', value: '7days' },
      { label: '近30天', value: '30days' },
      { label: '近60天', value: '60days' },
      { label: '近1年', value: '1year' }
    ])

    const rankingTimeOptions = reactive([
      { label: '近7天', value: '7days' },
      { label: '近30天', value: '30days' },
      { label: '近60天', value: '60days' },
      { label: '近1年', value: '1year' }
    ])

    const storeOptions = reactive([
      { label: '全部店铺', value: 'all' },
      { label: 'Shopify Store 1', value: 'store1' },
      { label: 'Shopify Store 2', value: 'store2' },
      { label: 'Amazon Store', value: 'store3' }
    ])

    const chartTimeOptions = reactive([
      { label: '近7天', value: '7days' },
      { label: '本周', value: 'thisWeek' },
      { label: '本月', value: 'thisMonth' },
      { label: '近30天', value: '30days' },
      { label: '自定义', value: 'custom' }
    ])

    // 数据概览
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
        name: 'iPhone 14 Pro Max',
        category: '电子产品',
        sku: 'IP14PM-256-BLK',
        store: 'Shopify Store 1',
        sales: 156,
        revenue: 234000,
        image: 'https://via.placeholder.com/40x40/409eff/ffffff?text=📱'
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        category: '电脑',
        sku: 'MBA-M2-256-SLV',
        store: 'Shopify Store 2',
        sales: 89,
        revenue: 178000,
        image: 'https://via.placeholder.com/40x40/67c23a/ffffff?text=💻'
      },
      {
        id: 3,
        name: 'AirPods Pro 2',
        category: '音频',
        sku: 'APP2-WHT',
        store: 'Amazon Store',
        sales: 234,
        revenue: 52000,
        image: 'https://via.placeholder.com/40x40/e6a23c/ffffff?text=🎧'
      }
    ])

    // 交易记录数据
    const recentTransactions = reactive([
      {
        id: 1,
        title: '订单收入',
        time: '2024-06-25 14:30',
        amount: 1250.00,
        type: 'income'
      },
      {
        id: 2,
        title: '退款处理',
        time: '2024-06-25 12:15',
        amount: -320.50,
        type: 'expense'
      },
      {
        id: 3,
        title: '平台费用',
        time: '2024-06-25 10:20',
        amount: -45.00,
        type: 'expense'
      }
    ])

    // 图表数据
    const chartData = reactive([
      { date: '06-19', orders: 45, sales: 12500 },
      { date: '06-20', orders: 52, sales: 15200 },
      { date: '06-21', orders: 38, sales: 9800 },
      { date: '06-22', orders: 61, sales: 18600 },
      { date: '06-23', orders: 47, sales: 13400 },
      { date: '06-24', orders: 55, sales: 16800 },
      { date: '06-25', orders: 42, sales: 11200 }
    ])

    // 计算图表线条点位
    const orderLinePoints = computed(() => {
      return chartData.map((point, index) => {
        const x = getXPosition(index)
        const y = getOrderYPosition(point.orders)
        return `${x},${y}`
      }).join(' ')
    })

    const salesLinePoints = computed(() => {
      return chartData.map((point, index) => {
        const x = getXPosition(index)
        const y = getSalesYPosition(point.sales)
        return `${x},${y}`
      }).join(' ')
    })

    // 方法
    const handleRecharge = () => {
      showRechargeDialog.value = true
    }

    const handleWithdraw = () => {
      showWithdrawDialog.value = true
    }

    const handleRechargeSuccess = () => {
      console.log('充值成功')
    }

    const handleWithdrawSuccess = () => {
      console.log('提现成功')
    }

    const goToInvoice = () => {
      router.push('/merchant/invoices')
    }

    const handleViewMore = () => {
      router.push('/merchant/balance')
    }

    const getTransactionIcon = (type) => {
      return type === 'income' ? 'Money' : 'CreditCard'
    }

    const getStoreTagType = (store) => {
      const types = ['', 'success', 'info', 'warning']
      return types[Math.floor(Math.random() * types.length)]
    }

    const handleImageError = (event) => {
      // 使用CSS创建一个简单的占位符
      event.target.style.display = 'none'
      const placeholder = event.target.parentNode.querySelector('.image-placeholder')
      if (!placeholder) {
        const div = document.createElement('div')
        div.className = 'image-placeholder'
        div.style.cssText = `
          width: 32px;
          height: 32px;
          background: #f5f7fa;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #909399;
        `
        div.textContent = '📦'
        event.target.parentNode.insertBefore(div, event.target)
      }
    }

    const viewTransactionDetail = (record) => {
      console.log('查看交易详情:', record)
    }

    const handleChartTimeChange = (value) => {
      chartTimeRange.value = value
      updateChartData(value)
    }

    const handleCustomDateChange = (dates) => {
      if (dates && dates.length === 2) {
        updateChartData('custom', dates)
      }
    }

    const updateChartData = (timeRange, customRange = null) => {
      console.log('更新图表数据:', timeRange, customRange)
    }

    // 图表位置计算
    const getXPosition = (index) => {
      const width = 800
      const padding = 50
      const step = (width - padding * 2) / (chartData.length - 1)
      return padding + index * step
    }

    const getOrderYPosition = (orders) => {
      const height = 300
      const padding = 30
      const maxOrders = Math.max(...chartData.map(d => d.orders))
      const ratio = (height - padding * 2) / maxOrders
      return height - padding - orders * ratio
    }

    const getSalesYPosition = (sales) => {
      const height = 300
      const padding = 30
      const maxSales = Math.max(...chartData.map(d => d.sales))
      const ratio = (height - padding * 2) / maxSales
      return height - padding - sales * ratio
    }

    const handleChartMouseMove = (event) => {
      // 图表鼠标移动处理
      showTooltip.value = true
      tooltipX.value = event.offsetX
      tooltipY.value = event.offsetY
      tooltipData.value = {
        date: '2024-06-25',
        orders: 42,
        sales: 11200
      }
    }

    const hideTooltip = () => {
      showTooltip.value = false
    }

    return {
      accountBalance,
      showRechargeDialog,
      showWithdrawDialog,
      overviewTimeRange,
      rankingTimeRange,
      selectedStore,
      chartTimeRange,
      customChartDateRange,
      currentDate,
      timeRangeOptions,
      rankingTimeOptions,
      storeOptions,
      chartTimeOptions,
      overviewData,
      topProducts,
      recentTransactions,
      chartData,
      orderLinePoints,
      salesLinePoints,
      showTooltip,
      tooltipX,
      tooltipY,
      tooltipData,
      handleRecharge,
      handleWithdraw,
      handleRechargeSuccess,
      handleWithdrawSuccess,
      goToInvoice,
      handleViewMore,
      getTransactionIcon,
      getStoreTagType,
      handleImageError,
      viewTransactionDetail,
      handleChartTimeChange,
      handleCustomDateChange,
      updateChartData,
      getXPosition,
      getOrderYPosition,
      getSalesYPosition,
      handleChartMouseMove,
      hideTooltip
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
  font-size: 36px;
  font-weight: 600;
  line-height: 1;
}

.balance-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  color: white;
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  min-width: 80px;
  text-align: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.balance-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* 数据概览 */
.data-overview {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f5f5f5;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.time-filter-buttons .el-button-group .el-button {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--icon-color, #409eff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 20px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 图表区域 */
.chart-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f5f5f5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.chart-filters {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-filters .el-button-group .el-button {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

.chart-container {
  position: relative;
  height: 300px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
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

.tooltip-date {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-item {
  margin: 2px 0;
}

/* 交易记录 */
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
  background-color: #f8f9fa;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
}

.transaction-icon.income {
  background: #f0f9ff;
  color: #67c23a;
}

.transaction-icon.expense {
  background: #fef0f0;
  color: #f56c6c;
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
  color: #67c23a;
}

.transaction-amount.expense {
  color: #f56c6c;
}

/* 产品排行 */
.product-ranking {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f5f5f5;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.ranking-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.ranking-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.ranking-filters .el-button-group .el-button {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

.ranking-table {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 100px 120px 120px 80px 100px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.header-cell {
  padding: 12px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.table-body {
  max-height: 400px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px 120px 120px 80px 100px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 12px 8px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-cell {
  justify-content: center;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.ranking-number.rank-1 {
  background: #ffd700;
}

.ranking-number.rank-2 {
  background: #c0c0c0;
}

.ranking-number.rank-3 {
  background: #cd7f32;
}

.ranking-number:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: #909399;
}

.product-cell {
  justify-content: flex-start;
  gap: 12px;
}

.product-cell img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.image-placeholder {
  width: 32px;
  height: 32px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
}

.product-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }

  .balance-card-new {
    padding: 20px;
  }

  .balance-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .balance-right {
    align-items: flex-start;
  }

  .overview-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .chart-header,
  .transaction-header,
  .ranking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-filters,
  .ranking-filters {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .table-header,
  .table-row {
    grid-template-columns: 50px 1fr 80px 100px 100px 60px 80px;
    font-size: 12px;
  }

  .header-cell,
  .cell {
    padding: 8px 4px;
  }

  .product-name {
    max-width: 100px;
  }
}
</style>
