<template>
  <div class="transaction-list">
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
          <a-col :md="8" :sm="24">
            <a-form-item label="来源/用途">
              <a-input v-model:value="queryParam.source" placeholder="请输入" allow-clear />
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
    
    <!-- 交易记录表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      :row-key="record => record.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 交易类型列 -->
        <template v-if="column.key === 'type'">
          <span>{{ getTransactionTypeText(record.type) }}</span>
        </template>
        
        <!-- 金额列 -->
        <template v-if="column.key === 'amount'">
          <span :style="{ color: record.amount > 0 ? '#52c41a' : '#f5222d' }">
            {{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }} {{ record.currency }}
          </span>
        </template>
        
        <!-- 美元金额列 -->
        <template v-if="column.key === 'usdAmount'">
          <span :style="{ color: record.usdAmount > 0 ? '#52c41a' : '#f5222d' }">
            {{ record.usdAmount > 0 ? '+' : '' }}{{ record.usdAmount.toFixed(2) }} USD
          </span>
        </template>
        
        <!-- 状态列 -->
        <template v-if="column.key === 'status'">
          <a-tag v-if="record.status" :color="getStatusColor(record.status)">
            {{ record.statusText || getStatusText(record.status) }}
          </a-tag>
        </template>
      </template>
    </a-table>
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

const emit = defineEmits(['search', 'reset']);

// 搜索参数
const queryParam = reactive({
  dateRange: [],
  minAmount: '',
  maxAmount: '',
  source: ''
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
    title: '交易时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '交易类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
  {
    title: '金额',
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
    title: '来源/用途',
    dataIndex: 'source',
    key: 'source',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  }
];

// 监听数据源变化，更新分页数据
watch(() => props.dataSource, (newVal) => {
  pagination.total = newVal.length;
}, { immediate: true });

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
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
    source: ''
  });
  pagination.current = 1;
  emit('reset');
};

// 获取交易类型文本
const getTransactionTypeText = (type) => {
  const typeMap = {
    'recharge': '充值',
    'consumption': '消费',
    'commission': '佣金收入',
    'refund': '退款',
    'adjustment': '调整'
  };
  return typeMap[type] || type;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'rejected': '已拒绝',
    'processing': '处理中',
    'completed': '已完成'
  };
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'blue',
    'confirmed': 'green',
    'rejected': 'red',
    'processing': 'orange',
    'completed': 'green'
  };
  return colorMap[status] || 'default';
};
</script>

<style lang="less" scoped>
.transaction-list {
  .table-page-search-wrapper {
    margin-bottom: 24px;
    
    .table-page-search-submitButtons {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }
}
</style> 