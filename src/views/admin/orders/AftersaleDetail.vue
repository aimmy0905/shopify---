<template>
  <div class="aftersale-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb-nav">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ name: 'AdminDashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ name: 'AdminAftersaleOrders' }">售后订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单详情</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <h1 class="page-title">
          <i class="el-icon-document"></i>
          售后订单详情 - {{ orderDetail.aftersale_order_no }}
        </h1>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- 订单状态卡片 -->
    <el-card class="status-card">
      <div class="status-info">
        <div class="status-item">
          <span class="label">售后状态</span>
          <el-tag :type="getStatusType(orderDetail.status)" size="large">
            {{ getStatusText(orderDetail.status) }}
          </el-tag>
        </div>
        <div class="status-item">
          <span class="label">售后类型</span>
          <el-tag :type="getTypeTagType(orderDetail.type)" size="large">
            {{ getTypeText(orderDetail.type) }}
          </el-tag>
        </div>
        <div class="status-item">
          <span class="label">申请时间</span>
          <span class="value">{{ formatDate(orderDetail.created_at) }}</span>
        </div>
        <div class="status-item" v-if="orderDetail.processed_at">
          <span class="label">处理时间</span>
          <span class="value">{{ formatDate(orderDetail.processed_at) }}</span>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 左侧信息 -->
      <el-col :span="16">
        <!-- 基本信息 -->
        <el-card class="info-card" title="基本信息">
          <template #header>
            <span>基本信息</span>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">售后订单号</span>
              <span class="value">{{ orderDetail.aftersale_order_no }}</span>
            </div>
            <div class="info-item">
              <span class="label">原订单号</span>
              <el-link type="primary" @click="viewOriginalOrder">
                {{ orderDetail.original_order_no }}
              </el-link>
            </div>
            <div class="info-item">
              <span class="label">商家名称</span>
              <span class="value">{{ orderDetail.merchant_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">商家ID</span>
              <span class="value">{{ orderDetail.merchant_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户姓名</span>
              <span class="value">{{ orderDetail.customer_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户邮箱</span>
              <span class="value">{{ orderDetail.customer_email }}</span>
            </div>
            <div class="info-item">
              <span class="label">退款金额</span>
              <span class="value amount">${{ orderDetail.refund_amount.toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请原因</span>
              <span class="value">{{ orderDetail.reason }}</span>
            </div>
          </div>
        </el-card>

        <!-- 退货商品信息 -->
        <el-card class="products-card" title="退货商品">
          <template #header>
            <span>退货商品</span>
          </template>
          <div class="products-list">
            <div 
              v-for="(product, index) in orderDetail.products" 
              :key="index"
              class="product-item"
            >
              <el-image 
                :src="product.image" 
                class="product-image"
                fit="cover"
              />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-specs">
                  <span v-for="(value, key) in product.specifications" :key="key" class="spec">
                    {{ key }}: {{ value }}
                  </span>
                </div>
                <div class="product-pricing">
                  <span class="unit-price">${{ product.unit_price.toFixed(2) }}</span>
                  <span class="quantity">× {{ product.quantity }}</span>
                  <span class="total">${{ product.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 申请详情 -->
        <el-card class="details-card" title="申请详情">
          <template #header>
            <span>申请详情</span>
          </template>
          <div class="details-content">
            <div class="detail-item">
              <span class="label">申请说明</span>
              <p class="description">{{ orderDetail.description }}</p>
            </div>
            <div class="detail-item" v-if="orderDetail.images && orderDetail.images.length > 0">
              <span class="label">凭证图片</span>
              <div class="evidence-images">
                <el-image 
                  v-for="(img, index) in orderDetail.images" 
                  :key="index"
                  :src="img"
                  class="evidence-image"
                  :preview-src-list="orderDetail.images"
                  fit="cover"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧操作区 -->
      <el-col :span="8">
                 <!-- 订单状态 -->
         <el-card class="status-info-card" title="订单状态">
           <template #header>
             <span>订单状态</span>
           </template>
           <div class="status-content">
             <el-alert
               :title="`申请状态：${getStatusText(orderDetail.status)}`"
               :type="getStatusType(orderDetail.status)"
               :closable="false"
               show-icon
             />
             <div class="status-details">
               <p><strong>申请时间:</strong> {{ formatDate(orderDetail.created_at) }}</p>
               <p v-if="orderDetail.processed_at"><strong>处理时间:</strong> {{ formatDate(orderDetail.processed_at) }}</p>
               <p v-if="orderDetail.admin_remark"><strong>处理备注:</strong> {{ orderDetail.admin_remark }}</p>
             </div>
           </div>
         </el-card>

        <!-- 时间线 -->
        <el-card class="timeline-card" title="处理记录">
          <template #header>
            <span>处理记录</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in timelineData"
              :key="index"
              :timestamp="record.time"
              :type="record.type"
            >
              <div class="timeline-content">
                <div class="timeline-title">{{ record.title }}</div>
                <div class="timeline-desc">{{ record.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 移除了操作相关的图标导入

const route = useRoute()
const router = useRouter()

// 响应式数据
const orderDetail = ref({
  id: 1,
  aftersale_order_no: 'AS202401001',
  original_order_no: 'SO202312001',
  merchant_id: 1001,
  merchant_name: '优质商家A',
  customer_name: '张三',
  customer_email: 'zhang@example.com',
  type: 'refund_only',
  status: 'pending',
  refund_amount: 299.99,
  reason: '商品质量问题',
  description: '收到的商品存在明显的质量缺陷，包装破损，商品表面有划痕，无法正常使用。希望能够退款处理。',
  created_at: '2024-01-15 10:30:00',
  processed_at: null,
  admin_remark: '',
  images: [
    'https://picsum.photos/300/300?random=1',
    'https://picsum.photos/300/300?random=2'
  ],
  products: [
    {
      name: 'iPhone 15 Pro Max 透明保护壳',
      image: 'https://picsum.photos/100/100?random=10',
      specifications: {
        '颜色': '透明',
        '材质': 'TPU',
        '尺寸': '6.7英寸'
      },
      unit_price: 99.99,
      quantity: 3,
      total: 299.97
    }
  ]
})

// 移除了处理操作相关的响应式数据

// 计算属性
const timelineData = computed(() => {
  const timeline = [
    {
      time: orderDetail.value.created_at,
      type: 'primary',
      title: '提交申请',
      description: `客户${orderDetail.value.customer_name}提交了售后申请`
    }
  ]

  if (orderDetail.value.processed_at) {
    timeline.push({
      time: orderDetail.value.processed_at,
      type: orderDetail.value.status === 'completed' ? 'success' : 'danger',
      title: orderDetail.value.status === 'completed' ? '申请批准' : '申请拒绝',
      description: `管理员${orderDetail.value.status === 'completed' ? '批准' : '拒绝'}了此申请`
    })
  }

  return timeline.reverse()
})

// 状态映射函数
const getStatusType = (status) => {
  const statusTypes = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'rejected': 'danger'
  }
  return statusTypes[status] || 'info'
}

const getStatusText = (status) => {
  const statusTexts = {
    'pending': '申请中',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return statusTexts[status] || '未知状态'
}

const getTypeTagType = (type) => {
  const typeMap = {
    'refund_only': 'warning',
    'return_refund': 'primary',
    'exchange': 'success'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type) => {
  const typeTexts = {
    'refund_only': '仅退款',
    'return_refund': '退货退款',
    'exchange': '换货'
  }
  return typeTexts[type] || '未知类型'
}

// 方法
const goBack = () => {
  router.go(-1)
}

const viewOriginalOrder = () => {
  router.push(`/admin/orders/store/${orderDetail.value.original_order_no}`)
}

// 移除了处理操作相关的方法

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  // 根据路由参数加载订单详情
  const orderId = route.params.id
  // 这里可以根据ID加载具体的订单数据
  console.log('Loading order detail for ID:', orderId)
})
</script>

<style scoped>
.aftersale-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  flex: 1;
}

.breadcrumb-nav {
  margin-bottom: 10px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.status-card {
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  gap: 30px;
  align-items: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.status-item .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.info-card, .products-card, .details-card, .status-info-card, .timeline-card {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.info-item .value.amount {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.product-specs {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.spec {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.product-pricing {
  display: flex;
  gap: 12px;
  align-items: center;
}

.unit-price, .quantity, .total {
  font-size: 14px;
  font-weight: 500;
}

.total {
  color: #E6A23C;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.description {
  margin: 0;
  line-height: 1.6;
  color: #303133;
}

.evidence-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.evidence-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  cursor: pointer;
}

.status-content {
  padding: 10px 0;
}

.status-details {
  margin-top: 15px;
}

.status-details p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .status-info {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .product-item {
    flex-direction: column;
    text-align: center;
  }
}
</style> 