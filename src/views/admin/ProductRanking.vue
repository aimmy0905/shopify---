<template>
  <div class="product-ranking-container">
    <a-card class="ranking-card" title="商品销量排名" :bordered="false">
      <!-- 时间范围切换 -->
      <div class="time-range-switcher">
        <a-radio-group v-model:value="timeRange" button-style="solid" @change="handleTimeRangeChange">
          <a-radio-button value="3">近3天</a-radio-button>
          <a-radio-button value="7">近7天</a-radio-button>
          <a-radio-button value="15">近15天</a-radio-button>
          <a-radio-button value="30">近30天</a-radio-button>
        </a-radio-group>
        <a-button style="margin-left: 16px" @click="exportRanking">
          <template #icon><DownloadOutlined /></template>
          导出排名
        </a-button>
      </div>

      <!-- 销量概览图表 -->
      <div class="chart-section">
        <a-row :gutter="24">
          <a-col :span="16">
            <a-card title="销量趋势图" size="small">
              <div id="salesTrendChart" style="height: 300px;"></div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card title="Top10商品销量对比" size="small">
              <div id="top10Chart" style="height: 300px;"></div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 排名列表 -->
      <div class="ranking-table">
        <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="rankingList"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record, index }">
            <!-- 排名列 -->
            <template v-if="column.key === 'rank'">
              <div class="rank-number">
                <a-badge 
                  :count="(pagination.current - 1) * pagination.pageSize + index + 1"
                  :number-style="getRankStyle(index + 1)"
                  :show-zero="false"
                />
              </div>
            </template>

            <!-- 商品信息列 -->
            <template v-if="column.key === 'product'">
              <div class="product-info">
                <a-image
                  :width="50"
                  :height="50"
                  :src="record.image"
                  :preview="false"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAxN0M0MC41IDE3IDQ1IDIyIDQ1IDI1QzQ1IDMwIDQwLjUgMzMgMjUgMzNDOS41IDMzIDUgMzAgNSAyNUM1IDIyIDkuNSAxNyAyNSAxN1oiIGZpbGw9IiNCRkJGQkYiLz4KPC9zdmc+Cg=="
                  class="product-image"
                />
                <div class="product-details">
                  <div class="product-name">{{ record.name }}</div>
                  <div class="product-code">{{ record.code }}</div>
                </div>
              </div>
            </template>

            <!-- 销量列 -->
            <template v-if="column.key === 'sales'">
              <div class="sales-info">
                <div class="sales-number">{{ record.sales }}</div>
                <div class="sales-bar">
                  <a-progress 
                    :percent="(record.sales / maxSales) * 100" 
                    :show-info="false" 
                    size="small"
                    :stroke-color="getSalesColor(index)"
                  />
                </div>
              </div>
            </template>

            <!-- 销售额列 -->
            <template v-if="column.key === 'revenue'">
              <span class="revenue-amount">${{ record.revenue.toLocaleString() }}</span>
            </template>

            <!-- 环比增长列 -->
            <template v-if="column.key === 'growth'">
              <div class="growth-info">
                <a-tag :color="record.growth >= 0 ? 'green' : 'red'">
                  <template #icon>
                    <ArrowUpOutlined v-if="record.growth >= 0" />
                    <ArrowDownOutlined v-else />
                  </template>
                  {{ Math.abs(record.growth) }}%
                </a-tag>
              </div>
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space size="small">
                <a @click="viewProductDetail(record)">查看详情</a>
                <a @click="viewSalesTrend(record)">销量趋势</a>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 销量趋势弹窗 -->
    <a-modal
      v-model:visible="trendModalVisible"
      :title="`${selectedProduct?.name} - 销量趋势`"
      width="800px"
      :footer="null"
    >
      <div id="productTrendChart" style="height: 400px;"></div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()
const loading = ref(false)
const timeRange = ref('7')
const trendModalVisible = ref(false)
const selectedProduct = ref(null)
const maxSales = ref(0)

// 分页设置
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50'],
  total: 0,
  current: 1,
  pageSize: 20,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
})

// 排名列表数据
const rankingList = ref([])

// 表格列配置
const columns = [
  {
    title: '排名',
    key: 'rank',
    width: 80,
    fixed: 'left'
  },
  {
    title: '商品信息',
    key: 'product',
    width: 250,
    fixed: 'left'
  },
  {
    title: '商品编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '商品分类',
    dataIndex: 'categoryName',
    key: 'categoryName',
    width: 120
  },
  {
    title: '销量',
    key: 'sales',
    width: 150,
    sorter: true
  },
  {
    title: '销售额',
    key: 'revenue',
    width: 120,
    sorter: true
  },
  {
    title: '环比增长',
    key: 'growth',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'right'
  }
]

