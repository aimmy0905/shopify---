<template>
  <div class="merchant-detail-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <router-link to="/admin/dashboard">首页</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link to="/admin/merchants">商家管理</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>商家详情</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <a-spin :spinning="loading">
      <!-- 商家状态标签 -->
      <div class="page-header">
        <div class="page-header-content">
          <h1 class="title">{{ merchantInfo.name }}</h1>
          <div class="status">
            <a-tag :color="merchantInfo.status === 'active' ? 'green' : 'red'" class="status-tag">
              {{ merchantInfo.status === 'active' ? '正常' : '已禁用' }}
            </a-tag>
          </div>
        </div>
        <div class="page-header-extra">
          <a-button @click="$router.go(-1)" style="margin-right: 10px;">
            返回列表
          </a-button>
          <a-button v-if="merchantInfo.status === 'active'" type="danger" @click="toggleStatus('disabled')">
            禁用账号
          </a-button>
          <a-button v-else type="primary" @click="toggleStatus('active')">
            启用账号
          </a-button>
          <a-button type="default" style="margin-left: 10px;" @click="showResetPasswordModal">
            重置密码
          </a-button>
          <a-button type="default" style="margin-left: 10px;" @click="showAssignModal">
            指定业务员
          </a-button>
        </div>
      </div>

      <div class="content-layout">
        <!-- 基本信息卡片 -->
        <a-card title="基本信息" :bordered="false" class="detail-card">
          <a-descriptions :column="2" size="middle">
            <a-descriptions-item label="商家名称">{{ merchantInfo.name }}</a-descriptions-item>
            <a-descriptions-item label="账号(邮箱)">{{ merchantInfo.email }}</a-descriptions-item>
            <a-descriptions-item label="账号状态">
              <a-tag :color="merchantInfo.status === 'active' ? 'green' : 'red'">
                {{ merchantInfo.status === 'active' ? '正常' : '已禁用' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ merchantInfo.createdAt }}</a-descriptions-item>
            <a-descriptions-item label="邀请码">{{ merchantInfo.inviteCode }}</a-descriptions-item>
            <a-descriptions-item label="邀请人">{{ merchantInfo.referrer || '无' }}</a-descriptions-item>
            <a-descriptions-item label="业务员">{{ merchantInfo.salesName }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 财务信息卡片 -->
        <a-card title="财务信息" :bordered="false" class="detail-card">
          <a-descriptions :column="2" size="middle">
            <a-descriptions-item label="账户余额" :span="2">
              <div v-for="(balance, index) in merchantInfo.balances" :key="index" style="line-height: 1.8;">
                {{ balance.currency }}: {{ balance.amount.toFixed(2) }}
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="佣金总额($)">{{ merchantInfo.totalCommission.toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="待结算佣金($)">{{ merchantInfo.pendingCommission.toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="充值总额($)">{{ merchantInfo.totalRecharge.toFixed(2) }}</a-descriptions-item>
            <a-descriptions-item label="消费总额($)">{{ merchantInfo.totalConsumption.toFixed(2) }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 店铺信息卡片 -->
        <a-card title="店铺信息" :bordered="false" class="detail-card" extra="查看全部">
          <a-table
            :columns="storeColumns"
            :data-source="merchantInfo.stores"
            :pagination="false"
            size="small"
            :row-key="record => record.id"
          >
            <template #bodyCell="{ column, record }">
              <!-- 店铺URL列 -->
              <template v-if="column.key === 'storeUrl'">
                <a :href="record.storeUrl" target="_blank">{{ record.storeUrl }}</a>
              </template>
              <!-- 店铺状态列 -->
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'active' ? 'green' : 'orange'">
                  {{ record.status === 'active' ? '正常' : '已过期' }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-card>

        <!-- 标签页导航 -->
        <a-card :bordered="false" class="detail-card tab-card">
          <a-tabs v-model:activeKey="activeTabKey">
            <a-tab-pane key="orders" tab="订单记录">
              <a-table 
                :columns="orderColumns"
                :data-source="orderList"
                :pagination="orderPagination"
                size="small"
                :row-key="record => record.id"
                :loading="tabLoading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getOrderStatusColor(record.status)">
                      {{ getOrderStatusText(record.status) }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'action'">
                    <a @click="viewOrderDetail(record)">查看详情</a>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="commission" tab="佣金明细">
              <a-table
                :columns="commissionColumns"
                :data-source="commissionList"
                :pagination="commissionPagination"
                size="small"
                :row-key="record => record.id"
                :loading="tabLoading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'type'">
                    <span>{{ record.type === 'level1' ? '一级分佣' : '二级分佣' }}</span>
                  </template>
                  <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 'settled' ? 'green' : 'blue'">
                      {{ record.status === 'settled' ? '已结算' : '待结算' }}
                    </a-tag>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="balance" tab="余额明细">
              <a-table
                :columns="balanceColumns"
                :data-source="balanceList"
                :pagination="balancePagination"
                size="small"
                :row-key="record => record.id"
                :loading="tabLoading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'type'">
                    <span>{{ getTransactionTypeText(record.type) }}</span>
                  </template>
                  <template v-if="column.key === 'amount'">
                    <span :style="{ color: record.amount > 0 ? '#52c41a' : '#f5222d' }">
                      {{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }} {{ record.currency }}
                    </span>
                  </template>
                  <template v-if="column.key === 'status'">
                    <a-tag v-if="record.type === 'recharge'" :color="getRechargeStatusColor(record.status)">
                      {{ getRechargeStatusText(record.status) }}
                    </a-tag>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="referrals" tab="下级用户">
              <a-table
                :columns="referralColumns"
                :data-source="referralList"
                :pagination="referralPagination"
                size="small"
                :row-key="record => record.id"
                :loading="tabLoading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'level'">
                    <a-tag :color="record.level === 1 ? 'blue' : 'purple'">
                      {{ record.level === 1 ? '一级' : '二级' }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                      {{ record.status === 'active' ? '正常' : '已禁用' }}
                    </a-tag>
                  </template>
                  <template v-if="column.key === 'action'">
                    <a @click="viewReferralDetail(record)">查看详情</a>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="logs" tab="操作日志">
              <a-table
                :columns="logColumns"
                :data-source="logList"
                :pagination="logPagination"
                size="small"
                :row-key="record => record.id"
                :loading="tabLoading"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'type'">
                    <a-tag :color="getLogTypeColor(record.type)">
                      {{ getLogTypeText(record.type) }}
                    </a-tag>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </div>
    </a-spin>

    <!-- 指定业务员弹窗 -->
    <a-modal
      v-model:visible="assignModalVisible"
      title="指定业务员"
      @ok="handleAssign"
      @cancel="assignModalVisible = false"
    >
      <a-form :model="assignForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="商家名称">
          <span>{{ merchantInfo.name }}</span>
        </a-form-item>
        <a-form-item label="当前业务员">
          <span>{{ merchantInfo.salesName }}</span>
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
      <p>确定要为商家 <strong>{{ merchantInfo.name }}</strong> 重置密码吗？</p>
      <p>重置后，将生成一个随机密码并发送到商家的注册邮箱。</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const tabLoading = ref(false);
const activeTabKey = ref('orders');

// 模态框显示状态
const assignModalVisible = ref(false);
const resetPasswordModalVisible = ref(false);

// 业务员列表
const salesList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
]);

// 商家详细信息
const merchantInfo = reactive({
  id: 0,
  name: '',
  email: '',
  status: 'active',
  inviteCode: '',
  referrer: '',
  createdAt: '',
  storeCount: 0,
  totalCommission: 0,
  pendingCommission: 0,
  totalRecharge: 0,
  totalConsumption: 0,
  salesId: null,
  salesName: '',
  balances: [],
  stores: []
});

// 指定业务员表单
const assignForm = reactive({
  salesId: null
});

// 店铺表格列配置
const storeColumns = [
  {
    title: '店铺名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '店铺URL',
    dataIndex: 'storeUrl',
    key: 'storeUrl',
    ellipsis: true
  },
  {
    title: '授权状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '授权时间',
    dataIndex: 'authTime',
    key: 'authTime',
    width: 180
  }
];

// 订单表格列配置和数据
const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
  { title: '订单金额($)', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '订单状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '订单来源', dataIndex: 'storeName', key: 'storeName', width: 120 },
  { title: '操作', key: 'action', width: 80 }
];

const orderList = ref([]);
const orderPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total) => `共 ${total} 条`
});

// 佣金表格列配置和数据
const commissionColumns = [
  { title: '佣金产生时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '佣金来源', dataIndex: 'source', key: 'source' },
  { title: '佣金类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '佣金金额($)', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '结算时间', dataIndex: 'settledAt', key: 'settledAt', width: 180 }
];

const commissionList = ref([]);
const commissionPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total) => `共 ${total} 条`
});

// 余额明细表格列配置和数据
const balanceColumns = [
  { title: '交易时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '交易类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '金额', dataIndex: 'amount', key: 'amount', width: 150 },
  { title: '美元金额($)', dataIndex: 'usdAmount', key: 'usdAmount', width: 150 },
  { title: '交易来源/用途', dataIndex: 'source', key: 'source' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 }
];

const balanceList = ref([]);
const balancePagination = reactive({
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total) => `共 ${total} 条`
});

// 下级用户表格列配置和数据
const referralColumns = [
  { title: '用户名称', dataIndex: 'name', key: 'name' },
  { title: '账号', dataIndex: 'email', key: 'email', ellipsis: true },
  { title: '层级', dataIndex: 'level', key: 'level', width: 80 },
  { title: '加入时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '贡献佣金($)', dataIndex: 'commission', key: 'commission', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 80 }
];

const referralList = ref([]);
const referralPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total) => `共 ${total} 条`
});

