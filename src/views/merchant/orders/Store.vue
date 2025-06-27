
<template>
  <div class="store-orders-page">
    <!-- 订单类型切换按钮 -->
    <div class="order-type-switcher-top">
      <el-button-group>
        <el-button
          :type="activeOrderType === 'store' ? 'primary' : 'default'"
          @click="switchOrderType('store')"
        >
          店铺订单
        </el-button>
        <el-button
          :type="activeOrderType === 'purchase' ? 'primary' : 'default'"
          @click="switchOrderType('purchase')"
        >
          采购订单
        </el-button>
        <el-button
          :type="activeOrderType === 'aftersale' ? 'primary' : 'default'"
          @click="switchOrderType('aftersale')"
        >
          售后订单
        </el-button>
      </el-button-group>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-section">
      <el-card>
        <div class="filter-row">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入订单号或客户名称"
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
                v-model="searchForm.storeId"
                placeholder="选择店铺"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="store in storeList"
                  :key="store.id"
                  :label="store.name"
                  :value="store.id"
                />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.status"
                placeholder="订单状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="待发货" value="pending" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-col>
            <el-col :span="3">
              <el-select
                v-model="searchForm.settlementStatus"
                placeholder="结算状态"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="已扣费" value="settled" />
                <el-option label="扣费失败" value="failed" />
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
            <span>{{ getTableTitle() }} (共 {{ total }} 条)</span>
            <div class="table-actions">
              <el-button
                v-if="activeOrderType === 'store'"
                type="primary"
                :disabled="selectedOrders.length === 0"
                @click="handleBulkInvoice"
              >
                <el-icon><Document /></el-icon>
                批量开具Invoice ({{ selectedOrders.length }})
              </el-button>
              <el-button
                v-if="activeOrderType === 'purchase'"
                type="success"
                :disabled="selectedOrders.length === 0"
                @click="handleBatchPayment"
              >
                批量付款 ({{ selectedOrders.length }})
              </el-button>
              <el-button
                v-if="activeOrderType === 'aftersale'"
                type="warning"
                :disabled="selectedOrders.length === 0"
                @click="handleBatchRefund"
              >
                批量退款 ({{ selectedOrders.length }})
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

          <!-- 店铺订单特有列 -->
          <el-table-column v-if="activeOrderType === 'store'" label="订单商品" width="450">
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

          <el-table-column prop="customerName" label="下单客户" width="120" />

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

          <el-table-column label="订单金额" width="100">
            <template #default="{ row }">
              <span class="amount-text">${{ row.totalAmount.toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="订单状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="结算状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getSettlementStatusType(row.settlementStatus)">
                {{ getSettlementStatusText(row.settlementStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="storeName" label="订单店铺" width="120" />

          <el-table-column label="商家结算金额" width="150">
            <template #default="{ row }">
              <div class="settlement-amount">
                <div>${{ row.usdAmount.toFixed(2) }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 店铺订单特有列 -->
          <el-table-column v-if="activeOrderType === 'store'" label="下单时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'store'" label="结算时间" width="150">
            <template #default="{ row }">
              {{ row.settlementTime ? formatDateTime(row.settlementTime) : '-' }}
            </template>
          </el-table-column>

          <!-- 采购订单特有列 -->
          <el-table-column v-if="activeOrderType === 'purchase'" label="供应商" width="150">
            <template #default="{ row }">
              {{ row.supplierName }}
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'purchase'" label="付款状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.paymentStatus === 'paid' ? 'success' : 'warning'">
                {{ row.paymentStatus === 'paid' ? '已付款' : '待付款' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'purchase'" label="预计交货" width="150">
            <template #default="{ row }">
              {{ row.expectedDelivery }}
            </template>
          </el-table-column>

          <!-- 售后订单特有列 -->
          <el-table-column v-if="activeOrderType === 'aftersale'" label="原订单号" width="180">
            <template #default="{ row }">
              <el-link type="primary" @click="goToOrderDetail(row.originalOrderNo)">
                {{ row.originalOrderNo }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'aftersale'" label="客户邮箱" width="200">
            <template #default="{ row }">
              {{ row.customerEmail }}
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'aftersale'" label="退款金额" width="120">
            <template #default="{ row }">
              ${{ row.refundAmount }}
            </template>
          </el-table-column>

          <el-table-column v-if="activeOrderType === 'aftersale'" label="退款原因" width="150">
            <template #default="{ row }">
              {{ row.reason }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                link
                @click="goToOrderDetail(row.id)"
              >
                查看详情
              </el-button>

              <!-- 店铺订单操作 -->
              <el-button
                v-if="activeOrderType === 'store'"
                size="small"
                type="success"
                link
                @click="viewLogistics(row)"
              >
                查看物流
              </el-button>

              <!-- 采购订单操作 -->
              <el-button
                v-if="activeOrderType === 'purchase' && row.paymentStatus === 'unpaid'"
                size="small"
                type="warning"
                link
                @click="handlePayment(row)"
              >
                付款
              </el-button>

              <!-- 售后订单操作 -->
              <el-button
                v-if="activeOrderType === 'aftersale' && row.status === 'processing'"
                size="small"
                type="success"
                link
                @click="handleRefund(row)"
              >
                处理退款
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Download, Document } from '@element-plus/icons-vue'
import BulkInvoiceDialog from '../components/BulkInvoiceDialog.vue'

const router = useRouter()
const route = useRoute()

// 订单类型切换
const activeOrderType = ref('store')

// 响应式数据
const loading = ref(false)
const orderList = ref([])
const storeList = ref([])
const total = ref(0)
const selectedOrders = ref([])
const advancedFilterVisible = ref([])
const logisticsDialogVisible = ref(false)
const bulkInvoiceVisible = ref(false)
const currentLogistics = ref(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  storeId: '',
  status: '',
  settlementStatus: '',
  minAmount: null,
  maxAmount: null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 订单类型切换方法
const switchOrderType = (type) => {
  if (activeOrderType.value === type) return

  activeOrderType.value = type

  // 更新URL参数
  router.push({
    path: route.path,
    query: { ...route.query, type }
  })

  // 重置分页和选中项
  pagination.page = 1
  selectedOrders.value = []

  // 重新加载数据
  loadOrderList()
}

// 初始化订单类型
const initOrderType = () => {
  const typeFromQuery = route.query.type
  if (typeFromQuery && ['store', 'purchase', 'aftersale'].includes(typeFromQuery)) {
    activeOrderType.value = typeFromQuery
  } else {
    activeOrderType.value = 'store'
  }
}

// 生命周期
onMounted(() => {
  initOrderType()
  loadStoreList()
  loadOrderList()
})

// 监听路由变化
watch(() => route.query.type, (newType) => {
  if (newType && newType !== activeOrderType.value) {
    activeOrderType.value = newType
    loadOrderList()
  }
})

// 方法
const loadStoreList = async () => {
  // 模拟店铺数据
  storeList.value = [
    { id: '1', name: 'TechStore Pro' },
    { id: '2', name: 'AudioWorld' },
    { id: '3', name: 'PhoneAccessories' },
    { id: '4', name: 'GamerHub' },
    { id: '5', name: 'SmartHome Solutions' },
    { id: '6', name: 'FitnessGear' },
    { id: '7', name: 'OfficeSupplies' },
    { id: '8', name: 'TechAccessories' }
  ]
}

const loadOrderList = async () => {
  loading.value = true
  try {
    // 模拟订单数据
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 根据订单类型加载不同的数据
    if (activeOrderType.value === 'store') {
      orderList.value = [
      {
        id: '1',
        orderNo: 'ORD202312150001',
        products: [
          {
            name: '智能手表 Pro Max',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 299.99,
            specifications: {
              color: '深空黑',
              size: '44mm',
              storage: '32GB',
              band: '运动型表带'
            },
            lineTotal: 299.99
          },
          {
            name: '无线充电器 15W',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50&h=50&fit=crop',
            quantity: 2,
            unitPrice: 15.00,
            specifications: {
              color: '白色',
              power: '15W',
              compatibility: 'iPhone/Android'
            },
            lineTotal: 30.00
          }
        ],
        customerName: 'John Doe',
        productAmount: 329.99,
        shippingAmount: 15.00,
        totalAmount: 344.99,
        status: 'pending',
        settlementStatus: 'settled',
        storeName: 'TechStore Pro',
        settlementCurrency: 'EUR',
        settlementAmount: 280.50,
        exchangeRate: 1.12,
        usdAmount: 344.99,
        createdAt: '2023-12-15 10:30:00',
        settlementTime: '2023-12-15 11:00:00'
      },
      {
        id: '2',
        orderNo: 'ORD202312150002',
        products: [
          {
            name: '蓝牙耳机 AirPods Pro',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 89.99,
            specifications: {
              color: '白色',
              model: 'AirPods Pro',
              features: '主动降噪'
            },
            lineTotal: 89.99
          }
        ],
        customerName: 'Jane Smith',
        productAmount: 89.99,
        shippingAmount: 8.00,
        totalAmount: 97.99,
        status: 'shipped',
        settlementStatus: 'failed',
        storeName: 'AudioWorld',
        settlementCurrency: 'GBP',
        settlementAmount: 78.50,
        exchangeRate: 1.25,
        usdAmount: 98.13,
        createdAt: '2023-12-15 09:15:00',
        settlementTime: null
      },
      {
        id: '3',
        orderNo: 'ORD202312150003',
        products: [
          {
            name: 'iPhone 15 Pro 手机壳',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=50&h=50&fit=crop',
            quantity: 3,
            unitPrice: 12.99,
            specifications: {
              color: '透明',
              material: '硅胶',
              compatibility: 'iPhone 15 Pro'
            },
            lineTotal: 38.97
          },
          {
            name: '钢化膜套装',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=50&h=50&fit=crop',
            quantity: 2,
            unitPrice: 3.50,
            specifications: {
              type: '钢化玻璃',
              thickness: '0.33mm',
              compatibility: 'iPhone 15 Pro'
            },
            lineTotal: 7.00
          }
        ],
        customerName: 'Michael Johnson',
        productAmount: 45.97,
        shippingAmount: 5.00,
        totalAmount: 50.97,
        status: 'completed',
        settlementStatus: 'settled',
        storeName: 'PhoneAccessories',
        settlementCurrency: 'USD',
        settlementAmount: 50.97,
        exchangeRate: 1.00,
        usdAmount: 50.97,
        createdAt: '2023-12-14 16:45:00',
        settlementTime: '2023-12-14 17:00:00'
      },
      {
        id: '4',
        orderNo: 'ORD202312150004',
        products: [
          {
            name: '游戏机械键盘',
            image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 129.99,
            specifications: {
              switch: '青轴',
              backlight: 'RGB',
              layout: '87键'
            },
            lineTotal: 129.99
          },
          {
            name: '游戏鼠标 RGB',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 59.99,
            specifications: {
              dpi: '16000',
              buttons: '7键',
              lighting: 'RGB'
            },
            lineTotal: 59.99
          }
        ],
        customerName: 'Sarah Wilson',
        productAmount: 189.98,
        shippingAmount: 12.00,
        totalAmount: 201.98,
        status: 'shipped',
        settlementStatus: 'settled',
        storeName: 'GamerHub',
        settlementCurrency: 'CAD',
        settlementAmount: 275.50,
        exchangeRate: 0.733,
        usdAmount: 201.98,
        createdAt: '2023-12-14 14:20:00',
        settlementTime: '2023-12-14 15:00:00'
      },
      {
        id: '5',
        orderNo: 'ORD202312150005',
        products: [
          {
            name: '智能家居摄像头',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop',
            quantity: 2,
            unitPrice: 79.99,
            specifications: {
              resolution: '1080P',
              connectivity: 'WiFi',
              features: '夜视+双向语音'
            },
            lineTotal: 159.98
          }
        ],
        customerName: 'David Brown',
        productAmount: 159.98,
        shippingAmount: 10.00,
        totalAmount: 169.98,
        status: 'pending',
        settlementStatus: 'settled',
        storeName: 'SmartHome Solutions',
        settlementCurrency: 'AUD',
        settlementAmount: 255.50,
        exchangeRate: 0.665,
        usdAmount: 169.98,
        createdAt: '2023-12-14 11:30:00',
        settlementTime: '2023-12-14 12:00:00'
      },
      {
        id: '6',
        orderNo: 'ORD202312150006',
        products: [
          {
            name: '运动蓝牙耳机',
            image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 59.99,
            specifications: {
              color: '黑色',
              waterproof: 'IPX7',
              battery: '8小时续航'
            },
            lineTotal: 59.99
          },
          {
            name: '运动臂带',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 19.99,
            specifications: {
              color: '黑色',
              size: '可调节',
              material: '透气网布'
            },
            lineTotal: 19.99
          }
        ],
        customerName: 'Emily Davis',
        productAmount: 79.98,
        shippingAmount: 6.00,
        totalAmount: 85.98,
        status: 'completed',
        settlementStatus: 'settled',
        storeName: 'FitnessGear',
        settlementCurrency: 'EUR',
        settlementAmount: 77.50,
        exchangeRate: 1.109,
        usdAmount: 85.98,
        createdAt: '2023-12-13 19:15:00',
        settlementTime: '2023-12-13 20:00:00'
      },
      {
        id: '7',
        orderNo: 'ORD202312150007',
        products: [
          {
            name: '笔记本电脑支架',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=50&h=50&fit=crop',
            quantity: 1,
            unitPrice: 35.99,
            specifications: {
              material: '铝合金',
              adjustable: '6档调节',
              compatibility: '11-17英寸'
            },
            lineTotal: 35.99
          }
        ],
        customerName: 'Robert Taylor',
        productAmount: 35.99,
        shippingAmount: 7.00,
        totalAmount: 42.99,
        status: 'shipped',
        settlementStatus: 'settled',
        storeName: 'OfficeSupplies',
        settlementCurrency: 'USD',
        settlementAmount: 42.99,
        exchangeRate: 1.00,
        usdAmount: 42.99,
        createdAt: '2023-12-13 15:20:00',
        settlementTime: '2023-12-13 16:00:00'
      },
      {
        id: '8',
        orderNo: 'ORD202312150008',
        products: [
          {
            name: 'USB-C 数据线',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50&h=50&fit=crop',
            quantity: 5,
            unitPrice: 7.99,
            specifications: {
              length: '1米',
              type: 'USB-C to USB-C',
              speed: '快充支持'
            },
            lineTotal: 39.95
          },
          {
            name: '充电头 20W',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50&h=50&fit=crop',
            quantity: 2,
            unitPrice: 14.00,
            specifications: {
              power: '20W',
              ports: 'USB-C',
              compatibility: 'iPhone/Android'
            },
            lineTotal: 28.00
          }
        ],
        customerName: 'Lisa Anderson',
        productAmount: 67.95,
        shippingAmount: 4.00,
        totalAmount: 71.95,
        status: 'completed',
        settlementStatus: 'settled',
        storeName: 'TechAccessories',
        settlementCurrency: 'EUR',
        settlementAmount: 64.50,
        exchangeRate: 1.115,
        usdAmount: 71.95,
        createdAt: '2023-12-12 20:45:00',
        settlementTime: '2023-12-12 21:30:00'
      }
    ]

    total.value = 156
    } else if (activeOrderType.value === 'purchase') {
      // 采购订单数据
      orderList.value = [
        {
          id: 'P001',
          orderNo: 'PUR202312150001',
          products: [
            {
              name: '智能手表批量采购',
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
              quantity: 100,
              unitPrice: 199.99,
              specifications: {
                color: '多色',
                size: '44mm',
                storage: '32GB'
              },
              lineTotal: 19999.00
            }
          ],
          supplierName: 'TechSupplier Co.',
          totalAmount: 19999.00,
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: '2023-12-15 10:30:00',
          expectedDelivery: '2023-12-25'
        }
      ]
      total.value = 25
    } else if (activeOrderType.value === 'aftersale') {
      // 售后订单数据
      orderList.value = [
        {
          id: 'AS001',
          orderNo: 'AS202312150001',
          originalOrderNo: 'ORD202312150001',
          products: [
            {
              name: '智能手表 Pro Max',
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50&h=50&fit=crop',
              quantity: 1,
              unitPrice: 299.99,
              specifications: {
                color: '深空黑',
                size: '44mm'
              },
              lineTotal: 299.99
            }
          ],
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          refundAmount: 299.99,
          refundCurrency: 'USD',
          status: 'processing',
          reason: '商品质量问题',
          createdAt: '2023-12-15 14:20:00'
        }
      ]
      total.value = 12
    }
  } catch (error) {
    ElMessage.error('加载订单列表失败')
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
    storeId: '',
    status: '',
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

const viewLogistics = () => {
  // 模拟物流数据
  currentLogistics.value = {
    trackingNumber: 'SF1234567890',
    company: '顺丰速运',
    shippedAt: '2023-12-15 14:30:00',
    estimatedDelivery: '2023-12-18 18:00:00',
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
  }
  logisticsDialogVisible.value = true
}

const copyTrackingNumber = () => {
  if (currentLogistics.value?.trackingNumber) {
    navigator.clipboard.writeText(currentLogistics.value.trackingNumber)
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

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取表格标题
const getTableTitle = () => {
  const titles = {
    store: '店铺订单列表',
    purchase: '采购订单列表',
    aftersale: '售后订单列表'
  }
  return titles[activeOrderType.value] || '订单列表'
}

const handleBulkInvoice = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要开具Invoice的订单')
    return
  }
  bulkInvoiceVisible.value = true
}

const handleBatchPayment = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要付款的采购订单')
    return
  }
  ElMessage.success(`批量付款功能开发中... (${selectedOrders.value.length} 个订单)`)
}

const handleBatchRefund = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要退款的售后订单')
    return
  }
  ElMessage.success(`批量退款功能开发中... (${selectedOrders.value.length} 个订单)`)
}

const handlePayment = (order) => {
  ElMessage.success(`付款功能开发中... 订单号: ${order.orderNo}`)
}

const handleRefund = (order) => {
  ElMessage.success(`处理退款功能开发中... 订单号: ${order.orderNo}`)
}

const handleBulkInvoiceSuccess = () => {
  ElMessage.success(`成功提交 ${selectedOrders.value.length} 个订单的批量Invoice申请`)
  // 清空选择
  selectedOrders.value = []
  // 可以在这里刷新列表或跳转到Invoice管理页面
}
</script>

<style scoped>
.store-orders-page {
  padding: 20px;
}

.order-type-switcher-top {
  margin-bottom: 20px;
}

.order-type-switcher-top :deep(.el-button-group) {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-type-switcher-top :deep(.el-button) {
  border-radius: 0;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 10px 20px;
  font-weight: 500;
  border-color: #dcdfe6;
}

.order-type-switcher-top :deep(.el-button:first-child) {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.order-type-switcher-top :deep(.el-button:last-child) {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.order-type-switcher-top :deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
  z-index: 1;
}

.order-type-switcher-top :deep(.el-button--default) {
  background-color: #fff;
  color: #606266;
}

.order-type-switcher-top :deep(.el-button--default:hover) {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.logistics-info {
  padding: 10px;
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
