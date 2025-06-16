<template>
  <div class="admin-purchase">
    <!-- 页面标题和统计 -->
    <div class="page-header">
      <div class="header-left">
        <h1>采购申请管理</h1>
        <p class="page-description">管理和处理商家的采购申请，进行审核和报价</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.total }}</div>
              <div class="stats-label">总申请数</div>
            </div>
            <div class="stats-icon">
              <el-icon color="#409EFF"><Document /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.pending }}</div>
              <div class="stats-label">待处理</div>
            </div>
            <div class="stats-icon">
              <el-icon color="#E6A23C"><Clock /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.processing }}</div>
              <div class="stats-label">报价中</div>
            </div>
            <div class="stats-icon">
              <el-icon color="#909399"><Loading /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-number">{{ stats.completed }}</div>
              <div class="stats-label">已完成</div>
            </div>
            <div class="stats-icon">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>快捷操作</h3>
          </div>
        </template>
        <div class="actions-grid">
          <div class="action-item" @click="goToPurchaseList">
            <div class="action-icon">
              <el-icon size="24"><List /></el-icon>
            </div>
            <div class="action-content">
              <div class="action-title">采购申请列表</div>
              <div class="action-desc">查看和管理所有采购申请</div>
            </div>
            <div class="action-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="action-item" @click="batchAudit">
            <div class="action-icon">
              <el-icon size="24"><Select /></el-icon>
            </div>
            <div class="action-content">
              <div class="action-title">批量审核</div>
              <div class="action-desc">批量处理待审核的申请</div>
            </div>
            <div class="action-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="action-item" @click="exportReport">
            <div class="action-icon">
              <el-icon size="24"><Download /></el-icon>
            </div>
            <div class="action-content">
              <div class="action-title">导出报告</div>
              <div class="action-desc">生成采购管理报告</div>
            </div>
            <div class="action-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近申请 -->
    <div class="recent-applications">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>最近申请</h3>
            <el-button text type="primary" @click="goToPurchaseList">查看全部</el-button>
          </div>
        </template>
        <el-table :data="recentApplications" style="width: 100%">
          <el-table-column prop="id" label="申请编号" width="120" />
          <el-table-column prop="merchant_name" label="申请商家" width="120" />
          <el-table-column prop="product_name" label="商品名称" show-overflow-tooltip />
          <el-table-column prop="target_price" label="目标售价" width="100">
            <template #default="{ row }">
              ${{ row.target_price }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="申请时间" width="120" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="viewDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  Clock, 
  Loading, 
  CircleCheck, 
  List, 
  Select, 
  Download, 
  ArrowRight 
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = ref({
  total: 156,
  pending: 23,
  processing: 45,
  completed: 88
})

// 最近申请数据
const recentApplications = ref([
  {
    id: 'PA202312001',
    merchant_name: '商家A',
    product_name: '蓝牙耳机Pro',
    target_price: 29.99,
    status: 'pending',
    created_at: '2023-12-15'
  },
  {
    id: 'PA202312002',
    merchant_name: '商家B',
    product_name: '智能手表',
    target_price: 89.99,
    status: 'quotation_pending',
    created_at: '2023-12-14'
  },
  {
    id: 'PA202312003',
    merchant_name: '商家C',
    product_name: '无线充电器',
    target_price: 19.99,
    status: 'quotation_processing',
    created_at: '2023-12-13'
  },
  {
    id: 'PA202312004',
    merchant_name: '商家D',
    product_name: '运动相机',
    target_price: 199.99,
    status: 'quotation_success',
    created_at: '2023-12-12'
  }
])

// 状态映射
const getStatusType = (status) => {
  const statusTypes = {
    'pending': 'warning',
    'quotation_pending': 'info',
    'quotation_processing': 'primary',
    'quotation_success': 'success',
    'quotation_failed': 'danger'
  }
  return statusTypes[status] || 'info'
}

const getStatusText = (status) => {
  const statusTexts = {
    'pending': '待处理',
    'quotation_pending': '待报价',
    'quotation_processing': '报价中',
    'quotation_success': '报价成功',
    'quotation_failed': '报价失败'
  }
  return statusTexts[status] || '未知状态'
}

// 方法
const goToPurchaseList = () => {
  router.push('/admin/purchase-applications')
}

const batchAudit = () => {
  router.push('/admin/purchase-applications?action=batch')
}

const exportReport = () => {
  ElMessage.success('正在生成报告，请稍后...')
}

const viewDetail = (application) => {
  router.push(`/admin/purchase-applications/${application.id}`)
}

// 生命周期
onMounted(() => {
  // 可以在这里加载实时统计数据
})
</script>

<style scoped>
.admin-purchase {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-container {
  margin-bottom: 20px;
}

.stats-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-card :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

.stats-icon {
  font-size: 40px;
  opacity: 0.8;
}

.quick-actions,
.recent-applications {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  background-color: #F5F7FA;
  border-color: #C0C4CC;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #409EFF;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 14px;
  color: #909399;
}

.action-arrow {
  color: #C0C4CC;
}
</style> 