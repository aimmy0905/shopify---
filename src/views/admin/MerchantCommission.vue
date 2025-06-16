<template>
  <div class="merchant-commission-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <router-link to="/admin/dashboard">首页</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link to="/admin/merchants">商家管理</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link :to="`/admin/merchants/${merchantId}`">商家详情</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>佣金明细</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    
    <a-spin :spinning="loading">
      <div class="page-header">
        <div class="page-header-content">
          <h1 class="title">佣金明细 - {{ merchantName }}</h1>
        </div>
        <div class="page-header-extra">
          <a-button @click="$router.go(-1)" style="margin-right: 8px;">
            返回
          </a-button>
          <a-button type="default" @click="exportData">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
        </div>
      </div>
      
      <!-- 佣金统计卡片 -->
      <a-card :bordered="false" class="stat-card">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic 
              title="累计佣金" 
              :value="commissionStats.total" 
              :precision="2"
              style="margin-right: 50px"
            >
              <template #prefix><DollarOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="本月佣金" 
              :value="commissionStats.month" 
              :precision="2" 
              style="margin-right: 50px"
              class="primary-stat"
            >
              <template #prefix><RiseOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="已结算佣金" 
              :value="commissionStats.settled" 
              :precision="2"
              style="margin-right: 50px"
              class="success-stat"
            >
              <template #prefix><CheckCircleOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="待结算佣金" 
              :value="commissionStats.pending" 
              :precision="2"
              class="warning-stat"
            >
              <template #prefix><ClockCircleOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 搜索和筛选区域 -->
      <a-card :bordered="false" class="content-card">
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="订单编号">
                  <a-input v-model:value="queryParam.orderNo" placeholder="请输入" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="佣金类型">
                  <a-select v-model:value="queryParam.type" placeholder="请选择" style="width: 100%">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="direct">直接佣金</a-select-option>
                    <a-select-option value="indirect">间接佣金</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="结算状态">
                  <a-select v-model:value="queryParam.status" placeholder="请选择" style="width: 100%">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="settled">已结算</a-select-option>
                    <a-select-option value="pending">待结算</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="时间范围">
                  <a-range-picker v-model:value="queryParam.dateRange" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="金额范围">
                  <a-input-group compact>
                    <a-input
                      v-model:value="queryParam.minAmount"
                      style="width: 45%; text-align: center"
                      placeholder="最小值"
                    />
                    <a-input
                      style="width: 10%; border-left: 0; border-right: 0; pointer-events: none; background-color: #fff"
                      placeholder="~"
                      disabled
                    />
                    <a-input
                      v-model:value="queryParam.maxAmount"
                      style="width: 45%; text-align: center"
                      placeholder="最大值"
                    />
                  </a-input-group>
                </a-form-item>
              </a-col>
              <a-col :md="24" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="handleSearch">查询</a-button>
                  <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        
        <!-- 佣金明细表格 -->
        <a-table
          :columns="columns"
          :data-source="commissionList"
          :pagination="pagination"
          :loading="tableLoading"
          :row-key="record => record.id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <!-- 佣金类型列 -->
            <template v-if="column.key === 'commissionType'">
              <a-tag :color="record.commissionType === 'direct' ? 'blue' : 'purple'">
                {{ record.commissionType === 'direct' ? '直接佣金' : '间接佣金' }}
              </a-tag>
            </template>
            
            <!-- 佣金列 -->
            <template v-if="column.key === 'commission'">
              <span class="success-text">
                {{ record.commission.toFixed(2) }} {{ record.currency }}
              </span>
            </template>
            
            <!-- 结算状态列 -->
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'settled' ? 'green' : 'orange'">
                {{ record.status === 'settled' ? '已结算' : '待结算' }}
              </a-tag>
            </template>
            
            <!-- 结算时间列 -->
            <template v-if="column.key === 'settledAt'">
              <span>{{ record.status === 'settled' ? record.settledAt : '-' }}</span>
            </template>
            
            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-button 
                v-if="record.status === 'pending'"
                type="link"
                size="small"
                @click="handleSettle(record)"
                >
                手动结算
              </a-button>
              <a-button 
                type="link" 
                size="small" 
                @click="viewOrderDetail(record)"
              >
                查看订单
              </a-button>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-spin>
    
    <!-- 结算确认弹窗 -->
    <a-modal
      v-model:visible="settleModalVisible"
      title="结算确认"
      @ok="handleSettleConfirm"
      :confirm-loading="confirmLoading"
      @cancel="settleModalVisible = false"
    >
      <p>确定要手动结算以下佣金吗？</p>
      <div class="settle-info">
        <p><strong>订单编号：</strong>{{ currentRecord?.orderNo }}</p>
        <p><strong>商品：</strong>{{ currentRecord?.productName }}</p>
        <p><strong>佣金金额：</strong>{{ currentRecord?.commission.toFixed(2) }} {{ currentRecord?.currency }}</p>
        <p><strong>佣金类型：</strong>{{ currentRecord?.commissionType === 'direct' ? '直接佣金' : '间接佣金' }}</p>
        <p><strong>生成时间：</strong>{{ currentRecord?.createdAt }}</p>
      </div>
      <a-alert
        message="手动结算后，佣金将直接计入商家余额，操作不可撤销！"
        type="warning"
        show-icon
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { DownloadOutlined, DollarOutlined, RiseOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const merchantId = ref(route.params.id);
const merchantName = ref('');
const loading = ref(true);
const tableLoading = ref(false);
const settleModalVisible = ref(false);
const confirmLoading = ref(false);
const currentRecord = ref(null);

// 佣金统计数据
const commissionStats = reactive({
  total: 2850.80,
  month: 320.45,
  settled: 2350.50,
  pending: 500.30
});

// 搜索参数
const queryParam = reactive({
  orderNo: '',
  type: '',
  status: '',
  dateRange: [],
  minAmount: '',
  maxAmount: ''
});

// 表格分页设置
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
});

