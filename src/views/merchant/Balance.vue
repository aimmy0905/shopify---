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
      </div>
    </div>

    <!-- 筛选工具已移除 - 因为删除了交易记录列表显示 -->

    <!-- 交易记录列表已移除 - 根据用户要求删除所有交易记录列表的显示 -->

    <!-- 充值弹窗 -->
    <recharge-dialog v-model="showRechargeDialog" @success="handleRechargeSuccess" />

    <!-- 提现弹窗 -->
    <withdraw-dialog v-model="showWithdrawDialog" @success="handleWithdrawSuccess" />

    <!-- 记录详情弹窗 -->
    <record-detail-dialog v-model="showDetailDialog" :record="selectedRecord" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CreditCard, Money } from '@element-plus/icons-vue'
// BalanceRecordsTable 组件已移除 - 因为删除了交易记录列表显示
import RechargeDialog from './components/RechargeDialog.vue'
import WithdrawDialog from './components/WithdrawDialog.vue'
import RecordDetailDialog from './components/RecordDetailDialog.vue'

// 响应式数据
const currentBalance = ref(1250.75)
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

// 交易记录相关数据已移除 - 因为删除了交易记录列表显示

// 余额记录数据已移除 - 因为删除了交易记录列表显示

// 计算属性已移除 - 因为删除了交易记录列表显示

// 交易记录相关方法已移除 - 因为删除了交易记录列表显示

const handleRechargeSuccess = () => {
  // 刷新余额和记录
  console.log('充值成功，刷新数据')
}

const handleWithdrawSuccess = () => {
  // 刷新余额和记录
  console.log('提现申请成功，刷新数据')
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

/* 交易记录相关样式已移除 - 因为删除了交易记录列表显示 */
</style> 