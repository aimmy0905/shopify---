<template>
  <div class="product-detail-container">
    <!-- 面包屑导航 -->
    <a-breadcrumb style="margin-bottom: 16px;">
      <a-breadcrumb-item>
        <router-link to="/admin/dashboard">首页</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <router-link to="/admin/products">商品管理</router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>商品详情</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 商品状态标签 -->
    <div class="status-header">
      <a-tag 
        :color="getStatusColor(productDetail.status)" 
        style="font-size: 16px; padding: 8px 16px; margin-bottom: 24px;"
      >
        {{ getStatusText(productDetail.status) }}
      </a-tag>
    </div>

    <a-row :gutter="24">
      <!-- 左侧内容 -->
      <a-col :span="16">
        <!-- 商品基本信息卡片 -->
        <a-card title="商品基本信息" :bordered="false" style="margin-bottom: 24px;">
          <a-row :gutter="24">
            <a-col :span="10">
              <!-- 商品图片展示 -->
              <div class="image-gallery">
                <a-image
                  :width="400"
                  :height="400"
                  :src="currentImage"
                  :preview="false"
                  @click="previewImages"
                  style="border-radius: 8px; cursor: pointer;"
                />
                <div v-if="productDetail.images && productDetail.images.length > 1" class="image-thumbnails">
                  <div 
                    v-for="(image, index) in productDetail.images" 
                    :key="index"
                    class="thumbnail"
                    :class="{ active: currentImageIndex === index }"
                    @click="switchImage(index)"
                  >
                    <a-image
                      :width="60"
                      :height="60"
                      :src="image"
                      :preview="false"
                    />
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :span="14">
              <div class="product-info">
                <h2 class="product-title">{{ productDetail.name }}</h2>
                
                <a-descriptions :column="1" size="large">
                  <a-descriptions-item label="商品编号">
                    <a-tag>{{ productDetail.code }}</a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="商品分类">
                    {{ productDetail.categoryName }}
                  </a-descriptions-item>
                  <a-descriptions-item label="商品价格">
                    <span class="price">${{ productDetail.price?.toFixed(2) }}</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="建议零售价">
                    <span class="suggested-price">${{ productDetail.suggestedPrice?.toFixed(2) }}</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="采购成本">
                    <span class="cost-price">${{ productDetail.cost?.toFixed(2) }}</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="库存数量">
                    <span :class="{ 'low-stock': productDetail.stock < 10 }">
                      {{ productDetail.stock }}
                    </span>
                  </a-descriptions-item>
                  <a-descriptions-item label="供应商">
                    {{ productDetail.supplierName }}
                  </a-descriptions-item>
                  <a-descriptions-item label="创建时间">
                    {{ productDetail.createdAt }}
                  </a-descriptions-item>
                </a-descriptions>

                <!-- 审核信息 -->
                <div v-if="productDetail.auditInfo" class="audit-info">
                  <h4>审核信息</h4>
                  <a-descriptions :column="1" size="small">
                    <a-descriptions-item label="审核人">
                      {{ productDetail.auditInfo.auditor }}
                    </a-descriptions-item>
                    <a-descriptions-item label="审核时间">
                      {{ productDetail.auditInfo.auditTime }}
                    </a-descriptions-item>
                    <a-descriptions-item label="审核结果">
                      <a-tag :color="productDetail.auditInfo.result === 'approved' ? 'green' : 'red'">
                        {{ productDetail.auditInfo.result === 'approved' ? '通过' : '不通过' }}
                      </a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item v-if="productDetail.auditInfo.remark" label="审核备注">
                      {{ productDetail.auditInfo.remark }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <!-- 商品描述信息卡片 -->
        <a-card title="商品描述" :bordered="false" style="margin-bottom: 24px;">
          <div class="description-content" v-html="productDetail.description || '暂无描述'"></div>
          
          <!-- 规格参数表 -->
          <div v-if="productDetail.specifications" class="specifications">
            <h4>规格参数</h4>
            <a-table
              :columns="specColumns"
              :data-source="productDetail.specifications"
              :pagination="false"
              size="small"
              :show-header="false"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <strong>{{ record.name }}</strong>
                </template>
              </template>
            </a-table>
          </div>
        </a-card>

        <!-- 上架店铺卡片 -->
        <a-card title="上架店铺" :bordered="false" style="margin-bottom: 24px;">
          <a-table
            :columns="storeColumns"
            :data-source="productDetail.stores"
            :pagination="false"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                  {{ record.status === 'active' ? '上架中' : '已下架' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'price'">
                ${{ record.price?.toFixed(2) }}
              </template>
              <template v-if="column.key === 'action'">
                <a @click="viewStore(record)">查看店铺</a>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 右侧边栏 -->
      <a-col :span="8">
        <!-- 销售数据卡片 -->
        <a-card title="销售数据" :bordered="false" style="margin-bottom: 24px;">
          <a-statistic-group>
            <a-statistic
              title="总销量"
              :value="productDetail.salesData?.totalSales || 0"
              suffix="件"
            />
            <a-statistic
              title="销售额"
              :value="productDetail.salesData?.totalRevenue || 0"
              prefix="$"
              :precision="2"
            />
            <a-statistic
              title="利润"
              :value="productDetail.salesData?.totalProfit || 0"
              prefix="$"
              :precision="2"
              :value-style="{ color: '#52c41a' }"
            />
          </a-statistic-group>

          <!-- 销量趋势图 -->
          <div style="margin-top: 24px;">
            <h4>销量趋势（近30天）</h4>
            <div id="salesChart" style="height: 200px;"></div>
          </div>
        </a-card>

        <!-- 相关商品推荐 -->
        <a-card title="相关商品推荐" :bordered="false" style="margin-bottom: 24px;">
          <div class="related-products">
            <div 
              v-for="product in relatedProducts" 
              :key="product.id"
              class="related-product-item"
              @click="viewRelatedProduct(product.id)"
            >
              <a-image
                :width="50"
                :height="50"
                :src="product.image"
                :preview="false"
                style="border-radius: 4px;"
              />
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">${{ product.price?.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 操作按钮 -->
        <a-card title="操作" :bordered="false">
          <a-space direction="vertical" style="width: 100%;">
            <a-button type="primary" block @click="editProduct">
              <template #icon><EditOutlined /></template>
              编辑商品
            </a-button>
            
            <a-button v-if="productDetail.status === 'pending'" block @click="approveProduct">
              <template #icon><CheckOutlined /></template>
              审核通过
            </a-button>
            
            <a-button v-if="productDetail.status === 'pending'" block @click="rejectProduct">
              <template #icon><CloseOutlined /></template>
              审核不通过
            </a-button>
            
            <a-button block @click="copyProduct">
              <template #icon><CopyOutlined /></template>
              复制商品
            </a-button>
            
            <a-button block @click="downloadProduct">
              <template #icon><DownloadOutlined /></template>
              导出商品
            </a-button>
            
            <a-button danger block @click="deleteProduct">
              <template #icon><DeleteOutlined /></template>
              删除商品
            </a-button>
            
            <a-button block @click="goBack">
              <template #icon><ArrowLeftOutlined /></template>
              返回列表
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:visible="auditModalVisible"
      :title="auditForm.type === 'approve' ? '商品审核通过' : '商品审核不通过'"
      @ok="handleAudit"
    >
      <a-form :model="auditForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="审核结果">
          <a-radio-group v-model:value="auditForm.type">
            <a-radio value="approve">审核通过</a-radio>
            <a-radio value="reject">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea 
            v-model:value="auditForm.remark" 
            :placeholder="auditForm.type === 'reject' ? '请输入拒绝原因' : '可填写审核备注(选填)'"
            :rows="3"
            :required="auditForm.type === 'reject'"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()

const currentImageIndex = ref(0)
const auditModalVisible = ref(false)

// 当前显示的图片
const currentImage = ref('')

// 审核表单
const auditForm = reactive({
  type: 'approve',
  remark: ''
})

// 商品详情数据
const productDetail = ref({
  id: null,
  name: '',
  code: '',
  categoryName: '',
  price: 0,
  suggestedPrice: 0,
  cost: 0,
  stock: 0,
  supplierName: '',
  status: 'pending',
  createdAt: '',
  images: [],
  description: '',
  specifications: [],
  stores: [],
  salesData: {},
  auditInfo: null
})

// 相关商品
const relatedProducts = ref([])

// 规格参数表列配置
const specColumns = [
  {
    title: '参数名称',
    dataIndex: 'name',
    key: 'name',
    width: '40%'
  },
  {
    title: '参数值',
    dataIndex: 'value',
    key: 'value'
  }
]

// 上架店铺表列配置
const storeColumns = [
  {
    title: '商家名称',
    dataIndex: 'merchantName',
    key: 'merchantName'
  },
  {
    title: '店铺名称',
    dataIndex: 'storeName',
    key: 'storeName'
  },
  {
    title: '上架时间',
    dataIndex: 'listedAt',
    key: 'listedAt'
  },
  {
    title: '售价',
    key: 'price'
  },
  {
    title: '状态',
    key: 'status'
  },
  {
    title: '操作',
    key: 'action'
  }
]

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    draft: 'default',
    published: 'green',
    rejected: 'red'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '审核中',
    draft: '待发布',
    published: '已上架',
    rejected: '审核不通过'
  }
  return texts[status] || '未知'
}

// 初始化模拟数据
const initProductDetail = (id) => {
  const mockData = {
    id: parseInt(id),
    name: `高品质商品 ${id} - 限时特惠款`,
    code: `PRD${String(id).padStart(6, '0')}`,
    categoryName: '电子产品',
    price: 299.99,
    suggestedPrice: 399.99,
    cost: 150.00,
    stock: 156,
    supplierName: '优质供应商A',
    status: ['pending', 'draft', 'published', 'rejected'][Math.floor(Math.random() * 4)],
    createdAt: '2023-12-01 10:30:00',
    images: [
      `https://picsum.photos/400/400?random=${id}`,
      `https://picsum.photos/400/400?random=${id + 100}`,
      `https://picsum.photos/400/400?random=${id + 200}`,
      `https://picsum.photos/400/400?random=${id + 300}`
    ],
    description: `
      <h3>商品详细描述</h3>
      <p>这是一款精心设计的高品质商品，采用优质材料制作，具有以下特点：</p>
      <ul>
        <li>优质材料：采用高级原材料，确保产品质量</li>
        <li>精工细作：经过精密加工，细节处理完美</li>
        <li>设计美观：时尚外观设计，符合现代审美</li>
        <li>性能卓越：优异的性能表现，满足各种需求</li>
        <li>安全可靠：通过多项安全认证，使用放心</li>
      </ul>
      <p>适用场景：家庭、办公、户外等多种环境。</p>
    `,
    specifications: [
      { name: '品牌', value: '优质品牌' },
      { name: '型号', value: `Model-${id}` },
      { name: '颜色', value: '经典黑色' },
      { name: '尺寸', value: '25cm × 15cm × 8cm' },
      { name: '重量', value: '0.8kg' },
      { name: '材质', value: '高级合金' },
      { name: '保修期', value: '1年' },
      { name: '产地', value: '中国' }
    ],
    stores: [
      {
        id: 1,
        merchantName: '商家A',
        storeName: '时尚潮品店',
        listedAt: '2023-11-15',
        price: 329.99,
        status: 'active'
      },
      {
        id: 2,
        merchantName: '商家B',
        storeName: '精品生活馆',
        listedAt: '2023-11-20',
        price: 319.99,
        status: 'active'
      },
      {
        id: 3,
        merchantName: '商家C',
        storeName: '优选商城',
        listedAt: '2023-11-25',
        price: 339.99,
        status: 'inactive'
      }
    ],
    salesData: {
      totalSales: 1234,
      totalRevenue: 369872.34,
      totalProfit: 184936.17
    },
    auditInfo: Math.random() > 0.5 ? {
      auditor: '审核员张三',
      auditTime: '2023-12-02 14:20:00',
      result: Math.random() > 0.3 ? 'approved' : 'rejected',
      remark: '商品信息完整，质量符合要求，审核通过。'
    } : null
  }
  
  return mockData
}

// 初始化相关商品数据
const initRelatedProducts = () => {
  const products = []
  for (let i = 1; i <= 5; i++) {
    products.push({
      id: i + 1000,
      name: `相关商品 ${i}`,
      image: `https://picsum.photos/100/100?random=${i + 500}`,
      price: Math.floor(Math.random() * 500 + 100)
    })
  }
  return products
}

// 加载商品详情
const loadProductDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      message.error('商品ID不能为空')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const data = initProductDetail(id)
    productDetail.value = data
    currentImage.value = data.images[0]
    
    // 加载相关商品
    relatedProducts.value = initRelatedProducts()
    
    // 渲染销量图表
    nextTick(() => {
      renderSalesChart()
    })
    
  } catch (error) {
    message.error('加载商品详情失败')
  }
}

