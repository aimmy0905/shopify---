<template>
  <div class="logistics-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">物流信息查询</h1>
      <p class="page-subtitle">查询和追踪您的订单物流配送状态</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-form">
        <div class="search-inputs">
          <el-input
            v-model="searchForm.orderNumber"
            placeholder="请输入订单号"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>订单号</template>
          </el-input>
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="请输入物流单号"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prepend>物流单号</template>
          </el-input>
        </div>
        <div class="search-actions">
          <el-button type="primary" :loading="searchLoading" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="clearSearch">
            <el-icon><RefreshLeft /></el-icon>
            清空
          </el-button>
          <el-button type="success" @click="showAllData">
            <el-icon><List /></el-icon>
            显示全部
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 最近查询记录卡片 -->
    <el-card v-if="recentQueries.length > 0" class="recent-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近查询记录</span>
          <el-button type="text" size="small" @click="clearRecentQueries">
            清空记录
          </el-button>
        </div>
      </template>
      <div class="recent-queries">
        <el-tag
          v-for="query in recentQueries"
          :key="query.id"
          class="recent-tag"
          type="info"
          effect="plain"
          @click="quickSearch(query)"
        >
          <el-icon><Box /></el-icon>
          {{ query.displayText }}
        </el-tag>
      </div>
    </el-card>

    <!-- 物流信息列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>物流信息</span>
          <div class="header-actions">
            <el-button size="small" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <el-empty
        v-if="!hasSearched && logisticsData.length === 0"
        description="输入订单号或物流单号开始查询"
        :image-size="120"
      />

      <!-- 数据表格 -->
      <el-table
        v-else
        v-loading="tableLoading"
        :data="logisticsData"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="trackingNumber" label="物流单号" width="150">
          <template #default="{ row }">
            <el-button type="text" @click="showTrackingDetails(row)">
              {{ row.trackingNumber }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column prop="orderNumber" label="订单号" width="150">
          <template #default="{ row }">
            <el-button type="text" @click="goToOrder(row.orderNumber)">
              {{ row.orderNumber }}
            </el-button>
          </template>
        </el-table-column>
        
        <el-table-column prop="courier" label="物流公司" width="120" />
        
        <el-table-column prop="shipTime" label="发货时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.shipTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="estimatedTime" label="预计到达时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.estimatedTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="当前状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="showTrackingDetails(row)">
                查看轨迹
              </el-button>
              <el-button size="small" @click="copyTrackingNumber(row.trackingNumber)">
                复制单号
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div v-if="logisticsData.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 物流轨迹详情弹窗 -->
    <el-dialog
      v-model="trackingDialog.visible"
      title="物流轨迹"
      width="800px"
      :before-close="closeTrackingDialog"
    >
      <div v-loading="trackingDialog.loading" class="tracking-content">
        <!-- 基本信息区域 -->
        <el-card class="tracking-info-card" shadow="never">
          <div class="tracking-basic-info">
            <div class="info-row">
              <div class="info-item">
                <label>物流单号：</label>
                <span class="info-value">{{ trackingDialog.data.trackingNumber }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyTrackingNumber(trackingDialog.data.trackingNumber)"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <div class="info-item">
                <label>物流公司：</label>
                <span class="info-value">{{ trackingDialog.data.courier }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <label>发货时间：</label>
                <span class="info-value">{{ formatDateTime(trackingDialog.data.shipTime) }}</span>
              </div>
              <div class="info-item">
                <label>预计送达：</label>
                <span class="info-value">{{ formatDateTime(trackingDialog.data.estimatedTime) }}</span>
              </div>
            </div>
            
            <div class="refresh-btn">
              <el-button 
                type="primary" 
                size="small" 
                :loading="trackingDialog.refreshing"
                @click="refreshTrackingInfo"
              >
                <el-icon><Refresh /></el-icon>
                刷新轨迹
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 物流轨迹时间线 -->
        <el-card class="tracking-timeline-card" shadow="never">
          <template #header>
            <span>物流轨迹</span>
          </template>
          
          <el-timeline class="tracking-timeline">
            <el-timeline-item
              v-for="(item, index) in trackingDialog.data.timeline"
              :key="index"
              :timestamp="formatDateTime(item.time)"
              :type="index === 0 ? 'primary' : 'info'"
              :hollow="index !== 0"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-status">{{ item.status }}</div>
                <div class="timeline-location" v-if="item.location">
                  <el-icon><Location /></el-icon>
                  {{ item.location }}
                </div>
                <div class="timeline-detail" v-if="item.detail">{{ item.detail }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 物流地图区域 (占位，实际需要集成地图API) -->
        <el-card v-if="showMap" class="tracking-map-card" shadow="never">
          <template #header>
            <span>配送路径</span>
          </template>
          <div class="map-placeholder">
            <el-icon class="map-icon"><MapLocation /></el-icon>
            <p>物流地图功能即将上线</p>
          </div>
        </el-card>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeTrackingDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Box, 
  CopyDocument, 
  Location, 
  MapLocation,
  RefreshLeft,
  List
} from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  orderNumber: '',
  trackingNumber: ''
})

// 加载状态
const searchLoading = ref(false)
const tableLoading = ref(false)
const hasSearched = ref(false)

// 最近查询记录
const recentQueries = ref([])

// 物流数据
const logisticsData = ref([])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 物流轨迹弹窗
const trackingDialog = reactive({
  visible: false,
  loading: false,
  refreshing: false,
  data: {
    trackingNumber: '',
    courier: '',
    shipTime: '',
    estimatedTime: '',
    timeline: []
  }
})

// 是否显示地图
const showMap = ref(false)

// 状态类型映射
const statusTypeMap = {
  'shipped': 'warning',
  'in_transit': 'primary', 
  'delivered': 'success',
  'exception': 'danger'
}

// 状态文本映射
const statusTextMap = {
  'shipped': '已发货',
  'in_transit': '运输中',
  'delivered': '已送达',
  'exception': '异常'
}

// 搜索处理
const handleSearch = async () => {
  if (!searchForm.orderNumber && !searchForm.trackingNumber) {
    ElMessage.warning('请输入订单号或物流单号')
    return
  }

  searchLoading.value = true
  tableLoading.value = true
  hasSearched.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 根据搜索条件筛选数据
    let filteredData = mockLogisticsData.filter(item => {
      if (searchForm.orderNumber && searchForm.trackingNumber) {
        return item.orderNumber.includes(searchForm.orderNumber) || 
               item.trackingNumber.includes(searchForm.trackingNumber)
      } else if (searchForm.orderNumber) {
        return item.orderNumber.includes(searchForm.orderNumber)
      } else if (searchForm.trackingNumber) {
        return item.trackingNumber.includes(searchForm.trackingNumber)
      }
      return false
    })

    // 如果没有找到匹配的数据，显示提示
    if (filteredData.length === 0) {
      ElMessage.info('未找到相关物流信息')
      logisticsData.value = []
    } else {
      logisticsData.value = filteredData
      ElMessage.success(`找到 ${filteredData.length} 条物流信息`)
    }
    
    pagination.total = logisticsData.value.length

    // 添加到最近查询记录
    addToRecentQueries()

  } catch (error) {
    ElMessage.error('查询失败，请重试')
  } finally {
    searchLoading.value = false
    tableLoading.value = false
  }
}