// 操作日志表格列配置和数据
const logColumns = [
  { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作类型', dataIndex: 'type', key: 'type', width: 120 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
  { title: '操作内容', dataIndex: 'content', key: 'content' }
];

const logList = ref([]);
const logPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: (total) => `共 ${total} 条`
});

// 加载商家详情数据
const loadMerchantInfo = async () => {
  loading.value = true;
  try {
    const merchantId = route.params.id;
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    Object.assign(merchantInfo, {
      id: merchantId,
      name: '环球电子科技',
      email: 'global.tech@example.com',
      status: 'active',
      inviteCode: 'TECH2023',
      referrer: '优品服饰',
      createdAt: '2023-05-12 14:30:21',
      storeCount: 3,
      totalCommission: 5260.50,
      pendingCommission: 750.25,
      totalRecharge: 15800.75,
      totalConsumption: 10540.25,
      salesId: 1,
      salesName: '张三',
      balances: [
        { currency: 'USD', amount: 3250.75 },
        { currency: 'EUR', amount: 1580.32 }
      ],
      stores: [
        {
          id: 1,
          name: 'Global Tech Shop',
          storeUrl: 'https://global-tech.myshopify.com',
          status: 'active',
          authTime: '2023-05-15 09:28:35'
        },
        {
          id: 2,
          name: 'Smart Gadgets',
          storeUrl: 'https://smart-gadgets.myshopify.com',
          status: 'active',
          authTime: '2023-06-20 11:15:42'
        },
        {
          id: 3,
          name: 'Future Electronics',
          storeUrl: 'https://future-electronics.myshopify.com',
          status: 'expired',
          authTime: '2023-07-10 14:52:18'
        }
      ]
    });

    // 设置指定业务员默认值
    assignForm.salesId = merchantInfo.salesId;
    
  } catch (error) {
    console.error('Failed to load merchant info:', error);
    message.error('加载商家详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载订单数据
const loadOrderData = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟数据
    orderList.value = [
      {
        id: 1,
        orderNo: 'SO2023051001',
        amount: 125.99,
        createdAt: '2023-05-10 08:35:12',
        status: 'completed',
        storeName: 'Global Tech Shop'
      },
      {
        id: 2,
        orderNo: 'SO2023052502',
        amount: 89.50,
        createdAt: '2023-05-25 14:22:31',
        status: 'shipped',
        storeName: 'Smart Gadgets'
      },
      {
        id: 3,
        orderNo: 'SO2023060103',
        amount: 210.75,
        createdAt: '2023-06-01 11:08:45',
        status: 'processing',
        storeName: 'Future Electronics'
      }
    ];
    
    orderPagination.total = 3;
  } finally {
    tabLoading.value = false;
  }
};

// 加载佣金数据
const loadCommissionData = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟数据
    commissionList.value = [
      {
        id: 1,
        createdAt: '2023-05-15 10:25:18',
        source: '订单SO2023051001',
        type: 'level1',
        amount: 12.60,
        status: 'settled',
        settledAt: '2023-06-01 00:00:00'
      },
      {
        id: 2,
        createdAt: '2023-05-28 16:42:35',
        source: '订单SO2023052502',
        type: 'level1',
        amount: 8.95,
        status: 'settled',
        settledAt: '2023-06-01 00:00:00'
      },
      {
        id: 3,
        createdAt: '2023-06-05 09:12:27',
        source: '订单SO2023060103',
        type: 'level1',
        amount: 21.08,
        status: 'pending',
        settledAt: null
      },
      {
        id: 4,
        createdAt: '2023-06-08 14:30:55',
        source: '下级用户 - Smart Home',
        type: 'level2',
        amount: 5.45,
        status: 'pending',
        settledAt: null
      }
    ];
    
    commissionPagination.total = 4;
  } finally {
    tabLoading.value = false;
  }
};

