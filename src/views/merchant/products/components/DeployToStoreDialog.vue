<template>
  <el-dialog
    v-model="dialogVisible"
    title="铺货到Shopify店铺"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep" align-center>
        <el-step title="选择店铺" />
        <el-step title="设置商品SKU" />
        <el-step title="完成" />
      </el-steps>
    </div>

    <!-- 步骤1：选择店铺 -->
    <div v-if="currentStep === 0" class="step-content">
      <h3>选择目标店铺</h3>
      <p class="tip">请选择要铺货到的Shopify店铺</p>
      
      <div class="stores-grid" v-loading="storesLoading">
        <div 
          v-for="store in stores" 
          :key="store.id"
          class="store-card"
          :class="{ 
            selected: selectedStores.includes(store.id),
            disabled: store.status !== 'active'
          }"
          @click="toggleStoreSelection(store)"
        >
          <div class="store-header">
                          <el-checkbox 
                :model-value="selectedStores.includes(store.id)"
                :disabled="store.status !== 'active'"
                @click.stop
                @change="() => toggleStoreSelection(store)"
              />
            <el-tag 
              :type="store.status === 'active' ? 'success' : 'danger'"
              size="small"
            >
              {{ store.status === 'active' ? '正常' : '未授权' }}
            </el-tag>
          </div>
          
          <div class="store-info">
            <h4>{{ store.name }}</h4>
            <p>{{ store.url }}</p>
            <div class="store-stats">
              <span>商品数: {{ store.productCount }}</span>
              <span>订单数: {{ store.orderCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty 
        v-if="!storesLoading && stores.length === 0"
        description="暂无可用店铺，请先添加Shopify店铺"
      >
        <el-button type="primary" @click="goToAddStore">
          添加店铺
        </el-button>
      </el-empty>
    </div>

    <!-- 步骤2：设置商品SKU -->
    <div v-if="currentStep === 1" class="step-content">
      <h3>线上商品SKU列表</h3>
      <p class="tip">为选中的商品分别设置售价与库存</p>

      <!-- 单个商品 -->
      <div v-if="!isBatchMode" class="single-product-form">
        <!-- SKU运送地区选择 -->
        <div class="shipping-region-selector">
          <span class="required-mark">*</span>
          <span class="label">运送到</span>
          <el-select
            v-model="selectedRegion"
            placeholder="选择运送地区"
            style="width: 200px; margin-left: 12px;"
          >
            <el-option
              v-for="region in shippingRegions"
              :key="region.value"
              :label="region.label"
              :value="region.value"
            >
              <span class="region-option">
                <span class="flag">{{ region.flag }}</span>
                <span>{{ region.label }}</span>
              </span>
            </el-option>
          </el-select>
        </div>

        <!-- SKU列表表格 -->
        <div class="sku-table-container">
          <el-table
            :data="productSkus"
            style="width: 100%"
            border
            class="sku-table"
          >
            <el-table-column label="颜色" width="120">
              <template #default="scope">
                {{ scope.row.color }}
              </template>
            </el-table-column>

            <el-table-column label="发货地" width="100">
              <template #default="scope">
                {{ scope.row.origin }}
              </template>
            </el-table-column>

            <el-table-column label="图像" width="80">
              <template #default="scope">
                <el-image
                  :src="scope.row.image"
                  style="width: 50px; height: 50px; border-radius: 4px;"
                  fit="cover"
                />
              </template>
            </el-table-column>

            <el-table-column label="GSR价格" width="120">
              <template #default="scope">
                <span class="price-text">{{ scope.row.gsrPrice }} 美元</span>
              </template>
            </el-table-column>

            <el-table-column label="运费" width="120">
              <template #default="scope">
                <span class="price-text">{{ scope.row.shipping }} 美元</span>
              </template>
            </el-table-column>

            <el-table-column label="直销总成本" width="140">
              <template #default="scope">
                <span class="cost-text">{{ scope.row.totalCost }} 美元</span>
              </template>
            </el-table-column>

            <el-table-column label="您的价格" width="150">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.yourPrice"
                  :min="scope.row.totalCost"
                  :precision="2"
                  size="small"
                  style="width: 120px;"
                />
              </template>
            </el-table-column>

            <el-table-column label="库存" width="120">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.stock"
                  :min="0"
                  size="small"
                  style="width: 100px;"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 价格相同提示 -->
        <div class="price-note">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
          <span>价格相同</span>
        </div>
      </div>

      <!-- 批量商品 -->
      <div v-else class="batch-products-form">
        <div class="batch-settings">
          <el-form :model="batchForm" label-width="120px">
            <el-form-item label="统一售价">
              <el-input-number
                v-model="batchForm.uniformPrice"
                :min="0"
                :precision="2"
                placeholder="设置统一价格"
                style="width: 200px;"
              />
              <el-button 
                type="primary" 
                size="small"
                @click="applyUniformPrice"
                style="margin-left: 12px;"
              >
                应用到所有商品
              </el-button>
            </el-form-item>

            <el-form-item label="库存设置">
              <el-radio-group v-model="batchForm.stockSync">
                <el-radio :label="true">与平台同步</el-radio>
                <el-radio :label="false">手动设置</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="!batchForm.stockSync" label="统一库存">
              <el-input-number
                v-model="batchForm.uniformStock"
                :min="0"
                placeholder="设置统一库存"
                style="width: 200px;"
              />
              <el-button 
                type="primary" 
                size="small"
                @click="applyUniformStock"
                style="margin-left: 12px;"
              >
                应用到所有商品
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="products-list">
          <h4>商品列表 ({{ products.length }} 件)</h4>
          <div class="product-items">
            <div 
              v-for="item in productForms" 
              :key="item.id"
              class="product-item"
            >
              <div class="product-basic">
                <el-image
                  :src="item.image"
                  style="width: 50px; height: 50px; border-radius: 4px;"
                  fit="cover"
                />
                <div class="basic-info">
                  <h5>{{ item.name }}</h5>
                  <p>建议: ${{ item.suggestedPrice }}</p>
                </div>
              </div>
              
              <div class="product-settings">
                <el-input-number
                  v-model="item.salePrice"
                  :min="0"
                  :precision="2"
                  placeholder="销售价格"
                  size="small"
                  style="width: 120px;"
                />
                
                <el-input-number
                  v-if="!item.stockSync"
                  v-model="item.stock"
                  :min="0"
                  placeholder="库存"
                  size="small"
                  style="width: 100px;"
                />
                <span v-else class="sync-label">同步</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤3：完成 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="success-content">
        <el-result
          icon="success"
          title="铺货成功！"
          :sub-title="successMessage"
        >
          <template #extra>
            <el-button type="primary" @click="goToMyProducts">
              查看我的商品
            </el-button>
            <el-button @click="handleClose">
              关闭
            </el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 调试信息 -->
        <div style="margin-bottom: 10px; font-size: 12px; color: #666; padding: 8px; background: #f9fafb; border-radius: 4px;">
          🔍 调试信息: 当前步骤: {{ currentStep }}, 选中店铺数: {{ selectedStores.length }}
        </div>
        
        <el-button 
          v-if="currentStep > 0 && currentStep < 2" 
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button 
          v-if="currentStep === 0"
          type="primary" 
          @click="nextStep"
          :disabled="selectedStores.length === 0"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 1"
          type="primary" 
          @click="submitDeploy"
          :loading="deploying"
        >
          完成
        </el-button>
        <el-button @click="handleClose">
          {{ currentStep === 2 ? '关闭' : '取消' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式数据
const currentStep = ref(0)
const storesLoading = ref(false)
const deploying = ref(false)

const selectedStores = ref([])
const stores = ref([
  {
    id: 1,
    name: '我的主店铺',
    url: 'my-main-store.myshopify.com',
    status: 'active',
    productCount: 156,
    orderCount: 89
  },
  {
    id: 2,
    name: '美国专营店',
    url: 'us-specialty-store.myshopify.com',
    status: 'active',
    productCount: 203,
    orderCount: 145
  },
  {
    id: 3,
    name: '欧洲店铺',
    url: 'europe-store.myshopify.com',
    status: 'active',
    productCount: 78,
    orderCount: 34
  },
  {
    id: 4,
    name: '测试店铺',
    url: 'test-store.myshopify.com',
    status: 'inactive',
    productCount: 0,
    orderCount: 0
  }
])
const selectedRegion = ref('美国tates')
const productSkus = ref([])

// 单个商品表单
const productForm = reactive({
  salePrice: 0,
  stockSync: true,
  stock: 0,
  categoryId: ''
})

// 批量表单
const batchForm = reactive({
  uniformPrice: 0,
  stockSync: true,
  uniformStock: 0
})

const productForms = ref([])

const shippingRegions = ref([
  { value: '美国tates', label: '美国tates', flag: '🇺🇸' },
  { value: '加拿大', label: '加拿大', flag: '🇨🇦' },
  { value: '英国', label: '英国', flag: '🇬🇧' },
  { value: '澳大利亚', label: '澳大利亚', flag: '🇦🇺' },
  { value: '德国', label: '德国', flag: '🇩🇪' }
])

const shopifyCategories = ref([
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Home & Garden' },
  { id: 3, name: 'Clothing & Accessories' },
  { id: 4, name: 'Sports & Outdoors' },
  { id: 5, name: 'Beauty & Personal Care' }
])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isBatchMode = computed(() => props.products.length > 0)

const dialogTitle = computed(() => {
  if (isBatchMode.value) {
    return `批量铺货 (${props.products.length} 件商品)`
  }
  return `铺货到店铺 - ${props.product?.name || ''}`
})

const successMessage = computed(() => {
  const storeCount = selectedStores.value.length
  const productCount = isBatchMode.value ? props.products.length : 1
  return `已成功将 ${productCount} 件商品铺货到 ${storeCount} 个店铺`
})

// 监听器
watch(dialogVisible, (visible) => {
  if (visible) {
    resetDialog()
    loadStores()
    initializeForms()
  }
})

// 方法
const resetDialog = () => {
  currentStep.value = 0
  selectedStores.value = []
  deploying.value = false
}

const initializeForms = () => {
  if (props.product) {
    productForm.salePrice = props.product.suggestedPrice || 0
    productForm.stockSync = true
    productForm.stock = props.product.stock || 0
    productForm.categoryId = ''
    
    // 初始化产品SKU数据
    productSkus.value = [
      {
        color: '青色',
        origin: '中国',
        image: 'https://picsum.photos/100/100?random=1',
        gsrPrice: 0.48,
        shipping: 5.72,
        totalCost: 6.20,
        yourPrice: 6.20,
        stock: 100
      },
      {
        color: '紫色的',
        origin: '中国',
        image: 'https://picsum.photos/100/100?random=2',
        gsrPrice: 0.48,
        shipping: 5.72,
        totalCost: 6.20,
        yourPrice: 6.20,
        stock: 100
      },
      {
        color: '黄色的',
        origin: '中国',
        image: 'https://picsum.photos/100/100?random=3',
        gsrPrice: 0.48,
        shipping: 5.72,
        totalCost: 6.20,
        yourPrice: 6.20,
        stock: 100
      }
    ]
  }
  
  if (isBatchMode.value) {
    productForms.value = props.products.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      suggestedPrice: product.suggestedPrice,
      salePrice: product.suggestedPrice || 0,
      stockSync: true,
      stock: product.stock || 0
    }))
  }
}

const loadStores = async () => {
  storesLoading.value = true
  try {
    // 模拟API调用 - 简化版本，数据已经在初始化时设置
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('店铺数据加载完成:', stores.value)
  } catch (error) {
    ElMessage.error('加载店铺列表失败')
  } finally {
    storesLoading.value = false
  }
}

const toggleStoreSelection = (store) => {
  if (store.status !== 'active') return
  
  const index = selectedStores.value.indexOf(store.id)
  if (index > -1) {
    selectedStores.value.splice(index, 1)
  } else {
    selectedStores.value.push(store.id)
  }
  
  console.log('选中的店铺:', selectedStores.value)
}

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const applyUniformPrice = () => {
  if (batchForm.uniformPrice > 0) {
    productForms.value.forEach(item => {
      item.salePrice = batchForm.uniformPrice
    })
    ElMessage.success('已应用统一价格')
  }
}

const applyUniformStock = () => {
  if (batchForm.uniformStock >= 0) {
    productForms.value.forEach(item => {
      item.stock = batchForm.uniformStock
      item.stockSync = false
    })
    ElMessage.success('已应用统一库存')
  }
}

const submitDeploy = async () => {
  // 验证表单
  if (isBatchMode.value) {
    const hasEmptyPrice = productForms.value.some(item => !item.salePrice || item.salePrice <= 0)
    if (hasEmptyPrice) {
      ElMessage.error('请为所有商品设置有效的销售价格')
      return
    }
  } else {
    if (!productForm.salePrice || productForm.salePrice <= 0) {
      ElMessage.error('请设置有效的销售价格')
      return
    }
  }
  
  deploying.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    ElMessage.success('铺货成功')
    currentStep.value = 2
    
    // 通知父组件
    emit('success')
    
  } catch (error) {
    ElMessage.error('铺货失败，请重试')
  } finally {
    deploying.value = false
  }
}

