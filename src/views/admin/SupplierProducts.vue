<template>
  <div class="supplier-products-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumb-nav">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ name: 'AdminDashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ name: 'Suppliers' }">供应商管理</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ name: 'SupplierDetail', params: { id: supplierId } }">
              {{ supplierInfo.company_name }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>供应商商品</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <h1 class="page-title">
          <i class="el-icon-goods"></i>
          {{ supplierInfo.company_name }} - 商品列表
        </h1>
      </div>
    </div>

    <!-- 供应商信息卡片 -->
    <div class="supplier-info-card">
      <el-card shadow="hover">
        <div class="supplier-info">
          <div class="supplier-avatar">
            <el-avatar 
              :size="60" 
              :src="supplierInfo.logo" 
              :icon="UserFilled"
            />
          </div>
          <div class="supplier-details">
            <h3>{{ supplierInfo.company_name }}</h3>
            <div class="supplier-meta">
              <el-tag :type="getStatusType(supplierInfo.status)" size="small">
                {{ getStatusText(supplierInfo.status) }}
              </el-tag>
              <span class="supplier-category">{{ supplierInfo.category }}</span>
              <span class="product-count">商品总数：{{ totalProducts }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <el-card shadow="never">
        <div class="search-form">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索商品名称、SKU"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select 
                v-model="searchForm.category" 
                placeholder="商品分类" 
                clearable
                @change="handleSearch"
              >
                <el-option label="全部分类" value=""></el-option>
                <el-option label="服装" value="clothing"></el-option>
                <el-option label="电子产品" value="electronics"></el-option>
                <el-option label="家居用品" value="home"></el-option>
                <el-option label="美妆护肤" value="beauty"></el-option>
                <el-option label="运动户外" value="sports"></el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select 
                v-model="searchForm.status" 
                placeholder="商品状态" 
                clearable
                @change="handleSearch"
              >
                <el-option label="全部状态" value=""></el-option>
                <el-option label="在售" value="active"></el-option>
                <el-option label="下架" value="inactive"></el-option>
                <el-option label="缺货" value="out_of_stock"></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input-number
                v-model="searchForm.minPrice"
                placeholder="最低价格"
                :min="0"
                :step="0.01"
                :precision="2"
                controls-position="right"
                style="width: 48%; margin-right: 4%"
                @change="handleSearch"
              />
              <el-input-number
                v-model="searchForm.maxPrice"
                placeholder="最高价格"
                :min="0"
                :step="0.01"
                :precision="2"
                controls-position="right"
                style="width: 48%"
                @change="handleSearch"
              />
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button type="info" @click="resetSearch">重置</el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" @click="handleAddProduct">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedProducts.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedProducts.length }})
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="result-count">共 {{ totalProducts }} 个商品</span>
        <el-divider direction="vertical" />
        <el-button-group>
          <el-button 
            :type="viewMode === 'table' ? 'primary' : 'info'" 
            @click="viewMode = 'table'"
          >
            <el-icon><List /></el-icon>
          </el-button>
          <el-button 
            :type="viewMode === 'grid' ? 'primary' : 'info'" 
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-section">
      <el-card shadow="never">
        <el-table
          ref="productTable"
          v-loading="loading"
          :data="productList"
          @selection-change="handleSelectionChange"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <div class="product-image">
                  <el-image
                    :src="row.image"
                    :preview-src-list="[row.image]"
                    fit="cover"
                    style="width: 60px; height: 60px; border-radius: 4px;"
                    :alt="row.name"
                  />
                </div>
                <div class="product-details">
                  <div class="product-name">{{ row.name }}</div>
                  <div class="product-sku">SKU: {{ row.sku }}</div>
                  <div class="product-category">
                    <el-tag size="small" type="info">{{ row.category }}</el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" prop="price" width="120" sortable>
            <template #default="{ row }">
              <span class="price">${{ row.price.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="100" sortable>
            <template #default="{ row }">
              <span :class="{ 'low-stock': row.stock < 10 }">{{ row.stock }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="100">
            <template #default="{ row }">
              <el-tag :type="getProductStatusType(row.status)" size="small">
                {{ getProductStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="销量" prop="sales" width="100" sortable />
          <el-table-column label="创建时间" prop="created_at" width="120" sortable>
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="default" @click="handleViewProduct(row)">
                查看
              </el-button>
              <el-button size="default" type="warning" @click="handleEditProduct(row)">
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleProductAction(command, row)">
                <el-button size="default" type="danger">
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="toggle">
                      {{ row.status === 'active' ? '下架' : '上架' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="copy">复制商品</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 网格视图 -->
    <div v-else class="grid-section">
      <div class="product-grid">
        <div 
          v-for="product in productList" 
          :key="product.id" 
          class="product-card"
        >
          <el-card shadow="hover" body-style="padding: 0">
            <div class="product-image">
              <el-image
                :src="product.image"
                :alt="product.name"
                fit="cover"
                style="width: 100%; height: 200px;"
              />
              <div class="product-overlay">
                <el-button type="primary" size="small" @click="handleViewProduct(product)">
                  查看详情
                </el-button>
              </div>
            </div>
            <div class="product-content">
              <h4 class="product-title">{{ product.name }}</h4>
              <p class="product-sku">SKU: {{ product.sku }}</p>
              <div class="product-meta">
                <span class="product-price">${{ product.price.toFixed(2) }}</span>
                <el-tag :type="getProductStatusType(product.status)" size="small">
                  {{ getProductStatusText(product.status) }}
                </el-tag>
              </div>
              <div class="product-stats">
                <span>库存: {{ product.stock }}</span>
                <span>销量: {{ product.sales }}</span>
              </div>
              <div class="product-actions">
                <el-button size="default" type="warning" @click="handleEditProduct(product)">编辑</el-button>
                <el-button 
                  size="default" 
                  :type="product.status === 'active' ? 'danger' : 'success'"
                  @click="handleToggleProductStatus(product)"
                >
                  {{ product.status === 'active' ? '下架' : '上架' }}
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalProducts"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Plus, 
  Delete, 
  Download, 
  List, 
  Grid, 
  ArrowDown,
  UserFilled 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const viewMode = ref('table')
const selectedProducts = ref([])
const supplierId = computed(() => route.params.id)

// 供应商信息
const supplierInfo = ref({
  id: '',
  company_name: '',
  logo: '',
  status: 'active',
  category: '国内供应商'
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  minPrice: null,
  maxPrice: null
})

// 商品列表
const productList = ref([])
const totalProducts = ref(0)

// 分页
const pagination = reactive({
  current: 1,
  size: 20
})

// 模拟商品数据
const mockProducts = [
  {
    id: 1,
    name: '苹果iPhone 15 Pro Max',
    sku: 'IPHONE15PM001',
    category: '电子产品',
    price: 1199.99,
    stock: 50,
    status: 'active',
    sales: 125,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    created_at: '2024-01-15'
  },
  {
    id: 2,
    name: '三星Galaxy S24 Ultra',
    sku: 'GALAXY24U001',
    category: '电子产品',
    price: 1099.99,
    stock: 8,
    status: 'active',
    sales: 89,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    created_at: '2024-01-10'
  },
  {
    id: 3,
    name: 'MacBook Pro 16英寸',
    sku: 'MBP16001',
    category: '电子产品',
    price: 2399.99,
    stock: 0,
    status: 'out_of_stock',
    sales: 45,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    created_at: '2024-01-08'
  }
]

// 生命周期
onMounted(() => {
  loadSupplierInfo()
  loadProducts()
})

// 方法
const loadSupplierInfo = async () => {
  // 模拟加载供应商信息
  supplierInfo.value = {
    id: supplierId.value,
    company_name: '苹果科技有限公司',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
    status: 'active',
    category: '国内供应商'
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 应用搜索过滤
    let filtered = [...mockProducts]
    
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)
      )
    }
    
    if (searchForm.category) {
      filtered = filtered.filter(product => product.category === searchForm.category)
    }
    
    if (searchForm.status) {
      filtered = filtered.filter(product => product.status === searchForm.status)
    }
    
    if (searchForm.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= searchForm.minPrice)
    }
    
    if (searchForm.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= searchForm.maxPrice)
    }
    
    totalProducts.value = filtered.length
    
    // 分页处理
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    productList.value = filtered.slice(start, end)
    
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadProducts()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    category: '',
    status: '',
    minPrice: null,
    maxPrice: null
  })
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const handleAddProduct = () => {
  router.push({ 
    name: 'CreateProduct', 
    query: { supplier_id: supplierId.value } 
  })
}

const handleViewProduct = (product) => {
  router.push({ name: 'ProductDetail', params: { id: product.id } })
}

const handleEditProduct = (product) => {
  router.push({ name: 'EditProduct', params: { id: product.id } })
}

const handleProductAction = async (command, product) => {
  switch (command) {
    case 'toggle':
      await handleToggleProductStatus(product)
      break
    case 'copy':
      ElMessage.success('商品复制功能开发中...')
      break
    case 'delete':
      await handleDeleteProduct(product)
      break
  }
}

const handleToggleProductStatus = async (product) => {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '上架' : '下架'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}商品"${product.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    product.status = newStatus
    ElMessage.success(`商品${action}成功`)
    
  } catch {
    // 用户取消操作
  }
}

const handleDeleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${product.name}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    const index = productList.value.findIndex(p => p.id === product.id)
    if (index > -1) {
      productList.value.splice(index, 1)
      totalProducts.value--
    }
    
    ElMessage.success('商品删除成功')
    
  } catch {
    // 用户取消操作
  }
}

