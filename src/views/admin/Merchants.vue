<template>
  <div class="merchants-container">
    <a-card class="merchants-card" title="商家管理" :bordered="false">
      <!-- 搜索和筛选区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="商家搜索">
                <a-input v-model:value="queryParam.keyword" placeholder="商家名称/账号" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="账号状态">
                <a-select v-model:value="queryParam.status" placeholder="请选择" default-value="" style="width: 100%">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="active">正常</a-select-option>
                  <a-select-option value="disabled">已禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="业务员">
                <a-select v-model:value="queryParam.salesId" placeholder="请选择" default-value="" style="width: 100%">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option v-for="sales in salesList" :key="sales.id" :value="sales.id">
                    {{ sales.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="注册时间">
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
        :data-source="merchantList"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 账号状态列 -->
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'red'">
              {{ record.status === 'active' ? '正常' : '已禁用' }}
            </a-tag>
          </template>
          
          <!-- 授权店铺数量列 -->
          <template v-if="column.key === 'storeCount'">
            <a @click="showStores(record.id)">{{ record.storeCount }}</a>
          </template>
          
          <!-- 下级用户数量列 -->
          <template v-if="column.key === 'referralCount'">
            <a @click="showReferrals(record.id)">{{ record.referralCount }}</a>
          </template>
          
          <!-- 账户余额列 -->
          <template v-if="column.key === 'balance'">
            <div v-for="bal in record.balances" :key="bal.currency" style="line-height: 1.5;">
              {{ bal.currency }}: {{ bal.amount.toFixed(2) }}
            </div>
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a @click="viewMerchant(record)">查看详情</a>
              <a-divider type="vertical" />
              <a @click="viewCommission(record)">佣金明细</a>
              <a-divider type="vertical" />
              <a @click="viewBalance(record)">余额明细</a>
              <a-divider type="vertical" />
              <a v-if="record.status === 'active'" @click="toggleStatus(record, 'disabled')">禁用</a>
              <a v-else @click="toggleStatus(record, 'active')" class="ant-btn-link-success">启用</a>
              <a-divider type="vertical" />
              <a @click="showAssignModal(record)">指定业务员</a>
              <a-divider type="vertical" />
              <a @click="resetPassword(record)">重置密码</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 指定业务员弹窗 -->
    <a-modal
      v-model:visible="assignModalVisible"
      title="指定业务员"
      @ok="handleAssign"
      @cancel="assignModalVisible = false"
    >
      <a-form :model="assignForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="商家名称">
          <span>{{ assignForm.merchantName }}</span>
        </a-form-item>
        <a-form-item label="当前业务员">
          <span>{{ assignForm.currentSales }}</span>
        </a-form-item>
        <a-form-item label="选择业务员">
          <a-select v-model:value="assignForm.salesId" placeholder="请选择业务员">
            <a-select-option v-for="sales in salesList" :key="sales.id" :value="sales.id">
              {{ sales.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal
      v-model:visible="resetPasswordModalVisible"
      title="重置密码"
      @ok="confirmResetPassword"
      @cancel="resetPasswordModalVisible = false"
    >
      <p>确定要为商家 <strong>{{ resetPasswordForm.merchantName }}</strong> 重置密码吗？</p>
      <p>重置后，将生成一个随机密码并发送到商家的注册邮箱。</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { DownloadOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const loading = ref(false);
const assignModalVisible = ref(false);
const resetPasswordModalVisible = ref(false);

// 搜索参数
const queryParam = reactive({
  keyword: '',
  status: '',
  salesId: '',
  dateRange: [],
  pageSize: 10,
  current: 1
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
    title: '商家名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '账号(邮箱)',
    dataIndex: 'email',
    key: 'email',
    ellipsis: true,
  },
  {
    title: '账号状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '授权店铺数',
    dataIndex: 'storeCount',
    key: 'storeCount',
    width: 100,
  },
  {
    title: '佣金总额($)',
    dataIndex: 'totalCommission',
    key: 'totalCommission',
    width: 120,
  },
  {
    title: '待结算佣金($)',
    dataIndex: 'pendingCommission',
    key: 'pendingCommission',
    width: 130,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 170,
  },
  {
    title: '下级用户数',
    dataIndex: 'referralCount',
    key: 'referralCount',
    width: 110,
  },
  {
    title: '账户余额',
    dataIndex: 'balance',
    key: 'balance',
    width: 120,
  },
  {
    title: '业务员',
    dataIndex: 'salesName',
    key: 'salesName',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 320,
  }
];

// 业务员列表
const salesList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
]);

// 商家列表数据
const merchantList = ref([]);

// 指定业务员表单
const assignForm = reactive({
  merchantId: '',
  merchantName: '',
  currentSales: '',
  salesId: null
});

// 重置密码表单
const resetPasswordForm = reactive({
  merchantId: '',
  merchantName: ''
});

// 加载商家列表数据
const loadMerchantList = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    merchantList.value = [
      {
        id: 1,
        name: '环球电子科技',
        email: 'global.tech@example.com',
        status: 'active',
        storeCount: 3,
        totalCommission: 5260.50,
        pendingCommission: 750.25,
        createdAt: '2023-05-12 14:30:21',
        referralCount: 8,
        balances: [
          { currency: 'USD', amount: 3250.75 },
          { currency: 'EUR', amount: 1580.32 }
        ],
        salesId: 1,
        salesName: '张三'
      },
      {
        id: 2,
        name: '极速数码',
        email: 'fast.digital@example.com',
        status: 'active',
        storeCount: 2,
        totalCommission: 3120.75,
        pendingCommission: 420.30,
        createdAt: '2023-06-18 09:15:42',
        referralCount: 5,
        balances: [
          { currency: 'USD', amount: 2150.50 },
          { currency: 'GBP', amount: 980.45 }
        ],
        salesId: 2,
        salesName: '李四'
      },
      {
        id: 3,
        name: '未来家居',
        email: 'future.home@example.com',
        status: 'disabled',
        storeCount: 1,
        totalCommission: 1850.25,
        pendingCommission: 310.15,
        createdAt: '2023-07-22 16:45:33',
        referralCount: 3,
        balances: [
          { currency: 'USD', amount: 1250.30 }
        ],
        salesId: 3,
        salesName: '王五'
      },
      {
        id: 4,
        name: '优品服饰',
        email: 'best.fashion@example.com',
        status: 'active',
        storeCount: 4,
        totalCommission: 7520.40,
        pendingCommission: 980.60,
        createdAt: '2023-04-05 11:20:18',
        referralCount: 12,
        balances: [
          { currency: 'USD', amount: 4580.25 },
          { currency: 'EUR', amount: 2150.70 },
          { currency: 'CAD', amount: 1580.35 }
        ],
        salesId: 1,
        salesName: '张三'
      },
      {
        id: 5,
        name: '城市花园',
        email: 'city.garden@example.com',
        status: 'active',
        storeCount: 2,
        totalCommission: 2840.30,
        pendingCommission: 520.45,
        createdAt: '2023-08-10 08:55:27',
        referralCount: 6,
        balances: [
          { currency: 'USD', amount: 1980.50 },
          { currency: 'GBP', amount: 750.25 }
        ],
        salesId: 4,
        salesName: '赵六'
      }
    ];
    
    pagination.total = 5; // 模拟总数
  } catch (error) {
    console.error('Failed to load merchant list:', error);
    message.error('加载商家列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadMerchantList();
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadMerchantList();
};

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    keyword: '',
    status: '',
    salesId: '',
    dateRange: [],
    current: 1
  });
  pagination.current = 1;
  loadMerchantList();
};

