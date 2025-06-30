<template>
  <div class="stores-container">
    <a-card class="stores-card" title="店铺管理" :bordered="false">
      <!-- 搜索和筛选区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="店铺搜索">
                <a-input v-model:value="queryParam.keyword" placeholder="店铺名称/域名" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商家">
                <a-select v-model:value="queryParam.merchantId" placeholder="请选择商家" allow-clear style="width: 100%">
                  <a-select-option v-for="merchant in merchantList" :key="merchant.id" :value="merchant.id">
                    {{ merchant.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="店铺状态">
                <a-select v-model:value="queryParam.status" placeholder="请选择" default-value="" style="width: 100%">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="active">正常</a-select-option>
                  <a-select-option value="inactive">未激活</a-select-option>
                  <a-select-option value="suspended">已暂停</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="授权时间">
                <a-range-picker v-model:value="queryParam.dateRange" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :md="16" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
                <a-button type="default" style="margin-left: 8px" @click="exportData">
                  <template #icon><DownloadOutlined /></template>导出
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <!-- 表格 -->
      <a-table
        :columns="columns"
        :row-key="record => record.id"
        :data-source="filteredStores"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 店铺状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          
          <!-- 店铺名称列 -->
          <template v-if="column.key === 'name'">
            <a @click="viewStoreDetail(record)">{{ record.name }}</a>
          </template>

          <!-- 商家信息列 -->
          <template v-if="column.key === 'merchant'">
            <div>
              <div style="font-weight: 500;">{{ record.merchantName }}</div>
              <div style="font-size: 12px; color: #909399;">
                ID: {{ record.merchantId }}
              </div>
            </div>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a @click="viewStoreDetail(record)">查看详情</a>
              <a-divider type="vertical" />
              <a @click="viewStoreOrders(record)">查看订单</a>
              <a-divider type="vertical" />
              <a v-if="record.status === 'active'" @click="toggleStatus(record, 'suspended')">暂停</a>
              <a v-else @click="toggleStatus(record, 'active')" class="ant-btn-link-success">激活</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter, useRoute } from 'vue-router'
import { DownloadOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 搜索参数
const queryParam = reactive({
  keyword: '',
  merchantId: route.query.merchantId || '',
  status: '',
  dateRange: [],
  pageSize: 10,
  current: 1
})

// 表格分页设置
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
})

// 表格列配置
const columns = [
  {
    title: '店铺名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '店铺域名',
    dataIndex: 'domain',
    key: 'domain',
    ellipsis: true,
  },
  {
    title: '商家信息',
    key: 'merchant',
    width: 150,
  },
  {
    title: '店铺状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '商品数量',
    dataIndex: 'productCount',
    key: 'productCount',
    width: 100,
  },
  {
    title: '订单数量',
    dataIndex: 'orderCount',
    key: 'orderCount',
    width: 100,
  },
  {
    title: '月销售额($)',
    dataIndex: 'monthlySales',
    key: 'monthlySales',
    width: 120,
    customRender: ({ text }) => `$${text.toFixed(2)}`
  },
  {
    title: '授权时间',
    dataIndex: 'authorizedAt',
    key: 'authorizedAt',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
  }
]

// 商家列表
const merchantList = ref([
  { id: 1, name: '环球电子科技' },
  { id: 2, name: '极速数码' },
  { id: 3, name: '未来家居' },
  { id: 4, name: '优品服饰' },
  { id: 5, name: '城市花园' }
])

// 店铺列表数据
const storeList = ref([])

// 计算属性 - 过滤后的店铺列表
const filteredStores = computed(() => {
  return storeList.value.filter(store => {
    const matchKeyword = !queryParam.keyword || 
      store.name.toLowerCase().includes(queryParam.keyword.toLowerCase()) ||
      store.domain.toLowerCase().includes(queryParam.keyword.toLowerCase())
    
    const matchMerchant = !queryParam.merchantId || store.merchantId == queryParam.merchantId
    const matchStatus = !queryParam.status || store.status === queryParam.status
    
    return matchKeyword && matchMerchant && matchStatus
  })
})

// 状态相关函数
const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'inactive': 'orange',
    'suspended': 'red'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    'active': '正常',
    'inactive': '未激活',
    'suspended': '已暂停'
  }
  return textMap[status] || '未知'
}

