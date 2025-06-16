<template>
  <div class="product-create-container">
    <!-- 面包屑导航 -->
    <a-breadcrumb style="margin-bottom: 16px;">
      <a-breadcrumb-item>
        <router-link to="/admin/dashboard">首页</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/admin/products">商品管理</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>新增商品</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card title="新增商品" :bordered="false">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        @finish="handleSubmit"
      >
        <!-- 基本信息卡片 -->
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

          <a-form-item label="商品编号" name="code">
            <a-input 
              v-model:value="formData.code" 
              placeholder="留空自动生成"
              addon-before="PRD"
            />
            <template #extra>
              <span style="color: #999;">留空将自动生成商品编号</span>
            </template>
          </a-form-item>
        </a-card>

        <!-- 价格库存卡片 -->
        <a-card title="价格库存" size="small" style="margin-bottom: 24px;">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item label="商品价格" name="price" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
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
              <a-form-item label="建议零售价" name="suggestedPrice" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
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
              <a-form-item label="商品库存" name="stock" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input-number
                  v-model:value="formData.stock"
                  :min="0"
                  placeholder="请输入库存"
                  style="width: 100%;"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- SKU设置 -->
          <a-form-item label="SKU设置" name="skuEnabled">
            <a-switch v-model:checked="formData.skuEnabled" />
            <span style="margin-left: 8px; color: #999;">
              是否启用多规格SKU管理
            </span>
          </a-form-item>

          <!-- SKU表格 -->
          <div v-if="formData.skuEnabled" class="sku-section">
            <h4>SKU规格设置</h4>
            <a-button @click="addSku" style="margin-bottom: 16px;" size="small">
              <template #icon><PlusOutlined /></template>
              添加SKU
            </a-button>
            
            <a-table
              :columns="skuColumns"
              :data-source="formData.skus"
              :pagination="false"
              size="small"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'name'">
                  <a-input v-model:value="record.name" placeholder="规格名称" />
                </template>
                <template v-if="column.key === 'value'">
                  <a-input v-model:value="record.value" placeholder="规格值" />
                </template>
                <template v-if="column.key === 'price'">
                  <a-input-number v-model:value="record.price" :precision="2" :min="0" />
                </template>
                <template v-if="column.key === 'stock'">
                  <a-input-number v-model:value="record.stock" :min="0" />
                </template>
                <template v-if="column.key === 'action'">
                  <a-button size="small" danger @click="removeSku(index)">删除</a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-card>

        <!-- 商品描述卡片 -->
        <a-card title="商品描述" size="small" style="margin-bottom: 24px;">
          <a-form-item label="富文本描述" name="description">
            <div class="rich-editor-container">
              <a-tabs v-model:activeKey="editorMode">
                <a-tab-pane key="visual" tab="可视化编辑">
                  <div ref="editorRef" style="height: 200px; border: 1px solid #d9d9d9; padding: 12px; min-height: 200px;">
                    <div 
                      v-html="formData.description" 
                      style="min-height: 180px; outline: none;" 
                      contenteditable="true" 
                      @input="handleEditorInput" 
                      placeholder="请输入商品描述"
                    ></div>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="html" tab="HTML源码">
                  <a-textarea
                    v-model:value="formData.description"
                    :rows="8"
                    placeholder="请输入商品描述HTML代码"
                    show-count
                    :maxlength="2000"
                  />
                </a-tab-pane>
              </a-tabs>
            </div>
            <template #extra>
              <span style="color: #999;">商品详细描述（必填），支持富文本格式</span>
            </template>
          </a-form-item>

          <a-form-item label="规格参数" name="specifications">
            <div class="specifications-editor">
              <a-button @click="addSpecification" style="margin-bottom: 16px;" size="small">
                <template #icon><PlusOutlined /></template>
                添加规格参数
              </a-button>
              
              <div 
                v-for="(spec, index) in formData.specifications" 
                :key="index"
                class="spec-item"
              >
                <a-row :gutter="12" align="middle">
                  <a-col :span="10">
                    <a-input v-model:value="spec.name" placeholder="参数名称" />
                  </a-col>
                  <a-col :span="10">
                    <a-input v-model:value="spec.value" placeholder="参数值" />
                  </a-col>
                  <a-col :span="4">
                    <a-button size="small" danger @click="removeSpecification(index)">
                      删除
                    </a-button>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-form-item>
        </a-card>

        <!-- 供应商信息卡片 -->
        <a-card title="供应商信息" size="small" style="margin-bottom: 24px;">
          <a-form-item label="供应商" name="supplierId">
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

          <!-- 利润计算 -->
          <div v-if="formData.price && formData.cost" class="profit-calculation">
            <a-alert
              :message="`预计利润: $${calculateProfit().toFixed(2)} (利润率: ${calculateProfitRate().toFixed(1)}%)`"
              type="info"
              show-icon
            />
          </div>
        </a-card>

        <!-- 运费设置卡片 -->
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

        <!-- 其他设置卡片 -->
        <a-card title="其他设置" size="small" style="margin-bottom: 24px;">
          <a-form-item label="商品状态" name="status">
            <a-radio-group v-model:value="formData.status">
              <a-radio value="pending">审核中</a-radio>
              <a-radio value="draft">待发布</a-radio>
            </a-radio-group>
            <template #extra>
              <span style="color: #999;">审核中：提交给管理员审核；待发布：保存但不提交审核</span>
            </template>
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

        <!-- 操作按钮 -->
        <div class="form-actions">
          <a-space>
            <a-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ formData.status === 'draft' ? '保存草稿' : '提交审核' }}
            </a-button>
            <a-button @click="resetForm">重置</a-button>
            <a-button @click="goBack">取消</a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { 
  categories as mockCategories, 
  suppliers as mockSuppliers, 
  shippingTemplates as mockShippingTemplates,
  commonTags 
} from '@/data/mockData'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const editorRef = ref()
const editorMode = ref('visual')

