<template>
  <div class="products-container">
    <a-card class="products-card" title="商品管理" :bordered="false">
      <!-- 操作按钮区域 -->
      <template #extra>
        <a-space>
          <a-button type="primary" @click="createProduct">
            <template #icon><PlusOutlined /></template>
            新增商品
          </a-button>
          <a-button @click="goToRanking">
            <template #icon><TrophyOutlined /></template>
            销量排名
          </a-button>
        </a-space>
      </template>

      <!-- 搜索和筛选区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="商品搜索">
                <a-input 
                  v-model:value="queryParam.keyword" 
                  placeholder="商品名称/编号/SKU" 
                  allow-clear 
                  @press-enter="handleSearch"
                />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品分类">
                <a-select 
                  v-model:value="queryParam.categoryId" 
                  placeholder="请选择分类" 
                  allow-clear 
                  style="width: 100%"
                >
                  <a-select-option value="">全部分类</a-select-option>
                  <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商品状态">
                <a-select 
                  v-model:value="queryParam.status" 
                  placeholder="请选择状态" 
                  allow-clear 
                  style="width: 100%"
                >
                  <a-select-option value="">全部状态</a-select-option>
                  <a-select-option value="pending">审核中</a-select-option>
                  <a-select-option value="draft">待发布</a-select-option>
                  <a-select-option value="published">已上架</a-select-option>
                  <a-select-option value="rejected">审核不通过</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="供应商">
                <a-select 
                  v-model:value="queryParam.supplierId" 
                  placeholder="请选择供应商" 
                  allow-clear 
                  style="width: 100%"
                >
                  <a-select-option value="">全部供应商</a-select-option>
                  <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="价格区间">
                <a-input-group compact>
                  <a-input 
                    v-model:value="queryParam.minPrice" 
                    placeholder="最低价" 
                    style="width: 50%" 
                    type="number"
                    prefix="$"
                  />
                  <a-input 
                    v-model:value="queryParam.maxPrice" 
                    placeholder="最高价" 
                    style="width: 50%" 
                    type="number"
                    prefix="$"
                  />
                </a-input-group>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="创建时间">
                <a-range-picker v-model:value="queryParam.dateRange" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
                <a-button type="default" style="margin-left: 8px" @click="exportData">
                  <template #icon><DownloadOutlined /></template>
                  导出Excel
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- 批量操作区域 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-operation-bar">
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 个商品`"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        >
          <template #action>
            <a-space>
              <a-button size="small" @click="batchApprove">批量审核</a-button>
              <a-button size="small" danger @click="batchDelete">批量删除</a-button>
            </a-space>
          </template>
        </a-alert>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :row-key="record => record.id"
        :data-source="productList"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
          getCheckboxProps: record => ({
            disabled: record.status === 'published'
          })
        }"
        @change="handleTableChange"
        :scroll="{ x: 1800 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 商品图片列 -->
          <template v-if="column.key === 'image'">
            <a-image
              :width="50"
              :height="50"
              :src="record.image"
              :preview="true"
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAxNUMzNy41IDE1IDQyIDIwIDQyIDI1QzQyIDMwIDM3LjUgMzUgMjUgMzVDMTIuNSAzNSA3IDMwIDcgMjVDNyAyMCAxMi41IDE1IDI1IDE1WiIgZmlsbD0iI0JGQkZCRiIvPgo8L3N2Zz4K"
              class="product-image"
            />
          </template>

          <!-- 商品名称列 -->
          <template v-if="column.key === 'name'">
            <div>
              <a @click="viewProduct(record)" style="font-weight: 500;">{{ record.name }}</a>
            </div>
          </template>

          <!-- 商品编号列 -->
          <template v-if="column.key === 'code'">
            <a-typography-text copyable>{{ record.code }}</a-typography-text>
          </template>

          <!-- 商品价格列 -->
          <template v-if="column.key === 'price'">
            ${{ record.price?.toFixed(2) || '0.00' }}
          </template>

          <!-- 建议售价列 -->
          <template v-if="column.key === 'suggestedPrice'">
            ${{ record.suggestedPrice?.toFixed(2) || '0.00' }}
          </template>

          <!-- 采购成本列 -->
          <template v-if="column.key === 'cost'">
            ${{ record.cost?.toFixed(2) || '0.00' }}
          </template>

          <!-- 商品状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 库存列 -->
          <template v-if="column.key === 'stock'">
            <span :class="{ 'low-stock': record.stock < 10 }">
              {{ record.stock }}
            </span>
          </template>

          <!-- 销量列 -->
          <template v-if="column.key === 'totalSales'">
            {{ record.totalSales || 0 }}
          </template>

          <!-- 创建时间列 -->
          <template v-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a @click="viewProduct(record)">查看详情</a>
              <a-divider type="vertical" />
              <a @click="editProduct(record)">编辑</a>
              <a-divider type="vertical" />
              <a-dropdown>
                <a @click.prevent>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="record.status === 'pending'" @click="auditProduct(record, 'approve')">
                      <CheckOutlined /> 审核通过
                    </a-menu-item>
                    <a-menu-item v-if="record.status === 'pending'" @click="auditProduct(record, 'reject')">
                      <CloseOutlined /> 审核不通过
                    </a-menu-item>
                    <a-menu-item @click="copyProduct(record)">
                      <CopyOutlined /> 复制商品
                    </a-menu-item>
                    <a-menu-item danger @click="deleteProduct(record)">
                      <DeleteOutlined /> 删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 商品审核弹窗 -->
    <a-modal
      v-model:visible="auditModalVisible"
      title="商品审核"
      width="600px"
      @ok="handleAudit"
      @cancel="cancelAudit"
    >
      <div class="audit-content" v-if="auditForm.product">
        <!-- 商品基本信息概要 -->
        <div class="product-preview">
          <a-image
            :width="80"
            :height="80"
            :src="auditForm.product.image"
            :preview="false"
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyNEM1NSAyNCA2MCAzMCA2MCA0MEM2MCA1MCA1NSA1NiA0MCA1NkMyNSA1NiAyMCA1MCAyMCA0MEMyMCAzMCAyNSAyNCA0MCAyNFoiIGZpbGw9IiNCRkJGQkYiLz4KPC9zdmc+Cg=="
          />
          <div style="margin-left: 12px; flex: 1;">
            <div><strong>{{ auditForm.product.name }}</strong></div>
            <div style="color: #666; margin-top: 4px;">编号: {{ auditForm.product.code }}</div>
            <div style="color: #666; margin-top: 4px;">分类: {{ auditForm.product.categoryName }}</div>
            <div style="color: #666; margin-top: 4px;">供应商: {{ auditForm.product.supplierName }}</div>
            <div style="color: #666; margin-top: 4px;">价格: ${{ auditForm.product.price?.toFixed(2) }}</div>
          </div>
        </div>
        
        <!-- 审核操作区域 -->
        <a-form ref="auditFormRef" :model="auditForm" :rules="auditRules" :label-col="{ span: 6 }" style="margin-top: 24px;">
          <a-form-item label="审核结果" name="result">
            <a-radio-group v-model:value="auditForm.result">
              <a-radio value="approved">通过</a-radio>
              <a-radio value="rejected">不通过</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审核备注" name="remark">
            <a-textarea 
              v-model:value="auditForm.remark" 
              :placeholder="auditForm.result === 'rejected' ? '请输入拒绝原因（必填）' : '可填写审核备注（选填）'"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 批量审核弹窗 -->
    <a-modal
      v-model:visible="batchAuditModalVisible"
      title="批量审核"
      width="500px"
      @ok="handleBatchAudit"
      @cancel="cancelBatchAudit"
    >
      <div>
        <p>您确定要批量审核以下 <strong>{{ selectedRowKeys.length }}</strong> 个商品吗？</p>
        <a-form ref="batchAuditFormRef" :model="batchAuditForm" :rules="batchAuditRules" :label-col="{ span: 6 }">
          <a-form-item label="审核结果" name="result">
            <a-radio-group v-model:value="batchAuditForm.result">
              <a-radio value="approved">通过</a-radio>
              <a-radio value="rejected">不通过</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="审核备注" name="remark">
            <a-textarea 
              v-model:value="batchAuditForm.remark" 
              :placeholder="batchAuditForm.result === 'rejected' ? '请输入拒绝原因（必填）' : '可填写审核备注（选填）'"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  PlusOutlined,
  TrophyOutlined,
  DownloadOutlined,
  DownOutlined,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { 
  generateMockProducts, 
  categories as mockCategories, 
  suppliers as mockSuppliers, 
  productStatuses 
} from '@/data/mockData'

const router = useRouter()
const loading = ref(false)
const auditModalVisible = ref(false)
const batchAuditModalVisible = ref(false)
const selectedRowKeys = ref([])

// 搜索参数
const queryParam = reactive({
  keyword: '',
  categoryId: '',
  status: '',
  supplierId: '',
  minPrice: '',
  maxPrice: '',
  dateRange: [],
  pageSize: 10,
  current: 1
})

// 表格分页设置
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
})

// 审核表单
const auditForm = reactive({
  product: null,
  result: 'approved',
  remark: ''
})

// 批量审核表单
const batchAuditForm = reactive({
  result: 'approved',
  remark: ''
})

// 审核表单验证规则
const auditRules = {
  result: [{ required: true, message: '请选择审核结果' }],
  remark: [
    {
      validator: (rule, value) => {
        if (auditForm.result === 'rejected' && !value?.trim()) {
          return Promise.reject('审核不通过时必须填写拒绝原因')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 批量审核表单验证规则
const batchAuditRules = {
  result: [{ required: true, message: '请选择审核结果' }],
  remark: [
    {
      validator: (rule, value) => {
        if (batchAuditForm.result === 'rejected' && !value?.trim()) {
          return Promise.reject('批量审核不通过时必须填写拒绝原因')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 商品列表数据
const productList = ref([])

// 分类列表 - 使用mockData中的数据
const categories = ref(mockCategories.map(cat => ({ id: cat.id, name: cat.name })))

// 供应商列表 - 使用mockData中的数据
const suppliers = ref(mockSuppliers.map(sup => ({ id: sup.id, name: sup.name })))

// 表格列配置 - 按照产品文档要求
const columns = [
  {
    title: '商品图片',
    key: 'image',
    width: 80,
    align: 'center'
  },
  {
    title: '商品名称',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '商品编号',
    key: 'code',
    width: 120
  },
  {
    title: '商品分类',
    dataIndex: 'categoryName',
    key: 'categoryName',
    width: 120
  },
  {
    title: '商品库存',
    key: 'stock',
    width: 100,
    align: 'center'
  },
  {
    title: '商品价格($)',
    key: 'price',
    width: 120,
    align: 'right'
  },
  {
    title: '建议售价($)',
    key: 'suggestedPrice',
    width: 130,
    align: 'right'
  },
  {
    title: '采购成本($)',
    key: 'cost',
    width: 130,
    align: 'right'
  },
  {
    title: '商品状态',
    key: 'status',
    width: 120,
    align: 'center'
  },
  {
    title: '供应商',
    dataIndex: 'supplierName',
    key: 'supplierName',
    width: 150,
    ellipsis: true
  },
  {
    title: '总销量',
    key: 'totalSales',
    width: 100,
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 使用mockData生成商品数据
    const mockProducts = generateMockProducts(100) // 生成100个商品
    
    // 应用筛选条件
    let filteredProducts = mockProducts.filter(product => {
      // 关键词搜索
      if (queryParam.keyword) {
        const keyword = queryParam.keyword.toLowerCase()
        if (!product.name.toLowerCase().includes(keyword) && 
            !product.code.toLowerCase().includes(keyword) && 
            !product.sku.toLowerCase().includes(keyword)) {
          return false
        }
      }
      
      // 分类筛选
      if (queryParam.categoryId && product.categoryId !== queryParam.categoryId) {
        return false
      }
      
      // 状态筛选
      if (queryParam.status && product.status !== queryParam.status) {
        return false
      }
      
      // 供应商筛选
      if (queryParam.supplierId && product.supplierId !== queryParam.supplierId) {
        return false
      }
      
      // 价格范围筛选
      if (queryParam.minPrice && product.price < queryParam.minPrice) {
        return false
      }
      if (queryParam.maxPrice && product.price > queryParam.maxPrice) {
        return false
      }
      
      return true
    })
    
    // 更新分页信息
    pagination.total = filteredProducts.length
    
    // 分页处理
    const startIndex = (pagination.current - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    productList.value = filteredProducts.slice(startIndex, endIndex)
    
  } catch (error) {
    message.error('加载商品数据失败')
    console.error('Load products error:', error)
  } finally {
    loading.value = false
  }
}
    

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'processing',
    draft: 'default',
    published: 'success',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '审核中',
    draft: '待发布',
    published: '已上架',
    rejected: '审核不通过'
  }
  return texts[status] || '未知'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 表格选择变化
const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadProducts()
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadProducts()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    keyword: '',
    categoryId: '',
    status: '',
    supplierId: '',
    minPrice: '',
    maxPrice: '',
    dateRange: [],
    pageSize: 10,
    current: 1
  })
  pagination.current = 1
  loadProducts()
}



// 导出数据
const exportData = () => {
  message.success('导出功能开发中...')
}

// 新增商品
const createProduct = () => {
  router.push('/admin/products/create')
}

// 跳转到销量排名
const goToRanking = () => {
  router.push('/admin/product-ranking')
}

// 查看商品详情
const viewProduct = (record) => {
  router.push(`/admin/products/${record.id}`)
}

// 编辑商品
const editProduct = (record) => {
  router.push(`/admin/products/${record.id}/edit`)
}

// 审核商品
const auditProduct = (record, type) => {
  auditForm.product = record
  auditForm.result = type === 'approve' ? 'approved' : 'rejected'
  auditForm.remark = ''
  auditModalVisible.value = true
}

// 处理审核
const handleAudit = async () => {
  try {
    // 表单验证
    if (auditForm.result === 'rejected' && !auditForm.remark?.trim()) {
      message.error('审核不通过时必须填写拒绝原因')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新商品状态
    const product = productList.value.find(p => p.id === auditForm.product.id)
    if (product) {
      product.status = auditForm.result === 'approved' ? 'published' : 'rejected'
    }
    
    message.success(`商品审核${auditForm.result === 'approved' ? '通过' : '不通过'}`)
    auditModalVisible.value = false
    
  } catch (error) {
    message.error('审核失败，请重试')
  }
}

// 取消审核
const cancelAudit = () => {
  auditForm.product = null
  auditForm.result = 'approved'
  auditForm.remark = ''
  auditModalVisible.value = false
}

// 批量审核
const batchApprove = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要审核的商品')
    return
  }
  batchAuditForm.result = 'approved'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = true
}

// 处理批量审核
const handleBatchAudit = async () => {
  try {
    // 表单验证
    if (batchAuditForm.result === 'rejected' && !batchAuditForm.remark?.trim()) {
      message.error('批量审核不通过时必须填写拒绝原因')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新选中商品的状态
    selectedRowKeys.value.forEach(id => {
      const product = productList.value.find(p => p.id === id)
      if (product) {
        product.status = batchAuditForm.result === 'approved' ? 'published' : 'rejected'
      }
    })
    
    message.success(`批量审核${batchAuditForm.result === 'approved' ? '通过' : '不通过'} ${selectedRowKeys.value.length} 个商品`)
    batchAuditModalVisible.value = false
    selectedRowKeys.value = []
    
  } catch (error) {
    message.error('批量审核失败，请重试')
  }
}

// 取消批量审核
const cancelBatchAudit = () => {
  batchAuditForm.result = 'approved'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = false
}

// 复制商品
const copyProduct = (record) => {
  Modal.confirm({
    title: '确认复制商品',
    content: `确定要复制商品"${record.name}"吗？`,
    onOk: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        message.success('商品复制成功')
        loadProducts()
      } catch (error) {
        message.error('复制失败，请重试')
      }
    }
  })
}

// 删除商品
const deleteProduct = (record) => {
  Modal.confirm({
    title: '确认删除商品',
    content: `确定要删除商品"${record.name}"吗？此操作不可恢复。`,
    okType: 'danger',
    onOk: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        productList.value = productList.value.filter(p => p.id !== record.id)
        message.success('商品删除成功')
      } catch (error) {
        message.error('删除失败，请重试')
      }
    }
  })
}

// 批量删除
const batchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的商品')
    return
  }
  
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个商品吗？此操作不可恢复。`,
    okType: 'danger',
    onOk: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        productList.value = productList.value.filter(p => !selectedRowKeys.value.includes(p.id))
        message.success(`批量删除 ${selectedRowKeys.value.length} 个商品成功`)
        selectedRowKeys.value = []
      } catch (error) {
        message.error('批量删除失败，请重试')
      }
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.products-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.products-card {
  .table-page-search-wrapper {
    margin-bottom: 24px;
    
    .table-page-search-submitButtons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .batch-operation-bar {
    margin-bottom: 16px;
  }
}

.product-image {
  border-radius: 4px;
  object-fit: cover;
}

.low-stock {
  color: #ff4d4f;
  font-weight: 600;
}

.audit-content {
  .product-preview {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
  }
}

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }
  
  .ant-table-tbody > tr:hover > td {
    background: #f5f5f5;
  }
}

:deep(.ant-tag) {
  margin: 0;
  font-size: 12px;
  padding: 2px 8px;
}

:deep(.ant-image) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.ant-typography) {
  margin-bottom: 0;
}
</style> 