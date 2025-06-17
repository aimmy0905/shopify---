<template>
  <div class="shipping-template-detail-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/shipping-templates' }">运费模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>运费模板详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ templateInfo.name }}</h1>
        <el-tag 
          :type="templateInfo.status === 'enabled' ? 'success' : 'danger'" 
          size="large"
          class="status-tag"
        >
          {{ templateInfo.status === 'enabled' ? '启用中' : '未启用' }}
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button @click="editTemplate">编辑模板</el-button>
        <el-button 
          :type="templateInfo.status === 'enabled' ? 'warning' : 'success'"
          @click="toggleStatus"
        >
          {{ templateInfo.status === 'enabled' ? '停用模板' : '启用模板' }}
        </el-button>
        <el-button type="danger" @click="deleteTemplate">删除模板</el-button>
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="detail-content">
      <el-row :gutter="20">
        <!-- 左侧信息 -->
        <el-col :span="16">
          <!-- 基本信息卡片 -->
          <el-card class="info-card">
            <template #header>
              <span class="card-title">基本信息</span>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="模板名称">{{ templateInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="物流公司">{{ templateInfo.shippingCompany }}</el-descriptions-item>
              <el-descriptions-item label="计费方式">
                <el-tag :type="templateInfo.chargeType === 'weight' ? 'primary' : 'success'" size="small">
                  {{ templateInfo.chargeType === 'weight' ? '重量' : '体积' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="templateInfo.status === 'enabled' ? 'success' : 'danger'" size="small">
                  {{ templateInfo.status === 'enabled' ? '启用中' : '未启用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ templateInfo.createTime }}</el-descriptions-item>
              <el-descriptions-item label="最后修改时间">{{ templateInfo.updateTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 配送区域卡片 -->
          <el-card class="info-card">
            <template #header>
              <span class="card-title">配送区域</span>
            </template>
            
            <div class="countries-section">
              <h4>支持配送的国家/地区</h4>
              <div class="countries-grid">
                <div v-for="region in groupedCountries" :key="region.name" class="region-group">
                  <div class="region-title">{{ region.name }}</div>
                  <div class="region-countries">
                    <el-tag 
                      v-for="country in region.countries" 
                      :key="country"
                      size="small"
                      style="margin-right: 8px; margin-bottom: 8px;"
                    >
                      {{ country }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 费用设置卡片 -->
          <el-card class="info-card">
            <template #header>
              <span class="card-title">费用设置</span>
            </template>
            
            <div class="pricing-info">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="price-item">
                    <div class="price-label">基础运费</div>
                    <div class="price-value">${{ templateInfo.basePrice.toFixed(2) }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="price-item">
                    <div class="price-label">{{ templateInfo.chargeType === 'weight' ? '首重' : '首体积' }}</div>
                    <div class="price-value">
                      {{ templateInfo.firstWeight }} {{ templateInfo.chargeType === 'weight' ? 'kg' : 'm³' }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="price-item">
                    <div class="price-label">{{ templateInfo.chargeType === 'weight' ? '续重单价' : '续体积单价' }}</div>
                    <div class="price-value">${{ templateInfo.additionalPrice.toFixed(2) }}</div>
                  </div>
                </el-col>
              </el-row>
              
              <!-- 特殊区域费用列表 -->
              <div v-if="templateInfo.specialAreas.length" class="special-areas-section">
                <h4>特殊区域费用</h4>
                <el-table :data="templateInfo.specialAreas" border>
                  <el-table-column label="国家/地区" min-width="200">
                    <template #default="scope">
                      <div class="special-countries">
                        <el-tag 
                          v-for="country in scope.row.countries" 
                          :key="country"
                          size="small"
                          style="margin-right: 4px;"
                        >
                          {{ country }}
                        </el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="费用调整" width="120" align="right">
                    <template #default="scope">
                      <span class="adjustment-price">
                        {{ scope.row.adjustment >= 0 ? '+' : '' }}${{ scope.row.adjustment.toFixed(2) }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-card>

          <!-- 其他设置 -->
          <el-card class="info-card" v-if="templateInfo.deliveryTime || templateInfo.excludedProducts || templateInfo.remark">
            <template #header>
              <span class="card-title">其他设置</span>
            </template>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item v-if="templateInfo.deliveryTime" label="配送时效">
                {{ templateInfo.deliveryTime }}
              </el-descriptions-item>
              <el-descriptions-item v-if="templateInfo.excludedProducts" label="不支持配送的商品类型">
                {{ templateInfo.excludedProducts }}
              </el-descriptions-item>
              <el-descriptions-item v-if="templateInfo.remark" label="备注信息">
                {{ templateInfo.remark }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- 右侧应用商品 -->
        <el-col :span="8">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">应用商品</span>
            </template>
            
            <div class="products-summary">
              <div class="summary-item">
                <div class="summary-label">使用此模板的商品数量</div>
                <div class="summary-value">{{ templateInfo.productCount }}</div>
              </div>
            </div>
            
            <!-- 商品列表预览 -->
            <div class="products-preview">
              <h4>商品列表预览</h4>
              <div class="product-list">
                <div 
                  v-for="product in templateInfo.products" 
                  :key="product.id"
                  class="product-item"
                >
                  <div class="product-image">
                    <img :src="product.image" :alt="product.name" />
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-price">${{ product.price.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
              
              <el-button 
                v-if="templateInfo.productCount > 3" 
                type="text" 
                @click="viewAllProducts"
                class="view-more-btn"
              >
                查看全部 {{ templateInfo.productCount }} 个商品
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 模板信息
const templateInfo = reactive({
  id: 1,
  name: '美国标准运费模板',
  shippingCompany: 'FedEx',
  chargeType: 'weight',
  status: 'enabled',
  countries: ['美国', '加拿大', '墨西哥', '阿拉斯加'],
  basePrice: 15.99,
  firstWeight: 1,
  additionalPrice: 2.50,
  specialAreas: [
    { countries: ['阿拉斯加'], adjustment: 5.00 }
  ],
  deliveryTime: '3-7个工作日',
  excludedProducts: '液体、易燃品',
  remark: '标准运费模板，适用于大部分商品',
  createTime: '2023-11-01 10:30:00',
  updateTime: '2023-11-15 14:20:00',
  productCount: 156,
  products: [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 1199.00,
      image: 'https://via.placeholder.com/60x60'
    },
    {
      id: 2,
      name: 'MacBook Pro 16"',
      price: 2499.00,
      image: 'https://via.placeholder.com/60x60'
    },
    {
      id: 3,
      name: 'AirPods Pro',
      price: 249.00,
      image: 'https://via.placeholder.com/60x60'
    }
  ]
})

// 计算属性 - 按地区分组的国家
const groupedCountries = computed(() => {
  const regions = {
    '北美洲': ['美国', '加拿大', '墨西哥'],
    '欧洲': ['德国', '法国', '英国', '意大利', '西班牙', '荷兰'],
    '亚洲': ['中国', '日本', '韩国', '新加坡', '印度'],
    '大洋洲': ['澳大利亚', '新西兰'],
    '其他': ['巴西', '俄罗斯', '南非', '阿拉斯加']
  }
  
  const result = []
  for (const [regionName, regionCountries] of Object.entries(regions)) {
    const matchedCountries = templateInfo.countries.filter(country => 
      regionCountries.includes(country)
    )
    if (matchedCountries.length > 0) {
      result.push({
        name: regionName,
        countries: matchedCountries
      })
    }
  }
  return result
})

// 方法
const editTemplate = () => {
  router.push(`/admin/shipping-templates/edit/${templateInfo.id}`)
}

const toggleStatus = async () => {
  const action = templateInfo.status === 'enabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}运费模板 "${templateInfo.name}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    templateInfo.status = templateInfo.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消
  }
}

const deleteTemplate = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除运费模板 "${templateInfo.name}" 吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('删除成功')
    router.push('/admin/shipping-templates')
  } catch {
    // 用户取消
  }
}

const viewAllProducts = () => {
  ElMessage.info('查看全部商品功能开发中...')
}

const goBack = () => {
  router.push('/admin/shipping-templates')
}

// 生命周期
onMounted(() => {
  const templateId = route.params.id
  console.log('运费模板详情页面已加载，ID:', templateId)
})
</script>

<style scoped>
.shipping-template-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.status-tag {
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  margin-bottom: 20px;
}

.info-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

/* 配送区域 */
.countries-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.countries-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.region-group {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
}

.region-title {
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  font-size: 13px;
}

.region-countries {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 费用设置 */
.pricing-info {
  padding: 8px 0;
}

.price-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.price-label {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
}

.price-value {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.special-areas-section {
  margin-top: 24px;
}

.special-areas-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.special-countries {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.adjustment-price {
  font-weight: 600;
  color: #409eff;
}

/* 应用商品 */
.products-summary {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-label {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-value {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.products-preview h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.product-list {
  margin-bottom: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  color: #303133;
  font-size: 13px;
  margin-bottom: 4px;
}

.product-price {
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
}

.view-more-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shipping-template-detail-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .detail-content .el-row {
    flex-direction: column;
  }
  
  .countries-grid {
    gap: 12px;
  }
}
</style>
