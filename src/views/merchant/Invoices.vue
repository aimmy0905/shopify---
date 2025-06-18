<template>
  <div class="invoices-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>Invoice记录</h2>
      <el-button type="primary" @click="showCreateInvoiceDialog">
        <el-icon><Plus /></el-icon>
        申请开具Invoice
      </el-button>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="search-filter-section">
      <el-card>
        <div class="filter-row">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入订单号"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
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
                v-model="searchForm.status"
                placeholder="状态筛选"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="待开具" value="pending" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- Invoice记录列表 -->
    <div class="invoices-table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>Invoice记录 (共 {{ total }} 条)</span>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="invoiceList"
          stripe
          empty-text="您尚未申请过Invoice"
        >
          <el-table-column prop="applyTime" label="申请时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.applyTime) }}
            </template>
          </el-table-column>

          <el-table-column prop="invoiceNo" label="Invoice编号" width="180">
            <template #default="{ row }">
              <span v-if="row.invoiceNo">{{ row.invoiceNo }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>

          <el-table-column label="发票类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.invoiceType === 'enterprise' ? 'primary' : 'success'" size="small">
                {{ row.invoiceType === 'enterprise' ? '企业' : '个人' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="发票抬头" width="200">
            <template #default="{ row }">
              <span>{{ getInvoiceHeader(row) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="开票金额" width="120">
            <template #default="{ row }">
              <span class="amount-text">${{ row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="订单项" width="200">
            <template #default="{ row }">
              <div class="order-list">
                <div
                  v-for="(order, index) in row.orders.slice(0, 3)"
                  :key="index"
                  class="order-item"
                >
                  <el-link type="primary" size="small" @click="goToOrderDetail(order.id)">
                    {{ order.orderNo }}
                  </el-link>
                </div>
                <el-button
                  v-if="row.orders.length > 3"
                  type="text"
                  size="small"
                  @click="showOrdersDialog(row.orders)"
                >
                  查看全部({{ row.orders.length }})
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="开票状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="recipientName" label="收件人" width="120">
            <template #default="{ row }">
              {{ row.recipientInfo?.name || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="showInvoiceDetail(row)">
                查看详情
              </el-button>
              <el-button
                v-if="row.status === 'completed' && row.invoiceFile"
                type="text"
                size="small"
                @click="downloadInvoice(row)"
              >
                下载Invoice
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 申请开具Invoice弹窗 -->
    <CreateInvoiceDialog
      v-model="createInvoiceVisible"
      @success="handleCreateSuccess"
    />

    <!-- Invoice详情弹窗 -->
    <InvoiceDetailDialog
      v-model="detailVisible"
      :invoice="currentInvoice"
    />

    <!-- 订单列表弹窗 -->
    <OrdersListDialog
      v-model="ordersVisible"
      :orders="currentOrders"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import CreateInvoiceDialog from './components/CreateInvoiceDialog.vue'
import InvoiceDetailDialog from './components/InvoiceDetailDialog.vue'
import OrdersListDialog from './components/OrdersListDialog.vue'
import { formatDateTime } from '@/utils/format'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const total = ref(0)
const invoiceList = ref([])
const createInvoiceVisible = ref(false)
const detailVisible = ref(false)
const ordersVisible = ref(false)
const currentInvoice = ref(null)
const currentOrders = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  status: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 获取Invoice列表
const getInvoiceList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        applyTime: '2024-01-15 10:30:00',
        invoiceNo: 'INV-2024-001',
        amount: 1250.00,
        status: 'completed',
        invoiceType: 'enterprise',
        companyName: 'TechCorp Solutions Ltd.',
        recipientInfo: {
          name: 'John Smith',
          phone: '+1234567890',
          address: '123 Main St, New York, NY 10001'
        },
        orders: [
          { id: 1, orderNo: 'ORD-2024-001', amount: 500.00, time: '2024-01-10 09:15:00' },
          { id: 2, orderNo: 'ORD-2024-002', amount: 750.00, time: '2024-01-12 14:20:00' }
        ],
        invoiceFile: 'invoice_001.pdf',
        remarks: '季度结算'
      },
      {
        id: 2,
        applyTime: '2024-01-20 15:45:00',
        invoiceNo: null,
        amount: 800.00,
        status: 'pending',
        invoiceType: 'individual',
        individualName: 'Jane Doe',
        recipientInfo: {
          name: 'Jane Doe',
          phone: '+1987654321',
          address: '456 Oak Ave, Los Angeles, CA 90210'
        },
        orders: [
          { id: 3, orderNo: 'ORD-2024-003', amount: 300.00, time: '2024-01-18 11:30:00' },
          { id: 4, orderNo: 'ORD-2024-004', amount: 500.00, time: '2024-01-19 16:45:00' }
        ],
        invoiceFile: null,
        remarks: ''
      },
      {
        id: 3,
        applyTime: '2024-01-22 09:15:00',
        invoiceNo: 'INV-2024-002',
        amount: 2850.00,
        status: 'completed',
        invoiceType: 'enterprise',
        companyName: '深圳科技有限公司',
        recipientInfo: {
          name: '李经理',
          phone: '+86-138-0000-0000',
          address: '深圳市南山区科技园南区'
        },
        orders: [
          { id: 5, orderNo: 'PUR202312150001', amount: 999.50, time: '2024-01-20 10:30:00' },
          { id: 6, orderNo: 'PUR202312150002', amount: 1298.00, time: '2024-01-20 11:15:00' },
          { id: 7, orderNo: 'PUR202312150003', amount: 360.00, time: '2024-01-20 14:20:00' },
          { id: 8, orderNo: 'ORD202312150001', amount: 344.99, time: '2024-01-21 09:30:00' }
        ],
        invoiceFile: 'invoice_002.pdf',
        remarks: '批量采购订单Invoice',
        isBulk: true
      },
      {
        id: 4,
        applyTime: '2024-01-23 14:30:00',
        invoiceNo: null,
        amount: 1580.50,
        status: 'pending',
        invoiceType: 'individual',
        individualName: '王先生',
        recipientInfo: {
          name: '王先生',
          phone: '+86-139-0000-0000',
          address: '上海市浦东新区陆家嘴金融区'
        },
        orders: [
          { id: 9, orderNo: 'ORD202312150002', amount: 97.99, time: '2024-01-22 15:20:00' },
          { id: 10, orderNo: 'ORD202312150003', amount: 50.97, time: '2024-01-22 16:45:00' },
          { id: 11, orderNo: 'ORD202312150004', amount: 201.98, time: '2024-01-23 10:15:00' },
          { id: 12, orderNo: 'ORD202312150005', amount: 169.98, time: '2024-01-23 11:30:00' },
          { id: 13, orderNo: 'PUR202312150004', amount: 1599.60, time: '2024-01-23 13:45:00' }
        ],
        invoiceFile: null,
        remarks: '批量店铺订单Invoice',
        isBulk: true
      }
    ]
    
    invoiceList.value = mockData
    total.value = mockData.length
  } catch (error) {
    ElMessage.error('获取Invoice记录失败')
    console.error('Error fetching invoices:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  getInvoiceList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    dateRange: [],
    status: ''
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getInvoiceList()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  getInvoiceList()
}

// 状态相关方法
const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'completed': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待开具',
    'completed': '已完成'
  }
  return texts[status] || '未知'
}

// 显示申请Invoice弹窗
const showCreateInvoiceDialog = () => {
  createInvoiceVisible.value = true
}

// 显示Invoice详情
const showInvoiceDetail = (invoice) => {
  currentInvoice.value = invoice
  detailVisible.value = true
}

// 显示订单列表
const showOrdersDialog = (orders) => {
  currentOrders.value = orders
  ordersVisible.value = true
}

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  router.push(`/merchant/orders/${orderId}`)
}

// 下载Invoice
const downloadInvoice = async (invoice) => {
  try {
    // 模拟下载
    ElMessage.success('Invoice下载开始')
    // 实际项目中这里会调用下载API
    console.log('Downloading invoice:', invoice.invoiceFile)
  } catch (error) {
    ElMessage.error('下载失败')
    console.error('Download error:', error)
  }
}

// 获取发票抬头
const getInvoiceHeader = (invoice) => {
  if (invoice.invoiceType === 'enterprise') {
    return invoice.companyName || '-'
  } else {
    return invoice.individualName || '-'
  }
}

// 创建成功回调
const handleCreateSuccess = () => {
  ElMessage.success('Invoice申请提交成功')
  getInvoiceList()
}

// 组件挂载
onMounted(() => {
  getInvoiceList()
})
</script>

<style lang="scss" scoped>
.invoices-page {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .search-filter-section {
    margin-bottom: 20px;

    .filter-row {
      margin-bottom: 16px;
    }
  }

  .invoices-table-section {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      span {
        font-weight: 600;
        color: #303133;
      }
    }

    .order-list {
      .order-item {
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .amount-text {
      font-weight: 600;
      color: #67C23A;
    }

    .text-muted {
      color: #909399;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}
</style> 