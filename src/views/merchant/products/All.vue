<template>
  <div class="products-all">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>平台商品</h1>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="ShoppingCart"
          @click="viewImportList"
          :badge="importListCount"
        >
          查看导入列表 ({{ importListCount }})
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

          <el-input
            v-model="priceRange.min"
            placeholder="最低价格"
            type="number"
            style="width: 120px;"
            @input="handleFilter"
          >
            <template #prepend>$</template>
          </el-input>

          <span class="price-separator">-</span>

          <el-input
            v-model="priceRange.max"
            placeholder="最高价格"
            type="number"
            style="width: 120px;"
            @input="handleFilter"
          >
            <template #prepend>$</template>
          </el-input>
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
          :icon="Plus"
          @click="batchAddToImportList"
          :loading="batchLoading"
        >
          批量添加到导入列表
        </el-button>
        <el-button @click="clearSelection">取消选择</el-button>
      </div>
    </div>

    <!-- 商品网格视图 -->
    <div class="products-grid" v-loading="loading">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
        :class="{ selected: selectedProducts.includes(product.id) }"
      >
        <!-- 选择框 -->
        <div class="card-checkbox">
          <el-checkbox 
            :model-value="selectedProducts.includes(product.id)"
            @change="toggleProductSelection(product.id)"
          />
        </div>

        <!-- 商品图片 -->
        <div class="product-image">
          <el-image
            :src="product.image"
            :alt="product.name"
            fit="cover"
            class="image"
            :preview-src-list="[product.image]"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </template>
          </el-image>
          <div class="image-overlay">
            <el-button 
              :icon="View" 
              circle 
              @click="viewProductDetail(product)"
            />
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="product-info">
          <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
          <p class="product-code">编号: {{ product.code }}</p>
          <p class="product-category">
            <el-tag size="small" type="info">{{ product.categoryName }}</el-tag>
          </p>
          
          <div class="price-info">
            <div class="price-row">
              <span class="price-label">单价:</span>
              <span class="price-value">${{ product.price }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">建议售价:</span>
              <span class="suggested-price">${{ product.suggestedPrice }}</span>
            </div>
          </div>

          <div class="stock-info">
            <span class="stock-label">库存:</span>
            <span 
              class="stock-value" 
              :class="{ 'low-stock': product.stock < 10 }"
            >
              {{ product.stock }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="product-actions">
          <el-button 
            type="primary" 
            size="small"
            :icon="Plus"
            @click="addToImportList(product)"
            :loading="product.adding"
            :disabled="product.inImportList"
          >
            {{ product.inImportList ? '已添加' : '添加到导入列表' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[12, 24, 48, 96]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-if="!loading && products.length === 0" 
      description="暂无商品数据"
      class="empty-state"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  View, 
  Picture 
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const batchLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const priceRange = reactive({
  min: '',
  max: ''
})

const selectedProducts = ref([])
const products = ref([])
const categories = ref([
  { id: 1, name: '电子产品' },
  { id: 2, name: '家居用品' },
  { id: 3, name: '服装配饰' },
  { id: 4, name: '运动户外' },
  { id: 5, name: '美妆个护' }
])

const pagination = reactive({
  page: 1,
  size: 24,
  total: 0
})

// 计算属性
const importListCount = computed(() => {
  // 从localStorage或状态管理中获取导入列表数量
  return parseInt(localStorage.getItem('importListCount') || '0')
})

// 模拟商品数据
const generateMockProducts = () => {
  const mockProducts = []
  const productNames = [
    '无线蓝牙耳机', 'iPhone手机壳', '智能手表', '便携充电宝', 
    '蓝牙音箱', 'LED台灯', '咖啡杯', '笔记本电脑包',
    '运动T恤', '牛仔裤', '运动鞋', '背包',
    '护肤面膜', '口红', '香水', '洗面奶'
  ]
  
  for (let i = 0; i < 100; i++) {
    const price = (Math.random() * 200 + 10).toFixed(2)
    const suggestedPrice = (parseFloat(price) * (1.3 + Math.random() * 0.5)).toFixed(2)
    
    mockProducts.push({
      id: i + 1,
      name: productNames[Math.floor(Math.random() * productNames.length)] + ` ${i + 1}`,
      code: `PRD${String(i + 1).padStart(6, '0')}`,
      categoryName: categories.value[Math.floor(Math.random() * categories.value.length)].name,
      categoryId: Math.floor(Math.random() * categories.value.length) + 1,
      image: `https://picsum.photos/300/300?random=${i + 1}`,
      price: parseFloat(price),
      suggestedPrice: parseFloat(suggestedPrice),
      stock: Math.floor(Math.random() * 500) + 10,
      inImportList: Math.random() > 0.8, // 20%的商品已在导入列表
      adding: false
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
    
    const mockData = generateMockProducts()
    
    // 应用筛选和搜索
    let filteredData = mockData
    
    if (searchQuery.value) {
      filteredData = filteredData.filter(product => 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    if (selectedCategory.value) {
      filteredData = filteredData.filter(product => 
        product.categoryId === selectedCategory.value
      )
    }
    
    if (priceRange.min) {
      filteredData = filteredData.filter(product => 
        product.price >= parseFloat(priceRange.min)
      )
    }
    
    if (priceRange.max) {
      filteredData = filteredData.filter(product => 
        product.price <= parseFloat(priceRange.max)
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

// 商品选择
const toggleProductSelection = (productId) => {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

const clearSelection = () => {
  selectedProducts.value = []
}

// 添加到导入列表
const addToImportList = async (product) => {
  product.adding = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    product.inImportList = true
    ElMessage.success(`${product.name} 已添加到导入列表`)
    
    // 更新导入列表数量
    const currentCount = parseInt(localStorage.getItem('importListCount') || '0')
    localStorage.setItem('importListCount', String(currentCount + 1))
    
  } catch (error) {
    ElMessage.error('添加失败，请重试')
  } finally {
    product.adding = false
  }
}

// 批量添加到导入列表
const batchAddToImportList = async () => {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认将选中的 ${selectedProducts.value.length} 件商品添加到导入列表吗？`,
      '批量添加确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    batchLoading.value = true
    
    // 模拟批量API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新商品状态
    products.value.forEach(product => {
      if (selectedProducts.value.includes(product.id)) {
        product.inImportList = true
      }
    })
    
    ElMessage.success(`成功添加 ${selectedProducts.value.length} 件商品到导入列表`)
    
    // 更新导入列表数量
    const currentCount = parseInt(localStorage.getItem('importListCount') || '0')
    localStorage.setItem('importListCount', String(currentCount + selectedProducts.value.length))
    
    // 清除选择
    selectedProducts.value = []
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量添加失败，请重试')
    }
  } finally {
    batchLoading.value = false
  }
}

// 查看商品详情
const viewProductDetail = (product) => {
  router.push(`/merchant/products/${product.id}`)
}

// 查看导入列表
const viewImportList = () => {
  router.push('/merchant/products/import')
}

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

.products-all {
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

    .header-actions {
      .el-button {
        position: relative;
      }
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

        .price-separator {
          color: #9ca3af;
          font-weight: 500;
        }
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

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.selected {
        border: 2px solid #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      .card-checkbox {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        padding: 4px;
      }

      .product-image {
        position: relative;
        height: 200px;
        overflow: hidden;

        .image {
          width: 100%;
          height: 100%;
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          background: #f9fafb;

          .el-icon {
            font-size: 48px;
            margin-bottom: 8px;
          }

          span {
            font-size: 14px;
          }
        }

        .image-overlay {
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
          transition: opacity 0.3s ease;

          .el-button {
            background: rgba(255, 255, 255, 0.9);
            border: none;
          }
        }

        &:hover .image-overlay {
          opacity: 1;
        }
      }

      .product-info {
        padding: 16px;

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 44px;
        }

        .product-code {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 8px 0;
        }

        .product-category {
          margin: 0 0 12px 0;
        }

        .price-info {
          margin-bottom: 12px;

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .price-label {
              font-size: 12px;
              color: #6b7280;
            }

            .price-value {
              font-size: 16px;
              font-weight: 600;
              color: #dc2626;
            }

            .suggested-price {
              font-size: 14px;
              font-weight: 500;
              color: #059669;
            }
          }
        }

        .stock-info {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .stock-label {
            font-size: 12px;
            color: #6b7280;
          }

          .stock-value {
            font-size: 14px;
            font-weight: 500;
            color: #059669;

            &.low-stock {
              color: #dc2626;
            }
          }
        }
      }

      .product-actions {
        padding: 0 16px 16px 16px;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }

  .empty-state {
    margin-top: 60px;
  }
}
</style> 