// 模拟物流数据
const mockLogisticsData = [
  {
    id: 1,
    trackingNumber: 'YT2023060100001',
    orderNumber: 'ORD2023060100001',
    courier: '圆通速递',
    shipTime: '2023-12-01 10:00:00',
    estimatedTime: '2023-12-05 18:00:00',
    status: 'delivered'
  },
  {
    id: 2,
    trackingNumber: 'SF2023060100002',
    orderNumber: 'ORD2023060100002',
    courier: '顺丰速运',
    shipTime: '2023-12-02 14:30:00',
    estimatedTime: '2023-12-03 12:00:00',
    status: 'delivered'
  },
  {
    id: 3,
    trackingNumber: 'ZTO2023060100003',
    orderNumber: 'ORD2023060100003',
    courier: '中通快递',
    shipTime: '2023-12-05 09:15:00',
    estimatedTime: '2023-12-08 16:00:00',
    status: 'in_transit'
  },
  {
    id: 4,
    trackingNumber: 'EMS2023060100004',
    orderNumber: 'ORD2023060100004',
    courier: 'EMS快递',
    shipTime: '2023-12-06 16:45:00',
    estimatedTime: '2023-12-10 12:00:00',
    status: 'in_transit'
  },
  {
    id: 5,
    trackingNumber: 'JD2023060100005',
    orderNumber: 'ORD2023060100005',
    courier: '京东物流',
    shipTime: '2023-12-07 11:20:00',
    estimatedTime: '2023-12-09 18:00:00',
    status: 'shipped'
  },
  {
    id: 6,
    trackingNumber: 'YD2023060100006',
    orderNumber: 'ORD2023060100006',
    courier: '韵达快递',
    shipTime: '2023-12-08 13:30:00',
    estimatedTime: '2023-12-12 15:00:00',
    status: 'shipped'
  },
  {
    id: 7,
    trackingNumber: 'STO2023060100007',
    orderNumber: 'ORD2023060100007',
    courier: '申通快递',
    shipTime: '2023-12-04 15:10:00',
    estimatedTime: '2023-12-07 17:30:00',
    status: 'delivered'
  },
  {
    id: 8,
    trackingNumber: 'HTKY2023060100008',
    orderNumber: 'ORD2023060100008',
    courier: '百世快递',
    shipTime: '2023-12-09 08:45:00',
    estimatedTime: '2023-12-13 14:00:00',
    status: 'exception'
  },
  {
    id: 9,
    trackingNumber: 'DBL2023060100009',
    orderNumber: 'ORD2023060100009',
    courier: '德邦物流',
    shipTime: '2023-12-03 12:00:00',
    estimatedTime: '2023-12-06 10:30:00',
    status: 'delivered'
  },
  {
    id: 10,
    trackingNumber: 'ZJS2023060100010',
    orderNumber: 'ORD2023060100010',
    courier: '宅急送',
    shipTime: '2023-12-10 14:20:00',
    estimatedTime: '2023-12-14 16:45:00',
    status: 'in_transit'
  }
]

