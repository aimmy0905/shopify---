<template>
  <div class="purchase-orders-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>采购订单管理</h2>
      <p>管理所有采购订单，跟踪订单状态和物流信息</p>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号、客户名称"
            style="width: 300px"
            :prefix-icon="Search"
            clearable
          />
          <el-select v-model="filterStatus" placeholder="全部状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending_payment" />
            <el-option label="已付款" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-select v-model="filterPaymentStatus" placeholder="付款状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-button type="primary" :icon="Plus" @click="showCreateOrderDialog">
            创建订单
          </el-button>
          <el-button :icon="Download" @click="exportOrders">
            导出订单
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table :data="filteredOrders" style="width: 100%" stripe>
        <el-table-column prop="id" label="订单号" width="140" />
        <el-table-column label="客户信息" width="200">
          <template #default="scope">
            <div>
              <div style="font-weight: 500;">{{ scope.row.customer_name }}</div>
              <div style="font-size: 12px; color: #909399;">
                {{ customers.find(c => c.id === scope.row.customer_id)?.email }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" width="300">
          <template #default="scope">
            <div class="product-info">
              <div v-for="item in scope.row.items" :key="item.id" class="product-item">
                <img :src="item.product_image" class="product-image-small" />
                <div class="product-details">
                  <div class="product-name">{{ item.product_name }}</div>
                  <div class="product-quantity">数量: {{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单金额" width="120">
          <template #default="scope">
            <div style="font-weight: 500; color: #E6A23C;">
              ${{ scope.row.total_amount.toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="付款状态" width="100">
          <template #default="scope">
            <el-tag :type="getPaymentStatusType(scope.row.payment_status)">
              {{ getPaymentStatusText(scope.row.payment_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物流状态" width="120">
          <template #default="scope">
            <div v-if="scope.row.tracking_number">
              <div style="font-size: 12px;">{{ scope.row.shipping_company }}</div>
              <div style="font-size: 12px; color: #409EFF;">{{ scope.row.tracking_number }}</div>
            </div>
            <span v-else style="color: #909399;">未发货</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="订单二维码" width="120">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="showQRCode(scope.row)"
            >
              查看二维码
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewOrderDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending_payment'"
              type="success" 
              size="small" 
              @click="markAsPaid(scope.row)"
            >
              标记已付款
            </el-button>
            <el-button 
              v-if="scope.row.status === 'paid'"
              type="warning" 
              size="small" 
              @click="showShippingDialog(scope.row)"
            >
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建订单弹窗 -->
    <el-dialog
      v-model="createOrderDialogVisible"
      title="创建采购订单"
      width="800px"
      :before-close="handleCreateOrderClose"
    >
      <el-form :model="orderForm" label-width="120px">
        <el-form-item label="选择客户" required>
          <el-select v-model="orderForm.customer_id" placeholder="请选择客户" style="width: 100%">
            <el-option 
              v-for="customer in customers" 
              :key="customer.id" 
              :label="`${customer.name} (${customer.email})`" 
              :value="customer.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收货人姓名" required>
          <el-input v-model="orderForm.receiver_name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="收货人电话" required>
          <el-input v-model="orderForm.receiver_phone" placeholder="请输入收货人电话" />
        </el-form-item>
        <el-form-item label="收货地址" required>
          <el-input 
            v-model="orderForm.receiver_address" 
            type="textarea" 
            :rows="3"
            placeholder="请输入详细收货地址" 
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="orderForm.remark" 
            type="textarea" 
            :rows="2"
            placeholder="订单备注信息" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createOrder">创建订单</el-button>
      </template>
    </el-dialog>

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

    <!-- 订单二维码弹窗 -->
    <el-dialog
      v-model="qrCodeDialogVisible"
      title="订单二维码"
      width="400px"
      align-center
    >
      <div v-if="currentOrder" class="qr-code-content">
        <div class="order-info">
          <h4>{{ currentOrder.id }}</h4>
          <p>客户：{{ currentOrder.customer_name }}</p>
          <p>金额：${{ currentOrder.total_amount.toFixed(2) }}</p>
        </div>
        <div class="qr-code-container">
          <img :src="qrCodeDataURL" alt="订单二维码" class="qr-code-image" />
        </div>
        <div class="qr-code-tips">
          <p>使用扫码枪扫描此二维码进行发货操作</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="qrCodeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadQRCode">下载二维码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Download, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { purchaseOrders, customers } from '@/data/mockData.js'
import QRCode from 'qrcode'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const filterStatus = ref('')
const filterPaymentStatus = ref('')
const orderList = ref([...purchaseOrders])
const customerList = ref([...customers])

// 弹窗控制
const createOrderDialogVisible = ref(false)
const shippingDialogVisible = ref(false)
const qrCodeDialogVisible = ref(false)
const shippingMode = ref('scan')
const scanBuffer = ref('')
const scanInput = ref(null)
const scanStatus = ref({
  type: 'info',
  text: '等待扫码'
})

// 表单数据
const orderForm = reactive({
  customer_id: null,
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  remark: ''
})

const shippingForm = reactive({
  shipping_company: '',
  tracking_number: '',
  estimated_delivery: null,
  remark: ''
})

const currentOrder = ref(null)
const qrCodeDataURL = ref('')

// 计算属性
const filteredOrders = computed(() => {
  return orderList.value.filter(order => {
    const matchKeyword = !searchKeyword.value || 
      order.id.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchStatus = !filterStatus.value || order.status === filterStatus.value
    const matchPaymentStatus = !filterPaymentStatus.value || order.payment_status === filterPaymentStatus.value
    
    return matchKeyword && matchStatus && matchPaymentStatus
  })
})

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
const showCreateOrderDialog = () => {
  createOrderDialogVisible.value = true
}

const handleCreateOrderClose = () => {
  Object.assign(orderForm, {
    customer_id: null,
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    remark: ''
  })
}

const createOrder = () => {
  if (!orderForm.customer_id || !orderForm.receiver_name || !orderForm.receiver_phone || !orderForm.receiver_address) {
    ElMessage.error('请填写完整的订单信息')
    return
  }

  const customer = customerList.value.find(c => c.id === orderForm.customer_id)
  const newOrder = {
    id: `PO${Date.now()}`,
    application_id: null,
    customer_id: orderForm.customer_id,
    customer_name: customer.name,
    status: 'pending_payment',
    payment_status: 'pending',
    shipping_status: 'pending',
    items: [],
    subtotal: 0,
    shipping_fee: 0,
    total_amount: 0,
    currency: 'USD',
    exchange_rate: 1.0,
    usd_amount: 0,
    receiver_name: orderForm.receiver_name,
    receiver_phone: orderForm.receiver_phone,
    receiver_address: orderForm.receiver_address,
    tracking_number: null,
    shipping_company: null,
    shipped_at: null,
    estimated_delivery: null,
    remark: orderForm.remark,
    created_at: new Date().toLocaleString(),
    paid_at: null
  }

  orderList.value.unshift(newOrder)
  createOrderDialogVisible.value = false
  ElMessage.success('订单创建成功')
}

const viewOrderDetail = (order) => {
  router.push(`/admin/purchase-orders/${order.id}`)
}

const markAsPaid = (order) => {
  ElMessageBox.confirm('确认标记此订单为已付款？', '确认操作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    order.status = 'paid'
    order.payment_status = 'paid'
    order.paid_at = new Date().toLocaleString()
    ElMessage.success('订单已标记为已付款')
  })
}

const showShippingDialog = (order) => {
  currentOrder.value = order
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

  currentOrder.value.status = 'shipped'
  currentOrder.value.shipping_status = 'shipped'
  currentOrder.value.shipping_company = shippingForm.shipping_company
  currentOrder.value.tracking_number = shippingForm.tracking_number
  currentOrder.value.shipped_at = new Date().toLocaleString()
  
  if (shippingForm.estimated_delivery) {
    currentOrder.value.estimated_delivery = shippingForm.estimated_delivery.toISOString().split('T')[0]
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

const exportOrders = () => {
  ElMessage.success('订单导出功能开发中...')
}

const showQRCode = async (order) => {
  try {
    currentOrder.value = order
    // 生成包含订单信息的二维码数据
    const qrData = JSON.stringify({
      orderId: order.id,
      customerName: order.customer_name,
      totalAmount: order.total_amount,
      status: order.status,
      timestamp: Date.now()
    })

    // 生成二维码
    qrCodeDataURL.value = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    qrCodeDialogVisible.value = true
  } catch (error) {
    ElMessage.error('生成二维码失败')
    console.error('QR Code generation error:', error)
  }
}

const downloadQRCode = () => {
  if (qrCodeDataURL.value && currentOrder.value) {
    const link = document.createElement('a')
    link.download = `order-qr-${currentOrder.value.id}.png`
    link.href = qrCodeDataURL.value
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('二维码已下载')
  }
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
    if (orderData.orderId && orderData.orderId === currentOrder.value.id) {
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
      shippingForm.shipping_company = shippingForm.shipping_company || 'DHL Express'
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
</script>

<style scoped>
.purchase-orders-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.filter-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image-small {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.product-quantity {
  font-size: 12px;
  color: #909399;
}

.qr-code-content {
  text-align: center;
}

.order-info {
  margin-bottom: 20px;
}

.order-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.order-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.qr-code-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.qr-code-image {
  max-width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}

.qr-code-tips {
  margin-top: 15px;
}

.qr-code-tips p {
  margin: 0;
  color: #909399;
  font-size: 12px;
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
