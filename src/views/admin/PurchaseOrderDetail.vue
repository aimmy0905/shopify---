<template>
  <div class="order-detail-container" v-if="order">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <div class="title-section">
          <h2>采购订单详情</h2>
          <p>订单号：{{ order.id }}</p>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="getStatusType(order.status)" size="large">
          {{ getStatusText(order.status) }}
        </el-tag>
      </div>
    </div>

    <!-- 订单基本信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>订单信息</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <label>订单号：</label>
            <span>{{ order.id }}</span>
          </div>
          <div class="info-item">
            <label>客户名称：</label>
            <span>{{ order.customer_name }}</span>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span>{{ order.created_at }}</span>
          </div>
          <div class="info-item">
            <label>付款时间：</label>
            <span>{{ order.paid_at || '未付款' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label>订单状态：</label>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>付款状态：</label>
            <el-tag :type="getPaymentStatusType(order.payment_status)">
              {{ getPaymentStatusText(order.payment_status) }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>订单金额：</label>
            <span class="amount">${{ order.total_amount.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <label>币种汇率：</label>
            <span>{{ order.currency }} ({{ order.exchange_rate }})</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 收货信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>收货信息</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <label>收货人：</label>
            <span>{{ order.receiver_name }}</span>
          </div>
          <div class="info-item">
            <label>联系电话：</label>
            <span>{{ order.receiver_phone }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label>收货地址：</label>
            <span>{{ order.receiver_address }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 物流信息 -->
    <el-card class="info-card" v-if="order.tracking_number">
      <template #header>
        <div class="card-header">
          <h3>物流信息</h3>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <label>物流公司：</label>
            <span>{{ order.shipping_company }}</span>
          </div>
          <div class="info-item">
            <label>运单号：</label>
            <span class="tracking-number">{{ order.tracking_number }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <label>发货时间：</label>
            <span>{{ order.shipped_at }}</span>
          </div>
          <div class="info-item">
            <label>预计到达：</label>
            <span>{{ order.estimated_delivery || '未设置' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 商品清单 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>商品清单</h3>
        </div>
      </template>
      <el-table :data="order.items" style="width: 100%">
        <el-table-column label="商品信息" width="400">
          <template #default="scope">
            <div class="product-info">
              <img :src="scope.row.product_image" class="product-image" />
              <div class="product-details">
                <div class="product-name">{{ scope.row.product_name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column label="单价" width="120">
          <template #default="scope">
            <span>${{ scope.row.unit_price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="scope">
            <span class="amount">${{ scope.row.total_price.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 金额汇总 -->
      <div class="amount-summary">
        <div class="summary-row">
          <span>商品小计：</span>
          <span>${{ order.subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>运费：</span>
          <span>${{ order.shipping_fee.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>订单总计：</span>
          <span class="amount">${{ order.total_amount.toFixed(2) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 备注信息 -->
    <el-card class="info-card" v-if="order.remark">
      <template #header>
        <div class="card-header">
          <h3>备注信息</h3>
        </div>
      </template>
      <div class="remark-content">
        {{ order.remark }}
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button 
        v-if="order.status === 'pending_payment'"
        type="success" 
        size="large"
        @click="markAsPaid"
      >
        标记已付款
      </el-button>
      <el-button 
        v-if="order.status === 'paid'"
        type="warning" 
        size="large"
        @click="showShippingDialog"
      >
        发货
      </el-button>
      <el-button 
        v-if="order.status === 'shipped'"
        type="primary" 
        size="large"
        @click="markAsCompleted"
      >
        标记已完成
      </el-button>
      <el-button 
        v-if="order.status !== 'completed' && order.status !== 'cancelled'"
        type="danger" 
        size="large"
        @click="cancelOrder"
      >
        取消订单
      </el-button>
    </div>

    <!-- 发货弹窗 -->
    <el-dialog
      v-model="shippingDialogVisible"
      title="订单发货 - 扫码发货"
      width="700px"
    >
      <div class="shipping-tabs">
        <el-tabs v-model="shippingMode" @tab-change="handleShippingModeChange">
          <el-tab-pane label="扫码发货" name="scan">
            <div class="scan-shipping-content">
              <div class="scan-instructions">
                <el-alert
                  title="扫码发货说明"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>1. 使用扫码枪扫描订单二维码自动填充订单信息</p>
                    <p>2. 扫描物流单号条码自动填充运单号</p>
                    <p>3. 确认信息无误后点击发货</p>
                  </template>
                </el-alert>
              </div>

              <div class="scan-area">
                <el-form :model="shippingForm" label-width="120px">
                  <el-form-item label="扫码输入区域">
                    <el-input
                      ref="scanInput"
                      v-model="scanBuffer"
                      placeholder="请使用扫码枪扫描二维码或条码"
                      @input="handleScanInput"
                      @keyup.enter="processScanData"
                      style="width: 100%"
                      size="large"
                    >
                      <template #prefix>
                        <el-icon><View /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="扫描状态">
                    <el-tag :type="scanStatus.type" size="large">
                      {{ scanStatus.text }}
                    </el-tag>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="手动输入" name="manual">
            <div class="manual-shipping-content">
              <el-form :model="shippingForm" label-width="120px">
                <el-form-item label="物流公司" required>
                  <el-select v-model="shippingForm.shipping_company" placeholder="请选择物流公司" style="width: 100%">
                    <el-option label="DHL Express" value="DHL Express" />
                    <el-option label="FedEx" value="FedEx" />
                    <el-option label="UPS" value="UPS" />
                    <el-option label="EMS" value="EMS" />
                    <el-option label="顺丰速运" value="顺丰速运" />
                  </el-select>
                </el-form-item>
                <el-form-item label="运单号" required>
                  <el-input v-model="shippingForm.tracking_number" placeholder="请输入运单号" />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="shipping-form-common">
        <el-form :model="shippingForm" label-width="120px">
          <el-form-item label="预计到达">
            <el-date-picker
              v-model="shippingForm.estimated_delivery"
              type="date"
              placeholder="选择预计到达日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="发货备注">
            <el-input
              v-model="shippingForm.remark"
              type="textarea"
              :rows="3"
              placeholder="发货相关备注"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="shippingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShipping">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, View } from '@element-plus/icons-vue'
import { purchaseOrders } from '@/data/mockData.js'

const route = useRoute()
const router = useRouter()

// 响应式数据
const order = ref(null)
const shippingDialogVisible = ref(false)
const shippingMode = ref('scan')
const scanBuffer = ref('')
const scanInput = ref(null)
const scanStatus = ref({
  type: 'info',
  text: '等待扫码'
})

const shippingForm = reactive({
  shipping_company: '',
  tracking_number: '',
  estimated_delivery: null,
  remark: ''
})

// 获取订单详情
const loadOrderDetail = () => {
  const orderId = route.params.id
  const foundOrder = purchaseOrders.find(o => o.id === orderId)
  
  if (foundOrder) {
    order.value = { ...foundOrder }
  } else {
    ElMessage.error('采购订单不存在')
    router.push('/admin/purchase-orders')
  }
}

// 状态映射函数
const getStatusType = (status) => {
  const statusTypes = {
    'pending_payment': 'warning',
    'paid': 'success',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return statusTypes[status] || 'info'
}

const getStatusText = (status) => {
  const statusTexts = {
    'pending_payment': '待付款',
    'paid': '已付款',
    'shipped': '已发货',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusTexts[status] || '未知状态'
}

const getPaymentStatusType = (status) => {
  const statusTypes = {
    'pending': 'warning',
    'paid': 'success',
    'refunded': 'danger'
  }
  return statusTypes[status] || 'info'
}

const getPaymentStatusText = (status) => {
  const statusTexts = {
    'pending': '待付款',
    'paid': '已付款',
    'refunded': '已退款'
  }
  return statusTexts[status] || '未知状态'
}

// 方法
const goBack = () => {
  router.push('/admin/purchase-orders')
}

const markAsPaid = () => {
  ElMessageBox.confirm('确认标记此订单为已付款？', '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.value.status = 'paid'
    order.value.payment_status = 'paid'
    order.value.paid_at = new Date().toLocaleString()
    ElMessage.success('订单已标记为已付款')
  })
}

const showShippingDialog = () => {
  shippingDialogVisible.value = true
  // 重置扫码状态
  shippingMode.value = 'scan'
  scanBuffer.value = ''
  scanStatus.value = {
    type: 'info',
    text: '等待扫码'
  }
  // 聚焦到扫码输入框
  nextTick(() => {
    if (scanInput.value) {
      scanInput.value.focus()
    }
  })
}

const confirmShipping = () => {
  if (!shippingForm.shipping_company || !shippingForm.tracking_number) {
    ElMessage.error('请填写完整的发货信息')
    return
  }

  order.value.status = 'shipped'
  order.value.shipping_status = 'shipped'
  order.value.shipping_company = shippingForm.shipping_company
  order.value.tracking_number = shippingForm.tracking_number
  order.value.shipped_at = new Date().toLocaleString()
  
  if (shippingForm.estimated_delivery) {
    order.value.estimated_delivery = shippingForm.estimated_delivery.toISOString().split('T')[0]
  }

  shippingDialogVisible.value = false
  Object.assign(shippingForm, {
    shipping_company: '',
    tracking_number: '',
    estimated_delivery: null,
    remark: ''
  })
  
  ElMessage.success('发货信息已更新')
}

const markAsCompleted = () => {
  ElMessageBox.confirm('确认标记此订单为已完成？', '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.value.status = 'completed'
    ElMessage.success('订单已标记为已完成')
  })
}

const cancelOrder = () => {
  ElMessageBox.confirm('确认取消此订单？此操作不可撤销。', '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.value.status = 'cancelled'
    ElMessage.success('订单已取消')
  })
}

// 扫码相关方法
const handleShippingModeChange = (mode) => {
  if (mode === 'scan') {
    nextTick(() => {
      if (scanInput.value) {
        scanInput.value.focus()
      }
    })
  }
}

const handleScanInput = (value) => {
  // 扫码枪通常会快速输入完整数据，这里可以添加防抖处理
  if (value.length > 10) {
    // 自动处理扫码数据
    setTimeout(() => {
      processScanData()
    }, 100)
  }
}

const processScanData = () => {
  const scanData = scanBuffer.value.trim()
  if (!scanData) {
    return
  }

  try {
    // 尝试解析为JSON（订单二维码）
    const orderData = JSON.parse(scanData)
    if (orderData.orderId && orderData.orderId === order.value.id) {
      scanStatus.value = {
        type: 'success',
        text: '订单二维码扫描成功'
      }
      ElMessage.success('订单信息验证成功')
    } else {
      scanStatus.value = {
        type: 'warning',
        text: '订单信息不匹配'
      }
      ElMessage.warning('扫描的订单信息与当前订单不匹配')
    }
  } catch (error) {
    // 不是JSON格式，可能是物流单号条码
    if (scanData.length >= 8 && scanData.length <= 30) {
      shippingForm.tracking_number = scanData
      scanStatus.value = {
        type: 'success',
        text: '物流单号扫描成功'
      }
      ElMessage.success('物流单号已自动填充')
    } else {
      scanStatus.value = {
        type: 'danger',
        text: '无法识别的扫码数据'
      }
      ElMessage.error('无法识别扫码数据，请检查二维码或条码')
    }
  }

  // 清空扫码缓冲区
  scanBuffer.value = ''
}

// 生命周期
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-section h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.title-section p {
  margin: 0;
  color: #909399;
  font-size: 14px;
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

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.info-item label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-item span {
  color: #303133;
}

.amount {
  font-weight: 600;
  color: #E6A23C;
}

.tracking-number {
  font-family: monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.amount-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-row.total {
  font-weight: 600;
  font-size: 16px;
  border-top: 1px solid #dcdfe6;
  padding-top: 8px;
  margin-top: 8px;
}

.remark-content {
  line-height: 1.6;
  color: #606266;
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.shipping-tabs {
  margin-bottom: 20px;
}

.scan-shipping-content {
  padding: 10px 0;
}

.scan-instructions {
  margin-bottom: 20px;
}

.scan-instructions p {
  margin: 5px 0;
  font-size: 14px;
}

.scan-area {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 2px dashed #dcdfe6;
}

.manual-shipping-content {
  padding: 10px 0;
}

.shipping-form-common {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