const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 个商品吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    const selectedIds = selectedProducts.value.map(p => p.id)
    productList.value = productList.value.filter(p => !selectedIds.includes(p.id))
    totalProducts.value -= selectedProducts.value.length
    selectedProducts.value = []
    
    ElMessage.success('批量删除成功')
    
  } catch {
    // 用户取消操作
  }
}

const handleExport = () => {
  ElMessage.success('数据导出功能开发中...')
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadProducts()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadProducts()
}

// 工具方法
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'warning',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    active: '已审核',
    inactive: '待审核',
    rejected: '已拒绝'
  }
  return statusMap[status] || '未知'
}

const getProductStatusType = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'warning',
    out_of_stock: 'danger'
  }
  return statusMap[status] || 'info'
}

const getProductStatusText = (status) => {
  const statusMap = {
    active: '在售',
    inactive: '下架',
    out_of_stock: '缺货'
  }
  return statusMap[status] || '未知'
}
</script>

<style lang="scss" scoped>
.supplier-products-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

// 增强按钮可见性
.el-button {
  font-weight: bold;
  &.el-button--primary {
    background-color: #1a73e8;
  }
  &.el-button--danger {
    background-color: #ea4335;
  }
  &.el-button--warning {
    background-color: #f9ab00;
    color: #ffffff;
  }
  &.el-button--success {
    background-color: #34a853;
  }
}

