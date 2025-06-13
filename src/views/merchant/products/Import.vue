<template>
  <div class="import-products">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>导入商品列表</h1>
      <div class="header-actions">
        <el-button type="primary" @click="goToAllProducts">
          浏览平台商品
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选区 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品名称、编号..."
            clearable
            @input="handleSearch"
            style="width: 400px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="filter-controls">
          <el-select
            v-model="selectedStatus"
            placeholder="铺货状态"
            clearable
            @change="handleFilter"
            style="width: 150px;"
          >
            <el-option label="已铺货" value="deployed" />
            <el-option label="未铺货" value="not_deployed" />
          </el-select>

          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            clearable
            @change="handleFilter"
            style="width: 200px;"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div class="batch-actions" v-if="selectedProducts.length > 0">
      <div class="selected-info">
        已选择 {{ selectedProducts.length }} 件商品
      </div>
      <div class="actions">
        <el-button 
          type="primary" 
          :icon="Shop"
          @click="batchDeployToStore"
          :loading="batchLoading"
        >
          批量铺货
        </el-button>
        <el-button 
          type="danger"
          :icon="Delete"
          @click="batchRemoveFromList"
        >
          批量移除
        </el-button>
        <el-button @click="clearSelection">取消选择</el-button>
      </div>
    </div>

    <!-- 商品列表 (表格形式) -->
    <div class="products-table" v-loading="loading">
      <el-table
        :data="products"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        empty-text="暂无导入商品"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="商品信息" width="400">
          <template #default="scope">
            <div class="product-info">
              <el-image
                :src="scope.row.image"
                :alt="scope.row.name"
                style="width: 60px; height: 60px; border-radius: 6px;"
                fit="cover"
                :preview-src-list="[scope.row.image]"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="info-text">
                <h4>{{ scope.row.name }}</h4>
                <p>编号: {{ scope.row.code }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag 
              :type="scope.row.isDeployed ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.isDeployed ? '已铺货' : '未铺货' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="上架店铺" width="200">
          <template #default="scope">
            <div class="store-tags" v-if="scope.row.deployedStores?.length > 0">
              <el-tag 
                v-for="store in scope.row.deployedStores" 
                :key="store.id"
                size="small"
                style="margin: 2px;"
              >
                {{ store.name }}
              </el-tag>
            </div>
            <span v-else class="text-gray">未上架</span>
          </template>
        </el-table-column>

        <el-table-column label="产品分类" width="120">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.categoryName }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="销售价格" width="120">
          <template #default="scope">
            <span class="price">${{ scope.row.salePrice || scope.row.suggestedPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column label="库存数量" width="100">
          <template #default="scope">
            <span 
              :class="{ 'low-stock': scope.row.stock < 10 }"
              class="stock-value"
            >
              {{ scope.row.stock }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small"
                :icon="Shop"
                @click="deployToStore(scope.row)"
                :disabled="scope.row.isDeployed"
              >
                铺货到店铺
              </el-button>
              <el-button 
                size="small"
                :icon="Edit"
                @click="editProduct(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                :icon="Delete"
                @click="removeFromList(scope.row)"
              >
                移除
              </el-button>
              <el-button 
                size="small"
                :icon="View"
                @click="viewDetail(scope.row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 铺货到店铺弹窗 -->
    <!-- <DeployToStoreDialog
      v-model="showDeployDialog"
      :product="selectedProduct"
      :products="selectedProducts.length > 1 ? selectedForDeploy : []"
      @success="handleDeploySuccess"
    /> -->

    <!-- 商品编辑弹窗 -->
    <!-- <ProductEditDialog
      v-model="showEditDialog"
      :product="selectedProduct"
      @success="handleEditSuccess"
    /> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Shop, 
  Delete, 
  Edit, 
  View, 
  Picture 
} from '@element-plus/icons-vue'
// import DeployToStoreDialog from './components/DeployToStoreDialog.vue'
// import ProductEditDialog from './components/ProductEditDialog.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const batchLoading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')

const selectedProducts = ref([])
const selectedForDeploy = ref([])
const products = ref([])
const selectedProduct = ref(null)

const showDeployDialog = ref(false)
const showEditDialog = ref(false)

const categories = ref([
  { id: 1, name: '电子产品' },
  { id: 2, name: '家居用品' },
  { id: 3, name: '服装配饰' },
  { id: 4, name: '运动户外' },
  { id: 5, name: '美妆个护' }
])

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 模拟导入商品数据
const generateMockImportProducts = () => {
  const mockProducts = []
  const productNames = [
    '无线蓝牙耳机', 'iPhone手机壳', '智能手表', '便携充电宝', 
    '蓝牙音箱', 'LED台灯', '咖啡杯', '笔记本电脑包',
    '运动T恤', '牛仔裤', '运动鞋', '背包',
    '护肤面膜', '口红', '香水', '洗面奶'
  ]
  
  const storeNames = ['我的主店铺', '美国专营店', '欧洲店铺', '澳洲分店']
  
  for (let i = 0; i < 50; i++) {
    const price = (Math.random() * 200 + 10).toFixed(2)
    const suggestedPrice = (parseFloat(price) * (1.3 + Math.random() * 0.5)).toFixed(2)
    const isDeployed = Math.random() > 0.6
    
    const deployedStores = isDeployed ? 
      storeNames.slice(0, Math.floor(Math.random() * 3) + 1).map((name, index) => ({
        id: index + 1,
        name
      })) : []
    
    mockProducts.push({
      id: i + 1,
      name: productNames[Math.floor(Math.random() * productNames.length)] + ` ${i + 1}`,
      code: `IMP${String(i + 1).padStart(6, '0')}`,
      categoryName: categories.value[Math.floor(Math.random() * categories.value.length)].name,
      categoryId: Math.floor(Math.random() * categories.value.length) + 1,
      image: `https://picsum.photos/300/300?random=${i + 100}`,
      price: parseFloat(price),
      suggestedPrice: parseFloat(suggestedPrice),
      salePrice: isDeployed ? (parseFloat(suggestedPrice) * (0.9 + Math.random() * 0.2)).toFixed(2) : null,
      stock: Math.floor(Math.random() * 500) + 10,
      isDeployed,
      deployedStores
    })
  }
  
  return mockProducts
}

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockData = generateMockImportProducts()
    
    // 应用筛选和搜索
    let filteredData = mockData
    
    if (searchQuery.value) {
      filteredData = filteredData.filter(product => 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    if (selectedStatus.value) {
      if (selectedStatus.value === 'deployed') {
        filteredData = filteredData.filter(product => product.isDeployed)
      } else if (selectedStatus.value === 'not_deployed') {
        filteredData = filteredData.filter(product => !product.isDeployed)
      }
    }
    
    if (selectedCategory.value) {
      filteredData = filteredData.filter(product => 
        product.categoryId === selectedCategory.value
      )
    }
    
    // 分页处理
    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    products.value = filteredData.slice(start, end)
    
  } catch (error) {
    ElMessage.error('加载商品数据失败')
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = debounce(() => {
  pagination.page = 1
  loadProducts()
}, 500)

// 筛选处理
const handleFilter = () => {
  pagination.page = 1
  loadProducts()
}

// 分页处理
const handlePageChange = (page) => {
  pagination.page = page
  loadProducts()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadProducts()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const clearSelection = () => {
  selectedProducts.value = []
}

// 铺货到店铺
const deployToStore = (product) => {
  selectedProduct.value = product
  selectedForDeploy.value = []
  showDeployDialog.value = true
}

// 批量铺货
const batchDeployToStore = () => {
  if (selectedProducts.value.length === 0) return
  
  selectedProduct.value = null
  selectedForDeploy.value = selectedProducts.value
  showDeployDialog.value = true
}

// 编辑商品
const editProduct = (product) => {
  selectedProduct.value = product
  showEditDialog.value = true
}

// 移除商品
const removeFromList = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确认从导入列表中移除 "${product.name}" 吗？`,
      '移除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('商品已移除')
    
    // 更新导入列表数量
    const currentCount = parseInt(localStorage.getItem('importListCount') || '0')
    localStorage.setItem('importListCount', String(Math.max(0, currentCount - 1)))
    
    loadProducts()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败，请重试')
    }
  }
}

// 批量移除
const batchRemoveFromList = async () => {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认从导入列表中移除选中的 ${selectedProducts.value.length} 件商品吗？`,
      '批量移除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    batchLoading.value = true
    
    // 模拟批量API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success(`成功移除 ${selectedProducts.value.length} 件商品`)
    
    // 更新导入列表数量
    const currentCount = parseInt(localStorage.getItem('importListCount') || '0')
    localStorage.setItem('importListCount', String(Math.max(0, currentCount - selectedProducts.value.length)))
    
    selectedProducts.value = []
    loadProducts()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量移除失败，请重试')
    }
  } finally {
    batchLoading.value = false
  }
}

// 查看详情
const viewDetail = (product) => {
  router.push(`/merchant/products/${product.id}`)
}

// 跳转到平台商品
const goToAllProducts = () => {
  router.push('/merchant/products/all')
}

// 铺货成功处理 - 当对话框被启用时使用
// const handleDeploySuccess = () => {
//   showDeployDialog.value = false
//   selectedProducts.value = []
//   loadProducts()
// }

// 编辑成功处理 - 当对话框被启用时使用
// const handleEditSuccess = () => {
//   showEditDialog.value = false
//   loadProducts()
// }

// 防抖函数
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 生命周期
onMounted(() => {
  loadProducts()
})
</script>

<style lang="scss" scoped>
@import "@/assets/styles/global.scss";

.import-products {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .filter-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .search-box {
        flex: 1;
        min-width: 300px;
      }

      .filter-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
    }
  }

  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #e0f2fe;
    border: 1px solid #29b6f6;
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 20px;

    .selected-info {
      color: #0277bd;
      font-weight: 500;
    }

    .actions {
      display: flex;
      gap: 12px;
    }
  }

  .products-table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .image-error {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        background: #f9fafb;
        border-radius: 6px;
        color: #9ca3af;
      }

      .info-text {
        h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.4;
        }

        p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }
      }
    }

    .store-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .text-gray {
      color: #9ca3af;
      font-size: 12px;
    }

    .price {
      font-weight: 600;
      color: #059669;
    }

    .stock-value {
      font-weight: 500;
      color: #059669;

      &.low-stock {
        color: #dc2626;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .el-button {
        min-width: auto;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}
</style> 