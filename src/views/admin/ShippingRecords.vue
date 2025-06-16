<template>
  <div class="shipping-records-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>发货记录</h2>
      <p>查看和管理所有采购订单的发货记录</p>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号、物流单号"
            style="width: 300px"
            :prefix-icon="Search"
            clearable
            @change="handleSearch"
          />
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleSearch"
          />
          <el-select
            v-model="filterShippingCompany"
            placeholder="物流公司"
            style="width: 150px"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="DHL Express" value="DHL Express" />
            <el-option label="FedEx" value="FedEx" />
            <el-option label="UPS" value="UPS" />
            <el-option label="EMS" value="EMS" />
            <el-option label="顺丰速运" value="顺丰速运" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-button :icon="Download" @click="exportRecords">
            导出记录
          </el-button>
          <el-button type="primary" @click="batchExport" :disabled="selectedRecords.length === 0">
            批量导出 ({{ selectedRecords.length }})
          </el-button>
          <el-button type="success" :icon="Ship" @click="showNewShippingDialog">
            发货
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 发货记录列表 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="total-count">
          共 {{ totalCount }} 条发货记录
        </div>
      </div>

      <el-table
        :data="filteredRecords"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="order_id" label="订单号" width="140">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="viewOrderDetail(scope.row)"
            >
              {{ scope.row.order_id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="发货时间" width="160">
          <template #default="scope">
            {{ scope.row.shipped_at }}
          </template>
        </el-table-column>
        <el-table-column label="发货商品" width="300">
          <template #default="scope">
            <div class="product-list">
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
        <el-table-column label="物流信息" width="200">
          <template #default="scope">
            <div>
              <div class="shipping-company">{{ scope.row.shipping_company }}</div>
              <div class="tracking-number">{{ scope.row.tracking_number }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="shipped_by" label="发货人员" width="120" />
        <el-table-column label="预计到达" width="120">
          <template #default="scope">
            {{ scope.row.estimated_delivery || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="trackShipping(scope.row)"
            >
              查看物流
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewShippingDetail(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

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
        <span class="dialog-footer">
          <el-button @click="shippingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShipping">确认发货</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货详情弹窗 -->
    <el-dialog
      v-model="shippingDetailDialogVisible"
      title="发货详情"
      width="600px"
    >
      <div v-if="currentShippingDetail" class="shipping-detail-content">
        <div class="detail-section">
          <h4>订单信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ currentShippingDetail.order_id }}</el-descriptions-item>
            <el-descriptions-item label="收货人">{{ currentShippingDetail.receiver_name }}</el-descriptions-item>
            <el-descriptions-item label="收货电话">{{ currentShippingDetail.receiver_phone }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ currentShippingDetail.shipped_at }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>收货地址</h4>
          <p class="address-text">{{ currentShippingDetail.receiver_address }}</p>
        </div>

        <div class="detail-section">
          <h4>物流信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">{{ currentShippingDetail.shipping_company }}</el-descriptions-item>
            <el-descriptions-item label="运单号">{{ currentShippingDetail.tracking_number }}</el-descriptions-item>
            <el-descriptions-item label="预计到达">{{ currentShippingDetail.estimated_delivery || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="发货人">{{ currentShippingDetail.shipped_by }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>商品清单</h4>
          <div class="product-list">
            <div v-for="item in currentShippingDetail.items" :key="item.id" class="product-item-detail">
              <img :src="item.image" :alt="item.name" class="product-image-detail" />
              <div class="product-info">
                <div class="product-name-detail">{{ item.name }}</div>
                <div class="product-specs">{{ item.specifications }}</div>
                <div class="product-quantity-detail">数量: {{ item.quantity }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentShippingDetail.shipping_remark">
          <h4>发货备注</h4>
          <p class="remark-text">{{ currentShippingDetail.shipping_remark }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 物流跟踪弹窗 -->
    <el-dialog
      v-model="trackingDialogVisible"
      title="物流跟踪"
      width="700px"
    >
      <div v-if="currentTrackingInfo" class="tracking-content">
        <div class="tracking-header">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="运单号">{{ currentTrackingInfo.tracking_number }}</el-descriptions-item>
            <el-descriptions-item label="物流公司">{{ currentTrackingInfo.shipping_company }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getTrackingStatusType(currentTrackingInfo.status)">
                {{ getTrackingStatusText(currentTrackingInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="预计到达">{{ currentTrackingInfo.estimated_delivery || '未知' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="tracking-timeline">
          <h4>物流轨迹</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(track, index) in currentTrackingInfo.tracking_history"
              :key="index"
              :timestamp="track.time"
              :type="index === 0 ? 'primary' : 'info'"
            >
              <div class="tracking-item">
                <div class="tracking-status">{{ track.status }}</div>
                <div class="tracking-location" v-if="track.location">{{ track.location }}</div>
                <div class="tracking-description" v-if="track.description">{{ track.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, Ship, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { purchaseOrders } from '@/data/mockData.js'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const dateRange = ref([])
const filterShippingCompany = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const selectedRecords = ref([])

// 模拟发货记录数据（从已发货的采购订单生成）
const shippingRecords = ref([])

// 发货弹窗相关
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
  estimated_delivery: '',
  remark: ''
})

// 发货详情弹窗相关
const shippingDetailDialogVisible = ref(false)
const currentShippingDetail = ref(null)

// 物流跟踪弹窗相关
const trackingDialogVisible = ref(false)
const currentTrackingInfo = ref(null)

// 计算属性
const filteredRecords = computed(() => {
  return shippingRecords.value.filter(record => {
    const matchKeyword = !searchKeyword.value ||
      record.order_id.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      record.tracking_number.toLowerCase().includes(searchKeyword.value.toLowerCase())

    const matchCompany = !filterShippingCompany.value ||
      record.shipping_company === filterShippingCompany.value

    // 简单的日期筛选逻辑
    let matchDate = true
    if (dateRange.value && dateRange.value.length === 2) {
      const recordDate = new Date(record.shipped_at)
      const startDate = new Date(dateRange.value[0])
      const endDate = new Date(dateRange.value[1])
      matchDate = recordDate >= startDate && recordDate <= endDate
    }

    return matchKeyword && matchCompany && matchDate
  })
})

// 初始化发货记录数据
const initShippingRecords = () => {
  const shippedOrders = purchaseOrders.filter(order => order.shipping_status === 'shipped' && order.tracking_number)

  shippingRecords.value = shippedOrders.map(order => ({
    id: order.id,
    order_id: order.id,
    shipped_at: order.shipped_at,
    shipping_company: order.shipping_company,
    tracking_number: order.tracking_number,
    estimated_delivery: order.estimated_delivery,
    shipped_by: '管理员',
    receiver_name: order.receiver_name,
    receiver_phone: order.receiver_phone,
    receiver_address: order.receiver_address,
    items: order.items,
    shipping_remark: order.remark
  }))

  totalCount.value = shippingRecords.value.length
}

// 方法
const handleSearch = () => {
  currentPage.value = 1
  // 这里应该调用API进行搜索
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  handleSearch()
}

const viewOrderDetail = (record) => {
  router.push(`/admin/purchase-orders/${record.order_id}`)
}

const viewShippingDetail = (record) => {
  currentShippingDetail.value = record
  shippingDetailDialogVisible.value = true
}

const trackShipping = (record) => {
  // 模拟物流跟踪数据
  currentTrackingInfo.value = {
    tracking_number: record.tracking_number,
    shipping_company: record.shipping_company,
    estimated_delivery: record.estimated_delivery,
    status: 'in_transit',
    tracking_history: [
      {
        time: '2023-12-20 14:30:00',
        status: '运输中',
        location: '上海分拨中心',
        description: '快件已从上海分拨中心发出，正在运往目的地'
      },
      {
        time: '2023-12-20 10:15:00',
        status: '已揽收',
        location: '上海浦东新区',
        description: '快件已在上海浦东新区揽收'
      },
      {
        time: '2023-12-20 09:00:00',
        status: '已下单',
        location: '上海',
        description: '商家已发货，等待快递公司揽收'
      }
    ]
  }
  trackingDialogVisible.value = true
}

const exportRecords = () => {
  ElMessage.success('发货记录导出功能开发中...')
}

const batchExport = () => {
  ElMessage.success(`批量导出 ${selectedRecords.value.length} 条记录`)
}

// 发货相关方法
const showNewShippingDialog = () => {
  // 重置表单
  Object.assign(shippingForm, {
    shipping_company: '',
    tracking_number: '',
    estimated_delivery: '',
    remark: ''
  })

  // 重置扫码状态
  shippingMode.value = 'scan'
  scanBuffer.value = ''
  scanStatus.value = {
    type: 'info',
    text: '等待扫码'
  }

  shippingDialogVisible.value = true

  // 聚焦到扫码输入框
  nextTick(() => {
    if (scanInput.value) {
      scanInput.value.focus()
    }
  })
}

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
    if (orderData.orderId) {
      scanStatus.value = {
        type: 'success',
        text: '订单二维码扫描成功'
      }
      ElMessage.success('订单信息验证成功')
    } else {
      scanStatus.value = {
        type: 'warning',
        text: '订单信息不完整'
      }
      ElMessage.warning('扫描的订单信息不完整')
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

const confirmShipping = () => {
  // 验证表单
  if (!shippingForm.shipping_company || !shippingForm.tracking_number) {
    ElMessage.error('请填写完整的物流信息')
    return
  }

  // 模拟发货操作
  ElMessage.success('发货成功！')
  shippingDialogVisible.value = false

  // 刷新发货记录列表
  initShippingRecords()
}

// 物流状态辅助方法
const getTrackingStatusType = (status) => {
  const statusMap = {
    'pending': 'info',
    'picked_up': 'warning',
    'in_transit': 'primary',
    'delivered': 'success',
    'exception': 'danger'
  }
  return statusMap[status] || 'info'
}

const getTrackingStatusText = (status) => {
  const statusMap = {
    'pending': '待揽收',
    'picked_up': '已揽收',
    'in_transit': '运输中',
    'delivered': '已送达',
    'exception': '异常'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  initShippingRecords()
})
</script>

<style scoped>
.shipping-records-container {
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.total-count {
  color: #909399;
  font-size: 14px;
}

.product-list {
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

.shipping-company {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.tracking-number {
  font-family: monospace;
  font-size: 12px;
  color: #409EFF;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 发货弹窗样式 */
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

/* 发货详情弹窗样式 */
.shipping-detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.address-text {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.product-item-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 8px;
}

.product-image-detail {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.product-info {
  flex: 1;
}

.product-name-detail {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.product-specs {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.product-quantity-detail {
  font-size: 12px;
  color: #606266;
}

.remark-text {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

/* 物流跟踪弹窗样式 */
.tracking-content {
  padding: 10px 0;
}

.tracking-header {
  margin-bottom: 24px;
}

.tracking-timeline h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.tracking-item {
  padding: 8px 0;
}

.tracking-status {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.tracking-location {
  font-size: 13px;
  color: #606266;
  margin-bottom: 2px;
}

.tracking-description {
  font-size: 12px;
  color: #909399;
}
</style>