// 初始化模拟数据
const initRankingData = () => {
  const categories = ['电子产品', '服装配饰', '家居用品', '运动户外', '美妆护肤']
  const mockData = []
  
  for (let i = 1; i <= 50; i++) {
    const sales = Math.floor(Math.random() * 1000 + 100)
    const price = Math.floor(Math.random() * 200 + 50)
    const growth = Math.floor(Math.random() * 60 - 20) // -20% 到 +40%
    
    mockData.push({
      id: i,
      name: `热销商品 ${i} - 限时特惠`,
      code: `PRD${String(i).padStart(6, '0')}`,
      image: `https://picsum.photos/200/200?random=${i + 100}`,
      categoryName: categories[Math.floor(Math.random() * categories.length)],
      sales,
      revenue: sales * price,
      growth,
      price,
      stock: Math.floor(Math.random() * 500 + 50)
    })
  }
  
  // 按销量排序
  mockData.sort((a, b) => b.sales - a.sales)
  return mockData
}

// 获取排名样式
const getRankStyle = (rank) => {
  if (rank === 1) return { backgroundColor: '#ff4d4f', color: '#fff' }
  if (rank === 2) return { backgroundColor: '#fa8c16', color: '#fff' }
  if (rank === 3) return { backgroundColor: '#faad14', color: '#fff' }
  return { backgroundColor: '#d9d9d9', color: '#595959' }
}

// 获取销量进度条颜色
const getSalesColor = (index) => {
  const colors = ['#ff4d4f', '#fa8c16', '#faad14', '#52c41a', '#1890ff']
  return colors[index % colors.length]
}

// 加载排名数据
const loadRankingData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const allData = initRankingData()
    pagination.total = allData.length
    
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    rankingList.value = allData.slice(start, end)
    
    // 设置最大销量用于进度条计算
    maxSales.value = Math.max(...allData.map(item => item.sales))
    
    // 延迟渲染图表
    nextTick(() => {
      renderCharts(allData)
    })
    
  } catch (error) {
    message.error('加载排名数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderCharts = (data) => {
  renderSalesTrendChart(data)
  renderTop10Chart(data)
}

// 渲染销量趋势图
const renderSalesTrendChart = (data) => {
  const chartDom = document.getElementById('salesTrendChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 生成时间序列数据
  const days = parseInt(timeRange.value)
  const dates = []
  const salesData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    
    // 模拟每日销量数据
    const dailySales = Math.floor(Math.random() * 5000 + 2000)
    salesData.push(dailySales)
  }
  
  const option = {
    title: {
      text: `近${days}天销量趋势`,
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销量: {c}'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45 }
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

// 渲染Top10柱状图
const renderTop10Chart = (data) => {
  const chartDom = document.getElementById('top10Chart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  const top10Data = data.slice(0, 10)
  const names = top10Data.map(item => item.name.substring(0, 8) + '...')
  const sales = top10Data.map(item => item.sales)
  
  const option = {
    title: {
      text: 'Top10商品销量',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销量: {c}'
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 45, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '销量'
    },
    series: [{
      name: '销量',
      type: 'bar',
      data: sales,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  }
  
  myChart.setOption(option)
}

// 时间范围变化处理
const handleTimeRangeChange = () => {
  loadRankingData()
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadRankingData()
}

// 查看商品详情
const viewProductDetail = (record) => {
  router.push(`/admin/products/${record.id}`)
}

// 查看销量趋势
const viewSalesTrend = (record) => {
  selectedProduct.value = record
  trendModalVisible.value = true
  
  nextTick(() => {
    renderProductTrendChart(record)
  })
}

// 渲染单个商品趋势图
const renderProductTrendChart = (product) => {
  const chartDom = document.getElementById('productTrendChart')
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  
  // 生成商品销量趋势数据
  const days = 30
  const dates = []
  const salesData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    
    // 基于商品当前销量生成趋势数据
    const baseSales = Math.floor(product.sales / days)
    const dailySales = Math.floor(baseSales + Math.random() * baseSales - baseSales / 2)
    salesData.push(Math.max(0, dailySales))
  }
  
  const option = {
    title: {
      text: `${product.name} - 近30天销量趋势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>销量: {c}'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 45 }
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
      itemStyle: { color: '#52c41a' },
      areaStyle: { opacity: 0.3 }
    }]
  }
  
  myChart.setOption(option)
}

// 导出排名数据
const exportRanking = () => {
  message.success('导出功能开发中...')
}

// 组件挂载时加载数据
onMounted(() => {
  loadRankingData()
})
</script>

<style scoped lang="scss">
.product-ranking-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.ranking-card {
  .time-range-switcher {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.chart-section {
  margin-bottom: 24px;
}

.ranking-table {
  .rank-number {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .product-info {
    display: flex;
    align-items: center;
    
    .product-image {
      border-radius: 4px;
      object-fit: cover;
    }
    
    .product-details {
      margin-left: 12px;
      flex: 1;
      
      .product-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .product-code {
        font-size: 12px;
        color: #8c8c8c;
      }
    }
  }
  
  .sales-info {
    .sales-number {
      font-weight: 600;
      color: #262626;
      margin-bottom: 4px;
    }
    
    .sales-bar {
      width: 100px;
    }
  }
  
  .revenue-amount {
    font-weight: 600;
    color: #52c41a;
  }
  
  .growth-info {
    .ant-tag {
      border-radius: 4px;
    }
  }
}

:deep(.ant-badge-count) {
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
</style> 