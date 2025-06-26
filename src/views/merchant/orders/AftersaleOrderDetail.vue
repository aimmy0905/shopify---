<template>
  <div class="aftersale-order-detail-page">
    <!-- Breadcrumb Navigation -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/merchant' }">控制台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/merchant/orders/aftersale' }">售后订单</el-breadcrumb-item>
      <el-breadcrumb-item>订单详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="loadOrderDetail">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <!-- Order Detail Content -->
    <div v-else-if="orderDetail" class="order-detail-content">
      <!-- Header Section -->
      <div class="detail-header">
        <div class="header-left">
          <h2>售后订单详情</h2>
          <div class="order-meta">
            <span class="order-number">{{ orderDetail.refundOrderNo }}</span>
            <el-tag :type="getStatusType(orderDetail.status)" class="status-tag">
              {{ getStatusText(orderDetail.status) }}
            </el-tag>
          </div>
        </div>

      </div>

      <!-- Main Content Grid -->
      <div class="detail-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Refund Information Card -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Money /></el-icon>
                <span>退款信息</span>
              </div>
            </template>
            
            <div class="refund-info">
              <div class="info-row">
                <span class="label">退款金额:</span>
                <span class="value">${{ orderDetail.refundAmount.toFixed(2) }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">结算金额:</span>
                <div class="settlement-amount">
                  <div class="primary-amount">
                    ${{ orderDetail.refundUsdAmount.toFixed(2) }}
                  </div>
                </div>
              </div>
              
              <div class="info-row">
                <span class="label">退款原因:</span>
                <span class="value reason-text">{{ orderDetail.refundReason }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">申请时间:</span>
                <span class="value">{{ formatDateTime(orderDetail.createdAt) }}</span>
              </div>
            </div>
          </el-card>

          <!-- Customer Information Card -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>客户信息</span>
              </div>
            </template>
            
            <div class="customer-info">
              <div class="info-row">
                <span class="label">客户姓名:</span>
                <span class="value">{{ orderDetail.customerName }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">联系邮箱:</span>
                <span class="value">{{ orderDetail.customerEmail }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">所属店铺:</span>
                <span class="value">{{ orderDetail.storeName }}</span>
              </div>
            </div>
          </el-card>

          <!-- Original Order Reference -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Link /></el-icon>
                <span>原订单信息</span>
              </div>
            </template>
            
            <div class="original-order-info">
              <div class="info-row">
                <span class="label">原订单号:</span>
                <el-button 
                  type="primary" 
                  link 
                  @click="goToOriginalOrder"
                  class="order-link"
                >
                  {{ orderDetail.originalOrderNo }}
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Refund Status Timeline -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Clock /></el-icon>
                <span>处理进度</span>
              </div>
            </template>
            
            <el-timeline class="status-timeline">
              <el-timeline-item
                v-for="(step, index) in statusTimeline"
                :key="index"
                :timestamp="step.timestamp"
                :type="step.type"
                :icon="step.icon"
              >
                <div class="timeline-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>

          <!-- Product Information -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Box /></el-icon>
                <span>退款商品</span>
              </div>
            </template>
            
            <div class="refund-products">
              <div 
                v-for="(product, index) in orderDetail.products" 
                :key="index"
                class="product-item"
              >
                <div class="product-image">
                  <el-image 
                    :src="product.image" 
                    fit="cover"
                    :preview-src-list="[product.image]"
                  />
                </div>
                
                <div class="product-details">
                  <h4 class="product-name">{{ product.name }}</h4>
                  
                  <div class="product-specs">
                    <div 
                      v-for="(value, key) in product.specifications" 
                      :key="key"
                      class="spec-item"
                    >
                      <span class="spec-label">{{ key }}:</span>
                      <span class="spec-value">{{ value }}</span>
                    </div>
                  </div>
                  
                  <div class="product-pricing">
                    <span class="quantity">数量: {{ product.quantity }}</span>
                    <span class="unit-price">单价: ${{ product.unitPrice.toFixed(2) }}</span>
                    <span class="line-total">小计: ${{ product.lineTotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Money,
  User,
  Link,
  Clock,
  Box
} from '@element-plus/icons-vue'


const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(true)
const error = ref('')
const orderDetail = ref(null)
const refreshTimer = ref(null)

// Status timeline data
const statusTimeline = ref([])



// Lifecycle
onMounted(() => {
  loadOrderDetail()

  // Start auto-refresh for exchange rates every 5 minutes
  refreshTimer.value = setInterval(() => {
    updateExchangeRate()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
})

// Methods
const loadOrderDetail = async () => {
  loading.value = true
  error.value = ''

  try {
    const orderId = route.params.id

    // Simulate API call - in production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock data based on the after-sales order list
    const mockOrderDetails = {
      '1': {
        id: '1',
        refundOrderNo: 'RFD202312150001',
        originalOrderNo: 'ORD202312140001',
        originalOrderId: 'order_001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        products: [
          {
            name: '智能手表 Pro Max',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            quantity: 1,
            unitPrice: 299.99,
            specifications: {
              颜色: '深空黑',
              尺寸: '44mm',
              存储: '32GB',
              表带: '运动型表带'
            },
            lineTotal: 299.99
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
      '2': {
        id: '2',
        refundOrderNo: 'RFD202312150002',
        originalOrderNo: 'ORD202312140002',
        originalOrderId: 'order_002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        products: [
          {
            name: '蓝牙耳机 AirPods Pro',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop',
            quantity: 1,
            unitPrice: 89.99,
            specifications: {
              颜色: '白色',
              型号: 'AirPods Pro',
              功能: '主动降噪'
            },
            lineTotal: 89.99
          },
          {
            name: 'USB-C 充电线',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
            quantity: 1,
            unitPrice: 15.00,
            specifications: {
              长度: '1米',
              类型: 'USB-C to USB-C',
              速度: '快充支持'
            },
            lineTotal: 15.00
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
      '3': {
        id: '3',
        refundOrderNo: 'RFD202312150003',
        originalOrderNo: 'ORD202312130001',
        originalOrderId: 'order_003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@example.com',
        products: [
          {
            name: 'iPhone 15 Pro 手机壳',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=200&h=200&fit=crop',
            quantity: 2,
            unitPrice: 19.99,
            specifications: {
              颜色: '透明',
              材质: '硅胶',
              兼容性: 'iPhone 15 Pro'
            },
            lineTotal: 39.98
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
      '4': {
        id: '4',
        refundOrderNo: 'RFD202312150004',
        originalOrderNo: 'ORD202312120001',
        originalOrderId: 'order_004',
        customerName: 'Sarah Wilson',
        customerEmail: 'sarah.wilson@example.com',
        products: [
          {
            name: '游戏机械键盘',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop',
            quantity: 1,
            unitPrice: 189.99,
            specifications: {
              轴体: '青轴',
              背光: 'RGB',
              布局: '87键'
            },
            lineTotal: 189.99
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
      }
    }

    orderDetail.value = mockOrderDetails[orderId]

    if (!orderDetail.value) {
      throw new Error('订单不存在')
    }

    // Generate status timeline based on order status
    generateStatusTimeline()

    // Update exchange rate display
    setTimeout(() => {
      updateExchangeRate()
    }, 100)

  } catch (err) {
    error.value = err.message || '加载订单详情失败'
  } finally {
    loading.value = false
  }
}

const generateStatusTimeline = () => {
  const status = orderDetail.value.status
  const createdAt = orderDetail.value.createdAt

  const baseTimeline = [
    {
      title: '退款申请提交',
      description: '客户提交退款申请',
      timestamp: createdAt,
      type: 'success',
      icon: 'Check'
    }
  ]

  if (status === 'processing') {
    baseTimeline.push({
      title: '正在处理',
      description: '商家正在审核退款申请',
      timestamp: '2023-12-15 11:00:00',
      type: 'primary',
      icon: 'Clock'
    })
  } else if (status === 'completed') {
    baseTimeline.push(
      {
        title: '申请审核通过',
        description: '退款申请已通过审核',
        timestamp: '2023-12-15 11:00:00',
        type: 'success',
        icon: 'Check'
      },
      {
        title: '退款已处理',
        description: '退款已成功处理并发放给客户',
        timestamp: '2023-12-15 14:30:00',
        type: 'success',
        icon: 'Money'
      }
    )
  } else if (status === 'rejected') {
    baseTimeline.push({
      title: '申请被拒绝',
      description: '退款申请不符合退款政策',
      timestamp: '2023-12-15 11:00:00',
      type: 'danger',
      icon: 'Close'
    })
  }

  statusTimeline.value = baseTimeline
}







const goToOriginalOrder = () => {
  router.push(`/merchant/orders/${orderDetail.value.originalOrderId}`)
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
.aftersale-order-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
}

.loading-container,
.error-container {
  margin-top: 40px;
}

.order-detail-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.detail-header {
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-number {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.status-tag {
  font-size: 12px;
}



/* Main Content Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Info Cards */
.info-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.card-header .el-icon {
  color: #409EFF;
}

/* Refund Information */
.refund-info,
.customer-info,
.original-order-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-row .label {
  min-width: 80px;
  color: #606266;
  font-weight: 500;
}

.info-row .value {
  color: #303133;
  flex: 1;
}

.reason-text {
  line-height: 1.6;
}

/* Settlement Amount Display */
.settlement-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settlement-amount .primary-amount {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.settlement-amount .exchange-rate-line {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

/* Order Link */
.order-link {
  padding: 0;
  font-weight: 500;
}

/* Status Timeline */
.status-timeline {
  margin-top: 8px;
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

/* Product Information */
.refund-products {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  font-size: 12px;
  color: #606266;
}

.spec-label {
  font-weight: 500;
}

.spec-value {
  color: #303133;
}

.product-pricing {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.product-pricing span {
  font-weight: 500;
}



/* Responsive Design */
@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .aftersale-order-detail-page {
    padding: 16px;
  }

  .detail-header {
    padding: 16px;
  }

  .product-item {
    flex-direction: column;
    text-align: center;
  }

  .product-image {
    align-self: center;
  }

  .product-specs {
    justify-content: center;
  }

  .product-pricing {
    justify-content: center;
  }
}
</style>
