<template>
  <div class="purchase-applications">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h1>采购申请管理</h1>
        <p class="page-description">管理和处理商家的采购申请，进行审核和报价</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateOrderDialog">
          <el-icon><Plus /></el-icon>
          创建采购订单
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter">
      <el-card>
        <div class="filter-row">
          <div class="filter-item">
            <label>搜索：</label>
            <el-input
              v-model="searchQuery"
              placeholder="支持按商家名称、商品名称搜索"
              style="width: 300px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div class="filter-item">
            <label>申请状态：</label>
            <el-select v-model="filterStatus" placeholder="全部状态" style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="待报价" value="quotation_pending" />
              <el-option label="报价中" value="quotation_processing" />
              <el-option label="报价成功" value="quotation_success" />
              <el-option label="报价失败" value="quotation_failed" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <label>采购类型：</label>
            <el-select v-model="filterType" placeholder="全部类型" style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="现有商品" value="existing" />
              <el-option label="另外采购" value="external" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <label>时间范围：</label>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </div>
          
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 采购申请列表 -->
    <div class="table-container">
      <el-card>
        <!-- 工具栏 -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <span class="total-count">共 {{ totalCount }} 条记录</span>
          </div>
          <div class="toolbar-right">
            <el-button @click="exportApplications">
              <el-icon><Download /></el-icon>
              导出列表
            </el-button>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="applicationList"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="id" label="采购单编号" width="120">
            <template #default="{ row }">
              <el-link type="primary" @click="viewApplicationDetail(row)">
                {{ row.id }}
              </el-link>
            </template>
          </el-table-column>
          
          <el-table-column prop="merchant_name" label="申请商家" width="120" />
          
          <el-table-column label="采购类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'existing' ? 'success' : 'warning'" size="small">
                {{ row.type === 'existing' ? '系统商品' : '另外采购' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="商品信息" min-width="250">
            <template #default="{ row }">
              <div class="product-info">
                <img :src="row.product_image" alt="商品图片" class="product-image" />
                <div class="product-details">
                  <div class="product-name">{{ row.product_name }}</div>
                  <div class="product-url" v-if="row.product_url">
                    {{ row.product_url.length > 50 ? row.product_url.substring(0, 50) + '...' : row.product_url }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="target_country" label="目标国家/地区" width="120" />
          
          <el-table-column prop="target_price" label="目标售价" width="100">
            <template #default="{ row }">
              ${{ row.target_price }}
            </template>
          </el-table-column>
          
          <el-table-column prop="daily_orders" label="预估日单量" width="100" />
          
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="申请时间" width="120" />
          
          <el-table-column prop="final_quote" label="最终报价" width="100">
            <template #default="{ row }">
              <span v-if="row.final_quote">${{ row.final_quote }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewApplicationDetail(row)">查看详情</el-button>
              <el-button 
                v-if="row.status === 'pending'" 
                size="small" 
                type="primary"
                @click="auditApplication(row)"
              >
                审核
              </el-button>
              <el-button 
                v-if="row.status === 'quotation_pending'" 
                size="small" 
                type="warning"
                @click="uploadQuote(row)"
              >
                报价
              </el-button>
              <el-button 
                v-if="row.status === 'quotation_processing'" 
                size="small" 
                type="success"
                @click="completeQuote(row)"
              >
                完成报价
              </el-button>
              <el-button 
                v-if="row.status === 'quotation_success'" 
                size="small" 
                type="primary"
                @click="createPurchaseOrder(row)"
              >
                创建订单
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                @click="deleteApplication(row)"
              >
                删除
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
    </div>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="采购申请审核"
      width="600px"
    >
      <div class="audit-dialog">
        <div class="application-summary">
          <h4>申请基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请商家">{{ currentApplication?.merchant_name }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ currentApplication?.product_name }}</el-descriptions-item>
            <el-descriptions-item label="目标售价">${{ currentApplication?.target_price }}</el-descriptions-item>
            <el-descriptions-item label="预估日单量">{{ currentApplication?.daily_orders }}</el-descriptions-item>
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
      title="采购报价"
      width="600px"
    >
      <div class="quote-dialog">
        <div class="application-summary">
          <h4>申请基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请商家">{{ currentApplication?.merchant_name }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ currentApplication?.product_name }}</el-descriptions-item>
            <el-descriptions-item label="目标售价">${{ currentApplication?.target_price }}</el-descriptions-item>
            <el-descriptions-item label="预估日单量">{{ currentApplication?.daily_orders }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
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
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
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
      title="报价完成"
      width="600px"
    >
      <div class="complete-quote-dialog">
        <div class="application-summary">
          <h4>申请基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请商家">{{ currentApplication?.merchant_name }}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{ currentApplication?.product_name }}</el-descriptions-item>
            <el-descriptions-item label="目标售价">${{ currentApplication?.target_price }}</el-descriptions-item>
            <el-descriptions-item label="预估日单量">{{ currentApplication?.daily_orders }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="complete-form">
          <el-form :model="completeForm" label-width="100px">
            <el-form-item label="报价结果" required>
              <el-radio-group v-model="completeForm.result">
                <el-radio label="success">成功</el-radio>
                <el-radio label="failed">失败</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item 
              v-if="completeForm.result === 'success'" 
              label="最终报价金额"
              required
            >
              <el-input-number
                v-model="completeForm.finalPrice"
                :precision="2"
                :step="0.01"
                :min="0"
                controls-position="right"
                placeholder="请输入最终报价"
                style="width: 200px"
              />
              <span style="margin-left: 10px">美元</span>
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

    <!-- 创建采购订单弹窗 -->
    <el-dialog
      v-model="createOrderDialogVisible"
      title="创建采购订单"
      width="800px"
    >
      <div class="create-order-dialog">
        <el-form :model="orderForm" label-width="120px">
          <el-form-item label="选择客户" required>
            <el-select 
              v-model="orderForm.customer" 
              placeholder="请选择客户" 
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="customer in customerList"
                :key="customer.id"
                :label="`${customer.name} (${customer.email})`"
                :value="customer.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="订单项">
            <div class="order-items">
              <div v-for="(item, index) in orderForm.items" :key="index" class="order-item">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-select v-model="item.product" placeholder="选择商品" style="width: 100%" filterable>
                      <el-option
                        v-for="product in productList.slice(0, 20)"
                        :key="product.id"
                        :label="product.name"
                        :value="product.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="4">
                    <el-input-number v-model="item.quantity" :min="1" placeholder="数量" style="width: 100%" />
                  </el-col>
                  <el-col :span="5">
                    <el-input-number v-model="item.price" :precision="2" :step="0.01" placeholder="单价" style="width: 100%" />
                  </el-col>
                  <el-col :span="5">
                    <el-input :value="(item.quantity || 0) * (item.price || 0)" placeholder="小计" readonly style="width: 100%" />
                  </el-col>
                  <el-col :span="2">
                    <el-button type="danger" size="small" @click="removeOrderItem(index)">删除</el-button>
                  </el-col>
                </el-row>
              </div>
              <el-button type="primary" size="small" @click="addOrderItem">添加商品</el-button>
            </div>
          </el-form-item>
          
          <el-form-item label="运费金额">
            <el-input-number
              v-model="orderForm.shipping_fee"
              :precision="2"
              :step="0.01"
              :min="0"
              controls-position="right"
              style="width: 200px"
            />
            <span style="margin-left: 10px">美元</span>
          </el-form-item>
          
          <el-form-item label="收货信息">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-input v-model="orderForm.receiver_name" placeholder="收货人姓名" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="orderForm.receiver_phone" placeholder="联系电话" />
              </el-col>
            </el-row>
            <el-input 
              v-model="orderForm.address" 
              type="textarea" 
              :rows="2" 
              placeholder="详细地址" 
              style="margin-top: 10px"
            />
          </el-form-item>
          
          <el-form-item label="备注信息">
            <el-input
              v-model="orderForm.remark"
              type="textarea"
              :rows="3"
              placeholder="订单备注信息"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createOrderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateOrder">创建订单</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Download,
  UploadFilled
} from '@element-plus/icons-vue'
import { purchaseApplications, quoters, customers, products } from '@/data/mockData.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const selectedApplications = ref([])

// 弹窗控制
const auditDialogVisible = ref(false)
const quoteDialogVisible = ref(false)
const completeQuoteDialogVisible = ref(false)
const createOrderDialogVisible = ref(false)

// 当前操作的申请
const currentApplication = ref(null)

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
  finalPrice: null,
  failReason: ''
})

const orderForm = reactive({
  customer: '',
  items: [{ product: '', quantity: 1, price: 0 }],
  shipping_fee: 0,
  receiver_name: '',
  receiver_phone: '',
  address: '',
  remark: ''
})

// 数据
const applicationList = ref([...purchaseApplications])
const customerList = ref([...customers])
const quoterList = ref([...quoters])
const productList = ref([...products])

// 计算属性
const filteredApplications = computed(() => {
  return applicationList.value.filter(app => {
    if (searchQuery.value && !app.merchant_name.includes(searchQuery.value) && !app.product_name.includes(searchQuery.value)) {
      return false
    }
    if (filterStatus.value && app.status !== filterStatus.value) {
      return false
    }
    if (filterType.value && app.type !== filterType.value) {
      return false
    }
    return true
  })
})

// 状态类型映射
const getStatusType = (status) => {
  const statusTypes = {
    'pending': 'warning',
    'quotation_pending': 'info',
    'quotation_processing': 'primary',
    'quotation_success': 'success',
    'quotation_failed': 'danger',
    'rejected': 'danger'
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
    'quotation_failed': '报价失败',
    'rejected': '已拒绝'
  }
  return statusTexts[status] || '未知状态'
}

// 方法
const handleSearch = () => {
  currentPage.value = 1
  // 这里应该调用API进行搜索
  console.log('搜索参数:', {
    query: searchQuery.value,
    status: filterStatus.value,
    type: filterType.value,
    dateRange: dateRange.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterType.value = ''
  dateRange.value = []
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedApplications.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  handleSearch()
}

const viewApplicationDetail = (application) => {
  // 跳转到详情页面
  router.push(`/admin/purchase-applications/${application.id}`)
}

const auditApplication = (application) => {
  currentApplication.value = application
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
  const application = applicationList.value.find(app => app.id === currentApplication.value.id)
  if (application) {
    if (auditForm.result === 'approve') {
      application.status = 'quotation_pending'
      application.processor = '管理员'
      application.processed_at = new Date().toLocaleString()
      // 设置报价人员
      const quoter = quoterList.value.find(q => q.id === auditForm.quoter)
      if (quoter) {
        application.quoter_id = quoter.id
        application.quoter = quoter.name
      }
      ElMessage.success('审核通过，已进入待报价状态')
    } else {
      application.status = 'rejected'
      application.processor = '管理员'
      application.processed_at = new Date().toLocaleString()
      application.reject_reason = auditForm.remark
      ElMessage.success('已拒绝申请')
    }
  }
  
  auditDialogVisible.value = false
}

const uploadQuote = (application) => {
  currentApplication.value = application
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
  const application = applicationList.value.find(app => app.id === currentApplication.value.id)
  if (application) {
    application.status = 'quotation_processing'
    application.quote_document = quoteForm.fileList[0].name
    application.quote_remark = quoteForm.remark
    application.quoted_at = new Date().toLocaleString()
    ElMessage.success('报价单已上传，进入报价中状态')
  }
  
  quoteDialogVisible.value = false
}

const completeQuote = (application) => {
  currentApplication.value = application
  completeForm.result = 'success'
  completeForm.finalPrice = null
  completeForm.failReason = ''
  completeQuoteDialogVisible.value = true
}

const confirmCompleteQuote = () => {
  if (completeForm.result === 'success' && !completeForm.finalPrice) {
    ElMessage.error('请输入最终报价金额')
    return
  }
  
  if (completeForm.result === 'failed' && !completeForm.failReason.trim()) {
    ElMessage.error('请输入失败原因')
    return
  }
  
  // 更新申请状态
  const application = applicationList.value.find(app => app.id === currentApplication.value.id)
  if (application) {
    if (completeForm.result === 'success') {
      application.status = 'quotation_success'
      application.final_quote = completeForm.finalPrice
      ElMessage.success('报价完成，可以创建采购订单')
    } else {
      application.status = 'quotation_failed'
      application.reject_reason = completeForm.failReason
      ElMessage.success('已标记为报价失败')
    }
  }
  
  completeQuoteDialogVisible.value = false
}

const createPurchaseOrder = (application) => {
  currentApplication.value = application
  // 重置表单
  orderForm.customer = ''
  orderForm.items = [{ product: '', quantity: 1, price: 0 }]
  orderForm.shipping_fee = 0
  orderForm.receiver_name = ''
  orderForm.receiver_phone = ''
  orderForm.address = ''
  orderForm.remark = ''
  createOrderDialogVisible.value = true
}

const showCreateOrderDialog = () => {
  currentApplication.value = null
  // 重置表单
  orderForm.customer = ''
  orderForm.items = [{ product: '', quantity: 1, price: 0 }]
  orderForm.shipping_fee = 0
  orderForm.receiver_name = ''
  orderForm.receiver_phone = ''
  orderForm.address = ''
  orderForm.remark = ''
  createOrderDialogVisible.value = true
}

const addOrderItem = () => {
  orderForm.items.push({ product: '', quantity: 1, price: 0 })
}

const removeOrderItem = (index) => {
  if (orderForm.items.length > 1) {
    orderForm.items.splice(index, 1)
  }
}

const confirmCreateOrder = () => {
  if (!orderForm.customer) {
    ElMessage.error('请选择客户')
    return
  }

  const hasValidItems = orderForm.items.some(item => item.product && item.quantity > 0 && item.price > 0)
  if (!hasValidItems) {
    ElMessage.error('请至少添加一个有效的订单项')
    return
  }

  if (!orderForm.receiver_name || !orderForm.receiver_phone || !orderForm.address) {
    ElMessage.error('请填写完整的收货信息')
    return
  }

  // 创建新的采购订单
  const customer = customerList.value.find(c => c.id === orderForm.customer)
  const subtotal = orderForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const totalAmount = subtotal + orderForm.shipping_fee

  const newOrder = {
    id: `PO${Date.now()}`,
    application_id: currentApplication.value?.id || null,
    customer_id: orderForm.customer,
    customer_name: customer.name,
    status: 'pending_payment',
    payment_status: 'pending',
    shipping_status: 'pending',
    items: orderForm.items.map((item, index) => ({
      id: index + 1,
      product_name: item.product,
      product_image: 'https://picsum.photos/400/400?random=' + (1000 + index),
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.quantity * item.price
    })),
    subtotal: subtotal,
    shipping_fee: orderForm.shipping_fee,
    total_amount: totalAmount,
    currency: 'USD',
    exchange_rate: 1.0,
    usd_amount: totalAmount,
    receiver_name: orderForm.receiver_name,
    receiver_phone: orderForm.receiver_phone,
    receiver_address: orderForm.address,
    tracking_number: null,
    shipping_company: null,
    shipped_at: null,
    estimated_delivery: null,
    remark: orderForm.remark,
    created_at: new Date().toLocaleString(),
    paid_at: null
  }

  // 这里应该调用API保存订单，现在先模拟成功
  ElMessage.success('采购订单创建成功')
  createOrderDialogVisible.value = false

  // 跳转到采购订单管理页面
  router.push('/admin/purchase-orders')
}

const deleteApplication = (application) => {
  ElMessageBox.confirm(
    `确定要删除采购申请 ${application.id} 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = applicationList.value.findIndex(app => app.id === application.id)
    if (index > -1) {
      applicationList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const exportApplications = () => {
  ElMessage.success('导出功能开发中...')
}

// 生命周期
onMounted(() => {
  totalCount.value = applicationList.value.length
})
</script>

<style scoped>
.purchase-applications {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.search-filter {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  white-space: nowrap;
  color: #606266;
  font-size: 14px;
}

.filter-actions {
  margin-left: auto;
}

.table-container {
  background: white;
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

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-url {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.audit-dialog,
.quote-dialog,
.complete-quote-dialog,
.create-order-dialog {
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

.order-items {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background: #fafafa;
}

.order-item {
  margin-bottom: 15px;
}

.order-item:last-child {
  margin-bottom: 0;
}
</style> 