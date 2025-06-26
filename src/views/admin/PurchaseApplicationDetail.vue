<template>
  <div class="purchase-application-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/purchase-applications' }">采购申请管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ application.id }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 申请状态标签 -->
    <div class="status-header">
      <el-tag :type="getStatusType(application.status)" size="large">
        {{ getStatusText(application.status) }}
      </el-tag>
    </div>

    <!-- 基本信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>基本信息</h3>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请编号">{{ application.id }}</el-descriptions-item>
        <el-descriptions-item label="申请商家">{{ application.merchant_name }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ application.created_at }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="getStatusType(application.status)" size="small">
            {{ getStatusText(application.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理时间" v-if="application.processed_at">
          {{ application.processed_at }}
        </el-descriptions-item>
        <el-descriptions-item label="处理人员" v-if="application.processor">
          {{ application.processor }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 商品信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>商品信息</h3>
        </div>
      </template>
      
      <div class="product-info-section">
        <div class="product-image-container">
          <img :src="application.product_image" alt="商品图片" class="product-image-large" />
        </div>
        <div class="product-details-container">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="商品名称">{{ application.product_name }}</el-descriptions-item>
            <el-descriptions-item label="商品链接" v-if="application.product_url">
              <el-link :href="application.product_url" target="_blank" type="primary">
                {{ application.product_url }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="采购类型">
              <el-tag :type="application.type === 'existing' ? 'success' : 'warning'" size="small">
                {{ application.type === 'existing' ? '系统商品' : '另外采购' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

    <!-- 采购需求卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>采购需求</h3>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="目标售价">${{ application.target_price }}</el-descriptions-item>
        <el-descriptions-item label="目标国家/地区">{{ application.target_country }}</el-descriptions-item>
        <el-descriptions-item label="预估每日订单量">{{ application.daily_orders }}</el-descriptions-item>
        <el-descriptions-item label="是否接受同品类商品">
          {{ application.accept_similar ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="商品描述" span="2">
          <div class="description-text">{{ application.description || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="备注信息" span="2">
          <div class="description-text">{{ application.remark || '无' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 报价信息卡片 -->
    <el-card 
      class="info-card" 
      v-if="['quotation_pending', 'quotation_processing', 'quotation_success', 'quotation_failed'].includes(application.status)"
    >
      <template #header>
        <div class="card-header">
          <h3>报价信息</h3>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报价状态">
          <el-tag :type="getStatusType(application.status)" size="small">
            {{ getStatusText(application.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报价人员" v-if="application.quoter">
          {{ application.quoter }}
        </el-descriptions-item>
        <el-descriptions-item label="报价时间" v-if="application.quoted_at">
          {{ application.quoted_at }}
        </el-descriptions-item>
        <el-descriptions-item label="拒绝原因" v-if="application.reject_reason" span="2">
          <div class="description-text">{{ application.reject_reason }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 报价单下载 -->
      <div class="quote-document" v-if="application.quote_document">
        <el-divider content-position="left">报价单文档</el-divider>
        <el-button type="primary" @click="viewQuoteDocument">
          <el-icon><View /></el-icon>
          查看报价单
        </el-button>
        <el-button @click="downloadQuoteDocument">
          <el-icon><Download /></el-icon>
          下载报价单
        </el-button>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        v-if="application.status === 'pending'" 
        type="primary"
        @click="auditApplication"
      >
        <el-icon><EditPen /></el-icon>
        审核申请
      </el-button>
      
      <el-button 
        v-if="application.status === 'quotation_pending'" 
        type="warning"
        @click="uploadQuote"
      >
        <el-icon><Upload /></el-icon>
        上传报价单
      </el-button>
      
      <el-button 
        v-if="application.status === 'quotation_processing'" 
        type="success"
        @click="completeQuote"
      >
        <el-icon><Check /></el-icon>
        完成报价
      </el-button>
      
      <el-button 
        v-if="application.status === 'quotation_success'" 
        type="primary"
        @click="createPurchaseOrder"
      >
        <el-icon><Plus /></el-icon>
        创建采购订单
      </el-button>
      
      <el-button 
        type="danger"
        @click="deleteApplication"
        v-if="application.status === 'pending'"
      >
        <el-icon><Delete /></el-icon>
        删除申请
      </el-button>
      
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="采购申请审核"
      width="600px"
    >
      <div class="audit-dialog">
        <div class="application-summary">
          <h4>申请基本信息概要</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="申请商家">{{ application.merchant_name }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ application.product_name }}</el-descriptions-item>
            <el-descriptions-item label="目标售价">${{ application.target_price }}</el-descriptions-item>
            <el-descriptions-item label="预估日单量">{{ application.daily_orders }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="audit-form">
          <el-form :model="auditForm" label-width="100px">
            <el-form-item label="审核结果" required>
              <el-radio-group v-model="auditForm.result">
                <el-radio label="approve">同意</el-radio>
                <el-radio label="reject">拒绝</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item 
              label="审核备注" 
              :required="auditForm.result === 'reject'"
            >
              <el-input
                v-model="auditForm.remark"
                type="textarea"
                :rows="3"
                :placeholder="auditForm.result === 'reject' ? '请输入拒绝原因' : '审核备注（可选）'"
              />
            </el-form-item>
            
            <el-form-item
              v-if="auditForm.result === 'approve'"
              label="指派报价人员"
              required
            >
              <el-select v-model="auditForm.quoter" placeholder="请选择报价人员" style="width: 100%">
                <el-option
                  v-for="quoter in quoterList"
                  :key="quoter.id"
                  :label="`${quoter.name} (${quoter.department})`"
                  :value="quoter.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAudit">确认审核</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 报价上传弹窗 -->
    <el-dialog
      v-model="quoteDialogVisible"
      title="上传报价单"
      width="600px"
    >
      <div class="quote-dialog">
        <div class="quote-form">
          <el-form :model="quoteForm" label-width="100px">
            <el-form-item label="报价单上传" required>
              <el-upload
                class="upload-demo"
                drag
                action="#"
                :on-change="handleQuoteUpload"
                :before-upload="beforeQuoteUpload"
                :file-list="quoteForm.fileList"
                accept=".pdf"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将PDF文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传PDF文件，且不超过5MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="报价备注">
              <el-input
                v-model="quoteForm.remark"
                type="textarea"
                :rows="3"
                placeholder="报价说明或备注信息"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quoteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmQuoteUpload">确认上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 报价完成弹窗 -->
    <el-dialog
      v-model="completeQuoteDialogVisible"
      title="完成报价"
      width="600px"
    >
      <div class="complete-quote-dialog">
        <div class="complete-form">
          <el-form :model="completeForm" label-width="100px">
            <el-form-item label="报价结果" required>
              <el-radio-group v-model="completeForm.result">
                <el-radio label="success">成功</el-radio>
                <el-radio label="failed">失败</el-radio>
              </el-radio-group>
            </el-form-item>
            

            
            <el-form-item 
              v-if="completeForm.result === 'failed'" 
              label="失败原因"
              required
            >
              <el-input
                v-model="completeForm.failReason"
                type="textarea"
                :rows="3"
                placeholder="请输入报价失败的原因"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="completeQuoteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCompleteQuote">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 报价单查看弹窗 -->
    <el-dialog
      v-model="quoteViewDialogVisible"
      title="报价单查看"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="quote-view-dialog">
        <div class="pdf-viewer">
          <iframe
            v-if="application.quote_document"
            :src="`/${application.quote_document}`"
            frameborder="0"
            class="pdf-iframe"
          ></iframe>
          <div v-else class="pdf-placeholder">
            <el-icon size="64"><Document /></el-icon>
            <p>暂无报价单文档</p>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="downloadQuoteDocument">
            <el-icon><Download /></el-icon>
            下载报价单
          </el-button>
          <el-button type="primary" @click="quoteViewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  View,
  Download,
  EditPen,
  Upload,
  Check,
  Plus,
  Delete,
  ArrowLeft,
  UploadFilled,
  Document
} from '@element-plus/icons-vue'
import { purchaseApplications, quoters } from '@/data/mockData.js'

const route = useRoute()
const router = useRouter()

// 弹窗控制
const auditDialogVisible = ref(false)
const quoteDialogVisible = ref(false)
const completeQuoteDialogVisible = ref(false)
const quoteViewDialogVisible = ref(false)

// 表单数据
const auditForm = reactive({
  result: 'approve',
  remark: '',
  quoter: ''
})

const quoteForm = reactive({
  fileList: [],
  remark: ''
})

const completeForm = reactive({
  result: 'success',
  failReason: ''
})

// 获取申请数据
const application = ref(null)

// 根据路由参数获取申请详情
const loadApplicationDetail = () => {
  const applicationId = route.params.id
  const foundApplication = purchaseApplications.find(app => app.id === applicationId)

  if (foundApplication) {
    application.value = { ...foundApplication }
  } else {
    ElMessage.error('采购申请不存在')
    router.push('/admin/purchase-applications')
  }
}

// 报价人员数据
const quoterList = ref([...quoters])

// 状态类型映射
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

// 状态文本映射
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
const auditApplication = () => {
  auditForm.result = 'approve'
  auditForm.remark = ''
  auditForm.quoter = ''
  auditDialogVisible.value = true
}

const confirmAudit = () => {
  if (auditForm.result === 'reject' && !auditForm.remark.trim()) {
    ElMessage.error('请输入拒绝原因')
    return
  }
  
  if (auditForm.result === 'approve' && !auditForm.quoter) {
    ElMessage.error('请选择报价人员')
    return
  }
  
  // 更新申请状态
  if (auditForm.result === 'approve') {
    application.value.status = 'quotation_pending'
    application.value.quoter = auditForm.quoter
    application.value.processed_at = new Date().toLocaleString()
    application.value.processor = '当前管理员'
    ElMessage.success('审核通过，已进入待报价状态')
  } else {
    application.value.status = 'quotation_failed'
    application.value.reject_reason = auditForm.remark
    application.value.processed_at = new Date().toLocaleString()
    application.value.processor = '当前管理员'
    ElMessage.success('已拒绝申请')
  }
  
  auditDialogVisible.value = false
}

const uploadQuote = () => {
  quoteForm.fileList = []
  quoteForm.remark = ''
  quoteDialogVisible.value = true
}

const handleQuoteUpload = (file) => {
  quoteForm.fileList = [file]
}

const beforeQuoteUpload = (file) => {
  const isPDF = file.type === 'application/pdf'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isPDF) {
    ElMessage.error('只能上传PDF格式的文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过5MB!')
    return false
  }
  return false // 阻止自动上传
}

const confirmQuoteUpload = () => {
  if (quoteForm.fileList.length === 0) {
    ElMessage.error('请上传报价单文件')
    return
  }
  
  // 更新申请状态
  application.value.status = 'quotation_processing'
  application.value.quote_document = quoteForm.fileList[0].name
  application.value.quoted_at = new Date().toLocaleString()
  ElMessage.success('报价单已上传，进入报价中状态')
  
  quoteDialogVisible.value = false
}

const completeQuote = () => {
  completeForm.result = 'success'
  completeForm.failReason = ''
  completeQuoteDialogVisible.value = true
}

const confirmCompleteQuote = () => {
  if (completeForm.result === 'failed' && !completeForm.failReason.trim()) {
    ElMessage.error('请输入失败原因')
    return
  }

  // 更新申请状态
  if (completeForm.result === 'success') {
    application.value.status = 'quotation_success'
    ElMessage.success('报价完成，可以创建采购订单')
  } else {
    application.value.status = 'quotation_failed'
    application.value.reject_reason = completeForm.failReason
    ElMessage.success('已标记为报价失败')
  }

  completeQuoteDialogVisible.value = false
}

const createPurchaseOrder = () => {
  ElMessage.success('跳转到创建采购订单页面')
  // 这里应该跳转到订单创建页面
}

const viewQuoteDocument = () => {
  quoteViewDialogVisible.value = true
}

const downloadQuoteDocument = () => {
  if (!application.value.quote_document) {
    ElMessage.warning('暂无报价单可下载')
    return
  }

  // 模拟下载
  const link = document.createElement('a')
  link.href = `/${application.value.quote_document}`
  link.download = `报价单_${application.value.id}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('下载报价单：' + application.value.quote_document)
}

const deleteApplication = () => {
  ElMessageBox.confirm(
    `确定要删除采购申请 ${application.value.id} 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    goBack()
  }).catch(() => {
    // 用户取消删除
  })
}

const goBack = () => {
  router.push('/admin/purchase-applications')
}

// 生命周期
onMounted(() => {
  loadApplicationDetail()
})
</script>

<style scoped>
.purchase-application-detail {
  padding: 20px;
}

.status-header {
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

.card-header h3 {
  margin: 0;
  color: #303133;
}

.product-info-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.product-image-container {
  flex-shrink: 0;
}

.product-image-large {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.product-details-container {
  flex: 1;
}

.description-text {
  line-height: 1.6;
  color: #606266;
}

.quote-document {
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.audit-dialog,
.quote-dialog,
.complete-quote-dialog {
  padding: 10px 0;
}

.application-summary {
  margin-bottom: 20px;
}

.application-summary h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.audit-form,
.quote-form,
.complete-form {
  margin-top: 20px;
}

.quote-view-dialog {
  height: 600px;
}

.pdf-viewer {
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

.pdf-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #909399;
}

.pdf-placeholder p {
  margin: 10px 0;
}
</style> 