const goToAddStore = () => {
  dialogVisible.value = false
  router.push('/merchant/stores/add')
}

const goToMyProducts = () => {
  dialogVisible.value = false
  router.push('/merchant/products/my')
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.steps-wrapper {
  margin-bottom: 32px;
}

.step-content {
  min-height: 400px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #1f2937;
  }
  
  .tip {
    margin: 0 0 24px 0;
    color: #6b7280;
    font-size: 14px;
  }
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  
  .store-card {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(.disabled) {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    
    &.selected {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .store-info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #1f2937;
      }
      
      p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #6b7280;
      }
      
      .store-stats {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #9ca3af;
      }
    }
  }
}

.single-product-form {
  .shipping-region-selector {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    
    .required-mark {
      color: #ef4444;
      font-weight: bold;
      margin-right: 4px;
    }
    
    .label {
      font-weight: 500;
      color: #374151;
    }
    
    .region-option {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .flag {
        font-size: 16px;
      }
    }
  }
  
  .sku-table-container {
    margin-bottom: 16px;
    
    .sku-table {
      .price-text {
        color: #059669;
        font-weight: 500;
      }
      
      .cost-text {
        color: #dc2626;
        font-weight: 500;
      }
    }
  }
  
  .price-note {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 6px;
    color: #1e40af;
    font-size: 14px;
    
    .info-icon {
      color: #3b82f6;
    }
  }
}

