<template>
  <div class="balance-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>账户余额</h1>
    </div>

    <!-- 账户余额信息卡片 -->
    <div class="balance-info-card">
      <div class="balance-display">
        <h2>当前余额</h2>
        <div class="balance-amount">${{ currentBalance.toFixed(2) }}</div>
      </div>
      <div class="balance-actions">
        <el-button type="primary" size="large" @click="showRechargeDialog = true">
          <el-icon><CreditCard /></el-icon>
          余额充值
        </el-button>
        <el-button size="large" @click="showWithdrawDialog = true">
          <el-icon><Money /></el-icon>
          余额提现
        </el-button>
        <el-button size="large" @click="viewBalanceDetails">
          查看明细
        </el-button>
      </div>
    </div>

    <!-- 筛选工具 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="typeFilter" placeholder="类型筛选">
          <el-option label="全部" value="all"></el-option>
          <el-option label="充值" value="recharge"></el-option>
          <el-option label="消费" value="expense"></el-option>
          <el-option label="佣金" value="commission"></el-option>
        </el-select>
        <div class="amount-filter">
          <el-input v-model="amountRange[0]" placeholder="最小金额" type="number" />
          <span>-</span>
          <el-input v-model="amountRange[1]" placeholder="最大金额" type="number" />
        </div>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 余额明细标签页 -->
    <div class="balance-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部记录" name="all">
          <balance-records-table :records="filteredRecords" @view-detail="viewRecordDetail" />
        </el-tab-pane>
        <el-tab-pane label="充值记录" name="recharge">
          <balance-records-table :records="rechargeRecords" @view-detail="viewRecordDetail" />
        </el-tab-pane>
        <el-tab-pane label="消费记录" name="expense">
          <balance-records-table :records="expenseRecords" @view-detail="viewRecordDetail" />
        </el-tab-pane>
        <el-tab-pane label="佣金收入" name="commission">
          <balance-records-table :records="commissionRecords" @view-detail="viewRecordDetail" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalRecords"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 充值弹窗 -->
    <recharge-dialog v-model="showRechargeDialog" @success="handleRechargeSuccess" />

    <!-- 提现弹窗 -->
    <withdraw-dialog v-model="showWithdrawDialog" @success="handleWithdrawSuccess" />

    <!-- 记录详情弹窗 -->
    <record-detail-dialog v-model="showDetailDialog" :record="selectedRecord" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CreditCard, Money } from '@element-plus/icons-vue'
import BalanceRecordsTable from './components/BalanceRecordsTable.vue'
import RechargeDialog from './components/RechargeDialog.vue'
import WithdrawDialog from './components/WithdrawDialog.vue'
import RecordDetailDialog from './components/RecordDetailDialog.vue'

// 响应式数据
const currentBalance = ref(1250.75)
const activeTab = ref('all')
const dateRange = ref([])
const typeFilter = ref('all')
const amountRange = ref(['', ''])
const currentPage = ref(1)
const pageSize = ref(20)
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

// 余额记录数据
const balanceRecords = ref([
  {
    id: 1,
    type: 'recharge',
    amount: 2000.00,
    currency: 'USD',
    time: '2024-05-21 14:30:00',
    source: 'PayPal充值',
    status: 'confirmed',
    description: '账户充值',
    orderId: null,
    receiptUrl: '/receipts/recharge_001.jpg'
  },
  {
    id: 2,
    type: 'expense',
    amount: -450.00,
    currency: 'USD',
    time: '2024-05-20 10:15:00',
    source: '采购订单 #PO202405200001',
    status: 'confirmed',
    description: '采购商品付款',
    orderId: 'PO202405200001',
    receiptUrl: null
  },
  {
    id: 3,
    type: 'commission',
    amount: 67.30,
    currency: 'USD',
    time: '2024-05-19 16:45:00',
    source: '下级用户订单佣金',
    status: 'confirmed',
    description: '佣金收入',
    orderId: 'OR202405190001',
    receiptUrl: null
  },
  {
    id: 4,
    type: 'expense',
    amount: -125.50,
    currency: 'USD',
    time: '2024-05-18 09:20:00',
    source: '退款处理',
    status: 'confirmed',
    description: '客户退款',
    orderId: 'OR202405180001',
    receiptUrl: null
  }
])

// 计算属性
const filteredRecords = computed(() => {
  let records = balanceRecords.value
  
  // 按标签页筛选
  if (activeTab.value !== 'all') {
    records = records.filter(record => record.type === activeTab.value)
  }
  
  // 按类型筛选
  if (typeFilter.value !== 'all') {
    records = records.filter(record => record.type === typeFilter.value)
  }
  
  // 按日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    records = records.filter(record => {
      const recordDate = record.time.split(' ')[0]
      return recordDate >= dateRange.value[0] && recordDate <= dateRange.value[1]
    })
  }
  
  // 按金额筛选
  if (amountRange.value[0] !== '') {
    records = records.filter(record => Math.abs(record.amount) >= Number(amountRange.value[0]))
  }
  if (amountRange.value[1] !== '') {
    records = records.filter(record => Math.abs(record.amount) <= Number(amountRange.value[1]))
  }
  
  return records
})

const rechargeRecords = computed(() => 
  balanceRecords.value.filter(record => record.type === 'recharge')
)

const expenseRecords = computed(() => 
  balanceRecords.value.filter(record => record.type === 'expense')
)

const commissionRecords = computed(() => 
  balanceRecords.value.filter(record => record.type === 'commission')
)

const totalRecords = computed(() => filteredRecords.value.length)

// 方法
const handleTabChange = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
}

const resetFilters = () => {
  dateRange.value = []
  typeFilter.value = 'all'
  amountRange.value = ['', '']
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const viewRecordDetail = (record) => {
  selectedRecord.value = record
  showDetailDialog.value = true
}

const handleRechargeSuccess = () => {
  // 刷新余额和记录
  console.log('充值成功，刷新数据')
}

const handleWithdrawSuccess = () => {
  // 刷新余额和记录
  console.log('提现申请成功，刷新数据')
}

const viewBalanceDetails = () => {
  // 实现查看明细的逻辑
  console.log('查看明细')
}

onMounted(() => {
  console.log('余额页面已加载')
})
</script>

<style scoped lang="scss">
.balance-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  
  h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 24px;
    font-weight: 600;
  }
}

.balance-info-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .balance-display {
    h2 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }
    
    .balance-amount {
      font-size: 48px;
      font-weight: 700;
      color: #2c3e50;
    }
  }
  
  .balance-actions {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-shrink: 0;
    min-width: 300px;
    
    .el-button {
      min-width: 100px;
      height: 40px;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #dcdfe6;
      
      &.el-button--primary {
        background-color: #409eff;
        border-color: #409eff;
        color: #fff;
      }
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .filter-row {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
    
    .amount-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-input {
        width: 120px;
      }
      
      span {
        color: #666;
      }
    }
  }
}

.balance-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style> 