// 表格列配置
const columns = [
  {
    title: '订单编号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    ellipsis: true
  },
  {
    title: '商品',
    dataIndex: 'productName',
    key: 'productName',
    ellipsis: true
  },
  {
    title: '订单金额',
    dataIndex: 'orderAmount',
    key: 'orderAmount',
    width: 130,
    sorter: (a, b) => a.orderAmount - b.orderAmount
  },
  {
    title: '佣金',
    dataIndex: 'commission',
    key: 'commission',
    width: 130,
    sorter: (a, b) => a.commission - b.commission
  },
  {
    title: '佣金类型',
    dataIndex: 'commissionType',
    key: 'commissionType',
    width: 100,
    filters: [
      { text: '直接佣金', value: 'direct' },
      { text: '间接佣金', value: 'indirect' }
    ],
    filterMultiple: false
  },
  {
    title: '下单用户',
    dataIndex: 'customer',
    key: 'customer',
    ellipsis: true
  },
  {
    title: '生成时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    filters: [
      { text: '已结算', value: 'settled' },
      { text: '待结算', value: 'pending' }
    ],
    filterMultiple: false
  },
  {
    title: '结算时间',
    dataIndex: 'settledAt',
    key: 'settledAt',
    width: 170
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
];

// 佣金明细列表
const commissionList = ref([]);

// 加载商家基本信息
const loadMerchantInfo = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    merchantName.value = '环球电子科技';
    
  } catch (error) {
    console.error('Failed to load merchant info:', error);
    message.error('加载商家信息失败');
  } finally {
    loading.value = false;
  }
};

