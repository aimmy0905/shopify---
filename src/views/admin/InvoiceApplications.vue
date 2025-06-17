<template>
  <div class="invoice-applications">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Invoice申请管理</h1>
        <p class="page-description">管理和处理商家的Invoice开具申请</p>
      </div>
      <div class="header-right">
        <el-button 
          type="primary" 
          :icon="Download"
          @click="exportApplications"
        >
          导出申请列表
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filter-item">
          <label>搜索：</label>
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名称、订单号"
            :prefix-icon="Search"
            clearable
            style="width: 250px"
            @input="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>状态：</label>
          <el-select 
            v-model="searchForm.status" 
            placeholder="全部状态"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待开票" value="pending" />
            <el-option label="已开票" value="completed" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>申请时间：</label>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
            @change="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>金额范围：</label>
          <el-input
            v-model="searchForm.minAmount"
            placeholder="最小金额"
            style="width: 120px"
            @input="handleSearch"
          />
          <span style="margin: 0 8px">-</span>
          <el-input
            v-model="searchForm.maxAmount"
            placeholder="最大金额"
            style="width: 120px"
            @input="handleSearch"
          />
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <div class="table-header">
        <div class="table-title">
          <span>申请列表</span>
          <el-tag type="info" size="small">共 {{ total }} 条记录</el-tag>
        </div>
        <div class="table-actions">
          <el-button 
            type="primary" 
            :disabled="!selectedRows.length"
            @click="batchExport"
          >
            批量导出 ({{ selectedRows.length }})
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="userName" label="用户名称" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar">
                {{ row.userName.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="开票金额" width="120">
          <template #default="{ row }">
            <span class="amount">${{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="orderCount" label="订单数量" width="100">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="showOrderDetails(row)"
            >
              {{ row.orderCount }} 个订单
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="contactInfo" label="开票信息" width="200">
          <template #default="{ row }">
            <div class="contact-info">
              <div class="contact-name">{{ row.contactName }}</div>
              <div class="contact-email">{{ row.contactEmail }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="applicationTime" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.applicationTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="processInfo" label="处理信息" width="160">
          <template #default="{ row }">
            <div v-if="row.status === 'completed'" class="process-info">
              <div class="process-time">{{ formatDateTime(row.processTime) }}</div>
              <div class="process-user">{{ row.processUser }}</div>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                link 
                @click="viewDetails(row)"
              >
                查看详情
              </el-button>
              <el-button 
                v-if="row.status === 'pending'"
                type="success" 
                link 
                @click="uploadInvoice(row)"
              >
                开票
              </el-button>
              <el-button 
                v-if="row.status === 'completed'"
                type="info" 
                link 
                @click="viewInvoice(row)"
              >
                查看Invoice
              </el-button>
            </div>
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
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Invoice申请详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="Invoice申请详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentApplication" class="detail-content">
        <!-- 申请状态 -->
        <div class="status-badge">
          <el-tag 
            :type="getStatusType(currentApplication.status)"
            size="large"
          >
            {{ getStatusText(currentApplication.status) }}
          </el-tag>
        </div>

        <!-- 基本信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请编号">
              {{ currentApplication.applicationId }}
            </el-descriptions-item>
            <el-descriptions-item label="申请用户">
              {{ currentApplication.userName }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatDateTime(currentApplication.applicationTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请状态">
              <el-tag :type="getStatusType(currentApplication.status)">
                {{ getStatusText(currentApplication.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentApplication.processTime" label="处理时间">
              {{ formatDateTime(currentApplication.processTime) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentApplication.processUser" label="处理人员">
              {{ currentApplication.processUser }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 开票信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">开票信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="开票金额">
              <span class="amount">${{ currentApplication.amount.toLocaleString() }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="开票名称">
              {{ currentApplication.contactName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系方式">
              {{ currentApplication.contactPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="联系邮箱">
              {{ currentApplication.contactEmail }}
            </el-descriptions-item>
            <el-descriptions-item label="联系地址" span="2">
              {{ currentApplication.contactAddress }}
            </el-descriptions-item>
            <el-descriptions-item v-if="currentApplication.remarks" label="备注信息" span="2">
              {{ currentApplication.remarks }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 订单信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">订单信息</span>
          </template>
          <el-table :data="currentApplication.orders" stripe>
            <el-table-column prop="orderId" label="订单号" width="180">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewOrder(row.orderId)">
                  {{ row.orderId }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="订单金额" width="120">
              <template #default="{ row }">
                ${{ row.amount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="orderTime" label="订单时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.orderTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="订单状态">
              <template #default="{ row }">
                <el-tag size="small" :type="getOrderStatusType(row.status)">
                  {{ getOrderStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Invoice信息 -->
        <el-card v-if="currentApplication.status === 'completed'" class="info-card" shadow="never">
          <template #header>
            <span class="card-title">Invoice信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Invoice编号">
              {{ currentApplication.invoiceNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="开票日期">
              {{ formatDate(currentApplication.invoiceDate) }}
            </el-descriptions-item>
            <el-descriptions-item label="上传人员">
              {{ currentApplication.processUser }}
            </el-descriptions-item>
            <el-descriptions-item label="上传时间">
              {{ formatDateTime(currentApplication.processTime) }}
            </el-descriptions-item>
          </el-descriptions>
          <div class="invoice-actions" style="margin-top: 16px;">
            <el-button type="primary" @click="viewInvoicePdf(currentApplication)">
              查看Invoice
            </el-button>
            <el-button @click="downloadInvoice(currentApplication)">
              下载Invoice
            </el-button>
          </div>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentApplication && currentApplication.status === 'pending'"
            type="primary" 
            @click="uploadInvoiceFromDetail"
          >
            上传Invoice
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传Invoice弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传Invoice"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentUploadApplication" class="upload-content">
        <!-- 申请信息概要 -->
        <el-card class="summary-card" shadow="never">
          <template #header>
            <span class="card-title">申请信息概要</span>
          </template>
          <div class="summary-info">
            <div class="summary-item">
              <span class="label">申请用户：</span>
              <span class="value">{{ currentUploadApplication.userName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">开票金额：</span>
              <span class="value amount">${{ currentUploadApplication.amount.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">订单数量：</span>
              <span class="value">{{ currentUploadApplication.orderCount }} 个订单</span>
            </div>
          </div>
        </el-card>

        <!-- 上传表单 -->
        <el-form 
          ref="uploadFormRef"
          :model="uploadForm" 
          :rules="uploadRules"
          label-width="120px"
          class="upload-form"
        >
          <el-form-item label="Invoice编号" prop="invoiceNumber">
            <el-input 
              v-model="uploadForm.invoiceNumber"
              placeholder="系统自动生成"
              readonly
            />
          </el-form-item>

          <el-form-item label="开票日期" prop="invoiceDate">
            <el-date-picker
              v-model="uploadForm.invoiceDate"
              type="date"
              placeholder="选择开票日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="Invoice文件" prop="invoiceFile">
            <el-upload
              ref="uploadRef"
              class="invoice-upload"
              drag
              :auto-upload="false"
              :limit="1"
              accept=".pdf"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="uploadForm.fileList"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将PDF文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传PDF文件，且不超过10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="备注信息">
            <el-input
              v-model="uploadForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息（选填）"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="uploading"
            @click="confirmUpload"
          >
            确认上传
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="订单详情"
      width="900px"
    >
      <div v-if="currentOrders.length" class="order-details">
        <el-table :data="currentOrders" stripe max-height="400">
          <el-table-column prop="orderId" label="订单号" width="180" />
          <el-table-column prop="amount" label="订单金额" width="120">
            <template #default="{ row }">
              ${{ row.amount.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="orderTime" label="订单时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.orderTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag size="small" :type="getOrderStatusType(row.status)">
                {{ getOrderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewOrder(row.orderId)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="orderDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Download, 
  UploadFilled 
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  dateRange: [],
  minAmount: '',
  maxAmount: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20
})

// 弹窗控制
const detailDialogVisible = ref(false)
const uploadDialogVisible = ref(false)
const orderDialogVisible = ref(false)

// 当前数据
const currentApplication = ref(null)
const currentUploadApplication = ref(null)
const currentOrders = ref([])

// 上传表单
const uploadForm = reactive({
  invoiceNumber: '',
  invoiceDate: '',
  fileList: [],
  remarks: ''
})

const uploading = ref(false)
const uploadFormRef = ref()

// 上传表单验证规则
const uploadRules = {
  invoiceDate: [
    { required: true, message: '请选择开票日期', trigger: 'change' }
  ],
  invoiceFile: [
    { required: true, message: '请上传Invoice文件', trigger: 'change' }
  ]
}

// 初始化数据
const initData = () => {
  // 模拟初始数据
  const mockData = [
    {
      id: 1,
      applicationId: 'INV-2024-001',
      userName: '张三商家',
      userAvatar: '',
      amount: 15680.50,
      orderCount: 8,
      contactName: '张三',
      contactEmail: 'zhangsan@example.com',
      contactPhone: '+86 138-0013-8000',
      contactAddress: '上海市浦东新区陆家嘴金融中心',
      applicationTime: '2024-01-15 14:30:00',
      status: 'pending',
      processTime: null,
      processUser: null,
      invoiceNumber: null,
      invoiceDate: null,
      remarks: '请尽快开具发票，用于公司报税',
      orders: [
        {
          orderId: 'ORD-2024-001',
          amount: 2580.00,
          orderTime: '2024-01-10 10:30:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-002',
          amount: 3200.50,
          orderTime: '2024-01-11 15:20:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-003',
          amount: 1900.00,
          orderTime: '2024-01-12 09:15:00',
          status: 'completed'
        }
      ]
    },
    {
      id: 2,
      applicationId: 'INV-2024-002',
      userName: '李四贸易',
      userAvatar: '',
      amount: 28900.00,
      orderCount: 12,
      contactName: '李四',
      contactEmail: 'lisi@trade.com',
      contactPhone: '+86 139-0013-9000',
      contactAddress: '北京市朝阳区建国门外大街',
      applicationTime: '2024-01-14 16:45:00',
      status: 'completed',
      processTime: '2024-01-16 10:20:00',
      processUser: '管理员王五',
      invoiceNumber: 'INV-20240116-001',
      invoiceDate: '2024-01-16',
      remarks: null,
      orders: [
        {
          orderId: 'ORD-2024-004',
          amount: 5800.00,
          orderTime: '2024-01-08 14:30:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-005',
          amount: 7200.00,
          orderTime: '2024-01-09 11:20:00',
          status: 'completed'
        }
      ]
    },
    {
      id: 3,
      applicationId: 'INV-2024-003',
      userName: '王五电商',
      userAvatar: '',
      amount: 8750.25,
      orderCount: 5,
      contactName: '王五',
      contactEmail: 'wangwu@ecommerce.com',
      contactPhone: '+86 137-0013-7000',
      contactAddress: '广州市天河区珠江新城',
      applicationTime: '2024-01-13 11:20:00',
      status: 'pending',
      processTime: null,
      processUser: null,
      invoiceNumber: null,
      invoiceDate: null,
      remarks: '月底前需要发票入账',
      orders: [
        {
          orderId: 'ORD-2024-006',
          amount: 3250.25,
          orderTime: '2024-01-07 16:45:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-007',
          amount: 2500.00,
          orderTime: '2024-01-08 13:30:00',
          status: 'completed'
        }
      ]
    },
    {
      id: 4,
      applicationId: 'INV-2024-004',
      userName: '赵六进出口',
      userAvatar: '',
      amount: 45200.80,
      orderCount: 20,
      contactName: '赵六',
      contactEmail: 'zhaoliu@import-export.com',
      contactPhone: '+86 136-0013-6000',
      contactAddress: '深圳市南山区科技园',
      applicationTime: '2024-01-12 09:15:00',
      status: 'completed',
      processTime: '2024-01-14 14:30:00',
      processUser: '管理员张三',
      invoiceNumber: 'INV-20240114-002',
      invoiceDate: '2024-01-14',
      remarks: '大额订单，请优先处理',
      orders: [
        {
          orderId: 'ORD-2024-008',
          amount: 12500.00,
          orderTime: '2024-01-05 10:20:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-009',
          amount: 15800.80,
          orderTime: '2024-01-06 15:45:00',
          status: 'completed'
        }
      ]
    },
    {
      id: 5,
      applicationId: 'INV-2024-005',
      userName: '孙七科技',
      userAvatar: '',
      amount: 12300.00,
      orderCount: 7,
      contactName: '孙七',
      contactEmail: 'sunqi@tech.com',
      contactPhone: '+86 135-0013-5000',
      contactAddress: '杭州市西湖区文三路',
      applicationTime: '2024-01-11 13:40:00',
      status: 'pending',
      processTime: null,
      processUser: null,
      invoiceNumber: null,
      invoiceDate: null,
      remarks: null,
      orders: [
        {
          orderId: 'ORD-2024-010',
          amount: 4200.00,
          orderTime: '2024-01-04 12:15:00',
          status: 'completed'
        },
        {
          orderId: 'ORD-2024-011',
          amount: 3800.00,
          orderTime: '2024-01-05 09:30:00',
          status: 'completed'
        }
      ]
    }
  ]

  tableData.value = mockData
  total.value = mockData.length
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 这里应该调用实际的API
    // const response = await api.getInvoiceApplications({
    //   ...searchForm,
    //   page: pagination.page,
    //   size: pagination.size
    // })
    // tableData.value = response.data
    // total.value = response.total
    
    // 使用模拟数据
    initData()
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 查看详情
const viewDetails = (row) => {
  currentApplication.value = row
  detailDialogVisible.value = true
}

// 显示订单详情
const showOrderDetails = (row) => {
  currentOrders.value = row.orders
  orderDialogVisible.value = true
}

// 上传Invoice
const uploadInvoice = (row) => {
  currentUploadApplication.value = row
  uploadForm.invoiceNumber = generateInvoiceNumber()
  uploadForm.invoiceDate = new Date().toISOString().split('T')[0]
  uploadForm.fileList = []
  uploadForm.remarks = ''
  uploadDialogVisible.value = true
}

// 从详情页上传Invoice
const uploadInvoiceFromDetail = () => {
  detailDialogVisible.value = false
  uploadInvoice(currentApplication.value)
}

// 生成Invoice编号
const generateInvoiceNumber = () => {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${dateStr}-${randomNum}`
}

// 文件上传处理
const handleFileChange = (file, fileList) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  uploadForm.fileList = fileList
}

const handleFileRemove = () => {
  uploadForm.fileList = []
}

// 确认上传
const confirmUpload = async () => {
  if (!uploadFormRef.value) return
  
  try {
    await uploadFormRef.value.validate()
    
    if (uploadForm.fileList.length === 0) {
      ElMessage.error('请上传Invoice文件')
      return
    }

    uploading.value = true
    
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新数据
    const application = tableData.value.find(item => item.id === currentUploadApplication.value.id)
    if (application) {
      application.status = 'completed'
      application.processTime = new Date().toISOString().replace('T', ' ').split('.')[0]
      application.processUser = '当前管理员'
      application.invoiceNumber = uploadForm.invoiceNumber
      application.invoiceDate = uploadForm.invoiceDate
    }
    
    ElMessage.success('Invoice上传成功')
    uploadDialogVisible.value = false
    
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    uploading.value = false
  }
}

// 查看Invoice
const viewInvoice = (row) => {
  ElMessage.info('查看Invoice功能')
}

const viewInvoicePdf = (application) => {
  ElMessage.info(`查看Invoice: ${application.invoiceNumber}`)
}

// 下载Invoice
const downloadInvoice = (application) => {
  ElMessage.success(`开始下载Invoice: ${application.invoiceNumber}`)
}

// 查看订单
const viewOrder = (orderId) => {
  ElMessage.info(`查看订单: ${orderId}`)
}

// 导出功能
const exportApplications = () => {
  ElMessage.success('开始导出申请列表')
}

const batchExport = () => {
  ElMessage.success(`批量导出 ${selectedRows.value.length} 条记录`)
}

// 状态相关方法
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    completed: 'success'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待开票',
    completed: '已开票'
  }
  return statusMap[status] || '未知'
}

const getOrderStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

// 格式化时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.invoice-applications {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .page-description {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.filter-card {
  margin-bottom: 24px;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-size: 14px;
        color: #374151;
        white-space: nowrap;
        font-weight: 500;
      }
    }
  }
}

.table-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .table-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .table-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-name {
    font-size: 14px;
    color: #1f2937;
  }
}

.amount {
  font-weight: 600;
  color: #059669;
}

.contact-info {
  .contact-name {
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .contact-email {
    font-size: 12px;
    color: #6b7280;
  }
}

.process-info {
  .process-time {
    font-size: 12px;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .process-user {
    font-size: 12px;
    color: #6b7280;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.text-muted {
  color: #9ca3af;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

// 弹窗样式
.detail-content {
  .status-badge {
    text-align: center;
    margin-bottom: 24px;
  }

  .info-card {
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .invoice-actions {
    display: flex;
    gap: 12px;
  }
}

.upload-content {
  .summary-card {
    margin-bottom: 24px;
    border: 1px solid #e5e7eb;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .summary-info {
      .summary-item {
        display: flex;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          color: #6b7280;
          font-size: 14px;
        }

        .value {
          color: #1f2937;
          font-size: 14px;

          &.amount {
            font-weight: 600;
            color: #059669;
          }
        }
      }
    }
  }

  .upload-form {
    .invoice-upload {
      width: 100%;

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 120px;
      }
    }
  }
}

.order-details {
  max-height: 400px;
  overflow-y: auto;
}

// 响应式设计
@media (max-width: 768px) {
  .invoice-applications {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch !important;

    .filter-item {
      flex-direction: column;
      align-items: stretch !important;
      gap: 4px;

      label {
        font-size: 12px;
      }
    }
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 