<template>
  <div class="admin-balance">
    <div class="page-header">
      <h1>客户余额管理</h1>
      <p>管理所有客户的余额信息</p>
    </div>
    
    <el-tabs v-model="activeTab" class="balance-tabs">
      <el-tab-pane label="客户余额" name="balance">
        <PlaceholderPage 
          title="客户余额查询"
          :details="[
            '查看所有客户余额状态',
            '余额变动记录追踪',
            '余额异常情况处理',
            '余额统计分析报告'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">导出余额报表</el-button>
            <el-button>刷新数据</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="充值审核" name="recharge">
        <PlaceholderPage 
          title="充值申请审核"
          :details="[
            '审核客户充值申请',
            '验证充值凭证信息',
            '处理充值失败案例',
            '充值数据统计分析'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="success">批量审核</el-button>
            <el-button type="warning">驳回申请</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="提现管理" name="withdrawal">
        <PlaceholderPage 
          title="提现申请管理"
          :details="[
            '处理客户提现申请',
            '验证提现账户信息',
            '管理提现限额规则',
            '提现记录查询统计'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">处理提现</el-button>
            <el-button type="danger">冻结账户</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const activeTab = ref('balance')
</script>

<style scoped>
.admin-balance {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.balance-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 