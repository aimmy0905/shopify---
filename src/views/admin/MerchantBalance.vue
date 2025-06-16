<template>
  <div class="merchant-balance-container">
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
        <a-breadcrumb-item>余额明细</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    
    <a-spin :spinning="loading">
      <div class="page-header">
        <div class="page-header-content">
          <h1 class="title">余额明细 - {{ merchantName }}</h1>
        </div>
        <div class="page-header-extra">
          <a-button @click="$router.go(-1)" style="margin-right: 8px;">
            返回
          </a-button>
          <a-button type="primary" @click="showAdjustBalanceModal">
            调整余额
          </a-button>
          <a-button type="default" style="margin-left: 8px;" @click="exportData">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
        </div>
      </div>
      
      <!-- 余额信息卡片 -->
      <a-card :bordered="false" class="stat-card">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic 
              title="当前余额" 
              :value="balanceStats.balances"
              style="margin-right: 50px"
            >
              <template #suffix>
                <a-tooltip title="显示所有币种余额">
                  <InfoCircleOutlined style="color: rgba(0,0,0,.45)" />
                </a-tooltip>
              </template>
              <template #prefix><WalletOutlined /></template>
            </a-statistic>
            <div class="currency-list">
              <div v-for="(balance, index) in balanceStats.currencyBalances" :key="index" class="currency-item">
                {{ balance.currency }}: {{ balance.amount.toFixed(2) }}
              </div>
            </div>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="累计充值"
              :value="balanceStats.totalRecharge" 
              :precision="2" 
              style="margin-right: 50px"
              class="success-stat"
            >
              <template #prefix><RiseOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="累计消费" 
              :value="balanceStats.totalConsumption" 
              :precision="2"
              class="danger-stat"
              style="margin-right: 50px"
            >
              <template #prefix><FallOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="累计佣金收入" 
              :value="balanceStats.totalCommission" 
              :precision="2"
              class="primary-stat"
            >
              <template #prefix><TrophyOutlined /></template>
              <template #suffix>USD</template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 标签页导航 -->
      <a-card :bordered="false" class="content-card">
        <a-tabs v-model:activeKey="activeTabKey" @change="handleTabChange">
          <a-tab-pane key="all" tab="全部记录">
            <TransactionList :data-source="allTransactions" :loading="tabLoading" />
          </a-tab-pane>
          <a-tab-pane key="recharge" tab="充值记录">
            <RechargeList :data-source="rechargeTransactions" :loading="tabLoading" @audit="handleAudit" />
          </a-tab-pane>
          <a-tab-pane key="consumption" tab="消费记录">
            <TransactionList :data-source="consumptionTransactions" :loading="tabLoading" />
          </a-tab-pane>
          <a-tab-pane key="commission" tab="佣金收入记录">
            <TransactionList :data-source="commissionTransactions" :loading="tabLoading" />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-spin>
    
    <!-- 调整余额弹窗 -->
    <a-modal
      v-model:visible="adjustBalanceModalVisible"
      title="调整余额"
      @ok="handleAdjustBalance"
      :confirm-loading="confirmLoading"
      @cancel="adjustBalanceModalVisible = false"
      width="580px"
    >
      <a-form :model="adjustBalanceForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="商家名称">
          <span>{{ merchantName }}</span>
        </a-form-item>
        <a-form-item label="当前余额">
          <div v-for="(balance, index) in balanceStats.currencyBalances" :key="index">
            {{ balance.currency }}: {{ balance.amount.toFixed(2) }}
          </div>
        </a-form-item>
        <a-form-item label="调整类型">
          <a-radio-group v-model:value="adjustBalanceForm.type">
            <a-radio value="add">增加余额</a-radio>
            <a-radio value="subtract">减少余额</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="调整币种">
          <a-select v-model:value="adjustBalanceForm.currency" style="width: 100%">
            <a-select-option v-for="item in balanceStats.currencyBalances" :key="item.currency" :value="item.currency">
              {{ item.currency }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="调整金额">
          <a-input-number
            v-model:value="adjustBalanceForm.amount"
            :precision="2"
            :min="0.01"
            style="width: 100%"
            placeholder="请输入调整金额"
          />
        </a-form-item>
        <a-form-item label="调整原因">
          <a-select v-model:value="adjustBalanceForm.reason" style="width: 100%">
            <a-select-option value="correction">账户纠错</a-select-option>
            <a-select-option value="refund">退款</a-select-option>
            <a-select-option value="gift">赠送</a-select-option>
            <a-select-option value="penalty">罚款</a-select-option>
            <a-select-option value="other">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" v-if="adjustBalanceForm.reason === 'other'">
          <a-textarea v-model:value="adjustBalanceForm.remark" :rows="3" placeholder="请输入调整备注" />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 审核充值弹窗 -->
    <a-modal
      v-model:visible="auditModalVisible"
      title="充值审核"
      @ok="handleAuditConfirm"
      :confirm-loading="confirmLoading"
      @cancel="auditModalVisible = false"
      width="700px"
    >
      <a-form :model="auditForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="商家名称">
          <span>{{ merchantName }}</span>
        </a-form-item>
        <a-form-item label="充值金额">
          <span>{{ auditForm.amount }} {{ auditForm.currency }}</span>
        </a-form-item>
        <a-form-item label="充值时间">
          <span>{{ auditForm.createdAt }}</span>
        </a-form-item>
        <a-form-item label="充值方式">
          <span>{{ auditForm.method }}</span>
        </a-form-item>
        <a-form-item label="凭证">
          <div class="proof-image">
            <img :src="auditForm.proofUrl" alt="充值凭证" style="max-width: 100%; max-height: 300px;" />
          </div>
        </a-form-item>
        <a-form-item label="审核结果">
          <a-radio-group v-model:value="auditForm.result">
            <a-radio value="approved">通过</a-radio>
            <a-radio value="rejected">不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注" v-if="auditForm.result === 'rejected'">
          <a-textarea v-model:value="auditForm.remark" :rows="3" placeholder="请输入审核备注" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { DownloadOutlined, WalletOutlined, RiseOutlined, FallOutlined, TrophyOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import TransactionList from './components/TransactionList.vue';
import RechargeList from './components/RechargeList.vue';

const route = useRoute();
const router = useRouter();
const merchantId = ref(route.params.id);
const merchantName = ref('');
const loading = ref(true);
const tabLoading = ref(false);
const activeTabKey = ref('all');
const adjustBalanceModalVisible = ref(false);
const auditModalVisible = ref(false);
const confirmLoading = ref(false);

// 余额统计数据
const balanceStats = reactive({
  currencyBalances: [
    { currency: 'USD', amount: 3250.75 },
    { currency: 'EUR', amount: 1580.32 }
  ],
  balances: '多币种', // 因为是多币种，所以只显示文字
  totalRecharge: 15800.75,
  totalConsumption: 10540.25,
  totalCommission: 2500.50
});

// 交易记录数据
const allTransactions = ref([]);
const rechargeTransactions = ref([]);
const consumptionTransactions = ref([]);
const commissionTransactions = ref([]);

// 调整余额表单
const adjustBalanceForm = reactive({
  type: 'add',
  currency: 'USD',
  amount: 0,
  reason: 'correction',
  remark: ''
});

// 审核表单
const auditForm = reactive({
  id: null,
  amount: 0,
  currency: 'USD',
  createdAt: '',
  method: '',
  proofUrl: '',
  result: 'approved',
  remark: ''
});

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

// 加载全部交易记录
const loadAllTransactions = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    allTransactions.value = [
      {
        id: 1,
        createdAt: '2023-05-05 09:18:25',
        type: 'recharge',
        typeText: '充值',
        amount: 1000.00,
        currency: 'USD',
        usdAmount: 1000.00,
        source: '账户充值',
        status: 'confirmed',
        statusText: '已确认'
      },
      {
        id: 2,
        createdAt: '2023-05-10 14:35:42',
        type: 'consumption',
        typeText: '消费',
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
        typeText: '佣金收入',
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
        typeText: '充值',
        amount: 1000.00,
        currency: 'EUR',
        usdAmount: 1090.00,
        source: '账户充值',
        status: 'confirmed',
        statusText: '已确认'
      },
      {
        id: 5,
        createdAt: '2023-05-22 11:30:15',
        type: 'consumption',
        typeText: '消费',
        amount: -85.50,
        currency: 'EUR',
        usdAmount: -93.20,
        source: '订单SO2023052201',
        status: ''
      },
      {
        id: 6,
        createdAt: '2023-05-28 09:15:48',
        type: 'commission',
        typeText: '佣金收入',
        amount: 8.55,
        currency: 'USD',
        usdAmount: 8.55,
        source: '佣金收入 - 订单SO2023052701',
        status: ''
      },
      {
        id: 7,
        createdAt: '2023-06-02 14:22:37',
        type: 'recharge',
        typeText: '充值',
        amount: 500.00,
        currency: 'USD',
        usdAmount: 500.00,
        source: '账户充值',
        status: 'pending',
        statusText: '待确认'
      }
    ];
    
  } catch (error) {
    console.error('Failed to load transactions:', error);
    message.error('加载交易记录失败');
  } finally {
    tabLoading.value = false;
  }
};

