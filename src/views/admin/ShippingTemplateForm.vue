<template>
  <div class="shipping-template-form-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/shipping-templates' }">运费模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ isEdit ? '编辑运费模板' : '新增运费模板' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑运费模板' : '新增运费模板' }}</h1>
    </div>

    <!-- 表单区域 -->
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="120px"
    >
      <!-- 基本信息卡片 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">基本信息</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input 
                v-model="formData.name" 
                placeholder="请输入模板名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物流公司" prop="shippingCompany">
              <el-select 
                v-model="formData.shippingCompany" 
                placeholder="请选择物流公司"
                style="width: 100%"
              >
                <el-option label="FedEx" value="FedEx" />
                <el-option label="DHL" value="DHL" />
                <el-option label="UPS" value="UPS" />
                <el-option label="中国邮政" value="中国邮政" />
                <el-option label="顺丰速运" value="顺丰速运" />
                <el-option label="圆通速递" value="圆通速递" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计费方式" prop="chargeType">
              <el-radio-group v-model="formData.chargeType">
                <el-radio value="weight">重量</el-radio>
                <el-radio value="volume">体积</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch 
                v-model="formData.status" 
                active-text="启用" 
                inactive-text="停用"
                active-value="enabled"
                inactive-value="disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 配送区域卡片 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">配送区域</span>
        </template>
        
        <el-form-item label="国家/地区" prop="countries">
          <div class="countries-selector">
            <el-select 
              v-model="selectedCountries" 
              multiple 
              placeholder="请选择配送国家/地区"
              style="width: 100%; margin-bottom: 16px;"
              @change="handleCountriesChange"
            >
              <el-option-group label="北美洲">
                <el-option label="美国" value="美国" />
                <el-option label="加拿大" value="加拿大" />
                <el-option label="墨西哥" value="墨西哥" />
              </el-option-group>
              <el-option-group label="欧洲">
                <el-option label="德国" value="德国" />
                <el-option label="法国" value="法国" />
                <el-option label="英国" value="英国" />
                <el-option label="意大利" value="意大利" />
                <el-option label="西班牙" value="西班牙" />
                <el-option label="荷兰" value="荷兰" />
              </el-option-group>
              <el-option-group label="亚洲">
                <el-option label="中国" value="中国" />
                <el-option label="日本" value="日本" />
                <el-option label="韩国" value="韩国" />
                <el-option label="新加坡" value="新加坡" />
                <el-option label="印度" value="印度" />
              </el-option-group>
              <el-option-group label="大洋洲">
                <el-option label="澳大利亚" value="澳大利亚" />
                <el-option label="新西兰" value="新西兰" />
              </el-option-group>
              <el-option-group label="其他">
                <el-option label="巴西" value="巴西" />
                <el-option label="俄罗斯" value="俄罗斯" />
                <el-option label="南非" value="南非" />
              </el-option-group>
            </el-select>
            
            <!-- 已选国家/地区标签展示区 -->
            <div class="selected-countries" v-if="selectedCountries.length">
              <span class="label">已选择的国家/地区：</span>
              <div class="countries-tags">
                <el-tag 
                  v-for="country in selectedCountries" 
                  :key="country"
                  closable
                  @close="removeCountry(country)"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ country }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-card>

      <!-- 费用设置卡片 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">费用设置</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="基础运费" prop="basePrice">
              <el-input-number 
                v-model="formData.basePrice" 
                :min="0" 
                :precision="2"
                style="width: 100%"
              />
              <span class="unit">USD</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="firstWeightLabel" prop="firstWeight">
              <el-input-number 
                v-model="formData.firstWeight" 
                :min="0" 
                :precision="2"
                style="width: 100%"
              />
              <span class="unit">{{ formData.chargeType === 'weight' ? 'kg' : 'm³' }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="additionalPriceLabel" prop="additionalPrice">
              <el-input-number 
                v-model="formData.additionalPrice" 
                :min="0" 
                :precision="2"
                style="width: 100%"
              />
              <span class="unit">USD</span>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 特殊区域费用调整 -->
        <el-form-item label="特殊区域费用">
          <div class="special-areas">
            <div 
              v-for="(area, index) in formData.specialAreas" 
              :key="index"
              class="special-area-item"
            >
              <el-select 
                v-model="area.countries" 
                multiple 
                placeholder="选择国家/地区"
                style="width: 200px; margin-right: 12px;"
              >
                <el-option 
                  v-for="country in availableCountries" 
                  :key="country" 
                  :label="country" 
                  :value="country" 
                />
              </el-select>
              <el-input-number 
                v-model="area.adjustment" 
                placeholder="费用调整"
                :precision="2"
                style="width: 120px; margin-right: 12px;"
              />
              <span style="margin-right: 12px;">USD</span>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeSpecialArea(index)"
              >
                删除
              </el-button>
            </div>
            <el-button 
              type="primary" 
              size="small" 
              @click="addSpecialArea"
            >
              添加特殊区域
            </el-button>
          </div>
        </el-form-item>
      </el-card>

      <!-- 其他设置卡片 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">其他设置</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="配送时效">
              <el-input 
                v-model="formData.deliveryTime" 
                placeholder="例如：3-7个工作日"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="不支持配送的商品类型">
              <el-input 
                v-model="formData.excludedProducts" 
                placeholder="例如：液体、易燃品"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注信息">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <el-button size="large" @click="goBack">取消</el-button>
      <el-button type="primary" size="large" @click="saveTemplate" :loading="saving">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const formRef = ref()
const saving = ref(false)
const isEdit = computed(() => route.path.includes('/edit/'))
const selectedCountries = ref([])

// 表单数据
const formData = reactive({
  name: '',
  shippingCompany: '',
  chargeType: 'weight',
  status: 'enabled',
  countries: [],
  basePrice: 0,
  firstWeight: 1,
  additionalPrice: 0,
  specialAreas: [],
  deliveryTime: '',
  excludedProducts: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  shippingCompany: [
    { required: true, message: '请选择物流公司', trigger: 'change' }
  ],
  chargeType: [
    { required: true, message: '请选择计费方式', trigger: 'change' }
  ],
  countries: [
    { required: true, message: '请选择配送国家/地区', trigger: 'change' }
  ],
  basePrice: [
    { required: true, message: '请输入基础运费', trigger: 'blur' }
  ],
  firstWeight: [
    { required: true, message: '请输入首重/首体积', trigger: 'blur' }
  ],
  additionalPrice: [
    { required: true, message: '请输入续费单价', trigger: 'blur' }
  ]
}

// 计算属性
const firstWeightLabel = computed(() => {
  return formData.chargeType === 'weight' ? '首重' : '首体积'
})

const additionalPriceLabel = computed(() => {
  return formData.chargeType === 'weight' ? '续重单价' : '续体积单价'
})

const availableCountries = computed(() => {
  return selectedCountries.value
})

// 方法
const handleCountriesChange = () => {
  formData.countries = selectedCountries.value
}

const removeCountry = (country) => {
  const index = selectedCountries.value.indexOf(country)
  if (index > -1) {
    selectedCountries.value.splice(index, 1)
    formData.countries = selectedCountries.value
  }
}

const addSpecialArea = () => {
  formData.specialAreas.push({
    countries: [],
    adjustment: 0
  })
}

const removeSpecialArea = (index) => {
  formData.specialAreas.splice(index, 1)
}

const saveTemplate = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success(isEdit.value ? '编辑运费模板成功' : '新增运费模板成功')
    router.push('/admin/shipping-templates')
  } catch (error) {
    console.log('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/admin/shipping-templates')
}

// 生命周期
onMounted(() => {
  if (isEdit.value) {
    const templateId = route.params.id
    // 模拟加载编辑数据
    Object.assign(formData, {
      name: '美国标准运费模板',
      shippingCompany: 'FedEx',
      chargeType: 'weight',
      status: 'enabled',
      countries: ['美国', '加拿大', '墨西哥'],
      basePrice: 15.99,
      firstWeight: 1,
      additionalPrice: 2.50,
      specialAreas: [
        { countries: ['阿拉斯加'], adjustment: 5.00 }
      ],
      deliveryTime: '3-7个工作日',
      excludedProducts: '液体、易燃品',
      remark: '标准运费模板，适用于大部分商品'
    })
    selectedCountries.value = formData.countries
    console.log('编辑运费模板，ID:', templateId)
  }
})
</script>

<style scoped>
.shipping-template-form-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.form-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.unit {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.countries-selector {
  width: 100%;
}

.selected-countries {
  margin-top: 12px;
}

.selected-countries .label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}

.countries-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.special-areas {
  width: 100%;
}

.special-area-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.form-actions {
  text-align: center;
  padding: 20px;
}

.form-actions .el-button {
  margin: 0 12px;
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shipping-template-form-page {
    padding: 12px;
  }
  
  .special-area-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .special-area-item > * {
    margin-right: 0 !important;
  }
}
</style>
