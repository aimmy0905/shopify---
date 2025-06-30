<template>
  <div class="recharge-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack" class="back-button">
          返回列表
        </el-button>
        <div class="header-info">
          <h1 class="page-title">充值详情</h1>
          <p class="page-description">查看充值申请的详细信息</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="getStatusType(rechargeRecord?.status)" size="large">
          {{ getStatusText(rechargeRecord?.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 充值信息卡片 -->
    <el-row :gutter="20" v-if="rechargeRecord">
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="充值ID">{{ rechargeRecord.id }}</el-descriptions-item>
            <el-descriptions-item label="客户名称">{{ rechargeRecord.customer_name }}</el-descriptions-item>
            <el-descriptions-item label="充值币种">{{ rechargeRecord.currency }}</el-descriptions-item>
            <el-descriptions-item label="充值金额">{{ rechargeRecord.currency }} {{ formatAmount(rechargeRecord.amount) }}</el-descriptions-item>
            <el-descriptions-item label="USD等值">${{ formatAmount(rechargeRecord.usd_amount) }}</el-descriptions-item>
            <el-descriptions-item label="汇率">{{ rechargeRecord.exchange_rate }}</el-descriptions-item>
            <el-descriptions-item label="充值方式">{{ getPaymentMethodText(rechargeRecord.payment_method) }}</el-descriptions-item>
            <el-descriptions-item label="收款账户">{{ rechargeRecord.payment_account }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ rechargeRecord.apply_time }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ rechargeRecord.review_time || '待审核' }}</el-descriptions-item>
            <el-descriptions-item label="审核人员">{{ rechargeRecord.reviewer || '待审核' }}</el-descriptions-item>
            <el-descriptions-item label="审核备注" :span="2">{{ rechargeRecord.review_remark || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="voucher-card">
          <template #header>
            <div class="card-header">
              <span>支付凭证</span>
            </div>
          </template>
          <div class="voucher-content">
            <div v-if="rechargeRecord.voucher_url" class="voucher-image">
              <el-image
                :src="rechargeRecord.voucher_url"
                fit="contain"
                style="width: 100%; height: 300px;"
                :preview-src-list="[rechargeRecord.voucher_url]"
              />
            </div>
            <div v-else class="no-voucher">
              <el-empty description="暂无支付凭证" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作记录 -->
    <el-card class="history-card" v-if="rechargeRecord">
      <template #header>
        <div class="card-header">
          <span>操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          timestamp="2023-12-15 14:30:00"
          placement="top"
          type="primary"
        >
          <el-card>
            <h4>充值申请提交</h4>
            <p>客户提交充值申请，金额：{{ rechargeRecord.currency }} {{ formatAmount(rechargeRecord.amount) }}</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item
          v-if="rechargeRecord.status !== 'pending'"
          :timestamp="rechargeRecord.review_time"
          placement="top"
          :type="rechargeRecord.status === 'approved' ? 'success' : 'danger'"
        >
          <el-card>
            <h4>{{ rechargeRecord.status === 'approved' ? '审核通过' : '审核拒绝' }}</h4>
            <p>审核人员：{{ rechargeRecord.reviewer }}</p>
            <p v-if="rechargeRecord.review_remark">备注：{{ rechargeRecord.review_remark }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { rechargeApplications } from '@/data/mockData.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const rechargeRecord = ref(null)

// 方法
const formatAmount = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const getPaymentMethodText = (method) => {
  const methodMap = {
    alipay: '支付宝',
    wechat_pay: '微信支付',
    bank_transfer: '银行转账',
    paypal: 'PayPal',
    credit_card: '信用卡'
  }
  return methodMap[method] || method
}

const goBack = () => {
  router.push('/admin/recharge-audit')
}

// 生命周期
onMounted(() => {
  const recordId = route.params.id
  rechargeRecord.value = rechargeApplications.find(record => record.id === recordId)
  
  if (!rechargeRecord.value) {
    ElMessage.error('充值记录不存在')
    router.push('/admin/recharge-audit')
  }
})
</script>

<style scoped>
.recharge-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info .page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-info .page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 卡片样式 */
.info-card,
.voucher-card,
.history-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.voucher-content {
  text-align: center;
}

.voucher-image {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.no-voucher {
  padding: 20px;
}

:deep(.el-timeline-item__content) {
  h4 {
    margin: 0 0 8px 0;
    color: #303133;
  }
  
  p {
    margin: 4px 0;
    color: #606266;
    font-size: 14px;
  }
}
</style> 