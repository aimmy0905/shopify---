<template>
  <div class="my-products">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>我的商品</h1>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : 'default'"
            @click="viewMode = 'list'"
            :icon="List"
          >
            列表视图
          </el-button>
          <el-button 
            :type="viewMode === 'ranking' ? 'primary' : 'default'"
            @click="viewMode = 'ranking'"
            :icon="TrendCharts"
          >
            销量排名
          </el-button>
        </el-button-group>
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
            v-model="selectedStore"
            placeholder="选择店铺"
            clearable
            @change="handleFilter"
            style="width: 200px;"
          >
            <el-option label="全部店铺" value="" />
            <el-option
              v-for="store in stores"
              :key="store.id"
              :label="store.name"
              :value="store.id"
            />
          </el-select>

          <el-select
            v-if="viewMode === 'list'"
            v-model="selectedStatus"
            placeholder="商品状态"
            clearable
            @change="handleFilter"
            style="width: 150px;"
          >
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
          </el-select>

          <el-select
            v-if="viewMode === 'ranking'"
            v-model="rankingPeriod"
            @change="handleFilter"
            style="width: 150px;"
          >
            <el-option label="3天" value="3" />
            <el-option label="15天" value="15" />
            <el-option label="30天" value="30" />
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

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="products-table" v-loading="loading">
        <el-table
          :data="products"
          style="width: 100%"
          empty-text="暂无商品数据"
        >
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

          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.status === 'active' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="上架店铺" width="200">
            <template #default="scope">
              <div class="store-tags">
                <el-tag 
                  v-for="store in scope.row.stores" 
                  :key="store.id"
                  size="small"
                  style="margin: 2px;"
                >
                  {{ store.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="产品分类" width="120">
            <template #default="scope">
              <el-tag size="small" type="info">{{ scope.row.categoryName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="单价" width="100">
            <template #default="scope">
              <span class="price">${{ scope.row.price }}</span>
            </template>
          </el-table-column>

          <el-table-column label="销售价格" width="120">
            <template #default="scope">
              <span class="sale-price">${{ scope.row.salePrice }}</span>
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

          <el-table-column label="累计销量" width="100">
            <template #default="scope">
              <span class="sales-count">{{ scope.row.totalSales }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="300" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button 
                  size="small"
                  :icon="Edit"
                  @click="editPrice(scope.row)"
                >
                  编辑价格
                </el-button>
                <el-button 
                  size="small"
                  :icon="Edit"
                  @click="editStock(scope.row)"
                >
                  编辑库存
                </el-button>
                <el-button 
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  size="small"
                  @click="toggleStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '下架' : '上架' }}
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
    </div>

    <!-- 销量排名视图 -->
    <div v-if="viewMode === 'ranking'" class="ranking-view">
      <div class="ranking-header">
        <h3>商品销量排名 - 近{{ rankingPeriod }}天</h3>
        <p class="tip">按销量从高到低排序</p>
      </div>

      <div class="ranking-table" v-loading="loading">
        <el-table
          :data="rankingProducts"
          style="width: 100%"
          empty-text="暂无销量数据"
        >
          <el-table-column label="排名" width="80">
            <template #default="scope">
              <div class="ranking-number">
                <el-tag 
                  v-if="scope.$index < 3"
                  :type="getRankingType(scope.$index)"
                  size="small"
                >
                  {{ scope.$index + 1 }}
                </el-tag>
                <span v-else class="normal-rank">{{ scope.$index + 1 }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="商品信息" width="350">
            <template #default="scope">
              <div class="product-info">
                <el-image
                  :src="scope.row.image"
                  :alt="scope.row.name"
                  style="width: 50px; height: 50px; border-radius: 4px;"
                  fit="cover"
                />
                <div class="info-text">
                  <h4>{{ scope.row.name }}</h4>
                  <p>{{ scope.row.code }}</p>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="销量" width="120">
            <template #default="scope">
              <span class="sales-number">{{ scope.row.periodSales }}</span>
            </template>
          </el-table-column>

          <el-table-column label="销售额" width="150">
            <template #default="scope">
              <span class="revenue">${{ scope.row.periodRevenue }}</span>
            </template>
          </el-table-column>

          <el-table-column label="所属店铺" width="200">
            <template #default="scope">
              <div class="store-tags">
                <el-tag 
                  v-for="store in scope.row.stores" 
                  :key="store.id"
                  size="small"
                  style="margin: 2px;"
                >
                  {{ store.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="趋势" width="120">
            <template #default="scope">
              <div class="trend-indicator">
                <el-icon 
                  v-if="scope.row.trend > 0"
                  color="#059669"
                  class="trend-icon"
                >
                  <ArrowUp />
                </el-icon>
                <el-icon 
                  v-else-if="scope.row.trend < 0"
                  color="#dc2626"
                  class="trend-icon"
                >
                  <ArrowDown />
                </el-icon>
                <el-icon 
                  v-else
                  color="#6b7280"
                  class="trend-icon"
                >
                  <Minus />
                </el-icon>
                <span 
                  :class="{
                    'trend-up': scope.row.trend > 0,
                    'trend-down': scope.row.trend < 0,
                    'trend-stable': scope.row.trend === 0
                  }"
                >
                  {{ scope.row.trend === 0 ? '持平' : (scope.row.trend > 0 ? '+' : '') + scope.row.trend }}
                </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button 
                size="small"
                :icon="View"
                @click="viewDetail(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
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

    <!-- 编辑价格弹窗 -->
    <!-- <EditPriceDialog
      v-model="showPriceDialog"
      :product="selectedProduct"
      @success="handleEditSuccess"
    /> -->

    <!-- 编辑库存弹窗 -->
    <!-- <EditStockDialog
      v-model="showStockDialog"
      :product="selectedProduct"
      @success="handleEditSuccess"
    /> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  List,
  TrendCharts,
  Edit, 
  View, 
  Picture,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const selectedStore = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const viewMode = ref('list') // 'list' 或 'ranking'
const rankingPeriod = ref('30')

const selectedProduct = ref(null)
const showPriceDialog = ref(false)
const showStockDialog = ref(false)

const products = ref([])
const rankingProducts = ref([])

const stores = ref([
  { id: 1, name: '我的主店铺' },
  { id: 2, name: '美国专营店' },
  { id: 3, name: '欧洲店铺' },
  { id: 4, name: '澳洲分店' }
])

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

// 模拟我的商品数据
const generateMyProducts = () => {
  const mockProducts = []
  const productNames = [
    '无线蓝牙耳机', 'iPhone手机壳', '智能手表', '便携充电宝', 
    '蓝牙音箱', 'LED台灯', '咖啡杯', '笔记本电脑包',
    '运动T恤', '牛仔裤', '运动鞋', '背包',
    '护肤面膜', '口红', '香水', '洗面奶'
  ]
  
  for (let i = 0; i < 50; i++) {
    const price = (Math.random() * 200 + 10).toFixed(2)
    const salePrice = (parseFloat(price) * (1.3 + Math.random() * 0.5)).toFixed(2)
    const totalSales = Math.floor(Math.random() * 500)
    const periodSales = Math.floor(totalSales * (0.1 + Math.random() * 0.3))
    
    const productStores = stores.value.slice(0, Math.floor(Math.random() * 3) + 1)
    
    mockProducts.push({
      id: i + 1,
      name: productNames[Math.floor(Math.random() * productNames.length)] + ` ${i + 1}`,
      code: `MY${String(i + 1).padStart(6, '0')}`,
      categoryName: categories.value[Math.floor(Math.random() * categories.value.length)].name,
      categoryId: Math.floor(Math.random() * categories.value.length) + 1,
      image: `https://picsum.photos/300/300?random=${i + 200}`,
      price: parseFloat(price),
      salePrice: parseFloat(salePrice),
      stock: Math.floor(Math.random() * 500) + 10,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      stores: productStores,
      totalSales,
      periodSales,
      periodRevenue: (periodSales * parseFloat(salePrice)).toFixed(2),
      trend: Math.floor(Math.random() * 21) - 10 // -10 到 +10
    })
  }
  
  return mockProducts
}

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockData = generateMyProducts()
    
    // 应用筛选和搜索
    let filteredData = mockData
    
    if (searchQuery.value) {
      filteredData = filteredData.filter(product => 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    if (selectedStore.value) {
      filteredData = filteredData.filter(product => 
        product.stores.some(store => store.id === selectedStore.value)
      )
    }
    
    if (selectedStatus.value) {
      filteredData = filteredData.filter(product => 
        product.status === selectedStatus.value
      )
    }
    
    if (selectedCategory.value) {
      filteredData = filteredData.filter(product => 
        product.categoryId === selectedCategory.value
      )
    }
    
    // 排序处理（销量排名视图）
    if (viewMode.value === 'ranking') {
      filteredData.sort((a, b) => b.periodSales - a.periodSales)
      rankingProducts.value = filteredData.slice(0, pagination.size)
    } else {
      // 分页处理
      pagination.total = filteredData.length
      const start = (pagination.page - 1) * pagination.size
      const end = start + pagination.size
      products.value = filteredData.slice(start, end)
    }
    
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

// 获取排名类型
const getRankingType = (index) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return ''
}

// 编辑价格
const editPrice = (product) => {
  selectedProduct.value = product
  showPriceDialog.value = true
}

// 编辑库存
const editStock = (product) => {
  selectedProduct.value = product
  showStockDialog.value = true
}

// 切换商品状态
const toggleStatus = async (product) => {
  const action = product.status === 'active' ? '下架' : '上架'
  
  try {
    await ElMessageBox.confirm(
      `确认${action}商品 "${product.name}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    product.status = product.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`商品已${action}`)
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败，请重试`)
    }
  }
}

// 查看详情
const viewDetail = (product) => {
  router.push(`/merchant/products/${product.id}`)
}

// 编辑成功处理 - 当对话框被启用时使用
// const handleEditSuccess = () => {
//   showPriceDialog.value = false
//   showStockDialog.value = false
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

// 监听视图模式变化
watch(viewMode, () => {
  pagination.page = 1
  loadProducts()
})
</script>

<style lang="scss" scoped>
@import "@/assets/styles/global.scss";

.my-products {
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

  .list-view, .ranking-view {
    .products-table, .ranking-table {
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

      .price {
        font-weight: 500;
        color: #6b7280;
      }

      .sale-price {
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

      .sales-count {
        font-weight: 600;
        color: #3b82f6;
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
  }

  .ranking-view {
    .ranking-header {
      margin-bottom: 20px;

      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        color: #1f2937;
      }

      .tip {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
    }

    .ranking-number {
      display: flex;
      align-items: center;
      justify-content: center;

      .normal-rank {
        font-weight: 600;
        color: #6b7280;
      }
    }

    .sales-number {
      font-size: 16px;
      font-weight: 600;
      color: #3b82f6;
    }

    .revenue {
      font-size: 14px;
      font-weight: 600;
      color: #059669;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      gap: 4px;

      .trend-icon {
        font-size: 16px;
      }

      .trend-up {
        color: #059669;
        font-weight: 500;
      }

      .trend-down {
        color: #dc2626;
        font-weight: 500;
      }

      .trend-stable {
        color: #6b7280;
        font-weight: 500;
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