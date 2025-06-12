<template>
  <div class="store-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item>
        <router-link to="/merchant/stores">我的店铺</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ storeInfo.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 店铺基本信息 -->
    <div class="store-header">
      <div class="store-basic-info">
        <div class="store-avatar">
          <el-icon size="40" color="#409eff"><Shop /></el-icon>
        </div>
        <div class="store-details">
          <h1 class="store-name">{{ storeInfo.name }}</h1>
          <div class="store-meta">
            <div class="meta-item">
              <el-icon><Link /></el-icon>
              <el-link :href="storeInfo.url" target="_blank" type="primary">
                {{ storeInfo.url }}
              </el-link>
            </div>
            <div class="meta-item">
              <el-icon><Key /></el-icon>
              <span>店铺ID: {{ storeInfo.shopify_id }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>添加时间: {{ formatDate(storeInfo.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="store-actions">
        <el-tag
          :type="storeInfo.status === 'active' ? 'success' : 'danger'"
          size="large"
        >
          {{ storeInfo.status === 'active' ? '授权正常' : '授权已过期' }}
        </el-tag>
        <div class="action-buttons">
          <el-button v-if="storeInfo.status !== 'active'" type="primary" @click="handleReauth">
            重新授权
          </el-button>
          <el-button type="success" @click="handleSync" :loading="syncing">
            <el-icon><Refresh /></el-icon>
            同步数据
          </el-button>
          <el-dropdown @command="handleMoreAction">
            <el-button>
              更多操作
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑店铺信息</el-dropdown-item>
                <el-dropdown-item command="export">导出数据</el-dropdown-item>
                <el-dropdown-item command="delete" style="color: #f56c6c">删除店铺</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-content">
          <div class="card-value">{{ storeStats.totalProducts }}</div>
          <div class="card-label">店铺商品总数</div>
        </div>
        <div class="card-icon">
          <el-icon size="32" color="#409eff"><Goods /></el-icon>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-content">
          <div class="card-value">{{ storeStats.totalOrders }}</div>
          <div class="card-label">历史订单总数</div>
        </div>
        <div class="card-icon">
          <el-icon size="32" color="#67c23a"><DocumentChecked /></el-icon>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-content">
          <div class="card-value">${{ storeStats.totalRevenue }}</div>
          <div class="card-label">总销售额</div>
        </div>
        <div class="card-icon">
          <el-icon size="32" color="#f56c6c"><Money /></el-icon>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-content">
          <div class="card-value">{{ storeStats.syncedProducts }}</div>
          <div class="card-label">已同步商品</div>
        </div>
        <div class="card-icon">
          <el-icon size="32" color="#e6a23c"><Upload /></el-icon>
        </div>
      </div>
    </div>

    <!-- 历史数据图表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>数据趋势</h3>
        <el-radio-group v-model="chartPeriod" @change="updateChart">
          <el-radio-button label="7d">近7天</el-radio-button>
          <el-radio-button label="30d">近30天</el-radio-button>
          <el-radio-button label="90d">近90天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container">
        <div class="chart-placeholder">
          <el-icon size="48" color="#c0c4cc"><TrendCharts /></el-icon>
          <p>数据图表展示区域</p>
          <p class="chart-note">（实际项目中这里会显示 ECharts 图表）</p>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-section">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="商品管理" name="products">
          <div class="tab-content">
            <div class="content-header">
              <h4>店铺商品列表</h4>
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                添加商品
              </el-button>
            </div>
            <el-table :data="productList" stripe>
              <el-table-column prop="name" label="商品名称" />
              <el-table-column prop="sku" label="SKU" />
              <el-table-column prop="price" label="价格">
                <template #default="{ row }">
                  ${{ row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="inventory" label="库存" />
              <el-table-column label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'active' ? '上架' : '下架' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button size="small" type="text">编辑</el-button>
                  <el-button size="small" type="text" style="color: #f56c6c">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="订单管理" name="orders">
          <div class="tab-content">
            <div class="content-header">
              <h4>店铺订单列表</h4>
              <el-button type="primary" size="small">
                <el-icon><Download /></el-icon>
                导出订单
              </el-button>
            </div>
            <el-table :data="orderList" stripe>
              <el-table-column prop="order_number" label="订单号" />
              <el-table-column prop="customer_name" label="客户姓名" />
              <el-table-column prop="total_amount" label="订单金额">
                <template #default="{ row }">
                  ${{ row.total_amount }}
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="下单时间">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="状态">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.status)" size="small">
                    {{ getOrderStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button size="small" type="text">查看</el-button>
                  <el-button size="small" type="text">处理</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="同步记录" name="sync-logs">
          <div class="tab-content">
            <div class="content-header">
              <h4>数据同步记录</h4>
              <el-button type="primary" size="small" @click="handleSync">
                <el-icon><Refresh /></el-icon>
                立即同步
              </el-button>
            </div>
            <el-table :data="syncLogs" stripe>
              <el-table-column prop="sync_type" label="同步类型" />
              <el-table-column prop="sync_time" label="同步时间">
                <template #default="{ row }">
                  {{ formatDateTime(row.sync_time) }}
                </template>
              </el-table-column>
              <el-table-column label="同步状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sync_count" label="同步数量" />
              <el-table-column prop="message" label="备注" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Shop,
  Link,
  Key,
  Calendar,
  Refresh,
  ArrowDown,
  Goods,
  DocumentChecked,
  Money,
  Upload,
  TrendCharts,
  Plus,
  Download
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const syncing = ref(false)
const chartPeriod = ref('30d')
const activeTab = ref('products')

// 店铺基本信息（模拟数据）
const storeInfo = ref({
  id: route.params.id,
  name: 'Fashion Store',
  url: 'https://fashion-store.myshopify.com',
  shopify_id: 'shop_12345',
  status: 'active',
  created_at: '2023-12-01T10:00:00Z'
})

// 店铺统计数据
const storeStats = ref({
  totalProducts: 156,
  totalOrders: 1234,
  totalRevenue: '45,678.90',
  syncedProducts: 148
})

// 商品列表数据
const productList = ref([
  {
    id: 1,
    name: '时尚连衣裙',
    sku: 'DRESS-001',
    price: '59.99',
    inventory: 25,
    status: 'active'
  },
  {
    id: 2,
    name: '运动鞋',
    sku: 'SHOES-002',
    price: '89.99',
    inventory: 0,
    status: 'inactive'
  }
])

// 订单列表数据
const orderList = ref([
  {
    id: 1,
    order_number: 'ORD-2023-001',
    customer_name: 'John Doe',
    total_amount: '129.99',
    created_at: '2023-12-10T15:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    order_number: 'ORD-2023-002',
    customer_name: 'Jane Smith',
    total_amount: '59.99',
    created_at: '2023-12-09T10:15:00Z',
    status: 'pending'
  }
])

// 同步记录数据
const syncLogs = ref([
  {
    sync_type: '商品同步',
    sync_time: '2023-12-10T08:00:00Z',
    status: 'success',
    sync_count: 10,
    message: '成功同步10个商品'
  },
  {
    sync_type: '订单同步',
    sync_time: '2023-12-09T20:00:00Z',
    status: 'success',
    sync_count: 5,
    message: '成功同步5个订单'
  }
])

// 方法
const handleReauth = () => {
  ElMessage.info('重新授权功能开发中')
}

const handleSync = async () => {
  syncing.value = true
  try {
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('数据同步成功')
  } catch (error) {
    ElMessage.error('数据同步失败')
  } finally {
    syncing.value = false
  }
}

const handleMoreAction = async (command) => {
  switch (command) {
    case 'edit':
      ElMessage.info('编辑店铺信息功能开发中')
      break
    case 'export':
      ElMessage.info('导出数据功能开发中')
      break
    case 'delete':
      try {
        await ElMessageBox.confirm(
          '删除后将无法恢复，确定要删除此店铺吗？',
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
          }
        )
        ElMessage.success('店铺删除成功')
        router.push('/merchant/stores')
      } catch {
        // 用户取消删除
      }
      break
  }
}

const updateChart = () => {
  ElMessage.info(`正在加载 ${chartPeriod.value} 的数据`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOrderStatusType = (status) => {
  const statusMap = {
    'completed': 'success',
    'pending': 'warning',
    'cancelled': 'danger',
    'processing': 'primary'
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'pending': '待处理',
    'cancelled': '已取消',
    'processing': '处理中'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  // 根据路由参数加载店铺详情
  console.log('加载店铺详情，ID:', route.params.id)
})
</script>

<style lang="scss" scoped>
.store-detail {
  .breadcrumb {
    margin-bottom: 20px;
  }

  .store-header {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .store-basic-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .store-avatar {
        width: 60px;
        height: 60px;
        background: #f0f9ff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .store-details {
        .store-name {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .store-meta {
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
            font-size: 14px;
            color: #6b7280;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .store-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;

      .action-buttons {
        display: flex;
        gap: 8px;
      }
    }
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-content {
        .card-value {
          font-size: 28px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .card-label {
          font-size: 14px;
          color: #6b7280;
        }
      }

      .card-icon {
        opacity: 0.6;
      }
    }
  }

  .chart-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .chart-container {
      height: 300px;
      
      .chart-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f9fafb;
        border-radius: 8px;
        border: 2px dashed #d1d5db;

        p {
          margin: 8px 0;
          color: #6b7280;
        }

        .chart-note {
          font-size: 12px;
          color: #9ca3af;
        }
      }
    }
  }

  .tabs-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .tab-content {
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
      }
    }
  }
}
</style> 