// 图片上传相关
const fileList = ref([])
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')

// 表单数据
const formData = reactive({
  name: '',
  categoryId: null,
  code: '',
  images: [],
  price: null,
  suggestedPrice: null,
  cost: null,
  stock: null,
  skuEnabled: false,
  skus: [],
  description: '',
  specifications: [],
  supplierId: null,
  shippingTemplateId: null,
  weight: null,
  volume: null,
  status: 'pending',
  tags: []
})

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

// SKU表格列配置
const skuColumns = [
  { title: '规格名称', key: 'name', width: '25%' },
  { title: '规格值', key: 'value', width: '25%' },
  { title: '价格($)', key: 'price', width: '20%' },
  { title: '库存', key: 'stock', width: '20%' },
  { title: '操作', key: 'action', width: '10%' }
]

// 表单验证规则 - 按照产品文档要求
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  images: [
    { 
      validator: (rule, value) => {
        if (fileList.value.length === 0) {
          return Promise.reject('请至少上传一张商品图片')
        }
        return Promise.resolve()
      },
      trigger: 'change' 
    }
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
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, message: '商品描述至少10个字符', trigger: 'blur' }
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  cost: [
    { required: true, message: '请输入采购成本', trigger: 'blur' },
    { type: 'number', min: 0, message: '采购成本不能为负数', trigger: 'blur' }
  ]
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

// 富文本编辑器处理
const handleEditorInput = (event) => {
  formData.description = event.target.innerHTML
}

// SKU管理
const addSku = () => {
  formData.skus.push({
    name: '',
    value: '',
    price: formData.price || 0,
    stock: 0
  })
}

const removeSku = (index) => {
  formData.skus.splice(index, 1)
}

// 规格参数管理
const addSpecification = () => {
  formData.specifications.push({
    name: '',
    value: ''
  })
}

const removeSpecification = (index) => {
  formData.specifications.splice(index, 1)
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
    
    // 验证图片
    if (fileList.value.length === 0) {
      message.error('请至少上传一张商品图片')
      submitting.value = false
      return
    }
    
    // 自动生成商品编号
    if (!formData.code) {
      formData.code = `PRD${Date.now().toString().slice(-6)}`
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const action = formData.status === 'draft' ? '保存' : '创建'
    message.success(`商品${action}成功`)
    
    // 跳转到商品列表
    router.push('/admin/products')
    
  } catch (error) {
    console.error('表单验证失败:', error)
    message.error('请检查表单信息后重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  Object.assign(formData, {
    name: '',
    categoryId: null,
    code: '',
    images: [],
    price: null,
    suggestedPrice: null,
    cost: null,
    stock: null,
    skuEnabled: false,
    skus: [],
    description: '',
    specifications: [],
    supplierId: null,
    shippingTemplateId: null,
    weight: null,
    volume: null,
    status: 'pending',
    tags: []
  })
  fileList.value = []
}

// 返回列表
const goBack = () => {
  router.push('/admin/products')
}
</script>

<style scoped lang="scss">
.product-create-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.profit-calculation {
  margin-top: 16px;
}

.sku-section {
  margin-top: 24px;
  
  h4 {
    margin-bottom: 16px;
    color: #262626;
  }
}

.specifications-editor {
  .spec-item {
    margin-bottom: 12px;
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

.rich-editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  
  :deep(.ant-tabs-content-holder) {
    border: none;
  }
  
  :deep(.ant-tabs-tabpane) {
    padding: 0;
  }
}

.form-actions {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
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