// 加载余额明细
const loadBalanceData = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟数据
    balanceList.value = [
      {
        id: 1,
        createdAt: '2023-05-05 09:18:25',
        type: 'recharge',
        amount: 1000.00,
        currency: 'USD',
        usdAmount: 1000.00,
        source: '账户充值',
        status: 'confirmed'
      },
      {
        id: 2,
        createdAt: '2023-05-10 14:35:42',
        type: 'consumption',
        amount: -125.99,
        currency: 'USD',
        usdAmount: -125.99,
        source: '订单SO2023051001',
        status: ''
      },
      {
        id: 3,
        createdAt: '2023-05-15 10:25:18',
        type: 'commission',
        amount: 12.60,
        currency: 'USD',
        usdAmount: 12.60,
        source: '佣金收入 - 订单SO2023051001',
        status: ''
      },
      {
        id: 4,
        createdAt: '2023-05-20 16:42:30',
        type: 'recharge',
        amount: 1000.00,
        currency: 'EUR',
        usdAmount: 1090.00,
        source: '账户充值',
        status: 'confirmed'
      }
    ];
    
    balancePagination.total = 4;
  } finally {
    tabLoading.value = false;
  }
};

// 加载下级用户
const loadReferralData = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟数据
    referralList.value = [
      {
        id: 1,
        name: '数字极客',
        email: 'digital.geek@example.com',
        level: 1,
        createdAt: '2023-04-15 14:28:36',
        commission: 350.25,
        status: 'active'
      },
      {
        id: 2,
        name: '智能家居',
        email: 'smart.home@example.com',
        level: 1,
        createdAt: '2023-04-20 09:42:18',
        commission: 285.60,
        status: 'active'
      },
      {
        id: 3,
        name: '未来电器',
        email: 'future.appliance@example.com',
        level: 2,
        createdAt: '2023-05-05 16:35:52',
        commission: 115.30,
        status: 'active'
      }
    ];
    
    referralPagination.total = 3;
  } finally {
    tabLoading.value = false;
  }
};

