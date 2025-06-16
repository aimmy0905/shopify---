<template>
  <div class="product-edit-container">
    <!-- 面包屑导航 -->
    <a-breadcrumb style="margin-bottom: 16px;">
      <a-breadcrumb-item>
        <router-link to="/admin/dashboard">首页</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/admin/products">商品管理</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>编辑商品</a-breadcrumb-item>
    </a-breadcrumb>

    <a-spin :spinning="loading">
      <a-card title="编辑商品" :bordered="false">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          @finish="handleSubmit"
        >
          <!-- 基本信息 -->
          <a-card title="基本信息" size="small" style="margin-bottom: 24px;">
            <a-form-item label="商品名称" name="name">
              <a-input 
                v-model:value="formData.name" 
                placeholder="请输入商品名称"
                show-count
                :maxlength="100"
              />
            </a-form-item>

            <a-form-item label="商品分类" name="categoryId">
              <a-tree-select
                v-model:value="formData.categoryId"
                :tree-data="categoryOptions"
                placeholder="请选择商品分类"
                tree-node-filter-prop="title"
                allow-clear
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
              />
            </a-form-item>

            <a-form-item label="商品编号" name="code">
              <a-input 
                v-model:value="formData.code" 
                placeholder="商品编号"
                addon-before="PRD"
                disabled
              />
              <template #extra>
                <span style="color: #999;">商品编号创建后不可修改</span>
              </template>
            </a-form-item>

            <a-form-item label="商品描述" name="description">
              <a-textarea
                v-model:value="formData.description"
                :rows="4"
                placeholder="请输入商品描述"
                show-count
                :maxlength="500"
              />
            </a-form-item>
          </a-card>

          <!-- 商品图片 -->
          <a-card title="商品图片" size="small" style="margin-bottom: 24px;">
            <a-form-item label="商品图片" name="images">
              <div class="upload-area">
                <a-upload
                  v-model:file-list="fileList"
                  action="/api/upload"
                  list-type="picture-card"
                  :before-upload="beforeUpload"
                  @change="handleImageChange"
                  @preview="handlePreview"
                  :multiple="true"
                  :max-count="8"
                >
                  <div v-if="fileList.length < 8">
                    <PlusOutlined />
                    <div style="margin-top: 8px">上传图片</div>
                  </div>
                </a-upload>
                <a-modal 
                  v-model:visible="previewVisible" 
                  :title="previewTitle" 
                  :footer="null"
                >
                  <img alt="preview" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
              <template #extra>
                <div style="color: #999;">
                  <p>• 支持 JPG、PNG 格式，单张图片不超过 5MB</p>
                  <p>• 建议尺寸：800×800像素，最多上传8张图片</p>
                  <p>• 第一张图片将作为主图展示</p>
                </div>
              </template>
            </a-form-item>
          </a-card>

          <!-- 价格库存 -->
          <a-card title="价格库存" size="small" style="margin-bottom: 24px;">
            <a-row :gutter="24">
              <a-col :span="8">
                <a-form-item label="商品价格" name="price">
                  <a-input-number
                    v-model:value="formData.price"
                    :min="0"
                    :precision="2"
                    placeholder="0.00"
                    addon-before="$"
                    style="width: 100%;"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="建议零售价" name="suggestedPrice">
                  <a-input-number
                    v-model:value="formData.suggestedPrice"
                    :min="0"
                    :precision="2"
                    placeholder="0.00"
                    addon-before="$"
                    style="width: 100%;"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="当前库存" name="stock">
                  <a-input-number
                    v-model:value="formData.stock"
                    :min="0"
                    placeholder="当前库存"
                    style="width: 100%;"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <!-- 利润计算 -->
            <div v-if="formData.price && formData.cost" class="profit-calculation">
              <a-alert
                :message="`预计利润: $${calculateProfit().toFixed(2)} (利润率: ${calculateProfitRate().toFixed(1)}%)`"
                type="info"
                show-icon
              />
            </div>

            <!-- 库存操作 -->
            <div class="stock-operations">
              <h4>库存调整</h4>
              <a-row :gutter="12" align="middle">
                <a-col :span="6">
                  <a-select v-model:value="stockOperation" placeholder="操作类型">
                    <a-select-option value="add">增加库存</a-select-option>
                    <a-select-option value="reduce">减少库存</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="6">
                  <a-input-number 
                    v-model:value="stockAmount" 
                    :min="1" 
                    placeholder="数量"
                    style="width: 100%;"
                  />
                </a-col>
                <a-col :span="8">
                  <a-input v-model:value="stockRemark" placeholder="备注原因" />
                </a-col>
                <a-col :span="4">
                  <a-button type="primary" @click="handleStockAdjust">调整</a-button>
                </a-col>
              </a-row>
            </div>
          </a-card>

          <!-- 供应商信息 -->
          <a-card title="供应商信息" size="small" style="margin-bottom: 24px;">
            <a-form-item label="选择供应商" name="supplierId">
              <a-select
                v-model:value="formData.supplierId"
                placeholder="请选择供应商"
                show-search
                filter-option
                style="width: 300px;"
              >
                <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="采购成本" name="cost">
              <a-input-number
                v-model:value="formData.cost"
                :min="0"
                :precision="2"
                placeholder="单价成本"
                addon-before="$"
                style="width: 200px;"
              />
              <span style="margin-left: 8px; color: #999;">单价</span>
            </a-form-item>
          </a-card>

          <!-- 运费设置 -->
          <a-card title="运费设置" size="small" style="margin-bottom: 24px;">
            <a-form-item label="运费模板" name="shippingTemplateId">
              <a-select
                v-model:value="formData.shippingTemplateId"
                placeholder="请选择运费模板"
                style="width: 300px;"
              >
                <a-select-option v-for="template in shippingTemplates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="重量/体积" name="weight">
              <a-row :gutter="12">
                <a-col :span="8">
                  <a-input-number
                    v-model:value="formData.weight"
                    :min="0"
                    :precision="2"
                    placeholder="重量"
                    addon-after="kg"
                    style="width: 100%;"
                  />
                </a-col>
                <a-col :span="8">
                  <a-input-number
                    v-model:value="formData.volume"
                    :min="0"
                    :precision="2"
                    placeholder="体积"
                    addon-after="m³"
                    style="width: 100%;"
                  />
                </a-col>
              </a-row>
            </a-form-item>
          </a-card>

          <!-- 其他设置 -->
          <a-card title="其他设置" size="small" style="margin-bottom: 24px;">
            <a-form-item label="商品状态" name="status">
              <a-radio-group v-model:value="formData.status">
                <a-radio value="pending">审核中</a-radio>
                <a-radio value="draft">待发布</a-radio>
                <a-radio value="published" :disabled="!canPublish">已上架</a-radio>
                <a-radio value="rejected" disabled>审核不通过</a-radio>
              </a-radio-group>
              <template #extra>
                <span style="color: #999;">
                  {{ getStatusHint(formData.status) }}
                </span>
              </template>
            </a-form-item>

            <a-form-item label="是否推荐" name="isRecommended">
              <a-switch v-model:checked="formData.isRecommended" />
              <span style="margin-left: 8px; color: #999;">
                推荐商品将在首页等位置优先展示
              </span>
            </a-form-item>

            <a-form-item label="商品标签" name="tags">
              <a-select
                v-model:value="formData.tags"
                mode="tags"
                placeholder="输入商品标签"
                style="width: 100%;"
                :token-separators="[',']"
              >
                <a-select-option v-for="tag in commonTagsOptions" :key="tag" :value="tag">
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-card>

          <!-- 审核信息 -->
          <a-card v-if="auditInfo.length > 0" title="审核记录" size="small" style="margin-bottom: 24px;">
            <a-timeline>
              <a-timeline-item
                v-for="(audit, index) in auditInfo"
                :key="index"
                :color="audit.status === 'approved' ? 'green' : audit.status === 'rejected' ? 'red' : 'blue'"
              >
                <template #dot>
                  <CheckCircleOutlined v-if="audit.status === 'approved'" style="color: #52c41a;" />
                  <CloseCircleOutlined v-else-if="audit.status === 'rejected'" style="color: #ff4d4f;" />
                  <ClockCircleOutlined v-else style="color: #1890ff;" />
                </template>
                <div class="audit-item">
                  <div class="audit-header">
                    <span class="audit-status">{{ getAuditStatusText(audit.status) }}</span>
                    <span class="audit-time">{{ audit.createdAt }}</span>
                  </div>
                  <div class="audit-operator">审核人：{{ audit.operator }}</div>
                  <div v-if="audit.remark" class="audit-remark">{{ audit.remark }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <a-space>
              <a-button type="primary" :loading="submitting" @click="handleSubmit">
                更新商品
              </a-button>
              <a-button @click="resetForm">重置</a-button>
              <a-button @click="goBack">取消</a-button>
            </a-space>
          </div>
        </a-form>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import { 
  categories as mockCategories, 
  suppliers as mockSuppliers, 
  shippingTemplates as mockShippingTemplates,
  commonTags,
  generateAuditHistory 
} from '@/data/mockData'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

// 库存调整
const stockOperation = ref('add')
const stockAmount = ref(null)
const stockRemark = ref('')

// 图片上传相关
const fileList = ref([])
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  categoryId: null,
  code: '',
  description: '',
  images: [],
  price: null,
  suggestedPrice: null,
  cost: null,
  stock: null,
  supplierId: null,
  shippingTemplateId: null,
  weight: null,
  volume: null,
  status: 'pending',
  isRecommended: false,
  tags: []
})