// 加载充值记录
const loadRechargeTransactions = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据 - 从全部交易中过滤充值记录
    rechargeTransactions.value = allTransactions.value.filter(item => item.type === 'recharge');
    
    // 添加充值特有字段
    rechargeTransactions.value.forEach(item => {
      item.method = item.id % 2 === 0 ? '银行转账' : 'PayPal';
      item.proofUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
    });
    
  } catch (error) {
    console.error('Failed to load recharge transactions:', error);
    message.error('加载充值记录失败');
  } finally {
    tabLoading.value = false;
  }
};

// 加载消费记录
const loadConsumptionTransactions = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据 - 从全部交易中过滤消费记录
    consumptionTransactions.value = allTransactions.value.filter(item => item.type === 'consumption');
    
  } catch (error) {
    console.error('Failed to load consumption transactions:', error);
    message.error('加载消费记录失败');
  } finally {
    tabLoading.value = false;
  }
};

// 加载佣金收入记录
const loadCommissionTransactions = async () => {
  tabLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据 - 从全部交易中过滤佣金记录
    commissionTransactions.value = allTransactions.value.filter(item => item.type === 'commission');
    
  } catch (error) {
    console.error('Failed to load commission transactions:', error);
    message.error('加载佣金收入记录失败');
  } finally {
    tabLoading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = (key) => {
  switch (key) {
    case 'all':
      loadAllTransactions();
      break;
    case 'recharge':
      loadRechargeTransactions();
      break;
    case 'consumption':
      loadConsumptionTransactions();
      break;
    case 'commission':
      loadCommissionTransactions();
      break;
  }
};

// 显示调整余额弹窗
const showAdjustBalanceModal = () => {
  adjustBalanceForm.currency = balanceStats.currencyBalances[0].currency;
  adjustBalanceModalVisible.value = true;
};

// 处理调整余额
const handleAdjustBalance = async () => {
  if (!adjustBalanceForm.amount || adjustBalanceForm.amount <= 0) {
    message.warning('请输入有效的调整金额');
    return;
  }
  
  if (adjustBalanceForm.reason === 'other' && !adjustBalanceForm.remark) {
    message.warning('请输入调整备注');
    return;
  }
  
  confirmLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新本地余额数据
    const currencyIndex = balanceStats.currencyBalances.findIndex(item => item.currency === adjustBalanceForm.currency);
    if (currencyIndex !== -1) {
      if (adjustBalanceForm.type === 'add') {
        balanceStats.currencyBalances[currencyIndex].amount += adjustBalanceForm.amount;
      } else {
        balanceStats.currencyBalances[currencyIndex].amount -= adjustBalanceForm.amount;
      }
    }
    
    // 添加一条新的交易记录
    const newTransaction = {
      id: Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: adjustBalanceForm.type === 'add' ? 'recharge' : 'consumption',
      typeText: adjustBalanceForm.type === 'add' ? '增加余额' : '减少余额',
      amount: adjustBalanceForm.type === 'add' ? adjustBalanceForm.amount : -adjustBalanceForm.amount,
      currency: adjustBalanceForm.currency,
      usdAmount: adjustBalanceForm.type === 'add' ? adjustBalanceForm.amount : -adjustBalanceForm.amount, // 简化，假设是美元
      source: `管理员调整 - ${adjustBalanceForm.reason === 'other' ? adjustBalanceForm.remark : getReasonText(adjustBalanceForm.reason)}`,
      status: 'confirmed',
      statusText: '已确认'
    };
    
    // 更新交易记录
    allTransactions.value.unshift(newTransaction);
    
    // 如果当前在对应的标签页，也要更新对应的列表
    if (activeTabKey.value === 'recharge' && adjustBalanceForm.type === 'add') {
      rechargeTransactions.value.unshift(newTransaction);
    } else if (activeTabKey.value === 'consumption' && adjustBalanceForm.type === 'subtract') {
      consumptionTransactions.value.unshift(newTransaction);
    }
    
    message.success('余额调整成功');
    adjustBalanceModalVisible.value = false;
    
    // 重置表单
    adjustBalanceForm.amount = 0;
    adjustBalanceForm.reason = 'correction';
    adjustBalanceForm.remark = '';
    
  } catch (error) {
    console.error('Failed to adjust balance:', error);
    message.error('余额调整失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 处理充值审核
const handleAudit = (record) => {
  Object.assign(auditForm, {
    id: record.id,
    amount: Math.abs(record.amount),
    currency: record.currency,
    createdAt: record.createdAt,
    method: record.method,
    proofUrl: record.proofUrl,
    result: 'approved',
    remark: ''
  });
  
  auditModalVisible.value = true;
};

// 确认充值审核
const handleAuditConfirm = async () => {
  if (auditForm.result === 'rejected' && !auditForm.remark) {
    message.warning('请输入拒绝原因');
    return;
  }
  
  confirmLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新本地数据
    const index = allTransactions.value.findIndex(item => item.id === auditForm.id);
    if (index !== -1) {
      allTransactions.value[index].status = auditForm.result === 'approved' ? 'confirmed' : 'rejected';
      allTransactions.value[index].statusText = auditForm.result === 'approved' ? '已确认' : '已拒绝';
    }
    
    // 同时更新充值记录
    const rechargeIndex = rechargeTransactions.value.findIndex(item => item.id === auditForm.id);
    if (rechargeIndex !== -1) {
      rechargeTransactions.value[rechargeIndex].status = auditForm.result === 'approved' ? 'confirmed' : 'rejected';
      rechargeTransactions.value[rechargeIndex].statusText = auditForm.result === 'approved' ? '已确认' : '已拒绝';
    }
    
    message.success(`充值审核${auditForm.result === 'approved' ? '通过' : '拒绝'}成功`);
    auditModalVisible.value = false;
    
  } catch (error) {
    console.error('Failed to audit recharge:', error);
    message.error('充值审核失败');
  } finally {
    confirmLoading.value = false;
  }
};

// 获取调整原因文本
const getReasonText = (reason) => {
  const reasonMap = {
    'correction': '账户纠错',
    'refund': '退款',
    'gift': '赠送',
    'penalty': '罚款',
    'other': '其他'
  };
  return reasonMap[reason] || reason;
};

// 导出数据
const exportData = () => {
  message.success('余额明细数据导出成功');
};

// 页面加载时获取数据
onMounted(() => {
  Promise.all([
    loadMerchantInfo(),
    loadAllTransactions()
  ]).then(() => {
    // 预加载其他标签页数据
    loadRechargeTransactions();
  });
});
</script>

<style lang="less" scoped>
.merchant-balance-container {
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
    
    .currency-list {
      margin-top: 8px;
    }
    
    .currency-item {
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.65);
    }
    
    .success-stat {
      color: #52c41a;
    }
    
    .danger-stat {
      color: #f5222d;
    }
    
    .primary-stat {
      color: #1890ff;
    }
  }
  
  .content-card {
    margin-bottom: 24px;
  }
  
  .proof-image {
    text-align: center;
    background-color: #fafafa;
    padding: 8px;
    border-radius: 4px;
  }
}
</style> 