// 加载操作日志
const loadLogData = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 模拟数据
    logList.value = [
      {
        id: 1,
        createdAt: '2023-05-12 14:30:21',
        type: 'create',
        operator: '系统',
        content: '商家账户创建'
      },
      {
        id: 2,
        createdAt: '2023-05-15 09:28:35',
        type: 'store_auth',
        operator: '商家',
        content: '添加店铺授权 - Global Tech Shop'
      },
      {
        id: 3,
        createdAt: '2023-06-01 00:00:00',
        type: 'commission_settle',
        operator: '系统',
        content: '佣金结算 - 2023年5月'
      },
      {
        id: 4,
        createdAt: '2023-06-20 11:15:42',
        type: 'store_auth',
        operator: '商家',
        content: '添加店铺授权 - Smart Gadgets'
      }
    ];
    
    logPagination.total = 4;
  } finally {
    tabLoading.value = false;
  }
};

// 切换商家状态（启用/禁用）
const toggleStatus = async (status) => {
  try {
    loading.value = true;
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    merchantInfo.status = status;
    
    message.success(`${status === 'active' ? '启用' : '禁用'}商家成功`);
  } catch (error) {
    console.error('Failed to toggle merchant status:', error);
    message.error(`${status === 'active' ? '启用' : '禁用'}商家失败`);
  } finally {
    loading.value = false;
  }
};