// 加载店铺列表数据
const loadStoreList = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟数据
    storeList.value = [
      {
        id: 1,
        name: 'Global Tech Store',
        domain: 'global-tech.myshopify.com',
        merchantId: 1,
        merchantName: '环球电子科技',
        status: 'active',
        productCount: 156,
        orderCount: 89,
        monthlySales: 15420.50,
        authorizedAt: '2023-05-12 14:30:21'
      },
      {
        id: 2,
        name: 'Tech Paradise',
        domain: 'tech-paradise.myshopify.com',
        merchantId: 1,
        merchantName: '环球电子科技',
        status: 'active',
        productCount: 98,
        orderCount: 45,
        monthlySales: 8750.30,
        authorizedAt: '2023-06-18 09:15:42'
      },
      {
        id: 3,
        name: 'Digital World',
        domain: 'digital-world.myshopify.com',
        merchantId: 1,
        merchantName: '环球电子科技',
        status: 'suspended',
        productCount: 67,
        orderCount: 23,
        monthlySales: 4320.75,
        authorizedAt: '2023-07-22 16:45:33'
      },
      {
        id: 4,
        name: 'Fast Digital Store',
        domain: 'fast-digital.myshopify.com',
        merchantId: 2,
        merchantName: '极速数码',
        status: 'active',
        productCount: 234,
        orderCount: 156,
        monthlySales: 28950.80,
        authorizedAt: '2023-04-05 11:20:18'
      },
      {
        id: 5,
        name: 'Speed Electronics',
        domain: 'speed-electronics.myshopify.com',
        merchantId: 2,
        merchantName: '极速数码',
        status: 'active',
        productCount: 189,
        orderCount: 98,
        monthlySales: 19840.25,
        authorizedAt: '2023-08-10 08:55:27'
      },
      {
        id: 6,
        name: 'Future Home Decor',
        domain: 'future-home.myshopify.com',
        merchantId: 3,
        merchantName: '未来家居',
        status: 'inactive',
        productCount: 78,
        orderCount: 12,
        monthlySales: 2150.40,
        authorizedAt: '2023-09-15 13:25:19'
      },
      {
        id: 7,
        name: 'Fashion Paradise',
        domain: 'fashion-paradise.myshopify.com',
        merchantId: 4,
        merchantName: '优品服饰',
        status: 'active',
        productCount: 345,
        orderCount: 234,
        monthlySales: 45620.90,
        authorizedAt: '2023-03-28 16:40:55'
      },
      {
        id: 8,
        name: 'Style Central',
        domain: 'style-central.myshopify.com',
        merchantId: 4,
        merchantName: '优品服饰',
        status: 'active',
        productCount: 298,
        orderCount: 189,
        monthlySales: 38750.60,
        authorizedAt: '2023-05-20 10:15:33'
      },
      {
        id: 9,
        name: 'Best Fashion',
        domain: 'best-fashion.myshopify.com',
        merchantId: 4,
        merchantName: '优品服饰',
        status: 'active',
        productCount: 267,
        orderCount: 145,
        monthlySales: 32980.45,
        authorizedAt: '2023-07-08 14:50:22'
      },
      {
        id: 10,
        name: 'Trendy Styles',
        domain: 'trendy-styles.myshopify.com',
        merchantId: 4,
        merchantName: '优品服饰',
        status: 'suspended',
        productCount: 156,
        orderCount: 67,
        monthlySales: 15420.30,
        authorizedAt: '2023-08-25 09:30:15'
      },
      {
        id: 11,
        name: 'City Garden Store',
        domain: 'city-garden.myshopify.com',
        merchantId: 5,
        merchantName: '城市花园',
        status: 'active',
        productCount: 123,
        orderCount: 78,
        monthlySales: 18650.75,
        authorizedAt: '2023-06-12 11:25:40'
      },
      {
        id: 12,
        name: 'Garden Paradise',
        domain: 'garden-paradise.myshopify.com',
        merchantId: 5,
        merchantName: '城市花园',
        status: 'active',
        productCount: 89,
        orderCount: 45,
        monthlySales: 12350.90,
        authorizedAt: '2023-09-03 15:18:27'
      }
    ]
    
    pagination.total = filteredStores.value.length
  } catch (error) {
    console.error('Failed to load store list:', error)
    message.error('加载店铺列表失败')
  } finally {
    loading.value = false
  }
}

// 处理表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadStoreList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadStoreList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    keyword: '',
    merchantId: '',
    status: '',
    dateRange: [],
    current: 1
  })
  pagination.current = 1
  loadStoreList()
}

// 查看店铺详情
const viewStoreDetail = (record) => {
  // 跳转到商家端的店铺详情页面
  router.push({ name: 'StoreDetail', params: { id: record.id } })
}

// 查看店铺订单
const viewStoreOrders = (record) => {
  // 跳转到订单管理页面，带上店铺ID参数
  router.push({ path: '/admin/orders/store', query: { storeId: record.id } })
}

// 切换店铺状态
const toggleStatus = async (record, status) => {
  try {
    loading.value = true
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 更新本地状态
    const index = storeList.value.findIndex(item => item.id === record.id)
    if (index !== -1) {
      storeList.value[index].status = status
    }
    
    message.success(`${status === 'active' ? '激活' : '暂停'}店铺成功`)
  } catch (error) {
    console.error('Failed to toggle store status:', error)
    message.error(`${status === 'active' ? '激活' : '暂停'}店铺失败`)
  } finally {
    loading.value = false
  }
}

// 导出数据
const exportData = () => {
  message.success('数据导出功能开发中...')
}

onMounted(() => {
  loadStoreList()
})
</script>

<style scoped>
.stores-container {
  padding: 20px;
}

.stores-card {
  margin-bottom: 20px;
}

.table-page-search-wrapper {
  margin-bottom: 20px;
}

.table-page-search-submitButtons {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-page-search-submitButtons {
    justify-content: center;
    margin-top: 16px;
  }
}
</style> 