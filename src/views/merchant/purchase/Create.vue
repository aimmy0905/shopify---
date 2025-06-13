<template>
  <div class="create-application-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">发起采购申请</h1>
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="application-form"
      >
        <!-- 采购类型选择 -->
        <el-form-item label="采购类型" prop="purchaseType">
          <el-radio-group v-model="formData.purchaseType">
            <el-radio label="existing">现有商品</el-radio>
            <el-radio label="new">另外采购</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 现有商品选择 -->
        <template v-if="formData.purchaseType === 'existing'">
          <el-form-item label="选择商品" prop="productId">
            <el-select
              v-model="formData.productId"
              filterable
              remote
              :remote-method="searchProducts"
              placeholder="请输入商品名称搜索"
              style="width: 100%"
              @change="handleProductSelect"
            >
              <el-option
                v-for="item in productOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="product-option">
                  <img :src="item.image" class="product-option-image" />
                  <div class="product-option-info">
                    <div class="product-option-name">{{ item.name }}</div>
                    <div class="product-option-price">${{ item.price }}</div>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </template>

        <!-- 新商品信息 -->
        <template v-else>
          <el-form-item label="商品链接" prop="productUrl">
            <el-input
              v-model="formData.productUrl"
              placeholder="请输入商品链接"
              @blur="handleUrlBlur"
            />
          </el-form-item>

          <el-form-item label="商品图片" prop="productImage">
            <el-upload
              class="product-image-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
            >
              <img v-if="formData.productImage" :src="formData.productImage" class="uploaded-image" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
          </el-form-item>

          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="formData.productName" placeholder="请输入商品名称" />
          </el-form-item>
        </template>

        <!-- 通用表单字段 -->
        <el-form-item label="目标售价" prop="targetPrice">
          <el-input-number
            v-model="formData.targetPrice"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 200px"
          >
            <template #prefix>$</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="目标国家/地区" prop="targetCountry">
          <el-select v-model="formData.targetCountry" placeholder="请选择目标国家/地区" style="width: 200px">
            <el-option label="美国" value="US" />
            <el-option label="英国" value="UK" />
            <el-option label="德国" value="DE" />
            <el-option label="法国" value="FR" />
            <el-option label="意大利" value="IT" />
            <el-option label="西班牙" value="ES" />
            <el-option label="加拿大" value="CA" />
            <el-option label="澳大利亚" value="AU" />
          </el-select>
        </el-form-item>

        <el-form-item label="预估日单量" prop="dailyOrderCount">
          <el-input-number
            v-model="formData.dailyOrderCount"
            :min="1"
            :max="1000"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述商品特点、规格等信息"
          />
        </el-form-item>

        <el-form-item label="接受同品类" prop="acceptSimilar">
          <el-switch v-model="formData.acceptSimilar" />
        </el-form-item>

        <el-form-item label="备注信息" prop="remarks">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="选填，可补充其他需求说明"
          />
        </el-form-item>

        <!-- 表单操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交申请</el-button>
          <el-button @click="cancelForm">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const formData = reactive({
  purchaseType: 'existing',
  productId: '',
  productUrl: '',
  productImage: '',
  productName: '',
  targetPrice: 0,
  targetCountry: '',
  dailyOrderCount: 1,
  description: '',
  acceptSimilar: false,
  remarks: ''
})

// 商品选项
const productOptions = ref([])

// 表单验证规则
const formRules = {
  purchaseType: [
    { required: true, message: '请选择采购类型', trigger: 'change' }
  ],
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  productUrl: [
    { required: true, message: '请输入商品链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  productImage: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  targetPrice: [
    { required: true, message: '请输入目标售价', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  targetCountry: [
    { required: true, message: '请选择目标国家/地区', trigger: 'change' }
  ],
  dailyOrderCount: [
    { required: true, message: '请输入预估日单量', trigger: 'blur' },
    { type: 'number', min: 1, message: '日单量必须大于0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

// 搜索商品
const searchProducts = async (query) => {
  if (query) {
    try {
      // 模拟API调用
      const mockData = [
        {
          id: 1,
          name: '蓝牙耳机 Pro Max',
          image: 'https://via.placeholder.com/40x40',
          price: 25.99
        },
        {
          id: 2,
          name: '智能手表运动版',
          image: 'https://via.placeholder.com/40x40',
          price: 45.00
        }
      ]
      productOptions.value = mockData
    } catch (error) {
      ElMessage.error('搜索商品失败')
    }
  } else {
    productOptions.value = []
  }
}

// 选择商品
const handleProductSelect = (productId) => {
  const selectedProduct = productOptions.value.find(p => p.id === productId)
  if (selectedProduct) {
    formData.productName = selectedProduct.name
    formData.productImage = selectedProduct.image
    formData.targetPrice = selectedProduct.price
  }
}

// 处理URL输入
const handleUrlBlur = async () => {
  if (formData.productUrl) {
    try {
      // 模拟从URL获取商品信息
      formData.productName = '从URL获取的商品名称'
      formData.productImage = 'https://via.placeholder.com/200x200'
    } catch (error) {
      ElMessage.error('获取商品信息失败')
    }
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return (isJPG || isPNG) && isLt2M
}

// 图片上传成功
const handleImageSuccess = (response) => {
  formData.productImage = response.url
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 模拟API调用
    ElMessage.success('采购申请提交成功')
    router.push('/merchant/purchase/applications')
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  }
}

// 取消表单
const cancelForm = () => {
  router.back()
}
</script>

<style scoped>
.create-application-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.form-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.application-form {
  max-width: 800px;
  margin: 0 auto;
}

.product-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-option-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.product-option-info {
  flex: 1;
  min-width: 0;
}

.product-option-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-option-price {
  font-size: 12px;
  color: #909399;
}

.product-image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image-uploader:hover {
  border-color: #409eff;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 28px;
  height: 28px;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style> 