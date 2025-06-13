<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <div class="steps-wrapper">
      <el-steps :active="currentStep" align-center>
        <el-step title="选择店铺" />
        <el-step title="设置详情" />
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

    <!-- 步骤2：设置详情 -->
    <div v-if="currentStep === 1" class="step-content">
      <h3>设置商品详情</h3>
      <p class="tip">为选中的商品设置价格和库存信息</p>

      <!-- 单个商品 -->
      <div v-if="!isBatchMode" class="single-product-form">
        <div class="product-preview">
          <el-image
            :src="product?.image"
            style="width: 100px; height: 100px; border-radius: 8px;"
            fit="cover"
          />
          <div class="product-info">
            <h4>{{ product?.name }}</h4>
            <p>编号: {{ product?.code }}</p>
            <p>建议售价: ${{ product?.suggestedPrice }}</p>
          </div>
        </div>

        <el-form :model="productForm" label-width="120px" class="detail-form">
          <el-form-item label="销售价格" required>
            <el-input-number
              v-model="productForm.salePrice"
              :min="0"
              :precision="2"
              placeholder="请输入销售价格"
              style="width: 200px;"
            />
            <span class="unit">美元</span>
          </el-form-item>

          <el-form-item label="库存设置">
            <el-radio-group v-model="productForm.stockSync">
              <el-radio :label="true">与平台同步</el-radio>
              <el-radio :label="false">手动设置</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="!productForm.stockSync" label="库存数量">
            <el-input-number
              v-model="productForm.stock"
              :min="0"
              placeholder="请输入库存数量"
              style="width: 200px;"
            />
          </el-form-item>

          <el-form-item label="商品分类">
            <el-select
              v-model="productForm.categoryId"
              placeholder="选择店铺分类"
              style="width: 300px;"
            >
              <el-option
                v-for="category in shopifyCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
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
        <el-button 
          v-if="currentStep > 0 && currentStep < 2" 
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button 
          v-if="currentStep < 1"
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
          确认铺货
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
const stores = ref([])

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
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    stores.value = [
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
    ]
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
  .product-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .product-info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #1f2937;
      }
      
      p {
        margin: 0 0 2px 0;
        font-size: 12px;
        color: #6b7280;
      }
    }
  }
  
  .detail-form {
    .unit {
      margin-left: 8px;
      color: #6b7280;
      font-size: 14px;
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
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 