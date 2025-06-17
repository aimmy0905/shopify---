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
          <!-- 主图 -->
          <el-image
            :src="currentImage"
            :alt="product.name"
            class="main-image"
            fit="cover"
            :preview-src-list="product.images"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </template>
          </el-image>

          <!-- 缩略图 -->
          <div class="image-thumbnails" v-if="product.images && product.images.length > 1">
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
              @click="switchImage(index)"
            >
              <el-image
                :src="image"
                fit="cover"
                class="thumbnail-image"
              />
            </div>
          </div>
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="product-code">商品编号: {{ product.code }}</p>

          <!-- 价格信息 -->
          <div class="price-info">
            <div class="price-row">
              <span class="label">Product Price</span>
              <span class="product-price">${{ currentProductPrice.toFixed(2) }}</span>
            </div>
          </div>

          <!-- SKU选择 -->
          <div class="sku-selection" v-if="product.skus && product.skus.length > 0">
            <!-- 颜色选择 -->
            <div class="sku-option" v-if="colorOptions.length > 0">
              <span class="sku-label">颜色:</span>
              <div class="color-options">
                <el-button
                  v-for="color in colorOptions"
                  :key="color"
                  :type="selectedColor === color ? 'primary' : 'default'"
                  size="small"
                  @click="selectColor(color)"
                  class="color-button"
                >
                  {{ color }}
                </el-button>
              </div>
            </div>

            <!-- 尺码选择 -->
            <div class="sku-option" v-if="sizeOptions.length > 0">
              <span class="sku-label">尺码:</span>
              <div class="size-options">
                <el-button
                  v-for="size in sizeOptions"
                  :key="size"
                  :type="selectedSize === size ? 'primary' : 'default'"
                  size="small"
                  @click="selectSize(size)"
                  class="size-button"
                >
                  {{ size }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 库存和基本信息 -->
          <div class="stock-info">
            <span class="label">库存数量:</span>
            <span
              class="stock-value"
              :class="{ 'low-stock': currentStock < 10 }"
            >
              {{ currentStock }}
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
          <!-- 平台商品操作按钮 -->
          <template v-if="isFromPlatform">
            <div class="action-header">
              <h3>商品操作</h3>
            </div>
            <el-button
              type="primary"
              :icon="Plus"
              @click="addToImportList"
              size="large"
              class="import-button"
            >
              <span class="button-text">导入产品列表</span>
            </el-button>
            <div class="action-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>添加到导入列表后可统一管理和铺货</span>
            </div>
          </template>

          <!-- 我的商品操作按钮 -->
          <template v-else>
            <div class="action-header">
              <h3>商品管理</h3>
            </div>
            <el-button
              type="primary"
              :icon="Edit"
              @click="editPrice"
              style="width: 100%; margin-bottom: 8px;"
            >
              编辑价格
            </el-button>
            <el-button
              :icon="Setting"
              @click="editStock"
              style="width: 100%; margin-bottom: 8px;"
            >
              编辑库存
            </el-button>
            <el-button
              :type="product.status === 'active' ? 'danger' : 'success'"
              @click="toggleStatus"
              style="width: 100%;"
            >
              {{ product.status === 'active' ? '下架商品' : '上架商品' }}
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 运送信息 -->
    <div class="shipping-section">
      <h2>运送信息</h2>
      <div class="shipping-content">
        <div class="shipping-options">
          <!-- 运送国家选择 -->
          <div class="shipping-item">
            <span class="shipping-label">运送至:</span>
            <el-select v-model="selectedCountry" placeholder="选择国家" style="width: 200px;">
              <el-option
                v-for="country in shippingCountries"
                :key="country.code"
                :label="country.name"
                :value="country.code"
              >
                <span>{{ country.flag }} {{ country.name }}</span>
              </el-option>
            </el-select>
          </div>

          <!-- 快递方式 -->
          <div class="shipping-item">
            <span class="shipping-label">快递方式:</span>
            <el-radio-group v-model="selectedShipping" class="shipping-methods">
              <el-radio
                v-for="method in shippingMethods"
                :key="method.id"
                :label="method.id"
                class="shipping-method"
              >
                <div class="method-info">
                  <div class="method-name">{{ method.name }}</div>
                  <div class="method-details">
                    <span class="method-price">${{ method.price }}</span>
                    <span class="method-time">{{ method.deliveryTime }}</span>
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 运费 -->
          <div class="shipping-item">
            <span class="shipping-label">Shipping Cost</span>
            <span class="shipping-cost">${{ currentShippingPrice.toFixed(2) }}</span>
          </div>

          <!-- 总价格 -->
          <div class="shipping-item total-price-item">
            <span class="shipping-label">Total Price</span>
            <span class="total-price">${{ totalPrice.toFixed(2) }}</span>
          </div>

          <!-- 商品重量 -->
          <div class="shipping-item">
            <span class="shipping-label">Weight</span>
            <span class="shipping-value">{{ product.weight }}kg</span>
          </div>

          <!-- 预计送达时间 -->
          <div class="shipping-item">
            <span class="shipping-label">Estimated Delivery Time</span>
            <span class="shipping-value">{{ estimatedDelivery }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品描述 -->
    <div class="description-section">
      <h2>产品描述</h2>
      <div class="description-content">
        <div class="description-text" v-html="product.description"></div>
      </div>
    </div>

    <!-- 产品详情 -->
    <div class="details-section">
      <h2>产品详情</h2>
      <div class="details-content">
        <!-- 规格参数 -->
        <div class="specifications">
          <h3>规格参数</h3>
          <el-table :data="product.specifications" style="width: 100%">
            <el-table-column prop="name" label="参数名称" width="200" />
            <el-table-column prop="value" label="参数值" />
          </el-table>
        </div>

        <!-- 详情图片 -->
        <div class="detail-images" v-if="product.detailImages && product.detailImages.length > 0">
          <h3>详情图片</h3>
          <div class="detail-image-list">
            <el-image
              v-for="(image, index) in product.detailImages"
              :key="index"
              :src="image"
              fit="cover"
              class="detail-image"
              :preview-src-list="product.detailImages"
            />
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Setting,
  Picture,
  Plus,
  InfoFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const currentImageIndex = ref(0)
const selectedColor = ref('')
const selectedSize = ref('')
const selectedCountry = ref('US')
const selectedShipping = ref(1)

// 判断是否来自平台商品页面
const isFromPlatform = computed(() => {
  // 检查多种可能的标识方式
  return route.query.from === 'platform' || 
         route.query.source === 'all' ||
         route.path.includes('/merchant/products/') && route.query.from !== 'my'
})

// 商品数据
const product = ref({
  id: 1,
  name: 'Casual Tide Casual Short-sleeved Drawstring Shorts Men\'s Set Summer Breathable Ice Silk Pajamas Home Service T-shirt',
  code: 'PRD000001',
  images: [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3',
    'https://picsum.photos/400/400?random=4'
  ],
  price: 29.99,
  suggestedPrice: 59.99,
  salePrice: 49.99,
  stock: 150,
  weight: 0.5,
  categoryName: '男装',
  status: 'active',
  description: `
    <p>这款休闲套装采用优质冰丝面料制作，透气性极佳，非常适合夏季穿着。</p>
    <p><strong>产品特点：</strong></p>
    <ul>
      <li>冰丝面料，透气舒适</li>
      <li>抽绳设计，可调节松紧</li>
      <li>短袖短裤套装，清爽舒适</li>
      <li>居家外出两相宜</li>
    </ul>
  `,
  specifications: [
    { name: '面料成分', value: '95%聚酯纤维 + 5%氨纶' },
    { name: '适用季节', value: '夏季' },
    { name: '适用场景', value: '居家、休闲' },
    { name: '洗涤方式', value: '机洗，温度不超过30°C' },
    { name: '产地', value: '中国' }
  ],
  detailImages: [
    'https://picsum.photos/800/600?random=10',
    'https://picsum.photos/800/600?random=11',
    'https://picsum.photos/800/600?random=12'
  ],
  skus: [
    { id: 1, color: 'White', size: 'M', price: 49.99, stock: 50 },
    { id: 2, color: 'White', size: 'L', price: 49.99, stock: 30 },
    { id: 3, color: 'White', size: 'XL', price: 49.99, stock: 20 },
    { id: 4, color: 'Khaki', size: 'M', price: 52.99, stock: 25 },
    { id: 5, color: 'Khaki', size: 'L', price: 52.99, stock: 15 },
    { id: 6, color: 'Khaki', size: 'XL', price: 52.99, stock: 10 },
    { id: 7, color: 'Black', size: 'M', price: 54.99, stock: 40 },
    { id: 8, color: 'Black', size: 'L', price: 54.99, stock: 35 },
    { id: 9, color: 'Black', size: 'XL', price: 54.99, stock: 25 },
    { id: 10, color: 'Blue', size: 'M', price: 51.99, stock: 20 },
    { id: 11, color: 'Blue', size: 'L', price: 51.99, stock: 18 },
    { id: 12, color: 'Blue', size: 'XL', price: 51.99, stock: 12 }
  ]
})

// 运送国家数据
const shippingCountries = ref([
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' }
])

// 快递方式数据
const shippingMethods = ref([
  { id: 1, name: 'Standard Shipping', price: 5.99, deliveryTime: '7-15 business days' },
  { id: 2, name: 'Express Shipping', price: 12.99, deliveryTime: '3-7 business days' },
  { id: 3, name: 'Priority Shipping', price: 19.99, deliveryTime: '1-3 business days' }
])

// 计算属性
const currentImage = computed(() => {
  return product.value.images?.[currentImageIndex.value] || product.value.images?.[0] || ''
})

const colorOptions = computed(() => {
  const colors = [...new Set(product.value.skus?.map(sku => sku.color) || [])]
  return colors
})

const sizeOptions = computed(() => {
  if (!selectedColor.value) return []
  const sizes = product.value.skus
    ?.filter(sku => sku.color === selectedColor.value)
    ?.map(sku => sku.size) || []
  return [...new Set(sizes)]
})

const selectedSku = computed(() => {
  if (!selectedColor.value || !selectedSize.value) return null
  return product.value.skus?.find(sku =>
    sku.color === selectedColor.value && sku.size === selectedSize.value
  ) || null
})

const currentStock = computed(() => {
  return selectedSku.value ? selectedSku.value.stock : product.value.stock
})

// 当前商品价格（不含运费）
const currentProductPrice = computed(() => {
  return selectedSku.value ? selectedSku.value.price : product.value.salePrice
})

// 当前运费价格
const currentShippingPrice = computed(() => {
  const selectedMethod = shippingMethods.value.find(m => m.id === selectedShipping.value)
  return selectedMethod ? selectedMethod.price : 0
})

// 总价格（商品价格 + 运费）
const totalPrice = computed(() => {
  return currentProductPrice.value + currentShippingPrice.value
})

const estimatedDelivery = computed(() => {
  const selectedMethod = shippingMethods.value.find(m => m.id === selectedShipping.value)
  if (!selectedMethod) return ''

  const today = new Date()
  const minDays = parseInt(selectedMethod.deliveryTime.split('-')[0])
  const maxDays = parseInt(selectedMethod.deliveryTime.split('-')[1]) || minDays

  const minDate = new Date(today.getTime() + minDays * 24 * 60 * 60 * 1000)
  const maxDate = new Date(today.getTime() + maxDays * 24 * 60 * 60 * 1000)

  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
})

// 方法
const switchImage = (index) => {
  currentImageIndex.value = index
}

const selectColor = (color) => {
  selectedColor.value = color
  selectedSize.value = '' // 重置尺码选择
}

const selectSize = (size) => {
  selectedSize.value = size
}



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

// 添加到导入产品列表
const addToImportList = async () => {
  try {
    await ElMessageBox.confirm(
      `确认将商品 "${product.value.name}" 添加到导入产品列表吗？`,
      '添加确认',
      {
        confirmButtonText: '确认添加',
        cancelButtonText: '取消',
        type: 'info',
        dangerouslyUseHTMLString: true,
        message: `
          <div style="text-align: left;">
            <p><strong>商品名称：</strong>${product.value.name}</p>
            <p><strong>商品编号：</strong>${product.value.code}</p>
            <p><strong>建议售价：</strong>$${product.value.suggestedPrice}</p>
            <p style="margin-top: 15px; color: #909399; font-size: 13px;">
              添加后您可以在"导入产品列表"中查看和管理此商品
            </p>
          </div>
        `
      }
    )

    // 显示加载状态
    const loadingMessage = ElMessage({
      message: '正在添加到导入产品列表...',
      type: 'info',
      duration: 0,
      showClose: false
    })

    try {
      // 模拟API调用 - 添加商品到导入列表
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟存储到本地存储（实际项目中应该调用API）
      const importList = JSON.parse(localStorage.getItem('importProductList') || '[]')
      
      // 检查是否已经存在
      const existingIndex = importList.findIndex(item => item.id === product.value.id)
      
      if (existingIndex === -1) {
        // 添加商品信息到导入列表
        const importProduct = {
          id: product.value.id,
          name: product.value.name,
          code: product.value.code,
          image: product.value.images[0],
          price: product.value.price,
          suggestedPrice: product.value.suggestedPrice,
          salePrice: product.value.salePrice,
          stock: product.value.stock,
          categoryName: product.value.categoryName,
          addedAt: new Date().toISOString(),
          isDeployed: false,
          deployedStores: []
        }
        
        importList.push(importProduct)
        localStorage.setItem('importProductList', JSON.stringify(importList))
        
        loadingMessage.close()
        
        // 显示成功消息
        ElMessage.success({
          message: '商品已成功添加到导入产品列表！',
          duration: 3000
        })

        // 询问是否立即查看导入列表
        setTimeout(async () => {
          try {
            await ElMessageBox.confirm(
              '商品已添加成功！是否立即前往导入产品列表查看？',
              '添加成功',
              {
                confirmButtonText: '立即查看',
                cancelButtonText: '稍后查看',
                type: 'success'
              }
            )
            
            // 跳转到导入列表页面
            router.push('/merchant/products/import')
            
          } catch (error) {
            // 用户选择稍后查看，不做任何操作
          }
        }, 500)
        
      } else {
        loadingMessage.close()
        ElMessage.warning('该商品已在导入产品列表中')
      }
      
    } catch (apiError) {
      loadingMessage.close()
      ElMessage.error('添加失败，请检查网络连接后重试')
    }

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
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
  if (isFromPlatform.value) {
    router.push('/merchant/products/all')
  } else {
    router.push('/merchant/products/my')
  }
}

// 生命周期
onMounted(() => {
  loadProductDetail()

  // 初始化默认选择
  if (product.value.skus && product.value.skus.length > 0) {
    selectedColor.value = colorOptions.value[0] || ''
    if (selectedColor.value) {
      selectedSize.value = sizeOptions.value[0] || ''
    }
  }
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
      grid-template-columns: 300px 1fr 200px;
      gap: 24px;
      align-items: start;
      
      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .product-images {
        .main-image {
          width: 100%;
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .image-thumbnails {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          .thumbnail {
            width: 60px;
            height: 60px;
            border: 2px solid transparent;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            transition: border-color 0.3s;

            &:hover {
              border-color: #409eff;
            }

            &.active {
              border-color: #409eff;
            }

            .thumbnail-image {
              width: 100%;
              height: 100%;
            }
          }
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
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .label {
              font-weight: 500;
              color: #374151;
            }

            .product-price {
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

        .sku-selection {
          margin: 20px 0;

          .sku-option {
            margin-bottom: 16px;

            .sku-label {
              display: block;
              font-weight: 500;
              color: #374151;
              margin-bottom: 8px;
            }

            .color-options {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;

              .color-button {
                min-width: 60px;
              }
            }

            .size-options {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;

              .size-button {
                min-width: 50px;
              }
            }
          }
        }
      }

      .product-actions {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 220px;
        background: white;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #f0f0f0;
        position: sticky;
        top: 20px;

        .action-header {
          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #f3f4f6;
          }
        }

        .import-button {
          width: 100%;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }

          &:active {
            transform: translateY(0);
          }

          .button-text {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: white;
          }
        }

        .action-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;

          .el-icon {
            color: #3b82f6;
            font-size: 16px;
          }
        }
      }
    }
  }

  .shipping-section, .description-section, .details-section {
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

  .shipping-content {
    .shipping-options {
      .shipping-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .shipping-label {
          font-weight: 500;
          color: #374151;
        }

        .shipping-value {
          color: #6b7280;
        }

        .shipping-cost {
          color: #dc2626;
          font-weight: 600;
          font-size: 16px;
        }

        &.total-price-item {
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;

          .total-price {
            color: #dc2626;
            font-weight: 700;
            font-size: 20px;
          }
        }

        .shipping-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .shipping-method {
            .method-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 300px;

              .method-name {
                font-weight: 500;
              }

              .method-details {
                display: flex;
                gap: 12px;
                font-size: 14px;

                .method-price {
                  color: #059669;
                  font-weight: 600;
                }

                .method-time {
                  color: #6b7280;
                }
              }
            }
          }
        }
      }
    }
  }

  .description-content {
    .description-text {
      line-height: 1.6;
      color: #374151;

      p {
        margin-bottom: 12px;
      }

      ul {
        margin: 12px 0;
        padding-left: 20px;

        li {
          margin-bottom: 6px;
        }
      }
    }
  }

  .details-content {
    .specifications {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .detail-images {
      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }

      .detail-image-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .detail-image {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
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

    .shipping-content .shipping-options .shipping-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .shipping-label {
        min-width: auto;
        margin-right: 0;
      }

      .shipping-methods .shipping-method .method-info {
        width: 100%;
      }
    }

    .details-content .detail-images .detail-image-list {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .product-detail {
    .product-images .image-thumbnails {
      justify-content: center;
    }

    .sku-selection .sku-option {
      .color-options {
        justify-content: center;
      }

      .size-options {
        justify-content: center;
      }
    }

    .shipping-content .shipping-options .shipping-item .shipping-methods {
      width: 100%;

      .shipping-method .method-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  }
}
</style> 