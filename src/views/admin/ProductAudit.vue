<template>
  <div class="product-audit-container">
    <a-card class="audit-card" title="商品审核管理" :bordered="false">
      <template #extra>
        <a-button @click="initData" :loading="loading">
          <template #icon><ReloadOutlined /></template>
          刷新数据
        </a-button>
      </template>
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <a-row :gutter="16" style="margin-bottom: 24px;">
          <a-col :span="6">
            <a-card size="small">
              <a-statistic
                title="待审核"
                :value="auditStats.pending"
                :value-style="{ color: '#faad14' }"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic
                title="今日已审核"
                :value="auditStats.todayAudited"
                :value-style="{ color: '#52c41a' }"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic
                title="本月通过"
                :value="auditStats.monthlyApproved"
                :value-style="{ color: '#1890ff' }"
              />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card size="small">
              <a-statistic
                title="本月拒绝"
                :value="auditStats.monthlyRejected"
                :value-style="{ color: '#f5222d' }"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <a-form layout="inline" style="margin-bottom: 16px;">
          <a-form-item label="审核状态">
            <a-select
              v-model:value="filters.status"
              placeholder="请选择状态"
              style="width: 150px;"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option value="pending">待审核</a-select-option>
              <a-select-option value="approved">已通过</a-select-option>
              <a-select-option value="rejected">已拒绝</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="商品分类">
            <a-select
              v-model:value="filters.categoryId"
              placeholder="请选择分类"
              style="width: 150px;"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="供应商">
            <a-select
              v-model:value="filters.supplierId"
              placeholder="请选择供应商"
              style="width: 150px;"
              allow-clear
              @change="handleSearch"
            >
              <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="提交时间">
            <a-range-picker
              v-model:value="filters.dateRange"
              @change="handleSearch"
              style="width: 240px;"
            />
          </a-form-item>
          
          <a-form-item>
            <a-input-search
              v-model:value="filters.keyword"
              placeholder="搜索商品名称或编号"
              style="width: 200px;"
              @search="handleSearch"
              allow-clear
            />
          </a-form-item>
        </a-form>
      </div>

      <!-- 批量操作 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-operations">
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 个商品`"
          type="info"
          show-icon
          style="margin-bottom: 16px;"
        >
          <template #action>
            <a-space>
              <a-button type="primary" @click="batchApprove">
                <template #icon><CheckOutlined /></template>
                批量通过
              </a-button>
              <a-button danger @click="batchReject">
                <template #icon><CloseOutlined /></template>
                批量拒绝
              </a-button>
            </a-space>
          </template>
        </a-alert>
      </div>

      <!-- 商品列表 -->
      <a-table
        :columns="columns"
        :data-source="productList"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
          getCheckboxProps: (record) => ({
            disabled: record.status !== 'pending'
          })
        }"
        @change="handleTableChange"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 商品图片列 -->
          <template v-if="column.key === 'image'">
            <a-image
              :width="50"
              :height="50"
              :src="record.images?.[0]"
              :preview="false"
              style="border-radius: 4px;"
            />
          </template>

          <!-- 商品名称列 -->
          <template v-if="column.key === 'name'">
            <div class="product-name">{{ record.name }}</div>
          </template>

          <!-- 商品编码列 -->
          <template v-if="column.key === 'code'">
            <span class="product-code">{{ record.code }}</span>
          </template>

          <!-- 价格列 -->
          <template v-if="column.key === 'price'">
            <span class="product-price">${{ record.price?.toFixed(2) }}</span>
          </template>

          <!-- 分类列 -->
          <template v-if="column.key === 'category'">
            <a-tag color="blue">{{ record.categoryName }}</a-tag>
          </template>

          <!-- 供应商列 -->
          <template v-if="column.key === 'supplier'">
            {{ record.supplierName }}
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 提交时间列 -->
          <template v-if="column.key === 'submitTime'">
            {{ formatDate(record.submitTime) }}
          </template>

          <!-- 审核信息列 -->
          <template v-if="column.key === 'auditInfo'">
            <div v-if="record.auditInfo">
              <div>{{ record.auditInfo.auditor }}</div>
              <div class="audit-time">{{ formatDate(record.auditInfo.auditTime) }}</div>
            </div>
            <span v-else class="text-muted">-</span>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a @click="viewProduct(record)">查看详情</a>
              <a-divider type="vertical" />
              <template v-if="record.status === 'pending'">
                <a @click="approveProduct(record)" style="color: #52c41a;">通过</a>
                <a-divider type="vertical" />
                <a @click="rejectProduct(record)" style="color: #f5222d;">拒绝</a>
              </template>
              <template v-else>
                <a @click="viewAuditHistory(record)">审核历史</a>
              </template>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:visible="auditModalVisible"
      :title="auditForm.type === 'approve' ? '审核通过' : '审核拒绝'"
      @ok="handleAudit"
      @cancel="cancelAudit"
      width="600px"
    >
      <a-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="商品信息">
          <div class="audit-product-info">
            <a-image
              :width="80"
              :height="80"
              :src="auditForm.product?.images?.[0]"
              :preview="false"
              style="border-radius: 4px; margin-right: 12px;"
            />
            <div>
              <div class="product-name">{{ auditForm.product?.name }}</div>
              <div class="product-code">{{ auditForm.product?.code }}</div>
              <div class="product-price">${{ auditForm.product?.price?.toFixed(2) }}</div>
            </div>
          </div>
        </a-form-item>
        
        <a-form-item label="审核结果">
          <a-tag :color="auditForm.type === 'approve' ? 'green' : 'red'">
            {{ auditForm.type === 'approve' ? '审核通过' : '审核拒绝' }}
          </a-tag>
        </a-form-item>
        
        <a-form-item 
          label="审核备注" 
          name="remark"
          :rules="auditForm.type === 'reject' ? [{ required: true, message: '拒绝时必须填写原因' }] : []"
        >
          <a-textarea
            v-model:value="auditForm.remark"
            :placeholder="auditForm.type === 'approve' ? '请填写审核通过的备注（可选）' : '请填写拒绝原因（必填）'"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量审核弹窗 -->
    <a-modal
      v-model:visible="batchAuditModalVisible"
      :title="batchAuditForm.type === 'approve' ? '批量审核通过' : '批量审核拒绝'"
      @ok="handleBatchAudit"
      @cancel="cancelBatchAudit"
      width="600px"
    >
      <a-form
        ref="batchAuditFormRef"
        :model="batchAuditForm"
        :rules="batchAuditRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="选中商品">
          <div class="batch-products">
            <a-tag v-for="id in selectedRowKeys" :key="id" style="margin-bottom: 8px;">
              {{ getProductById(id)?.name }}
            </a-tag>
          </div>
          <div class="batch-count">共 {{ selectedRowKeys.length }} 个商品</div>
        </a-form-item>
        
        <a-form-item label="审核结果">
          <a-tag :color="batchAuditForm.type === 'approve' ? 'green' : 'red'">
            {{ batchAuditForm.type === 'approve' ? '批量审核通过' : '批量审核拒绝' }}
          </a-tag>
        </a-form-item>
        
        <a-form-item 
          label="审核备注" 
          name="remark"
          :rules="batchAuditForm.type === 'reject' ? [{ required: true, message: '批量拒绝时必须填写原因' }] : []"
        >
          <a-textarea
            v-model:value="batchAuditForm.remark"
            :placeholder="batchAuditForm.type === 'approve' ? '请填写批量审核通过的备注（可选）' : '请填写批量拒绝原因（必填）'"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 审核历史弹窗 -->
    <a-modal
      v-model:visible="historyModalVisible"
      title="审核历史"
      :footer="null"
      width="800px"
    >
      <div class="audit-history">
        <a-timeline>
          <a-timeline-item
            v-for="(history, index) in auditHistory"
            :key="index"
            :color="getHistoryColor(history.result)"
          >
            <template #dot>
              <CheckCircleOutlined v-if="history.result === 'approved'" style="color: #52c41a;" />
              <CloseCircleOutlined v-else-if="history.result === 'rejected'" style="color: #f5222d;" />
              <ClockCircleOutlined v-else style="color: #faad14;" />
            </template>
            <div class="history-item">
              <div class="history-header">
                <span class="history-result">{{ getHistoryResultText(history.result) }}</span>
                <span class="history-time">{{ formatDate(history.auditTime) }}</span>
              </div>
              <div class="history-auditor">审核人：{{ history.auditor }}</div>
              <div v-if="history.remark" class="history-remark">备注：{{ history.remark }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { products as mockProducts, categories as mockCategories, suppliers as mockSuppliers } from '@/data/mockData'

const router = useRouter()
const loading = ref(false)
const auditModalVisible = ref(false)
const batchAuditModalVisible = ref(false)
const historyModalVisible = ref(false)
const selectedRowKeys = ref([])
const auditFormRef = ref()
const batchAuditFormRef = ref()

// 筛选条件
const filters = reactive({
  status: '',
  categoryId: '',
  supplierId: '',
  dateRange: [],
  keyword: ''
})

// 审核表单
const auditForm = reactive({
  product: null,
  type: 'approve',
  remark: ''
})

// 批量审核表单
const batchAuditForm = reactive({
  type: 'approve',
  remark: ''
})

// 商品列表
const productList = ref([])
const categories = ref([])
const suppliers = ref([])
const auditHistory = ref([])

// 审核统计
const auditStats = ref({
  pending: 0,
  todayAudited: 0,
  monthlyApproved: 0,
  monthlyRejected: 0
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 表单验证规则
const auditRules = {
  remark: [
    { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
  ]
}

const batchAuditRules = {
  remark: [
    { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
  ]
}

// 表格列配置
const columns = [
  {
    title: '商品图片',
    key: 'image',
    width: 80,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '商品名称',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '商品编码',
    key: 'code',
    width: 120
  },
  {
    title: '价格($)',
    key: 'price',
    width: 100,
    align: 'right'
  },
  {
    title: '分类',
    key: 'category',
    width: 120
  },
  {
    title: '供应商',
    key: 'supplier',
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '提交时间',
    key: 'submitTime',
    width: 150
  },
  {
    title: '审核信息',
    key: 'auditInfo',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right'
  }
]

// 初始化数据
const initData = async () => {
  loading.value = true
  console.log('初始化审核数据...')
  console.log('mockProducts数量:', mockProducts.length)
  
  try {
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 验证数据
    if (!mockProducts || mockProducts.length === 0) {
      throw new Error('商品数据为空')
    }
    
    if (!mockCategories || mockCategories.length === 0) {
      throw new Error('分类数据为空')
    }
    
    if (!mockSuppliers || mockSuppliers.length === 0) {
      throw new Error('供应商数据为空')
    }
  
    // 处理商品数据，添加审核相关字段
  const processedProducts = mockProducts.map((product, index) => {
    // 确保有足够的待审核商品
    let status
    if (index < 15) {
      status = 'pending' // 前15个设为待审核
    } else if (index < 35) {
      status = 'approved' // 中间20个设为已通过
    } else {
      status = 'rejected' // 其余设为已拒绝
    }
    
    // 生成提交时间（最近30天内）
    const submitTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    
    // 生成审核信息
    let auditInfo = null
    if (status !== 'pending') {
      const auditors = ['张管理员', '李审核员', '王主管', '赵经理', '陈总监']
      const approvedRemarks = [
        '商品信息完整，符合上架要求',
        '产品质量良好，价格合理',
        '供应商资质齐全，审核通过',
        '商品描述详细，图片清晰',
        '符合平台规范，同意上架'
      ]
      const rejectedRemarks = [
        '商品描述不够详细，请补充产品特性',
        '商品图片质量不佳，需要重新上传',
        '价格设置不合理，请重新调整',
        '商品分类错误，请重新选择',
        '供应商信息需要进一步验证',
        '商品标题不规范，请修改',
        '缺少必要的产品认证信息'
      ]
      
      auditInfo = {
        auditor: auditors[Math.floor(Math.random() * auditors.length)],
        auditTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        result: status,
        remark: status === 'approved' 
          ? approvedRemarks[Math.floor(Math.random() * approvedRemarks.length)]
          : rejectedRemarks[Math.floor(Math.random() * rejectedRemarks.length)]
      }
    }
    
    return {
      ...product,
      status,
      submitTime,
      auditInfo
    }
  })

  productList.value = processedProducts
  categories.value = mockCategories
  suppliers.value = mockSuppliers
  
  // 设置分页总数
  pagination.total = processedProducts.length

    console.log('处理后的商品数量:', processedProducts.length)
    console.log('待审核商品:', processedProducts.filter(p => p.status === 'pending').length)
    
    // 计算统计数据
    updateStats()
    
  } catch (error) {
    console.error('数据初始化失败:', error)
    message.error('数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const today = new Date().toDateString()
  const thisMonth = new Date().getMonth()
  
  auditStats.value = {
    pending: productList.value.filter(p => p.status === 'pending').length,
    todayAudited: productList.value.filter(p => 
      p.auditInfo && new Date(p.auditInfo.auditTime).toDateString() === today
    ).length,
    monthlyApproved: productList.value.filter(p => 
      p.status === 'approved' && 
      p.auditInfo && 
      new Date(p.auditInfo.auditTime).getMonth() === thisMonth
    ).length,
    monthlyRejected: productList.value.filter(p => 
      p.status === 'rejected' && 
      p.auditInfo && 
      new Date(p.auditInfo.auditTime).getMonth() === thisMonth
    ).length
  }
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || '未知'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取历史记录颜色
const getHistoryColor = (result) => {
  const colors = {
    approved: 'green',
    rejected: 'red',
    pending: 'orange'
  }
  return colors[result] || 'default'
}

// 获取历史记录结果文本
const getHistoryResultText = (result) => {
  const texts = {
    approved: '审核通过',
    rejected: '审核拒绝',
    pending: '提交审核'
  }
  return texts[result] || '未知'
}

// 根据ID获取商品
const getProductById = (id) => {
  return productList.value.find(p => p.id === id)
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索条件:', filters)
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

// 选择变化处理
const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys
}

// 查看商品详情
const viewProduct = (record) => {
  router.push(`/admin/products/${record.id}`)
}

// 审核通过
const approveProduct = (record) => {
  auditForm.product = record
  auditForm.type = 'approve'
  auditForm.remark = ''
  auditModalVisible.value = true
}

// 审核拒绝
const rejectProduct = (record) => {
  auditForm.product = record
  auditForm.type = 'reject'
  auditForm.remark = ''
  auditModalVisible.value = true
}

// 处理审核
const handleAudit = async () => {
  try {
    await auditFormRef.value.validate()
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const product = productList.value.find(p => p.id === auditForm.product.id)
    if (product) {
      product.status = auditForm.type === 'approve' ? 'approved' : 'rejected'
      product.auditInfo = {
        auditor: '当前管理员',
        auditTime: new Date().toISOString(),
        result: auditForm.type === 'approve' ? 'approved' : 'rejected',
        remark: auditForm.remark
      }
    }
    
    message.success(`商品审核${auditForm.type === 'approve' ? '通过' : '拒绝'}成功`)
    auditModalVisible.value = false
    updateStats()
    
  } catch (error) {
    console.error('审核失败:', error)
  }
}

// 取消审核
const cancelAudit = () => {
  auditForm.product = null
  auditForm.type = 'approve'
  auditForm.remark = ''
  auditModalVisible.value = false
}

// 批量审核通过
const batchApprove = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要审核的商品')
    return
  }
  batchAuditForm.type = 'approve'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = true
}

// 批量审核拒绝
const batchReject = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要审核的商品')
    return
  }
  batchAuditForm.type = 'reject'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = true
}

// 处理批量审核
const handleBatchAudit = async () => {
  try {
    await batchAuditFormRef.value.validate()
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    selectedRowKeys.value.forEach(id => {
      const product = productList.value.find(p => p.id === id)
      if (product) {
        product.status = batchAuditForm.type === 'approve' ? 'approved' : 'rejected'
        product.auditInfo = {
          auditor: '当前管理员',
          auditTime: new Date().toISOString(),
          result: batchAuditForm.type === 'approve' ? 'approved' : 'rejected',
          remark: batchAuditForm.remark
        }
      }
    })
    
    message.success(`批量审核${batchAuditForm.type === 'approve' ? '通过' : '拒绝'} ${selectedRowKeys.value.length} 个商品成功`)
    batchAuditModalVisible.value = false
    selectedRowKeys.value = []
    updateStats()
    
  } catch (error) {
    console.error('批量审核失败:', error)
  }
}

// 取消批量审核
const cancelBatchAudit = () => {
  batchAuditForm.type = 'approve'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = false
}

// 查看审核历史
const viewAuditHistory = (record) => {
  auditHistory.value = [
    {
      result: 'pending',
      auditor: '系统',
      auditTime: record.submitTime,
      remark: '商品提交审核'
    }
  ]
  
  if (record.auditInfo) {
    auditHistory.value.push({
      result: record.auditInfo.result,
      auditor: record.auditInfo.auditor,
      auditTime: record.auditInfo.auditTime,
      remark: record.auditInfo.remark
    })
  }
  
  historyModalVisible.value = true
}

onMounted(() => {
  console.log('组件挂载，开始初始化数据')
  initData()
  console.log('数据初始化完成')
})
</script>

<style scoped lang="scss">
.product-audit-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.audit-card {
  .stats-cards {
    .ant-card {
      text-align: center;
    }
  }
  
  .filter-section {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  
  .batch-operations {
    margin-bottom: 16px;
  }
}

.product-name {
  font-weight: 500;
  color: #333;
}

.product-code {
  color: #666;
  font-size: 12px;
}

.product-price {
  color: #f5222d;
  font-weight: 500;
}

.audit-product-info {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  
  .product-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .product-code {
    color: #666;
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .product-price {
    color: #f5222d;
    font-weight: 500;
  }
}

.batch-products {
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.batch-count {
  color: #666;
  font-size: 12px;
}

.audit-history {
  .history-item {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .history-result {
        font-weight: 500;
      }
      
      .history-time {
        color: #666;
        font-size: 12px;
      }
    }
    
    .history-auditor {
      color: #666;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .history-remark {
      color: #333;
      font-size: 13px;
      background: #f6f6f6;
      padding: 8px;
      border-radius: 4px;
    }
  }
}

.audit-time {
  color: #666;
  font-size: 12px;
}

.text-muted {
  color: #999;
}
</style> 