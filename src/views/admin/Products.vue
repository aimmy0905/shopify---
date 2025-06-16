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
                  />
                  <a-input 
                    v-model:value="queryParam.maxPrice" 
                    placeholder="最高价" 
                    style="width: 50%" 
                    type="number"
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
                  导出
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
              <a-button size="small" @click="batchApprove">批量审核通过</a-button>
              <a-button size="small" @click="batchReject">批量审核不通过</a-button>
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
        :scroll="{ x: 1600 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 商品图片和名称列 -->
          <template v-if="column.key === 'product'">
            <div class="product-info">
              <a-image
                :width="60"
                :height="60"
                :src="record.image"
                :preview="false"
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyMEM0NS41IDIwIDUwIDI1IDUwIDMwQzUwIDM1IDQ1LjUgNDAgMzAgNDBDMTQuNSA0MCA5IDM1IDkgMzBDOSAyNSAxNC41IDIwIDMwIDIwWiIgZmlsbD0iI0JGQkZCRiIvPgo8L3N2Zz4K"
                class="product-image"
              />
              <div class="product-details">
                <div class="product-name">{{ record.name }}</div>
                <div class="product-code">编号: {{ record.code }}</div>
              </div>
            </div>
          </template>

          <!-- 商品状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- 价格列 -->
          <template v-if="column.key === 'price'">
            <div>
              <div>售价: ${{ record.price.toFixed(2) }}</div>
              <div style="color: #999; font-size: 12px;">
                建议价: ${{ record.suggestedPrice.toFixed(2) }}
              </div>
            </div>
          </template>

          <!-- 成本列 -->
          <template v-if="column.key === 'cost'">
            ${{ record.cost.toFixed(2) }}
          </template>

          <!-- 库存列 -->
          <template v-if="column.key === 'stock'">
            <span :class="{ 'low-stock': record.stock < 10 }">
              {{ record.stock }}
            </span>
          </template>

          <!-- 销量列 -->
          <template v-if="column.key === 'sales'">
            {{ record.totalSales || 0 }}
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
                    <a-menu-item v-if="record.status === 'pending'" @click="approveProduct(record)">
                      <CheckOutlined /> 审核通过
                    </a-menu-item>
                    <a-menu-item v-if="record.status === 'pending'" @click="rejectProduct(record)">
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
      :title="auditForm.type === 'approve' ? '商品审核通过' : '商品审核不通过'"
      @ok="handleAudit"
    >
      <div class="audit-content">
        <div class="product-preview">
          <a-image
            :width="80"
            :height="80"
            :src="auditForm.product?.image"
            :preview="false"
          />
          <div style="margin-left: 12px;">
            <div><strong>{{ auditForm.product?.name }}</strong></div>
            <div style="color: #666;">编号: {{ auditForm.product?.code }}</div>
            <div style="color: #666;">分类: {{ auditForm.product?.categoryName }}</div>
          </div>
        </div>
        
        <a-form :model="auditForm" :label-col="{ span: 4 }" style="margin-top: 16px;">
          <a-form-item label="审核结果">
            <a-radio-group v-model:value="auditForm.type">
              <a-radio value="approve">审核通过</a-radio>
              <a-radio value="reject">审核不通过</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item 
            label="审核备注" 
            :rules="auditForm.type === 'reject' ? [{ required: true, message: '拒绝时必须填写原因' }] : []"
          >
            <a-textarea 
              v-model:value="auditForm.remark" 
              :placeholder="auditForm.type === 'reject' ? '请输入拒绝原因' : '可填写审核备注(选填)'"
              :rows="3"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 批量审核弹窗 -->
    <a-modal
      v-model:visible="batchAuditModalVisible"
      :title="`批量${batchAuditForm.type === 'approve' ? '通过' : '拒绝'}审核`"
      @ok="handleBatchAudit"
    >
      <div>
        <p>您确定要批量{{ batchAuditForm.type === 'approve' ? '通过' : '拒绝' }}以下 {{ selectedRowKeys.length }} 个商品的审核吗？</p>
        <a-form :model="batchAuditForm" :label-col="{ span: 4 }">
          <a-form-item 
            label="审核备注"
            :rules="batchAuditForm.type === 'reject' ? [{ required: true, message: '批量拒绝时必须填写原因' }] : []"
          >
            <a-textarea 
              v-model:value="batchAuditForm.remark" 
              :placeholder="batchAuditForm.type === 'reject' ? '请输入拒绝原因' : '可填写审核备注(选填)'"
              :rows="3"
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
  type: 'approve',
  product: null,
  remark: ''
})

// 批量审核表单
const batchAuditForm = reactive({
  type: 'approve',
  remark: ''
})

// 商品列表数据
const productList = ref([])

// 分类列表
const categories = ref([
  { id: 1, name: '电子产品' },
  { id: 2, name: '服装配饰' },
  { id: 3, name: '家居用品' },
  { id: 4, name: '运动户外' },
  { id: 5, name: '美妆护肤' }
])

// 供应商列表
const suppliers = ref([
  { id: 1, name: '供应商A' },
  { id: 2, name: '供应商B' },
  { id: 3, name: '供应商C' },
  { id: 4, name: '供应商D' }
])

// 表格列配置
const columns = [
  {
    title: '商品信息',
    key: 'product',
    width: 280,
    fixed: 'left'
  },
  {
    title: '商品分类',
    dataIndex: 'categoryName',
    key: 'categoryName',
    width: 120
  },
  {
    title: '库存',
    key: 'stock',
    width: 80,
    sorter: true
  },
  {
    title: '价格信息',
    key: 'price',
    width: 140,
    sorter: true
  },
  {
    title: '采购成本',
    key: 'cost',
    width: 100,
    sorter: true
  },
  {
    title: '供应商',
    dataIndex: 'supplierName',
    key: 'supplierName',
    width: 120
  },
  {
    title: '总销量',
    key: 'sales',
    width: 80,
    sorter: true
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    sorter: true
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right'
  }
]

