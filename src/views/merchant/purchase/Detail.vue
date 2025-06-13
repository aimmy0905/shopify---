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

const route = useRoute()
const router = useRouter()
const quoteDialogVisible = ref(false)

// 模拟申请数据
const applicationData = ref({
  id: 'PA202401150001',
  status: 'quoted',
  createdAt: '2024-01-15 10:30:00',
  processedAt: '2024-01-15 14:20:00',
  productName: '蓝牙耳机 Pro Max',
  productImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik02MCA4MEg4NVYxMjBINjBWODBaIiBmaWxsPSIjNDA5RUZGIi8+CjxwYXRoIGQ9Ik0xMTUgODBIMTQwVjEyMEgxMTVWODBaIiBmaWxsPSIjNDA5RUZGIi8+CjxwYXRoIGQ9Ik04NSA2MEgxMTVWMTQwSDg1VjYwWiIgZmlsbD0iIzQwOUVGRiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSIgZm9udC1zaXplPSIxNiI+6Iu754mZ6ICz5py6PC90ZXh0Pgo8L3N2Zz4K',
  productUrl: 'https://example.com/product/1',
  purchaseType: 'existing',
  targetPrice: 25.99,
  targetCountry: '美国',
  dailyOrderCount: 50,
  acceptSimilar: true,
  description: '这是一款高品质的蓝牙耳机，支持主动降噪，续航时间长达20小时。采用最新的蓝牙5.2技术，支持多点连接，音质清晰，佩戴舒适。',
  remarks: '需要快速处理，希望能在本周内完成报价。',
  quoteStatus: 'success',
  quoteTime: '2024-01-15 14:20:00',
  finalQuote: 23.50,
  rejectReason: '',
  quoteDocument: 'quote-doc-1.pdf'
})

// 计算属性
const showQuoteInfo = computed(() => {
  return ['quoting', 'quoted', 'failed'].includes(applicationData.value.status)
})

// 状态处理方法
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    quoting: 'primary',
    quoted: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    quoting: '报价中',
    quoted: '报价成功',
    failed: '报价失败'
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
    // 模拟API调用获取申请详情
    // const id = route.params.id
    // const response = await api.getPurchaseApplication(id)
    // applicationData.value = response.data
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