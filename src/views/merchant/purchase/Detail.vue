<template>
  <div class="detail-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/merchant/purchase/applications' }">采购申请列表</el-breadcrumb-item>
      <el-breadcrumb-item>采购申请详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 申请状态 -->
    <div class="status-badge">
      <el-tag :type="getStatusType(applicationData.status)" size="large">
        {{ getStatusText(applicationData.status) }}
      </el-tag>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">申请编号：</span>
          <span class="value">{{ applicationData.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">申请时间：</span>
          <span class="value">{{ formatDate(applicationData.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">处理时间：</span>
          <span class="value">{{ applicationData.processedAt ? formatDate(applicationData.processedAt) : '-' }}</span>
        </div>
      </div>
    </el-card>

    <!-- 商品信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>商品信息</span>
        </div>
      </template>
      <div class="product-info">
        <img 
          :src="applicationData.productImage" 
          :alt="applicationData.productName"
          class="product-image"
        />
        <div class="product-details">
          <h3 class="product-name">{{ applicationData.productName }}</h3>
          <el-link 
            :href="applicationData.productUrl" 
            target="_blank" 
            type="primary"
            class="product-url"
          >
            查看商品链接
          </el-link>
          <div class="purchase-type">
            采购类型：{{ applicationData.purchaseType === 'existing' ? '现有商品' : '另外采购' }}
          </div>
        </div>
      </div>
    </el-card>

    <!-- 采购需求卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>采购需求</span>
        </div>
      </template>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">目标售价：</span>
          <span class="value">${{ applicationData.targetPrice }}</span>
        </div>
        <div class="info-item">
          <span class="label">目标国家/地区：</span>
          <span class="value">{{ applicationData.targetCountry }}</span>
        </div>
        <div class="info-item">
          <span class="label">预估日单量：</span>
          <span class="value">{{ applicationData.dailyOrderCount }}</span>
        </div>
        <div class="info-item">
          <span class="label">接受同品类：</span>
          <span class="value">{{ applicationData.acceptSimilar ? '是' : '否' }}</span>
        </div>
        <div class="info-item full-width">
          <span class="label">商品描述：</span>
          <span class="value description">{{ applicationData.description }}</span>
        </div>
        <div class="info-item full-width">
          <span class="label">备注信息：</span>
          <span class="value description">{{ applicationData.remarks || '-' }}</span>
        </div>
      </div>
    </el-card>

    <!-- 报价信息卡片 -->
    <el-card v-if="showQuoteInfo" class="info-card">
      <template #header>
        <div class="card-header">
          <span>报价信息</span>
        </div>
      </template>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">报价状态：</span>
          <span class="value">
            <el-tag :type="getQuoteStatusType(applicationData.quoteStatus)">
              {{ getQuoteStatusText(applicationData.quoteStatus) }}
            </el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="label">报价时间：</span>
          <span class="value">{{ formatDate(applicationData.quoteTime) }}</span>
        </div>
        <div v-if="applicationData.finalQuote" class="info-item">
          <span class="label">最终报价：</span>
          <span class="value highlight">${{ applicationData.finalQuote }}</span>
        </div>
        <div v-if="applicationData.rejectReason" class="info-item full-width">
          <span class="label">拒绝原因：</span>
          <span class="value description error">{{ applicationData.rejectReason }}</span>
        </div>
        <div v-if="applicationData.quoteDocument" class="info-item full-width">
          <el-button type="primary" @click="viewQuote">
            查看报价单
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="goBack">返回列表</el-button>
      <el-button 
        v-if="applicationData.status === 'pending'"
        type="danger" 
        @click="deleteApplication"
      >
        删除申请
      </el-button>
    </div>

    <!-- 报价单查看弹窗 -->
    <QuoteViewDialog 
      v-model="quoteDialogVisible"
      :quote-data="applicationData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QuoteViewDialog from './components/QuoteViewDialog.vue'
import { purchaseApplications } from '@/data/mockData.js'

const route = useRoute()
const router = useRouter()
const quoteDialogVisible = ref(false)

// 申请数据
const applicationData = ref({
  id: '',
  status: '',
  createdAt: '',
  processedAt: '',
  productName: '',
  productImage: '',
  productUrl: '',
  purchaseType: '',
  targetPrice: 0,
  targetCountry: '',
  dailyOrderCount: 0,
  acceptSimilar: false,
  description: '',
  remarks: '',
  quoteStatus: '',
  quoteTime: '',
  finalQuote: null,
  rejectReason: '',
  quoteDocument: null
})

// 计算属性
const showQuoteInfo = computed(() => {
  return ['quotation_processing', 'quotation_success', 'quotation_failed'].includes(applicationData.value.status)
})

// 状态处理方法
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    quotation_pending: 'info',
    quotation_processing: 'primary',
    quotation_success: 'success',
    quotation_failed: 'danger',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    quotation_pending: '待报价',
    quotation_processing: '报价中',
    quotation_success: '报价成功',
    quotation_failed: '报价失败',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const getQuoteStatusType = (status) => {
  const statusMap = {
    success: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

const getQuoteStatusText = (status) => {
  const statusMap = {
    success: '报价成功',
    failed: '报价失败'
  }
  return statusMap[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 查看报价单
const viewQuote = () => {
  quoteDialogVisible.value = true
}

// 返回列表
const goBack = () => {
  router.push('/merchant/purchase/applications')
}

// 删除申请
const deleteApplication = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该采购申请吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 模拟删除API调用
    ElMessage.success('删除成功')
    router.push('/merchant/purchase/applications')
  } catch {
    // 用户取消删除
  }
}

// 初始化数据
onMounted(async () => {
  try {
    const id = route.params.id
    // 从mock数据中查找对应的申请
    const application = purchaseApplications.find(app => app.id === id)

    if (application) {
      // 转换数据格式以匹配组件期望的结构
      applicationData.value = {
        id: application.id,
        status: application.status,
        createdAt: application.created_at,
        processedAt: application.processed_at,
        productName: application.product_name,
        productImage: application.product_image,
        productUrl: application.product_url,
        purchaseType: application.type,
        targetPrice: application.target_price,
        targetCountry: application.target_country,
        dailyOrderCount: application.daily_orders,
        acceptSimilar: application.accept_similar,
        description: application.description,
        remarks: application.remark,
        quoteStatus: application.status === 'quotation_success' ? 'success' :
                    application.status === 'quotation_failed' ? 'failed' : '',
        quoteTime: application.quoted_at,
        finalQuote: application.final_quote,
        rejectReason: application.reject_reason,
        quoteDocument: application.quote_document
      }
    } else {
      ElMessage.error('未找到对应的采购申请')
      router.push('/merchant/purchase/applications')
    }
  } catch (error) {
    ElMessage.error('获取申请详情失败')
  }
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.status-badge {
  margin: 20px 0;
  text-align: center;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  color: #909399;
  min-width: 100px;
}

.value {
  color: #303133;
  flex: 1;
}

.value.description {
  white-space: pre-wrap;
  line-height: 1.5;
}

.value.error {
  color: #f56c6c;
}

.value.highlight {
  color: #67c23a;
  font-weight: 500;
  font-size: 18px;
}

.product-info {
  display: flex;
  gap: 20px;
}

.product-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e4e7ed;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.product-url {
  display: inline-block;
  margin-bottom: 12px;
}

.purchase-type {
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style> 