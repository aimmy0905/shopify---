<template>
  <div class="purchase-orders-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>采购订单</h2>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-section">
      <el-card>
        <div class="filter-row">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入订单号或商品名称"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleSearch"
              />
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.settlementStatus"
                placeholder="结算状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="待结算" value="pending" />
                <el-option label="已结算" value="settled" />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button type="success" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 高级筛选 -->
        <el-collapse v-model="advancedFilterVisible">
          <el-collapse-item title="高级筛选" name="advanced">
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="订单金额范围">
                  <el-input-number
                    v-model="searchForm.minAmount"
                    placeholder="最小金额"
                    :min="0"
                    controls-position="right"
                  />
                  <span style="margin: 0 8px">-</span>
                  <el-input-number
                    v-model="searchForm.maxAmount"
                    placeholder="最大金额"
                    :min="0"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <!-- 订单列表 -->
    <div class="orders-table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>采购订单列表 (共 {{ total }} 条)</span>
            <div class="table-actions">
              <el-button
                type="primary"
                :disabled="selectedOrders.length === 0"
                @click="handleBulkInvoice"
              >
                <el-icon><Document /></el-icon>
                批量开具Invoice ({{ selectedOrders.length }})
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="orderList"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="orderNo" label="订单号" width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.id)">
                {{ row.orderNo }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column label="订单商品" width="450">
            <template #default="{ row }">
              <div class="order-products">
                <div
                  v-for="(product, index) in row.products.slice(0, 3)"
                  :key="index"
                  class="product-item-detailed"
                >
                  <div class="product-basic-info">
                    <el-image
                      :src="product.image"
                      fit="cover"
                      class="product-image"
                    />
                    <div class="product-main-details">
                      <div class="product-name">{{ product.name }}</div>
                      <div class="product-specs">
                        <span
                          v-for="(value, key) in product.specifications"
                          :key="key"
                          class="spec-item"
                        >
                          {{ key }}: {{ value }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="product-pricing-info">
                    <div class="pricing-row">
                      <span class="unit-price">${{ product.unitPrice.toFixed(2) }}</span>
                      <span class="quantity">×{{ product.quantity }}</span>
                      <span class="line-total">${{ product.lineTotal.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="row.products.length > 3" class="products-summary">
                  <span class="total-items">+{{ row.products.length - 3 }}件更多商品</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="商品金额" width="100">
            <template #default="{ row }">
              ${{ row.productAmount.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="运费金额" width="100">
            <template #default="{ row }">
              ${{ row.shippingAmount.toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="订单金额" width="120">
            <template #default="{ row }">
              <span class="amount-text">${{ row.totalAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="结算状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getSettlementStatusType(row.settlementStatus)">
                {{ getSettlementStatusText(row.settlementStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="结算金额信息" width="180">
            <template #default="{ row }">
              <div class="settlement-amount">
                <div>${{ row.usdAmount.toFixed(2) }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="下单时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="收件地址" width="200">
            <template #default="{ row }">
              <div class="address-info">
                <div>{{ row.shippingAddress.country }}, {{ row.shippingAddress.city }}</div>
                <div class="address-detail">{{ row.shippingAddress.detail }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="物流信息" width="180">
            <template #default="{ row }">
              <div v-if="row.logistics" class="logistics-info">
                <div>{{ row.logistics.company }}</div>
                <div class="tracking-number">{{ row.logistics.trackingNumber }}</div>
              </div>
              <span v-else class="no-logistics">暂无物流信息</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.settlementStatus === 'pending'"
                size="small"
                type="warning"
                @click="handlePayment(row)"
              >
                付款
              </el-button>
              <el-button
                size="small"
                type="primary"
                link
                @click="goToOrderDetail(row.id)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="row.logistics"
                size="small"
                type="success"
                link
                @click="viewLogistics(row)"
              >
                查看物流
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 付款弹窗 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="订单付款"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="currentOrder" class="payment-info">
        <el-descriptions border :column="1">
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="付款金额">
            <span class="payment-amount">${{ currentOrder.totalAmount.toFixed(2) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPayment">确认付款</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 物流信息弹窗 -->
    <el-dialog
      v-model="logisticsDialogVisible"
      title="物流信息"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentLogistics" class="logistics-info">
        <div class="logistics-header">
          <el-descriptions border :column="2">
            <el-descriptions-item label="物流单号">
              {{ currentLogistics.trackingNumber }}
              <el-button size="small" type="primary" link @click="copyTrackingNumber">
                复制
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item label="物流公司">
              {{ currentLogistics.company }}
            </el-descriptions-item>
            <el-descriptions-item label="发货时间">
              {{ formatDateTime(currentLogistics.shippedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="预计送达">
              {{ formatDateTime(currentLogistics.estimatedDelivery) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="logistics-timeline">
          <h4>物流轨迹</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in currentLogistics.timeline"
              :key="index"
              :timestamp="formatDateTime(item.time)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="status">{{ item.status }}</div>
                <div class="location">{{ item.location }}</div>
                <div class="description">{{ item.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 批量开具Invoice弹窗 -->
    <BulkInvoiceDialog
      v-model="bulkInvoiceVisible"
      :selected-orders="selectedOrders"
      @success="handleBulkInvoiceSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Download, Document } from '@element-plus/icons-vue'
import BulkInvoiceDialog from '../components/BulkInvoiceDialog.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const selectedOrders = ref([])
const advancedFilterVisible = ref([])
const paymentDialogVisible = ref(false)
const logisticsDialogVisible = ref(false)
const bulkInvoiceVisible = ref(false)
const currentOrder = ref(null)
const currentLogistics = ref(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  settlementStatus: '',
  minAmount: null,
  maxAmount: null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 生命周期
onMounted(() => {
  loadOrderList()
})

// 方法
const loadOrderList = async () => {
  loading.value = true
  try {
    // 模拟采购订单数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    orderList.value = [
      {
        id: '1',
        orderNo: 'PUR202312150001',
        products: [
          {
            name: '智能手表 Pro Max 批发',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
            quantity: 50,
            unitPrice: 179.99,
            specifications: {
              color: '深空黑',
              size: '44mm',
              storage: '32GB',
              band: '运动型表带',
              warranty: '1年保修'
            },
            lineTotal: 8999.50
          },
          {
            name: '无线充电器 15W 批发',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50&h=50&fit=crop',
            quantity: 100,
            unitPrice: 8.50,
            specifications: {
              color: '白色',
              power: '15W',
              compatibility: 'iPhone/Android',
              certification: 'Qi认证'
            },
            lineTotal: 850.00
          }
        ],
        productAmount: 9849.50,
        shippingAmount: 150.00,
        totalAmount: 9999.50,
        settlementStatus: 'pending',
        settlementCurrency: 'EUR',
        settlementAmount: 8100.50,
        exchangeRate: 1.111,
        usdAmount: 9999.50,
        createdAt: '2023-12-15 10:30:00',
        shippingAddress: {
          country: '美国',
          city: '纽约',
          detail: '123 Main Street, New York, NY 10001'
        },
        logistics: null
      },
      {
        id: '2',
        orderNo: 'PUR202312150002',
        products: [
          {
            name: '蓝牙耳机 AirPods Pro 批发',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=50&h=50&fit=crop',
            quantity: 200,
            unitPrice: 63.99,
            specifications: {
              color: '白色',
              model: 'AirPods Pro',
              features: '主动降噪',
              battery: '24小时续航'
            },
            lineTotal: 12798.00
          }
        ],
        productAmount: 12798.00,
        shippingAmount: 200.00,
        totalAmount: 12998.00,
        settlementStatus: 'settled',
        settlementCurrency: 'GBP',
        settlementAmount: 10350.00,
        exchangeRate: 1.256,
        usdAmount: 12998.00,
        createdAt: '2023-12-14 15:20:00',
        shippingAddress: {
          country: '英国',
          city: '伦敦',
          detail: '456 Baker Street, London, UK W1U 6TU'
        },
        logistics: {
          company: 'DHL',
          trackingNumber: 'DHL1234567890'
        }
      },
      {
        id: '3',
        orderNo: 'PUR202312150003',
        products: [
          {
            name: 'iPhone 15 Pro 手机壳批发',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=50&h=50&fit=crop',
            quantity: 500,
            unitPrice: 5.99,
            specifications: {
              color: '透明',
              material: '硅胶',
              compatibility: 'iPhone 15 Pro',
              protection: '防摔保护'
            },
            lineTotal: 2995.00
          },
          {
            name: '钢化膜套装批发',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=50&h=50&fit=crop',
            quantity: 300,
            unitPrice: 1.85,
            specifications: {
              type: '钢化玻璃',
              thickness: '0.33mm',
              compatibility: 'iPhone 15 Pro',
              hardness: '9H硬度'
            },
            lineTotal: 555.00
          }
        ],
        productAmount: 3550.00,
        shippingAmount: 50.00,
        totalAmount: 3600.00,
        settlementStatus: 'settled',
        settlementCurrency: 'USD',
        settlementAmount: 3600.00,
        exchangeRate: 1.000,
        usdAmount: 3600.00,
        createdAt: '2023-12-14 09:15:00',
        shippingAddress: {
          country: '加拿大',
          city: '多伦多',
          detail: '789 Queen Street, Toronto, ON M5V 1N1'
        },
        logistics: {
          company: 'FedEx',
          trackingNumber: 'FDX9876543210'
        }
      },
      {
        id: '4',
        orderNo: 'PUR202312150004',
        products: [
          {
            name: '游戏机械键盘批发',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=50&h=50&fit=crop',
            quantity: 80,
            unitPrice: 89.99,
            specifications: {
              switch: '青轴',
              backlight: 'RGB',
              layout: '87键',
              connectivity: '有线/无线'
            },
            lineTotal: 7199.20
          },
          {
            name: '游戏鼠标 RGB 批发',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=50&h=50&fit=crop',
            quantity: 120,
            unitPrice: 39.99,
            specifications: {
              dpi: '16000',
              buttons: '7键',
              lighting: 'RGB',
              sensor: '光学传感器'
            },
            lineTotal: 4798.80
          }
        ],
        productAmount: 15799.60,
        shippingAmount: 200.00,
        totalAmount: 15999.60,
        settlementStatus: 'pending',
        settlementCurrency: 'CAD',
        settlementAmount: 21800.00,
        exchangeRate: 0.734,
        usdAmount: 15999.60,
        createdAt: '2023-12-13 16:30:00',
        shippingAddress: {
          country: '澳大利亚',
          city: '悉尼',
          detail: '321 George Street, Sydney, NSW 2000'
        },
        logistics: null
      },
      {
        id: '5',
        orderNo: 'PUR202312150005',
        products: [
          {
            name: '智能家居摄像头批发',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop',
            quantity: 150,
            unitPrice: 49.33,
            specifications: {
              resolution: '1080P',
              connectivity: 'WiFi',
              features: '夜视+双向语音',
              storage: '云存储'
            },
            lineTotal: 7399.50
          }
        ],
        productAmount: 7399.25,
        shippingAmount: 100.00,
        totalAmount: 7499.25,
        settlementStatus: 'settled',
        settlementCurrency: 'AUD',
        settlementAmount: 11250.00,
        exchangeRate: 0.667,
        usdAmount: 7499.25,
        createdAt: '2023-12-13 11:45:00',
        shippingAddress: {
          country: '德国',
          city: '柏林',
          detail: '654 Unter den Linden, Berlin, 10117'
        },
        logistics: {
          company: 'UPS',
          trackingNumber: 'UPS5432167890'
        }
      },
      {
        id: '6',
        orderNo: 'PUR202312150006',
        products: [
          {
            name: '运动蓝牙耳机批发',
            image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=50&h=50&fit=crop',
            quantity: 300,
            unitPrice: 18.99,
            specifications: {
              color: '黑色',
              waterproof: 'IPX7',
              battery: '8小时续航',
              connectivity: '蓝牙5.0'
            },
            lineTotal: 5697.00
          },
          {
            name: '运动臂带批发',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop',
            quantity: 200,
            unitPrice: 6.99,
            specifications: {
              color: '黑色',
              size: '可调节',
              material: '透气网布',
              compatibility: '通用型'
            },
            lineTotal: 1398.00
          }
        ],
        productAmount: 5899.40,
        shippingAmount: 100.00,
        totalAmount: 5999.40,
        settlementStatus: 'pending',
        settlementCurrency: 'EUR',
        settlementAmount: 5400.00,
        exchangeRate: 1.111,
        usdAmount: 5999.40,
        createdAt: '2023-12-12 14:20:00',
        shippingAddress: {
          country: '法国',
          city: '巴黎',
          detail: '987 Champs-Élysées, Paris, 75008'
        },
        logistics: {
          company: '顺丰速运',
          trackingNumber: 'SF2468013579'
        }
      }
    ]
    
    total.value = 89
  } catch (error) {
    ElMessage.error('加载采购订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadOrderList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    dateRange: [],
    settlementStatus: '',
    minAmount: null,
    maxAmount: null
  })
  pagination.page = 1
  loadOrderList()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const handleSizeChange = (size) => {
  pagination.size = size
  loadOrderList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadOrderList()
}

const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
}

const handlePayment = (order) => {
  currentOrder.value = order
  paymentDialogVisible.value = true
}

const confirmPayment = async () => {
  try {
    // 这里调用付款API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('付款成功')
    paymentDialogVisible.value = false
    
    // 更新订单状态
    const orderIndex = orderList.value.findIndex(item => item.id === currentOrder.value.id)
    if (orderIndex !== -1) {
      orderList.value[orderIndex].settlementStatus = 'settled'
    }
  } catch (error) {
    ElMessage.error('付款失败，请重试')
  }
}

const viewLogistics = (order) => {
  // 模拟物流数据
  currentLogistics.value = {
    trackingNumber: order.logistics.trackingNumber,
    company: order.logistics.company,
    shippedAt: '2023-12-15 14:30:00',
    estimatedDelivery: '2023-12-20 18:00:00',
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
        time: '2023-12-17 15:45:00',
        status: '海关清关中',
        location: '海关',
        description: '您的快件正在海关清关中'
      },
      {
        time: '2023-12-18 10:30:00',
        status: '已出关',
        location: '目的地转运中心',
        description: '您的快件已出关，正在转运中'
      }
    ]
  }
  logisticsDialogVisible.value = true
}

const copyTrackingNumber = () => {
  if (currentLogistics.value?.trackingNumber) {
    navigator.clipboard.writeText(currentLogistics.value.trackingNumber)
    ElMessage.success('物流单号已复制')
  }
}

const getSettlementStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    settled: 'success'
  }
  return statusMap[status] || 'info'
}

const getSettlementStatusText = (status) => {
  const statusMap = {
    pending: '待结算',
    settled: '已结算'
  }
  return statusMap[status] || '未知'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const handleBulkInvoice = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要开具Invoice的订单')
    return
  }
  bulkInvoiceVisible.value = true
}

const handleBulkInvoiceSuccess = () => {
  ElMessage.success(`成功提交 ${selectedOrders.value.length} 个订单的批量Invoice申请`)
  // 清空选择
  selectedOrders.value = []
  // 可以在这里刷新列表或跳转到Invoice管理页面
}
</script>

<style scoped>
.purchase-orders-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-filter-section {
  margin-bottom: 20px;
}

.filter-row {
  margin-bottom: 16px;
}

.orders-table-section {
  background: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item-detailed {
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  padding: 12px;
  background-color: #FAFAFA;
}

.product-basic-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-main-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  line-height: 1.4;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.spec-item {
  font-size: 12px;
  color: #606266;
  background-color: #F0F2F5;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

.product-pricing-info {
  border-top: 1px solid #E4E7ED;
  padding-top: 8px;
}

.pricing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.unit-price {
  color: #606266;
  font-weight: 500;
}

.quantity {
  color: #909399;
  margin: 0 8px;
}

.line-total {
  color: #67C23A;
  font-weight: 600;
  font-size: 14px;
}

.products-summary {
  text-align: center;
  padding: 8px;
  background-color: #F5F7FA;
  border-radius: 4px;
  margin-top: 8px;
}

.total-items {
  font-size: 12px;
  color: #909399;
}

.amount-text {
  font-weight: 600;
  color: #67C23A;
}

.settlement-amount .exchange-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.address-info .address-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.logistics-info .tracking-number {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.no-logistics {
  color: #C0C4CC;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.payment-info {
  margin-bottom: 20px;
}

.payment-amount {
  font-size: 18px;
  font-weight: 600;
  color: #E6A23C;
}

.logistics-header {
  margin-bottom: 20px;
}

.logistics-timeline h4 {
  margin-bottom: 16px;
  color: #303133;
}

.timeline-content .status {
  font-weight: 600;
  color: #303133;
}

.timeline-content .location {
  color: #606266;
  font-size: 14px;
  margin: 4px 0;
}

.timeline-content .description {
  color: #909399;
  font-size: 12px;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style> 