// 权限控制
const canPublish = ref(true) // 是否有发布权限

// 审核信息
const auditInfo = ref([])

// 分类选项 - 转换为树形结构
const categoryOptions = ref(mockCategories.map(cat => ({
  title: cat.name,
  value: cat.id,
  key: cat.id,
  children: cat.children ? cat.children.map(child => ({
    title: child.name,
    value: child.id,
    key: child.id
  })) : undefined
})))

// 供应商列表
const suppliers = ref(mockSuppliers)

// 运费模板
const shippingTemplates = ref(mockShippingTemplates)

// 常用标签
const commonTagsOptions = ref(commonTags)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '商品价格必须大于0', trigger: 'blur' }
  ],
  suggestedPrice: [
    { required: true, message: '请输入建议零售价', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '建议零售价必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ]
}

// 加载商品数据
const loadProductData = async () => {
  loading.value = true
  try {
    const productId = route.params.id
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟商品数据
    const mockProduct = {
      id: productId,
      name: 'iPhone 15 Pro Max 保护壳',
      categoryId: 11,
      code: '001',
      description: '高质量手机保护壳，全面保护您的设备安全。采用优质材料制作，手感舒适，防摔耐用。',
      images: [
        'https://via.placeholder.com/300x300/4f46e5/white?text=Image+1',
        'https://via.placeholder.com/300x300/06b6d4/white?text=Image+2'
      ],
      price: 29.99,
      suggestedPrice: 39.99,
      cost: 15.00,
      stock: 150,
      supplierId: 1,
      shippingTemplateId: 1,
      status: 'approved',
      isRecommended: true,
      tags: ['热销', '新品', '推荐']
    }
    
    // 填充表单数据
    Object.assign(formData, mockProduct)
    
    // 设置图片列表
    fileList.value = mockProduct.images.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url: url
    }))
    
    // 生成审核记录
    auditInfo.value = generateAuditHistory(productId, mockProduct.status)
    
  } catch (error) {
    message.error('加载商品数据失败')
  } finally {
    loading.value = false
  }
}

