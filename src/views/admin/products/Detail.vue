<template>
  <div class="product-detail-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" style="margin-bottom: 16px;">
      <el-breadcrumb-item>
        <router-link to="/admin/dashboard">首页</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <router-link to="/admin/products">商品管理</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 商品状态标签 -->
    <div class="status-header">
      <el-tag
        :type="getStatusType(productDetail.status)"
        size="large"
        style="font-size: 16px; padding: 8px 16px; margin-bottom: 24px;"
      >
        {{ getStatusText(productDetail.status) }}
      </el-tag>
    </div>

    <el-row :gutter="24">
      <!-- 左侧内容 -->
      <el-col :span="16">
        <!-- 商品基本信息卡片 -->
        <el-card shadow="never" style="margin-bottom: 24px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">商品基本信息</span>
            </div>
          </template>
          <el-row :gutter="32">
            <el-col :span="8">
              <!-- 商品图片展示 -->
              <div class="image-gallery">
                <div class="main-image-container">
                  <el-image
                    :src="currentImage"
                    fit="cover"
                    class="main-image"
                    :preview-src-list="productDetail.images"
                    @click="previewImages"
                  />
                </div>
                <div v-if="productDetail.images && productDetail.images.length > 1" class="image-thumbnails">
                  <div
                    v-for="(image, index) in productDetail.images"
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
            </el-col>
            <el-col :span="16">
              <div class="product-info">
                <div class="product-header">
                  <h2 class="product-title">{{ productDetail.name }}</h2>
                  <div class="product-code">
                    <el-tag type="info" size="large">{{ productDetail.code }}</el-tag>
                  </div>
                </div>

                <div class="product-details">
                  <el-row :gutter="24">
                    <el-col :span="12">
                      <div class="detail-item">
                        <label class="detail-label">商品分类</label>
                        <div class="detail-value">{{ productDetail.categoryName }}</div>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">商品价格</label>
                        <div class="detail-value price">${{ productDetail.price?.toFixed(2) }}</div>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">建议零售价</label>
                        <div class="detail-value suggested-price">${{ productDetail.suggestedPrice?.toFixed(2) }}</div>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">采购成本</label>
                        <div class="detail-value cost-price">${{ productDetail.cost?.toFixed(2) }}</div>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="detail-item">
                        <label class="detail-label">库存数量</label>
                        <div class="detail-value" :class="{ 'low-stock': productDetail.stock < 10 }">
                          {{ productDetail.stock }}
                        </div>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">供应商</label>
                        <div class="detail-value">{{ productDetail.supplierName }}</div>
                      </div>
                      <div class="detail-item">
                        <label class="detail-label">创建时间</label>
                        <div class="detail-value">{{ productDetail.createdAt }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>


              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 商品描述信息卡片 -->
        <el-card shadow="never" style="margin-bottom: 24px;">
          <template #header>
            <span>商品描述</span>
          </template>
          <div class="description-content" v-html="productDetail.description || '暂无描述'"></div>

          <!-- 规格参数表 -->
          <div v-if="productDetail.specifications" class="specifications">
            <h4>规格参数</h4>
            <el-table
              :data="productDetail.specifications"
              style="width: 100%"
              size="small"
              :show-header="false"
            >
              <el-table-column prop="name" width="200">
                <template #default="{ row }">
                  <strong>{{ row.name }}</strong>
                </template>
              </el-table-column>
              <el-table-column prop="value" />
            </el-table>
          </div>
        </el-card>

        <!-- 上架店铺卡片 -->
        <el-card shadow="never" style="margin-bottom: 24px;">
          <template #header>
            <span>上架店铺</span>
          </template>
          <el-table
            :data="productDetail.stores"
            style="width: 100%"
            size="default"
          >
            <el-table-column prop="merchantName" label="商家名称" />
            <el-table-column prop="storeName" label="店铺名称" />
            <el-table-column prop="listedAt" label="上架时间" />
            <el-table-column label="售价">
              <template #default="{ row }">
                ${{ row.price?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                  {{ row.status === 'active' ? '上架中' : '已下架' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewStore(row)">查看店铺</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧边栏 -->
      <el-col :span="8">
        <!-- 销售数据卡片 -->
        <el-card shadow="never" style="margin-bottom: 24px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">销售数据</span>
            </div>
          </template>
          <div class="sales-statistics">
            <div class="statistic-item">
              <div class="statistic-value">{{ productDetail.salesData?.totalSales || 0 }}</div>
              <div class="statistic-label">总销量 (件)</div>
            </div>
            <div class="statistic-item">
              <div class="statistic-value sales-revenue">${{ (productDetail.salesData?.totalRevenue || 0).toFixed(2) }}</div>
              <div class="statistic-label">销售额</div>
            </div>
            <div class="statistic-item">
              <div class="statistic-value profit">${{ (productDetail.salesData?.totalProfit || 0).toFixed(2) }}</div>
              <div class="statistic-label">利润</div>
            </div>
          </div>

          <!-- 销量趋势图 -->
          <div class="chart-section">
            <h4 class="chart-title">销量趋势（近30天）</h4>
            <div id="salesChart" class="chart-container"></div>
          </div>
        </el-card>

        <!-- 审核信息 -->
        <el-card v-if="productDetail.auditInfo" shadow="never" style="margin-bottom: 24px;">
          <template #header>
            <div class="card-header">
              <span class="card-title">审核信息</span>
            </div>
          </template>
          <div class="audit-info">
            <!-- 审核结果 -->
            <div class="audit-result-section">
              <el-tag
                :type="productDetail.auditInfo.result === 'approved' ? 'success' : 'danger'"
                size="large"
                effect="dark"
                class="audit-result-tag"
              >
                <el-icon class="result-icon">
                  <Check v-if="productDetail.auditInfo.result === 'approved'" />
                  <Close v-else />
                </el-icon>
                {{ productDetail.auditInfo.result === 'approved' ? '审核通过' : '审核不通过' }}
              </el-tag>
            </div>

            <!-- 审核详情 -->
            <div class="audit-details">
              <div class="audit-item">
                <div class="audit-label">
                  <el-icon><User /></el-icon>
                  <span>审核人</span>
                </div>
                <div class="audit-value">{{ productDetail.auditInfo.auditor }}</div>
              </div>

              <div class="audit-item">
                <div class="audit-label">
                  <el-icon><Clock /></el-icon>
                  <span>审核时间</span>
                </div>
                <div class="audit-value">{{ productDetail.auditInfo.auditTime }}</div>
              </div>

              <div v-if="productDetail.auditInfo.remark" class="audit-item">
                <div class="audit-label">
                  <el-icon><Document /></el-icon>
                  <span>审核备注</span>
                </div>
                <div class="audit-value audit-remark">{{ productDetail.auditInfo.remark }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">操作</span>
            </div>
          </template>
          <div class="operation-buttons">
            <el-button type="primary" class="operation-btn" @click="editProduct">
              <el-icon><Edit /></el-icon>
              编辑商品
            </el-button>

            <el-button v-if="productDetail.status === 'pending'" type="success" class="operation-btn" @click="approveProduct">
              <el-icon><Check /></el-icon>
              审核通过
            </el-button>

            <el-button v-if="productDetail.status === 'pending'" type="warning" class="operation-btn" @click="rejectProduct">
              <el-icon><Close /></el-icon>
              审核不通过
            </el-button>

            <el-button class="operation-btn" @click="copyProduct">
              <el-icon><CopyDocument /></el-icon>
              复制商品
            </el-button>

            <el-button class="operation-btn" @click="downloadProduct">
              <el-icon><Download /></el-icon>
              导出商品
            </el-button>

            <el-button type="danger" class="operation-btn" @click="deleteProduct">
              <el-icon><Delete /></el-icon>
              删除商品
            </el-button>

            <el-button class="operation-btn back-btn" @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditModalVisible"
      :title="auditForm.type === 'approve' ? '商品审核通过' : '商品审核不通过'"
      width="500px"
    >
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.type">
            <el-radio value="approve">审核通过</el-radio>
            <el-radio value="reject">审核不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :placeholder="auditForm.type === 'reject' ? '请输入拒绝原因' : '可填写审核备注(选填)'"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAudit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Check,
  Close,
  CopyDocument,
  Download,
  Delete,
  ArrowLeft,
  User,
  Clock,
  Document
} from '@element-plus/icons-vue'
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



// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    draft: 'info',
    published: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
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
    auditInfo: {
      auditor: '审核员张三',
      auditTime: '2023-12-02 14:20:00',
      result: 'approved',
      remark: '商品信息完整，质量符合要求，审核通过。'
    }
  }
  
  return mockData
}



// 加载商品详情
const loadProductDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      ElMessage.error('商品ID不能为空')
      return
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const data = initProductDetail(id)
    productDetail.value = data
    currentImage.value = data.images[0]



    // 渲染销量图表
    nextTick(() => {
      renderSalesChart()
    })

  } catch (error) {
    ElMessage.error('加载商品详情失败')
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
    ElMessage.error('审核不通过时必须填写拒绝原因')
    return
  }

  try {
    const action = auditForm.type === 'approve' ? '通过' : '拒绝'
    ElMessage.success(`商品审核${action}成功`)
    auditModalVisible.value = false
    // 重新加载数据
    loadProductDetail()
  } catch (error) {
    ElMessage.error('审核操作失败')
  }
}

// 复制商品
const copyProduct = () => {
  ElMessageBox.confirm(
    `确定要复制商品 "${productDetail.value.name}" 吗？`,
    '复制商品',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      ElMessage.success('商品复制成功')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 下载商品
const downloadProduct = () => {
  ElMessage.success('导出功能开发中...')
}

// 删除商品
const deleteProduct = () => {
  ElMessageBox.confirm(
    `确定要删除商品 "${productDetail.value.name}" 吗？此操作不可恢复。`,
    '删除商品',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      ElMessage.success('商品删除成功')
      router.push('/admin/products')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 查看店铺
const viewStore = (store) => {
  ElMessage.info(`查看店铺：${store.storeName}`)
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
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.status-header {
  text-align: center;
  margin-bottom: 24px;

  .el-tag {
    font-size: 16px;
    padding: 12px 24px;
    border-radius: 20px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.image-gallery {
  .main-image-container {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e4e7ed;

    .main-image {
      width: 100%;
      height: 100%;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.02);
      }
    }
  }

  .image-thumbnails {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    justify-content: flex-start;

    .thumbnail {
      width: 60px;
      height: 60px;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
      }

      &.active {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }

      .thumbnail-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.product-info {
  .product-header {
    margin-bottom: 32px;

    .product-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .product-code {
      margin-bottom: 8px;
    }
  }

  .product-details {
    margin-bottom: 32px;
  }

  .detail-item {
    margin-bottom: 20px;

    .detail-label {
      display: block;
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .detail-value {
      font-size: 16px;
      color: #303133;
      font-weight: 500;

      &.price {
        font-size: 24px;
        font-weight: 700;
        color: #f56c6c;
      }

      &.suggested-price {
        font-size: 18px;
        font-weight: 600;
        color: #67c23a;
      }

      &.cost-price {
        font-size: 18px;
        font-weight: 600;
        color: #e6a23c;
      }

      &.low-stock {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }

  .audit-info {
    padding: 0;

    .audit-result-section {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #ebeef5;

      .audit-result-tag {
        font-size: 15px;
        padding: 10px 24px;
        border-radius: 16px;
        font-weight: 600;
        letter-spacing: 0.5px;

        .result-icon {
          margin-right: 8px;
          font-size: 14px;
        }
      }
    }

    .audit-details {
      .audit-item {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        .audit-label {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #909399;
          margin-bottom: 6px;
          font-weight: 400;
          letter-spacing: 0.3px;

          .el-icon {
            margin-right: 6px;
            color: #c0c4cc;
            font-size: 14px;
          }
        }

        .audit-value {
          font-size: 16px;
          color: #303133;
          font-weight: 500;
          line-height: 1.4;
          padding-left: 20px;
          margin-bottom: 4px;

          &.audit-remark {
            background: #f5f7fa;
            padding: 16px 20px;
            border-radius: 8px;
            border-left: 4px solid #409eff;
            margin-left: 0;
            margin-top: 8px;
            line-height: 1.6;
            font-size: 14px;
            color: #606266;
            font-weight: 400;
          }
        }
      }
    }
  }
}

.description-content {
  line-height: 1.6;
  color: #606266;

  h3 {
    color: #303133;
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
    color: #303133;
  }
}

.sales-statistics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  .statistic-item {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .statistic-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 8px;

      &.sales-revenue {
        color: #409eff;
      }

      &.profit {
        color: #67c23a;
      }
    }

    .statistic-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.chart-section {
  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
    display: inline-block;
  }

  .chart-container {
    height: 200px;
    border-radius: 8px;
    background: #fafafa;
  }
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .operation-btn {
    width: 100%;
    height: 44px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .el-icon {
      margin-right: 8px;
    }

    &.back-btn {
      margin-top: 8px;
      border-top: 1px solid #e4e7ed;
      padding-top: 20px;
    }
  }
}



:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

// 全局卡片样式
:deep(.el-card) {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #fafbfc 0%, #f1f3f4 100%);
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 24px;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

:deep(.el-card__body) {
  padding: 24px;
}

// 面包屑样式
:deep(.el-breadcrumb) {
  font-size: 14px;

  .el-breadcrumb__item {
    .el-breadcrumb__inner {
      color: #606266;

      &:hover {
        color: #409eff;
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: #303133;
      font-weight: 500;
    }
  }
}

// 表格样式优化
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;

  .el-table__header {
    background: #fafbfc;
  }

  .el-table__row {
    &:hover {
      background: #f8f9fa;
    }
  }
}
</style> 