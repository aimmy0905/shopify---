<template>
  <div class="order-detail-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/merchant/orders/store' }">订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="orderInfo" class="order-content">
      <!-- 订单状态和时间轴 -->
      <div class="order-status-section">
        <el-card>
          <template #header>
            <div class="status-header">
              <h3>订单状态</h3>
              <el-tag :type="getStatusType(orderInfo.status)" size="large">
                {{ getStatusText(orderInfo.status) }}
              </el-tag>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in orderInfo.timeline"
              :key="index"
              :timestamp="formatDateTime(item.time)"
              :type="item.type"
              placement="top"
            >
              <div class="timeline-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <!-- 订单基本信息 -->
      <div class="order-basic-info">
        <el-card>
          <template #header>
            <h3>订单基本信息</h3>
          </template>
          
          <el-descriptions border :column="3">
            <el-descriptions-item label="订单号">
              {{ orderInfo.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ formatDateTime(orderInfo.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="下单客户">
              {{ orderInfo.customerName }}
            </el-descriptions-item>
            <el-descriptions-item label="客户邮箱">
              {{ orderInfo.customerEmail }}
            </el-descriptions-item>
            <el-descriptions-item label="订单来源店铺">
              {{ orderInfo.storeName }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(orderInfo.status)">
                {{ getStatusText(orderInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="getSettlementStatusType(orderInfo.settlementStatus)">
                {{ getSettlementStatusText(orderInfo.settlementStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结算时间">
              {{ orderInfo.settlementTime ? formatDateTime(orderInfo.settlementTime) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 商家结算信息 -->
      <div class="settlement-info">
        <el-card>
          <template #header>
            <h3>商家结算信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="结算金额">
              ${{ orderInfo.settlement.usdAmount.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="getSettlementStatusType(orderInfo.settlementStatus)">
                {{ getSettlementStatusText(orderInfo.settlementStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结算时间">
              {{ orderInfo.settlementTime ? formatDateTime(orderInfo.settlementTime) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 订单金额信息 -->
      <div class="order-amount-info">
        <el-card>
          <template #header>
            <h3>订单金额信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="商品金额">
              <span class="amount-text">${{ orderInfo.amounts.productAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="运费金额">
              <span class="amount-text">${{ orderInfo.amounts.shippingAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="折扣金额" v-if="orderInfo.amounts.discountAmount">
              <span class="discount-text">-${{ orderInfo.amounts.discountAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="订单总金额">
              <span class="total-amount">${{ orderInfo.amounts.totalAmount.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 商品信息 -->
      <div class="order-products-info">
        <el-card>
          <template #header>
            <h3>商品信息</h3>
          </template>
          
          <el-table :data="orderInfo.products" border>
            <el-table-column label="商品" width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image
                    :src="row.image"
                    fit="cover"
                    class="product-image"
                  />
                  <div class="product-details">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-specs" v-if="row.specs">
                      <span v-for="(spec, index) in row.specs" :key="index" class="spec-item">
                        {{ spec.name }}: {{ spec.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120">
              <template #default="{ row }">
                ${{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template #default="{ row }">
                {{ row.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                <span class="subtotal">${{ (row.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 收货地址信息 -->
      <div class="shipping-address-info">
        <el-card>
          <template #header>
            <h3>收货地址信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="收件人">
              {{ orderInfo.shippingAddress.name }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ orderInfo.shippingAddress.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址" :span="2">
              {{ orderInfo.shippingAddress.fullAddress }}
            </el-descriptions-item>
            <el-descriptions-item label="邮编">
              {{ orderInfo.shippingAddress.zipCode }}
            </el-descriptions-item>
            <el-descriptions-item label="国家/地区">
              {{ orderInfo.shippingAddress.country }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 物流信息 -->
      <div v-if="orderInfo.logistics" class="logistics-info">
        <el-card>
          <template #header>
            <div class="logistics-header">
              <h3>物流信息</h3>
              <el-button size="small" @click="refreshLogistics">
                <el-icon><Refresh /></el-icon>
                刷新轨迹
              </el-button>
            </div>
          </template>
          
          <div class="logistics-basic">
            <el-descriptions border :column="2">
              <el-descriptions-item label="物流单号">
                {{ orderInfo.logistics.trackingNumber }}
                <el-button size="small" type="primary" link @click="copyTrackingNumber">
                  复制
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="物流公司">
                {{ orderInfo.logistics.company }}
              </el-descriptions-item>
              <el-descriptions-item label="发货时间">
                {{ formatDateTime(orderInfo.logistics.shippedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="物流状态">
                <el-tag :type="getLogisticsStatusType(orderInfo.logistics.status)">
                  {{ orderInfo.logistics.status }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="logistics-timeline">
            <h4>物流轨迹</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in orderInfo.logistics.timeline"
                :key="index"
                :timestamp="formatDateTime(item.time)"
                placement="top"
              >
                <div class="logistics-timeline-content">
                  <div class="status">{{ item.status }}</div>
                  <div class="location">{{ item.location }}</div>
                  <div class="description">{{ item.description }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>

      <!-- 备注信息 -->
      <div v-if="orderInfo.remark" class="order-remark">
        <el-card>
          <template #header>
            <h3>备注信息</h3>
          </template>
          <p>{{ orderInfo.remark }}</p>
        </el-card>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button type="primary" @click="showInvoiceDialog">
          <el-icon><Document /></el-icon>
          申请开具Invoice
        </el-button>
      </div>
    </div>

    <!-- Invoice申请弹窗 -->
    <el-dialog
      v-model="invoiceDialogVisible"
      title="申请开具Invoice"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="invoiceForm" label-width="100px">
        <el-form-item label="开票金额">
          <el-input-number
            v-model="invoiceForm.amount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 8px">美元</span>
        </el-form-item>
        <el-form-item label="收件人姓名">
          <el-input v-model="invoiceForm.recipientName" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="invoiceForm.contactInfo" />
        </el-form-item>
        <el-form-item label="邮寄地址">
          <el-input
            v-model="invoiceForm.mailingAddress"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input
            v-model="invoiceForm.remark"
            type="textarea"
            :rows="2"
            placeholder="选填"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="invoiceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitInvoiceApplication">提交申请</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const orderInfo = ref(null)
const invoiceDialogVisible = ref(false)

// Invoice申请表单
const invoiceForm = reactive({
  amount: 0,
  recipientName: '',
  contactInfo: '',
  mailingAddress: '',
  remark: ''
})

// 生命周期
onMounted(() => {
  loadOrderDetail()
})

// 方法
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    
    // 模拟加载订单详情
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟订单数据
    orderInfo.value = {
      id: orderId,
      orderNo: 'ORD202312150001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      storeName: '店铺A',
      status: 'shipped',
      settlementStatus: 'settled',
      createdAt: '2023-12-15 10:30:00',
      settlementTime: '2023-12-15 11:00:00',
      timeline: [
        {
          time: '2023-12-15 10:30:00',
          title: '订单创建',
          description: '客户成功下单，订单进入待发货状态',
          type: 'primary'
        },
        {
          time: '2023-12-15 11:00:00',
          title: '费用扣除',
          description: '从商家账户余额扣除订单费用',
          type: 'success'
        },
        {
          time: '2023-12-15 14:30:00',
          title: '订单发货',
          description: '订单已发货，物流单号：SF1234567890',
          type: 'warning'
        }
      ],
      settlement: {
        currency: 'EUR',
        amount: 280.50,
        exchangeRate: 1.12,
        usdAmount: 314.16
      },
      amounts: {
        productAmount: 299.99,
        shippingAmount: 15.00,
        discountAmount: 0,
        totalAmount: 314.99
      },
      products: [
        {
          id: '1',
          name: '智能手表 Pro Max',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop',
          price: 299.99,
          quantity: 1,
          specs: [
            { name: '颜色', value: '深空黑' },
            { name: '尺寸', value: '44mm' },
            { name: '表带', value: '运动型表带' },
            { name: '存储', value: '32GB' }
          ]
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        phone: '+1-555-0123',
        fullAddress: '123 Main Street, New York, NY 10001',
        zipCode: '10001',
        country: '美国'
      },
      logistics: {
        trackingNumber: 'SF1234567890',
        company: '顺丰速运',
        status: '运输中',
        shippedAt: '2023-12-15 14:30:00',
        timeline: [
          {
            time: '2023-12-15 14:30:00',
            status: '已发货',
            location: '深圳分拣中心',
            description: '您的快件已从深圳分拣中心发出'
          },
          {
            time: '2023-12-16 08:20:00',
            status: '运输中',
            location: '广州转运中心',
            description: '您的快件已到达广州转运中心'
          },
          {
            time: '2023-12-16 15:45:00',
            status: '派送中',
            location: '广州派送点',
            description: '您的快件正在派送中，请保持电话畅通'
          }
        ]
      },
      remark: '客户要求加急处理'
    }

    // 设置Invoice申请表单默认值
    invoiceForm.amount = orderInfo.value.amounts.totalAmount
    
  } catch (error) {
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

const showInvoiceDialog = () => {
  invoiceDialogVisible.value = true
}

const submitInvoiceApplication = async () => {
  try {
    // 验证表单
    if (!invoiceForm.recipientName) {
      ElMessage.warning('请填写收件人姓名')
      return
    }
    if (!invoiceForm.contactInfo) {
      ElMessage.warning('请填写联系方式')
      return
    }
    if (!invoiceForm.mailingAddress) {
      ElMessage.warning('请填写邮寄地址')
      return
    }

    // 提交申请
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Invoice申请提交成功！')
    invoiceDialogVisible.value = false
    
  } catch (error) {
    ElMessage.error('提交申请失败，请重试')
  }
}

const refreshLogistics = async () => {
  try {
    ElMessage.info('正在刷新物流信息...')
    
    // 模拟刷新物流信息
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('物流信息已更新')
    
  } catch (error) {
    ElMessage.error('刷新物流信息失败')
  }
}

const copyTrackingNumber = () => {
  if (orderInfo.value?.logistics?.trackingNumber) {
    navigator.clipboard.writeText(orderInfo.value.logistics.trackingNumber)
    ElMessage.success('物流单号已复制')
  }
}

const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    shipped: 'primary',
    completed: 'success'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
}

const getSettlementStatusType = (status) => {
  const statusMap = {
    settled: 'success',
    failed: 'danger'
  }
  return statusMap[status] || 'info'
}

const getSettlementStatusText = (status) => {
  const statusMap = {
    settled: '已扣费',
    failed: '扣费失败'
  }
  return statusMap[status] || '未知'
}

const getLogisticsStatusType = (status) => {
  const statusMap = {
    '运输中': 'primary',
    '派送中': 'warning',
    '已送达': 'success'
  }
  return statusMap[status] || 'info'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.order-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb-section {
  margin-bottom: 20px;
}

.loading-wrapper {
  padding: 40px;
}

.order-content > div {
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-header h3 {
  margin: 0;
}

.timeline-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.timeline-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.amount-text {
  font-weight: 600;
  color: #67C23A;
}

.discount-text {
  font-weight: 600;
  color: #F56C6C;
}

.total-amount {
  font-weight: 600;
  font-size: 16px;
  color: #E6A23C;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-item {
  font-size: 12px;
  color: #909399;
  background: #F5F7FA;
  padding: 2px 6px;
  border-radius: 3px;
}

.subtotal {
  font-weight: 600;
  color: #67C23A;
}

.logistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logistics-header h3 {
  margin: 0;
}

.logistics-basic {
  margin-bottom: 20px;
}

.logistics-timeline h4 {
  margin: 20px 0 16px 0;
  color: #303133;
}

.logistics-timeline-content .status {
  font-weight: 600;
  color: #303133;
}

.logistics-timeline-content .location {
  color: #606266;
  font-size: 14px;
  margin: 4px 0;
}

.logistics-timeline-content .description {
  color: #909399;
  font-size: 12px;
}

.order-remark p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

:deep(.el-card__header h3) {
  margin: 0;
  color: #303133;
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style> 