// 操作列按钮间距
.el-table {
  .cell {
    .el-button + .el-button,
    .el-button + .el-dropdown {
      margin-left: 8px;
    }
  }
}

.page-header {
  margin-bottom: 24px;
  
  .header-content {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .breadcrumb-nav {
    margin-bottom: 16px;
  }
  
  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    
    i {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.supplier-info-card {
  margin-bottom: 24px;
  
  .supplier-info {
    display: flex;
    align-items: center;
    padding: 8px 0;
    
    .supplier-avatar {
      margin-right: 16px;
    }
    
    .supplier-details {
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
      
      .supplier-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 14px;
        color: #606266;
        
        .product-count {
          font-weight: 500;
          color: #409eff;
        }
      }
    }
  }
}

.search-section {
  margin-bottom: 16px;
  
  .search-form {
    padding: 8px 0;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .toolbar-left {
    display: flex;
    gap: 12px;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    
    .result-count {
      font-size: 14px;
      color: #606266;
    }
  }
}

.table-section {
  margin-bottom: 24px;
  
  .product-info {
    display: flex;
    align-items: center;
    
    .product-image {
      margin-right: 12px;
    }
    
    .product-details {
      .product-name {
        font-weight: 500;
        margin-bottom: 4px;
        color: #303133;
      }
      
      .product-sku {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
    }
  }
  
  .price {
    font-weight: 600;
    color: #f56c6c;
  }
  
  .low-stock {
    color: #e6a23c;
    font-weight: 500;
  }
}

.grid-section {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .product-card {
    .product-image {
      position: relative;
      overflow: hidden;
      
      &:hover .product-overlay {
        opacity: 1;
      }
    }
    
    .product-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .product-content {
      padding: 16px;
      
      .product-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .product-sku {
        margin: 0 0 12px 0;
        font-size: 12px;
        color: #909399;
      }
      
      .product-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        .product-price {
          font-weight: 600;
          color: #f56c6c;
          font-size: 16px;
        }
      }
      
      .product-stats {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #606266;
        margin-bottom: 16px;
      }
      
      .product-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

// 响应式设计
@media (max-width: 768px) {
  .supplier-products-page {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .toolbar-left,
    .toolbar-right {
      justify-content: center;
    }
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
}
</style>