// 切换图片
const switchImage = (index) => {
  currentImageIndex.value = index
  currentImage.value = productDetail.value.images[index]
}

// 预览图片
const previewImages = () => {
  // 这里可以实现图片预览功能
  console.log('预览图片')
}

// 渲染销量图表
const renderSalesChart = () => {
  const chartDom = document.getElementById('salesChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 生成近30天销量数据
  const dates = []
  const salesData = []
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    
    // 模拟销量数据
    const dailySales = Math.floor(Math.random() * 50 + 10)
    salesData.push(dailySales)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销量: {c}件'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { 
        rotate: 45,
        interval: 4 // 每5个显示一个标签
      }
    },
    yAxis: {
      type: 'value',
      name: '销量'
    },
    series: [{
      name: '销量',
      type: 'line',
      data: salesData,
      smooth: true,
      itemStyle: { color: '#1890ff' },
      areaStyle: { opacity: 0.3 }
    }]
  }
  
  myChart.setOption(option)
}

// 编辑商品
const editProduct = () => {
  router.push(`/admin/products/edit/${productDetail.value.id}`)
}

// 审核商品
const approveProduct = () => {
  auditForm.type = 'approve'
  auditForm.remark = ''
  auditModalVisible.value = true
}

const rejectProduct = () => {
  auditForm.type = 'reject'
  auditForm.remark = ''
  auditModalVisible.value = true
}

