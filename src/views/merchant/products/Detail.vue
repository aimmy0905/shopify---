<template>
  <div class="product-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button :icon="ArrowLeft" @click="goBack">
        返回商品列表
      </el-button>
    </div>

    <!-- 商品详情卡片 -->
    <div class="product-card" v-loading="loading">
      <div class="product-header">
        <div class="product-images">
          <el-image
            :src="product.image"
            :alt="product.name"
            class="main-image"
            fit="cover"
            :preview-src-list="[product.image]"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </template>
          </el-image>
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="product-code">商品编号: {{ product.code }}</p>
          
          <div class="price-info">
            <div class="price-row">
              <span class="label">成本价格:</span>
              <span class="cost-price">${{ product.price }}</span>
            </div>
            <div class="price-row">
              <span class="label">建议售价:</span>
              <span class="suggested-price">${{ product.suggestedPrice }}</span>
            </div>
            <div class="price-row" v-if="product.salePrice">
              <span class="label">当前售价:</span>
              <span class="sale-price">${{ product.salePrice }}</span>
            </div>
          </div>

          <div class="stock-info">
            <span class="label">库存数量:</span>
            <span 
              class="stock-value"
              :class="{ 'low-stock': product.stock < 10 }"
            >
              {{ product.stock }}
            </span>
          </div>

          <div class="category-info">
            <span class="label">商品分类:</span>
            <el-tag type="info">{{ product.categoryName }}</el-tag>
          </div>

          <div class="status-info">
            <span class="label">商品状态:</span>
            <el-tag 
              :type="product.status === 'active' ? 'success' : 'info'"
            >
              {{ product.status === 'active' ? '上架中' : '已下架' }}
            </el-tag>
          </div>
        </div>

        <div class="product-actions">
          <el-button 
            type="primary" 
            :icon="Edit"
            @click="editPrice"
          >
            编辑价格
          </el-button>
          <el-button 
            :icon="Setting"
            @click="editStock"
          >
            编辑库存
          </el-button>
          <el-button 
            :type="product.status === 'active' ? 'danger' : 'success'"
            @click="toggleStatus"
          >
            {{ product.status === 'active' ? '下架商品' : '上架商品' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 销售数据统计 -->
    <div class="sales-section">
      <h2>销售数据</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#3b82f6"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ product.totalSales || 0 }}</h3>
            <p>累计销量</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#059669"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <h3>${{ product.totalRevenue || '0.00' }}</h3>
            <p>累计收入</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#dc2626"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ product.pendingOrders || 0 }}</h3>
            <p>待处理订单</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft,
  Edit,
  Setting,
  Picture,
  TrendCharts,
  Money,
  ShoppingCart
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const product = ref({
  id: 1,
  name: '智能蓝牙耳机 Pro',
  code: 'PRD000001',
  image: 'https://picsum.photos/400/400?random=1',
  price: 29.99,
  suggestedPrice: 59.99,
  salePrice: 49.99,
  stock: 150,
  categoryName: '电子产品',
  status: 'active',
  totalSales: 68,
  totalRevenue: '3399.32',
  pendingOrders: 5
})

// 加载商品详情
const loadProductDetail = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该根据路由参数获取商品详情
    const productId = route.params.id
    console.log('Loading product:', productId)
    
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    console.error('Error loading product detail:', error)
  } finally {
    loading.value = false
  }
}

// 编辑价格
const editPrice = () => {
  ElMessage.info('编辑价格功能正在开发中')
}

// 编辑库存
const editStock = () => {
  ElMessage.info('编辑库存功能正在开发中')
}

// 切换商品状态
const toggleStatus = async () => {
  const action = product.value.status === 'active' ? '下架' : '上架'
  
  try {
    await ElMessageBox.confirm(
      `确认${action}商品 "${product.value.name}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    product.value.status = product.value.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`商品已${action}`)
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败，请重试`)
    }
  }
}

// 返回列表
const goBack = () => {
  router.push('/merchant/products/my')
}

// 生命周期
onMounted(() => {
  loadProductDetail()
})
</script>

<style lang="scss" scoped>
.product-detail {
  .back-button {
    margin-bottom: 20px;
  }

  .product-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .product-header {
      display: grid;
      grid-template-columns: 300px 1fr auto;
      gap: 24px;
      align-items: start;

      .product-images {
        .main-image {
          width: 100%;
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          background: #f9fafb;
          border-radius: 8px;
          color: #9ca3af;

          .el-icon {
            font-size: 48px;
            margin-bottom: 8px;
          }
        }
      }

      .product-info {
        h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
        }

        .product-code {
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .price-info, .stock-info, .category-info, .status-info {
          margin-bottom: 16px;

          .label {
            font-weight: 500;
            color: #374151;
            margin-right: 8px;
          }

          .price-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .cost-price {
              color: #6b7280;
              font-weight: 500;
            }

            .suggested-price {
              color: #059669;
              font-weight: 600;
            }

            .sale-price {
              color: #dc2626;
              font-weight: 600;
              font-size: 18px;
            }
          }
        }

        .stock-value {
          font-weight: 600;
          color: #059669;

          &.low-stock {
            color: #dc2626;
          }
        }
      }

      .product-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 150px;
      }
    }
  }

  .sales-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;

      .stat-icon {
        .el-icon {
          font-size: 32px;
        }
      }

      .stat-info {
        h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .product-detail {
    .product-card .product-header {
      grid-template-columns: 1fr;
      gap: 20px;

      .product-actions {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  }
}
</style> 