// 显示指定业务员弹窗
const showAssignModal = () => {
  assignModalVisible.value = true;
};

// 显示重置密码弹窗
const showResetPasswordModal = () => {
  resetPasswordModalVisible.value = true;
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
    
    const selectedSales = salesList.value.find(s => s.id === assignForm.salesId);
    if (selectedSales) {
      merchantInfo.salesId = selectedSales.id;
      merchantInfo.salesName = selectedSales.name;
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

// 查看订单详情
const viewOrderDetail = (record) => {
  router.push({ path: `/admin/orders/store/${record.id}` });
};

// 查看下级用户详情
const viewReferralDetail = (record) => {
  router.push({ path: `/admin/merchants/${record.id}` });
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  switch (status) {
    case 'processing': return '待发货';
    case 'shipped': return '已发货';
    case 'completed': return '已完成';
    default: return status;
  }
};

// 获取订单状态颜色
const getOrderStatusColor = (status) => {
  switch (status) {
    case 'processing': return 'blue';
    case 'shipped': return 'orange';
    case 'completed': return 'green';
    default: return 'default';
  }
};

// 获取交易类型文本
const getTransactionTypeText = (type) => {
  switch (type) {
    case 'recharge': return '充值';
    case 'consumption': return '消费';
    case 'commission': return '佣金收入';
    default: return type;
  }
};

// 获取充值状态文本
const getRechargeStatusText = (status) => {
  switch (status) {
    case 'pending': return '待确认';
    case 'confirmed': return '已确认';
    case 'rejected': return '已拒绝';
    default: return status;
  }
};

// 获取充值状态颜色
const getRechargeStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'blue';
    case 'confirmed': return 'green';
    case 'rejected': return 'red';
    default: return 'default';
  }
};

// 获取日志类型文本
const getLogTypeText = (type) => {
  switch (type) {
    case 'create': return '创建';
    case 'update': return '更新';
    case 'store_auth': return '店铺授权';
    case 'commission_settle': return '佣金结算';
    default: return type;
  }
};

// 获取日志类型颜色
const getLogTypeColor = (type) => {
  switch (type) {
    case 'create': return 'green';
    case 'update': return 'blue';
    case 'store_auth': return 'purple';
    case 'commission_settle': return 'orange';
    default: return 'default';
  }
};

// 监听标签页变化，加载相应数据
watch(activeTabKey, (newValue) => {
  switch (newValue) {
    case 'orders':
      loadOrderData();
      break;
    case 'commission':
      loadCommissionData();
      break;
    case 'balance':
      loadBalanceData();
      break;
    case 'referrals':
      loadReferralData();
      break;
    case 'logs':
      loadLogData();
      break;
    default:
      break;
  }
});

// 页面加载时获取商家详情
onMounted(() => {
  loadMerchantInfo().then(() => {
    // 加载默认标签页数据
    loadOrderData();
  });
});
</script>

<style lang="less" scoped>
.merchant-detail-container {
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
        display: inline-block;
        margin-right: 12px;
      }
      
      .status-tag {
        font-size: 14px;
      }
    }
  }
  
  .content-layout {
    
    .detail-card {
      margin-bottom: 16px;
    }
    
    .tab-card {
      margin-bottom: 24px;
    }
  }
}
</style> 