// 加载佣金明细列表
const loadCommissionList = async () => {
  tableLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    const list = [
      {
        id: 1,
        orderNo: 'SO2023051001',
        productName: 'iPhone 14 Pro Max 256GB',
        orderAmount: 1099.00,
        commission: 54.95,
        commissionType: 'direct',
        customer: 'Jack Wilson',
        currency: 'USD',
        createdAt: '2023-05-10 14:32:25',
        status: 'settled',
        settledAt: '2023-05-17 10:15:38'
      },
      {
        id: 2,
        orderNo: 'SO2023051502',
        productName: 'MacBook Air M2 8GB/256GB',
        orderAmount: 999.00,
        commission: 49.95,
        commissionType: 'direct',
        customer: 'Emma Thompson',
        currency: 'USD',
        createdAt: '2023-05-15 09:18:32',
        status: 'settled',
        settledAt: '2023-05-22 11:05:42'
      },
      {
        id: 3,
        orderNo: 'SO2023052003',
        productName: 'AirPods Pro 2',
        orderAmount: 249.00,
        commission: 12.45,
        commissionType: 'direct',
        customer: 'Michael Brown',
        currency: 'USD',
        createdAt: '2023-05-20 16:45:12',
        status: 'settled',
        settledAt: '2023-05-27 09:30:15'
      },
      {
        id: 4,
        orderNo: 'SO2023052504',
        productName: 'Apple Watch Series 8 GPS',
        orderAmount: 399.00,
        commission: 19.95,
        commissionType: 'direct',
        customer: 'Olivia Davis',
        currency: 'USD',
        createdAt: '2023-05-25 11:28:40',
        status: 'settled',
        settledAt: '2023-06-01 14:22:36'
      },
      {
        id: 5,
        orderNo: 'SO2023053005',
        productName: 'iPad Air 10.9 64GB',
        orderAmount: 599.00,
        commission: 29.95,
        commissionType: 'direct',
        customer: 'William Johnson',
        currency: 'USD',
        createdAt: '2023-05-30 15:36:52',
        status: 'settled',
        settledAt: '2023-06-06 10:48:19'
      },
      {
        id: 6,
        orderNo: 'SO2023060506',
        productName: 'iPhone 14 128GB',
        orderAmount: 799.00,
        commission: 39.95,
        commissionType: 'direct',
        customer: 'Sophia Martinez',
        currency: 'USD',
        createdAt: '2023-06-05 13:22:48',
        status: 'pending',
        settledAt: null
      },
      {
        id: 7,
        orderNo: 'SO2023060807',
        productName: 'Samsung Galaxy S23 Ultra',
        orderAmount: 1199.00,
        commission: 59.95,
        commissionType: 'direct',
        customer: 'James Anderson',
        currency: 'USD',
        createdAt: '2023-06-08 10:15:36',
        status: 'pending',
        settledAt: null
      },
      {
        id: 8,
        orderNo: 'SO2023052708',
        productName: 'iPhone 14 Pro Max 256GB',
        orderAmount: 1099.00,
        commission: 5.50,
        commissionType: 'indirect',
        customer: 'Daniel Miller (推荐自: 数字极客)',
        currency: 'USD',
        createdAt: '2023-05-27 17:42:28',
        status: 'settled',
        settledAt: '2023-06-03 09:18:45'
      },
      {
        id: 9,
        orderNo: 'SO2023060209',
        productName: 'MacBook Pro 14" M2 Pro',
        orderAmount: 1999.00,
        commission: 10.00,
        commissionType: 'indirect',
        customer: 'Isabella Taylor (推荐自: 智能家居)',
        currency: 'USD',
        createdAt: '2023-06-02 09:45:32',
        status: 'pending',
        settledAt: null
      },
      {
        id: 10,
        orderNo: 'SO2023061010',
        productName: 'Apple Watch Ultra',
        orderAmount: 799.00,
        commission: 4.00,
        commissionType: 'indirect',
        customer: 'Ethan Thomas (推荐自: 数字极客)',
        currency: 'USD',
        createdAt: '2023-06-10 14:28:55',
        status: 'pending',
        settledAt: null
      }
    ];
    
    commissionList.value = list;
    pagination.total = list.length;
    
  } catch (error) {
    console.error('Failed to load commission list:', error);
    message.error('加载佣金明细失败');
  } finally {
    tableLoading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  
  if (filters.commissionType && filters.commissionType.length) {
    queryParam.type = filters.commissionType[0];
  }
  
  if (filters.status && filters.status.length) {
    queryParam.status = filters.status[0];
  }
  
  loadCommissionList();
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadCommissionList();
};

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    orderNo: '',
    type: '',
    status: '',
    dateRange: [],
    minAmount: '',
    maxAmount: ''
  });
  pagination.current = 1;
  loadCommissionList();
};

// 处理结算
const handleSettle = (record) => {
  currentRecord.value = record;
  settleModalVisible.value = true;
};

// 确认结算
const handleSettleConfirm = async () => {
  confirmLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新本地数据
    const index = commissionList.value.findIndex(item => item.id === currentRecord.value.id);
    if (index !== -1) {
      commissionList.value[index].status = 'settled';
      commissionList.value[index].settledAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      // 更新统计数据
      commissionStats.settled += currentRecord.value.commission;
      commissionStats.pending -= currentRecord.value.commission;
    }
    
    message.success('佣金结算成功');
    settleModalVisible.value = false;
    
  } catch (error) {
    console.error('Failed to settle commission:', error);
    message.error('佣金结算失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 查看订单详情
const viewOrderDetail = (record) => {
  message.info(`查看订单: ${record.orderNo}`);
  // 实际项目中可以跳转到订单详情页面
  // router.push({ path: `/admin/orders/${record.orderNo}` });
};

// 导出数据
const exportData = () => {
  message.success('佣金明细数据导出成功');
};

// 页面加载时获取数据
onMounted(() => {
  Promise.all([
    loadMerchantInfo(),
    loadCommissionList()
  ]);
});
</script>

<style lang="less" scoped>
.merchant-commission-container {
  padding: 24px;
  background: #f0f2f5;
  
  .breadcrumb {
    margin-bottom: 16px;
  }
  
  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-header-content {
      .title {
        margin-bottom: 0;
        font-size: 20px;
      }
    }
  }
  
  .stat-card {
    margin-bottom: 16px;
    
    .primary-stat {
      color: #1890ff;
    }
    
    .success-stat {
      color: #52c41a;
    }
    
    .warning-stat {
      color: #faad14;
    }
  }
  
  .content-card {
    margin-bottom: 24px;
  }
  
  .table-page-search-wrapper {
    margin-bottom: 24px;
    
    .table-page-search-submitButtons {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }
  
  .success-text {
    color: #52c41a;
  }
  
  .settle-info {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    margin: 16px 0;
    
    p {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style> 