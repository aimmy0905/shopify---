<template>
  <div class="recharge-list">
    <!-- 搜索和筛选区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="queryParam.dateRange" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="充值金额">
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
          <a-col :md="8" :sm="24">
            <a-form-item label="充值状态">
              <a-select v-model:value="queryParam.status" placeholder="请选择" style="width: 100%">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="pending">待确认</a-select-option>
                <a-select-option value="confirmed">已确认</a-select-option>
                <a-select-option value="rejected">已拒绝</a-select-option>
              </a-select>
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
    
    <!-- 充值记录表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      :row-key="record => record.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 金额列 -->
        <template v-if="column.key === 'amount'">
          <span :style="{ color: '#52c41a' }">
            +{{ record.amount.toFixed(2) }} {{ record.currency }}
          </span>
        </template>
        
        <!-- 美元金额列 -->
        <template v-if="column.key === 'usdAmount'">
          <span :style="{ color: '#52c41a' }">
            +{{ record.usdAmount.toFixed(2) }} USD
          </span>
        </template>
        
        <!-- 充值方式列 -->
        <template v-if="column.key === 'method'">
          <span>{{ record.method }}</span>
        </template>
        
        <!-- 状态列 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ record.statusText || getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a v-if="record.status === 'pending'" @click="handleAudit(record)">审核</a>
          <a v-else @click="handleViewProof(record)">查看凭证</a>
        </template>
      </template>
    </a-table>
    
    <!-- 查看凭证弹窗 -->
    <a-modal
      v-model:visible="proofModalVisible"
      :title="'充值凭证 - ' + (currentRecord ? formatDateTime(currentRecord.createdAt) : '')"
      :footer="null"
      @cancel="proofModalVisible = false"
    >
      <div class="proof-container">
        <img :src="currentRecord?.proofUrl" alt="充值凭证" class="proof-image" />
      </div>
      <div class="proof-info">
        <p><strong>充值金额：</strong>{{ currentRecord?.amount.toFixed(2) }} {{ currentRecord?.currency }}</p>
        <p><strong>充值方式：</strong>{{ currentRecord?.method }}</p>
        <p><strong>充值状态：</strong>
          <a-tag :color="currentRecord?.status ? getStatusColor(currentRecord.status) : ''">
            {{ currentRecord?.statusText || (currentRecord?.status ? getStatusText(currentRecord.status) : '') }}
          </a-tag>
        </p>
        <p v-if="currentRecord?.status === 'rejected'"><strong>拒绝原因：</strong>{{ currentRecord?.rejectReason || '无' }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  dataSource: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search', 'reset', 'audit']);

// 搜索参数
const queryParam = reactive({
  dateRange: [],
  minAmount: '',
  maxAmount: '',
  status: ''
});

// 表格分页设置
const pagination = reactive({
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total) => `共 ${total} 条`
});

// 表格列配置
const columns = [
  {
    title: '充值时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '充值金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    sorter: (a, b) => a.amount - b.amount
  },
  {
    title: '美元金额',
    dataIndex: 'usdAmount',
    key: 'usdAmount',
    width: 150
  },
  {
    title: '充值方式',
    dataIndex: 'method',
    key: 'method',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    filters: [
      { text: '待确认', value: 'pending' },
      { text: '已确认', value: 'confirmed' },
      { text: '已拒绝', value: 'rejected' }
    ],
    filterMultiple: false
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
];

// 弹窗相关状态
const proofModalVisible = ref(false);
const currentRecord = ref(null);

// 监听数据源变化，更新分页数据
watch(() => props.dataSource, (newVal) => {
  pagination.total = newVal.length;
}, { immediate: true });

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  
  if (filters.status && filters.status.length) {
    queryParam.status = filters.status[0];
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  emit('search', queryParam);
};

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    dateRange: [],
    minAmount: '',
    maxAmount: '',
    status: ''
  });
  pagination.current = 1;
  emit('reset');
};

// 处理审核
const handleAudit = (record) => {
  emit('audit', record);
};

// 查看凭证
const handleViewProof = (record) => {
  currentRecord.value = record;
  proofModalVisible.value = true;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'rejected': '已拒绝'
  };
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'blue',
    'confirmed': 'green',
    'rejected': 'red'
  };
  return colorMap[status] || 'default';
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
  return dateTime || '';
};
</script>

<style lang="less" scoped>
.recharge-list {
  .table-page-search-wrapper {
    margin-bottom: 24px;
    
    .table-page-search-submitButtons {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }
  
  .proof-container {
    text-align: center;
    margin-bottom: 16px;
    
    .proof-image {
      max-width: 100%;
      max-height: 300px;
    }
  }
  
  .proof-info {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    
    p {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style> 