.batch-products-form {
  .batch-settings {
    background: #f9fafb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .products-list {
    h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #1f2937;
    }
    
    .product-items {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      
      .product-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        
        &:last-child {
          border-bottom: none;
        }
        
        .product-basic {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          
          .basic-info {
            h5 {
              margin: 0 0 2px 0;
              font-size: 14px;
              color: #1f2937;
            }
            
            p {
              margin: 0;
              font-size: 12px;
              color: #6b7280;
            }
          }
        }
        
        .product-settings {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .sync-label {
            font-size: 12px;
            color: #059669;
            padding: 0 8px;
          }
        }
      }
    }
  }
}

.success-content {
  text-align: center;
  padding: 32px 0;
  
  .el-button {
    min-width: 100px;
    font-weight: 500;
    
    &.el-button--primary {
      background: #1f2937 !important;
      border-color: #1f2937 !important;
      color: white !important;
      
      &:hover {
        background: #374151 !important;
        border-color: #374151 !important;
      }
    }
    
    &:not(.el-button--primary) {
      background: #f3f4f6 !important;
      border-color: #d1d5db !important;
      color: #374151 !important;
      
      &:hover {
        background: #e5e7eb !important;
        border-color: #9ca3af !important;
        color: #1f2937 !important;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  .el-button {
    min-width: 80px;
    font-weight: 500;
    
    // 主要按钮样式（下一步、完成）
    &.el-button--primary {
      background: #1f2937 !important;
      border-color: #1f2937 !important;
      color: white !important;
      
      &:hover:not(:disabled) {
        background: #374151 !important;
        border-color: #374151 !important;
      }
      
      &:disabled {
        background: #9ca3af !important;
        border-color: #9ca3af !important;
        color: #f3f4f6 !important;
      }
    }
    
    // 普通按钮样式（上一步、取消）
    &:not(.el-button--primary) {
      background: #f3f4f6 !important;
      border-color: #d1d5db !important;
      color: #374151 !important;
      
      &:hover {
        background: #e5e7eb !important;
        border-color: #9ca3af !important;
        color: #1f2937 !important;
      }
    }
  }
}
</style> 