// 查看商家详情
const viewMerchant = (record) => {
  router.push({ name: 'MerchantDetail', params: { id: record.id } });
};

// 查看佣金明细
const viewCommission = (record) => {
  router.push({ name: 'MerchantCommission', params: { id: record.id } });
};

// 查看余额明细
const viewBalance = (record) => {
  router.push({ name: 'MerchantBalance', params: { id: record.id } });
};

// 查看店铺列表
const showStores = (merchantId) => {
  // 跳转到店铺列表页面，带上商家ID参数
  router.push({ path: '/admin/stores', query: { merchantId } });
};

// 查看下级用户
const showReferrals = (merchantId) => {
  router.push({ name: 'MerchantReferrals', params: { id: merchantId } });
};

// 切换商家状态（启用/禁用）
const toggleStatus = async (record, status) => {
  try {
    loading.value = true;
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 更新本地状态
    const index = merchantList.value.findIndex(item => item.id === record.id);
    if (index !== -1) {
      merchantList.value[index].status = status;
    }
    
    message.success(`${status === 'active' ? '启用' : '禁用'}商家成功`);
  } catch (error) {
    console.error('Failed to toggle merchant status:', error);
    message.error(`${status === 'active' ? '启用' : '禁用'}商家失败`);
  } finally {
    loading.value = false;
  }
};

// 显示指定业务员弹窗
const showAssignModal = (record) => {
  Object.assign(assignForm, {
    merchantId: record.id,
    merchantName: record.name,
    currentSales: record.salesName,
    salesId: record.salesId
  });
  assignModalVisible.value = true;
};

// 处理指定业务员
const handleAssign = async () => {
  try {
    if (!assignForm.salesId) {
      message.warning('请选择业务员');
      return;
    }
    
    loading.value = true;
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 更新本地状态
    const index = merchantList.value.findIndex(item => item.id === assignForm.merchantId);
    if (index !== -1) {
      const selectedSales = salesList.value.find(s => s.id === assignForm.salesId);
      if (selectedSales) {
        merchantList.value[index].salesId = selectedSales.id;
        merchantList.value[index].salesName = selectedSales.name;
      }
    }
    
    message.success('指定业务员成功');
    assignModalVisible.value = false;
  } catch (error) {
    console.error('Failed to assign sales:', error);
    message.error('指定业务员失败');
  } finally {
    loading.value = false;
  }
};

// 显示重置密码弹窗
const resetPassword = (record) => {
  Object.assign(resetPasswordForm, {
    merchantId: record.id,
    merchantName: record.name
  });
  resetPasswordModalVisible.value = true;
};

// 确认重置密码
const confirmResetPassword = async () => {
  try {
    loading.value = true;
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    message.success(`已重置密码并发送到商家邮箱`);
    resetPasswordModalVisible.value = false;
  } catch (error) {
    console.error('Failed to reset password:', error);
    message.error('重置密码失败');
  } finally {
    loading.value = false;
  }
};

// 导出数据
const exportData = () => {
  message.success('商家数据导出成功');
};

// 页面加载时获取商家列表
onMounted(() => {
  loadMerchantList();
});
</script>

<style lang="less" scoped>
.merchants-container {
  padding: 24px;
  background: #f0f2f5;
  
  .merchants-card {
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
}

.ant-btn-link-success {
  color: #52c41a;
}
</style> 