// 初始化数据
const initData = () => {
  const mockProducts = []
  for (let i = 1; i <= 50; i++) {
    const status = ['pending', 'draft', 'published', 'rejected'][Math.floor(Math.random() * 4)]
    const categoryId = Math.floor(Math.random() * 5) + 1
    const supplierId = Math.floor(Math.random() * 4) + 1
    
    mockProducts.push({
      id: i,
      name: `商品名称 ${i} - 高品质产品`,
      code: `PRD${String(i).padStart(6, '0')}`,
      image: `https://picsum.photos/200/200?random=${i}`,
      categoryId,
      categoryName: categories.value.find(c => c.id === categoryId)?.name,
      supplierId,
      supplierName: suppliers.value.find(s => s.id === supplierId)?.name,
      price: Math.floor(Math.random() * 500 + 50),
      suggestedPrice: Math.floor(Math.random() * 800 + 100),
      cost: Math.floor(Math.random() * 200 + 20),
      stock: Math.floor(Math.random() * 1000 + 10),
      totalSales: Math.floor(Math.random() * 500),
      status,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    })
  }
  return mockProducts
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    draft: 'default',
    published: 'green',
    rejected: 'red'
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

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allProducts = initData()
    let filteredProducts = [...allProducts]
    
    // 应用筛选条件
    if (queryParam.keyword) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.includes(queryParam.keyword) || 
        p.code.includes(queryParam.keyword)
      )
    }
    if (queryParam.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId == queryParam.categoryId)
    }
    if (queryParam.status) {
      filteredProducts = filteredProducts.filter(p => p.status === queryParam.status)
    }
    if (queryParam.supplierId) {
      filteredProducts = filteredProducts.filter(p => p.supplierId == queryParam.supplierId)
    }
    if (queryParam.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= queryParam.minPrice)
    }
    if (queryParam.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= queryParam.maxPrice)
    }
    
    pagination.total = filteredProducts.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    productList.value = filteredProducts.slice(start, end)
    
  } catch (error) {
    message.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
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
    dateRange: []
  })
  pagination.current = 1
  loadProducts()
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadProducts()
}

// 选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 创建商品
const createProduct = () => {
  router.push('/admin/products/create')
}

// 查看商品详情
const viewProduct = (record) => {
  router.push(`/admin/products/${record.id}`)
}

// 编辑商品
const editProduct = (record) => {
  router.push(`/admin/products/edit/${record.id}`)
}

// 复制商品
const copyProduct = (record) => {
  Modal.confirm({
    title: '复制商品',
    content: `确定要复制商品 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        message.success('商品复制成功')
        loadProducts()
      } catch (error) {
        message.error('复制失败')
      }
    }
  })
}

// 删除商品
const deleteProduct = (record) => {
  Modal.confirm({
    title: '删除商品',
    content: `确定要删除商品 "${record.name}" 吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        message.success('商品删除成功')
        loadProducts()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 审核商品
const approveProduct = (record) => {
  auditForm.type = 'approve'
  auditForm.product = record
  auditForm.remark = ''
  auditModalVisible.value = true
}

const rejectProduct = (record) => {
  auditForm.type = 'reject'
  auditForm.product = record
  auditForm.remark = ''
  auditModalVisible.value = true
}

// 处理审核
const handleAudit = async () => {
  if (auditForm.type === 'reject' && !auditForm.remark) {
    message.error('审核不通过时必须填写拒绝原因')
    return
  }
  
  try {
    const action = auditForm.type === 'approve' ? '通过' : '拒绝'
    message.success(`商品审核${action}成功`)
    auditModalVisible.value = false
    loadProducts()
  } catch (error) {
    message.error('审核操作失败')
  }
}

// 批量审核
const batchApprove = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要审核的商品')
    return
  }
  batchAuditForm.type = 'approve'
  batchAuditForm.remark = ''
  batchAuditModalVisible.value = true
}

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
  if (batchAuditForm.type === 'reject' && !batchAuditForm.remark) {
    message.error('批量拒绝时必须填写原因')
    return
  }
  
  try {
    const action = batchAuditForm.type === 'approve' ? '通过' : '拒绝'
    message.success(`批量审核${action}成功，共处理 ${selectedRowKeys.value.length} 个商品`)
    batchAuditModalVisible.value = false
    selectedRowKeys.value = []
    loadProducts()
  } catch (error) {
    message.error('批量审核操作失败')
  }
}

// 批量删除
const batchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的商品')
    return
  }
  
  Modal.confirm({
    title: '批量删除商品',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个商品吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        message.success(`批量删除成功，共删除 ${selectedRowKeys.value.length} 个商品`)
        selectedRowKeys.value = []
        loadProducts()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

// 导出数据
const exportData = () => {
  message.success('导出功能开发中...')
}

// 前往销量排名
const goToRanking = () => {
  router.push('/admin/product-ranking')
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
    .ant-form-inline .ant-form-item {
      display: flex;
      margin-bottom: 16px;
    }
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 16px;
    }
  }
}

.batch-operation-bar {
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  align-items: center;
  
  .product-image {
    border-radius: 6px;
    object-fit: cover;
  }
  
  .product-details {
    margin-left: 12px;
    flex: 1;
    
    .product-name {
      font-weight: 500;
      color: #262626;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-code {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

.low-stock {
  color: #ff4d4f;
  font-weight: 500;
}

.audit-content {
  .product-preview {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    margin-bottom: 16px;
  }
}

.ant-tag {
  border-radius: 4px;
}
</style> 