// 获取审核状态文本
const getAuditStatusText = (status) => {
  const statusMap = {
    pending: '审核中',
    approved: '审核通过',
    rejected: '审核不通过',
    published: '已上架',
    draft: '待发布'
  }
  return statusMap[status] || status
}

// 获取状态提示
const getStatusHint = (status) => {
  const hints = {
    pending: '商品正在审核中，请等待管理员审核',
    draft: '商品已保存为草稿，可继续编辑或提交审核',
    published: '商品已上架，可在前台查看',
    rejected: '商品审核不通过，请根据审核意见修改后重新提交'
  }
  return hints[status] || ''
}

// 计算利润
const calculateProfit = () => {
  if (!formData.price || !formData.cost) return 0
  return formData.price - formData.cost
}

// 计算利润率
const calculateProfitRate = () => {
  if (!formData.price || !formData.cost) return 0
  return ((formData.price - formData.cost) / formData.price) * 100
}

// 库存调整
const handleStockAdjust = () => {
  if (!stockAmount.value || !stockRemark.value) {
    message.error('请填写调整数量和备注')
    return
  }
  
  const newStock = stockOperation.value === 'add' 
    ? formData.stock + stockAmount.value 
    : formData.stock - stockAmount.value
    
  if (newStock < 0) {
    message.error('库存不能为负数')
    return
  }
  
  formData.stock = newStock
  message.success(`库存${stockOperation.value === 'add' ? '增加' : '减少'}成功`)
  
  // 重置库存调整表单
  stockAmount.value = null
  stockRemark.value = ''
}

// 图片上传处理
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImageChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList
  formData.images = newFileList.map(file => file.url || file.response?.url).filter(Boolean)
}

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj)
  }
  previewImage.value = file.url || file.preview
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
}

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// 表单提交
const handleSubmit = async () => {
  submitting.value = true
  try {
    await formRef.value.validate()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('商品更新成功')
    
    // 跳转到商品列表
    router.push('/admin/products')
    
  } catch (error) {
    message.error('提交失败，请检查表单信息')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  loadProductData()
}

// 返回列表
const goBack = () => {
  router.push('/admin/products')
}

// 组件挂载
onMounted(() => {
  loadProductData()
})
</script>

<style scoped lang="scss">
.product-edit-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.profit-calculation {
  margin-top: 16px;
}

.stock-operations {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  
  h4 {
    margin-bottom: 16px;
    color: #262626;
  }
}

.upload-area {
  :deep(.ant-upload-select-picture-card) {
    width: 120px;
    height: 120px;
  }
  
  :deep(.ant-upload-list-picture-card-container) {
    width: 120px;
    height: 120px;
  }
}

.form-actions {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.audit-item {
  .audit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    
    .audit-status {
      font-weight: 600;
    }
    
    .audit-time {
      color: #999;
      font-size: 12px;
    }
  }
  
  .audit-operator {
    color: #666;
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  .audit-remark {
    color: #333;
    font-size: 14px;
  }
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  
  .ant-card-head-title {
    font-size: 16px;
    font-weight: 600;
  }
}

:deep(.ant-form-item-extra) {
  margin-top: 4px;
  font-size: 12px;
}
</style> 