// 添加到最近查询记录
const addToRecentQueries = () => {
  const query = {
    id: Date.now(),
    orderNumber: searchForm.orderNumber,
    trackingNumber: searchForm.trackingNumber,
    displayText: searchForm.orderNumber || searchForm.trackingNumber,
    searchTime: new Date()
  }

  // 避免重复
  const exists = recentQueries.value.find(q => 
    q.orderNumber === query.orderNumber && q.trackingNumber === query.trackingNumber
  )
  
  if (!exists) {
    recentQueries.value.unshift(query)
    // 只保留最近5条
    if (recentQueries.value.length > 5) {
      recentQueries.value = recentQueries.value.slice(0, 5)
    }
    // 保存到本地存储
    localStorage.setItem('logistics_recent_queries', JSON.stringify(recentQueries.value))
  }
}

// 快速搜索
const quickSearch = (query) => {
  searchForm.orderNumber = query.orderNumber || ''
  searchForm.trackingNumber = query.trackingNumber || ''
  handleSearch()
}

// 清空最近查询记录
const clearRecentQueries = async () => {
  try {
    await ElMessageBox.confirm('确定要清空最近查询记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    recentQueries.value = []
    localStorage.removeItem('logistics_recent_queries')
    ElMessage.success('已清空查询记录')
  } catch {
    // 用户取消
  }
}

// 刷新数据
const refreshData = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

// 显示物流轨迹详情
const showTrackingDetails = async (row) => {
  trackingDialog.visible = true
  trackingDialog.loading = true
  
  try {
    // 模拟API调用获取详细轨迹
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 根据不同的物流公司和状态生成不同的轨迹数据
    const timelineData = generateTimelineData(row)
    
    trackingDialog.data = {
      ...row,
      timeline: timelineData
    }
    
    // 检查是否显示地图（仅当有位置信息时）
    showMap.value = trackingDialog.data.timeline.some(item => item.location)
    
  } catch (error) {
    ElMessage.error('获取轨迹信息失败')
  } finally {
    trackingDialog.loading = false
  }
}

// 生成轨迹数据
const generateTimelineData = (order) => {
  const baseTime = new Date(order.shipTime).getTime()
  const timelines = {
    'delivered': [
      {
        time: new Date(baseTime + 3 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '快件已送达',
        location: '北京市朝阳区望京街道',
        detail: '已由收件人本人签收，感谢使用' + order.courier
      },
      {
        time: new Date(baseTime + 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toLocaleString(),
        status: '正在派送',
        location: '北京市朝阳区',
        detail: '快件正在派送中，派送员：李师傅 13800138000'
      },
      {
        time: new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '到达目的地',
        location: '北京朝阳分拣中心',
        detail: '快件已到达北京朝阳分拣中心，准备派送'
      },
      {
        time: new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '运输中',
        location: '天津分拣中心',
        detail: '快件已从天津分拣中心发出，正在运输中'
      },
      {
        time: new Date(baseTime).toLocaleString(),
        status: '已发货',
        location: '上海发货仓库',
        detail: '快件已从上海发货仓库发出'
      }
    ],
    'in_transit': [
      {
        time: new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '运输中',
        location: '济南分拣中心',
        detail: '快件正在运输中，预计明日到达目的地'
      },
      {
        time: new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '运输中',
        location: '南京分拣中心',
        detail: '快件已从南京分拣中心发出'
      },
      {
        time: new Date(baseTime).toLocaleString(),
        status: '已发货',
        location: '上海发货仓库',
        detail: '快件已从上海发货仓库发出'
      }
    ],
    'shipped': [
      {
        time: new Date(baseTime + 4 * 60 * 60 * 1000).toLocaleString(),
        status: '已揽收',
        location: '上海市浦东新区',
        detail: '快件已被' + order.courier + '揽收'
      },
      {
        time: new Date(baseTime).toLocaleString(),
        status: '已发货',
        location: '上海发货仓库',
        detail: '快件已从上海发货仓库发出'
      }
    ],
    'exception': [
      {
        time: new Date(baseTime + 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '派送异常',
        location: '北京市朝阳区',
        detail: '收件人地址不详，正在联系收件人确认地址'
      },
      {
        time: new Date(baseTime + 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        status: '到达目的地',
        location: '北京朝阳分拣中心',
        detail: '快件已到达北京朝阳分拣中心'
      },
      {
        time: new Date(baseTime).toLocaleString(),
        status: '已发货',
        location: '上海发货仓库',
        detail: '快件已从上海发货仓库发出'
      }
    ]
  }
  
  return timelines[order.status] || timelines['shipped']
}

// 刷新轨迹信息
const refreshTrackingInfo = async () => {
  trackingDialog.refreshing = true
  
  try {
    // 模拟刷新轨迹
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('轨迹信息已刷新')
  } catch (error) {
    ElMessage.error('刷新失败，请重试')
  } finally {
    trackingDialog.refreshing = false
  }
}

// 关闭轨迹弹窗
const closeTrackingDialog = () => {
  trackingDialog.visible = false
  trackingDialog.data = {
    trackingNumber: '',
    courier: '',
    shipTime: '',
    estimatedTime: '',
    timeline: []
  }
  showMap.value = false
}

// 复制物流单号
const copyTrackingNumber = async (trackingNumber) => {
  try {
    await navigator.clipboard.writeText(trackingNumber)
    ElMessage.success('物流单号已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = trackingNumber
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('物流单号已复制到剪贴板')
  }
}

// 跳转到订单详情
const goToOrder = (orderNumber) => {
  // 这里应该跳转到订单详情页面
  ElMessage.info(`跳转到订单：${orderNumber}`)
}

// 处理行点击
const handleRowClick = (row) => {
  // 点击行时显示轨迹详情
  showTrackingDetails(row)
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  handleSearch()
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status) => {
  return statusTypeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  return statusTextMap[status] || status
}

// 清空搜索
const clearSearch = () => {
  searchForm.orderNumber = ''
  searchForm.trackingNumber = ''
  loadInitialData()
}

// 显示全部数据
const showAllData = async () => {
  tableLoading.value = true
  hasSearched.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    logisticsData.value = mockLogisticsData
    pagination.total = logisticsData.value.length
    ElMessage.success(`显示全部 ${mockLogisticsData.length} 条物流信息`)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 初始化
onMounted(() => {
  // 从本地存储加载最近查询记录
  const saved = localStorage.getItem('logistics_recent_queries')
  if (saved) {
    try {
      recentQueries.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load recent queries:', error)
    }
  }

  // 初始加载一些数据
  loadInitialData()
})

// 加载初始数据
const loadInitialData = async () => {
  tableLoading.value = true
  hasSearched.value = true
  
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 显示最近的物流数据
    logisticsData.value = mockLogisticsData.slice(0, 5) // 显示前5条
    pagination.total = logisticsData.value.length
    
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.logistics-container {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .page-subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .search-inputs {
        display: flex;
        gap: 16px;
        flex: 1;
        
        .search-input {
          flex: 1;
          max-width: 300px;
        }
      }
      
      .search-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .recent-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .recent-queries {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .recent-tag {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        
        &:hover {
          background-color: #ecf5ff;
          border-color: #b3d8ff;
          color: #409eff;
        }
      }
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 弹窗样式
.tracking-content {
  .tracking-info-card {
    margin-bottom: 20px;
    
    .tracking-basic-info {
      .info-row {
        display: flex;
        margin-bottom: 16px;
        gap: 40px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          
          label {
            font-weight: 500;
            color: #606266;
            margin-right: 8px;
            min-width: 80px;
          }
          
          .info-value {
            color: #303133;
            margin-right: 8px;
          }
        }
      }
      
      .refresh-btn {
        margin-top: 16px;
        text-align: right;
      }
    }
  }
  
  .tracking-timeline-card {
    margin-bottom: 20px;
    
    .tracking-timeline {
      .timeline-content {
        .timeline-status {
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .timeline-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #909399;
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .timeline-detail {
          color: #606266;
          font-size: 12px;
          line-height: 1.4;
        }
      }
    }
  }
  
  .tracking-map-card {
    .map-placeholder {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #909399;
      
      .map-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .logistics-container {
    padding: 16px;
    
    .search-form {
      flex-direction: column;
      align-items: stretch;
      
      .search-inputs {
        flex-direction: column;
        
        .search-input {
          max-width: none;
        }
      }
    }
    
    .recent-queries {
      .recent-tag {
        font-size: 12px;
      }
    }
  }
  
  .tracking-content {
    .tracking-basic-info {
      .info-row {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}
</style> 