// 处理审核
const handleAudit = async () => {
  if (auditForm.type === 'reject' && !auditForm.remark) {
    message.error('审核不通过时必须填写拒绝原因')
    return
  }
  
  try {
    const action = auditForm.type === 'approve' ? '通过' : '拒绝'
    message.success(`商品审核${action}成功`)
    auditModalVisible.value = false
    // 重新加载数据
    loadProductDetail()
  } catch (error) {
    message.error('审核操作失败')
  }
}

// 复制商品
const copyProduct = () => {
  Modal.confirm({
    title: '复制商品',
    content: `确定要复制商品 "${productDetail.value.name}" 吗？`,
    onOk: async () => {
      try {
        message.success('商品复制成功')
      } catch (error) {
        message.error('复制失败')
      }
    }
  })
}

// 下载商品
const downloadProduct = () => {
  message.success('导出功能开发中...')
}

// 删除商品
const deleteProduct = () => {
  Modal.confirm({
    title: '删除商品',
    content: `确定要删除商品 "${productDetail.value.name}" 吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        message.success('商品删除成功')
        router.push('/admin/products')
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 查看店铺
const viewStore = (store) => {
  message.info(`查看店铺：${store.storeName}`)
}

// 查看相关商品
const viewRelatedProduct = (id) => {
  router.push(`/admin/products/${id}`)
}

// 返回列表
const goBack = () => {
  router.push('/admin/products')
}

// 组件挂载时加载数据
onMounted(() => {
  loadProductDetail()
})
</script>

<style scoped lang="scss">
.product-detail-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.status-header {
  text-align: center;
}

.image-gallery {
  .image-thumbnails {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    
    .thumbnail {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 6px;
      overflow: hidden;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: #1890ff;
      }
      
      &.active {
        border-color: #1890ff;
      }
    }
  }
}

.product-info {
  .product-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 24px;
  }
  
  .price {
    font-size: 20px;
    font-weight: 600;
    color: #f5222d;
  }
  
  .suggested-price {
    font-size: 16px;
    color: #52c41a;
  }
  
  .cost-price {
    font-size: 16px;
    color: #fa8c16;
  }
  
  .low-stock {
    color: #ff4d4f;
    font-weight: 500;
  }
  
  .audit-info {
    margin-top: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 6px;
    
    h4 {
      margin-bottom: 12px;
      color: #262626;
    }
  }
}

.description-content {
  line-height: 1.6;
  color: #595959;
  
  h3 {
    color: #262626;
    margin-bottom: 16px;
  }
  
  ul {
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
    }
  }
}

.specifications {
  margin-top: 24px;
  
  h4 {
    margin-bottom: 16px;
    color: #262626;
  }
}

.related-products {
  .related-product-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    .product-info {
      margin-left: 12px;
      flex: 1;
      
      .product-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .product-price {
        color: #52c41a;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  color: #595959;
}

:deep(.ant-descriptions-item-content) {
  color: #262626;
}

:deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 600;
}
</style> 